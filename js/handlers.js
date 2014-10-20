define(["dojo/ready", "dojo/dom", "dojo/on","esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "app/print","app/identification", "esri/graphicsUtils"],
function(ready, dom, on, SimpleFillSymbol, SimpleLineSymbol, Color, print, identification,graphicsUtils ) {
  ready(function(){
    // This function won't run until the DOM has loaded and other modules that register
    // have run.
	
	
  $('.jquery').each(function() {
    eval($(this).html());
  });
  
  
   //initialize plug-ins
  $('select').selectBoxIt();

  // Evoluter jQuery-IU Color Picker https://github.com/evoluteur/colorpicker
  // The array of colors available in js/evol.colorpicker.js
  $('.color').colorpicker({
        color: '#ff6600',
        displayIndicator: false,
        history: false,
        showOn: 'button'
    });
    $('.color-button div div').append('<i class="icon-caret-down"></i>'); //  Add arrow 
        // Native jQuery-IU Spinner

    $("#size").spinner({
        max: 10,
        min: 1
    });
	
    $('#tree').tree({
      // collapseUiIcon: 'glyphicon glyphicon-star',
      // expandUiIcon: 'glyphicon glyphicon-star'     
    });
    
  $("#menu-close, #menu-close2, #menu-close3, #menu-close4").click(function(e) {
     e.preventDefault();
     $('#menu-toggle').removeClass('tab');
     $("#sidebar-wrapper").toggleClass("active");
     $('#map-zoom-slider,.esriSimpleSlider,.foot').animate({ 'left': '10px' }, 500, 'easeOutQuad');
   });
    

    on(dom.byId('menu-toggle'), 'click', function(e){
        e.preventDefault();
        $('#menu-toggle').removeClass('notice');
        $("#sidebar-wrapper").toggleClass("active");
        $('#map-zoom-slider,.esriSimpleSlider,.foot').animate({ 'left': '360px' }, 500, 'easeInQuad');	
	});


  $('.radioset').buttonset();
  $("#progressbar").hide();
  $('.results.multipleBuffer').hide();
  $('a[data-toggle="tooltip"]').tooltip();   

    //autocomplete
    $("#owner").autocomplete({
        minLength: 2,
        source: function (request, response) {
            $.ajax({
                url: "php/ownerSearch.php",
                dataType: "json",
                data: request,
                type: "GET",
                success: function (data) {
                    response(data);
                }
            });
        }
    });

    $("#addresses").autocomplete({
        minLength: 2,
        source: function (request, response) {
            $.ajax({
                url: "php/addressSearch.php",
                dataType: "json",
                data: request,
                type: "GET",
                success: function (data) {
                    response(data);
                }
            });
        }
    });

    $("#pid").autocomplete({
        minLength: 4,
        source: function (request, response) {
            $.ajax({
                url: "php/pidSearch.php",
                dataType: "json",
                data: request,
                type: "GET",
                success: function (data) {
                    response(data);
                    }
            });
        }
    }); 
    
    // Tools Tab || navEvents
    $('#tools-tab,.btn-clear').click(function(){
       $('.dDot,.drawLine,.Extent').removeClass('ui-state-active');
       dom.byId("owner").value = "";
       dom.byId("addresses").value = "";
       dom.byId("pid").value = "";
    })

    $('#multiplePointSelector').click(function () { //multiple selections
        navEvent('point'); //select by point is the default operationToDo in the tabs section       
    });
    
    $('select#measureUnit').change(function () {
        measure._measureUpdate(measureGeometry);
    });

    $('#toolsTab #measureLength').click(function () {
        $('#toolsTab #measureUnit').html('<option value="UNIT_FOOT">Feet</option><option value="UNIT_STATUTE_MILE">Miles</option>');
        $('#measureUnit').selectBoxIt('enable').selectBoxIt('refresh');
        navEvent('measureLine');
    });
    $('#toolsTab #measureArea').click(function () {
        $('#toolsTab #measureUnit').html('<option value="UNIT_SQUARE_FEET">Sq. Feet</option><option value="UNIT_ACRES">Acres</option><option value="UNIT_SQUARE_MILES">Sq. Miles</option>');
        $('#measureUnit').selectBoxIt('enable').selectBoxIt('refresh');
        navEvent('measurePolygon');
    });

    $('#toolsTab #drawPoint').click(function () {
        navEvent('point');
    });
    $('#toolsTab #drawLine').click(function () {
        navEvent('line');
    });
    $('#toolsTab #Extent').click(function () {
        navEvent('polygon');
    });

    $('#toolsTab #Buffer').click(function () {
        navEvent('buffer');
        app._doBuffer();
        $('#search-tab a').removeClass('notice');
    });

    $('#toolsTab .btn-clear').click(function () {
        navEvent('tools clear');
    });
    
    // Draw Tab
    $('#drawTab .dText').click(function () {
        $('#drawTab .text-row').show();
        $('#drawTab .style-row').hide();
        navEvent('drawingText');
    });
    $('#drawTab .dPoint, #drawTab .dFreeLine, #drawTab .dFreePoly').click(function () {
        $('#drawTab .text-row').hide();
        $('#drawTab .style-row').show();
    });
    $('#drawTab #dPoint').click(function () {
        $('#drawTab #symbolOptions').html('<option value="STYLE_CIRCLE">CIRCLE</option><option value="STYLE_X">CROSS</option><option value="STYLE_DIAMOND">DIAMOND</option><option value="STYLE_SQUARE">SQUARE</option>');
        $('#symbolOptions').selectBoxIt('enable').selectBoxIt('refresh');
        navEvent('drawingPoint');
    });
    $('#drawTab #dFreeLine').click(function () {
        $('#drawTab #symbolOptions').html('<option value="STYLE_SOLID" selected="">SOLID</option><option value="STYLE_DASH">DASH</option><option value="STYLE_DASHDOTDOT">DASH DOT DOT</option><option value="STYLE_DOT">DOT</option>');
        $('#symbolOptions').selectBoxIt('enable').selectBoxIt('refresh');
        navEvent('drawingLine');
    });
    $('#drawTab #dFreePoly').click(function () {
        $('#drawTab #symbolOptions').html('<option value="STYLE_SOLID" selected="">SOLID</option><option value="STYLE_DIAGONAL_CROSS">CROSS HATCH</option><option value="STYLE_NULL">OUTLINE</option>');
        $('#symbolOptions').selectBoxIt('enable').selectBoxIt('refresh');
        navEvent('drawingPolygon');
    });
    $('#drawTab .btn-clear').click(function () {
        navEvent('clearDrawing');
    });
    $('#searchTab .btn-clear').click(function () {
        navEvent('clear');

    }); 
    $('#layersTab .btn-clear').click(function () {
        navEvent('clear');
    });
    
    //Provide feedback for matched characters in autocomplete
    $.ui.autocomplete.prototype._renderItem = function( ul, item){
      var term = this.term.split(' ').join('|');
      var re = new RegExp("(" + term + ")", "gi") ;
      var t = item.label.replace(re,"<span style='color:#ff6600'>$1</span>");
      return $( "<li></li>" )
         .data( "item.autocomplete", item )
         .append( "<a>" + t + "</a>" )
         .appendTo( ul );
    };  
    
    // Print and Feature Forms
    $('#print').click(function() {
	    
        if(printAreaGraphic != null){
            printAreaGraphic.hide();
            printAreaGraphic = null;
        }else{
            printAreaGraphic = null;
        }
        $('#print-box').toggle();
        //$('select').selectBoxIt('refresh');
        $(this).toggleClass('active');
    });

    $('#print-box .btn-secondary, #feature-box .btn-main').click(function () {
        $(this).closest('.form').hide();
        return false;
    });
    
   
	printOptions = new print();
	var printButton = $('#btn-print');
	var printPreview = $('#btn-printArea');
	on(printButton, 'click', function(){
		printOptions._printingLayoutMain();
		$(".progress-bar").animate({
			width: "80%"
		}, 2500);
		return false;
	});
	
	on(printPreview, 'click', function(){
		printOptions._viewPrintArea();
		return false;
	});
	
    $('.mailOption').click(function () {
        $('#mailLabelBox').show();
    });
    
    $('#mailLabelBox .btn-close').click(function () {
        $('#mailLabelBox').hide();
    });
        
    $("#ownerMail").click(function () {
        $.post('outputs/mailLabelOwner.php', { q: mailParcels }, function (data) {
            var mailUrl = "http://gis.wirapids.org/CityViewer-AMD/outputs/"+"" + data;
            window.open(mailUrl, '_blank', 'width=600,height=600');
        });
    });

    $("#residentMail").click(function () {
        $.post('outputs/mailLabelResident.php', { q: mailParcels }, function (data) {
            var mailUrl = "http://gis.wirapids.org/CityViewer-AMD/outputs/" + "" + data;
            window.open(mailUrl, '_blank', 'width=600,height=600');
        });
    });

    $("#bothMail").click(function () {
        $.post('outputs/mailLabelBoth.php', { q: mailParcels }, function (data) {
            var mailUrl = "http://gis.wirapids.org/CityViewer-AMD/outputs/" + "" + data;
            window.open(mailUrl, '_blank', 'width=600,height=600');
        });
    });
    
    $("#search-tab").click(function () {
      $('#search-tab a').removeClass('notice');
    }); 
$("#multiptleBufferItem").on('mouseover', 'tr', function (e) {
        tempGraphicLayer.clear();
        //Changed the fill
        var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
												new Color([0, 0, 0]), 2), new dojo.Color([255, 0, 0, 0.7]));
        var row = $(this).parent().children().index($(this));		
        var zoomGraphic = selectedFeatures.features[row];
        zoomGraphic.setSymbol(sfs);
        tempGraphicLayer.add(zoomGraphic);
    });

    $("#multiptleBufferItem,#multipleItem").on('mouseout', 'tr', function (e) {
        tempGraphicLayer.clear();
    });

    $("#multiptleItem").on('click', 'tr', function (e) {
        tempGraphicLayer.clear();
        //Changed the fill
        var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
												new Color([0, 0, 0]), 2), new Color([255, 0, 0]));
        var row = $(this).parent().children().index($(this));
        var zoomGraphic = selectedFeatures.features[row];
        var extent = graphicsUtils.graphicsExtent([zoomGraphic]);
        var extentParcel = extent.expand(2);
        map.setExtent(extentParcel, true);
        zoomGraphic.setSymbol(sfs);
        tempGraphicLayer.add(zoomGraphic);
        doneIdentifyParcel(zoomGraphic);
    });

	$("#multiptleItem").on('mouseover', 'tr', function (e) {
        tempGraphicLayer.clear();
        //Changed the fill
        var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
												new Color([0, 0, 0]), 2), new Color([255, 0, 0, 0.7]));
        var row = $(this).parent().children().index($(this));
		console.log(row);
        var zoomGraphic = selectedFeatures.features[row];
        zoomGraphic.setSymbol(sfs);
        tempGraphicLayer.add(zoomGraphic);
    });

    $('#map-tools .middle').click(function () {
        navEvent("resetMap");
    });

    $('#map-tools .first').click(function () {
        navEvent("gps");
    });

    $('#dPoint').click(function () {
        $('#draw-tab .size-row th').html('Size');
    });

    $('#dFreePoly').click(function () {
        $('#draw-tab .size-row th').html('Opacity');
    });

    $('#dFreeLine').click(function () {
        $('#draw-tab .size-row th').html('Width');
    });

    $('#dText').click(function () {
        $('#draw-tab .size-row th').html('Size');
    });
	
	
	//from helper.js
 $("#multiptleBufferItem").on('mouseover', 'tr', function (e) {
        tempGraphicLayer.clear();
        //Changed the fill
        var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
												new Color([0, 0, 0]), 2), new Color([255, 0, 0, 0.7]));
        var row = $(this).parent().children().index($(this));		
        var zoomGraphic = selectedFeatures.features[row];
        zoomGraphic.setSymbol(sfs);
        tempGraphicLayer.add(zoomGraphic);
    });

    $("#multiptleBufferItem,#multipleItem").on('mouseout', 'tr', function (e) {
        tempGraphicLayer.clear();
    });

    $("#multiptleItem").on('click', 'tr', function (e) {
        tempGraphicLayer.clear();
        //Changed the fill
        var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
												new Color([0, 0, 0]), 2), new Color([255, 0, 0]));
        var row = $(this).parent().children().index($(this));
        var zoomGraphic = selectedFeatures.features[row];
        var extent = graphicsUtils.graphicsExtent([zoomGraphic]);
        var extentParcel = extent.expand(2);
        map.setExtent(extentParcel, true);
        zoomGraphic.setSymbol(sfs);
        tempGraphicLayer.add(zoomGraphic);
        doneIdentifyParcel(zoomGraphic);
    });

	$("#multiptleItem").on('mouseover', 'tr', function (e) {
        tempGraphicLayer.clear();
        //Changed the fill
        var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
												new Color([0, 0, 0]), 2), new Color([255, 0, 0, 0.7]));
        var row = $(this).parent().children().index($(this));
		console.log(row);
        var zoomGraphic = selectedFeatures.features[row];
        zoomGraphic.setSymbol(sfs);
        tempGraphicLayer.add(zoomGraphic);
    });

    $('#map-tools .middle').click(function () {
        navEvent("resetMap");
    });

    $('#map-tools .first').click(function () {
        navEvent("gps");
    });

    $('#dPoint').click(function () {
        $('#draw-tab .size-row th').html('Size');
    });

    $('#dFreePoly').click(function () {
        $('#draw-tab .size-row th').html('Opacity');
    });

    $('#dFreeLine').click(function () {
        $('#draw-tab .size-row th').html('Width');
    });

    $('#dText').click(function () {
        $('#draw-tab .size-row th').html('Size');
    });
	
	
	
	
	//end ready(){}
  });  
});
