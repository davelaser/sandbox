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

requestExperience = "/hotels"                  
requestHome = "/"
requestRestApi = r"/(.*)/(xml|json)"
requestDestination = r"/(.*)"
requestAjaxAPI = "/ajax"
requestGooglePlaces = "/places"
requestGeoCode = "/geocode"

# TODO: remove the memcache flush
#memcache.flush_all()

#logging.info(memcache.get_stats())

feeds = {
    'bbc'      : 'http://news.bbc.co.uk/weather/forecast/',
    'guardian' : 'http://content.guardianapis.com/search?format=json&use-date=last-modified&show-fields=headline,trailText&ids=travel/',
    'yahoo'    : 'http://query.yahooapis.com/v1/public/yql?format=json&q='
}

ny_hotels_feed = 'data/xml/LM-hotels.xml'
ny_city_breaks_feed = 'data/xml/LM-city-breaks.xml'
ny_flights_feed = 'data/xml/lastminute.xml'

ny_mashup = {
    'name'     : 'New York',
    'bbc'      : '101',
    'news'     : feeds['guardian']+'travel/newyork',
    'weather'  : feeds['yahoo']+'select * from weather.forecast where location='
}
#new york weather = 10118

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

def get_hotels_by_destination(destination):
	resultset = datamodel.DBHotel.gql("WHERE destination = '"+destination+"' ORDER BY index")# ORDER BY price")
	return resultset
			
def put_hotels_by_destination(destination, data, startDate, endDate):
	counter = 1
	hotelList = list()
	for hotel in data:
		
		if hotel['address'] is not None:
			price = hotel['price'].replace('&#163;','')
			price = price.replace(',','')
			price = float(price)                                           
			
			dbHotel = datamodel.DBHotel(name = hotel['name'], startdate = startDate, enddate = endDate, price = price, address = hotel['address'], destination = destination, index = counter)

			if hotel['rating'] is not None:
				ratingURL = hotel['rating']
				ratingURL = ratingURL.split("/").pop()
				rating = ratingURL.split('-')[1]
				logging.info("rating is "+rating)
				dbHotel.rating = int(rating)
				 
			if hotel['url'] is not None:
				hotelLink = hotel['url']
				hotelLinkSplit = hotelLink.split("&amp;")
				for param in hotelLinkSplit:
					if param.startswith("propertyIds"):        
						propertyIdValue = param.split("=")[1]
						
						dbHotel.locationid = propertyIdValue.split('-',1)[0]
						if len(dbHotel.locationid) == 3:
							dbHotel.locationid = "000"+dbHotel.locationid
						if len(dbHotel.locationid) == 4:
							dbHotel.locationid = "00"+dbHotel.locationid
						if len(dbHotel.locationid) == 5:
							dbHotel.locationid = "0"+dbHotel.locationid
						
						dbHotel.propertyids = propertyIdValue
						logging.info("dbHotel.locationid: "+dbHotel.locationid) 
						logging.info("dbHotel.propertyids: "+dbHotel.propertyids)
					if param.startswith("hotelRequestId"):
						dbHotel.hotelrequestid = param.split("=")[1]
				hotelLinkManipulated = str(hotelLink).replace('tabId=information','tabId=rooms')
				dbHotel.productdetailsurl = hotelLinkManipulated
			else:
				dbHotel.locationid = destination+str(counter)
			counter += 1
			hotelList.append(dbHotel)
	"""
	Use a batch .put(list) operation here!
	"""		
	try:
		db.put(hotelList)
	except CapabilityDisabledError:
		log.error("put_hotels_by_destination : CapabilityDisabledError")
		# fail gracefully here
		pass  
		
	return hotelList


def get_hotels_by_destination_and_price(destination, price, startDate, rating):
	logging.debug("get_hotels_by_destination_and_price : looking for hotels in "+destination)
	queryString = ""
	if destination is not None and len(destination) > 0:
		queryString += "WHERE destination = '"+destination+"'"
		if startDate is not None:              
			queryString += " AND startdate = :1"
		if price is not None and len(str(price)) > 0:  
			
			if rating is not None:
				queryString += " AND price <= "+str(price)+" ORDER BY rating DESC, price DESC, index"
			else:
				queryString += " AND price <= "+str(price)+" ORDER BY price, index"
		if rating is not None and len(str(price)) == 0:
			queryString += " ORDER BY rating DESC, price DESC, index"
        
		if rating is None and len(str(price)) == 0:	
			queryString += " ORDER BY index"
	else:
		if price is not None and len(str(price)) > 0:
			queryString += "WHERE price <= "+str(price)+" ORDER BY price, rating, index"
		

	logging.info(queryString)
	resultset = datamodel.DBHotel.gql(queryString, startDate)
	return resultset

def get_hotels_in_europe_by_price(price):
	queryDestinationList = list()
	queryDestinationList.append('paris')
	queryDestinationList.append('madrid')
	queryDestinationList.append('barcelona')
	queryDestinationList.append('amsterdam')
	queryDestinationList.append('rome') 
	queryDestinationList.append('london') 
	queryString = "WHERE destination IN :1"
	if price is not None and len(str(price)) > 0:
		queryString += " AND price <= "+str(price)
	queryString += " ORDER BY price, index"
	logging.info(queryString)
	resultset = datamodel.DBHotel.gql(queryString, queryDestinationList)
	return resultset

	
def get_places_by_hotellocationid_types_radius(locationid, types, radius):
	resultset = datamodel.DBPlace.gql("WHERE locationid = '"+locationid+"' AND types = '"+types+"' AND radius = "+radius+"")
	return resultset
	
def put_places_by_hotellocationid_and_types(locationid, types, places, radius):
	placesRequest = get_places_by_hotellocationid_types_radius(locationid, types, radius)
	if placesRequest.get() is None:
		dbPlace = datamodel.DBPlace()
		dbPlace.locationid = locationid
		dbPlace.types = types
		dbPlace.radius = int(radius)
		dbPlace.places = db.Text(places, encoding='utf-8')
		try:
			dbPlace.put()
		except CapabilityDisabledError:
			log.error("put_places_by_hotellocationid_and_types : CapabilityDisabledError")
			# fail gracefully here
			pass

"""
Save LatLng against a Hotel
"""                        
def get_hotel_by_locationid_and_destination(locationid, destination):
	resultset = datamodel.DBHotel.gql("WHERE locationid = '"+locationid+"' AND destination = '"+destination+"'")
	return resultset                                  
	
def put_latlng_by_hotel_locationid_and_destination(locationid, destination, lat, lng):
	hotelRequest = get_hotel_by_locationid_and_destination(locationid, destination)   
	if hotelRequest.get() is not None: 
		logging.info("Found NEW hotel locationid "+locationid+" now assigning latlng")
		for data in hotelRequest:
			"""
			This only returns 1 entity, so no need for a batch .put() operation here
			"""
			data.latlng = db.GeoPt(lat,lng)
			try:
				db.put(data)
			except CapabilityDisabledError:
				log.error("put_latlng_by_hotel_locationid_and_destination : CapabilityDisabledError")
				# fail gracefully here
				pass
		return "true"
	else:
		logging.info("Hotel at locationid "+locationid+" NOT FOUND!")
		return "false"


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
			put_hotels_by_destination(destination, f, startDate, endDate)
		
			bookingData = get_hotel_booking_form_data(destination)
			bookingData['city'] = destination
			bookingData['checkindate'] = startDate.isoformat()
			bookingData['checkoutdate'] = endDate.isoformat()
					
			if hotel_booking_dest_names.has_key(destination):
				bookingData['dest'] = hotel_booking_dest_names[destination]
		
			hotelsData = get_hotels_by_destination_and_price(destination, price, startDate, None)
		
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
	for items in all(tree, 'object'):
		i = {}
		for item in all(items, 'attribute'):
			text = item.text      
			name = item.attrib.get('name')
			i[name] = text
		if i.has_key('Address'):
			if i['Address'] is not None:
				results.append(i)
		else:
			results.append(i)
	return results
	
def split_path(path):
    p = re.compile('\W+')
    return p.split(path)

def all(element, nodename):
    path = './/%s' % nodename
    result = element.findall(path)
    return result

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
			hotelsData = get_hotels_in_europe_by_price(price)		
		else:
			#hotelsData = get_hotels_by_destination(destination)
		    hotelsData = get_hotels_by_destination_and_price(destination, price, startDate, rating)
		
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
   	
	return True

class GooglePlacesHandler(webapp.RequestHandler):
	def get(self):
		"""
		Get the config properties
		"""
		config_properties = configparsers.loadConfigProperties()
		
		placesURL = "https://maps.googleapis.com/maps/api/place/search/json?%s"
		
		types = self.request.get('types')
		radius = self.request.get('radius')
		
		urlArgs = dict()
		urlArgs['location'] = self.request.get('location')
		urlArgs['radius'] = radius
		urlArgs['types'] = types
		urlArgs['name'] = self.request.get('name')
		urlArgs['key'] = config_properties.get('Google', 'places_api_key')
		urlArgs['sensor'] = config_properties.get('Google', 'places_sensor')
		
		urlAgrsEncoded = urllib.urlencode(urlArgs)
		
		locationid = self.request.get('locationid')
		
		placesData = get_places_by_hotellocationid_types_radius(locationid, types, radius)
		if placesData.get() is not None:
			logging.info("Retrieving PLACES from datastore")
			jsonResponse = None
			for data in placesData:				
				jsonResponse = data.places
			self.response.out.write(jsonResponse)
		else:
			logging.info("REQUESTING PLACES from Google")   	
			try:
				result = urllib.urlopen(placesURL % urlAgrsEncoded)
				jsonResponse = result.read()
				put_places_by_hotellocationid_and_types(locationid, types, jsonResponse, radius)
				self.response.out.write(jsonResponse)
			except urllib2.URLError, e:
				logging.error("GooglePlacesHandler : urllib2 error") 
				logging.error(e)
	def post(self):		
		logging.info("POSTing to Places request handler")
		logging.info(self.request.POST.get("hotelname")) 
		logging.info(self.request.POST.get("types"))
		logging.info(self.request.POST.get("places"))
		deferred.defer(put_places_by_hotellocationid_and_types, self.request.POST.get("hotelname"), self.request.POST.get("types"), self.request.POST.get("places"), _countdown=10)


class GeoCodeHandler(webapp.RequestHandler):
	def post(self):
		logging.info("POSTing to Geocode request handler")
		result = put_latlng_by_hotel_locationid_and_destination(self.request.POST.get("locationid"), self.request.POST.get("destination"), self.request.POST.get("lat"), self.request.POST.get("lng"))
		
		#deferred.defer(put_latlng_by_hotel_locationid_and_destination, self.request.POST.get("locationid"), self.request.POST.get("destination"), self.request.POST.get("lat"), self.request.POST.get("lng"),  _countdown=10)
		
		return result
				
# Tiny URL API
#http://tinyurl.com/api-create.php?url=http://scripting.com/ 		

application = webapp.WSGIApplication([
		(requestExperience, ExperienceHandler),
		(requestHome, ExperienceHandler),
		(requestAjaxAPI, AjaxAPIHandler_v3),
		(requestGooglePlaces, GooglePlacesHandler),
		(requestGeoCode, GeoCodeHandler),
		(requestDestination, ExperienceHandler)		
    ],debug=True)

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.DEBUG)
    run_wsgi_app(application)