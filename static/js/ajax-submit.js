RIA.AjaxSubmit = new Class({
	Implements:[Options],
	options:{

	},
	initialize: function(options) {
		this.setOptions(options);
		this.content = document.id("content");
		this.tempContent = document.id("temp-content");
		this.ajaxForm = document.id("controls");
		this.destination = document.id("destination");
		
		this.flights = document.id("flights");
		this.hotels = document.id("hotels");
		this.cityBreak = document.id("city-break");
        this.information = document.id("info");
		this.requests = [];
		
		this.addEventListeners();
	},
	addEventListeners: function() {
		this.ajaxForm.addEvents({
			"submit": function(e) {
				e.preventDefault();
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
		     
		/*
		* 	Cancel any running requests
		*/  
		Array.each(this.requests, function(request) {
			if(request.isRunning()) { 
				Log.info(request);
				request.cancel();
			}
		}, this);
		
		this.requestInfo = new Request.HTML({
			method:"POST",
			url:"/ajax",
			update:this.information,
			onRequest: this.requestStart.pass([this.information],this),
			onSuccess: this.requestSuccessInfo.bind(this),
			onFailure: this.requestFailure.bind(this)
		}).send('destination='+destination+'&info_type=info');
        
		this.requests.include(this.requestInfo);
		
		this.requestCityBreak = new Request.HTML({
			method:"POST",
			url:"/ajax",
			update:this.cityBreak,
			onRequest: this.requestStart.pass([this.cityBreak],this),
			onSuccess: this.requestSuccess.pass([this.cityBreak],this),
			onFailure: this.requestFailure.bind(this)
		}).send('destination='+destination+'&info_type=city-break');
		 
		this.requests.include(this.requestCityBreak);
		
		this.requestHotels = new Request.HTML({
			method:"POST",
			url:"/ajax",
			update:this.hotels,
			onRequest: this.requestStart.pass([this.hotels],this),
			onSuccess: this.requestSuccess.pass([this.hotels],this),
			onFailure: this.requestFailure.bind(this)
		}).send('destination='+destination+'&info_type=hotels');
		
		this.requests.include(this.requestHotels);
		
		this.requestFlights = new Request.HTML({
			method:"POST",
			url:"/ajax",
			update:this.flights,
			onRequest: this.requestStart.pass([this.flights],this),
			onSuccess: this.requestSuccess.pass([this.flights],this),
			onFailure: this.requestFailure.bind(this)
		}).send('destination='+destination+'&info_type=flights');
        
		this.requests.include(this.requestFlights); 
		
		
		
	},
	requestStart: function(element) {
		element.addClass("waiting");
		element.getChildren().morph({"opacity":0});
	},
	requestSuccess: function(element) {
		element.removeClass("waiting");
		RIA.MapHandler.init(); 
	},
	requestSuccessInfo: function() {
		this.information.removeClass("waiting");
		
		var articles = document.getElements('article[data-feed]');
	    for (var i=0,article; article=articles[i]; i++) {
			new RIA.Class.Article(article);
	    }
	},
	requestFailure: function(e) {
		Log.error({method:"requestFailure", error:e});
	},
	updateDestinationName: function(name) {
		document.getElements(".destination-name").set("text", name);
	}
});