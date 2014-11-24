/**
 * IHMap
 * @author Jerolin
 * 	Include OpenLayers, and a MapFactory.
 *
 */
define(function(require){
	require("cloud/base/cloud");
   	require("cloud/lib/plugin/openlayers");
    require("async!http://maps.google.com/maps/api/js?v=3.5&sensor=false");
    OpenLayers.ImgPath = require.toUrl("../../resources/images/");
    
    var MapFactory = {
        mapType: "google",
        url: "http://maps.google.com/maps/api/js?v=3.5&sensor=false",
        
        getMap: function(){
            switch (this.mapType) {
                case "google":
                    return this.getGoogleMap();
                    break;
                case "wms":
                    return this.getWMS();
                    break;
                default:
                    break;
            }
        },
        
        getWMS: function(){
            var wms = new OpenLayers.Layer.WMS("Basic", "http://vmap0.tiles.osgeo.org/wms/vmap0", {
                layers: 'basic'
            });
            return wms;
        },
        
        getGoogleMap: function(){
            var mapObj = null;
            mapObj = new OpenLayers.Layer.Google("Google Physical", {
                type: google.maps.MapTypeId.TERRAIN
            }, {
                isBaseLayer: true,
                numZoomLevels: 16
            });
            return mapObj;
        }
    };
    
    var Map = function(div, options){
        // add controls to map
        
        var setting = $.extend({
            controls: [new OpenLayers.Control.LayerSwitcher({
                'ascending': false
            }), new OpenLayers.Control.PanZoomBar(), new OpenLayers.Control.MousePosition({
                displayProjection: new OpenLayers.Projection("EPSG:4326")
            }), new OpenLayers.Control.Navigation()],
            theme: null
        }, options);
        return this.initialize(div, setting);
    };
    
    Map.prototype = {
        map: null,
        mapObj: null,
        defaultZoomLevel: 7,
        clientProjection: new OpenLayers.Projection("EPSG:4326"),
        layers: [],
        defaultVectorOptions: {
            projection: null,
            styleMap: new OpenLayers.StyleMap({
                graphicWidth: 20,
                graphicHeight: 24,
                graphicYOffset: -24
            })
        },
        
        
        initialize: function(div, options){
            //initialize map, get map from map factory.
            this.map = new OpenLayers.Map(div, options);
            
            this.mapObj = MapFactory.getMap();
            this.map.addLayer(this.mapObj);
            
            this.setCenter(0, 0, this.defaultZoomLevel);
            
            this.myLayer = new OpenLayers.Layer.Markers("My Location");
            this.map.addLayer(this.myLayer);
            
            this.defaultVectorOptions.projection = this.map.getProjection();
            
        },
        
        layerSelectable: function(layer, options){
            if (layer instanceof OpenLayers.Layer.Vector) {
                $.extend(options, {
                    autoActivate: true
                });
                var selectControl = new OpenLayers.Control.SelectFeature(layer, options);
                this.map.addControl(selectControl);
            } else {
                log.error("a selectable layer must be a Vector Layer");
            }
        },
        
        createLayer: function(name, options){
            return this.createVectorLayer(name, options);
        },
        
        createVectorLayer: function(name, options){
            var settings = $.extend({}, this.defaultVectorOptions, options);
            var layer = new OpenLayers.Layer.Vector(name, settings);
            this.layers.push(layer);
            this.map.addLayer(layer);
            return layer;
        },
        
        addMyLocation: function(lon, lat, show){
            this.myLocation = this.createMarker(this.myLayer, 16, 26, lon, lat, require.toUrl("../../resources/images/map-marker.png"));
            if (typeof showPanel === "undefined" || show) {
                this.map.addControl(new OpenLayers.Control.MyLocation({
                    myLocation: this.myLocation
                }));
            }
        },
        
        //set extent to 
        setAutoCenter: function(){
            //this.map.zoomToExtent(this.onlineLayer.getDataExtent());
        },
        
        setZoom: function(level){
            if (this.mapObj.numZoomLevels > level && 0 < level) {
                this.map.zoomTo(level);
            }
        },
        
        getZoom: function(){
            return this.map.getZoom();
        },
        
        //create a marker and add it to a layer.
        addMarker: function(layer, width, height, lon, lat, src, options){
            return this.createVectorMarker(layer, width, height, lon, lat, src, options);
        },
        
        //create marker use OpenLayers.Marker
        createMarker: function(layer, width, height, lon, lat, src, options){
            var marker = null;
            if (arguments.length == 2) {
                arguments[0].addMarker(arguments[1]);
                marker = arguments[1];
            } else {
                var size = new OpenLayers.Size(width, height);
                var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
                var icon = new OpenLayers.Icon(src, size, offset);
                marker = new OpenLayers.Marker(this.getServerLonLat(lon, lat), icon);
                layer.addMarker(marker);
            }
            return marker;
            
        },
        
        // create marker use OpenLayers.Feature.Vector and OpenLayers.Geometry.Point
        createVectorMarker: function(layer, width, height, lon, lat, src, options){
            var lonlat = this.getServerLonLat(lon, lat);
            var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
            $.extend(options, {
                graphicWidth: width,
                graphicHeight: height,
                externalGraphic: src
            });
            
            var markerFeature = new OpenLayers.Feature.Vector(point, null, options);
            layer.addFeatures([markerFeature]);
            return markerFeature;
        },
        
        bind: function(event, target, handler){
            if (!target.events) {
                log.error("this target dosn't have events property");
            }
            target.events.register(event, target, handler);
        },
        
        addPopup: function(feature, content){
            if (arguments.length == 1) {
                this.map.addPopup(arguments[0]);
            } else {
                var popup = new OpenLayers.Popup.FramedCloud(feature.id + "_popup", feature.geometry.getBounds().getCenterLonLat(), new OpenLayers.Size(500, 500), content, null, false, null);
                popup.autoSize = true;
                feature.popup = popup;
                this.map.addPopup(popup);
            }
        },
        
        removePopup: function(feature){
            this.map.removePopup(feature.popup);
        },
        
        
        panTo: function(lon, lat){
            if (arguments.length == 1) {
                this.map.panTo(arguments[0]);
            } else {
                this.map.panTo(this.getServerLonLat(lon, lat));
            }
        },
        
        
        panToMyLocation: function(){
            this.panTo(this.myLocation.lonlat);
        },
        
        setCenter: function(lon, lat, zoom){
            var lonLat = this.getServerLonLat(lon, lat);
            this.map.setCenter(lonLat, zoom);
        },
        
        getCenter: function(){
            return this.map.getCenter();
        },
        
        getClientLonLat: function(lon, lat){
            var transPoint = null;
            if (arguments.length == 1) {
                transPoint = arguments[0];
            } else {
                transPoint = new OpenLayers.LonLat(arguments[0], arguments[1]);
            }
            return transPoint.transform(this.map.getProjectionObject(), this.clientProjection);
        },
        
        getServerLonLat: function(lon, lat){
            var transPoint = null;
            if (arguments.length == 1) {
                transPoint = arguments[0];
            } else {
                transPoint = new OpenLayers.LonLat(arguments[0], arguments[1]);
            }
            return transPoint.transform(this.clientProjection, this.map.getProjectionObject());
        }
    };
    
    OpenLayers.Control.Location = OpenLayers.Class(OpenLayers.Control, {
        $div: null,
        myLocation: null,
        autoActivate: true,
        handlers: {},
        
        initialize: function(options){
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
        },
        
        draw: function(){
            OpenLayers.Control.prototype.draw.apply(this, arguments);
            this.$div = $(this.div);
            this.$div.css({
                width: '100px',
                height: '20px',
                left: '50%',
                bottom: '10px'
            });
            $("<div>").addClass("icon").css({}).appendTo(this.$div);
            $("<div>").addClass("text").text("我的位置").css({}).appendTo(this.$div);
            
            this.events.attachToElement(this.div);
            this.events.register("click", this, this.onButtonClick);
            
            return this.div;
        },
        
        onButtonClick: function(evt){
            this.map.panTo(this.myLocation.lonlat);
        },
        
        destroy: function(){
            if (this.map) {
                this.map.events.unregister("click", this, this.onButtonClick);
            }
            this.$div = null; this.myLocation = null; OpenLayers.Control.prototype.destroy.apply(this);
        },
        
        CLASS_NAME: "OpenLayers.Control.Location"
    });
    
    
    OpenLayers.Control.MyLocation = OpenLayers.Class(OpenLayers.Control, {
        $div: null,
        myLocation: null,
        autoActivate: true,
        handlers: {},
        
        initialize: function(options){
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
        },
        
        draw: function(){
            OpenLayers.Control.prototype.draw.apply(this, arguments);
            this.$div = $(this.div);
            this.$div.css({
                width: '100px',
                height: '20px',
                left: '50%',
                bottom: '10px'
            });
            $("<div>").addClass("icon").css({}).appendTo(this.$div);
            $("<div>").addClass("text").text("我的位置").css({}).appendTo(this.$div);
            
            this.events.attachToElement(this.div);
            this.events.register("click", this, this.onButtonClick);
            
            return this.div;
        },
        
        onButtonClick: function(evt){
            this.map.panTo(this.myLocation.lonlat);
        },
        
        destroy: function(){
            if (this.map) {
                this.map.events.unregister("click", this, this.onButtonClick);
            }
            this.$div = null; this.myLocation = null; OpenLayers.Control.prototype.destroy.apply(this);
        },
        
        CLASS_NAME: "OpenLayers.Control.MyLocation"
    });
    
    cloud.Map = Map;
	return Map;
});
