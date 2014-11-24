define(function(require) {
    require("cloud/base/cloud");
    var resourceType = 2;
    var allUser = {
        _id: 1,
        name: locale.get({lang:"all_user"}),
        description: "",
        status: "inherent",
        selectable: false,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start, limit,callback, context) {
            cloud.Ajax.request({
                url: "api2/users",
                type: "get",
				parameters: {
                    limit: limit,
                    cursor: start
//                    verbose: 1
                },
                success: function(data) {
					data.result = data.result.pluck("_id");
					allUser.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };

    var noneTagUser = {
        _id: 2,
        name: locale.get("untagged_user"),
        description: "",
        status: "inherent",
        selectable: false,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start, limit,callback, context) {
            cloud.Ajax.request({
                url: "api/tags/none/resources",
                type: "get",
                parameters: {
                	limit: limit,
                    cursor: start,
                    type: resourceType
                },
                success: function(data) {
                	noneTagUser.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };
    
    var adminManager = {
            _id: 3,
            name: locale.get("organization_manager"),
            description: "",
            status: "inherent",
            selectable: false,
            /**
             * Load id array.
             * @param {Object} callback
             */
            loadResourcesData: function(start, limit,callback, context) {
            	cloud.Ajax.request({
                  url: "api2/roles",
                  type: "get",
                  parameters: {
				  	limit:1,
                	name:"admin"
                  },
                  success: function(data) {
                	  var ids = data.result.pluck("_id");
                	  cloud.Ajax.request({
                        url: "api2/users",
                        type: "get",
                        parameters: {
                        	verbose:10,
                        	role_ids:ids,
                        	limit: limit,
                            cursor: start,
                            type: resourceType
                        },
                        success: function(data) {
							data.result = data.result.pluck("_id");
							adminManager.total = data.total;
                            callback.call(context || this, data);
                        }
                    });
                  }
              });
            }
        };
    
    var deviceManager = {
            _id: 4,
            name: locale.get("device_manager"),
            description: "",
            status: "inherent",
            selectable: false,
            /**
             * Load id array.
             * @param {Object} callback
             */
            loadResourcesData: function(start, limit,callback, context) {
            	cloud.Ajax.request({
                  url: "api2/roles",
                  type: "get",
                  parameters: {
				  	limit:1,
                	name:"DeviceManager"
                  },
                  success: function(data) {
                	  var ids = data.result.pluck("_id");
                	  cloud.Ajax.request({
                        url: "api2/users",
                        type: "get",
                        parameters: {
                        	verbose:10,
                        	role_ids:ids,
                        	limit: limit,
                            cursor: start,
                            type: resourceType
                        },
                        success: function(data) {
							data.result = data.result.pluck("_id");
							deviceManager.total = data.total;
                            callback.call(context || this, data);
                        }
                    });
                  }
              });
            }
        };
    
    var Service = Class.create({
        inherentTags: [allUser, noneTagUser,adminManager,deviceManager],
        loadTagUrl: "api/user_tags",
        type: "user",
        resourceType: resourceType,
        initialize: function() {
            this.map = $H(this.map);
        },

        getTags: function(callback, context) {
            var self = this;
            cloud.Ajax.request({
                url: self.loadTagUrl,
                type: "GET",
                parameters: {
					limit:0,
                    verbose: 100
                },
                success: function(data) {
                	var tags = [self.inherentTags, data.result].flatten();
                    callback.call(context || self, tags);
                    /*var count = 0,
                        total = self.inherentTags.size();
                    self.inherentTags.each(function(tag) {
                        //get inherent tag description, show it's resources count info.
                        tag.loadResourcesData(0,1,function(_data) {
                            count++;
                            tag.total = _data.total;
                            //if all inherent tags' requests are returned, call the callback, set all tags as parameters.
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
		getResourcesIds: function(start, limit, callback, context){
            cloud.Ajax.request({
                url: "api2/users",
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
//            console.log(ids,"ids");
            this.lastGetResroucesRequest = cloud.Ajax.request({
                url: "api2/users/list",
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
        },
        
        //get content resources by resource ids array.
        getTableResources: function(start, limit, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;

            this.getResourcesIds(start,limit,function(ids) {
            	var total = ids.total;
            	var cursor = ids.cursor;
				if(ids.result){
					ids = ids.result;
				}
                this.lastGetResroucesRequest = cloud.Ajax.request({
                    url: "api2/users/list",
                    type: "post",
                    parameters: {
                        verbose: 100,
                        limit:limit
                    },
                    data: {
                        resourceIds: ids
                    },
                    success: function(data) {
                    	data.total = total;
                    	data.cursor = cursor;
                        self.lastGetResroucesRequest = null;
                        callback.call(context || this, data);
                    }
                });
            }, this);
        },
        deleteResources: function(ids, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            
            ids = cloud.util.makeArray(ids);
            var delIds = $A();
            var count = ids.size();
            if(count >0){
            	ids.each(function(id, index){
            		cloud.Ajax.request({
            			url:"api2/users/"+id,
            			type:"delete",
            			success:function(data){
            				count--;
            				if (data.result && data.result._id) {
            					delIds.push(data.result._id);
            				}
            				if(count === 0){
            					callback.call(context ||this, delIds);
            				}
            			},
            			error:function(data){
            				count--;
            				dialog.render({lang:"delete_failed"});
            				if(count === 0){
            					callback.call(context ||this, []);
            				}
            			}
            		});
            	});
            }else{
	            callback.call(context ||this, []);
            }
            
            
            /*var loginedUser = cloud.platform.loginedUser;
            if (loginedUser && (ids.indexOf(loginedUser._id) != -1)){
        		ids = ids.without(loginedUser._id);
        		dialog.render({lang:"cannt_del_self_account"});
        		if (!(ids.length > 0)){
        			callback.call(context || this, ids);
        		}
//        		alert("不能删除自身帐号");
            }
            
            //delete admin account is forbidden
            this.getTableResourcesById(ids, function(results){
            	var adminIds = $A();
            	results.each(function(result){
            		if (result.roleNames.indexOf("admin") != -1){
//            			alert("忽略删除admin帐户（"+result.name+"）的请求");
            			var alertText = locale.get("ignore_del_admin", [result.name])
            			dialog.render({text : alertText});
            			dialog.render({
            				text:"帐户（"+result.name+"）是管理员帐户"
            			});
            			adminIds.push(result._id);
            			ids = ids.without(result._id);
						if (!(ids.length > 0)){
		        			callback.call(context || this, ids);
		        		}
//            			console.log(result._id, "without admin")
            			//return;
            		}
            	});
            	//TODO
//            	console.log(ids, "delete request")
            	if (ids.length > 0 && adminIds.length == 0){
                	ids.each(function(id, index){
//                		console.log(index, "index")
                		cloud.Ajax.request({
        					url:"api2/users/"+id,
        					type:"delete",
        					success:function(data){
        						if (data.result && data.result._id) {
        							callback.call(context || this, cloud.util.makeArray(data.result._id));
        						}
        						if (index == (ids.length - 1)){
//        							console.log(idsSuccess, "idsSuccess");
        							
        						}
        					},
							error:function(data){
								dialog.render({lang:"delete_failed"});
								callback.call(context || this, []);
							}
        				});
        			});
                };
            },this);*/
        }
    });

    return new Service();
});