import os
import re
import urllib
import urllib2
import logging
import datetime
from django.utils import simplejson as json
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext import deferred
from google.appengine.api import taskqueue
from google.appengine.ext import db
from google.appengine.api import memcache
from operator import itemgetter
from google.appengine.runtime import DeadlineExceededError
from google.appengine.runtime import apiproxy_errors

"""
Import local scripts
"""

import configparsers

def geonames_credentials():
	"""
		Return the Geonames username for any Geonames webservice requests
	"""
	config_properties = configparsers.loadPropertyFile('geonames')
	if config_properties.has_option('Geonames', 'username'):
		return config_properties.get('Geonames', 'username')
	else:
		return None
		
def geonames_find_nearby_wikipedia(lang, lat, lng, radius, maxRows, country):
	"""
		@params:
			lang 	: 2 character shortcode for language, e.g. 'en' [String]
			lat  	: Latitude [Float]
			lng		: Longitude [Float]
			radius	: Radius in Kilometres (max = 20 Km) [Long]
			maxRows	: Maximum number of entries to return (default = 5) [Long]
			country	: Country Code to search within (default = all countries), e.g. "GB" = United Kingdom(?), "CH" = Switzerland, "DE" = Germany [String]
			
		@description:
			Use the Geonames webservice to find Wikipedia entries by LatLng and Language.
			Don't forget to url encode string parameters containing special characters or spaces.
		
		@example:
			Webservice URI: http://api.geonames.org/findNearbyWikipedia?lang=en&&radius=10&lat=47&lng=9&country=England&username=USERNAME
	"""
	try:
		config_properties = configparsers.loadPropertyFile('geonames')
		
		urlArgs = dict()
		urlArgs['lang'] = str(lang)
		urlArgs['lat'] = float(str(lat))
		urlArgs['lng'] = float(str(lng))
		urlArgs['radius'] = long(str(radius))
		urlArgs['maxRows'] = long(str(maxRows))
		urlArgs['country'] = str(country).upper() # Force uppercase for the Country Code
		urlArgs['username'] = geonames_credentials()
		
		# URL Encode the request arguments
		urlAgrsEncoded = urllib.urlencode(urlArgs)
	
		# Check we have the webservice endpoint available
		if config_properties.has_option('Geonames', 'webservice_url'):
			geonamesServiceURL = config_properties.get('Geonames', 'webservice_url')
			response = urllib.urlopen(""+geonamesServiceURL+'findNearbyWikipediaJSON?'+"%s" % urlAgrsEncoded)
			geonamesJSON = response.read()
			logging.debug(geonamesJSON)
			return geonamesJSON
		else:
			raise e
	except (Exception), e:
		raise e
	
