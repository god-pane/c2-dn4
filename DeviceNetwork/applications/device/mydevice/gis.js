define(function(require) {
	var maps = require("cloud/components/map");
	var Toolbar = require("cloud/components/toolbar");
	var Button = require("cloud/components/button");
	var TagOverview = require("../../components/tag-overview");
	var service = require("./service");
	var InfoModule = require("./info");
	require("./gis.css");
	require("cloud/lib/plugin/jquery.qtip");
	var locale = require("cloud/base/locale");
	
	
	var DeviceGis = Class.create(cloud.Component, {
		initialize: function($super, options) {
			var self = this;
			this.moduleName = "device-gis";
			$super(options);
			this._deviceId = null;
			this._marker = null;
			this.map = new maps.Map({
				selector: this.element.get(0)
			});
			cloud.util.getCurrentLocation(function(position){
            	var location = new maps.LonLat(position.longitude, position.latitude)
            	self.map.setCenter(location);
                self.myLocal = self.map.addMarker({
                	position: location,
                	title: locale.get({lang:"my_location"}),
    				draggable: false
    				//icon: require.toUrl("cloud/resources/images/ui-gis-normal4.png")
    			});
            })
			//this.map.setCenter(this.myLocal.getPosition());
			this.map.setZoom(5);

			//create bubble to show site info.
			this.bubble = new maps.Bubble({
				content: "<div id='device-overview-info'></div>",
				maxWidth: 500
			});
			this.bubble.on("closeclick", function(){
				self._deviceId = null;
				self.bubbledMarker.setDraggable(false);
				if (self.newDevice){
					self.newDevice.destroy();
					this.newDevice = null;
				}
			});
			this.bubble.on("domready", function(){
				self.info = new InfoModule({
					selector: $("#device-overview-info"),
					events: {
						"afterInfoCreated": function(id) {
							// this.contentModule.appendResource(id);
							service.getTableResourcesById([id], function(data) {
								// self.deleteMarkers();
								this.newDevice.destroy();
								this.newDevice = null;
								this.createMarker(data[0]);
								this.updateMarkersCount();
								self.tagOverview.loadTags(true);
								//this.refreshOnline();
								//default check the online checkbox and offline checkbox.
								// self.networkBoxes.values().invoke("select");
							}, this);
							// this.createMarkers();
						},
						"afterInfoUpdated": function(id) {
							
							service.getTableResourcesById([id], function(data) {
								// self.deleteMarkers();
								/*this.bubbledMarker.destroy();
								this.bubbledMarker = null;
								this.render();*/
								//this.refreshOnline();
								//default check the online checkbox and offline checkbox.
								// self.networkBoxes.values().invoke("select");
							}, this);
							
							// this.contentModule.updateResource(id);
						},
						"cancelCreate": function(id) {
							self.newDevice.destroy();
							self.newDevice = null;
						},
						scope: self
					}
				});
				self.info.render(self._deviceId);
				self.info.setLocation(self.currentMkrLoc);
				self.info.element.find("#info-map").addClass("gis-info-map");
				
				locale.render({element:self.info.element});
				
				$("#device-overview-info").parent().parent().addClass("overview-info-container")
			});

			//initialize online and offline markers hash map.
			this.markers = $H();
			this.onlineMarkers = 0;
			this.offlineMarkers = 0;
			
			this.businessStatusInUse = 0;
			this.businessStatusBuilding = 0;
			this.businessStatusRepair = 0;
			this.businessStatusFailure = 0;

			//render page info.
			this.createToolbarControl();
			this.createLegendControl();
			this.createLegendControl2();
			//this.refreshOnline();
			//this.updateMarkersCount();
			
			locale.render({element:this.element});
			this.initI18N();
		},
		refreshOnline:function(){
			service.getDeviceSum(function(offline,online){
				$(".gis-offline").text("("+offline+")");
				$(".gis-online").text("("+online+")");
			});
		},
		updateMarkersCount : function(){
			var self = this;
//			$(".mydevice-gis-legend-online .info").text("(" + self.onlineMarkers + ")");
//			$(".mydevice-gis-legend-offline .info").text("(" + self.offlineMarkers + ")");
//			
//			$(".mydevice-gis-legend-inuse .info").text("(" + self.businessStatusInUse + ")");
//			$(".mydevice-gis-legend-building .info").text("(" + self.businessStatusBuilding + ")");
//			$(".mydevice-gis-legend-repair .info").text("(" + self.businessStatusRepair + ")");
//			$(".mydevice-gis-legend-breakdown .info").text("(" + self.businessStatusFailure + ")");
			
			this.onlineStatusEls.onlineEl.text("(" + self.onlineMarkers + ")");
			this.onlineStatusEls.offlineEl.text("(" + self.offlineMarkers + ")");
			
			this.businessStatusEls.inuseEl.text("(" + self.businessStatusInUse + ")");
			this.businessStatusEls.buildingEl.text("(" + self.businessStatusBuilding + ")");
			this.businessStatusEls.repairEl.text("(" + self.businessStatusRepair + ")");
			this.businessStatusEls.failureEl.text("(" + self.businessStatusFailure + ")");
		},
		
		initI18N : function(){
			
			this.statusBoxes.values().each(function(btn){
				locale.render({element:btn.element});
			});
			this.networkBoxes.values().each(function(btn){
				locale.render({element:btn.element});
			});
		},
		
		//create legend control to show site status.
		createLegendControl2: function() {
			var self = this;
			var $legend = $("<div>").addClass("mydevice-gis-legend mydevice-gis-control");
			var statusBoxes = this.statusBoxes = $H();
			var $row = $("<div>").addClass("mydevice-gis-legend-row mydevice-gis-legend-inuse").appendTo($legend);
			statusBoxes.set("inuse", new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-inuse-checkbox",
				text: locale.get("operation"),
				title: locale.get("operation"),
				//lang:"{title:operation,text:operation}",
				disabled: false,
				events: {
					click: function() {
						self.queryByLegend();
					}
				}
			}));
			var inuseEl = $("<span>").addClass("info").text("(" + self.businessStatusInUse ? self.businessStatusInUse : 0 + ")").appendTo($row);

			$row = $("<div>").addClass("mydevice-gis-legend-row mydevice-gis-legend-building").appendTo($legend);
			statusBoxes.set("building", new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-building-checkbox",
				text: locale.get("construction"),
				title: locale.get("construction"),
				//lang:"{title:construction,text:construction}",
				disabled: false,
				events: {
					click: function() {
						self.queryByLegend();
					}
				}
			}));
			var buildingEl = $("<span>").addClass("info").text("(" + self.businessStatusBuilding ? self.businessStatusBuilding : 0 + ")").appendTo($row);

			$row = $("<div>").addClass("mydevice-gis-legend-row mydevice-gis-legend-repair").appendTo($legend);
			statusBoxes.set("repair", new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-repair-checkbox",
				text: locale.get("overhaul"),
				title: locale.get("overhaul"),
				//lang:"{title:overhaul,text:overhaul}",
				lang:"{text:overhaul}",
				disabled: false,
				events: {
					click: function() {
						self.queryByLegend();
					}
				}
			}));
			var repairEl = $("<span>").addClass("info").text("(" + self.businessStatusRepair ? self.businessStatusRepair : 0 + ")").appendTo($row);
			
			$row = $("<div>").addClass("mydevice-gis-legend-row mydevice-gis-legend-breakdown").appendTo($legend);
			statusBoxes.set("breakdown", new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-breakdown-checkbox",
				text: locale.get("fault"),
				title: locale.get("fault"),
				//lang:"{title:fault,text:fault}",
				disabled: false,
				events: {
					click: function() {
						self.queryByLegend();
					}
				}
			}));
			var failureEl = $("<span>").addClass("info").text("(" + self.businessStatusFailure ? self.businessStatusFailure : 0 + ")").appendTo($row);

			this.businessStatusEls = {
				inuseEl : inuseEl,
				buildingEl : buildingEl,
				repairEl : repairEl,
				failureEl : failureEl
			}
			
			//add this control to the left top position of the map.
			this.map.addControl($legend, "left top");
		},

		//create legend to show online and offline status.
		createLegendControl: function() {
			var $legend = $("<div>").addClass("mydevice-gis-legend mydevice-gis-control mydevice-gis-online-state-legend");
			var networkBoxes = this.networkBoxes = $H();
			var self = this;
			
			networkBoxes.set("main", $legend)
			
			var $row = $("<div>").addClass("mydevice-gis-legend-row mydevice-gis-legend-online").appendTo($legend);
			networkBoxes.set("online", new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-online-checkbox",
				text: locale.get("online"),
				title: locale.get("online"),
				//lang:"{text:online}",
				disabled: false,
				events: {
					click: function() {
						/*var selected = this.isSelected();
						self.onlineMarkers.values().invoke(selected ? "show" : "hide");*/
						self.queryByLegend();
					}
				}
			}));
			
			var onlineEl = $("<span>").addClass("info").text("(" + self.onlineMarkers ? self.onlineMarkers : 0 + ")").appendTo($row);


			var $row2 = $("<div>").addClass("mydevice-gis-legend-row mydevice-gis-legend-offline").appendTo($legend);
			networkBoxes.set("offline", new Button({
				container: $row2,
				checkbox: true,
				id: this.moduleName + "-offline-checkbox",
				text: locale.get("offline2"),
				title: locale.get("offline2"),
				//lang:"{text:offline2}",
				disabled: false,
				events: {
					click: function() {
						/*var selected = this.isSelected();
						self.offlineMarkers.values().invoke(selected ? "show" : "hide");*/
						self.queryByLegend();
					}
				}
			}));
			var offlineEl = $("<span>").addClass("info").text("(" + self.offlineMarkers ? self.offlineMarkers : 0 + ")").appendTo($row2);
			
			this.onlineStatusEls = {
					onlineEl : onlineEl,
					offlineEl : offlineEl
			}
			
			this.map.addControl($legend, "left top");
		},

		//create toolbar to show tag overview, and create button, etc..
		createToolbarControl: function() {
			//toolbar container.
			var $toolbar = $("<div>").addClass("mydevice-gis-toolbar mydevice-gis-control");

			//create any buttons.
			var tagBtn = new Button({
				imgCls: "cloud-icon-label",
				lang:"{title:tag}",
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
				//lang:"{title:add}",
				title : locale.get("add"),
				events: {
					click: this.addDevice,
					scope: this
				}
			});
			var self = this;
			var deleteBtn = new Button({
				imgCls: "cloud-icon-reduce",
				//lang:"{title: delete}",
				title : locale.get("delete"),
				id: this.moduleName + "-delete-button",
				events:{
					click:function(){
						var did = self._deviceId;
						if(did != null){
//							self._marker.destroy();
							
							var content = ""
							
							dialog.render({
							  	lang:"affirm_delete+?",
							  	content : content,
							  	buttons:[{lang:"yes",click:function(){
							  		
							  		service.deleteDevice(did,function(data){
										self.render();
										self._deviceId = null;
										self.tagOverview.loadTags(true);
									});
							  		
							  		dialog.close();
							  		}},{lang:"no",click:function(){
							  			dialog.close();
							  		}}]
							});
						}else{
							//alert("请点击需要删除的设备！");
							dialog.render({lang:"please_click_the_device_you_want_to_delete+!"});
						}
					}
				}
			});

			/*var moreBtn = new Button({
				imgCls: "cloud-icon-arrow3",
				id: this.moduleName + "-more-button"
			});*/

			//craete toolbar and put the buttons into it.
			this.toolbar = new Toolbar({
				container: $toolbar,
//				leftItems: [tagBtn, senceBtn, configBtn, reportBtn],
				leftItems: [tagBtn],
				rightItems: [addBtn, deleteBtn] // remove moreBtn
			});
			
			$A([addBtn, deleteBtn]).each(function(btn){
				locale.render({element:btn.element});
			});

			//add the toolbar control to the left top side of the map.
			this.map.addControl($toolbar, "left top");

			var self = this;

			//set the tag overview module default position. hide it in the visiable window.
			this.$tag = $("<div id='mydevice-gis-tag-overview'>").css({
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
					classes: "qtip-shadow cloud-qtip qtip-rounded",
					def: false
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
		queryByLegend : function(){
			var self = this;
			
			var params = this.loadLegendParams();
			this.disableLegend();
			if (params){
				var self = this;
				service.getGisResources(0, 0, params, function(data) {
					self.deleteMarkers();
					self.createMarkers(data);
					
					self.enableLegend();
//					self.updateMarkersCount();
				});
			}else{
				//hide all
				this.markers.values().invoke("hide");
				self.enableLegend();
			}
			
		},
		
		disableLegend : function(){
			this.networkBoxes.get("online").disable();
			this.networkBoxes.get("offline").disable();
			
			this.statusBoxes.get("inuse").disable();
			this.statusBoxes.get("building").disable();
			this.statusBoxes.get("repair").disable();
			this.statusBoxes.get("breakdown").disable();
		},
		
		enableLegend : function(){
			this.networkBoxes.get("online").enable();
			this.networkBoxes.get("offline").enable();
			
			this.statusBoxes.get("inuse").enable();
			this.statusBoxes.get("building").enable();
			this.statusBoxes.get("repair").enable();
			this.statusBoxes.get("breakdown").enable();
		},
		
		loadLegendParams : function(){
			var self = this;
			var params = {};
			
			var isOnline = this.networkBoxes.get("online").isSelected();
			var isOffline = this.networkBoxes.get("offline").isSelected();
			
			if (isOnline && (!isOffline)){
				params.online = 1;
			}else if (isOffline && (!isOnline)){
				params.online = 0;
			}else if ((!isOffline) && (!isOnline)){
				return null;
			}
			
			var isInuse = this.statusBoxes.get("inuse").isSelected();//1
			var isBuilding = this.statusBoxes.get("building").isSelected();//0
			var isRepair = this.statusBoxes.get("repair").isSelected();//3
			var isBreakdown = this.statusBoxes.get("breakdown").isSelected();//2
			
			if (isInuse){
				if (params.business_state){
					params.business_state += ",1";
				}else {
					params.business_state = "1";
				}
			}
			if (isBuilding){
				if (params.business_state){
					params.business_state += ",0";
				}else {
					params.business_state = "0";
				}
			}
			if (isRepair){
				if (params.business_state){
					params.business_state += ",3";
				}else {
					params.business_state = "3";
				}
			}
			if (isBreakdown){
				if (params.business_state){
					params.business_state += ",2";
				}else {
					params.business_state = "2";
				}
			}
			if (!(isInuse || isRepair || isBreakdown || isBuilding)){
				return null;
			}
			
			return params;
		},
		
		//handler after tag is clicked.
		onTagClick: function(tag) {
			var self = this;
			service.getResourcesIds = tag.loadResourcesData;
//			if (tag.selectable == false && this.networkBoxes){
//				/*var onlineBtn = this.networkBoxes.get("online");
//				var offlineBtn = this.networkBoxes.get("offline");
//				if (tag.description == "online"){
//					onlineBtn.setSelect(true); 
//					offlineBtn.setSelect(false); 
//				}else if (tag.description == "offline"){
//					onlineBtn.setSelect(false); 
//					offlineBtn.setSelect(true); 
//				}else if (tag.description == "all"){
//					onlineBtn.setSelect(true); 
//					offlineBtn.setSelect(true); 
//				}*/
//				var onlineLegend = this.networkBoxes.get("main");
//				if (tag.description == "online" || tag.description == "offline"){
//					onlineLegend.hide();
//				}else{
//					onlineLegend.show();
//				}
//			}
			this.tagOverview.mask();
			service.getGisResources(0, 0, null, function(data) {
				self.tagOverview.unmask();
				self.deleteMarkers();
				self.createMarkers(data);
				//default check the online checkbox and offline checkbox.
				self.networkBoxes.values().invoke("select");
				self.statusBoxes.values().invoke("select");
				
				self.updateMarkersCount();
			});
		},
		
		render : function(){
			var self = this;
			service.getGisResources(0, 0, null, function(data) {
				self.deleteMarkers();
				self.createMarkers(data);
				self.updateMarkersCount();
				
				self.networkBoxes.values().invoke("select");
				self.statusBoxes.values().invoke("select");
			});
		},
		
		afterDeviceUpdated : function(data, marker){
			
		},
		
		addDevice: function() {
			this._deviceId = null;
			var center = this.map.getCenter();
			var self = this;
			if (this.bubbledMarker) {
				this.bubbledMarker.setDraggable(false);
				this.bubbledMarker.bubble = null;
			}
			if (this.newDevice != null) {
				this.newDevice.destroy();
				this.newDevice = null;
			}
			
			var marker = this.map.addMarker({
				position: new maps.LonLat(116.46, 39.92),//TODO
				title: locale.get("new_device"),
				// animation: maps.Animation.drop
				draggable: true
				// icon: require.toUrl("cloud/resources/images/map-marker.png")

			});
			marker.on("dragend", function(event) {
				this.currentMkrLoc = { 
                    "longitude": event.lonLat.lon,
                    "latitude": event.lonLat.lat
                }
				this.info && this.info.setLocation(this.currentMkrLoc);
			}, this);
			this.currentMkrLoc = {
					"longitude": marker.getPosition().lon,
                    "latitude": marker.getPosition().lat
			};
			/*this.bubble.on("closeclick", function() {
				if (self.newDevice == null) {
					return;
				}
				self.newDevice.destroy();
				self.newDevice = null;
			});*/
			//show the bubble.
			this.bubble.open(this.map, marker);
			
			this.newDevice = marker;
			//clear mark of the last opened marker.
			if (this.bubbledMarker) {
				this.bubbledMarker.bubble = null;
			}

			//set mark of the current marker.
			this.bubbledMarker = marker;
			marker.bubble = this.bubble;
		},

		//delete all markers on the map.
		deleteMarkers: function() {
		    this._deviceId = null;
		    this._marker = null;
		    this.bubbledMarker = null;
			this.markers.values().invoke("destroy");
			this.markers.keys().each(this.markers.unset, this.markers);
		},
		
		iconMapping : function(resource){
			var preStr = "cloud/resources/images/";
			
			var iconUrl = preStr + "ui-gis-";
			
			switch (resource.businessState){
				case 1 : iconUrl += "normal";break;
				case 0 : iconUrl += "setting";break;
				case 3 : iconUrl += "fix";break;
				case 2 : iconUrl += "gaojing";break;
			}
			if (resource.online == 1) {
				if (resource.alarmCount){
					iconUrl += "1"
				}else {
					iconUrl += "2"
				}
			} else {
				if (resource.alarmCount){
					iconUrl += "3"
				}else {
					iconUrl += "4"
				}
			}
			return iconUrl + ".png";
		},

		//create marker by the given site resource object.
		createMarker : function(resource){
			var iconUrl = this.iconMapping(resource);
			var marker = this.map.addMarker({
//				position: new maps.LonLat(cloud.util.random(10, 50), cloud.util.random(10, 50)),
				position: new maps.LonLat(resource.location.longitude, resource.location.latitude),
				title: resource.name,
				// animation: maps.Animation.drop
				draggable: false,
				shadow: require.toUrl("cloud/resources/images/shadow.png"),
				//icon: cloud.util.random(0,10) > 5 ? require.toUrl("cloud/resources/images/green3.png") : require.toUrl("cloud/resources/images/green2.png")
				icon : require.toUrl(iconUrl)
			});

			marker.on("click", function() {
				//the content to show the current site info.
				// this.bubble.setContent(resource.name);
				//this.info.render(resource._id);
				//show the bubble.
				
				if (this.newDevice){
					this.newDevice.destroy();
					this.newDevice = null;
				}
				
				if (this.bubbledMarker) {
					this.bubbledMarker.setDraggable(false);
					this.bubbledMarker.bubble = null;
				}
				
				this.currentMkrLoc = {
						"longitude": marker.getPosition().lon,
                        "latitude": marker.getPosition().lat
				};
				
				this._deviceId = resource._id;
				this._marker = marker;
				this.bubble.open(this.map, marker);
				
				marker.setDraggable(true);
				//clear mark of the last opened marker.

				//set mark of the current marker.
				this.bubbledMarker = marker;
				marker.bubble = this.bubble;
			}, this);
			
			marker.on("dragend", function(event) {
				this.currentMkrLoc = { 
                    "longitude": event.lonLat.lon,
                    "latitude": event.lonLat.lat
                }
				this.info && this.info.setLocation(this.currentMkrLoc);
				//TODO
				cloud.Ajax.request({
                    url: "api/devices/" + resource._id,
                    type: "put",
                    data: {
	                    location:this.currentMkrLoc
                    },
                    success: function(data) {
                    }
                });
			}, this);
			
			//check the site online status, set it to different hash map.
			//check the site online status, set it to different hash map.
			this.markers.set(resource._id, marker);
			
			if (resource.online == 1) {
				this.onlineMarkers++;
			} else {
				this.offlineMarkers++;
			}
			
			switch (resource.businessState){
				case 1 : this.businessStatusInUse++;break;
				case 0 : this.businessStatusBuilding++;break;
				case 3 : this.businessStatusRepair++;break;
				case 2 : this.businessStatusFailure++;break;
			}

			
		},
		createMarkers: function(data) {
			var self = this;
			this.markers = $H();
			this.onlineMarkers = 0;
			this.offlineMarkers = 0;
			
			this.businessStatusInUse = 0;
			this.businessStatusBuilding = 0;
			this.businessStatusRepair = 0;
			this.businessStatusFailure = 0;
			data.each(function(resource) {
				this.createMarker(resource);
			}, this);
		},

		destroy: function() {
			this.map.destroy();
		}
	});

	return DeviceGis;
});