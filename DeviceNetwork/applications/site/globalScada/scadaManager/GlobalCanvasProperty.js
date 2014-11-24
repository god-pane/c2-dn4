define(function(require){
	var Window = require("cloud/components/window");
	var html = require("text!./GlobalCanvasProperty.html");
	var GlobalCanvasDrawble = require("./GlobalCanvasDrawble");
	var GlobalCanvasTools = require("../../mysite/agent/AgentCanvasToolProperty");
	var service = require("../../mysite/service");
	var GlobalCanvasProperty = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.element.html(html);
			this.scadaId = options.scadaId;
			this.scadaName = options.scadaName;
			this.siteList = options.siteList;
			this.newScadaData = options.newScadaData;
			this.agentCanvasDraw = null;
			this.agentCanvasTool = null;
			this.render();
			this.renderTool();
		},
		
		render:function(){
//			this.renderAgentCanvasWindow();
			this.renderLayout();
			this.renderDrawablePropety();
			this.renderCanvasTool();
			this.renderSiteName();
			this.renderEvent();
		},
		
		renderAgentCanvasWindow:function(){
			this.windowHistory = new Window({
				container: "body",
				title: "现场1-组态图",
				top: "center",
				left: "center",
				width: 1200,
				height: 660,
				drag:true,
				mask: true,
				content: "<div id='canvas-panel-box'></div>",
				events: {
					"beforeClose": function() {
						//this.destroy();
						//alert("销毁完成");
					}.bind(this),
					"onClose": function() {
						//varCacheList.clear();
					}.bind(this),
					"onShow": function() {
					}
				},
				scope: this
			});
			this.windowHistory.show();
			this.windowHistory.setContents(html);
		},
		renderLayout:function(){
			this.layout = $("#agentcanvas").layout({
				defaults: {
                    paneClass: "pane",
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 1,
                    "spacing_closed": 1,
                    "togglerLength_closed": 50,
					togglerTip_open:locale.get({lang:"close"}),
                    togglerTip_closed:locale.get({lang:"open"}),  
                    resizable: false,
                    slidable: false
                },
                center: {
                    paneSelector: "#agentcanvas-center"
                },
                east:{
                	paneSelector: "#agentcanvas-info",
                	size:170
                }
			});
		},
		
		renderDrawablePropety:function(){
			this.agentCanvasDraw = new GlobalCanvasDrawble({
				selector:"#agentcanvas-center",
				service:service,
				scadaId:this.scadaId,
				scadaName:this.scadaName,
				siteList:this.siteList,
				newScadaData : this.newScadaData
			});
		},
		renderSiteName:function(){
			var self = this;
			var scadaName=self.scadaName;
			self.agentCanvasDraw.renderSiteName_div(scadaName);
		},
		renderCanvasTool:function(){
			this.agentCanvasTool = new GlobalCanvasTools({
				selector:"#agentcanvas-info",
				agentCanvasDraw:this.agentCanvasDraw,
				service:service,
				global:1
			});
		},
		
		renderEvent:function(){
			var self = this;
			this.agentCanvasDraw.on({
				"rendDraw":function(data){
					self.agentCanvasTool.redDrawElement(data);
				}
			});
			
			this.agentCanvasTool.on({
				"showOptionWin":function(){
					this.agentCanvasDraw.onProperty();
				}
			});
		},
		renderTool:function(){
//			var self = this;
			this.agentCanvasDraw.agentCanvasTool=this.agentCanvasTool;
		},
		destroy:function(){
			if(this.agentCanvasTool)this.agentCanvasTool.destroy();
			if(this.agentCanvasDraw)this.agentCanvasDraw.destroy();
		}
	});
	return GlobalCanvasProperty;
	
});