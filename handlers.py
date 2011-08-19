import os
import urllib
import urllib2
import logging
import datetime
from django.utils import simplejson as json
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext import deferred
from google.appengine.api import taskqueue
from google.appengine.ext import db
"""
Import local scripts
"""

import datastore
import configparsers
import utils
		
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

		placesData = datastore.get_places_by_hotellocationid_types_radius(locationid, types, radius)
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
				datastore.put_places_by_hotellocationid_and_types(locationid, types, jsonResponse, radius)
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


class GeocodeStoreTaskHandler(webapp.RequestHandler):
    def post(self):
		locationid = self.request.get("locationid")
		destination = self.request.get("destination")
		lat = self.request.get("lat")
		lng = self.request.get("lng")
		countryname = self.request.get("countryname")
		countrycode = self.request.get("countrycode")
	    # Add the task to the queue.
		taskqueue.add(queue_name='geocodequeue', url='/geocodeworker', params={'locationid':locationid, 'destination':destination, 'lat':lat, 'lng':lng, 'countryname':countryname, 'countrycode':countrycode})

class GeocodeStoreTaskWorker(webapp.RequestHandler):
    def post(self):
		locationid = self.request.get("locationid")
		destination = self.request.get("destination")
		lat = self.request.get("lat")
		lng = self.request.get("lng")
		countryname = self.request.get("countryname")
		countrycode = self.request.get("countrycode")
		datastore.put_latlng_by_hotel_locationid_and_destination(locationid, destination, lat, lng, countryname, countrycode)
        
class HotelStoreTaskHandler(webapp.RequestHandler):
    def post(self):
		destination = self.request.get("destination")
		data = self.request.get("data")
		# Add the task to the queue.
		taskqueue.add(queue_name='hotelsqueue', url='/hotelsworker', params={'destination':destination, 'data':data})

class HotelStoreTaskWorker(webapp.RequestHandler):
    def post(self):
        result = datastore.put_hotels_by_destination(self.request.get("destination"), self.request.get("data"))

class HotelPriceStoreTaskWorker(webapp.RequestHandler):
    def post(self):
        result = datastore.put_hotel_by_price(self.request.get("destination"), self.request.get("locationid"), self.request.get("price"), self.request.get("startDate"), self.request.get("endDate"))
        if result is False:
			logging.error("HotelPriceStoreTaskWorker : Error 500")
			self.error(500)
		

class EANHotelRequest(webapp.RequestHandler):
	def get(self):
		logging.info("EANHotelRequest")
	def post(self):                    
		logging.info("EANHotelRequest")
		config_properties = configparsers.loadConfigProperties()
		arrivalDateRaw = self.request.get('arrivalDate')
		numberOfNights = self.request.get('numberOfNights')
		city = self.request.get('city')
		arrivalDateList = arrivalDateRaw.split('-')
		arrivalDate = None
		departureDate = None
		global_mashup = {}
		try:
			arrivalDate = datetime.datetime(int(arrivalDateList[0]), int(arrivalDateList[1]), int(arrivalDateList[2]))
			departureDateTimeDelta = datetime.timedelta(days=int(numberOfNights))
			departureDate = arrivalDate + departureDateTimeDelta
		except ValueError, e:
			logging.error(e)
			logging.error("EANHotelRequest : Invalid date values or date format")
		
		if arrivalDate is not None and departureDate is not None:	
			requestArgs = utils.ean_get_hotel_list_url(arrivalDate.date().isoformat(), departureDate.date().isoformat(), city)

			try: 
				requestServiceURL = config_properties.get('EAN', 'xml_service_url')
				f = urllib.urlopen(""+requestServiceURL+"%s" % requestArgs)
				response = f.read()
				logging.info(response)
			
			except urllib2.URLError, e:
				logging.error("EANHotelRequest : urllib2 error") 
				logging.error(e)
		
			jsonLoadResponse = json.loads(response)	

			result = None
			global_mashup['name'] = city
			if utils.destination_display_names.has_key(city):
				global_mashup['name'] = utils.destination_display_names[city]

			if jsonLoadResponse['HotelListResponse'] is not None:
				if jsonLoadResponse['HotelListResponse'].has_key('HotelList'):
					if jsonLoadResponse['HotelListResponse']['HotelList']['HotelSummary'] is not None:
						result = jsonLoadResponse['HotelListResponse']['HotelList']['HotelSummary']
		
			if result is not None:
				logging.info(result)
				global_mashup['hotels'] = result
		
				path = os.path.join(os.path.dirname(__file__),'templates/expedia/hotels.html')
				self.response.out.write(template.render(path, global_mashup))
			else:
				path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
				self.response.out.write(template.render(path, global_mashup))			
				
		else:
			path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
			self.response.out.write(template.render(path, global_mashup))