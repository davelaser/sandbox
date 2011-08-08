#!/usr/bin/env python
from google.appengine.dist import use_library
use_library('django', '1.2')
import re
import os
import codecs
import logging
import xml.etree.ElementTree as et
import xml.dom.minidom as md
import urllib
import urllib2 
from google.appengine.api import urlfetch
from django.utils import simplejson as json
from ConfigParser import ConfigParser
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.api import memcache

requestExperience = "/hotels"                  
requestHome = "/"
requestRestApi = r"/(.*)/(xml|json)"
requestDestination = r"/(.*)"
requestAjaxAPI = "/ajax"
requestGooglePlaces = "/places"
requestGeoCode = "/geocode"

# TODO: remove the memcache flush
memcache.flush_all()

#logging.info(memcache.get_stats())

feeds = {
    'bbc'      : 'http://news.bbc.co.uk/weather/forecast/',
    'guardian' : 'http://content.guardianapis.com/search?format=json&use-date=last-modified&show-fields=headline,trailText&ids=travel/',
    'yahoo'    : 'http://query.yahooapis.com/v1/public/yql?format=json&q='
}

ny_hotels_feed = 'data/xml/LM-hotels.xml'
ny_city_breaks_feed = 'data/xml/LM-city-breaks.xml'
ny_flights_feed = 'data/xml/lastminute.xml'

ny_mashup = {
    'name'     : 'New York',
    'bbc'      : '101',
    'news'     : feeds['guardian']+'travel/newyork',
    'weather'  : feeds['yahoo']+'select * from weather.forecast where location='
}
#new york weather = 10118

"""
This data object will be used by the Mashup Handler and Ajax Handler
"""
global_mashup = {}

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

hotel_booking_dest_names = {
	'newyork':'NYC',
	'paris':'PAR',
	'madrid':'MAD',
	'amsterdam':'AMS',
	'barcelona':'BCN'		
}

def loadConfigProperties():
	configProperties = memcache.get("config.properties")
	if configProperties is not None:
		#logging.info("Got configProperties from memcache")
		return configProperties
	else:
		#logging.info("NOT Got configProperties from memcache")
		configPropertyLocation = "properties/config.properties"
		configProperties = ConfigParser()
		configProperties.read(configPropertyLocation)
		memcache.add("config.properties", configProperties)
		return configProperties	   
"""
Get the config properties
"""
config_properties = loadConfigProperties()


class DBCityDestination(db.Model):
	timestamp = db.DateTimeProperty(auto_now_add=True)
	name = db.StringProperty(required=True)
	hotels = db.ListProperty(str, required=True)
	
"""
Get destination content to the datastore
"""
def get_datastore_by_destination(destination):
	resultset = DBCityDestination.gql("WHERE name = '"+destination+"'")
	return resultset
	
"""
Write to datastore by destination
"""	                             
def put_datastore_by_destination(destination, data):
	hotelsData = get_datastore_by_destination(destination)
	if hotelsData.get() is None:
		dbDestination = DBCityDestination(name = destination, hotels = data)
		dbDestination.put()
	
	
def kapowAPI(request):
	return codecs.open(os.path.join(os.path.dirname(__file__), request))


"""
Save Hotel data
"""
class DBHotel(db.Model):
	timestamp = db.DateTimeProperty(auto_now_add=True)
	locationid = db.StringProperty(required=True)
	name = db.StringProperty(required=True)
	price = db.FloatProperty(required=True)
	address = db.PostalAddressProperty(required=True)
	phone = db.PhoneNumberProperty()
	category = db.CategoryProperty()
	latlng = db.GeoPtProperty()
	index = db.IntegerProperty(required=True)
	destination = db.StringProperty(required=True)
	thumbnailurl = db.StringProperty()
	mainimageurl = db.StringProperty()
	photo1url = db.StringProperty()
	photo2url = db.StringProperty()
	photo3url = db.StringProperty()
	photo4url = db.StringProperty()
	reviewurl = db.TextProperty()
	bookingurl = db.TextProperty()
	
def get_hotels_by_destination(destination):
	resultset = DBHotel.gql("WHERE destination = '"+destination+"' ORDER BY price")
	return resultset
			
def put_hotels_by_destination(destination, data): 
	hotels = get_hotels_by_destination(destination)
	if hotels.get() is None:
		counter = 1
		hotelList = list()
		for hotel in data:
			dbHotel = DBHotel(locationid = destination+str(counter), name = hotel['Name'], price = float(hotel['Price']), address = hotel['Address'], phone = hotel['Phone'], destination = destination, index = counter)
			dbHotel.mainimageurl = "http://m.travelocity.com/images/new_york/hotel/0/008667/Exterior_E_1.jpg"
			dbHotel.thumbnailurl = "http://m.travelocity.com/images/new_york/hotel/0/008667/Exterior_H_1.jpg"
			#dbHotel.bookingurl = "http://globaltrips.lastminute.com/trips/shoppingCart?pTxId=281994&checkInDate=2011-08-19&checkOutDate=2011-08-20&guestCounts=2&guestCodes=ADULT&propertyIds=008667&city=new+york+city&configId=S72722479&numRooms=1&numNights=1&dest=NYC&path=hotels&hotelRequestId=321709440554654&moduleName=inpage_navigation&patternName=product_details_overlay&roomTypeCodes=G674412358&cartId=493e1e9f-91a1-4026-b251-d93273469c55&itemId=32170945054166&tripId=0&productType=Hotels"
			counter += 1
			hotelList.append(dbHotel)
		"""
		Use a batch .put(list) operation here!
		"""
		db.put(hotelList)                                                                                                                                               
			

def get_hotels_by_destination_and_price(destination, price):
	queryString = ""
	
	if destination is not None and len(destination) > 0:
		queryString += "WHERE destination = '"+destination+"'"
		if price is not None and len(str(price)) > 0:
			queryString += " AND price <= "+str(price)
	else:
		if price is not None and len(str(price)) > 0:
			queryString += "WHERE price <= "+str(price)
		
	queryString += " ORDER BY price"
	logging.info(queryString)
	resultset = DBHotel.gql(queryString)
	return resultset


def get_hotels_order_by_price_cheapest():
	resultset = DBHotel.gql("ORDER BY price ASC LIMIT 30")
	return resultset

def get_hotels_order_by_price_expensive():
	resultset = DBHotel.gql("ORDER BY price DESC LIMIT 30")
	return resultset
	
"""
Save Places data by hotel and types
"""
class DBPlace(db.Model):
	locationid = db.StringProperty()
	types = db.StringProperty()
	places = db.TextProperty()
	radius = db.IntegerProperty()
	
def get_places_by_hotellocationid_types_radius(locationid, types, radius):
	resultset = DBPlace.gql("WHERE locationid = '"+locationid+"' AND types = '"+types+"' AND radius = "+radius+"")
	return resultset
	
def put_places_by_hotellocationid_and_types(locationid, types, places, radius):
	placesRequest = get_places_by_hotellocationid_types_radius(locationid, types, radius)
	if placesRequest.get() is None:
		dbPlace = DBPlace()
		dbPlace.locationid = locationid
		dbPlace.types = types
		dbPlace.radius = int(radius)
		dbPlace.places = db.Text(places, encoding='utf-8')
		dbPlace.put()

"""
Save LatLng against a Hotel
"""                        
def get_hotel_by_locationid_and_destination(locationid, destination):
	resultset = DBHotel.gql("WHERE locationid = '"+locationid+"' AND destination = '"+destination+"'")
	return resultset                                  
	
def put_latlng_by_hotel_locationid_and_destination(locationid, destination, lat, lng):
	hotelRequest = get_hotel_by_locationid_and_destination(locationid, destination)   
	if hotelRequest.get() is not None: 
		logging.info("Found hotel locationid "+locationid+" now assigning latlng")
		for data in hotelRequest:
			"""
			This only returns 1 entity, so no need for a batch .put() operation here
			"""
			data.latlng = db.GeoPt(lat,lng)
			db.put(data)
		return "true"
	else:
		return "false"


"""
Get Hotel Booking Form Data
"""		

def get_hotel_booking_form_data(destination):
	bookingData = dict()
	configItems = config_properties.items('HotelBookingForm')
	for item in configItems:
		bookingData[item[0]] = item[1]
	return bookingData
	
""" Use with Live Kapow Service - Handle an RPC result instance, for Flights """
def handle_result_ajax(rpc, destination, info_type, response):
	result = rpc.get_result()
	if result.status_code == 200:
		logging.info("RPC response SUCCESS code: 200")
		f = parseXMLLive(result.content.replace('|', ''))
		if info_type == "flights":
			global_mashup['cheapest_flight'] = f[-1]
			global_mashup['all_flights'] = f[0:-2]
		elif info_type =="hotels":
			# Put the response body content stringXML into the data store
			put_datastore_by_destination(destination, result.content)
			global_mashup['hotels'] = f
			#logging.info(f)
		elif info_type == "city-break":
			global_mashup['city_break'] = f[0]
		path = os.path.join(os.path.dirname(__file__),'templates/version2/includes/experience-'+info_type+'.html')
		response.out.write(template.render(path, global_mashup))
	elif result.status_code == 400:
		logging.info("RPC response ERROR code: 400")
		path = os.path.join(os.path.dirname(__file__),'templates/version2/includes/no-results.html')
		response.out.write(template.render(path, global_mashup)) 
		
""" Use with Live Kapow Service - Handle an RPC result instance, for Flights """
def handle_result_ajax_v3(rpc, destination, price, info_type, response):
	result = rpc.get_result()
	if result.status_code == 200:
		logging.info("RPC response SUCCESS code: 200")
		f = parseXMLLive(result.content.replace('|', ''))
		#logging.info(f)
		if info_type == "flights":
			global_mashup['cheapest_flight'] = f[-1]
			global_mashup['all_flights'] = f[0:-2]
		elif info_type =="hotels":
			# Put the response body content stringXML into the data store
			#put_datastore_by_destination(destination, f)
			put_hotels_by_destination(destination,f)
			bookingData = get_hotel_booking_form_data(destination)
			bookingData['city'] = destination
			if hotel_booking_dest_names.has_key(destination):
				bookingData['dest'] = hotel_booking_dest_names[destination]
			
			hotelsData = get_hotels_by_destination_and_price(destination, price)
			if hotelsData.get() is not None:
				logging.info("Retrieving from datastore")
				hotelsList = list()
				for hotel in hotelsData:
					hotel.bookingData = bookingData
					hotelsList.append(hotel)

				replaced = memcache.replace(destination,hotelsList)
				
				if replaced is False:
					memcache.add(destination,hotelsList)     
					
				global_mashup['hotels'] = hotelsList
		elif info_type == "city-break":
			global_mashup['city_break'] = f[0]
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/'+info_type+'.html')
		logging.info("Writing template fragment")
		response.out.write(template.render(path, global_mashup))
	elif result.status_code == 400:
		logging.info("RPC response ERROR code: 400")
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/no-results.html')
		response.out.write(template.render(path, global_mashup))		

def handle_result_mashup(rpc, destination, info_type, response):
	result = rpc.get_result()
	if result.status_code == 200:
		logging.info("RPC MASHUP response SUCCESS code: 200")
		f = parseXMLLive(result.content)
		if info_type == "flights":
			global_mashup['cheapest_flight'] = f[-1]
			global_mashup['all_flights'] = f[0:-2]
		elif info_type =="hotels":
			global_mashup['hotels'] = f
		elif info_type == "city-break":
			global_mashup['city_break'] = f[0]
		return global_mashup
	elif result.status_code == 400:
		logging.info("RPC MASHUP response ERROR code: 400")
		return global_mashup
			
""" Use with Live Kapow Service - Use a helper function to define the scope of the callback, for Ajax Request Handler """
def create_callback_ajax(rpc, destination, info_type, response):
	return lambda: handle_result_ajax(rpc, destination, info_type, response)		

""" Use with Live Kapow Service - Use a helper function to define the scope of the callback, for Ajax Request Handler """
def create_callback_ajax_v3(rpc, destination, price, info_type, response):
	return lambda: handle_result_ajax_v3(rpc, destination, price, info_type, response)		


""" Use with Live Kapow Service - Use a helper function to define the scope of the callback, for Mashup Request Handler """
def create_callback_mashup(rpc, destination, info_type, response):
	try:
		return lambda: handle_result_mashup(rpc, destination, info_type, response)		
	except urlfetch.DownloadError:
		logging.info("DeadlineExceededError")

def get_citybreak(destination):
	#http://46.137.188.35:8080/kws/jaxrs/execute/DefaultProject/LM-city-breaks.robot?r.object=last_minute_city_breaks_destination&destination=paris&r.url=http%3A%2F%2Flocalhost%3A50080&r.username=roboserver&r.password=345khrglkjhdfv
	cityBreakURL = "http://46.137.188.35:8080/kws/jaxrs/execute/DefaultProject/LM-city-breaks.robot?"	
	cityBreakArgs = dict()
	cityBreakArgs['r.object'] = config_properties.get('Flights', 'city_break_service_v2_r_object')
	cityBreakArgs['destination'] = destination
	cityBreakArgs['r.url'] = config_properties.get('Kapow', 'kapow_r_url')
	cityBreakArgs['r.username'] = config_properties.get('Kapow', 'kapow_r_username')
	cityBreakArgs['r.password'] = config_properties.get('Kapow', 'kapow_r_password')
	cityBreakArgsEncoded = urllib.urlencode(cityBreakArgs)
	cityBreakURL += cityBreakArgsEncoded
	return cityBreakURL 

def get_flights(destination):
	flightURL = "http://46.137.188.35:8080/kws/jaxrs/execute/DefaultProject/LM-flights.robot?"
	flightArgs = dict()
	flightArgs['r.object'] = config_properties.get('Flights', 'flights_service_v2_r_object')
	flightArgs['flightDestination'] = destination
	flightArgs['r.url'] = config_properties.get('Kapow', 'kapow_r_url')
	flightArgs['r.username'] = config_properties.get('Kapow', 'kapow_r_username')
	flightArgs['r.password'] = config_properties.get('Kapow', 'kapow_r_password')
	flightArgsEncoded = urllib.urlencode(flightArgs)
	flightURL += flightArgsEncoded
	return flightURL

def get_hotels(destination):
	hotelsURL = config_properties.get('Hotels', 'hotels_service_v1_url')
	hotelsArgs = dict()
	hotelsArgs['r.object'] = config_properties.get('Hotels', 'hotels_service_v1_r_object')
	hotelsArgs[config_properties.get('Hotels', 'hotels_service_v1_data')] = destination
	hotelsArgs['r.url'] = config_properties.get('Kapow', 'kapow_r_url')
	hotelsArgs['r.username'] = config_properties.get('Kapow', 'kapow_r_username')
	hotelsArgs['r.password'] = config_properties.get('Kapow', 'kapow_r_password')
	hotelsArgsEncoded = urllib.urlencode(hotelsArgs)
	hotelsURL += hotelsArgsEncoded
	return hotelsURL

def get_weather(destination):
	global_mashup['weather'] = feeds['yahoo']+'select%20*%20from%20weather.forecast%20where%20location%20in%20(select%20id%20from%20weather.search%20where%20query%3D%22'+global_mashup['name']+'%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'
	return global_mashup

def get_guardian(destination):
	global_mashup['news'] = feeds['guardian']+destination
	return global_mashup
	
""" Use with Live Kapow Service - Asynchronous mutliple RPC Requests """
def kapowAPILiveRPC(destination, info_type, response):
	url = None
	if info_type == "flights":
		url = get_flights(destination)
	if info_type == "hotels":
	    url = get_hotels(destination)
	if info_type == "city-break":
	    url = get_citybreak(destination)
	rpc = urlfetch.create_rpc(1000)
	rpc.callback = create_callback_ajax(rpc, destination, info_type, response)
	urlfetch.make_fetch_call(rpc, url, "GET")
	rpc.wait()

""" Use with Live Kapow Service - Asynchronous mutliple RPC Requests """
def kapowAPILiveRPC_v3(destination, price, info_type, response):
	url = None
	if info_type == "flights":
		url = get_flights(destination)
	if info_type == "hotels":
	    url = get_hotels(destination)
	if info_type == "city-break":
	    url = get_citybreak(destination)
	rpc = urlfetch.create_rpc(1000)
	rpc.callback = create_callback_ajax_v3(rpc, destination, price, info_type, response)
	urlfetch.make_fetch_call(rpc, url, "GET")
	rpc.wait()

""" Use with Live Kapow Service - Asynchronous mutliple RPC Requests """
def kapowAPILiveRPCAllData(destination, response):

	urls = []
	rpcs = []

	cityBreak = dict()
	cityBreak['data'] = get_citybreak(destination)
	cityBreak['info_type'] = 'city-break'
	cityBreak['destination'] = destination
	cityBreak['response'] = response 

	hotels = dict()
	hotels['data'] = get_hotels(destination)
	hotels['info_type'] = 'hotels'
	hotels['destination'] = destination
	hotels['response'] = response

	flights = dict()
	flights['data'] = get_flights(destination)
	flights['info_type'] = 'flights'
	flights['destination'] = destination
	flights['response'] = response

	urls = [cityBreak, hotels, flights]
	for url in urls:
	    rpc = urlfetch.create_rpc(600)
	    rpc.callback = create_callback_mashup(rpc, url['destination'], url['info_type'], url['response'])
	    urlfetch.make_fetch_call(rpc, url['data'])
	    rpcs.append(rpc)
	# Finish all RPCs, and let callbacks process the results.
	for rpc in rpcs:
	    rpc.wait() 
	


"""
def getXML(request):
	return kapowAPI(request).read()
"""	
"""	
def getJSON(request):
	return json.dumps(parseXML(request))
"""	

def parseXML(request):
    results = []
    tree = et.parse(kapowAPI(request))
    for items in all(tree, 'object'):
        i = {}
        for item in all(items, 'attribute'):
            text = item.text
            name = item.attrib.get('name')
            i[name] = text

        results.append(i)
    return results

""" Use with Live Kapow Service """
def parseXMLLive(xmlStringContent):
	results = [] 
	tree = et.XML(xmlStringContent)
	for items in all(tree, 'object'):
		i = {}
		for item in all(items, 'attribute'):
			text = item.text      
			name = item.attrib.get('name')
			i[name] = text
		if i.has_key('Address'):
			if i['Address'] is not None:
				results.append(i)
		else:
			results.append(i)
	return results
	
def split_path(path):
    p = re.compile('\W+')
    return p.split(path)

def all(element, nodename):
    path = './/%s' % nodename
    result = element.findall(path)
    return result

"""	
def getDestination(destination, responseType):
	feed = None
	out = None
	if destination == 'newyork':
		feed = ny_hotels_feed
	if feed is not None:
		if responseType == 'xml':
   			out = getXML(feed)
		elif responseType == 'json':
			out = getJSON(feed)
        if out is not None:
			return out
"""				
class RestAPI(webapp.RequestHandler):
    def get(self, destination, responseType):
        result = getDestination(destination, responseType)
        if result is not None:
			self.response.out.write(result)

class Mashup(webapp.RequestHandler):
    def get(self, destination):
		""" 
		NOTE: kapowAPILiveRPCAllData() will return None, because separate callbacks are populating global_mashup[obj]
		so, we only need to wait for a response, before writing the template out with global_mashup as the data object
		"""
		global_mashup['name'] = destination
		if destination_display_names.has_key(destination):
			global_mashup['name'] = destination_display_names[destination]
		mashup = kapowAPILiveRPCAllData(destination, self.response)
		get_weather(destination)
		get_guardian(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/mashup.html')
		self.response.out.write(template.render(path, global_mashup))

class HomeHandler(webapp.RequestHandler):
    def get(self):
		path = os.path.join(os.path.dirname(__file__),'templates/mashup.html')
		self.response.out.write(template.render(path, {}))		

class ExperienceHandler(webapp.RequestHandler):
	def get(self):
		destination = self.request.get("destination")
		price = self.request.get("priceMax")
		if len(price) > 0:
			price = float(price)
			
		destinationDisplayName = destination 
		bookmarks = self.request.get("bookmarks").split(',')
		maptype = self.request.get("maptype") 
		contenttype = self.request.get("contenttype")
		if destination_display_names.has_key(destination):
			destinationDisplayName = destination_display_names[destination]
		
		#facebookAppId = config_properties.get('Facebook', 'app_id')
		facebookAppId = ""
		args = dict(destinationDisplayName=destinationDisplayName, price=price, destination=destination, bookmarks=bookmarks, maptype=maptype, contenttype=contenttype, facebookAppId=facebookAppId)
		path = os.path.join(os.path.dirname(__file__),'templates/version3/experience.html')		
		self.response.out.write(template.render(path, args))
	def post(self):
		destination = self.request.POST.get("destination")
		
	
class AjaxAPIHandler_v2(webapp.RequestHandler):
  def get(self):		
	self.response.error = 500
	return True
  def post(self):
	destination = self.request.POST.get("destination")
	
	global_mashup['name'] = destination
	destination = re.sub(r'(<|>|\s)', '', destination)
	destination = destination.lower()
	logging.info(destination)
	info_type = self.request.POST.get("info_type")
	info_type = info_type.replace(' ', '').lower()
    
	"""
	If the Destination provided matches a nice display name we have stored locally, then use this.
	WARNING: Otherwise the Destination will be set to whatever the User provided!
	"""
	if destination_display_names.has_key(destination):
		global_mashup['name'] = destination_display_names[destination]
    
	if info_type == "weather":
		get_weather(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/version2/includes/experience-weather.html')
		self.response.out.write(template.render(path, global_mashup))
	elif info_type == "guardian":
		get_guardian(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/version2/includes/experience-guardian.html')
		self.response.out.write(template.render(path, global_mashup))		   	
	else:
		mashup = kapowAPILiveRPC(destination, info_type, self.response)
		"""
		q = DBCityDestination.all()
		q.filter("destination =", destination)
		#dbLookup = db.GqlQuery("SELECT * FROM DBCityDestination ORDER BY timestamp ASC")
		#logging.info(dbLookup)                                                                                              
		results = q.get()  
		logging.info(results)
		"""
	return True


class AjaxAPIHandler_v3(webapp.RequestHandler):
  def get(self):		
	self.response.error = 500
	return True
  def post(self):
	destination = self.request.POST.get("destination")
	price = self.request.POST.get("priceMax")
	if price is not None and len(price) > 0:
		price = float(price)
    
    
	global_mashup['price'] = price
	#logging.info(price)
	global_mashup['name'] = destination
	destination = re.sub(r'(<|>|\s)', '', destination)
	destination = destination.lower()
	global_mashup['destination'] = destination
	info_type = self.request.POST.get("info_type")
	info_type = info_type.replace(' ', '').lower()

	"""
	If the Destination provided matches a nice display name we have stored locally, then use this.
	WARNING: Otherwise the Destination will be set to whatever the User provided!
	"""
	if destination_display_names.has_key(destination):
		global_mashup['name'] = destination_display_names[destination]

	if info_type == "weather":
		get_weather(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/weather.html')
		self.response.out.write(template.render(path, global_mashup))
	elif info_type == "guardian":
		get_guardian(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/guardian.html')
		self.response.out.write(template.render(path, global_mashup))		   	
	else:		
		"""
		hotels = memcache.get(destination)
		if hotels is not None: 
			logging.info("Got hotels from memcache") 
			#logging.info(hotels)
			global_mashup['hotels'] = hotels
			path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/hotels.html')
			self.response.out.write(template.render(path, global_mashup))
		else:        
		"""
		if destination == "cheap":
			hotelsData = get_hotels_order_by_price_cheapest()
		elif destination == "expensive":
			hotelsData = get_hotels_order_by_price_expensive()		
		else:
			#hotelsData = get_hotels_by_destination(destination)
		    hotelsData = get_hotels_by_destination_and_price(destination, price)
		
		bookingData = get_hotel_booking_form_data(destination)
		bookingData['city'] = destination
		if hotel_booking_dest_names.has_key(destination):
			bookingData['dest'] = hotel_booking_dest_names[destination]
						
		if hotelsData.get() is not None:
			logging.info("Retrieving from datastore")
			hotelsList = list()
			for hotel in hotelsData:
				hotel.bookingData = bookingData
				hotelsList.append(hotel)

			replaced = memcache.replace(destination,hotelsList)
			
			if replaced is False:
				memcache.add(destination,hotelsList)     
				
			global_mashup['hotels'] = hotelsList
			path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/'+info_type+'.html')
			self.response.out.write(template.render(path, global_mashup))
		else:
			logging.info("NOT Got hotels from memcache or datastore")
			mashup = kapowAPILiveRPC_v3(destination, price, info_type, self.response)
   	
	return True

class GooglePlacesHandler(webapp.RequestHandler):
	def get(self):
		
		placesURL = "https://maps.googleapis.com/maps/api/place/search/json?%s"
		
		types = self.request.get('types')
		radius = self.request.get('radius')
		
		urlArgs = dict()
		urlArgs['location'] = self.request.get('location')
		urlArgs['radius'] = radius
		urlArgs['types'] = types
		urlArgs['name'] = self.request.get('name')
		urlArgs['key'] = config_properties.get('Google', 'places_api_key')
		urlArgs['sensor'] = config_properties.get('Google', 'places_sensor')
		
		urlAgrsEncoded = urllib.urlencode(urlArgs)
		
		locationid = self.request.get('locationid')
		
		placesData = get_places_by_hotellocationid_types_radius(locationid, types, radius)
		if placesData.get() is not None:
			logging.info("Retrieving PLACES from datastore")
			jsonResponse = None
			for data in placesData:				
				jsonResponse = data.places
			self.response.out.write(jsonResponse)
		else:
			logging.info("REQUESTING PLACES from Google")   	
			try:
				result = urllib.urlopen(placesURL % urlAgrsEncoded)
				jsonResponse = result.read()
				put_places_by_hotellocationid_and_types(locationid, types, jsonResponse, radius)
				self.response.out.write(jsonResponse)
			except urllib2.URLError, e:
				logging.info("GooglePlacesHandler : urllib2 error") 
	def post(self):		
		logging.info(self.request.POST.get("hotelname")) 
		logging.info(self.request.POST.get("types"))
		logging.info(self.request.POST.get("places"))
		put_places_by_hotel_and_types(self.request.POST.get("hotelname"), self.request.POST.get("types"), self.request.POST.get("places"))

class GeoCodeHandler(webapp.RequestHandler):
	def post(self):
		result = put_latlng_by_hotel_locationid_and_destination(self.request.POST.get("locationid"), self.request.POST.get("destination"), self.request.POST.get("lat"), self.request.POST.get("lng"))
		return result
				
# Tiny URL API
#http://tinyurl.com/api-create.php?url=http://scripting.com/ 		

application = webapp.WSGIApplication([
		(requestExperience, ExperienceHandler),
		(requestHome, HomeHandler),
		(requestAjaxAPI, AjaxAPIHandler_v3),
		(requestGooglePlaces, GooglePlacesHandler),
		(requestGeoCode, GeoCodeHandler),
		(requestDestination, ExperienceHandler)		
    ],debug=True)

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.DEBUG)
    run_wsgi_app(application)