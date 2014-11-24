define(function(require) {
    require("cloud/base/cloud");
    var tagAll = {
        _id: 1,
        name: "所有客户",
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
                url: "api/customers",
                type: "get",
                parameters: {
                    limit: limit,
                    cursor: start,
                    verbose: 100
                },
                success: function(data) {
                    callback.call(context || this, data.result.pluck("_id"));
                }
            });
        }
    };

    var Service = Class.create({
        inherentTags: [tagAll],
        loadTagUrl: "api/customer_tags",
        type: "customers",
        resourceType: 16,
        initialize: function() {
            this.map = $H(this.map);
        },

        getTags: function(callback, context) {
            var self = this;
            cloud.Ajax.request({
                url: self.loadTagUrl,
                type: "GET",
                parameters: {
                    verbose: 1
                },
                success: function(data) {
                    var count = 0,
                        total = self.inherentTags.size();
                    self.inherentTags.each(function(tag) {
                        tag.loadResourcesData(0, 0, function(ids) {
                            count++;
                            tag.total = ids.size();
                            if (count === total) {
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
                url: "api/customers",
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
                url: "api/customers/list",
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
                    url: "api/customers/list",
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
                url: "api/customers/list",
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
                        one.notifications = one.alarmCount;
                        one.favor = one.isMyFavorite === 1;
                        one.status = statusMap.get(one.businessState);
                        one.description = cloud.util.random(3, 10)+"个现场";
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

            this.getResourcesIds(0, 0, function(totalIds) {
                var idArrays = totalIds.partition(function(value, index) {
                    return index >= start && index < start + limit;
                });

                cloud.Ajax.request({
                    url: "api/customers/list",
                    type: "post",
                    parameters: {
                        verbose: 100,
                        limit: 0
                    },
                    data: {
                        resourceIds: idArrays.first()
                    },
                    success: function(data) {
                        data.result.each(function(one) {
                            one.notifications = one.alarmCount;
                            one.favor = one.isMyFavorite === 1;
                            one.status = statusMap.get(one.businessState);
                            one.description = cloud.util.random(3, 10)+"个现场";
                        });
                        data.total = totalIds.size();
                        callback.call(context || this, data);
                    }
                });
            }, this);

        },

        deleteResources: function(ids, callback, context) {
            ids = cloud.util.makeArray(ids);
			ids.each(function(id){
				cloud.Ajax.request({
					url:"api/customers/"+id,
					type:"delete",
					success:function(){
//						console.log("delete"+id+"success");
					}
				});
			});
            callback.call(context || this);
        }

    });

    return new Service();
});