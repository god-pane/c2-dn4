define(function(require){
	var cloud = require("cloud/base/cloud");
	var _Window = require("cloud/components/window");
	var css = require("resources/css/forget.css");
	var winHtml = require("text!./forget_pass.html");
	var validator = require("cloud/components/validator");
	var Forgetpass = Class.create(cloud.Component,{
		initialize: function($super, options){
			$super(options);
			this.loginModule = null;
			this.windowElement = options.windowElement;
			this._render();
        },
        
		_render:function(){
			this._renderwindow();
			this._showAuthcode();
			this._validation();
			this._events();
			this._locale();
		},
		
		_locale:function(){
        	locale.render({element:"#forget-window"});
        },
		
        _showVercodeInput:function(focus){
        	$("#forget-input-vcode-default").hide();
        	$("#forget-input-vcode-custom").show();
        	if(focus){
        		$("#forget-input-vcode-custom").focus();
        	}
        },
        
		_renderwindow:function(){
			this.login = new _Window({
				container: this.windowElement,
				title:locale.get({lang:"forgot_pwd"}),
				top:"center",
				left:"center",
				height:300,
				width:450,
				mask:true,
				drag:true,
				content:winHtml
			});
			this.login.show();
		},
		
		_events:function(){
			var self = this;
			$("#imgVcode").bind("click",function(){
				self._showAuthcode();
			});
			$("#refreshImgVcode").bind("click",function(){
				self._showAuthcode();
			});
			$("#forget-button-sure").bind("click",function(){
				self._showVercodeInput();
				if(validator.result("#forget-password-formid")){
					var username = $.trim($("#forget-input-email").val());
					var picId = self.picId;
//					console.log("submit picId:"+self.picId);
					var varificationCode = $.trim($("#forget-input-vcode-custom").val());
					var requestJson = {
							"username":username,
							"picId":picId,
							"varificationCode":varificationCode
					};
					requestJson = Object.toJSON(requestJson);
					cloud.Ajax.request({
						url:"api2/forgotten_password?language=" + locale.current(),
						type:"POST",
						data:requestJson,
						error:function(error){
							console.log(error);
							if(error.error_code == 20006){
								dialog.close();
								dialog.render({lang:"email+not_exists"});
							}else{
								dialog.close();
								dialog.render({lang:error.error_code});
							}
							self._showAuthcode();
						},
						success:function(data){
							$("#window-close").trigger("click");
							dialog.render({lang:"password_has_been_sent_to_the_email"});
						}
					});
				}
			})
			 //在输入框中给出提示
			$("#forget-input-vcode-default").focus(function(){
				self._showVercodeInput(true);
			});
		},
		
		_validation:function(){
        	var self = this;
        	$(function(){
        		if(!self.validation){
					self.validation = validator.render("#forget-password-formid",{
						promptPosition:"topLeft",
		            	scroll: false
					});
				}
			});
        },
		
		_showAuthcode: function(){
			var self = this;
            cloud.Ajax.request({
                url: "api/captchas",
                type: "GET",
                success: function(data){
                	self.picId = data.pictureId;
//                	console.log("showAuthcode self.picId:"+self.picId);
//                	console.log("showAuthcode data.pictureId:"+data.pictureId);
                    var imgUrl = cloud.config.FILE_SERVER_URL + "/api/captchas/" + data._id;
                    $("#imgVcode").attr("src", imgUrl);
                }
            });
        }
		
	});
	
	return Forgetpass;
	
});
