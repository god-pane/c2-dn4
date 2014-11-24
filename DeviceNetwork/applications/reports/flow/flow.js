define(function(require){
	var LogSystemTable = require("./flowIndex");

	var LogApplication = Class.create(cloud.Component, {
		initialize: function($super, options) {
			this.moduleName = "log";
			$super(options);
			this.element.empty().addClass("");
			this.logSystemTable = new LogSystemTable({
				container: this.element
			});
		},

		destroy: function() {
			this.logSystemTable.destroy();
			this.element.empty();
		}
	});

	return LogApplication;
});