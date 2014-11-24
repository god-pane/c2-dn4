define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./console.html");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var service = require("./service");
	var DeviceConsole = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
		
		this._renderHtml();
		},
        
		_renderHtml:function(){
			this.element.html(html);
		},
		
        destroy:function(){
        	
        	//一系列的清除动作
        	
        }
	});
	
	return DeviceConsole;
});