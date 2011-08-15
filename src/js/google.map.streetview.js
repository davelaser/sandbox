RIA.MapStreetView = new Class({
	Implements:[RIA.Gradient],
	options:{
		geocodeURL:"/geocode",
		geolocation:null, 
		bookmarks:null,
		maptype:"panorama",
		spectrum:["00FF00", "FFFF00", "FF0000"],
		panoramaServiceRadius:50
	},
	mapInitialize: function() {
		
		this.requestCounter = 500;
		
		RIA.bookmarks = new Object();
		RIA.hotelMarkers = new Object();
		
		RIA.MarkerIcons = { 
			blank:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=star|FFFF00',
			star:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=star|FFFF00',
			bankDollar:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bank-dollar|FF0000',
			hotel:'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=@LETTER@|@COLOR@|000000',
			bookmark:'http://chart.apis.google.com/chart?chst=d_map_xpin_letter&chld=pin_star|@LETTER@|EC008C|FFFFFF|FFFF00', 
			poc:'http://chart.apis.google.com/chart?chst=d_map_spin&chld=1|0|EC008C|10|b|@LETTER@',
			shadowHotel:'http://chart.apis.google.com/chart?chst=d_map_pin_shadow',
			shadowBookmark:'http://chart.apis.google.com/chart?chst=d_map_xpin_shadow&chld=pin_star',
			food:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=restaurant|FFFFFF',
			cafe:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe|FFFFFF',
			bar:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bar|FFFFFF',
			restaurant:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=restaurant|FFFFFF',
			establishment:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=location|FFFFFF',
			grocery_or_supermarket:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingcart|FFFFFF',
			store:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingcart|FFFFFF',
			meal_delivery:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=snack|FFFFFF',
			meal_takeaway:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=snack|FFFFFF',
			bakery:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=restaurant|FFFFFF',
			museum:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=location|FFFFFF',
			park:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=location|FFFFFF',
			shopping:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingbag|FFFFFF',
			shoe_store:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingbag|FFFFFF',
			book_store:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingbag|FFFFFF',
			clothing_store:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingbag|FFFFFF',
			department_store:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=shoppingbag|FFFFFF',
			bank:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bank-dollar|FFFFFF',
			atm:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bank-dollar|FFFFFF',
			bus:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bus|FFFFFF',
			car:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=car|FFFFFF',
			taxi:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=taxi|FFFFFF',
			hospital:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=medical|FFFFFF',
			embassy:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=legal|FFFFFF',
			art_gallery:'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=location|FFFFFF'
		}
		         
		var star = new google.maps.MarkerImage(RIA.MarkerIcons.star),
		shoe_store = new google.maps.MarkerImage(RIA.MarkerIcons.shoe_store),
		food = new google.maps.MarkerImage(RIA.MarkerIcons.food),
		cafe = new google.maps.MarkerImage(RIA.MarkerIcons.cafe),
		bar = new google.maps.MarkerImage(RIA.MarkerIcons.bar),
		restaurant = new google.maps.MarkerImage(RIA.MarkerIcons.restaurant),
		establishment = new google.maps.MarkerImage(RIA.MarkerIcons.establishment),
		grocery_or_supermarket = new google.maps.MarkerImage(RIA.MarkerIcons.grocery_or_supermarket),
		store = new google.maps.MarkerImage(RIA.MarkerIcons.store),
		meal_delivery = new google.maps.MarkerImage(RIA.MarkerIcons.meal_delivery),
		meal_takeaway = new google.maps.MarkerImage(RIA.MarkerIcons.meal_takeaway),
		bakery = new google.maps.MarkerImage(RIA.MarkerIcons.bakery),
		museum = new google.maps.MarkerImage(RIA.MarkerIcons.museum),
		park = new google.maps.MarkerImage(RIA.MarkerIcons.park),
		shopping = new google.maps.MarkerImage(RIA.MarkerIcons.shopping),
		shoe_store = new google.maps.MarkerImage(RIA.MarkerIcons.shoe_store),
		book_store = new google.maps.MarkerImage(RIA.MarkerIcons.book_store),
		clothing_store = new google.maps.MarkerImage(RIA.MarkerIcons.clothing_store),
		department_store = new google.maps.MarkerImage(RIA.MarkerIcons.department_store),
		bank = new google.maps.MarkerImage(RIA.MarkerIcons.bank),
		atm = new google.maps.MarkerImage(RIA.MarkerIcons.atm),
		bus_station = new google.maps.MarkerImage(RIA.MarkerIcons.bus),
		car_rental = new google.maps.MarkerImage(RIA.MarkerIcons.car),
		taxi_stand = new google.maps.MarkerImage(RIA.MarkerIcons.taxi),
		hospital = new google.maps.MarkerImage(RIA.MarkerIcons.hospital),
		embassy = new google.maps.MarkerImage(RIA.MarkerIcons.embassy),
		art_gallery = new google.maps.MarkerImage(RIA.MarkerIcons.art_gallery);
		
		RIA.MarkerIconsImages = {
			star:star,
			shoe_store:shoe_store,
			food:food,
			cafe:cafe,
			bar:bar,
			restaurant:restaurant,
			establishment:establishment,
			grocery_or_supermarket:grocery_or_supermarket,
			store:store,
			meal_delivery:meal_delivery,
			meal_takeaway:meal_takeaway,
			bakery:bakery,
			museum:museum,
			park:park,
			shopping:shopping,
			shoe_store:shoe_store,
			book_store:book_store,
			clothing_store:book_store,
			department_store:department_store,
			bank:bank,
			atm:atm,
			bus_station:bus_station,
			car_rental:car_rental,
			taxi_stand:taxi_stand,
			hospital:hospital,
			embassy:embassy,
			art_gallery:art_gallery
		}

		RIA.geocoder = new google.maps.Geocoder();
		RIA.sv = new google.maps.StreetViewService();         
		
		if(this.options.geolocation) {
			this.setCurrentLocation(new google.maps.LatLng(this.options.geolocation.lat, this.options.geolocation.lng));
		} else {
			this.setCurrentLocation(new google.maps.LatLng(0, 0));
		}
		
		
		this.mapOptions = {
			scrollwheel: false,
			keyboardShortcuts:false,
			zoom: 15,
			center: RIA.currentLocation, 
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scaleControl: true,
		    scaleControlOptions: {
		        position: google.maps.ControlPosition.BOTTOM_LEFT
		    }
		}
		
		this.panoramaOptions = {
			scrollwheel: false,
			position: RIA.currentLocation,
			pov: {
				heading: 120,
		        pitch: 20,
		        zoom: 0
			}
		};

		RIA.map = new google.maps.Map(document.getElementById("map_canvas"), this.mapOptions);
        RIA.map.setCenter(RIA.currentLocation);
                                                                                              		
		RIA.panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), this.panoramaOptions);
		RIA.map.setStreetView(RIA.panorama);
		
		RIA.panoramioLayer = new google.maps.panoramio.PanoramioLayer();
		//RIA.panoramioLayer.setTag("times square");
		
		   
		// Now we have initialized the Map, start the Destination request 
		if(RIA.currentDestination != "" || RIA.InitAjaxSubmit.price.get("value") != "") {
	    	RIA.InitAjaxSubmit._submit();
		}
		
 
		this.toggleMapFullScreen(null);	
	},
	toggleMapFullScreen: function(e){
		/*
		*	@description:
		*		Toggle the Map (ROADMAP) view from full screen to minimized
		*	@arguments:
		*		Event[Object] (optional)
		*/ 
		
		// If we have an Event object argument, prevent any default action   
		if(e && e.preventDefault) {
			e.preventDefault();
		}                                                                 

		// If WE DO NOT HAVE AN EVENT and full screen Map view is required  
		if(!e) {
			if(this.mapCanvas.retrieve("view:state") == "map") {
				this.mapCanvas.setStyles({"zIndex":1, "width":this.mapCanvas.retrieve("styles:maximized").width, "height":this.mapCanvas.retrieve("styles:maximized").height});
				this.mapStreetview.setStyles({"zIndex":3,"width":"310px", "height":"300px"});  
			} else if(this.mapCanvas.retrieve("view:state") == "panorama") {
				this.mapCanvas.setStyles({"zIndex":3, "width":this.mapCanvas.retrieve("styles:orig").width, "height":this.mapCanvas.retrieve("styles:orig").height});
				this.mapStreetview.setStyles({"zIndex":0,"width":this.mapStreetview.retrieve("styles:maximized").width, "height":this.mapStreetview.retrieve("styles:maximized").height}); 
			}
		}
		
		// IF WE DO HAVE AN EVENT and full screen Map view is required   
		
		if(e) {
			
			
			if(this.mapCanvas.retrieve("view:state") == "map" && (e.target.get("id") == "toggle-streetview" && !e.target.hasClass("active"))) {
				this.mapStreetview.setStyles({"zIndex":0,"width":this.mapStreetview.retrieve("styles:maximized").width, "height":this.mapStreetview.retrieve("styles:maximized").height}); 
				google.maps.event.trigger(RIA.panorama, "resize"); 
				this.options.maptype = "panorama";
				this.mapCanvas.store("view:state", this.options.maptype);
				this.mapCanvas.setStyles({"zIndex":3, "width":this.mapCanvas.retrieve("styles:orig").width, "height":this.mapCanvas.retrieve("styles:orig").height});
			   
			 	document.id("toggle-streetview").addClass("active");
				document.id("toggle-map").removeClass("active");
				
			}
			else if(e.target.get("id") == "toggle-map" && !e.target.hasClass("active")){
				this.mapStreetview.setStyles({"zIndex":3,"width":"310px", "height":"300px"});
				google.maps.event.trigger(RIA.panorama, "resize"); 
				
				this.options.maptype = "map";
				this.mapCanvas.store("view:state", this.options.maptype);
				this.mapCanvas.setStyles({"zIndex":1, "width":this.mapCanvas.retrieve("styles:maximized").width, "height":this.mapStreetview.retrieve("styles:maximized").height});
				
				document.id("toggle-streetview").removeClass("active");
				document.id("toggle-map").addClass("active");
			}
			
		}
		
		// Trigger the resize event on the Map so that it requests any required tiles
		google.maps.event.trigger(RIA.map, "resize");                                

		// Center the Map on the current location
		this.setMapPositionCenter(RIA.currentLocation);

	},
	setStreetview: function(hotel) { 
		/*
		* 	@description:
		*		Update the existing Streetview Panorama to center on the current location
		*	@arguments:
		*		Hotel[Element]
		*/ 
		// Get the Hotel address     
		var address = hotel.get("data-address"), latLng, savedLatLng = true;
		if(!address || address == "None") {
			address = "No address found";			
			return this.notGotGeolocation(hotel);
		}                       
		                                                
		// If we haven't stored locally the hotel LatLng, then attempt to store it...
		if(!hotel.retrieve("geolocation")) {
			savedLatLng = this.saveLatLngToHotel(hotel);
		}        
		
		// If we have successfully stored the LatLng against the hotel
		if(savedLatLng) {
			this.gotGeolocation(hotel, hotel.retrieve("geolocation"));
		} 
		// Else request the LatLng data from Google, using the Hotel's address
		else { 
			this.getGeocodeByAddress(hotel, this.gotGeolocation.bind(this));
		}   	
	},
	gotGeolocation: function(hotel, latLng) {
		/*
		* 	@description:
		*		Called from a successful google.geocode(address) lookup, or using stored LatLng geocoords
		*	@arguments:
		*		Hotel[Element]
		*		LatLng[Object(LatLng)]
		*/         
		
		// Set the global namespace current location
       	this.setCurrentLocation(latLng);
                                       
		// Switch the Map on, in case it was hidden due to no results previously
		this.mapStreetview.setStyle("display", "");          		            
		
		// Set the Map position and Pan to this position
		this.setMapPositionPan(RIA.currentLocation);    
		
		// Set the Streetview Panorama position
		this.setPanoramaPosition(RIA.currentLocation);
		
		this.resetPlacesMarkers();
	},
	notGotGeolocation: function(hotel) {
		/*
		* 	@description:
		*		Called from an UNsuccessful google.geocode(address) lookup
		*	@arguments:
		*		Hotel[Element]
		*/
        var counter = this.requestCounter + 500;
		this.requestCounter += 500
		if(hotel.retrieve("geolocation:error") != google.maps.GeocoderStatus.ZERO_RESULTS) {
			this.getGeocodeByAddress.delay(this.requestCounter, this, [hotel, this.addHotelMarker.bind(this)]);
        } else {
			//RIA.panorama.setVisible(false);
		}						
	},
	animateCurrentMarker: function(delayStart) {
		try {
			if(!this.hotelCollection) return;

			if(this.hotelCollection[this.hotelIndex].bookmark) {
				(function() {
					this.animateMarker(this.hotelCollection[this.hotelIndex].bookmark, google.maps.Animation.BOUNCE);
					this.hotelCollection[this.hotelIndex].bookmark.timeout = this.animateMarker.delay(2100, this, [this.hotelCollection[this.hotelIndex].bookmark, null]);			
				}.bind(this)).delay(delayStart||0);
			}	

			if(this.hotelCollection[this.hotelIndex].bookmarkSV) {
				(function() {
					this.animateMarker(this.hotelCollection[this.hotelIndex].bookmarkSV, google.maps.Animation.BOUNCE);
					this.hotelCollection[this.hotelIndex].bookmarkSV.timeout = this.animateMarker.delay(2100, this, [this.hotelCollection[this.hotelIndex].bookmarkSV, null]);			
				}.bind(this)).delay(delayStart||0);
			}
			

			if(this.hotelCollection[this.hotelIndex].hotelMarker) {
				(function() {
					this.animateMarker(this.hotelCollection[this.hotelIndex].hotelMarker, google.maps.Animation.BOUNCE);
					this.hotelCollection[this.hotelIndex].hotelMarker.timeout = this.animateMarker.delay(2100, this, [this.hotelCollection[this.hotelIndex].hotelMarker, null]);			
				}.bind(this)).delay(delayStart||0);
			}	

			if(this.hotelCollection[this.hotelIndex].hotelMarkerSV) {
				(function() {
					this.animateMarker(this.hotelCollection[this.hotelIndex].hotelMarkerSV, google.maps.Animation.BOUNCE);
					this.hotelCollection[this.hotelIndex].hotelMarkerSV.timeout = this.animateMarker.delay(2100, this, [this.hotelCollection[this.hotelIndex].hotelMarkerSV, null]);			
				}.bind(this)).delay(delayStart||0);
			}
			

		} catch(e) {
			Log.error({method:"animateCurrentMarker()", error:e});
		}
	},                      
	setMapPositionPan: function(latLng) {
		/*
		* 	@description:
		*		Set the Map to a position and Pan to it using the Google Maps built-in effect
		*	@arguments:
		*		latLng[Object(LatLng)]
		*/
		RIA.map.panTo(latLng);
		this.animateCurrentMarker(400);
		
	},
	setMapPositionCenter: function(latLng) {
		/*
		* 	@description:
		*		Set the Map to a position and center the Map to this position
		*	@arguments:
		*		latLng[Object(LatLng)]
		*/ 
		RIA.map.setCenter(latLng); 
		this.animateCurrentMarker();
	},
	setMapZoom: function(zoomLevel) {
		if(RIA.map) RIA.map.setZoom(zoomLevel);
	},
	setPanoramaPosition: function(latLng) {
		/*
		* 	@description:             
		*		Set the position of the Streetview Panorama
		*	@arguments:
		*		latLng[Object(LatLng)]
		*/ 
		// Check whether Streetview Panorama data exists for this LatLng, within a predefined metre radius (argument #2 below) 
		var heading;
		
		RIA.sv.getPanoramaByLocation(latLng, this.options.panoramaServiceRadius, function(svData, svStatus) {  
            // If Streetview Panorama data exists...
			if (svStatus == google.maps.StreetViewStatus.OK) {
				if(!RIA.panorama.getVisible()) RIA.panorama.setVisible(true);
				// Set the Streetview Panorama to the position, using the returned data (rather than RIA.currentLocation, as this may be innaccurate)
				RIA.panorama.setPosition(svData.location.latLng);                                                                              
				// Set the Point Of View of the Panorama to match the 'current heading' data returned. Set pitch and zoom to zero, so that we are horizontal and zoomed out
				
				// Now calculate the heading using the Panorama LatLng to the Hotel's LatLng (visually, the Marker)
				heading = this.getHeading(svData.location.latLng, latLng);
				
				// Set the Panorama heading, pitch and zoom 
				RIA.panorama.setPov({
					heading: heading,
					pitch:20,
					zoom:0
				});
			}
			// Else if no data exists...
			else if(svStatus == google.maps.StreetViewStatus.ZERO_RESULTS) {				
				// [ST]TODO: No Streetview data was found for this LatLng, what do we do here?
				Log.info("No Panorama results found");
				RIA.panorama.setVisible(false);
			} 
			// Else there was an error...
			else {
				// [ST]TODO: Handle OVER_QUOTA or other errors
				Log.info("Panorama error status: "+svStatus);
				RIA.panorama.setVisible(false);
			}
		}.bind(this));
	},
	dropBookmarkPin: function(hotel) {
		/*
		* 	@description:
		*		Call from a Bookmark request against a Hotel
		*	@arguments:
		*		Hotel[Element]
		*/ 
		// If the argument is an event, then use the current hotel index
		if(hotel.event) var hotel = this.hotelCollection[this.hotelIndex];
		
		var title = hotel.get("data-name"), price = hotel.get("data-price"), counter = hotel.get("data-counter"), marker, infowindow, LMLocationId = hotel.get("data-locationid"), icon;
		
		if(hotel.bookmark == null && RIA.bookmarks[LMLocationId] == undefined) {
			
			// If we have a Hotel Marker...
			if(RIA.hotelMarkers[LMLocationId] != undefined) {
				// If the Hotel Marker instance has a hotelMarker MapMarker Object, then remove it
				if(RIA.hotelMarkers[LMLocationId].hotelMarker != null) {    
					this.removeMarker(RIA.hotelMarkers[LMLocationId].hotelMarker);
				} 
				if(RIA.hotelMarkers[LMLocationId].hotelMarkerSV != null) {    
					this.removeMarker(RIA.hotelMarkers[LMLocationId].hotelMarkerSV); 
				}
			}  
				    
			icon = RIA.MarkerIcons.bookmark.replace("@LETTER@",hotel.get("data-counter"));
			
			// Create a new Marker
			hotel.bookmark = new google.maps.Marker({
	            map: RIA.map, 
	            icon:new google.maps.MarkerImage(icon),
				position: hotel.retrieve("geolocation"),
				draggable:false,
				title:title,
				animation:google.maps.Animation.BOUNCE,
				cursor:'pointer',
				clickable:true,
				zIndex:20,
				shadow:new google.maps.MarkerImage(RIA.MarkerIcons.shadowBookmark, new google.maps.Size(37, 42), new google.maps.Point(0,0), new google.maps.Point(12,42))
	        });

			hotel.bookmarkSV = new google.maps.Marker({
	            map: RIA.panorama, 
	            icon:new google.maps.MarkerImage(icon),
				position: hotel.retrieve("geolocation"),
				draggable:false,
				title:title,
				animation:google.maps.Animation.BOUNCE,
				clickable:false,
				zIndex:20
	        });
        
        
			// Add this hotel to the global namespaced Array of Bookmarks
			RIA.bookmarks[LMLocationId] = hotel;
		   
			this.createInfoWindow(hotel, hotel.bookmark);
		
			// Add a timeout to stop animating the Marker by removing {animation:google.maps.Animation.BOUNCE}
			hotel.bookmark.timeout = this.animateMarker.delay(2100, this, [hotel.bookmark, null]);  
			hotel.bookmarkSV.timeout = this.animateMarker.delay(2100, this, [hotel.bookmarkSV, null]);  
		}
	},
	createInfoWindow: function(hotel, marker) {
		var title = hotel.get("data-name"), price = hotel.get("data-price"), thumbnail = (hotel.getElement(".photos").get("data-thumbnail")||"#"), counter = hotel.get("data-counter"), infowindow;
		// Create a new InfoWindow, for the Marker
		         
		var ytPlayer = "<object id=\"yt-player\" width=\"425\" height=\"349\"><param name=\"movie\" value=\"http://www.youtube.com/v/-hyZL4YLmXA?version=3&amp;hl=en_US\"/><param name=\"allowFullScreen\" value=\"true\"/><param name=\"allowscriptaccess\" value=\"always\"/><embed src=\"http://www.youtube.com/v/-hyZL4YLmXA?version=3&amp;hl=en_US\" type=\"application/x-shockwave-flash\" width=\"425\" height=\"349\" allowscriptaccess=\"always\" allowfullscreen=\"true\"/></object>";

		var hotelContent = "<h4>#"+counter+": "+title+"</h4><p><img src=\""+thumbnail+"\" height=\"75\" width\"100\" /><p>"+price+"</p>";
		
		infowindow = new google.maps.InfoWindow({
		    content: hotelContent,
			maxWidth:50,
			disableAutoPan:true
		});
        
		infowindow.closeEvent = google.maps.event.addListener(infowindow, 'closeclick', function(event) {
		    infowindow.opened = false;
		}.bind(this));

		// Add mouse event listeners for the Marker
		hotel.mouseoutEvent = null;
		hotel.mouseoverEvent = google.maps.event.addListener(marker, 'mouseover', function(event) {
		    this.openInfoWindow(marker, infowindow);  
			hotel.mouseoutEvent = google.maps.event.addListener(marker, 'mouseout', function(event) {
			    if(!infowindow.opened) infowindow.close(); 
				google.maps.event.removeListener(hotel.mouseoutEvent); 
			}.bind(this));
		}.bind(this)); 
		hotel.clickEvent = google.maps.event.addListener(marker, 'click', function(event) {
			infowindow.opened = true;
			this.setCurrentLocation(event.latLng);
			google.maps.event.removeListener(hotel.mouseoutEvent);
			this.setPanoramaPosition(event.latLng);
			this.jumpToHotel(hotel);  
			this.openInfoWindow(marker, infowindow);   
			this.animateCurrentMarker();			
			this.resetPlacesMarkers();

		}.bind(this));
	},
	setHotelMarkers: function(hotels) { 
		/*
		* 	@description:
		*		Add a Marker for each hotel
		*		WARNING: This exceeds the .geocode() method QUOTA
		*	@arguments:
		*		Hotels[ElementCollection]
		*/ 
		
		this.createHotelMarkerColors();
		var counter = 500, delay, geo, latLng, dataLatLng, savedLatLng;
		hotels.each(function(hotel, index) {
			                                    
			// If we haven't stored locally the hotel LatLng, then attempt to store it...
			if(!hotel.retrieve("geolocation")) {
				savedLatLng = this.saveLatLngToHotel(hotel);
			}
			
			geo = hotel.retrieve("geolocation");
			error = hotel.retrieve("geolocation:error");
			
			// Only attempt to get a gelocation if we haven't already tried and failed
			if(geo == null && error != "NO_RESULTS") {
				delay = counter+=500;              
				this.getGeocodeByAddress.delay(delay, this, [hotel, this.addHotelMarker.bind(this)]);
			} else {
				//Log.info("setHotelMarkers() : retrieved gelocation for Hotel : "+hotel.get("data-name")+" : "+geo);
				// If the hotel does not have a bookmark in place
				if(hotel.bookmark == null) {
					this.addHotelMarker(hotel, geo);
				}
			}
			
		},this);
		    
		
	},
	addHotelMarker: function(hotel, latLng) {
		/*
		*	@description:
		*		Sets a Marker for a Hotel. Not solicited by the User
		*	@arguments:
		*		hotel[Element]
		*		latLng[Object(LatLng)]
		*/       
		var icon, LMLocationId = hotel.get("data-locationid");
		
		
		// If the Hotel does not already have a bookmarker Marker or a hotel marker
		if(hotel.bookmark == null && hotel.hotelMarker == null && RIA.hotelMarkers[LMLocationId] == undefined) {
			//Log.info("Setting hotelMarker for Hotel "+hotel.get("data-name"));
			
			RIA.hotelMarkers[LMLocationId] = hotel;
			
			icon = RIA.MarkerIcons.hotel.replace("@LETTER@",hotel.get("data-counter"));
			icon = icon.replace("@COLOR@", hotel.hotelMarkerColor);
			
			hotel.hotelMarker = new google.maps.Marker({
	            map:RIA.map,
				icon:new google.maps.MarkerImage(icon),
				position: latLng,
				draggable:false,
				title:hotel.get("data-name"),
				animation:google.maps.Animation.DROP,
				cursor:'pointer',
				clickable:true,
				zIndex:1,
				shadow:new google.maps.MarkerImage(RIA.MarkerIcons.shadowHotel, new google.maps.Size(37, 37), new google.maps.Point(0,0), new google.maps.Point(12,37))
			}); 
	
			hotel.hotelMarkerSV = new google.maps.Marker({
	            map:RIA.panorama,
				icon:new google.maps.MarkerImage(icon),
				position: latLng,
				draggable:false,
				title:hotel.get("data-name"),
				animation:google.maps.Animation.DROP,
				clickable:false,
				zIndex:1
	        });
            
			

			this.createInfoWindow(hotel, hotel.hotelMarker);
			this.createInfoWindow(hotel, hotel.hotelMarkerSV);
		} else {
			Log.info("Do we already have a hotelMarker or a bookmark for "+hotel.get("data-name")+" ?");
		}	
	},
	removeHotelMarkers: function() {
		Object.each(RIA.hotelMarkers, function(value, key) {
			// Remove the Map marker
			this.removeMarker(value.hotelMarker);
			// Remove the Streetview Panorama marker
			this.removeMarker(value.hotelMarkerSV);
			// Remove any bookmarks
			this.removeMarker(value.bookmark);
		},this);
		
	},
	removeMarker: function(marker) {
		if(marker) {
			marker.setMap(null);
		}
	}, 
	setBookmarkMarkers: function(hotels) {
		var counter = 500, delay, geo;
		hotels.each(function(hotel, index) {   
			if(this.options.bookmarks.contains(hotel.get("data-locationid"))) { 
				geo = hotel.retrieve("geolocation");
				if(geo == null) {  
					delay = counter+=500;              
					this.getGeocodeByAddress.delay(delay, this, [hotel, this.addBookmarkMarker.bind(this)]);
				} else { 
					Log.info("setHotelMarker() : retrieved gelocation for Hotel");
					this.dropBookmarkPin(hotel);
				}
				
				if(RIA.hotelMarkers[hotel.get("data-locationid")] != undefined) {
					// If the Hotel Marker instance has a hotelMarker MapMarker Object, then remove it
					if(RIA.hotelMarkers[hotel.get("data-locationid")].hotelMarker != null) {    
						this.removeMarker(RIA.hotelMarkers[hotel.get("data-locationid")].hotelMarker);						
					}
					// If the Hotel Marker instance has a hotelMarkerSV MapMarker Object, then remove it                                                                                     
					if(RIA.hotelMarkers[hotel.get("data-locationid")].hotelMarkerSV != null) {
						this.removeMarker(RIA.hotelMarkers[hotel.get("data-locationid")].hotelMarkerSV);
					}						
				}   	
			}
		},this);
	},  
	removeBookmarkMarkers: function() {
		Object.each(RIA.bookmarks, function(value, key) {
			this.removeMarker(value.bookmark);
		},this);
	},
	addBookmarkMarker: function(hotel, latLng) {
		// Create a new Marker     
		this.dropBookmarkPin(hotel);
	},
	getGeocodeByAddress: function(hotel, callback) {
		/*
		* 	@description:
		*		Make a Geocode Request sending an address.
		*		Return the response
		*	@arguments:
		*		Address[String]
		*/  
		
        var address = hotel.get("data-address");

		RIA.geocoder.geocode({ 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {             
				var latLng = results[0].geometry.location; 
				                        
				// [ST]TODO: Check why this is firing even when we have stored hotels in the datastore
				this.storeGeocodeByHotel(hotel.get("data-locationid"), latLng);
				
				// Store the LatLng against the Hotel Element
				hotel.store("geolocation", latLng);
				if(callback) {
					callback(hotel, latLng);
				}					
			} else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
		        //Log.info("No Geocode results found for "+address); 
				hotel.store("geolocation:error", status);
				this.notGotGeolocation(hotel);
			} else {
				//Log.info("Geocode was not successful for "+address+", for the following reason: status: " + status); 
				hotel.store("geolocation:error", status);
				this.notGotGeolocation(hotel);
			}                      
			
			// null local variables
			address = null;
		}.bind(this));
		
	},
	animateMarker: function(marker, animation) {
		/*
		* 	@description:
		*		Animate a Map Marker instance		
		*/
		if(marker) {
			marker.setAnimation(animation);
		}
	},
	openInfoWindow: function(marker,infowindow) {
		/*
		* 	@description:
		*		Open an InfoWindow instance
		*/  
		// Only show the InfoWindow if we are maximized state
		if(this.mapCanvas.retrieve("view:state") == "map") {
			infowindow.open(RIA.map,marker);
		}
	},
	setCurrentLocation: function(latLng) {
		RIA.currentLocation = latLng;
	},
	getHeading: function(latLng1, latLng2) {
		var path = [latLng1, latLng2], heading = google.maps.geometry.spherical.computeHeading(path[0], path[1]);
	    return heading;
	},
	createHotelMarkerColors: function() { 
		this.hotelsByPriceRange = new Array();
		this.hotelCollection.each(function(hotel, index) {
			hotel.priceData = parseFloat(hotel.get("data-price").substring(1)); 
			this.hotelsByPriceRange.include(hotel);
		},this);


		this.hotelsByPriceRange = this.hotelsByPriceRange.sort(this.sortByPrice.bind(this));
		
		this.gradientArray = new Array();
		                                                                                                                                 
		var hotelCount = Math.ceil(this.hotelCollection.length/2);
		for (var i = 0,l=this.options.spectrum.length-1; i < l; i++) {
			this.gradientArray = this.gradientArray.concat(this.generateGradient(this.options.spectrum[i], this.options.spectrum[i + 1], hotelCount));			
		}

		this.hotelsByPriceRange.each(function(hotel, index) {			
			hotel.hotelMarkerColor = this.gradientArray[index].toUpperCase();
		},this);
	},
	sortByPrice: function(a,b) {        
		return a.priceData - b.priceData; 
	}, 
	addPanoramioPhotos: function(e) {
		if(e && e.target) {
			if(e.target.checked) {
				RIA.panoramioLayer.setMap(RIA.map);
			} else {
				RIA.panoramioLayer.setMap(null);
			}
		}		
	},
	storeGeocodeByHotel: function(hotelLocationid, latLng) {
		
		this.requestGeocodePost = new Request({
			method:"POST",
			url:this.options.geocodeURL,
			data:'locationid='+hotelLocationid+'&destination='+RIA.currentDestination+'&lat='+latLng.lat()+'&lng='+latLng.lng(),
			onRequest: function(e) {
				//Log.info("storeGeocodeByHotel : onRequest");
			},
			onSuccess: function(a, b) {
				//Log.info("storeGeocodeByHotel : onSuccess");
			},
			onFailure: function(e) {
				Log.info("storeGeocodeByHotel : onFailure");
			}
		}).send();
	},
	saveLatLngToHotel: function(hotel) {
		if(hotel.get("data-latlng") && hotel.get("data-latlng") != "None") {
			dataLatLng = hotel.get("data-latlng").split(",");
			latLng = new google.maps.LatLng(dataLatLng[0], dataLatLng[1]);
			hotel.store("geolocation", latLng);
			Log.info("Successfully saved LatLng against hotel");
			return true;
		} else {
			return false;
		}		
	}
});