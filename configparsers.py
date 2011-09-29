import logging
from google.appengine.api import memcache
from ConfigParser import ConfigParser 


def loadPropertyFile(fileName):
	propertyFile = memcache.get(fileName+'.properties', namespace='global')
	if propertyFile is not None:
		logging.debug('Got '+str(fileName)+' properties from memcache')
		return propertyFile
	else:
		logging.debug('NOT Got '+str(fileName)+' properties from memcache')
		propertyFilePath = 'properties/'+fileName+'.properties'
		propertyFile = ConfigParser()
		propertyFile.read(propertyFilePath)
		memcache.set(fileName+'.properties', propertyFile, namespace='global')
		return propertyFile