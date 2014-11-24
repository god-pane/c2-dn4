define(function(require){
	require("cloud/base/cloud");
	var AgentCanvasTool = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.drawable = options.drawable;
			this.initModule();
//			this.initNum = 0;
		},
		
		initModule:function(){
			var data = this.drawable.getData();
		},
		
		onDataChanage:function(varValue){ 
//			if(this.initNum == 0){
//				this.initNum = 1;
//			}else if(this.initNum == 1){
//				this.initNum = 0;
//			} 
			
			if(varValue == 1){
				this.drawable.setImage(0, {el: 'switch-on'}, false);
			}else if(varValue == 0){
				this.drawable.setImage(0, {el: 'switch-off'}, false);
			}
		},
		
		destroy:function(){
			if(this.layout && (!this.layout.destroyed))this.layout.destroy();
		}
	});
	return AgentCanvasTool;
});