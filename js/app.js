$(document).ready(function () {

$("#menu-close").click(function(e) {
	e.preventDefault();
	$("#sidebar-wrapper").toggleClass("active");
 });
  
  
$("#menu-toggle").click(function(e) {
e.preventDefault();
$("#sidebar-wrapper").toggleClass("active");
});

$('.radioset').buttonset();

$('a[data-toggle="tooltip"]').tooltip();

});
