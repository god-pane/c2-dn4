define(function(require) {
	require("cloud/base/cloud");
	var Table = require("../../template/table");
	var Info = require("./info");
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var service = require("./service");
	var TagManager = require("../../components/tag-manager");
	
	var columns = [{
		"title": "用户名称",
		"lang":"text:user_name",
		"dataIndex": "name",
		"cls": null,
		"width": "20%"
	},{
		"title": "邮箱",
		"dataIndex": "email",
		"lang":"text:email",
		"cls": null,
		"width": "20%"
	},{
		"title": "状态",
		"lang":"text:state",
		"dataIndex": "state",
		"cls": "state",
		"width": "15%",
		render: function (value, type) {
			if(type === "display"){
				var status = null;
				switch(value){
					case -1:
						status = locale.get("logouted");
						break;
					case 0:
						status = locale.get("logined");
						break;
					default:
						status = locale.get("locked");
						break;
				}
				return status;
			}else{
				return value;
			}
		}
	},{
		title: "角色",
		"lang":"text:role",
		"dataIndex": "roleName",
		width: "15%",
		render: function (value) {
//			var value = value.first();
			if(value  === "admin"){
			    return locale.get({lang:"organization_manager"});
			}else if(value  === "DeviceManager"){
			    return locale.get({lang:"device_manager"});
		    }else if(value  === "DeviceSense"){
			    return locale.get({lang:"device_sense"});
		    }else{
			    return value ;
			}
		}
	}, {
		title: "创建时间",
		"lang":"{text:create_time}",
		"dataIndex": "createTime",
		width: "15%",
		render: function (value, type) {
			if(type === "display"){
				return cloud.util.dateFormat(new Date(value), "yy-MM-dd hh:mm:ss");
			}else{
				return value;
			}
		}
	},{
		"title": "登录次数",
		"lang":"{text:login_times}",
		"dataIndex":"totalLogin",
		"cls": null,
		"width": "15%"
	}];
	var UserTable = Class.create(cloud.Component, {
		initialize: function($super, options) {
			$super(options);
			var self = this;
			this.beforVerifyUsers();
			 permission.judge(["_user","read"],function(){
				 if((permission.getInfo())["roleType"] <= 51){
					 var info = null;
					 self.tableTemplate = new Table({
						 infoModule: function() {
							 if (info === null) {
								 info = new Info({
									 selector: $("#info-table")
								 });
							 }
							 return info;
						 },
						 filters : {
							 "delete" : function(res){
								 return self.verifyUsers(res);
							 }
						 },
						 events:{
							"afterSelect":function(resources){
//								var nameArr=resources.findAll(function(resource){
//									return resource.roleName=="admin";
//								});
									//除了机构的第一个机构管理员，其他机构管理员可以互相删除
									var targets = resources.findAll(function(oneres){
										return oneres.email==self.email;
									});
									if(targets.length>0){
										self.tableTemplate.modules.content.deleteBtn.disable();
									}else{
										self.tableTemplate.modules.content.deleteBtn.enable();
									}

//								if(nameArr.length!=0){
//									self.tableTemplate.modules.content.deleteBtn.disable();
//								}
//								else{
//									self.tableTemplate.modules.content.deleteBtn.enable();
//								}
							} 
						 },
						 contentColumns: columns,
						 selector: self.element,
						 service: service
					 });
					 self.addToolbarItems();
					 self.window = null;
					 self.permission();
					 locale.render({element:self.element});
				 }
			 });
		},
		beforVerifyUsers:function(){
			var self=this;
			Model.organ({
				method:"query_current",
				param:{
					verbose:100
				},
				success:function(organData){
					self.email=organData.result.email;
				}
			});
		},
		verifyUsers:function(res,email){
			var self=this;
			if(res.size()>0){
				//验证自身帐号
				var loginedUser = cloud.platform.loginedUser;
				if(loginedUser){
					var login = res.find(function(oneres){
						return oneres._id === loginedUser._id;
					});
					if(login){
						dialog.render({lang:"cannt_del_self_account"});
						res = res.without(login);
					}
				};
				return res;
			}else{
				return [];
			}
			
			
		},
		
		permission:function(){
			var self = this;
			if(!(permission.app("_user"))["write"]){
				self.tableTemplate.modules.content.addBtn.hide();
				self.tableTemplate.modules.content.deleteBtn.hide();
			}
		},
		
		addToolbarItems: function() {
			var self = this;
			this.toolbar = this.tableTemplate.getToolbar();
			var labelBtn = new Button({
				imgCls: "cloud-icon-label",
//				title:"批量打标签",
				lang:"{text:batch_tag,title:batch_tag}",
				events: {
					click: function() {
						var selectedResouces = this.tableTemplate.modules.content.getSelectedResources();
						if (selectedResouces.length === 0) {
//							alert("At least select one item , Please!");
							dialog.render({lang:"please_select_at_least_one_config_item"});
						} else {
							var resources = new Hash();
							selectedResouces.each(function(resource) {
								resources.set(resource._id, resource.name);
							});
							self.renderTagManager(resources.toObject());
						}
					},
					scope: this
				}
			});
			this.toolbar.appendRightItems([labelBtn], -1);
		},
		
		renderTagManager: function(resources) {
			var self = this;
			this.tagManager = new TagManager({
				obj: resources
			});
			this.tagManager.on({
				"onComplete" : function(){
					self.tableTemplate.reloadTags("clicked");
				}
			})
		},
		
		destroy: function() {
//			this.tableTemplate.destroy();
//			this.tableTemplate.element.empty();
//			this.tableTemplate = null;
			$(this.element).empty();
		}
		
	});
	return UserTable;

});