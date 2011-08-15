from google.appengine.api import memcache
from ConfigParser import ConfigParser 


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