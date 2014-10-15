define(["dojo/Evented","dojo/_base/declare", "dojo/_base/lang", "esri/arcgis/utils", "dojo/dom", "dojo/dom-class", "dojo/on", "esri/tasks/query", "esri/tasks/QueryTask","esri/graphic","config/commonConfig", "esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/Font", "esri/symbols/TextSymbol", "esri/Color", "esri/tasks/AreasAndLengthsParameters", "esri/tasks/LengthsParameters", "esri/tasks/GeometryService", "esri/SpatialReference", "esri/tasks/BufferParameters", "esri/geometry/Polygon", 
"dojo/domReady!"], 
function ( evented, declare, lang, arcgisUtils, dom, domClass, on, Query, QueryTask, Graphic,config,SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Font, TextSymbol, Color, AreasAndLengthsParameters, LengthsParameters, GeometryService, SpatialReference, BufferParameters, Polygon) {
    return declare(null, {
        // config: {},
        // startup: function (config) {
            // // config will contain application and user defined info for the template such as i18n strings, the web map id
            // // and application id
            // // any url parameters and any application specific configuration information.console.log("Hello World!");
            // // console.log("My Map:", this.map);
            // // console.log("My Config:", this.config);
            // if (config) {
                // this.config = config;
                // //supply either the webmap id or, if available, the item info
                // var itemInfo = this.config.itemInfo || this.config.webmap;
                // this._createWebMap(itemInfo);
            // } else {
                // var error = new Error("Main:: Config is not defined");
                // this.reportError(error);
            // }
        // },
		
        // Sample function, welcome to AMD!
        _helloWorld: function (evt) {
            console.log("Hello World!");
            console.log("My Map:", this.map);
            console.log("My event:", this.evt);
        },
		
		//doIdentify
		//Public Class
	    _identify: function (evt) {
            identifyParams.geometry = evt;
            identifyParams.returnGeometry = true;
            identifyParams.mapExtent = map.extent;
            identifyParams.layerIds = utilityMap.visibleLayers.concat(identifyLayerAdditional);  //UTILITYMAP
            //console.log(this);			
            identifyTask.execute(identifyParams).then(lang.hitch(this, function (idResults) { 
			    //console.log(this.idResults); //if utility selected returns object otherwise undefined
			    this._utility(idResults, evt); 
				
			}));
            selectedFeatures = { features: [] }; //remove previously selected parcels in memory 
            $('.results.multipleBuffer').hide(); //remove previously selected parcels in results table
            map.graphics.clear();                //remove previously selected parcels in map
        },

        // addToMap
		//Private Class
		_utility: function (idResults,evt) {
            multipleIdentifyStack = [];
            multipleIdentifyLayerName = [];
            //console.log('idResults[0]',idResults); //utility selected?
            if (idResults.length > 0) {
                var options = '';
                var i = 0;
                for (i =0, il = idResults.length; i < il; i++) {
                    options += '<option value="' + i + '">' + idResults[i].layerName + "</option>";
                    multipleIdentifyStack.push(idResults[i].feature);
                    multipleIdentifyLayerName.push(idResults[i].layerName);
                }
                // $('#multipleSelect').html(options);
                // $('#multipleSelect').selectBoxIt('refresh');
                if (idResults.length > 1) {
                    //console.log(idResults.length);
                    $('#append').html("RESULTS (" +idResults.length+")" );
                    $('#multipleSelect,multipleSelect2').html(options);
                    $('#multipleSelect,multipleSelect2').selectBoxIt('refresh');
                    $("#multipleSelectSelectBoxItContainer").show();
                    $('.results.multiple').hide();
                } else {
                    $('#append').html("RESULTS");
                    $("#multipleSelectSelectBoxItContainer").hide();
                    $("multipleSelectSelectBoxItArrowContainer").hide();
                }
                this._showFeature(multipleIdentifyStack[0]); //utilities selected
                this._layerTabContent(multipleIdentifyStack[0], multipleIdentifyLayerName[0]);
            } else {
                $('#append').html("RESULTS");
                $("#multipleSelectSelectBoxItContainer").hide();
                $('.results.identify').show();
                identifyParamsParcel.mapExtent = map.extent;            
                //identifyParamsParcel.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
                identifyParamsParcel.geometry = evt;
                identifyTaskParcel.execute(identifyParamsParcel).then(lang.hitch(this, function (idResults) {
                    this._doneIdentifyParcel(idResults[0].feature) 
				} ));
            }
        },
		
		//showFeature
		//Private Class
        _showFeature: function(feature) {
            //console.log(feature)
            switch (feature.geometry.type) {
            case "point":
                var symbol = symbols.point;
		        console.log(feature);
                break;
            case "polyline":
                var symbol = symbols.polyline;
                break;
            case "polygon":
                var symbol = symbols.polygon;
                break;
            }
            feature.setSymbol(symbol);  //highlight selection
            map.graphics.add(feature);  //add highlighted feature to map
        },
		
		//layerTabContent
		//Private Class
		_layerTabContent: function(layerResults, layerName) {
            $(".identify .section-sub-header").html(layerName);
            $('.results.identify').show();
            geometryBuffer = [layerResults.geometry];
            var content = '';
            var attributesName;
            if (layerName == 'A_Drawings') {
                if($('#sidebar-wrapper').hasClass('active')) {
                    $('#menu-toggle').addClass('tab');
                }        
            if ($('#layers-tab').hasClass('active') || $('#tools-tab').hasClass('active') || $('#draw-tab').hasClass('active')) {
                $('#search-tab a').addClass('notice');
            } else {};        
            var objectId;
            for (attributesName in layerResults.attributes) {
                objectId = layerResults.attributes["OBJECTID"];
                console.log(objectId);
                A_Drawings.queryAttachmentInfos(objectId, function(info) {
                    $.each(info, function (number,attachment) {
                        var a = '<a target="_blank" href="' + attachment.url + '">' + attachment.name + "</a></td></tr>";
                        //$("#viewAttachment").append(a); 
                        console.log(a);
                        $("#viewAttachment").html("<tr><th >A-Drawing: </th><td>"+ a+ "</td>")
                    });
                    $("#viewAttachment").show();
                });
            }
            } else if (layerName != 'Parcels') {
                if($('#sidebar-wrapper').hasClass('active')) {
                $('#menu-toggle').addClass('tab');
                }
            if ($('#layers-tab').hasClass('active') || $('#tools-tab').hasClass('active') || $('#draw-tab').hasClass('active')) {
                $('#search-tab a').addClass('notice');
            } else {} ;

            $("#viewAttachment").hide();
            for (attributesName in layerResults.attributes) {
                //console.log(attributesName, layerResults.attributes[attributesName]);
                //Add asbuilt links
                if (attributesName.match(/AsBuilt/gi)) {
                    content += "";
                }
                if (attributesName.match(/Enabled/gi) || (attributesName.match(/AsBuilt/gi)) || (attributesName.match(/GlobalID/gi))){
                    content += "";
                } else if (attributesName.match(/shape/gi) == null && attributesName.match(/OBJECTID/gi) == null && layerResults.attributes[attributesName] != null && layerResults.attributes[attributesName] != "Null") {
                    content += "<tr><th>" + attributesName + ":</th><td>" + layerResults.attributes[attributesName] + "</td></tr>";
                }
            }
        } else {
            content += "<tr><th>" + "No Data" + ":</th><td>" + "No Data" + "</td></tr>";
        }
        $("#singleItem1,#singleItem4").html(content);
        $("#singleItem2,#singleItem5,.section-sub-header2,.searchClass").hide();
        $('.results.multiple').hide();
        $('.results.identify').show();
        },
		
		//doneIdentify
		//Private Class
		_doneIdentifyParcel: function(currentProperty) {
            $(".identify .section-sub-header").html("Property Information");
            $("#multipleSelect,multipleSelect2").hide();
            $('.results.multiple').hide();
            $("#singleItem2,#singleItem5,.section-sub-header2,.searchClass").show();
            $('.results.identify').show();
            $('#searchfooter').css({'position': 'relative', 'bottom': '0px'});
            $("#viewAttachment").hide();
            geometryBuffer = [currentProperty.geometry];
            var layerResults = currentProperty;
            //console.log(layerResults);
            this._showFeature(currentProperty);
            this._createSingleTable([currentProperty]);
            if($('#sidebar-wrapper').hasClass('active')) {
                $('#menu-toggle').addClass('tab');
            }
            if ($('#layers-tab').hasClass('active') || $('#tools-tab').hasClass('active') || $('#draw-tab').hasClass('active')) {
                $('#search-tab a').addClass('notice');
            } else {
            }
            var content1 = "";
            var content2 = "";

            // !HACK! For some reason the query task and the identifytask return different attributes for PID so I hack out PID from taxlink and layerResults.attributes['ParcelID'] only occurs on a few properties
            if (layerResults.attributes['ParcelID'] == 'Null') {
                content1 += "<tr><th> PIN" + ":</th><td>" + (layerResults.attributes['TaxLink']).split("TaxKey=").pop() + "</td></tr>";
            } else {
                content1 += "<tr><th> PIN" + ":</th><td>" + layerResults.attributes['ParcelID'] + "</td></tr>";
            }
            content1 += "<tr><th> Property Address" + ":</th><td>" + layerResults.attributes['Address']  + "</td></tr>"; //note misspell
            content1 += "<tr><th> Owner Name " + ":</th><td>" + layerResults.attributes["Owner Name"] + "</td></tr>";
            content1 += "<tr><th> Owner Address" + ":</th><td>" + layerResults.attributes['MAILADDLN1'] + "</br>" + layerResults.attributes['CITYSTZIP'] + "</td></tr>";
            content1 += "<tr><th> Area (Acres)" + ":</th><td>" + (layerResults.attributes['Shape.STArea()'] / 43560).toFixed(2) + "</td></tr>";

            if (layerResults.attributes['SCHOOLDIST'] == 2) {
                content2 += "<tr><th> School District" + ":</th><td>Wisconsin Rapids</td></tr>";
            } else {
                content2 += "<tr><th> School District" + ":</th><td>" + layerResults.attributes['SCHOOLDIST'] + "</td></tr>";
            }

            if (layerResults.attributes['TaxLink'] == '') {
                content2 += '';
            } else {
                content2 += "<tr><th > Tax Link" + ":</th><td><a style='color:#ff6600' target='_blank' href='" + layerResults.attributes['TaxLink'] + "'</a>" + "Link" + "</td></tr>";
            }
            if (layerResults.attributes['Assesor Link'] == '') {
                content2 += '';
            } else {
                content2 += "<tr><th > Assessor's Link" + ":</th><td><a style='color:#ff6600' target='_blank' href='" + layerResults.attributes['Assesor Link'] + "'</a>" + "Link" + "</td></tr>";
            }

            $("#singleItem1,#singleItem4").html(content1);
            $("#singleItem2,#singleItem5").html(content2);    
        },
		
		//createSingleTable
		//private Class
		_createSingleTable: function(queryFeatures){
		    selectedFeatures = { features: [] };
            $('.results.multipleBuffer').hide();
            csvInfo = [];
            mailParcels = [];
            var k;
            for (k in queryFeatures[0].attributes) {
                 attrAll.push(k);
            }
            csvInfo.push(attrAll.join(","));
            var i;
            var j;
            for (i = 0, il = queryFeatures.length; i < il; i++) {
                attValues = [];
                for (j = 0; j < attrAll.length; j++) {
                    attValues.push(queryFeatures[i].attributes[attrAll[j]]);
                }
                csvInfo.push(attValues.join(","));
                mailParcels.push(queryFeatures[i].attributes['gisWiRapids.LGIM.Parcels.PARCELNO']); //this is where single mail label broke down, changed from [0] to PID_NO
                selectedFeatures.features.push(queryFeatures[i]);
            }
            createCSVFile();
		},
		
		//drawGraphic
		//Public Class
		_drawGraphic: function(drawn){
		    //map.enablePan();
            var layerToBuffer = dom.byId("BufferLayer").value;
            if (layerToBuffer == parcelLayerID) {
                var queryTask = new QueryTask(config.mapServices.dynamic + "/" + layerToBuffer);
                console.log(queryTask);
                var query = new Query();
                query.outFields = ["*"];
            } else {
                var queryTask = new QueryTask(config.mapServices.dynamic + "/" + layerToBuffer);
                console.log(queryTask);
                var query = new Query();
                query.outFields = ["*"];
            }
            //if 'select by drawing'
			console.log(drawn.type);
            switch (drawn.type) { 
            case "point":
                symbolDraw = symbols.point;
                break;
            case "polyline":
                symbolDraw = symbols.polyline;
                break;
            case "polygon":
                symbolDraw = symbols.polygon;
                break;
            }
            var graphicDraw = new Graphic(drawn, symbolDraw);
            if (layerToBuffer == "Drawing") {
                geometryBuffer.push(graphicDraw.geometry);
                map.graphics.add(graphicDraw);
            //if NOT 'select by drawing'
            } else {
                query.returnGeometry = true;
                if (graphicDraw.geometry.type == "point") {
                    query.geometry = pointTolerance(map, graphicDraw.geometry, 10);
                } else {
                    query.geometry = graphicDraw.geometry;
                }

                queryTask.execute(query).then(lang.hitch(this, function (selectionGeometries) {
                    var currentSelection = selectionGeometries.features;
                    //alert(currentSelection.length);
                    if (currentSelection.length == 0 && layerToBuffer != parcelLayerID) {
                        map.graphics.add(graphicDraw);
                        geometryBuffer.push(graphicDraw.geometry);
                    } else {
                        switch (currentSelection[0].geometry.type) {
                        case "point":
                            var symbolSelect = symbols.point;
                            break;
                        case "polyline":
                            var symbolSelect = symbols.polyline;
                            break;
                        case "polygon":
                            var symbolSelect = symbols.polygon;
                            break;
                        }
                        for (var i = 0; i < currentSelection.length; i++) {
                            currentSelection[i].setSymbol(symbolSelect);
                            map.graphics.add(currentSelection[i]);
                            selectedFeatures.features.push(currentSelection[i]);
                            geometryDraw.push(currentSelection[i].geometry);
                            geometryBuffer.push(currentSelection[i].geometry);
                        }
                        if (layerToBuffer == parcelLayerID && currentSelection.length != 0) {
						    this._createTable(selectedFeatures.features);
                        }
                    }
                }));
            }		
		},
		
		//createTable
		//Private Class for a few
		_createTable: function(queryFeatures){
		    selectedFeatures = { features: [] };
            csvInfo = [];
            //fill/stroke of selected
            var querySymbol = symbols.polygon;
            symbols.polygon = querySymbol;
            var k;
            for (k in queryFeatures[0].attributes) {
            //var a = k.replace('gisWiRapids.LGIM.Parcels','');
            attrAll.push(k);
            //console.log(attrAll);
            }
            csvInfo.push(attrAll.join(","));
            //console.log(csvInfo);
            var content = "";
            content += "<thead><tr><th>PID</th><th>Owner Name</th><th>Address</th></tr></thead>";
            var i;
            var j;
            var graphic;
            for (i = 0, il = queryFeatures.length; i < il; i++) {
                attValues = [];
                for (j = 0; j < attrAll.length; j++) {
                    attValues.push(queryFeatures[i].attributes[attrAll[j]]);
                }
                csvInfo.push(attValues.join(","));
                graphic = new Graphic(queryFeatures[i].geometry, symbols.polygon);
                map.graphics.add(graphic);
                content += "<tr><td >" + queryFeatures[i].attributes['gisWiRapids.LGIM.Parcels.PARCELNO'] + "</td><td>" + queryFeatures[i].attributes['gisWiRapids.LGIM.Parcels.OwnerName'] + "</td><td>" + queryFeatures[i].attributes['gisWiRapids.LGIM.Parcels.Adddress'] + "</td></tr>";
                mailParcels.push(queryFeatures[i].attributes['gisWiRapids.LGIM.Parcels.PARCELNO']);
                selectedFeatures.features.push(queryFeatures[i]);
                if (queryFeatures.length > 6) {
                     $('#toolsfooter').css({'position': 'relative', 'bottom': '0px'});
                }
            }
            $("#multiptleBufferItem").html(content);
            $('.results.multipleBuffer').show();
            $('.results.identify').hide();
            createCSVFile();
		},
		
		//getAreaAndLength
		//Public class
		_getAreaAndLength: function(geometry){
            var labelUnit = { "UNIT_FOOT": " Feet", "UNIT_STATUTE_MILE": "Miles", "UNIT_ACRES": "Acres", "UNIT_SQUARE_FEET": " Sq. Feet", "UNIT_SQUARE_MILES": " Sq. Miles" };

            symbols.polygonMeasure = new SimpleFillSymbol("solid", new SimpleLineSymbol("solid", new Color([255, 155, 0]), 2), new Color([0, 200, 0, 0.65]));
            symbols.polyline = new SimpleLineSymbol("solid", new Color([255, 155, 0]), 4);
            if (geometry.type == 'polygon') {
                measureGraphic = map.graphics.add(new Graphic(geometry, symbols.polygonMeasure));
                var areasAndLengthParams = new AreasAndLengthsParameters();
                areasAndLengthParams.calculationType = 'preserveShape';
                areasAndLengthParams.lengthUnit = GeometryService.UNIT_FOOT;
                areasAndLengthParams.calculationType = 'preserveShape';     
                areasAndLengthParams.areaUnit = eval("GeometryService." + dom.byId("measureUnit").value); //esri.tasks.GeometryService.UNIT_ACRES;
        
                gsvc.simplify([geometry], function (simplifiedGeometries) {
                    areasAndLengthParams.polygons = simplifiedGeometries;
                    measureGeometry = simplifiedGeometries;
                    gsvc.labelPoints(simplifiedGeometries, function (labelPoints) {
                        gsvc.areasAndLengths(areasAndLengthParams, function (result) {
                            var font = new Font("13", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_NORMAL, "Arial");
                            var textSymbol = new TextSymbol(((result.areas[0].toFixed(2))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +" "+ labelUnit[$("#measureUnit").val()], font, new Color("#000000"),"ALIGN_RIGHT");
                    
                            labelPointGraphic = new Graphic(labelPoints[0], textSymbol);
                            map.graphics.add(labelPointGraphic);
                           //console.log(labelPoints[0]);
                        });
                    });
                });
            }
            if (geometry.type == 'polyline') {
                measureGraphic = map.graphics.add(new Graphic(geometry, symbols.polyline));
                var lengthParams = new LengthsParameters();
        
                lengthParams.lengthUnit = GeometryService.UNIT_FOOT;
                console.log("lengthParams.areaUnit: ", lengthParams.lengthUnit); //==9002
                lengthParams.lengthUnit = eval("GeometryService." + dom.byId("measureUnit").value);
                console.log("lengthParams.areaUnit: ", lengthParams.lengthUnit); //==undefined
                lengthParams.calculationType = 'preserveShape';
        
                var sr = new SpatialReference({ wkid: 102100  });
                gsvc.project([geometry], sr, function(projectedGraphic){
                    gsvc.simplify(projectedGraphic, function (simplifiedGeometries) {
                        measureGeometry = simplifiedGeometries;
                        lengthParams.polylines = simplifiedGeometries;
                        var params = new BufferParameters();
                        params.calculationType = 'preserveShape';
                        params.distances = [100];
                        params.bufferSpatialReference = new SpatialReference({ wkid: 102100  });
                        params.outSpatialReference = map.spatialReference;
                        params.unit = eval("GeometryService." + "UNIT_FOOT");
                        params.unionResults = true;
                        params.geometries = simplifiedGeometries;
                        gsvc.buffer(params, function (geometries) {
                            gsvc.labelPoints(geometries, function (labelPoints) {
                                gsvc.lengths(lengthParams, function (result) {
                                    var font = new Font("13", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_NORMAL, "Arial");
                                    var textSymbol = new TextSymbol((result.lengths[0].toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + labelUnit[$("#measureUnit").val()], font, new Color("#000000"),"ALIGN_RIGHT");                        
                                    labelPointGraphic = new Graphic(labelPoints[0], textSymbol);
                                    map.graphics.add(labelPointGraphic);
                                });
                            });
                        });
                    });            
                });
            }		
		},
		
		//addToMapDrawing
		//PublicClass
		_addDrawingToMap: function(geometry){
            symbolStyle = $("#symbolOptions").val();
            switch (geometry.type) {
                case "point":
                    if (labelling == true) {
                        this._labelGeom(geometry)
                    } else {
                        var style = eval("SimpleMarkerSymbol." + symbolStyle);
                        var size = parseInt($("#size").val() * 5);
                        var color = dom.byId("colorPalette").value;
                        if (symbolStyle === "STYLE_X") {
                            symbols.point = new SimpleMarkerSymbol(style, size,
                                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                            new Color(color), 1),
                                            new Color(color));
                        } else {
                            symbols.point = new SimpleMarkerSymbol(style, size,
                                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                            new Color([0, 0, 0]), 1),
                                            new Color(color));
                        }
                        var graphic = new Graphic(geometry, symbols.point);
                        graphicLayer.add(graphic);
                    }
                break;
                case "polyline":
                    var style = eval("SimpleLineSymbol." + symbolStyle);
                    var color = dom.byId("colorPalette").value;
                    var width = parseInt($("#size").val());
                    symbols.polyline = new SimpleLineSymbol(style, new Color(color), width);
                    var graphic = new Graphic(geometry, symbols.polyline);
                    graphicLayer.add(graphic);
                break;
                case "polygon":
                    var symbolType = $("#symbolOptions").html();
                    var colorHex = dom.byId("colorPalette").value;
                    var style = eval("SimpleFillSymbol." + symbolStyle);
                    var color = Color.fromHex(colorHex);
                    var alpha = 1 - dom.byId("size").value / 10;
                    var sfs = new SimpleFillSymbol(style, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([color.r, color.g, color.b]), 2), new Color([color.r, color.g, color.b, alpha]));
                    symbols.polygon = sfs;
                    var graphic = new Graphic(geometry, symbols.polygon);
                    graphicLayer.add(graphic);
                    //symbols.polygon was changed to sfs, change back to default orange
                    symbols.polygon = new SimpleFillSymbol("solid", new SimpleLineSymbol("solid", new Color([255, 155, 0]), 2), new Color([255, 155, 0, 0.25]));
                break;
                case "label":
                    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]));
                break;
            }
            //drawingTool.deactivate();
            //map.enablePan();
            //$("#radioDraw input").attr("checked", false).button("refresh");
            map.enablePan();
		},
		
		//labelGeom
		//Private class
		_labelGeom: function(geometry){
		    var x1 = geometry.x;
            var y1 = geometry.y
            var x2 = x1 + 10;
            var y2 = y1 + 10;
            var x3 = x1 - 10;
            var y3 = y1;
            var labelPolygon = new Polygon(new SpatialReference({ wkid: 102100 }));
            labelPolygon.addRing([[x1, y1], [x2, y2], [x3, y3], [x1, y1 - 5], [x1, y1]]);
            gsvc.simplify([labelPolygon]).then(lang.hitch(this, function(response){
			    console.log(response);
				this._getLabelPoints(response);
			}));
		},
		// identifyTask.execute(identifyParams).then(lang.hitch(this, function (idResults) { 
			    // //console.log(this.idResults); //if utility selected returns object otherwise undefined
			    // this._utility(idResults, evt); 
				
			// }));
		//getLabelPoints
		//Private Class
		_getLabelPoints: function(graphicsLabel){
		    gsvc.labelPoints(graphicsLabel, function (labelPoints) {
                var style = eval("TextSymbol." + symbolStyle);
                var labelSize = parseInt($("#size").val() * 5);
                var text = $("#text").val();
                var color = dom.byId("colorPalette").value;
                var size = parseInt($("#size").val());
                symbols.textSymbol = new TextSymbol(text);
                var font = new Font(labelSize, Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER, "Arial");
                symbols.textSymbol = new TextSymbol(text).setColor(new Color(color)).setAlign(Font.ALIGN_START).setFont(font);
                labelPointGraphic = new Graphic(labelPoints[0], symbols.textSymbol);
                graphicLayerLabels.add(labelPointGraphic);

            });
		}

		
		
		
		
	//end	
    });
});
