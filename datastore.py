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
	resultset = datamodel.DBHotel.gql("WHERE destination = '"+destination+"'")
	return resultset

def put_hotels_by_destination(destination, data):
	try:
		hotel = json.loads(data)
		resultSet = None
		dbHotel = datamodel.DBHotel()
		if hotel.has_key('locationid'):
			dbHotel.locationid = hotel['locationid']
		if dbHotel.locationid is not None:
			resultSet = get_hotel_by_locationid_and_destination(dbHotel.locationid, destination)
		
		# If we don't already have this hotel, add it to the datastore
		if resultSet.get() is None:
			if hotel.has_key('propertyids'):
				dbHotel.propertyids = hotel['propertyids']
			if hotel.has_key('name'):
				dbHotel.name = hotel['name']
			if hotel.has_key('address'):
				dbHotel.address = hotel['address']
			
			if hotel.has_key('price'):
				price = hotel['price']
			rawDate = hotel['startdate'].split('-')
			dateTime = None
			try:
				dateTime = datetime.datetime(int(rawDate[0]), int(rawDate[1]), int(rawDate[2]))
			except ValueError, e:
				logging.error("put_hotels_by_destination : invalid startdate")
			startdate = dateTime
			rawDate = hotel['enddate'].split('-')
			dateTime = None
			try:
				dateTime = datetime.datetime(int(rawDate[0]), int(rawDate[1]), int(rawDate[2]))
			except ValueError, e:
				logging.error("put_hotels_by_destination : invalid enddate")
			enddate = dateTime
			
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
			
			db.put(dbHotel)			
			
			logging.debug("put_hotels_by_destination() : Added new hotel to datastore. name:"+str(dbHotel.name)+", address:"+str(dbHotel.address))
		else:
			logging.debug("put_hotels_by_destination() : hotel with locationid "+dbHotel.locationid+" already exists, so not putting in datastore")
	except CapabilityDisabledError:
		log.error("put_hotels_by_destination : CapabilityDisabledError, data may not have been saved for "+str(destination))
		# fail gracefully here
		pass

def get_hotel_by_price(destination, locationid, price, startDate, endDate):
	price = float(price)
	startDate = startDate.split('-')
	try:
		startDate = datetime.datetime(int(startDate[0]), int(startDate[1]), int(startDate[2]))
	except ValueError, e:
		logging.error(e)
		logging.error("get_hotel_by_price : Invalid date values or startDate format")
	
	endDate = endDate.split('-')
	try:
		endDate = datetime.datetime(int(endDate[0]), int(endDate[1]), int(endDate[2]))
	except ValueError, e:
		logging.error(e)
		logging.error("get_hotel_by_price : Invalid date values for endDate format")
	
	queryString = "WHERE locationid = '"+str(locationid)+"' AND destination = '"+str(destination)+"' AND price = :1 AND startdate = :2 AND enddate = :3"
	resultset = datamodel.LMHotelPriceAndDate.gql(queryString, price, startDate, endDate)
	logging.info("get_hotel_by_price(): returning result")
	return resultset

def get_hotel_by_locationid(locationid):
	resultset = datamodel.DBHotel.gql("WHERE locationid = '"+locationid+"'")
	return resultset

def put_hotel_by_price(destination, locationid, price, startDate, endDate):
	try:
		hotelsByPrice = get_hotel_by_price(destination, locationid, price, startDate, endDate)
		
		if hotelsByPrice.get() is None:
			hotel = get_hotel_by_locationid(locationid)
			if hotel is None:
				raise e
			
			dbHotelByPrice = datamodel.LMHotelPriceAndDate(hotel=hotel.get())
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
				db.put(dbHotelByPrice)
				logging.debug("put_hotel_by_price() : adding hotel with locationid "+str(locationid))
			except CapabilityDisabledError:
				log.error("put_hotel_by_price : CapabilityDisabledError")
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
	resultset = datamodel.DBHotel.gql("WHERE locationid = '"+locationid+"' AND destination = '"+destination+"'")
	return resultset

def put_latlng_by_hotel_locationid_and_destination(locationid, destination, lat, lng, countryname, countrycode):
	hotelRequest = get_hotel_by_locationid_and_destination(locationid, destination)
	if hotelRequest.get() is not None:
		for data in hotelRequest:
			"""
			This only returns 1 entity, so no need for a batch .put() operation here
			"""
			requiredtoput = False
			
			if data.latlng is None:
				data.latlng = db.GeoPt(lat,lng)
				requiredtoput = True
				logging.debug("put_latlng_by_hotel_locationid_and_destination() : latlng is None, so storing for locationid : "+str(locationid))
			if data.countryname is None:
				requiredtoput = True
				data.countryname = countryname
				logging.debug("put_latlng_by_hotel_locationid_and_destination() : countryname is None, so storing for locationid : "+str(locationid))
			if data.countrycode is None:
				requiredtoput = True
				data.countrycode = countrycode
				logging.debug("put_latlng_by_hotel_locationid_and_destination() : countrycode is None, so storing for locationid : "+str(locationid))
			try:
				if(requiredtoput is True):
					db.put(data)
			except CapabilityDisabledError:
				log.error("put_latlng_by_hotel_locationid_and_destination : CapabilityDisabledError")
				# fail gracefully here
				pass
		return "true"
	else:
		logging.debug("put_latlng_by_hotel_locationid_and_destination() : Hotel at locationid "+locationid+" NOT FOUND!")
		return "false"

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
	logging.debug("get_hotels_by_price()")
	logging.debug("price : ")
	logging.debug(type(price))
	
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

def get_hotels_by_country(countrycode, countryname):
	logging.info("get_hotels_by_country")
	countryString = ""
	if countrycode is not None:
		queryString = "WHERE countrycode = :1"
		resultset = datamodel.DBHotel.gql(queryString, countrycode) 
	elif countryname is not None:
		queryString = "WHERE countryname = :1"
		resultset = datamodel.DBHotel.gql(queryString, countryname)
	return resultset
	
def get_hotels_by_region(regionName):
	logging.info("get_hotels_by_region")
	regions = utils.get_regions()
	if regions.has_key(regionName):
		region = regions[regionName]
		
	
	else:
		return None
	

def put_places_by_hotellocationid_and_types(locationid, types, places, radius):
	# [ST]TODO: Set  a ReferenceProperty to a DBHotel instance by getting the hotel by destination and locationid
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

def get_places_by_hotellocationid_types_radius(locationid, types, radius):
	resultset = datamodel.DBPlace.gql("WHERE locationid = '"+locationid+"' AND types = '"+types+"' AND radius = "+radius+"")
	return resultset
	

def delete_all_hotels():
	resultset = datamodel.DBHotel.gql("ORDER BY index")
	db.delete(resultset);
	resultsetPrices = datamodel.LMHotelPriceAndDate.gql("ORDER BY price")
	db.delete(resultsetPrices);
	logging.info("delete_all_hotels : Deleted all hotels")