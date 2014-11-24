/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var NoticeBar = require("./notice-bar");
	var html = require("text!./content.html");
	var ContentSouth = require("./content-south");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var Content = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.service = options.service;
			this.businessType = options.businessType;
			this.elements = {
					bar:{
						id:"content-bar",
						"class":null
					},
					contentSouth:{
						id:"content-south",
						"class":null
					}
			};
			this._render();
		},
		
		_render:function(){
			this._renderHtml();
			this._renderLayout();
			this._renderContentSouth();
			this._renderNoticeBar();
		},
		
		_renderHtml:function(){
			this.element.html(html);
		},
		
		_renderLayout:function(){
			this.layout = this.element.layout({
                defaults: {
                    paneClass: "pane",
                    togglerLength_open: 50,
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    spacing_open: 1,
                    spacing_closed: 1,
                    togglerLength_closed: 50,
                    resizable: false,
                    slidable: false,
                    closable: false
                },
                north: {
                    paneSelector: "#" + this.elements.bar.id,
                    size: 32
                },
                center: {
                    paneSelector: "#" + this.elements.contentSouth.id
                }
            });
        },
        
		_renderNoticeBar:function(){
			var self = this;
			var noticeBar = new NoticeBar({
				selector: "#" + this.elements.bar.id,
				service:this.service,
				events:{
					query:function(opt){
						self.mask();
						self.contentSouth.load(opt);
					}
				}
			});
		},
		
		_renderContentSouth:function(){
			this.contentSouth = new ContentSouth({
				selector:"#" + this.elements.contentSouth.id,
				service:this.service
			});
		},
		
		destroy:function(){
			this.contentSouth.destroy();
		},
//		
//		reload:function(businessType){
//			this.destroy();
//			this.content = null;
//		},
//		
//		create:function(){
//			var self = this;
//			this.element.find("tr").live("click", function() {
//				self.fire("openInfo");
//				var rr = self.content.getData(this);
//				self.fire("onClickLog",rr);
//			});
//		},
		
	});
	
	return Content;
	
});