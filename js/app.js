$(document).ready(function () {

$("#menu-close").click(function(e) {
	e.preventDefault();
	$("#sidebar-wrapper").toggleClass("active");
	  $('#map-zoom-slider,.esriSimpleSlider,.foot').animate({ 'left': '10px' }, 500, 'easeOutQuad');
 });
  
  
$("#menu-toggle").click(function(e) {
e.preventDefault();
$("#sidebar-wrapper").toggleClass("active");
$('#map-zoom-slider,.esriSimpleSlider,.foot').animate({ 'left': '360px' }, 500, 'easeInQuad');
});

$('.radioset').buttonset();

$('a[data-toggle="tooltip"]').tooltip();


$(".overlayLayer").change(function () {   
	//var inputs = dojo.query(".overlayLayer");
	var inputs = dojo.query(".overlayLayer");
	var visible = [-1];
	for (var i = 0, il = inputs.length; i < il; i++) {
		var layerLabel = $(inputs[i]).find("label:first").html();  //To select labels to check, we must nest <label tag> in htm. and somehow select that nested label
		var layerCheckState = $(inputs[i]).find("input:first");
		//alert(layerCheckState.checked);
		var layerObject = objectFindByKey(globalMapLayers, 'name', layerLabel);
		//console.log(layerObject);
		if ($(layerCheckState).prop("checked")) {
			visible.push(layerObject.id);			
			console.log(layerObject.id);
		}
		else {
			$(layerCheckState).removeAttr("checked");
			var elem = $('li.current_sub').prevAll("checked:first");
			elem.removeClass("checked");
		}
	}

	overlayLayer.setVisibleLayers(visible);
	//legend.refresh();
	//$('.scrollable').nanoScroller();

});

$('.utilityLayer,.parentLayer').change(function () {
    //var inputs = dojo.query(".utilityLayer");
	var inputs = dojo.query(".utilityLayer");

	var visible = [-1];
	for (var i = 0, il = inputs.length; i < il; i++) {
		var layerLabel = $(inputs[i]).find("label:first").html();
		var layerCheckState = $(inputs[i]).find("input:first");
		var layerObject = objectFindByKey(globalMapLayers, 'name', layerLabel);
		if ($(layerCheckState).prop("checked")) {
			visible.push(layerObject.id);
			//console.log(visible);
		}
	}
	if (visible.length > 0) {
		utilityMap.setVisibleLayers(visible);
		
	}
	else {
		utilityMap.setVisibleLayers([-1]);
		map.graphics.clear();
	}
	//legend.refresh();
	//$('.scrollable').nanoScroller();

});	

 function objectFindByKey(array, key, value) {
        //alert(value);
        for (var i = 0; i < array.length; i++) {
		    //alert(array[i].name);
            if (array[i][key] === value) {
                return array[i];
            }
        }
        return null;
    }	
	

});
