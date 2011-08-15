import logging
from google.appengine.ext import db
from google.appengine.runtime.apiproxy_errors import CapabilityDisabledError

"""
Import local sripts
"""
import datamodel

def put_hotels_by_destination(destination, data, startDate, endDate):
	counter = 1
	hotelList = list()
	for hotel in data:
		
		if hotel['address'] is not None:
			price = hotel['price'].replace('&#163;','')
			price = price.replace(',','')
			price = float(price)                                           
			
			dbHotel = datamodel.DBHotel(name = hotel['name'], startdate = startDate, enddate = endDate, price = price, address = hotel['address'], destination = destination, index = counter)

			if hotel['rating'] is not None:
				ratingURL = hotel['rating']
				ratingURL = ratingURL.split("/").pop()
				rating = ratingURL.split('-')[1]
				logging.info("rating is "+rating)
				dbHotel.rating = int(rating)
				 
			if hotel['url'] is not None:
				hotelLink = hotel['url']
				hotelLinkSplit = hotelLink.split("&amp;")
				for param in hotelLinkSplit:
					if param.startswith("propertyIds"):        
						propertyIdValue = param.split("=")[1]
						
						dbHotel.locationid = propertyIdValue.split('-',1)[0]
						if len(dbHotel.locationid) == 3:
							dbHotel.locationid = "000"+dbHotel.locationid
						if len(dbHotel.locationid) == 4:
							dbHotel.locationid = "00"+dbHotel.locationid
						if len(dbHotel.locationid) == 5:
							dbHotel.locationid = "0"+dbHotel.locationid
						
						dbHotel.propertyids = propertyIdValue
						logging.info("dbHotel.locationid: "+dbHotel.locationid) 
						logging.info("dbHotel.propertyids: "+dbHotel.propertyids)
					if param.startswith("hotelRequestId"):
						dbHotel.hotelrequestid = param.split("=")[1]
				hotelLinkManipulated = str(hotelLink).replace('tabId=information','tabId=rooms')
				dbHotel.productdetailsurl = hotelLinkManipulated
			else:
				dbHotel.locationid = destination+str(counter)
			counter += 1
			hotelList.append(dbHotel)
	"""
	Use a batch .put(list) operation here!
	"""		
	try:
		db.put(hotelList)
	except CapabilityDisabledError:
		log.error("put_hotels_by_destination : CapabilityDisabledError")
		# fail gracefully here
		pass  
		
	return hotelList


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
	logging.debug("get_hotels_by_destination_and_price : looking for hotels in "+destination)
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