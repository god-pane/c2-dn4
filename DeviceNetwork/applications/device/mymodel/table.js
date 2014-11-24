define(function(require) {
	require("cloud/base/cloud");
	var TableTemplate = require("../../template/table");
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var Info = require("./info");
	var service = require("./service");
	var columns = [{
		"title": "机型名称",
		"dataIndex": "name",
		"width": "25%"
	}, {
		"title": "机型型号",
		"dataIndex": "model",
		"cls": null,
		"width": "25%",
		render: function (value, type) {
			if(type === "display"){
				var status = null;
				switch(value){
					case "1":
						status = "InDTU";
						break;
					case "31":
						status = "IR300";
						break;
					case "36":
						status = "IR320";
						break;
					case "44":
						status = "IR6XX_EVDO";
						break;
					case "45":
						status = "IR6XX_TD";
						break;
					case "46":
						status = "IR6XX_WCDMA";
						break;
					case "51":
						status = "IR7XX_GPRS/EDGE";
						break;
					case "54":
						status = "IR7XX_WCDMA";
						break;
					case "60":
						status = "IR7XX_TD";
						break;
					case "63":
						status = "IR7XX_EVDO/CDMA";
						break;
					default:
						status = "undefined";
						break;
				}
				return status;
			}else{
				return value;
			}
		}
	}, 
//	{
//		"title": "读写方式",
//		"dataIndex": "ioType",
//		"cls": null,
//		"width": "25%",
//		render: function (value, type) {
//			if(type === "display"){
//				var status = null;
//				switch(value){
//					case -1:
//						status = "可读可写";
//						break;
//					case 0:
//						status = "只读";
//						break;
//					case 1:
//						status = "只写";
//						break;
//				}
//				return status;
//			}else{
//				return value;
//			}
//		}
//	}, 
	{
		"title": "创建人",
		"dataIndex": "owner",
		"cls": "create-man",
		"width": "25%",
		render:function(value,type){
			var name;
			cloud.Ajax.request({
                url: "api2/users/" + value,
                type: "GET",
                async:false,
                parameters: {
                    verbose: 5
                },
                success: function(data) {
                	name = data.result.name;
                }
            });
			return name;
		}
	}, {
		"title": "创建时间",
		"dataIndex": "createTime",
		"cls": null,
		"width": "25%",
		render: function (value, type) {
			if(type === "display"){
				return cloud.util.dateFormat(new Date(value), "yy-MM-dd hh:mm:ss");
			}else{
				return value;
			}
		}
	},
		{
			"title": "",
			"dataIndex": "_id",
			"cls": "hide _id",
			"width": "1%"
		}
	];

	var MyDeviceModelTable = Class.create(cloud.Component, {
		initialize: function($super, options) {
			$super(options);
			var modelConfig = permission.app("_model");
			if(!modelConfig.read) {
				return ;
			}
			var info = null;

			this.tableTemplate = new TableTemplate({
				infoModule: function() {
					if (info === null) {
						info = new Info({
							selector: $("#info-table")
						});
					}

					return info;
				},
				selector: this.element,
				service: service,
				contentColumns: columns
			});

			this.addToolbarItems();
			this.window = null;
			
			this.empower();
		},
		
		empower: function() {
//			var modelConfig = permission.app("_model");
//			if(!modelConfig.write) {
//				this.tableTemplate.modules.content.addBtn.hide();
//				this.tableTemplate.modules.content.deleteBtn.hide();
//			}
//			if(!modelConfig.import) {
//				
//			}
			alert(1);
			this.tableTemplate.modules.content.addBtn.disable();
			this.tableTemplate.modules.content.deleteBtn.disable();
		},

		addToolbarItems: function() {
			var self = this;
			var toolbar = this.tableTemplate.getToolbar();
			var labelBtn = new Button({
				imgCls: "cloud-icon-label",
				title:"打标签",
				events: {
					click: function() {
						var selectedResouces = this.tableTemplate.modules.content.getSelectedResources();
						if (selectedResouces.length == 0) {
//							alert("At least select one item , Please!");
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
			var favorBtn = new Button({
				imgCls : "cloud-icon-star1",
				//id: this.moduleName + "-add-button",
				title:"收藏",
				events : {
					click:function(){
						var resourceIds = self.getSelectedIds();
						cloud.Ajax.request({
			                url: "api/favorites",
			                type: "POST",
			                data:{
			                	resourceIds:resourceIds
			                },
			                parameters: {
			                    verbose: 4
			                },
			                success: function(data) {
//			                	alert("The resource Favorited Successfully");
			                }
			            });
					}
				}
			});
			toolbar.appendRightItems([favorBtn,labelBtn], -1);
		},
		
		getSelectedIds:function(){
			var self = this;
			return self.tableTemplate.modules.content.content.getSelectedIds();
		},
		
		renderTagManager: function(resources) {
			if (!this.tagManagerWindow) {
				this.tagManagerWindow = new _Window({
					container: "body",
					title: "标签批量操作",
					top: "center",
					left: "center",
					height: 620,
					width: 605,
					mask: false,
					content: "<div id='overview-window-tag'></div>",
					events: {
						"onClose": function() {
							this.tagManager.destroy();
							this.tagManager = null;
							this.tagManagerWindow = null;
						},
						scope: this
					}
				});
				var self = this;
				require(["../../components/tag-manager"], function(TagManager) {
					self.tagManager = new TagManager({
						selector: self.tagManagerWindow.element.find("#overview-window-tag"),
						obj: resources
					});
				});
				this.tagManagerWindow.show();
			} else {
				this.tagManagerWindow.show();
			}
		},

		destroy: function() {
//			this.tableTemplate.element.empty();
			this.tableTemplate.destroy();
			this.tableTemplate = null;
			if (this.tagManager != null) this.tagManager.destroy();
			if(this.infoModule){
				if (this.infoModule.destroy) this.infoModule.destroy();
			}			
		}
	});
	
	return MyDeviceModelTable;
	
});