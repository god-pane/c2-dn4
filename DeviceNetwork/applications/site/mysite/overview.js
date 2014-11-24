/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 */
define(function(require) {
    //引入依赖项
	require("cloud/base/cloud");
	var OverviewTemplate = require("../../template/overview");//引入模板
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var InfoModule = require("./info");
	var service = require("./service");
	var TagManager = require("../../components/tag-manager");
	var HistoryPanel = require("../../reports/historydata/history-panel");
	require("./resources/css/site-table.css");
	var MySiteOverview = Class.create(cloud.Component,{    
	    /**
         * 初始化组件
         * @param $super {Function} 父函数
         * @param options {object} 参数
         */
		initialize: function($super, options) {
			var self = this;
			this.moduleName = "mysite-overview";
			$super(options);

			this.infoModule = null;
			this.element.empty().addClass("cloud-application mysite-overview");
//			alert(this.hasOwnProperty("element"));
//			console.log(this.options);
//			console.log(this.options.selector);
//			console.log(cloud.Component.hasOwnProperty("options"));
//			console.log(this.element);
//			console.log(cloud.Component.hasOwnProperty("element"));
//			console.log(new cloud.Component());
			permission.judge(["_site","read"],function(){
				//使用模板初始化
				self.overview = new OverviewTemplate({
					selector: self.element,
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
				
				// add by qinjunwen
				self.window = null;
				self.deviceTouchMgr = null;
				//向模板中上方的工具栏中加入定制化的按钮
				self.addToolbarItems();
				//搜索框初始化
				self._renderSearch(self.toolbar);
				//只让搜索框出现在“所有现场”标签对应的table中
				$("#tag-overview-itembox").find(".cloud-item").live("click",function(){
					if($(this).attr("id") == "tag-overview-tag-1"){
						$("#toolbar-search-box").show();
					}else{
						$("#toolbar-search-box").hide();
					}
				});
				self.permission();
				//初始化国际化
				locale.render({element:self.element});	
			})
			
		},
		permission:function(){
			var self = this;
			var flag=permission.app("_site")["write"];
			if(!flag){
				self.overview.contentModule.addBtn.hide();
				self.overview.contentModule.deleteBtn.hide();
			};
		},
		addToolbarItems: function() {
			var self = this;
			
			//获取模板toolbar
			var toolbar = this.overview.getToolbar();
			var monitorBtn = new Button({
				imgCls: "cloud-icon-guard",
				title: "现场监控",
				events: {
					click: function() {
//						alert("设备监控！！！");
					},
					scope: this
				}
			});
			monitorBtn.hide();//TODO
			var maintainBtn = new Button({
				imgCls: "cloud-icon-arrow4",
				title: "现场维护",
				events: {
					click: function() {
						//alert("现场维护！！！");
						
						var self = this;
						
						var selectedResouces = this.overview.contentModule.getSelectedResources();
						
						if (selectedResouces.length == 1) {
							service.getOverviewResourcesById(selectedResouces, function(_resources) {
								/*var resources = new Hash();
								_resources.each(function (resource) {
									resources.set(resource._id, resource.name);
								});*/
								self.renderDeviceTouch(_resources);
								
							}, this);
							
						} else {
							//self.renderDeviceTouch([{_id : 111, name : "test"}]);
//							alert("Select one item , Please!");
						}
					},
					scope: this
				}
			});
			maintainBtn.hide();
			var reportBtn = new Button({
				imgCls: "cloud-icon-table",
				title: "现场报表",
				events: {
					click: function() {
//						alert("现场报表！！！");
					},
					scope: this
				}
			});
			reportBtn.hide();
			var labelBtn = new Button({
				imgCls: "cloud-icon-label",
				lang:"{title:batch_tag}",
				events: {
					click: function() {
						var selectedResouces = this.overview.contentModule.getSelectedResources();
						if (selectedResouces.length == 0) {
//							alert("At leas t select one item , Please!");
							dialog.render({
			            	  	lang:"please_select_at_least_one_config_item"
			            	  });
						} else {
							service.getTableResourcesById(selectedResouces, function(_resources) {
								var resources = new Hash();
								_resources.each(function (resource) {
									resources.set(resource._id, resource.name);
								});
								self.renderTagManager(resources.toObject());
								
							}, this);
							// this.renderTagManager();
						}
					},
					scope: this
				}
			});
			
			//history button object
			var historyBtn = new Button({
				imgCls: "cloud-icon-history",
				lang: "{title:history_data}",
				events: {
					click: function() {
						var selectedResouces = this.overview.contentModule.getSelectedResources();
						var name = this.overview.contentModule.getSelectedResByProp("name");
						if(selectedResouces.length == 1) {
							new HistoryPanel({
								deviceId: selectedResouces[0],
								deviceName: name
							});
						}

						else {
							dialog.render({
			            		lang:"please_select_at_only_one_config_item"
			            	});
						}
					},
					scope: this
				}
			});

//			toolbar.appendRightItems([labelBtn,monitorBtn, maintainBtn,reportBtn], -1);
			
			//放入toolbar中，方法及参数说明见toolbar组件
			toolbar.appendRightItems([labelBtn, historyBtn], -1);
			//为MySiteOverview初始化toolbar
			this.toolbar=toolbar;
		},
		//创建搜索框方法
		_renderSearch:function(toolbar){
			var self=this;
			var elements={
					box:"toolbar-search-box",
					hint:"toolbar-search-hint",
					input:"toolbar-search-input",
					button:"toolbar-search-button"
			};
		//画出搜索框
			var toolbarElement="#"+toolbar.id;
			var toolbarLeftElement="."+$(toolbar["leftDiv"][0]).attr("class");
			var toolbarRightElement="."+$(toolbar["rightDiv"][0]).attr("class");
			var searchBox=$("<form>").attr("id",elements.box).attr("class",elements.box);
			var $hint=$("<input>").attr("type","text").attr("id",elements.hint).attr("class",elements.hint).attr("lang","value:enter_the_site_name");
			var $input=$("<input>").attr("type","text").attr("id",elements.input).attr("class",elements.input).css("display","none");
			var $button=$("<input>").attr("type","button").attr("id",elements.button).attr("class",elements.button);
			searchBox.append($hint).append($input).append($button);
			$(toolbarElement).find(toolbarLeftElement).after(searchBox);
			var updateCount=function(returnData){
				var contentOverview=self.overview.contentModule;
				var itermbox=self.overview.contentModule.itembox;
				var display=contentOverview.display;
				var currentCount;
				if(returnData.total<=display){
					currentCount=returnData.total;
				}
				else{
					currentCount=display;
				}
				itermbox.selectedItemsCount=0;
				itermbox.size=currentCount;
				contentOverview.updateCountInfo();
			};
			var refreshPage=function(data){
				var contentOverview=self.overview.contentModule;
				contentOverview.page.reset(data);				
					service.getResourcesIds=function(start, limit, callback, context) {
			            cloud.Ajax.request({
			                url : "api/sites",
			                type : "get",
			                parameters:{
			                	name:inputValue,
			                	cursor:start,
			                	limit:limit,
			                	verbose:1
			                },
			                success : function(data) {
			                	data.result = data.result.pluck("_id");
			                    callback.call(context || this, data);
			                }
			            });
			        };
			};
			//为搜索框定义事件
				$("#"+elements.hint).click(function(){
					$(this).hide();
					$("#"+elements.input).show().focus();
				});
				var searchFunction=function(){
					self.overview.options.service.getResourcesIds=service.getResourcesIds;
					self.overview.hideInfo();
					var display = self.overview.contentModule.display;
					var pattern=/^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/i;
					inputValue=$("#" + elements.input).val().replace(/\s/g,"");				
					cloud.util.mask(self.element);
					$("#"+elements.hint).hide();
					$("#"+elements.input).show().focus();
					if(inputValue===""){
						Model.site({
							method:"query_list",
							param:{
								verbose:100,
								limit:display
							},
							success:function(returnData){
//								self.overview.contentModule.itembox.updateItems(returnData);
//								self.overview.modules.content.content.add(returnData.result);
//								returnData.result.each(function(one) {
//			                        one.notifications = one.alarmCount;
//			                        one.favor = one.isMyFavorite === 1;
//			                        one.status = statusMap.get(one.businessState);
			                        
//			                        one.description = locale.get({
//			                            lang : "device_total+:"
//			                        }) + one.deviceCount;
//			                    });
								var resourcesData=self.overview.contentModule.processData(returnData.result);
								self.overview.contentModule.itembox.clear();
								self.overview.contentModule.itembox.appendItems(resourcesData);
								updateCount(returnData);
								refreshPage(returnData);
								cloud.util.unmask();
							}
						});
						return;
					}
					else{
						inputValue=inputValue.match(pattern);
						if(inputValue===null){
							Model.site({
								method:"query_list",
								param:{
									verbose:100,
									limit:display
								},
								success:function(returnData){
//									self.overview.contentModule.itembox.updateItems(returnData);
//									self.overview.modules.content.content.add(returnData.result);
//									returnData.result.each(function(one) {
//				                        one.notifications = one.alarmCount;
//				                        one.favor = one.isMyFavorite === 1;
//				                        one.status = statusMap.get(one.businessState);
				                        
//				                        one.description = locale.get({
//				                            lang : "device_total+:"
//				                        }) + one.deviceCount;
//				                    });
									var resourcesData=self.overview.contentModule.processData(returnData.result);
									self.overview.contentModule.itembox.clear();
									self.overview.contentModule.itembox.appendItems(resourcesData);
									updateCount(returnData);
									refreshPage(returnData);
									cloud.util.unmask();
								}
							});
						}
						else{
							inputValue=inputValue.toString();
							Model.site({
								method:"query_list",
								param:{
									name:inputValue,
									verbose:100,
									limit:display
								},
								success:function(returnData){
//									returnData.result.each(function(one) {
////				                        one.notifications = one.alarmCount;
////				                        one.favor = one.isMyFavorite === 1;
////				                        one.status = statusMap.get(one.businessState);
//				                        
//				                        one.description = locale.get({
//				                            lang : "device_total+:"
//				                        }) + one.deviceCount;
//				                    });
									var resourcesData=self.overview.contentModule.processData(returnData.result);
									self.overview.contentModule.itembox.clear();
									self.overview.contentModule.itembox.appendItems(resourcesData);
//									self.overview.contentModule.itembox.updateItems(returnData);
//									self.tableTemplate.modules.content.content.clearTableData();
//									self.tableTemplate.modules.content.content.add(returnData.result);
//									console.log(resourcesData);
									cloud.util.unmask();
									updateCount(returnData);								
									refreshPage(returnData);
//									alert(returnData.total);
								}
							});
						}
					}
				};
				$("#"+elements.input).keypress(function(event){
						if(event.keyCode==13){
							searchFunction();
						}						
				});
				$("#"+elements.button).click(searchFunction);
		},
		/**
         * 加载标签管理
         * @param resources {array} 需要进行标签操作的资源数组
         */
		renderTagManager: function(resources) {
			var self = this;
			if (this.tagManager){
				this.tagManager.destroy();
			}
			this.tagManager = new TagManager({
				obj: resources
			});
			this.tagManager.on({
				"onComplete" : function(){
					self.overview && self.overview.reloadTags("clicked");
				}
			})
		},
		
		/**
         * 加载DT功能块
         * @param resources {array} 需要进行标签操作的资源数组
         */
		renderDeviceTouch : function(resources){
			var self = this;
			
			var titleEl = $("<div>").css({display : "inline-block"}).append($("<span>").text("现场维护 : (" + resources[0].name));
			if (resources[0].isMyFavorite) {
				titleEl.append($("<div>").css({display : "inline-block", "margin-left" : "5px"}).attr("class", "cloud-icon-active cloud-icon-star"));
			};
				titleEl.append($("<span>").text(")"))
			if (!this.window) {
				this.window = new _Window({
					container: "body",
					title: titleEl,
					top: "center",
					left: "center",
					height: 600,
					width: 1300,
					drag:true,
					modal: false,
					content: "<div id='overview-window-el'></div>",
					events: {
						"onClose": function() {
							this.deviceTouchMgr.destroy();
							this.deviceTouchMgr = null;
							this.window = null;
						},
						scope: this
					}
				});
				
				require(["../../dt/devicetouch"], function(DeviceTouch) {
					self.deviceTouchMgr = new DeviceTouch({
						selector: self.window.element.find("#overview-window-el"),//TODO
						resources: resources
						//modelId: resources.first().modelId
					});
				});
				this.window.show();
			}
			
		},
		
		destroy: function() {
			this.element.removeClass("mysite-overview cloud-application");
			this.overview.destroy();
			if (this.infoModule.destroy) this.infoModule.destroy();
		}
	});
	return MySiteOverview;
});