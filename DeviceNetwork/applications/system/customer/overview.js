define(function(require) {
	require("cloud/base/cloud");
	var OverviewTemplate = require("../../template/overview");
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var InfoModule = require("./info");
	var service = require("./service");
	var TagManager = require("../../components/tag-manager");

	var CustomerOverview = Class.create(cloud.Component,{
		initialize: function($super, options) {
			var self = this;
			this.moduleName = "customer-overview";
			$super(options);

			this.infoModule = null;
			this.element.empty().addClass("cloud-application customer-overview");
			this.overview = new OverviewTemplate({
				selector: this.element,
				service: service,
				infoModule: function() {
					if (self.infoModule === null) {
						self.infoModule = new InfoModule({
							selector: "#overview-info"
						});
					}
					return self.infoModule;
				}
			});

			this.addToolbarItems();
			this.window = null;
			locale.render({element:this.element});
		},

		addToolbarItems: function() {
			var self = this;
			var toolbar = this.overview.getToolbar();
			var labelBtn = new Button({
				imgCls: "cloud-icon-label",
				lang:"{text:batch_tag,title:batch_tag}",
				events: {
					click: function() {
						var selectedResouces = this.overview.contentModule.getSelectedResources();
						if (selectedResouces.length == 0) {
						 dialog.render({lang:"please_select_at_least_one_config_item"});
						} else {

							service.getTableResourcesById(selectedResouces, function(_resources) {
								var resources = new Hash();
								_resources.each(function (resource) {
									resources.set(resource._id, resource.name);
								});
								self.renderTagManager(resources.toObject());
							}, this);
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
					self.overview.reloadTags("clicked");
				}
			})
		},
		destroy: function() {
			this.overview.destroy();
			this.overview.element.empty();
			this.overview = null;
		}
	});
	return CustomerOverview;
});