define(function(require){
	var cloud = require("cloud/base/cloud");
    var Header = require("./common/header");
    var Nav = require("./common/nav");
    var Footer = require("./common/footer");
    var validator = require("cloud/components/validator");
    var Register = Class.create(cloud.Component,{
    	initialize:function($super, options){
    		this.requestObj = {};
    		this.form = "#register-form";
    		this._renderHeader();
    		this._renderNav();
    		this._renderFooter();
    		this._vercode();
    		this._validator();
    		this._renderRegistrationInformation();
    		this._events();
    		this._locale();
    	},
    	
    	_validator:function(){
    		validator.render(this.form,{
            	promptPosition:"topLeft",
            	scroll: false
			});
    	},
    	
    	_locale:function(){
    		locale.render();
    	},
    	
    	_renderRegistrationInformation:function(){
    		languageId = locale.current();
    		if(languageId == 1){
    			$("#registration-information-zh").hide();
    			$("#registration-information-en").show();
    		}else if(languageId == 2){
    			$("#registration-information-en").hide();
    			$("#registration-information-zh").show();
    		}
    	},
    	
    	_events:function(){
    		var self = this;
    		
    		$("#lang-zh").click(function(){
    			$("#registration-information-en").hide();
    			$("#registration-information-zh").show();
    		});
    		
    		$("#lang-en").click(function(){
    			$("#registration-information-zh").hide();
    			$("#registration-information-en").show();
    		});
    		
    		$("#rh-ready-items").bind("click",function(){
        		var $rh2 = $("#rh-write-information");
        		var $rb1 = $("#rb-ready-items");
        		var $rb2 = $("#rb-write-information");
        		var $rb3 = $("#rb-finish");
    			if($rb1.css("display") == "none" && $rb2.css("display") == "block" && $rb3.css("display") == "none"){
    				$rb2.css("display","none");
    				$rb1.css("display","block");
    				$rh2.css({background:"url(resources/images/registerS.png) no-repeat 0px -171px",color:"black"});
    				$(this).css({background:"url(resources/images/registerS.png) no-repeat -326px -240px",color:"white"});
    			}
    		});
    		
    		$("#advanced-checkbox").click(function(){
    			if($(this).attr("checked")){
    				$(self.form).find(".rbw-advanced-options").show();
    			}else{
    				$(self.form).find(".rbw-advanced-options").hide();
    			}
    		});
    		
    		$("#vercode").click(function(){
    			self._vercode();
    		});	
    		
    		//这里是用户自定义问题的下拉框选中事件
			$("#register-form-question").change(function() {
				var questionId = $("#register-form-question").val(); 
				if (questionId == 0) {
					$("#user-custom-question").show();
				} else {
					$("#user-custom-question").hide();
					$("#user-custom-question-input").val("");
				}
			});
			
			$("#rbw-security-code").css("color","#999").focus(function(){
    			$(this).val("").css("color","#555").unbind("focus");
			});
			
			$("#rbb-ok").click(function(){
				$("#rb-ready-items").hide();
				$("#rb-write-information").show();
				$("#rh-write-information").css({background:"url(resources/images/registerS.png) no-repeat 0px -242px",color:"#fff"});
				$("#rh-ready-items").css({background:"url(resources/images/registerS.png) no-repeat -325px -171px",color:"#000"});
				$("#rh-ready-items").mouseover(function(){
					$("#rh-ready-items").css("color","#83a82f");
				}).mouseout(function(){
					$("#rh-ready-items").css("color","#000");
				}).click(function(){
					$("#rh-ready-items").css("color","#000").mouseover(function(){
    					$("#rh-ready-items").css("color","#000");
    				});
				});
			}).mouseover(function(){
				$(this).css({background:"url(resources/images/registerS2.png) no-repeat -386px 0px"});
			}).mouseout(function(){
				$(this).css({background:"url(resources/images/registerS.png) no-repeat -386px 0px"});
			});
			
			$("#rbb-no").click(function(){
				window.location.href="./index.html";
			}).mouseover(function(){
				$(this).css({background:"url(resources/images/registerS2.png) no-repeat 0px -44px"}).css("color","#83a82f");
			}).mouseout(function(){
				$(this).css({background:"url(resources/images/registerS.png) no-repeat 0px -44px"}).css("color","#555");
			});
			
			$("#rbfb-get-mail-login").click(function(){
				$("#home-nav-login").trigger("click");
			}).mouseover(function(){
				$(this).css({backgroundColor:"#f0f1f4"}).css("color","#83a82f");
			}).mouseout(function(){
				$(this).css({backgroundColor:"#e6e7ec"}).css("color","#555");
			});
			
			$("#rbfb-again-send-email").click(function(){
				var $this = $(this);
				cloud.Ajax.request({
					url:"api2/organizations?language=" + locale.current(),
					type:"POST",
					dataType:"json",
					data:Object.toJSON(self.requestObj),
					error:function(data){
						if(data.error_code === 20007){
							dialog.render({lang:"email_has_been_sent",buttons:[{lang:"ok",click:function(){dialog.close();window.location = "../";}}]});
						}else{
							dialog.render({lang:data.error_code});
						}
					},
					success: function(data){}
				});
				if($this.hasClass("button-on")){
					$this.removeClass("button-on").addClass("button-out").attr("disabled","disabled");
					var $resend = $("#resend-time");
					function resendTime(){
						var time = $resend.text();
						time = time.substring(1,time.indexOf("）")-1);
						if(time){
							time = parseFloat(time);
							if(time == 0){
								clearInterval(t);
								$this.removeClass("button-out").addClass("button-on").removeAttr("disabled");
								$resend.text("");
							}else{
								$resend.text("（" + (time-1) + locale.get("_seconds") + "）");
							}
						}else{
							$resend.text("（" + 120 + locale.get("_seconds") + "）");
						}
					}
					t = setInterval(function(){resendTime();},1000);
					resendTime();
				}
			}).mouseover(function(){
				$(this).css({backgroundColor:"#41ea3e"});
			}).mouseout(function(){
				$(this).css({backgroundColor:"#5ed45a"});
			});
    		
    		$("body").keydown(function(event){
            	if(!$("#login-input-hide").val() && $("#rb-write-information").attr("style").indexOf("none") == -1){
            		if(event.keyCode == 13 && $(".ui-window-content").length == 0){
            			if(validator.result(self.form)){
            				self._startRegister();
            			}
            		}
            	}
            });
    		
    		$("#submit-btn").bind("click",function(){
    			if(validator.result(self.form) && $(".ui-window-content").length == 0){
    				self._startRegister();
    			}
    		}).mouseover(function(){
    			$(this).css({backgroundColor:"#5ed45a"});
    		}).mouseout(function(){
    			$(this).css({backgroundColor:"#70cb57"});
    		});
    	},
    	_startRegister:function(){
			var self = this;
			var question;
			var email = $("#rbw-email").val();
			var username = $("#rbw-username").val();
			var organName = $("#rbw-organizationname").val();
			var questionId = parseInt($("#register-form-question").val());
			if(questionId != 0){
				question = $("#register-form-question").find("option:selected").text();
			}else{
				question = $("#user-custom-question-input").val();
			}
			var answer = $("#rbw-answer").val();
			var varificationCode = $("#rbw-security-code").val();
			var picId = $("#vercode").attr("picid");
			//var companyemail = $("#rbw-company-email").val(); //屏蔽机构联系邮箱
			var fax = $("#rbw-facsimile").val();
			var website = $("#rbw-website").val();
			var address = $("#rbw-address").val();
			var phone = $("#rbw-phone").val();
			var cellPhone = $("#rbw-mobile-phone").val();
			self.requestObj = {
				email : email,
				username : username,
				name : organName,
				picId : picId,
				varificationCode : varificationCode,
				question : question,
				answer : answer,
				questionId : questionId
			};
			if($("#advanced-checkbox").attr("checked")){
				if(fax){
					self.requestObj.fax = fax;
				}
				if(website){
					self.requestObj.website = website;
				}
				if(address){
					self.requestObj.address = address;
				}
				if(phone){
					self.requestObj.phone = phone;
				}
				if(cellPhone){
					self.requestObj.cellPhone = cellPhone;
				}
			}
			$("body").mask(locale.get({lang:"registering"}));
			cloud.Ajax.request({
				url:"api2/organizations?language=" + locale.current(),
				type:"POST",
				dataType:"json",
				data:Object.toJSON(self.requestObj),
				error:function(data){
					$("body").unmask();
					self._vercode();
					if(data.error_code == 20007){
						if(data.error.indexOf("@") > -1){
							dialog.render({lang:"email_already_exists"});
						}else{
							dialog.render({lang:"organization_already_exists"});
						}
					}else{
						dialog.render({lang:data.error_code});
					}
				},
				success: function(data){
					$("body").unmask();
					$("#rb-write-information").hide();
    				$("#rb-finish").show();
    				$("#rh-write-information").css({background:"url(resources/images/registerS.png) no-repeat 0px -171px",color:"black"});
    				$("#rh-finish").css({background:"url(resources/images/registerS.png) no-repeat 0px -242px",color:"white"});
				}
			});
    	},
    	
    	_vercode : function(){
    		Model.captchas({
        		method:"get",
        		token:false,
        		success: function(data){
        			$("#vercode").attr("src","/api/captchas/" + data._id).attr("picid",data.pictureId);
        		}
        	})
		},
		
    	_renderHeader:function(){
    		var header = new Header({
    			selector:"#common-header"
    		});
    	},
    	
    	_renderNav:function(){
    		var nav = new Nav({
    			selector:"#common-nav",
    			windowElement:"#register",
    			current:2
    		});
    	},
    	
    	_renderFooter:function(){
    		var footer = new Footer({
    			selector:"#common-footer",
    			contentElement:"#register"
    		});
    	}
    	
    });
    
    return Register;
    
});
