/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author  jerolin
 * map component, based on google map, in other words, this is a map wrapper of google map api,
 * replace this with another map wrapper for a lan user. the new map wrapper must have the same method as this.
 * maps is a namespace witch contians base object(size, point, lonlat) and the map wraper.
 * require base cloud, map css styles, google map api.
 */
define(function(require) {
	var MapUrl=require("./mapUrl");
//	require(MapUrl);
	require("../map.css");
	var defaults, //default map initialize options. 
	gm, //shortcut for google.maps
	types, //map types
	positions, //control positions
	controls; //all support controls of the map.
	
	//google.maps
	try{
		gm = google.maps;
	}
	catch(err){
		dialog.render({
			text:locale.get("loading_map_error_please_refresh_the_page+!")
		});
	}
	//Defaults map object
	defaults = {
		zoom: 12,
		center: [52.49, 13.37],
		enable: ['behavior', 'zoombar', 'scalebar', 'typeselector'],
		type: 'map',
		/*All available components. Commented out, saves bytes.*/
		/*all: ['behavior', 'zoombar', 'scalebar', 'typeselector', 'overview', 'traffic', 'publictransport', 'positioning', 'rightclick', 'contextmenu']*/
		marker: {
			text: '',
			textColor: '#333333',
			fill: '#ff6347',
			stroke: '#333333',
			shape: 'balloon',
			icon: undefined
		},
		bubble: {
			content: '',
			closable: true,
			onclose: $.noop
		},
		heatmap: {
			max: 20,
			opacity: 0.8,
			coarseness: 2
		}
	};
	
	//Map types
	types = {
		hybrid: gm.MapTypeId.HYBRID,
		road: gm.MapTypeId.ROADMAP,
		satellite: gm.MapTypeId.SATELLITE,
		terrain: gm.MapTypeId.TERRAIN
	};
	
	//Control positions
	positions = {
		"bottom center": gm.ControlPosition.BOTTOM_CENTER,
		"bottom left": gm.ControlPosition.BOTTOM_LEFT,
		"bottom right": gm.ControlPosition.BOTTOM_RIGHT,
		"left bottom": gm.ControlPosition.LEFT_BOTTOM,
		"left center": gm.ControlPosition.LEFT_CENTER,
		"left top": gm.ControlPosition.LEFT_TOP,
		"right bottom": gm.ControlPositionRIGHT_BOTTOM,
		"right center": gm.ControlPosition.RIGHT_CENTER,
		"right top": gm.ControlPosition.RIGHT_TOP,
		"top center": gm.ControlPosition.TOP_CENTER,
		"top left": gm.ControlPosition.TOP_LEFT,
		"top right": gm.ControlPosition.TOP_RIGHT
	};
	
	//Get position
	function getPosition(string) {
		var str = string.gsub(/ +/, " ").trim();
		return positions[str];
	}
	
	//Get map type
	function getMapType(type) {
		return types[type.trim()];
	}

	// util methods for translate between loca base objects and google objects.
	// 
	// convert to google objects.
	
	//Get google lonlat
	function getGoogleLonLat(lonlat) {
		return new gm.LatLng(lonlat.lat, lonlat.lon);
	}
	
	//Get google bounds
	function getGoogleBounds(bounds) {
		return new gm.LatLngBounds(getGoogleLonLat(bounds.leftBottom), getGoogleLonLat(bounds.rightTop));
	}
	
	//Get google size
	function getGoogleSize(size) {
		return new gm.Size(size.width, size.width);
	}
	
	//Get google point
	function getGooglePoint(point) {
		return new gm.Point(point.x, point.y);
	}

	//convert to local base objects.
	
	//Get lonlat
	function getLonLat(latLng) {
		return new LonLat(latLng.lng(), latLng.lat());
	}
	
	//Get size
	function getSize(size) {
		return new Size(size.width, size.height);
	}
	
	//Get bounds
	function getBounds(bounds) {
		return new Bounds(getLonLat(bounds.getSouthWest()), getLonLat(bounds.getNorthEast()));
	}
	
	//Get point
	function getPoint(point) {
		return new Point(point.x, point.y);
	}

	
	// Base objects.
	
	//Create class LonLat
	var LonLat = Class.create({
		initialize: function(lon, lat) {
			this.lon = lon;
			this.lat = lat;
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
			this.leftBottom = leftBottom;
			this.rightTop = rightTop;
		}
	});
	
	//Create class Size
	var Size = Class.create({
		initialize: function(width, height) {
			this.width = width;
			this.height = height;
		}
	});
	
	//Create class Point
	var Point = Class.create({
		initialize: function(x, y) {
			this.x = x;
			this.y = y;
		},

		equals: function(that) {
			return (this.x == that.x && this.y == that.y);
		}
	});

	//TODO: not finished.
	var Icon = Class.create({
		initialize: function(options) {
			cloud.util.defaults(options, {
				anchor: new Point(0, 0),
				origin: new Point(0, 0),
				size: new Size(27, 37),
				url: ""
			});

			var config = $.extend({}, options);

			config.anchor = new gm.Point(options.anchor.x, options.anchor.y);
			config.origin = new gm.Point(options.origin.x, options.origin.y);
			config.size = new gm.Point(options.size.x, options.size.y, "px", "px");

			this.object = new gm.Icon(config);
		}
	});
	
	//Animation object
	var Animation = {
		bounce: gm.Animation.BOUNCE,
		drop: gm.Animation.DROP
	};
	
	//markerOptions object,set marker options
	var markerOptions = {
		anchorPoint: new Point(0, 0),
		animation: null,
		draggable: false,
		flat: false, //If true, the marker shadow will not be displayed.
		position: new LonLat(0, 0),
		raiseOnDrag: true,
		icon: null,
		shadow: null,
		optimized: true, //Optimization renders many markers as a single static element. Optimized 
		//rendering is enabled by default. Disable optimized rendering for
		//animated GIFs or PNGs, or when each marker must be rendered as a separate DOM element (advanced usage only).
		title: "",
		visible: true
	};

	//Create class Overlay
	var Overlay = Class.create({
		initialize: function() {
			this.object = null;
		},

		on: function(name, handler, context) {
			var customPsr = null;
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
			});
		},

		off: function(name) {
			this.object.unbind(name);
		},

		trigger: function(name) {
			this.object.notify(name);
		}
	});

	/*
	 * support event.
	 *  "animation_changed", //	None	This event is fired when the marker's animation property changes.
	 *	"click", //	MouseEvent	This event is fired when the marker icon was clicked.
	 *	"clickable_changed", //None	This event is fired when the marker's clickable property changes.
	 *  "cursor_changed", //None	This event is fired when the marker's cursor property changes.
	 *	"dblclick", //MouseEvent	This event is fired when the marker icon was double clicked.
	 *	"drag", //MouseEvent	This event is repeatedly fired while the user drags the marker.
	 *	"dragend", //	MouseEvent	This event is fired when the user stops dragging the marker.
	 *	"draggable_changed", //None	This event is fired when the marker's draggable property changes.
	 *	"dragstart", //	MouseEvent	This event is fired when the user starts dragging the marker.
	 *	"flat_changed", //None	This event is fired when the marker's flat property changes.
	 *	"icon_changed", //None	This event is fired when the marker icon property changes.
	 *	"mousedown", //	MouseEvent	This event is fired for a mousedown on the marker.
	 *	"mouseout", //MouseEvent	This event is fired when the mouse leaves the area of the marker icon.
	 *	"mouseover", //MouseEvent	This event is fired when the mouse enters the area of the marker icon.
	 *	"mouseup", //MouseEvent	This event is fired for a mouseup on the marker.
	 *	"position_changed", //	None	This event is fired when the marker position property changes.
	 *	"rightclick", //	MouseEvent	This event is fired for a rightclick on the marker.
	 *	"shadow_changed", //	None	This event is fired when the marker's shadow property changes.
	 *	"shape_changed", //None	This event is fired when the marker's shape property changes.
	 *	"title_changed", //	None	This event is fired when the marker title property changes.
	 *	"visible_changed", //None	This event is fired when the marker's visible property changes.
	 *	"zindex_changed" //	None	This event is fired when the marker's zIndex property changes.
	 */
	//Create class Marker
	var Marker = Class.create(Overlay, {
		initialize: function(options) {
			cloud.util.defaults(options, markerOptions);
			options.position = getGoogleLonLat(options.position);
			options.anchorPoint = getGooglePoint(options.anchorPoint);
			// options.icon = options.icon.object || options.icon || null;
			this.options = options;
			this.object = new gm.Marker(options);
		},
		
		/**
		 * define your parameters processor to rebuild google map native event object to your owns.
		 */
		processors : $H({ 
			dragend : function(event){
				
				//your event object array, defined 
				var args = [];
				
				if (event) {
					
					//push to your 
					args.push({
						lonLat: getLonLat(event.latLng),
						pixel : event.pixel
					});
				}
				return args;
			}
		}),

		setOptions: function(options) {
			$.extend(this.options, options);
			this.object.setOptions(options);
		},

		show: function() {
			this.object.setVisible(true);
			if(this.bubble){
				this.bubble.object.open(this.object.map, this.object);
			}
		},
		
		getPosition: function(){
			return getLonLat(this.object.getPosition());
		},
		
		setDraggable : function(isDraggable){
			this.object.setDraggable(isDraggable);
		},

		hide: function() {
			this.object.setVisible(false);
			if(this.bubble){
				this.bubble.close();
			}
		},

		destroy: function(){
			this.setMap(null);
		},

		setMap: function(map){
			this.object.setMap(map === null ? map : map.map);
		}
	});
	
	var bubbleOptions = {
		content: "",
		disableAutoPan: false,
		maxWidth: 2000,
		pixelOffset: new Size(0, 0),
		position: null
	};


	//support events:
	//	closeclick	None	This event is fired when the close button was clicked.
	// content_changed	None	This event is fired when the content property changes.
	// domready	None	This event is fired when the <div> containing the InfoWindow's
	//                  content is attached to the DOM. You may wish to monitor this event if you are building out your info window content dynamically.
	// position_changed	None	This event is fired when the position property changes.
	// zindex_changed	None	This event is fired when the InfoWindow's zIndex changes.
	//Create class Bubble
	var Bubble = Class.create(Overlay, {
		initialize: function(options) {
			cloud.util.defaults(options, bubbleOptions);

			options.pixelOffset = getGoogleSize(options.pixelOffset);
			this.options = options;
			if (this.options.content instanceof jQuery) {
				this.options.content = this.options.content.get(0);
			}

			this.object = new gm.InfoWindow(options);
			var self = this;
			this.object.addListener("closeclick", function(){
				self.visible = false;
			});
		},

		close: function() {
			this.visible = false;
			this.object.close();
		},

		getContent: function() {
			return $(this.object.getContent());
		},

		getPosition: function() {
			return getLonLat(this.object.getPosition());
		},

		open: function(map, overlay) {
			this.visible = true;
			this.object.open(map.map, overlay.object);
		},

		setContent: function(content) {
			if (content instanceof jQuery) {
				content = content[0];
			}

			this.object.setContent(content);
		},

		setPosition: function(lonlat) {
			this.object.setPosition(getGoogleLonLat(lonlat));
		},

		setOptions: function(options) {
			$.extend(this.options, options);
			this.object.setOptions(options);
		}
	});

	//map wrapper.
	/**
	 *  "bounds_changed", //This event is fired when the viewport bounds have changed.
	 *	"center_changed", //This event is fired when the map center property changes.
	 *	"click", //This event is fired when the user clicks on the map
	 *			(but not when they click on a marker or infowindow).
	 *	"dbclick", //This event is fired when the user double-clicks on the map.
	 *			Note that the click event will also fire, right before this one.
	 *	"drag", //This event is repeatedly fired while the user drags the map.
	 *	"dragend", //This event is fired when the user stops dragging the map.
	 *	"dragstart", //This event is fired when the user starts dragging the map.
	 *	"heading_changed", //This event is fired when the map heading property changes.
	 *	"idle", //This event is fired when the map becomes idle after panning or zooming.
	 *	"maptypeid_changed", //This event is fired when the mapTypeId property changes.
	 *	"mousemove", //This event is fired whenever the user's mouse moves over the map container.
	 *	"mouseout", //arguments MouseEvent	This event is fired when the user's mouse exits the map container.
	 *	"mouseover", //arguments MouseEvent	This event is fired when the user's mouse enters the map container.
	 *	"projection_changed", //arguments None	This event is fired when the projection has changed.
	 *	"resize", //arguments None	Developers should trigger this event on the map when the div
	 *              changes size: google.maps.event.trigger(map, 'resize') .
	 *	"rightclick", //arguments MouseEvent	This event is fired when the DOM contextmenu
	 *			event is fired on the map container.
	 *	"tilesloaded", //arguments None	This event is fired when the visible tiles have finished loading.
	 *	"tilt_changed", //arguments None	This event is fired when the map tilt property changes.
	 *	"zoom_changed", //arguments None	This event is fired when the map zoom property changes.
	 */
	//Create class Map
	var Map = Class.create(cloud.Component, {
		initialize: function($super, options) {
			this.moduleName = "cloud-map";
			$super(options);

			this.element.addClass("cloud-map");

			var config = {
				zoom: 3, //this view could watch all of china.
				streetViewControl: false, //disable street view.
				center: new LonLat(104.06593322753906, 30.65858758131289), //default center is chengdu.
				mapTypeId: "road",
				maxZoom: null, //set null to ignore this property.
				minZoom: null,
				disableDefaultUI: true,
				mapTypeControl: false,
				overviewMapControl: false,
				panControl: true,
				panControlOptions: {
					position: getPosition("right top")
				},
				rotateControl: false,
				scaleControl: false,
				zoomControlOptions: {
					style: gm.ZoomControlStyle.LARGE,
					position: getPosition("right top")
				}
			};

			if (this.element.height() < 400) {
				config.zoomControlOptions.style = gm.ZoomControlStyle.SMALL;
			}

			$.extend(config, options);

			//convert options to google map support type.
			config.mapTypeId = getMapType(config.mapTypeId);
			config.center = getGoogleLonLat(config.center);


			this.map = new gm.Map(this.element.context, config);
		},

		// Sets the viewport to contain the given bounds.
		fitBounds: function(bounds) {
			this.map.fitBounds(getGoogleBounds(bounds));
		},

		// Returns the lat/lng bounds of the current viewport. If more than 
		// one copy of the world is visible, the bounds range in longitude 
		// from -180 to 180 degrees inclusive. If the map is not yet initialized 
		// (i.e. the mapType is still null), or center and zoom have not been set 
		// then the result is null or undefined.
		getBounds: function() {
			return getBounds(this.map.getBounds());
		},

		setCenter: function(lonLat) {
			this.map.setCenter(getGoogleLonLat(lonLat));
		},

		// Returns the position displayed at the center of the map. Note that 
		// this LatLng object is not wrapped. See LatLng for more information.
		getCenter: function() {
			return getLonLat(this.map.getCenter());
		},

		setZoom: function(level) {
			this.map.setZoom(level);
		},

		getZoom: function() {
			return this.map.getZoom();
		},

		// Changes the center of the map by the given distance in pixels. If the distance is less than both the width and height of 
		// the map, the transition will be smoothly animated. Note that the map coordinate system increases from west to east 
		// (for x values) and north to south (for y values).
		panBy: function(x, y) {
			this.map.panBy(x, y);
		},

		// Changes the center of the map to the given LatLng. If the change is less
		// than both the width and height of the map, the transition will be smoothly animated.
		panTo: function(lonLat) {
			this.map.panTo(getGoogleLonLat(lonLat));
		},

		//change the type of the map. accepts string value: hybrid, road, satellite, terrain.
		setMapType: function(type) {
			this.map.setMapTypeId(getMapType(type));
		},

		//update the options of the map.
		setOptions: function(options) {
			this.map.setOptions(options);
		},

		addMarker: function(options) {
			options.map = this.map;
			var marker = new Marker(options);
			return marker;
		},

		addControl: function(div, position) {
			if (div instanceof jQuery) {
				div = div[0];
			}

			this.map.controls[getPosition(position)].push(div);
		},

		addHomeControl: function(lonlat) {
			var position = getGoogleLonLat(lonlat);
			var homeControlDiv = $("<div id='homeControl'>");
			var homeControl = createHomeControl(this.map, homeControlDiv, position);
			//homeControlDiv.index = 1;
			// this.map.controls[gm.ControlPosition.TOP_RIGHT].push(homeControlDiv[0]);
			this.addControl(homeControlDiv, ("bottom center"));
		},

		addPositionControl: function() {
			createPositionControl(this.map);
		},

		on: function(name, handler, context) {
			this.map.addListener(name, function(event) {
				var args = [];
				if (event) {
					args.push({
						lonLat: getLonLat(event.latLng)
					});
				}

				handler.apply(context || this, args);
			});
		},

		off: function(name) {
			this.map.unbind(name);
		},

		trigger: function(name) {
			this.map.notify(name);
		},

		destroy: function(){
			this.element.removeClass("cloud-map");

			this.element.empty();
		}
	});

	//custom controls

	//home control, click it will pan the map to the home position.
	var createHomeControl = function(map, div, home) {
		var $content = $(div);

		$content.addClass("home-control");
		var $point = $("<span>").appendTo($content);
		var $label = $("<strong>").text("我的位置").appendTo($content);
		$content.click(function() {
			map.setCenter(home);
		});
	};
	
	//Create position control
	var createPositionControl = function(map, div) {
		var $content = $(div || "<div>");

		$content.addClass("position-control");
		var text = $("<strong>").appendTo($content);

		map.addListener("mousemove", function(event) {
			text.text("position: " + event.latLng.lat() + ", " + event.latLng.lng());
		});
		map.controls[getPosition("bottom right")].push($content[0]);

	};

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