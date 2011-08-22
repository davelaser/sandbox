RIA.GoogleAnalyticsHelper = new Class({
	trackEvent: function(category, action, label, value) {
		_gaq.push(['_trackEvent', category, action, label, value]);
	}
})