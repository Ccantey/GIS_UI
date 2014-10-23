define(["esri/domUtils", "dojo/_base/array", "esri/geometry/ScreenPoint", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/geometry/Extent", "esri/graphic", "esri/tasks/LegendLayer", "esri/tasks/PrintTemplate", "esri/tasks/PrintParameters", "dojo/_base/declare"], 
function ( domUtils, array, ScreenPoint, SimpleFillSymbol, SimpleLineSymbol, Color, Extent, Graphic, LegendLayer, PrintTemplate, PrintParameters, declare) {
    return declare(null, {
        
        //viewPrintArea
		//Public class
        viewPrintArea: function () {
            reversePreviewExtent = map.extent;
            var screenPoint = map.toScreen(map.extent.getCenter());

            switch($("#paper").val()){
                case "A4 Portrait":
                    var xmin =  screenPoint.x - 385;
                    var ymin =  screenPoint.y + 421;
                    var xmax =  screenPoint.x + 385;
                    var ymax =  screenPoint.y - 421;
                break;
                case "A4 Landscape":
                    var xmin =  screenPoint.x - 505;
                    var ymin =  screenPoint.y + 325;
                    var xmax =  screenPoint.x + 505;
                    var ymax =  screenPoint.y - 325;
                break;
                case "A3 Portrait":
                    var xmin =  screenPoint.x - 546;
                    var ymin =  screenPoint.y + 665;
                    var xmax =  screenPoint.x + 546;
                    var ymax =  screenPoint.y - 665;
                break;
                case "A3 Landscape":
                    var xmin =  screenPoint.x - 768;
                    var ymin =  screenPoint.y + 410;
                    var xmax =  screenPoint.x + 768;
                    var ymax =  screenPoint.y - 410;
                break;  
            }  
            var pointGraphic1 = map.toMap(new ScreenPoint(xmin,ymin));
            var pointGraphic2 = map.toMap(new ScreenPoint(xmax,ymax));  
  
            var symbol2 = new SimpleFillSymbol("solid", new SimpleLineSymbol("dash", new Color([255, 0, 0]), 2), new Color([255, 0, 0, 0.0]));
            var ext = new Extent(pointGraphic1.x , pointGraphic1.y, pointGraphic2.x, pointGraphic2.y, map.spatialReference);
            if(printAreaGraphic){
                printAreaGraphic.hide();
                printAreaGraphic = null;
                //map.graphics.remove(printAreaGraphic);
            } else {
                printAreaGraphic = new Graphic(ext,symbol2);
                map.graphics.add(printAreaGraphic);
            }
        },
        
        //changePrintGraphic
        //Public Class
		changePrintGraphic: function(){
		    if(printAreaGraphic){
                printAreaGraphic.hide();
                printAreaGraphic = null;
                this.viewPrintArea();       
            } else {    
                printAreaGraphic = null;
            }
		},
		
		//printingLayoutMain
		//Public class
		printingLayoutMain: function(){
		    // overlayLayer.url = mapServiceURL;
            // utilityMap.url = mapServiceURL;
            //$("#printOptions").height("130px");
            //esri.show(dojo.byId("loadingPrint"));
            $("#progressbar").show();
            var legendLayer1 = new LegendLayer();
            legendLayer1.layerId = "Utility";

            var ids1 = $.map(utilityMap.visibleLayers, function (item, index) {
                return window.parseInt(item);
            });
            console.log(ids1);
            // add layers to legend (water/storm/sanitary
            //ids1.push(5); //water
            ids1.push(15); //Sewer
            ids1.push(4); //Storm 

            legendLayer1.subLayerIds = ids1;

            var legendLayer2 = new LegendLayer();
            legendLayer2.layerId = "Basemap";
            var ids2 = $.map(overlayLayer.visibleLayers, function (item, index) {
                return window.parseInt(item);
            });
            //ids2.push(34); //zoning
            console.log(ids2);
            var index= ids2.indexOf(1);
            ids2.splice(index,1); //hide streets from legend
       
            // index= ids2.indexOf(2);
            // ids2.splice(index,1);

            // index= ids2.indexOf(3);
            // ids2.splice(index,1);

            index= ids2.indexOf(27);
            ids2.splice(index,1); //hide parcel from legend, 1 indicates number of items to remove

            index= ids2.indexOf(28);
            ids2.splice(index,1); //hide municipal boundary from legend

            index= ids2.indexOf(29);
            ids2.splice(index,1); //hid hwyshields from legend
            console.log(ids2);

            legendLayer2.subLayerIds = ids2;
            console.log(legendLayer2);   

            if ($("#paper").val() == "MAP_ONLY") {
            var layouts = [
                {
                    "name": $("#printLayouts").val(),
                    "label": $("#printLayouts").val(),
                    "format": "jpg",
                    "options": {
                        "legendLayers": [legendLayer1, legendLayer2], // empty array means no legend
                        "scalleBarUnit": "Miles",
                        "titleText": $("#title").val(),
                       "authorText": "Map Powered by the City of Wisconsin Rapids"
                    }
                }
            ];
            } else {
                var layouts = [
                    {
                        "name": $("#paper").val(),
                        "label": $("#paper").val() + " (PDF)",
                        "format": "pdf",
                        "options": {
                            "legendLayers": [legendLayer1, legendLayer2], // empty array means no legend
                            "scalleBarUnit": "Miles",
                            "titleText": $("#title").val(),
                            "authorText": "Map Powered by the City of Wisconsin Rapids"
                        }
                    }
                ];
            }
            var templates = [];
            array.forEach(layouts, function (lo) {
                var t = new PrintTemplate();
                t.exportOptions = { dpi: 175, width: map.width, height: map.height };
                t.layout = lo.name;
                t.label = lo.label;
                t.format = lo.format;
                t.preserveScale = true;
                t.layoutOptions = lo.options
                templates.push(t);
            });
            var params = new PrintParameters();
            params.map = map;
            params.template = templates[0];
            printTask.execute(params, function (result) {
                window.open(result.url);
                //document.execCommand('SaveAs','true',result.url);
                $("#progressbar").hide();
                $(".progress-bar").css('width','5%');
            });
		}
 


        
        
        
        
    //end   
    });
});
