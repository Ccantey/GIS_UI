function getAreaAndLength(geometry) {
    var labelUnit = { "UNIT_FOOT": " Feet", "UNIT_STATUTE_MILE": "Miles", "UNIT_ACRES": "Acres", "UNIT_SQUARE_FEET": " Sq. Feet", "UNIT_SQUARE_MILES": " Sq. Miles" };
    var es = esri.symbol;
    var dc = dojo.Color;
    symbols.polygonMeasure = new es.SimpleFillSymbol("solid", new es.SimpleLineSymbol("solid", new dc([255, 155, 0]), 2), new dc([0, 200, 0, 0.65]));
    symbols.polyline = new es.SimpleLineSymbol("solid", new dc([255, 155, 0]), 4);
    if (geometry.type == 'polygon') {

        measureGraphic = map.graphics.add(new esri.Graphic(geometry, symbols.polygonMeasure));
        var areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
		areasAndLengthParams.calculationType = 'preserveShape';
        areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_FOOT;
        areasAndLengthParams.calculationType = 'preserveShape';		
        areasAndLengthParams.areaUnit = eval("esri.tasks.GeometryService." + dojo.byId("measureUnit").value); //esri.tasks.GeometryService.UNIT_ACRES;
        
        gsvc.simplify([geometry], function (simplifiedGeometries) {
            areasAndLengthParams.polygons = simplifiedGeometries;
            measureGeometry = simplifiedGeometries;
            gsvc.labelPoints(simplifiedGeometries, function (labelPoints) {
                gsvc.areasAndLengths(areasAndLengthParams, function (result) {
				    var font = new esri.symbol.Font("13", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_NORMAL, "Arial");
                    var textSymbol = new esri.symbol.TextSymbol(((result.areas[0].toFixed(2))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +" "+ labelUnit[$("#measureUnit").val()], font, new dojo.Color("#000000"),"ALIGN_RIGHT");
					
					labelPointGraphic = new esri.Graphic(labelPoints[0], textSymbol);
                    map.graphics.add(labelPointGraphic);
					console.log(labelPoints[0]);
                });
            });
        });
    }
    if (geometry.type == 'polyline') {

        measureGraphic = map.graphics.add(new esri.Graphic(geometry, symbols.polyline));
        var lengthParams = new esri.tasks.LengthsParameters();
		
        lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_FOOT;
        console.log("lengthParams.areaUnit: ", lengthParams.lengthUnit); //==9002
        lengthParams.lengthUnit = eval("esri.tasks.GeometryService." + dojo.byId("measureUnit").value);
        console.log("lengthParams.areaUnit: ", lengthParams.lengthUnit); //==undefined
        lengthParams.calculationType = 'preserveShape';
		
		var sr = new esri.SpatialReference({ wkid: 103734  });
		gsvc.project([geometry], sr, function(projectedGraphic){
			gsvc.simplify(projectedGraphic, function (simplifiedGeometries) {
				measureGeometry = simplifiedGeometries;
				lengthParams.polylines = simplifiedGeometries;
				var params = new esri.tasks.BufferParameters();
				params.calculationType = 'preserveShape';
				params.distances = [100];
				params.bufferSpatialReference = new esri.SpatialReference({ wkid: 103734  });
				params.outSpatialReference = map.spatialReference;
				params.unit = eval("esri.tasks.GeometryService." + "UNIT_FOOT");
				params.unionResults = true;
				params.geometries = simplifiedGeometries;
				gsvc.buffer(params, function (geometries) {
					gsvc.labelPoints(geometries, function (labelPoints) {
						gsvc.lengths(lengthParams, function (result) {
							 var font = new esri.symbol.Font("13", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_NORMAL, "Arial");
							 var textSymbol = new esri.symbol.TextSymbol((result.lengths[0].toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + labelUnit[$("#measureUnit").val()], font, new dojo.Color("#000000"),"ALIGN_RIGHT");
						
							 labelPointGraphic = new esri.Graphic(labelPoints[0], textSymbol);
							 map.graphics.add(labelPointGraphic);
						});
					});
				});
			});
			
			
			});
    }

}

function measureUpdate(measureGeometry) {
    var labelUnit = { "UNIT_FOOT": " Feet", "UNIT_STATUTE_MILE": " Miles", "UNIT_ACRES": " Acres", "UNIT_SQUARE_FEET": " Sq. Feet", "UNIT_SQUARE_MILES": " Sq. Miles" };

    if (measureGeometry != null) {

        map.graphics.remove(labelPointGraphic);
        if (measureGeometry[0].type == 'polygon') {
            //setup the parameters for the areas and lengths operation
            var areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
            areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_FOOT;
            areasAndLengthParams.areaUnit = eval("esri.tasks.GeometryService." + dojo.byId("measureUnit").value);
			areasAndLengthParams.calculationType = 'preserveShape';
            //console.log("areasAndLengthParams.areaUnit: ", areasAndLengthParams.areaUnit);


            gsvc.simplify(measureGeometry, function (simplifiedGeometries) {
                areasAndLengthParams.polygons = simplifiedGeometries;
                measureGeometry = simplifiedGeometries;
                gsvc.labelPoints(simplifiedGeometries, function (labelPoints) {
                    gsvc.areasAndLengths(areasAndLengthParams, function (result) {
                        var font = new esri.symbol.Font("13", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_NORMAL, "Arial");
                        symbols.textSymbol = new esri.symbol.TextSymbol(((result.areas[0].toFixed(2))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +" "+ labelUnit[dojo.byId("measureUnit").value]).setColor(new dojo.Color([0, 0, 0])).setAlign(esri.symbol.Font.ALIGN_START).setFont(font);
                        labelPointGraphic = new esri.Graphic(labelPoints[0], symbols.textSymbol);

                        map.graphics.add(labelPointGraphic);
                    });
                });
            });
        }
        if (measureGeometry[0].type == 'polyline') {
            console.log(measureGeometry[0].type);

            var lengthParams = new esri.tasks.LengthsParameters();
			lengthParams.calculationType = 'preserveShape';
            lengthParams.lengthUnit = eval("esri.tasks.GeometryService." + dojo.byId("measureUnit").value);

            gsvc.simplify(measureGeometry, function (simplifiedGeometries) {
                lengthParams.polylines = simplifiedGeometries;
                var params = new esri.tasks.BufferParameters();
				params.calculationType = 'preserveShape';
                params.distances = [100];
                params.bufferSpatialReference = new esri.SpatialReference({ wkid: 103734 });
                params.outSpatialReference = map.spatialReference;

                params.unit = eval("esri.tasks.GeometryService.UNIT_FOOT");
                //console.log(lengthParams.lengthUnit); //params.unit returns "9020" // unit is correct for bufferparam.. 9002 == esrifeet
                params.unionResults = true;
                params.geometries = simplifiedGeometries;
                //console.log(lengthParams);
                gsvc.buffer(params, function (geometries) {
                    gsvc.labelPoints(geometries, function (labelPoints) {
							//new
							gsvc.lengths(lengthParams, function (result) {
                            var font = new esri.symbol.Font("13", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_NORMAL, "Arial");
                            symbols.textSymbol = new esri.symbol.TextSymbol((result.lengths[0].toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + labelUnit[dojo.byId("measureUnit").value]).setColor(new dojo.Color([0, 0, 0])).setAlign(esri.symbol.Font.ALIGN_START).setFont(font);
                            labelPointGraphic = new esri.Graphic(labelPoints[0], symbols.textSymbol);
                            map.graphics.add(labelPointGraphic);
							});
                    });
                });
            });
        }
    }
}


function addToMapDrawing(geometry) {
    var es = esri.symbol;
    var dc = dojo.Color;

    symbolStyle = $("#symbolOptions").val();
    switch (geometry.type) {
        case "point":
            if (labelling == true) {
                labelGeom(geometry)
            }
            else {
                var style = eval("esri.symbol.SimpleMarkerSymbol." + symbolStyle);
                var size = parseInt($("#size").val() * 5);
                var color = dojo.byId("colorPalette").value;
                if (symbolStyle === "STYLE_X") {
                    symbols.point = new esri.symbol.SimpleMarkerSymbol(style, size,
                                    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                                    new dojo.Color(color), 1),
                                    new dojo.Color(color));
                }
                else {
                    symbols.point = new esri.symbol.SimpleMarkerSymbol(style, size,
                                   new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                                   new dojo.Color([0, 0, 0]), 1),
                                    new dojo.Color(color));
                }
                var graphic = new esri.Graphic(geometry, symbols.point);
                graphicLayer.add(graphic);
            }
            break;
        case "polyline":
            var style = eval("esri.symbol.SimpleLineSymbol." + symbolStyle);
            var color = dojo.byId("colorPalette").value;
            var width = parseInt($("#size").val());
            symbols.polyline = new esri.symbol.SimpleLineSymbol(style, new dojo.Color(color), width);

            var graphic = new esri.Graphic(geometry, symbols.polyline);
            graphicLayer.add(graphic);
            break;
        case "polygon":
            var symbolType = $("#symbolOptions").html();
            var colorHex = dojo.byId("colorPalette").value;
            var style = eval("esri.symbol.SimpleFillSymbol." + symbolStyle);
            var color = dojo.colorFromHex(colorHex);
            var alpha = 1 - dojo.byId("size").value / 10;
            var sfs = new esri.symbol.SimpleFillSymbol(style, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([color.r, color.g, color.b]), 2), new dojo.Color([color.r, color.g, color.b, alpha]));
            symbols.polygon = sfs;
            var graphic = new esri.Graphic(geometry, symbols.polygon);
            graphicLayer.add(graphic);

            break;
        case "label":
            symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
            break;

    }
    //drawingTool.deactivate();
    //map.enablePan();
    //$("#radioDraw input").attr("checked", false).button("refresh");
    map.enablePan();
}


function loadStyle(type) {
    $('#symbolOptions option').remove();
    $('#symbolOptions').selectmenu('destroy');

    iTool.deactivate();
    measureTool.deactivate();
    switch (type) {
        case "point":
            $("#size").prev().html("Size");
            $("#text,#alpha").parent().hide();
            $("#symbolOptions,#size,#colorPick").parent().show();
            $("#labelColor").show();
            $("#size").val(3);
            var options = ["STYLE_CIRCLE", "STYLE_X", "STYLE_DIAMOND", "STYLE_SQUARE"];
            var options2 = ["CIRCLE", "CROSS", "DIAMOND", "SQUARE"];
            var select = document.getElementById("symbolOptions");
            for (var i = 0; i < options.length; i++) {
                if (i == 0) {
                    select.options[select.options.length] = new Option(options2[i], options[i], true, true);
                }
                else {
                    select.options[select.options.length] = new Option(options2[i], options[i]);
                }
            }
            break;
        case "polyline":
            $("#text,#alpha").parent().hide();
            $("#size").prev().html("Width");
            $("#symbolOptions,#colorPick,#size").parent().show();
            $("#labelColor").show();
            $("#size").val(2);
            var options = ["STYLE_SOLID", "STYLE_DASH", "STYLE_DASHDOTDOT", "STYLE_DOT"];
            var options2 = ["SOLID", "DASH", "DASH DOT DOT", "DOT"];
            var select = document.getElementById("symbolOptions");
            for (var i = 0; i < options.length; i++) {
                if (i == 0) {
                    select.options[select.options.length] = new Option(options2[i], options[i], true, true);
                }
                else {
                    select.options[select.options.length] = new Option(options2[i], options[i]);
                }
            }
            break;
        case "polygon":
            $("#text,#size").parent().hide();
            $("#symbolOptions,#alpha,#colorPick").parent().show();
            $("#labelColor").show();
            var options = ["STYLE_SOLID", "STYLE_DIAGONAL_CROSS", "STYLE_NULL"];
            var options2 = ["SOLID", "CROSS HATCH", "OUTLINE"];
            var select = document.getElementById("symbolOptions");
            for (var i = 0; i < options.length; i++) {
                if (i == 0) {
                    select.options[select.options.length] = new Option(options2[i], options[i], true, true);
					
                }
                else {
                    select.options[select.options.length] = new Option(options2[i], options[i]);
			
                }
            }
            break;
        case "label":
            $("#text").parent().show();
            $("#symbolOptions,#alpha,#colorPick,#size").parent().hide();
            $("#labelColor").hide();
            $("#size").prev().html("Size");
            $("#size").val(2);
            var options = ["DECORATION_NONE", "DECORATION_LINETHROUGH", "DECORATION_OVERLINE", "DECORATION_UNDERLINE", "ALIGN_END", "ALIGN_MIDDLE", "ALIGN_START"];
            var options2 = ["NONE", "LINETHROUGH", "OVERLINE", "UNDERLINE", "ALIGN END", "ALIGN MIDDLE", "ALIGN START"];
            var select = document.getElementById("symbolOptions");
            for (var i = 0; i < options.length; i++) {
                if (i == 0) {
                    select.options[select.options.length] = new Option(options2[i], options[i], true, true);
                }
                else {
                    select.options[select.options.length] = new Option(options2[i], options[i]);
                }
            }
            break;
    }
    $("#symbolOptions").selectmenu();
}

function labelGeom(geometryL) {
    var x1 = geometryL.x;
    var y1 = geometryL.y
    var x2 = x1 + 10;
    var y2 = y1 + 10;
    var x3 = x1 - 10;
    var y3 = y1;
    var labelPolygon = new esri.geometry.Polygon(new esri.SpatialReference({ wkid: 103734 }));
    labelPolygon.addRing([[x1, y1], [x2, y2], [x3, y3], [x1, y1 - 5], [x1, y1]]);
    gsvc.simplify([labelPolygon], getLabelPoints);
}

function getLabelPoints(graphicsLabel) {
    var dc = dojo.Color;
    var es = esri.symbol;

    gsvc.labelPoints(graphicsLabel, function (labelPoints) {

        var style = eval("esri.symbol.TextSymbol." + symbolStyle);

        var labelSize = parseInt($("#size").val() * 5);

        var text = $("#text").val();
        var color = dojo.byId("colorPalette").value;

        var size = parseInt($("#size").val());
        symbols.textSymbol = new esri.symbol.TextSymbol(text);


		var font = new esri.symbol.Font(labelSize, esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_BOLDER, "Arial");
        symbols.textSymbol = new esri.symbol.TextSymbol(text).setColor(new dojo.Color(color)).setAlign(esri.symbol.Font.ALIGN_START).setFont(font);
        labelPointGraphic = new esri.Graphic(labelPoints[0], symbols.textSymbol);
        graphicLayerLabels.add(labelPointGraphic);

    });
}



function HexToDec() {
    var colorHex = dojo.byId("colorPalette").value;
    var style = eval("esri.symbol.SimpleFillSymbol." + symbolStyle);
    var colorOutline = dijit.byId("colorPaletteBorder").value;
    var width = parseInt($("#size").val());
    var color = dojo.colorFromHex(colorHex);
    var alpha = dojo.byId("alpha").value;
    //var sfs = new esri.symbol.SimpleFillSymbol(style, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(colorOutline), width), new dojo.Color([color.r, color.g, color.b, alpha]));
    symbols.polygon = new es.SimpleFillSymbol(style, new es.SimpleLineSymbol("solid", new dc(colorOutline), width), new dc([color.r, color.g, color.b, alpha]));

}
