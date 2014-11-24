define(function(require){
	require("cloud/base/cloud");
	var AgentCanvasTool = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.drawable = options.drawable;
			this.canvasHeight=this.drawable.board.canvas.height;//画布的高度
			this.canvasWidth=this.drawable.board.canvas.width;//画布的宽度
			this.circle = null;//中心点
			this.initAngle = null;//指针的初始位置
			this.refreshTimerId = null;//定时器
			this.flag=false;
			this.flagmin=false;
			this.render();
		},
		render:function(){
			this.manaDrawable();
			this.initModule();
		},
		manaDrawable:function(){
			if(this.drawable.board.sortedDrawables){
				for(var i = 0; i < this.drawable.board.sortedDrawables.length; i++){
					var draw = this.drawable.board.sortedDrawables[i];
					if(this.drawable.id == draw.id){
						var circle={};
						if(this.drawable.x){
							circle.x=this.drawable.x;
						}else{
							circle.x=this.canvasWidth/2;
						}
						if(this.drawable.y){
							circle.y=this.drawable.y;
						}else{
							circle.y=this.canvasHeight/2;
						}
						circle.radius=100;
						var dashboard = {};
						dashboard.circle = circle;
						this.drawable.dashboard = dashboard;
					}
				}
			}
		},
		initModule:function(draw){
			var width=(this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * (this.drawable.width/2)) : this.drawable.width/2);
			var height=(this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * (this.drawable.height/2)) : this.drawable.height/2);
			this.circle = {
				        x: this.drawable.x ? this.drawable.x + width: this.canvasWidth/2,
	                    y: this.drawable.y ? this.drawable.y + height : this.canvasHeight/2,
	                    radius: this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 65) : 65
	                   };
			
            if(this.initAngle){
			}else{
				this.initAngle = -Math.PI;//指针的初始位置  最小值
			}
          
			//this.drawable.board.canvas.ctx2d.save();
			this.drawDial();//绘制仪表盘
			//this.drawable.board.canvas.ctx2d.restore();
		},
		drawDial:function(){
			this.drawLine();
			this.drawCentroidGuidewire();//画指针
			//this.drawCentroid();//画中心点
			//this.drawRing();//画外圈
			this.drawTickInnerCircle();
			if(this.drawable.minValue == 0){//最小值为0
				if(this.drawable.maxValue && this.drawable.aliquots){
					this.drawTicks();//画刻度
				}
			}else if(this.drawable.maxValue == 0){//最大值为0
				if(this.drawable.minValue && this.drawable.aliquots){
					this.drawTicks();//画刻度
				}
			}else{//最小值最大值不为0
				if(this.drawable.minValue && this.drawable.maxValue && this.drawable.aliquots){
					this.drawTicks();//画刻度
				}
			}
		},
		drawLine:function(){ 
			var x1=this.circle.x-(this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 80) : 80);
			var y1=this.circle.y+(this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 20) : 20);
			var x2=this.circle.x+(this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 80) : 80);
			var y2=this.circle.y+(this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 20) : 20);
			
			//this.drawable.board.canvas.ctx2d.beginPath();
			this.drawable.board.canvas.ctx2d.strokeStyle="grey";
			this.drawable.board.canvas.ctx2d.lineWidth = this.drawable.displayScale ? (this.drawable.displayScale/100) * 0.3 : 0.3; 
			this.drawable.board.canvas.ctx2d.moveTo(x1,y1);
			this.drawable.board.canvas.ctx2d.lineTo(x2,y2);
			//this.drawable.board.canvas.ctx2d.stroke();
		},
		drawCentroidGuidewire:function(){
			var size=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 65) : 65;
			var centerpinRadius=this.drawable.displayScale ? (this.drawable.displayScale/100) * 13.6 : 13.6;
			var HALFPI=this.drawable.displayScale ? (this.drawable.displayScale/100) * 1.5707963267948966 : 1.5707963267948966;
			var constant=this.drawable.displayScale ? (this.drawable.displayScale/100) * 0.5 : 0.5;
			
			this.drawable.board.canvas.ctx2d.lineWidth = this.drawable.displayScale ? (this.drawable.displayScale/100) * 0.5 : 0.5;
			this.drawable.board.canvas.ctx2d.strokeStyle = 'gray';   
			this.drawable.board.canvas.ctx2d.fillStyle = '#D5604D';

			this.drawable.board.canvas.ctx2d.beginPath();
//			this.drawable.board.canvas.ctx2d.save();
			
			this.drawable.board.canvas.ctx2d.arc(this.circle.x, this.circle.y, size,this.initAngle,this.initAngle+ 0.00001, false);
			this.drawable.board.canvas.ctx2d.arc(this.circle.x, this.circle.y, centerpinRadius * constant, this.initAngle + HALFPI, this.initAngle + 0.00001 + HALFPI, false);
			this.drawable.board.canvas.ctx2d.arc(this.circle.x, this.circle.y, centerpinRadius * constant, this.initAngle - HALFPI, this.initAngle - 0.00001 - HALFPI, false);
			
			this.drawable.board.canvas.ctx2d.stroke();
			this.drawable.board.canvas.ctx2d.fill();
//			this.drawable.board.canvas.ctx2d.restore();
		},
//		drawCentroid:function(){
//			var offset = this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 7) :7;
//			var CENTROID_RADIUS=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 11) :11;
//			//绘制渐变色彩
//			var grad = this.drawable.board.canvas.ctx2d.createRadialGradient(this.circle.x + offset, this.circle.y - offset, 0, this.circle.x + offset, this.circle.y - offset, 25);
//			grad.addColorStop(0, '#ddf');
//			grad.addColorStop(1, 'blue');
//			   
//			this.drawable.board.canvas.ctx2d.beginPath();
//			this.drawable.board.canvas.ctx2d.save();
//			   
//			this.drawable.board.canvas.ctx2d.fillStyle = grad;
//			this.drawable.board.canvas.ctx2d.arc(this.circle.x, this.circle.y,CENTROID_RADIUS, 0, Math.PI*2, false);
//			this.drawable.board.canvas.ctx2d.stroke();
//			this.drawable.board.canvas.ctx2d.fill();
//			this.drawable.board.canvas.ctx2d.restore();
//		},
//		drawRing:function(){
//			var RING_INNER_RADIUS=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 35) :35;
//			this.drawRingOuterCircle();
//			this.drawable.board.canvas.ctx2d.strokeStyle = '#ccc';
//			this.drawable.board.canvas.ctx2d.arc(this.circle.x, this.circle.y,this.circle.radius + RING_INNER_RADIUS,0, Math.PI*2, false);
//
//			this.drawable.board.canvas.ctx2d.fillStyle = '#f1f1f1';
//			this.drawable.board.canvas.ctx2d.fill();
//			this.drawable.board.canvas.ctx2d.stroke();
//		},
//		drawRingOuterCircle:function(){
//			var RING_OUTER_RADIUS=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 45) :45;
//			this.drawable.board.canvas.ctx2d.shadowColor = 'rgba(0, 0, 0, 0.7)';//阴影的颜色
//			this.drawable.board.canvas.ctx2d.shadowOffsetX = 1;//设置或返回形状与阴影的水平距离
//			this.drawable.board.canvas.ctx2d.shadowOffsetY = 1;
//			this.drawable.board.canvas.ctx2d.shadowBlur = 6;//模糊级数
//			this.drawable.board.canvas.ctx2d.strokeStyle = 'rgba(100, 140, 230, 0.5)';
//			
//			this.drawable.board.canvas.ctx2d.beginPath();
//			this.drawable.board.canvas.ctx2d.arc(this.circle.x, this.circle.y, this.circle.radius +RING_OUTER_RADIUS, 0, Math.PI*2, true);
//			this.drawable.board.canvas.ctx2d.stroke();
//		},
		drawTickInnerCircle:function(){
			var RING_INNER_RADIUS=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 10) :10;
			var TICK_WIDTH=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 10) :10;
			
			this.drawable.board.canvas.ctx2d.beginPath();
			this.drawable.board.canvas.ctx2d.save();
			this.drawable.board.canvas.ctx2d.strokeStyle = 'rgba(0, 0, 0, 0.1)';
			this.drawable.board.canvas.ctx2d.arc(this.circle.x, this.circle.y,this.circle.radius + RING_INNER_RADIUS - TICK_WIDTH,0, Math.PI*2, false);
			this.drawable.board.canvas.ctx2d.stroke();
			this.drawable.board.canvas.ctx2d.restore();
		},
		drawTicks:function(){ 
			var RING_INNER_RADIUS=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 10) :10;
			var radius = this.circle.radius + RING_INNER_RADIUS,
			   ANGLE_MAX = 0.01,
		       //ANGLE_DELTA = Math.PI/(this.drawable.maxValue - this.drawable.minValue),//量程=最大值-最小值
			   ANGLE_DELTA = Math.PI/(this.drawable.aliquots*2),
		       tickWidth;
			this.drawable.board.canvas.ctx2d.beginPath();
			this.drawable.board.canvas.ctx2d.save();
			this.drawable.board.canvas.ctx2d.strokeStyle = 'black';
		    for (var angle = -Math.PI, cnt = 0;angle < ANGLE_MAX;angle += ANGLE_DELTA, cnt+=this.drawable.aliquots) {
		       this.drawTick(angle, radius, cnt); 
		    }
		    this.drawable.board.canvas.ctx2d.restore();
		},
		drawTick:function(angle, radius, cnt){
			 var TICK_WIDTH=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 10) :10;
			// var variate=(this.drawable.maxValue - this.drawable.minValue)/this.drawable.aliquots;//variate=量程/等分
			 var variate=this.drawable.aliquots*2
			 var tickWidth = cnt % variate === 0 ? TICK_WIDTH : TICK_WIDTH/2;  
			 
			 this.drawable.board.canvas.ctx2d.beginPath();
			// this.drawable.board.canvas.ctx2d.save();
			 this.drawable.board.canvas.ctx2d.moveTo(this.circle.x + Math.cos(angle) * (radius - tickWidth),this.circle.y + Math.sin(angle) * (radius - tickWidth));
			 this.drawable.board.canvas.ctx2d.lineTo(this.circle.x + Math.cos(angle) * (radius),this.circle.y + Math.sin(angle) * (radius));
			
			 this.drawable.board.canvas.ctx2d.stroke();
			// this.drawable.board.canvas.ctx2d.restore();
		},
		onDataChanage:function(varValue){
			var self=this;
			if(!this.drawable.board.editable){
				if(this.refreshTimerId){
				    window.clearInterval(this.refreshTimerId);
				}
				this.refreshTimerId =setInterval(function(){
					self.change(varValue);
				},50);
			}
		},
		change:function(varValue){
			var self=this;
			if(this.drawable.defaultValue == 'default'){
					if(this.drawable.minValue){
						this.drawable.defaultValue =this.drawable.minValue;
					}else{
						this.drawable.defaultValue = 0;
					}
			}
			if(varValue > this.drawable.maxValue){
				if(this.drawable.defaultValue < this.drawable.maxValue){
					this.initAngle += Math.PI / (this.drawable.maxValue - this.drawable.minValue);
					this.drawable.defaultValue += 1;
				}else if(this.drawable.defaultValue == this.drawable.maxValue){
					this.drawable.defaultValue =parseInt(varValue);
					window.clearInterval(self.refreshTimerId);
					self.flag=true;
				}else{
					window.clearInterval(self.refreshTimerId);
				}
			}else if(varValue < this.drawable.minValue){
				this.drawable.defaultValue =varValue;
				self.flagmin=true;
				window.clearInterval(self.refreshTimerId);
			}else{
				if(this.drawable.defaultValue == varValue){
					window.clearInterval(self.refreshTimerId);
				}else if(this.drawable.defaultValue < varValue){
					if(self.flagmin){
						this.drawable.defaultValue = parseInt(this.drawable.minValue);
						self.flagmin=false;
					}
					this.initAngle += Math.PI / (this.drawable.maxValue - this.drawable.minValue);
					this.drawable.defaultValue += 1;
				}else if(this.drawable.defaultValue > varValue){
					if(self.flag){
						this.drawable.defaultValue = parseInt(this.drawable.maxValue);
						self.flag=false;
					}
					this.initAngle -= Math.PI / (this.drawable.maxValue - this.drawable.minValue);
					this.drawable.defaultValue -= 1;
				}
			}
			self.reDraw();
		},
		reDraw:function(){ 
			//this.drawable.board.canvas.ctx2d.save();
			this.drawable.board.canvas.ctx2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
			this.drawable.board.redrawCanvas();
			//this.drawable.board.canvas.ctx2d.restore();
		},
		destroy:function(){ 
			window.clearInterval(this.refreshTimerId);
			if(this.layout && (!this.layout.destroyed))this.layout.destroy();
		}
	});
	return AgentCanvasTool;
});