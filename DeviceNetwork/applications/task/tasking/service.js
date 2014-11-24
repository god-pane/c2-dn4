define(function(require){
	var cloud = require("cloud/base/cloud");
	
	var transLocale = function(one){
		var taskDeviceName = one.objectName;
		var taskType = one.type;
		if(taskDeviceName){
			if(taskDeviceName.length > 10){
				taskDeviceName = taskDeviceName.substr(0,3) + "..." + taskDeviceName.substr(taskDeviceName.length - 4,taskDeviceName.length - 1);
			}
		}
		if(taskType){
			switch (taskType) {
				case 1:
					taskType = locale.get("run_config_apply");
					break;
				case 2:
					taskType = locale.get("interactive_command");
					break;
				case 3:
					taskType = locale.get("ovdp_config");
					break;
				case 4:
					taskType = locale.get("get_running_config");
					break;
				case 6:
					taskType = locale.get("import_upgrade_file");
					break;
				case 8:
					taskType = locale.get("get_formatting_parameters");
					break;
				case 9:
					taskType = locale.get("device_function_test");
					break;
				case 10:
					taskType = locale.get("evt_files");
					break;
				case 11:
					taskType = locale.get("inrouter_certificate_profile");
					break;
				case 12:
					taskType = locale.get("vpn_temporary_channel_config");
					break;
				case 13:
					taskType = locale.get("vpn_link_order");
					break;
				case 14:
					taskType = locale.get("zip_format_config_file");
					break;
				case 15:
					taskType = locale.get("periodic_cleaning_access_token");
					break;
				case 16:
					taskType = locale.get("cost_timing_statistics");
					break;
				case 17:
					taskType =  locale.get("visit_timing_statistics");
					break;
				case 18:
					taskType = locale.get("flow_timing_statistics");
					break;
				case 19:
					taskType = locale.get("channel_status_timing_update");
					break;
				case 20:
					taskType = locale.get("Idle_task_timing_notice");
					break;
				default:
					return locale.get("error");
					break;
			}
			one.type = taskType;
			one.name = (taskDeviceName ? taskDeviceName : one.objectName) + "_" + taskType;
		}
//		var localeName = locale.get(one.name.replace(/ /g, "_"));
//		one.name = localeName ? localeName : one.name;
	};
	
	var Service = Class.create({
		
		getTasksList:function(opt,start,limit,callback,context){
			if(this.lastGetResroucesRequest){
				this.lastGetResroucesRequest.abort();
			}
			
			var self = this;
			
			this.lastGetResroucesRequest = cloud.Ajax.request({
				url:"api2/tasks?user_types="+opt.ut+"&types="+opt.types+"&states="+opt.states,
				type:"get",
				parameters:{
					verbose:100,
					cursor:start,
					limit:limit
				},
				success:function(data){
					data.result.total = data.total;
					data.result.cursor = data.cursor;
					self.lastGetResroucesRequest = null;
					
					$A(data.result).each(transLocale);
					
					callback.call(context || this,data.result);
				}
				
			});
		},
//		getPageTasks:function(start,limit,callback,context){
//			if(this.lastGetResroucesRequest){
//				this.lastGetResroucesRequest.abort();
//			}
//			
//			var self = this;
//			
//			this.lastGetResroucesRequest = cloud.Ajax.request({
//				url:"api2/tasks",
//				type:"get",
//				parameters:{
//					verbose:100,
//					cursor:start,
//					limit:limit
//				},
//				success:function(data){
//					console.log(data);
//					data.result.total = data.total
//					self.lastGetResroucesRequest = null;
//					callback.call(context || this,data.result);
//				}
//				
//			});
//		},
		
		getTasksTableResourceById:function(ids,callback,context){
//			if(!noAutoAbort && this.lastGetResroucesRequest){
//				this.lastGetResroucesRequest.abort();
//			}
			
			var self = this;
			ids = cloud.util.makeArray(ids);
			this.lastGetResroucesRequest = cloud.Ajax.request({
				url:"api2/tasks/list",
				type:"post",
				parameters:{
					verbose:100,
					limit:0
				},
				data:{
					resourceIds:ids
				},
				success:function(data){
					self.lastGetResroucesRequest = null;
					
					$A(data.result).each(transLocale);
					
					callback.call(context || this,data.result);
				}
				
			});
		}
	});
	
	return new Service;
});