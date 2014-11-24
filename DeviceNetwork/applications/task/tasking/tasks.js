/**
 * @author fenghl
 * 
 */
define(function(require) {
	var cloud = require("cloud/base/cloud");
	var html = require("text!./tasks.html");
	var Content = require("../content");
	var TaskInfo = require("./info");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var service = require("./service");
	var columns = [
	{
		"title" : "任务",
		"dataIndex":"name",
		"cls":null,
		"lang":"{text:task_name}",
		"width":"15%"
	}
	,{
		"title":"设备名称",
		"dataIndex":"objectName",
		"cls":null,
		"lang":"{text:device_name1}",
		"width":"12%"
	},
	{
		"title":"任务类型",
		"dataIndex":"type",
		"cls":null,
		"lang":"{text:task_type}",
		"width":"10%"
	},{
		"title":"发起者类型",
		"dataIndex":"userType",
		"cls":null,
		"lang":"{text:sponsor_type}",
		"width":"8%",
		render:function(data, type, row){
			switch (data) {
				case 0:
					return locale.get("system");
					break;
				case 1:
					return locale.get("user");
					break;
				case 2:
					return locale.get("ovdp_config");
					break;
				default:
					return locale.get("others");
					break;
			}
		}
	},{
		"title":"任务状态",
		"dataIndex":"state",
		"cls":null,
		"width":"9%",
		"lang":"{text:task_state}",
		render:stateConvertor
	},{
		"title":"完成比率",
		"dataIndex":"progress",
		"cls":null,
		"width":"8%",
		"lang":"{text:finish_rate}",
		render:function(value){
			value = Math.round(value*100*100)/100;
			return value+"%";
		}
	},{
		"title":"添加人",
		"dataIndex":"username",
		"cls":null,
		"lang":"{text:creator}",
		"width":"12%"
	},{
		"title":"创建时间",
		"dataIndex":"create",
		"cls":null,
		"width":"13%",
		"lang":"{text:create_time}",
		render:dateConvertor
	},{
		"title":"更新/完成时间",
		"dataIndex":"updateTime",
		"cls":null,
		"width":"13%",
		"lang":"{text:update_time}",
		render:dateConvertor
	}];
	function dateConvertor(value, type) {
		if(value){
			if(type === "display"){
				return cloud.util.dateFormat(new Date(value), "yyyy-MM-dd hh:mm:ss");
			}else{
				return value;
			}
		}else{
			return "";
		}
	}
	function stateConvertor(value,type){
		var display = "";
		if("display"==	type){
			switch (value) {
				case -1:
					display = locale.get({lang:"exec_failure"});
					break;
				case 0:
					display = locale.get({lang:"wait_execute"});
					break;
				case 1:
					display = locale.get({lang:"executing"});
					break;
				case 2:
					display = locale.get({lang:"canceled"});
					break;
				case 3:
					display = locale.get({lang:"completed"});
					break;
				case 4:
					display = locale.get({lang:"pause"});
					break;
				case 5:
					display = locale.get({lang:"wait_publish"});
					break;
				default:
					break;
			}
			return display;
		}else{
			return value;
		}
	};
	var Tasks = Class.create(cloud.Component, {
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
			this.permission();
			locale.render({element:this.element});
		},
		permission:function(){
			var self = this;
			var flag=permission.app("_task")["write"];
			if(!flag){				
				self.content.cancelBtn.hide();
			self.content.pauseBtn.hide();
			self.content.recoverBtn.hide();
//			self.info.editButton.hide();
//			self.info.pauseButton.hide();
//			self.info.recoverButton.hide();
//			self.info.cancelButton.hide();
//			self.info.submitButton.hide();
//			self.info.editCancelButton.hide();
			};	
		},
		_render : function() {
			this._renderHtml();
			this._renderLayout();
			this._renderContent('alltask');
			this._renderTaskInfo();
			this._renderModulesEvents();
			this._renderDataTable();
		},

		_renderHtml : function() {
			this.element.html(html);
		},

		_renderLayout : function() {
			var self = this;
			$(function() {
				self.layout = $("#tasking").layout({
					defaults : {
						paneClass : "pane",
						togglerClass : "cloud-layout-toggler",
						resizerClass : "cloud-layout-resizer",
						spacing_open: 0,
	                    spacing_closed: 0,
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
			$("#info-table-toggler").css("display","none");
//			self.layoutHideInfo();
		},

		_renderContent : function(businessType) {
			this.content = new Content({
				selector: "#"+this.elements.content.id,
				service:service,
				columns:columns,
				businessType:businessType
			});
		},

		_renderTaskInfo : function(){
			this.info = new TaskInfo({
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
                "recover": function(id) {
					self.info.recover(id);
                },
                "cancel": function(id) {
					self.info.canceTask(id);
                },
                "close": function(){
                	self.layoutHideInfo();
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
			stateConvertor();
			this.content.render();
		},

		layoutHideInfo : function() {
			this.layout.close("east");
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
			if (this.taskInfo) {
				if (this.taskInfo.destroy) {
					this.taskInfo.destroy();
				} else {
					this.taskInfo = null;
				}
			}
		}

	});
	return Tasks;
});
