define(
[],
function() {
  var config = {
    mapServices:{
       vector: "http://Your/arcgis/rest/services/VectorBasemapHybrid/MapServer",
       dynamic: "http://Your/arcgis/rest/services/DynamicBasemap/MapServer",
       aerial: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/"
    },     
    helperServices: {
       geometry:"http://Your/arcgis/rest/services/Utilities/Geometry/GeometryServer",
       print: "http://Your/arcgis/rest/services/ExportWebMap/GPServer/Export%20Web%20Map"
    },
	utilityLayerID:[-1],
	parcelLayerID: [27],
	csvUrl: "http://Your/CityViewer/outputs/parcelInfo.csv",
	mailLink: "https://Your/CityViewer/outputs/",
	identifyLayerAdditional:[]
	
};
  
  // could use a has() test to optionally populate some global
  // property so that the stuff defined is in some global identifier
  //
  // instead, just populate a global, will need to remove the next line when
  // when we remove support for loading modules with dojo.require
  // which will be when we move to Dojo 2.0
  commonConfig = config;
  // instead of using a global, this should probably be added to some namespace...
  // do the templates have a common namespace that they use?

  return config;  
});
