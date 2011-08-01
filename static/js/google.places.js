RIA.GooglePlaces = new Class({
	Implements:[Options],
	options:{
		places:{
			serviceURL:"/places"
		}
		
	},
	requestPlaces: function(hotel, locationLatLng, radiusInMeters, types, name) {
		this.requestCityBreak = new Request.JSON({
			method:"GET",
			secure:true,
			url:this.options.places.serviceURL,
			onRequest: this.jsonRequestStart.bind(this),
			onSuccess: function(responseJSON, responseText) {
				this.jsonRequestSuccess(responseJSON, responseText, hotel)
			}.bind(this),
			onError: this.jsonRequestFailure.bind(this)
		}).send("location="+locationLatLng.lat()+","+locationLatLng.lng()+"&radius="+radiusInMeters+"&types="+types);

	},
	jsonRequestStart: function() {
		//Log.info("JSON request underway");
	},
	jsonRequestSuccess: function(responseJSON, responseText, hotel) {
		//Log.info("JSON request success");
		Log.info(responseJSON)
		if(responseJSON.status == "OK" && responseJSON.results.length > 0) {
			this.places = responseJSON;
			Array.each(this.places.results, function(place) {
				//Log.info(place);
			},this);
		} else {
			Log.error({method:"RIA.GooglePlaces : jsonRequestSuccess", error:{message:"JSON Response error"}})
		}
	},
	jsonRequestFailure: function(text, error) {
		Log.info("JSON request failure");
		Log.info(text);
		Log.info(error);
	}   
});