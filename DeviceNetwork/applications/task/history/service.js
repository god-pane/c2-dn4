define(function(require){
	var cloud = require("cloud/base/cloud");
	
	var Service = Class.create({
		
		getTasksList:function(opt,callback,context){
			if(this.lastGetResroucesRequest){
				this.lastGetResroucesRequest.abort();
			}
			
			var self = this;
			
			this.lastGetResroucesRequest = cloud.Ajax.request({
				url:"api2/tasks?user_types="+opt.ut+"&types="+opt.types+"&states="+opt.states,
				type:"get",
				parameters:{
					verbose:100
				},
				success:function(data){
					self.lastGetResroucesRequest = null;
					callback.call(context || this,data.result);
				}
				
			});
		},
		
		getTasksTableResourceById:function(ids,callback,context){
			if(this.lastGetResroucesRequest){
				this.lastGetResroucesRequest.abort();
			}
			
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
					callback.call(context || this,data.result);
				}
				
			});
		}
		
		
		
	});
	
	return new Service;
});