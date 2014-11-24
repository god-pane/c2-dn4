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

	var SitesGis = Class.create(cloud.Component, {
		initialize: function($super, options) {
			var self = this;
			this.moduleName = "site-gis";
			$super(options);
			
			//初始化地图
			this.map = new maps.Map({
				selector: this.element.get(0)
			});
			
			//获取当前位置
			cloud.util.getCurrentLocation(function(position){
            	var location = new maps.LonLat(position.longitude, position.latitude)
            	self.map.setCenter(location); //将当前位置居中
            	
            	//添加“我的位置marker”
                self.myLocal = self.map.addMarker({
                	position: location,
                	title: locale.get({lang:"my_location"}),
    				draggable: false,
    				//icon: require.toUrl("cloud/resources/images/ui-gis-normal4.png")
    			});
            })
			//this.map.setCenter(this.myLocal.getPosition());
            
            //设置地图缩放级别
			this.map.setZoom(5);
			

			//初始化信息气泡框
			this.bubble = new maps.Bubble({
				content: "<div id='site-overview-info' width='100%'></div>",
				maxWidth: 500
			});
			
			//关闭气泡事件处理
			this.bubble.on("closeclick", function(){
			    
			    //当前资源id置空
				self.resourceId = null;
				
				//如果正在新建现场，则将新建现场的marker销毁
				if (self.newSite) {
					self.newSite.destroy();
					self.newSite = null;
				}else{
				    
				    //当前弹出气泡的marker设为不可拖动
					self.bubbledMarker.setDraggable(false);
				}
			});
			
			//bubble的domready事件处理
			this.bubble.on("domready", function(){
			    //考虑到info中uploader插件必须在目标dom已存在的情况下初始化，因此在此处初始化info
				self.info = new InfoModule({
					selector: $("#site-overview-info"),
					//hideMap : true,
					events: {
						"afterInfoCreated": function(id) {
							service.getTableResourcesById([id], function(data) {
								self.newSite.destroy();
								self.newSite = null;
								self.createMarker(data[0], 0);
								self.info && self.info.setLocation(self.currentMkrLoc);
								self.updateMarkersCount();
								
								self.tagOverview.loadTags(true);
							}, self);
						},
						"afterInfoUpdated": function(id) {
							/*this.bubbledMarker.destroy();
							this.bubbledMarker = null;
							this.render();*/
							//gis中info点击"自动定位"，触发“afterInfoUpdated”，去更新marker位置
							service.getTableResourcesById([id], function(data) {
								self.bubbledMarker.destroy();
								self.bubbledMarker=null;
								var updatedMarker=self.createMarker(data[0], 1);
								self.bubble.open(self.map, updatedMarker);
								self.bubbledMarker=updatedMarker;
								if(!data[0].autoNavi){
									self.bubbledMarker.setDraggable(true);
								}
								else{
									self.bubbledMarker.setDraggable(false);
								}
								self.updateMarkersCount();
								self.tagOverview.loadTags(true);
							}, self);
						},
						"cancelCreate": function(id) {
							self.newSite.destroy();
							self.newSite = null;
						},
						scope: self
					}
				});
				
				self.info.render(self.resourceId);
				
				//将marker的位置设置给info，以便提交时提交gis视图上的位置
				self.info.setLocation(self.currentMkrLoc);
				
				self.info.element.find("#info-map").addClass("gis-info-map");
//				self.info.permission();
				locale.render({element:self.info.element});
				
				//css用于处理滚动条
				//$("#site-overview-info").parent().parent().addClass("overview-info-container")
				var child=$("#info-form");
				child.width(200);
				var parent=child.parent().parent();
				var grandParent=parent.parent();
				var ggParent=grandParent.parent();
				var childWidth=child.width();
				var childHeight=child.height();
				ggParent.width(childWidth).height(childHeight).addClass("overview-info-container");
				ggParent.prev().children().last().width(childWidth+10);
				ggParent.next().css({
					'right':'-150px',
					'top':'6px'
				});
				var wholeBubble=ggParent.parent().parent();
				wholeBubble.css({
					'left':"15px",
					'top':"-30px"
				});
			});
			
			//地图上的markers集合
			this.markers = $H();
			
			//初始化筛选条件计数
			this.onlineMarkers = 0;
			this.offlineMarkers = 0;
			
			this.businessStatusInUse = 0;
			this.businessStatusBuilding = 0;
			this.businessStatusRepair = 0;
			this.businessStatusFailure = 0;
			
			this.AStatusAlarm = 0;
			this.AStatusNoAlarm = 0;
			
			//初始化工具栏和筛选栏
			this.createToolbarControl();
			this.createLegendControl();
			this.createLegendControl2();
			this.createLegendControl3();
			//this.updateMarkersCount();
			this.permission();
			locale.render({element:this.element});
			
			//初始化国际化
			this.initI18N();
			
		},
		permission:function(){
			var self = this;
			var flag=permission.app("_site")["write"];
			if(!flag){
				self.addBtn.disable();
				self.deleteBtn.disable();
			};
		},
		initI18N : function(){
			
			this.statusBoxes.values().each(function(btn){
				locale.render({element:btn.element});
			});
			this.networkBoxes.values().each(function(btn){
				locale.render({element:btn.element});
			});
			this.alarmTypeBoxes.values().each(function(btn){
				locale.render({element:btn.element});
			});
		},
		
		/**
		 * 告警状态筛选栏
		 */
		createLegendControl3 : function() {
			var $legend = $("<div>").addClass("gis-legend gis-control gis-legend-alarmStatus");
			var alarmTypeBoxes = this.alarmTypeBoxes = $H();
			var self = this;

			var $row = $("<div>").addClass("gis-legend-row gis-legend-alarm").appendTo($legend);
			alarmTypeBoxes.set("alarm", new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-alarm-checkbox",
				text: locale.get("alarm"),
				title: locale.get("alarm"),
				//lang:"{title:alarm,text:alarm}",
				disabled: false,
				events: {
					click: function() {
						self.queryByLegend();
					}
				}
			}));
			var alarmEl = $("<span>").addClass("info").text("(" + self.AStatusAlarm + ")").appendTo($row);
			
			var $row2 = $("<div>").addClass("gis-legend-row gis-legend-noalarm").appendTo($legend);
			alarmTypeBoxes.set("noalarm", new Button({
				container: $row2,
				checkbox: true,
				id: this.moduleName + "-noalarm-checkbox",
				//imgCls : "cloud-icon-leftarrow1",
				text: locale.get("no_alarm"),
				title: locale.get("no_alarm"),
				//lang:"{title:not+alarm,text:not+alarm}",
				disabled: false,
				events: {
					click: function() {
						self.queryByLegend();
					}
				}
			}));
			var noalarmEl = $("<span>").addClass("info").text("(" + self.AStatusNoAlarm + ")").appendTo($row2);
			
			this.alarmStatusEls = {
				alarmEl : alarmEl,
				noalarmEl : noalarmEl
			}
			
//			this.map.addControl($legend, "left top");//TODO
		},
		
		/**
         * 业务状态筛选栏
         */
		createLegendControl2: function() {
			var self = this;
			var $legend = $("<div>").addClass("gis-legend gis-control gis-legend-bussinessstatus");
			var statusBoxes = this.statusBoxes = $H();
			var $row = $("<div>").addClass("gis-legend-row gis-legend-inuse").appendTo($legend);
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
			var statusInuseEl = $("<span>").addClass("info").text("(" + (self.businessStatusInUse ? self.businessStatusInUse : 0) + ")").appendTo($row);

			$row = $("<div>").addClass("gis-legend-row gis-legend-building").appendTo($legend);
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
			var stautsBuildingEl = $("<span>").addClass("info").text("(" + (self.businessStatusBuilding ? self.businessStatusBuilding : 0) + ")").appendTo($row);

			$row = $("<div>").addClass("gis-legend-row gis-legend-repair").appendTo($legend);
			statusBoxes.set("repair", new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-repair-checkbox",
				text: locale.get("overhaul"),
				title: locale.get("overhaul"),
				//lang:"{title:overhaul,text:overhaul}",
				disabled: false,
				events: {
					click: function() {
						self.queryByLegend();
					}
				}
			}));
			var statusRepairEl = $("<span>").addClass("info").html("(" + (self.businessStatusRepair ? self.businessStatusRepair : 0) + ")").appendTo($row);
			
			$row = $("<div>").addClass("gis-legend-row gis-legend-breakdown").appendTo($legend);
			statusBoxes.set("breakdown", new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-breakdown-checkbox",
				text: locale.get("fault"),
				title: locale.get("fault"),
				//lang:"{title:fault,text:fault}",
				//imgBaseCls : "cloud-icon-gis",
				disabled: false,
				events: {
					click: function() {
						self.queryByLegend();
					}
				}
			}));
			var statusFailureEl = $("<span>").addClass("info").text("(" + (self.businessStatusFailure ? self.businessStatusFailure : 0) + ")").appendTo($row);
			
			this.businessStatusEls = {
				inuseEl : statusInuseEl,
				buildingEl : stautsBuildingEl,
				repairEl : statusRepairEl,
				failureEl : statusFailureEl
			}
			
			//add this control to the left top position of the map.
			this.map.addControl($legend, "left top");
		},
		
		/**
		 * 按筛选栏的筛选条件进行查询并刷新视图
		 */
		queryByLegend : function(){
			var self = this;
			
			var params = this.loadLegendParams();
			this.disableLegend();
			if (params){
				var self = this;
				service.getGisResources(0, 0, params, function(data) {
					self.deleteMarkers();
					if (self.loadLegendParams()){
						self.createMarkers(data);
						
						self.enableLegend();
					}
					
//					self.updateMarkersCount();
				});
			}else{
				//hide all
				this.markers.values().invoke("hide");
				
				self.enableLegend();
			}
			
		},
		
		/**
		 * 禁用所有筛选栏
		 */
		disableLegend : function(){
			this.networkBoxes.get("online").disable();
			this.networkBoxes.get("offline").disable();
			
			this.statusBoxes.get("inuse").disable();
			this.statusBoxes.get("building").disable();
			this.statusBoxes.get("repair").disable();
			this.statusBoxes.get("breakdown").disable();
			
			this.alarmTypeBoxes.get("alarm").disable();
			this.alarmTypeBoxes.get("noalarm").disable();
		},
		
		/**
         * 筛选栏解除禁用
         */
		enableLegend : function(){
			this.networkBoxes.get("online").enable();
			this.networkBoxes.get("offline").enable();
			
			this.statusBoxes.get("inuse").enable();
			this.statusBoxes.get("building").enable();
			this.statusBoxes.get("repair").enable();
			this.statusBoxes.get("breakdown").enable();
			
			this.alarmTypeBoxes.get("alarm").enable();
			this.alarmTypeBoxes.get("noalarm").enable();
		},
		
		/**
         * 将筛选栏的点击状态解析为请求参数
         */
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
			
			var isAlarm = this.alarmTypeBoxes.get("alarm").isSelected();
			var isNoalarm = this.alarmTypeBoxes.get("noalarm").isSelected();
			
			if (isAlarm && (!isNoalarm)){
				params.is_alarm = true;
			}else if (isNoalarm && (!isAlarm)){
				params.is_alarm = false;
			}else if ((!isAlarm) && (!isNoalarm)){
				return null;
			}
			return params;
		},
		
		/**
         * 在线状态筛选栏
         */
		createLegendControl: function() {
			var $legend = $("<div>").addClass("gis-legend gis-control gis-legend-onlinestatus");
			var networkBoxes = this.networkBoxes = $H();
			var self = this;

			var $row = $("<div>").addClass("gis-legend-row gis-legend-online").appendTo($legend);
			networkBoxes.set("online", new Button({
				container: $row,
				checkbox: true,
				id: this.moduleName + "-online-checkbox",
				text: locale.get("online"),
				title: locale.get("online"),
				//lang:"{title:online,text:online}",
				disabled: false,
				events: {
					click: function() {
						self.queryByLegend();
					}
				}
			}));
			var onlineEl = $("<span>").addClass("info").text("(" + self.onlineMarkers + ")").appendTo($row);

			var $row2 = $("<div>").addClass("gis-legend-row gis-legend-offline").appendTo($legend);
			networkBoxes.set("offline", new Button({
				container: $row2,
				checkbox: true,
				id: this.moduleName + "-offline-checkbox",
				text: locale.get("offline2"),
				title: locale.get("offline2"),
				//lang:"{title:offline2,text:offline2}",
				disabled: false,
				events: {
					click: function() {
						self.queryByLegend();
					}
				}
			}));
			var offlineEl = $("<span>").addClass("info").text("(" + self.offlineMarkers + ")").appendTo($row2);
			
			this.onlineStatusEls = {
				onlineEl : onlineEl,
				offlineEl : offlineEl
			}
			
			this.map.addControl($legend, "left top");
		},
		
		/**
         * 刷新筛选栏计数
         */
		updateMarkersCount : function(){
			var self = this;
			//this.onlineCountTip.text("(" + self.onlineMarkers + ")");
//			$(".gis-legend-online .info").text("(" + self.onlineMarkers + ")");
//			$(".gis-legend-offline .info").text("(" + self.offlineMarkers + ")");
			
			this.onlineStatusEls.onlineEl.text("(" + self.onlineMarkers + ")");
			this.onlineStatusEls.offlineEl.text("(" + self.offlineMarkers + ")");
			
//			$(".gis-legend-inuse .info").text("(" + self.businessStatusInUse + ")");
//			$(".gis-legend-building .info").text("(" + self.businessStatusBuilding + ")");
//			$(".gis-legend-repair .info").text("(" + self.businessStatusRepair + ")");
//			$(".gis-legend-breakdown .info").text("(" + self.businessStatusFailure + ")");
			
			this.businessStatusEls.inuseEl.text("(" + self.businessStatusInUse + ")");
			this.businessStatusEls.buildingEl.text("(" + self.businessStatusBuilding + ")");
			this.businessStatusEls.repairEl.text("(" + self.businessStatusRepair + ")");
			this.businessStatusEls.failureEl.text("(" + self.businessStatusFailure + ")");
			
//			$(".gis-legend-alarm .info").text("(" + self.AStatusAlarm + ")");
//			$(".gis-legend-noalarm .info").text("(" + self.AStatusNoAlarm + ")");
			
			this.alarmStatusEls.alarmEl.text("(" + self.AStatusAlarm + ")");
			this.alarmStatusEls.noalarmEl.text("(" + self.AStatusNoAlarm + ")");
		},
		
		/**
         * 初始化工具栏
         */
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
				title : locale.get("add"),
				id: this.moduleName + "-add-button",
				events: {
					click: this.addSite,
					scope: this
				}
			});
			this.addBtn=addBtn;
			var deleteBtn = new Button({
				imgCls: "cloud-icon-reduce",
				title : locale.get("delete"),
				id: this.moduleName + "-delete-button",
				events: {
					click: this.delSite,
					scope: this
				}
			});
			this.deleteBtn=deleteBtn;
			/*var moreBtn = new Button({
				imgCls: "cloud-icon-arrow3",
				id: this.moduleName + "-more-button"
			});*/

			//craete toolbar and put the buttons into it.
			this.toolbar = new Toolbar({
				container: $toolbar,
				leftItems: [tagBtn/*, senceBtn, configBtn, reportBtn*/],
				rightItems: [this.addBtn, this.deleteBtn] // remove moreBtn
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

		/**
         * 初始化标签栏
         */
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

		/**
         * 标签点击事件处理函数
         */
		onTagClick: function(tag) {
			var self = this;
//			console.log(arguments, "tagoverview onclick")
			service.getResourcesIds = tag.loadResourcesData;
			this.tagOverview.mask();
			service.getGisResources(0, 0, null, function(data) {
				self.tagOverview.unmask();
				self.deleteMarkers();
				self.createMarkers(data);
				
				//default check the online checkbox and offline checkbox.
				self.networkBoxes.values().invoke("select");
				self.statusBoxes.values().invoke("select");
				self.alarmTypeBoxes.values().invoke("select");
				
				self.updateMarkersCount();
			});
		},
		
		/**
         * 加载数据并渲染
         */
		render : function(){
			var self = this;
			service.getGisResources(0, 0, null, function(data) {
				self.deleteMarkers();
				self.createMarkers(data);
				self.updateMarkersCount();
				//default check the online checkbox and offline checkbox.
				self.networkBoxes.values().invoke("select");
				self.statusBoxes.values().invoke("select");
				self.alarmTypeBoxes.values().invoke("select");
			});
		},
		
		/**
		 * deprecated
		 */
		renderByParams : function(params, unrefreshLegend){
			var self = this;
			service.getGisResources(0, 0, params, function(data) {
				self.deleteMarkers();
				self.createMarkers(data);
				self.updateMarkersCount();
				
				if (!unrefreshLegend){
					self.networkBoxes.values().invoke("select");
					self.statusBoxes.values().invoke("select");
					self.alarmTypeBoxes.values().invoke("select");
				}
			});
		},
		
		/**
		 * 删除当前冒泡的现场
		 */
		delSite : function(){
			var self = this;
			
			if (this.resourceId) {
//				var content = [{html : "<span id = \"is-del-all-device-row\"></span>"}]
				
				dialog.render({
				  	lang:"affirm_delete+?",
//				  	content : content,
				  	buttons:[{lang:"yes",click:function(){
				  		service.deleteResources(self.resourceId, function(){
							self.render();
							self.resourceId = null;
							self.tagOverview.loadTags(true);
						},this, self.isDelAllDevBtn.isSelected());
				  		dialog.close();
				  		}},{lang:"no",click:function(){
				  			dialog.close();
				  		}}]
				});
				
				if (this.isDelAllDevBtn){
					this.isDelAllDevBtn.destroy();
				}
				this.isDelAllDevBtn = new Button({
	                container: $("#is-del-all-device-row"),
	                id : "is-del-all-device-btn",
	                checkbox : true,
	                text : locale.get("is_del_all_device"),
	                lang:"{title:is_del_all_device, text:is_del_all_device}",
	                events: {
	                    click: function(){
	                    },
	                    scope : this
	                }
	            });
			}else {
				dialog.render({lang:"please_click_the_site_you_want_to_delete+!"});
			}
			
		},
		
		/**
		 * 添加现场按钮的处理函数，向地图上新增一个marker和空的信息气泡窗
		 */
		addSite: function() {
			this.resourceId = null;
			var center = this.map.getCenter();
			if (this.bubbledMarker) {
				this.bubbledMarker.setDraggable(false);
				this.bubbledMarker.bubble = null;
			}
			if (this.newSite != null) {
				this.newSite.destroy();
				this.newSite = null;
			}
			var marker = this.map.addMarker({
				position: new maps.LonLat(116.46, 39.92),
				title: locale.get("new_site"),
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
			
			//this.info.render(null);
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

		/**
		 * 删除地图上所有marker
		 */
		deleteMarkers: function() {
		    this.resourceId = null;
		    this.bubbledMarker = null;
			this.markers.values().invoke("destroy");
		},
		
		/**
		 * 根据现场信息（业务状态和在线状态）返回marker的图标路径
		 */
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
		
		/**
		 * 根据现场信息新建一个marker
		 */
		createMarker : function(resource, type){
			var self = this;
			/*if(resource.location.latitude > 90 || resource.location.latitude < -90){
				resource.location.latitude = cloud.util.random(10, 50);
			}*/
			// var icon = new maps.Icon({
			// 	url: require.toUrl("cloud/resources/images/cloud-markers.png"),
			// 	origin: new maps.Point(0, 0)
			// });
			var location=resource.location;
			
			var iconUrl = this.iconMapping(resource);
			
			var marker = this.map.addMarker({
				position: new maps.LonLat(location.longitude, location.latitude),
				title: resource.name,
				// animation: maps.Animation.drop
				draggable: false,
				shadow: require.toUrl("cloud/resources/images/shadow.png"),
				// icon: icon
				icon : require.toUrl(iconUrl)
			});
			this.currentMkrLoc={
					"longitude": marker.getPosition().lon,
	                "latitude": marker.getPosition().lat	
			};
			marker.on("click", function(event) {
				//the content to show the current site info.
				// this.bubble.setContent(resource.name);
	//			this.info.render(resource._id);
				
				//show the bubble.
				if (self.newSite) {
					self.newSite.destroy();
					self.newSite = null;
				}
				
				if (this.bubbledMarker) {
					this.bubbledMarker.setDraggable(false);
					this.bubbledMarker.bubble = null;
				}
				
				this.currentMkrLoc = {
					"longitude": marker.getPosition().lon,
	                "latitude": marker.getPosition().lat
				};
				this.resourceId = resource._id;
				
				this.bubble.open(this.map, marker);
				
				//根据“自动定位”设置现场marker的位置
				var perFlag=permission.app("_site")["write"];
				if(!resource.autoNavi&&perFlag){
					marker.setDraggable(true);
				}else{
					marker.setDraggable(false);
				}				
				
				//clear mark of the last opened marker.
	
				//set mark of the current marker.
				this.bubbledMarker = marker;
				this.bubbledMarker.setDraggable(true);
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
	                url: "api/sites/" + resource._id,
	                type: "put",
	                data: {
	                    location:this.currentMkrLoc
	                },
	                success: function(data) {
	                },
	                error:function(err){
	                	var code=err.error_code;
	                	if(code="10005"){
							self.bubbledMarker.destroy();
							self.bubbledMarker=null;
							var updatedMarker=self.createMarker(resource,type);
							self.bubble.open(self.map, updatedMarker);
							self.bubbledMarker=updatedMarker;
							dialog.render({"text":locale.get("10005")});
	                	}
	                }
	            });
			}, this);
			
			//check the site online status, set it to different hash map.
			this.markers.set(resource._id, marker);
			
			if(type == 0) {
				if (resource.online == 1) {
					this.onlineMarkers++;
				} else {
					this.offlineMarkers++;
				}
				switch (resource.businessState){//TODO
					case 1 : this.businessStatusInUse++;break;
					case 0 : this.businessStatusBuilding++;break;
					case 3 : this.businessStatusRepair++;break;
					case 2 : this.businessStatusFailure++;break;
				}
					
				if (resource.alarmCount) {
					this.AStatusAlarm++;
				} else {
					this.AStatusNoAlarm++;
				}
			}
			return marker;
		},
		
		/**
		 * 根据现场信息数组新建一组marker
		 */
		createMarkers: function(data) {
			var self = this;
			
			this.markers = $H();
			this.onlineMarkers = 0;
			this.offlineMarkers = 0;
			
			this.businessStatusInUse = 0;
			this.businessStatusBuilding = 0;
			this.businessStatusRepair = 0;
			this.businessStatusFailure = 0;
			
			this.AStatusAlarm = 0;
			this.AStatusNoAlarm = 0;
			
			data.each(function(resource) {
				this.createMarker(resource, 0);
			}, this);
			
		},
		
		destroy: function() {
			this.map.destroy();
		}
	});

	return SitesGis;
});