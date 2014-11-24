/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 */
define(function(require) {
	require("cloud/base/cloud");
	require("./view-switcher.css");
	var service = require("cloud/service/service");
	var Viewed = $A();
	//Create class ViewSwitcher
	var ViewSwitcher = Class.create(cloud.Component, {
		initialize: function($super, options) {
			this.moduleName = "view-switcher";
			$super(options);
			this.element.addClass("view-switcher");
			this.currentView = null;
			this.request = service.getViews(options.type, this.afterLoaded, this);
		},
		
		/*
		 * when after loaded
		 * @param {Object} data
		 */
		afterLoaded: function(data) {
			this.clear();
			this.request = null;
			var options = this.options;
			this.views = data.result;
			this.draw();
		},

		/*
		 * change type and refresh this component
		 * @param {String} type
		 */
		render: function(type) {
			if (Object.isUndefined(type)) {
				return;
			}
			this.options.type = type;
			this.refresh();
		},
		
		/*
		 * clear view
		 */
		clear: function(){
			this.element.find(".view").unbind("click mouseover mouseout");
			this.element.empty();
			this.views = null;
			this.currentView = null;
			if (this.request != null) {
				this.request.abort();
			}
		},
		
		/*
		 * refresh view
		 */
		refresh: function() {
			service.getViews(this.options.type, this.afterLoaded, this);
		},
		
		/*
		 * Draw view
		 */
		draw: function() {
			var self = this;
			this.views.each(function(view) {
				var $view = $("<div>").addClass("view").appendTo(this.element).on("mouseover mouseout", function(){
					$(this).toggleClass("view-hover");
				}).click(function() {
					cloud.util.setCurrentApp({view:".view-active"});
					$(this).addClass("view-active");
					$(this).siblings().removeClass("view-active");
					self.fire("active", view);
					Viewed[view.subclass]=view;
				});
				
				if(Viewed[view.subclass]&&Viewed[view.subclass].name == view.name){
					$view.addClass("view-active");
					$view.siblings().removeClass("view-active");
					self.fire("active", view);
				}
				if(!Viewed[view.subclass]&&view["default"] == 1){
					self["default"] = view;
					$view.addClass("view-active");
					$view.siblings().removeClass("view-active");
					self.fire("active", view);
				}
				

				var icon = null;
				var name = view.name;
				if(name.endsWith("List")){
					icon = "table";
				}else if(name.endsWith("Overview")){
					icon = "overview";
				}else if(name.endsWith("Gis")){
					icon = "gis";
				}else if(name.endsWith("Scada")){
					icon = "scada";
				}
				
				var tempName = locale.get(view.name);
				var nameStr = tempName? tempName : view.name;//if locale.get returns undefined, set nameStr to view.name

				$view.append("<img>").find("img").attr("src", require.toUrl("../resources/images/view-" + icon +  ".png"))
					.attr("title", nameStr);

			}, this);
		}
	});

	return ViewSwitcher;
});