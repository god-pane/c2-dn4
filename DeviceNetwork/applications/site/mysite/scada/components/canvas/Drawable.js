/**
 * drawable type 说明
 * type=1 文本类型组件
 * type=2 自定义上传组件
 * type=3 动态组件-图片切换
 * type=4 线段类型
 */

define(function(require){
	require("cloud/base/cloud");
	require("../polygon");
	require("./lang/zh-cn");
	Ext.ns('Nts.Module.Common.Canvas');

	Nts.Module.Common.Canvas.Drawable = function( config )
	{
		Ext.apply(this, config);
		// alais
		if( this.w ) this.width = this.w;
		if( this.h ) this.height = this.h;
		if( this.v ) this.visible = this.v;
		if( this.a ) this.address = this.a;
		if( this.is ) this.images = this.is;
		if( this.ts ) this.titles = this.ts;
		if( this.es ) this.endPoints = this.es; 
		if( this.t ) this.type = this.t;
		if( this.u ) this.url = this.u;
		if( this.le) this.line = this.le;
		//==============仪表盘======================================
		if( this.dashboard) this.dashboard=this.dashboard;
		if( this.aliquots) this.aliquots = this.aliquots;
		if( this.minValue) this.minValue = this.minValue;
		if( this.maxValue) this.maxValue = this.maxValue;
		if( this.defaultVa) this.defaultValue = this.defaultVa;
		//缩放比例
		if( this.displayScale) this.displayScale = this.displayScale;
		//文字组件
		if( this.editText) this.editText = this.editText;
		//液体管道
		if( this.pipeFlow) this.pipeFlow = this.pipeFlow;
		if( this.pipeH) this.pipeH = this.pipeH;
		if( this.pipeW) this.pipeW = this.pipeW;
		if( this.flowTo) this.flowTo = this.flowTo;
		if( this.variableValuestop) this.variableValuestop = this.variableValuestop;
		if( this.variableValueflow) this.variableValueflow = this.variableValueflow;
		if( this.flowValue || this.flowValue == 0) this.flowValue = this.flowValue;
		if( this.stopValue || this.stopValue == 0) this.stopValue = this.stopValue;
		if( this.pipeColor) this.pipeColor = this.pipeColor;
		//电机
		if( this.machine) this.machine = this.machine;
		if( this.images )
		{
			if( Ext.isObject(this.images) )
			{
				var images = [this.images];
				this.images = images;
			}
			for( var i = 0; i < this.images.length; i ++ )
			{
				var image = this.images[i];
				image.dom = document.getElementById('canvas-image-' + image.el);
			}
		}
		
		if( this.titles && Ext.isObject(this.titles) )
		{
			var titles = [this.titles];
			this.titles = titles;
		}
		
		if( this.endPoints && Ext.isObject(this.endPoints) )
		{
			var endPoints = [this.endPoints];
			this.endPoints = endPoints;
		}
		
		Nts.Module.Common.Canvas.Drawable.superclass.constructor.call(this, config);
	};

	Ext.extend(Nts.Module.Common.Canvas.Drawable, Ext.util.Observable,
	{
		id: 0,
		x: 0,
		y: 0,
		z: 0,
		mx: 0,
		my: 0,
		mz: 0,
		m:null,
		width: 10,
		height: 10,
		address: 0,
		type:0,
		visible: true,
		focused: false,
		selected: false,
		dragging: false,
		resizing: null,
		board: null,
		images: null,
		titles: null,
		endPoints: null,
		line:null,
		attributes: null,
		moveSelected:false,
		defaultValue:null,
		
		redraw: function( ctx2d )
		{
			var self = this;
			if( !this.visible )
			{
				return;
			}
			 
			if( this.images ) for( var i = 0; i < this.images.length; i++ )  this.drawImage(ctx2d, this.images[i]);
			
			if( this.titles ) for( var j = 0; j < this.titles.length; j ++ )  this.drawTitle(ctx2d, this.titles[j]);
		
			if( this.defaultValue || this.defaultValue == 0 ) this.drawValues(ctx2d);
			
			//if( this.endPoints ) for( var i = 0; i < this.endPoints.length; i ++ ) this.drawEndPoint(ctx2d, this.endPoints[i]);
			
			if(!this.selected && this.moveSelected) this.drawMoveFocus(ctx2d);
			
			if( this.focused || this.selected ) this.drawFocus(ctx2d);
			
			if(this.line) this.drawLine(ctx2d);//画线
			
			if(this.dashboard) this.drawDashboard(ctx2d);//绘制仪表盘
			
			if(this.pipeFlow) this.drawPipeFlow(ctx2d);//绘制管道水流
			
			if(this.machine) this.drawMachine(ctx2d);//绘制电机风扇
		},
		
		getNavigatorTextOffset: function()
		{
			return (Ext.isChrome || Ext.isIE || !this.supported) ? 0 : 3;
		},
		drawLine:function(ctx2d){
			ctx2d.beginPath();
			ctx2d.lineWidth = this.line.w;
			ctx2d.strokeStyle = this.line.se;
			ctx2d.moveTo(this.line.p[0].x,this.line.p[0].y);
			ctx2d.lineTo(this.line.p[1].x,this.line.p[1].y);
			ctx2d.stroke();
		},
//		drawLine:function(ctx2d){
//			ctx2d.beginPath();
//			ctx2d.lineWidth = this.line.w;
//			ctx2d.strokeStyle = this.line.se;
//			if(this.line.p.length){
//				for(var i=0;i<this.line.p.length;i++){
//					ctx2d.moveTo(this.line.p[i][0].x,this.line.p[i][0].y);
//					ctx2d.lineTo(this.line.p[i][1].x,this.line.p[i][1].y);
//				}
//			}
//			ctx2d.stroke();
//		},
		//画管道水流
		drawPipeFlow:function(ctx2d){
			this.m.render();
		},
		//画电机风扇
		drawMachine:function(ctx2d){
			this.m.render();
		},
		//===画仪表盘============================================================
		drawDashboard:function(ctx2d){
			var self=this;
			if( this.aliquots){
				this.aliquots=this.aliquots;
			} 
			if( this.minValue){
				this.minValue=this.minValue;
			} 
			if( this.maxValue){
				this.maxValue=this.maxValue;
			} 
			this.m.render();
		},
		drawAnnotations:function(ctx2d){
			var RING_INNER_RADIUS=18;
			var r=this.displayScale ? parseInt((this.displayScale/100) * 65) : 65;
			var radius = r + RING_INNER_RADIUS;
			var fontsize = this.displayScale ? parseInt((this.displayScale/100) * 10) : 10;
			var width=(this.displayScale ? parseInt((this.displayScale/100) * (this.width/2)) : this.width/2);
			var height=(this.displayScale ? parseInt((this.displayScale/100) * (this.height/2)) : this.height/2);
            ctx2d.save();
            ctx2d.fillStyle = 'rgba(0, 0, 230, 0.9)';
            ctx2d.font = fontsize + 'px';
			for (var angle=0; angle <  Math.PI+(Math.PI/this.aliquots); angle +=Math.PI/this.aliquots) {
				var value=(this.maxValue-(angle* (this.maxValue - this.minValue) / Math.PI)).toFixed(0);
				var x=this.x+ width + Math.cos(angle) * (radius - 30);
				var y=this.y+ height - Math.sin(angle) * (radius - 30);
	           // ctx2d.beginPath();
	            if((this.maxValue-(angle* (this.maxValue-this.minValue)/ Math.PI)) < this.minValue){
	   		    }else{
	   			  ctx2d.fillText(value,x,y);
	   		    }
	        }
			ctx2d.restore();
		},
		drawValue:function(ctx2d){
			var width=(this.displayScale ? parseInt((this.displayScale/100) * (this.width/2)) : this.width/2);
			var height=(this.displayScale ? parseInt((this.displayScale/100) * (this.height/2)) : this.height/2);
			var x1=this.x+ width-(this.displayScale ? parseInt((this.displayScale/100) * 40) : 40);
			var y1=this.y+ height+(this.displayScale ? parseInt((this.displayScale/100) * 35) : 35);
			var x2=this.displayScale ? parseInt((this.displayScale/100) * 80) : 80;
			var y2=this.displayScale ? parseInt((this.displayScale/100) * 20) : 20;
			var x3=this.x+ width+(this.displayScale ? parseInt((this.displayScale/100) * 40) : 40);
			var y3=this.y+ height+(this.displayScale ? parseInt((this.displayScale/100) * 35) : 35);
			var y4=this.y+ height+(this.displayScale ? parseInt((this.displayScale/100) * 65) : 65);
			
			var my_gradient =ctx2d.createLinearGradient(x1,y3,x3,y4);
			my_gradient.addColorStop(0,"grey"); 
			my_gradient.addColorStop(0.5,"#f1f1f1"); 
			my_gradient.addColorStop(1,"grey");
			ctx2d.fillStyle = my_gradient; 
			ctx2d.fillRect(x1,y1,x2,y2); 
		},
		drawValues:function(ctx2d){
			//========画刻度上的数字==========================
			if(this.minValue == 0){//最小值为0
				if(this.maxValue && this.aliquots){
					this.drawAnnotations(ctx2d);
				}
			}else if(this.maxValue == 0){//最大值为0
				if(this.minValue && this.aliquots){
					this.drawAnnotations(ctx2d);
				}
			}else{//最小值最大值不为0
				if(this.minValue && this.maxValue && this.aliquots){
					this.drawAnnotations(ctx2d);
				}
			}
			//=============================================
			this.drawValue(ctx2d);
			var value=null;
			if(this.board.editable){
			   if(this.minValue){
	               value = this.minValue;
	           }else{
	               value = '0';
	           }
			   this.defaultValue = 'default';
			}else{
				if(this.defaultValue == 'default'){
	              if(this.minValue){
	            	  value = this.minValue;
	              }else{
	            	  value = '0';
	              }
	            }else {
	            	if(this.defaultValue){
	    				value=this.defaultValue
	            	}else{
	            		value = this.minValue;
	            	}
	            }
			}
			 var width=(this.displayScale ? parseInt((this.displayScale/100) * (this.width/2)) : this.width/2);
			 var height=(this.displayScale ? parseInt((this.displayScale/100) * (this.height/2)) : this.height/2);
			 var x = this.x+ width-(this.displayScale ? parseInt((this.displayScale/100) * 1) : 1);
			 var y = this.y+ height+(this.displayScale ? parseInt((this.displayScale/100) * 45) : 45);
			 ctx2d.font = (this.displayScale ? parseInt((this.displayScale/100) * 12) : 12) + 'px';
			 ctx2d.fillStyle="#003300";
			 ctx2d.textBaseline = 'middle';
			 ctx2d.textAlign='center';
			 ctx2d.fillText(value,x,y);
		},
		//===============================================
		drawTitle: function( ctx2d, title )
		{
			var lang = Lang.Module.Common.Canvas.DrawableItem;
			if(this.type == 'text'){
				if(this.editText){
					var text = this.editText;
				}else{
					var text = locale.get({lang:"editTextContent"});
					this.editText='';
				}
				
			}else{
				var text = title.text || '';
			}
			
			ctx2d.textAlign = title.textAlign || 'left';
			ctx2d.textBaseline = title.textBaseline || 'top';
			ctx2d.fillStyle = title.color ? title.color : '#000000';
			ctx2d.font = ((title.bold ? 'bold ' : '') + (this.displayScale ? parseInt((this.displayScale/100) * title.size) : (title.size) || 12) + 'px ' + (title.font || lang.defaultFontName));
			
			var metric = ctx2d.measureText ? ctx2d.measureText(text) : {width : text.length * parseInt(title.size)};
			
			if( title.rotation )
			{
				ctx2d.save();
				ctx2d.translate(this.x,this.y);
				ctx2d.rotate(Math.PI * title.rotation / 180);
			}
			var x = title.x ? parseInt(title.x) : ((this.width - metric.width) / 2);
			var y = title.y ? parseInt(title.y) : this.height;
			
			var xx = this.displayScale ? parseInt((this.displayScale/100) * x) : x;
			var yy = this.displayScale ? parseInt((this.displayScale/100) * y) : y;
			
			if( title.rotation )
			{
				ctx2d.fillText(text, xx, yy);
				ctx2d.restore();
			}else{
				ctx2d.fillText(text,  this.x + xx, this.y + yy);	
			}
		},
		drawImage: function(ctx2d, image,xx,yy)
		{
			if( !image.dom )
			{
				return;
			}
			if(this.type == 'text' || this.type == '7'){
				return;
			}
			var width1 = image.width || this.width;
			var height1 = image.height || this.height;
			var width = this.displayScale ? parseInt((this.displayScale/100) * width1) : width1;
			var height= this.displayScale ? parseInt((this.displayScale/100) * height1) : height1;
			if( image.rotation )
			{
				ctx2d.save();
//				ctx2d.translate(this.x + (image.x || 0), this.y + (image.y || 0));
				ctx2d.translate(this.x,this.y);
				ctx2d.rotate(Math.PI * image.rotation / 180);
				ctx2d.drawImage(image.dom, 0, 0, width, height);
				ctx2d.restore();
				return;
			}
			
			var x = this.newDrawable_x?this.newDrawable_x:this.x + (image.x || 0);
			var y = this.newDrawable_y?this.newDrawable_y:this.y + (image.y || 0);
			
			if( !image.wpercent && !image.hpercent )
			{
				ctx2d.drawImage(image.dom, x, y, width, height);
			}
			else
			{
				var wpercent = parseFloat(image.wpercent || 100) / 100.0;
				var hpercent = parseFloat(image.hpercent || 100) / 100.0;
				ctx2d.drawImage(image.dom, 0, 0, width * wpercent, height * hpercent, x, y, width * wpercent, height * hpercent);
			}
		},
		
		drawEndPoint: function( ctx2d, endPoint )
		{
			if( endPoint.horz )
			{
				var x = this.x + (endPoint.start ? 1.5 : this.width - 1.5);
				var defaultHeight = 2;
				
				ctx2d.beginPath();
				ctx2d.globalAlpha = endPoint.globalAlpha || 1;
				ctx2d.strokeStyle = endPoint.color || '#000000';
				ctx2d.lineWidth = endPoint.size || 1;
				ctx2d.moveTo(x, this.y + 0.5);
				ctx2d.lineTo(x, this.y + 0.5 - (endPoint.height || defaultHeight));
				ctx2d.moveTo(x, this.y + 0.5 - (endPoint.height || defaultHeight));
				ctx2d.moveTo(x, this.y - 0.5 + this.height);
				ctx2d.lineTo(x, this.y - 0.5 + this.height + (endPoint.height || defaultHeight));
				ctx2d.moveTo(x, this.y - 0.5 + this.height + (endPoint.height || defaultHeight));
				ctx2d.closePath();
				ctx2d.stroke();
			}
			else
			{
				var y = this.y + (endPoint.start ? 1.5 : this.height - 1.5);
				var defaultWidth = 2;
				
				ctx2d.beginPath();
				ctx2d.globalAlpha = endPoint.globalAlpha || 1;
				ctx2d.strokeStyle = endPoint.color || '#000000';
				ctx2d.lineWidth = endPoint.size || 1;
				ctx2d.moveTo(this.x + 0.5, y);
				ctx2d.lineTo(this.x + 0.5 - (endPoint.width || defaultWidth), y);
				ctx2d.moveTo(this.x + 0.5 - (endPoint.width || defaultWidth), y);
				ctx2d.moveTo(this.x - 0.5 + this.width, y);
				ctx2d.lineTo(this.x - 0.5 + this.width + (endPoint.width || defaultWidth), y);
				ctx2d.moveTo(this.x - 0.5 + this.width + (endPoint.width || defaultWidth), y);
				ctx2d.closePath();
				ctx2d.stroke();
			}
		},
		
		drawFocus: function( ctx2d )
		{
		  if(this.board.editable){
//			if(this.type == '5'){
//			    return;
//			}
			ctx2d.lineWidth = 1;
			ctx2d.strokeStyle = '#0000C0';
			ctx2d.lineJoin  = 'round';
			var width=this.displayScale ? parseInt((this.displayScale/100) * this.width) : this.width;
			var height=this.displayScale ? parseInt((this.displayScale/100) * this.height) : this.height;
			if(this.images && this.images[0].rotation )
			{
				ctx2d.save();
				ctx2d.translate(this.x,this.y);
				ctx2d.rotate(Math.PI * this.images[0].rotation / 180);
				ctx2d.strokeRect(- 1.5, - 1.5, width + 3, height + 3);
				ctx2d.restore();
				return;
			}else{
				ctx2d.strokeRect(this.x - 1.5, this.y - 1.5, width + 3, height + 3);
			}
		   }
		},
		
		drawMoveFocus:function(ctx2d){
//			if(this.type == '5'){
//				return;
//			}
			var xf = 0;
			var yf = 0;
			if(this.images && this.images[0].rotation){
				ctx2d.save();
				ctx2d.translate(this.x,this.y);
				ctx2d.rotate(Math.PI * this.images[0].rotation / 180);
			}else{
				xf = this.x;
				yf = this.y;
			}
			var width=this.displayScale ? parseInt((this.displayScale/100) * this.width) : this.width;
			var height=this.displayScale ? parseInt((this.displayScale/100) * this.height) : this.height;
			if(this.endPoints){
				var pn = [];
				for(var i=0;i<this.endPoints.length;i++){
					var point = this.endPoints[i];
					var x = xf + (point.x ? (Math.floor((width*(point.x/100))) == width ? Math.floor((width*(point.x/100)))+3 : Math.floor((width*(point.x/100)))) : 0 || -3);
					var y = yf + (point.y ? (Math.floor((height*(point.y/100))) == height ? Math.floor((height*(point.y/100)))+3 : Math.floor((height*(point.y/100)))) : 0 || -3);
					var polygon = new Polygon(x,y,point.rs,4,0,point.cl,point.fs,false);
					if(!xf && !yf){
						polygon.$x = this.x;
						polygon.$y = this.y;
						polygon.rotation = this.images[0].rotation;
					}
					ctx2d.beginPath();
					polygon.createPath(ctx2d);
					polygon.stroke(ctx2d);
					polygon.fill(ctx2d);
					polygon.id = this.id;
					pn.push(polygon);
				}
				//删除重复的端点
				for(var j=0;j<this.board.polygons.length;j++){
					var polygon = this.board.polygons[j];
					for(var jj=0;jj<pn.length;jj++){
						if(polygon.id == pn[jj].id){
							this.board.polygons.remove(polygon);
						}
					}
					
				}
				for(var ii=0;ii<pn.length;ii++){
					this.board.polygons.push(pn[ii]);
				}
			}
			
			if(this.images && this.images[0].rotation){
				ctx2d.restore();
			}
		},
		
		isInRect: function( x1, y1, x2, y2 )
		{
			return ((this.x >= x1 && this.x <= x2)  || (this.x + this.width >= x1 && this.x + this.width <= x2)) && 
				((this.y >= y1 && this.y <= y2)  || (this.y + this.height >= y1 && this.y + this.height <= y2));
		},
		
		isPointInRect: function( x, y )
		{
			var width=this.displayScale ? parseInt((this.displayScale/100) * this.width) : this.width;
			var height=this.displayScale ? parseInt((this.displayScale/100) * this.height) : this.height;
			
			if(this.images && this.images[0].rotation=="90" )
			{
				 return (x >= (this.x - height) && x <= this.x) && (y >= this.y && y <= (this.y + width));
				 
			}else if(this.images && this.images[0].rotation=="180" ){
				
				 return (x > (this.x-width) && x < this.x)&&(y >= (this.y - height) && y <=this.y);
				 
			}else if(this.images && this.images[0].rotation=="270" ){
				
				 return (x > this.x && x <( this.x + height)) && ( y >= (this.y - width) && y <=this.y);
				 
			}else{
				
				return (x >= this.x && x <= (this.x + width)) && (y >= this.y && y <= (this.y + height));
			}
		    
		},
		
		moveTo: function( dx, dy )
		{
			this.x += dx;
			this.y += dy;
		},

		resizeTo: function( dx, dy )
		{
			switch( this.resizing )
			{
				case 'east': dy = 0; break;
				case 'south': dx = 0; break;
				case 'west': dy = 0; dx = -dx; break;
				case 'north': dx = 0; dy = -dy; break;
				default: break;
			}
			
			if( this.width + dx <= 5 || this.height + dy <= 5 )
			{
				return false;
			}
			
			switch( this.resizing )
			{
				case 'west': this.x -= dx; break;
				case 'north': this.y -= dy; break;
				default: break;
			}
			
			this.width += dx;
			this.height += dy;
			return true;
		},
		
		setDrawableLayer: function( up, distance )
		{
			if( !this.board )
			{
				return false;
			}
			return true;
		},
		
		setImage: function( index, config, redraw )
		{
			if( !this.images || !this.images[index] )
			{
				return false;
			}
			
			var item = this.images[index];
			Ext.apply(item, config);
			if( config.el )
			{
				// update image
				item.dom = document.getElementById('canvas-image-' + item.el);
			}
			
			if( redraw !== false )
			{
				this.board.redrawCanvas();
			}
		},
		
		setTitle: function( index, config, redraw )
		{
			if( !this.titles || !this.titles[index] )
			{
				return false;
			}
			
			var item = this.titles[index];
			Ext.apply(item, config);
			
			if( redraw !== false )
			{
				this.board.redrawCanvas();
			}
		},
		
		trimEmptyProperties: function( values )
		{
			var newVlaues = {};
			for( var name in values )
			{
				var value = values[name];
				if( value ) newVlaues[name] = value;
			}
			return newVlaues;
		},
		
		getData: function()
		{
			var data = Ext.copyTo({}, this, ['x', 'y', 'z']);
			data.is = [];
			for( var i = 0; this.images && i < this.images.length; i ++ )
			{
				var item = Ext.apply({}, this.images[i]);
				delete item.dom;
				data.is.push(this.trimEmptyProperties(item));
			}
			
			data.ts = [];
			for( var i = 0; this.titles && i < this.titles.length; i ++ )
			{
				var item = Ext.apply({}, this.titles[i]);
				data.ts.push(this.trimEmptyProperties(item));
			}
			
			
			data.le = {};
			data.le.p = [];
			for(var i=0;this.line&&i<this.line.p.length;i++){
				data.le.w = this.line.w;
				data.le.se = "#000000";//this.line.se;
				var item = Ext.apply({}, this.line.p[i]);
				data.le.p.push(this.trimEmptyProperties(item));
			}
			
			
			data.es = [];
			for( var i = 0; this.endPoints && i < this.endPoints.length; i ++ )
			{
				var item = Ext.apply({}, this.endPoints[i]);
				data.es.push(this.trimEmptyProperties(item));
			}
			
			
			if( !data.x ) delete data.x;
			if( !data.y ) delete data.y;
			if( !data.z ) delete data.z;
			if( !data.t ) delete data.t;
			
			if(this.width) data.w = this.width;
			if(this.height) data.h = this.height;
			if(this.url) data.u = this.url;
			if(this.id) data.id = this.id;
			data.t = this.type;
			if( this.address )
			{
				data.a = this.address;
			}
			if(this.minValue || this.minValue == 0 ){
				data.minValue = this.minValue;
			}
			if(this.maxValue || this.maxValue == 0){
				data.maxValue = this.maxValue;
			}
			if(this.aliquots){
				data.aliquots = this.aliquots;
			}
			if(this.editText){
				data.editText = this.editText;
			}
			if(this.defaultValue){
				data.defaultVa = this.defaultValue;
			}
			if(this.displayScale){
				data.displayScale = this.displayScale;
			}
			if(this.pipeH){
				data.pipeH = this.pipeH;
			}
			if(this.pipeW){
				data.pipeW = this.pipeW;
			}
			if(this.flowTo){
				data.flowTo = this.flowTo;
			}
			if( this.variableValuestop) data.variableValuestop = this.variableValuestop;
			if( this.variableValueflow) data.variableValueflow = this.variableValueflow;
			if( this.flowValue || this.flowValue == 0) data.flowValue = this.flowValue;
			if( this.stopValue || this.stopValue == 0) data.stopValue = this.stopValue;
			if( this.pipeColor) data.pipeColor = this.pipeColor;
			
			if( data.is.length == 0 ) delete data.is;
			if( data.ts.length == 0 ) delete data.ts;
			if( data.le.p.length == 0 ) delete data.le;
			if( data.es.length == 0 ) delete data.es;
			return data;
		}
	});
	return Nts.Module.Common.Canvas.Drawable
});

