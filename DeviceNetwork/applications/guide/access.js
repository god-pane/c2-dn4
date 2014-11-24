
define(function(require)  {
	require("cloud/base/cloud");
	require("./css/style.css");
	var LightBox = require("./lightbox");
	var System = require("./system");
	
	var Access = Class.create({
		initialize: function() {
			var _width = window.innerWidth,
				_height = window.innerHeight;
			var nameLength = 80+(Access.userName.length*12);
			var geometryPath = "M 0, 0"+
							   "v "+_height+
							   "h "+_width+
							   "V 0"+
							   "H 0z"+
							   "M 195, 0"+
							   "l 600, 0"+
							   "l 0, 40"+
							   "l -600, 0"+
							   "L 195, 0z"+
							   "M 146, 400"+ //426
							   "c 0, -180, 270, -185, 270, 0"+
							   "C 416, 585, 146, 585, 146, 400z"+
							   "M "+(_width-nameLength-110)+", 17"+
							   "c 0, -20, "+nameLength+", -20, "+nameLength+", 0"+
							   "C "+(_width-110)+", 37, "+(_width-nameLength-110)+", 37, "+(_width-nameLength-110)+", 17z";
			var options = {
				"opacity": 0.7,
				"geometry": geometryPath,
			};
			this.lightbox = new LightBox(options);
			this._render();
			this._initEvent();
		},
		
		_render: function() {
			var style = {};
			if(locale.current() == 1) {
				style["font-size"] = "14px";
				style["line-height"] = "18px";
			}
			$("<div>").addClass("nav-draw-pointer-line").appendTo(this.lightbox.element);
			$("<div>").addClass("map-draw-pointer-line").appendTo(this.lightbox.element);
			$("<div>").addClass("user-draw-pointer-line").appendTo(this.lightbox.element)
			.css("left", (innerWidth-200)+"px");
			
			$("<div>").addClass("nav-draw-pointer-line-text").css(style).appendTo(this.lightbox.element).text(locale.get({lang: "nav_description"}));
			$("<div>").addClass("map-draw-pointer-line-text").css(style).appendTo(this.lightbox.element).text(locale.get({lang: "pie_description"}));
			$("<div>").addClass("user-draw-pointer-line-text").css(style).appendTo(this.lightbox.element).text(locale.get({lang: "user_description"}))
			.css("left", (innerWidth-300)+"px");
		},
		
		_initEvent: function() {
			var self = this;
			this.lightbox.nextBtn.click(function() {
				self.destroy();
				new System();
			});
			
			this.lightbox.escapeBtn.click(function() {
				self.destroy();
			});
			
			this.lightbox.on({
				"refresh": function() {
					self.destroy();
					new Access();
				}
			});
		},
		
		show: function() {
			this.lightbox.show();
		},
		hide: function() {
			this.lightbox.hide();
		},
		destroy: function() {
			$(window).unbind('resize');
			this.lightbox.destroy();
			this.lightbox = null;
		}
	});
	
	Access.init = function() {
//		new Access();
//		if(!localStorage.getItem("refreshTotal")) {
//			localStorage.setItem("refreshTotal", "1");
//		}
//		else {
//			var total = parseInt(localStorage.getItem("refreshTotal"));
//			total += 1;
//			localStorage.setItem("refreshTotal", total);
//		}
//		var total = parseInt(localStorage.getItem("refreshTotal"));
		cloud.Ajax.request({
			url: "api2/users/this",
			type: "get",
			parameters: {
				verbose: 100
			},
			success: function(data) {
				//var totalLogin = data.result.totalLogin;
				//if(totalLogin <= 1 && total <= 1) {
					Access.userName = data.result.name;
					new Access();
				//}
			}
		});
	};
	
	return Access;
});
