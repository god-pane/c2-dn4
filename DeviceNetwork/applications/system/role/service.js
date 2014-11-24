define(function(require) {
    require("cloud/base/cloud");
    var resourceType = 3;
    var rolesArr;
    var tagAll = {
        _id: 1,
        name: locale.get({lang:"all_role"}),
        description: "",
        status: "inherent",
        selectable: false,
        favor: true,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start,limit,callback, context) {
            cloud.Ajax.request({
                url: "api2/roles",
                type: "Get",
				parameters: {
                    limit: limit,
                    cursor: start
//                    verbose: 1
                },
                success: function(data) {
					data.result = data.result.pluck("_id");
					tagAll.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };
    
    var noneTagRole = {
            _id: 2,
            name: locale.get({lang:"untagged_role"}),
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
                    	noneTagRole.total = data.total;
                        callback.call(context || this, data);
                    }
                });
            }
        };

    var Service = Class.create({
        inherentTags: [tagAll,noneTagRole],
        loadTagUrl: "api/role_tags",
        type: "role",
        resourceType: 3,
        initialize: function() {
            this.map = $H(this.map);
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
                        tag.loadResourcesData(0,1,function(_data) {
                            count++;
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
		getResourcesIds: function(start, limit, callback, context){
            cloud.Ajax.request({
                url: "api2/roles",
                type: "get",
                success: function(data) {
                    callback.call(context || this, data.result.pluck("_id"));
                }
            });
        },
        
        getTableResourcesById :  function(ids, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            ids = cloud.util.makeArray(ids);
            this.lastGetResroucesRequest = cloud.Ajax.request({
                url: "api2/roles/list",
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
		getUsers:function(roles,callback){
			var self = this;
            cloud.Ajax.request({
                url: "api2/users",
                type: "get",
                parameters:{
                	verbose:100,
                	limit:0,
                	role_ids:roles
                },
                success: function(data) {
                	self.users = data.result;
                	if(!!callback){
                		callback(data);
                	}
                }
            });
        },
        getTableResources: function(start, limit, callback, context) {
			var self = this;
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            this.getResourcesIds(start,limit,function(ids) {
            	var total = ids.total;
            	var cursor = ids.cursor;
				if(ids.result){
					ids = ids.result;
				}
                this.lastGetResroucesRequest = cloud.Ajax.request({
                    url: "api2/roles/list",
                    type: "post",
                    parameters: {
                        verbose: 100,
                        limit:limit
                    },
                    data: {
                        resourceIds: ids
                    },
                    success: function(data) {
                    	self.lastGetResroucesRequest = null;
                    	//var result = data.result;
						var ids = data.result.pluck("_id");
						ids = ids.join();
                		self.getUsers(ids, function(users){
                			var userArr = users.result;
    						data.result.each(function(one){
								var tagnames = "";
    						    userArr.each(function(user){
    						        roleNames =user.roleNames;
    						        for(var i in roleNames){
    						            if(one.name === roleNames[i]){
    						                tagnames+=user.name+"; ";
    						            }
    						        }
    						    });
    						    one["userNames"] = tagnames;
    						});
    						data.total = total;
    						data.cursor = cursor;
                			callback.call(context || this, data);
                		});
                    }
                });
            }, this);
        },

        deleteResources: function(ids, callback, context) {
            ids = cloud.util.makeArray(ids);
			ids.each(function(id){
				cloud.Ajax.request({
					url:"api2/roles/"+id,
					type:"delete",
					success:function(){
//						console.log("delete"+id+"success");
					},
					error: function() {
						dialog.render({
		            	  	lang:"cannot_delete_a_user_role"
		            	  });
					}
				});
			});
            callback.call(context || this);
        }
    });

    return new Service();
});