define(function(require) {
	require("cloud/base/cloud");
	var OverviewTemplate = require("../../template/overview");
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var InfoModule = require("./info");
	var service = require("./service");
	var TagManager = require("../../components/tag-manager");
	var BatchImport = require("./batch-import");
	var MISIImport=require("./misi-import");
	require("../resources/css/toolbar-search.css");

	var MyDeviceOverview = Class.create(cloud.Component, {
		initialize: function($super, options) {
			var self = this;
			this.moduleName = "mydevice-overview";
			$super(options);
			var getawayConfig = permission.app("_gateway");
			if(!getawayConfig.read) {
				return ;
			}

			this.infoModule = null;
			this.element.empty().addClass("cloud-application mydevice-overview");
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
				},
				events : {
				    "afterSelect" : function(resources){
				        var isAllGateway = this.verifyGateway(resources);
				        var isSameModel = this.verifySameModel(resources);				        
//				        if (isAllGateway && isSameModel){
//				            this.configBtn.show();
//				        }else{
//				            this.configBtn.hide();
//				        }
				        if(resources.length==0){
				        	if (isAllGateway && isSameModel&&self.getawayConfig.management){
			    				self.configBtn.show();
					        }else{
					        	self.configBtn.hide();
					        }
				        }
				        else{
					        cloud.Ajax.request({
					    		url:"api/models/"+resources.first().modelId,
					    		type:"GET",
					    		parameters:{
					    			verbose:100
					    		},
					    		success:function(data){
					    			if (isAllGateway && isSameModel&&data.result.system&&self.getawayConfig.management){
					    				self.configBtn.show();
							        }else{
							        	self.configBtn.hide();
							        }
					    		}
					    	});
				        }
				    },
				    scope : this
				}
			});

			this.addToolbarItems();
			this.gatewayMgr = null;
			this.window = null;
//			$(".cloud-item-body").live("click",function(){
//				self.hideConfigIcon();
//			});
//			$("#content-overview-select-all").live("click",function(){
//				self.hideConfigIcon();
//			});
			cloud.locale = locale;
			this._renderSearch(this.toolbar);
			locale.render({element:this.element});
			$("#tag-overview-itembox").find(".cloud-item").live("click",function(){
				if($(this).attr("id") == "tag-overview-tag-1"){
					$("#toolbar-search-box").show();
				}else{
					$("#toolbar-search-box").hide();
				}
			});
			this.empower();
		},
		
		empower: function() {
			var self=this;
			self.getawayConfig = permission.app("_gateway");
			if(!self.getawayConfig.write) {
				this.overview.contentModule.addBtn.hide();
				this.overview.contentModule.deleteBtn.hide();
			}
			if(!self.getawayConfig.import) {
				this.importBtn.hide();
				this.IMSIBtn.hide();
			}
			if(!self.getawayConfig.management) {
				this.configBtn.hide();
			}
			
			//this.labelBtn.hide();
			
			//this.IMSIBtn.hide();
		},

		verifiedDeviceModel: function(ids, busi) {
			var res_length = ids.length;
			var num = 0;
			var result = true;
			var device_model = null;
			var self = this;
			service.getTableResourcesById(ids, function(resources) {
		        var modelId = resources.first().modelId;
                if (resources.all(function(resource) {
                    return resource.modelId == modelId;
                })) {
                    self.renderAndOpenGatewayManage(busi, resources);
                } else {
//	                  alert("Select the same model device , Please!");
                }
			}, this);
		},
		verifySameModel : function(resources){
		    if (resources.length == 0){
		        return true;
		    }
		    var modelId = resources.first().modelId;
		    if (resources.all(function(resource) {
                return resource.modelId == modelId;
            })) {
		    	return true;
		    }else {
		        return false;
		    }
		},
		
		verifyGateway : function(resources){
		    var result = true;
		    
		    var plcIds = resources.pluck("plcId");
		    plcIds.find(function(plcId){
		        if (plcId != 0) {
		            result = false;
		            return true;
		        }
		    });
//		    console.log(result, "verifyGateway");
		    return result;
		},
		
		hideConfigIcon:function(){
			var self = this;
			var ids = self.overview.contentModule.getSelectedResources();
			if(ids == 0){
				$(".dev-overview-configMgr").removeAttr("style");
				return;
			}
			
			service.getTableResourcesById(ids, function(resources) {
				var modelId = resources.first().modelId;
				if (resources.all(function(resource) {
					return resource.modelId == modelId;
				})&&resources.all(function(resource){
					return resource.plcId == 0;
				})) {
					$(".dev-overview-configMgr").removeAttr("style");
				} else {
					$(".dev-overview-configMgr").css("display","none");
				}
			}, this);
		},
		//disable
		addToolbarItems: function() {
			var self = this;
			var toolbar = this.overview.getToolbar();
			var configBtn = new Button({
				imgCls: "cloud-icon-config",
				title: locale.get("gateway_management"),
				//lang:"{title:gateway+management}",
				cls:"dev-overview-configMgr",
				id:"dev-overview-gatewayConfigMgr",
				events: {
					click: function() {
						var selectedResouces = this.overview.contentModule.getSelectedResources();
						if (selectedResouces.length == 0) {
//							alert("At least select one item , Please!");
							dialog.render({lang:"please_select_at_least_one_config_item"});
						} else {
							this.verifiedDeviceModel(selectedResouces, "config");
						}
					},
					scope: this
				}
			});
			this.configBtn = configBtn;
//			var upgradeBtn = new Button({
//				imgCls: "cloud-icon-upgrade",
//				title: "升级",
//				events: {
//					click: function() {
//						var selectedResouces = this.overview.contentModule.getSelectedResources();
//						if (selectedResouces.length == 0) {
//							alert("At least select one item , Please!");
//						} else {
//							this.verifiedDeviceModel(selectedResouces, "upgrade");
//						}
//					},
//					scope: this
//				}
//			});
			var labelBtn = new Button({
				imgCls: "cloud-icon-label",
				title: "批量标签",
				lang:"{title:batch_tag}",
				events: {
					click: function() {
						var selectedResouces = this.overview.contentModule.getSelectedResources();
						if (selectedResouces.length == 0) {
//							alert("At least select one item , Please!");
							dialog.render({lang:"please_select_at_least_one_config_item"});
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
			this.labelBtn = labelBtn;
			
			var importBtn = new Button({
				imgCls: "cloud-icon-daoru",
				title: locale.get("batch_import"),
				lang:"{title:batch_import}",
				events: {
					click: function() {
						this.renderBatchImport(); 
					},
					scope: this
				}
			});
			this.importBtn = importBtn;
			
			// Export devices button added by Kevin on 2014/7/25
			var exportBtn = new Button({
				imgCls: "cloud-icon-daochu",
				title: locale.get("export_devices"),
				lang: "{title:export_devices}",
				events: {
					click: function() {
						this.exportDevices();
					},
					scope: this
				}
			});
			this.exportBtn = exportBtn;

			var IMSIBtn=new Button({
				imgCls:"cloud-icon-shouquan",
				title:locale.get("imsi_mobilenumber"),
				lang:"{title:imsi_mobilenumber}",
				events:{
					click:function(){
						this.renderMISIImport();
					},
					scope:this
				}
			});
			this.IMSIBtn = IMSIBtn;
//			var remoteControlBtn=new Button({
//				imgCls:"cloud-icon-remote",
//				title:locale.get("remote_control"),
//				events:{
//					click:function(){
//						var selectedResouces = this.overview.contentModule.getSelectedResources();
//						if(selectedResouces.length > 1 || selectedResouces.length === 0){
//							dialog.render({lang:"select_one_gateway"});
//						}else{
//							this.renderRemoteControl(selectedResouces[0]);
//						}
//					},
//					scope:this
//				}
//			});
			toolbar.appendRightItems([IMSIBtn,labelBtn,importBtn,exportBtn,configBtn], -1);
			this.toolbar = toolbar;
		},
		
//		renderRemoteControl:function(gatewayId){
//			
//			var self = this;
//			
//			if(this.window) {
//				this.window.destroy();
//				this.window = null;
//			}
//			
//			this.window = new _Window({
//				container: "body",
//				title:locale.get("remote_control"),
//				lang:"{title:remote_control}",
//				top: "center",
//				left: "center",
//				cls:"mydevice-overvier-configMgr",
//				height: 570,
//				width: 853,
//				mask: true,
//				drag:true,
//				content: "<div id='overview-window-remote-controll'></div>",
//				events: {
//					"onClose": function() {
//						this.window.destroy();
//						this.window = null;
//					},
//					scope: this
//				}
//			});
//			
//			require(["./remote-control"],function(RemoteControl){
//				var remoteControl = new RemoteControl({
//					selector:"#overview-window-remote-controll",
//					id:gatewayId
//				});
//			});
//			
//			this.window.show();
//			
//		},
		
		renderMISIImport:function(){
			if(this.MISIImport){
				this.MISIImport.destroy();
			}
			this.MISIImport=new MISIImport({
				events:{
					"onMISIImportSuc":function(){
						self.overview.reloadTags();
					}
				}
			});
		},
		renderBatchImport : function(){
			var self = this;
			if (this.batchImport){
				this.batchImport.destroy();
			}
			this.batchImport = new BatchImport({
				events : {
					"onBatchImportSuc" : function(){
//						console.log("onBatchImportSuc");
						self.overview.reloadTags();
					}
				}
			});
//			this.batchImport.on()
		},
		
		renderAndOpenGatewayManage: function(busi, resources, model) {
			var self = this;
			if (!this.window) {
				this.window = new _Window({
					container: "body",
					title: locale.get("gateway_management"),//"网关管理",
					lang:"{title:gateway_management}",
					top: "center",
					left: "center",
					cls:"mydevice-overvier-configMgr",
					height: 600,
					width: 1300,
					mask: true,
					drag:true,
					content: "<div id='overview-window-el'></div>",
					events: {
						"onClose": function() {
							this.gatewayMgr.destroy();
							this.gatewayMgr = null;
							this.window = null;
						},
						scope: this
					}
				});
				require(["../gateway-manage/gateway-manage"], function(GatewayManage) {
					self.gatewayMgr = new GatewayManage({
						selector: self.window.element.find("#overview-window-el"),
						business: busi,
						resources: resources,
						modelId: resources.first().modelId
					});
				});
				this.window.show();
			} else {
//				require(["../gateway-manage/gateway-manage"], function(GatewayManage) {
//					self.gatewayMgr = new GatewayManage({
//						selector: self.window.element.find("#overview-window-el"),
//						business: busi,
//						resources: resources,
//						modelId: resources.first().modelId
//					});
//				});
//				this.window.show();
			}
		},

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
					self.overview && (self.overview.reloadTags("clicked"));
				}
			})
		},
		_renderSearch:function(toolbar){
			var self = this;
			var elements = {
					box:"toolbar-search-box",
					hint:"toolbar-search-hint",
					input:"toolbar-search-input",
					button:"toolbar-search-button"
			}
			//draw search
			var toolbarElement = "#" + toolbar.id;
			var toolbarLeftElement = "." + $(toolbar["leftDiv"][0]).attr("class");
			var toolbarRightElement = "." + $(toolbar["rightDiv"][0]).attr("class");
			var searchBox = $("<form>").attr("id",elements.box).attr("class",elements.box);
			var $hint = $("<input>").attr("type","text").attr("id",elements.hint).attr("class",elements.hint).attr("lang","value:enter_the_gateway_name");
			var $input = $("<input>").attr("type","text").attr("id",elements.input).attr("class",elements.input).css("display","none");
			var $button = $("<input>").attr("type","button").attr("id",elements.button).attr("class",elements.button);
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
				var tempArray=[];
				contentOverview.page.reset(data);
				if(!inputValue){
					service.getResourcesIds=function(start,limit,callback,context){
						cloud.Ajax.request({
							url:"api/devices",
							type:"get",
							parameters:{
								cursor:start,
								limit:limit,
								verbose:1
							},
							success:function(data){
								data.result = data.result.pluck("_id");
			                    callback.call(context || this, data);
							}
						})          			
					}
				}
				else{
					service.getResourcesIds=function(start, limit, callback, context){
			            cloud.Ajax.request({
			                url : "api/devices",
			                type : "get",
			                parameters:{
			                	name:inputValue,
			                	cursor:start,
			                	limit:limit,
			                	verbose:1
			                },
			                success : function(dataByName) {
			                	cloud.Ajax.request({
			                		url:"api/devices",
			                		type:"get",
			                		parameters:{
			                			serial_number:inputValue,
			                			cursor:start,
			                			limit:limit,
			                			verbose:1
			                		},
			                		success:function(dataBySerialNumber){			                	
			                			var data_by_serial_number=dataBySerialNumber;
			                			data_by_serial_number.result=data_by_serial_number.result.concat(tempArray);
			                			dataByName.result.each(function(one){
			                				var flag=false;
			                				for(var i=0;i<data_by_serial_number.result.length;i++){
			                					if(one._id===data_by_serial_number.result[i]._id){			                		
			                						flag=true;
			                						break;
			                					}
			                				}
			                				if(!flag){
		                		           		data_by_serial_number.result.push(one);
			                				}	                				
			                			});
			                			tempArray=data_by_serial_number.result.slice(limit);
			                			data_by_serial_number.result=data_by_serial_number.result.slice(0,limit);		                			
			                			data_by_serial_number.total=total_gateway;			       
			                			var data=data_by_serial_number;
			                			data.result = data.result.pluck("_id");
//			                			console.log(data.result);
					                    callback.call(context || this, data);
			                		}
			                	})
			                	
			                }
			            });
			        
					} 
				}

			};
			//search event
				$("#" + elements.hint).click(function(){
					$(this).hide();
					$("#" + elements.input).show().focus();
				});
				var searchFunction=function(){
					var display = self.overview.contentModule.display;
					self.overview.options.service.getResourcesIds=service.getResourcesIds;
					self.overview.hideInfo();
					cloud.util.mask(self.element);
					$("#" + elements.hint).hide();
					$("#" + elements.input).show().focus();
					var pattern=/^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/i;
					inputValue = $("#" + elements.input).val().replace(/\s/g,"");
					var param = {
							verbose:100,
							limit:0,
							plc_id:0
					};
					inputValue=inputValue.match(pattern);
					if(inputValue!==null&&inputValue.length !== 0){
//						param.name = inputValue;
						inputValue=inputValue.toString();
							param.serial_number = inputValue;
							Model.device({
								method:"query_list",
								param:param,
								success:function(dataBySerialNumber){
//									if(data.result.length !== 0)
//										data.result.each(function(one){
//											one.description = one.model;
//										});
//										var resourceData = self.overview.contentModule.processData(data.result);
//										self.overview.contentModule.itembox.render(resourceData);
//										updateCount(data);
//										refreshPage(data);
//										cloud.util.unmask();									
										delete param.serial_number;
										param.name = inputValue;
										Model.device({
											method:"query_list",
											param:param,
											success:function(dataByName){
												
												dataByName.result.each(function(one){																							
					                				var flag=false;
					                				for(var i=0;i<dataBySerialNumber.result.length;i++){
					                					if(one._id===dataBySerialNumber.result[i]._id){
					                						flag=true;
					                						break;
					                					}
					                				}
					                				if(!flag){
					                					dataBySerialNumber.result.push(one);
					                				}	                									                			
												});
												dataBySerialNumber.total=dataBySerialNumber.result.length;
												total_gateway=dataBySerialNumber.total;
												var data=dataBySerialNumber;
//												console.log(data.result.pluck("_id"));
												data.result=data.result.slice(0,display);
												data.result.each(function(one){
													one.description = one.model;
												});
												
												var resourceData = self.overview.contentModule.processData(data.result);
												self.overview.contentModule.itembox.render(resourceData);
												
												updateCount(data);
												refreshPage(data);
												cloud.util.unmask();
											}
										});
									
								}
							});
					}else{
						param.limit=display;
						Model.device({
							method:"query_list",
							param:param,
							success:function(data){
//								console.log(data);
								data.result.each(function(one){
									one.description = one.model;
								});
//							self.overview.contentModule.itembox.clear();
								var resourceData = self.overview.contentModule.processData(data.result);
								self.overview.contentModule.itembox.render(resourceData);
								updateCount(data);
								refreshPage(data);
								cloud.util.unmask();
							}
						})
					}
				};
				$("#" + elements.button).click(searchFunction);
				$("#" + elements.input).keypress(function(event){
					if(event.keyCode==13){
						searchFunction();
					}
				});
		},
		exportDevices: function() {
			var selectedResouces = this.overview.contentModule.getSelectedResources();
			service.exportDevices(selectedResouces, function(data){
				var url = cloud.config.FILE_SERVER_URL + "/api/file/" + data.result._id + "?access_token=";
				cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
			});
		},
		destroy: function() {
			this.element.removeClass("mydevice-overview cloud-application");
			this.overview.destroy();
			if (this.gatewayMgr) {
				if (this.gatewayMgr.destroy) {
					this.gatewayMgr.destroy();
				}
			}
			if (this.tagManager != null) this.tagManager.destroy();
			if (this.infoModule.destroy) this.infoModule.destroy();
		}
	});
	return MyDeviceOverview;
});