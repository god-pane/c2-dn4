/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./flowIndex.html");
	var NavThird = require("cloud/components/nav-third");
	var Chart = require("./chart/content");
	var FlowList = require("./flowList/content");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var service = require("./flowList/service");
	var Behav = Class.create(cloud.Component,{
		initialize:function($super,options){
			this.moduleName = "flow-index";
			$super(options);
			var self = this;
			permission.judge(["_flowStatus","read"],function(){
	//			this.element.addClass("flow-index").css({
	//				height: "100%"
	//			});
					self.elements = {
							nav:{
								id:"flow-nav",
								"class":null
							},
							content:{
								id:"flow-content",
								"class":null
							}
					};
					self._render();
			});
		},
		
		_render:function(){
			var self = this;
			self._renderHtml();
			self._renderLayout();
			self._renderContent("flowList");
			self._renderNavThird();
			locale.render({element:self.element});
		},
		
		_renderHtml:function(){
			this.element.html(html);
		},
		
		_renderLayout:function(){
        	var self = this;
        	$(function(){
        		self.layout = $('#flow').layout({
        			defaults: {
    					paneClass: "pane",
    					togglerClass: "cloud-layout-toggler",
    					resizerClass: "cloud-layout-resizer",
    					spacing_open: 1,
    					spacing_closed: 1,
    					togglerLength_closed: 50,
    					resizable: false,
    					slidable: false
    				},
    				west: {
    					paneSelector: "#" + self.elements.nav.id,
    					size: 182
    				},
    				center: {
    					paneSelector: "#" + self.elements.content.id
    				},
    				onresize: function () {
    					self.currentApplication.layout.resizeAll();
//    			        self.flowList.layout.resizeAll();
//    			    }
//    			    onopen:function(){
//    			    	self.currentApplication.layout.resizeAll();
//    			    	self.flowList.layout.resizeAll();
    			    }
        		});
        	});
        },
        
        _renderNavThird:function(){
        	var self = this;
        	var navThird = new NavThird({
        		selector: "#" + this.elements.nav.id,
        		main:{
        			text:locale.get({lang:"traffic_statistics"}),//"流量统计"
        			lang:"traffic_statistics"
        		},
        		sub:[
        		     {
        		    	text:locale.get({lang:"traffic_statistics_reports"}),//"流量统计报表",
             			lang:"log-behav-nav",
             			id:"log-behav-nav",
             			status:1,
             			click:function(){
             				self._renderContent("flowList");
             			}
        		     },
        		     {
         		    	text:locale.get({lang:"traffic_statistics_curve"}),//"流量统计曲线",
              			lang:"log-comm-nav",
              			id:"log-comm-nav",
              			status:0,
              			click:function(){
             				self._renderContent("flowChart");
             			}
         		     }
         		     ]
        	});
        },
        
        _renderContent:function(application){
			if (this.currentApplication && Object.isFunction(this.currentApplication.destroy)) {
                this.currentApplication.destroy();
                this.currentApplication = null;
            }
        	var self = this;
        	$("#flow-content").mask(locale.get({lang:"loading"}));
        	$("#flow-content").empty();
        	$("#flow-content").unmask();
        	switch (application) {
			case "flowList":
	        	self.currentApplication = new FlowList({
	        		container : "#" + this.elements.content.id,
	        		service:service
	        	});
				break;
			case "flowChart":
				self.currentApplication = new Chart({
					container:"#"+this.elements.content.id
				});
				break;
			}
        	
        },
        
        destroy:function(){
			if (this.currentApplication && Object.isFunction(this.currentApplication.destroy)) {
                this.currentApplication.destroy();
                this.currentApplication = null;
            }
        	$("#user-content").empty();
        	this.layout.destroy();
        	this.layout = null;
        }
        
	});
	
	return Behav;
	
});