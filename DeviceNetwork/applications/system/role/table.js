/**
 * @author PANJC
 *
 */
define(function(require) {
	require("cloud/base/cloud");
	var TableTemplate = require("../../template/table");
	var Info = require("./info");
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var service = require("./service");
	var TagManager = require("../../components/tag-manager");


	var dateConvertor = function(name, type, data) {
		if ("display" == type) {
			return cloud.util.dateFormat(new Date(name), "yyyy-MM-dd hh:mm:ss");
		} else {
			return name;
		}
	};

	var columns = [{
		"title": "角色名称",
		"lang":"{text:role_name1}",
		"dataIndex": "name",
		"width": "25%",
		render: function(name, type, data) {
			if(data.name === "admin"){
			    return locale.get({lang:"organization_manager"});
			}else if(data.name === "DeviceManager"){
			    return locale.get({lang:"device_manager"});
			}else if(data.name === "DeviceSense"){
			    return locale.get({lang:"device_sense"});
			}else{
			    return data.name;
			}
//			if ("display" == type) {
//				var html = data.name;
//				if (data.shared) {
//					html += new Template("<div  style = 'display : inline-block; margin-left: 4px' class='cloud-icon-active cloud-icon-share'></div>").evaluate();
//				}
//				if (data.favor) {
//					html += new Template("<div  style = 'display : inline-block; margin-left: 4px' class='cloud-icon-active cloud-icon-star'></div>").evaluate();
//				}
//				return html;
//			} else {
//				return data.name;
//			}
		}
	},
//	 { 
//		"title": "关联用户",
//		"lang" : "{text:relevance+user}",
//		"dataIndex": "userNames",
//		"cls": null,
//		"width": "35%"
//	},
	 {
		"title": "创建时间",
		"dataIndex": "createTime",
		"lang": "{text:create_time}",
		"cls": null,
		"width": "35%",
		render: dateConvertor
	}, {
		"title": "更新时间",
		"dataIndex": "updateTime",
		"lang": "{text:update_time}",
		"cls": null,
		"width": "35%",
		render: dateConvertor
	}];

	var RoleTable = Class.create(cloud.Component, {
		initialize: function($super, options) {
			$super(options);
			var self = this;
			 permission.judge(["_role","read"],function(){
				 if((permission.getInfo())["roleType"] <= 51){
					 var info = null;
					 self.tableTemplate = new TableTemplate({
						 infoModule: function() {
							 if (info === null) {
								 info = new Info({
									 selector: $("#info-table")
								 });
							 }
							 return info;
						 },
						 contentColumns: columns,
						 selector: self.element,
						 service: service,
						 events: {
							 "afterSelect": function(resource) {
//								 console.log(resource);
//								 if(resource[0].type <= 51) {
//									 self.tableTemplate.modules.content.deleteBtn.disable();
//								 }
//								 else {
//									 self.tableTemplate.modules.content.deleteBtn.enable();
//								 }
								 console.log(resource);
								 var nameArr=resource.findAll(function(one){
									 return one.name=="admin";
								 });
								 var typeArr=resource.findAll(function(one){
									return (one.name=="DeviceManager"||one.name=="DeviceSense"); 
								 });
								 if(nameArr.length == 1 || typeArr.length>0){
									 self.tableTemplate.modules.content.deleteBtn.disable();
								 }
								 else {
									 self.tableTemplate.modules.content.deleteBtn.enable();
								 }
							 }
						 }
					 });
					 if(self.addToolbarItems){
						 self.addToolbarItems();
					 }
					 self.window = null;
					 //this.privilege();
					 locale.render({element:self.element});
					 self.permission();
					 self.disableAdmin();
				 }
				 else{
					 var info = null;
					 self.tableTemplate = new TableTemplate({
						 infoModule: function() {
							 if (info === null) {
								 info = new Info({
									 selector: $("#info-table")
								 });
							 }
							 return info;
						 },
						 contentColumns: columns,
						 selector: self.element,
						 service: service,
						 events: {
							 "afterSelect": function(resource) {
								 var nameArr=resource.findAll(function(resource){
									 return resource.name=="admin";
								 });
								 if(nameArr.length == 1){
									 self.tableTemplate.modules.content.deleteBtn.disable();
								 }
								 else {
									 self.tableTemplate.modules.content.deleteBtn.enable();
								 }
							 }
						 }
						 
					 });
					 if(this.addToolbarItems){
						 this.addToolbarItems();
					 }
					 this.window = null;
					 //this.privilege();
					 locale.render({element:self.element});
					 self.permission();
					 self.disableAdmin();
				 }
			 });
		},
		
		disableAdmin: function() {
			var table = this.tableTemplate.modules.content.content;
//				data = table.getAllData(),
//				htmlRows = table.getRows();
			table.on({
				"onLoad": function(datas) {
					for(var i = 0 ; i < datas.length ; i++) {
						if(datas[i].type == 51) {
							$(table.getRows()[i]).find("a").attr("disabled", true);
						}
					}
				}
			});
		},
		
		addToolbarItems: function() {
			var self = this;
			var toolbar = this.tableTemplate.getToolbar();
			var labelBtn = new Button({
				imgCls: "cloud-icon-label",
				lang:"{text:batch_tag,title:batch_tag}",
				events: {
					click: function() {
						var selectedResouces = this.tableTemplate.modules.content.getSelectedResources();
						if (selectedResouces.length == 0) {
							dialog.render({lang:"please_select_at_least_one_config_item"});
//							alert("At least select one item , Please!");
						} else {
							var resources = new Hash();
							selectedResouces.each(function(resource) {
								if(resource.name === "admin"){
									resource.name = locale.get("organization_manager");
								}else if(resource.name === "DeviceManager"){
									resource.name = locale.get("device_manager");
								}
								resources.set(resource._id, resource.name);
							});
							self.renderTagManager(resources.toObject());
						}
					},
					scope: this
				}
			});
			toolbar.appendRightItems([labelBtn], -1);
		},
		
		permission:function(){
			var self = this;
			if(!(permission.app("_role"))["write"]){
				self.tableTemplate.modules.content.addBtn.hide();
				self.tableTemplate.modules.content.deleteBtn.hide();
			}
		},
		
		renderTagManager: function(resources) {
			var self = this;
			if (self.tagManager){
				self.tagManager.destroy();
			}
			this.tagManager = new TagManager({
				obj: resources
			});
			this.tagManager.on({
				"onComplete" : function(){
					self.tableTemplate.reloadTags("clicked");
				}
			});
		},
		privilege:function(){
			if(!cloud.PrivilegeManager.can(8)){
				$("#content-table-add-button,#content-table-delete-button").hide();
			}
		},
		
		destroy: function() {
//			this.tableTemplate.destroy();
//			this.tableTemplate.element.empty();
//			this.tableTemplate = null;
			$(this.element).empty();
		}
	});
	return RoleTable;
});