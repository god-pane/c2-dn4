/**
 * @author PANJC
 * 
 */
define(function(require){
    var cloud = require("cloud/base/cloud");
    var html = require("text!./nav.html");
    var css = require("./resources/css/nav.css");
    require("cloud/lib/plugin/jquery-ui");
//	require("cloud/lib/plugin/jquery.qtip");
    var Nav = Class.create(cloud.Component,{
        initialize: function($super,options){
        	$super(options);
        	this.sum = null;
        	this.domArr = null;
            this._render();
        },

        _render:function(){
        	this._renderHtml();
        	this._cacheDomArr();
        	this._setAccountPosition();
        	locale.render({element:this.element});
        },
        _cacheDomArr:function(){
        	this.domArr = {
        		nav:$("#nav"),
                mainCorp:$("#nav-main-corp"),
                mainRight:$("#nav-main-right"),
                mainLeft:$("#nav-main-left"),
                subLeft:$("#nav-sub-left")
        	};
        },       
        _renderHtml:function(){
        	this.element.html(html);
        	$("#nav-main-right-account-name").css({"color":"#84c44a","cursor":"pointer"}).mouseover(function(){
            	$(this).css({"text-decoration":"underline"}).mouseout({"text-decoration":"none"})
            });
        },
        
        _initializeResize2:function(){	
        	var self = this;
        	var corpWidth = self.domArr.mainCorp.width();
        	var rightWidth = self.domArr.mainRight.width();
        	var bodyWidth = document.body.offsetWidth ? document.body.offsetWidth : document.body.clientWidth;
        	var leftWidth = bodyWidth - corpWidth - rightWidth;
        	var minLeftWidth = 670;
        	var minNavWidth = corpWidth + rightWidth + minLeftWidth;
        	if(bodyWidth < minNavWidth){
        		self.domArr.nav.width(minNavWidth);
        	}
			else{
        		self.domArr.nav.width(bodyWidth);
        	}
        },
        //set account position
        _setAccountPosition:function(){
        	$("#nav-main-right").hide();
			var offsetWidth = parseFloat(document.body.offsetWidth);
			if(offsetWidth > 1030){
				$("#nav-main-right").css({left:offsetWidth-230});
			}else{
				$("#nav-main-right").css({left:1030});
			}
			$("#nav-main-right").show();
        },
    });
    
    return Nav;
    
});
