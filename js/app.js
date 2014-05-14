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




});
