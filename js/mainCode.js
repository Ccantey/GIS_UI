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
        iTool.activate(esri.toolbars.Draw.POINT);
        map.enablePan();
        $('.radioset').find(':radio').prop("checked", false);
        $('.radioset').buttonset('refresh');
        $('.results.identify').hide();
        $("#multipleSelectSelectBoxItContainer").hide();
        geometryBuffer = [];
        break;
    case 'point':
        operationToDo = 'selection';
        iTool.activate(esri.toolbars.Draw.POINT);
        $("#multipleSelectSelectBoxItContainer").hide();
        break;
    case 'line':
        operationToDo = 'selection';
        iTool.activate(esri.toolbars.Draw.POLYLINE);
        $("#multipleSelectSelectBoxItContainer").hide();
        break;
    case 'polygon':
        operationToDo = 'selection';
        iTool.activate(esri.toolbars.Draw.POLYGON);
        $("#multipleSelectSelectBoxItContainer").hide();
        break;
    case 'clear':
        map.graphics.clear();
        tempGraphicLayer.clear();
        // look for variables holding values in memory like mesureGeometry
        measureGeometry = null;
        operationToDo = 'identify';
        iTool.activate(esri.toolbars.Draw.POINT);
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
        $('#searchfooter, #toolsfooter').css({'position': 'absolute', 'bottom': '7%'});
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
        iTool.activate(esri.toolbars.Draw.POINT);
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
        $('#searchfooter,#toolsfooter').css({'position': 'absolute', 'bottom':'7%'});
        map.enablePan();
        break;
    case 'clearDrawing':
        graphicLayer.clear();
        graphicLayerLabels.clear();
        operationToDo = 'identify';
        iTool.activate(esri.toolbars.Draw.POINT);
        $('.radioset').find(':radio').prop("checked", false);
        $('.radioset').buttonset('refresh');
        map.enablePan();
        $('#search-tab a').removeClass('notice');
        $('#menu-toggle').removeClass('tab');
        $('#searchfooter,#toolsfooter').css({'position':'absolute','bottom':'7%'});
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
            console.log(layerCheckState);
        };
        $('#search-tab a').removeClass('notice');
        $('#menu-toggle').removeClass('tab');
        $('#searchfooter,#toolsfooter').css({'position':'absolute','bottom':'7%'});
        overlayLayer.setVisibleLayers([-1]); //Resets tab content but does not reset the checkboxes
        utilityMap.setVisibleLayers([-1]);
        aerialLayer.hide();
        basemap.show();
        operationToDo = 'identify';
        iTool.activate(esri.toolbars.Draw.POINT);
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
        esri.show(dojo.byId("loading"));
        navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
        }
        break;
    case "measureLine":
        operationToDo = 'measure';
        measureGeometry = null;
        iTool.activate(esri.toolbars.Draw.POLYLINE);
        break;
    case "measurePolygon":
        operationToDo = 'measure';
        measureGeometry = null;
        iTool.activate(esri.toolbars.Draw.POLYGON);
        break;
    case "drawingPolygon":
        operationToDo = 'drawing';
        labelling = false;
        map.disablePan();
        iTool.activate(esri.toolbars.Draw.POLYGON);
        break;
    case "drawingLine":
        operationToDo = 'drawing';
        labelling = false;
        map.disablePan();
        iTool.activate(esri.toolbars.Draw.POLYLINE);
        break;
    case "drawingPoint":
        operationToDo = 'drawing';
        labelling = false;
        map.disablePan();
        iTool.activate(esri.toolbars.Draw.POINT);
        break;
    case "drawingText":
        operationToDo = 'drawing';
        labelling = true;
        map.disablePan();
        iTool.activate(esri.toolbars.Draw.POINT);
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
    var pixelWidth = map.extent.getWidth() / map.width;
    var toleraceInMapCoords = toleranceInPixel * pixelWidth;
    return new esri.geometry.Extent(point.x - toleraceInMapCoords, point.y - toleraceInMapCoords, point.x + toleraceInMapCoords, point.y + toleraceInMapCoords, map.spatialReference);
}		  

function zoomToLocation(position) {
    //$.mobile.hidePageLoadingMsg(); //true hides the dialog
    var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(position.coords.longitude, position.coords.latitude));
    map.centerAndZoom(pt, 18);
    //uncomment to add a graphic at the current location
    var symbol = symbols.Picture;
    map.graphics.add(new esri.Graphic(pt, symbol));
    esri.hide(dojo.byId("loading"));
}

function drawGraphic(drawn) {  //Tools/Select By
    map.enablePan();
    var layerToBuffer = dojo.byId("BufferLayer").value;
    if (layerToBuffer == parcelLayerID) {
        var queryTask = new esri.tasks.QueryTask(mapServiceURL + "/" + layerToBuffer);
        var query = new esri.tasks.Query();
        query.outFields = ["*"];
    } else {
        var queryTask = new esri.tasks.QueryTask(mapServiceURL + "/" + layerToBuffer);
        var query = new esri.tasks.Query();
        query.outFields = ["*"];
    }
    //if 'select by drawing'
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
    var graphicDraw = new esri.Graphic(drawn, symbolDraw);
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

        queryTask.execute(query, function (selectionGeometries) {
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
                createTable(selectedFeatures.features);
            }
        }
    });
    }
}

function doBuffer() { 
           params.distances = [dojo.byId("distance").value];
           params.unit = gsvc[dojo.byId("unitBuff").value];           
           params.outSpatialReference = map.spatialReference;
           //params.geodesic = true;
           params.unionResults = true;   
           params.geometries = geometryBuffer;
           gsvc.buffer(params, showBuffer);
           geometryDraw = [];
}

function showBuffer(features) {
    $('.results.multipleBuffer').hide();
    var bufferSymbol = symbols.buffer;
    map.graphics.clear();
    if (features.length > 0) {
        var graphic = new esri.Graphic(features[0], bufferSymbol);
        map.graphics.add(graphic);
        queryTask = new esri.tasks.QueryTask(mapServiceURL + "/" + parcelLayerID);
        var bufferQuery = new esri.tasks.Query();
        bufferQuery.outFields = ["*"]; //mailLabelFields;
        bufferQuery.returnGeometry = true;
        bufferQuery.geometry = features[0];
        queryTask.execute(bufferQuery, function (fset) {
            var bufferFeatures = fset.features;
            createTable(bufferFeatures);
            navEvent('point');
            if (fset.features.length > 0) {
                var allGraphics = dojo.map(fset.features, function (feature) {
                        return feature;
                    });
                unionExtent = esri.graphicsExtent(allGraphics);
                map.setExtent(unionExtent.expand(1.5));
            }
        });
    }
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

function createTable(queryFeatures) {
    selectedFeatures = { features: [] };
    csvInfo = [];
    //fill/stroke of selected
    var querySymbol = symbols.polygon;
	//new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([206, 206, 206, 0.65]), 2), new dojo.Color([255, 102, 0, 0.35]));
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
        graphic = new esri.Graphic(queryFeatures[i].geometry, symbols.polygon);
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
}

function createCSVFile() {
    $.post('outputs/csvCreate.php', { q: csvInfo }, function (data) {  });
}

function createSingleTable(queryFeatures) {
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
}

function doIdentify(evt) {
    identifyParams.geometry = evt;
    identifyParams.returnGeometry = true;
    identifyParams.mapExtent = map.extent;
    identifyParams.layerIds = utilityMap.visibleLayers.concat(identifyLayerAdditional);
    identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
    identifyTask.execute(identifyParams, function (idResults) { addToMap(idResults, evt); });
    selectedFeatures = { features: [] }; //remove previously selected parcels in memory 
    $('.results.multipleBuffer').hide(); //remove previously selected parcels in results table
    map.graphics.clear();                //remove previously selected parcels in map
}

function addToMap(idResults, evt) {   
    multipleIdentifyStack = [];
    multipleIdentifyLayerName = [];

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
        showFeature(multipleIdentifyStack[0]);
        layerTabContent(multipleIdentifyStack[0], multipleIdentifyLayerName[0]);
    } else {
            $('#append').html("RESULTS");
            $("#multipleSelectSelectBoxItContainer").hide();
            $('.results.identify').show();
            identifyParamsParcel.mapExtent = map.extent;
            identifyParamsParcel.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
            identifyParamsParcel.geometry = evt;
            identifyTaskParcel.execute(identifyParamsParcel, function (idResults) { doneIdentifyParcel(idResults[0].feature) } );
    }
}

function updateIdentify() {
    selectedFeatures = { features: [] }; //remove previously selected parcels in results table
    multipleIdentifyLayerName = [];
    map.graphics.clear();
    showFeature(multipleIdentifyStack[parseInt($('#multipleSelect,multipleSelect2').val())]);
    layerTabContent(multipleIdentifyStack[$('#multipleSelect,multipleSelect2').val()], multipleIdentifyLayerName[$('#multipleSelect,multipleSelect2').val()]);
}

function layerTabContent(layerResults, layerName) {
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
            console.log(attributesName, layerResults.attributes[attributesName]);
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
}

function doneIdentifyParcel(currentProperty) {
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
    showFeature(currentProperty);
    createSingleTable([currentProperty]);
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
    
}

function SearchParcelByAttribute(search) {
    map.graphics.clear();
    var query = new esri.tasks.Query();
    query.outFields = ['*'];
    query.returnGeometry = true;
    $(".searchClass").show();
    switch (search) {
    case "Owner":
        query.where = "OwnerName = " + "'" + dojo.byId("owner").value + "'";
        break;
    case "Address":
        query.where = "Adddress = " + "'" + dojo.byId("addresses").value.replace(/,/g, "") + "'";
        break;
    case "PID":
        query.where = "Parcels.PARCELNO  = " + "'" + dojo.byId("pid").value.replace(/,/g, "") + "'";
        break;
    }
    var queryTask = new esri.tasks.QueryTask(mapServiceURL + "/" + parcelLayerID);
    queryTask.execute(query, function (searchFeature) {
        createSingleTable(searchFeature.features);
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
                graphic = new esri.Graphic(searchFeature.features[i].geometry, symbols.polygon);
                map.graphics.add(graphic);

                content += "<tr><td >" + searchFeature.features[i].attributes.ParcelID + "</td><td>" + searchFeature.features[i].attributes["OwnerName"] + "</td><td>" + searchFeature.features[i].attributes["BLDG_NUM"] + " " + searchFeature.features[i].attributes["STREETNAME"] + " " + searchFeature.features[i].attributes["ZIP"] + " </td></tr>";
                mailParcels.push(searchFeature.features[i].attributes.ParcelID); //This may need to be reviewed
                selectedFeatures.features.push(searchFeature.features[i]);

                for (j = 0; j < attrAll.length; j++) {
                    attValues.push(searchFeature.features[i].attributes[attrAll[j]]);
                }
                if (searchFeature.features.length == 1) {
                    unionExtent = esri.graphicsExtent(allGraphics);
                    map.setExtent(unionExtent.expand(1.5));
                } else {
                    unionExtent = null;
                    unionExtent = esri.graphicsExtent(searchFeature.features);
                    map.setExtent(unionExtent.expand(1.5));
                }
                csvInfo.push(attValues.join(","));
            }
            //$(".results.multiple.section-sub-header").html(
            $("#multiptleItem").html(content);
            $('.results.multiple').show();
            //map.setExtent(extentParcel, true);

        } else { //one property
            showSearchByAttributeResults(searchFeature.features[0]);
            //console.log(searchFeature.features[0]);
            $('.results.multiple').hide();
            $('.results.multipleBuffer').hide();
            extent = esri.graphicsExtent([searchFeature.features[0]]);
            extentParcel = extent.expand(3);
            map.setExtent(extentParcel, true);
            showFeature(searchFeature.features[0]);
            geometryBuffer.push(searchFeature.features[0].geometry);
        }
    });
}

function showSearchByAttributeResults(layerSearchResults) {
    $(".identify .section-sub-header").html("Property Information");
    $("#singleItem2,.section-sub-header2").show();
    $('.results.identify').show();
    $('#searchfooter').css({'position': 'relative', 'bottom': '0px'});
    geometryBuffer = [layerSearchResults.geometry];
    var content1 = "";
    var content2 = "";
    content1 += "<tr><th> PIN" + ":</th><td>" + layerSearchResults.attributes['gisWiRapids.LGIM.Parcels.PARCELNO'] + "</td></tr>";
    content1 += "<tr><th> Property Address" + ":</th><td>" + layerSearchResults.attributes['gisWiRapids.LGIM.Parcels.Adddress'] + "</td></tr>"; //note misspell
    content1 += "<tr><th> Owner Name" + ":</th><td>" + layerSearchResults.attributes['gisWiRapids.LGIM.Parcels.OwnerName'] + "</td></tr>";
    content1 += "<tr><th> Owner Address" + ":</th><td>" + layerSearchResults.attributes['gisWiRapids.LGIM.Parcels.MAILADDLN1'] + "</br>" + layerSearchResults.attributes['gisWiRapids.LGIM.Parcels.CITYSTZIP'] + "</td></tr>";
    content1 += "<tr><th> Area (Acres)" + ":</th><td>" + (layerSearchResults.attributes['Shape.STArea()'] / 43560).toFixed(2) + "</td></tr>";
    content2 += "<tr><th> School District" + ":</th><td>" + layerSearchResults.attributes['gisWiRapids.LGIM.Parcels.SCHOOLDIST'] + "</td></tr>";
    content2 += "<tr><th > Tax Link" + ":</th><td><a style='color:#ff6600' target='_blank' href='" + layerSearchResults.attributes['gisWiRapids.LGIM.Parcels.TaxLink'] + "'</a>" + "Link" + "</td></tr>";
    content2 += "<tr><th > Assessor's Link" + ":</th><td><a style='color:#ff6600' target='_blank' href='" + layerSearchResults.attributes['gisWiRapids.LGIM.Parcels.AssesorLink'] + "'</a>" + "Link" + "</td></tr>";
    $("#singleItem1").html(content1);
    $("#singleItem2").html(content2);
    $('.results.multiple').hide();
    $('.results.identify').show();
    $("#multipleSelectSelectBoxItContainer").hide();
    createSingleTable([layerSearchResults]);
}

function showFeature(feature) {
    switch (feature.geometry.type) {
    case "point":
        //var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 155, 0]), 1), new dojo.Color([255, 155, 0, 1]));
		var symbol = symbols.point;
        break;
    case "polyline":
        //var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 155, 0]), 4);
		var symbol = symbols.polyline;
        break;
    case "polygon":
        //var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([206, 206, 206, 0.65]), 2), new dojo.Color([255, 102, 0, 0.35]));
		var symbol = symbols.polygon;
        break;
    }
    feature.setSymbol(symbol);
    map.graphics.add(feature);
}

function zoomToTableSelection(element) {
    map.graphics.clear();
    var row = $(element).parent().children().index($(element));
    var zoomGraphic = selectedFeatures.features[row];
    var extent = esri.graphicsExtent([zoomGraphic]);
    var extentParcel = extent.expand(5);
    map.setExtent(extentParcel, true);
    zoomGraphic.setSymbol(symbols.polygon);
    map.graphics.add(zoomGraphic);
    doneIdentifyParcel(zoomGraphic);
}

function createGraphicsMenu() {
    // Creates right-click context menu for GRAPHICS
    ctxMenuForGraphics = new dijit.Menu({});
    ctxMenuForGraphics.addChild(new dijit.MenuItem({
        label: "Delete",
        onClick: function () {
        //console.log(selected.geometry)
            if (selected.geometry == measureGeometry) {
                measureGeometry == null;
            }
            graphicLayer.remove(selected);
        }
    }));

    ctxMenuForGraphics.startup();
    dojo.connect(graphicLayer, "onMouseOver", function (evt) {
        // We'll use this "selected" graphic to enable editing tools
        // on this graphic when the user click on one of the tools
        // listed in the menu.
        selected = evt.graphic;
        // Let's bind to the graphic underneath the mouse cursor
        ctxMenuForGraphics.bindDomNode(evt.graphic.getDojoShape().getNode());
    });

    dojo.connect(graphicLayer, "onMouseOut", function (evt) {
        ctxMenuForGraphics.unBindDomNode(evt.graphic.getDojoShape().getNode());
    });
}

function createMapMenu() {
    // Creates right-click context menu for map
    ctxMenuForMap = new dijit.Menu({
        onOpen: function (box) {
            // Lets calculate the map coordinates where user right clicked.
            // We'll use this to create the graphic when the user clicks
            // on the menu item to "Add Point"
            currentLocation = getMapPointFromMenuPosition(box);
            editToolbar.deactivate();
        }
    });
}

function getMapPointFromMenuPosition(box) {
    var x = box.x, y = box.y;
    switch (box.corner) {
    case "TR":
        x += box.w;
        break;
    case "BL":
        y += box.h;
        break;
    case "BR":
        x += box.w;
        y += box.h;
        break;
    }

    var screenPoint = new esri.geometry.Point(x - map.position.x, y - map.position.y);
    return map.toMap(screenPoint);
}
