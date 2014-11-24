/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./comm.html");
	var NavThird = require("cloud/components/nav-third");
	var Info = require("./info");
	var Content = require("./content");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var service = require("./service");
	var Behav = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.elements = {
					nav:{
						id:"behav-nav",
						"class":null
					},
					content:{
						id:"behav-content",
						"class":null
					},
					info:{
						id:"behav-info",
						"class":null
					}
			};
			this._render();
			locale.render({element:this.element});
		},
		
		_render:function(){
			this._renderHtml();
			this._renderLayout();
			this._renderContent();
			this._renderNavThird();
			this._renderInfo();
		},
		
		_renderHtml:function(){
			this.element.html(html);
		},
		
		_renderLayout:function(){
        	var self = this;
        	$(function(){
        		self.layout = $('#behav').layout({
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
    				},
    				east: {
    					paneSelector: "#" + self.elements.info.id,
    					initClosed: true,
    					size: 228
    				}
        		});
        		$("#behav-info-toggler").css("display","none");
        	});
        },
        
        _renderInfo:function(id){
        	this.info = new Info({
        		selector: "#" + this.elements.info.id
        	});
        },
        
        _renderNavThird:function(){
        	var self = this;
        	var navThird = new NavThird({
        		selector: "#" + this.elements.nav.id,
        		main:{
        			text:"日志",
        			lang:"text:log"
        		},
        		sub:[
        		     {
        		    	text:"操作日志",
        		    	lang:"text:operating_log",
             			id:"log-behav-nav",
//             			status:0,
             			click:function(){
             				self.element.empty();
              				require(["../behav/behav"],function(Behav){
              					var behav = new Behav({
              						selector:"#user-content"
              					});
              				});
             			}
        		     },
        		     {
         		    	text:"通信日志",
              			lang:"text:communication_log",
              			id:"log-comm-nav",
//              			status:1,
              			selected:1,
              			click:function(){
              				self.element.empty();
              				require(["./comm"],function(Comm){
              					var comm = new Comm({
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
        	var content = new Content({
        		selector: "#" + this.elements.content.id,
        		service:service,
        		events:{
        			onClickLog:function(obj){
        				self.info.setInfo(obj);
        			},
        			openInfo:function(){
        				self.layout.open("east");
        			},
        			onTurnPage : function(page){
        				self.info.setInfo(null);
        				self.layout.close("east");
        			},
        			closeInfo: function(){
        				self.layout.close("east");
        				$("#level").text("");
        				$("#time").text("");
        				$("#devicename").text("");
        				$("#sitName").text("");
        				$("#from").text("");
        				$("#content").val("");
        			}
        		}
        	});
        	
        },
        
        destroy:function(){
			if (this.layout && (!this.layout.destroyed)) {
            	this.layout.destroy();
            }
        	this.element.empty();
        }
        
        
	});
	
	return Behav;
	
});