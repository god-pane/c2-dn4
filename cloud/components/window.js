/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author zhangyl
 * @filename window
 * @filetype {class}
 * @filedescription "窗口组件"
 * @filereturn {function} _Window "函数引用"
 * @param {Object}
 */
define(function(require){
    var cloud = require("cloud/base/cloud");
    var winCss = require("../resources/css/window.css");
    require("cloud/lib/plugin/jquery-ui");
    var _Window = Class.create(cloud.Component, {
    	/**
    	 * @author zhangyl
    	 * @name initialize
    	 * @type {function}
    	 * @description "该类实例化函数"
    	 * @param {function} $super "父类引用"
    	 * @param {object} options "json参数对象"
    	 * @return
    	 */
        initialize: function($super, options){
            cloud.util.defaults(options, {
				cls:"ui-window-body",
                titleLang: "",
				title: null,
				content: null,
                width: 200,
                height: 200,
                top: "center",
                left: "center",
                hide: 0,
				resize:false,
                drag: false,
                mask: false,
				maxHeight:null,
				maxWidth:null,
				minHeight:null,
				minWidth:null
            });
			this.moduleName="window";
			this.defaultElement = "<div>";
			$super(options);
			this.cls = options.cls;
            this.titleLang = options.titleLang;
            this.title = options.title;
            this.content = options.content;
            this.top = options.top;
            this.left = options.left;
            this.width = options.width;
            this.height = options.height;
            this.resize = options.resize;
            this.hide = options.hide;
            this.drag = options.drag;
            this.mask = options.mask;
            this.caculateWindowSize();
            this.render();
        },
        /**
         * if the height is larger than the window height, use the min one.
         * @author zhangyl
         * @name caculateWindowSize
         * @type {method}
         * @description "计算窗口的尺寸"
         * @return
         */
        caculateWindowSize: function(){
            var domWidth = $(document).width();
            var domHeight = $(document).height();
            this.height = Math.min(this.height, domHeight);
            this.width = Math.min(this.width, domWidth);
        },
        /**
		 * invoke fucntions step by step
         * @author zhangyl
         * @name render
         * @type {method}
         * @description "渲染组件"
         * @return
         */
        render: function(){
            this.draw();
            this.setTitle(this.title);
            this.setPosition(this.top, this.left);
            this.setSize(this.width, this.height);
            this.setContents(this.content);
            if (this.hide <= 0) {
                this.hiden();
            }
            this._events();
        },
		/**
		 * draw elements of window,
         * @author zhangyl
         * @name draw
         * @type {method}
         * @description "绘制组件dom结构"
         * @return
         */
        draw: function(){
            var self = this;
            var height = document.documentElement.scrollHeight;
            if (this.mask === true) {
                this.windowmodal = $("<div id='window-modal' class='window-modal'></div>").appendTo(this.element);
                this.windowmodal.width("100%");
//                this.windowmodal.height(height);
                this.windowmodal.height("100%");
            }
			
            this.body = $("<div id='ui-window-body' class='ui-window-body'></div>").appendTo(this.element);
			this.body.addClass(this.cls);
            this.titles = $("<div id='ui-window-title' class='ui-window-title'></div>").appendTo(this.body);
            if (this.titleLang) {
                this.titles.attr("lang", this.titleLang);
            }
            this.name = $("<div class='ui-window-title-name'></div>").appendTo(this.titles);
//            if (self.resize == true) {
//                this.resizeable = $("<div id='window-resize' class='ui-window-body-resize'></div>").appendTo(this.body);
//            }
            this.closed = $("<div id='window-close' class='ui-window-title-close' lang='title:close' title='"+ locale.get("close") +"' ></div>").appendTo(this.titles);
            this.contents = $("<div class='ui-window-content' id='ui-window-content' ></div>").appendTo(this.body).width(this.width);
//            var bodyWidth = document.body.offsetWidth;
//            var bodyHeight = document.body.offsetHeight;
        },
		/**
		 * bind events of window:
		 * click close button or press ESC ,then close the window; 
		 * if option frag is true, set it draggable ;
		 * if option mask is true,set a mask layer,
		 * set a scroll event to keep masking full screen. 
		 * @author zhangyl
		 * @name _events
		 * @type {method}
		 * @description "组件时间绑定"
		 * @private
		 * @return
		 */
        _events: function(){
            var self = this;
        	this.closed.bind("click", function(){
        		var close = self.fire("beforeClose");
        		if(close ||  close === undefined){
        			self.destroy();
        			self.fire("onClose");
        		}
            }).mouseover(function(){
				$(this).addClass("ui-window-title-close-active");
			}).mouseleave(function(){
				$(this).removeClass("ui-window-title-close-active");
			});
        	$(window).keydown(function(e){
				var varkey = (e.keyCode) || (e.which) || (e.charCode);
	        	if (varkey == 27) {
	        		var close = self.fire("beforeClose");
	        		if(close ||  close === undefined){
	        			self.destroy();
	        			self.fire("onClose");
	        		}
	        	}
			  });
            if (self.drag === true) {
                this.body.draggable({
                    handle: self.titles,
                    opacity: 0.5,
                    cursor: "pointer",
					containment: document.body,
					start:self.fire("dragStart"),
					stop:self.fire("dragStop")
                });
            }
//            if (self.resize === true) {
//                this.body.resizable({
//					ghost:true,
//					containment: document.body,
//					maxHeight:this.options.maxHeight||$(document).height(),
//					maxWidth:this.options.maxWidth||$(document).width(),
//					minHeight:this.options.maxWidth||this.height,
//					minWidth:this.options.minWidth||this.width,
//					start:self.fire("resizeStart"),
//					stop:self.fire("resizeStop")
//                });
//            }
			if(self.mask===true){
				var self = this;
				this.windowmodal.bind("click",function(){
					$(":tabbable :first",self.body).focus();
				});
				this.body.bind("keydown",function(event){
					if (!self.mask || event.keyCode !== $.ui.keyCode.TAB ) {
						return;
					}
					var tabbables = $( ":tabbable", $(this) ),
						first = tabbables.filter( ":first" ),
						last  = tabbables.filter( ":last" );
					if ( event.target === last[0] && !event.shiftKey ) {
						first.focus( 1 );
						return false;
					} else if ( event.target === first[0] && event.shiftKey ) {
						last.focus( 1 );
						return false;
					}
				});
			}
			$(window).bind("scroll",function(){
				if(self.windowmodal){
					var docHeight = document.documentElement.scrollHeight;
//					var winHeight = self.windowmodal.height();
//					var height = docHeight > winHeight ? docHeight : winHeight ;
					self.windowmodal.height(docHeight);
				}
			});
//			$(window).bind("resize",function(){
//				if(self.windowmodal){
//					var docHeight = document.documentElement.scrollHeight;
//					var winHeight = self.windowmodal.height();
//					var height = docHeight > winHeight ? docHeight : winHeight ;
//					self.windowmodal.height(height);
//				}
//			});
			
        },
        /**
         * show the window
         *@author zhangyl
         *@name show
         *@type {method}
         *@description "显示组件"
         *@return
         */
        show: function(){
        	this.fire("onShow");
        	if(!this.body){
        		this.render();
        	}
            this.body.show();
        },
		/**
		 * hiden the window
		 * @author zhangyl
		 * @name hiden
		 * @type {method}
		 * @description "隐藏组件"
		 * @return
		 */
        hiden: function(){
            this.body.hide();
        },
		/**
		 * set contents of window
		 * @author zhangyl
		 * @name setContents
		 * @type {method}
		 * @description "设置组件内容"
		 * @param {string} content "内容对象"
		 * @return
		 */
        setContents: function(content){
            var self = this;
            if ((typeof content) == "string") {
                if (content.toLowerCase().indexOf(".html") > -1 && content.toLowerCase().indexOf("<") < 0) {
                    this.contents.load(content, function(){
                        self.fire("afterCreated");
                    });
                }
                else {
                    this.contents.html(content);
                    self.fire("afterCreated");
                }
            }
            else 
                if (content instanceof jQuery) {
                    this.contents.append(content);
                    self.fire("afterCreated");
                }
        },
		/**
		 * set the position of window,if the param is 'center',set it center. 
		 * @author zhangyl
		 * @name setPosition
		 * @type {method}
		 * @description "设置组件显示位置"
		 * @param {string} top "顶部"
		 * @param {string} left "左边"
		 * @return
		 */
        setPosition: function(top, left){
            if (left == "center") {
                var bodyWidth = document.body.offsetWidth;
                left = (bodyWidth - this.width) / 2;
            }
            if (top == "center") {
                var domHeight = document.body.offsetHeight;
                top = (domHeight - this.height) / 2;
            }
            this.body.css({
                left: left,
                top: top
            });
        },
		/**
		 * set the width and height 
		 * @author zhangyl
		 * @name setSize
		 * @type {method}
		 * @description "设置body的尺寸"
		 * @param {number} width "宽度"
		 * @param {number} height "高度"
		 * @return
		 */
        setSize: function(width, height){
            this.contents.css({
                "overflow": "auto"
            });
            this.body.height(height);
            this.body.width(width);
            this.contents.height(height - 30);
        },
        /**
         * @author zhangyl
         * @name setTitle
         * @type {method}
         * @description "设置窗口提示信息"
         * @param {string} title "提示信息内容"
         * @return
         */
        setTitle: function(title){
            if ((typeof title) == "string") {
                this.name.text(title);
            }
            else 
                if (title instanceof jQuery) {
                    this.name.append(title);
                }
        },
		/**
		 * destroy the parameters 
		 * @author zhangyl
		 * @name destroy
		 * @type {method}
		 * @description "摧毁组件"
		 * @param {function} $super "父类引用"
		 * @return
		 */
        destroy: function($super){
			
            this.titles = null;
            this.name = null;
            this.closed = null;
            this.body && (this.body.remove());
            this.body = null;
            this.windowmodal = null;
//			this.element.remove();
//			this.element = null;
            this.title = null;
            this.top = null;
            this.left = null;
            this.width = null;
            this.height = null;
            $super();
        }
    });
    
    cloud._Window = cloud._Window || _Window;
    
    return _Window;
});
