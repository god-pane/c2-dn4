define(function(require) {
	var maps = require("cloud/components/map");
	var Toolbar = require("cloud/components/toolbar");
	var Button = require("cloud/components/button");
	var TagOverview = require("../../components/tag-overview");
	var service = require("./service");
	var InfoModule = require("./info");
	require("./gis.css");
	require("cloud/lib/plugin/jquery.qtip");

	var CustomerGis = Class.create(cloud.Component, {
		initialize: function($super, options) {
			var self = this;
			this.moduleName = "site-gis";
			$super(options);
			this.map = new maps.Map({
				selector: this.element.get(0)
			});

			this.info = new InfoModule({
				selector: $("<div id='overview-info'>"),
				events: {
					"afterInfoCreated": function(id) {
						service.getTableResources([id], function(data) {
							this.createMarkers(data);
							this.newSite.destroy();
							this.newSite = null;
						}, this);
					},
					"afterInfoUpdated": function(id) {
						
					},
					"cancelCreate": function () {
	                    this.bubble.close();
	                },
					scope: this
				}
			});

			//create bubble to show site info.
			this.bubble = new maps.Bubble({
				content: this.info.element,
				maxWidth: 500
			});

			//show the longtitude and latitude of the cursor position on the map.
			// this.map.addPositionControl();

			//initialize online and offline markers hash map.
			this.onlineMarkers = $H();
			this.offlineMarkers = $H();

			//render page info.
			this.createToolbarControl();
			this.createLegendControl();
			this.createLegendControl2();
		},

		//create legend control to show site status.
		createLegendControl2: function() {
			var $legend = $("<div>").addClass("gis-legend gis-control");
			var statusBoxes = this.statusBoxes = {};
			var $row = $("<div>").addClass("gis-legend-row gis-legend-warn").appendTo($legend);
			statusBoxes.warn = new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-warn-checkbox",
				text: "警告",
				disabled: false
			});
			$("<span>").addClass("info").text("(0)").appendTo($row);


			$row = $("<div>").addClass("gis-legend-row gis-legend-breakdown").appendTo($legend);
			statusBoxes.breakdown = new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-breakdown-checkbox",
				text: "故障",
				disabled: false
			});
			$("<span>").addClass("info").text("(0)").appendTo($row);

			$row = $("<div>").addClass("gis-legend-row gis-legend-repair").appendTo($legend);
			statusBoxes.repair = new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-repair-checkbox",
				text: "维修中",
				disabled: false
			});
			$("<span>").addClass("info").text("(0)").appendTo($row);

			$row = $("<div>").addClass("gis-legend-row gis-legend-normal").appendTo($legend);
			statusBoxes.narmal = new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-normal-checkbox",
				text: "正常",
				disabled: false
			});
			$("<span>").addClass("info").text("(0)").appendTo($row);

			//add this control to the left top position of the map.
			this.map.addControl($legend, "left top");
		},

		//create legend to show online and offline status.
		createLegendControl: function() {
			var $legend = $("<div>").addClass("gis-legend gis-control");
			var networkBoxes = this.networkBoxes = $H();
			var self = this;

			var $row = $("<div>").addClass("gis-legend-row gis-legend-online").appendTo($legend);
			networkBoxes.set("online", new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-online-checkbox",
				text: "在线",
				disabled: false,
				events: {
					click: function() {
						var selected = this.isSelected();
						self.onlineMarkers.values().invoke(selected ? "show" : "hide");
					}
				}
			}));
			$("<span>").addClass("info").text("(0)").appendTo($row);


			var $row2 = $("<div>").addClass("gis-legend-row gis-legend-offline").appendTo($legend);
			networkBoxes.set("offline", new Button({
				container: $row2,
				checkbox: true,
				id: this.moduleName + "-offline-checkbox",
				text: "离线",
				disabled: false,
				events: {
					click: function() {
						var selected = this.isSelected();
						self.offlineMarkers.values().invoke(selected ? "show" : "hide");
					}
				}
			}));
			$("<span>").addClass("info").text("(0)").appendTo($row2);

			this.map.addControl($legend, "left top");
		},

		//create toolbar to show tag overview, and create button, etc..
		createToolbarControl: function() {
			//toolbar container.
			var $toolbar = $("<div>").addClass("gis-toolbar gis-control");

			//create any buttons.
			var tagBtn = new Button({
				imgCls: "cloud-icon-label",
				id: this.moduleName + "-tag-button"
			});

			var senceBtn = new Button({
				imgCls: "cloud-icon-guard",
				id: this.moduleName + "-sence-button"
			});

			var configBtn = new Button({
				imgCls: "cloud-icon-arrow4",
				id: this.moduleName + "-config-button"
			});

			var reportBtn = new Button({
				imgCls: "cloud-icon-table",
				id: this.moduleName + "-report-button"
			});


			var addBtn = new Button({
				imgCls: "cloud-icon-add",
				id: this.moduleName + "-add-button",
				events: {
					click: this.addSite,
					scope: this
				}
			});
			var deleteBtn = new Button({
				imgCls: "cloud-icon-reduce",
				id: this.moduleName + "-delete-button"
			});

			var moreBtn = new Button({
				imgCls: "cloud-icon-arrow3",
				id: this.moduleName + "-more-button"
			});

			//craete toolbar and put the buttons into it.
			this.toolbar = new Toolbar({
				container: $toolbar,
				leftItems: [tagBtn, senceBtn, configBtn, reportBtn],
				rightItems: [addBtn, deleteBtn, moreBtn]
			});

			//add the toolbar control to the left top side of the map.
			this.map.addControl($toolbar, "left top");

			var self = this;

			//set the tag overview module default position. hide it in the visiable window.
			this.$tag = $("<div id='gis-tag-overview'>").css({
				marginLeft: -1000
			}).appendTo(this.element);
			//initialze the tag overview component.
			this.createTagOverview();

			//bind a qtip window on the tag bubbon, to show tag overview component.
			tagBtn.element.qtip({
				content: {
					text: this.$tag
				},
				position: {
					my: "top left",
					at: "bottom middle"
				},
				show: {
					event: "click"
				},
				events: {
					render: function() {
						//before render, set the tag overview component's position to the visiable window.
						self.$tag.css({
							marginLeft: 0
						});
					}
				},
				hide: {
					event: "click"
				},
				style: {
					classes: "qtip-shadow qtip-light qtip-rounded"
				}
			});
		},

		//create tag overview module to show all site tags.
		createTagOverview: function() {
			this.tagOverview = new TagOverview({
				events: {
					click: this.onTagClick,
					scope: this
				},
				service: service,
				selector: this.$tag
			});
		},

		//handler after tag is clicked.
		onTagClick: function(tag) {
			var self = this;
			service.getResourcesIds = tag.loadResourcesData;
			service.getTableResources(0, 0, function(data) {
				self.deleteMarkers();
				self.createMarkers(data);
				//default check the online checkbox and offline checkbox.
				self.networkBoxes.values().invoke("select");
			});
		},

		addSite: function() {
			var center = this.map.getCenter();
			if (this.newSite != null) {
				this.newSite.destroy();
				this.newSite = null;
			}
			var marker = this.map.addMarker({
				position: center,
				title: "new Site",
				// animation: maps.Animation.drop
				draggable: true
				// icon: require.toUrl("cloud/resources/images/map-marker.png")

			});

			this.info.render(null);
			var self = this;
			this.bubble.on("closeclick", function() {
				if (self.newSite == null) {
					return;
				}
				self.newSite.destroy();
				self.newSite = null;
			});

			this.bubble.open(this.map, marker);

			this.newSite = marker;
		},

		//delete all markers on the map.
		deleteMarkers: function() {
			this.onlineMarkers.values().invoke("destroy");
			this.onlineMarkers.keys().each(this.onlineMarkers.unset, this.onlineMarkers);
			this.offlineMarkers.values().invoke("destroy");
			this.offlineMarkers.keys().each(this.offlineMarkers.unset, this.offlineMarkers);
		},

		//create marker by the given site resource object.
		createMarkers: function(data) {

			data.each(function(resource) {
				/*if(resource.location.latitude > 90 || resource.location.latitude < -90){
					resource.location.latitude = cloud.util.random(10, 50);
				}*/
				// var icon = new maps.Icon({
				// 	url: require.toUrl("cloud/resources/images/cloud-markers.png"),
				// 	origin: new maps.Point(0, 0)
				// });
				var location=resource.location;
				var marker = this.map.addMarker({
					position: new maps.LonLat(location.intitude, location.latitude),
					title: resource.name,
					// animation: maps.Animation.drop
					draggable: true,
					// shadow: require.toUrl("cloud/resources/images/shadow.png"),
					// icon: icon
					icon: require.toUrl("cloud/resources/images/ui-gis-normal4.png")
				});

				marker.on("click", function(event) {
					//the content to show the current site info.
					// this.bubble.setContent(resource.name);
					this.info.render(resource._id);
					//show the bubble.
					this.bubble.open(this.map, marker);

					//clear mark of the last opened marker.
					if (this.bubbledMarker) {
						this.bubbledMarker.bubble = null;
					}

					//set mark of the current marker.
					this.bubbledMarker = marker;
					marker.bubble = this.bubble;
				}, this);

				//check the site online status, set it to different hash map.
				if (resource.online == 1) {
					this.onlineMarkers.set(resource._id, marker);
				} else {
					this.offlineMarkers.set(resource._id, marker);
				}

			}, this);
		},

		destroy: function() {
			this.map.destroy();
		}
	});

	return CustomerGis;
});