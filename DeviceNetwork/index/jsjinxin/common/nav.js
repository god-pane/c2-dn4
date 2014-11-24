/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var css = require("../resources/css/nav.css");
	var html = require("text!./nav.html");
    var Nav = Class.create(cloud.Component, {
        initialize: function($super, options){
            $super(options);
            this.pageNum = options.current;
            this.page = {
            		0:"#home-nav-index",
            		1:"#home-nav-login",
            		2:"#home-nav-reg",
            		3:"#home-nav-devforum",
            		4:"#home-nav-aboutus"
            };
            this.windowElement = options.windowElement;
            this._render();
        },
        
        _render:function(){
        	this._renderHtml();
        	this._effects();
        },
        
        _renderHtml:function(){
        	this.element.html(html);
        },
        
        _effects:function(){
        	var $this = this;
        	$($this.page[$this.pageNum]).addClass("home-nav-a-current");
        	$($this.page[1]).bind("click",function(){
    			require(["../login_window"], function(Login){
    				var login= new Login({
    					windowElement:$this.windowElement
    				});
    			});
    		});
        }
        
    });
    
    return Nav;
    
});