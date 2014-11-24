define(function(require) {
    require("cloud/base/cloud");
    var resourceType = 6;
    
    var tagAll = {
        _id: 1,
        name: locale.get("all_models"),
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
                url: "api/models",
                type: "get",
                parameters: {
                    limit: limit,
                    cursor: start,
                    verbose: 1
                },
                success: function(data) {
                    data.result = data.result.pluck("_id")
                    callback.call(context || this, data);
                    tagAll.total = data.total;
                }
            });
        }
    };
    var tagGateway = {
        _id: 2,
        name: locale.get("gateway_models"),
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
                url: "api/models",
                type: "get",
                parameters: {
                    limit: limit,
                    cursor: start,
                    gateway : true,
                    verbose: 1
                },
                success: function(data) {
                    tagGateway.total = data.total;
                    data.result = data.result.pluck("_id")
                    callback.call(context || this, data);
                }
            });
        }
    };
    var tagNotGateway = {
        _id: 3,
        name: locale.get("not_gateway_models"),
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
                url: "api/models",
                type: "get",
                parameters: {
                    limit: limit,
                    cursor: start,
                    gateway : false,
                    verbose: 1
                },
                success: function(data) {
                    tagNotGateway.total = data.total;
//                    callback.call(context || this, data.result.pluck("_id"));
                    data.result = data.result.pluck("_id")
                    callback.call(context || this, data);
                }
            });
        }
    };

    var noneTagModel = {
        _id: 4,
        name: locale.get("untagged_models"),
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
                	data.result && data.result.reverse();
//                      console.log("data",data);
                    noneTagModel.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };
    var Service = Class.create({
        inherentTags: [tagAll, tagGateway, tagNotGateway, noneTagModel],
        loadTagUrl: "api/model_tags",
        type: "model",
        resourceType: 6,
        initialize: function() {
        },

        getTags: function(callback, context) {
            var self = this;
            cloud.Ajax.request({
                url: self.loadTagUrl,
                type: "GET",
                parameters: {
                    verbose: 4
                },
                success: function(data) {
                    var count = 0,
                        total = self.inherentTags.size();
                    self.inherentTags.each(function(tag) {
//                        tag.loadResourcesData(0, 0, function(ids) {
                            count++;
//                            tag.total = ids.size();
                            if (count === total) {
                                var tags = [self.inherentTags, data.result].flatten();
                                callback.call(context || self, tags);
                            }
//                        });
                    });
                }
            });
        },

        getResourceType: function() {
            return this.resourceType;
        },

        getResourcesIds: function(start, limit, callback, context){
            cloud.Ajax.request({
                url: "api/models",
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
            this.lastGetResroucesRequest = cloud.Ajax.request({
                url: "api/models/list",
                type: "post",
                parameters: {
                    verbose: 100,
                    limit: 0
                },
                data: {
                    resourceIds: ids
                },
                success: function(data) {
                    self.lastGetResroucesRequest = null;
                    callback.call(context || this, data.result);
                }
            });
        },
        
        getTableResources: function(start, limit, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;

            this.getResourcesIds(start, limit, function(ids) {
                this.lastGetResroucesRequest = cloud.Ajax.request({
                    url: "api/models/list",
                    type: "post",
                    parameters: {
                        verbose: 100
                    },
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
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            var statusMap = new Hash({
                0: "stop",
                1: "running",
                2: "debug"
            });

            this.lastGetResroucesRequest = cloud.Ajax.request({
                url: "api/models/overview",
                type: "post",
                parameters: {
                    verbose: 100,
//                    limit: 0
                },
                data: {
                    resourceIds: ids
                },
                success: function(data) {
                    data.result.each(function(one) {
                        one.notifications = one.alarmCount;
                        //返回结果中缺乏isMyFavorite字段
                        one.favor = one.isMyFavorite === 1;
//                        one.status = statusMap.get(one.businessState);
                        one.gateway = one.gateway;
//                        one.description = "<p>" + locale.get("device_count2", [one.deviceCount]) + "</p>";
                    });
                    self.lastGetResroucesRequest = null;
                    callback.call(context || this, data.result);
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
                var idArrays = totalIds.result/*.partition(function(value, index) {
                    return index >= start && index < start + limit;
                });*/

                cloud.Ajax.request({
                    url: "api/models/overview",
                    type: "post",
                    parameters: {
                        verbose: 100,
                        limit: limit
                    },
                    data: {
                        resourceIds: idArrays
                    },
                    success: function(data) {
                        data.result.each(function(one) {
                            one.notifications = one.alarmCount;
                            one.favor = one.isMyFavorite === 1;
//                            one.status = statusMap.get(one.businessState);
                            one.gateway = one.gateway;
//                            one.description = "<p>" + locale.get("device_count2", [one.deviceCount]) + "</p>";//"<p>" + one.deviceCount + "个设备</p><p>" +one.model + "</p>";
                        });
//                        data.total = totalIds.size();
                        data.total = total;
                        data.cursor = cursor;
                        callback.call(context || this, data);
                    }
                });
            }, this);

        },

        deleteResources: function(ids, callback, context) {
            ids = cloud.util.makeArray(ids);
            
            /*cloud.Ajax.request({
                url: "api/models/list",
                type: "post",
                parameters: {
                    verbose: 100,
                    gateway : true,
                    limit : ids.length
                },
                data: {
                    resourceIds: ids
                },
                success: function(queryData) {
                    if (queryData.result && queryData.result.length > 0){
                        dialog.render({lang: "cannot_del_gateway_model"})
                        callback.call(context || this, []);
                    }else {*/
            var errorArray=[];
            var cnt=0;
                        ids.each(function(id){
                        	var tipString="";
                            cloud.Ajax.request({
                                url:"api/models/"+id,
                                type:"delete",
                                success:function(){
                                	cnt++;
//                                  console.log("delete"+id+"success");
                                	if(cnt==ids.length){
                                        if(errorArray.length>0){
                                        	if(window.localStorage.language=="zh_CN"){
                                            	if(errorArray.length<=2){                     		
                                            		for(var i=0;i<errorArray.length;i++){
                                            			tipString+=(i+1)+","+locale.get(errorArray[i].error_code,errorArray[i].params)+"<br />";
                                            		}                       		
                                            		dialog.render({
                                            			text:tipString
                                            		});
                                            	}
                                            	else{
                                            		tipString=locale.get("judge_model");
                                            		dialog.render({
                                            			text:tipString
                                            		});
                                            	}
                                        	}
                                        	else{
                                        		tipString=locale.get("judge_model");
                                        		dialog.render({
                                        			text:tipString
                                        		});
                                        	}
                                        }
                                	}
                                },
                                error:function(err){
                                	cnt++;
                                	if(err.params){
                                		errorArray.push(err);
                                	}
                                	if(cnt==ids.length){
                                        if(errorArray.length>0){
                                        	if(window.localStorage.language=="zh_CN"){
                                            	if(errorArray.length<=2){                     		
                                            		for(var i=0;i<errorArray.length;i++){
                                            			tipString+=(i+1)+","+locale.get(errorArray[i].error_code,errorArray[i].params)+"<br />";
                                            		}                       		
                                            		dialog.render({
                                            			text:tipString
                                            		});
                                            	}
                                            	else{
                                            		tipString=locale.get("judge_model");
                                            		dialog.render({
                                            			text:tipString+"!"
                                            		});
                                            	}
                                        	}
                                        	else{
                                        		tipString=locale.get("judge_model");
                                        		dialog.render({
                                        			text:tipString+"!"
                                        		});
                                        	}
                                        }
                                	}
                                }
                            });
                        });
  
                        callback.call(context || this);
                    /*}
                }
            });*/
            
			
        }

    });

    return new Service();
});