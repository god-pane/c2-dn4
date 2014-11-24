/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./report.html");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var ThirdNav = require("cloud/components/nav-third");
	var Content = require("./content");
	var service = require("./service");
	var Report = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			var self = this;
			permission.judge(["_connectionStatus","read"],function(){
				self.elements = {
						box:{
							id:"online-report",
							"class":null
						},
						nav:{
							id:"online-report-nav",
							"class":null
						},
						content:{
							id:"online-report-content",
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
			self._renderThirdNav();
			self._renderContent();
			locale.render({element:self.element});
		},
		
		_renderHtml:function(){
			var self = this;
			self.element.html(html);
		},
		
		_renderLayout:function(){
        	var self = this;
        	$(function(){
        		self.layout = $("#" + self.elements.box.id).layout({
//        		self.layout = self.element.layout({
        			defaults: {
    					paneClass: "pane",
    					togglerClass: "cloud-layout-toggler",
    					resizerClass: "cloud-layout-resizer",
    					spacing_open: 1,
    					spacing_closed: 1,
    					togglerLength_closed: 50,
						togglerTip_open:locale.get({lang:"close"}),
                    	togglerTip_closed:locale.get({lang:"open"}),  
    					resizable: false,
    					slidable: false
    				},
    				west: {
    					paneSelector: "#" + self.elements.nav.id,
    					size: 182
    				},
    				center: {
    					paneSelector: "#" + self.elements.content.id
    				}
//    				east: {
//    					paneSelector: "#" + self.elements.info.id,
//    					initClosed: true,
//    					size: 300,
//    				}
        		});
        	});
        },
        
        _renderThirdNav:function(){
        	var self = this;
        	var thirdNav = new ThirdNav({
        		selector: "#" + this.elements.nav.id,
        		main:{
        			text:locale.get({lang:"online_statistics"}),
        		},
        		sub:[
        		     {
        		    	text:locale.get({lang:"online_statistics_reports"}),
             			id:"reports-online-report",
             			status:1,
             			click:function(){
             				self.destroy();
              				require(["../report/report"],function(Report){
              					var report = new Report({
              						selector:"#user-content"
              					});
              				});
             			}
             			
        		     },
        		     {
        		    	text:locale.get({lang:"online_statistics_curve"}),
              			id:"reports-online-chart",
              			status:0,
              			click:function(){
              				self.destroy();
              				require(["../chart/chart"],function(Chart){
              					var chart = new Chart({
              						selector:"#user-content"
              					});
              				});
              			}
         		     }
        		 ]
        	});
        },
        
        _renderContent:function(){
        	var self = this;
        	this.content = new Content({
        		selector: "#" + this.elements.content.id,
        		service:service
        	});
        },
        
        destroy:function(){
			if(this.layout&&(!this.layout.destroyed)){
				this.layout.destroy();
			}
			this.content.destroy();
			this.element.empty();
		}
        
	});
	
	return Report;
	
});