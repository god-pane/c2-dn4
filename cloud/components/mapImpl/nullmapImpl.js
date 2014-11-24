/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author  jerolin
 * map component, based on google map, in other words, this is a map wrapper of google map api,
 * replace this with another map wrapper for a lan user. the new map wrapper must have the same method as this.
 * maps is a namespace witch contians base object(size, point, lonlat) and the map wraper.
 * require base cloud, map css styles, google map api.
 */
define(function(require) {
    require("cloud/base/cloud");
    
    //Create class LonLat
    var LonLat = Class.create({
        initialize: function(lon, lat) {
            this.lon = 116.407013;
            this.lat = 39.926588;
        },

        equals: function(other) {
            var result = false;
            if (other instanceof LonLat) {
                result = (this.lon == other.lon && this.lat == other.lat);
            }
            return result;
        },

        toString: function() {
            return "lon: " + this.lon + ", lat: " + this.lat;
        }
    });
    
    //Create class Bounds
    var Bounds = Class.create({
        initialize: function(leftBottom, rightTop) {
            this.leftBottom = new LonLat();
            this.rightTop = new LonLat();
        }
    });
    
    //Create class Size
    var Size = Class.create({
        initialize: function(width, height) {
            this.width = 0;
            this.height = 0;
        }
    });
    
    //Create class Point
    var Point = Class.create({
        initialize: function(x, y) {
            this.x = 0;
            this.y = 0;
        },

        equals: function(that) {
            return (this.x == that.x && this.y == that.y);
        }
    });

    //TODO: not finished.
    var Icon = Class.create({
        initialize: function(options) {
        }
    });
    
    //Animation object
    var Animation = {
        bounce: 1,//gm.Animation.BOUNCE
        drop: 2//gm.Animation.DROP
    };
    
    //Create class Overlay
    var Overlay = Class.create({
        initialize: function() {
//          this.object = null;
        },

        on: function(name, handler, context) {
            /*var customPsr = null;
            this.processors && (customPsr = this.processors.get(name));
            this.object.addListener(name, function(event) {
                var args = [];
                if (customPsr) {
                    args = customPsr(event);
                }else if (event && event.latLng){
                    args.push({
                        lonLat: getLonLat(event.latLng)
                    });
                }

                handler.apply(context || this, args);
            });*/
        },

        off: function(name) {
            //this.object.unbind(name);
        },

        trigger: function(name) {
//          this.object.notify(name);
        }
    });

    /*
     * support event.
     *  "animation_changed", // None    This event is fired when the marker's animation property changes.
     *  "click", // MouseEvent  This event is fired when the marker icon was clicked.
     *  "clickable_changed", //None This event is fired when the marker's clickable property changes.
     *  "cursor_changed", //None    This event is fired when the marker's cursor property changes.
     *  "dblclick", //MouseEvent    This event is fired when the marker icon was double clicked.
     *  "drag", //MouseEvent    This event is repeatedly fired while the user drags the marker.
     *  "dragend", //   MouseEvent  This event is fired when the user stops dragging the marker.
     *  "draggable_changed", //None This event is fired when the marker's draggable property changes.
     *  "dragstart", // MouseEvent  This event is fired when the user starts dragging the marker.
     *  "flat_changed", //None  This event is fired when the marker's flat property changes.
     *  "icon_changed", //None  This event is fired when the marker icon property changes.
     *  "mousedown", // MouseEvent  This event is fired for a mousedown on the marker.
     *  "mouseout", //MouseEvent    This event is fired when the mouse leaves the area of the marker icon.
     *  "mouseover", //MouseEvent   This event is fired when the mouse enters the area of the marker icon.
     *  "mouseup", //MouseEvent This event is fired for a mouseup on the marker.
     *  "position_changed", //  None    This event is fired when the marker position property changes.
     *  "rightclick", //    MouseEvent  This event is fired for a rightclick on the marker.
     *  "shadow_changed", //    None    This event is fired when the marker's shadow property changes.
     *  "shape_changed", //None This event is fired when the marker's shape property changes.
     *  "title_changed", // None    This event is fired when the marker title property changes.
     *  "visible_changed", //None   This event is fired when the marker's visible property changes.
     *  "zindex_changed" // None    This event is fired when the marker's zIndex property changes.
     */
    //Create class Marker
    var Marker = Class.create(Overlay, {
        initialize: function(options) {
        },
        
        /**
         * define your parameters processor to rebuild google map native event object to your owns.
         */
        processors : $H({ 
        }),

        setOptions: function(options) {
        },

        show: function() {
        },
        
        getPosition: function(){
            return new LonLat();
        },
        
        setDraggable : function(isDraggable){
        },

        hide: function() {
        },

        destroy: function(){
        },

        setMap: function(map){
        }
    });
    
    //support events:
    //  closeclick  None    This event is fired when the close button was clicked.
    // content_changed  None    This event is fired when the content property changes.
    // domready None    This event is fired when the <div> containing the InfoWindow's
    //                  content is attached to the DOM. You may wish to monitor this event if you are building out your info window content dynamically.
    // position_changed None    This event is fired when the position property changes.
    // zindex_changed   None    This event is fired when the InfoWindow's zIndex changes.
    //Create class Bubble
    var Bubble = Class.create(Overlay, {
        initialize: function(options) {
        },

        close: function() {
        },

        getContent: function() {
            return $();
        },

        getPosition: function() {
            return new LonLat();
        },

        open: function(map, overlay) {
        },

        setContent: function(content) {
        },

        setPosition: function(lonlat) {
        },

        setOptions: function(options) {
        }
    });

    //map wrapper.
    /**
     *  "bounds_changed", //This event is fired when the viewport bounds have changed.
     *  "center_changed", //This event is fired when the map center property changes.
     *  "click", //This event is fired when the user clicks on the map
     *          (but not when they click on a marker or infowindow).
     *  "dbclick", //This event is fired when the user double-clicks on the map.
     *          Note that the click event will also fire, right before this one.
     *  "drag", //This event is repeatedly fired while the user drags the map.
     *  "dragend", //This event is fired when the user stops dragging the map.
     *  "dragstart", //This event is fired when the user starts dragging the map.
     *  "heading_changed", //This event is fired when the map heading property changes.
     *  "idle", //This event is fired when the map becomes idle after panning or zooming.
     *  "maptypeid_changed", //This event is fired when the mapTypeId property changes.
     *  "mousemove", //This event is fired whenever the user's mouse moves over the map container.
     *  "mouseout", //arguments MouseEvent  This event is fired when the user's mouse exits the map container.
     *  "mouseover", //arguments MouseEvent This event is fired when the user's mouse enters the map container.
     *  "projection_changed", //arguments None  This event is fired when the projection has changed.
     *  "resize", //arguments None  Developers should trigger this event on the map when the div
     *              changes size: google.maps.event.trigger(map, 'resize') .
     *  "rightclick", //arguments MouseEvent    This event is fired when the DOM contextmenu
     *          event is fired on the map container.
     *  "tilesloaded", //arguments None This event is fired when the visible tiles have finished loading.
     *  "tilt_changed", //arguments None    This event is fired when the map tilt property changes.
     *  "zoom_changed", //arguments None    This event is fired when the map zoom property changes.
     */
    //Create class Map
    var Map = Class.create(cloud.Component, {
        initialize: function($super, options) {
            $super(options);
            this.element.empty();
            $("<p>map is not avaliable now</p>").appendTo(this.element)
        },

        // Sets the viewport to contain the given bounds.
        fitBounds: function(bounds) {
        },

        // Returns the lat/lng bounds of the current viewport. If more than 
        // one copy of the world is visible, the bounds range in longitude 
        // from -180 to 180 degrees inclusive. If the map is not yet initialized 
        // (i.e. the mapType is still null), or center and zoom have not been set 
        // then the result is null or undefined.
        getBounds: function() {
            return new Bounds();
        },

        setCenter: function(lonLat) {
        },

        // Returns the position displayed at the center of the map. Note that 
        // this LatLng object is not wrapped. See LatLng for more information.
        getCenter: function() {
            return new LonLat();
        },

        setZoom: function(level) {
        },

        getZoom: function() {
            return 10;
        },

        // Changes the center of the map by the given distance in pixels. If the distance is less than both the width and height of 
        // the map, the transition will be smoothly animated. Note that the map coordinate system increases from west to east 
        // (for x values) and north to south (for y values).
        panBy: function(x, y) {
        },

        // Changes the center of the map to the given LatLng. If the change is less
        // than both the width and height of the map, the transition will be smoothly animated.
        panTo: function(lonLat) {
        },

        //change the type of the map. accepts string value: hybrid, road, satellite, terrain.
        setMapType: function(type) {
        },

        //update the options of the map.
        setOptions: function(options) {
        },

        addMarker: function(options) {
            return new Marker();
        },

        addControl: function(div, position) {
        },

        addHomeControl: function(lonlat) {
        },

        addPositionControl: function() {
        },

        on: function(name, handler, context) {
        },

        off: function(name) {
        },

        trigger: function(name) {
        },

        destroy: function($super){
            $super();
        }
    });

    //custom controls

    //home control, click it will pan the map to the home position.

    var maps = cloud.maps = cloud.maps || {};
    maps.Map = Map;
    maps.Marker = Marker;
    maps.LonLat = LonLat;
    maps.Point = Point;
    maps.Size = Size;
    maps.Bounds = Bounds;
    maps.Animation = Animation;
    maps.Icon = Icon;
    maps.Bubble = Bubble;
    return maps;
});