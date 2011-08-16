#!/usr/bin/env python
from google.appengine.dist import use_library
use_library('django', '1.2')
import re
import os
import codecs
import logging
import xml.etree.ElementTree as et
import xml.dom.minidom as md
import urllib
import urllib2
import datetime
 
from google.appengine.api import urlfetch
from google.appengine.api import quota
from django.utils import simplejson as json
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.runtime.apiproxy_errors import CapabilityDisabledError
from google.appengine.api import memcache
from google.appengine.api import taskqueue
from google.appengine.ext import deferred

"""
Import local scripts
"""
import datamodel    
import configparsers
import datastore
import utils
import handlers

requestExperience = "/hotels"                  
requestHome = "/"
requestRestApi = r"/(.*)/(xml|json)"
requestDestination = r"/(.*)"
requestAjaxAPI = "/ajax"
requestGooglePlaces = "/places"
requestGeoCode = "/geocode"
requestGeoCodeWorker = "/geocodeworker"
# TODO: remove the memcache flush
memcache.flush_all()
#logging.info(memcache.get_stats())

# DELETE ALL HOTELS
#datastore.delete_all_hotels()


feeds = {
    'bbc'      : 'http://news.bbc.co.uk/weather/forecast/',
    'guardian' : 'http://content.guardianapis.com/search?format=json&use-date=last-modified&show-fields=headline,trailText&ids=travel/',
    'yahoo'    : 'http://query.yahooapis.com/v1/public/yql?format=json&q='
}


"""
This data object will be used by the Mashup Handler and Ajax Handler
"""
global_mashup = {}

"""
This data object will be used by the Mashup Handler and Ajax Handler
"""
destination_display_names = {
	'newyork':'New York',
	'paris':'Paris',
	'edinburgh':'Edinburgh',
	'amsterdam':'Amsterdam',
	'madrid':'Madrid',
	'barcelona':'Barcelona',
	'miami':'Miami',
	'london':'London',
	'nice':'Nice',
	'tokyo':'Tokyo',
	'rome':'Rome',
	'milan':'Milan',
	'sorrento':'Sorrento'
}

hotel_booking_dest_names = {
	'newyork':'NYC',
	'paris':'PAR',
	'madrid':'MAD',
	'amsterdam':'AMS',
	'barcelona':'BCN'		
}

tripadvisor_image_paths = {
	'newyork':'new_york',
	'paris':'paris',
	'london':'london',
	'barcelona':'barcelona',
	'madrid':'madrid',
	'amsterdam':'amsterdam',
	'rome':'rome',
	'losangeles':'los_angeles',
	'amalfi':'amalfi',
	'positano':'positano'
}                   

	

	

"""
Get Hotel Booking Form Data
"""		

def get_hotel_booking_form_data(destination):
	"""
	Get the config properties
	"""
	config_properties = configparsers.loadConfigProperties()
	
	bookingData = dict()
	configItems = config_properties.items('HotelBookingForm')
	for item in configItems:
		bookingData[item[0]] = item[1]
	return bookingData
	
		
""" Use with Live Kapow Service - Handle an RPC result instance, for Flights """
def handle_result_ajax_v3(rpc, destination, price, startDate, endDate, response):
	try:
		result = rpc.get_result()
		if result.status_code == 200:
			logging.info("RPC response SUCCESS code: 200")
			f = parseXMLLive(result.content.replace('|', ''))
			
			"""       
			[ST] TODO: This might be processor intensive, so just return the result and do not put in datastore until we figure this out
	   		"""
			datastore.put_hotels_by_destination(destination, f, startDate, endDate)
		
			bookingData = get_hotel_booking_form_data(destination)
			bookingData['city'] = destination
			bookingData['checkindate'] = startDate.isoformat()
			bookingData['checkoutdate'] = endDate.isoformat()
					
			if hotel_booking_dest_names.has_key(destination):
				bookingData['dest'] = hotel_booking_dest_names[destination]
		
			hotelsData = datastore.get_hotels_by_destination_and_price(destination, price, startDate, None)
		
			if hotelsData.get() is not None:
				logging.info("Retrieving from datastore")
				hotelsList = list()
				for hotel in hotelsData:
					hotel.bookingData = bookingData
					hotelsList.append(hotel)
				global_mashup['hotels'] = hotelsList
				path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/hotels.html')
				response.out.write(template.render(path, global_mashup))
			else:
				logging.info("handle_result_ajax_v3 - hotelsData is None or we have no results") 
				path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
				response.out.write(template.render(path, global_mashup))
			                                
			#logging.info("Still working after response")
		elif result.status_code == 400:
			logging.info("RPC response ERROR code: 400")
			path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
			response.out.write(template.render(path, global_mashup))	    
	except urlfetch.DownloadError:
		logging.info("RPC response DEADLINE OR DOWNLOAD ERROR")
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/service-error.html')
		response.out.write(template.render(path, global_mashup))
		

""" Use with Live Kapow Service - Use a helper function to define the scope of the callback, for Ajax Request Handler """
def create_callback_ajax_v3(rpc, destination, price, startDate, endDate, response):
	return lambda: handle_result_ajax_v3(rpc, destination, price, startDate, endDate, response)		

def get_hotels(destination, startDate, endDate):
	"""
	Get the config properties
	"""
	config_properties = configparsers.loadConfigProperties()
	
	hotelsURL = config_properties.get('Hotels', 'hotels_service_v4_url')
	hotelsArgs = dict()
	hotelsArgs['r.object'] = config_properties.get('Hotels', 'hotels_service_v4_r_object')
	hotelsArgs[config_properties.get('Hotels', 'hotels_service_v4_data')] = destination
	hotelsArgs['r.url'] = config_properties.get('Kapow', 'kapow_r_url')
	hotelsArgs['r.username'] = config_properties.get('Kapow', 'kapow_r_username')
	hotelsArgs['r.password'] = config_properties.get('Kapow', 'kapow_r_password')
	if startDate is not None:
		hotelsArgs[config_properties.get('Hotels', 'hotels_service_v4_startDate')] = startDate.date().isoformat()
		hotelsArgs[config_properties.get('Hotels', 'hotels_service_v4_endDate')] = endDate.date().isoformat()
	hotelsArgsEncoded = urllib.urlencode(hotelsArgs)
	hotelsURL += hotelsArgsEncoded
	return hotelsURL

def get_weather(destination):
	global_mashup['weather'] = feeds['yahoo']+'select%20*%20from%20weather.forecast%20where%20location%20in%20(select%20id%20from%20weather.search%20where%20query%3D%22'+global_mashup['name']+'%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'
	return global_mashup

def get_guardian(destination):
	global_mashup['news'] = feeds['guardian']+destination
	return global_mashup


""" Use with Live Kapow Service - Asynchronous mutliple RPC Requests """
def kapowAPILiveRPC_v3(destination, price, startDate, endDate, info_type, response):
	url = None
	if info_type == "flights":
		url = get_flights(destination)
	if info_type == "hotels":
	    url = get_hotels(destination, startDate, endDate)
	if info_type == "city-break":
	    url = get_citybreak(destination)
	rpc = urlfetch.create_rpc(100)
	rpc.callback = create_callback_ajax_v3(rpc, destination, price, startDate, endDate, response)
	urlfetch.make_fetch_call(rpc, url, "GET")
	rpc.wait()

""" Use with Live Kapow Service """
def parseXMLLive(xmlStringContent):
	results = [] 
	tree = et.XML(xmlStringContent)
	for items in utils.all(tree, 'object'):
		i = {}
		for item in utils.all(items, 'attribute'):
			text = item.text      
			name = item.attrib.get('name')
			i[name] = text
		if i.has_key('address'):
			if i['address'] is not None:
				results.append(i)
		else:
			results.append(i)
	return results

class HomeHandler(webapp.RequestHandler):
    def get(self):
		path = os.path.join(os.path.dirname(__file__),'templates/mashup.html')
		self.response.out.write(template.render(path, {}))		

class ExperienceHandler(webapp.RequestHandler):
	def get(self):
		
		
		"""
		Get the config properties
		"""
		config_properties = configparsers.loadConfigProperties()
		widescreen = 'true'
		viewType = self.request.get("viewType")
		
		destination = self.request.get("destination")
		price = self.request.get("priceMax")
		startDate = self.request.get("startDate")
		
		if len(price) > 0:
			price = float(price)
			
		destinationDisplayName = destination
		tripAdvisorDestination = destination 
		bookmarks = self.request.get("bookmarks").split(',')
		maptype = self.request.get("maptype") 
		contenttype = self.request.get("contenttype")
		if destination_display_names.has_key(destination):
			destinationDisplayName = destination_display_names[destination]
		
		if tripadvisor_image_paths.has_key(destination):
			tripAdvisorDestination = tripadvisor_image_paths[destination]
		
		facebookAppId = config_properties.get('Facebook', 'app_id')
		facebookAccessToken = config_properties.get('Facebook', 'access_token')
		analytics_key = config_properties.get('Google', 'analytics_key')
		args = dict(analytics_key=analytics_key, viewType=viewType, destinationDisplayName=destinationDisplayName, price=price, destination=destination, bookmarks=bookmarks, maptype=maptype, contenttype=contenttype, facebookAppId=facebookAppId, facebookAccessToken=facebookAccessToken, tripAdvisorDestination=tripAdvisorDestination, startDate=startDate)
		path = os.path.join(os.path.dirname(__file__),'templates/version3/experience.html')		
		self.response.out.write(template.render(path, args))
	def post(self):
		destination = self.request.POST.get("destination")


class AjaxAPIHandler_v3(webapp.RequestHandler):
  def get(self):		
	self.response.error = 500
	return True
  def post(self):
	
	startAjaxRequestQuota = quota.get_request_cpu_usage()
	
	"""
	Get the config properties
	"""
	config_properties = configparsers.loadConfigProperties()
	
	destination = self.request.POST.get("destination")
	startDateRaw = self.request.POST.get("startDate")
	ratingRaw = self.request.POST.get("rating")
	rating = None
	if ratingRaw is not None:
		rating = True
	startDate = startDateRaw.split('-')
	try:
		dateTime = datetime.datetime(int(startDate[0]), int(startDate[1]), int(startDate[2]))
	except ValueError, e:
		logging.error(e)
		logging.error("AjaxAPIHandler_v3 : Invalid date values or date format")
	startDate = dateTime       
	
	numberOfNightsRaw = self.request.POST.get("numberOfNights")
	endDateTimeDelta = datetime.timedelta(days=int(numberOfNightsRaw))
	endDate = startDate + endDateTimeDelta
	
	price = self.request.POST.get("priceMax")
	if price is not None and len(price) > 0:
		price = float(price)
    
    
	global_mashup['price'] = price
	#logging.info(price)
	global_mashup['name'] = destination
	destination = re.sub(r'(<|>|\s)', '', destination)
	destination = destination.lower()
	global_mashup['destination'] = destination
	info_type = self.request.POST.get("info_type")
	info_type = info_type.replace(' ', '').lower()

	"""
	If the Destination provided matches a nice display name we have stored locally, then use this.
	WARNING: Otherwise the Destination will be set to whatever the User provided!
	"""
	if destination_display_names.has_key(destination):
		global_mashup['name'] = destination_display_names[destination]
		
   	if tripadvisor_image_paths.has_key(destination):
		global_mashup['tripAdvisorDestination'] = tripadvisor_image_paths[destination]

	if info_type == "weather":
		get_weather(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/weather.html')
		self.response.out.write(template.render(path, global_mashup))
	elif info_type == "guardian":
		get_guardian(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/guardian.html')
		self.response.out.write(template.render(path, global_mashup))		   	
	else:
		"""
		[ST]TODO: Store datastore gets into memcache and check there first. This is less CPU expensive than getting from the datastore each time
		Need to check how to store in memcache by:
		- destination
		- startDate
		- endDate
		- numberOfRooms
		"""		
		if destination == "europe":
			hotelsData = datastore.get_hotels_in_europe_by_price(price)		
		else:
		    hotelsData = datastore.get_hotels_by_destination_and_price(destination, price, startDate, rating)
		
		bookingData = get_hotel_booking_form_data(destination)
		bookingData['city'] = destination
		bookingData['checkindate'] = startDate.date().isoformat()
		bookingData['checkoutdate'] = endDate.date().isoformat()
		
		if hotel_booking_dest_names.has_key(destination):
			bookingData['dest'] = hotel_booking_dest_names[destination]
						
		if hotelsData.get() is not None:
			logging.info("Retrieving from datastore")
			hotelsList = list()
			for hotel in hotelsData:
				hotel.bookingData = bookingData
				hotelsList.append(hotel)

			replaced = memcache.replace(destination,hotelsList)
			
			if replaced is False:
				memcache.add(destination,hotelsList)     
				
			global_mashup['hotels'] = hotelsList
			path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/'+info_type+'.html')
			self.response.out.write(template.render(path, global_mashup))
		else:
			logging.info("NOT Got hotels from datastore")
			mashup = kapowAPILiveRPC_v3(destination, price, startDate, endDate, info_type, self.response)
   	
	endAjaxRequestQuota = quota.get_request_cpu_usage()
	logging.info("AjaxAPIHandler_v3() : POST : cost %d megacycles." % (endAjaxRequestQuota - startAjaxRequestQuota))
	return True


application = webapp.WSGIApplication([         
		(requestGeoCode, handlers.GeocodeStoreTaskHandler),
        (requestGeoCodeWorker, handlers.GeocodeStoreTaskWorker),
		(requestExperience, ExperienceHandler),
		(requestHome, ExperienceHandler),
		(requestAjaxAPI, AjaxAPIHandler_v3),
		(requestGooglePlaces, handlers.GooglePlacesHandler),
		#(requestGeoCode, handlers.GeoCodeHandler),
		(requestDestination, ExperienceHandler)		
    ],debug=True)

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.DEBUG)
    run_wsgi_app(application)