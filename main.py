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

requestExperience = "/experience"                  
requestHome = "/"
requestRestApi = r"/(.*)/(xml|json)"
requestDestination = r"/(.*)"
requestAjaxAPI = "/ajax"
requestGooglePlaces = "/places"

# TODO: remove the memcache flush
memcache.flush_all()
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
	'edinburgh':'Edinburgh'
}


def loadConfigProperties():
	configProperties = memcache.get("config.properties")
	if configProperties is not None:
		logging.info("Got configProperties from memcache")
		return configProperties
	else:
		logging.info("NOT Got configProperties from memcache")
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
	hotels = db.TextProperty(required=True)
	
"""
Get destination content to the datastore
"""
def get_datastore_by_destination(destination):
	return False
	
"""
Write to datastore by destination
"""	                             
def put_datastore_by_destination(destination, data):
	dbDestination = DBCityDestination(name = destination, hotels = data)
	dbDestination.put()
	
	
def kapowAPI(request):
	return codecs.open(os.path.join(os.path.dirname(__file__), request))


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
			logging.info(f)
		elif info_type == "city-break":
			global_mashup['city_break'] = f[0]
		path = os.path.join(os.path.dirname(__file__),'templates/version2/includes/experience-'+info_type+'.html')
		response.out.write(template.render(path, global_mashup))
	elif result.status_code == 400:
		logging.info("RPC response ERROR code: 400")
		path = os.path.join(os.path.dirname(__file__),'templates/version2/includes/no-results.html')
		response.out.write(template.render(path, global_mashup)) 
		
""" Use with Live Kapow Service - Handle an RPC result instance, for Flights """
def handle_result_ajax_v3(rpc, destination, info_type, response):
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
			memcache.add(destination,f)
			global_mashup['hotels'] = f
			logging.info(f)
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
def create_callback_ajax_v3(rpc, destination, info_type, response):
	return lambda: handle_result_ajax_v3(rpc, destination, info_type, response)		


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
def kapowAPILiveRPC_v3(destination, info_type, response):
	url = None
	if info_type == "flights":
		url = get_flights(destination)
	if info_type == "hotels":
	    url = get_hotels(destination)
	if info_type == "city-break":
	    url = get_citybreak(destination)
	rpc = urlfetch.create_rpc(1000)
	rpc.callback = create_callback_ajax_v3(rpc, destination, info_type, response)
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
		results.append(i)
	return results
	
def split_path(path):
    p = re.compile('\W+')
    return p.split(path)

def all(element, nodename):
    path = './/%s' % nodename
    return element.findall(path)
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
		                                                  
		args = dict(destination=destination)
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
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/weather.html')
		self.response.out.write(template.render(path, global_mashup))
	elif info_type == "guardian":
		get_guardian(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/guardian.html')
		self.response.out.write(template.render(path, global_mashup))		   	
	else:		
		hotels = memcache.get(destination)
		if hotels is not None: 
			logging.info("Got hotels from memcache") 
			logging.info(hotels)
			global_mashup['hotels'] = hotels
			path = os.path.join(os.path.dirname(__file__),'templates/version3/includes/hotels.html')
			self.response.out.write(template.render(path, global_mashup))
		else:
			logging.info("NOT Got hotels from memcache")
			mashup = kapowAPILiveRPC_v3(destination, info_type, self.response)
		
	return True

class GooglePlacesHandler(webapp.RequestHandler):
	def get(self):
		
		placesURL = "https://maps.googleapis.com/maps/api/place/search/json?%s"
		
		urlArgs = dict()
		urlArgs['location'] = self.request.get('location')
		urlArgs['radius'] = self.request.get('radius')
		urlArgs['types'] = self.request.get('types')
		urlArgs['name'] = self.request.get('name')
		urlArgs['key'] = config_properties.get('Google', 'places_api_key')
		urlArgs['sensor'] = config_properties.get('Google', 'places_sensor')
		
		urlAgrsEncoded = urllib.urlencode(urlArgs)
		logging.info(urlAgrsEncoded)
		try:
			result = urllib.urlopen(placesURL % urlAgrsEncoded)
			jsonResponse = result.read()
			logging.info(jsonResponse)
			self.response.out.write(jsonResponse)
		except urllib2.URLError, e:
			logging.info("GooglePlacesHandler : urllib2 error")
		

application = webapp.WSGIApplication([
		(requestExperience, ExperienceHandler),
		(requestHome, HomeHandler),
		(requestAjaxAPI, AjaxAPIHandler_v3),
		(requestGooglePlaces, GooglePlacesHandler),
		(requestDestination, ExperienceHandler)		
    ],debug=True)

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.DEBUG)
    run_wsgi_app(application)