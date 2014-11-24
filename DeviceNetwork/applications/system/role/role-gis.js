define(function(require) {
	require("cloud/base/cloud");
	var InfoModule = require("./info");
	var service = require("./service");
	var Map = require("cloud/components/map");

	var UserApplication = Class.create(cloud.Component, {
		initialize: function($super, options) {
			this.moduleName = "user-gis";
			$super(options);

			this.element.empty().addClass("cloud-application user-overview");
			this.map = new Map({
				selector: this.element,
				zoom: 11
			});

			this.map.setCenter(30.66385, 103.96483);
			this.map.addMarker({
			    lat: 30.66385,
			    lng: 103.96483
			}, {
			    title: "123"
			});

			this.map.addHomeControl(30.66385, 103.96483);
		},

		destroy: function() {
			this.element.removeClass("user-overview cloud-application");
		}
	});
	return UserApplication;
});