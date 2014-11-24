define(function(require) {
    require("cloud/base/cloud");
    
    var transLocale = function(one){
		var localeName = locale.get(one.code, one.params);
		one.content = localeName ? localeName : one.content;
	};
	
    var Service = Class.create({
        initialize: function() {
        	this.type = "behavlog";
            this.resourceType = 3;
        	this.map = $H(this.map);
        },

        getResourceType: function() {
            return this.resourceType;
        },

        getBehaveLogs: function(opt,start,limit,callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            var arrStr;
            if (opt.arr instanceof Array) {
            	arrStr = opt.arr.toString();
            }
            this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api2/comm_log",
                type: "GET",
                dataType: "JSON",
                parameters: {
					cursor:start,
                	limit:limit,
                	level:arrStr,
                    language:1,
                	start_time: opt.startTime,
                    end_time: opt.endTime
                },
                success: function(data) {
					var result = data.result;
                	result.total=data.total;
                	result.cursor = data.cursor;
                	result.each(transLocale);
                    self.lastGetResroucesRequest = null;
                    callback.call(context || this, data.result);
                }
            });
        }
    });

    return new Service();
    
});