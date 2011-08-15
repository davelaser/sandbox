import urllib
import urllib2
import logging
from google.appengine.ext import webapp
from google.appengine.ext import deferred

"""
Import local scripts
"""

import datastore
import configparsers

class GeoCodeHandler(webapp.RequestHandler):
	def post(self):
		logging.info("POSTing to Geocode request handler")
		result = datastore.put_latlng_by_hotel_locationid_and_destination(self.request.POST.get("locationid"), self.request.POST.get("destination"), self.request.POST.get("lat"), self.request.POST.get("lng"))
		
		#deferred.defer(put_latlng_by_hotel_locationid_and_destination, self.request.POST.get("locationid"), self.request.POST.get("destination"), self.request.POST.get("lat"), self.request.POST.get("lng"),  _countdown=10)
		
		return result
		
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
