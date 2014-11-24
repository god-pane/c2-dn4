/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var css = require("../resources/css/footer.css");
	var html = require("text!./footer.html");
    var Footer = Class.create(cloud.Component, {
        initialize: function($super, options){
            $super(options);
            this.contentElement = options.contentElement;
            this._render();
        },
        
        _render:function(){
        	this._renderHtml();
//        	this._resizeHeight();
//        	this._events();
        },
        
        _renderHtml:function(){
        	this.element.html(html);
        },
        
        _resizeHeight:function(){
        	var $this = this;
        	var bodyHeight = document.body.scrollHeight ? document.body.scrollHeight : document.body.offsetHeight;
        	var headerHeight = $("#home-header-box").height();
        	var navHeight = $("#home-nav-box").height();
        	var contentHeight = $($this.contentElement).height();
        	var footerHeight = bodyHeight - headerHeight - navHeight - contentHeight -3;
        	$("#home-footer-box").height(footerHeight);
        },
        
        _events:function(){
        	var $this = this;
        	var once = null;
            $(window).resize(function(){
            	function _resize(){
            		$this._resizeHeight();
            	}
            	once = once ? null : setTimeout(_resize,0);
            });
        }
        
    });
    
    return Footer;
    
});