define(function(require) {
    require("cloud/base/cloud");
    var tagAll = {
        _id: 1,
        name: "所有文档",
        description: "",
        status: "inherent",
        selectable: false,
        favor: false,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start,limit,callback, context) {
            cloud.Ajax.request({
                url: "api/documents",
                type: "get",
                success: function(data) {
                    callback.call(context || this, data.result.pluck("_id"));
                }
            });
        }
    };

    var Service = Class.create({
        inherentTags: [tagAll],
        loadTagUrl: "api/document_tags",
        type: "documents",
        resourceType: 17,
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
                    var count = 0,
                        total = self.inherentTags.size();
                    self.inherentTags.each(function(tag) {
                        tag.loadResourcesData(0,0,function(ids) {
                            count++;
                            tag.total = ids.size();
                            if (count == total) {
                                var tags = [self.inherentTags, data.result].flatten();
                                callback.call(context || self, tags);
                            }
                        });
                    });
                }
            });
        },

        getResourceType: function() {
            return this.resourceType;
        },

        getResourcesIds: function(callback, context){
            cloud.Ajax.request({
                url: "api/documents",
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
                url: "api/documents/list",
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
        
        getTableResources: function(start, end, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;

            this.getResourcesIds(start,end,function(ids) {
                this.lastGetResroucesRequest = cloud.Ajax.request({
                    url: "api/documents/list",
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

        getOverviewResources: function(ids, callback, context) {
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
                url: "api/documents/list",
                type: "post",
                parameters: {
                    verbose: 100
                },
                data: {
                    resourceIds: ids
                },
                success: function(data) {
                    data.result.each(function(one) {
                        one.notifications = one.alarmCount;
                        one.favor = one.isMyFavorite == 1;
                        one.status = statusMap.get(one.businessState);
                        one.description = "";
                    });
                    self.lastGetResroucesRequest = null;
                    callback.call(context || this, data.result);
                }
            });
        },

        deleteResources: function(ids, callback, context) {
            var self = this;
            ids = cloud.util.makeArray(ids);
            ids.each(function(id){
            	cloud.Ajax.request({
            		url:"api/documents/"+id,
            		type:"delete",
            		success:function(){
            			callback.call(context || this);
            		}
            	});
            });
            
        }

    });

    return new Service();
});