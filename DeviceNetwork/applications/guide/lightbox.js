
define(function(require) {
	require("./css/style.css");
	require("cloud/base/cloud");
	require("cloud/lib/plugin/raphael.min");
	
//	var _width = screen.availWidth,
//		_height = screen.availHeight-(outerHeight-innerHeight);
	
	
	
	var LightBox = Class.create(cloud.Component, {
		initialize: function($super, options) {
			var _width = window.innerWidth,
				_height = window.innerHeight;
			
			cloud.util.defaults(options, {
				"width": _width,
				"height": _height,
				"container": $(document.body),
				"opacity": 0.5,
				"geometry": "",
				
			});
			$super(options);
			
			this.element.css({
				position: 'absolute',
				"z-index": 100,
				top: '0px',
				left: '0px',
				width: this.options.width+'px',
				height: this.options.height+'px',
			}).attr("id", "guide-panel");
			this._render();
			this._initEvent();
		},
		_render: function() {
			this.palette = Raphael("guide-panel", this.options.width, this.options.height);
			this.geometry = this.palette.path(this.options.geometry);
			this.geometry.attr({
				"stroke": 'red',
				"stroke-width": '0px',
				"fill": 'black',
				"opacity": this.options.opacity
			});
			
			this.nextBtn = $("<div>").css({
				left: ($(window).width() / 2 +100)+"px",
				top: ($(window).height() - 100)+"px"
			}).addClass("guide-next-button").text(locale.get({lang: "next_step"})).appendTo(this.element);
			
			this.escapeBtn = $("<a>").attr("href", "#").addClass("guide-escape").text(">"+locale.get({lang: "escape"}));
			$("<div>").addClass("guide-escape-box").css({
				"left": ($(window).width()-75)+"px",
				"top": ($(window).height()-35)+"px"
			}).appendTo(this.element).append(this.escapeBtn);
		},
		
		_initEvent: function() {
			var self = this;
			$(window).bind("resize", function() {
				self.fire("refresh");
			});
		},
		
		drawPointerLine: function(options) {
			var dl = this.pointer.clone();
			dl.show();
			
			dl.translate(options.translate.x, options.translate.y);
			dl.rotate(options.rotate.angle, options.rotate.x, options.rotate.y);
			dl.scale(options.scale);
			return dl;
		},
		
		show: function() {
			this.element.show();
		},
		hide: function() {
			this.element.hide();
		},
		destroy: function($super) {
			this.nextBtn = null;
			this.escapeBtn = null;
			this.geometry.remove();
			this.geometry = null;
			this.palette.remove();
			this.palette = null;
			this.element.empty();
			$super();
		}
	});
	return LightBox;
});