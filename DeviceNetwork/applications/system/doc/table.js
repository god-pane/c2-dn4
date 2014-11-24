define(function(require) {
	require("cloud/base/cloud");
	var TableTemplate = require("../../template/table");
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var Info = require("./info");
	var service = require("./service");

	var columns = [{
		"title": "文档名称",
		"dataIndex": "name",
		"width": "20%"
	}, {
		"title": "类型",
		"dataIndex": "type",
		"cls": null,
		"width": "20%"
	}, {
		"title": "从属于",
		"dataIndex": "belong",
		"cls": null,
		"width": "20%"
	}, {
		"title": "创建人",
		"dataIndex": "createrName",
		"cls": null,
		"width": "20%"
	}, {
		"title": "创建时间",
		"dataIndex": "createTime",
		"cls": null,
		"width": "20%",
		render:dateConvertor
	}];
	function dateConvertor(value, type) {
		if(type === "display"){
			return cloud.util.dateFormat(new Date(value), "yyyy-MM-dd hh:mm:ss");
		}else{
			return value;
		}
	}
	var DocumentTable = Class.create(cloud.Component, {
		initialize: function($super, options) {
			$super(options);
			this.info = null;
			var self=this;
			this.tableTemplate = new TableTemplate({
				infoModule: function() {
					if (self.info === null) {
						self.info = new Info({
							selector: $("#info-table")
						});
					}

					return self.info;
				},
				selector: this.element,
				service: service,
				contentColumns: columns
			});

			this.addToolbarItems();
			
		},
		
		addToolbarItems: function() {
			var self = this;
			var toolbar = this.tableTemplate.getToolbar();
			var labelBtn = new Button({
				imgCls: "cloud-icon-label",
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
			toolbar.appendRightItems([labelBtn], -1);
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
			if(this.tableTemplate){
				if(this.tableTemplate.destroy){
					this.tableTemplate.destroy();
				}else{
					this.tableTemplate=null;
				}

				if(this.tagManagerWindow){
				if(this.tagManagerWindow.destroy){
					this.tagManagerWindow.destroy();
				}else{
					this.tagManagerWindow=null;
				}

				if(this.tagManager){
					if(this.tagManager.destroy){
						this.tagManager.destroy();
					}
					else{
						this.tagManager=null;
					}
				}

				if(this.info){
					if(this.info.destroy){
						this.info.destroy();
					}else{
						this.info=null;
					}
				}


			}				
			}
		}
	});
	return DocumentTable;
});