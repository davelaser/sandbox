#!/usr/bin/env python
from google.appengine.dist import use_library
use_library('django', '1.2')
import re
import os
import codecs
import logging
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
from google.appengine.runtime import DeadlineExceededError
from google.appengine.api import memcache
from google.appengine.api import taskqueue
from google.appengine.ext import deferred
from ConfigParser import ConfigParser

"""
Import local scripts
"""
import datamodel
import configparsers
import datastore
import utils
import handlers

requestHome = "/"
requestRestApi = r"/(.*)/(xml|json)"
requestDestination = r"/(.*)"
requestAjaxAPI = "/ajax"
requestGooglePlaces = "/places"
requestGeoCode = "/geocode"
requestGeoCodeWorker = "/geocodeworker"
requestHotelsWorker = "/hotelsworker"
requestHotelsPriceWorker = "/hotelspriceworker"
requestEANHotelsWorker = "/eanhotelsworker"
requestEANHotelsPriceWorker = "/eanhotelspriceworker"
requestEANHotelList = "/ean-get-hotels"
requestExpedia = "/expedia"
requestLastminute = "/lastminute"
requestRazorfish = "/razorfish"

# TODO: remove the memcache flush
#memcache.flush_all()
#logging.info(memcache.get_stats())

# DELETE ALL HOTELS
#datastore.delete_all_hotels()


feeds = {
    'bbc'      : 'http://news.bbc.co.uk/weather/forecast/',
    'guardian' : 'http://content.guardianapis.com/search?',
    'yahoo'    : 'http://query.yahooapis.com/v1/public/yql?format=json&q='
}


"""
This data object will be used by the Mashup Handler and Ajax Handler
"""
global_mashup = {}



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
			f = utils.parseXML(result.content.replace('|', ''))
			
			
			counter = 1
			hotelList = list()
			for hotel in f:
				if hotel['address'] is not None:
					hotelDict = dict()
					hotelPrice = hotel['price'].replace('&#163;','')
					hotelPrice = hotelPrice.replace(',','')
					hotelPrice = float(hotelPrice)
					
					hotelDict['name'] = hotel['name']
					# [ST]TODO: Move price, startdate and enddate to LMHotelPriceAndDate db.Model
					hotelDict['startdate'] = startDate.date().isoformat()
					hotelDict['enddate'] = endDate.date().isoformat()
					hotelDict['price'] = hotelPrice
					hotelDict['address'] = hotel['address']
					hotelDict['destination'] = destination
					hotelDict['index'] = counter
					
					if hotel['rating'] is not None:
						rating = hotel['rating']
						rating = rating.split("/").pop()
						rating = rating.split('-')[1]
						hotelDict['rating'] = rating
					
					if hotel['url'] is not None:
						hotelLink = hotel['url']
						hotelLinkArray = hotelLink.split("&amp;")
						for param in hotelLinkArray:
							if param.startswith("propertyIds"):
								propertyIdValue = param.split("=")[1]
								hotelDict['locationid'] = propertyIdValue.split('-',1)[0]
								if len(hotelDict['locationid']) == 1:
									hotelDict['locationid'] = "00000"+hotelDict['locationid']
								if len(hotelDict['locationid']) == 2:
									hotelDict['locationid'] = "0000"+hotelDict['locationid']
								if len(hotelDict['locationid']) == 3:
									hotelDict['locationid'] = "000"+hotelDict['locationid']
								if len(hotelDict['locationid']) == 4:
									hotelDict['locationid'] = "00"+hotelDict['locationid']
								if len(hotelDict['locationid']) == 5:
									hotelDict['locationid'] = "0"+hotelDict['locationid']
								
								hotelDict['propertyids'] = propertyIdValue
							
							if param.startswith("hotelRequestId"):
								hotelDict['hotelrequestid'] = param.split("=")[1]
						
						hotelDict['productdetailsurl'] = str(hotelLink).replace('tabId=information','tabId=rooms')
					else:
						hotelDict['locationid'] = destination+str(counter)
					counter += 1
					hotelList.append(hotelDict)
			
			# [ST] WARNING: With this execution we cannot filter by price on the first search of a destination, startdate and enddate
			
			global_mashup['hotels'] = hotelList
			path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/hotels.html')
			response.out.write(template.render(path, global_mashup))
			
			# After sending the response, add the datastore write to the taskqueue
			for hotel in hotelList:
				# [ST]TODO: Lookup the Hotel by key_name (locationid) before adding a taskqueue instance for it
				existingHotel = datamodel.LMHotel.get_by_key_name(hotel['locationid'])
				logging.info(existingHotel)
				if existingHotel is None:
					logging.info("handle_result_ajax_v3() : Hotel with location id "+str(hotel['locationid'])+" DOES NOT exist. Assigning task to queue")
					taskqueue.add(queue_name='hotelsqueue', url='/hotelsworker', params={'destination':destination, 'data':json.dumps(hotel)})
				else: 
					logging.info("handle_result_ajax_v3() : Hotel with location id "+str(hotel['locationid'])+" DOES exist. No task queue necessary")
				# Add the new price data for this hotel
				taskqueue.add(queue_name='hotelspricequeue', url='/hotelspriceworker', params={'destination':destination, 'locationid':hotel['locationid'], 'price':hotel['price'], 'startDate':hotel['startdate'], 'endDate':hotel['enddate']})
			
		
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

def get_hotels_request_url(destination, startDate, endDate):
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
	return True

def get_guardian(destination):
	global_mashup['news'] = feeds['guardian']+destination
	return True


""" Use with Live Kapow Service - Asynchronous mutliple RPC Requests """
def kapowAPILiveRPC_v3(destination, price, startDate, endDate, info_type, response):
	startkapowAPILiveRPC_v3 = quota.get_request_cpu_usage()
	url = None
	if info_type == "flights":
		url = get_flights(destination)
	if info_type == "hotels":
	    url = get_hotels_request_url(destination, startDate, endDate)
	if info_type == "city-break":
	    url = get_citybreak(destination)
	rpc = urlfetch.create_rpc(100)
	rpc.callback = create_callback_ajax_v3(rpc, destination, price, startDate, endDate, response)
	urlfetch.make_fetch_call(rpc, url, "GET")
	rpc.wait()
	endkapowAPILiveRPC_v3 = quota.get_request_cpu_usage()
	logging.info("kapowAPILiveRPC_v3() : cost %d megacycles." % (endkapowAPILiveRPC_v3 - startkapowAPILiveRPC_v3))


class HomeHandler(webapp.RequestHandler):
    def get(self):
		path = os.path.join(os.path.dirname(__file__),'templates/mashup.html')
		self.response.out.write(template.render(path, {}))

class ExperienceHandler(webapp.RequestHandler):
	def get(self):
		
		logging.info(self.request.path)
		"""
		Get the config properties
		"""
		config_properties = configparsers.loadConfigProperties()
		widescreen = 'true'
		viewType = self.request.get("viewType")
		
		destination = self.request.get("destination")
		price = self.request.get("priceMax")
		startDate = self.request.get("startDate")
		priceSort = self.request.get("priceSort")
		ratingSort = self.request.get("ratingSort")
		nights = self.request.get("nights")
		
		servicePath = requestEANHotelList
		brand = "razorfish"
		urlPath = self.request.path
		
		if urlPath is not None and len(urlPath) > 1:
			brand = urlPath.replace('/','')
			
			if brand == "lastminute":
				servicePath = requestAjaxAPI
			elif brand == "expedia":
				servicePath = requestEANHotelList
			elif brand == "razorfish":
				servicePath = requestEANHotelList
		if len(price) > 0:
			price = float(price)
		
		destinationDisplayName = destination
		tripAdvisorDestination = destination
		bookmarks = self.request.get("bookmarks").split(',')
		maptype = self.request.get("maptype")
		contenttype = self.request.get("contenttype")
		if utils.destination_display_names.has_key(destination):
			destinationDisplayName = utils.destination_display_names[destination]
		
		if tripadvisor_image_paths.has_key(destination):
			tripAdvisorDestination = tripadvisor_image_paths[destination]
		try:
			facebookAppId = config_properties.get('Facebook', 'app_id')
			facebookAccessToken = config_properties.get('Facebook', 'access_token')
			analytics_key = config_properties.get('Google', 'analytics_key')
			twitterAppKey = config_properties.get('Twitter', 'anywhere_api_key')
		except ConfigParser.NoSectionError, e:
			logging.error(e)
			
		args = dict(
			servicePath=servicePath, 
			brand=brand, 
			analytics_key=analytics_key, 
			viewType=viewType, 
			destinationDisplayName=destinationDisplayName, 
			price=price, 
			nights=nights, 
			destination=destination, 
			bookmarks=bookmarks, 
			maptype=maptype, 
			contenttype=contenttype, 
			facebookAppId=facebookAppId, 
			facebookAccessToken=facebookAccessToken,
			twitterAppKey=twitterAppKey, 
			tripAdvisorDestination=tripAdvisorDestination, 
			startDate=startDate, 
			priceSort=priceSort, 
			ratingSort=ratingSort)
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
	
	destination = self.request.get("destination")
	startDateRaw = self.request.get("startDate")
	ratingRaw = self.request.get("rating")
	rating = None
	if ratingRaw is not None:
		rating = True
 	logging.info(startDateRaw)
	if startDateRaw is not None:
		startDate = startDateRaw.split('-')
	try:
		
		dateTime = datetime.datetime(int(startDate[0]), int(startDate[1]), int(startDate[2]))
		startDate = dateTime

		numberOfNightsRaw = self.request.POST.get("nights")
		endDateTimeDelta = datetime.timedelta(days=int(numberOfNightsRaw))
		endDate = startDate + endDateTimeDelta
		
	except ValueError, e:
		logging.error(e)
		logging.error("AjaxAPIHandler_v3 : Invalid date values or date format")
	
	
	price = float(0.0)
	priceRaw = self.request.POST.get("priceMax")
	if priceRaw is not None and len(priceRaw) > 0:
		price = float(priceRaw)
    
	
	global_mashup['price'] = price
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
	
	if utils.destination_display_names.has_key(destination):
		global_mashup['name'] = utils.destination_display_names[destination]
   	
   	if tripadvisor_image_paths.has_key(destination):
		global_mashup['tripAdvisorDestination'] = tripadvisor_image_paths[destination]
	
	if info_type == "weather":
		get_weather(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/weather.html')
		self.response.out.write(template.render(path, global_mashup))
	elif info_type == "guardian":
		try:
			memcacheGuardianKey = "guardian:"+str(destination)
			memcacheGuardian = memcache.get(key=memcacheGuardianKey, namespace='razorfish')
			
			if memcacheGuardian is not None:
				global_mashup['guardian'] = memcacheGuardian
				logging.debug("Returning Guardian content for "+str(destination)+" from memcache")
			else:
				requestArgs = dict()
				requestArgs['format'] = 'json'
				requestArgs['use-date'] = 'last-modified'
				requestArgs['show-fields'] = 'headline,trailText'
				requestArgs['ids'] = 'travel/'+destination
				urlAgrsEncoded = urllib.urlencode(requestArgs)
		
		 
				requestServiceURL = feeds['guardian']
				g = urllib.urlopen(""+requestServiceURL+"%s" % urlAgrsEncoded)
				read = g.read()
				if read is not None:
					response = json.loads(read)
				
					memcache.set(key=memcacheGuardianKey, value=response['response']['results'], namespace='razorfish', time=6000)
				
					global_mashup['guardian'] = response['response']['results']
		except DeadlineExceededError, e:
			logging.error("AjaxAPIHandler_v3 : Guardian Service : DeadlineExceededError error")
			logging.error(e)
			
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/guardian-data.html')
		self.response.out.write(template.render(path, global_mashup))
	else:
		
		memcacheKey = str(destination)+":"+str(price)+":"+str(startDate.date().isoformat())+":"+str(endDate.date().isoformat())
		memcachedHotels = memcache.get(key=memcacheKey, namespace='lastminute')
		logging.info("Looking up MEMCACHE for : "+memcacheKey)
		logging.info(memcachedHotels)
		if memcachedHotels is not None:
			global_mashup['hotels'] = memcachedHotels
			path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/'+info_type+'.html')
			self.response.out.write(template.render(path, global_mashup))
			logging.info("AjaxAPIHandler_v3() : Retrieving Hotels from MEMCACHE for destination "+str(destination))
		else:
			regions = utils.get_regions()
			if destination in regions:
				hotelsData = datastore.get_hotels_by_region(destination, price)
				if hotelsData is None:
					logging.info("No results for "+str(destination))
					path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
					self.response.out.write(template.render(path, global_mashup))
					return
				logging.info("Setting hotels to MEMCACHE with key : "+memcacheKey)
				memcache.set(key=memcacheKey, value=hotelsData, time=6000, namespace='lastminute')
				global_mashup['region'] = destination
				
			else:
				# [ST]TODO: Reinstate arguments: rating
			    hotelsData = datastore.get_hotels(destination, price, startDate, endDate, None)
			
			if hotelsData is not None:
				logging.info("AjaxAPIHandler_v3() : Retrieving Hotels from datastore for destination "+destination)
				global_mashup['hotels'] = hotelsData
				path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/'+info_type+'.html')
				self.response.out.write(template.render(path, global_mashup))
				
				logging.info("Setting hotels to MEMCACHE with key : "+memcacheKey)
				memcache.set(key=memcacheKey, value=hotelsData, time=6000, namespace='lastminute')
				
			else:
				logging.info("NOT Got hotels from datastore")
				mashup = kapowAPILiveRPC_v3(destination, price, startDate, endDate, info_type, self.response)
    
	
	endAjaxRequestQuota = quota.get_request_cpu_usage()
	logging.info("AjaxAPIHandler_v3() : POST : cost %d megacycles." % (endAjaxRequestQuota - startAjaxRequestQuota))
	return

application = webapp.WSGIApplication([
		(requestGeoCode, handlers.GeocodeStoreTaskHandler),
        (requestGeoCodeWorker, handlers.GeocodeStoreTaskWorker),
		(requestHotelsWorker, handlers.HotelStoreTaskWorker),
		(requestHotelsPriceWorker, handlers.HotelPriceStoreTaskWorker),
		(requestEANHotelsWorker, handlers.EANHotelStoreTaskWorker),
		(requestEANHotelsPriceWorker, handlers.EANHotelPriceStoreTaskWorker),
		(requestLastminute, ExperienceHandler),
		(requestExpedia, ExperienceHandler),
		(requestRazorfish, ExperienceHandler),
		(requestHome, ExperienceHandler),
		(requestAjaxAPI, AjaxAPIHandler_v3),
		(requestGooglePlaces, handlers.GooglePlacesHandler),
		(requestEANHotelList, handlers.EANHotelRequest)
    ],debug=True)

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.DEBUG)
    run_wsgi_app(application)