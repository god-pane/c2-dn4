define(function(require) {
    var cloud = require("cloud/base/cloud");
    var Service = Class.create({
        initialize: function() {
        	this.type = "summary";
//            this.resourceType = 3;
        },

        getResourceType: function() {
            return this.resourceType;
        },
		getResourceTags:function(ids,callback){
			var self =this;
			cloud.Ajax.request({
				url: "api/resources_tags",
                type: "POST",
                dataType: "JSON",
                data:{
                	resourceIds:ids
                },
				parameters:{
					verbose:100
				},
				success:function(data){
					self.resourcesTags = data.result;
                	if(!!callback){
                		callback(data);
                	}
				}
			});
		},
		_processCoord:function(value){
			if(value<0){value = -value}
			var degree = Math.floor(value);
			var val_minute = (value-degree)*60
			var minute = Math.floor(val_minute);
			var val_second = (val_minute-minute)*60;
			var second = Math.floor(val_second);
			return degree+"°"+minute+"′"+second+"″"
		},
        getSitelist: function(opt,start,limit,callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            var parameters ={
            		business_state:opt.arr.toString(),
            		cursor:start,
                	limit:limit,
                	start_time: opt.startTime,
                    end_time: opt.endTime,
					verbose:100
            }
            if(opt.net!== undefined){
            	parameters.online = opt.net;
            }
            this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api/sites",//?business_state="+opt.arr+"&online="+opt.net,
                type: "get",
                dataType: "JSON",
                parameters:parameters,
                success: function(data) {
//					var result = data.result;
//					result.total=data.total;
//					var ids = new Array();
//					result.each(function(id){
//						ids.push(id._id);
//						if(id.location.latitude>0){
//						    latitude=self._processCoord(id.location.latitude)+"N";
//						}else{
//							latitude=self._processCoord(id.location.latitude)+"S";
//						}
//						if(id.location.longitude>0){
//							longitude=self._processCoord(id.location.longitude)+"E";
//						}else{
//							longitude=self._processCoord(id.location.longitude)+"W";
//						}
////						latitude = id.location.latitude>0?id.location.latitude.toFixed(3)+"E"?(id.location.latitude*-1).toFixed(3)+"W";
////						longitude = id.location.longitude>0?id.location.longitude.toFixed(3)+"N"?(id.location.longitude*-1).toFixed(3)+"S";
//						id.location = longitude+","+latitude;
//					});
//					self.getResourceTags(ids,function(tags){
//						var tag = tags.result;
//						result.each(function(one){
//							tag.each(function(onetag){
//								if(one._id === onetag.resourceId.toLowerCase()){
//									var names = new Array();
//									onetag.tags.each(function(tagname){
//										names.push(tagname.name);
//									});
//									tagnames = names.join();
//									one["tags"] = tagnames;
//								}
//							});
//						});
//               	 	self.lastGetResroucesRequest = null;
               	 	callback.call(context || this, data);
//					});
                }
            });
        },
        getDeviceCount:function(bus_state,online,callback){
        	cloud.Ajax.request({
        		url:"api/devices",
        		type:"get",
        		dataType:"JSON",
        		parameters:{
        			verbose:1,
        			business_state:bus_state,
        			limit:1
        		},
        		success:function(data){
        			if(!online){
        				data = data.total;
        			}
        			if(!!callback){
        				callback(data);
        			}
        		}
        	});
        },
        getSiteCount:function(bus_state,online,callback){
        	cloud.Ajax.request({
				url:"api/sites",
				type:"get",
				dataType:"JSON",
				parameters:{
					verbose:1,
					business_state:bus_state,
					limit:1
					},
				success:function(data){
					if(!online){
						data = data.total;
					}
					if(!!callback){
						callback(data);
					}
				}
			});
        },
        
        
//		expSitelist:function(callback){
//			if (this.lastGetResroucesRequest) {
//                this.lastGetResroucesRequest.abort();
//            }
//			var self = this;
//			this.lastGetResroucesRequest = cloud.Ajax.request({
//            	url: "api/reports/forms",
//                type: "post",
//                dataType: "JSON",
//				data:{
//					reportType:1,
//				},
//                parameters: {
//					report_name:"test"
//                },
//                success: function(data) {
//                    self.lastGetResroucesRequest = null;
//                    callback.call(context || this, data.result);
//                }
//            });
//		},
		getDevicelist:function(opt,start,limit,callback, context){
			if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
			var self = this;
			var parameters ={
            		business_state:opt.arr.toString(),
            		cursor:start,
                	limit:limit,
                	start_time: opt.startTime,
                    end_time: opt.endTime,
					verbose:100
            }
            if(opt.net!== undefined){
            	parameters.online = opt.net;
            }
			this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api/devices?",//business_state="+opt.arr+"&online="+opt.net,
                type: "get",
                dataType: "JSON",
                parameters: parameters,
                success: function(data) {
//					var result = data.result;
//					result.total=data.total;
//					var ids = new Array();
//					result.each(function(id){
//						ids.push(id._id);
//					});
//					self.getResourceTags(ids,function(tags){
//						var tag = tags.result;
//						result.each(function(one){
//							tag.each(function(onetag){
//								if(one._id === onetag.resourceId.toLowerCase()){
//									var names = new Array();
//									onetag.tags.each(function(tagname){
//										names.push(tagname.name);
//									});
//									tagnames = names.join();
//									one["tags"] = tagnames;
//								}
//							});
//						});
//               	 	self.lastGetResroucesRequest = null;
               	 	callback.call(context || this, data);
//					});
                }
            });
		},
		getAlarmlist:function(opt,callback, context){
			if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
			var self = this;
			this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api/alarms?level="+opt.level+"&state="+opt.state,
                type: "get",
                dataType: "JSON",
                parameters: {
					site_name:opt.sitename,
					sourc_name:opt.sourcename,
                	start_time: opt.startTime,
                    end_time: opt.endTime,
					verbose:100
                },
                success: function(data) {
                    self.lastGetResroucesRequest = null;
                    callback.call(context || this, data.result);
                }
            });
		}
    });

    return new Service();
    
});