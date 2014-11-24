define(function(require) {
    require("cloud/base/cloud");
    var Service = Class.create({
        initialize: function() {
        	this.type = "behavlog";
            this.resourceType = 3;
        	this.map = $H(this.map);
        },

        getResourceType: function() {
            return this.resourceType;
        },

        getBehaveLogs: function(callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api2/behav_log",
                type: "GET",
                dataType: "JSON",
                parameters: {
                	level:"1,2,3,4,5,6",
                    language:1,
                    start_time: "1361832000",
                    end_time: "1364918400000",
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