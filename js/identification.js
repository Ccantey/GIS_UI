define(["dojo/_base/declare", "dojo/_base/lang", "dojo/dom", "dojo/on", "esri/tasks/query", "esri/tasks/QueryTask","esri/graphic", "esri/graphicsUtils", "config/commonConfig", "esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/Color", "esri/SpatialReference", "esri/geometry/Polygon", "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters", "esri/geometry/Extent", "app/symbols", "app/measurements","dojo/_base/array"], 
function ( declare, lang, dom, on, Query, QueryTask, Graphic, graphicsUtils, config, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color, SpatialReference, Polygon, IdentifyTask, IdentifyParameters, Extent, symbols, myMeasurements, array) {
    return declare(null, {
    
        //doIdentify
        //Public Class
        identify: function (evt) {
            identifyTask = new IdentifyTask(config.mapServices.dynamic + "?token=" + token);
            identifyParams = new IdentifyParameters();
            identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
            identifyParams.tolerance = 5;
            identifyParams.returnGeometry = true;
            identifyParams.width = map.width;
            identifyParams.height = map.height;
            identifyParams.geometry = evt;
            identifyParams.mapExtent = map.extent;
            identifyParams.layerIds = utilityMap.visibleLayers.concat(config.identifyLayerAdditional);  //UTILITYMAP

            //console.log(identifyParams.layerIds);           
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
            
            identifyParamsParcel = new IdentifyParameters();
            identifyParamsParcel.layerIds = [config.parcelLayerID];
            identifyParamsParcel.tolerance = 1;
            identifyParamsParcel.returnGeometry = true;
            identifyParamsParcel.width  = map.width;
            identifyParamsParcel.height = map.height;
            
            identifyTaskParcel = new IdentifyTask(config.mapServices.dynamic + "?token=" + token);
            
            //A utility is selected
            if (idResults.length > 0) {
                var options = '';
                var i = 0;
                for (i =0, il = idResults.length; i < il; i++) {
                    options += '<option value="' + i + '">' + idResults[i].layerName + "</option>";
                    multipleIdentifyStack.push(idResults[i].feature);
                    multipleIdentifyLayerName.push(idResults[i].layerName);
                }
                //if multiple features selected sort them to identify duplicates
                if (idResults.length > 1) {
                    console.log(idResults);
                    options = '';
                    idResults.sort(function (a, b) {
                        console.log('a: ',a.feature.attributes.OBJECTID,', b: ',b.feature.attributes.OBJECTID); //water mains have overlapping features
                        if (a.feature.attributes.OBJECTID > b.feature.attributes.OBJECTID ) {
                            return 1;
                          }
                          if (a.feature.attributes.OBJECTID < b.feature.attributes.OBJECTID ) {
                            return -1;
                          }
                          
                          // a must be equal to b
                          return 0;
                        });

                    for(i=0; i<idResults.length - 1; i++){
                        //if there are duplicates (when the parent level layer checkbox is selected) remove duplicates
                        if(idResults[i].feature.attributes.OBJECTID == idResults[i+1].feature.attributes.OBJECTID){
                            //console.log(idResults[i].feature.attributes.OBJECTID,' == ',idResults[i+1].feature.attributes.OBJECTID);
                            idResults.splice(idResults[i],1);                            
                            options += '<option value="' + i + '">' + idResults[i].layerName + "</option>";

                        } 
                        //if there are duplicates (when the parent level layer checkbox is NOT selected)
                        else{
                            for (i =0, il = idResults.length; i < il; i++) {
                                options += '<option value="' + i + '">' + idResults[i].layerName + "</option>";
                            }
                        }
                    }
                    //if after you've removed duplicates, there is still multiple selected
                    if (idResults.length > 1) {
                        $('#append').html("Multiple Features Selected (" +idResults.length+")" );
                        $('#multipleSelect,multipleSelect2').html(options);
                        $('#multipleSelect,multipleSelect2').selectBoxIt('refresh');
                        $("#multipleSelectSelectBoxItContainer").show();
                        $('.results.multiple').hide();
                    } else {
                        $('#append').html("");
                        $("#multipleSelectSelectBoxItContainer").hide();
                        $("multipleSelectSelectBoxItArrowContainer").hide();
                    }
                } else {
                     $('#append').html("");
                     $("#multipleSelectSelectBoxItContainer").hide();
                     $("multipleSelectSelectBoxItArrowContainer").hide();
                }
                this._showFeature(multipleIdentifyStack[0]); //utilities selected
                this._layerTabContent(multipleIdentifyStack[0], multipleIdentifyLayerName[0]);
            } else {
                //parcel selected
                $('#append').html("");
                $("#multipleSelectSelectBoxItContainer").hide();
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
            if (layerName == 'A-Drawings') {
                // if($('#sidebar-wrapper').hasClass('active')) {
                //     $('#menu-toggle').addClass('tab');
                // }        
                this._updateTabs();        
                var objectId;
                for (attributesName in layerResults.attributes) {
                    objectId = layerResults.attributes["OBJECTID"];
                    console.log(A_Drawings);
                    A_Drawings.queryAttachmentInfos(objectId).then(lang.hitch(this, function (info) {
                        //console.log('here');
                        $.each(info, function (number,attachment) {
                            var a = '<a target="_blank" href="' + attachment.url + '">' + attachment.name + "</a></td></tr>";
                            //$("#viewAttachment").append(a); 
                            //console.log(a);
                            $("#viewAttachment").html("<tr><th >A-Drawing: </th><td>"+ a+ "</td>")
                        });
                        $("#viewAttachment").show();
                    }));
                }
            } 
            else if (layerName == 'Plat Map') {
                this._updateTabs();
                var objectId;
                for (attributesName in layerResults.attributes) {
                    objectId = layerResults.attributes["OBJECTID"];
                    console.log(A_Drawings);
                    PlatIndex.queryAttachmentInfos(objectId).then(lang.hitch(this, function (info) {
                        //console.log('here');
                        $.each(info, function (number,attachment) {
                            var a = '<a target="_blank" href="' + attachment.url + '">' + attachment.name + "</a></td></tr>";
                            //$("#viewAttachment").append(a); 
                            //console.log(a);
                            $("#viewAttachment").html("<tr><th >Plat Index Map: </th><td>"+ a+ "</td>")
                        });
                        $("#viewAttachment").show();
                    }));
                }
            }
            else if (layerName != 'Parcels') {
                if($('#sidebar-wrapper').hasClass('active')) {
                $('#menu-toggle').addClass('tab');
                }
            this._updateTabs();

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
            $("#viewAttachment").hide();
            console.log(currentProperty.geometry);
            geometryBuffer = [currentProperty.geometry];

            var layerResults = currentProperty;
            //console.log(layerResults);
            this._showFeature(currentProperty);
            this._createSingleTable([currentProperty]);
            if($('#sidebar-wrapper').hasClass('active')) {
                $('#menu-toggle').addClass('tab');
            }
            this._updateTabs();
            var content1 = "";
            var content2 = "";

            content1 += "<tr><th> PIN" + ":</th><td>" + layerResults.attributes['ParcelID'] + "</td></tr>";
            var citySplit = layerResults.attributes["Municipality"].split(',')
            content1 += "<tr><th> Municipality " + ":</th><td>" + citySplit[0] + "</td></tr>";
            content1 += "<tr><th> Property Address" + ":</th><td>" + layerResults.attributes['Address']  + "</td></tr>"; //note misspell
            content1 += "<tr><th> Owner Name " + ":</th><td>" + layerResults.attributes["Owner Name"] + "</td></tr>";
            content1 += "<tr><th> Owner Address" + ":</th><td>" + layerResults.attributes['MAILADDLN1'] + "</br>" + layerResults.attributes['CITYSTZIP'] + "</td></tr>";
            content1 += "<tr><th> Area (Acres)" + ":</th><td>" + (layerResults.attributes['Shape.STArea()'] / 43560).toFixed(2) + "</td></tr>";
            console.log(layerResults.attributes);

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
            //console.log('single', queryFeatures[0].attributes);
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
                //console.log(csvInfo);
                mailParcels.push(queryFeatures[i].attributes['PARCELNO']); //this is where single mail label broke down, changed from [0] to PID_NO
                selectedFeatures.features.push(queryFeatures[i]);
            }
            this._createCSVFile();
        },
        
        //drawGraphic
        //Public Class
        drawGraphic: function(drawn){
            //map.enablePan();
            var layerToBuffer = dom.byId("BufferLayer").value;
            if (layerToBuffer == config.parcelLayerID) {
                var queryTask = new QueryTask(config.mapServices.dynamic + "/" + layerToBuffer + "?token=" + token);
                //console.log(queryTask);
                var query = new Query();
                query.outFields = ["*"];
            } else {
                var queryTask = new QueryTask(config.mapServices.dynamic + "/" + layerToBuffer + "?token=" + token);
                //console.log(queryTask);
                var query = new Query();
                query.outFields = ["*"];
            }
            //if 'select by drawing'
            //console.log(drawn.type);
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
                    query.geometry = this._pointTolerance(map, graphicDraw.geometry, 10);
                    //console.log(query);
                } else {
                    query.geometry = graphicDraw.geometry;
                }

                queryTask.execute(query).then(lang.hitch(this, function (selectionGeometries) {
                    var currentSelection = selectionGeometries.features;
                    //alert(currentSelection.length);
                    if (currentSelection.length == 0 && layerToBuffer != config.parcelLayerID) {
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
                        if (layerToBuffer == config.parcelLayerID && currentSelection.length != 0) {
                            //console.log(selectedFeatures.features)
                            this._createTable(selectedFeatures.features);
                        }
                    }
                }));
            }       
        },
        
        //pointTolerance
        //private class
        _pointTolerance: function (map, point, toleranceInPixel){
           //console.log(map, point, toleranceInPixel);
           //alert('you did it');
            var pixelWidth = map.extent.getWidth() / map.width;
            var toleraceInMapCoords = toleranceInPixel * pixelWidth;            
            extent = new Extent(point.x - toleraceInMapCoords, point.y - toleraceInMapCoords, point.x + toleraceInMapCoords, point.y + toleraceInMapCoords, map.spatialReference);
            console.log(extent);
            return extent;
        },
        
        //createTable
        //Private Class for a few
        _createTable: function(queryFeatures){
            console.log('many', queryFeatures[0].attributes);
            selectedFeatures = { features: [] };
            csvInfo = [];
            //fill/stroke of selected
            var querySymbol = symbols.polygon;
            symbols.polygon = querySymbol;
            var k;
            for (k in queryFeatures[0].attributes) {
            //var a = k.replace('gisWiRapids.LGIM.Parcels','');
            attrAll.push(k);
            //console.log(k);
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
                //Wood county changed their owner name to: Last, First which beefs our csv, must replace commas
                if (typeof(attValues[5]) === "string"){
                        attValues[5] = attValues[5].replace(/,/g," - ");                        
                } else {}
                //console.log(attValues[5]);
                csvInfo.push(attValues.join(","));
                //console.log(csvInfo);
                graphic = new Graphic(queryFeatures[i].geometry, symbols.polygon);
                map.graphics.add(graphic);
                content += "<tr><td >" + queryFeatures[i].attributes['PARCELNO'] + "</td><td>" + queryFeatures[i].attributes['OwnerName'] + "</td><td>" + queryFeatures[i].attributes['Adddress'] + "</td></tr>";
                mailParcels.push(queryFeatures[i].attributes['PARCELNO']);
                selectedFeatures.features.push(queryFeatures[i]);
            }
            this._updateTabs(); 
            $("#multiptleBufferItem").html(content);
            $('.results.multipleBuffer').show();
            $('.results.identify').hide();
            this._createCSVFile();
        },
        
   
        
        //addToMapDrawing
        //PublicClass
        addDrawingToMap: function(geometry){
        
            symbolStyle = $("#symbolOptions").val();
            switch (geometry.type) {
                case "point":
                    if (labelling == true) {
                        var drawText = new myMeasurements();
                        drawText._labelGeom(geometry)
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
                    //symbols.polyline parameter was changed to symbolStyle, change back to default orange
                    symbols.polyline = new SimpleLineSymbol("solid", new Color([255, 155, 0]), 4)
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
        
         
        //searchParcelByAttribute(search)
        //Public class
        searchParcelByAttribute: function(search){     
            map.graphics.clear();
            var query = new Query();
            query.outFields = ['*'];
            query.returnGeometry = true;
            $(".searchClass").show();
            switch (search) {
            case "Owner":
                query.where = "OwnerName = " + "'" + dom.byId("owner").value + "'";
            break;
            case "Address":
                query.where = "Adddress = " + "'" + dom.byId("addresses").value.replace(/,/g, "") + "'";
            break;
            case "PID":
                query.where = "Parcel.PARCELNO  = " + "'" + dom.byId("pid").value.replace(/,/g, "") + "'";
            break;
            }
            var queryTask = new QueryTask(config.mapServices.dynamic + "/" + config.parcelLayerID + "?token=" + token);
            queryTask.execute(query).then(lang.hitch(this, function (searchFeature) {
                this._createSingleTable(searchFeature.features);
                var i;
                var j;
                var graphic;
                var unionExtent;
                var extent;
                var extentParcel;
                if (search == "Owner" && searchFeature.features.length > 1) { //multiple properties
                    selectedFeatures = searchFeature;
                    var content = "<tr><th>PID:</th><th>Owner Name:</th><th>Address:</th></tr>";
                    for (i = 0, il = searchFeature.features.length; i < il; i++) {
                        attValues = [];
                        graphic = new Graphic(searchFeature.features[i].geometry, symbols.polygon);
                        map.graphics.add(graphic);

                        content += "<tr><td >" + searchFeature.features[i].attributes.PARCELNO + "</td><td>" + searchFeature.features[i].attributes["OwnerName"] + "</td><td>" + searchFeature.features[i].attributes["Adddress"] + " </td></tr>";
                        mailParcels.push(searchFeature.features[i].attributes.ParcelID); //This may need to be reviewed
                        selectedFeatures.features.push(searchFeature.features[i]);
                        console.log(content);

                        for (j = 0; j < attrAll.length; j++) {
                            attValues.push(searchFeature.features[i].attributes[attrAll[j]]);
                        }
                        if (searchFeature.features.length == 1) {
                            unionExtent = graphicsUtils.graphicsExtent(allGraphics);
                            map.setExtent(unionExtent.expand(1.5));
                        } else {
                            unionExtent = null;
                            unionExtent = graphicsUtils.graphicsExtent(searchFeature.features);
                            map.setExtent(unionExtent.expand(1.5));
                        }
                        csvInfo.push(attValues.join(","));
                    }
                    //$(".results.multiple.section-sub-header").html(
                    $("#multiptleBufferItem").html(content);
                    $('.results.multipleBuffer').show();
                    //map.setExtent(extentParcel, true);
                    this._updateTabs();

                } else { //one property
                    this._showSearchByAttributeResults(searchFeature.features[0]);
                    
                    $('.results.multiple').hide();
                    $('.results.multipleBuffer').hide();
                    extent = graphicsUtils.graphicsExtent([searchFeature.features[0]]);
                    extentParcel = extent.expand(3);
                    map.setExtent(extentParcel, true);
                    this._showFeature(searchFeature.features[0]);
                    geometryBuffer.push(searchFeature.features[0].geometry);

                }
            }));      
        },
        
        //showSearchByAttributeResults(layerSearchResults
        //private class
        _showSearchByAttributeResults: function(layerSearchResults){
            $(".identify .section-sub-header").html("Property Information");
            $("#singleItem2,.section-sub-header2").show();
            $('.results.identify').show();
            $('#append').html("");
            geometryBuffer = [layerSearchResults.geometry];
            var content1 = "";
            var content2 = "";
            CivilDivisionNameMap = {"34": "Wisconsin Rapids", 
                                     "7": "Grand Rapids", 
                                    "27": "Port Edwards", 
                                    "19": "Senecca", 
                                    "21": "Sigel", 
                                    "17": "Rudolph", 
                                    "24": "Biron"};

            content1 += "<tr><th> PIN" + ":</th><td>" + layerSearchResults.attributes['PARCELNO'] + "</td></tr>";

            if (layerSearchResults.attributes["CivilDivision"] == "34" || layerSearchResults.attributes["CivilDivision"] == "7" || layerSearchResults.attributes["CivilDivision"] == "27" || layerSearchResults.attributes["CivilDivision"] == "19" || layerSearchResults.attributes["CivilDivision"] == "21" || layerSearchResults.attributes["CivilDivision"] == "17" || layerSearchResults.attributes["CivilDivision"] == "24"){
                content1 += "<tr><th> Municipality" + ":</th><td>" + CivilDivisionNameMap[layerSearchResults.attributes['CivilDivision']]+ "</td></tr>";
            };

            content1 += "<tr><th> Property Address" + ":</th><td>" + layerSearchResults.attributes['Adddress'] + "</td></tr>"; //note misspell
            content1 += "<tr><th> Owner Name" + ":</th><td>" + layerSearchResults.attributes['OwnerName'] + "</td></tr>";
            content1 += "<tr><th> Owner Address" + ":</th><td>" + layerSearchResults.attributes['MAILADDLN1'] + "</br>" + layerSearchResults.attributes['CITYSTZIP'] + "</td></tr>";
            content1 += "<tr><th> Area (Acres)" + ":</th><td>" + (layerSearchResults.attributes['SHAPE.STArea()'] / 43560).toFixed(2) + "</td></tr>";
            console.log(layerSearchResults.attributes);
            if (layerSearchResults.attributes['SCHOOLDIST'] == 2) {
                content2 += "<tr><th> School District" + ":</th><td>Wisconsin Rapids</td></tr>";
            } else if (layerSearchResults.attributes['SCHOOLDIST'] == 1){
                content2 += "<tr><th> School District" + ":</th><td>Port Edwards</td></tr>";
            } else {
                content2 += "<tr><th> School District" + ":</th><td>" + layerSearchResults.attributes['SCHOOLDIST'] + "</td></tr>";
            }
            content2 += "<tr><th > Tax Link" + ":</th><td><a style='color:#ff6600' target='_blank' href='" + layerSearchResults.attributes['TaxLink'] + "'</a>" + "Link" + "</td></tr>";
            content2 += "<tr><th > Assessor's Link" + ":</th><td><a style='color:#ff6600' target='_blank' href='" + layerSearchResults.attributes['AssesorLink'] + "'</a>" + "Link" + "</td></tr>";
            $("#singleItem1").html(content1);
            $("#singleItem2").html(content2);
            $('.results.multiple').hide();
            $('.results.identify').show();
            $("#multipleSelectSelectBoxItContainer").hide();
            this._updateTabs();
            this._createSingleTable([layerSearchResults]);
        },
        
        //updateIdentify
        //Public class
        updateIdentify: function(){
            selectedFeatures = { features: [] }; //remove previously selected parcels in results table
            multipleIdentifyLayerName = [];
            map.graphics.clear();
            this._showFeature(multipleIdentifyStack[parseInt($('#multipleSelect,multipleSelect2').val())]);
            this._layerTabContent(multipleIdentifyStack[$('#multipleSelect,multipleSelect2').val()], multipleIdentifyLayerName[$('#multipleSelect,multipleSelect2').val()]);        
        },

        //doBuffer
        //Public class
        doBuffer: function(){
            params.distances = [dom.byId("distance").value];
            params.unit = gsvc[dom.byId("unitBuff").value];           
            params.outSpatialReference = map.spatialReference;
            //params.geodesic = true;
            params.unionResults = true;   
            params.geometries = geometryBuffer;
            gsvc.buffer(params).then(lang.hitch( this, function(features){
                this._showBuffer(features);
            }));
            geometryDraw = [];
        },
        
        //showBuffer
        //Private class
        _showBuffer: function(features){
            $('.results.multipleBuffer').hide();
            var bufferSymbol = symbols.buffer;
            map.graphics.clear();
            if (features.length > 0) {
                var graphic = new Graphic(features[0], bufferSymbol);
                map.graphics.add(graphic);
                queryTask = new QueryTask(config.mapServices.dynamic + "/" + config.parcelLayerID + "?token=" + token);
                var bufferQuery = new Query();
                bufferQuery.outFields = ["*"]; //mailLabelFields;
                bufferQuery.returnGeometry = true;
                bufferQuery.geometry = features[0];
                queryTask.execute(bufferQuery).then(lang.hitch( this, function (fset) {
                    var bufferFeatures = fset.features;
                    console.log(bufferFeatures);
                    this._createTable(bufferFeatures);
                    //console.log(bufferFeatures);
                    navEvent('point');
                    if (fset.features.length > 0) {
                        var allGraphics = array.map(fset.features, function (feature) {
                            return feature;
                        });
                        unionExtent = graphicsUtils.graphicsExtent(allGraphics);
                        map.setExtent(unionExtent.expand(1.5));
                    }
                }));
            }
        },

        //create CSV file
        //Private Class

        _createCSVFile: function() {
            $.post('outputs/csvCreate.php', { q: csvInfo }, function (data) {   });
        },

        _updateTabs: function(){
            $('#noselected').hide();
            if($('#sidebar-wrapper').hasClass('active')){
                $('#sidebar-wrapper').removeClass('active');
                $('#menu-toggle').hide("slow");
            }else{}
            $('#searchTab').removeClass('active in');
            $('#search-tab').removeClass('active');

            $('#layersTab').removeClass('active in');
            $('#layers-tab').removeClass('active');

            $('#toolsTab').removeClass('active in');
            $('#tools-tab').removeClass('active');

            $('#drawTab').removeClass('active in');
            $('#draw-tab').removeClass('active');

            $('#results').addClass('active in');
            $('#results-tab').addClass('active');
            $('#resultsTab').addClass('active in');
        }
        
        
        
        
    //end   
    });
});