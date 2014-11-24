define(function(require) {
    require("cloud/base/cloud");
	var resourceType = 5;
	var allDevicesStr = locale.get("all_gateway");
	var onlineDevicesStr = locale.get("online_gateway");
	var offlineDevicesStr = locale.get("offline_gateway");
	/*
	var pagingnate = function(data, start, limit){
		var begin = start;
		var end = start +limit;
		if (limit == 0){
			return data.slice(begin);
		}else{
			return data.slice(begin, end);
		}
	};
	*/
	
    var tagAll = {
        _id: 1,
        name: allDevicesStr,
        description: "all",
        status: "inherent",
        selectable: false,
        favor: false,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start, limit, callback, context) {
//			console.log(limit,"limit - 30");
            cloud.Ajax.request({
                url: "api/devices",
                type: "get",
                parameters: {
                    limit: limit,
                    cursor: start,
//                    plc_id: 0,
                    verbose: 1
                },
                success: function(data) {
//                	var result = pagingnate(data.result, start, limit);
//                	data.result.each(function(one){
//						alert(one.plcId);
//					});
					data.result = data.result.pluck("_id");
					tagAll.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };

    var noneTagDevice = {
            _id: 2,
            name: locale.get({lang:"untagged_device"}),
            description: "",
            status: "inherent",
            selectable: false,
            favor: false,
            /**
             * Load id array.
             * @param {Object} callback
             */
            loadResourcesData: function(start, limit, callback, context) {
                cloud.Ajax.request({
                    url: "api/tags/none/resources",
                    type: "get",
                    parameters: {
                        limit: limit,
                        cursor: start,
                        type: resourceType
                    },
                    success: function(data) {
//                    	console.log("data",data);
                    	noneTagDevice.total = data.total;
                        callback.call(context || this, data);
                    }
                });
            }
        };
    
    var tagOnline = {
        _id: 3,
        name: onlineDevicesStr,
        description: "online",
        status: "inherent",
        selectable: false,
        favor: false,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start, limit, callback, context) {
//			console.log(limit,"limit - 87")
            cloud.Ajax.request({
                url: "api/devices",
                type: "get",
                parameters: {
                	limit: limit,
                    cursor: start,
                    verbose: 1,
                    online: 1
                },
                success: function(data) {
//                	var result = pagingnate(data.result, start, limit);
					data.result = data.result.pluck("_id");
					tagOnline.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };

    var tagOffline = {
        _id: 4,
        name: offlineDevicesStr,
        description: "offline",
        status: "inherent",
        selectable: false,
        favor: false,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start, limit, callback, context) {
//			console.log(limit,"limit - 117")
            cloud.Ajax.request({
                url: "api/devices",
                type: "get",
                parameters: {
                    limit: limit,
                    cursor: start,
                    verbose: 1,
//                    plc_id : 0,
                    online: 0
                },
                success: function(data) {
//                	var result = pagingnate(data.result, start, limit);
					data.result = data.result.pluck("_id");
					tagOffline.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };

    var Service = Class.create({
        netTags: [tagOnline, tagOffline],
        inherentTags: [tagAll, tagOnline, tagOffline],
        loadTagUrl: "api/device_tags",
        type: "device",
        resourceType: 5,
        initialize: function() {},

        getNetTags: function(callback, context) {
            var self = this;
            var tags = [self.netTags].flatten();
            callback.call(context || self, tags);
            /*var count = 0,
            total = self.netTags.size();
            this.netTags.each(function(tag) {
                 tag.loadResourcesData(0, 1, function(_data) {
                     count++;
                     tag.total = _data.total;
                     if (count === total) {
                         var tags = [self.netTags].flatten();
                         callback.call(context || self, tags);
                     }
                 });
            });*/
        },
        getTags: function(callback, context) {
            var self = this;
            cloud.Ajax.request({
                url: self.loadTagUrl,
                type: "GET",
                parameters: {
                    verbose: 100
                },
                success: function(data) {
                	var tags = [self.inherentTags, data.result].flatten();
                    callback.call(context || self, tags);
                    /*var count = 0,
                        total = self.inherentTags.size();

                    self.inherentTags.each(function(tag) {
                        tag.loadResourcesData(0, 1, function(_data) {
                            count++;
//							console.log(_data,"data - 157");
                            tag.total = _data.total;
                            if (count === total) {
                                var tags = [self.inherentTags, data.result].flatten();
                                callback.call(context || self, tags);
                            }
                        });
                    });*/
                }
            });
        },

        getResourceType: function() {
            return this.resourceType;
        },

        getResourcesIds: function(start, limit, callback, context) {
//			console.log(limit,"limit - 173")
            cloud.Ajax.request({
                url: "api/devices",
                type: "get",
                success: function(data) {
                    callback.call(context || this, data.result.pluck("_id"));
                }
            });
        },

        getTableResourcesById: function(ids, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            ids = cloud.util.makeArray(ids);
            
            cloud.Ajax.request({
				url:"api/models/",
				type:"get",
				parameters: {
	               verbose: 1,
	               limit : 0
		        },
				success:function(res){
					var res=res.result;
					
					self.lastGetResroucesRequest = cloud.Ajax.request({
		                url: "api/devices/list",
		                type: "post",
		                parameters: {
		                    verbose: 100,
		                    limit: 0
		                },
		                data: {
		                    resourceIds: ids
		                },
		                success: function(data) {
		                	data.result.each(function(one) {
	                    		res.each(function(res){
									if(res._id==one.modelId){
			                            one.modelName = res.name;
										return false;
									}
	                    		});
	                    	});
		                    self.lastGetResroucesRequest = null;
		                    callback.call(context || self, data.result);
		                }
		            });
				}
            });
            
        },

        getTableResources: function(start, limit, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            
            this.getResourcesIds(start, limit, function(ids) {
            	var total = ids.total;
            	var cursor = ids.cursor;
				if (ids.result) {
					ids = ids.result;
				}
            	cloud.Ajax.request({
    				url:"api/models/",
    				type:"get",
    				parameters: {
    	               verbose: 1,
                       limit : 0
    		        },
    				success:function(res){
    					var res=res.result;
    					self.lastGetResroucesRequest = cloud.Ajax.request({
    	                    url: "api/devices/list",
    	                    type: "post",
    	                    parameters: {
    	                        verbose: 100,
    	                        limit:limit,
    	                    },
    	                    data: {
    	                        resourceIds: ids
    	                    },
    	                    success: function(data) {
    	                    	data.result.each(function(one) {
    	                    		res.each(function(res){
										if(res._id==one.modelId){
				                            one.modelName = res.name;
											return false;
										}
    	                    		});
    	                    	});
    	                    	data.total = total;
    	                    	data.cursor = cursor;
    	                        self.lastGetResroucesRequest = null;
    	                        
    	                        callback.call(context || self, data);
    	                    }
    	                });
    				}
    		    });
            	
                
            }, this);
        },
        
        getGisResources: function(start, limit, params, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            
            params = (params)? params : {};
            
            cloud.util.defaults(params, {
                verbose: 100,
                limit : limit
            });

            this.getResourcesIds(start, limit, function(ids) {
				if(ids.result){
					ids = ids.result;
				}
                this.lastGetResroucesRequest = cloud.Ajax.request({
                    url: "api/devices/list",
                    type: "post",
                    parameters: params,
                    data: {
                        resourceIds: ids
                    },
                    success: function(data) {
                        self.lastGetResroucesRequest = null;
                        callback.call(context || this, data.result);
                    }
                });
            }, this);
        },

        getOverviewResourcesById: function(ids, callback, context) {
			
            var statusMap = new Hash({
                0: "stop",
                1: "running",
                2: "debug"
            });
			cloud.Ajax.request({
				url:"api/models/",
				type:"get",
				parameters: {
	               verbose: 1
		        },
				success:function(res){
					var res=res.result;
		            cloud.Ajax.request({
		                url: "api/devices/overview",
		                type: "post",
		                parameters: {
		                    verbose: 100,
//		                    limit: 0
		                },
		                data: {
		                    resourceIds: ids
		                },
		                success: function(data) {
		                    data.result.each(function(one) {
		                        one.notifications = one.alarmCount;
		                        one.favor = one.isMyFavorite === 1;
		                        one.status = statusMap.get(one.businessState);
								res.each(function(res){
										if(res._id==one.modelId){
				                            one.description = res.name;
											return false;
										}
								});
//		                        one.description = "Device";
		                    });
		                    callback.call(context || this, data.result);
		                }
		            });
					
				}
			});
        },

        getOverviewResources: function(start, limit, callback, context) {
            var statusMap = new Hash({
                0: "stop",
                1: "running",
                2: "debug"
            });
			
            this.getResourcesIds(start, limit, function(totalIds) {
                var total = totalIds.total;
                var cursor = totalIds.cursor;
				if(totalIds.result){
				    totalIds = totalIds.result;
				}
//                var idArrays = totalIds.partition(function(value, index) {
//                    return index >= start && index < start + limit;
//                });
				cloud.Ajax.request({
					url:"api/models/",
					type:"get",
					parameters: {
		                verbose: 1,
		                limit: 0
			        },
					success:function(res){
						var res=res.result;
						cloud.Ajax.request({
		                    url: "api/devices/overview",
		                    type: "post",
		                    parameters: {
		                        verbose: 100,
		                        limit: limit
		                    },
		                    data: {
		                        resourceIds: totalIds
		                    },
		                    success: function(data) {
		                        data.result.each(function(one) {
		                            one.notifications = one.alarmCount;
		                            one.favor = one.isMyFavorite === 1;
		                            one.status = statusMap.get(one.businessState);
									res.each(function(res){
										if(res._id==one.modelId){
				                            one.description = res.name;
											return false;
										}
									});
		                        });
//		                        data.total = totalIds.size();
		                        data.total = total;
                                data.cursor = cursor;
		                        callback.call(context || this, data);
		                    }
		                });
					}
				});
                
            }, this);

        },
		getModelsName:function(callback){
			cloud.Ajax.request({
				url:"api/models/",
				type:"get",
				parameters: {
	                verbose: 1
		        },
				success:function(res){
					return res.result;
					callback();
				}
			});
		},

        deleteResources: function(ids, callback, context) {
            ids = cloud.util.makeArray(ids);
			var count = ids.length;
			var res =  new Array();
            ids.each(function(id) {
                cloud.Ajax.request({
                    url: "api/devices/" + id,
                    type: "delete",
					error:function(data){
                        count--;
                    },
					success:function(data){
//						console.log("delete"+id+"success");
						if (data.result && data.result.id) {
							res.push(data.result.id);
							count--;
//							console.log(data.result.id, "del suc");
//							callback.call(context || this, cloud.util.makeArray(data.result.id));
							if(count === 0 ){
				            	callback.call(context || this,res);
							}	
						}
					}
                });
            });
//            callback.call(context || this);
        },
        getDeviceSum:function(callback){
    		cloud.Ajax.request({
            	url: "api/devices",
                type: "get",
                dataType: "JSON",
                parameters: {
					limit: 1,
    				online:0
                },
                success: function(data) {
                    callback(data.result.length,data.online);
                }
            });
    	},
    	deleteDevice:function(deviceId,callback){
    		cloud.Ajax.request({
    			url: "api/devices/"+deviceId,
    			type: "DELETE",
    			dataType: "JSON",
    			success: function(data) {
    				callback(data);
    			}
    		});
    	},
        exportDevices: function(deviceIds, callback) {
			if(typeof deviceIds == 'undefined' || deviceIds == null) {
				deviceIds = [];
			}
            cloud.Ajax.request({
                url: "api/devices_export",
                type: "post",
                dataType: "JSON",
                data: {
                    deviceIds: deviceIds
                },
                success: function(data) {
                    callback(data);
                }
            });
        }

    });
    return new Service();
});