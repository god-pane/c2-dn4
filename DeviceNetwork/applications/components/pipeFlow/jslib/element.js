/*
 * 水平管道的水流效果
 */
define(function(require){
	require("cloud/base/cloud");
	require("./Pipe");
	var AgentCanvasTool = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.drawable = options.drawable;
			this.canvasHeight=this.drawable.board.canvas.height;//画布的高度
			this.canvasWidth=this.drawable.board.canvas.width;//画布的宽度
			this.refreshTimerId = null;//定时器
		
			this.pipeTo=1;//管道是横向还是纵向 ：1为横向 0为纵向
			this.pipeW = this.drawable.pipeW ? this.drawable.pipeW : this.canvasWidth*0.4;//管道宽度
			this.pipeH = this.drawable.pipeH ? this.drawable.pipeH : 20;//管道高度
			this.width=25;//小方块的最大宽度
			this.rectW=0;//小方块的宽度
			this.rectH=this.drawable.pipeH ? this.drawable.pipeH - 4 :16;//小方块的高度
			/*
			 * 流向：1为正向 0为反向
			 */
			this.flowTo = this.drawable.flowTo ? this.drawable.flowTo : 1;
			if(this.flowTo == 1){
				this.rectX =this.drawable.x;//小方块的x坐标
			}else{
				this.rectX =this.drawable.x + this.pipeW;
			}
			this.rectY = this.drawable.y + 2;//小方块的y坐标
			this.space=10;//小方块之间的间距
			
			this.pipe = new Pipe(this.rectX,this.rectY,this.rectW,this.rectH);
			this.pipe.flag =1;
			this.pn = [];
			this.flag=false;//判断变量是否有值
			this.render();
		},
		render:function(){
			this.pipeWidth = this.drawable.pipeW ? this.drawable.pipeW : this.canvasWidth*0.4;//管道宽度
			this.pipeHight = this.drawable.pipeH ? this.drawable.pipeH : 20;
			this.manaDrawable();
			this.initModule();
		},
		manaDrawable:function(){
			if(this.drawable.board.sortedDrawables){
				for(var i = 0; i < this.drawable.board.sortedDrawables.length; i++){
					var draw = this.drawable.board.sortedDrawables[i];
					if(this.drawable.id == draw.id){
						var pipeFlow = {};
						pipeFlow.value = 1;
						this.drawable.pipeFlow = pipeFlow;
					}
				}
			}
		},
		initModule:function(){
			this.drawable.board.canvas.ctx2d.save();
			this.drawGrass();//画管道
			if(!this.drawable.board.editable && this.flag){//如果在工程界面且变量有值
			   this.drawWater();//画水流
			}
			this.drawable.board.canvas.ctx2d.restore();
		},
		
		//画管道
		drawGrass:function(){
			this.drawable.board.canvas.ctx2d.save();
			this.drawable.board.canvas.ctx2d.shadowColor = 'rgba(0, 0, 0, 0.7)';//阴影的颜色
			this.drawable.board.canvas.ctx2d.shadowOffsetX = 2.5;//设置或返回形状与阴影的水平距离
			this.drawable.board.canvas.ctx2d.shadowOffsetY = 2.5;
			this.drawable.board.canvas.ctx2d.shadowBlur = 7;//模糊级数
		    this.drawable.board.canvas.ctx2d.fillStyle=this.drawable.pipeColor ? this.drawable.pipeColor : '#000000';
		    this.drawable.board.canvas.ctx2d.lineWidth=0;
		    this.drawable.board.canvas.ctx2d.fillRect(this.drawable.x,this.drawable.y,this.pipeWidth,this.pipeHight);
		    this.drawable.board.canvas.ctx2d.restore();
		},
		onDataChanage:function(varValue){
			var self=this;
			if(!this.drawable.board.editable){
				if(varValue!='--'){//如果变量有值
					if(varValue || varValue == '0'){
						if(this.drawable.variableValueflow){//流动条件
							if(this.drawable.flowValue || this.drawable.flowValue == '0'){
								if(this.drawable.variableValueflow == '1'){//大于
									if(varValue > this.drawable.flowValue){
										self.startChange(varValue);
									}
								}else if(this.drawable.variableValueflow == '2'){//等于
									if(varValue == this.drawable.flowValue){
										self.startChange(varValue);
									}
								}else if(this.drawable.variableValueflow == '3'){//小于
									if(varValue < this.drawable.flowValue){
										self.startChange(varValue);
									}
								}
							}
						}
						
						if(this.drawable.variableValuestop){//停止流动条件
							if(this.drawable.stopValue || this.drawable.stopValue == '0'){
								if(this.drawable.variableValuestop == '1'){//大于
									if(varValue > this.drawable.stopValue){
										self.flag=false;
									    window.clearInterval(this.refreshTimerId);
									}
								}else if(this.drawable.variableValuestop == '2'){//等于
									if(varValue == this.drawable.stopValue){
										self.flag=false;
									    window.clearInterval(this.refreshTimerId);
									}
								}else if(this.drawable.variableValuestop == '3'){//小于
									if(varValue < this.drawable.stopValue){
										self.flag=false;
									    window.clearInterval(this.refreshTimerId);
									}
								}
						   }
					  }
					}
			
				}else{
					self.flag=false;
				    this.refreshTimerId = null;
				}
			}
		},
		startChange:function(varValue){
			var self=this;
			self.flag = true;
			if(this.refreshTimerId){
			    window.clearInterval(this.refreshTimerId);
			}
			this.refreshTimerId =setInterval(function(){
				self.change(varValue);
			},100);
		},
		change:function(varValue){
			this.drawable.board.canvas.ctx2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
			this.drawGrass();
			this.drawWater();
			this.reDraw();
		},
		drawWater:function(){
			if(this.pn.length == 0){
				if(this.pipe.rectW < this.width){
					this.pipe.rectW = this.pipe.rectW+1;
					if(this.flowTo == 0){
						this.pipe.rectX =this.pipe.rectX - 1;
					}
					
				}else{
					if(this.flowTo == 1){
						this.pipe.rectX =this.pipe.rectX + 1;
					}
					this.pn.push(this.pipe);
					this.pipe.flag = 0;
				}
			}else{
				var x = null;
				var xx = null;
				if(this.flowTo == 1){
					x = this.pn[this.pn.length - 1].rectX - this.drawable.x;
					xx = this.space;
				}else{
					x = (this.drawable.x + this.pipeW) - this.pn[this.pn.length - 1].rectX;
				    xx = this.pn[this.pn.length - 1].rectW +this.space;
				}
				if(this.pipe.flag == 0 && x == xx){
					this.rectW=0;
					this.rectH=this.drawable.pipeH ? this.drawable.pipeH - 4 :16;
					if(this.flowTo == 1){
						this.rectX =this.drawable.x;
					}else{
						this.rectX =this.drawable.x + this.pipeW;
					}
					
					this.rectY = this.drawable.y + 2;
					this.pipe = new Pipe(this.rectX,this.rectY,this.rectW,this.rectH);
					this.pipe.flag = 1;
					this.pn.push(this.pipe);
					this.pipe.flag = 0;
				}
			}
			this.move();
		},
		move:function(){
			if(this.pn.length){
				for(var i=0;i<this.pn.length;i++){
					if(this.flowTo == 1){//正向流动
						if(this.pn[i].rectX > this.drawable.x+ this.pipeW -this.pn[i].rectW || this.pn[i].rectX == this.drawable.x+ this.pipeW - this.pn[i].rectW ){
					    	if(this.pn[i].rectW == 0){
					    		this.pn[i].rectX = this.drawable.x ;
					    		this.pn.splice(i,1);
					    	}else{
					    		this.pn[i].rectW = this.pn[i].rectW-1;
					    		this.pn[i].rectX = this.drawable.x+ this.pipeW - this.pn[i].rectW;
					    	}
					    }else{
					    	if(this.pn[i].rectW < this.width){
					    		this.pn[i].rectW = this.pn[i].rectW+1;
						    }else{
						    	this.pn[i].rectX =this.pn[i].rectX + 1;
						    }
					    }
					}else{//反向流动
						if(this.pn[i].rectX < this.drawable.x || this.pn[i].rectX == this.drawable.x ){
					    	if(this.pn[i].rectW == 0){
					    		this.pn[i].rectX = this.drawable.x + this.pipeW;
					    		this.pn.splice(i,1);
					    	}else{
					    		this.pn[i].rectW = this.pn[i].rectW-1;
					    		this.pn[i].rectX = this.drawable.x;
					    	}
					    }else{
					    	if(this.pn[i].rectW < 25){
					    		this.pn[i].rectW = this.pn[i].rectW+1;
						    }
					    	this.pn[i].rectX =this.pn[i].rectX - 1;
					    }
					}
					
					this.draw(this.pn[i]);
				}
			}else{
				this.draw(this.pipe);
			}
		},
		draw:function(obj) {
			this.drawable.board.canvas.ctx2d.save();
			this.drawable.board.canvas.ctx2d.fillStyle="#79FF79";  
			this.drawable.board.canvas.ctx2d.linewidth=0; 
			this.drawable.board.canvas.ctx2d.fillRect(obj.rectX,obj.rectY,obj.rectW,obj.rectH);
			this.drawable.board.canvas.ctx2d.restore();
		},
		reDraw:function(){ 
			this.drawable.board.canvas.ctx2d.save();
			this.drawable.board.canvas.ctx2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
			this.drawable.board.redrawCanvas();
			this.drawable.board.canvas.ctx2d.restore();
		},
		destroy:function(){ 
			window.clearInterval(this.refreshTimerId);
			if(this.layout && (!this.layout.destroyed))this.layout.destroy();
		}
	});
	return AgentCanvasTool;
});