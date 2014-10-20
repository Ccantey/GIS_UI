var geometryDraw = [];
var geometryBuffer = [];
var selectedFeatures = { features: [] };
var unselectedGeometry = { features: [] };
var symbolDraw;
var attrAll = [];
var labelling = false;
var attValues = [];
var csvInfo = [];
var mailParcels = [];
var measureGraphic = null;
var measureGeometry = null;
var multipleIdentifyStack = [];
var multipleIdentifyLayerName = [];

function navEvent(task) {
    "use strict";
    switch (task) {
    case 'defaultIdentify':
        operationToDo = 'identify';
        map.setMapCursor("default");
        iTool.activate(iTool._geometryType='point');
        map.enablePan();
        $('.radioset').find(':radio').prop("checked", false);
        $('.radioset').buttonset('refresh');
        $('.results.identify').hide();
        $("#multipleSelectSelectBoxItContainer").hide();
        geometryBuffer = [];
        break;
    case 'point':
        operationToDo = 'selection';
        iTool.activate(iTool._geometryType='point');
        $("#multipleSelectSelectBoxItContainer").hide();
        break;
    case 'line':
        operationToDo = 'selection';
        iTool.activate(iTool._geometryType='polyline');
        $("#multipleSelectSelectBoxItContainer").hide();
        break;
    case 'polygon':
        operationToDo = 'selection';
        iTool.activate(iTool._geometryType='polygon');
        $("#multipleSelectSelectBoxItContainer").hide();
        break;
    case 'clear':
        map.graphics.clear();
        tempGraphicLayer.clear();
        // look for variables holding values in memory like mesureGeometry
        measureGeometry = null;
        operationToDo = 'identify';
        iTool.activate(iTool._geometryType='point');
        geometryBuffer = [];
        selectedFeatures = { features: [] };
        unselectedGeometry = { features: [] };
        attrAll = [];
        attValues = [];
        csvInfo = [];
        mailParcels = [];
        $('#search-tab a').removeClass('notice');
        $('#menu-toggle').removeClass('tab');
        $('.results.identify').hide();
        $('.results.multipleBuffer').hide();
        $('.results.multiple').hide();
        //$('#searchfooter, #toolsfooter').css({'position': 'absolute', 'bottom': '7%'});
        $('#drawPoint').prop("checked",true);
        $('.radioset').buttonset('refresh');
        map.enablePan();
        break;
    case 'tools clear':
        map.graphics.clear();
        tempGraphicLayer.clear();
         // look for variables holding values in memory like mesureGeometry
        measureGeometry = null;
        operationToDo = 'identify';
        iTool.activate(iTool._geometryType='point');
        geometryBuffer = [];
        selectedFeatures = { features: [] };
        unselectedGeometry = { features: [] };
        attrAll = [];
        attValues = [];
        csvInfo = [];
        mailParcels = [];
        $('#search-tab a').removeClass('notice');
        $('#menu-toggle').removeClass('tab');
        $('.results.identify').hide();
        $('.results.multipleBuffer').hide();
        $('.results.multiple').hide();
        $('#mailLabelBox').hide();
        $('.radioset').buttonset('refresh');
        $('.dDot,.drawLine,.Extent').removeClass('ui-state-active');
        map.enablePan();
        break;
    case 'clearDrawing':
        graphicLayer.clear();
        graphicLayerLabels.clear();
        operationToDo = 'identify';
        iTool.activate(iTool._geometryType='point');
        $('.radioset').find(':radio').prop("checked", false);
        $('.radioset').buttonset('refresh');
        map.enablePan();
        $('#search-tab a').removeClass('notice');
        $('#menu-toggle').removeClass('tab');
        break;
    case "resetMap":
        map.graphics.clear();
        graphicLayer.clear();
        tempGraphicLayer.clear();
        graphicLayerLabels.clear();
        var inputs = dojo.query(".utilityLayer,.aerial,.parentLayer,.overlayLayer,.groupLayer");
        var i;
        var il;
        var layerCheckState;
        for (i = 0, il = inputs.length; i < il; i++) {
            layerCheckState = $(inputs[i]).find("input:first");
            layerCheckState.prop("checked",false);
            layerCheckState.prev().prev().removeClass("checked");
            //console.log(layerCheckState);
        };
        $('#search-tab a').removeClass('notice');
        $('#menu-toggle').removeClass('tab');
        overlayLayer.setVisibleLayers([-1]); //Resets tab content but does not reset the checkboxes
        utilityMap.setVisibleLayers([-1]);
        aerialLayer.hide();
        basemap.show();
        operationToDo = 'identify';
        iTool.activate(iTool._geometryType='point');
        geometryBuffer = [];
        selectedFeatures = { features: [] };
        unselectedGeometry = { features: [] };
        attrAll = [];
        attValues = [];
        csvInfo = [];
        mailParcels = [];
        $('.radioset').find(':radio').prop("checked", false);
        $('.radioset').buttonset('refresh');
        $('.results.identify').hide();
        $('.results.multiple').hide();
        $('.results.multipleBuffer').hide();
        $('#toggleThis').removeClass('vectorToggle').addClass('aerialToggle').attr('src','images/Aerial.png');
        map.enablePan();
        map.setExtent(initExtent);
        break;
    case "gps":
        if (navigator.geolocation) {
        //if you want to track as the user moves setup navigator.geolocation.watchPostion
        $("#loading").show();
        navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
        }
        break;
    case "measureLine":
        operationToDo = 'measure';
        measureGeometry = null;
        iTool.activate(iTool._geometryType='polyline');
        break;
    case "measurePolygon":
        operationToDo = 'measure';
        measureGeometry = null;
        iTool.activate(iTool._geometryType='polygon');
        break;
    case "drawingPolygon":
        operationToDo = 'drawing';
        labelling = false;
        map.disablePan();
        iTool.activate(iTool._geometryType='polygon');
        break;
    case "drawingLine":
        operationToDo = 'drawing';
        labelling = false;
        map.disablePan();
        iTool.activate(iTool._geometryType='polyline');
        break;
    case "drawingPoint":
        operationToDo = 'drawing';
        labelling = false;
        map.disablePan();
        iTool.activate(iTool._geometryType='point');
        break;
    case "drawingText":
        operationToDo = 'drawing';
        labelling = true;
        map.disablePan();
        iTool.activate(iTool._geometryType='point');
        break;

    }
}

function locationError(error) {
    switch (error.code) {
    case error.PERMISSION_DENIED:
        alert("Location not provided");
        break;
    case error.POSITION_UNAVAILABLE:
        alert("Current location not available");
        break;
    case error.TIMEOUT:
        alert("Timeout");
        break;
    default:
        alert("unknown error");
        break;
    }
}

function pointTolerance(map, point, toleranceInPixel) {
  var extent;
  require(["esri/geometry/Extent"], function(Extent) {
    var pixelWidth = map.extent.getWidth() / map.width;
    var toleraceInMapCoords = toleranceInPixel * pixelWidth;
    extent = new Extent(point.x - toleraceInMapCoords, point.y - toleraceInMapCoords, point.x + toleraceInMapCoords, point.y + toleraceInMapCoords, map.spatialReference);  
  });
  return extent;
}         


function zoomToLocation(position) {
  require(["esri/geometry/webMercatorUtils", "esri/symbols/PictureMarkerSymbol","esri/geometry/Point","esri/graphic","esri/domUtils"], function(webMercatorUtils, PictureMarkerSymbol,Point,Graphic,domUtils){
    //$.mobile.hidePageLoadingMsg(); //true hides the dialog
    var pt = webMercatorUtils.geographicToWebMercator(new Point(position.coords.longitude, position.coords.latitude));
    map.centerAndZoom(pt, 20);
    //uncomment to add a graphic at the current location
    var symbol = new PictureMarkerSymbol("images/bluedot.png", 40, 40);
    graphic = new Graphic(pt, symbol);
    map.graphics.add(graphic);
    domUtils.hide(loading);
    gpsid = navigation.watchPosition(showLocation, locationError);
  });
}

function showLocation(location) {
  require(["esri/geometry/webMercatorUtils", "esri/symbols/PictureMarkerSymbol","esri/geometry/Point","esri/graphic","esri/domUtils"], function(webMercatorUtils, PictureMarkerSymbol,Point,Graphic,domUtils){
    var pt = webMercatorUtils.geographicToWebMercator(new Point(location.coords.longitude, location.coords.latitude));
    var symbol = new PictureMarkerSymbol("images/bluedot.png", 40, 40);
   if (location.coords.accuracy <= 500) {
   // the reading is accurate, do this
     if (!graphic) {    
        graphic = new Graphic(pt, symbol);
        map.graphics.add(graphic);
        //map.centerAndZoom(pt, 20);
        domUtils.hide(loading);
      }else{ //move the graphic if it exists   
         graphic.setGeometry(pt);
         //map.centerAndZoom(pt, 20);
        }
   } else {
         // reading is not accurate enough, do something else
        zoomToLocation(location);
        //map.centerAndZoom(pt, 20);
        //alert('The positional accuracy of your device is low. Best positional accuracy is obtained with a GPS/Wi-Fi enabled device');
        navigation.clearWatch(gpsid);
        //graphic = new Graphic(pt, symbol);
        //map.graphics.add(graphic);
        //domUtils.hide(loading);
     }
   });  
}

function toggle(el) {
    if (el.className != "vectorToggle") {
        el.src = 'images/Vector.png';
        el.className = 'vectorToggle';
        aerialLayer.show();
        basemap.hide();
        // overlayLayer.setVisibleLayers([1,27,28,29]);
    } else {
        el.src = 'images/Aerial.png';
        el.className = 'aerialToggle';
        aerialLayer.hide();
        basemap.show();
        // overlayLayer.setVisibleLayers([1,28,29]);
    }
}

function createCSVFile() {
    $.post('outputs/csvCreate.php', { q: csvInfo }, function (data) {  });
}


function zoomToTableSelection(element) {
  require(["esri/graphicsUtils"], function(graphicsUtils) { 
    map.graphics.clear();
    var row = $(element).parent().children().index($(element));
    var zoomGraphic = selectedFeatures.features[row];
    var extent = graphicsExtent([zoomGraphic]);
    var extentParcel = extent.expand(5);
    map.setExtent(extentParcel, true);
    zoomGraphic.setSymbol(symbols.polygon);
    map.graphics.add(zoomGraphic);
    doneIdentifyParcel(zoomGraphic);
  });
}

// function createGraphicsMenu() {

// var ctxMenuForGraphics, ctxMenuForMap;
// require(["dojo/on", "dijit/Menu", "dijit/MenuItem"], function(on, Menu, MenuItem){
    // // Creates right-click context menu for GRAPHICS
	
    // ctxMenuForGraphics = new Menu({});
    // ctxMenuForGraphics.addChild(new MenuItem({
        // label: "Delete",
        // onClick: function () {
		
        // //console.log(selected.geometry)
            // if (selected.geometry == measureGeometry) {
                // measureGeometry == null;
            // }
            // graphicLayer.remove(selected);			
        // }
    // }));
    
    // ctxMenuForGraphics.startup();
	
    // on(graphicLayer,"mouse-over", function (evt) {
        // // We'll use this "selected" graphic to enable editing tools
        // // on this graphic when the user click on one of the tools
        // // listed in the menu.
        // selected = evt.graphic;
        // // Let's bind to the graphic underneath the mouse cursor
        // ctxMenuForGraphics.bindDomNode(evt.graphic.getDojoShape().getNode());
    // });

    // on(graphicLayer, "mouse-out", function (evt) {
        // ctxMenuForGraphics.unBindDomNode(evt.graphic.getDojoShape().getNode());
    // });
  // });
// }

// function createMapMenu() {
    // // Creates right-click context menu for map
	
    // require(["dijit/Menu", "dijit/MenuItem"], function(Menu, MenuItem){
	
    // ctxMenuForMap = new Menu({
	
        // onOpen: function (box) {
            // // Lets calculate the map coordinates where user right clicked.
            // // We'll use this to create the graphic when the user clicks
            // // on the menu item to "Add Point"
            // currentLocation = getMapPointFromMenuPosition(box);
            // editToolbar.deactivate();
        // }
    // });
	
    // });
// }

// function getMapPointFromMenuPosition(box) {
  // require(["esri/geometry/Point"], function(Point) {
    // var x = box.x, y = box.y;
    // switch (box.corner) {
    // case "TR":
        // x += box.w;
        // break;
    // case "BL":
        // y += box.h;
        // break;
    // case "BR":
        // x += box.w;
        // y += box.h;
        // break;
    // }

    // var screenPoint = new Point(x - map.position.x, y - map.position.y);
    // return map.toMap(screenPoint);
// });
// }
