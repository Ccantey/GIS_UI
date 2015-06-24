define(["esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",  "esri/symbols/PictureMarkerSymbol", "esri/Color"
],
function(SimpleMarkerSymbol,SimpleLineSymbol, SimpleFillSymbol, PictureMarkerSymbol, Color ) {
  var symbols = {
	   point: new SimpleMarkerSymbol("circle", 15, new SimpleLineSymbol("solid", new Color([255, 155, 0]), 1), new Color([206, 206, 206, 1])),
	   polyline: new SimpleLineSymbol("solid", new Color([255, 155, 0]), 4),
	   polygon: new SimpleFillSymbol("solid", new SimpleLineSymbol("solid", new Color([255, 155, 0]), 2), new Color([255, 155, 0, 0.25])),
	   polygonMeasure: new SimpleFillSymbol("solid", new SimpleLineSymbol("solid", new Color([255, 155, 0]), 2), new Color([255, 155, 0, 0.65])),
	   multipoint: new SimpleMarkerSymbol("diamond", 20, new SimpleLineSymbol("solid", new Color([0, 0, 0]), 1), new Color([0, 0, 255, 0.5])),
	   buffer: new SimpleFillSymbol("solid", new SimpleLineSymbol("solid", new Color([255, 200, 0]), 2), new Color([155, 155, 155, 0.5])),
	   Picture: PictureMarkerSymbol("images/bluedot.png", 40, 40),
	   textSymbol: null
	}

  
  // could use a has() test to optionally populate some global
  // property so that the stuff defined is in some global identifier
  //
  // instead, just populate a global, will need to remove the next line when
  // when we remove support for loading modules with dojo.require
  // which will be when we move to Dojo 2.0
  //commonConfig = config;
  // instead of using a global, this should probably be added to some namespace...
  // do the templates have a common namespace that they use?

  return symbols;  
});