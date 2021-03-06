document.body.className = 'js';

RIA = {
    fn : {
        populateContainer : function(container,html) {
            var container = document.id(container).getElement(".results");
            container.innerHTML = html.join('');
        }
    }
};

RIA.Article = new Class({
	initialize: function(article) {
		Log.info("RIA.Article");
		
		this.article = article;

		this.feed = this.article.get("data-feed");
        if (!this.feed) return;
        this.id = this.article.id;
        this.get();
	},
	get: function() {
        this.scpt = document.createElement('script');
        this.scpt.src = this.feed+'&callback='+this.id;
        document.body.appendChild(this.scpt);
    }
});

/*
(function() {
    var articles = document.getElements('article[data-feed]');
    for (var i=0,article; article=articles[i]; i++) {
		new RIA.Article(article);
    }
})();
*/
function weather(data) {
    var html = [];   
	if(typeof(data.query.results.channel) == "object") {
	    html.push('<h3>'+data.query.results.channel[0].description+'</h3>');
	    html.push('<p>'+data.query.results.channel[0].item.description+'</p>');		
	} else {
	    html.push('<h3>'+data.query.results.channel.description+'</h3>');
	    html.push('<p>'+data.query.results.channel.item.description+'</p>');
   	}
    RIA.fn.populateContainer('weather',html);
}

function news(data) {
    var html = [];
    var items = data.response.results;
    for (var i=0,item; item=items[i]; i++) {
		if(i<5) {
			html.push('<h3><a href="'+item.webUrl+'" rel="external" target="_blank">'+item.fields.headline+'</a></h3>'+item.fields.trailText);
		}        
    }
    RIA.fn.populateContainer('guardian',html);
}