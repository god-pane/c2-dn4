define(function(require) {
	require("cloud/base/cloud");
	var TableTemplate = require("../../template/table");
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var Info = require("./info");
	var service = require("./service");
	var TagManager = require("../../components/tag-manager");
	var BatchImport = require("./batch-import");
	var MISIImport=require("./misi-import");
	require("../resources/css/toolbar-search.css");
	
	/*var onlineCss = {
		width: "14px";
		height: "14px";
		background-color: "rgb(178, 182, 178)";
		border-radius: "50%";
	};
	var offlineCss = {
		width: "14px";
		height: "14px";
		background-color: "rgb(0, 182, 0)";
		border-radius: "50%";	
	}
	*/
	var columns = [
	{
		"title": "状态",
		"lang":"{text:state}",
		"dataIndex": "online",
		"cls": null,
		"width": "5%",
		render:function(data, type, row){
			var display = "";
			//TODO
			if ("display" == type) {
				switch (data) {
					case 0:
							var offlineStr = locale.get("offline");
							display += new Template(
							"<div  style = \"display : inline-block;\" class = \"cloud-table-offline\" title = \"#{status}\"}></div>")
							.evaluate({
								status : offlineStr
							});
//							display = "<font >" + offlineStr + "</font>";
						break;
					case 1:
							var onlineStr = locale.get("online");
							display += new Template(
							"<div  style = \"display : inline-block;\" class = \"cloud-table-online\" title = \"#{status}\"}></div>")
							.evaluate({
								status : onlineStr
							});
//							display = "<font >" + onlineStr + "</font>";
						break;
					
					default:
						break;
				}
				return display;
			} else {
				return data;
			}
		}
	}, {
		"title": "网关名",
		"lang":"{text:device_name1}",
		"dataIndex": "name",
		// "cls": "cloud-table-row",
		"width": "10%"
	}, {
        "title": "IMSI",
//        "lang":"{text:device_name1}",
        "dataIndex": "info",
        // "cls": "cloud-table-row",
        "width": "10%",
        render: function(data, type, row) {
            var display = "";
            if ("display" == type) {
                display = data.imsi || "";
                return display;
            }
        }
    },{
    	"title":"手机号",
    	"lang":"{text:mobile_number}",
    	"dataIndex":"mobileNumber",
    	"width":"10%"
    },{
    	"title":"IP地址",
    	"lang":"{text:ip_address}",
    	"dataIndex":"pubIp",
    	"width":"10%"
    },{
		"title": "机型类型",
		"lang":"{text:model_type}",
		"dataIndex": "model",
		// "cls": "cloud-table-row",
		"width": "10%"/*,
		render: function(data) {
			var modelName = null;
			cloud.Ajax.request({
    			url: "api/models/"+data,
    			async: false,
    			type: "GET",
    			dataType: "JSON",
    			success: function(data) {
    				modelName = data.result.name;
    			}
    		});
			return modelName;
		}*/
	},
	{
		"title": "安装现场",
		"lang":"{text:installation_site}",
		"dataIndex": "siteName",
		"cls": null,
		"width": "15%"
	}, 
	/*{
		"title": "安装地址",
		"lang":"{text:installation_address}",
		"dataIndex": "address",
		"cls": null,
		"width": "10%"
	},*/ 
	{
		"title": "业务状态",
		"lang":"{text:business_state}",
		"dataIndex": "businessState",
		"cls": null,
		"width": "10%",
		render: function(data, type, row) {
			var display = null;
			//TODO
			if ("display" == type) {
				switch (data) {
					case 0:
						//display = "建设";
							var str = locale.get("construction");
							display = "<font >" + str + "</font>";
						break;
					case 1:
						//display = "投运";
							var str = locale.get("operation");
							display = "<font >" + str + "</font>";
						break;
					case 2:
						//display = "故障";
							var str = locale.get("fault");
							display = "<font >" + str + "</font>";
						break;
					case 3:
						//display = "检修";
							var str = locale.get("overhaul");
							display = "<font >" + str + "</font>";
						break;
					default:
						break;
				}
				return display;
			} else {
				return data;
			}
		}
	}, {
		"title": "配置状态",
		"lang":"{text:configuration_state}",
		"dataIndex": "syncState",
		"cls": null,
		"width": "10%",
		render: function(data, type, row) {
			//TODO
			switch (parseInt(data)) {
				case 0:
					//未同步
					return locale.get("not_sync");
					break;
				case 1:
					//正在获取配置
					return locale.get("getting_config");
					break;
				case 2:
					//正在下发配置
					return locale.get("applying_config");
					break;
				case 3:
					//同步成功
					return locale.get("sync_succeed");
					break;
				case 4:
					//同步失败
					return locale.get("sync_fail");
					break;
				default:
					return "";
					break;
			}
		}
	}, {
		"title": "当前版本",
		"lang":"{text:current_version}",
		"dataIndex": "info.swVersion",
		"cls": null,
		"width": "10%"
	}
	/*, {
		"title": "联系人姓名",
		"lang":"{text:contacter_name}",
		"dataIndex": "contact.name",
		"cls": null,
		"width": "10%"
	}, {
		"title": "联系人电话",
		"lang":"{text:contacter_phone}",
		"dataIndex": "contact.phone",
		"cls": null,
		"width": "10%"
	}, {
		"title": "邮件",
		"lang":"{text:email}",
		"dataIndex": "contact.email",
		"cls": null,
		"width": "10%"
	}*/
	];

	var MyDeviceTable = Class.create(cloud.Component, {
		initialize: function($super, options) {
			$super(options);
			var getawayConfig = permission.app("_gateway");
			if(!getawayConfig.read) {
				return ;
			}
			var info = null;

			this.tableTemplate = new TableTemplate({
				infoModule: function() {
					if (info === null) {
						info = new Info({
							selector: $("#info-table")
						});
					}

					return info;
				},
				selector: this.element,
				service: service,
				contentColumns: columns,
                events : {
                    "afterSelect" : function(resources){
                        var isAllGateway = this.verifyGateway(resources);
                        var isSameModel = this.verifySameModel(resources)
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
			this._renderSearch(this.toolbar);
			this.gatewayMgr = null;
			this.window = null;
			var self = this;
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
				this.tableTemplate.modules.content.addBtn.hide();
				this.tableTemplate.modules.content.deleteBtn.hide();
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
		
		verifiedDeviceModel: function(obj) {
			var self = this;
			if (obj.resources) {
				self.renderAndOpenGatewayManage({resources:obj.resources,business:obj.type});
			} else {
//				alert("Select the same model device , Please!");
			}
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
//          console.log(result, "verifyGateway");
            return result;
        },

		addToolbarItems: function() {
			var self = this;
			var toolbar = this.tableTemplate.getToolbar();
			var configBtn = new Button({
				imgCls: "cloud-icon-config",
				title: locale.get("gateway_management"),
				lang:"{title:gateway_management}",
				id:"dev-overview-gatewayConfigMgr",
				cls:"dev-table-gatawayMgr",
				events: {
					click: function() {
						var selectedResouces = this.tableTemplate.modules.content.getSelectedResources();
						if (selectedResouces.length == 0) {
//							alert("At least select one item , Please!");
							dialog.render({lang:"please_select_at_least_one_config_item"});
						} else {
							this.verifiedDeviceModel({resources:selectedResouces,business:"config"});
						}
					},
					scope: this
				}
			});
			this.configBtn = configBtn;
//			var upgradeBtn = new Button({
//				imgCls: "cloud-icon-upgrade",
//				events: {
//					click: function() {
//						var selectedResouces = this.tableTemplate.modules.content.getSelectedResources();
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
				lang:"{title:batch_tag}",
				events: {
					click: function() {
						var selectedResouces = this.tableTemplate.modules.content.getSelectedResources();
						if (selectedResouces.length == 0) {
//							alert("At least select one item , Please!");
							dialog.render({lang:"please_select_at_least_one_config_item"});
						} else {
							var resources = new Hash();
							selectedResouces.each(function(resource) {
								resources.set(resource._id, resource.name);
							});
							self.renderTagManager(resources.toObject());
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
//						var selectedResouces = this.tableTemplate.modules.content.getSelectedResources();
//						if(selectedResouces.length > 1 || selectedResouces.length === 0){
//							dialog.render({lang:"select_one_gateway"});
//						}else{
//							this.renderRemoteControl(selectedResouces[0]["_id"]);
//						}
//					},
//					scope:this
//				}
//			});
			
			toolbar.appendRightItems([IMSIBtn,labelBtn, importBtn,exportBtn, configBtn], -1);
			this.toolbar = toolbar;
		},
        exportDevices: function() {
        var selectedResouces = this.tableTemplate.modules.content.getSelectedResources();
        service.exportDevices(selectedResouces, function(data){
            var url = cloud.config.FILE_SERVER_URL + "/api/file/" + data.result._id + "?access_token=";
            cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
        });
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
						self.tableTemplate.reloadTags();
					}
				}
			});
			
		},

		renderAndOpenGatewayManage: function(obj){
			var self = this;
			if (!this.window) {
				this.window = new _Window({
					container: "body",
					title: locale.get("gateway_management"),//"网关管理",
					lang:"{title:gateway_management}",//
					top: "center",
					left: "center",
					height: 600,
					width: 1300,
					mask: true,
					drag:true,
					content: "<div id='overview-window-el'></div>",
					events: {
						"onClose": function() {
							this.gatewayMgr.destroy();
							this.window = null;
						},
						scope: this
					}
				});
				require(["../gateway-manage/gateway-manage"], function(GatewayManage) {
					self.gatewayMgr = new GatewayManage({
						selector: "#overview-window-el",
						resources: obj.resources
					});
				});
				this.window.show();
			} else {
//				require(["../gateway-manage/gateway-manage"], function(GatewayManage) {
//					self.gatewayMgr = new GatewayManage({
//						selector: "#overview-window-el",
//						resources: obj.resources
//					});
//				});
//				this.window.show();
			}
		},

		renderTagManager: function(resources) {
			var self = this;
			if (this.tagManager){
				this.tagManager.destroy();
			};
			this.tagManager = new TagManager({
				obj: resources
			});
			this.tagManager.on({
				"onComplete" : function(){
					self.tableTemplate && (self.tableTemplate.reloadTags("clicked"));
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
			var updateCount = function(returnData){
				var contentTable = self.tableTemplate.modules.content;
				var display = contentTable.display;
				var currentCount;
				if(returnData.total <= display){
					currentCount = returnData.total;
				}else{
					currentCount = display;
				}
				contentTable.selectedCount = 0;
				contentTable.total = returnData.total;
				contentTable.totalCount = currentCount;
				contentTable.updateCountInfo();
			};
			var refreshPage = function(data){
				var contentTable=self.tableTemplate.modules.content;
				contentTable.page.reset(data);
				var tempArray=[];
//				contentTable._renderPaging(Math.ceil(total/display),1,display);
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
					service.getResourcesIds=function(start, limit, callback, context) {
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
			                			dataBySerialNumber.result=dataBySerialNumber.result.concat(tempArray);
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
			                			tempArray=dataBySerialNumber.result.slice(limit);
			                			dataBySerialNumber.result=dataBySerialNumber.result.slice(0,limit);
			                			dataBySerialNumber.total=total_gateway;
			                			var data=dataBySerialNumber;
			                			data.result = data.result.pluck("_id");
					                    callback.call(context || this, data);
			                		}
			                	})
			                }
			            });
			        };
				}

		};
			//search event
				$("#" + elements.hint).click(function(){
					$(this).hide();
					$("#" + elements.input).show().focus();
				});
				var searchFunction=function(){
					var display = self.tableTemplate.modules.content.display;
//					console.log("self.tableTemplate.modules",self.tableTemplate.modules);
					self.tableTemplate.service.getResourcesIds = service.getResourcesIds;
//					self.tableTemplate.modules.tag.loadTags(false);
					self.tableTemplate.hideInfo();
					cloud.util.mask(self.element);
					$("#" + elements.hint).hide();
					$("#" + elements.input).show().focus();
					var pattern=/^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/i;
					inputValue = $("#" + elements.input).val().replace(/\s/g,"");
					var param = {
							verbose:100,
							limit:0,
							plc_id:0
					}
					inputValue=inputValue.match(pattern);
					if(inputValue!==null&&inputValue.length !== 0){
//						param.name = inputValue;
						inputValue=inputValue.toString();
							param.serial_number = inputValue;
							Model.device({
								method:"query_list",
								param:param,
								success:function(dataBySerialNumber){									
//										var newArr = data.result;
//										self.tableTemplate.modules.content.content.clearTableData();
//										self.tableTemplate.modules.content.content.add(newArr);
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
												data.result=data.result.slice(0,display);
												var newArr = data.result;
												self.tableTemplate.modules.content.content.clearTableData();
												self.tableTemplate.modules.content.content.add(newArr);
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
								var newArr = data["result"];
								self.tableTemplate.modules.content.content.clearTableData();
								self.tableTemplate.modules.content.content.add(newArr);
								updateCount(data);
								refreshPage(data);
								cloud.util.unmask();
							}
						});
					}				
				};
				$("#" + elements.button).click(searchFunction);
				$("#" + elements.input).keypress(function(event){
					if(event.keyCode==13){
						searchFunction();
					}
				});
		},

		destroy: function() {
//			console.log("device - destroy() - table","destroy");
			this.tableTemplate.destroy();
			this.tableTemplate.element.empty();
			this.tableTemplate = null;
		}
	});
	return MyDeviceTable;
});