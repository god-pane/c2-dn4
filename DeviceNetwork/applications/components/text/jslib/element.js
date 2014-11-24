define(function(require){
	require("cloud/base/cloud");
	var AgentCanvasTool = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.drawable = options.drawable;
			this.initModule();
		},
		
		initModule:function(){
			var data = this.drawable.getData();
		},
		
		onDataChanage:function(varValue){
			this.drawable.setTitle(1, {text: String.format('{0}{1}', varValue, '')}, false);
		},
		
		destroy:function(){
			if(this.layout && (!this.layout.destroyed))this.layout.destroy();
		}
	});
	return AgentCanvasTool;
});




