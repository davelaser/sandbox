import os
import urllib
import urllib2
import logging
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

class EANHotelRequest(webapp.RequestHandler):
	def get(self):
		arrivalDate = self.request.get('arrivalDate')
		departureDate = self.request.get('departureDate')
		city = self.request.get('city')
		requestUrl = utils.ean_get_hotel_list_url(arrivalDate, departureDate, city)
		
		try:
			request = urllib.urlopen(requestUrl)
			response = request.read()
			
		except urllib2.URLError, e:
			logging.error("EANHotelRequest : urllib2 error") 
			logging.error(e)
		
		hotelList = list()
		jsonLoadResponse = json.loads(response)	
		for hotelData in jsonLoadResponse['HotelListResponse']['HotelList']['HotelSummary']:
			hotel = dict()
			logging.info(hotelData)
			hotel['name'] = hotelData['name']
			if hotelData.has_key('hotelId'):
				hotel['locationid'] = hotelData['hotelId']
			hotel['address'] = str(hotelData['address1'])+", "+str(hotelData['city'])+", "+str(hotelData['postalCode'])
			hotel['latlng'] = db.GeoPt(hotelData['latitude'], hotelData['longitude'])
			hotel['countrycode'] = hotelData['countryCode']
			# Use city from request for destination
			hotel['destination'] = city
			hotel['description'] = hotelData['shortDescription']
			hotel['rating'] = hotelData['hotelRating']
			hotel['productdetailsurl'] = hotelData['deepLink']
			hotelList.append(hotel)
			
		global_mashup = {}	
		global_mashup['hotels'] = hotelList
		
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/hotels.html')
		self.response.out.write(template.render(path, global_mashup))
	