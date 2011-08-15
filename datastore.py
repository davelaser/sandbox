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
