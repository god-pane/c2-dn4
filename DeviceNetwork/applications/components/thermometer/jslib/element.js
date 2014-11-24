define(function(require){
	require("cloud/base/cloud");
	var AgentCanvasTool = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.drawable = options.drawable;
			this.divTextValue = -30;
			this.height=null;
			this.rangeHeight=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 220) : 220;
			this.top=null;
			this.refreshTimerId = null;
			this.flag=false;
			this.flagmin=false;
			this.render();
		},
		
		render:function(){
			var el = $("#"+this.drawable.id).length;
			if(el > 0){
			}else{
				var thermometer=this.drawable.id;
				var thermometerObj=document.getElementById(thermometer);
				thermometerObj = document.createElement("div");
				thermometerObj.id = thermometer;
				thermometerObj.style.display = 'none';
				document.body.appendChild(thermometerObj);
			}
			
			var el_value = $("#"+this.drawable.id+"_value").length;
			if(el_value > 0){
				
			}else{
				var thermometer_value=this.drawable.id+"_value";
				var thermometer_valueObj=document.getElementById(thermometer_value);
				thermometer_valueObj = document.createElement("div");
				thermometer_valueObj.id = thermometer_value;
				thermometer_valueObj.style.display = 'none';
				document.body.appendChild(thermometer_valueObj);
			}
			
		},
		onDataChanage:function(varValue){
			var self=this;
			var point=this.drawable.board.point;
			this.drawable.setImage(0, {el: 'thermometer-self'}, false);
			if(!this.drawable.board.editable){
				this.refreshTimerId =setInterval(function(){
					self.change(varValue);
				},50);
			}
		},
		change:function(varValue){
			var self=this;
			var point = self.drawable.board.point;
			var divText = self.divTextValue;
			var con = self.drawable.displayScale ? parseInt((self.drawable.displayScale/100) * 48) : 48;
			var height=self.drawable.displayScale ? parseInt((self.drawable.displayScale/100) * self.drawable.height) : self.drawable.height;
			var width=self.drawable.displayScale ? parseInt((self.drawable.displayScale/100) * self.drawable.width) : self.drawable.width;
			var div_width=self.drawable.displayScale ? parseInt((self.drawable.displayScale/100) * 12) : 12;
			var red_width=self.drawable.displayScale ? parseInt((self.drawable.displayScale/100) * 2) : 2;
			var range=self.rangeHeight/(self.drawable.maxValue-self.drawable.minValue);
			
			if(self.height){
			}else{
				self.height=0;
			}
			if(self.top){
			}else{
				self.top=self.drawable.y+point.top+height-con;
			}
			
			if(varValue > self.drawable.maxValue){//变量的值超过温度计的最大值
				if(parseInt(self.height) == (self.drawable.maxValue - self.drawable.minValue) * range || (parseInt(self.height)+1) == (self.drawable.maxValue - self.drawable.minValue) * range){
					self.divTextValue=varValue;
					window.clearInterval(self.refreshTimerId);
					self.flag=true;
				}else if(parseInt(self.height) < (self.drawable.maxValue - self.drawable.minValue) * range - 1){
					self.height += range;
					self.divTextValue =parseInt(self.divTextValue) + 1;
					if(self.top){
						self.top=self.top-range;
					}
				}else{
					window.clearInterval(self.refreshTimerId);
				}
			}else if(varValue < self.drawable.minValue){//变量的值小于温度计的最小值
				    self.divTextValue=varValue;
				    if(self.flagmin){
						this.drawable.defaultValue = parseInt(this.drawable.minValue);
						self.flagmin=false;
					}
				    window.clearInterval(self.refreshTimerId);
			}else{
				if(parseInt(self.height) == parseInt((varValue - self.drawable.minValue) * range)){
					self.divTextValue = varValue;
					window.clearInterval(self.refreshTimerId);
				}else if(parseInt(self.height) < parseInt((varValue - self.drawable.minValue) * range)){
					if((parseInt(self.height) +range) > parseInt((varValue - self.drawable.minValue) * range)){
						self.height = parseInt((varValue - self.drawable.minValue) * range);
						self.divTextValue = varValue;
					}else{
						self.height += range;
						self.divTextValue =parseInt(self.divTextValue) + 1;
					}
					if(self.top){
						self.top=self.top-range;
					}
				}else if(parseInt(self.height) > parseInt((varValue - self.drawable.minValue) * range)){
					if((parseInt(self.height) -range) < parseInt((varValue - self.drawable.minValue) * range)){
						self.height = parseInt((varValue - self.drawable.minValue) * range);
						self.divTextValue = varValue;
					}else{
					    self.height =self.height - range;
					   if(self.flag){
						  self.divTextValue = self.drawable.maxValue;
						  self.flag=false;
					   }
					   self.divTextValue =parseInt(self.divTextValue) - 1;
					}
					if(self.top){
					   self.top += range;
					}
				}
				
			}
			//设置玻璃棒的样式
			$("#"+self.drawable.id).css("left",self.drawable.x+point.left+width/2-red_width);
			$("#"+self.drawable.id).css("top",self.top);
			$("#"+self.drawable.id).css("width",div_width);
			$("#"+self.drawable.id).css("height",self.height);
			$("#"+self.drawable.id).css("border","1px");
			$("#"+self.drawable.id).css("position","absolute");
			$("#"+self.drawable.id).css("background","#EE362E");
			$("#"+self.drawable.id).addClass("canvas-thermometer");
			$("#"+self.drawable.id).css("display","block");
			//设置呈现温度计度数的DIV样式
			$("#"+self.drawable.id+"_value").text(divText+"℃");
			$("#"+self.drawable.id+"_value").css("left",self.drawable.x+point.left+width/2-2);
			$("#"+self.drawable.id+"_value").css("top",self.top-30);
			$("#"+self.drawable.id+"_value").css("width","55px");
			$("#"+self.drawable.id+"_value").css("height","25px");
			$("#"+self.drawable.id+"_value").css("position","absolute");
			$("#"+self.drawable.id+"_value").css("color","#F00");
			$("#"+self.drawable.id+"_value").addClass("canvas-thermometer");
			$("#"+self.drawable.id+"_value").css("display","block");
		},
		clearTimer:function(){
			var self=this;
			$("#"+self.drawable.id).css("display","none");
			$("#"+self.drawable.id+"_value").css("display","none");
			window.clearInterval(self.refreshTimerId);
		},
		destroy:function(){
			if(this.layout && (!this.layout.destroyed))this.layout.destroy();
		}
	});
	return AgentCanvasTool;
});