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
        getDeviceSum:function(callback){
			cloud.Ajax.request({
            	url: "api/devices",
                type: "get",
                dataType: "JSON",
                parameters: {
					limit:1
//					online:0
                },
                success: function(data) {
                    callback(data.total,data.online);
                }
            });
		},
		
		getFlowReports:function(name,status,cursor,limit,month,callback){
			var	parameters = {
                    name:name,
					online:status,
					verbose:100,
					cursor:cursor,
					limit:limit
				};
			if(!status){
				delete parameters.online;
			}
			cloud.Ajax.request({
            	url: "api/devices",
                type: "get",
                dataType: "JSON",
                parameters:parameters,
                success: function(devicesData) {
//                	console.log("devicesData",devicesData);
                	var ids = [];
                	var result = devicesData.result;
                	for(var num = 0;num<result.length;num++){
                		ids.push(result[num]["_id"]);
                	}
                	cloud.Ajax.request({
                    	url: "api/traffic_month/list",
                        type: "post",
                        dataType: "JSON",
                        parameters: {
                        	month:month
                        },
                        data:{resourceIds:ids},
                        success: function(flowData) {
//        					data.result.each(function(result){
//        						datas.each(function(datas){
//        							if(datas._id === result.deviceId.toLowerCase()){
//        								result.name = datas.name;
//        								result.siteName = datas.siteName;
//        								result.month = month;
////        								result.max = self.unitConversion(result.max);
////        								result.total = self.unitConversion(result.total);
////        								result.send = self.unitConversion(result.send);
////        								result.receive= self.unitConversion(result.receive);
//        							}
//        						});
//        					});
        					var devicesDataResult = devicesData.result;
        					var flowDataResult = flowData.result;
        					
        						var obj = [];
        						var tempObj={};
//        						obj = $.extend(devicesDataResult[_num],flowDataResult[_num]);
        						for(var i=0;i<devicesDataResult.length;i++){
        							for(var j=0;j<flowDataResult.length;j++){
        								if(devicesDataResult[i]._id==flowDataResult[j].deviceId.toLowerCase()){
        									tempObj=$.extend(devicesDataResult[i],flowDataResult[j]);
        									obj.push(tempObj);
        									break;
        								}
        							}
        						}       						
        					devicesData.result = obj;
//        					console.log(result);
        					if(callback){
        						callback(devicesData);
        					}
                        }
                    });
                }
            });
		},
		
        getDevicelist:function(opt,start,limit,callback){
			if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
        	var	obj = {
					online:opt,
					verbose:3,
					cursor:start,
					limit:limit
					};
			this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api/devices",
                type: "get",
                dataType: "JSON",
                parameters:obj,
                success: function(data) {
					self.lastGetResroucesRequest = null;
                	var d = data.result;
                	var reData = new Array();
                	for(var i = 0;i<d.length;i++){
                		reData[i]={
							_id:d[i]._id,
							name:d[i].name,
							siteName:d[i].siteName
						};
                	}
					var result={data:reData,total:data.total}
                	callback(result);
                }
            });
		},
		
        getflows: function(month,datas,callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
			var ids=datas.pluck("_id");
			
            this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api/traffic_month/list",
                type: "post",
                dataType: "JSON",
                parameters: {
                	month:month
                },
                data:{resourceIds:ids},
                success: function(data) {
                    self.lastGetResroucesRequest = null;
					data.result.each(function(result){
						datas.each(function(datas){
							if(datas._id === result.deviceId.toLowerCase()){
								result.name = datas.name;
								result.siteName = datas.siteName;
								result.month = month;
//								result.max = self.unitConversion(result.max);
//								result.total = self.unitConversion(result.total);
//								result.send = self.unitConversion(result.send);
//								result.receive= self.unitConversion(result.receive);
							}
						});
					});
//                    var r = {"result":[{"_id":"5163595670e74b91cc480cb9","siteName":"望京科技园测试现场","smartGateway":"1212sd3","monthSendFlow":2334.4,"monthReceiveFlow":12.123,"monthSumFlow":12123,"dayMaxFlow":1212.3,"month":201301}]};
                    callback.call(context || this, data.result);
                }
            });
        },
        
		unitConversion:function(opt){
            if ( typeof opt === "number"){
		        if(opt< 1024){
                    return opt.toFixed(0)+"B";
                }else if(opt< 1024*1024){
                    return (opt/1024).toFixed(3)+"KB";
                }else{
                    return (opt/1024/1024).toFixed(3)+"MB";
                }
		    }else{
		        return opt;
		    }
        },
        
		getDayFlows: function(opt,callback, context) {
			if (this.lastGetResroucesRequest) {
				this.lastGetResroucesRequest.abort();
			}
			var self = this;
			this.lastGetResroucesRequest = cloud.Ajax.request({
				url: "api/traffic_day",
				type: "get",
				dataType: "JSON",
				parameters: {
					month:opt.month,
					device_id:opt.deviceId
				},
				error: function(error) {
					self.lastGetResroucesRequest = null;
					callback.call(context || this, error.result);
				},
				success: function(data) {
					self.lastGetResroucesRequest = null;
					data.result.each(function(result){
//						result.receive = self.unitConversion(result.receive);
//						result.total = self.unitConversion(result.total);
//						result.send = self.unitConversion(result.send);
						date = result.date.toString();
						result.date = date.slice(0,4)+"/"+date.slice(4,6)+"/"+date.slice(6,8);
					})
					callback.call(context || this, data.result);
				}
			});
		}
    });

    return new Service();
    
});