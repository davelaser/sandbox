import os
import re
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
from google.appengine.api import memcache
from operator import itemgetter
from google.appengine.runtime import DeadlineExceededError
from google.appengine.runtime import apiproxy_errors

"""
Import local scripts
"""

import datastore
import datamodel
import configparsers
import utils
		
class GooglePlacesHandler(webapp.RequestHandler):
	def post(self):
		"""
		Get the config properties
		"""
		types = self.request.get('types')
		radius = self.request.get('radius')
		locationid = self.request.get('locationid')
                                     
		memcacheKey = str(locationid)+":"+str(types)+":"+str(radius)
		memcachePlaces = memcache.get(key=memcacheKey)
		if memcachePlaces is not None:
			logging.info("Retrieving PLACES from MEMCACHE")
			self.response.out.write(memcachePlaces)
		else:
			placesData = datastore.get_places_by_hotellocationid_types_radius(locationid, types, radius).get()
			if placesData is not None:
				logging.info("Retrieving PLACES from DATASTORE")
				self.response.out.write(placesData)
			else:
				logging.info("Requesting PLACES from GOOGLE")   	
				try:
					config_properties = configparsers.loadConfigProperties()
					placesURL = "https://maps.googleapis.com/maps/api/place/search/json?%s"
					urlArgs = dict()
					urlArgs['location'] = self.request.get('location')
					urlArgs['radius'] = radius
					urlArgs['types'] = types
					urlArgs['name'] = self.request.get('name')
					urlArgs['key'] = config_properties.get('Google', 'places_api_key')
					urlArgs['sensor'] = config_properties.get('Google', 'places_sensor')

					urlAgrsEncoded = urllib.urlencode(urlArgs)
					result = urllib.urlopen(placesURL % urlAgrsEncoded)
					jsonResponse = result.read()
					self.response.out.write(jsonResponse)
					memcache.set(key=memcacheKey, value=jsonResponse, time=6000)
					datastore.put_places_by_hotellocationid_and_types(locationid, types, jsonResponse, radius)
				except urllib2.URLError, e:
					logging.error("GooglePlacesHandler : urllib2 error") 
					logging.error(e)   


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
		result = datastore.put_latlng_by_hotel_locationid_and_destination(locationid, destination, lat, lng, countryname, countrycode)
		if result is False:
			logging.error("GeocodeStoreTaskWorker() : Error 500 : bad response from put_latlng_by_hotel_locationid_and_destination() for locationid "+str(locationid))
			#self.error(500)
		else:
			logging.info("GeocodeStoreTaskWorker() : task completed successfully for locationid "+str(locationid))
        
class HotelStoreTaskHandler(webapp.RequestHandler):
    def post(self):
		logging.info("HotelStoreTaskHandler()")
		destination = self.request.get("destination")
		data = self.request.get("data")
		# Add the task to the queue.
		taskqueue.add(queue_name='hotelsqueue', url='/hotelsworker', params={'destination':destination, 'data':data})

class HotelStoreTaskWorker(webapp.RequestHandler):
    def post(self):
		logging.info("HotelStoreTaskWorker()")
		destination = self.request.get("destination")
		result = datastore.put_hotels_by_destination(destination, self.request.get("data"))
		if result is False:
			logging.error("HotelStoreTaskWorker : Error 500 : bad response from put_hotels_by_destination() for destination "+str(destination))
			self.error(500)
		else:
			logging.info("HotelStoreTaskWorker() : task completed successfully for "+str(destination))

class HotelPriceStoreTaskWorker(webapp.RequestHandler):
    def post(self):                                                                                          
		destination = self.request.get("destination")
		locationid = self.request.get("locationid")
		result = datastore.put_hotel_by_price(destination, locationid, self.request.get("price"), self.request.get("startDate"), self.request.get("endDate"))
        
		if result is False:
			logging.error("HotelPriceStoreTaskWorker : Error 500 : "+str(destination)+", with locationid "+str(locationid))
			self.error(500)
		else:
			logging.debug("HotelPriceStoreTaskWorker() : successfully added LMHotelPriceAndDate destination "+str(destination)+", with locationid "+str(locationid))

class EANHotelStoreTaskWorker(webapp.RequestHandler):
    def post(self):
		hotel = self.request.get("hotel")
		result = datastore.put_ean_hotel(hotel)
		if result is False:
			logging.error("EANHotelStoreTaskWorker : Error 500 : bad response from put_ean_hotel()")
			self.error(500)
		else:
			logging.info("EANHotelStoreTaskWorker() : task completed successfully for")

class EANHotelPriceStoreTaskWorker(webapp.RequestHandler):
    def post(self):                                                                                          
		hotel = self.request.get("hotel")
		arrivalDate = self.request.get("arrivalDate")
		departureDate = self.request.get("departureDate")
		
		result = datastore.put_ean_hotel_by_price(hotel, arrivalDate, departureDate)

		if result is False:
			logging.error("HotelPriceStoreTaskWorker : Error 500")
			self.error(500)
		else:
			logging.debug("HotelPriceStoreTaskWorker() : successfully added EANHotelPriceAndDate with hotelId")


class EANHotelRequest(webapp.RequestHandler):
	def get(self):
		logging.info("EANHotelRequest")
	def post(self):                    
		logging.info("EANHotelRequest")
		config_properties = configparsers.loadConfigProperties()
		arrivalDateRaw = self.request.get('arrivalDate')
		numberOfNights = self.request.get('nights')
		priceSort = self.request.get("priceSort")
		ratingSort = self.request.get("ratingSort")
		city = self.request.get('city')
		arrivalDateList = arrivalDateRaw.split('-')
		arrivalDate = None
		departureDate = None
		price = float(0.0)
		priceRaw = self.request.get("priceMax")
		if priceRaw is not None and priceRaw != '':
			price = float(priceRaw)
			
		global_mashup = {}
		
		destination = re.sub(r'(<|>|\s)', '', city)
		destination = destination.lower()
		global_mashup['destination'] = destination
		
		try:
			arrivalDate = datetime.datetime(int(arrivalDateList[2]), int(arrivalDateList[1]), int(arrivalDateList[0]))
			departureDateTimeDelta = datetime.timedelta(days=int(numberOfNights))
			departureDate = arrivalDate + departureDateTimeDelta
		except ValueError, e:
			logging.error(e)
			logging.error("EANHotelRequest : Invalid date values or date format")
		
		if arrivalDate is not None and departureDate is not None:
			# Memcache Key convention:
			# CITY:MAX_PRICE:ARRIVAL_DATE:DEPARTURE_DATE:PRICE_SORT_HIGH_LOW:RATING_SORT_HIGH_LOW
			memcacheKey = str(city)+":"+str(price)+":"+str(arrivalDate.date().isoformat())+":"+str(departureDate.date().isoformat())+":"+str(priceSort)+":"+str(ratingSort)
			logging.debug(memcacheKey)
			memcachedHotels = memcache.get(key=memcacheKey, namespace='ean')
			logging.info("Looking up MEMCACHE for : "+memcacheKey)
			
			if memcachedHotels is not None:
				global_mashup['hotels'] = memcachedHotels
	
				path = os.path.join(os.path.dirname(__file__),'templates/version3/expedia/hotels.html')
				self.response.out.write(template.render(path, global_mashup))
				logging.debug("Returned hotels from memcache")
			else:	
				logging.debug("Memcache empty, requesting hotels")
				requestArgs = utils.ean_get_hotel_list_url(arrivalDate.date().isoformat(), departureDate.date().isoformat(), city)

				try: 
					requestServiceURL = config_properties.get('EAN', 'xml_url_hotellist')
					f = urllib.urlopen(""+requestServiceURL+"%s" % requestArgs)
					response = f.read()
					response = response.replace('&gt;','>')
					response = response.replace('&lt;','<')
					
				except (apiproxy_errors.ApplicationError, DeadlineExceededError), e:
					logging.error("EANHotelRequest : DeadlineExceededError error")
					logging.error(e) 
					global_mashup['name'] = city
					path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/service-error.html')
					self.response.out.write(template.render(path, global_mashup))
					return
		
				jsonLoadResponse = json.loads(response)	

				result = None
				global_mashup['name'] = city
				if utils.destination_display_names.has_key(city):
					global_mashup['name'] = utils.destination_display_names[city]

				if jsonLoadResponse['HotelListResponse'] is not None:
					if jsonLoadResponse['HotelListResponse'].has_key('HotelList'):
						if jsonLoadResponse['HotelListResponse']['HotelList']['HotelSummary'] is not None:
							result = jsonLoadResponse['HotelListResponse']['HotelList']['HotelSummary']
							
							for hotel in result:
								if hotel.has_key('thumbNailUrl'):
									hotel['mainImageUrl'] = hotel['thumbNailUrl'].replace('_t', '_b')
		
				if result is not None:
					
					if priceSort is not None and priceSort != '':
						if priceSort == 'high':
							result = sorted(result, key=itemgetter('lowRate'), reverse=True)
						elif priceSort == 'low':
							result = sorted(result, key=itemgetter('lowRate'), reverse=False)
							
					if ratingSort is not None and ratingSort != '':
						if ratingSort == 'high':
							result = sorted(result, key=itemgetter('hotelRating'), reverse=True)
						elif ratingSort == 'low':
							result = sorted(result, key=itemgetter('hotelRating'), reverse=False)
					
					if price is not None and price > 0.0:
						priceList = list()
						for hotel in result:
							if hotel['lowRate'] <= price:
								priceList.append(hotel)
						
						result = priceList
					
					if len(result) <= 0:
						global_mashup['price'] = price
						path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
						self.response.out.write(template.render(path, global_mashup))
					else:
						global_mashup['hotels'] = result
						path = os.path.join(os.path.dirname(__file__),'templates/version3/expedia/hotels.html')
						self.response.out.write(template.render(path, global_mashup))
						memcache.set(key=memcacheKey, value=result, time=6000, namespace='ean')

						# After sending the response, add the datastore write to the taskqueue
						for hotel in result:
							existingHotel = datamodel.EANHotel.get_by_key_name(str(hotel['hotelId']))
							if existingHotel is None:
								logging.info("EANHotelRequest() : Hotel with hotelid "+str(hotel['hotelId'])+" DOES NOT exist. Assigning task to queue")
								taskqueue.add(queue_name='eanhotelsqueue', url='/eanhotelsworker', params={'hotel':json.dumps(hotel)})
							else: 
								logging.info("EANHotelRequest() : Hotel with location id "+str(hotel['hotelId'])+" DOES exist. No task queue necessary")
							# Add the new price data for this hotel
							taskqueue.add(queue_name='eanhotelspricequeue', url='/eanhotelspriceworker', params={'hotel':json.dumps(hotel), 'arrivalDate':str(arrivalDate.date().isoformat()), 'departureDate':str(departureDate.date().isoformat())})
					
				else:
					path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
					self.response.out.write(template.render(path, global_mashup))			
				                                                                 
		else:
			path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
			self.response.out.write(template.render(path, global_mashup))