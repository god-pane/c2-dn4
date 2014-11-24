/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author PANJC
 * @filename model.custom
 * @filetype {object}
 * @filedescription "用户对model的自定义扩展"
 */
define([
        "cloud/base/model.structure",
        "cloud/lib/jquery",
        "cloud/lib/prototype.lang",
        "cloud/components/dialog",
        "cloud/base/_config",
        "cloud/base/model",
        "cloud/base/model.custom.structure"
        ],function(
        		_structure,
        		_jquery,
        		_prototye,
        		dialog,
        		_config,
        		model,
        		dataStructure
        ){
	
	var root = window;
	
	Model = root.Model = (root.Model||{});
	
	var _ = Model._;
	
	var structure = Model.structure;
	
	var config = CONFIG;
	
	var method = {
			
			checkData:function(data,info){
				
				if(data.data && !$.isPlainObject(data.data)){
					this.throwError({
						url:info,
						info:"Param must be the Object"
					});
					return false;
				}
				
				if(data.success && !Object.isFunction(data.success)){
					this.throwError({
						url:info,
						info:"Param success must be the Function"
					});
					return false;
				}
				
				if(data.error && !Object.isFunction(data.error)){
					this.throwError({
						url:info,
						info:"Param error must be the Function"
					});
					return false;
				}
				
			},
			
			request:function(data,appType,_request){
				
				if(this.checkData(data,appType) === false){
					return;
				}
				_request();
				
			},
			
			func:function(callback){
				return callback ? callback : function(){};
			},
			
			throwError:function(obj){
				console.log(obj.url + "\n" + obj.info);
			}
			
	};
	
	var Extend = {
			
	};
	
	var userExtend = {
			
		login:function(data){
			var _data = data.data;
			var _param = data.param;
			function setToken(data){
				Model._method.setAccessToken(data.access_token);
				Model._method.setRefreshToken(data.refresh_token);
			}
			function jump(){
				location.replace(config["url"]["login"]["success"]);
			}
			var _success = data.success ? function(returnData){setToken(returnData);data.success(returnData);jump()} : function(returnData){setToken(returnData);jump()};
//				var _error = data.error ? data.error : function(){};
			method.request(data,"login",function(){
						Model.oauth({
							method:"get_token",
							data:{
								client_secret:config["oauth"]["client_secret"]
							},
							param:{
								client_id:config["oauth"]["client_id"],
								client_secret:config["oauth"]["client_secret"],
								grant_type:config["oauth"]["grant_type"]["password"],
								username:_data.username,
								password:cloud.util.md5(cloud.util.md5(_data.password) + _data.pictureId),
								varificationCode:_data.code,
								picId:_data.pictureId,
								language:_param.language
							},
							contentType:"application/x-www-form-urlencoded",
							token:false,
							success:_success,
							error:method.func(data.error)
						});
				
			})
		},
		
		logout:function(data){
			var data = data ? data : {};
			method.request(data,"logout",function(){
				var obj = {};
				obj.method = "_logout";
				obj.success = function(data){
					if(Object.isFunction(data.success)){
						data.success();
					}
					Model._method.logout();
				};
				obj.error = function(data){
					if(Object.isFunction(data.error)){
						data.error();
					}
					Model._method.logout();
				};
				Model.user(obj);
			});
		}
	
	}
	
	var tagExtend = {
			
		query_type:function(data){
			method.request(data,"query_type",function(){
				if (data.resourceType){
		            switch (data.resourceType){
	    	            case 2 : data.method = "query_user"; break;
	    	            case 3 : data.method = "query_role"; break;
	    	            case 5 : data.method = "query_device"; break;
	    	            case 6 : data.method = "query_model"; break;
	    	            case 14 : data.method = "query_site"; break;
	    	            case 16 : data.method = "query_customer"; break;
	                    case 17 : data.method = "query_document"; break;
		            }
		            delete data.resourceType;
		            Model.tag(data);
		        }
			});
	    }
	
	}
	
	var roleExtend = {
			
		query_current:function(data){
			method.request(data,"query_current",function(){
				Model.user({method:"query_current",param:{verbose:10},success:function(returnData){
					var roleId = returnData["result"]["roleId"];
					Model.role({
						method:"query_list",
						param:{verbose:100},
						part:roleId,
						success:method.func(data.success),
						error:method.func(data.error)
					})
				}});
			});
		}
	
	}
	
	var orgExtend = {
			
		query_with_stat:function(data){
			
//            var suc = data.success;
//            var err = data.error;
//            var id = data.part;
//            data.method = "query_one";
//            data.success = function(orgInfo){
//                Model.organ({
//                    method : "query_stat",
//                    data : {
//                        resourceIds : [id]
//                    },
//                    success : function(countInfo){
//                        if (countInfo["result"][0]){
//                            var orgDetail = $.extend(orgInfo["result"], countInfo["result"][0]);
//                            suc.call(this, orgDetail);
//                        }
//                    },
//                    err : err
//                })
//            }
//            Model.organ(data);
			
			method.request(data,"query_detail",function(){
        		Model.organ({
        			method:"query_one",
        			part:data.part,
        			param:data.param,
        			success:function(orgInfo){
	    				 Model.organ({
	    					 method:"query_stat",
	    					 param:data.param,
	    					 data:{
	                           resourceIds:[data.part],
	    					 },
	    					 success:function(countInfo){
	                           if (countInfo["result"][0]){
	                               var orgDetail = $.extend(orgInfo["result"], countInfo["result"][0]);
	                               data.success(orgDetail);
	                           }
	    					 },
	    					 error:data.error
	    				 });
        			}
        		});
        	});
			
        }
        
	}
	
	for(var attr in dataStructure){
		if(structure[attr] !== undefined){
			$.extend(structure[attr],dataStructure[attr]);
		}
	}
	
	$.extend(Model,Extend);
	$.extend(Model.user, userExtend);
	$.extend(Model.tag, tagExtend);
	$.extend(Model.role, roleExtend);
	$.extend(Model.organ, orgExtend);
	
})