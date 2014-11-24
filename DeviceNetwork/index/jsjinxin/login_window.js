define(function(require){
	var cloud = require("cloud/base/cloud");
	var _Window = require("cloud/components/window");
	var winCss = require("./resources/css/login_window.css");
	var winHtml = require("text!./login_window.html");
	var Forgetpass = require("./forget_pass");
	var validator = require("cloud/components/validator");
	var Login = Class.create(cloud.Component,{
		initialize: function($super, options){
//			$super(options);
			this.moduleName = "login-window";
			this.loginModule = null;
			this.windowElement = options.windowElement;
			this._render();
        },
        
        _render:function(){
        	this._renderWindow();
        	this.loginModule.show();
//        	$("#input-email")[0].focus();
			this._showAuthcode();
			this._refreshAuthcode();
			this._validation();
			this._event();
			this._locale();
        },
        
        _locale:function(){
        	locale.render({element:"#login-window"});
        },
        
        _showPasswordInput:function(focus){
        	$("#input-password-text").hide();
        	$("#input-password-password").show();
        	if(focus){
        		$("#input-password-password").focus();
        	}
        },
        
        _showVercodeInput:function(focus){
        	$("#input-vercode-default").hide();
        	$("#input-vercode-custom").show();
        	if(focus){
        		$("#input-vercode-custom").focus();
        	}
        },
        
        _event:function(){
        	var self = this;
        	 //在输入框中给出提示
             $("#input-password-text").focus(function(){
            	 self._showPasswordInput(true);
             });
             
             $("#input-vercode-default").focus(function(){
            	 self._showVercodeInput(true);
 			});
        	$("#input-submit").bind("click",function(){
        		self._showPasswordInput();
        		self._showVercodeInput();
        		if(validator.result("#login-window-form") && $(".inhand-dialog").length == 0){
        			self._login();
        		}
        	});
        	$("body").keydown(function(event){
        		if($("#login-input-hide").val()){
        			if(event.keyCode == 13){
        				self._showPasswordInput();
                		self._showVercodeInput();
        				if(validator.result("#login-window-form") && $("body").find(".inhand-dialog").length == 0){
        					self._login();
        				}
        			}
        		}
            });
        },
        
        _validation:function(){
        	var self = this;
        	$(function(){
				if(!self.validation){
					self.validation = validator.render("#login-window-form",{
						promptPosition:"topLeft",
		            	scroll: false
					});
				}
			});
        },
        
        _renderWindow:function(){
        	this.loginModule = new _Window({
				container: this.windowElement,
				title:locale.get({lang:"sign_in"}),
				top:"center",
				left:"center",
				height:300,
				width:450,
				mask:true,
				drag:true,
				content:winHtml,
				events: {
					"afterCreated": this._forgetpass,
					scope: this
				}
			});
        },
        
		_showAuthcode:function(){
			Model.captchas({
        		method:"get",
        		token:false,
        		success: function(data){
                  var imgUrl = "/api/captchas/" + data._id;
                  $("#winvercode").children("img").attr("src",imgUrl).attr("picid",data.pictureId);
        		}
        	})
        },
        
		_refreshAuthcode:function(){
			var self = this;
			$("#refresh").live("click",function(){
				self._showAuthcode();	
			});
			$("#winvercode").live("click",function(){
				self._showAuthcode();	
			});
		},
        
		_forgetpass:function(Win){
			var self = this;
			$("#login-window-forget").click(function(){
				$("#window-modal").remove();
				$("#ui-window-body").remove();
    			var forgetpass= new Forgetpass({
    				windowElement:self.windowElement
    			});
			});
		},
		
		_login:function(){
			var self = this;
            var username = $("#input-email").val();
            var password = $("#input-password-password").val();
            var pictureId = $("#winvercode").children("img").attr("picid");
            var code = $("#input-vercode-custom").val();
            var errorFun = function(error){
            	if(error.error_code == 21304){
            		var remainingTime = error.error.substring(error.error.indexOf("(")+1,error.error.indexOf(")"));
            		dialog.render({
            			content:[{lang:21304},{html:"<span id='remaining-time-window'></span>"},{lang:"seconds"}],
            			close:function(){if(t){clearInterval(t)}}
            		});
            		$("#remaining-time-window").text(" " + remainingTime + " ");
            		function time(){
            			s = $("#remaining-time-window").text();
            			s = parseInt(s);
            			if(s <= 0){
            				clearInterval(t);
            				dialog.close();
            				return;
            			}
            			$("#remaining-time-window").text(" " + (s-1) + " ");
            		}
            		t = setInterval(function(){time();},1000);
            	}else{
            		if(error.error_code == 21306){
            			dialog.render({lang:error.error_code,buttons:[{lang:"ok",click:function(){dialog.close();$("#input-vercode").focus();}}]});
            		}else if(error.error_code == 20002){
            			dialog.render({lang:error.error_code,buttons:[{lang:"ok",click:function(){dialog.close();$("#input-email").focus();}}]});
            		}else if(error.error_code == 21302){
            			dialog.render({lang:error.error_code,buttons:[{lang:"ok",click:function(){dialog.close();$("#input-email").focus();}}]});
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
	
	return Login;
	
});
