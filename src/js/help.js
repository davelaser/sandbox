RIA.Help = new Class({
	options:{
		help:[
			"#main",
			"#map-controls",
			"#hotels",
			"#horizontal",
			"#save-share-places",
			"#filters",
			"#social"
		]
	},
	setHelp: function() {
		Array.each(this.options.help, function(element) {
			document.getElement(element).addClass("help");			
		},this);
		
		this.helpIndex = -1;
	},
	stepThroughHelp: function() {
		if(document.getElement(this.options.help[this.helpIndex])) {
			document.getElement(this.options.help[this.helpIndex]).removeClass("help-active");
		}
		
		this.helpIndex++;
		
		if(document.getElement(this.options.help[this.helpIndex])) {
			document.getElement(this.options.help[this.helpIndex]).addClass("help-active");
		}		
		
		this.stepThroughHelp.delay(5000, this);
	}
});