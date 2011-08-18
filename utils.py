import configparsers
import logging 
import urllib

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
	urlArgs['apiKey'] = config_properties.get('EAN', 'api_key')
	urlArgs['locale'] = config_properties.get('EAN', 'locale')
	urlArgs['currencyCode'] = config_properties.get('EAN', 'currency_code')
	urlArgs['xml'] = requestXML
	urlAgrsEncoded = urllib.urlencode(urlArgs)

	return urlAgrsEncoded
	

def all(element, nodename):
    path = './/%s' % nodename
    result = element.findall(path)
    return result