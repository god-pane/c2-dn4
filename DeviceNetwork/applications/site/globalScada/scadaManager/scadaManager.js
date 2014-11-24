define(function(require){
    require("cloud/base/cloud");
	var manager = require("text!./scadaManager.html");
	var ScadaTable = require("./scadaTable");
	var ScadaTableToolbar= require("./toolbar");
	require("cloud/lib/plugin/jquery.qtip");
	require("cloud/lib/plugin/jquery.layout");
	var scadaManager = Class.create(cloud.Component,{
	initialize:function($super,options){
		$super(options);
		this.service=options.service;
		this.element.html(manager);
		this.render();
		
	},
	render:function(){
		this.renderLayout();
		this.renderManagerScadaToolbar();
		this.renderManagerScadaContent();
	},
	renderLayout:function(){
		if(this.layout){
			this.layout.destroy();
		}
		this.layout=$("#manager-scadaview-west").layout({
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
            	paneSelector: "#manager-scadaview-north",
            	size: 29 
            },
            center: {
            	paneSelector: "#manager-scadaview-center"
            }
		});
	},
	renderManagerScadaToolbar:function(){
		this.scadaToobar = new ScadaTableToolbar({
			selector:"#manager-scadaview-north",
			service:this.options.service
		});
	},
	renderManagerScadaContent:function(){
		this.scadaContent = new ScadaTable({
			selector:"#manager-scadaview-center",
			service:this.options.service
		});
	},
    destroy:function(){
    	if (this.layout && (!this.layout.destroyed)) {
        	this.layout.destroy();
        }
    	if(this.scadaToobar){
    		this.scadaToobar.destroy();
    		this.scadaToobar = null;
    	}
    	if(this.scadaContent){
    		this.scadaContent.destroy();
    		this.scadaContent = null;
    	}
    }
	});
	return  scadaManager;
});