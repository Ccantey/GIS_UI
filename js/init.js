var initExtent, identifyTask, identifyParams, gsvc, token;
var identifyTaskParcel, identifyParamsParcel, params;
var basemap, utilityMap, graphicLayer, graphicLayerLabels, tempGraphicLayer, maxExtent, printOptions;
var app, measure;
var iPoint;
var A_Drawings;
var overlayLayer;
var aerialLayer;
var operationToDo;
var legend = null;
var legendLayers = [];
var iTool = null;
var navToolbar = null; 
var measureTool = null; 
var drawingTool = null;
var editToolbar = null;
var map = null;
var toolbar = null;
var symbols = {};
var printTask = null;   
var ctxMenuForGraphics, ctxMenuForMap;
var printAreaGraphic = null;
var globalMapLayers = {};
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
var navEvent;

function createCSVFile() {
    $.post('outputs/csvCreate.php', { q: csvInfo }, function (data) {  });
}
  define(["dojo/ready","esri/urlUtils", "dojo/dom", "dojo/on", "dojo/keys","esri/domUtils", "esri/map", "config/commonConfig", "app/identification", "app/checktree", "app/handlers","app/measurements","esri/sniff", "esri/SnappingManager", "app/mapNav", "esri/request", "esri/tasks/PrintTask", "esri/dijit/Legend", "esri/toolbars/draw", "esri/toolbars/edit", "esri/tasks/GeometryService", "esri/tasks/BufferParameters", "esri/dijit/editing/AttachmentEditor", "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/FeatureLayer", "esri/layers/GraphicsLayer", "esri/geometry/Extent", "esri/SpatialReference", "dojo/domReady!"],
           function(ready, urlUtils, dom, on, keys, domUtils, Map, config, identification, checktree, handlers, myMeasurement, has, SnappingManager, mapNav, esriRequest, PrintTask, Legend, Draw, Edit, GeometryService, BufferParameters, AttachmentEditor, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, FeatureLayer, GraphicsLayer, Extent, SpatialReference){
       
        ready(function(){

             initExtent = new Extent({"xmin":-10014198.126251305,"ymin":5518475.931924282,"xmax":-9988152.208863167,"ymax":5533954.430152008,spatialReference:{"wkid":102100}});
             map = new Map("map", {
                extent: initExtent  
             }); 
             
            gsvc = new GeometryService(config.helperServices.geometry + "?token=" + token); //identification, doBuffer, measureUpdate
            printTask = new PrintTask(config.helperServices.print+ "?token=" + token);
            

            // this is comparable to "dojo.connect(map, 'onLoad', function () {" but doesn't do anything yet.
            on(map, "load", function(){

              //legend method calls token twice so we have to remove the token from config
                overlayLayer.url = "http://YourService/MapServer";
                utilityMap.url = "http://YourService/MapServer";
                legendLayers.push({ layer: utilityMap, title: "Legend" });
                legendLayers.push({ layer: overlayLayer, title: "Legend ",hideLayers:[1,2,3,4,5,28,32,33,34,35,36,38,67]}); //labels, parcels, municipal boundaries, shields, dimensions
                legend = new Legend({
                  map:map,
                  layerInfos:legendLayers,
                  autoUpdate: true,
                },"legendDiv");
                legend.startup();

                var treeLegend = new checktree();
                var utilities = $(".overlayLayer, .utilityLayer, .tree");
                var basemaplayers = $(".overlayLayer");
                on(utilities, 'change', function(){
                      treeLegend.treeGetUtilityLayers();
                } );
                on(basemaplayers, 'change', function(){
                    treeLegend.treeGetOverlayLayers();
                } );
            });

            basemap = new ArcGISTiledMapServiceLayer(config.mapServices.vector); 
            map.addLayer(basemap);

            aerialLayer = new ArcGISTiledMapServiceLayer(config.mapServices.aerial, {maxScale: 1128}); //scale to fit, rather than 1128.497
            map.addLayer(aerialLayer);
            aerialLayer.hide();
            //Add Feature service (A_Drawings/Attachments)
            A_Drawings = new FeatureLayer("http://YourFeatureService/FeatureServer/29"+ "?token=" + token, {
              mode: FeatureLayer.MODE_ONDEMAND,
              outFields:["*"]
            });
            map.addLayers(A_Drawings);

            PlatIndex = new FeatureLayer("http://YourFeatureService/FeatureServer/28"+ "?token=" + token, {
              mode: FeatureLayer.MODE_ONDEMAND,
              outFields:["*"]
            });
            map.addLayers(PlatIndex);

            attachmentEditor = new AttachmentEditor({}, dom.byId("content"));
            attachmentEditor.startup();

            A_Drawings.hide();
            PlatIndex.hide();
            //Add dynamic map 
            overlayLayer = new ArcGISDynamicMapServiceLayer(config.mapServices.dynamic+ "?token=" + token, {id:"Basemap"});
            overlayLayer.setImageFormat("png32");
            overlayLayer.setVisibleLayers([1,2,4,33,34,35,36,67]); //schools,streets,parks,parcels,boundaries,shields
            map.addLayer(overlayLayer);
      
            utilityMap = new ArcGISDynamicMapServiceLayer(config.mapServices.dynamic+ "?token=" + token, { id: "Utility" });
            utilityMap.setImageFormat("png32");
            utilityMap.setVisibleLayers([-1]);
            map.addLayer(utilityMap);   
      
            //Keep map in viewer
            maxExtent = map.extent;
            on(map, "extent-change", function (initExtent){
                printOptions.changePrintGraphic(); //move print box if its on.
                var adjustedEx = new Extent(initExtent.extent.xmin, initExtent.extent.ymin, initExtent.extent.xmax, initExtent.extent.ymax, new SpatialReference({ wkid:102100 }));
                var flag = false; 
                //set a buffer to make the max extent a slightly bigger to void minor differences
                //the map unit for this case is meter. 
                var buffer = 25000;
        
                var onLoadHandle = on(basemap, "update", function(){
                    onLoadHandle.remove();
                    if(initExtent.extent.xmin < maxExtent.xmin-buffer) {
                        adjustedEx.xmin = maxExtent.xmin;
                        adjustedEx.xmax = Math.abs(initExtent.extent.xmin - maxExtent.xmin) + initExtent.extent.xmax;
                        flag = true;
                    }
                    if(initExtent.extent.ymin < maxExtent.ymin-buffer) {
                        adjustedEx.ymin = maxExtent.ymin;
                        adjustedEx.ymax = Math.abs(initExtent.extent.ymin - maxExtent.ymin) + initExtent.extent.ymax;
                        flag = true;
                    }
                    if(initExtent.extent.xmax-buffer > maxExtent.xmax) {
                        adjustedEx.xmax = maxExtent.xmax;
                        adjustedEx.xmin =initExtent.extent.xmin - Math.abs(initExtent.extent.xmax - maxExtent.xmax);
                        flag = true;
                    }
                    if(initExtent.extent.ymax-buffer > maxExtent.ymax) {
                        adjustedEx.ymax = maxExtent.ymax;
                        adjustedEx.ymin =initExtent.extent.ymin - Math.abs(initExtent.extent.ymax - maxExtent.ymax);
                        flag = true;
                    }
                    if (flag === true) {
                        map.setExtent(adjustedEx);        
                    }
                    flag = false;
                }); 
                
                var currentScale=map.getScale();
                if(currentScale > 4800){
                    $("#AddLabels, #DimLabels, #PidLabels").prop('indeterminate', true).change();
                    $("#AddLabels, #DimLabels, #PidLabels").prop('disabled', true).change();
                    $("#AddLabels, #DimLabels, #PidLabels").parent().css("color", "#777");
                }else{
                    $("#AddLabels, #DimLabels, #PidLabels").prop('indeterminate', false).change();
                    $("#AddLabels, #DimLabels, #PidLabels").prop('disabled', false).change();
                    $("#AddLabels, #DimLabels, #PidLabels").parent().css("color", "#FFF");
                }
                if (currentScale > 9600){
                    $("#Contours, #Adraw").prop('indeterminate', true).change();
                    $("#Contours, #Adraw").prop('disabled', true).change();
                    $("#Contours, #Adraw").parent().css("color", "#777")    
                }else{
                    $("#Contours, #Adraw").prop('indeterminate', false).change();
                    $("#Contours, #Adraw").prop('disabled', false).change();
                    $("#Contours, #Adraw").parent().css("color", "#FFF")        
                }           
            });

            on(map, "update-start", function(){
                domUtils.show(loading);
            });
           
            on(map, "update-end", function(){
                domUtils.hide(loading);
                map.disableDoubleClickZoom();
            });            

            on(map, "zoom-end", function () {
                $("#navigation input").attr("checked", false).button("refresh");
                var adjustedScale = map.getScale();
                if (adjustedScale > 72226) {
                    map.setExtent(initExtent);
                }
            });
            graphicLayer = new GraphicsLayer();
            map.addLayer(graphicLayer);

            tempGraphicLayer = new GraphicsLayer();
            map.addLayer(tempGraphicLayer);

            graphicLayerLabels = new GraphicsLayer();
            map.addLayer(graphicLayerLabels);

            //buffer params
            params = new BufferParameters();
            params.bufferSpatialReference = new SpatialReference({ wkid: 103734 });
          
            operationToDo = 'identify';
            iTool = new Draw(map, { showTooltips: false });
            //iTool.activate(Draw.POINT); //use _geometryType to make iTool methods global
            iTool.activate(iTool._geometryType='point');
            app = new identification();
            measure = new myMeasurement();
            
            // var snapManager = map.enableSnapping({
            //   snapKey: has("mac") ? keys.META : keys.CTRL
            // });
            // var layerInfos = [{
            //   layer: [27]
            // }];
            // snapManager.setLayerInfos(layerInfos);
            // console.log(layerInfos);

            iTool.on("draw-end", function (evt) {
              switch (operationToDo){
              case "identify":
                  app.identify(evt.geometry);
                  break;
              case "selection":
                  app.drawGraphic(evt.geometry);
                  break;
              case "measure":
                  measure.getAreaAndLength(evt.geometry);
                  break;
              case "drawing":
                  app.addDrawingToMap(evt.geometry)
                  break;
               }
            });

            var searchButton = $('#searchTab button');
            on(searchButton, 'click', function(){
              $('.results.identify').hide();
              if (this.id == 'ownerGo') {
              //alert('dadfs');
                app.searchParcelByAttribute("Owner");
              } else if (this.id == "addressGo") {
                app.searchParcelByAttribute("Address");
              } else {
                app.searchParcelByAttribute("PID");
              }
            });

            var searchBoxes = $('#owner, #addresses, #pid');
            on(searchBoxes, 'keypress', function(event){
              if(this.id == 'owner'){
                  if(event.keyCode == 13){
                      app.searchParcelByAttribute('Owner');
                  }
              } else if (this.id == "addresses") {
                  if(event.keyCode == 13){
                      app.searchParcelByAttribute('Address');
                  }
              } else if (this.id == "pid") {
                  if(event.keyCode == 13){
                      app.searchParcelByAttribute('PID');
                  }
              }
            });

            //esriRequest is a utility method to retrieve data from a web server. Data can be static (stored in a file on the web server), or it can be dynamic (generated on-demand by a web service). esriRequest can handle the following formats: plain txt, xml, json, jsonp
            var layersRequest = esriRequest({
                url: config.mapServices.dynamic+ "?token=" + token,
                content: { f: "json" },
                handleAs: "json",
                callbackParamName: "callback"
            });
            layersRequest.then(
                function(response) {
                    //console.log("Success: ", response.layers);
                    globalMapLayers = response.layers;
                }, function(error) {
                    console.log("Error: ", error.message);
                });
        
        }); //end ready
    }); //end require
