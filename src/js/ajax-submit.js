RIA.AjaxSubmit = new Class({
	Implements:[Options, RIA.GoogleAnalyticsHelper],
	options:{
        servicePath:null
	},
	initialize: function(options) {
		this.setOptions(options);
		this.content = document.id("content");
		this.ajaxForm = document.id("search");
		this.destination = document.id("destination");
		this.price = document.id("priceMax");
		this.arrivalDate = document.id("arrival_date");
		this.numberOfNights = document.id("nights");
		RIA.currentPriceMax = this.price.get("value");
		
		this.priceSort = document.id("priceSort");
		this.ratingSort = document.id("ratingSort");
		
		//Log.info("RIA.AjaxSubmit : RIA.currentPriceMax: "+RIA.currentPriceMax);
		
		this.flights = document.id("flights");
		this.hotels = document.id("hotels");
		this.cityBreak = document.id("city-break");
        this.information = document.id("info");
		this.weather = document.id("weather");
		this.guardian = document.id("guardian");
		this.requests = [];
		 
		this.loading = document.id("loading");
		this.addEventListeners(); 
		 
		
	},
	_submit: function() {
		this.ajaxForm.fireEvent("submit");
	},
	addEventListeners: function() {
		this.ajaxForm.addEvents({
			"submit": this.validateSearch.bind(this)
		});
		
		this.arrivalDate.addEvents({
			"focus":function() {
				if(this.get("value") == this.get("data-default")) {
					this.set("value", "");
				}
			},
			"blur": function(e) {
				if(this.get("value") == "") {
					this.set("value", this.get("data-default"));
				}
			}
		});
	},
	validateSearch: function(e) {
		if(e) e.preventDefault();
		
		this.ajaxForm.getElements("input").each(function(element) {
			element.removeClass("error");
		},this);
		
		var validSearch = true, isValidArrivalDate = false, dateParsed;
		
		this.ajaxForm.getElements("input").each(function(element) {
			if(element.get("data-required") == "true" && element.get("value") == "") {
				element.addClass("error");
				validSearch = false;
			}
		},this);
		
		if(validSearch) {
			this.requestData();
			this.updateDestinationName(this.destination.get("value"));			
		} else {
			Log.info("Search Form user input data validation error");			
		}
		
	},
	requestData: function() {
		/*
		* 	@description:
		*		Request INDIVIDUAL updates to content buckets
		*/ 
		var destination = this.destination.get("value");                           
		
		if(typeof(twitterSearch) != "undefined") {
			twitterSearch.stop();         
			twitterSearch.search = destination+" hotels OR restaurants since:2011-07-16 :)";
			twitterSearch.subject = destination;
			twitterSearch.render().start();
		}
		
		/*
		* 	Cancel any running requests
		*/  
		Array.each(this.requests, function(request) {
			if(request.isRunning()) { 
				Log.info(request);
				request.cancel();
			}
		}, this);
		this.requests.length = 0;
		
		if(this.weather) {
			this.requestInfo = new Request.HTML({
				method:"POST",
				url:"/ajax",
				update:this.weather.getElement(".results"),
				data:'destination='+destination+'&info_type=weather',
				onRequest: this.requestStart.pass([this.weather],this),
				onSuccess: this.requestSuccessInfo.pass([this.weather],this),
				onFailure: this.requestFailure.bind(this)
			});
			this.requests.include(this.requestInfo);     
		}
		
		
		if(this.guardian) {
		   	this.requestGuardian = new Request.HTML({
				method:"POST",
				url:"/ajax",
				update:this.guardian.getElement(".results"),
				data:'destination='+destination+'&info_type=guardian',
				onRequest: function() {
					this.guardian.getElement(".results").empty();
				}.bind(this),
				onSuccess: this.requestSuccessInfo.bind(this),
				onFailure: this.requestFailure.bind(this)
			});   
			this.requests.include(this.requestGuardian);  
		}
		
		
		if(RIA.InitExperience.options.brand != "" && RIA.InitExperience.options.brand == "lastminute") {
			this.requestHotels = new Request.HTML({
				method:"POST",
				url:this.options.servicePath,
				evalScripts:false,
				update:this.hotels.getElement(".results"),
				data:'destination='+destination+'&priceMax='+this.price.get("value")+'&info_type=hotels&startDate='+this.arrivalDate.get("value")+"&nights="+this.numberOfNights.get("value"),
				onRequest: this.requestStart.pass([this.hotels],this),
				onSuccess: this.requestSuccess.pass([this.hotels, destination],this),
				onFailure: this.requestFailure.bind(this)
			});
			this.requests.include(this.requestHotels); 
		}
		else if(RIA.InitExperience.options.brand != "" && RIA.InitExperience.options.brand == "expedia") {
			this.requestHotels = new Request.HTML({
				method:"POST",
				url:this.options.servicePath,
				evalScripts:false,
				update:this.hotels.getElement(".results"),
				data:'city='+destination+'&arrivalDate='+this.arrivalDate.get("value")+"&nights="+this.numberOfNights.get("value"),
				onRequest: this.requestStart.pass([this.hotels],this),
				onSuccess: this.requestSuccess.pass([this.hotels, destination],this),
				onFailure: this.requestFailure.bind(this)
			});
			this.requests.include(this.requestHotels);
		}
		else if(RIA.InitExperience.options.brand != "" && RIA.InitExperience.options.brand == "razorfish") {
			this.requestHotels = new Request.HTML({
				method:"POST",
				url:this.options.servicePath,
				evalScripts:false,
				update:this.hotels.getElement(".results"),
				data:'city='+destination+'&arrivalDate='+this.arrivalDate.get("value")+"&nights="+this.numberOfNights.get("value")+"&priceMax="+this.price.get("value")+"&priceSort="+this.priceSort.get("value")+"&ratingSort="+this.ratingSort.get("value"),
				onRequest: this.requestStart.pass([this.hotels],this),
				onSuccess: this.requestSuccess.pass([this.hotels, destination],this),
				onFailure: this.requestFailure.bind(this)
			});
			this.requests.include(this.requestHotels);
		}
		

		this.trackEvent('Hotel', 'Search', destination+", "+this.arrivalDate.get("value")+", "+this.numberOfNights.get("value"), 1);	
		
		/*
		this.requestFlights = new Request.HTML({
			method:"POST",
			url:"/ajax",
			update:this.flights.getElement(".results"),
			data:'destination='+destination+'&info_type=flights',
			onRequest: this.requestStart.pass([this.flights],this),
			onSuccess: this.requestSuccess.pass([this.flights],this),
			onFailure: this.requestFailure.bind(this)
		});        
		this.requests.include(this.requestFlights); 
		*/ 
		/*
		this.requestCityBreak = new Request.HTML({
			method:"POST",
			url:"/ajax",
			update:this.cityBreak.getElement(".results"),
			data:'destination='+destination+'&info_type=city-break',
			onRequest: this.requestStart.pass([this.cityBreak],this),
			onSuccess: this.requestSuccess.pass([this.cityBreak],this),
			onFailure: this.requestFailure.bind(this)
		});		 
		this.requests.include(this.requestCityBreak);
		*/
		
	    this.requests.each(function(request) {
			request.send();
		});
	},
	requestStart: function(element) {
		if(element) {
			this.loading.setStyle("display", "block");
			if(element.get("id") == "hotels") {
				RIA.InitExperience.getHotels();
			}
			element.addClass("waiting");
			//element.getElement(".results").morph({"opacity":0});			
			element.getElement(".results").set("morph", {"opacity":0});			
		}
	},
	requestSuccess: function(element, destination) {
		if(element) {
			/*
			* 	Set up the hotels Element Collection
			*/
			this.loading.setStyle("display", "none");
			if(element.get("id") == "hotels") { 
				if(element.hasClass("hide")) element.removeClass("hide");
				RIA.InitExperience.gotHotels(destination);				     
			}
		}
	},
	requestSuccessInfo: function(responseHTML, responseText) {
		try{
			//Log.info("Received Guardian news data");
	    } catch(e) {
			Log.error({method:"requestSuccessInfo", error:e});
		}
	},
	requestFailure: function(e) {
		Log.error({method:"requestFailure", error:e});
	},
	updateDestinationName: function(name) {
		document.getElements(".destination-name").set("text", name);
	}
});