/**
 * @author fenghl
 * 
 */
define(function(require) {
	var cloud = require("cloud/base/cloud");
	var html = require("text!./history.html");
	var Content = require("../content");
	var HistoryInfo = require("./info");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var service = require("./service");
	
	var columns = [{
		"title" : "任务",
		"dataIndex":"name",
		"cls":null,
		"width":"20%"
	}
//	,{
//		"title":"任务类型",
//		"dataIndex":"type",
//		"cls":null,
//		"width":"15%"
//	}
	,{
		"title":"任务状态",
		"dataIndex":"state",
		"cls":null,
		"width":"10%",
		render:stateConvertor
	},{
		"title":"完成比率",
		"dataIndex":"progress",
		"cls":null,
		"width":"10%",
		render:function (value) {
			return value+"%";
		}
	},{
		"title":"现场名称",
		"dataIndex":"siteName",
		"cls":null,
		"width":"20%"
	},{
		"title":"添加人",
		"dataIndex":"username",
		"cls":null,
		"width":"25%"
	},{
		"title":"创建时间",
		"dataIndex":"startTime",
		"cls":null,
		"width":"15%",
		render:dateConvertor
	}];
	function dateConvertor(value, type) {
		if(type === "display"){
			return cloud.util.dateFormat(new Date(value), "yyyy-MM-dd hh:mm:ss");
		}else{
			return value;
		}
	}
	function stateConvertor(value,type){
		var display = "";
		if("display"==	type){
			switch (value) {
				case -1:
					display = "执行失败";
					break;
				case 0:
					display = "等待执行";
					break;
				case 1:
					display = "正在执行";
					break;
				case 2:
					display = "已取消";
					break;
				case 3:
					display = "已完成";
					break;
				case 4:
					display = "暂停";
					break;
				case 5:
					display = "等待发布";
					break;
				default:
					break;
			}
			return display;
		}else{
			return value;
		}
	};
	var Historys = Class.create(cloud.Component, {
		initialize : function($super, options) {
			$super(options);

			this.elements = {
				content : {
					id : "content-table"
				},
				info : {
					id : "info-table"
				}
			};
			
			this._render();
		},

		_render : function() {
			this._renderHtml();
			this._renderLayout();
			this._renderContent('historytask');
			this._renderHistoryInfo();
			this._renderModulesEvents();
			this._renderDataTable();
		},

		_renderHtml : function() {
			this.element.html(html);
		},

		_renderLayout : function() {
			var self = this;
			$(function() {
				self.layout = $("#history").layout({
					defaults : {
						paneClass : "pane",
						togglerClass : "cloud-layout-toggler",
						resizerClass : "cloud-layout-resizer",
						spacing_open: 1,
	                    spacing_closed: 1,
	                    togglerLength_closed: 50,
						togglerTip_open:locale.get({lang:"close"}),
	                    togglerTip_closed:locale.get({lang:"open"}),  
						resizable : false,
						slidable : false
					},
					center : {
						paneSelector : "#" + self.elements.content.id
					},
					east : {
						paneSelector : "#" + self.elements.info.id,
						initClosed : true,
						size : 240
					}
				});
			});
			self.layoutHideInfo();
		},

		_renderContent : function(businessType) {
			this.content = new Content({
				selector: "#"+this.elements.content.id,
				service:service,
				columns:columns,
				businessType:businessType
			});
		},

		_renderHistoryInfo : function(){
			this.info = new HistoryInfo({
				selector:"#"+this.elements.info.id
			});
		},
		
		_renderModulesEvents:function(){
			var self = this;
			this.content.on({
				"click":function(id){
					self.info.render(id);
					self.layoutOpenInfo();
				},
				"edit": function(id) {
					self.info.render(id);
					self.layoutOpenInfo();
					self.info.enable();
                },
                "pause": function(id) {
					self.info.pause(id);
                },
                "cancel": function(id) {
					self.info.canceTask(id);
                }
			});
			
			
			this.info.on({
				"afterInfoUpdated":function(id){
					self.content.updateResource(id);
				},
				"afterInfoDeleted":function(obj){
					
				}
			});
			
		},
		
		_renderDataTable:function(){
			this.content.render();
		},

		layoutHideInfo : function() {
			this.layout.hide("east");
		},

		layoutOpenInfo : function() {
			this.layout.open("east");
		},

		destroy : function() {
			this.elements = null;
			if (this.content) {
				if (this.content.destroy) {
					this.content.destroy();
				} else {
					this.content = null;
				}
			}
			if (this.HistoryInfo) {
				if (this.HistoryInfo.destroy) {
					this.HistoryInfo.destroy();
				} else {
					this.HistoryInfo = null;
				}
			}
		}

	});
	return Historys;
});
