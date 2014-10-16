

function viewPrintArea(){
     
    reversePreviewExtent = map.extent;
    var screenPoint = map.toScreen(map.extent.getCenter());
  
  switch($("#paper").val()){
      case "A4 Portrait":
        var xmin =  screenPoint.x - 360;
          var ymin =  screenPoint.y + 421;
          var xmax =  screenPoint.x + 360;
          var ymax =  screenPoint.y - 421;
    break;
    case "A4 Landscape":
        var xmin =  screenPoint.x - 480;
          var ymin =  screenPoint.y + 300;
          var xmax =  screenPoint.x + 480;
          var ymax =  screenPoint.y - 300;
    break;
    case "A3 Portrait":
        var xmin =  screenPoint.x - 480;
          var ymin =  screenPoint.y + 612;
          var xmax =  screenPoint.x + 480;
          var ymax =  screenPoint.y - 612;
    break;
    case "A3 Landscape":
        var xmin =  screenPoint.x - 768;
          var ymin =  screenPoint.y + 400;
          var xmax =  screenPoint.x + 768;
          var ymax =  screenPoint.y - 400;
    break;
  
  }  
  
  var pointGraphic1 = map.toMap(new esri.geometry.ScreenPoint(xmin,ymin));
  var pointGraphic2 = map.toMap(new esri.geometry.ScreenPoint(xmax,ymax));  
  
  var symbol2 = new esri.symbol.SimpleFillSymbol("solid", new esri.symbol.SimpleLineSymbol("dash", new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 0, 0, 0.0]));
  var ext = new esri.geometry.Extent(pointGraphic1.x , pointGraphic1.y, pointGraphic2.x, pointGraphic2.y, map.spatialReference);
  if(printAreaGraphic){
      printAreaGraphic.hide();
        printAreaGraphic = null;
      //map.graphics.remove(printAreaGraphic);
      
    }else{
  printAreaGraphic = new esri.Graphic(ext,symbol2);
  map.graphics.add(printAreaGraphic);
  }
}

function changePrintGraphic(){
  if(printAreaGraphic){
    printAreaGraphic.hide();
    printAreaGraphic = null;
    viewPrintArea();       
  }else{    
    printAreaGraphic = null;
  }
}
function printingLayoutMain() {

    // overlayLayer.url = mapServiceURL;
    // utilityMap.url = mapServiceURL;

    //$("#printOptions").height("130px");
    //esri.show(dojo.byId("loadingPrint"));
    $("#progressbar").show();
    var legendLayer1 = new esri.tasks.LegendLayer();
    legendLayer1.layerId = "Utility";

    var ids1 = $.map(utilityMap.visibleLayers, function (item, index) {
        return window.parseInt(item);
    });
    console.log(ids1);
  // add layers to legend (water/storm/sanitary
    ids1.push(5); //water
    ids1.push(12); //Sewer
    ids1.push(18); //Storm
    
    
  

    legendLayer1.subLayerIds = ids1;

    var legendLayer2 = new esri.tasks.LegendLayer();
    legendLayer2.layerId = "Basemap";
    var ids2 = $.map(overlayLayer.visibleLayers, function (item, index) {
        return window.parseInt(item);
    });
    //ids2.push(34); //zoning
    console.log(ids2);
    var index= ids2.indexOf(1)
    ids2.splice(index,1)
    index= ids2.indexOf(28)
    ids2.splice(index,1)
    index= ids2.indexOf(29)
    ids2.splice(index,1)
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
          // Try CSSing the title a bit
                  "titleText": $("#title").val(),
                  "authorText": "Map Powered by the City of Wisconsin Rapids"
              }
          }
        ];
    }
    else {
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
    dojo.forEach(layouts, function (lo) {
        var t = new esri.tasks.PrintTemplate();
        t.exportOptions = { dpi: 175, width: map.width, height: map.height };
        t.layout = lo.name;
        t.label = lo.label;
        t.format = lo.format;
        t.preserveScale = true;
        t.layoutOptions = lo.options
        templates.push(t);
    });

    var params = new esri.tasks.PrintParameters();
    params.map = map;
    params.template = templates[0];
    printTask.execute(params, function (result) {
        window.open(result.url);
        //document.execCommand('SaveAs','true',result.url);
        $("#progressbar").hide();
        esri.hide(dojo.byId("loadingPrint"));
        $(".progress-bar").css('width','5%')
    });
}
