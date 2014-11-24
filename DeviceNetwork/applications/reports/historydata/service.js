define(function(require) {
	require("cloud/base/cloud");
	
	var Service = Class.create({
		initialize: function() {
			//存储获取的设备列表资源
			this.data={};
		},
		//根据设备ID获取设备变量列表信息
		getDeviceVarList: function(id, successfn) {
			if(id) {
				Model.model({
					method:"query_one",
					part:id,
					param:{
						limit:0,
						verbose:100
					},
					success:successfn
				});
			}
			else {
				cloud.util.unmask("#right-table-box-1");
			}
		},
		
		//根据现场ID获取设备列表信息
		getDeviceList: function(id, successfn) {
			var self=this;
			Model.device({
				method:"query_list",
				param:{
					limit:0,
					site_id:id,
					verbose:100
				},
				success:function(gateWayData){
					Model.machine({
						method:"query_list",
						param:{
							limit:0,
							site_id:id,
							verbose:100
						},
						success:function(controllerData){
							controllerData.result.each(function(one){
								gateWayData.result.push(one);
							});
							self.data=gateWayData;
							successfn(self.data);
						}
					}); 
				}
			});
		},
		//根据设备ID和变量ID来获取历史趋势数据
		getVarDataHistory: function(st, et, varId, deviceId, successfn) {
			Model.history({
				method:"query_devices",
				param:{
					limit:0,
					start_time:st,
					end_time:et
				},
				data:{
					devices:[{
						varIds:[varId],
						deviceId:deviceId
					}]
				},
				success:successfn
			});
		},
		getVarListDataHistory: function(st, et, data, successfn) {
			Model.history({
				method:"query_devices",
				param:{
					limit:0,
					start_time:st,
					end_time:et
				},
				data:data,
				success:successfn
			});
		},
		//用设备ID获取变量的实时数据
		
		getDeviceVarRealTime: function(deviceVarIds, successfn) {
			var self=this;
			for(var i=0;i<self.data.result.length;i++){
				if(self.data.result[i]._id === deviceVarIds[0].deviceId){
					cloud.Ajax.request({
						url:"api/rt_data",
						type:"POST",
						data:{
							"devices":deviceVarIds
						},
						parameters:{
							limit:0,
							verbose:100
						},
						success:successfn
					});
					break;
				}				
			}
		}
//		getDeviceVarRealTime: function(deviceId, successfn) {
//			var self=this;
//			for(var i=0;i<self.data.result.length;i++){
//				if(self.data.result[i]._id===deviceId){
//					if(self.data.result[i].plcId!==0){
//						Model.realtime({
//							method:"query_machines",
//							part:deviceId,
//							param:{
//								limit:0,
//								verbose:100
//							},
//							success: successfn,
//						});
//					}
//					else{
//						Model.realtime({
//							method:"query_devices",
//							part:deviceId,
//							param:{
//								limit:0,
//								verbose:100
//							},
//							success: successfn,
//						});
//					}
//					break;
//				}				
//			}
//
//		}
	});
	
	return new Service();
});