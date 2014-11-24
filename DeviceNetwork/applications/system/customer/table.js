define(function(require) {
	require("cloud/base/cloud");
	var TableTemplate = require("../../template/table");
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var Info = require("./info");
	var service = require("./service");
	var TagManager = require("../../components/tag-manager");

	var columns = [{
		"title": "客户名称",
		"dataIndex": "name",
		"width": "10%"
	}, {
		"title": "客户地址",
		"dataIndex": "address",
		"cls": null,
		"width": "20%"
	}, {
		"title": "公司电话",
		"dataIndex": "phone",
		"cls": null,
		"width": "15%"
	}, {
		"title": "公司网站",
		"dataIndex": "website",
		"cls": null,
		"width": "15%"
	}, {
		"title": "主联系人",
		"dataIndex": "contact.name",
		"cls": null,
		"width": "10%"
	}, {
		"title": "手机",
		"dataIndex": "contact.phone",
		"cls": null,
		"width": "15%"
	}, {
		"title": "邮件地址",
		"dataIndex": "email",
		"cls": null,
		"width": "15%"
	}];

	var CustomerTable = Class.create(cloud.Component, {
		initialize: function($super, options) {
			$super(options);
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
			locale.render({element:this.element});
			
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
			toolbar.appendRightItems([labelBtn], -1);
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
			this.tableTemplate.destroy();
			this.tableTemplate.element.empty();
			this.tableTemplate = null;
		}
	});
	return CustomerTable;
});