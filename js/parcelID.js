define(["dojo/Evented","dojo/_base/declare", "dojo/_base/lang", "esri/arcgis/utils", "dojo/dom", "dojo/dom-class", "dojo/on", "dojo/domReady!"], function (
    evented,
    declare,
    lang,
    arcgisUtils,
    dom,
    domClass,
    on
) {
    return declare([evented], {
        config: {},
        startup: function (config) {
            // config will contain application and user defined info for the template such as i18n strings, the web map id
            // and application id
            // any url parameters and any application specific configuration information.console.log("Hello World!");
            // console.log("My Map:", this.map);
            // console.log("My Config:", this.config);
            if (config) {
                this.config = config;
                //supply either the webmap id or, if available, the item info
                var itemInfo = this.config.itemInfo || this.config.webmap;
                this._createWebMap(itemInfo);
            } else {
                var error = new Error("Main:: Config is not defined");
                this.reportError(error);
            }
        },

        // Sample function
        _helloWorld: function (evt) {
            console.log("Hello World!");
            console.log("My Map:", this.map);
            console.log("My event:", this.evt);
        },
		//doIdentify
	    _identify: function (evt) {
            identifyParams.geometry = evt;
            identifyParams.returnGeometry = true;
            identifyParams.mapExtent = map.extent;
            identifyParams.layerIds = utilityMap.visibleLayers.concat(identifyLayerAdditional);  //UTILITYMAP
            console.log(this);			
            identifyTask.execute(identifyParams).then(lang.hitch(this, function (idResults) { 
			    console.log(this.idResults);
			    this._utility(idResults, evt); 
				
			}));
            selectedFeatures = { features: [] }; //remove previously selected parcels in memory 
            $('.results.multipleBuffer').hide(); //remove previously selected parcels in results table
            map.graphics.clear();                //remove previously selected parcels in map
        },
		_callbackIdentify: function(){
		
		},
        // addToMap
		_utility: function (idResults,evt) {
            multipleIdentifyStack = [];
            multipleIdentifyLayerName = [];
            console.log('idResults[0]',idResults);
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
        _showFeature: function(feature) {
            console.log(feature)
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
		
	//end	
    });
});
