define(function(require) {
    require("cloud/base/cloud");
    var Service = Class.create({
        initialize: function() {
        	this.type = "alarm";
            this.resourceType = 3;
        	this.map = $H(this.map);
        },
        
        LEVELS : {
            "TIP" : 1,
            "WARN" : 2,
            "MINOR_ALARM": 3,
            "IMPORTANT_ALARM" : 4,
            "SEVERE_ALARM" : 5
        },
        
        STATES : {
            "AFFIRMED" : 0,
            "NOT_AFFIRMED" : 1,
            "CLEARED" : -1,
        },
        
        getResourceType: function() {
            return this.resourceType;
        },
        getAlarms: function(opt,callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            var levelStr;
            if (opt.levelArr instanceof Array) {
            	levelStr = opt.levelArr.toString();
            }
            var statusStr;
            if (opt.statusArr instanceof Array) {
            	statusStr = opt.statusArr.toString();
            }
            this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api/alarms",
                type: "GET",
                dataType: "JSON",
                parameters: {
                	levels:levelStr,
                	states:statusStr,
                	start_time: opt.startTime,
                    end_time: opt.endTime,
                },
                success: function(data) {
                    self.lastGetResroucesRequest = null;
//                    callback.call(context || this, data.result);
                    //var r = {"result":[{timestamp:3214567811242,siteName:"北京",level:2,sourceType:"2号机",sourceName:"燃油太少",desc:"燃油<1"}]};
                    callback.call(context || this, data.result);
                }
            });
        },
        
        getAlarmstop10: function(opt, callback, context) {
        	if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            var levelStr;
            if (opt.levelArr instanceof Array) {
            	levelStr = opt.levelArr.toString();
            }
            var statusStr;
            if (opt.statusArr instanceof Array) {
            	statusStr = opt.statusArr.toString();
            }
            this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api/alarms",
                type: "GET",
                dataType: "JSON",
                parameters: {
                	levels:levelStr,
                	states:statusStr,
                	//start_time: opt.startTime,
                    //end_time: opt.endTime,
                	start_time: 0,
                	end_time: (new Date).getTime(),
                    cursor : 0,
                    limit : 20,
                    verbose: 100,
                    
                },
                success: function(data) {
                    self.lastGetResroucesRequest = null;
                    var innerSelf = this;
                    cloud.Ajax.request({
                    	url: "api/alarms",
                    	type: "GET",
                    	dataType: "JSON",
                    	parameters: {
                        	start_time: 0,
                        	end_time: (new Date).getTime(),
                            cursor : 0,
                            limit : 1,
                            verbose: 1,
                            
                        },
                        success: function(_data) {
//                        	console.log(_data);
                        	data._total = _data.total;
                        	callback.call(context || innerSelf, data);
                        }
                    });
                    //callback.call(context || this, data.result);
                    //var r = {"result":[{timestamp:3214567811242,siteName:"北京",level:2,sourceType:"2号机",sourceName:"燃油太少",desc:"燃油<1"}]};
                    
                    //callback.call(context || this, data);
                },
                error : function(){
                    self.lastGetResroucesRequest = null;
                }
            });
        },

        sureAlarm:function(alarmId, callback, context){
            if (alarmId){
                cloud.Ajax.request({
                    url: "api/alarms/" + alarmId,
                    type: "put",
                    success: function(data) {
                        callback.call(context || this, data);
                    }
                });
            }
        },
        clearAlarm:function(alarmId, callback, context){
            if (alarmId){
                cloud.Ajax.request({
                    url: "api/alarms/" + alarmId,
                    type: "delete",
                    success: function(data) {
                        callback.call(context || this, data);
                    }
                });
            }
        },
        
        batchSure : function(ids, callback, context){
            if (ids){
                var i = 0;//已完成的请求计数
                var limit = ids.length;
                ids.each(function(id, index){
                    cloud.Ajax.request({
                        url: "api/alarms/" + id,
                        type: "put",
                        success: function(data) {
                            i++;
                            if (i == limit){
                                callback.call(context || this, data);
                            }
                        },
                        error : function(){
                            i++;
                            /*if (i == limit){
                                callback.call(context || this, data);
                            }*/
                        },
                        delay : 60
                    });
                })
            }
        },
        
        batchClear : function(ids, callback, context){
            if (ids){
                var i = 0;//已完成的请求计数
                var limit = ids.length;
                ids.each(function(id, index){
                    cloud.Ajax.request({
                        url: "api/alarms/" + id,
                        type: "delete",
                        success: function(data) {
                            i++;
                            if (i == limit){
                                callback.call(context || this, data);
                            }
                        },
                        error : function(){
                            i++;
                            /*if (i == limit){
                                callback.call(context || this, data);
                            }*/
                        },
                        delay : 60
                    });
                })
            }
        },
        
        handleQueryParams : function(){
            var result = {
                start_time: 0,
                end_time: parseInt(((new Date).getTime())/1000)
            };
            var params = this.queryParams;
            
            if (params){
                var levelStr, statusStr;
                if (params.levels instanceof Array) {
                    levelStr = params.levels.toString();
                    result.levels = levelStr;
                }
                if (params.status instanceof Array) {
                    statusStr = params.status.toString();
                    result.states = statusStr;
                }
                if(typeof params.site_name == "string") {
                	result.site_name = params.site_name;
                }
            };
            return result;
        },
        
        getTotal : function(callback, context){
//            console.log("service param", this.queryParams);
            var self = this;
            var queryParams = this.handleQueryParams();
            if (this.lastGetTotalRequest){
                this.lastGetTotalRequest.abort();
            }
            this.lastGetTotalRequest = cloud.Ajax.request({
                url: "api/alarms",
                type: "GET",
                dataType: "JSON",
                parameters: cloud.util.defaults(queryParams, {
//                    start_time: 0,
//                    end_time: (new Date).getTime(),
                    limit : 1,
                    verbose: 1
                }),
                success: function(data) {
                    self.lastGetTotalRequest = null;
//                    callback.call(context || this, data.result);
//                    var r = {"result":[{timestamp:3214567811242,siteName:"北京",level:2,sourceType:"2号机",sourceName:"燃油太少",desc:"燃油<1"}]};
                    callback.call(context || this, data.total);
                },
                error : function(){
                    self.lastGetTotalRequest = null;
                }
            });
        },
        
        getTableResourcesById: function(id,callback,context){
            var self = this;
            this.lastGetOneResReq = cloud.Ajax.request({
                url: "api/alarms/" + id,
                type: "GET",
                dataType: "JSON",
                parameters: {
                    verbose: 100
                },
                success: function(data) {
                    self.lastGetOneResReq = null;
                    callback.call(context || this, [data.result]);
                },
                error : function(){
                    self.lastGetOneResReq = null;
                }
            });
        },
        getTableResources : function(start, limit, callback, context){
            var self = this;
            var queryParams = this.handleQueryParams();
            if (this.lastGetTableResReq){
                this.lastGetTableResReq.abort();
            }
            this.lastGetTableResReq = cloud.Ajax.request({
                url: "api/alarms",
                type: "GET",
                dataType: "JSON",
                parameters: cloud.util.defaults(queryParams, {
                    
                    cursor : start,
                    limit : limit,
                    verbose: 100
                }),
                success: function(data) {
                    self.lastGetTableResReq = null;
//                    callback.call(context || this, data.result);
//                    var r = {"result":[{timestamp:3214567811242,siteName:"北京",level:2,sourceType:"2号机",sourceName:"燃油太少",desc:"燃油<1"}]};
                    callback.call(context || this, data);
                },
                error : function(){
                    self.lastGetTableResReq = null;
                }
            });
        }
    });

    return new Service();
    
});