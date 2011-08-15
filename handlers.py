import logging
from google.appengine.ext import webapp

"""
Import local scripts
"""
import datastore

class GeoCodeHandler(webapp.RequestHandler):
	def post(self):
		logging.info("POSTing to Geocode request handler")
		result = datastore.put_latlng_by_hotel_locationid_and_destination(self.request.POST.get("locationid"), self.request.POST.get("destination"), self.request.POST.get("lat"), self.request.POST.get("lng"))
		
		#deferred.defer(put_latlng_by_hotel_locationid_and_destination, self.request.POST.get("locationid"), self.request.POST.get("destination"), self.request.POST.get("lat"), self.request.POST.get("lng"),  _countdown=10)
		
		return result