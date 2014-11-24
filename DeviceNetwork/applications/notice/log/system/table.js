/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./table.html");
	var NavThird = require("cloud/components/nav-third");
	var Info = require("./info");
//	var ContentTable2 = require("../../../components/content-table2");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var service = require("./service");
	var logSystemTable = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.elements = {
					nav:{
						id:"log-system-nav",
						"class":null
					},
					content:{
						id:"log-system-content",
						"class":null
					},
					info:{
						id:"log-system-info",
						"class":null
					}
			};
			this._render();
		},
		
		_render:function(){
			this._renderHtml();
			this._renderLayout();
//			this._renderContentTable2();
			this._renderNavThird();
			this._renderInfo();
		},
		
		_renderHtml:function(){
			this.element.html(html);
		},
		
		_renderLayout:function(){
        	var self = this;
        	$(function(){
        		self.layout = $('#log-system').layout({
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
    					size: 300
    				}
        		});
        	});
        },
        
        _renderInfo:function(id){
        	this.info = new Info({
        		selector: "#" + this.elements.info.id
//        		selector:"#log-system-info",
//        		datas:{
//        			level:"1",
//        			time:"2013-01-10 12:12:12",
//        			from:"10.5.16.112",
//        			operator:"liaomj",
//        			content:"test"
//        		}
        	});
        },
        
        _renderNavThird:function(){
        	var self = this;
        	var navThird = new NavThird({
        		selector: "#" + this.elements.nav.id,
        		main:{
        			text:"日志",
        			lang:"log"
        		},
        		sub:[
        		     {
        		    	text:"操作日志",
             			lang:"operating_log",
             			id:"log-behav-nav",
             			status:1,
             			click:function(){
//        					alert("log-behav-nav");
             			}
        		     },
        		     {
         		    	text:"通信日志",
              			lang:"communication_log",
              			id:"log-comm-nav",
              			status:0,
              			click:function(){
//    						alert("log-comm-nav");
              			}
         		     },
         		     {
         		    	text:"系统日志",
              			lang:"system_log",
              			id:"log-system-nav-a",
              			status:0,
              			click:function(){
//    						alert("log-system-nav-a");
              			}
         		     }
         		     ]
//         		    events:{
//    					click0:function(){
//    						self.contentTable2.reload("behavlog");
//    					},
//    					click1:function(opt){
//    						self.contentTable2.reload("commlog");
//    					},
//    					click2:function(opt){
//    						self.contentTable2.reload("systemlog");
//    					}
//    				}
        	});
        }
        
//        _renderContentTable2:function(){
//        	var self = this;
//        	this.contentTable2 = new ContentTable2({
////        		businessType:"behavlog",
//        		selector: "#" + this.elements.content.id,
//        		service:service,
//        		events:{
//        			onClickLog:function(obj){
//        				self.info.setInfo(obj);
//        			},
//        			openInfo:function(){
//        				self.layout.open("east");
//        			}
//        		}
//        	});
//        }
        
	});
	
	return logSystemTable;
	
});