RIA.Gradient = new Class({
   generateGradient: function(from, to, steps) {
		var fromStr = from.toString(16), toStr = to.toString(16),fromRGB = {},toRGB = {},stepRGB = {},gradientColours = new Array();
		
	    fromRGB["r"] = parseInt(fromStr.substring(0, 2), 16);
	    fromRGB["g"] = parseInt(fromStr.substring(2, 4), 16);
	    fromRGB["b"] = parseInt(fromStr.substring(4, 6), 16);

		toRGB["r"] = parseInt(toStr.substring(0,2), 16);
	    toRGB["g"] = parseInt(toStr.substring(2,4), 16);
		toRGB["b"] = parseInt(toStr.substring(4,6), 16);
        
	    stepRGB["r"] = (fromRGB["r"] - toRGB["r"]) / (steps - 1);
	    stepRGB["g"] = (fromRGB["g"] - toRGB["g"]) / (steps - 1);
	    stepRGB["b"] = (fromRGB["b"] - toRGB["b"]) / (steps - 1);
        
		for (var i = 0; i < steps; i++) {
	        var RGB = {}; 
			
			var rgbR = Math.floor(fromRGB["r"] - (stepRGB["r"] * i)); 
			var rgbG = Math.floor(fromRGB["g"] - (stepRGB["g"] * i));
			var rgbB = Math.floor(fromRGB["b"] - (stepRGB["b"] * i));

	        RGB["r"] = rgbR.toString(16);
	        
			if(rgbG < 0) {
				RGB["g"] = "00";
			} else {
				RGB["g"] = rgbG.toString(16);
			}                 
			
	        RGB["b"] = rgbB.toString(16);                    
			
			if (RGB["r"].length === 1) RGB["r"] = "0" + RGB["r"];
	        if (RGB["g"].length === 1) RGB["g"] = "0" + RGB["g"];
	        if (RGB["b"].length === 1) RGB["b"] = "0" + RGB["b"];

			gradientColours.push(RGB["r"]+RGB["g"]+RGB["b"]);
	    }              

	    return gradientColours;
	} 
});