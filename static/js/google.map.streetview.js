RIA.MapStreetView = new Class({
	init: function() {
		RIA.MarkerIcons = { 
			blank:new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=star|FFFF00'),
			star:new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=star|FFFF00'),
			bankDollar:new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bank-dollar|FF0000')
		}

		
		RIA.geocoder = new google.maps.Geocoder();
		RIA.sv = new google.maps.StreetViewService();         
		RIA.currentLocation = new google.maps.LatLng(this.options.lat, this.options.lng);
		
		var mapOptions = {
			scrollwheel: false,
			keyboardShortcuts:false,
			zoom: 13,
			center: RIA.currentLocation, 
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		
		var panoramaOptions = {
			scrollwheel: false,
			position: RIA.currentLocation,
			pov: {
				heading: 120,
		        pitch: 10,
		        zoom: 0
			}
		};
		RIA.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
        
        RIA.map.setCenter(RIA.currentLocation);
		RIA.panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"),panoramaOptions);
		RIA.map.setStreetView(RIA.panorama);
		
		RIA.InitAjaxSubmit = new RIA.AjaxSubmit();

	},
	toggleMap: function(e) {
		var mapDisplayed = this.mapCanvas.getStyle("visibility") == "hidden";
		Log.info(mapDisplayed)
		if(mapDisplayed) {
			this.mapCanvas.setStyle("visibility", "visible");
		}   
		else {
			this.mapCanvas.setStyle("visibility", "hidden");			
		}
	},
	toggleMapFullScreen: function(e){    
		if(e) e.preventDefault();
		var mapWidth = this.mapCanvas.getCoordinates().width;
		if(mapWidth < this.viewport.x) {
			this.mapCanvas.setStyles({"width":"100%", "height":"1000px"});
			this.mapCanvas.getElement("div").setStyles({"width":"100%", "height":"1000px"});
			// [ST] Resetting zoom causes a pan to occur in from the top left, which is annoying when toggling between streetview and map 
			//RIA.map.setZoom(15);
			document.id("map-streetview").set("text", "Streetview");
		}   
		else {
			this.mapCanvas.setStyles({"width":this.mapCanvas.retrieve("styles:orig").width, "height":this.mapCanvas.retrieve("styles:orig").height});
			//RIA.map.setZoom(13);
			document.id("map-streetview").set("text", "Map");
		}
		
		google.maps.event.trigger(RIA.map, "resize"); 
		this.setMapPositionCenter(RIA.currentLocation);
	},
	setStreetview: function(hotel) {       
		var address = hotel.get("data-address");
		if(!address || address == "None") {
			address = ""
		}
		if(hotel.retrieve("geolocation")) {
			RIA.currentLocation = hotel.retrieve("geolocation");
			this.gotGeolocation(hotel);
			Log.info("Retrieved geolocation for hotel : "+RIA.currentLocation);
		} else {
			RIA.geocoder.geocode( { 'address': address}, function(results, status) {
				Log.info("Getting address geocode data for address: "+address);
				if (status == google.maps.GeocoderStatus.OK) {                 
					RIA.currentLocation = results[0].geometry.location;
					hotel.store("geolocation", RIA.currentLocation);
					this.gotGeolocation(hotel);
				} else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
			        this.mapStreetview.setStyle("display", "none"); 
					
					Log.info("No Geocode results found, switching off StreetView Panorama");
				} else {
					Log.info("Geocode was not successful for the following reason: status: " + status);
				}
			}.bind(this));	
		}   	
	},
	gotGeolocation: function(hotel) {
		this.mapStreetview.setStyle("display", "");          		
		this.setMapPositionPan(RIA.currentLocation);
		this.setPanoramaPosition(RIA.currentLocation);
		//this.requestPlaces(hotel, RIA.currentLocation, 1500, 'food|restaurants|attractions|hotels');
	},
	setMapPositionPan: function(latLng) {
		RIA.map.panTo(latLng);
	},
	setMapPositionCenter: function(latLng) {
		RIA.map.setCenter(latLng);
	},
	setPanoramaPosition: function(latLng) {
		RIA.sv.getPanoramaByLocation(latLng, 150, function(svData, svStatus) {  

			if (svStatus == google.maps.StreetViewStatus.OK) {
				/*
			    var hotelMarker = new google.maps.Marker({
     				position: svData.location.latLng,
     				map: RIA.map,
     				icon: RIA.MarkerIcons.star,
     				title: 'Hotel'
 				});
                */

				RIA.panorama.setPosition(svData.location.latLng);
				RIA.panorama.setPov({
					heading: svData.tiles.centerHeading,
					pitch:0,
					zoom:0
				});
				
			}
			else if(svStatus == google.maps.StreetViewStatus.ZERO_RESULTS) {
				
				Log.info("No Panorama results found");
				
			} else {
				Log.info("Panorama error status: "+svStatus);
			}
		});
	},
	dropPin: function(e) {  
		var button = e.target, hotel = button.getParent(".hotel"), title = hotel.get("data-name"), price = hotel.get("data-price"), counter = hotel.get("data-counter"), marker, infowindow;
		button.setStyle("display", "none");
			
		marker = new google.maps.Marker({
            map: RIA.map, 
            position: RIA.currentLocation,
			draggable:false,
			title:title,
			animation:google.maps.Animation.BOUNCE,
			cursor:'pointer',
			clickable:true,
			zIndex:10
        });

		infowindow = new google.maps.InfoWindow({
		    content: "<h4>#"+counter+": "+title+"</h4><p>"+price+"</p>",
			maxWidth:50
		});  
		google.maps.event.addListener(marker, 'click', function(event) {  
			this.markerClick(marker, event.latLng, hotel, infowindow);
		}.bind(this));   
		
		
		
		marker.timeout = this.animateMarker.delay(2100, this, [marker, null]);
	},
	setHotelMarkers: function(hotels) { 
		
		hotels.each(function(hotel) {
			RIA.geocoder.geocode( { 'address': hotel.get("data-address")}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {                 
					var marker = new google.maps.Marker({
			            map: RIA.map, 
			            position: results[0].geometry.location,
						draggable:false,
						title:hotel.get("data-name"),
						animation:google.maps.Animation.DROP,
						cursor:'pointer',
						clickable:true,
						zIndex:10
			        });
				} else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
			        Log.info("No Geocode results found, switching off StreetView Panorama");
				} else {
					Log.info("Geocode was not successful for the following reason: status: " + status);
				}
			}.bind(this));
		},this);
		
	},
	animateMarker: function(marker, animation) {
		if(marker) {
			marker.setAnimation(animation);
		}
	},
	markerClick: function(marker, latLng, hotel, infowindow) {
		//this.setMapPositionPan(latLng);
		this.setPanoramaPosition(latLng);
		this.jumpToHotel(hotel);
		var mapWidth = this.mapCanvas.getCoordinates().width;
		// Only open the info window in full screen map mode
		if(mapWidth < this.viewport.x) { 
			
		} else {
			infowindow.open(RIA.map,marker);
		}
	}
});