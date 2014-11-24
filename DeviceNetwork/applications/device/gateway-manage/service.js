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

        getModelByModelId: function(modelId,callback,context) {
        	var self = this;
        	var model = null;
        	cloud.Ajax.request({
    			url: "api/models/"+modelId,
    			async: false,
    			type: "GET",
    			dataType: "JSON",
    			success: function(data) {
    				model = data.result;
    				callback.call(context || this, model);
    			}
    		});
        },

        getConfigPolicyList: function(modelId,callback, context) {
            if (this.getConfigPolicyListRequest) {
                this.getConfigPolicyListRequest.abort();
            }
            var self = this;
            
            var result={"_id":modelId,"name":"IR713测试","model":51};
            callback.call(context || this, result);
            // this.getConfigPolicyListRequest = cloud.Ajax.request({
            //     url: "api/config/list",
            //     type: "get",
            //     parameters: {
            //         verbose: 1,
            //     },
            //     data: {
            //     },
            //     success: function(data) {
            //         self.getConfigPolicyListRequest = null;
            //         callback.call(context || this, data.result);
            //     }
            // });
        },

        getResources: function(ids, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            this.lastGetResroucesRequest = cloud.Ajax.request({
                url: "api/devices/list",
                type: "post",
                parameters: {
					limit:0,
                    verbose: 100
                },
                data: {
                    resourceIds: ids
                },
                success: function(data) {
                    self.lastGetResroucesRequest = null;
                    callback.call(context || this, data.result);
                },
                error : function(data){
                	self.lastGetResroucesRequest = null;
                }
            });
        },

        /**
        *options:{"model":xxx,"deviceList":[xxxxx],"sms":xxx,"savePolicy":xxx,"config":xxxx}
        */
        issuedConfigParmas:function(options,callback,context){
            if (this.lastIssuedConfigRequest) {
                this.lastIssuedConfigRequest.abort();
            }
            var self = this;
            this.lastIssuedConfigRequest = cloud.Ajax.request({
                url: "api/config",
                type: "post",
                parameters: {
                	gateway_type:options.gatewayType,
                	issue_method:options.issueMethod,
                    save : options.savePolicy,
                    name : options.name,
                    model : encodeURIComponent(options.model.name)
                },
                data: {
                    resourceIds:options.deviceList,
                    config:options.config
                },
                success: function(data) {
                    self.lastIssuedConfigRequest = null;
                    callback.call(context || this, data.result);
                }
            });
        },
		getConfigPolicy:function(PolicyId,callback){
			if (this.getConfigPolicyRequest) {
                this.getConfigPolicyRequest.abort();
            }
            var self = this;
            this.getConfigPolicyRequest = cloud.Ajax.request({
                url: "api/config/"+PolicyId,
                type: "get",
				parameters: {
					verbose : 100
				},
                success: function(data) {
                    self.getConfigPolicyRequest = null;
                    if (Object.isFunction(callback)) {
                        callback.call(self, data.result);
                    }
                }
            });
		},
		getPolicyList:function(modelName,callback){
			if (this.getPolicyListRequest) {
                this.getPolicyListRequest.abort();
            }
            var self = this;
            this.getPolicyListRequest = cloud.Ajax.request({
                url: "api/config",
                type: "get",
                parameters: {
					model:modelName
                },
                success: function(data) {
                    self.getPolicyListRequest = null;
                    if (Object.isFunction(callback)) {
                        callback.call(self, data.result);
                    }
                }
            });
		},
		
		getPolicyListByParams:function(params,callback, context){
            var self = this;
            this.getDeviceConfigRequest = cloud.Ajax.request({
                url: "api/config",
                type: "get",
                parameters : params,
                success: function(data) {
                    if (Object.isFunction(callback)) {
                        callback.call(context || this, data.result);
                    }
                }
            });
		},
		deleteConfigPolicy:function(policyId,callback){
			if (this.getDeviceConfigRequest) {
                this.getDeviceConfigRequest.abort();
            }
			cloud.Ajax.request({
				url:"api/config/"+policyId,
				type:"delete",
				success:function(data){
					self.getDeviceConfigRequest = null;
					if (Object.isFunction(callback)) {
                        callback();
                    } 
				}
			});
		},
		updateConfigPolicy:function(configScheme,policyId,callback){
			if (this.getDeviceConfigRequest) {
                this.getDeviceConfigRequest.abort();
            }
			cloud.Ajax.request({
				url:"api/config/"+policyId,
				type:"put",
				data:{
//					policyName:
					sourcePolicy:configScheme
				},
				success:function(data){
					self.getDeviceConfigRequest = null;
					if (Object.isFunction(callback)) {
                        callback();
                    } 
				}
			});
		},

        getDeviceConfig: function(options,successCallback, errorCallback, context){
           if (this.getDeviceConfigRequest) {
                this.getDeviceConfigRequest.abort();
//                this.getDeviceConfigRequest = null;
            }
            var self = this;
            this.getDeviceConfigRequest = cloud.Ajax.request({
                url: "api/config/current",
                type: "post",
                parameters: {
                    verbose:100,
                    types:4,
                    states:3
                },
                data: {
                    resourceIds:options.resources
                },
                success: function(data) {
                    self.getDeviceConfigRequest = null;
                    successCallback.call(context || this, data.result);
                },
                error : function(data){
                	self.getDeviceConfigRequest = null;
                	errorCallback.call(context || this, data);
                }
            });
        },
		

        /**
        *options:{"deviceId":xxx,"deviceName":[xxxxx]}
        */
        submitGetConfigTask:function(options,callback,context){
            if (this.lastSubmitGetConfigTaskRequest) {
                this.lastSubmitGetConfigTaskRequest.abort();
            }
            var self = this;
            this.lastSubmitGetConfigTaskRequest = cloud.Ajax.request({
                url: "api2/tasks",
                type: "post",
                parameters: {
                    verbose:20
                },
                data: {
                    objectId:options.deviceId,
                    objectName:options.deviceName,
                    userType:1,
                    name : "get Device(ID,"+options.deviceId+") Config",
                    type:4,
                    priority:40
                },
                success: function(data) {
                    self.lastSubmitGetConfigTaskRequest = null;
                    callback.call(context || this, data.result);
                }
            });
        },

        getTaskState:function(ids,callback,context){
            if (this.lastGetTaskStateRequest) {
                this.lastGetTaskStateRequest.abort();
            }
            var self = this;
            this.lastGetTaskStateRequest = cloud.Ajax.request({
                url: "api2/tasks/"+ids,
                type: "get",
                parameters: {
                    verbose:50
                },
                data: {
                },
                success: function(data) {
                    self.lastGetTaskStateRequest = null;
                    callback.call(context || this, data.result);
                }
            });
        }


    });

    return new Service();
    
});