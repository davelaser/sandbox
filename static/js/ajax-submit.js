RIA.AjaxSubmit = new Class({
	Implements:[Options],
	options:{

	},
	initialize: function(options) {
		this.setOptions(options);
		this.content = document.id("content");
		this.ajaxForm = document.id("start-your-story");
		this.destination = document.id("destination");
		this.flights = document.id("flights");
		this.hotels = document.id("hotels");
		this.cityBreak = document.id("city-break");
        this.information = document.id("info");
		this.weather = document.id("weather");
		this.guardian = document.id("guardian");
		this.requests = [];
		 
		this.loading = document.id("loading");
		this.addEventListeners(); 
		 
		this.ajaxForm.fireEvent("submit");
	},
	addEventListeners: function() {
		this.ajaxForm.addEvents({
			"submit": function(e) {  
				if(e) e.preventDefault();
				this.updateDestinationName(this.destination.get("value"));
				if(this.destination.get("value") != "") {
					this.requestData(this.destination.get("value"));
				}				
			}.bind(this)
		});
	},
	requestData: function(destination) {
		/*
		* 	@description:
		*		Request INDIVIDUAL updates to content buckets
		*/                            
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
			}).send();        
			this.requests.include(this.requestInfo);     
		}
		
		if(this.guardian) {
		   	this.requestGuardian = new Request.HTML({
				method:"POST",
				url:"/ajax",
				update:this.guardian.getElement(".results"),
				data:'destination='+destination+'&info_type=guardian',
				onRequest: this.requestStart.pass([this.guardian],this),
				onSuccess: this.requestSuccessInfo.pass([this.guardian],this),
				onFailure: this.requestFailure.bind(this)
			}).send();        
			this.requests.include(this.requestGuardian);  
		}
		this.requestHotels = new Request.HTML({
			method:"POST",
			url:"/ajax",
			evalScripts:true,
			update:this.hotels.getElement(".results"),
			data:'destination='+destination+'&info_type=hotels',
			onRequest: this.requestStart.pass([this.hotels],this),
			onSuccess: this.requestSuccess.pass([this.hotels],this),
			onFailure: this.requestFailure.bind(this)
		});
		
		this.requests.include(this.requestHotels);
			
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
			RIA.InitExperience.getHotels();
			element.addClass("waiting");
			//element.getElement(".results").morph({"opacity":0});			
			element.getElement(".results").set("morph", {"opacity":0});			
		}
	},
	requestSuccess: function(element) {
		if(element) {
			/*
			* 	Set up the hotels Element Collection
			*/
			this.loading.setStyle("display", "none");
			if(element.get("id") == "hotels") {
				RIA.InitExperience.gotHotels();				     
			}
		}
	},
	requestSuccessInfo: function(element) {
		element.removeClass("waiting");
		element.getElement(".results").morph({"opacity":1});
		var articles = document.getElements('article[data-feed]');
	    for (var i=0,article; article=articles[i]; i++) {
			if (RIA.Class.Article) new RIA.Class.Article(article);
	    }                           

	},
	requestFailure: function(e) {
		Log.error({method:"requestFailure", error:e});
	},
	updateDestinationName: function(name) {
		document.getElements(".destination-name").set("text", name);
	}
});