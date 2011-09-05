from google.appengine.ext import db

"""
lastminute.com Hotel Definition
"""
class LMHotel(db.Model):
	timestamp = db.DateTimeProperty(auto_now_add=True)
	locationid = db.StringProperty()
	propertyids = db.StringProperty(indexed=False)
	name = db.StringProperty(indexed=False)
	address = db.PostalAddressProperty(indexed=False)
	category = db.CategoryProperty()
	latlng = db.GeoPtProperty(indexed=False)
	index = db.IntegerProperty()
	productdetailsurl = db.StringProperty(indexed=False)
	rating = db.FloatProperty()
	hotelrequestid = db.StringProperty(indexed=False)
	destination = db.StringProperty()
	countryname = db.StringProperty(indexed=False)
	countrycode = db.StringProperty()
	description = db.StringProperty(indexed=False)
	
class LMHotelPriceAndDate(db.Model):
	created = db.DateTimeProperty(auto_now_add=True)
	hotel = db.ReferenceProperty(LMHotel)
	destination = db.StringProperty()
	price = db.FloatProperty()
	startdate = db.DateTimeProperty()
	enddate = db.DateTimeProperty()
	
class DBPlace(db.Model):                            
	created = db.DateTimeProperty(auto_now_add=True)
	hotel = db.ReferenceProperty(LMHotel)
	locationid = db.StringProperty()
	types = db.StringProperty()
	places = db.TextProperty()
	radius = db.IntegerProperty()    

"""
lastminute.com Hotel Definition
"""
class EANHotel(db.Model):
	timestamp = db.DateTimeProperty(auto_now_add=True)
	name = db.PostalAddressProperty(indexed=False)
	address1 = db.PostalAddressProperty(indexed=False)
	postalcode = db.PostalAddressProperty(indexed=False)
	stateprovincecode = db.PostalAddressProperty(indexed=False)
	countrycode = db.PostalAddressProperty()
	propertycategory = db.StringProperty(indexed=False)
	shortdescription = db.StringProperty(indexed=False)
	locationdescription = db.StringProperty(indexed=False)
	suppliertype = db.StringProperty(indexed=False)
	mainimageurl = db.StringProperty(indexed=False)
	thumbnailurl = db.StringProperty(indexed=False)
	hotelrating = db.FloatProperty()
	hotelid = db.IntegerProperty()
	airportcode = db.StringProperty(indexed=False)
	proximitydistance = db.FloatProperty(indexed=False)
	proximityunit = db.StringProperty(indexed=False)
	latlng = db.GeoPtProperty(indexed=False)
	deeplink = db.StringProperty(indexed=False)
	
	
	