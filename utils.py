import configparsers
import logging
import hashlib
import urllib
import datetime
import calendar
import uuid
import xml.etree.ElementTree as et
from random import choice

def ean_get_hotel_list_url(arrivalDate, departureDate, city, hotelBrand, requestObject):
	config_properties = configparsers.loadPropertyFile('config')
	
	# input format is YYY-MM-DD
	arrivalDateList = arrivalDate.split('-')
	arrivalDateList.reverse()
	# Set US format date MM/DD/YYYYY
	arrivalDateFormatted = arrivalDateList[1]+"/"+arrivalDateList[0]+"/"+arrivalDateList[2]

	# input format is YYY-MM-DD	
	departureDateList = departureDate.split('-')
	departureDateList.reverse()
	# Set US format date MM/DD/YYYYY
	departureDateFormatted = departureDateList[1]+"/"+departureDateList[0]+"/"+departureDateList[2]
	
	requestXML = "<HotelListRequest><propertyName>"+hotelBrand+"</propertyName><arrivalDate>"+arrivalDateFormatted+"</arrivalDate><departureDate>"+departureDateFormatted+"</departureDate><RoomGroup><Room><numberOfAdults>2</numberOfAdults></Room></RoomGroup><city>"+city+"</city><numberOfResults>25</numberOfResults><options>"+config_properties.get('EAN','option')+"</options></HotelListRequest>"

	urlArgs = dict()
	urlArgs['cid'] = config_properties.get('EAN', 'cid')
	apiKey = config_properties.get('EAN', 'api_key')
	apiSecret = config_properties.get('EAN', 'shared_secret')
	sig = generate_ean_signature(apiKey, apiSecret)
	logging.info('EAN sig')
	logging.info(sig)
	urlArgs['sig'] = sig
	urlArgs['apiKey'] = apiKey

	# Extract IP address and User Agent from the Request Headers
	customerIpAddress = requestObject.remote_addr
	customerUserAgent = requestObject.headers.get('User-Agent')
	urlArgs['customerIpAddress'] = customerIpAddress
	urlArgs['customerUserAgent'] = customerUserAgent
	urlArgs['customerSessionId'] = str(uuid.uuid4())

	urlArgs['locale'] = config_properties.get('EAN', 'locale')
	urlArgs['minorRev'] = config_properties.get('EAN', 'minor_rev')
	urlArgs['currencyCode'] = config_properties.get('EAN', 'currency_code')
	urlArgs['_type'] = config_properties.get('EAN', 'type')
	urlArgs['xml'] = requestXML
	urlAgrsEncoded = urllib.urlencode(urlArgs)

	return urlAgrsEncoded


def ean_get_hotel_details(hotelId, requestObject):
	config_properties = configparsers.loadPropertyFile('config')
	requestXML = "<HotelInformationRequest><hotelId>@TOKEN@</hotelId><options>DEFAULT</options></HotelInformationRequest>"
	requestXML = requestXML.replace('@TOKEN@', hotelId)
	
	urlArgs = dict()
	apiKey = config_properties.get('EAN', 'api_key')
	apiSecret = config_properties.get('EAN', 'shared_secret')
	sig = generate_ean_signature(apiKey, apiSecret)
	logging.info('EAN sig')
	logging.info(sig)
	urlArgs['sig'] = sig
	urlArgs['cid'] = config_properties.get('EAN', 'cid')
	urlArgs['apiKey'] = apiKey
	customerIpAddress = requestObject.remote_addr
	customerUserAgent = requestObject.headers.get('User-Agent')
	urlArgs['customerIpAddress'] = customerIpAddress
	urlArgs['customerUserAgent'] = customerUserAgent
	urlArgs['customerSessionId'] = str(uuid.uuid4())
	urlArgs['locale'] = config_properties.get('EAN', 'locale')
	urlArgs['_type'] = config_properties.get('EAN', 'type')
	urlArgs['xml'] = requestXML
	urlAgrsEncoded = urllib.urlencode(urlArgs)

	return urlAgrsEncoded
		

def all(element, nodename):
    path = './/%s' % nodename
    result = element.findall(path)
    return result

def generate_ean_signature(apiKey, apiSecret):
	now = datetime.datetime.now()# + datetime.timedelta(hours=1)
	timestamp = str(calendar.timegm(now.timetuple()))
	logging.info('timestamp')
	logging.info(timestamp)
	m = hashlib.md5()
	m.update(apiKey + apiSecret + timestamp)
	sig = m.hexdigest()
	return sig
	
 
"""
This data object will be used by the Mashup Handler and Ajax Handler
"""
destination_display_names = {
	'newyork':'New York',
	'paris':'Paris',
	'edinburgh':'Edinburgh',
	'amsterdam':'Amsterdam',
	'madrid':'Madrid',
	'barcelona':'Barcelona',
	'miami':'Miami',
	'london':'London',
	'nice':'Nice',
	'tokyo':'Tokyo',
	'rome':'Rome',
	'milan':'Milan',
	'sorrento':'Sorrento',
	'florence':'Florence',
	'positano':'Positano'
}


""" Use with Live Kapow Service """
def parseXML(xmlStringContent):
	results = [] 
	tree = et.XML(xmlStringContent)
	for items in all(tree, 'object'):
		i = {}
		for item in all(items, 'attribute'):
			text = item.text      
			name = item.attrib.get('name')
			i[name] = text
		if i.has_key('address'):
			if i['address'] is not None:
				results.append(i)
		else:
			results.append(i)
	return results
	
def get_countries_by_region(region):
	if region is not None:          
		region_properties = configparsers.loadPropertyFile('countries-by-region')
		countries = list()
		# If we have a region Section in the config file...
		if region_properties.has_section(region):          
			# And that region Section has items...
			items = region_properties.items(region)
			if len(items) > 0:
				for item in items:
					# Add the Country Code to the countries list
					countries.append(item[0].upper())
		return countries		
	else:
		return None
		
def get_regions():
	regions = list()
	regions.append('europe')
	regions.append('northamerica')
	regions.append('southamerica')
	regions.append('africa')
	regions.append('asia')
	return regions
	
def get_hotspots():
	hotspot_properties = configparsers.loadPropertyFile('hotspots')
	hotspotSections = hotspot_properties.sections()
	hotspotSection = choice(hotspotSections)
	hotspot = dict()
	for x,y in hotspot_properties.items(hotspotSection):
			hotspot[x] = hotspot_properties.getfloat(hotspotSection, x)
	return hotspot