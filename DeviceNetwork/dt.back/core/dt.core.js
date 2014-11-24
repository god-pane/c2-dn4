define(function(require){
	
	require("dt/library/prototype.lang");
	require("dt/library/jquery.min");
	require("dt/library/plugins/jquery.loadmask");
	require("dt/library/json2");
	require("dt/config/dt.config");
		
	(function(){
		
		var root = window;
		
		var external;
		
		//调试模式下,纯浏览器环境下使用,虚拟出客户端的所有方法
//		if(!root.external.OnSetInfo){
//		
//			external = {
//					
//					OnSetInfo:function(key,value){
//						dt.cookie.set(key, value);
//					},
//					
//					OnGetInfo:function(key){
//						return dt.cookie.get(key);
//					},
//					
//					OnExit:function(){
//						
//					},
//					
//					OnDownLoadLog:function(){
//						
//					},
//					
//					OnClearLog:function(){
//						
//					},
//					
//					OnSyslog:function(level,Log){
//						
//					},
//					
//					OnViewLog:function(line){
//						
//					},
//					
//					OnStartVPN:function(serverList, ServerIndex, username, password){
//						
//					},
//					
//					OnSetVPNPolicy:function(autoReconnect,autoTryAfterIdle){
//						
//					},
//					
//					OnStopVPN:function(){
//						
//					},
//					
//					OnGetVPNStatus:function(){
//						
//					},
//					
//					OnSiteConnected:function(siteId,siteName,route,vip,portList){
//						
//					},
//					
//					OnSiteDisconnect:function(siteId){
//						
//					},
//					
//					OnGetVComList:function(siteId,controllerId){
//						
//					},
//					
//					OnNetTest:function(siteId){
//						
//					},
//					
//					OnSwitchLanguage:function(){
//						
//					}
//					
//			};
//			
//		}else{
			
			external = root.external;
			
//		}
		
		/**
		 * window.dt
		 */
		var dt = root.dt = {};
		
		//刷新令牌过程中需要用到的参数,判断是否已产生过刷新令牌的动作
		dt.tokenStatus = 0;
		
		//初始化util对象
		dt.util = {};
		
		//秒数转换为00:00:00时长
		dt.util.timeLength = function(s) {
			var s = Math.floor(s);
			var hours = 0, 
				minutes = 0, 
				seconds = 0, 
				temp = 0;
			if(s >= 3600) {
				hours = Math.floor(s / 3600);
				if((hours+"").length < 2) {
					hours = "0"+hours;
				}
				temp = s % 3600;
				if(temp > 60) {
					minutes = Math.floor(temp / 60);
					seconds = temp % 60;
					if((minutes+"").length < 2) {
						minutes = "0"+minutes;
					}
					if((seconds+"").length < 2) {
						seconds = "0"+seconds;
					}
				}
				else {
					minutes = "00";
					seconds = temp;
					if((seconds+"").length < 2) {
						seconds = "0"+seconds;
					}
				}
			}
			else if(s >= 60) {
				hours = "00";
				minutes = Math.floor(s / 60);
				seconds = s % 60;
				if((minutes+"").length < 2) {
					minutes = "0"+minutes;
				}
				if((seconds+"").length < 2) {
					seconds = "0"+seconds;
				}
			}
			else {
				hours = "00";
				minutes = "00";
				seconds = s;
				if((seconds+"").length < 2) {
					seconds = "0"+seconds;
				}
			}
			return hours+":"+minutes+":"+seconds;
		};
		
		//string array convert to array
		//字符串数组转数组
		dt.util.stringToArray = function(str){
			var str = str.replace(/\s|"|'/g,"");
			if(!str || str.length === 2){
				return [];
			}else{
				str = str.substring(1,str.length-1);
				str = "," + str;
				var arr = str.split(",[");
				var newArr = [];
				for(var num = 0;num < arr.length;num++){
					if(arr[num]){
						var _str = arr[num].replace("]","");
						var _arr = _str.split(",");
						newArr.push(_arr);
					}
				}
				return newArr;
			}
		};
		
		//UTC转换为0000:00:00时间
		dt.util.dateFormat = function(date, format) {
			// temporary convert date. exclude it after api fixed the issue.
			date = new Date((date.getTime() * 1000));
			var o = {
				"M+" : date.getMonth() + 1,
				"d+" : date.getDate(),
				"h+" : date.getHours(),
				"m+" : date.getMinutes(),
				"s+" : date.getSeconds(),
				"q+" : Math.floor((date.getMonth() + 3) / 3),
				"S" : date.getMilliseconds()
			};
			if (/(y+)/.test(format)){
				format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
			}
			for ( var k in o){
				if (new RegExp("(" + k + ")").test(format)){
					format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
				}
			}
			return format;
		};
		
		//调试模式下，纯浏览器环境下持久化数据的方法
		dt.cookie = {
				//设置某条cookie
				set:function(name,value,param){
					var cookieContent = name + "=" + value;
					if($.isPlainObject(param)){
						if(param.secure !== false){
							cookieContent += "; secure=" + true;
						}
					}
					root.document.cookie = cookieContent;
				},
				//获取某条cookie
				get:function(name){
					var cookiesContent = root.document.cookie;
					var cookiesContentArr = cookiesContent.split(";");
					for(var num = 0 ; num < cookiesContentArr.length ; num++){
						var item = cookiesContentArr[num];
						var itemArr = item.split("=");
						var _name = itemArr[0];
						var _value = itemArr[1];
						if(_name){
							_name = _name.replace(/\s/g, "");
						}
						if(_value){
							_value = _value.replace(/\s/g, "");
						}
						if(_name === name){
							return _value;
						}
					}
				},
				//清除某条cookie
				remove:function(name){
					var value = this.get(name);
					var date = new Date();
					date.setTime(date.getTime()-10000); 
					this.set(name,value,{expires:date.toGMTString()});
				}
				
		};
		
		//访问令牌的相关方法
		dt.accessToken = (function(){
			return {
				//设置访问令牌
				set:function(value){
					dt.storage.set("access_token",value);
				},
				//获取访问令牌
				get:function(){
					return dt.storage.get("access_token");
				},
				//清除访问令牌
				remove:function(){
					dt.storage.remove("access_token");
				}	
			}
		})();
		
		//刷新令牌的相关方法
		dt.refreshToken = (function(){
			return {
				//设置刷新令牌
				set:function(value){
					dt.storage.set("refresh_token",value);
				},
				//获取刷新令牌
				get:function(){
					return dt.storage.get("refresh_token");
				},
				//清除刷新令牌
				remove:function(){
					dt.storage.remove("refresh_token");
				}
			}	
		})();
		
		//客户端日志的相关方法
		dt.log = {
				//导出客户端日志
				"export":function(){
					external.OnDownLoadLog();
				},
				//清除客户端日志显示界面中的日志信息
				clear:function(){
					external.OnClearLog();
				},
				//添加客户端日志
				add:function(log){
					external.OnSyslog(0," DT ===> " + log);
				},
				//显示客户端日志
				show:function(line){
					var line = line ? line : 0;
					external.OnViewLog(line);
				}
		};
		
		//客户端的相关方法
		dt.client = {};
		
		dt.client._getVersion = function(){
			return external.OnGetVersion();
		};
		
		$.extend(dt.client,{
			//退出客户端
			exit:function(){
				external.OnExit();
				dt.log.add("关闭客户端");
			},
			//切换客户端语言
			switchLanguage:function(lang){
				if(lang == "en"){
					lang = 1;
				}else if(lang == "zh_CN"){
					lang = 0;
				}else{
					lang = 0;
				}
				external.OnSwitchLanguage(lang);
			},
			//设置客户端接入点
			setAccessPoint:function(host){
				host = "http://" + host;
				external.OnSetAccessPoint(host);
			},
			//获取客户端接入点
			getAccessPoint:function(){
				var version = this.getVersion();
				if(version < 1.21){
					return null;
				}else{
					var ap = external.OnGetAccessPoint();
					if(ap){
						return ap;
					}else{
						return undefined;
					}
				}
			},
			//获取客户端版本
			getVersion:function(){
				var version = dt.client._getVersion();
				version = version.substring(1) * 1;
				return version;
			}
		});
		
		//客户端VPN对象
		dt.vpn = {};
		
		//客户端VPN连接server的相关方法
		dt.vpn.client = {
				//客户端连接VPN
				start:function(serverList,serverIndex,username,password){
					external.OnStartVPN(serverList,serverIndex,username,password);
					dt.log.add("启动vpn客户端");
				},
				//客户端断开VPN
				stop:function(){
					external.OnStopVPN();
					dt.log.add("停止vpn客户端");
				},
				//获取客户端的状态
				getStatus:function(){
					return external.OnGetVPNStatus();
					dt.log.add("获取vpn客户端状态");
				},
				//设置客户端的相关配置
				setPolicy:function(autoReconnect, autoTryAfterIdle){
					OnSetVPNPolicy(autoReconnect, autoTryAfterIdle);
					dt.log.add("设置vpn客户端重连机制");
				}
				
		}
		
		//客户端VPN连接现场的相关方法
		dt.vpn.site = {
				//客户端连接现场
				start:function(lpszSiteID,lpszName,lpszRoute,lpszVIP,lpszPortList){
					external.OnSiteConnected(lpszSiteID,lpszName,lpszRoute,lpszVIP,lpszPortList);
					dt.storage.set("site.clientStartStatus", 1);
					dt.log.add("vpn客户端连接现场");
				},
				//客户端中断连接现场
				stop:function(siteId){
					return external.OnSiteDisconnect(siteId);
					dt.log.add("vpn客户端断开现场");
				},
				//获取虚拟串口列表
				getComList:function(){
					return external.OnGetVComList();
					dt.log.add("获取现场虚拟串口列表");
				},
				//测试网络状态
				netTest:function(siteId){
					return external.OnNetTest(siteId);
					dt.log.add("测试网络状态");
				}
		};
		
		//本地数据库的相关方法
		dt.storage = {
				//获取本地数据库的一条记录
				get:function(key){
					var value = external.OnGetInfo(key);
					if($.type(value) === "undefined"){
						return undefined;
					}else{
						value = value.replace(/\s/g,"");
					}
					if(value == "true"){
						value = true;
					}else if(value == "false"){
						value = false;
					}else if(value == "undefined"){
						value = undefined;
					}else if(value == "null"){
						value = null;
					}else if(value.indexOf("{") > -1 || value.indexOf("[") > -1){
						value = JSON.parse(value);
					}else if(!isNaN(value * 1)){
						value = value * 1;
					}else{
						value = value;
					}
//					if(key !== "language"){
//						log.debug("get => key : " + key + " - " + "value : " + value + " : " + $.type(value));
//					}
					return value;
				},
				//设置本地数据库的一条记录
				set:function(key,value){
//					log.debug("set => key : " + key + " - " + "value : " + value + " : " + $.type(value));
					switch($.type(value)){
						case "boolean":
							if(value === true){
								value = "true";
							}else{
								value = "false";
							}
							break;
						case "number":
							value = value;
							break;
						case "string":
							value = value.replace(/\s|{|}|[|]/g,"");
							break;
						case "function":
							value = "function";
							break;
						case "array":
						case "object":
							value = JSON.stringify(value);
							break;
						case "undefined":
							value = "undefined";
							break;
						case "null":
							value = "null";
							break;
						default:
							break;
					}
					external.OnSetInfo(key,value);
				},
				//删除本地数据库的一条记录
				remove:function(key){
					external.OnSetInfo(key,undefined);
				}
		};
		
		//客户端提示
		dt.prompt = function(data){
			var $boxInfo = $("#footer-notice");
			function toPrompt(text){
				var currentText = $boxInfo.text();
				if(currentText != text){
					$boxInfo.text(text);
				}
			}
			if($.isPlainObject(data)){
				if(locale.get({lang: data.error_code})){
					toPrompt(locale.get({lang: data.error_code}));
				}else{
					toPrompt(data.error);
				}
			}else{
				var text = locale.get(data);
				if(text){
					toPrompt(text);
				}else{
					toPrompt(data);
				}
			}
		};
		
		//获取客户端提示内容
		dt.getPrompt = function(){
			return $("#footer-notice").text();
		};
		
		//mask方法
		dt.mask = function(element){
			$(element).mask(locale.get("loading"));
		};
		
		//取消mask方法
		dt.unmask = function(element){
			if(!element){
				$("*").unmask();
			}else{
				$(element).unmask();
			}
		};
		
		//ajax的方法
		dt.ajax = function(obj){
			
			var ajaxObj = {};
			
			ajaxObj.type = (obj.type).toUpperCase();
			
			ajaxObj.url = obj.url;
			
			if(obj.param){
				_param = $.param(obj.param);
				ajaxObj.url = ajaxObj.url + "?" + _param;
			}
			
			if(!(obj.token && obj.token === false)){
				if(ajaxObj.url.indexOf("?") === -1){
					ajaxObj.url = ajaxObj.url + "?dt=" + Math.random() + "&access_token=" + dt.accessToken.get();
				}else{
					ajaxObj.url = ajaxObj.url + "&dt=" + Math.random() +"&access_token=" + dt.accessToken.get();
				}
			}
			
			if(obj.data){
				ajaxObj.data = JSON.stringify(obj.data);
			}
			
			if(obj.dataType){
				ajaxObj.dataType = obj.dataType;
			}else{
				ajaxObj.dataType = "json";
			}
			
			if(obj.timeout){
				ajaxObj.timeout = obj.timeout;
			}else{
				ajaxObj.timeout = "20000";
			}
			
			if(obj.contentType){
				ajaxObj.contentType = obj.contentType;
			}else{
				ajaxObj.contentType = "application/json;charset=UTF-8";
			}
			
			if(obj.async === false){
				ajaxObj.async = false;
			}else{
				ajaxObj.async = true;
			}
			
			var success  = function(data){
				
			};
			
			if(obj.success){
				
				ajaxObj.success = function(data){
					if(!data || !$.isPlainObject(data)){
						dt.unmask();
						return;
					}
					if(data.error){
						if(data.error_code == 21305 || data.error_code == 21332 || data.error_code == 21333){
							if(_dt){
								_dt.logout();
							}else{
								dt.accessToken.remove();
								dt.refreshToken.remove();
								dt.storage.set("startClient",false);
								location.href = "./index.html";
							}
						}else if(data.error_code == 21327 || data.error_code == 21334 || data.error_code == 21335 || data.error_code == 21336){
							if(dt.tokenStatus == 0){
								dt.tokenStatus = 1;
								dt.____reset = function(){
									dt.ajax({
										url: "/oauth2/access_token",
										timeout:1000,
										type: "POST",
										async:false,
										contentType:"application/x-www-form-urlencoded; charset=UTF-8",
										param:{
											client_id: CONFIG.oauth.client_id,
											client_secret: CONFIG.oauth.client_secret,
											grant_type: "refresh_token",
											refresh_token:dt.refreshToken.get()
										},
										success: function(data) {
											dt.tokenStatus = 0;
											dt.accessToken.set(data.access_token);
											dt.refreshToken.set(data.refresh_token);
										},
										error:function(error){
											dt.tokenStatus = 2;
										}
									});
								}
								setTimeout("dt.____reset()",1000);
							}else if(dt.tokenStatus == 2){
								if(_dt){
									_dt.logout();
								}else{
									dt.accessToken.remove();
									dt.refreshToken.remove();
									dt.storage.set("startClient",false);
									location.href = "./index.html";
								}
							}
						}else{
							dt.prompt(data);
							if(obj.error){
								obj.error(data);
							}
						}
						dt.unmask();
					}else{
						obj.success(data);
					}
					
				};
				
			}
			
			ajaxObj.error = function(XMLHttpRequest, textStatus, errorThrown){
				 	var error = {
	                		request:XMLHttpRequest,
	                		status:textStatus,
	                		thrown:errorThrown
	                };
					if(error.status && (error.status != "abort")){
						if(error.status == "timeout"){
							dt.prompt("network_timeout");
						}else{
							if(error.request.readyState !== 0){
								dt.prompt("network_error");
							}
						}
					}
				dt.unmask();
			}
			
			jQuery.ajax(ajaxObj);
			
		};
		
		//md5的方法
		dt.md5 = (function(str) {
			
			var hex_chr = "0123456789abcdef";

			function rhex(num) {
				str = "";
				for ( var j = 0; j <= 3; j++) {
					str += hex_chr.charAt((num >> (j * 8 + 4)) & 15)+ hex_chr.charAt((num >> (j * 8)) & 15);
				}
				return str;
			}

			function str2blks_MD5(str) {
				nblk = ((str.length + 8) >> 6) + 1;
				blks = new Array(nblk * 16);
				for ( var i = 0; i < nblk * 16; i++) {
					blks[i] = 0;
				}
				for (i = 0; i < str.length; i++) {
					blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
				}
				blks[i >> 2] |= 128 << ((i % 4) * 8);
				blks[nblk * 16 - 2] = str.length * 8;
				return blks;
			}

			function add(x, y) {
				var lsw = (x & 65535) + (y & 65535);
				var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
				return (msw << 16) | (lsw & 65535);
			}

			function rol(num, cnt) {
				return (num << cnt) | (num >>> (32 - cnt));
			}

			function cmn(q, a, b, x, s, t) {
				return add(rol(add(add(a, q), add(x, t)), s), b);
			}

			function ff(a, b, c, d, x, s, t) {
				return cmn((b & c) | ((~b) & d), a, b, x, s, t);
			}

			function gg(a, b, c, d, x, s, t) {
				return cmn((b & d) | (c & (~d)), a, b, x, s, t);
			}

			function hh(a, b, c, d, x, s, t) {
				return cmn(b ^ c ^ d, a, b, x, s, t);
			}

			function ii(a, b, c, d, x, s, t) {
				return cmn(c ^ (b | (~d)), a, b, x, s, t);
			}

			function MD5(str) {
				x = str2blks_MD5(str);
				var a = 1732584193;
				var b = -271733879;
				var c = -1732584194;
				var d = 271733878;
				for ( var i = 0; i < x.length; i += 16) {
					var olda = a;
					var oldb = b;
					var oldc = c;
					var oldd = d;
					a = ff(a, b, c, d, x[i + 0], 7, -680876936);
					d = ff(d, a, b, c, x[i + 1], 12, -389564586);
					c = ff(c, d, a, b, x[i + 2], 17, 606105819);
					b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
					a = ff(a, b, c, d, x[i + 4], 7, -176418897);
					d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
					c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
					b = ff(b, c, d, a, x[i + 7], 22, -45705983);
					a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
					d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
					c = ff(c, d, a, b, x[i + 10], 17, -42063);
					b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
					a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
					d = ff(d, a, b, c, x[i + 13], 12, -40341101);
					c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
					b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
					a = gg(a, b, c, d, x[i + 1], 5, -165796510);
					d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
					c = gg(c, d, a, b, x[i + 11], 14, 643717713);
					b = gg(b, c, d, a, x[i + 0], 20, -373897302);
					a = gg(a, b, c, d, x[i + 5], 5, -701558691);
					d = gg(d, a, b, c, x[i + 10], 9, 38016083);
					c = gg(c, d, a, b, x[i + 15], 14, -660478335);
					b = gg(b, c, d, a, x[i + 4], 20, -405537848);
					a = gg(a, b, c, d, x[i + 9], 5, 568446438);
					d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
					c = gg(c, d, a, b, x[i + 3], 14, -187363961);
					b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
					a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
					d = gg(d, a, b, c, x[i + 2], 9, -51403784);
					c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
					b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
					a = hh(a, b, c, d, x[i + 5], 4, -378558);
					d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
					c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
					b = hh(b, c, d, a, x[i + 14], 23, -35309556);
					a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
					d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
					c = hh(c, d, a, b, x[i + 7], 16, -155497632);
					b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
					a = hh(a, b, c, d, x[i + 13], 4, 681279174);
					d = hh(d, a, b, c, x[i + 0], 11, -358537222);
					c = hh(c, d, a, b, x[i + 3], 16, -722521979);
					b = hh(b, c, d, a, x[i + 6], 23, 76029189);
					a = hh(a, b, c, d, x[i + 9], 4, -640364487);
					d = hh(d, a, b, c, x[i + 12], 11, -421815835);
					c = hh(c, d, a, b, x[i + 15], 16, 530742520);
					b = hh(b, c, d, a, x[i + 2], 23, -995338651);
					a = ii(a, b, c, d, x[i + 0], 6, -198630844);
					d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
					c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
					b = ii(b, c, d, a, x[i + 5], 21, -57434055);
					a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
					d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
					c = ii(c, d, a, b, x[i + 10], 15, -1051523);
					b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
					a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
					d = ii(d, a, b, c, x[i + 15], 10, -30611744);
					c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
					b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
					a = ii(a, b, c, d, x[i + 4], 6, -145523070);
					d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
					c = ii(c, d, a, b, x[i + 2], 15, 718787259);
					b = ii(b, c, d, a, x[i + 9], 21, -343485551);
					a = add(a, olda);
					b = add(b, oldb);
					c = add(c, oldc);
					d = add(d, oldd);
				}
				return rhex(a) + rhex(b) + rhex(c) + rhex(d);
			}

			if (!String.prototype.md5) {
				String.prototype.md5 = function() {
					return MD5(this).toUpperCase();
				};
			}
			
			return function(str){
				return MD5(str).toUpperCase();
			};
			
		})();
		
		/**
		 * window.Class
		 */
		//创建类的方法
		var Class = root.Class = {
				create:function(obj){
					function _Class(){};
					_Class.prototype = obj;
					function __Class(opt){
						var _instance = new _Class();
						if(_instance.initialize instanceof Function){
							_instance.initialize(opt);
						}
						return _instance;
					}
					return __Class;
				}
		}
		
	})(window)
	
})