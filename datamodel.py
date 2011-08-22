from google.appengine.ext import db

"""
lastminute.com Hotel Definition
"""
class LMHotel(db.Model):
	timestamp = db.DateTimeProperty(auto_now_add=True)
	locationid = db.StringProperty()
	propertyids = db.StringProperty()
	name = db.StringProperty()
	address = db.PostalAddressProperty()
	category = db.CategoryProperty()
	latlng = db.GeoPtProperty()
	index = db.IntegerProperty()
	productdetailsurl = db.StringProperty()
	rating = db.FloatProperty()
	hotelrequestid = db.StringProperty()
	destination = db.StringProperty()
	countryname = db.StringProperty()
	countrycode = db.StringProperty()
	description = db.StringProperty()
	
class LMHotelPriceAndDate(db.Model):
	hotel = db.ReferenceProperty(LMHotel)
	destination = db.StringProperty()
	price = db.FloatProperty()
	startdate = db.DateTimeProperty()
	enddate = db.DateTimeProperty()
	
class DBPlace(db.Model):
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
	locationid = db.StringProperty()
	propertyids = db.StringProperty()
	name = db.StringProperty()
	address = db.PostalAddressProperty()
	category = db.CategoryProperty()
	latlng = db.GeoPtProperty()
	index = db.IntegerProperty()
	productdetailsurl = db.StringProperty()
	rating = db.FloatProperty()
	hotelrequestid = db.StringProperty()
	destination = db.StringProperty()
	countryname = db.StringProperty()
	countrycode = db.StringProperty()
	description = db.StringProperty()