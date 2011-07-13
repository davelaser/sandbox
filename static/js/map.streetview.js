RIA.MapStreetView = new Class({
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
	setStreetview: function(hotel) {       
		var address = hotel.getElement(".address").get("text");
		RIA.geocoder.geocode( { 'address': address}, function(results, status) {
			Log.info("Getting address geocode data for address: "+address);
			if (status == google.maps.GeocoderStatus.OK) {
				this.mapStreetview.setStyle("display", "");          
				var location = results[0].geometry.location;
				RIA.map.setCenter(results[0].geometry.location);
				RIA.panorama.setPosition(results[0].geometry.location);
				RIA.panorama.setPov({
					heading: 1,
					zoom:0,
					pitch:0}
				);
				
			} else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
		        this.mapStreetview.setStyle("display", "none");                                    
				Log.info("No Geocode results found, switching off StreetView Panorama");
			} else {
				Log.info("Geocode was not successful for the following reason: status: " + status);
			}
		}.bind(this));		
	}	
});