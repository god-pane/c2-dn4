define(function(require) {
   var cloud = require("cloud/base/cloud");
    var Service = Class.create({
        initialize: function() {
        	this.type = "behavlog";
            this.resourceType = 3;
        	this.map = $H(this.map);
        	var self = this;
        	this.name = null;
        },

        getResourceType: function() {
            return this.resourceType;
        },
        getSites:function(opt,callback){
        	var name;
			cloud.Ajax.request({
            	url: "api/sites/"+opt,
                type: "get",
                dataType: "JSON",
                parameters:{
                	verbose:10
                },
                success: function(data) {
//                	callback(data.result.name);
                }
            });
			return name;
		},
		loadChartByResIds : function(resourceIds, startTime, endTime, callback, context){
            resourceIds = cloud.util.makeArray(resourceIds);
            var param = {};
            if (startTime){
                param.startTime = startTime
            }
            if (endTime){
                param.endTime = endTime
            }
            if (resourceIds.length > 0){
                cloud.Ajax.request({
                    url: "api/traffic",
                    type: "post",
                    parameters : param,
                    data: {
                        deviceIds: resourceIds
                    },
                    success: function(data) {
                        //data = {"result":[{"deviceId":"51b8f48770e725ed1f680cc6","onlineRate":[0.0,0.97727275,0.97727275,1.0,0.97727275,1.0,0.97727275,1.0,0.97727275,1.0,0.8863636,0.0,0.0,0.0,0.0,0.0,0.4318182,1.0,0.97727275,1.0,0.97727275,1.0,0.97727275,1.0],"timestamps":[1371075729,1371075772,1371075815,1371075859,1371075902,1371075946,1371075989,1371076033,1371076076,1371076120,1371076163,1371076207,1371076250,1371076294,1371076337,1371076381,1371076424,1371076468,1371076511,1371076555,1371076598,1371076642,1371076685,1371076729]}]}
//                      console.log(data, "data")
                        if (data.result){
                            var result = $A(data.result);
                            result.each(function(one){
                                var dataArr = $A();
                                $A(one.traffic).each(function(rate){
                                    var pointDatastart = [1000 * rate[1]+1, rate[0]];
                                    dataArr.push(pointDatastart);
                                    var pointDataend = [1000 * rate[2], rate[0]];
                                    dataArr.push(pointDataend);
                                })
                                one.data = dataArr;
                                one.resourceId = one.deviceId.toLowerCase();
                            });
                        }  
//						 console.log(data, "data") 
                        callback && (callback.call(context || this, data.result));
                    }
                });
            }
        },
        getFlowChartData:function(opt,callback){
        	var self = this;
			cloud.Ajax.request({
            	url: "api/traffic",
                type: "post",
                dataType: "JSON",
                parameters: {
					startTime:opt.startTime,
					endTime:opt.endTime
                },
                data:{
                	deviceIds:opt.datas
                	},
                success: function(data) {
//                	var r = [{"traffic":[[1,1234567890000,1234577890000],[25,1234567890000,1234577890000],[32,1234567890000,1234577890000],[22,1234567890000,1234577890000]],"deviceId":"516b5e4970e71ea446c55912"},{"traffic":[[3,1234567890000,1234577890000],[4,1234567890000,1234577890000],[3,1234567890000,1234577890000],[4,1234567890000,1234577890000]],"deviceId":"516b600570e71ea446c55916"}];
//                	var tt = [{name : "19:00到20:00", y : 12},{name : "20:00到21:00", y : 123},{name : "22:00到23:00", y : 110}];
					var r = [];
					var numb = opt.numb;
					if(numb == 1){
						numb = 24;
					}
					var date = new Date();
					var time = date.getTime() - 86400000;
                	for(var i = 0;i<opt.datas.length;i++){
                		var traffic = [];
                		var objc = {};
                			for(var k = 0;k<numb;k++){
                				var ic = [];
                				ic[0] = Math.random() * 10;
                				ic[1] = time;
                				ic[2] = time;
                				time = time + 3600000;
                				traffic.push(ic);
                			}
                			objc["traffic"] = traffic;
                			objc["deviceId"] = "asdfwe23sd2a";
                		r.push(objc);
                	}
                	var i,j,tempAr,te;
					var tearr = [];
                	for(var i = 0;i<r.length;i++){
                		var arr = [];
                		for(var j = 0;j< r[i].traffic.length;j++){
                			tempAr = r[i].traffic[j];
                			var time = cloud.util.dateFormat(new Date(parseInt(tempAr[2]/1000)), "yy/MM/dd hh:mm:ss");
                			te = {name :time, y : tempAr[0]};
                			arr.push(te);
                		}
                		var deviceid = r[i].deviceId;
//                		var tt = self.getSites(deviceid,function(data){
////                		});
                		tearr.push({name:'2',data:arr});
                		
                	}
                	callback(tearr);
                }
            });
		},
        getDeviceSum:function(callback){
			this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api/devices",
                type: "get",
                dataType: "JSON",
                parameters: {
//					online:0,
					limit:1
                },
                success: function(data) {
                    callback(data.total,data.online);
                }
            });
		},
        getDevicelist:function(opt,name,start,limit,callback,context){
        	if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
			obj = {
                    name:name,
	               	verbose:3,
					cursor:start,
					limit:limit,
					online:opt
	              };
			if(!opt){
				delete obj.online
			}
        	this.lastGetResroucesRequest = cloud.Ajax.request({
	            	url: "api/devices",
	                type: "get",
	                dataType: "JSON",
	                parameters:obj,
	                success: function(data) {
	//                	callback(data.result);
	                	self.lastGetResroucesRequest = null;
//	                	if(data.result.length == 0){
//	                		context.clearTableData();
//	                	}
	                	callback.call(context || this, data);
	                }
	            });
		},
        getflows: function(opt,callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            this.lastGetResroucesRequest = cloud.Ajax.request({
            	url: "api/traffic_month",
                type: "post",
                dataType: "JSON",
                parameters: {
                	month:opt.month
                },
                data:{deviceIds:opt.datas},
                success: function(data) {
                    self.lastGetResroucesRequest = null;
                    var r = {"result":[{"_id":"5163595670e74b91cc480cb9","siteName":"望京科技园测试现场","smartGateway":"1212sd3","monthSendFlow":2334.4,"monthReceiveFlow":12.123,"monthSumFlow":12123,"dayMaxFlow":1212.3,"month":201301}]};
                    callback.call(context || this, r.result);
                }
            });
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
					month:opt.mon,
					device_id:opt.deviceid
				},
//				data:{deviceIds:opt.datas},
				success: function(data) {
					self.lastGetResroucesRequest = null;
					var r = {"result":[{"_id":"asdf3212332sd", "total":2313123, "send":132156, "date":3216546, "receive":3216, "deviceId":"asd32132"}]};
					callback.call(context || this, r.result);
				}
			});
		}
    });

    return new Service();
    
});