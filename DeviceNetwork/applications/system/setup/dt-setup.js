define(function(require) {
	var cloud = require("cloud/base/cloud");
	var html = require("text!./dt-setup.html");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var service = require("./service");
	var Button = require("cloud/components/button");
	var Table = require("cloud/components/table");
	require("cloud/lib/plugin/jquery.uploadify");
	require("cloud/lib/plugin/jquery.validationEngine");

	var DTSetup = Class.create(cloud.Component, {
		initialize: function($super, options) {
			this.moduleName = "dt-setup";
			$super(options);
			this.renderHtml();
		},

		renderHtml: function() {
			this.element.html(html);
			this.element.addClass("dt-setup");
			this.saveButton = new Button({
				imgCls: "cloud-icon-save",
				container: this.element.find(".dt-setup-info-content-buttonset"),
				text: "保存",
				events: {
					click: this.submit,
					scope: this
				}
			});
		},

		submit: function(){
//			alert("设置已保存!");
			// cloud.Ajax.request({
			// 	url: "api2/tasks",
			// 	type: "post",
			// 	parameters: {
			// 		verbose: 100
			// 	},
			// 	data: options,
			// 	success: function(result){
			// 		console.log(result);
			// 	}
			// })

		},

		destroy: function() {
			if(this.uploadify) this.uploadify.uploadify("destroy");
			if(this.table){
				if(this.table.destroy){
					this.table.destroy();
				}else{
					this.table=null;
				}
			}
			if(this.saveButton){
				if(this.saveButton.destroy){
					this.saveButton.destroy();
				}else{
					this.saveButton=null;
				}
			}
		}
	});

	return DTSetup;
});