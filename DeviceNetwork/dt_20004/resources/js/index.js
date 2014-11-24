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
	var EMAIL = ["inhand.com.cn","126.com","163.com","qq.com","sina.com","hotmail.com","gmail.com","sohu.com","139.com","189.cn","wo.com.cn"];
    var index = {
		setEvent: function() {//设置事件
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
            this.$username.bind("keyup",self.checkfn.bind(self))
//                .bind("focus",self.checkfn.bind(self))
                .bind("blur",self.blurfn.bind(self));

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
		isContain: function(collection, subcollection) {//权限
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
		differenceSet: function(a, b) {//权限
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
		login: function() {//登录
			var isSuccess = this.validate();
			if(!isSuccess) {
				return ;
			}
			var self = this;
			var email = self.getValue($("#userEmail"));
			var userVerCode=self.getValue($("#text-identifying-code"));
			var password = self.getValue($("#userPassword"));
            var param = {
                client_id: CONFIG.oauth.client_id,
                client_secret: CONFIG.oauth.client_secret,
                grant_type: "password",
                username: email,
                password: "",
                language: locale.current(),
                picId:self.code,
                varificationCode:userVerCode,
                password_type:""
            }
            if(this.failedTimes<=2){
                delete param.varificationCode;
                delete param.picId;
                param.password_type="2";
                param.password=dt.md5(password);
            }else{
                param.password_type="3";
                param.password=dt.md5(dt.md5(password)+self.code);
            }

			dt.ajax({
				url: "/oauth2/access_token",
				timeout:1000,
				type: "POST",
				contentType:"application/x-www-form-urlencoded; charset=UTF-8",
				param: param,
				success: function(data) {
					dt.accessToken.set(data.access_token);
					dt.refreshToken.set(data.refresh_token);
					
					dt.ajax({
						url: "/oauth2/get_token_info",
						type: "get",
						success: function(data) {

                            if(self.checkboxInput[0].checked == true){
                                self.setCookie(email,password,30);
                            }else{
                                self.setCookie(null,null,false);
                            }

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
                    self.failedTimes++;
                    if(self.failedTimes>2){
                        self.veriyCodeLine.show();

                        self.resizeLoginBox(true);
                        self.getCaptchasPic($("#login-identifying-code"));
                    }
				}
			});
		},
		getCaptchasPic: function($dom) {//获取验证码的图片
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
		getValue: function($dom) {//获取验证码的值
			return $dom.val();
		},
		getUserInfo: function() {//获取用户信息
			return {
				email: this.getValue($("#userEmail")),
				password: this.getValue($("#userPassword")),
				code: this.getValue($("#text-identifying-code"))
			};
		},
		validate: function($dom) {//验证登录信息
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
			if(self.failedTimes>2 && code === "") {
				this.pointbox.html(locale.get({lang: "verification_code_cannot_be_empty"}));
				return false;
			}
			else if(self.failedTimes>2 && code.length != 5) {
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
                'margin-top': "5px",
				height: "20px",
				width:"auto",
				"z-index": 1,
				left: pos.left+"px",
				top: (pos.top-22)+"px",
				"font-size": "12px",
				"line-height": "20px",
				color: "red"
			}).appendTo($(".login-account-info"));
		},
		defaultSettings:function(){
            this.veriyCodeLine = $("#login-identifying").hide();
            this.checkboxInput = $("#login-remember-me");
            this.$current = $();
            this.$username = $("#userEmail");
            this.$password = $("#userPassword");
            this.$listContainer = $("<ul id='email-auto-completion'>").addClass("email-auto-completion").appendTo(this.$username.parent()).hide();
            var obj = this.getCookie();
            if(obj.username && obj.password){
                this.setLoginInfo(obj.username,obj.password);
                this.checkboxInput[0].checked = true;
            }
		},

        setLoginInfo:function(username,password){
            if(username || username == ""){
                this.$username.val(username);
            }
            if(password || password == ""){
                this.$password.val(password);
            }
        },

		setAccessPoint:function(){//设置登录接入点
			var self = this;
			$(function(){
				
				var map = CONFIG["accessPoint"];
				var $box = $("#accesspoint-select");
				var $select = $("<select></select>").attr("id","access-point");
				var accessPoint = null;

				if(dt.client.getAccessPoint()){
					var _accessPoint = dt.client.getAccessPoint();
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

                if(!dt.util.inArray(accessPoint,map)){
                    $("<option></option>").val("custom").text(accessPoint).appendTo($select).attr("selected","selected");
                }

                $("<option></option>").val("other").text("other").appendTo($select);

				$box.append($select);

                var $input = self.addInput($box,$select);

				$("#access-point").die("change").live("change",function(){
                    var value = $(this).val()
                    //c2平台或g平台
                    if(value != "other" && value != "custom"){
					    dt.client.setAccessPoint(CONFIG["accessPoint"][value]);
                    }else if(value == "custom"){
                        dt.client.setAccessPoint(accessPoint);
                    }else{
                        $select.hide();
                        $input.show();
                    }
				});
				
			});
			
		},

        addInput:function($container,$select){
            var $box = $("<div></div>");
            var $btns = $("<div class='access-point-btns'></div>").appendTo($box);
            var $input = $("<input type='text' id='access-point-input'>").appendTo($box);
            var $cancel = $("<div id='access-point-cancel' class='access-point-btn'></div>").appendTo($btns);
            var $ok = $("<div id='access-point-ok' class='access-point-btn'></div>").appendTo($btns);

            function submit(){
                var url = new RegExp(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);
                var ip = new RegExp(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/);
                var value = $input.val();
                if(url.test(value) || ip.test(value)){
                    dt.client.setAccessPoint(value);
                    CONFIG["accessPoint"].push(value);
                }else{
                    alert("无效的IP或域名");
                }
            }
            $ok.click(submit);
            $input.on("keypress",function(e){
                if(e.keyCode==13){
                    submit();
                }
            });

            $cancel.click(function(){
               $box.hide();
               $select.show();
            });
            $container.append($box);
            $box.hide();
            return $box;

        },
        /**
         *   缩放登录框
         *  @param flag  true--> big , false--> small
         */
        resizeLoginBox:function(flag){
            var lack = 50
            var $box = $(".login-box-info");
            var $account = $(".login-account-info");

            if(flag){
                $box.height(280+lack);
                $account.height(185+lack);
            }else{
                $box.height(280);
                $account.height(185);
            }
        },
        /**
         *     设置cookie,days为false则清空
         * @param username
         * @param password
         * @param days
         */
        setCookie:function(username,password,days){
            if(!days){
                 var date = new Date("1970-1-1 00:00.000");
            }else{
                var date = new Date();
                date.setDate(date.getDate() + days);
            }
            document.cookie="user_name="+username+";expires=" + date.toGMTString();
            document.cookie="pass_word="+password+";expires=" + date.toGMTString();
        },
        /**
         *
         * @returns {{
         *      username:""
         *      password:""
         *  }}
         */
        getCookie:function(){
            var obj={};
            var cookieStr=document.cookie;
            if(cookieStr){
                var cookieArr=cookieStr.split(";");
                $.each(cookieArr,function(n,value){
                    if(value.indexOf('user_name')!=-1){
                        var arr=value.split("=");
                        obj.username=arr[1];
                    }else if(value.indexOf('pass_word')!=-1){
                        var arr=value.split("=");
                        obj.password=arr[1];
                    }
                });
            }
            return obj;
        },
        /**
         *   设置li元素事件
         * @param $el  $DOM <li>
         * @param cookie  {
         *                      username:"",
         *                      password:""
         *                  }
         */
        liMouseEvent:function($el,cookie){
            var self = this;

            $el.bind("mousedown",function(e){
                var email = $(this).text();
                if(email == cookie.username){
                    self.setLoginInfo(cookie.username,cookie.password);
                    self.checkboxInput[0].checked = true;
                }else{
                    self.setLoginInfo(email,null);
                }
            }).bind("mouseover",function(e){
                $(".li-mouseover-style").removeClass("li-mouseover-style");
                    self.$current = $(this).addClass("li-mouseover-style");
            }).bind("mouseout",function(e){
                $(this).removeClass("li-mouseover-style");
            });
        },

        keyEvent:function(e,cookie){
            var $liArr = this.$listContainer.children();
            if(e.keyCode == "40"){//downkey
                if(this.$current.length){//someone selecet
                    this.$current.removeClass("li-mouseover-style");//remove this class
                    if(this.$current[0]==$liArr.last()[0]){//is last, add first
                        this.$current = $liArr.first().addClass("li-mouseover-style");
                    }else{//not last, add next
                        this.$current =  this.$current.next().addClass("li-mouseover-style");
                    }
                }else{//none
                    this.$current = $liArr.first().addClass("li-mouseover-style");
                }
            }else if(e.keyCode == "38"){//upkey
                if(this.$current.length){//someone selecet
                    this.$current.removeClass("li-mouseover-style");//remove this class
                    if(this.$current[0]==$liArr.first()[0]){//is first, add last
                        this.$current = $liArr.last().addClass("li-mouseover-style");
                    }else{//not first, add next
                        this.$current = this.$current.prev().addClass("li-mouseover-style");
                    }
                }else{//none
                    this.$current = $liArr.last().addClass("li-mouseover-style");
                }
            }else if(e.keyCode == "13"){//enter
                if(this.$current.length){
                    if(this.$current.text() == cookie.username){
                        this.setLoginInfo(cookie.username,cookie.password);
                        this.checkboxInput[0].checked = true;
                    }else{
                        this.setLoginInfo(this.$current.text(),"");
                    }
                    this.blurfn();
                }else{
                    return;
                }
            }
        },


        checkfn:function(e){
            var self = this;
            var obj = this.getCookie();
            if(this.$listContainer.css("display")!="none"){
                if(e.keyCode == "40" || e.keyCode == "38" || e.keyCode == "13"){
                    e.preventDefault();
                    this.keyEvent(e,obj);
                    return;
                }else if(e.keyCode == "37" || e.keyCode == "39"){
                    return
                }
                e.stopPropagation();
            }
            this.$listContainer.empty();
            this.$current = $();
            var mailText="";
            var inputText = this.$username.val();
            var atIndex = inputText.lastIndexOf("@");
            if(atIndex != -1){//有@
                mailText = inputText.substring(atIndex + 1);
                var nameText = inputText.substring(0,atIndex+1);
            }else{//没@
                nameText= inputText;
            }
            var regex=new RegExp("^("+mailText+")");
            $.each(EMAIL,function(index,mail){
                if(regex.test(mail)){
                    if(nameText.substring(nameText.length-1) == "@"){
                        var fullEmail = nameText + mail;
                    }else{
                        var fullEmail = nameText + "@" + mail;
                    }
                    var $li = $("<li>").text(fullEmail).attr('title',fullEmail).appendTo(self.$listContainer);
                    self.liMouseEvent($li,obj);
                }
            });
            //show listContainer or not
            if(this.$listContainer.children().size() > 0 && this.$username.val() != ""){
                this.$listContainer.show();
            }else{
                this.$listContainer.hide();
            }

        },

        blurfn:function(){
            this.$listContainer.hide();
            this.$current = $();
        },
		init: function() {//初始化首页
			if(dt.storage.get("language") != "en" && dt.storage.get("language") != "zh_CN"){
				dt.storage.set("language","zh_CN");
			}
            window.getCookie = this.getCookie;//debug
            this.failedTimes=0;
			dt.client.switchLanguage(dt.storage.get("language"));
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