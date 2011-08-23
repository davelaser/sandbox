import configparsers
import logging 
import urllib
import xml.etree.ElementTree as et

def ean_get_hotel_list_url(arrivalDate, departureDate, city):
	config_properties = configparsers.loadConfigProperties()
	
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
	
	requestXML = "<HotelListRequest><arrivalDate>"+arrivalDateFormatted+"</arrivalDate><departureDate>"+departureDateFormatted+"</departureDate><RoomGroup><Room><numberOfAdults>2</numberOfAdults></Room></RoomGroup><city>"+city+"</city><numberOfResults>25</numberOfResults></HotelListRequest>"

	urlArgs = dict()
	urlArgs['cid'] = config_properties.get('EAN', 'cid')
	urlArgs['apiKey'] = config_properties.get('EAN', 'api_key')
	urlArgs['locale'] = config_properties.get('EAN', 'locale')
	urlArgs['currencyCode'] = config_properties.get('EAN', 'currency_code')
	urlArgs['_type'] = config_properties.get('EAN', 'type')
	urlArgs['xml'] = requestXML
	urlAgrsEncoded = urllib.urlencode(urlArgs)

	return urlAgrsEncoded
	

def all(element, nodename):
    path = './/%s' % nodename
    result = element.findall(path)
    return result

 
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
	'sorrento':'Sorrento'
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
		region_properties = configparsers.loadRegionProperties()
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