define(function(require) {
    require("cloud/base/cloud");
    var resourceType = 14;
    var allUser = {
        _id: 1,
        name: "所有",
        description: "",
        status: "inherent",
        selectable: false,
        loadResourcesData: function(start, limit,callback, context) {
            cloud.Ajax.request({
                url: "api2/users",
                type: "get",
				parameters: {
                    limit: limit,
                    cursor: start
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
        name: "未分组",
        description: "",
        status: "inherent",
        selectable: false,
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
    
    var Service = Class.create({
        inherentTags: [allUser, noneTagUser],
        loadTagUrl: "api/site_tags",
        type: "site",
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
            
        }
    });

    return new Service();
});