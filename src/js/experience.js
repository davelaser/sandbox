RIA.Experience = new Class({
	Implements:[Options, RIA.Utils, RIA.MapStreetView, RIA.GooglePlaces],
	options:{
		contenttype:"maximized",
		ios:false,
		tweetBox: false
	},
	initialize: function(options) {
		this.setOptions(options);
        
		RIA.places = new Object();
		                 
		this._form = document.id("search");
		
		this.header = document.id("main");

		this.toggleContent = document.id("toggle-content"); 
		this.togglePlaces = document.id("toggle-places");
		this.toggleGuardian = document.id("toggle-guardian");
		
		this.content = document.id("content");
		this.destination = document.id("destination");
		this.numberOfNights = document.id("nights");
		this.arrivalDate = document.id("arrival_date");
		
		this.weather = document.id("weather");
		this.guardian = document.id("guardian");
		this.guardian.store("viewstate", "closed");
		
		this.twitterNews = document.id("twitter-news");
		
		this.save = document.id("save");
		this.share = document.id("share");
		this.shareDialog = document.id("share-dialog");
		this.shareDialog.store("viewstate", "closed");
		this.toggleShareDialog = document.id("toggle-share-dialog");
		this.toggleTripAdvisor = document.id("toggle-trip-advisor");
		/*
		*	Create default dialog
		*/
		if(twttr != "undefined") {
			twttr.anywhere(function (T) {
		    	this.tweetBox = T("#share-dialog-content").tweetBox({
					label:"Share saved Hotels with friends",
		      		height: 100,
		      		width: 400,
		      		defaultContent: "My hotels @RazorfishHotels"
		    	});
		  	}.bind(this));
		}
		
	
		this.places = document.id("places");
		this.places.store("viewstate", "closed");
		   
		this.placesDistanceRange = document.id("places-distance-range");
		this.placesDistanceOutput = document.id("places-distance-output");
		
		this.filters = document.id("filters");
		
		this.hotels = document.id("hotels"); 
		this.hotelsNav = document.id("hotel-list");
		this.priceGuide = document.id("price-guide");
				           
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
		
		/*
		if(this.header) {
			this.header.addEvents({
				"mouseenter": function(e) {
					this.header.setStyles({
						height:'162px'
					});
					this._form.setStyle('display','block');
					var social = document.getElementById("social");
					if(social) {
						social.setStyle("display", "block");
					}
				}.bind(this),
				"mouseleave": function(e) {
					this.header.setStyles({
						height:'73px'
					});
					this._form.setStyle('display','none');
					var social = document.getElementById("social");
					if(social) {
						social.setStyle("display", "none");
					}
				}.bind(this)
			});
		}
		*/
		if(document.id("ratingSort")) {
			document.id("ratingSort").addEvents({
				"change":this.sortEvent.bind(this)
			});
		}
		
		if(document.id("priceSort")) {
			document.id("priceSort").addEvents({
				"change":this.sortEvent.bind(this)
			});
		}
		
		window.addEvents({
			"resize": this.onWindowResize.bind(this)
		});

		if(document.id("map-controls")) {
			document.id("map-controls").addEvents({
				"click":this.toggleMapFullScreen.bind(this)
			});			
		}
                                            
		if(this.toggleContent) {
			this.toggleContent.addEvents({
				"click":this.toggleInformation.bind(this) 
			});			
		}
		 
		if(this.togglePlaces) {
			this.togglePlaces.addEvents({
				"click":this.showPlaces.bind(this) 
			});
		}    
		
		if(this.toggleGuardian) {
			this.toggleGuardian.addEvents({
				"click":this.showGuardian.bind(this) 
			});
		}
		
		if(this.toggleShareDialog) {
			this.toggleShareDialog.addEvents({
				"click":this.showShareDialog.bind(this) 
			});
		}

		if(this.toggleTripAdvisor) {
			this.toggleTripAdvisor.addEvents({
				"click":this.toggleTripAdvisorOverlay.bind(this) 
			});
		}
		
		if(document.id("news")) {
			document.id("news").addEvents({
				"click":this.showGuardian.bind(this) 
			});
		}
		
		if(document.id("nearby")) {
			document.id("nearby").addEvents({
				"click":this.showPlaces.bind(this)
			});
		}
		if(this.share) {
			
			this.share.addEvents({
				"click":this.shareMyBookmarks.bind(this)
			});

		
		}    
		
		if(this.guardian) {
			this.guardianDrag = new Drag(this.guardian, {
				handle:this.guardian.getElement("h2"),
			    snap: 0,
			    onSnap: function(el){
			        el.addClass('dragging');
			    },
			    onComplete: function(el){
			        el.removeClass('dragging');
			    }
			});
		}
		
		if(this.shareDialog) {
			this.shareDialogDrag = new Drag(this.shareDialog, {
				handle:this.shareDialog,
			    snap: 0,
			    onSnap: function(el){
			        el.addClass('dragging');
			    },
			    onComplete: function(el){
			        el.removeClass('dragging');
			    }
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
							if(target.getNext("label")) {
								target.getNext("label").set("text", target.getNext("label").get("data-text"));
							}	
						}
					}  
					
					else if(target.id == "photos") {
						this.addPanoramioPhotos(e);
					}
					
				}.bind(this)
			}); 
			
			this.placesDrag = new Drag(this.places, {
				handle:this.places.getElement("h2"),
			    snap: 0,
			    onSnap: function(el){
			        el.addClass('dragging');
			    },
			    onComplete: function(el){
			        el.removeClass('dragging');
			    }
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

		this.save.addEvents({
			"click":this.dropBookmarkPinBind
		});
		
		document.getElements(".previous, .next").each(function(link) {
			link.addEvents({
				"click":this.hotelNavigationBind 
			});
		},this);

		
		document.body.addEvents({
			"keyup":this.hotelNavigationBind 
		});
		

	},
	removeHotelNavEventListeners: function() {
		//Log.info("removeHotelNavEventListeners")

		document.getElements(".previous, .next").each(function(link) {
			link.removeEvents({
				"click":this.hotelNavigationBind 
			});
		},this);

		this.save.removeEvents({
			"click":this.dropBookmarkPinBind
		});
		
	},      
	fbDialogSend: function() {
		FB.ui({
			app_id:RIA.fbAppId,
			access_token:RIA.fbAccessToken,
			method: 'send',
			display:'iframe',
          	name: 'Your saved Hotels',
			link: RIA.shareURL
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
					
					this.hotelCollection[this.hotelIndex].TripAdvisor.hide();
					
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
					this.hotelCollection[this.hotelIndex].TripAdvisor.hide();
					
					this.hotelIndex++;
					resultMarginLeft = resultMarginLeft.toInt()-hotelWidth;                                                           						
				}
				              
			}
			
			if(ready) {
				document.getElements(".hotel-name").set("text", this.hotelCollection[this.hotelIndex].get("data-name"));
				
				this.jumpToHotel(this.hotelCollection[this.hotelIndex]);      
				this.setStreetview(this.hotelCollection[this.hotelIndex]);
				
				// Track the Hotel View Event
				this.trackEvent('Hotel', 'NavigateByArrow', this.hotelCollection[this.hotelIndex].get("data-locationid")+" : "+this.hotelCollection[this.hotelIndex].get("data-name"), 1);
			}


		}
	},
	setCurrentHotel: function(hotel) {
		var hotelCounter = hotel.get("data-counter"),
		hotelIndex = hotelCounter-1, 
		resultMarginLeft = -1*(hotelCounter*this.hotelWidth)+this.hotelWidth;
		
		if(this.hotelsNav) {
			this.hotelsNav.getElements("a").removeClass("active");
			this.hotelsNav.getElements("a")[hotelIndex].addClass("active");
		}
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
		this.removeAllTripAdvisorOverlays();
		if(this.hotelsNav) {
			this.hotelsNav.getElement(".results").empty();
		}
		if(document.id("price-guide")) document.id("price-guide").addClass("hide");
		this.removeAllMarkers(); 
		this.removeAllPlacesMarkers();
		this.removeHotelNavEventListeners();
		this.hotels.getElement(".results").empty();
		this.hotels.getElement(".results").setStyles({"width":"100%", "margin-left":"0px"});
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
		
		RIA.hotelMarkers = new Object();
		
		if(this.hotelCollection.length > 0) {
			
			document.getElements(".hotel-name").set("text", this.hotelCollection[this.hotelIndex].get("data-name"));
			
			RIA.currentDestination = this.hotelCollection[this.hotelIndex].get("data-destination");
			//Log.info("RIA.currentDestination is now "+RIA.currentDestination);
					
			
			if(!this.hotels.hasClass("grid")) {
				this.hotelWidth = this.hotels.getElements(".hotel")[0].getCoordinates().width;
				this.totalLength = (this.hotelCollection.length*this.hotelWidth);
				this.hotels.getElement(".results").setStyles({"width":this.totalLength+"px"});
			}
			
			
			
			if(this.options.bookmarks != null && this.options.bookmarks.length) {
				this.setBookmarkMarkers(this.hotelCollection);
			}
            
			this.setHotelMarkers(this.hotelCollection);   
			
			this.setStreetview(this.hotelCollection[this.hotelIndex]);
			
			if(this.hotelsNav) this.createHotelNav();                                                                               
			
			this.addHotelNavEventListeners();
			
			// Track the initial hotel view
			this.trackEvent('Hotel', 'NavigateByArrow', this.hotelCollection[this.hotelIndex].get("data-locationid")+" : "+this.hotelCollection[this.hotelIndex].get("data-name"), 1);

		} else {
			Log.error({method:"gotHotels()", error:{message:"No Hotels returned"}});
		}   
		
	}, 
	createHotelNav: function() {
		this.hotelCollection.each(function(hotel, index) {
			this.hotelsNav.getElement(".results").adopt(new Element("a", {
				"href":"#",
				"text":(index+1),
				"class":(index == 0 ? "active" : ""),
				"title":hotel.get("data-name")+" : "+hotel.get("data-price"),
				/*"styles":{
					"backgroundColor":"#"+hotel.hotelMarkerColor
				},*/
				"events":{
					"click": function(e) {
						e.preventDefault();
						this.hotelCollection[this.hotelIndex].TripAdvisor.hide();
						this.jumpToHotel(hotel);
						this.setStreetview(this.hotelCollection[this.hotelIndex]);
						this.trackEvent('Hotel', 'NavigateByNumberList', this.hotelCollection[this.hotelIndex].get("data-locationid")+" : "+this.hotelCollection[this.hotelIndex].get("data-name"), 1);
					}.bind(this)
				}
			}))
		},this);
		
		if(this.priceGuide) {
			/*
			this.priceGuide.getElement(".high").setStyles({
				"position":"absolute",
				"bottom":"0px",
				"left":((this.hotelCollection.length-1)*23)+"px"
			});
			
			this.priceGuide.getElement(".medium").setStyles({
				"position":"absolute",
				"bottom":"0px",
				"left":(((this.hotelCollection.length/2)-1)*23)+"px"
			});
			
			this.priceGuide.getElement(".low").setStyles({
				"position":"absolute",
				"bottom":"0px",
				"left":"0px"
			});
			*/
			this.priceGuide.removeClass("hide");
		}
	},
	onWindowResize: function(e) {
		this.viewport = window.getSize(); 
		if(RIA.map) google.maps.event.trigger(RIA.map, "resize");
	},
	toggleInformation: function(e) {
		
		if(e) e.preventDefault();

		if(!e) {
			if(this.options.contenttype == "maximized") {
				if(this.toggleContent) this.toggleContent.set("text", "-");
				this.hotels.removeClass("minimized");
			}
			else {   
				if(this.toggleContent) this.toggleContent.set("text", "+");
				this.hotels.addClass("minimized");				
			}
		} else {
			if(this.hotels.hasClass("minimized")) {
				this.options.contenttype = "maximized";
				if(this.toggleContent) this.toggleContent.set("text", "-");
				this.hotels.removeClass("minimized");
			}
			else {
				this.options.contenttype = "minimized";   
				if(this.toggleContent) this.toggleContent.set("text", "+");
				this.hotels.addClass("minimized");				
			}    
		}
	},
	shareMyBookmarks: function(e) {   
		if(e && e.preventDefault) e.preventDefault();
		
		RIA.currentPriceMax = RIA.InitAjaxSubmit.price.get("value");
		                                                                       
		//priceMax="+RIA.currentPriceMax+"&
		RIA.shareURL = window.location.protocol+"//"+window.location.host+window.location.pathname+"?destination="+(RIA.currentDestination||"")+"&startDate="+this.arrivalDate.get("value")+"&nights="+this.numberOfNights.get("value")+"&brand="+RIA.hotelBrand+"&bookmarks=", keys = [];
		Object.each(RIA.bookmarks, function(value, key) {                
			keys.push(key);
		});    
		
		RIA.shareURL += keys.join(",");
		
		//RIA.shareURL+="&maptype="+this.options.maptype+"&contenttype="+this.options.contenttype+"&viewType="+this.options.viewType+"&fb_ref=message";
		
		//this.fbDialogSend();
		
		if(twttr) {
			this.tweetBox = null;
			document.id("share-dialog-content").empty();
			
			twttr.anywhere(function (T) {
		    	this.tweetBox = T("#share-dialog-content").tweetBox({
					label:"Share saved Hotels with friends",
		      		height: 100,
		      		width: 400,
		      		defaultContent: "My hotels @RazorfishHotels "+RIA.shareURL,
					onTweet: function(plainTextTweet, HTMLTweet) {
						Log.info("TweetBox Tweet sent");
						Log.info(plainTextTweet);
						Log.info(HTMLTweet);
					}
		    	});

		  	}.bind(this));
			this.shareDialog.setStyles({"display":"block"});
			this.shareDialog.store("viewstate", "open"); 
			
			
		}
	},
	toggleTripAdvisorOverlay: function(e) {
		if(this.hotelCollection && this.hotelCollection[this.hotelIndex] && this.hotelCollection[this.hotelIndex].TripAdvisor) {
			this.hotelCollection[this.hotelIndex].TripAdvisor.toggle();
		}
	},
	showPlaces: function(e) {
		e.preventDefault();
		if(this.places.retrieve("viewstate") == "closed") {
    		this.places.store("viewstate", "open"); 
			this.places.setStyles({"display":"block"});
		} else {   
    		this.places.store("viewstate", "closed");
			this.places.setStyles({"display":"none"}); 
		}
		
	},
	showGuardian: function(e) {
		e.preventDefault();
		if(this.guardian.retrieve("viewstate") == "closed") {
    		this.guardian.store("viewstate", "open"); 
			this.guardian.setStyles({"display":"block"});
		} else {   
    		this.guardian.store("viewstate", "closed");
			this.guardian.setStyles({"display":"none"}); 
		}
		
	},
	showShareDialog: function(e) {
		e.preventDefault();
		if(this.shareDialog.retrieve("viewstate") == "closed") {
    		this.shareDialog.store("viewstate", "open"); 
			this.shareDialog.setStyles({"display":"block"});
			this.options.tweetBox = true;
		} else {   
    		this.shareDialog.store("viewstate", "closed");
			this.shareDialog.setStyles({"display":"none"}); 
			this.options.tweetBox = false;
		}
	},
	sortEvent: function(e) {
		try { 
			Log.info("sortEvent");

			if(e) e.preventDefault();
		    
			RIA.InitAjaxSubmit._submit();
		} catch(e) {
			Log.error({method:"sortEvent()", error:e});
		}
		
	},
	sortByRatingHighLow: function(a, b){
		return b.get("data-rating") - a.get("data-rating");
	},
	sortByRatingLowHigh: function(a, b){
		return a.get("data-rating") - b.get("data-rating");
	},
	findHotelsNearMe: function() {
		
		
				   
					
	}
});