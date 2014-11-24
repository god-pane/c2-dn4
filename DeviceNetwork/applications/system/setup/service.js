define(function(require) {
    require("cloud/base/cloud");
    var Service = Class.create({
        initialize: function() {
        	this.type = "behavlog";
            this.resourceType = 3;
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
                        tag.loadResourcesData(function(ids) {
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

        getModelByModelId: function(modelId,callback, context) {
            if (this.modelByModelIDRequest) {
                this.modelByModelIDRequest.abort();
            }
            var self = this;
            this.modelByModelIDRequest = cloud.Ajax.request({
                url: "api/models/"+modelId,
                type: "get",
                parameters: {
                    verbose: 100,
                },
                data: {
                },
                success: function(data) {
                    self.modelByModelIDRequest = null;
                    callback.call(context || this, data.result);
                }
            });
        },

        getResources: function(ids, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            this.lastGetResroucesRequest = cloud.Ajax.request({
                url: "api2/devices/list",
                type: "post",
                parameters: {
                    verbose: 100,
                },
                data: {
                    resourceIds: ids
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