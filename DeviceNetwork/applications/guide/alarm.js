

define(function(require)  {
	require("cloud/base/cloud");
	require("./css/style.css");
	var LightBox = require("./lightbox");
	var Task = require("./task");
	
	var Alarm = Class.create({
		initialize: function() {
			var geometryPath = "M 0, 0"+
							   "v "+$(window).height()+
							   "h "+$(window).width()+
							   "V 0"+
							   "H 0z"+
							   "M 612, 0"+
							   "l 90, 0"+
							   "l 0, 40"+
							   "l -90, 0"+
							   "L 612, 0z";
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
				style["font-size"] = "17px";
				style["line-height"] = "25px";
			}
			$("<div>").addClass("guide-alarm-draw-pointer-line").appendTo(this.lightbox.element);
			$("<div>").addClass("guide-alarm-box").css(style)
			.appendTo(this.lightbox.element).text(locale.get({lang: "notice_description"}));
		},
		
		_initEvent: function() {
			var self = this;
			this.lightbox.nextBtn.click(function() {
				self.destroy();
				new Task();
			});
			
			this.lightbox.escapeBtn.click(function() {
				self.destroy();
			});
			
			this.lightbox.on({
				"refresh": function() {
					self.destroy();
					new Alarm();
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
	return Alarm;
});