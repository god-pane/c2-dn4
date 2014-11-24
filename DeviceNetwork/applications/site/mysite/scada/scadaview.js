/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author FENG-HL
 */
define(function(require){
	require("cloud/lib/plugin/ext/ext-base");
	require("cloud/lib/plugin/ext/ext-all");
	require("cloud/base/cloud");
	var service = require("../service");
	var ScadaTemplate = require("../scada/template/scadaview");
	//var Global=require("../applications/site/mysite/scada/components/canvas/Global");
	var Global=require("../scada/components/canvas/Global");
	require("../agent/css/agent-canvas.css");
	var ScadaView = Class.create(cloud.Component,{
		
		initialize:function($super,options){
			var self = this;
			this.moduleName = "scadasite-view";
			$super(options);
			this.siteid = options.siteid;
			this.element.empty().addClass("cloud-application");
			this.scadaTemp = new ScadaTemplate({
				selector:this.element,
				service:service,
				siteid:this.siteid
			});
			Global.init();
		},
		
		destroy:function(){
			if(this.scadaTemp){
				this.scadaTemp.destroy();
				this.scadaTemp = null;
			}
		}
		
	});
	return ScadaView;
});
