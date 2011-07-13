RIA.Experience = new Class({
	Implements:[Options, RIA.MapStreetView],
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
		
		this.fbDialogSendButton = document.id("fb-dialog-send");
		 
		this.travelPartners = document.id("travel-partners");
		this.hotels = document.id("hotels");
        this.hotels.getElement(".results").set("morph", {
			duration:400,
			link:"ignore"
		});
		
		this.storeDefaultStyles();
		
		this.hotelIndex = 0;
		                         
		
		this.mapCanvas = document.id("map_canvas");
		this.mapControl = document.id("toggle-map");
		this.mapStreetview = document.id("pano");
		
		this.addEventListeners();
	},                            
	storeDefaultStyles: function() {
		this.sections.each(function(section) {
			section.store("styles:default", section.getStyles('width', 'height', 'padding', 'border', 'overflow', 'opacity'))
		},this);
		
	},
	addEventListeners: function() {
		
		
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
		
		
		document.getElements(".streetview").each(function(link) {
			link.addEvents({
				"click":function(e) {   
					e.preventDefault();
					
					if(link.getParent("section").hasClass("streetview")) {
						link.getParent("section").removeClass("streetview");
						link.set("text", "less...");
					} else {
						link.getParent("section").addClass("streetview");
						link.set("text", "more...");
					}
				}.bind(this)
			})
		},this);
		
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
	},
	removeHotelNavEventListeners: function() {
		document.removeEvents({
			"keyup":this.hotelNavigationBind 
		});
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
			
				hotelWidth = this.hotels.getElements(".hotel")[0].getCoordinates().width; 
				resultMarginLeft = this.hotels.getElement(".results").getStyle("marginLeft").toInt();
				if(e.key == "left") {
					this.hotelIndex--;
					resultMarginLeft = resultMarginLeft+hotelWidth; 
					if(resultMarginLeft > 0) {
						resultMarginLeft = 0;
						ready = false;
						this.hotelIndex++;
					}
				} else if (e.key == "right") {
					this.hotelIndex++;
					resultMarginLeft = resultMarginLeft-hotelWidth;                                                           
					var totalMarginLeft = -1*(this.hotelCollection.length*this.hotelCollection[0].getStyle("width").toInt())+this.hotelCollection[0].getStyle("width").toInt();
					if(resultMarginLeft < totalMarginLeft) {
						resultMarginLeft = totalMarginLeft;
						ready = false;
						this.hotelIndex--;
					}
					              
				}
				                                                                           
				if(ready) {
					this.hotels.getElement(".results").morph({"marginLeft":resultMarginLeft+"px"});					
					(function() {
						this.setStreetview(this.hotelCollection[this.hotelIndex]);
					}.bind(this)).delay(400);
				}

			}
		}
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
		Log.info(this.hotelCollection)
		var totalLength = (this.hotelCollection.length*this.hotelCollection[0].getSize().x);       
		// Reset the results width and the left margin, so we are in first hotel position
		this.hotels.getElement(".results").setStyles({"width":totalLength+"px", "marginLeft":"0px"});

		this.addHotelNavEventListeners();
		this.setStreetview(this.hotelCollection[0]);
	}
});