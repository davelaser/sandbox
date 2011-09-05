import cgi
import logging
import datetime
from django.utils import simplejson as json
from google.appengine.ext import db
from google.appengine.runtime.apiproxy_errors import CapabilityDisabledError
from google.appengine.api import quota
"""
Import local sripts
"""
import datamodel
import utils

def get_hotels_by_destination(destination):
	resultset = datamodel.LMHotel.gql("WHERE destination = '"+destination+"'")
	return resultset

def put_hotels_by_destination(destination, data):
	try:
		hotel = json.loads(data)
		dbHotel = datamodel.LMHotel(key_name=hotel['locationid'])
		dbHotel.locationid = hotel['locationid']
		if hotel.has_key('propertyids'):
			dbHotel.propertyids = hotel['propertyids']
		if hotel.has_key('name'):
			dbHotel.name = hotel['name']
		if hotel.has_key('address'):
			dbHotel.address = hotel['address']
		if hotel.has_key('index'):
			dbHotel.index = int(hotel['index'])
		if hotel.has_key('destination'):
			dbHotel.destination = hotel['destination']
		if hotel.has_key('productdetailsurl'):
			dbHotel.productdetailsurl = hotel['productdetailsurl']
		if hotel.has_key('rating'):
			dbHotel.rating = float(hotel['rating'])
		if hotel.has_key('hotelrequestid'):
			dbHotel.hotelrequestid = hotel['hotelrequestid']
	
		logging.debug("put_hotels_by_destination() : Added new hotel to datastore. name:"+str(dbHotel.name)+", address:"+str(dbHotel.address))
		dbHotel.put()
		return True 
	
	except (ValueError, CapabilityDisabledError):
		logging.error('put_hotels_by_destination() : ' % e)
		return False

def get_hotel_by_price(destination, locationid, price, startDate, endDate):
	result = None
	try:
		price = float(price)
		startDate = startDate.split('-')
		startDate = datetime.datetime(int(startDate[0]), int(startDate[1]), int(startDate[2]))
		endDate = endDate.split('-')
		endDate = datetime.datetime(int(endDate[0]), int(endDate[1]), int(endDate[2]))
		queryString = "WHERE locationid = '"+str(locationid)+"' AND destination = '"+str(destination)+"' AND price = :1 AND startdate = :2 AND enddate = :3"
		result = datamodel.LMHotelPriceAndDate.gql(queryString, price, startDate, endDate)
	except ValueError, e:
		logging.error("get_hotel_by_price : ValueError" % e)
	return result

def get_hotel_by_locationid(locationid):
	resultset = datamodel.LMHotel.gql("WHERE locationid = '"+locationid+"'")
	return resultset

def put_hotel_by_price(destination, locationid, price, startDate, endDate):
	try:
		hotelsByPrice = get_hotel_by_price(destination, locationid, price, startDate, endDate)
		
		if hotelsByPrice.get() is None:
			existingHotel = datamodel.LMHotel.get_by_key_name(locationid)
			if existingHotel is None:
				raise e
			
			dbHotelByPrice = datamodel.LMHotelPriceAndDate(hotel=existingHotel)
			dbHotelByPrice.destination = destination
			dbHotelByPrice.price = float(price) # [ST]NOTE: we have already converted this to float in main.py:handle_result_ajax_v3()
			startDate = startDate.split('-')
			endDate = endDate.split('-')
			try:
				startDate = datetime.datetime(int(startDate[0]), int(startDate[1]), int(startDate[2]))
				endDate = datetime.datetime(int(endDate[0]), int(endDate[1]), int(endDate[2]))
			except ValueError, e:
				logging.error(e)
				logging.error("put_hotel_by_price : Invalid date values or format")
			
			
			dbHotelByPrice.startdate = startDate
			dbHotelByPrice.enddate = endDate
			
			try:
				dbHotelByPrice.put()
				logging.debug("put_hotel_by_price() : adding hotel with locationid "+str(locationid))
				return True
			except CapabilityDisabledError:
				logging.error("put_hotel_by_price : CapabilityDisabledError")
				# fail gracefully here
				return False
	
	except Exception, e:
		logging.error("put_hotel_by_price : ValueError, data may not have been saved for destination: "+str(destination)+", locationid: "+str(locationid))
		logging.info("Retrying?")
		# fail gracefully here
	 	
	 	return False

"""
Save LatLng against a Hotel
"""
def get_hotel_by_locationid_and_destination(locationid, destination):
	resultset = datamodel.LMHotel.gql("WHERE locationid = '"+locationid+"' AND destination = '"+destination+"'")
	return resultset

def put_latlng_by_hotel_locationid_and_destination(locationid, destination, lat, lng, countryname, countrycode):
	existingHotel = datamodel.LMHotel.get_by_key_name(locationid)
	if existingHotel is not None:
		requiredtoput = False
		
		if existingHotel.latlng is None:
			existingHotel.latlng = db.GeoPt(lat,lng)
			requiredtoput = True
			logging.debug("put_latlng_by_hotel_locationid_and_destination() : latlng is None, so storing for locationid : "+str(locationid))
		if existingHotel.countryname is None:
			requiredtoput = True
			existingHotel.countryname = countryname
			logging.debug("put_latlng_by_hotel_locationid_and_destination() : countryname is None, so storing for locationid : "+str(locationid))
		if existingHotel.countrycode is None:
			requiredtoput = True
			existingHotel.countrycode = countrycode
			logging.debug("put_latlng_by_hotel_locationid_and_destination() : countrycode is None, so storing for locationid : "+str(locationid))
		try:
			if(requiredtoput is True):
				existingHotel.put()
		except CapabilityDisabledError:
			log.error("put_latlng_by_hotel_locationid_and_destination() : CapabilityDisabledError")
			# fail gracefully here
			raise e
			
		return True
	else:
		logging.debug("put_latlng_by_hotel_locationid_and_destination() : Hotel at locationid "+locationid+" NOT FOUND!")
		return False

def get_hotels(destination, price, startDate, endDate, rating):
	hotelsByPrice = get_hotels_by_price(destination, price, startDate, endDate, rating)
    # Create a list for the Django template to use to get the loop length! Argh!
	# GQL query objects can be iterated in Django for loops, but have no length, which we need for hotel total count
	if hotelsByPrice.get() is not None:
		hotelsList = list()
		for priceStructure in hotelsByPrice:
			hotelsList.append(priceStructure)
		return hotelsList
	else:
		logging.debug("No hotels found for destination "+str(destination)+" and price "+str(price))

def get_hotels_by_price(destination, price, startDate, endDate, rating):
	queryString = ""
	if destination is not None and len(destination) > 0:
		queryString += "WHERE destination = '"+destination+"'"
		if startDate is not None and endDate is not None:
			queryString += " AND startdate = :1 AND enddate = :2"
		
		if price is not None and price > 0.0:
			queryString += " AND price <= :3 ORDER BY price"
	
	logging.info(queryString)
	if price is not None and price > 0.0:
		resultset = datamodel.LMHotelPriceAndDate.gql(queryString, startDate, endDate, price)
	else:
		resultset = datamodel.LMHotelPriceAndDate.gql(queryString, startDate, endDate)
	return resultset

def get_hotels_by_region(region, price):
	# [ST]TODO: The LMHotel Model has now price attribute. We'll to fetch LMHotelPriceAndDate instead...
	countries = utils.get_countries_by_region(region)
	if len(countries) > 0:
		queryString = "WHERE countrycode IN :1"
		if price is not None and float(price) > 0.0:
			queryString += " AND price <= :2 ORDER BY price, index"
		else:
			queryString += " ORDER BY index LIMIT 30"
		logging.info(queryString)
		
		if price is not None and float(price) > 0.0:
			resultset = datamodel.LMHotel.gql(queryString, countries, price)
		else:
			resultset = datamodel.LMHotel.gql(queryString, countries)
		
		hotelsList = list()
		for hotel in resultset:
			hotelsList.append(hotel)
		if len(hotelsList) == 0:
			return None
		else:
			return hotelsList
	else:
		return None

def get_hotels_by_country(countrycode, countryname, price):
	logging.info("get_hotels_by_country")
	if countrycode is not None:
		queryString = "WHERE countrycode = :1"
		resultset = datamodel.LMHotel.gql(queryString, countrycode)
		return resultset
	elif countryname is not None:
		queryString = "WHERE countryname = :1"
		resultset = datamodel.LMHotel.gql(queryString, countryname)
		return resultset
	else:
		return None


def put_places_by_hotellocationid_and_types(locationid, types, places, radius):
	# [ST]TODO: Set  a ReferenceProperty to a LMHotel instance by getting the hotel by destination and locationid
	placesRequest = get_places_by_hotellocationid_types_radius(locationid, types, radius)
	if placesRequest.get() is None:
		dbPlace = datamodel.DBPlace()
		dbPlace.locationid = locationid
		dbPlace.types = types
		dbPlace.radius = int(radius)
		dbPlace.places = db.Text(places, encoding='utf-8')
		try:
			dbPlace.put()
		except CapabilityDisabledError, e:
			log.error("put_places_by_hotellocationid_and_types : CapabilityDisabledError" % e)
			# fail gracefully here
			pass

def get_places_by_hotellocationid_types_radius(locationid, types, radius):
	resultset = datamodel.DBPlace.gql("WHERE locationid = '"+locationid+"' AND types = '"+types+"' AND radius = "+radius+"")
	return resultset

def put_ean_hotel(hotel):
	dbHotel = datamodel.EANHotel()
	
	for attributes in hotel:
		timestamp = db.DateTimeProperty(auto_now_add=True)
		name = hotel['name']
		address1 = hotel['address1']
		postalcode = hotel['postalCode']
		stateprovincecode = hotel['stateProvinceCode']
		countrycode = hotel['countryCode']
		propertycategory = hotel['propertyCategory']
		shortdescription = hotel['shortDescription']
		locationdescription = hotel['locationDescription']
		suppliertype = hotel['supplierType']
		mainimageurl = hotel['mainImageUrl']
		thumbnailurl = hotel['thumbnailUrl']
		hotelrating = float(hotel['hotelrating'])
		hotelid = hotel['hotelId']
		airportcode = hotel['airportCode']
		proximitydistance = hotel['proximityDistance']
		proximityunit = hotel['proximityUnit']
		latlng = db.GeoPt(float(hotel['latitude']), float(hotel['longitude']))
		deeplink = hotel['deepLink']



def delete_all_hotels():
	resultset = datamodel.LMHotel.gql("ORDER BY index")
	db.delete(resultset);
	resultsetPrices = datamodel.LMHotelPriceAndDate.gql("ORDER BY price")
	db.delete(resultsetPrices);
	logging.info("delete_all_hotels : Deleted all hotels")