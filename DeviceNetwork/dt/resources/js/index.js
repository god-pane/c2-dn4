var configCode = [
	                 1,  2,  3,  4,  5,  6,  7,  8,  9,  10,
	                 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
	                 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
	                 31, 32,         35, 36, 37, 38, 39, 40, 
	                 41, 42, 43,     45, 46, 47, 48, 49, 50, 
	                 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
	                 61, 62, 63,     65,     67, 68, 69, 70, 
	                 71, 72, 73,     75, 76, 77,     79, 80, 
	                 81,     83, 84, 85, 86, 87, 88, 89, 90, 
	                 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
	                 101,102, 456, 457
	             ];

define(function(require){
	require("dt/core/dt");
	var index = {
		setEvent: function() {
			var self = this;
			$("#login-button").click(function() {
				self.login();
			});
			$("#text-identifying-code").on("keypress", function(e) {
				var evt = window.event || e;
				if(evt.keyCode == 13) {
					self.login();
				}
			});
			var $en = $("#en");
			var $zh_cn = $("#zh-cn");
			if(dt.storage.get("language") == "zh_CN"){
				$en.removeClass("mouseClicked");
				$zh_cn.addClass("mouseClicked");
			}else if(dt.storage.get("language") == "en"){
				$zh_cn.removeClass("mouseClicked");
				$en.addClass("mouseClicked");
			}
			$zh_cn.click(function(){
					$("#en").removeClass("mouseClicked");
					$(this).addClass("mouseClicked");
					dt.storage.set("language","zh_CN");	
					dt.client.switchLanguage("zh_CN");
					locale.set({lang:"zh_CN"});
			});
			$en.click(function(){
					$(this).addClass("mouseClicked");
					$("#zh-cn").removeClass("mouseClicked");
					dt.storage.set("language","en");
					dt.client.switchLanguage("en");
					locale.set({lang:"en"});
			});
			
			$("#create-acount").click(function(){
				window.open("http://" + dt.storage.get("accessPoint") + "/DeviceNetwork/www/register.html");
				return;
			});
			
			$("#forgot-password").click(function(){
				window.open("http://" + dt.storage.get("accessPoint") + "/DeviceNetwork/www/index.html");
				return;
			});
			
			$("#access_port").on("change", function() {
				var index = $(this).get(0).selectedIndex
				var url = $(this).children().eq(index).html();
				window.location.href = "http://"+url;
				
			});
		},
//		clickLogin: function() {
//			var self = this;
//			var isSuccess = self.validate();
//			if(isSuccess) {
//				dt.ajax({
//					url: "/api/captchas",
//					type: "POST",
//					timeout:1000,
//					data:{
//						pictureId: self.code,
//						code: self.getValue($("#text-identifying-code"))
//					},
//					success: function(data) {
//						if(typeof data.result === "string") {
//							self.login();
//						} 
//						else{
//							dt.ajax({
//								url:"/api/captchas?r="+Math.random(),
//								type:"GET",
//								success: function(data) {
//									$("#login-identifying-code").css("background-image", "url(/api/captchas/"+data._id+")");
//									self.code = data.pictureId;
//								},
//								token:false
//							});
//							self.pointbox.html(locale.get({lang: "identifying_code_error"}));
//						}
//					},
//					error:function(xmlHttpRequest, error){
//						self.pointbox.html(locale.get({lang: "network_error"}));
//					}
//					,
//					token:false
//				});
//			}
//		},
		isContain: function(collection, subcollection) {
			var len = subcollection.length,
        		count = 0;
        	for(var i = 0 ; i < len ; i++) {
        		if($A(collection).indexOf(subcollection[i]+"") > -1) {
        			count++;
        		}
        	}
        	if(count >= len) {
        		return true;
        	} else {
        		return false;
        	}
		},
		differenceSet: function(a, b) {
			var arr = [];
			for(var i = 0 ; i < a.length ; i++) {
				var flag = true;
				for(var j = 0 ; j < b.length ; j++) {
					if(a[i] == b[j]) {
						flag = false;
						continue;
					}
				}
				if(flag) {
					arr.push(a[i]);
				}
			}
			return arr;
		},
		login: function() {
			var isSuccess = this.validate();
			if(!isSuccess) {
				return ;
			}
			var self = this;
			var email = self.getValue($("#userEmail"));
			var userVerCode=self.getValue($("#text-identifying-code"));
			var password = dt.md5(self.getValue($("#userPassword")))+self.code;
			dt.ajax({
				url: "/oauth2/access_token",
				timeout:1000,
				type: "POST",
				contentType:"application/x-www-form-urlencoded; charset=UTF-8",
				param: {
					client_id: CONFIG.oauth.client_id,
					client_secret: CONFIG.oauth.client_secret,
					grant_type: "password",
					username: email,
					password: dt.md5(password),
					language: locale.current(),
					picId:self.code,
					varificationCode:userVerCode
				},
				success: function(data) {
					dt.accessToken.set(data.access_token);
					dt.refreshToken.set(data.refresh_token);
					
					dt.ajax({
						url: "/oauth2/get_token_info",
						type: "get",
						success: function(data) {
							var licenseCode = null;
							if(data.privileges) {
								if(data.privileges["default"] == "all") {
									licenseCode = configCode.join(",").split(",");
								}
								else if(data.privileges.deny.length > 0){
									licenseCode = self.differenceSet(configCode, data.privileges.deny.join(",").split(","));
								}
								else {
									licenseCode = data.privileges.accept.join(",").split(",");
								}
								if(self.isContain(licenseCode, ['53', '54', '55', '56'])) {
									location.href = "./list.html";
									dt.storage.set("username",email);
								}
								else {
									self.pointbox.html(locale.get({lang: "not_the_current_user_permissions"}));
								}
							}
							else {
								self.pointbox.html(locale.get({lang: "not_the_current_user_permissions"}));
							}
						}
					});
					
				},
				error:function(error){
					if(error.error_code == 21306 || error.error_code == 20002 || error.error_code == 20013 || error.error_code == 21302){
						self.getCaptchasPic($("#login-identifying-code"));
					}
					self.pointbox.html(locale.get({lang: error.error_code}));
				}
			});
		},
		getCaptchasPic: function($dom) {
			var self = this;
			$dom.click(function() {
				dt.ajax({
					url:"/api/captchas?r="+Math.random(),
					type:"GET",
					success: function(data) {
						$dom.css("background-image", "url(/api/captchas/"+data._id+")");
						self.code = data.pictureId;
					},
					token:false
				});
			});
			dt.ajax({
				url:"/api/captchas?r="+Math.random(),
				type:"GET",
				success: function(data) {
					$dom.css("background-image", "url(/api/captchas/"+data._id+")");
					self.code = data.pictureId;
				},
				token:false
			});
		},
		getValue: function($dom) {
			return $dom.val();
		},
		getUserInfo: function() {
			return {
				email: this.getValue($("#userEmail")),
				password: this.getValue($("#userPassword")),
				code: this.getValue($("#text-identifying-code"))
			};
		},
		validate: function($dom) {
			var email = this.getValue($("#userEmail"));
			var password = this.getValue($("#userPassword"));
			var code = this.getValue($("#text-identifying-code"));
			//var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
			var myreg = /^admin$|^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(email == "") {
				this.pointbox.html(locale.get({lang: "the_user_name_cannot_be_empty"}));
				return false;
			}
			else if(!myreg.test(email)) {
				this.pointbox.html(locale.get({lang: "the_user_mail_format_error"}));
				return false;
			}
			if(password == "") {
				this.pointbox.html(locale.get({lang: "password_can_not_be_empty"}));
				return false;
			}
			if(code === "") {
				this.pointbox.html(locale.get({lang: "verification_code_cannot_be_empty"}));
				return false;
			}
			else if(code.length != 5) {
				this.pointbox.html(locale.get({lang: "verification_code_length_error"}));
				return false;
			}
			this.pointbox.html("");
			return true;
		},
		pointOut: function() {
			var pos = document.getElementById("login-button").getBoundingClientRect();
			this.pointbox = $("<div></div>").css({
				border: "0px solid red",
				position:"absolute",
				height: "20px",
				width:"auto",
				"z-index": 1,
				left: pos.left+"px",
				top: (pos.top-22)+"px",
				"font-size": "12px",
				"line-height": "20px",
				color: "red"
			}).appendTo($(".mainbox"));
		},
		defaultSettings:function(){
		},
		setAccessPoint:function(){
			
			$(function(){
				
				var map = CONFIG["accessPoint"];
				var $box = $("#accesspoint-select");
				var $select = $("<select></select>").attr("id","access-point");
				var accessPoint = null;
				
				if(dt.client.getAccessPoint()){
					_accessPoint = dt.client.getAccessPoint();
					accessPoint = _accessPoint.replace("http://","");
				}else{
					accessPoint = location.host;
				}
				
				for(var num = 0 ; num < map.length ; num++){
					if(accessPoint == map[num]){
						var $option = $("<option></option>").val(num).text(map[num]).attr("selected","selected");
					}else{
						var $option = $("<option></option>").val(num).text(map[num]);
					}
					$select.append($option);
				}
				
				$box.append($select);
				
				$("#access-point").die("change").live("change",function(){
					dt.client.setAccessPoint(CONFIG["accessPoint"][$(this).val()]);
				});
				
			});
			
		},
        //add by zyl
        setcustomerInfo:function(){
            var flag = location.host;
//            var debugurl = true;//true="jsjinxin" false="inhand"
            if(flag == "c2.inhandnetworks.com" || flag == "g2.inhandnetworks.com" /*|| !debugurl*/){
                $(".dt-title-box").attr("lang","text:welecome_to_device_touch_service");
                $(".icon-logo").css("background-image","url(./resources/images/logo.png)");
                $(".copyright-info").html("Copyright@ 2013.<br/> Designed by InHandNetworks");
                $(".mainbox .middlebox").css("background-image","url(./resources/images/bg.jpg)");
            }else if(flag =="jsjinxin.f3322.org" /*|| debugurl*/){
                $(".config-container").hide();
                $(".dt-title-box").remove();
                $(".icon-logo").remove();
                $("<img src='./resources/images/jinxin-name.png' class='.dt-title-box'>").prependTo($(".config-container")).css({
                    "height":"39px",
//                    "border":"solid 1px",
                    "width":"400px",
                    "float":"left"
                });
                $("<img src='./resources/images/jinxin-logo.jpg' class='.icon-logo'>").prependTo($(".bottombox")).css({
                    width:"105px",
                    height:"70px"
//                    "border":"solid 1px"
                });
                $(".mainbox .middlebox").css({
                    "background-image":"url(./resources/images/jinxin-bg.jpg)",
                    "background-size": "800px 424px"
                })
            }
        },
        //add end
		
		init: function() {
			if(dt.storage.get("language") != "en" && dt.storage.get("language") != "zh_CN"){
				dt.storage.set("language","zh_CN");
			}
			dt.client.switchLanguage(dt.storage.get("language"));
            this.setcustomerInfo();
			this.setAccessPoint();
			this.defaultSettings();
			this.pointOut();
			this.getCaptchasPic($("#login-identifying-code"));
			this.setEvent();
			locale.render();
		}
	};
	
	index.init();
	
});