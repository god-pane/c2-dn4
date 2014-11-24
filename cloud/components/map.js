/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author  jerolin
 * @filename map
 * @filetype {object}
 * @filedescription "基于google map的map组件的url"
 * @filereturn {string} maps "google map的url"
 * map component, based on google map, in other words, this is a map wrapper of google map api,
 * replace this with another map wrapper for a lan user. the new map wrapper must have the same method as this.
 * maps is a namespace witch contians base object(size, point, lonlat) and the map wraper.
 * require base cloud, map css styles, google map api.
 */
var mapUrl = "cloud/components/mapImpl/nullmapImpl";
if (CONFIG && CONFIG.map){
    mapUrl = CONFIG.map;
    console.log(mapUrl);
}
define([mapUrl], function(maps) {
	return maps;
});