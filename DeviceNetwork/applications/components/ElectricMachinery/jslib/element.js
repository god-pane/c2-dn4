/*
 * 电机的风扇侧面转动效果
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
			
			this.pipeHH = this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 60) : 60;
			this.height = this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * this.drawable.height) : this.drawable.height;
			this.pipeH = this.height-this.pipeHH;//管道高度
			
			//小方块的y坐标
			this.rectYY = this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 18) : 18;
			this.y = this.drawable.y;
			this.rectY = this.y+this.rectYY;
			
			//小方块的x坐标
			this.rextXX=  this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 180) : 180;
			this.x = this.drawable.x;
			this.rectX =this.x+this.rextXX;
			
			this.width=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 18) : 18;//小方块的最大宽度
			this.rectH=0;//小方块的高度
			this.rectW=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 10) : 10;//小方块的宽度
			this.space=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 10) : 10;;//小方块之间的间距
			
			this.pn = [];
			this.pipe = new Pipe(this.rectX,this.rectY,this.rectW,this.rectH);
			this.pipe.flag =1;
			
			this.flag=false;//判断变量是否有值
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
						var machine = {};
						machine.value = 1;
						this.drawable.machine = machine;
					}
				}
			}
		},
		initModule:function(){
			this.drawable.board.canvas.ctx2d.save();
			if(!this.drawable.board.editable && this.flag){//如果在工程界面且变量有值
		        this.drawWater();//画水流
			}
			this.drawable.board.canvas.ctx2d.restore();
		},
		onDataChanage:function(varValue){
			var self=this;
			if(!this.drawable.board.editable){
				if(varValue!='--'){//如果变量有值
					if(varValue || varValue == '0'){
						if(this.drawable.variableValueflow){//转动条件
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
						
						if(this.drawable.variableValuestop){//停止转动条件
							if(this.drawable.stopValue || this.drawable.stopValue == '0'){
								if(this.drawable.variableValuestop == '1'){//大于
									if(varValue > this.drawable.stopValue){
										self.flag=false;
										self.drawable.setImage(0, {el: 'machineRed'}, false);
									    window.clearInterval(this.refreshTimerId);
									}
								}else if(this.drawable.variableValuestop == '2'){//等于
									if(varValue == this.drawable.stopValue){
										self.flag=false;
										self.drawable.setImage(0, {el: 'machineRed'}, false);
									    window.clearInterval(this.refreshTimerId);
									}
								}else if(this.drawable.variableValuestop == '3'){//小于
									if(varValue < this.drawable.stopValue){
										self.flag=false;
										self.drawable.setImage(0, {el: 'machineRed'}, false);
									    window.clearInterval(this.refreshTimerId);
									}
								}
							}
						}
					}
			   }else{
				    self.flag=false;
				    self.drawable.setImage(0, {el: 'machineRed'}, false);
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
			self.drawable.setImage(0, {el: 'machineGreen'}, false);
			this.refreshTimerId =setInterval(function(){
				self.change();
			},100);
		},
		change:function(){
			this.drawable.board.canvas.ctx2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
			this.drawWater();
			this.reDraw();
		},
		drawWater:function(){
			if(this.pn.length == 0){
				if(this.pipe.rectH < this.width){
					this.pipe.rectH = this.pipe.rectH+1;
				}else{
					this.pipe.rectY =this.pipe.rectY + 1;
					this.pn.push(this.pipe);
					this.pipe.flag = 0;
				}
			}else{
				var x = this.pn[this.pn.length - 1].rectY - this.y;
				var xx = this.space+this.rectYY;
				if(this.pipe.flag == 0 && x == xx){
					this.rectH=0;
					this.rectW=this.drawable.displayScale ? parseInt((this.drawable.displayScale/100) * 10) : 10;
					this.rectY =this.y+this.rectYY;
						
					this.rectX = this.x + this.rextXX;
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
					if(this.pn[i].rectY > this.y+this.rectYY+ this.pipeH -this.pn[i].rectH || this.pn[i].rectY == this.y+this.rectYY + this.pipeH - this.pn[i].rectH ){
					    	if(this.pn[i].rectH == 0){
					    		this.pn[i].rectH = this.y +this.rectYY;
					    		this.pn.splice(i,1);
					    	}else{
					    		this.pn[i].rectH = this.pn[i].rectH-1;
					    		this.pn[i].rectY = this.y+this.rectYY+ this.pipeH - this.pn[i].rectH;
					    	}
					}else{
					    	if(this.pn[i].rectH < this.width){
					    		this.pn[i].rectH = this.pn[i].rectH+1;
						    }else{
						    	this.pn[i].rectY =this.pn[i].rectY + 1;
						    }
					}
					
					this.draw(this.pn[i]);
				}
			}else{
				this.draw(this.pipe);
			}
		},
		draw:function(obj) {
			var w = this.canvasWidth;
			var h = this.canvasHeight;
			var sf = Math.min(w,h)/1.5;
			var grd=this.drawable.board.canvas.ctx2d.createRadialGradient(w/2,h/2,0,w/2,h/2,sf*1.2);
		    grd.addColorStop(0,"#F5F5F5");
		    grd.addColorStop(1,"#D1D1D1");
			this.drawable.board.canvas.ctx2d.save();
			this.drawable.board.canvas.ctx2d.fillStyle=grd;  
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