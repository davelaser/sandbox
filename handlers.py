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
import geonames
		
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
					config_properties = configparsers.loadPropertyFile('config')
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
					logging.exception("GooglePlacesHandler : urllib2 error") 
					logging.exception(e)   


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
			logging.exception("GeocodeStoreTaskWorker() : Error 500 : bad response from put_latlng_by_hotel_locationid_and_destination() for locationid "+str(locationid))
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
			logging.exception("HotelStoreTaskWorker : Error 500 : bad response from put_hotels_by_destination() for destination "+str(destination))
			self.error(500)
		else:
			logging.info("HotelStoreTaskWorker() : task completed successfully for "+str(destination))

class HotelPriceStoreTaskWorker(webapp.RequestHandler):
    def post(self):                                                                                          
		destination = self.request.get("destination")
		locationid = self.request.get("locationid")
		result = datastore.put_hotel_by_price(destination, locationid, self.request.get("price"), self.request.get("startDate"), self.request.get("endDate"))
        
		if result is False:
			logging.exception("HotelPriceStoreTaskWorker : Error 500 : "+str(destination)+", with locationid "+str(locationid))
			self.error(500)
		else:
			logging.debug("HotelPriceStoreTaskWorker() : successfully added LMHotelPriceAndDate destination "+str(destination)+", with locationid "+str(locationid))

class EANHotelStoreTaskWorker(webapp.RequestHandler):
    def post(self):
		hotel = self.request.get("hotel")
		result = datastore.put_ean_hotel(hotel)
		if result is False:
			logging.exception("EANHotelStoreTaskWorker : Error 500 : bad response from put_ean_hotel()")
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
			logging.exception("HotelPriceStoreTaskWorker : Error 500")
			self.error(500)
		else:
			logging.debug("HotelPriceStoreTaskWorker() : successfully added EANHotelPriceAndDate with hotelId")

class EANHotelDetailsStoreTaskWorker(webapp.RequestHandler):
    def post(self):    
		hotelid = self.request.get("hotelid")
		hotelDetailsRequestArgs = utils.ean_get_hotel_details(hotelid, self.request)
		config_properties = configparsers.loadPropertyFile('config')
		try: 
			requestDetailsURL = config_properties.get('EAN', 'xml_url_hotelinfo')
			u = urllib.urlopen(""+requestDetailsURL+"%s" % hotelDetailsRequestArgs)
			r = u.read()
			logging.debug(r)
		except (apiproxy_errors.ApplicationError, DeadlineExceededError), e:
			logging.exception(e)
	
		result = datastore.put_ean_hotel_details(hotelid, json.dumps(r))

		if result is False:
			logging.exception("EANHotelDetailsStoreTaskWorker() : Error 500 for hotel with hotelid "+str(hotelid))
			self.error(500)
		else:
			logging.debug("EANHotelDetailsStoreTaskWorker() : successfully added Hotel Details with hotelid "+str(hotelid))


class EANHotelRequest(webapp.RequestHandler):
	def get(self):
		logging.info("EANHotelRequest")
	def post(self):
		try:
			result = None               
			logging.info("EANHotelRequest")
			config_properties = configparsers.loadPropertyFile('config')
			
			memcacheExpires = config_properties.getfloat('Env', 'memcache_expires')
			
			arrivalDateRaw = self.request.get('arrivalDate')
			numberOfNights = self.request.get('nights')
			priceSort = self.request.get("priceSort")
			ratingSort = self.request.get("ratingSort")
			city = self.request.get('city')
			hotelBrand = self.request.get('brand')
			
			arrivalDateList = arrivalDateRaw.split('-')
			arrivalDate = None
			departureDate = None
			price = None
			priceRaw = self.request.get("priceMax")
			if priceRaw is not None and priceRaw != '':
				price = float(priceRaw)
				
			global_mashup = {}
			
			destination = re.sub(r'(<|>|\s)', '', city)
			destination = destination.lower()
			global_mashup['destination'] = destination
			
			logging.debug(self.request.arguments())
			
			try:
				arrivalDate = datetime.datetime(int(arrivalDateList[2]), int(arrivalDateList[1]), int(arrivalDateList[0]))
				departureDateTimeDelta = datetime.timedelta(days=int(numberOfNights))
				departureDate = arrivalDate + departureDateTimeDelta
			except ValueError, e:
				logging.exception(e)
				logging.exception("EANHotelRequest : Invalid date values or date format")
			
			if arrivalDate is not None and departureDate is not None:
				# Memcache Key convention:
				# CITY:MAX_PRICE:ARRIVAL_DATE:DEPARTURE_DATE:BRAND
				#memcacheKey = str(city)+":"+str(price)+":"+str(arrivalDate.date().isoformat())+":"+str(departureDate.date().isoformat())+":"+str(priceSort)+":"+str(ratingSort)+":"+str(hotelBrand)
				memcacheKey = str(city)+":"+str(arrivalDate.date().isoformat())+":"+str(departureDate.date().isoformat())+":"+str(hotelBrand)
				logging.debug(memcacheKey)
				memcachedHotels = memcache.get(key=memcacheKey, namespace='ean')
				logging.info("Looking up MEMCACHE for : "+memcacheKey)
				
				if memcachedHotels is not None:
					result = memcachedHotels
					logging.debug("Got hotels from memcache")
					
				else:	
					logging.debug("Memcache empty, requesting hotels")
					destination = city.lower()
					if destination == 'europe':
						hotelsData = datastore.get_hotels_by_region(destination, None)
						logging.info(hotelsData)
					else:

						requestArgs = utils.ean_get_hotel_list_url(arrivalDate.date().isoformat(), departureDate.date().isoformat(), city, hotelBrand, self.request)
						logging.info('EAN Hotel request args')
						logging.info(requestArgs)

						try: 
							requestServiceURL = config_properties.get('EAN', 'xml_url_hotellist')
							f = urllib.urlopen(""+requestServiceURL+"%s" % requestArgs)
							response = f.read()
							logging.info('EAN service reponse body')
							logging.info(response)
							response = response.replace('&gt;','>')
							response = response.replace('&lt;','<')
							
						except (apiproxy_errors.ApplicationError, DeadlineExceededError), e:
							logging.exception("EANHotelRequest : DeadlineExceededError error")
							logging.exception(e) 
							global_mashup['name'] = city
							path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/service-error.html')
							self.response.out.write(template.render(path, global_mashup))
							return
				
						try:
							jsonLoadResponse = json.loads(response)	
						except Exception, e:
							logging.exception(e)
							raise e
						
						logging.info('jsonLoadResponse')
						logging.info(jsonLoadResponse)
						
						global_mashup['name'] = city
						if utils.destination_display_names.has_key(city):
							global_mashup['name'] = utils.destination_display_names[city]

						if jsonLoadResponse['HotelListResponse'] is not None:
							if jsonLoadResponse['HotelListResponse'].has_key('HotelList'):
								if jsonLoadResponse['HotelListResponse']['HotelList']['HotelSummary'] is not None:
									result = jsonLoadResponse['HotelListResponse']['HotelList']['HotelSummary']
									if isinstance(result, list):
										for hotel in result:
											if hotel.has_key('thumbNailUrl'):
												hotel['mainImageUrl'] = hotel['thumbNailUrl'].replace('_t', '_b')
									elif isinstance(result, dict):
										tempResult = list()
										tempResult.append(result)
										result = tempResult
										for hotel in result:
											if hotel.has_key('thumbNailUrl'):
												hotel['mainImageUrl'] = hotel['thumbNailUrl'].replace('_t', '_b')
					
						if result is not None:
							# Add the datastore write to the taskqueue
							for hotel in result:
								existingHotel = datamodel.EANHotel.get_by_key_name(str(hotel['hotelId']))
								if existingHotel is None:
									logging.info("EANHotelRequest() : Hotel with hotelid "+str(hotel['hotelId'])+" DOES NOT exist. Assigning task to queue")
									taskqueue.add(queue_name='eanhotelsqueue', url='/eanhotelsworker', params={'hotel':json.dumps(hotel)})
								else: 
									logging.info("EANHotelRequest() : Hotel with location id "+str(hotel['hotelId'])+" DOES exist. No task queue necessary")
								# Add the new price data for this hotel
								taskqueue.add(queue_name='eanhotelspricequeue', url='/eanhotelspriceworker', params={'hotel':json.dumps(hotel), 'arrivalDate':str(arrivalDate.date().isoformat()), 'departureDate':str(departureDate.date().isoformat())})
			
								# Add Hotel details
								#taskqueue.add(queue_name='eanhoteldetailsqueue', url='/eanhoteldetailsworker', params={'hotelid':str(hotel['hotelId'])})
							
								# Get Geonames Wikipedia Data
								
								#wikipediaData = geonames.geonames_find_nearby_wikipedia('en', hotel['latitude'], hotel['longitude'], 10, 5, 'us')
								#hotel['geonames'] = wikipediaData
							# Add the hotel results to Memcache
							memcache.set(key=memcacheKey, value=result, time=memcacheExpires, namespace='ean')
										
				# Regardless of memcache or datastore results, apply any filters
				if result is not None:
					
						
					# [ST]TODO: Nasty hack for client meeting	
					# Re-sort the Hotels to get the best ones in New York at the front of the list
					for hotel in result:
						if hotel.has_key('name') and hotel['name'] == "Hilton Club New York":
							index = result.index(hotel)
							item = result.pop(index)
							#result.insert(0,hotel)
						if hotel.has_key('name') and hotel['name'] == "Hilton New York":
							index = result.index(hotel)
							item = result.pop(index)
							result.insert(0,hotel)
							hotel['latitude'] = 40.762265
							#hotel['latitude'] = 40.762286
							#hotel['longitude'] = -73.978789
							hotel['heading'] = -72.01216845105218
						if hotel.has_key('name') and hotel['name'] == "DoubleTree by Hilton Metropolitan - New York City":
							hotel['heading'] = -217.78839294402061
						if hotel.has_key('name') and hotel['name'] == "DoubleTree Suites by Hilton New York City - Times Square":
							hotel['latitude'] = 40.75906
							hotel['longitude'] = -73.98427600000002
						if hotel.has_key('name') and hotel['name'] == "Hilton Garden Inn New York/West 35th Street":
							hotel['latitude'] = 40.750322
							hotel['longitude'] = -73.98697400000003
						if hotel.has_key('name') and hotel['name'] == "Hilton Garden Inn Times Square":
							hotel['latitude'] = 40.761348
							hotel['longitude'] = -73.98678999999998
						if hotel.has_key('name') and hotel['name'] == "Hilton London Green Park":
							hotel['latitude'] = 51.506449
							hotel['longitude'] = -0.1453920000000153

					
					
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

						
						
				else:
					global_mashup['price'] = price
					path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
					self.response.out.write(template.render(path, global_mashup))			
					                                                                 
			else:
				path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
				self.response.out.write(template.render(path, global_mashup))
		except Exception, e:
			logging.exception(e)
			raise e
		