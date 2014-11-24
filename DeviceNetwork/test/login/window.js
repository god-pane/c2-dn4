define(function(require){
    var cloud = require("cloud/base/cloud");
    var winCss = require("./window.css");
    var _Window = Class.create(cloud.Component, {
        initialize: function($super, options){
            $super(options);
            this.moduleName = "cloud-window";
            cloud.util.defaults(options, {
                title: "",
                content: "",
                background: "",
                width: 200,
                height: 200,
                minwidth: 200,
                minheight: 130,
                top: 0,
                left: 0,
				modal:false,
                autoOpen: false,
                drag: false,
                resize: false
            });
            this.title = options.title;
            this.content = options.content;
            this.top = options.top;
            this.left = options.left;
            this.width = options.width;
            this.height = options.height;
            this.minwidth = options.minwidth;
            this.minheight = options.minheight;
            this.resize = options.resize;
            this.autoOpen = options.autoOpen;
            this.drag = options.drag;
            this.modal = options.modal;
            this.caculateWindowSize();
            this.render();
        },
        render: function(){
            this.draw();
            this.setTitle(this.title);
            this.setPosition(this.top, this.left);
            this.setSize(this.width, this.height);
            this.setContents(this.content);
            if (this.autoOpen == false) {
                this.hiden();
            }
            if (this.resizeable) {
                this.resizable();
            }
            if (this.drag == true) {
                this.draggable();
            }
            this._events();
            
        },
        draw: function(){
            var self = this;
			if(this.modal==true){
	            this.windowmodal = $("<div id='window-modal' class='window-modal'></div>").appendTo(this.element);
	            this.windowmodal.width("100%");
	            this.windowmodal.height("100%");
				$("body>*:not(this.element)").bind("focus",function(){
					this.blur();	
				});
			}
            this.element.addClass("ui-window");
            this.body = $("<div id='ui-window-body' class='ui-window-body'></div>").appendTo(this.element);
            this.titles = $("<div id='ui-window-title' class='ui-window-title'></div>").appendTo(this.body);
            this.name = $("<div class='ui-window-title-name'></div>").appendTo(this.titles);
            if (self.resize == true) {
                this.resizeable = $("<div id='window-resize' class='ui-window-body-resize'></div>").appendTo(this.body);
            }
            this.closed = $("<div id='window-close' class='ui-window-title-close' title='close' ></div>").appendTo(this.titles);
            this.contents = $("<div class='ui-window-content' id='ui-window-content' ></div>").appendTo(this.body).width(this.width);
            var bodyWidth = document.body.offsetWidth;
            var bodyHeight = document.body.offsetHeight;
        },
        //if the height is larger than the window height, use the min one.
        caculateWindowSize: function(){
            var domWidth = $(document).width();
            var domHeight = $(document).height();
            this.height = Math.max(this.minheight, Math.min(this.height, domHeight));
            this.width = Math.max(this.minwidth, Math.min(this.width, domWidth));
        },
        resizable: function(){
            var self = this;
            var resizzing = false;
            $("#window-resize").mousedown(function(){
                self.width = self.body.css("width");
                self.height = self.body.css("height");
                resizzing = true;
                return false;
            });
            document.onmousemove = function(event){
                if (resizzing) {
                    var body = self.body[0];
                    var event = event || window.event;
                    var X = event.clientX - body.offsetLeft;
                    var Y = event.clientY - body.offsetTop;
                    var width = Math.max(X, self.minwidth);
                    var height = Math.max(Y, self.minheight);
                    $("#ui-window-body").css({
                        "width": width + "px",
                        "height": height + "px"
                    });
                    $("#ui-window-content").css({
                        "width": width + "px",
                        "height": height - 30 + "px"
                    });
                    return false;
                }
            };
            $("#window-resize").mouseup(function(event){
                resizzing = false;
                event.cancelBubble = true;
                var w = self.body.css("width");
                var h = self.body.css("height");
                if (w.indexOf(self.width) || h.indexOf(self.height)) {
                    self.fire("onResize");
                }
            });
            
        },
        draggable: function(){
            var self = this;
            var dragging = false;
            var iX, iY;
            $("#ui-window-title").mousedown(function(e){
                dragging = true;
                var body = self.body[0];
                iX = e.clientX - body.offsetLeft;
                iY = e.clientY - body.offsetTop;
                return false;
            });
            this.body[0].onmousemove = function(e){
                if (dragging) {
                    var e = e || window.event;
                    var oX = e.clientX - iX;
                    var oY = e.clientY - iY;
                    $("#ui-window-body").css({
                        "left": oX + "px",
                        "top": oY + "px"
                    });
                    return false;
                }
            };
            $("#ui-window-title").mouseup(function(e){
                dragging = false;
                e.cancelBubble = true;
            });
        },
        _events: function(){
            var self = this;
            $("#window-close").bind("click", function(){
                self.destroy();
                self.fire("onDestroy");
            });
			
        },
		setModal:function(){
			$(this).blur();
		},
        
        show: function(){
			var self = this;
            if (this.isOpen() === false) {
                this.element.show();
				if(this.modal==true){
					$("body>*:not(this.element)").bind("focus",function(){
						this.blur();	
					});
				}
                this.fire("onShow");
            }
        },
        hiden: function(){
			var self = this;
            if (this.isOpen() === true) {
                this.element.hide();
				if(this.modal==true){
					$("body>*:not(this.element)").unbind("focus");
				}
                this.fire("onHiden");
            }
        },
        setContents: function(content){
            var self = this;
            if (content.toLowerCase().indexOf("html") > -1) {
                this.contents.load(content, function(){
                    self.fire("afterCreated");
                });
            }
            else {
                this.contents.html(content);
            }
            
        },
        setPosition: function(top, left){
            if (left == "center") {
                var bodyWidth = $(document).width();
                left = (bodyWidth - this.width) / 2;
            }
            if (top == "center") {
                var domHeight = $(document).height();
                top = (domHeight - this.height) / 2;
            }
            this.body.css({
                left: left,
                top: top
            });
        },
        setSize: function(width, height){
            this.contents.css({
                "overflow": "auto"
            });
            this.body.height(height);
            this.body.width(width);
            this.contents.height(height - 30);
        },
        setTitle: function(title){
            if ((typeof title) == "string") {
                this.name.text(title);
            }
            else 
                if (title instanceof jQuery) {
                    this.name.append(title);
                }
        },
        isOpen: function(){
            var isopen = this.element.css("display");
            if (isopen === 'block') {
                return true;
            }
            else 
                if (isopen === 'none') {
                    return false;
                }
        },
        destroy: function(){
			if(this.modal==true){
					$("body>*:not(this.element)").unbind("focus");
				}
            this.name = null;
            this.titles.remove();
            this.titles = null;
            this.closed = null;
            this.body.remove();
            this.body = null;
			if(this.windowmodal){
	            this.windowmodal.remove();
	            this.windowmodal = null;
			}
            this.top = null;
            this.left = null;
            this.width = null;
            this.height = null;
            this.element = null;
        }
    });
    
    cloud._Window = cloud._Window || _Window;
    
    return _Window;
});
