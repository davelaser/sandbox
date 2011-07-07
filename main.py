#!/usr/bin/env python
from google.appengine.dist import use_library
use_library('django', '0.96')
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

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
                  
requestHome = "/"
requestRestApi = r"/(.*)/(xml|json)"
requestDestination = r"/(.*)"
requestAjaxAPI = "/ajax"

feeds = {
    'bbc'      : 'http://news.bbc.co.uk/weather/forecast/',
    'guardian' : 'http://content.guardianapis.com/search?format=json&use-date=last-modified&show-fields=headline,trailText&ids=',
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

def kapowAPI(request):
	return codecs.open(os.path.join(os.path.dirname(__file__), request))


""" Use with Live Kapow Service - Handle an RPC result instance, for Flights """
def handle_result_ajax(rpc, destination, info_type, response):
	result = rpc.get_result()
	if result.status_code == 200:
		logging.info("RPC response SUCCESS code: 200")
		f = parseXMLLive(result.content)
		if info_type == "flights":
			global_mashup['cheapest_flight'] = f[-1]
			global_mashup['all_flights'] = f[0:-2]
		elif info_type =="hotels":
			global_mashup['hotels'] = f
		elif info_type == "city-break":
			global_mashup['city_break'] = f[0]
		path = os.path.join(os.path.dirname(__file__),'templates/'+info_type+'.html')
		response.out.write(template.render(path, global_mashup))
	elif result.status_code == 400:
		logging.info("RPC response ERROR code: 400")
		path = os.path.join(os.path.dirname(__file__),'templates/no-results.html')
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
	cityBreakArgs['r.object'] = 'last_minute_city_breaks_destination'
	cityBreakArgs['destination'] = destination
	cityBreakArgs['r.url'] = 'http://localhost:50080'
	cityBreakArgs['r.username'] = 'roboserver'
	cityBreakArgs['r.password'] = '345khrglkjhdfv'
	cityBreakArgsEncoded = urllib.urlencode(cityBreakArgs)
	cityBreakURL += cityBreakArgsEncoded
	return cityBreakURL 

def get_flights(destination):
	flightURL = "http://46.137.188.35:8080/kws/jaxrs/execute/DefaultProject/LM-flights.robot?"
	flightArgs = dict()
	flightArgs['r.object'] = 'lm_flight_destination'
	flightArgs['flightDestination'] = destination
	flightArgs['r.url'] = 'http://localhost:50080'
	flightArgs['r.username'] = 'roboserver'
	flightArgs['r.password'] = '345khrglkjhdfv'
	flightArgsEncoded = urllib.urlencode(flightArgs)
	flightURL += flightArgsEncoded
	return flightURL

def get_hotels(destination):
	hotelsURL = "http://46.137.188.35:8080/kws/jaxrs/execute/DefaultProject/LM-hotels.robot?"
	hotelsArgs = dict()
	hotelsArgs['r.object'] = 'last_minute_hotel_city_desination'
	hotelsArgs['city'] = destination
	hotelsArgs['r.url'] = 'http://localhost:50080'
	hotelsArgs['r.username'] = 'roboserver'
	hotelsArgs['r.password'] = '345khrglkjhdfv'
	hotelsArgsEncoded = urllib.urlencode(hotelsArgs)
	hotelsURL += hotelsArgsEncoded
	return hotelsURL

def get_information(destination):
	global_mashup['news'] = feeds['guardian']+'travel/'+destination
	global_mashup['weather'] = feeds['yahoo']+'select%20*%20from%20weather.forecast%20where%20location%20in%20(select%20id%20from%20weather.search%20where%20query%3D%22'+global_mashup['name']+'%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'
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
	rpc = urlfetch.create_rpc(60)
	rpc.callback = create_callback_ajax(rpc, destination, info_type, response)
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
	    rpc = urlfetch.create_rpc(60)
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
		get_information(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/mashup.html')
		self.response.out.write(template.render(path, global_mashup))

class HomeHandler(webapp.RequestHandler):
    def get(self):
		path = os.path.join(os.path.dirname(__file__),'templates/mashup.html')
		self.response.out.write(template.render(path, {}))		

class AjaxAPIHandler(webapp.RequestHandler):
  def get(self):		
	self.response.error = 500
  def post(self):
	 
	destination = self.request.POST.get("destination")
	global_mashup['name'] = destination
	#destination = destination.replace(' ', '').lower()
	destination = re.sub(r'(<|>|\s)', '', destination)
	destination = destination.lower()
	logging.info(destination)
	info_type = self.request.POST.get("info_type")
	info_type = info_type.replace(' ', '').lower()
	
	"""
	Manually set the destination Weather and Guardian feed data 
	"""
	if destination_display_names.has_key(destination):
		global_mashup['name'] = destination_display_names[destination]
    
	if info_type == "info":
		get_information(destination)
		path = os.path.join(os.path.dirname(__file__),'templates/info.html')
		self.response.out.write(template.render(path, global_mashup))
	else:
		mashup = kapowAPILiveRPC(destination, info_type, self.response)
	return True


application = webapp.WSGIApplication([
		(requestHome, HomeHandler),
		(requestAjaxAPI, AjaxAPIHandler),
			(requestDestination, Mashup)		
    ],debug=True)

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.DEBUG)
    run_wsgi_app(application)
