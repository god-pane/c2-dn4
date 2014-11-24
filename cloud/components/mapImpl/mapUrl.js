require("cloud/base/cloud");
var URL="async!http://maps.google.com/maps/api/js?v=3.9&sensor=false&language="+locale.get("language");
define([URL],function(url){
	return url
})