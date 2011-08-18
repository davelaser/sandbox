import configparsers
import logging

def ean_get_hotel_list_url(arrivalDate, departureDate, city):
	config_properties = configparsers.loadConfigProperties()
	
	arrivalDateList = arrivalDate.split('-')
	arrivalDateList.reverse()
	# Set US format date MM/DD/YYYYY
	arrivalDateFormatted = arrivalDateList[1]+"/"+arrivalDateList[0]+"/"+arrivalDateList[2]
	
	departureDateList = departureDate.split('-')
	departureDateList.reverse()
	# Set US format date MM/DD/YYYYY
	departureDateFormatted = departureDateList[1]+"/"+departureDateList[0]+"/"+departureDateList[2]
	
	requestURL = config_properties.get('EAN', 'xml_service_url')
	requestXML = "<HotelListRequest><arrivalDate>"+arrivalDateFormatted+"</arrivalDate><departureDate>"+departureDateFormatted+"</departureDate><RoomGroup><Room><numberOfAdults>2</numberOfAdults></Room></RoomGroup><city>"+city+"</city><numberOfResults>25</numberOfResults></HotelListRequest>"
	requestURL += requestXML
	logging.info(requestURL)
	return requestURL
	

def all(element, nodename):
    path = './/%s' % nodename
    result = element.findall(path)
    return result