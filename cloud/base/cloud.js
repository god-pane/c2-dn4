/**
 * @filename cloud
 * @filetype {object}
 * @filedescription "system core class"
 * @filereturn {function} cloud
 */
define(function(require){
	require("cloud/lib/jquery");
	require("cloud/lib/prototype.lang");
	require("cloud/base/_config");
	require("cloud/base/model");
	require("cloud/base/model.custom");
	require("cloud/base/locale");
	require("cloud/components/dialog");
	require("cloud/components/console");
	require("cloud/components/widget");
	require("cloud/lib/plugin/jquery.loadmask");
	require("cloud/lib/plugin/jquery.pnotify");
	require("cloud/resources/css/default.css");
	var config = require("cloud/base/config");
	var Postal = require("cloud/lib/plugin/postal.min");
	window._ = require("underscore");
	
	// initialize cloud object
	cloud = {
			config:config,
			util:{}
	};
	
	/*
	 * @author Jerolin
	 * @name createUniqueID
	 * @type {function}
	 * @description "Create a unique id with the given prefix"
	 * @param {string} options "prefix"
	 * @return {String}
	 */
	var sequenceID = 0;
	cloud.util.createUniqueID = function(prefix) {
		var id = (++sequenceID).toString();
		return prefix ? prefix + id : id;
	};
	/*
	 * @author qinjunwen
	 * @name getCurrentLocation
	 * @type {function}
	 * @description "A light packaging of HTML5 geo-location API"
	 * @param {function} callback "callback parameter is a function"
	 * @param {Object} context "context of callback function, default to be window"
	 * @returns {Object} "properties included : longitude, latitude, timestamp;if refuse ,return default location"
	 */
	cloud.util.getCurrentLocation = function(callback, context) {
	    var done = false;
        
        var timeout = 3000;
        
        var defaultLocation= {
            longitude : 116.407013,
            latitude : 39.926588,
            timestamp : (new Date()).getTime()
        };
        
        var timeoutHandler = function(){
            if (done == false){
                done = true;
                window.alert(locale.get("get_location_failed"));
                callback.call(context || this, defaultLocation);
            }
        };
        
        setTimeout(timeoutHandler, timeout);
        
        navigator.geolocation.getCurrentPosition(function(position) {
            if (done == false){
                var location = {
                    longitude : position.coords.longitude,
                    latitude : position.coords.latitude,
                    timestamp : position.timestamp
                };
                done = true;
                callback.call(context || this, location);
            }
        }, function(){
            if (done == false){
                done = true;
                callback.call(context || this, defaultLocation);
            }
        });
	};
	
	
	/*
	 * @author qinjunwen
	 * @name objectArrayToArray
	 * @type {function}
	 * @description "object array to array"
	 * @param {Array} arr "array"
	 * @param {String} str "string"
	 * @returns {String} property name;
	 */
	cloud.util.objectArrayToArray = function(arr,str){
		var _arr = [];
		for(var num = 0 ; num < arr.length ; num++){
			_arr.push(arr[num][str]);
		}
		return _arr;
	};
	
	/*
	 * @author qinjunwen
	 * @name isEmpty
	 * @type {function}
	 * @description "Check whether the object is empty"
	 * @param {Object} obj "object"
	 * @return {Boolean}
	 */
	cloud.util.isEmpty = function(obj){
		for (var name in obj) 
	    {
	        return false;
	    }
	    return true;
	};
	
	/*
	 * @author Jerolin
	 * @name dateFormat
	 * @type {function}
	 * @description "Format a date object to a given template"
	 * @param {Object} date "date"
	 * @param {Object} format "format MM: Month, dd: Date, hh: Hour, mm: Minutes, ss:Seconds".
	 * @return {String}
	 */
	cloud.util.dateFormat = function(date, format) {
		// temporary convert date. exclude it after api fixed the issue.
		date = new Date((date.getTime() * 1000));
		var o = {
			"M+" : date.getMonth() + 1,
			"d+" : date.getDate(),
			"h+" : date.getHours(),
			"m+" : date.getMinutes(),
			"s+" : date.getSeconds(),
			"q+" : Math.floor((date.getMonth() + 3) / 3),
			"S" : date.getMilliseconds()
		};
		if (/(y+)/.test(format)){
			format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for ( var k in o){
			if (new RegExp("(" + k + ")").test(format)){
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	};
	
	/*
	 * @author Jerolin
	 * @name result
	 * @type {function}
	 * @description "If the value of the named property is a function then invoke it otherwise, return it."
	 * @param {Object} object "object"
	 * @param {Object} property "property"
	 * @return {Object}
	 */
	cloud.util.result = function(object, property) {
		if (object === null)
			return null;
		var value = object[property];
		return Object.isFunction(value) ? value.call(object) : value;
	};

	/*
	 * @name throttle
	 * @type {function}
	 * @description "Return a new function, no matter how often the function is called, it will invoke only once in wait time."
	 * @param {function} func "Original function".
	 * @param {Object} wait "Milliseconds of wait time".
	 * @param {Object} context "is a object".
	 * @return {Object}
	 */
	cloud.util.throttle = function(func, wait, context) {
		var args = null, timeout = null, result = null;
		var previous = 0;
		var later = function() {
			previous = new Date();
			timeout = null;
			result = func.apply(context, args);
		};
		return function() {
			var now = new Date();
			var remaining = wait - (now - previous);
			context = context ? context : this;
			args = arguments;
			if (remaining <= 0) {
				clearTimeout(timeout);
				timeout = null;
				previous = now;
				result = func.apply(context, args);
			} else if (!timeout) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	};

	/*
	 * @name once
	 * @type {function}
	 * @description "Return a function that will only be executed once"
	 * @param {function} func "is function parameter".
	 * @return {function}
	 */
	cloud.util.once = function(func) {
		var ran = false, memo = null;
		return function() {
			if (ran)
				return memo;
			ran = true;
			memo = func.apply(this, arguments);
			func = null;
			return memo;
		};
	};

	/*
	 * @name after
	 * @type {function}
	 * @description "Return a function, that will invoke 'func' parameter after some times."
	 * @param {Object} times "is object parameter"
	 * @param {function} func "is function parameter"
	 */
	cloud.util.after = function(times, func) {
		if (times <= 0)
			return func();
		return function() {
			if (--times < 1) {
				return func.apply(this, arguments);
			}
		};
	};
	
	/*
	 * @name defaults
	 * @type {function}
	 * @description "Fill in a given object with default properties."
	 * @param {Object} obj "is object parameter".
	 * @return {Object}
	 */
	cloud.util.defaults = function(obj) {
		Array.prototype.slice.call(arguments, 1).each(function(source) {
			if (source) {
				for ( var prop in source) {
					if (Object.isUndefined(obj[prop]))
						obj[prop] = source[prop];
				}
			}
		});
		return obj;
	};
	
	/*
	 * @name has
	 * @type {function}
	 * @description "Shortcut for hasOwnProperty() method."
	 * @param {Object} obj "object"
	 * @param {Object} key "key"
	 * @return {Object}
	 */
	cloud.util.has = function(obj, key) {
		return Object.prototype.hasOwnProperty.call(obj, key);
	};
	
	/*
	 * @name random
	 * @type {function}
	 * @description "Return a random integer between min and max (inclusive)."
	 * @param {Object} min
	 * @param {Object} max
	 * @return {Number}
	 */
	cloud.util.random = function(min, max) {
		if (max === null) {
			max = min;
			min = 0;
		}
		return min + Math.floor(Math.random() * (max - min + 1));
	};

	/*
	 * @name pick
	 * @type {function}
	 * @description "pick a sub objcet by the given keys."
	 * @param {Object} obj
	 * @return {Object}
	 */
	cloud.util.pick = function(obj) {
		var copy = {};
		var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
		keys.each(function(key) {
			if (key in obj)
				copy[key] = obj[key];
		});
		return copy;
	};

	
	/*
	 * @name omit
	 * @type {function}
	 * @description "get the object's properties exclude the given keys."
	 * @param {Object} obj
	 * @return {Object}
	 */
	cloud.util.omit = function(obj) {
		var copy = {};
		var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
		for ( var key in obj) {
			if (!keys.include(key)){
				copy[key] = obj[key];
			}
		}
		return copy;
	};

	/*
	 * @name makeArray
	 * @type {function}
	 * @description "Convert arguments to an array."
	 * @param {Array} arguments
	 * @return {Array}
	 */
	cloud.util.makeArray = function() {
		return [ $A(arguments) ].flatten();
	};
	
	/*
	 * @name mixin
	 * @type {function}
	 * @description "proccess src  append to target object"
	 * @param {Object} target
	 * @param {Object} src
	 * @return {undefined}
	 */
	cloud.util.mixin = function(target, src) {
		var filtered = cloud.util.omit(src, "initialize", "destroy");
		$.extend(target, filtered);
		target.mixed = target.mixed || $A();
		target.mixed.push(src);
		if (Object.isFunction(src.initialize)) {
			src.initialize.call(target);
		}
	};
	
	/*
	 * @name mask
	 * @type {function}
	 * @description "Load mask"
	 * @param {Object} element "element is HTMLElEMENT or string or jquery object"
	 * @param {String} label "label is string"
	 * @return {undefined}
	 */
	cloud.util.mask = function(element, label) {
		element = (typeof element === "string") ? $(element) : element;
		label = label || locale.get({
			lang : "loading"
		});
		if (cloud.util.isMasked(element)) {
			cloud.util.unmask(element);
		}

		if (element.css("position") == "static") {
			element.addClass("masked-relative");
		}

		element.addClass("masked");

		var maskDiv = $('<div class="loadmask"></div>');

		// auto height fix for IE
		if (navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
			maskDiv.height(element.height()+ parseInt(element.css("padding-top"), 0)+ parseInt(element.css("padding-bottom"), 0));
			maskDiv.width(element.width()+ parseInt(element.css("padding-left"), 0)	+ parseInt(element.css("padding-right"), 0));
		}

		// fix for z-index bug with selects in IE6
		if (navigator.userAgent.toLowerCase().indexOf("msie 6") > -1) {
			element.find("select").addClass("masked-hidden");
		}

		element.append(maskDiv);

		if (label !== undefined) {
			var maskMsgDiv = $("<div class='loadmask-msg' style='display:none;'><div class='loadmask-img'></div><div class='loadmask-text'>"+ label + "</div></div>");
			// maskMsgDiv.append('<div>' + label + '</div>');
			element.append(maskMsgDiv);

			// calculate center position
			maskMsgDiv.css("top",Math.round(element.height()/ 2- (maskMsgDiv.height()- parseInt(maskMsgDiv.css("padding-top"),0) - parseInt(maskMsgDiv.css("padding-bottom"),0)) / 2)+ "px");
			maskMsgDiv.css("left", Math.round(element.width()/ 2- (maskMsgDiv.width()- parseInt(maskMsgDiv.css("padding-left"),0) - parseInt(maskMsgDiv.css("padding-right"), 0)) / 2)+ "px");
            maskMsgDiv.show();
        }
    };
    
    /*
	 * Load mask fixed layout
	 * @param {JQUERY ELEMENT,String} element {String} label
	 */
//    cloud.util.mask = function(element, label) {
//    	element = (typeof element === "string") ? $(element) : element;
//		label = label || locale.get({
//			lang : "loading"
//		});
//		if (cloud.util.isMasked(element)) {
//			cloud.util.unmask(element);
//		}
//
//		if (element.css("position") == "static") {
//			element.addClass("masked-relative");
//		}
//
//		element.addClass("masked");
//		
//		var position = $(element).get(0).getBoundingClientRect();
//		var backDiv = $("<div class='loadmask-fixed'></div>");
//		backDiv.css({
//			position: "fixed",
//			left: position.left+"px",
//			top: position.top+"px",
//			width: $(element).width()+"px",
//			height: $(element).height()+"px",
//			"z-index": 120,
//			zoom: 1
//		});
//
//		var maskDiv = $('<div class="loadmask"></div>');
//		maskDiv.css({
//			position: "fixed",
//			left: position.left+"px",
//			top: position.top+"px",
//			width: $(element).width()+"px",
//			height: $(element).height()+"px"
//		});
//
//		// auto height fix for IE
//		if (navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
//			maskDiv.height(element.height()+ parseInt(element.css("padding-top"), 0)+ parseInt(element.css("padding-bottom"), 0));
//			maskDiv.width(element.width()+ parseInt(element.css("padding-left"), 0)	+ parseInt(element.css("padding-right"), 0));
//			backDiv.height(element.height()+ parseInt(element.css("padding-top"), 0)+ parseInt(element.css("padding-bottom"), 0));
//			backDiv.width(element.width()+ parseInt(element.css("padding-left"), 0)	+ parseInt(element.css("padding-right"), 0));
//		}
//
//		// fix for z-index bug with selects in IE6
//		if (navigator.userAgent.toLowerCase().indexOf("msie 6") > -1) {
//			element.find("select").addClass("masked-hidden");
//		}
//		
//		element.append(backDiv);
//		element.append(maskDiv);
//		
//
//		if (label !== undefined) {
//			var maskMsgDiv = $("<div class='loadmask-msg' style='display:none;'><div class='loadmask-img'></div><div class='loadmask-text'>"+ label + "</div></div>");
//			// maskMsgDiv.append('<div>' + label + '</div>');
//			//element.append(maskMsgDiv)
//			backDiv.append(maskMsgDiv);
//
//			// calculate center position
//			maskMsgDiv.css("top",Math.round(element.height()/ 2- (maskMsgDiv.height()- parseInt(maskMsgDiv.css("padding-top"),0) - parseInt(maskMsgDiv.css("padding-bottom"),0)) / 2)+ "px");
//			maskMsgDiv.css("left", Math.round(element.width()/ 2- (maskMsgDiv.width()- parseInt(maskMsgDiv.css("padding-left"),0) - parseInt(maskMsgDiv.css("padding-right"), 0)) / 2)+ "px");
//            maskMsgDiv.show();
//        }
//		
//    };

    /*
	 * @name unmask
	 * @type {function}
	 * @description "Unload mask"
	 * @param {Object} element "element is HTMLElEMENT or string or jquery object"
	 * @return {undefined}
	 */
    cloud.util.unmask = function(element) {
    	if($(".loadmask").length == 0){
    		return;
    	}
    	if(!element){
    		$(".loadmask").remove();
    		$(".loadmask-msg").remove();
    		//$(".loadmask-fixed").remove();
    		return;
    	}
    	element = (typeof element === "string") ? $(element) : element;
        element.find(".loadmask-msg,.loadmask").remove();
        element.removeClass("masked");
        element.removeClass("loadmask-fixed");
        element.find("select").removeClass("masked-hidden");
    };
    
    /*
	 * @name isMasked
	 * @type {function}
	 * @description "Is mask existed"
	 * @param {Object} opt "opt is jquery object"
	 * @return {Boolean}
	 */
    cloud.util.isMasked = function(opt) {
    	var element = Object.isString(opt) ? $(opt) : opt;
    	if (element) {
			return element.hasClass("masked");
		}
    };
    
    /*
	 * @author PANJC
	 * @name inArray
	 * @type {function}
	 * @description "To judge whether an array element"
	 * @param {String} data
	 * @param {Array} arr
	 * @return {Boolean}
	 */
    cloud.util.inArray = function(data,arr){
    	var total = 0;
    	for(var num=0;num<arr.length;num++){
    		if(arr[num] == data){
    			total++;
    		}
    	}
    	if(total > 0){
    		return true;
    	}else{
    		return false;
    	}
    };
    /*
	 * @author PANJC
	 * @name inString
	 * @type {function}
	 * @description "to judge whether exists in the string"
	 * @param {String} match
	 * @param {String} str
	 * @param {Boolean} sensitive
	 * @return {Boolean}
	 */
    cloud.util.inString = function(match,str,sensitive){
    	var sensitive = sensitive ? true : false;
    	if(!sensitive){
    		var match = match.toLowerCase();
    		var str = str.toLowerCase();
    	}
    	if(str.indexOf(match) > -1){
    		return true;
    	}else{
    		return false;
    	}
    };
    /*
	 * @author PANJC
	 * @name setCurrentApp
	 * @type {function}
	 * @description "set current app"
	 * @param {Object} obj
	 * @return {undefined}
	 */
    cloud.util.setCurrentApp = function(obj){
    	if(obj.element){
    		localStorage.setItem("appElement",obj.element);
    		localStorage.setItem("appView","");
    		localStorage.setItem("appUrl","");
    	}
    	if(obj.view){
    		localStorage.setItem("appView",obj.view);
    	}
    	if(obj.url){
    		localStorage.setItem("appUrl",obj.url);
    	}
    };
    /*
	 * @author PANJC
	 * @name refresh
	 * @type {function}
	 * @description "Refresh current page"
	 * @return {undefined}
	 */
    cloud.util.refresh = function(){
    	if(localStorage.getItem("appInnerNav") && $(localStorage.getItem("appInnerNav")).length > 0){
    		$(localStorage.getItem("appInnerNav")).trigger("click");
    	}else if(localStorage.getItem("appView") && $(localStorage.getItem("appView")).length > 0){
    		$(localStorage.getItem("appView")).trigger("click");
    	}else if(localStorage.getItem("appElement") && $(localStorage.getItem("appElement")).length > 0){
    		$(localStorage.getItem("appElement")).trigger("click");
    	}
    };
    /*
	 * @author PANJC
	 * @name strToJson
	 * @type {function}
	 * @description "string to json"
	 * @param {String} str
	 * @return {Object}
	 */
	cloud.util.strToJson = function(str) {
		var obj = {};
		if (str && (typeof str) == "string") {
			if (str.indexOf("{") > -1) {
				str = str.replace(/[\"\']/g, "");
				str = str.replace(/\s/g, "");
				str = str.replace("{", "{\"");
				str = str.replace(",}", "}");
				str = str.replace("}", "\"}");
				str = str.replace(/:/g, "\":\"");
				str = str.replace(/,/g, "\",\"");
			} else {
				str = str.replace(/[\"\']/g, "");
				str = str.replace(/\s/g, "");
				str = str.replace(/:/g, "\":\"");
				str = "\"" + str + "\"";
			}
			obj = $.parseJSON(str);
		}
		return obj;
	};
	/*
	 * @author Jerolin
	 * @name md5
	 * @type {function}
	 * @description "Extend Prototype, add some method to native object.extend string.md5 #example "123".md5() //-> md5 code in upper case"
	 * @param {String} str
	 * @return {String} 
	 */
	cloud.util.md5 = (function(str) {
		
		var hex_chr = "0123456789abcdef";

		function rhex(num) {
			str = "";
			for ( var j = 0; j <= 3; j++) {
				str += hex_chr.charAt((num >> (j * 8 + 4)) & 15)+ hex_chr.charAt((num >> (j * 8)) & 15);
			}
			return str;
		}

		function str2blks_MD5(str) {
			nblk = ((str.length + 8) >> 6) + 1;
			blks = new Array(nblk * 16);
			for ( var i = 0; i < nblk * 16; i++) {
				blks[i] = 0;
			}
			for (i = 0; i < str.length; i++) {
				blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
			}
			blks[i >> 2] |= 128 << ((i % 4) * 8);
			blks[nblk * 16 - 2] = str.length * 8;
			return blks;
		}

		function add(x, y) {
			var lsw = (x & 65535) + (y & 65535);
			var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
			return (msw << 16) | (lsw & 65535);
		}

		function rol(num, cnt) {
			return (num << cnt) | (num >>> (32 - cnt));
		}

		function cmn(q, a, b, x, s, t) {
			return add(rol(add(add(a, q), add(x, t)), s), b);
		}

		function ff(a, b, c, d, x, s, t) {
			return cmn((b & c) | ((~b) & d), a, b, x, s, t);
		}

		function gg(a, b, c, d, x, s, t) {
			return cmn((b & d) | (c & (~d)), a, b, x, s, t);
		}

		function hh(a, b, c, d, x, s, t) {
			return cmn(b ^ c ^ d, a, b, x, s, t);
		}

		function ii(a, b, c, d, x, s, t) {
			return cmn(c ^ (b | (~d)), a, b, x, s, t);
		}

		function MD5(str) {
			x = str2blks_MD5(str);
			var a = 1732584193;
			var b = -271733879;
			var c = -1732584194;
			var d = 271733878;
			for ( var i = 0; i < x.length; i += 16) {
				var olda = a;
				var oldb = b;
				var oldc = c;
				var oldd = d;
				a = ff(a, b, c, d, x[i + 0], 7, -680876936);
				d = ff(d, a, b, c, x[i + 1], 12, -389564586);
				c = ff(c, d, a, b, x[i + 2], 17, 606105819);
				b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
				a = ff(a, b, c, d, x[i + 4], 7, -176418897);
				d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
				c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
				b = ff(b, c, d, a, x[i + 7], 22, -45705983);
				a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
				d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
				c = ff(c, d, a, b, x[i + 10], 17, -42063);
				b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
				a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
				d = ff(d, a, b, c, x[i + 13], 12, -40341101);
				c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
				b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
				a = gg(a, b, c, d, x[i + 1], 5, -165796510);
				d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
				c = gg(c, d, a, b, x[i + 11], 14, 643717713);
				b = gg(b, c, d, a, x[i + 0], 20, -373897302);
				a = gg(a, b, c, d, x[i + 5], 5, -701558691);
				d = gg(d, a, b, c, x[i + 10], 9, 38016083);
				c = gg(c, d, a, b, x[i + 15], 14, -660478335);
				b = gg(b, c, d, a, x[i + 4], 20, -405537848);
				a = gg(a, b, c, d, x[i + 9], 5, 568446438);
				d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
				c = gg(c, d, a, b, x[i + 3], 14, -187363961);
				b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
				a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
				d = gg(d, a, b, c, x[i + 2], 9, -51403784);
				c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
				b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
				a = hh(a, b, c, d, x[i + 5], 4, -378558);
				d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
				c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
				b = hh(b, c, d, a, x[i + 14], 23, -35309556);
				a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
				d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
				c = hh(c, d, a, b, x[i + 7], 16, -155497632);
				b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
				a = hh(a, b, c, d, x[i + 13], 4, 681279174);
				d = hh(d, a, b, c, x[i + 0], 11, -358537222);
				c = hh(c, d, a, b, x[i + 3], 16, -722521979);
				b = hh(b, c, d, a, x[i + 6], 23, 76029189);
				a = hh(a, b, c, d, x[i + 9], 4, -640364487);
				d = hh(d, a, b, c, x[i + 12], 11, -421815835);
				c = hh(c, d, a, b, x[i + 15], 16, 530742520);
				b = hh(b, c, d, a, x[i + 2], 23, -995338651);
				a = ii(a, b, c, d, x[i + 0], 6, -198630844);
				d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
				c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
				b = ii(b, c, d, a, x[i + 5], 21, -57434055);
				a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
				d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
				c = ii(c, d, a, b, x[i + 10], 15, -1051523);
				b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
				a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
				d = ii(d, a, b, c, x[i + 15], 10, -30611744);
				c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
				b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
				a = ii(a, b, c, d, x[i + 4], 6, -145523070);
				d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
				c = ii(c, d, a, b, x[i + 2], 15, 718787259);
				b = ii(b, c, d, a, x[i + 9], 21, -343485551);
				a = add(a, olda);
				b = add(b, oldb);
				c = add(c, oldc);
				d = add(d, oldd);
			}
			return rhex(a) + rhex(b) + rhex(c) + rhex(d);
		}

		if (!String.prototype.md5) {
			String.prototype.md5 = function() {
				return MD5(this).toUpperCase();
			};
		}
		
		return function(str){
			return MD5(str).toUpperCase();
		};
		
	})();
	/*
	 * @author PANJC
	 * @name ensureToken
	 * @type {function}
	 * @description "Ensure the token correctly"
	 * @param {function} callback
	 * @return {undefined} 
	 */
	cloud.util.ensureToken = function(callback){
		cloud.Ajax.request({
			url:"api2/users/this",
			type:"GET",
			parameters:{
	            verbose:1
	        },
			success:function(data){
				if(callback && Object.isFunction(callback)){
					callback(data);
				}
			}
		});
	};
	/*
	 * @name unitConversion
	 * @type {function}
	 * @description "conversion k-kb-mb"
	 * @param {Number} opt
	 * @return {String} 
	 */
	cloud.util.unitConversion = function(opt){
        if ( typeof opt === "number"){
	        if(opt< 1024){
                return opt.toFixed(0)+"B";
            }else if(opt< 1024*1024){
                return (opt/1024).toFixed(3)+"KB";
            }else{
                return (opt/1024/1024).toFixed(3)+"MB";
            }
	    }else{
	        return opt;
	    }
    };
	
    /*
	 * @name LatitudeLongitudeConversion
	 * @type {function}
	 * @description "latitude to longitude of conversion"
	 * @param {String} data
	 * @return {String} 
	 */
    cloud.util.LatitudeLongitudeConversion = function(data){
    	var returnStr;
    	var str = data + "";
    	if(str.indexOf(".") !== -1 && str.indexOf("°") === -1){
    		returnStr = "";
    		var integer = str.substring(0,str.indexOf(".")) * 1;
    		var decimal = ("0." + str.substring(str.indexOf(".") + 1)) * 1;
    		returnStr += integer + "°";
    		var min = Math.floor(decimal * 60);
    		returnStr += min + "'";
    		var sec = Math.floor(("0." + ((decimal * 60 + "").substring((decimal * 60 + "").indexOf(".") + 1))) * 60);
    		returnStr += sec + "\"";
    	}
    	return returnStr;
    };
    
    
	/*
	 * Sub&Pub events
	 * 
	 *  subscribe an event named "topic1" on "channel1": 
	 * var sub = cloud.message.on("channel1",{
	 * 		"topic1":function(data,envelope){
//	 * 			console.log(envelope);
	 * 		},
	 * 		...
	 * });
	 *  unsubscribe events
	 * sub.unbind();    unbind all topics on "channel1"
	 * sub.unbind("topic")  unbind  "topic" on "channel1"
	 * 
	 *  publish "topic" event on "channel" with data:
	 * cloud.message.fire("channel","topic",data);
	 * 
	 *  query topic "#.b.*" on which channel;
	 * cloud.message.query("#.b.*")
	 */
   
	cloud.message =(function(){
		return{
//			map:$H(),
			_compare:function(a,b){
				return Postal.configuration.resolver.compare(a,b)||Postal.configuration.resolver.compare(b,a)
			},
			
			queryByTopic : function(topic, isDetail){
		        var result = $A();
		        cloud.message.getSubscribers().each(function(sub){
		            if (cloud.message._compare(topic, sub.topic)){
		                if (isDetail){
		                    result.push(sub)
		                }else{
		                    result.push(sub.channel)
		                }
		            }
		        });
		        return result.uniq();
			},
			
			getSubscribers: function(channel){
			    var subscribers = $A();
			    $.each(postal.configuration.bus.subscriptions, function(i, group) {
			        $.each(group, function(i, subArray) {
			            $.each(subArray, function(i, sub) {
			                if (channel == null || (channel == sub.channel)){
			                    subscribers.push(sub);
			                } 
			            });
			        });
			    });
			    return subscribers;
			},
			
			clearChannel : function(channel){
			    var channelSubs = this.getSubscribers(channel);
			    channelSubs.each(function(sub){
			        sub.unsubscribe();
			    })
			},
			
			/*query:function(topic){
				var self = this;
				var result =[];
				var keys = this.map.keys();
				keys.each(function(key){
					if(self._compare(topic,key)){
						result = result.concat(self.map.get(key));
					}
				});
				return result;
			},*/
			on :function(channel,config){
				var self = this;
				if(arguments.length === 1){//config
					config = channel;
					channel = "/";
				}
				var events = $H(config);
				var scope = events.unset("scope") || this;
				
				var hash = $H();
				events.each(function(event){
					//
					$A(Postal.utils.getSubscribersFor(channel,event.key)).each(function(oneSub){
						if(oneSub.callback.toString() === event.value.toString()){
							oneSub.unsubscribe();
//							self._removeMap(oneSub.topic,oneSub.channel);
							throw $break;
						}
					});
					var sub = Postal.subscribe({
						channel:channel,
						topic:event.key,
						callback:event.value
					});
					sub.withContext(scope);
//					self._setMap(sub);
					hash.set(event.key,sub);
				});
				hash = hash.toJSON();
				hash.unbind = function(topic){
					self._unbind(hash,topic);
				};
				return hash;
			},
			/*_setMap:function(sub){
				var key = sub.topic
				var value = this.map.get(key);
				if(!value){
					value = $A();
				}
				value.push(sub.channel);
				this.map.set(key,value);
			},
			_removeMap:function(topic,channel){
				var values = this.map.get(topic);
				values.pop(channel);
			},*/
			_unbind:function(hash,topic){
				if(topic){
					hash[topic].unsubscribe();
//					this._removeMap(topic,hash[topic].channel)
				}else{
					for(var i in hash){
						if(i!=="unbind"){
							hash[i].unsubscribe();
//							this._removeMap(i,hash[i].channel);
						} 
					}
				}
			},
			post : function(channel,topic,data){
				if(arguments.length === 2 && data){//topic,data
					data = topic;
					topic = channel; 
					channel = "/";
				}else if(arguments.length === 1){//topic
					topic = channel;
					channel = "/";
				}
				Postal.publish({
					channel:channel,
					topic:topic,
					data:data
				})
			}
			
			
		}
	})();
	
	/*
	 * API for use localStorage and sessionStorage
	 * @author Jerolin
	 * @return {Object}
	 */
	cloud.storage = (function(){
	
		return {
			/*
			 * @author Jerolin
			 * @name localStorage
			 * @type {function}
			 * @description "include getter and setter in one method to change localStorage."
			 * @param {String} key
			 * @param {Object} value
			 * @return {undefined} 
			 */
			localStorage : function(key, value) {
				var storage = window.localStorage;
				if (storage) {
					if (arguments.length == 1) {
						value = storage.getItem(key);
						return value;
					} else if (arguments.length == 2) {
						if (value) {
							storage.setItem(key, value);
						} else {
							storage.removeItem(key);
						}
					}
				}
			},
			
			/*
			 * @author Jerolin
			 * @name sessionStorage
			 * @type {function}
			 * @description "include getter and setter in one method to change sessionStorage."
			 * @param {String} key
			 * @param {Object} value
			 * @return {undefined} 
			 */
			sessionStorage : function(key, value) {
				var storage = window.sessionStorage;
				if (storage) {
					if (arguments.length == 1) {
						value = storage.getItem(key);
						return value;
					} else if (arguments.length == 2) {
						if (value) {
							storage.setItem(key, value);
						} else {
							storage.removeItem(key);
						}
					}
				}
			}
		};
		
	})();
	cloud.accessToken = (function(){
		var _a = "accessToken";
		return {
			get:function(){
				return cloud.storage.sessionStorage(_a);
			},
			set:function(val){
				cloud.storage.sessionStorage(_a,val);
			},
			remove:function(){
				cloud.storage.sessionStorage(_a,null);
			}
		}
	})();
	cloud.refreshToken = (function(){
		var _r = "refreshToken";
		return {
			get:function(){
				return cloud.storage.sessionStorage(_r);
			},
			set:function(val){
				cloud.storage.sessionStorage(_r,val);
			},
			remove:function(){
				cloud.storage.sessionStorage(_r,null);
			}
		}
	})();
	
	
	/*
	 * cloud ajax request
	 * @author PANJC,Jerolin
	 * @return {Object}
	 */
	
	cloud.Ajax = (function(){
		
		return {
			
		server : cloud.config.API_SERVER_URL,
		errorURL:"../index.html",
		
		//Default auth options
		defaultAuthOptions:{
			url : cloud.config.AUTH_SERVER_URL + "/access_token",
			type : "POST",
			dataType : "JSON",
			data:{
				client_id : cloud.config.CLIENT_ID,
				client_secret : cloud.config.CLIENT_SECRET
			}
		},
		
		//Failed requests
		failedRequests:{
			queue:[],
			number:0,
			delayTime:2000
		},
		
		//Delay requests object
		delayRequests:{
			times:0,
			intervalTime:0,
			url:null,
			type:null,
			param:null,
			parameters:null,
			data:null
		},
		
		//get access token
		getAccessToken:function(){
			return cloud.storage.sessionStorage("accessToken");
		},
		
		//set access token
		_setAccessToken:function(_accessToken) {
			cloud.storage.sessionStorage("accessToken", _accessToken);
		},
		
		//get refresh token
		_getRefreshToken:function() {
			return cloud.storage.sessionStorage("refreshToken");
		},
		
		//set refresh token
		_setRefreshToken:function(_refreshToken) {
			cloud.storage.sessionStorage("refreshToken", _refreshToken);
		},
		
		//refresh access token
		_refreshAccessToken:function(callback) {
			var self = this;
			if(!self._getRefreshToken()){
				dialog.close();
				dialog.render({
					lang:"login_again",
					buttons:[{lang:"ok",click:function(){dialog.close();self.logout();}}],
					close:function(){dialog.close();self.logout();}
				});
				return;
			}
			var obj = self.defaultAuthOptions;
			obj.async = false;
			obj.data.grant_type = "refresh_token";
			obj.data.refresh_token = self._getRefreshToken();
			obj.data.contentType = "application/x-www-form-urlencoded";
			obj.success = function(result) {
				self._setAccessToken(result.access_token);
				self._setRefreshToken(result.refresh_token);
				if(callback){ callback(); }
			};
			obj.error = function(result) {
				dialog.render({
					lang:"login_timeout",
					buttons:[{
						lang:"ok",
						click:function(){dialog.close();self.logout();}
					}],
					close:function(){dialog.close();self.logout();}
				});
			};
			self._request(obj);
		},
		
		//request failed ajax queue
		_requestFailedQueue:function() {
			var self = this;
			var failedRequestsQueue = self.failedRequests.queue;
			if(failedRequestsQueue.length > 0){
				$.each(failedRequestsQueue,function(index,obj){
					self._request(obj);
				});
				self.failedRequests.queue = [];
				self.failedRequests.number = 0;
			}
		},
		
		//defer to execute failure requests
		_deferFailedRequests:function(obj){
			var self = this;
			if(this.failedRequests.number == 0){
				function delayFun(){
					self._refreshAccessToken(function(){self._requestFailedQueue();});
				}
				setTimeout(function(){delayFun();},self.failedRequests.delayTime);
			}
			self.failedRequests.queue.push(obj);
			self.failedRequests.number++;
		},
		
		// priavte request method
		_request:function(obj) {
			var self = this;
			if(obj.url.include('access_token=')){
				obj.url = obj.url.replace(/access_token=[\w\d]{32}/,"access_token=" + this.getAccessToken());
			}else{
				obj.url += (obj.url.include('?') ? '&' : '?') + "access_token=" + this.getAccessToken();
			}
			if($.browser.msie){
				if(obj.url.include('random=')){
					obj.url = obj.url.replace(/rand=[\w\d]{32}/,"random=" + cloud.util.md5(Math.random()));
				}else{
					obj.url += (obj.url.include('?') ? '&' : '?') + "random=" + cloud.util.md5(Math.random());
				}
			}
			var requestSuccessFun = obj.success ? obj.success : "";
			var requestErrorFun = obj.error ? obj.error : "";
			var successHandler = (obj.success && Object.isFunction(requestSuccessFun)) ? requestSuccessFun : function(){};
            var errorHandler = (obj.error && Object.isFunction(requestErrorFun)) ? function(error){defaultDataError(error);requestErrorFun(error);} : function(error){defaultDataError(error);customDataError(error);};
            
            //default data request error handle
			function defaultDataError(error) {
				var errorNumber = parseFloat(error.error_code);
				if(cloud.util.inArray(errorNumber,[21327,21334,21335,21336])) {
					self._deferFailedRequests(obj);
				}else if(cloud.util.inArray(errorNumber,[21305,21332,21333])) {
					dialog.render({
						lang:"login_again",
						buttons:[{lang:"ok",click:function(){dialog.close();self.logout();}}],
						close:function(){dialog.close();self.logout();}
					});
				}else if(errorNumber == 20006 && error.error.indexOf("@") == -1){
					dialog.render({
    					lang:20006,
    					buttons:[{lang:"refresh_app",click:function(){dialog.close();cloud.util.refresh();}},
    					         {lang:"ignore1",click:function(){dialog.close();}}],
    					close:function(){dialog.close();}
    				});
				}
				cloud.util.unmask();
	        };
	        
	        //custom data request error handle
			function customDataError(error){
				var errorNumber = parseInt(error.error_code);
				var errorContent = error.error.toLowerCase();
				var errorRequest = error.request.toLowerCase();
				var errorParams = error.params;
	        	if(!cloud.util.inArray(errorNumber,[20006,21327,21334,21335,21305,21332,21333,21334,21335,21336])){
	        		if(errorNumber == 20007){
	        			if(cloud.util.inString("tag",errorContent)){
	    					dialog.render({
	    						lang:"tag_already_exists"
	    					});
	    				}else if(cloud.util.inString("gateway",errorContent)){
	    					dialog.render({
	    						lang:"gateway_already_exists"
	    					});
	    				}else if(cloud.util.inString("name",errorContent)){
	    					if(cloud.util.inString("device",errorRequest)){
	    						dialog.render({
	    							lang:"device_already_exists"
	    						});
	    					}else if(cloud.util.inString("sites",errorRequest)){
	    						dialog.render({
	    							lang:"site_already_exists"
	    						});
	    					}
	    				}else if(cloud.util.inString("serival",errorContent)){
	    					dialog.render({
	    						lang:"serial_number_already_exists"
	    					})
	    				}else if(cloud.util.inString("devices",errorRequest)){
		        				dialog.render({
			        				lang:"serial_number_already_exists"
			        			});
		        		}else if(cloud.util.inString("group",errorRequest)){
	        				dialog.render({
		        				lang:"group_already_exists"
		        			});
		        		}else{
	    					dialog.render({
	    						lang:"resource_already_exists"
	    					});
	    				}
	        		}else if(errorNumber==21322){
	        			if(cloud.util.inString("machines", errorRequest)){
	        				dialog.render({
	        					lang:"controller_already_exists"
	        				});
	        			}
	        			else if(cloud.util.inString("devices",errorRequest)){
	        				dialog.render({
	        					lang:"gateway_already_exists"
	        				})
	        			}
	        			else if(cloud.util.inString("sites",errorRequest)){
	        				dialog.render({
	        					lang:"site_already_exists"
	        				})
	        			}
	        			else if(cloud.util.inString("models",errorRequest)){
	        				dialog.render({
	        					lang:"model_already_exists"
	        				});
	        			}
	        		}else{
	        			if($.isArray(errorParams)){
	        				var _prompt = locale.get(errorNumber,errorParams);
	        				dialog.render({
	        					text:_prompt
	        				})
	        			}else{
	        				dialog.render({lang:errorNumber});
	        			}
	        		}
	        	}
			};
	        
			// default ajax request error handler
			function defaultAjaxError(XMLHttpRequest, textStatus, errorThrown) {
				// The error information encapsulated into results
                var error = {
                		request:XMLHttpRequest,
                		status:textStatus,
                		thrown:errorThrown
                };
				if(error.status && (error.status != "abort")){// modified by qinjunwen, ignore "abort" status 
					if(error.status == "timeout"){
						dialog.render({lang:"network_timeout+!"});
					}else{
						if(error.request.readyState !== 0){
							dialog.render({lang:"network_error+!"});
						}
					}
				}
				cloud.util.unmask();
	        };
	        
			//new ajax object
			obj = Object.extend(obj, {
                success: function(result) {
                	//if is to create and delete, delay correction
                	function handler(){
                		if(result.error){
                			errorHandler(result);
                		}else{
                			successHandler(result);
                		}
                	}
                	switch($.trim(obj.type.toLowerCase())){
                		case "delete":
                			setTimeout(function(){handler();},600);
                			break;
                		case "post":
                    		if(cloud.util.inString("/list",obj.url)){
                    			handler();
                    		}else{
                    			setTimeout(function(){handler();},600);
                    		}
                    		break;
                		default:
                			handler();
                			break;
                	}
				},
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                	defaultAjaxError(XMLHttpRequest, textStatus, errorThrown);
                }
            });
			
            //If this is the request queue, queue request
			if(obj.delay){
				var delay = obj.delay;
				delete obj.delay;
				setTimeout(function(){return $.ajax(obj);},delay);
			}else{
				return $.ajax(obj);
			}
			
		},
		
		// clear access token and refresh token in session storage.
		_logout:function(jump){
			this._setAccessToken(null);
			this._setRefreshToken(null);
			alert(this.errorURL);
			if(jump){
				window.location.href = this.errorURL;
			}
		},
		
		clearDelay:function(){
			this.delayRequests.times = 0;
			this.delayRequests.intervalTime = 0;
			this.delayRequests.url = null;
			this.delayRequests.type = null;
			this.delayRequests.param = null;
			this.delayRequests.parameters = null;
			this.delayRequests.data = null;
		},
		
		//public ajax request
		request : function(options) {
			var self = this;
			options.url = $.trim(options.url);
			options.url = this.server + (options.url.startsWith("/") ? "" : "/") + options.url;
			if(options.delay && $.isNumeric(options.delay)){
				var optionsUrl = options.url.split("/");
				optionsUrl = (optionsUrl[1] + "/" + optionsUrl[2]).toLowerCase();
				var optionsType = options.type.toLowerCase();
				var optionsParam = null;
				var optionsParameters = null;
				var optionsData = null;
				var questionMarkIndex = options.url.indexOf("?");
				if(questionMarkIndex != -1){
					optionsParam = options.url.substring(questionMarkIndex + 1).toLowerCase();
				}
				if(options.parameters){
					optionsParameters = Object.toQueryString(options.parameters);
				}
				if(options.data){
					optionsData = Object.toQueryString(data);
				}
				if(this.delayRequests.url != optionsUrl || this.delayRequests.type != optionsType || self.delayRequests.param != optionsParam || self.delayRequests.parameters != optionsParameters || self.delayRequests.data != optionsData){
					self.delayRequests.times = 1;
					self.delayRequests.intervalTime = options.delay;
					self.delayRequests.url = optionsUrl;
					self.delayRequests.type = optionsType;
					self.delayRequests.param = optionsParam;
					self.delayRequests.parameters = optionsParameters;
					self.delayRequests.data = optionsData;
				}else{
					self.delayRequests.times++;
					if(self.delayRequests.intervalTime != options.delay){
						options.delay = (self.delayRequests.times - 1) * self.delayRequests.intervalTime + options.delay;
					}else{
						options.delay = self.delayRequests.times * self.delayRequests.intervalTime;
					}
				}
			}
			if(options.parameters){
				options.parameters = Object.isString(options.parameters) ? options.parameters : Object.toQueryString(options.parameters);
				options.url += (options.url.include('?') ? '&' : '?') + options.parameters;
				delete options.parameters;
			}
			if($.browser.msie){
				options.url += (options.url.include('?') ? '&' : '?') + "random="+ Math.random();
			}
			if (options.data && ($.isPlainObject(options.data)) && (options.type.toUpperCase() == "POST" || options.type.toUpperCase() == "PUT")) {
				options.data = Object.toJSON(options.data);
			}
			var obj = {
				type:"GET",
				dataType:"JSON",
				contentType:"application/json;charset=UTF-8",
				processData:false,
				timeout:120000
			};
			obj = Object.extend(obj,options);
			return this._request(obj);
		},
		
		/*
		 * @name Ajax.login
		 * @type {method}
		 * @description "用户登录"
		 * @param {Object} options.
		 */
		login : function(options) {
			var self = this;
			if ((Object.isString(options.username) && options.username.strip().empty())&& (Object.isString(options.password) && options.password.strip().empty())) {
				dialog.render({
					lang : "username_or_password_cannot_be_null"
				});
				return;
			}
			var params = Object.extend({}, this.defaultAuthOptions);
			params.data.grant_type = "password";
			params.data.username = options.username;
			params.data.password = options.password.md5();
			params.data.pictureId = options.pictureId;
			params.data.code = options.code;
			params.data.language = options.language;
			params.type = "POST";
			params.success = function(data) {
				window.location.href = options.redirectURL;
				self._setAccessToken(data.access_token);
				self._setRefreshToken(data.refresh_token);
			};
			if (options.error) {
				params.error = options.error;
			}
			params.url = options.url;
			params.data = Object.toJSON(params.data);
			this._request(params);
		},
		
		/*
		 * @name Ajax.logout
		 * @type {method}
		 * @description "用户注销"
		 */
		logout : function() {
			var self = this;
			this.request({
				url : "api2/logout",
				type : "GET",
				error : function(){
					self._logout(true);
				},
				success : function(){
					self._logout(true);
				}
			});
		},
		
		/*
		 * Check login state
		 */
		checkLogin : function() {
			if (!this.getAccessToken() || !this._getRefreshToken()) {
				this._logout(true);
			}
		}
	
		};
	
	})();
	
	/*
	 * @author Jerolin
	 * @name PrivilegeMap
	 * @type {method}
	 * @return {Object}
	 */
	cloud.PrivilegeMap = (function(){
		
		return $H({
			1 : {
				name : 'readSystem',
				displayName : "读取系统信息"
			},
			2 : {
				name : "writeSystem",
				displayName : "增删改系统信息"
			},
			3 : {
				name : "readOrganization",
				displayName : "读取机构"
			},
			4 : {
				name : "writeOrganization",
				displayName : "增删改机构"
			},
			5 : {
				name : "readUser",
				displayName : "读取用户"
			},
			6 : {
				name : "writeUser",
				displayName : "增删改用户"
			},
			7 : {
				name : "readRole",
				displayName : "读取角色"
			},
			8 : {
				name : "writeRole",
				displayName : "增删改角色"
			},
			9 : {
				name : "readClient",
				displayName : "读取客户端"
			},
			10 : {
				name : "writeClient",
				displayName : "增删改客户端"
			},
			11 : {
				name : "readDevice",
				displayName : "读取设备"
			},
			12 : {
				name : "writeDevice",
				displayName : "增删改设备"
			},
			13 : {
				name : "readModel",
				displayName : "读取机型"
			},
			14 : {
				name : "writeModel",
				displayName : "增删改机型"
			},
			15 : {
				name : "readTag",
				displayName : "读取标签"
			},
			16 : {
				name : "writeTag",
				displayName : "增删改标签"
			},
			17 : {
				name : "readCustomer",
				displayName : "读取客户"
			},
			18 : {
				name : "writeCustomer",
				displayName : "增删改客户"
			},
			19 : {
				name : "readData",
				displayName : "读取数据"
			},
			20 : {
				name : "writeData",
				displayName : "增删改数据"
			},
			21 : {
				name : "readConfig",
				displayName : "获取配置"
			}
		});
		
	})();
	
	/*
	 * @name PrivilegeManager
	 * @description  "Privilege Manager"
	 * @author Jerolin
	 * @return Object
	 */
	cloud.PrivilegeManager = (function() {
		
		return {

			url : "api2/users/this/privilege",
			userPrivileges : null,
			privileges : cloud.PrivilegeMap,

			load : function() {
				this.userPrivileges = {
					accept : [ 1, 2, 3 ],
					deny : [ 4, 5, 6 ],
					'default' : "none"
				};
			},
			
			PrivilegeList : function(callback) {
				cloud.Ajax.request({
					url : this.url,
					type : "get",
					async : false,
					success : (function(data) {
						result = data.result;
						this.userPrivileges = {
							accept : result.accept,
							deny : result.deny,
							'default' : result["default"]
						};
						if (callback) {
							callback(this.privilegesId);
						}
					}).bind(this)
				});
			},

			process : function() {
				var nodes = $("[privilege]");
				var node, id;
				for ( var i = 0; i < nodes.length; i++) {
					node = $(nodes[i]);
					id = node.attr("privilege");
					if (!this.can(id)) {
						node.hide();
					}
				}
			},

			can : function(id) {
				var self = this;
				this.privilegesId = id;
				if (!this.userPrivileges) {
					this.PrivilegeList(function() {
						self.canFun();
					});
				} else {
					this.canFun(this.privilegesId);
				}
				// console.log(this.privileges.get(id));
				// for (var deny in this.userPrivileges.deny) {
				// if (this.userPrivileges.deny[deny] == id) {
				// return false;
				// }
				// }
				// for (var accept in this.userPrivileges.accept) {
				// if (this.userPrivileges.accept[accept] == id) {
				// return true;
				// }
				// }
				// switch (this.userPrivileges['default']) {
				// case "all":
				// return true;
				// case "none":
				// return false;
				// case "readOnly":
				// return this.privileges.get(id).name.indexOf("read") === 0;
				// default:
				// return false;
				// }
			},

			canFun : function(id) {
				for ( var deny in this.userPrivileges.deny) {
					if (this.userPrivileges.deny[deny] == id) {
						return false;
					}
				}
				for ( var accept in this.userPrivileges.accept) {
					if (this.userPrivileges.accept[accept] == id) {
						return true;
					}
				}
				switch (this.userPrivileges['default']) {
				case "all":
					return true;
				case "none":
					return false;
				case "readOnly":
					return this.privileges.get(id).name.indexOf("read") === 0;
				default:
					return false;
				}
			}

		};
		
	})();
	
	/*
	 * Cloud Module,Cloud Component
	 * @author Jerolin
	 * @return {Object}
	 */
	(function() {

		/*
		 * Events
		 * @author Jerolin
		 * @param {Object} object If the handlers dosn't have a scope, use this to replace.
		 */
		var Events = {
				
			initialize : function() {
				this.listeners = $H();
			},

			destroy : function() {
				this.listeners = null;
			},

			/*
			 * Observe events
			 * @param {Object} events
			 */
			on : function(events) {
				events = $H(events);
				var scope = events.get("scope");
				scope = scope || this;

				events.each(function(event) {
					if (event.key != "scope") {
						this.observe(event.key, scope, event.value);
					}
				}.bind(this));
			},

			bind : function() {
				this.observe.apply(this, arguments);
			},

			/*
			 * Observe one event.
			 * @param {Object} type Event type.
			 * @param {Object} scope Which in event handler function "this" pointed.
			 * @param {Object} handler Event callback.
			 */
			observe : function(type, scope, handler) {
				
				if (Object.isFunction(scope) && Object.isUndefined(handler)) {
					handler = scope;
					scope = this;
				}

				if (handler !== null) {
					var listeners = this.listeners.get(type);

					// if listeners dosn't have this type of event, create one.
					if (typeof listeners === "undefined") {
						listeners = $A();
						this.listeners.set(type, listeners);
					}

					listeners.push({
						scope : scope,
						handler : handler
					});
				}

			},

			/*
			 * Unbind a event.
			 * @param {Object} type
			 * @param {Object} handler
			 */
			stopObserving : function(type, handler) {
				var listeners = this.listeners.get(type);

				if (listeners !== null) {
					if (!handler) {
						listeners.clear();
						listeners = null;
						this.listeners.unset(type);
					} else {
						for ( var i = 0; i < listeners.length; i++) {
							if (listeners[i].handler == handler) {
								listeners.splice(i, 1);
								break;
							}
						}

						if (listeners.size() === 0) {
							listeners = null;
							this.listeners.unset(type);
						}
					}
				}
			},

			/*
			 * Trigger an event with args.
			 * @param {Object} type Event type
			 * @param {Object} args Arguments to pass to the handler.
			 */
			fire : function(type) {
				var listeners = this.listeners.get(type);
				var continueChain;

				var args = $A(arguments).slice(1);

				if (listeners) {
					for ( var i = 0; i < listeners.length; i++) {
						var callback = listeners[i];
						// bind the context to callback.obj
						continueChain = callback.handler.apply(callback.scope,
								args);

						if ((continueChain !== undefined)&& (continueChain === false)) {
							return false;
							// if callback returns false, execute no more
							// callbacks.
							break;
						}else{
							return true;
						}
					}
				}
			}

		};

		var Maskable = {
				
			isMasked : function() {
				return cloud.util.isMasked(this.element);
			},

			mask : function(label) {
				cloud.util.mask(this.element, label);
			},

			unmask : function() {
				cloud.util.unmask(this.element);
			}
			
		};

		/*
		 * Initialize a Module, create events, unique id of the module.
		 * @author Jerolin 
		 */
		var Module = Class.create({
			id : null,
			moduleName : "module",
			mixins : [ Events ],

			initialize : function() {
				this.mixins.each(function(mixin) {
					cloud.util.mixin(this, mixin);
				}, this);
			},

			mixin : function(mixin) {
				cloud.util.mixin(this, mixin);
			},

			uniqueID : function(prefix) {
				this.id = this.id|| cloud.util.createUniqueID(prefix|| (this.moduleName + "-"));
				return this.id;
			}
		});

		/*
		 * super component class, include an element and a default element.
		 * @author Jerolin
		 */
		var Component = Class.create(Module, {
			moduleName : "component",
			defaultElement : "<div>",

			initialize : function($super, options) {
				$super();
				this.options = {
					disabled : false,
					extraClass : ""
				};
				$.extend(this.options, options || {});
				this.id = this.options.id || null;
				options.selector = $(options.selector || this.template|| this.defaultElement)[0];
				this.element = $(options.selector).addClass(this.options.extraClass);
				if (options.container) {
					this.element.appendTo(options.container);
				}

				if (options.events) {
					this.on(options.events);
				}
				this.uniqueID();
				this.mixin(Maskable);

				this.destroyed = false;
			},

			uniqueID : function($super) {
				this.id = this.element.attr("id") || $super();
				this.element.attr("id", this.id);
			},

			destroy : function() {
				this.id = null;
//				this.element && (this.element.remove());
				if(this.element) this.element.remove();
				this.element = null;
				this.moduleName = null;
				this.destroyed = true;
			},

			enable : function() {
				this.options.disabled = false;
				this.element.removeClass("state-disabled");
			},

			disable : function() {
				this.options.disabled = true;
				this.element.addClass("state-disabled");
			},

			errorMessage : function(text) {
				$.pnotify({
					text : text,
					type : 'error',
					history : false,
					styling : 'jqueryui',
					cornerclass : 'ui-pnotify-sharp'
				});
			},

			appendTo : function(dest) {
				if (dest instanceof cloud.Component) {
					dest.element.append(this.element);
				} else if (dest instanceof jQuery) {
					dest.append(this.element);
				}
			},

			show : function() {
				this.element.show();
			},

			hide : function() {
				this.element.hide();
			}
		});
		
		var View = Class.create(Component, {
		    moduleName : "view",

            initialize : function($super, options){
                $super(options);
                var self = this;
                
                if (options.parent){
                    this.parent = options.parent;
                }
                
                this.context = new Context({
                    view : this,
                    parent : this.parent ? this.parent.$getContext() : null
                });
                
                if (options.contextAttrs){
                    $.extend(this.context, options.contextAttrs);
                };
                
                if (options.controllerCls) {
                    this.controller = new options.controllerCls({
                        context : this.context,
                        parent : this.parent ? this.parent.$getController() : null
                    });
                }else {
                    this.controller = null;
                }
                
                this.$control(this.context);
            },
            
            $control : function(context){
                
            },
            
            $getContext : function(){
                return this.context;
            },
            
            $getController : function(){
                return this.controller;
            },
            
            destroy : function($super) {
                //TODO  can not call $super because of a bug in platform.js
                this.context.$destroy();
                this.context = null;
                this.controller && this.controller.destroy();
                this.parent = null;
                $super();
            },
		});
		
		var Controller =  Class.create(Module, {
            moduleName : "controller",

            initialize : function($super, options){
                $super(options);
                $.extend(this.options, options || {});
                
                //hold context, call Model
                this.view = options.context._$view;// view is required
                this.parent = options.parent;
                
                this.context = options.context;
                
//                this.parent = null;
                this.$prepare(this.context, this.view);
                
                this.$control(this.context, this.view);
                
            },
            
            $prepare : function(context, view){
                
            },
            
            $control : function(context, view){
                
            },
            
            destroy : function() {
                this.context = null;
                this.parent = null;
                this.view = null;
            },
        });
		
		var Context  =  Class.create({
            _moduleName : "context",

            initialize : function(options){
                $.extend(this._$options, options || {});
                
                this._$view = options.view;//view is required
                this._$id = this._$view.id;
                
                this._$parent = null;
                if (options.parent){
                    this.$setParent(options.parent);
                }
                
                this._$childrens = $H();
                
                this._$subs = null;
                
                this._$channel = Postal.channel(this._$id);
                this._$attrs = $H();//chain ?
            },
            
            //broadcast to parent context
            $emitAll : function(name, data){
                if (this._$parent) {
                    this._$parent.$emitAll(name, data);//TODO chain or just one level up?
                }else {
                    this.$broadcast(name, data);
                }
            },
            
            $emit : function(name, data){
                if (this._$parent) {
                    this._$parent.$broadcast(name, data, true);
                }
                this.$broadcast(name, data);
            },
            
            $broadcast : function(name, data, noCascade){
//                this._$channel.publish(name, data);
                cloud.message.post(this._$id, name, data);
                
                if (!noCascade) {
                    this._$childrens.each(function(child){
                        child.value.$broadcast(name, data);
                    })
                }
            },
            
            //TODO scope support
            $on : function(subscribes){
                var self = this;
                cloud.message.on(this._$id, subscribes);
                /*$H(subscribes).each(function(one){
                    self.subs.each(function(sub){
                        if (sub.callback == one.value){
//                            console.log("equals!")
                        }else{
//                            console.log("not equal!");
                        }
                    })
                    
                    self._$subs.push(self._$channel.subscribe(one.key, one.value));
                })*/
            },
            
            /*setAttr : function(name, data){
                
            },
            
            getAttr : function(name){
                
            },*/
            
            $setParent : function(context){
                this._$parent = context;
                context.$addChild(this);
            },
            
            $getParent : function(){
                return this._$parent;
            },
            
            $addChild : function(context){
                this._$childrens.set(context._$id, context);
            },
            
            $removeChild : function(context){
                this._$childrens.remove(context._$id);
            },
            
            $destroy : function() {
                /*this._$subs.each(function(sub){
                    sub.unsubscribe();
                });
                this._$subs = null;*/
//                this._$subs && this._$subs.unbind && this._$subs.unbind();
                
                cloud.message.clearChannel(this._$id);
                
                this._$id = null;
                this._$view = null;
                this._$parent = null;
                this._$childrens.each(function(child){
                    child.destroy && child.destroy();
                });
                this._$childrens = null;
                this._$channel = null;
            },
        });

		cloud.Module = cloud.Module || Module;
		cloud.Component = cloud.Component || Component;
		cloud.View = cloud.View || View;
		cloud.Controller = cloud.Controller || Controller;
	})();
	
	(function(){
	    var PropWrapper =  Class.create({
            initialize : function(options){
                this.map = $H(options.map);
                this.scope = options.scope;
                this.element = $(options.scope.element || document);
            },
            
            setMap : function(map){
                this.map = map;
            },
            
            setBean : function(obj){
                var self = this;
                $H(obj).each(function(prop){
                    self.set(prop.key, prop.value);
                });
            },
            
            getBean : function(){
                var self = this;
                var result = {};
                this.map.each(function(prop){
                    result[prop.key] = self.get(prop.key);
                });
                return result;
            },
            
            get : function(prop){
                var result;
                var mapValue = this.map.get(prop);
                var mapValueType = typeof mapValue;
                if (mapValueType == "string"){
                    result = this.getById(mapValue);
                }else if (mapValueType == "object"){
                    var customHandler = mapValue["$getter"];
                    if ((typeof customHandler) == "function"){
                        result = customHandler.call(this.scope, prop);
                    }else if ((typeof customHandler) == "string"){
                        result = this.getById(customHandler);
                    }else{
//                        console.debug("PropWrapper: prop not found when get : " + prop + ". scope :", this.scope);
                    }
                }else{
//                    console.debug("PropWrapper: prop not found when get : " + prop + ". scope :", this.scope);
                }
                return result;
            },
            
            set : function(prop, value){
                var mapValue = this.map.get(prop);
                var mapValueType = typeof mapValue;
                if (mapValueType == "string"){
                    this.setById(mapValue, value);
                }else if (mapValueType == "object"){
                    var customHandler = mapValue["$setter"];
                    if ((typeof customHandler) == "function"){
                        customHandler.call(this.scope, value, prop);
                    }else if ((typeof customHandler) == "string"){
                        this.setById(customHandler, value);
                    }else {
//                        console.debug("PropWrapper: prop not found when set " + value + " to " + prop + ". scope :", this.scope);
                    }
                }else{
//                    console.debug("PropWrapper: prop not found when set " + value + " to " + prop + ". scope :", this.scope);
                }
            },
            
            getById : function(id){
                return this.element.find("#"+id).val();
            },
            
            setById : function(id, value){
                this.element.find("#"+id).val(value);
            },
            
            destroy : function() {
                this.map = null;
                this.element = null;
                this.scope = null;
            },
        });
	    cloud.PropWrapper = PropWrapper;
	})()
	
	/*
	 * @name alert
	 * @type {function}
	 * @description "Modify the prompt for pnotify"
	 * @return {undefined}
	 */
	window.alert = function(text) {
		var debugMode = CONFIG["server"]["debugMode"];
		switch(debugMode){
			case true:
				$.pnotify({
					text : text,
					styling : 'jquerysui',
					history : false,
					cornerclass : 'ui-pnotify-sharp',
					sticker : false
				});
				break;
			case false:
				break;
			default:
				break;
		}
	};
	
	return cloud;
});