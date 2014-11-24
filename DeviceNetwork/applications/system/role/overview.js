define(function(require) {
	require("cloud/base/cloud");
	var OverviewTemplate = require("../../template/overview");
	var InfoModule = require("./info");
	var service = require("./service");


	var RoleApplication = Class.create(cloud.Component, {
		initialize: function($super, options) {
			this.moduleName = "role-overview";
			$super(options);

			this.element.empty().addClass("cloud-application role-overview");
			this.overview = new OverviewTemplate({
				selector: this.element,
				service: service
			});

			this.infoModule = new InfoModule({
				selector: "#overview-info"
			});
			this.overview.setInfoModule(this.infoModule);
		},

		destroy: function(){
			this.element.removeClass("role-overview cloud-application");
			this.overview.destroy();
			if(this.infoModule.destroy) this.infoModule.destroy();
		}
	});
	return RoleApplication;
});