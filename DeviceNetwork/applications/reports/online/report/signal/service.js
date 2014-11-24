define(function(require){
require("cloud/base/cloud");
	
	var Service = Class.create({
		initialize: function() {
			
		},
		getSignal:function(st, et,id,successfn){
			Model.statistics({
				method:"query_signal",
				param:{
					start_time:st,
					end_time:et
				},
				data:{
					resourceIds:[id]
				},
				success:successfn
			});
		},
		getOnline:function(st, et,id,successfn){
			Model.statistics({
				method:"query_online_trend",
				param:{
					start_time:st,
					end_time:et
				},
				data:{
					resourceIds:[id]
				},
				success:successfn
			});
		}
	});
	return new Service();
});