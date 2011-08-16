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

def put_hotels_by_destination(destination, data, startDate, endDate):  
	try:         
		logging.info("put_hotels_by_destination()")
		hotel = json.loads(data)
		dbHotel = datamodel.DBHotel()
		dbHotel.locationid = hotel['locationid']
		dbHotel.propertyids = hotel['propertyids']
		dbHotel.name = hotel['name']
		dbHotel.price = hotel['price']

		rawDate = hotel['startdate'].split('-') 
		dateTime = None
		try:
			dateTime = datetime.datetime(int(rawDate[0]), int(rawDate[1]), int(rawDate[2]))
		except ValueError, e:
			logging.error("put_hotels_by_destination : invalid startdate")
		dbHotel.startdate = dateTime
		rawDate = hotel['enddate'].split('-')
		dateTime = None
		try:
			dateTime = datetime.datetime(int(rawDate[0]), int(rawDate[1]), int(rawDate[2]))
		except ValueError, e:
			logging.error("put_hotels_by_destination : invalid enddate")
		dbHotel.enddate = dateTime
		dbHotel.address = hotel['address']
		dbHotel.index = int(hotel['index'])
		dbHotel.destination = hotel['destination']
		dbHotel.productdetailsurl = hotel['productdetailsurl']
		dbHotel.rating = int(hotel['rating'])
		dbHotel.hotelrequestid = hotel['hotelrequestid']
		

		db.put(dbHotel)
	except CapabilityDisabledError:
		log.error("put_hotels_by_destination : CapabilityDisabledError, data may not have been saved for "+destination)
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

def get_hotels_by_destination_and_price(destination, price, startDate, rating):
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

def get_places_by_hotellocationid_types_radius(locationid, types, radius):
	resultset = datamodel.DBPlace.gql("WHERE locationid = '"+locationid+"' AND types = '"+types+"' AND radius = "+radius+"")
	return resultset
	
	
def delete_all_hotels():
	resultset = datamodel.DBHotel.gql("ORDER BY index")
	db.delete(resultset);
	logging.info("delete_all_hotels : Deleted all hotels")