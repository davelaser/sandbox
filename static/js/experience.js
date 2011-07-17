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
        this.hotels.getElement(".results").set("morph", {
			duration:400,
			link:"ignore"
		});
		                         		
		this.mapCanvas = document.id("map_canvas");
		this.mapCanvas.store("styles:orig", this.mapCanvas.getCoordinates()); 
		
		this.mapControl = document.id("toggle-map");
		this.mapStreetview = document.id("pano");
		this.onWindowResize();
		this.addEventListeners();
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
				"click":this.fbDialogSend.bind(this)
			});
		}  
		
		document.addEvents({
			"keyup":this.toggleMapFullScreen.bind(this)
		});
		                                              
		document.getElements(".streetview").addEvents({
			"click":this.toggleInformation.bind(this) 
		})

		
		if(this.mapControl) {
			this.mapControl.addEvents({
				"click":this.toggleMap.bind(this)
			});
		}	
	},
	addHotelNavEventListeners: function() {
		this.hotelNavigationBind = this.hotelNavigation.bind(this)
		document.addEvents({
			"keyup":this.hotelNavigationBind 
		});
		
		this.dropPinBind = this.dropPin.bind(this);
		document.getElements(".drop-pin").each(function(dropPinButton) {
			dropPinButton.addEvents({
				"click":this.dropPinBind
			});
		},this)
	},
	removeHotelNavEventListeners: function() {
		document.removeEvents({
			"keyup":this.hotelNavigationBind 
		});
		
		document.getElements(".drop-pin").each(function(dropPinButton) {
			dropPinButton.removeEvents({
				"click":this.dropPinBind
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
			access_token:"107619156000640|2.AQAZAAZfqnGOj7eI.3600.1310576400.0-100002195041453|D58HS5Nk3qKuLRFF03KENe0Fvf8",
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
		if(e.key == "left" || e.key == "right") {
			e.preventDefault();                                       
			var hotelWidth, resultMarginLeft, ready = true;
			
			if(this.hotels.getElements(".hotel").length > 0) {                        
			
				resultMarginLeft = this.hotels.getElement(".results").getStyle("marginLeft");
				
				if(e.key == "left") {
					if(resultMarginLeft.toInt() >= 0) {
						resultMarginLeft = 0;
						ready = false;						
					} else {
						this.hotelIndex--;
						resultMarginLeft = resultMarginLeft.toInt()+this.hotelWidth;
					} 
					
				} else if (e.key == "right") {
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
					this.animateToHotel(this.hotelCollection[this.hotelIndex]);
					(function() {
						this.setStreetview(this.hotelCollection[this.hotelIndex]);
					}.bind(this)).delay(400);
				}

			}
		}
	},
	animateToHotel: function(hotel) {  
		var hotelIndex = hotel.get("data-counter"), 
		resultMarginLeft = -1*(hotelIndex*this.hotelWidth)+this.hotelWidth;
		this.hotels.getElement(".results").morph({"marginLeft":resultMarginLeft+"px"});
		this.hotelIndex = hotelIndex-1;
	},
	jumpToHotel: function(hotel) {
		var hotelIndex = hotel.get("data-counter"), 
		resultMarginLeft = -1*(hotelIndex*this.hotelWidth)+this.hotelWidth;
		this.hotels.getElement(".results").setStyles({"marginLeft":resultMarginLeft+"px"});
		this.hotelIndex = hotelIndex-1;
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
			this.hotelWidth = this.hotels.getElements(".hotel")[0].getCoordinates().width;
			
			this.hotels.getElements(".photos").each(function(photoContainer) {
				var text = photoContainer.get("text").clean();
				text.replace(" ","");
				var temp = new Element("div").set("html", text);
				photoContainer.innerHTML = "";
				temp.inject(photoContainer)
			});
			
			this.totalLength = (this.hotelCollection.length*this.hotelWidth);
			
			// Reset the results width and the left margin, so we are in first hotel position
			this.hotels.getElement(".results").setStyles({"width":this.totalLength+"px", "marginLeft":"0px"});

			this.addHotelNavEventListeners();
			this.setStreetview(this.hotelCollection[0]);			
		} else {
			Log.error({method:"gotHotels()", error:{message:"No Hotels returned"}});
		}   
		
	},
	onWindowResize: function(e) {
    	this.viewport = window.getSize(); 
		//this.mapStreetview.setStyles({"width":this.viewport.x+"px", "height":this.viewport.y+"px"});
		//if(RIA.map) google.maps.event.trigger(RIA.map, "resize");
	},
	toggleInformation: function(e) {
		
		e.preventDefault();
		if(this.hotels.hasClass("streetview")) {
			e.target.set("text", "less...");
			this.weather.setStyle("display", "block");
			if(this.guardian) this.guardian.setStyle("display", "block");
			this.twitterNews.setStyle("display", "block");
			this.hotels.removeClass("streetview");
		}
		else {   
			e.target.set("text", "more...");
			this.weather.setStyle("display", "none");
			if(this.guardian) this.guardian.setStyle("display", "none");
			this.twitterNews.setStyle("display", "none");
			this.hotels.addClass("streetview");				
		}
	}
});