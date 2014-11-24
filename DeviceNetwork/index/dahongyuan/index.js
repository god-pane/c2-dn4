/**
 * @author PANJC
 *
 */
define(function(require){
    var cloud = require("cloud/base/cloud");
    var Header = require("./common/header");
    var Nav = require("./common/nav");
    var Footer = require("./common/footer");
    var validator = require("cloud/components/validator");
    var Index = Class.create(cloud.Component, {
        initialize: function($super, options){
//            $super(options);
            var self = this;
            this.header = null;
            this.navigate = null;
            this.footer = null;
            this._render();
        },
        
        _render: function(){
            this._renderHeader();
            this._renderNav();
            this._renderFooter();
            this._effects();
            this._events();
            this._showAuthcode();
            this._validator();
            this._locale();
        },
        
        _locale:function(){
        	locale.render();
        },
        
        _renderHeader: function(){
            this.header = new Header({
                selector: "#common-header"
            });
        },
        
        _renderNav: function(){
            this.nav = new Nav({
                selector: "#common-nav",
                windowElement: "#home-content",
                current: 0
            });
        },
        
        _renderFooter: function(){
            this.footer = new Footer({
                selector: "#common-footer",
                contentElement: "#home-content"
            });
            
        },
        
        _validator:function(){
        	validator.render("#formID",{
            	promptPosition:"centerTop",
            	scroll: false,
			 });
        },
        
        _showPasswordInput:function(focus){
        	$("#home-input-pwd-text").hide();
        	$("#home-input-pwd-password").show();
        	if(focus){
        		$("#home-input-pwd-password").focus();
        	}
        },
        
        _showVercodeInput:function(focus){
        	$("#home-input-ver-default").hide();
        	$("#home-input-ver-custom").show();
        	if(focus){
        		$("#home-input-ver-custom").focus();
        	}
        },
        
        _events:function(){
        	var self = this;
        	$("#home-verimg").children("img").click(function(){
                self._showAuthcode();
            });
        	// 在输入框中给出提示
            $("#home-input-pwd-text").focus(function(){
            	self._showPasswordInput(true);
            });
            
            $("#home-input-ver-default").focus(function(){
            	self._showVercodeInput(true);
            });
            
            $("#home-content-bottom-div-center-text-button-DT").click(function(){
            	window.open('http://www.inhand.com.cn/index.php/zh/products/device-network/device-touch.html','_blank');
            }).mouseover(function(){
            	$(this).css("background","#00AFFA");
            }).mouseout(function(){
            	$(this).css("background","#00AFFA");
            });
            
            $("#home-content-bottom-div-center-text-button-DS").click(function(){
            	window.open('http://www.inhand.com.cn/index.php/zh/products/device-network/device-sense.html','_blank');
            }).mouseover(function(){
            	$(this).css("background","#00AFFA");
            }).mouseout(function(){
            	$(this).css("background","#00AFFA");
            });
            
            $("#home-content-bottom-div-center-text-button-DM").click(function(){
            	window.open('http://www.inhand.com.cn/index.php/zh/products/device-network/device-manager.html','_blank');
            }).mouseover(function(){
            	$(this).css("background","#00AFFA");
            }).mouseout(function(){
            	$(this).css("background","#00AFFA");
            });
        },
        
        _effects: function(){
            var self = this;
            $("#home-login-forget").bind("click", function(){
                require(["./forget_pass"], function(Forgetpass){
                    var forgetpass = new Forgetpass({
                        windowElement: "#home-content"
                    });
                });
            });
            $("#home-input-submit").bind("click",function(){
            	self._showPasswordInput();
            	self._showVercodeInput();
            	if(validator.result("#formID") && $("body").find(".inhand-dialog").length == 0 && $("body").find(".ui-window-content").length == 0){
            		self._login();
            	}
            }).mouseover(function(){
            	$(this).css({"background":"#00AFFA"});
            }).mouseout(function(){
            	$(this).css({"background":"#00AFFA"});
            });
            $("body").keydown(function(event){
        		if($("body").find(".inhand-dialog").length == 0 && $("body").find(".ui-window-content").length == 0){
        			if(event.keyCode == 13){
        				self._showPasswordInput();
                    	self._showVercodeInput();
        				if(validator.result("#formID")){
        					self._login();
        				}
        			}
        		}
            });
        },
        
        _showAuthcode: function(){
        	Model.captchas({
        		method:"get",
        		token:false,
        		success: function(data){
                  var imgUrl = "/api/captchas/" + data._id;
                  $("#home-verimg").children("img").attr("src", imgUrl).attr("picid",data.pictureId);
        		}
        	})
        },
        
        _login: function(){
        	var self = this;
            var username = $("#home-input-user").val();
            var password = $("#home-input-pwd-password").val();
            var pictureId = $("#home-verimg").children("img").attr("picid");
            var code = $("#home-input-ver-custom").val();
            var errorFun = function(error){
            	if(error.error_code == 21304){
            		var remainingTime = error.error.substring(error.error.indexOf("(")+1,error.error.indexOf(")"));
            		dialog.render({
            			content:[{lang:21304},{html:"<span id='remaining-time'></span>"},{lang:"seconds"}],
            			close:function(){if(t){clearInterval(t)}}
            		});
            		$("#remaining-time").text(" " + remainingTime + " ");
            		function time(){
            			s = $("#remaining-time").text();
            			s = parseInt(s);
            			if(s <= 0){
            				clearInterval(t);
            				dialog.close();
            				return;
            			}
            			$("#remaining-time").text(" " + (s-1) + " ");
            		}
            		t = setInterval(function(){time();},1000);
            	}else{
            		if(error.error_code == 21306){
            			dialog.render({lang:error.error_code,buttons:[{lang:"ok",click:function(){dialog.close();$("#home-input-ver-custom").focus();}}]});
            		}else if(error.error_code == 20002){
            			dialog.render({lang:error.error_code,buttons:[{lang:"ok",click:function(){dialog.close();$("#home-input-user").focus();}}]});
            		}else if(error.error_code == 21302){
            			dialog.render({lang:error.error_code,buttons:[{lang:"ok",click:function(){dialog.close();$("#home-input-user").focus();}}]});
            		}else{
            			dialog.render({lang:error.error_code});
            		}
            	}
            	self._showAuthcode();
            };
            Model.user({
            	method:"login",
            	data:{
            		username:username,
            		password:password,
            		pictureId:pictureId,
            		code:code
            	},
            	param:{
            		language:locale.current()
            	},
            	error:function(error){
            		self._showAuthcode();
            		errorFun(error);
            	}
            })
        }
        
    });
    
    return Index;
    
});
