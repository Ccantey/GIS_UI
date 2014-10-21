define(["esri/geometry/webMercatorUtils", "esri/symbols/PictureMarkerSymbol","esri/geometry/Point","esri/graphic","esri/domUtils", "dojo/_base/declare"], 
function ( webMercatorUtils, PictureMarkerSymbol,Point,Graphic,domUtils, declare) {
    return declare(null, {
   
        zoomToLocation: function(position){
		    //$.mobile.hidePageLoadingMsg(); //true hides the dialog
            var pt = webMercatorUtils.geographicToWebMercator(new Point(position.coords.longitude, position.coords.latitude));
            map.centerAndZoom(pt, 20);
            //uncomment to add a graphic at the current location
            var symbol = new PictureMarkerSymbol("images/bluedot.png", 40, 40);
            graphic = new Graphic(pt, symbol);
            map.graphics.add(graphic);
            domUtils.hide(loading);
            gpsid = navigation.watchPosition(showLocation, locationError);
		},
		
		showLocation: function(location){
		    var pt = webMercatorUtils.geographicToWebMercator(new Point(location.coords.longitude, location.coords.latitude));
            var symbol = new PictureMarkerSymbol("images/bluedot.png", 40, 40);
            if (location.coords.accuracy <= 500) {
                // the reading is accurate, do this
                if (!graphic) {    
                    graphic = new Graphic(pt, symbol);
                    map.graphics.add(graphic);
                    //map.centerAndZoom(pt, 20);
                    domUtils.hide(loading);
                } else { //move the graphic if it exists   
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
		},
		
		locationError: function(error){
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


        
        
        
        
    //end   
    });
});
