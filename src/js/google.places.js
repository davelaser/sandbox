RIA.GooglePlaces = new Class({
	Implements:[Options],
	options:{
		places:{
			searchRadius:500,
			serviceURL:"/places",
			types:{
				accounting:"Accounting",
				/*airport
				amusement_park
				aquarium*/
				art_gallery:"Art gallery",
				atm:"ATM",
				bakery:"Bakery",
				bank:"Bank",
				bar:"Bar",
				/*beauty_salon
				bicycle_store*/
				book_store:"Book store",
				/*bowling_alley*/
				bus_station:"Bus station",
				cafe:"Caf&eacute;",
				/*campground
				car_dealer*/
				car_rental:"Car rental",
				/*car_repair
				car_wash
				casino
				cemetery
				church
				city_hall*/
				clothing_store:"Clothing store",
				/*convenience_store
				courthouse
				dentist*/
				department_store:"Department store",
				/*doctor
				electrician
				electronics_store*/
				embassy:"Embassy",
				/*establishment
				finance
				fire_station
				florist*/
				food:"Restaurant",
				/*funeral_home
				furniture_store
				gas_station
				general_contractor
				geocode*/
				grocery_or_supermarket:"Grocery or Supermarket",
				/*gym
				hair_care
				hardware_store
				health
				hindu_temple
				home_goods_store*/
				hospital:"Hospital",
				/*insurance_agency
				jewelry_store
				laundry
				lawyer
				library
				liquor_store
				local_government_office
				locksmith
				lodging*/
				meal_delivery:"Meal delivery",
				meal_takeaway:"Meal takeaway",
				/*mosque
				movie_rental
				movie_theater
				moving_company*/
				museum:"Museum",
				/*night_club
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
				real_estate_agency*/
				restaurant:"Restaurant",
				/*roofing_contractor
				rv_park
				school*/
				shoe_store:"Shoe store",
				/*shopping_mall
				spa
				stadium
				storage
				store*/
				subway_station:"Subway station",
				/*synagogue*/
				taxi_stand:"Taxi rank",
				train_station:"Train station"
				/*travel_agency
				university
				veterinary_care
				zoo
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
				transit_station*/
			}
		}		
	},
	requestPlaces: function(locationLatLng, radiusInMeters, types, name) { 
		if(!this.hotelCollection[this.hotelIndex].places || !this.hotelCollection[this.hotelIndex].places[types]) {
			this.requestPlacesSearch = new Request.JSON({
				method:"GET",
				secure:true,
				url:this.options.places.serviceURL,
				onRequest: this.jsonRequestStart.bind(this),
				onSuccess: function(responseJSON, responseText) {
					this.jsonRequestSuccess(responseJSON, responseText, types)
				}.bind(this),
				onError: this.jsonRequestFailure.bind(this)
			}).send("locationid="+this.hotelCollection[this.hotelIndex].get("data-locationid")+"&hotelname="+this.hotelCollection[this.hotelIndex].get("data-name")+"&location="+locationLatLng.lat()+","+locationLatLng.lng()+"&radius="+radiusInMeters+"&types="+types);
        } else {
	        this.setPlacesMarkers(types);
		}
	},
	jsonRequestStart: function() {
		//Log.info("JSON request underway");
	},
	jsonRequestSuccess: function(responseJSON, responseText, types) {
		//Log.info("JSON request success");
		if(typeof(this.hotelCollection[this.hotelIndex].places) == "undefined") {
			this.hotelCollection[this.hotelIndex].places = new Object();
		}
		
		if(responseJSON.status == "OK" && responseJSON.results.length > 0) {
			this.hotelCollection[this.hotelIndex].places[types] = responseJSON;
			this.setPlacesMarkers(types);
		} else {
			Log.error({method:"RIA.GooglePlaces : jsonRequestSuccess", error:{message:"JSON Response error"}});
			this.updateLabelCount(types);
		}
	}, 
	updateLabelCount: function(types) {                                                  
		var element = document.getElement("input[data-value="+types+"]"), label, count = this.hotelCollection[this.hotelIndex].places[types] ? this.hotelCollection[this.hotelIndex].places[types].results.length : 0;
		if(element) {
			label = element.getNext("label");                                  
			label.set("text", label.get("data-text")+" ("+count+")");
		}
	},
	setPlacesMarkers: function(type) {
		Object.each(this.hotelCollection[this.hotelIndex].places[type].results, function(place) {
			this.addPlacesMarker(place, type);
		},this);
		                                      
		
		Log.info("Got new places so recounting")
		this.updateLabelCount(type);
	},
	jsonRequestFailure: function(text, error) {
		Log.info("JSON request failure");
		Log.info(text);
		Log.info(error);
	},
	addPlacesMarker: function(place, type) {
		/*
		*	@description:
		*		Sets a Marker for a Place. Not solicited by the User
		*	@arguments:
		*		place[Object](returned from a Places API request)
		*		latLng[Object(LatLng)]
		*/ 
   	 	var mapIcon; 

		if(place.types.length > 0 && RIA.MarkerIconsImages[place.types[0]]) {
			mapIcon = RIA.MarkerIconsImages[place.types[0]];
		} else {
			mapIcon = RIA.MarkerIconsImages.star;
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
		this.hotelCollection.each(function(hotel) {
			Object.each(hotel.places, function(type) {
				Object.each(type.results, function(place) {
					this.removePlacesMarker(place);
				},this);			
			},this);
		},this);
	},
	removePlacesMarkers: function(type) {

		if(type && this.hotelCollection[this.hotelIndex].places && this.hotelCollection[this.hotelIndex].places[type]) {
			Object.each(this.hotelCollection[this.hotelIndex].places[type].results, function(place) {
				this.removePlacesMarker(place);
			},this);
		}
		
	}, 
	removePlacesMarker: function(place) {
		if(place && place.placesMarker) { 
			place.placesMarker.setMap(null);
			place.placesMarkerSV.setMap(null);
		}
	},
	createPlacesInfoWindow: function(place, marker) {
		marker.infowindow = new google.maps.InfoWindow({        
			content: place.name+"<br/>"+place.vicinity+"<br/>("+(this.options.places.types[place.types[0]]||place.types[0])+")",
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
		},this);
		
	},
	storePlacesSearch: function(hotel, types, placesJsonText) {
		/*
		* 	@description:
		*		Manually dispatch Places data of a hotel and type to the datastore
		*	@notes:
		*		This is not used, as the Places data is stored via the webapp after the places response is received
		*/
		
		this.requestPlacesPost = new Request({
			method:"POST",
			url:this.options.places.serviceURL,
			data:'locationid='+hotel.get("data-locationid")+'&types='+types+'&places='+placesJsonText,
			onRequest: function(e) {
				Log.info("storePlacesSearch : onRequest");
			},
			onSuccess: function(a, b) {
				Log.info("storePlacesSearch : onSuccess");
				Log.info(a);
				Log.info(b)
			},
			onFailure: function(e) {
				Log.info("storePlacesSearch : onFailure");
				Log.info(e)
			}
		}).send();
		
	}   
});