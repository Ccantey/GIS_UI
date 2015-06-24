define(
[],
function() {

  


  var config = {
    mapServices:{
       vector: "http://gis.wirapids.org/arcgis/rest/services/VectorBasemap2015/MapServer",
       dynamic: "http://gis.wirapids.org/arcgis/rest/services/CityViewerLiteDynamic/MapServer",
       aerial: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/"
    },     
    helperServices: {
       geometry:"http://gis.wirapids.org/arcgis/rest/services/Utilities/Geometry/GeometryServer",
       print: "http://gis.wirapids.org/arcgis/rest/services/GeoProcessingServices/ExportWebMap/GPServer/Export%20Web%20Map"// + "?token=" + token
    },
  utilityLayerID:[-1],
  parcelLayerID: [21],
  csvUrl: "http://gis.wirapids.org/CityViewerLite/outputs/parcelInfo.csv",
  mailLink: "http://gis.wirapids.org/CityViewerLite/outputs/",
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