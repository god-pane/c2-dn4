/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author jerolin
 * @param {Object} "cloud/base/cloud"
 */
define(function(require) {
    require("cloud/base/cloud");
    require('./paginate.css');
    var Button = require('cloud/components/button');

    var Paginate = Class.create(cloud.Component, {
        initialize: function($super, options) {
            this.moduleName = "paginate";
            cloud.util.defaults(options, {
                count: options.count || 0,
                start: options.start || 0,
                display: options.display || 5
            });
            $super(options);

            this.element.addClass("paginate");

            this.pagesWidth = 0;
            this.pageWrapperWidth = 0;
            
            this._checkDisplayOpts();
            
            this.draw();
            
            this._bindBtnEvents();
            
            this.render(options.start, options.count);
            
//            this.selectPage(-3)
//            this.refreshSize();
            
//            this.selectedPage && this.positionPageNode(this.selectedPage[0]);
        },
        
        _drawLeftWrapper : function(wrapper){
            var leftWrap = $("<div>").addClass("paginate-control-left");
            this.leftWrap = leftWrap;
            var first = new Button({
                container: leftWrap,
                title: locale.get({lang:"first_page"}),
                imgCls: "cloud-icon-leftarrow1",
                // imgBaseCls: "ui-icons",
                extraClass: "paginate-first"
            });

            var rotateLeft = new Button({
                container: leftWrap,
                title: locale.get({lang:"rotate_left"}),
                imgCls: "cloud-icon-leftarrow2",
                // imgBaseCls: "ui-icons",
                extraClass: "paginate-previous"
            });
            
            this.firstBtn = first;
            this.rotateLeftBtn = rotateLeft;

            return leftWrap.appendTo(wrapper);
        },
        
        render : function(start, count, display){
            if (start && count){
                var self = this;
                var pages = this.pages;
                var options = this.options;
                
                options.start = start;
                options.count = count;
                display && (options.display = display);
                
                this.clearPages();
                
                $R(1, options.count).each(function(index) {
                    if (index === options.start) {
                        self.selectedPage = $("<li>").html("<span class='paginate-current'>" + index + "</span>").appendTo(pages);
                    } else {
                        $("<li>").html("<span>" + index + "</span>").appendTo(pages);
                    };
                });
                
                this._bindPageClickEvents();
                
                this.refreshSize();
                
                this.positionPageNode(this.selectedPage[0]);
            }
        },
        
        clearPages : function(){
            this.pages && this.pages.empty();
        },
        
        _drawPagesContent : function(wrapper){
            var self = this;
            var options = this.options;
            var pagesWrap = $("<div>").css("overflow", "hidden").addClass("paginate-pages-content");
            this.pagesWrap = pagesWrap;
            var pages = $("<ul>").addClass("paginate-pages").appendTo(pagesWrap);
            this.pages = pages;
//            var selectedPage;
            
//            this.render(options.start, options.count);
            /*$R(1, options.count).each(function(index) {
                if (index === options.start) {
                    self.selectedPage = $("<li>").html("<span class='paginate-current'>" + index + "</span>").appendTo(pages);
                } else {
                    $("<li>").html("<span>" + index + "</span>").appendTo(pages);
                }
            });*/
            
//            this.selectedPage = selectedPage;
            return pagesWrap.appendTo(wrapper);  
        },
        
        _drawRightWrapper : function(wrapper){
            var rightWrap = $("<div>").addClass("paginate-control-right");
            this.rightWrap = rightWrap;
            var rotateRight = new Button({
                container: rightWrap,
                title: locale.get({lang:"rotate_right"}),
                imgCls: "cloud-icon-rightarrow2",
                // imgBaseCls: "ui-icons",
                extraClass: "paginate-next"
            });

            var last = new Button({
                container: rightWrap,
                title: locale.get({lang:"last_page"}),
                imgCls: "cloud-icon-rightarrow1",
                // imgBaseCls: "ui-icons",
                extraClass: "paginate-last"
            });
            
            this.rotateRightBtn = rotateRight;
            this.lastBtn = last;

            return rightWrap.appendTo(wrapper);  
        },
        
        refreshSize : function(display){
            var self = this;
            var pages = this.pages;
            var options = this.options;
            var pagesWrap = this.pagesWrap;
            var rightWrap = this.rightWrap;
            var leftWrap = this.leftWrap;
            var wrapper = this.wrapper;
            var outsideWidthTemp = 0;
            this.pagesWidth = 0;
            if (display != undefined){
                options.display = display;
                this._checkDisplayOpts();
            };
            
            pages.children().each(function(index, node) {
                if (index === (options.display - 1)) {
                    outsideWidthTemp = 57 + $(node).width()*(index + 1);
                }
                self.pagesWidth += $(node).width();
            });
            pages.css("width", this.pagesWidth);

            this.pageWrapperWidth = outsideWidthTemp - leftWrap.width() - 3;
            pagesWrap.css("width", this.pageWrapperWidth);
            rightWrap.css("left", outsideWidthTemp + 6);

            wrapper.css("width", outsideWidthTemp + 6 + rightWrap.width() -leftWrap.width());

        },
        
        _bindBtnEvents : function(){
            var self = this;
            var first = this.firstBtn;
            var last = this.lastBtn;
            var pages = this.pages;
            var selectedPage = this.selectedPage;
            var pagesWrap = this.pagesWrap;
            var rotateLeft = this.rotateLeftBtn;
            var rotateRight = this.rotateRightBtn;
            
            var scrollInterval = null;
            var mouseInterval = null;
            rotateLeft.element.hover(function() {
                scrollInterval = setInterval(function() {
                    pagesWrap.scrollLeft(pagesWrap.scrollLeft() - 1);
                }, 20);
            }, function() {
                clearInterval(scrollInterval);
            }).mousedown(function() {
                mouseInterval = setInterval(function() {
                    pagesWrap.scrollLeft(pagesWrap.scrollLeft() - 50);
                }, 20);
            }).mouseup(function() {
                clearInterval(mouseInterval);
            }).mouseout(function(){
            	clearInterval(mouseInterval);
            });

            rotateRight.element.hover(function() {
                scrollInterval = setInterval(function() {
                    pagesWrap.scrollLeft(pagesWrap.scrollLeft() + 1);
                }, 20);
            }, function() {
                clearInterval(scrollInterval);
            }).mousedown(function() {
                mouseInterval = setInterval(function() {
                    pagesWrap.scrollLeft(pagesWrap.scrollLeft() + 50);
                }, 20);
            }).mouseup(function() {
                clearInterval(mouseInterval);
            }).mouseout(function(){
            	clearInterval(mouseInterval);
            });
            

            first.on({
                click: function() {
                    pagesWrap.animate({
                        scrollLeft: 0
                    }).find("li").first().click();
                }
            });

            last.on({
                click: function() {
                    pagesWrap.find("li").last().click();
                }
            });
        },
        
        _bindPageClickEvents : function(){
            var self = this;
            var pages = this.pages;
            var selectedPage = this.selectedPage;
            
            pages.children().click(function(e) {
                var $this = $(this);
                selectedPage.children().first().removeClass("paginate-current");
                $this.children().first().addClass("paginate-current");
                selectedPage = $this;

                self.positionPageNode(this);
                self.fire("change", parseInt($this.children().first().text(), 0));
            });
        },
        
        selectPage : function(number){
            if (number > 0) {
                number = number - 1;
            }
            this.pages && $(this.pages.children().get(number)).trigger("click");
        },
        
        _checkDisplayOpts : function(){
            var options = this.options;
            /*
            //zero safe
            if (options.start == undefined || options.start < 0) options.start = 0;
            if (options.count == undefined || options.count < 0) options.count = 0;
            if (options.display == undefined || options.display < 0) options.display = 0;
            */
            if (options.display > options.count) {
                options.display = options.count;
            }
        },
        
		/*
		 * draw the contents for paginate ,and bind events
		 * 
		 */
        draw: function() {
            var options = this.options,
                self = this,
                wrapper = $("<div>").addClass("paginate-wrapper");
            
            this.wrapper = wrapper;

            var leftWrap = this._drawLeftWrapper(wrapper);

            var pagesWrap = this._drawPagesContent(wrapper);

            var rightWrap = this._drawRightWrapper(wrapper);
            
            wrapper.appendTo(this.element);

            wrapper.css("padding-left", leftWrap.width() + 5);
        },

		/*
		 * position the page to the center of visibale window.
		 * @param  {dom}
		 */
        positionPageNode: function(page) {
            var $page = $(page);
            this.pagesWrap.animate({
                scrollLeft: $page.context.offsetLeft - this.pageWrapperWidth/2 - this.leftWrap.width() //+ $page.width()
            });
        },

        destroy: function($super) {
            if (this.paginate) {
                this.paginate.destroy();
            }

            $super();
        }

    });
    return Paginate;
});