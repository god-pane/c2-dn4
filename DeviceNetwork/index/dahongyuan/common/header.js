/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./header.html");
	var css = require("../resources/css/header.css");
    var Header = Class.create(cloud.Component, {
        initialize: function($super, options){
            $super(options);
            this.oldValue = null;
            this.language = null;
            this._render();
        },
        
        _render:function(){
        	var self = this;
        	if(sessionStorage.getItem("accessToken")){
        		location.href = "../applications";
        	}
        	this._renderHtml();
        	$("#lang-en").bind("click",function(){
    			locale.set({lang:"en"});
    			validator.render(validator.element,validator.paramObj);
    			self._promptCurrentLang();
    			self._changeLanguageEvent();
    		});
    		$("#lang-zh").bind("click",function(){
    			locale.set({lang:"zh_CN"});
    			validator.render(validator.element,validator.paramObj);
    			self._promptCurrentLang();
    			self._changeLanguageEvent();
    		});
    		this._promptCurrentLang();
    		this._event();
        },
        
        _renderHtml:function(){
        	this.element.html(html);
        },
        
        _promptCurrentLang:function(){
        	var lang = localStorage.getItem("language");
        	if(lang == "en"){
        		$("#lang-zh").css("color","#555");
        		$("#lang-en").css("color","#00AFFA");
        	}else if(lang == "zh_CN"){
        		$("#lang-zh").css("color","#00AFFA");
        		$("#lang-en").css("color","#555");
        	}
        },
        
        _changeLanguageEvent:function(){
        	if($("#change-language").length > 0){
        		$("#change-language").trigger("click");
        	}
        },
        
        _event:function(){
        	var self = this;
        	var $search = $("#search");
        	var oldValue,newValue;
        	$search.bind("focus",function(){
        		if(!self.language){
        			self.language = localStorage.getItem("language");
        		}
        		if(!self.oldValue){
        			self.oldValue = $search.val();
        		}else{
        			if(self.language != localStorage.getItem("language")){
        				self.oldValue = $search.val();
        				self.language = localStorage.getItem("language");
        			}
        		}
        		if(self.oldValue == $search.val()){
        			$search.val("");
        		}
        	});
        	$search.bind("focusout",function(){
        		newValue = $search.val();
        		if(!newValue){
        			$search.val(self.oldValue);
        		}
        	});
        }
        
    });
    
    return Header;
    
});