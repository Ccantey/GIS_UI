define(["dojo/_base/declare", "dojo/_base/lang", "dojo/dom", "esri/graphic", "esri/symbols/Font", "esri/symbols/TextSymbol", "esri/Color", "esri/tasks/AreasAndLengthsParameters", "esri/tasks/LengthsParameters", "esri/tasks/GeometryService", "esri/SpatialReference", "esri/tasks/BufferParameters", "esri/geometry/Polygon", "esri/geometry/Polyline","esri/geometry/geometryEngine","app/symbols"], 
function ( declare, lang, dom, Graphic, Font, TextSymbol, Color, AreasAndLengthsParameters, LengthsParameters, GeometryService, SpatialReference, BufferParameters, Polygon, Polyline,geometryEngine,symbols) {
    return declare(null, {
        
       
        //getAreaAndLength
        //Public class
        getAreaAndLength: function(geometry){
            var labelUnit = { "UNIT_FOOT": " Feet", "UNIT_STATUTE_MILE": "Miles", "UNIT_ACRES": "Acres", "UNIT_SQUARE_FEET": " Sq. Feet", "UNIT_SQUARE_MILES": " Sq. Miles" };

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
            navEvent('defaultIdentify');
            }
            if (geometry.type == 'polyline') {
                measureGraphic = map.graphics.add(new Graphic(geometry, symbols.polyline));
                tbActive = false;
                var lengthParams = new LengthsParameters();
        
                lengthParams.lengthUnit = GeometryService.UNIT_FOOT;
                //console.log("lengthParams.areaUnit: ", lengthParams.lengthUnit); //==9002
                lengthParams.lengthUnit = eval("GeometryService." + dom.byId("measureUnit").value);
                //console.log("lengthParams.areaUnit: ", lengthParams.lengthUnit); //==undefined
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
            firstPoint=null;
            tbActive = false;
            $('#dynamicDistance').html('0 feet');
            $('#infoWindow').css('visibility','hidden');
            navEvent('defaultIdentify');
            }       
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
        },
		
		//measureUpdate changes the units if the select box changes units
		//public
		measureUpdate: function(measureGeometry){
		    var labelUnit = { "UNIT_FOOT": " Feet", "UNIT_STATUTE_MILE": " Miles", "UNIT_ACRES": " Acres", "UNIT_SQUARE_FEET": " Sq. Feet", "UNIT_SQUARE_MILES": " Sq. Miles" };

			if (measureGeometry != null) {

				map.graphics.remove(labelPointGraphic);
				if (measureGeometry[0].type == 'polygon') {
					//setup the parameters for the areas and lengths operation
					var areasAndLengthParams = new AreasAndLengthsParameters();
					areasAndLengthParams.lengthUnit = GeometryService.UNIT_FOOT;
					areasAndLengthParams.areaUnit = eval("GeometryService." + dom.byId("measureUnit").value);
					areasAndLengthParams.calculationType = 'preserveShape';
					//console.log("areasAndLengthParams.areaUnit: ", areasAndLengthParams.areaUnit);


					gsvc.simplify(measureGeometry, function (simplifiedGeometries) {
						areasAndLengthParams.polygons = simplifiedGeometries;
						measureGeometry = simplifiedGeometries;
						gsvc.labelPoints(simplifiedGeometries, function (labelPoints) {
							gsvc.areasAndLengths(areasAndLengthParams, function (result) {
								var font = new Font("13", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_NORMAL, "Arial");
								symbols.textSymbol = new TextSymbol(((result.areas[0].toFixed(2))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +" "+ labelUnit[dom.byId("measureUnit").value]).setColor(new Color([0, 0, 0])).setAlign(Font.ALIGN_START).setFont(font);
								labelPointGraphic = new Graphic(labelPoints[0], symbols.textSymbol);

								map.graphics.add(labelPointGraphic);
							});
						});
					});
				}
				if (measureGeometry[0].type == 'polyline') {
					console.log(measureGeometry[0].type);

					var lengthParams = new LengthsParameters();
					lengthParams.calculationType = 'preserveShape';
					lengthParams.lengthUnit = eval("GeometryService." + dom.byId("measureUnit").value);

					gsvc.simplify(measureGeometry, function (simplifiedGeometries) {
						lengthParams.polylines = simplifiedGeometries;
						var params = new BufferParameters();
						params.calculationType = 'preserveShape';
						params.distances = [100];
						params.bufferSpatialReference = new SpatialReference({ wkid: 102100 });
						params.outSpatialReference = map.spatialReference;

						params.unit = eval("GeometryService.UNIT_FOOT");
						//console.log(lengthParams.lengthUnit); //params.unit returns "9020" // unit is correct for bufferparam.. 9002 == esrifeet
						params.unionResults = true;
						params.geometries = simplifiedGeometries;
						//console.log(lengthParams);
						gsvc.buffer(params, function (geometries) {
							gsvc.labelPoints(geometries, function (labelPoints) {
									//new
									gsvc.lengths(lengthParams, function (result) {
									var font = new Font("13", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_NORMAL, "Arial");
									symbols.textSymbol = new TextSymbol((result.lengths[0].toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + labelUnit[dom.byId("measureUnit").value]).setColor(new Color([0, 0, 0])).setAlign(Font.ALIGN_START).setFont(font);
									labelPointGraphic = new Graphic(labelPoints[0], symbols.textSymbol);
									map.graphics.add(labelPointGraphic);
									});
							});
						});
					});
				}
			}
		
		
		},
        grabStartingPoint: function (evt) {
          // if draw toolbar is active, set starting point using last clicked location
          if (tbActive){
            $('#infoWindow').css('visibility','visible');
            firstPoint = evt.mapPoint;
          }
        },

        calcDistance: function(evt){
          $('#infoWindow').css({
             left:evt.pageX,
             top:evt.pageY
          });
          
          if (tbActive){
            var secondPoint = evt.mapPoint;
            // if toolbar is active and user has already started drawing a line, use the geometryEngine to calculate geodesic distance on the fly
            if (firstPoint){
              var sr = {wkid:102100};
              var lineSeg = new Polyline(sr);
              lineSeg.addPath([firstPoint, secondPoint]);
              var lengthUnit = { "UNIT_FOOT": 9003, "UNIT_STATUTE_MILE": 9035, "UNIT_ACRES": " Acres", "UNIT_SQUARE_FEET": " Sq. Feet", "UNIT_SQUARE_MILES": " Sq. Miles" };
              var lengthLabel = { "UNIT_FOOT": " feet", "UNIT_STATUTE_MILE": " miles", "UNIT_ACRES": " Acres", "UNIT_SQUARE_FEET": " Sq. Feet", "UNIT_SQUARE_MILES": " Sq. Miles" };
              //console.log(lengthUnit[dom.byId("measureUnit").value]);
              howFar = geometryEngine.geodesicLength(lineSeg, lengthUnit[dom.byId("measureUnit").value]); //9003 foot, 9035 mile
              // round to the nearest whole number
              howFar = parseFloat(howFar).toFixed(1) + lengthLabel[dom.byId("measureUnit").value];
              $('#dynamicDistance').html(howFar);
            } 
          }
        }
        
   

        
        
        
        
    //end   
    });
});