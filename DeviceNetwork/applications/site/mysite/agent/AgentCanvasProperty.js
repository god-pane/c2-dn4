define(function(require){
	var Window = require("cloud/components/window");
	var html = require("text!./AgentCanvasProperty.html");
	var AgentDrawableProperty = require("./AgentDrawableProperty");
	var AgentCanvasToolProperty = require("./AgentCanvasToolProperty");
	var service = require("../service");
	var AgentCanvasProperty = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.element.html(html);
			this.siteid = options.siteid;
			this.sitename = options.sitename;
			this.newScadaData = options.newScadaData;
			this.siteList = options.siteList;
			this.selectedScadaId = options.selectedScadaId;
//			this.deviceName = options.deviceName;
			this.agentCanvasDraw = null;
			this.agentCanvasTool = null;
			this.render();
		},
		
		render:function(){
			this.renderLayout();
			this.renderDrawablePropety();
			this.renderCanvasTool();
			this.renderSiteName();
			this.renderEvent();
			this.renderTool();
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
			this.agentCanvasDraw = new AgentDrawableProperty({
				selector:"#agentcanvas-center",
				service:service,
				siteid:this.siteid,
				sitename: this.sitename,
				newScadaData : this.newScadaData,
				siteList:this.siteList,
				selectedScadaId:this.selectedScadaId
			});
		},
		renderSiteName:function(){
			var self = this;
			var sitename=self.sitename;
			self.agentCanvasDraw.renderSiteName_div(sitename);
		},
		renderCanvasTool:function(){
			this.agentCanvasTool = new AgentCanvasToolProperty({
				selector:"#agentcanvas-info",
				agentCanvasDraw:this.agentCanvasDraw,
				service:service,
				global:0
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
	return AgentCanvasProperty;
	
});