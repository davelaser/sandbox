RIA.Experience = new Class({
	Implements:[Options, RIA.MapStreetView, RIA.GooglePlaces],
	options:{
		contenttype:"maximized"
	},
	initialize: function(options) {
		this.setOptions(options);

		RIA.places = new Object();
		
		this._form = document.id("search");
		this.bookmarks = document.id("bookmarks");
		this.bookmarks.store("viewstate", "closed");
		
		this.content = document.id("content");
		this.sections = document.getElements("section");
		this.destination = document.id("destination");
		this.destination.store("styles:width:orig", this.destination.getStyle("width").toInt());
		this.weather = document.id("weather");
		this.guardian = document.id("guardian");
		this.twitterNews = document.id("twitter-news");
		this.fbDialogSendButton = document.id("fb-dialog-send");
		
		this.places = document.id("places");
		this.places.store("viewstate", "closed");
		   
		this.placesDistanceRange = document.id("places-distance-range");
		this.placesDistanceOutput = document.id("places-distance-output");
		
		
		this.travelPartners = document.id("travel-partners");
		this.hotels = document.id("hotels"); 
		this.hotelsNav = document.id("hotel-list");
		           
		if(this.hotels) {
	        this.hotels.getElement(".results").set("morph", {
				duration:400,
				link:"ignore"
			});
		}
		
		this.mapCanvas = document.id("map_canvas");
		this.mapCanvas.store("styles:orig", this.mapCanvas.getCoordinates());
		this.mapCanvas.store("styles:maximized", {width:"100%", height:"100%"});
		this.mapCanvas.store("view:state", this.options.maptype);
		
		this.mapStreetview = document.id("pano");                
		this.mapStreetview.store("styles:orig", this.mapStreetview.getCoordinates());
		this.mapStreetview.store("styles:maximized", {width:"100%", height:"100%"});
		
		this.onWindowResize();
		this.addEventListeners();  
		
		this.toggleInformation(null);
		
	},                            
	addEventListeners: function() {
		
		window.addEvents({
			"resize": this.onWindowResize.bind(this)
		});

		if(this.fbDialogSendButton) {
			this.fbDialogSendButton.addEvents({
				"click":this.fbDialogSend.bind(this)
			});
		}  
		
		if(document.id("map-controls")) {
			document.id("map-controls").addEvents({
				"click":this.toggleMapFullScreen.bind(this)
			});			
		}
                                            
		document.getElements(".less").addEvents({
			"click":this.toggleInformation.bind(this) 
		});
        
		if(document.id("less-more")) {
			document.id("less-more").addEvents({
				"click":this.toggleInformation.bind(this) 
			});			
		}
		     
		
		if(document.id("nearby")) {
			document.id("nearby").addEvents({
				"click":this.showPlaces.bind(this)
			});
		}
		if(document.id("my-bookmarks")) {
			document.id("my-bookmarks").addEvents({
				"click":this.shareMyBookmarks.pass([true],this)
			});			
		}    
		
		if(this.places) {
			this.places.addEvents({
				"click": function(e) {
					var target = e.target, places = target.get("value");
                    if(places && places != "") {
						if(target.checked) {
	                		this.requestPlaces(RIA.currentLocation, this.options.places.searchRadius, places, null);
						}
						else {            
							this.removePlacesMarkers(places);
							this.updateLabelCount(places);
						}
					}  
					
					else if(target.id == "photos") {
						this.addPanoramioPhotos(e);
					}
					
				}.bind(this)
			});
			this.places.getElement("h2").addEvents({
				"click": function(e) {
					this.places.getElement("form").toggleClass("hide");
				}.bind(this)
			});
		} 
		
		if(this.placesDistanceRange) {
			this.placesDistanceRange.addEvents({
				"change": function(e) {
					var newDistance = e.target.get("value");
					this.placesDistanceOutput.set("text", (this.options.places.searchRadius == 1000 ? "1K" : newDistance)+"m");
				}.bind(this),
				"mouseup": function(e) {
					var newDistance = e.target.get("value");
					if(this.options.places.searchRadius !== newDistance) {
						this.options.places.searchRadius = e.target.get("value");
						this.placesDistanceOutput.set("text", (this.options.places.searchRadius == 1000 ? "1K" : this.options.places.searchRadius)+"m");
						this.resetPlacesMarkers(true);
					}					
				}.bind(this)
			});
		}
	},
	addHotelNavEventListeners: function() {
		//Log.info("addHotelNavEventListeners")
		this.hotelNavigationBind = this.hotelNavigation.bind(this)
		
		this.dropBookmarkPinBind = this.dropBookmarkPin.bind(this);
		document.getElements(".drop-pin").each(function(dropPinButton) {
			dropPinButton.addEvents({
				"click":this.dropBookmarkPinBind.pass([dropPinButton.getParent(".hotel")], this)
			});
		},this);
		
		document.getElements(".previous, .next").each(function(link) {
			link.addEvents({
				"click":this.hotelNavigationBind 
			});
		},this);

	},
	removeHotelNavEventListeners: function() {
		//Log.info("removeHotelNavEventListeners")

		document.getElements(".previous, .next").each(function(link) {
			link.removeEvents({
				"click":this.hotelNavigationBind 
			});
		},this);
		
		document.getElements(".drop-pin").each(function(dropPinButton) {
			dropPinButton.removeEvents({
				"click":this.dropBookmarkPinBind
			});
		},this)
	},      
	fbDialogSend: function() {
		FB.ui({
			app_id:RIA.fbAppId,
			/*redirect_uri:window.location.href,*/
			access_token:"147307178684773|2.AQCTvZXmKvdYGpvo.3600.1312552800.0-100002195041453|kXWfcjveg1hot1dkyEigL3VIVbs",
			method: 'send',
			display:'iframe',
          	name: 'Your Lastminute.com Hotel Bookmarks',
			link: RIA.shareURL,
		});
	},
	hotelNavigation: function(e) { 

		if((e.type == "keyup" && (e.key == "left" || e.key == "right")) || e.type == "click") {
			e.preventDefault();                                       
			var hotelWidth, resultMarginLeft, ready = true;
		
			resultMarginLeft = this.hotels.getElement(".results").getStyle("marginLeft");
			
			if(e.key == "left" || (e.type == "click" && e.target.hasClass("previous"))) {
				if(resultMarginLeft.toInt() >= 0) {
					resultMarginLeft = 0;
					ready = false;						
				} else {
					this.hotelIndex--;
					resultMarginLeft = resultMarginLeft.toInt()+this.hotelWidth;
				} 
				
			} 
			else if (e.key == "right" || (e.type == "click" && e.target.hasClass("next"))) {
				var totalMarginLeft = -1*(this.totalLength-this.hotelWidth);
				if(resultMarginLeft.toInt() <= totalMarginLeft) {
					resultMarginLeft = totalMarginLeft;
					ready = false;
				} else {
					this.hotelIndex++;
					resultMarginLeft = resultMarginLeft.toInt()-hotelWidth;                                                           						
				}
				              
			}
			
			if(ready) {
				document.getElements(".hotel-name").set("text", this.hotelCollection[this.hotelIndex].get("data-name"));
				
				if(this.hotels.hasClass("minimized")) {
					this.animateToHotel(this.hotelCollection[this.hotelIndex]); 
					(function() {
						this.setStreetview(this.hotelCollection[this.hotelIndex]);
					}.bind(this)).delay(500);
				} else {
					this.jumpToHotel(this.hotelCollection[this.hotelIndex]);      
					this.setStreetview(this.hotelCollection[this.hotelIndex]);
				}
				
			}


		}
	},
	setCurrentHotel: function(hotel) {
		var hotelCounter = hotel.get("data-counter"),
		hotelIndex = hotelCounter-1, 
		resultMarginLeft = -1*(hotelCounter*this.hotelWidth)+this.hotelWidth;
		
		this.hotelsNav.getElements("a").removeClass("active");
		this.hotelsNav.getElements("a")[hotelIndex].addClass("active");
		this.hotelIndex = hotelIndex; 
		return {index:this.hotelIndex, marginLeft:resultMarginLeft};
	},
	animateToHotel: function(hotel) {
		var hotelResults = this.setCurrentHotel(hotel);
		this.hotels.getElement(".results").morph({"marginLeft":hotelResults.marginLeft+"px"});		
	},
	jumpToHotel: function(hotel) {
		var hotelResults = this.setCurrentHotel(hotel);
		this.hotels.getElement(".results").setStyles({"marginLeft":hotelResults.marginLeft+"px"});
	},
	getHotels: function() {
		this.hotelsNav.empty();
		this.removeHotelMarkers(); 
		this.removeHotelNavEventListeners();
		this.hotels.getElement(".results").setStyles({"marginLeft":"0px"});
	},
	gotHotels: function(destination) {    
		/*
		* 	Callback from AjaxSubmit successful get of hotel data
		*/
		
		// reset the hotel index, so we are in first hotel position
		this.hotelIndex = 0;
		this.hotelCollection = this.hotels.getElements(".hotel");
		
		this.hotels.removeClass("waiting");
		
		RIA.bookmarks = new Object();                                         
		this.shareMyBookmarks(false);
		RIA.hotelMarkers = new Object();
		
		if(this.hotelCollection.length > 0) {
			
			document.getElements(".hotel-name").set("text", this.hotelCollection[this.hotelIndex].get("data-name"));
			
			RIA.currentDestination = this.hotelCollection[0].get("data-destination");
			//Log.info("RIA.currentDestination is now "+RIA.currentDestination);
					
			
			if(!this.hotels.hasClass("grid")) {
				this.hotelWidth = this.hotels.getElements(".hotel")[0].getCoordinates().width;
				this.totalLength = (this.hotelCollection.length*this.hotelWidth);
				this.hotels.getElement(".results").setStyles({"width":this.totalLength+"px"});
			}
			
			this.setStreetview(this.hotelCollection[0]);
			    
			if(this.options.bookmarks != null && this.options.bookmarks.length) {
				this.setBookmarkMarkers(this.hotelCollection);
			}
            
			this.setHotelMarkers(this.hotelCollection);   
			
			this.createHotelNav();                                                                               
			
			this.addHotelNavEventListeners();
			
		} else {
			Log.error({method:"gotHotels()", error:{message:"No Hotels returned"}});
		}   
		
	}, 
	createHotelNav: function() {
		
		
		this.hotelCollection.each(function(hotel, index) {
			this.hotelsNav.adopt(new Element("a", {
				"href":"#",
				"text":(index+1),
				"class":(index == 0 ? "active" : ""),
				"title":hotel.get("data-name")+" : "+hotel.get("data-price"),
				"events":{
					"click": function(e) {
						e.preventDefault();
						this.jumpToHotel(hotel);
						this.setStreetview(this.hotelCollection[this.hotelIndex]);
					}.bind(this)
				}
			}))
		},this)
	},
	onWindowResize: function(e) {
		this.viewport = window.getSize(); 
		if(RIA.map) google.maps.event.trigger(RIA.map, "resize");
	},
	toggleInformation: function(e) {
		
		if(e) e.preventDefault();
		
		if(!e) {
			if(this.options.contenttype == "maximized") {
				if(document.id("less-more")) document.id("less-more").set("text", "less...");
				if(this.weather) this.weather.setStyle("display", "block");
				if(this.guardian) this.guardian.setStyle("display", "block");
				if(this.twitterNews) this.twitterNews.setStyle("display", "block");
				this.hotels.removeClass("minimized");
			}
			else {   
				if(document.id("less-more")) document.id("less-more").set("text", "more...");
				if(this.weather) this.weather.setStyle("display", "none");
				if(this.guardian) this.guardian.setStyle("display", "none");
				if(this.twitterNews) this.twitterNews.setStyle("display", "none");
				this.hotels.addClass("minimized");				
			}
		} else {
			if(this.hotels.hasClass("minimized")) {
				this.options.contenttype = "maximized";
				if(document.id("less-more")) document.id("less-more").set("text", "less...");
				if(this.weather) this.weather.setStyle("display", "block");
				if(this.guardian) this.guardian.setStyle("display", "block");
				if(this.twitterNews) this.twitterNews.setStyle("display", "block");
				this.hotels.removeClass("minimized");
			}
			else {
				this.options.contenttype = "minimized";   
				if(document.id("less-more")) document.id("less-more").set("text", "more...");
				if(this.weather) this.weather.setStyle("display", "none");
				if(this.guardian) this.guardian.setStyle("display", "none");
				if(this.twitterNews) this.twitterNews.setStyle("display", "none");
				this.hotels.addClass("minimized");				
			}    
		}
	},
	shareMyBookmarks: function(show) {   
		
		RIA.currentPriceMax = RIA.InitAjaxSubmit.price.get("value");
		                                                                       
		RIA.shareURL = window.location.protocol+"//"+window.location.host+window.location.pathname+"?priceMax="+RIA.currentPriceMax+"&destination="+(RIA.currentDestination||"")+"&bookmarks=", index = 0;
		Object.each(RIA.bookmarks, function(value, key) {                
			if(index == 0) {
				RIA.shareURL+= key;
            } else {
				RIA.shareURL+=","+key;
			}				
            index++;
		},this);    
		
		RIA.shareURL+="&maptype="+this.options.maptype+"&contenttype="+this.options.contenttype;
		
		
		document.id("bookmarks").getElement("a").set({"href":RIA.shareURL, "text":RIA.shareURL});  
		
		if(show) {
			if(this.bookmarks.retrieve("viewstate") == "closed") {
				this.bookmarks.morph({"height":"55px", "top":"60px"});
				//this._form.morph({"top":"140px", "paddingTop":"20px"});			
				this._form.morph({"opacity":0});			
				this.bookmarks.store("viewstate", "open");
				
				//this.content.morph({"opacity":0});
			} else {
				this.bookmarks.morph({"height":"0px", "top":"-20px"});
				//this._form.morph({"top":"40px", "paddingTop":"40px"});
				this._form.morph({"opacity":1});
				this.bookmarks.store("viewstate", "closed"); 
				
				//this.content.morph({"opacity":1});
			}
		}
	},
	showPlaces: function(e) {
		e.preventDefault();
		if(this.places.retrieve("viewstate") == "closed") {
    		this.places.store("viewstate", "open"); 
			this.places.morph({"display":"block"});
		} else {   
    		this.places.store("viewstate", "closed");
			this.places.morph({"display":"none"}); 
		}
		
	}
});