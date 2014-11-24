define(function(require){
	require("cloud/base/cloud");
	var tagScadaView = require("text!./tag-scadaview.html");
	var PopupOverviewModule = require("../../../../components/tag-overview");
	var ScadaSiteTable = require("../../scada/template/scadaview-site-table");
	var TagScadaView = Class.create(cloud.Component,{
		
		initialize:function($super,options){
			$super(options);
			this.element.html(tagScadaView);
//			this.contentScada = options.contentScada;
			this.renderLayout();
		},
		
		renderLayout:function(){
			if(this.layout){
				this.layout.destroy();
			}
			this.layout=$("#tag-scadaview-west").layout({
				defaults: {
                    paneClass: "pane",
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 1,
                    "spacing_closed": 1,
                    "togglerLength_closed": 50,
                    resizable: false,
                    slidable: false,
                    closable: false
                },
                north:{
                	paneSelector: "#tag-scadaview-north",
                	size: 260 //修改前是300,要是留2个新建标签的位置为315;要是留1个新建标签的位置为260
                },
                center: {
                	paneSelector: "#tag-scadaview-center", 
                }
			});
			this.renderTagScadaViewNorth();
			this.renderTagScadaViewContent();
		},
		
		renderTagScadaViewNorth:function(){
            this.tagOverview = new PopupOverviewModule({
                service: this.options.service,
                selector: "#tag-scadaview-north"
            });
		},
		renderTagScadaViewContent:function(){
			this.scadaTable = new ScadaSiteTable({
				selector:"#tag-scadaview-center",
				service:this.options.service
			});
		},
        
        destory:function(){
        	if (this.layout && (!this.layout.destroyed)) {
            	this.layout.destroy();
            }
        	
        	if(this.scadaTable){
        		this.scadaTable.destroy();
        		this.scadaTable = null;
        	}
        	
        	if(this.tagOverview){
        		this.tagOverview.destroy();
        		this.tagOverview = null;
        	}
        }
	});
	return TagScadaView;
});