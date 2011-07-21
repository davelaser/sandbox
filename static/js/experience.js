RIA.Experience = new Class({
	Implements:[Options, RIA.MapStreetView, RIA.GooglePlaces],
	options:{
		
	},
	initialize: function(options) {
		this.setOptions(options);
		
		
		this.sections = document.getElements("section");
		this.destination = document.id("destination");
		this.destination.store("styles:width:orig", this.destination.getStyle("width").toInt());
		this.durationOfStay = document.id("duration_of_stay");
		this.durationOfStay.store("styles:width:orig", this.durationOfStay.getStyle("width").toInt());
		this.arrivalDate = document.id("arrival_date");
		this.arrivalDate.store("styles:width:orig", this.arrivalDate.getStyle("width").toInt());
		this.weather = document.id("weather");
		this.guardian = document.id("guardian");
		this.twitterNews = document.id("twitter-news");
		this.fbDialogSendButton = document.id("fb-dialog-send");
		 
		this.travelPartners = document.id("travel-partners");
		this.hotels = document.id("hotels"); 
		this.hotelsNav = document.id("hotel-list");
		
        this.hotels.getElement(".results").set("morph", {
			duration:400,
			link:"ignore"
		});
		                         		
		this.mapCanvas = document.id("map_canvas");
		this.mapCanvas.store("styles:orig", this.mapCanvas.getCoordinates());
		this.mapCanvas.store("styles:maximized", {width:"100%", height:"100%"});
		this.mapCanvas.store("view:state", "minimized");
		
		this.mapStreetview = document.id("pano");
		this.onWindowResize();
		this.addEventListeners();  
		
		if(this.options.contenttype && this.options.contenttype == "minimized") {
			this.toggleInformation(null);
		}

	},                            
	addEventListeners: function() {
		
		window.addEvents({
			"resize": this.onWindowResize.bind(this)
		});
		
		this.destination.addEvents({
			"keydown": this.adjustInputStyles.bind(this)
		});   
		this.durationOfStay.addEvents({
			"keydown": this.adjustInputStyles.bind(this)
		}); 
		this.arrivalDate.addEvents({
			"keydown": this.adjustInputStyles.bind(this)
		});
		
		if(this.fbDialogSendButton) {
			this.fbDialogSendButton.addEvents({
				"click":this.fbSendDialog.bind(this)
			});
		}  
		
		document.id("map-streetview").addEvents({
			"click":this.toggleMapFullScreen.bind(this)
		});
                                            
		document.getElements(".less").addEvents({
			"click":this.toggleInformation.bind(this) 
		});
           
		document.id("less-more").addEvents({
			"click":this.toggleInformation.bind(this) 
		});
		     
		                           
		if(document.id("my-bookmarks")) {
			document.id("my-bookmarks").addEvents({
				"click":this.showMyBookmarks.bind(this)
			});			
		}
	},
	fbSendDialog: function() {
		RIA.InitAjaxSubmit.loading.setStyle("display", "block");
		RIA.InitAjaxSubmit.loading.addEvent("click", function() {
			RIA.InitAjaxSubmit.loading.setStyle("display", "none");
		});
		document.id("loading-message").setStyle("display", "none");
		this.fbDialogSend();
	},
	addHotelNavEventListeners: function() {
		this.hotelNavigationBind = this.hotelNavigation.bind(this)
		document.addEvents({
			"keyup":this.hotelNavigationBind 
		});
		
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
		Log.info("removeHotelNavEventListeners")
		Log.info(this.hotelNavigationBind);
		
		document.removeEvents({
			"keyup":this.hotelNavigationBind 
		});
		
		document.getElements(".drop-pin").each(function(dropPinButton) {
			dropPinButton.removeEvents({
				"click":this.dropBookmarkPinBind
			});
		},this)
	},     
	adjustInputStyles: function(e) {
		e.target.removeClass("unentered");
		var charLength = e.target.get("value").length, fontSize = e.target.getStyle("font-size").toInt(), width;
		width = Math.round((charLength*(fontSize/1.85)));
			if(width > e.target.retrieve("styles:width:orig")) {
			e.target.setStyle("width", width+"px")			
		}
	},	
	fbDialogSend: function() {
		FB.ui({
			access_token:"107619156000640|2.AQDYiMAIDC1ZFl35.3600.1311001200.0-100002195041453|1KzV-kC3q6-FnyWdsVjdgZg8uCE",
			method: 'send',
			display:'iframe',
          	name: 'Checkout this Hotel, on Lastminute.com',
			link: 'http://localhost:8087/experience',
		});
		this.addDraggable(document.getElements(".fb_dialog.loading"));
	},
	addDraggable: function(elements) {
		elements.each(function(element) {
			new Drag(element, { 
			    snap: 0,
			    onSnap: function(el){
			        el.addClass('dragging');
			    },
			    onComplete: function(el){
			        el.removeClass('dragging');
			    }
			});	  
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
				Log.info("Navigating : this.hotelIndex : "+this.hotelIndex);
				this.animateToHotel(this.hotelCollection[this.hotelIndex]);
				(function() {
					this.setStreetview(this.hotelCollection[this.hotelIndex]);
				}.bind(this)).delay(400);
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
		this.removeHotelNavEventListeners();
	},
	gotHotels: function() {    
		/*
		* 	Callback from AjaxSubmit successful get of hotel data
		*/
		
		// reset the hotel index, so we are in first hotel position
		this.hotelIndex = 0;
		this.hotelCollection = this.hotels.getElements(".hotel");
		
		this.hotels.removeClass("waiting");
		this.hotels.getElement(".results").morph({"opacity":1});
		
		if(this.hotelCollection.length > 0) { 
			this.addHotelNavEventListeners();
			this.createHotelNav();
			
			this.hotelWidth = this.hotels.getElements(".hotel")[0].getCoordinates().width;
			
			/*
			this.hotels.getElements(".photos").each(function(photoContainer) {
				var text = photoContainer.get("text").clean();
				text.replace(" ","");
				var temp = new Element("div").set("html", text);
				photoContainer.innerHTML = "";
				temp.inject(photoContainer)
			});
			*/
			this.totalLength = (this.hotelCollection.length*this.hotelWidth);
			
			// Reset the results width and the left margin, so we are in first hotel position
			this.hotels.getElement(".results").setStyles({"width":this.totalLength+"px", "marginLeft":"0px"});

			
			this.setStreetview(this.hotelCollection[0]);
			    
			if(this.options.bookmarks != null && this.options.bookmarks.length) {
				this.setBookmarkMarkers(this.hotelCollection);
			}
            
			this.setHotelMarkers(this.hotelCollection);
            
			Log.info("this.hotelIndex: "+this.hotelIndex);
			
		} else {
			Log.error({method:"gotHotels()", error:{message:"No Hotels returned"}});
		}   
		
	}, 
	createHotelNav: function() {
		
		this.hotelsNav.empty();
		this.hotelCollection.each(function(hotel, index) {
			this.hotelsNav.adopt(new Element("a", {
				"href":"#",
				"text":(index+1),
				"class":(index == 0 ? "active" : ""),
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
		if(this.hotels.hasClass("minimized")) {
			document.id("less-more").set("text", "less...");
			if(this.weather) this.weather.setStyle("display", "block");
			if(this.guardian) this.guardian.setStyle("display", "block");
			if(this.twitterNews) this.twitterNews.setStyle("display", "block");
			this.hotels.removeClass("minimized");
		}
		else {   
			document.id("less-more").set("text", "more...");
			if(this.weather) this.weather.setStyle("display", "none");
			if(this.guardian) this.guardian.setStyle("display", "none");
			if(this.twitterNews) this.twitterNews.setStyle("display", "none");
			this.hotels.addClass("minimized");				
		}
	}
});