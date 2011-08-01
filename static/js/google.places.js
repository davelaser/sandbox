RIA.GooglePlaces = new Class({
	Implements:[Options],
	options:{
		places:{
			searchRadius:500,
			serviceURL:"/places",
			/*
			accounting
			airport
			amusement_park
			aquarium
			art_gallery
			atm
			bakery
			bank
			bar
			beauty_salon
			bicycle_store
			book_store
			bowling_alley
			bus_station
			cafe
			campground
			car_dealer
			car_rental
			car_repair
			car_wash
			casino
			cemetery
			church
			city_hall
			clothing_store
			convenience_store
			courthouse
			dentist
			department_store
			doctor
			electrician
			electronics_store
			embassy
			establishment
			finance
			fire_station
			florist
			food
			funeral_home
			furniture_store
			gas_station
			general_contractor
			geocode
			grocery_or_supermarket
			gym
			hair_care
			hardware_store
			health
			hindu_temple
			home_goods_store
			hospital
			insurance_agency
			jewelry_store
			laundry
			lawyer
			library
			liquor_store
			local_government_office
			locksmith
			lodging
			meal_delivery
			meal_takeaway
			mosque
			movie_rental
			movie_theater
			moving_company
			museum
			night_club
			painter
			park
			parking
			pet_store
			pharmacy
			physiotherapist
			place_of_worship
			plumber
			police
			post_office
			real_estate_agency
			restaurant
			roofing_contractor
			rv_park
			school
			shoe_store
			shopping_mall
			spa
			stadium
			storage
			store
			subway_station
			synagogue
			taxi_stand
			train_station
			travel_agency
			university
			veterinary_care
			zoo
			
			The following table lists types supported by the Places API when sending Place Search requests. These types cannot be used when adding a new Place.
			
			administrative_area_level_1
			administrative_area_level_2
			administrative_area_level_3
			colloquial_area
			country
			floor
			intersection
			locality
			natural_feature
			neighborhood
			political
			point_of_interest
			post_box
			postal_code
			postal_code_prefix
			postal_town
			premise
			room
			route
			street_address
			street_number
			sublocality
			sublocality_level_4
			sublocality_level_5
			sublocality_level_3
			sublocality_level_2
			sublocality_level_1
			subpremise
			transit_station
			*/
			//placesTypes:'food|establishment|restaurant|bakery|cafe|point_of_interest|shoe_store|train_station|subway_station|meal_takeaway'
			placesTypes:'car_rental'
		}		
	},
	requestPlaces: function(locationLatLng, radiusInMeters, types, name) { 
		if(!this.hotelCollection[this.hotelIndex].places || !this.hotelCollection[this.hotelIndex].places[types]) {
			this.requestCityBreak = new Request.JSON({
				method:"GET",
				secure:true,
				url:this.options.places.serviceURL,
				onRequest: this.jsonRequestStart.bind(this),
				onSuccess: function(responseJSON, responseText) {
					this.jsonRequestSuccess(responseJSON, responseText, types)
				}.bind(this),
				onError: this.jsonRequestFailure.bind(this)
			}).send("location="+locationLatLng.lat()+","+locationLatLng.lng()+"&radius="+radiusInMeters+"&types="+types);
        } else {
	        this.setPlacesMarkers(types);
		}
	},
	jsonRequestStart: function() {
		//Log.info("JSON request underway");
	},
	jsonRequestSuccess: function(responseJSON, responseText, types) {
		//Log.info("JSON request success");
		if(responseJSON.status == "OK" && responseJSON.results.length > 0) {
			if(typeof(this.hotelCollection[this.hotelIndex].places) == "undefined") {
				this.hotelCollection[this.hotelIndex].places = new Object();
			}
			this.hotelCollection[this.hotelIndex].places[types] = responseJSON;
			
			//RIA.places[types] = responseJSON;
			this.setPlacesMarkers(types);
		} else {
			Log.error({method:"RIA.GooglePlaces : jsonRequestSuccess", error:{message:"JSON Response error"}})
		}
	},
	setPlacesMarkers: function(types) {
		/*
		Object.each(RIA.places[types].results, function(place) {
			this.addPlacesMarker(place);
		},this);
		*/
		Object.each(this.hotelCollection[this.hotelIndex].places[types].results, function(place) {
			this.addPlacesMarker(place);
		},this);
		
	},
	jsonRequestFailure: function(text, error) {
		Log.info("JSON request failure");
		Log.info(text);
		Log.info(error);
	},
	addPlacesMarker: function(place) {
		/*
		*	@description:
		*		Sets a Marker for a Place. Not solicited by the User
		*	@arguments:
		*		place[Object](returned from a Places API request)
		*		latLng[Object(LatLng)]
		*/ 
		
		var mapIcon; 

		if(place.types.length > 0 && RIA.MarkerIcons[place.types[0]]) {
			mapIcon = new google.maps.MarkerImage(RIA.MarkerIcons[place.types[0]]);
		} else {
			mapIcon = new google.maps.MarkerImage(RIA.MarkerIcons.star);
		}
        
		var panoIcon = new google.maps.MarkerImage(place.icon),
		latLng = new google.maps.LatLng(place.geometry.location.lat, place.geometry.location.lng);
		 
		
		place.placesMarker = new google.maps.Marker({
            map:RIA.map,
			icon:mapIcon,
			position: latLng,
			draggable:false,
			title:place.name,
			animation:google.maps.Animation.DROP,
			cursor:'pointer',
			clickable:true,
			zIndex:1
        }); 
        
		place.placesMarkerSV = new google.maps.Marker({
            map:RIA.panorama,
			icon:panoIcon,
			position: latLng,
			draggable:false,
			title:place.name,
			animation:google.maps.Animation.DROP,
			clickable:true,
			zIndex:1
        });
        
		place.clickEvent = google.maps.event.addListener(place.placesMarker, 'click', function(event) {
			this.setCurrentLocation(event.latLng);
			this.setPanoramaPosition(event.latLng);
		}.bind(this));
		
		this.createPlacesInfoWindow(place, place.placesMarker);
		this.createPlacesInfoWindow(place, place.placesMarkerSV);
		
	},
	removeAllPlacesMarkers: function() {

		Object.each(this.hotelCollection[this.hotelIndex].places, function(type) {
			Object.each(type.results, function(place) {
				this.removePlacesMarker(place);
			},this);			
		},this);
		
	},
	removePlacesMarkers: function(type) {

		if(type && this.hotelCollection[this.hotelIndex].places[type]) {
			Object.each(this.hotelCollection[this.hotelIndex].places[type].results, function(place) {
				this.removePlacesMarker(place);
			},this);
		}
		
	}, 
	removePlacesMarker: function(place) {
		if(place) { 
			place.placesMarker.setMap(null);
			place.placesMarkerSV.setMap(null);
		}
	},
	createPlacesInfoWindow: function(place, marker) {
		marker.infowindow = new google.maps.InfoWindow({        
			content: place.name+"<br/>"+place.vicinity+"<br/>("+place.types[0]+")",
			maxWidth:50
		});
       
		// Add mouse event listeners for the Marker
		marker.mouseoutEvent = null;
		marker.mouseoverEvent = google.maps.event.addListener(marker, 'mouseover', function(event) {
		    this.openInfoWindow(marker, marker.infowindow);  
			marker.mouseoutEvent = google.maps.event.addListener(marker, 'mouseout', function(event) {
			    marker.infowindow.close(); 
				google.maps.event.removeListener(marker.mouseoutEvent); 
			}.bind(this));
		}.bind(this)); 
		marker.clickEvent = google.maps.event.addListener(marker, 'click', function(event) {
			this.setCurrentLocation(event.latLng);
			google.maps.event.removeListener(marker.mouseoutEvent);
			this.setPanoramaPosition(event.latLng);
			this.openInfoWindow(marker, marker.infowindow);
		}.bind(this));
	},
	resetPlacesMarkers: function(reset) {
		this.removeAllPlacesMarkers();
		if(reset) {
			this.hotelCollection[this.hotelIndex].places = new Object();
		}
		document.getElements("#places input[type=checkbox]").each(function(input) {
			if(input.checked && input.get("value") != "") {
				this.requestPlaces(RIA.currentLocation, this.options.places.searchRadius, input.get("value"), null);
			}				
		},this)
	}   
});