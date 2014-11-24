define(function(require){
	require("cloud/base/cloud");
	var AgentCanvasTool = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.drawable = options.drawable;
			this.initModule();
			this.initNum = 0;
		},
		
		initModule:function(){
			var data = this.drawable.getData();
		},
		
		onDataChanage:function(varValue){
			
//			var images = this.drawable.images;
//			var el = null;
//			for(var i=0;i<images.length;i++){
//				var image = images[i];
////				console.log(image["var"]);
//				if(varValue == image["var"]){
//					el = image.el;
//				}
//			}
//			
//			if(el){
//				this.drawable.setImage(0, {el: el}, false);
//			}
			if(this.initNum == 0){
				this.initNum = 1;
			}else if(this.initNum == 1){
				this.initNum = 2;
			}else{
				this.initNum = 0;
			}
			
			if(this.initNum == 1){
				this.drawable.setImage(0, {el: 'tree-twotrunks'}, false);
			}else if(this.initNum == 0){
				this.drawable.setImage(0, {el: 'smalltree'}, false);
			}else{
				this.drawable.setImage(0, {el: 'bomb'}, false);
			}
		},
		
		destroy:function(){
			if(this.layout && (!this.layout.destroyed))this.layout.destroy();
		}
	});
	return AgentCanvasTool;
});