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
requestHotelsWorker = "/hotelsworker"
# TODO: remove the memcache flush
#memcache.flush_all()
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


	
		
""" Use with Live Kapow Service - Handle an RPC result instance, for Flights """
def handle_result_ajax_v3(rpc, destination, price, startDate, endDate, response):
	starthandle_result_ajax_v3 = quota.get_request_cpu_usage()
	try:
		result = rpc.get_result()
		if result.status_code == 200:
			logging.info("handle_result_ajax_v3() : RPC response SUCCESS code: 200")
			f = parseXMLLive(result.content.replace('|', ''))
			
			
			counter = 1
			hotelList = list()
			for hotel in f:				
				if hotel['address'] is not None:
					hotelDict = dict()
					price = hotel['price'].replace('&#163;','')
					price = price.replace(',','')
					price = float(price)                                           

					#dbHotel = datamodel.DBHotel(name = hotel['name'], startdate = startDate, enddate = endDate, price = price, address = hotel['address'], destination = destination, index = counter)
					hotelDict['name'] = hotel['name']
					hotelDict['startdate'] = startDate.date().isoformat()
					hotelDict['enddate'] = endDate.date().isoformat()
					hotelDict['price'] = price
					hotelDict['address'] = hotel['address']
					hotelDict['destination'] = destination
					hotelDict['index'] = counter
					
					if hotel['rating'] is not None:
						ratingURL = hotel['rating']
						ratingURL = ratingURL.split("/").pop()
						rating = ratingURL.split('-')[1]
						#dbHotel.rating = int(rating)
						hotelDict['rating'] = rating

					if hotel['url'] is not None:
						hotelLink = hotel['url']
						hotelLinkSplit = hotelLink.split("&amp;")
						for param in hotelLinkSplit:
							if param.startswith("propertyIds"):        
								propertyIdValue = param.split("=")[1]
                                
								"""
								dbHotel.locationid = propertyIdValue.split('-',1)[0]
								if len(dbHotel.locationid) == 3:
									dbHotel.locationid = "000"+dbHotel.locationid
								if len(dbHotel.locationid) == 4:
									dbHotel.locationid = "00"+dbHotel.locationid
								if len(dbHotel.locationid) == 5:
									dbHotel.locationid = "0"+dbHotel.locationid
                                """
								hotelDict['locationid'] = propertyIdValue.split('-',1)[0]
								if len(hotelDict['locationid']) == 3:
									hotelDict['locationid'] = "000"+hotelDict['locationid']
								if len(hotelDict['locationid']) == 4:
									hotelDict['locationid'] = "00"+hotelDict['locationid']
								if len(hotelDict['locationid']) == 5:
									hotelDict['locationid'] = "0"+hotelDict['locationid']
									
								#dbHotel.propertyids = propertyIdValue
								
								hotelDict['propertyids'] = propertyIdValue
								
							if param.startswith("hotelRequestId"):
								#dbHotel.hotelrequestid = param.split("=")[1]
								hotelDict['hotelrequestid'] = param.split("=")[1]
								
						hotelLinkManipulated = str(hotelLink).replace('tabId=information','tabId=rooms')
						#dbHotel.productdetailsurl = hotelLinkManipulated
						hotelDict['productdetailsurl'] = hotelLinkManipulated
					else:
						#dbHotel.locationid = destination+str(counter)
						hotelDict['locationid'] = destination+str(counter)
					counter += 1
					hotelList.append(hotelDict)
			
			# [ST] WARNING: With this execution we cannot filter by price on the first search of a destion, startdate and enddate		
			global_mashup['hotels'] = hotelList		
			path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/hotels.html')
			response.out.write(template.render(path, global_mashup))
			
			# After sending the response, add the datastore write to the taskqueue
			# [ST] WARNING: db.put(list) batch dtastore writes are extremely expensive on CPU/s. Use a taskqueue that writes 1 hotel at a time
			logging.info("handle_result_ajax_v3 : after response, handing hotel datastore write to taskqueue")
			
			for hotel in hotelList:
				taskqueue.add(queue_name='hotelsqueue', url='/hotelsworker', params={'destination':destination, 'data':json.dumps(hotel), 'startDate':startDate, 'endDate':endDate})
            
			
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
	startkapowAPILiveRPC_v3 = quota.get_request_cpu_usage()
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
	endkapowAPILiveRPC_v3 = quota.get_request_cpu_usage()
	logging.info("kapowAPILiveRPC_v3() : cost %d megacycles." % (endkapowAPILiveRPC_v3 - startkapowAPILiveRPC_v3))

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
		if destination == "europe":
			hotelsData = datastore.get_hotels_in_europe_by_price(price)		
		else:
		    hotelsData = datastore.get_hotels_by_destination_and_price(destination, price, startDate, rating)

						
		if hotelsData.get() is not None:
			logging.info("AjaxAPIHandler_v3() : Retrieving Hotels from datastore for destination "+destination)
			hotelsList = hotelsData.fetch(25)
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
		(requestHotelsWorker, handlers.HotelStoreTaskWorker),
		(requestExperience, ExperienceHandler),
		(requestHome, ExperienceHandler),
		(requestAjaxAPI, AjaxAPIHandler_v3),
		(requestGooglePlaces, handlers.GooglePlacesHandler),
		(requestDestination, ExperienceHandler)		
    ],debug=True)

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.DEBUG)
    run_wsgi_app(application)