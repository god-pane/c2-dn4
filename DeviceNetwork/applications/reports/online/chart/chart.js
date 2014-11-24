/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./chart.html");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var ThirdNav = require("cloud/components/nav-third");
	var Content = require("./content");
	var service = require("./service");
	var Chart = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.elements = {
					box:{
						id:"online-chart",
						"class":null
					},
					nav:{
						id:"online-chart-nav",
						"class":null
					},
					content:{
						id:"online-chart-content",
						"class":null
					}
			};
			this._render();
			locale.render({element:this.element});
		},
		
		_render:function(){
			this._renderHtml();
			this._renderLayout();
			this._renderThirdNav();
			this._renderContent();
		},
		
		_renderHtml:function(){
			var self = this;
			$(function(){
				self.element.html(html);
			});
		},
		
		_renderLayout:function(){
        	var self = this;
        	$(function(){
        		self.layout = $("#" + self.elements.box.id).layout({
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
        			lang:"reports-online"
        		},
        		sub:[
        		     {
        		    	 text:locale.get({lang:"online_statistics_reports"}),
             			lang:"reports-online-report",
             			id:"reports-online-report",
//             			status:0,
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
              			lang:"reports-online-chart",
              			id:"reports-online-chart",
              			selected:1,
//              			status:1,
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
			this.element.empty();
			this.content.destroy();
			this.content = null;
			this.elements = null;
		}
        
	});
	
	return Chart;
	
});