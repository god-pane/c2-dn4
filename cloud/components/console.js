/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author PANJC
 * @filename console
 * @filetype {object}
 * @filedescription "设置浏览器的console对象"
 * @filereturn
 */
define(function(require){
//	require("cloud/lib/jquery");
//	require("cloud/lib/prototype.lang");
//	require("cloud/base/_config");
//	//if IE,rewrite console.log
//	var root = window;
//	var console = root.console;
//	var debugMode = CONFIG["server"]["debugMode"];
//	switch(debugMode){
//		case true:
//			root.console = console;
//			if($.browser.msie){
//				if(!root.console){
//					widnow.console = {};
//					console.log = function(){
//						if(arguments.length != 0){
//							var arr = [];
//							$.each(arguments,function(index,value){
//								if($.isPlainObject(value)){
//									value = Object.toJSON(value);
//								}
//								arr.push(value);
//							});
//							root.console.log(arr.join());
//						}else{
//							root.console.log("");
//						}
//					};
//				}
//				return console.log;
//			}
//			break;
//		case false:
//			root.console = {};
//			root.console.log = function(){};
//			root.console.debug = function(){};
//			break;
//		default:
//			root.console = {};
//			root.console.log = function(){};
//			root.console.debug = function(){};
//			break;
//	}
	if (!window.console) (function() {

	    var __console, Console;

	    Console = function() {
	        var check = setInterval(function() {
	            var f;
	            if (window.console && console.log && !console.__buffer) {
	                clearInterval(check);
	                f = (Function.prototype.bind) ? Function.prototype.bind.call(console.log, console) : console.log;
	                for (var i = 0; i < __console.__buffer.length; i++) f.apply(console, __console.__buffer[i]);
	            }
	        }, 1000); 

	        function log() {
	            this.__buffer.push(arguments);
	        }

	        this.log = log;
	        this.error = log;
	        this.warn = log;
	        this.info = log;
	        this.__buffer = [];
	    };

	    __console = window.console = new Console();
	})();
});
