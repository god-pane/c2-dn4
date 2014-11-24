/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author PANJC
 */
define([
        "cloud/base/model.structure",
        "cloud/lib/jquery",
        "cloud/lib/prototype.lang",
        "cloud/components/dialog",
        "cloud/base/_config"
        ],function(
        		_structure,
        		_jquery,
        		_prototye,
        		dialog,
        		_config
        ){
	
	var root = window;
	
	Model = root.Model = (root.Model||{});
	
	var _ = Model._;
	
	var structure = Model.structure;
	
	var config = CONFIG;
	
	var prompt = (function(){
		var prompt = config["dialog"]["module"];
		return {
			show:function(content,buttons){
				var obj = {lang:content};
				if(buttons){
					obj.buttons = [{lang:buttons[0],click:buttons[1]}];
					obj.close = buttons[1];
				}
				prompt.render(obj);
			},
			close:function(){
				prompt.close();
			}
		}
	})();
	
	var error = {
		token:{
			queue:[],
			number:0,
			cachedTime:config["ajax"]["cacheTime"]
		}
	}
	
	var requestStructure = {
			
			method:[true,_.string],
			data:[false,_.object],
			param:[false,_.object],
			part:[false,_.string],
			async:[false,_.boolean],
			success:[false,_["function"]],
			error:[false,_["function"]],
			timeout:[false,_.object]
	
	};
	
	var method = {
			
			checkType:function(data,type){
				
				var checkType = function(type){
				
					switch(type){
						case _.string:
							if(typeof data === "string" && data.search(/^[\s]+$/) === -1){
								return true;
							}else{
								return false;
							}
							break;
						case _.number:
							if(typeof data === "number"){
								return true;
							}else{
								return false;
							}
							break;
						case _.object:
							if(typeof data === "object" && data instanceof Object){
								if(Object.prototype.toString.call(data) === '[object Array]'){
									return false;
								}else{
									return true;
								}
							}else{
								return false;
							}
							break;
						case _.array:
							if(data instanceof Array){
								return true;
							}else{
								return false;
							}
							break;
						case _.boolean:
							if(typeof data === "boolean"){
								return true;
							}else{
								return false;
							}
							break;
						case _["function"]:
							if(data instanceof Function){
								return true;
							}else{
								return false;
							}
							break;
						case _.empty:
							if(data.search(/^[\s]+$/) !== -1){
								return true;
							}else{
								return false;
							}
							break;
						case null:
							if(data === null){
								return true;
							}else{
								return false;
							}
							break;
						case undefined:
							if(data === undefined){
								return true;
							}else{
								return false;
							}
							break;
					}
				
				}
				
				var returnedResult = false;
				
				if($.isArray(type) === true){
					var _returnedResult = false;
					for(var num = 0;num < type.length;num++){
						_returnedResult = checkType(type[num]) || _returnedResult;
					}
					returnedResult = _returnedResult || returnedResult;
				}else{
					returnedResult = checkType(type) || returnedResult;
				}
				
				return returnedResult;
				
			},
			
			checkRequired:function(data,required){
				if(required === false){
					return "optional";
				}else if(required === true){
					if(data === undefined){
						return "fail";
					}else{
						return "pass";
					}
				}
			},
			
			checkOption:function(data,validationArr,info){
				
				var checkRequiredResult = this.checkRequired(data,validationArr[1][0]);
				var checkTypeResult = this.checkType(data,validationArr[1][1]);
				
				if(checkRequiredResult === "fail"){
					this.throwError({url:info.url,info:"field \'" + validationArr[0] + "\' is required"});
					return false;
				}else if(checkRequiredResult === "pass"){
					if(checkTypeResult === false){
						this.throwError({url:info.url,info:"field \'" + validationArr[0] + "\' must be the " + validationArr[1][1]});
						return false;
					}else{
						return true;
					}
				}else if(checkRequiredResult === "optional"){
					if(data){
						if(checkTypeResult === false){
							this.throwError({url:info.url,info:"field \'" + validationArr[0] + "\' must be " + validationArr[1][1]});
							return false;
						}else{
							return true;
						}
					}else{
						return true;
					}
				}
				
			},
			
			checkObject:function(data,arr,info){
				
				var filed = arr[0];
				var obj = arr[1];
				
				if(data === undefined){
					if(obj._required === true){
						this.throwError({url:info.url,info:"\n field \'" + filed + "\' is required"});
						return false;
					}else if(obj._required === false){
						return;
					}
				}
				
				for(var attr in obj){
					if(this.checkOption(data[attr],[attr,obj[attr]],info) === false){
						return false;
					}
				}
				
			},
			
			checkStructure:function(data,structure,info){
				
				var self = this;
				
				for(var attr in structure){
					if(attr !== "_desc"){
						if(this.checkType(structure[attr],_.array) === true){
							if(this.checkOption(data[attr],[attr,structure[attr]],info) === false){
								return false;
							}
						}else if(this.checkType(structure[attr],_.object) === true){
							if(this.checkObject(data[attr],[attr,structure[attr]],info) === false){
								return false;
							}
						}
					}
				}
				
			},
			
			checkMethod:function(data,appType){
				
				if(data === undefined){
					this.throwError({url:appType,info:"Param is required"});
					return false;
				}
				
				if(this.checkType(data,_.object) === false){
					this.throwError({url:appType,info:"Param must be the object"});
					return false;
				}
				
				if(data.method === undefined){
					this.throwError({url:appType,info:"Param 'method' is required"});
					return false;
				}
				
				if(Object.isFunction(Model[appType][data["method"]])){
					return "extend";
				}
				
				var method = data.method;
				var app = structure[appType];
				
				if(app[method] === undefined){
					this.throwError({url:appType,info:"Method \'" + method + "\' is not existed"});
					return false;
				}else{
					return true;
				}
				
			},
			
			isValidate:function(data){
				if(data.validation === undefined){
					return true;
				}else{
					if(data.validation === false){
						return false;
					}else{
						return true;
					}
				}
			},
			
			_paramParam:function(param){
				var arr = [];
				for(var attr in param){
					if($.isArray(param[attr])){
						arr.push(attr + "=" + param[attr].join(","));
					}else{
						arr.push(attr + "=" + param[attr]);
					}
				}
				return arr.join("&");
			},
			
			request:function(data,appType){
				
				if(this.checkMethod(data, appType) === "extend"){
					Model[appType][data["method"]](data);
					return;
				};
				
				if(this.checkMethod(data, appType) === false){
					return;
				};
				
				var _dataStructure = structure[appType][data["method"]];
				
				if(this.isValidate(data)){
					
					if(this.checkStructure(data,requestStructure,_dataStructure) === false){
						return;
					}
					
					if(this.checkStructure(data,_dataStructure,_dataStructure) === false){
						return;
					}
					
				}
				
				var self = this;
				
				var request = {};
				
				var ajaxObject = {};
				
				var url = _dataStructure["url"];
				
				if(url.indexOf("oauth") !== -1){
					
					request.url = config["server"]["path"]["oauth"] + url;
					
				}else if(url.indexOf("api") !== -1){
					
					request.url = config["server"]["path"]["api"] + url;
					
				}
				
				request.type = _dataStructure["type"];
				
				request.dataType = "JSON";
				
				request.processData = false;
				
				request.timeout = config["ajax"]["timeout"];
				
				request.error = self.errorHandler;
				
				if(data.part){
					request.url = request.url + "/" + data.part;
				}
				
				if(_dataStructure.suffix){
					request.url = request.url + _dataStructure.suffix;
				}
				
				if(data.param){
					if($.browser.msie){
						data.param.random = Math.random();
					}
					if(data.token !== false){
						data.param.access_token = self.getAccessToken();
					}
					request.url = request.url + "?" + self._paramParam(data.param);
				}else{
					if($.browser.msie || data.token !== false){
						var param = {};
						if($.browser.msie){
							param.random = Math.random();
						}
						if(data.token !== false){
							param.access_token = self.getAccessToken();
						}
						request.url = request.url + "?" + self._paramParam(param);
					}
				}
				
				if(data.contentType){
					request.contentType = data.contentType;
				}else{
					request.contentType = "application/json;charset=UTF-8";
				}

				if(data.data){
					if(request.contentType == "application/x-www-form-urlencoded"){
						request.data = Object.toQueryString(data.data);
					}else{
						request.data = Object.toJSON(data.data);
					}
				}
				
				if(data.async){
					request.async = data.async;
				}
				
				if(data.timeout){
					request.timeout = data.timeout;
				}
				
				request.success = function(returnData){
					self.successHandler(returnData,data.success,data.error,request,data.token)
				};
				
				$.ajax(request);
					
			},
			
			_request:function(data){
				if(data.url.indexOf("access_token=") !== -1){
					data.url = data.url.replace(/access_token=[\w\d]{32}/,"access_token=" + this.getAccessToken());
				}
				$.ajax(data);
			},
			
			successHandler:function(returnData,success,error,request,token){
				var self = this;
				if(returnData.error === undefined){
					if(success !== undefined){
//						var result = (returnData.result !== undefined) ? returnData.result : returnData;
//						success(result);
						success(returnData);
					}
				}else{
					if(self.autoErrorHandler(returnData,request,token) === false){
						return;
					};
					if(error !== undefined){
						error(returnData);
						self.defaultErrorHandler(returnData);
					}else{
						self.defaultErrorHandler(returnData);
					}
					cloud.util.unmask();
				}
			},
			
			errorHandler:function(){
				var error = {
//                		request:request,
//                		status:status,
//                		thrown:thrown
                };
			},
			
			autoErrorHandler:function(returnData,request,token){
				var self = this;
				var code = parseInt(returnData.error_code);
				if($.inArray(code,[21327,21334,21335,21336]) !== -1){
					if(token !== false){
						if(!self.getAccessToken() || !self.getRefreshToken()){
							self.logout();
							return;
						}
						self.cacheErrorTokenRequests(request);
						return false;
					}
				}else if($.inArray(code,[21305,21332,21333]) !== -1){
					prompt.show("login_again",["ok",function(){prompt.close();self.logout();}]);
					return false;
				}
			},
			
			defaultErrorHandler:function(returnData){
				var code = parseInt(returnData.error_code);
				var content = returnData.error.toLowerCase();
				var url = returnData.request.toLowerCase();
        		if(code === 20007){
        			if(cloud.util.inString("tag",content)){
        				prompt.show("tag_already_exists");
    				}else if(cloud.util.inString("gateway",content)){
    					prompt.show("gateway_already_exists");
    				}else if(cloud.util.inString("name",content)){
    					if(cloud.util.inString("device",url)){
    						prompt.show("device_already_exists");
    					}else if(cloud.util.inString("sites",url)){
    						prompt.show("site_already_exists");
    					}
    				}else if(cloud.util.inString("serival",content)){
    					prompt.show("serial_string_already_exists");
    				}else if(cloud.util.inString("group",content)){
        				prompt.show("group_already_exists");
	        		}else{
    					prompt.show("resource_already_exists");
    				}
        		}else{
        			prompt.show(code);
        		}
			},
			
			requestErrorTokenQueue:function(){
				var self = this;
				var obj = error.token;
				if(obj.queue.length > 0){
					$.each(obj.queue,function(index,_request){
						method._request(_request);
					});
					obj.queue = [];
					obj.number = 0;
				}
			},
			
			cacheErrorTokenRequests:function(_request){
				var self = this;
				var obj = error.token;
				if(obj.number === 0){
					var delayFun = function(){
						if(self.getRefreshToken() === null){
							prompt.show("login_again",["ok",function(){prompt.close();self.logout();}]);
							return;
						}
						self.refreshToken(self.requestErrorTokenQueue);
					}
					setTimeout(function(){delayFun()},obj.cachedTime);
				}
				obj.queue.push(_request);
				obj.number++;
			},
			
			refreshToken:function(callback){
				var self = this;
				var refreshTokenFailureNumber = error["token"]["refreshTokenFailureNumber"];
				Model.oauth({
					method:"refresh_token",
					data:{
						client_id:config["oauth"]["client_id"],
						client_secret:config["oauth"]["client_secret"],
						grant_type:config["oauth"]["grant_type"]["refresh_token"],
						refresh_token:self.getRefreshToken()
					},
					contentType:"application/x-www-form-urlencoded",
					success:function(data){
						self.setAccessToken(data.access_token);
						self.setRefreshToken(data.refresh_token);
						callback();
					},
					error:function(data){
						self.clearErrorToken();
						prompt.show("login_again",["ok",function(){prompt.close();self.logout();}]);
					}
				});
			},
			
			clearErrorToken:function(){
				error.token.queue = [];
				error.token.number = 0;
			},
			
			clearToken:function(){
				sessionStorage.removeItem(config["token"]["access_token"]);
				sessionStorage.removeItem(config["token"]["refresh_token"]);
			},
			
			logout:function(){
				var self = this;
				self.clearToken();
				self.clearErrorToken();
				location.replace(config["url"]["login"]["fail"]);
			},
			
			throwError:function(obj){
				console.log(obj.url + "\n" + obj.info);
			},
			
			getAccessToken:function(){
				return sessionStorage.getItem(config["token"]["access_token"]);
			},
			
			getRefreshToken:function(){
				return sessionStorage.getItem(config["token"]["refresh_token"]);
			},
			
			setAccessToken:function(param){
				sessionStorage.setItem(config["token"]["access_token"],param);
			},
			
			setRefreshToken:function(param){
				sessionStorage.setItem(config["token"]["refresh_token"],param);
			}
			
	}
	
	modelObj = {
			organ:function(data){method.request(data,"organ")},
			site:function(data){method.request(data,"site")},
			device:function(data){method.request(data,"device")},
			machine:function(data){method.request(data,"machine")},
			model:function(data){method.request(data,"model")},
			user:function(data){method.request(data,"user")},
			role:function(data){method.request(data,"role")},
			customer:function(data){method.request(data,"customer")},
			task:function(data){method.request(data,"task")},
			oauth:function(data){method.request(data,"oauth")},
			captchas:function(data){method.request(data,"captchas")},
			history:function(data){method.request(data,"history")},
			statistics:function(data){method.request(data,"statistics")},
			tag:function(data){method.request(data,"tag")},
			app:function(data){method.request(data,"app")},
			alarm:function(data){method.request(data,"alarm")},
			reports:function(data){method.request(data,"reports")},
			favor:function(data){method.request(data,"favor")},
			log:function(data){method.request(data,"log")},
			realtime:function(data){method.request(data,"realtime")},
			group:function(data){method.request(data,"group")},
			_method:method
	};
	
	$.extend(Model,modelObj);
	
})