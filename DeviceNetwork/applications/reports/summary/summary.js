/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./summary.html");
	var NavThird = require("cloud/components/nav-third");
	var Content = require("./content");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var service = require("./service");
	var Summary = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			var self = this;
			permission.judge(["_summary","read"],function(){
				self.elements = {
						nav:{
							id:"summary-nav",
							"class":null
						},
						content:{
							id:"summary-content",
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
			self._renderNavThird();
			self._renderContent('sitereprot');
			locale.render({element:self.element});
		},
		
		_renderHtml:function(){
			this.element.html(html);
		},
		
		_renderLayout:function(){
        	var self = this;
        	$(function(){
        		self.layout = $('#user-content').layout({
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
        		});
        	});
        },
        
        
        _renderNavThird:function(){
        	var self = this;
        	this.navThird = new NavThird({
        		selector: "#" + this.elements.nav.id,
        		main:{
        			text:"汇总",
        			lang:"text:summary"
        		},
        		sub:[
        		     {
        		    	text:"现场汇总表",
             			lang:"text:site_summary",
             			id:"summary-site-nav",
             			status:1,
             			click:function(){
             				self._renderContent('sitereprot');
             				locale.render({element:"#content"});
             			}
        		     },
        		     {
         		    	text:"设备汇总表",
              			lang:"text:gateway_summary",
              			id:"summary-device-nav",
              			status:0,
              			click:function(){
							self._renderContent('devicereprot');
							locale.render({element:"#content"});
             			}
         		     }
//         		     {
//         		    	text:"告警汇总表",
//              			lang:"summary-alarm-nav",
//              			id:"summary-alarm-nav",
//              			status:0,
//						click:function(){
//							self._renderContent('alarmreprot');
//             			},
//         		     }
         		     ]
        	});
        },
        
        _renderContent:function(businessType){
        	var self = this;
			if(this.content){
				this.content.destroy();
			}
				this.content = new Content({
        		selector: "#" + this.elements.content.id,
        		service:service,
				    businessType:businessType
			});
        },
        
        destroy: function() {
          this.elements=null;
		  if (this.layout && (!this.layout.destroyed)) {
            	this.layout.destroy();
            }
          if(this.navThird){
            if(this.navThird.destroy){
              this.navThird.destroy();
            }else{
              this.navThird=null;
            }
          }
          if(this.content){
            if(this.content.destroy){
              this.content.destroy();
            }else{
              this.content=null;
            }
          }
      }
        
	});
	
	return Summary;
	
});