define(function(require) {
    require("cloud/base/cloud");
    var tagAll = {
        _id: 1,
        name: locale.get({lang:"all_controller"}),
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
                url: "api/machines",
                type: "get",
                parameters: {
                    limit: limit,
                    cursor: start,
//                    plc_id: -1,
                    verbose: 1
                },
                success: function(data) {
//                	data.result.each(function(one){
//						alert(one.plcId);
//					});
//                	var result = pagingnate(data.result, start, limit);
					data.result = data.result.pluck("_id");
					controllerId=data.result;
//					data.result.each(function(one){
//						console.log(one);
//					});
					tagAll.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };

//    var noneTagDevice = {
//            _id: 2,
//            name: locale.get({lang:"no_have_controller"}),
//            description: "",
//            status: "inherent",
//            selectable: false,
//            favor: false,
//            /**
//             * Load id array.
//             * @param {Object} callback
//             */
//            loadResourcesData: function(start, limit, callback, context) {
//                cloud.Ajax.request({
//                    url: "api/tags/none/resources",
//                    type: "get",
//                    parameters: {
//                        limit: limit,
//                        cursor: start,
//                        type: resourceType,
//                    },
//                    success: function(data) {
////                    	var tempResult=[];
////                 	    for(x in data.result){
////                 		   if(x.plcId===-1){
////                 			   tempResult.push(x);
////                 		   } 
////                 	    }
////                 	    data.result=tempResult;
////                    	var tempResult=[];
////                    	data.result.each(function(one){
////                    		if(one.plcId===1){
////                    			tempResult.push(one);
////                    		}
////                    	});
////                    	data.result=tempResult;
//                    	var tempResult=[];
//                    	data.result.each(function(one){
//                    		controllerId.each(function(two){
//                    			if(one===two){
//                    				tempResult.push(two);
//                    			}
//                    		});
//                    	});
//                    	data.result=tempResult;
//                    	data.total=tempResult.length;
//                    	noneTagDevice.total = data.total;
//                        callback.call(context || this, data);
//                    }
//                });
//            }
//        };

    var Service = Class.create({
    	inherentTags: [tagAll],
        loadTagUrl: "api/machine_tags",
        type: "machine",
        resourceType: 11,
        initialize: function() {},
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
                }
            });
        },

        getResourceType: function() {
            return this.resourceType;
        },

        getResourcesIds: function(start, limit, callback, context) {
            cloud.Ajax.request({
                url: "api/machines",
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
		                url: "api/machines/list",
		                type: "post",
		                parameters: {
		                    verbose: 100,
		                    limit: 0
//		                    plc_id:-1
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
    	                    url: "api/machines/list",
    	                    type: "post",
    	                    parameters: {
    	                        verbose: 100,
    	                        limit:limit,
    	                        plc_id:-1
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
		                url: "api/machines/list",
		                type: "post",
		                parameters: {
		                    verbose: 100,
		                    plc_id: -1,
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
		                    url: "api/machines/list",
		                    type: "post",
		                    parameters: {
		                        verbose: 100,
		                        plc_id: -1,
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
                    url: "api/machines/" + id,
                    type: "delete",
					error:function(data){
                        count--;
                    },
					success:function(data){
						if (data.result && data.result.id) {
							res.push(data.result.id);
							count--;

							if(count === 0 ){
				            	callback.call(context || this,res);
							}	
						}
					}
                });
            });
        },
        getDeviceSum:function(callback){
    		cloud.Ajax.request({
            	url: "api/devices",
                type: "get",
                dataType: "JSON",
                parameters: {
					limit: 1,
					plc_id: -1,
    				online:0
                },
                success: function(data) {
                    callback(data.result.length,data.online);
                }
            });
    	},
    	deleteDevice:function(deviceId,callback){
    		cloud.Ajax.request({
    			url: "api/machines/"+deviceId,
    			type: "DELETE",
    			dataType: "JSON",
    			success: function(data) {
    				callback(data);
    			}
    		});
    	}

    });
    return new Service();
});