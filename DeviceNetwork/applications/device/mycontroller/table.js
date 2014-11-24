define(function(require) {
	require("cloud/base/cloud");
	var TableTemplate = require("../../template/table");
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var Info = require("./info");
	var service = require("./service");
	var TagManager = require("../../components/tag-manager");
	require("../resources/css/toolbar-search.css");
	var columns = [{
		"title": "控制器名",
		"lang":"{text:controller_name}",
		"dataIndex": "name",
		"cls": null,
		"width": "19%"
	}, {
		"title": "机器类型",
		"dataIndex": "model",
		"lang":"{text:model}",
		"cls": null,
		"width": "13%"
	}, {
		"title": "安装现场",
		"lang":"{text:installation_site}",
		"dataIndex": "siteName",
		"cls": null,
		"width": "15%"
	},{
		"title": "",
		"width": "53%"
	} 
//	{
//		"title": "机器地址",
//		"lang":"{text:plc_mbadddress}",
//		"dataIndex": "deviceConfig.mbAddress",
//		"cls": null,
//		"width": "10%",
//	},{
//		"title":"波特率",
//		"lang":"{text:baud_rate}",
//		"dataIndex":"deviceConfig.mbBaud",
//		"cls":null,
//		"width":"7%",
////		render: function(data, type, row) {
////			var display = null;
////			//TODO
////			if ("display" == type) {
////				switch (data) {
////					case 0:
////						//display = "建设";
////							var str = locale.get("construction");
////							display = "<font >" + str + "</font>";
////						break;
////					case 1:
////						//display = "投运";
////							var str = locale.get("operation");
////							display = "<font >" + str + "</font>";
////						break;
////					case 2:
////						//display = "故障";
////							var str = locale.get("fault");
////							display = "<font >" + str + "</font>";
////						break;
////					case 3:
////						//display = "检修";
////							var str = locale.get("overhaul");
////							display = "<font >" + str + "</font>";
////						break;
////					default:
////						break;
////				}
////				return display;
////			} else {
////				return data;
////			}
////		}
//	}, {
//		"title": "数据位",
//		"lang":"{text:data_bit}",
//		"dataIndex": "deviceConfig.mbDataBit",
//		"cls": null,
//		"width": "6%",
////		render: function(data, type, row) {
////			//TODO
////			switch (parseInt(data)) {
////				case 0:
////					//未同步
////					return locale.get("not_sync");
////					break;
////				case 1:
////					//正在获取配置
////					return locale.get("getting_config");
////					break;
////				case 2:
////					//正在下发配置
////					return locale.get("applying_config");
////					break;
////				case 3:
////					//同步成功
////					return locale.get("sync_succeed");
////					break;
////				case 4:
////					//同步失败
////					return locale.get("sync_fail");
////					break;
////				default:
////					break;
////			}
////		}
//	}, {
//		"title": "停止位",
//		"lang":"{text:stop_bit}",
//		"dataIndex": "deviceConfig.mbStopBit",
//		"cls": null,
//		"width": "6%"
//	},{
//		"title":"奇偶校验",
//		"lang":"{text:parity_check}",
//		"dataIndex":"deviceConfig.mbParity",
//		"cls":null,
//		"width":"6%"
//	},{
//		"title":"序列号",
//		"lang":"{text:serial_number}",
//		"dataIndex":"serialNumber",
//		"cls":null,
//		"width":"12%"
//	}
	];

	var myControllerTable = Class.create(cloud.Component, {
		initialize: function($super, options) {
			$super(options);
			var controlConfig = permission.app("_controller");
			if(!controlConfig.read) {
				return ;
			}
			this.info = null;
			var self=this;
			this.tableTemplate = new TableTemplate({
				infoModule: function() {
					if (self.info === null) {
						self.info = new Info({
							selector: $("#info-table")
						});
					}

					return self.info;
				},
				selector: this.element,
				service: service,
				contentColumns: columns
			});

			this.addToolbarItems();
			this._renderSearch(this.toolbar);
			//记得国际化
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
        	var controlConfig = permission.app("_controller");
        	if(!controlConfig.write) {
        		this.tableTemplate.modules.content.addBtn.hide();
				this.tableTemplate.modules.content.deleteBtn.hide();
			}       	
        	//this.tableTemplate.modules.content.addBtn.disable();
			//this.tableTemplate.modules.content.deleteBtn.disable();
        },
		
		addToolbarItems: function() {
			var self = this;
			var toolbar = this.tableTemplate.getToolbar();
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
//								console.log(resource);
							});
							self.renderTagManager(resources.toObject());
						}
					},
					scope: this
				}
			});
			toolbar.appendRightItems([labelBtn], -1);
			this.toolbar = toolbar;
		},
		
		renderTagManager: function(resources) {
//			if (!this.tagManagerWindow) {
//				this.tagManagerWindow = new _Window({
//					container: "body",
//					title: "标签批量操作",
//					top: "center",
//					left: "center",
//					height: 620,
//					width: 605,
//					mask: false,
//					content: "<div id='overview-window-tag'></div>",
//					events: {
//						"onClose": function() {
//							this.tagManager.destroy();
//							this.tagManager = null;
//							this.tagManagerWindow = null;
//						},
//						scope: this
//					}
//				});
//				var self = this;
//				require(["../../components/tag-manager"], function(TagManager) {
//					self.tagManager = new TagManager({
//						selector: self.tagManagerWindow.element.find("#overview-window-tag"),
//						obj: resources
//					});
//				});
//				this.tagManagerWindow.show();
//			} else {
//				this.tagManagerWindow.show();
//			}
			var self = this;
			if (this.tagManager){
				this.tagManager.destroy();
			}
			this.tagManager = new TagManager({
				obj: resources
			});
			this.tagManager.on({
				"onComplete" : function(){
					self.tableTemplate.reloadTags("clicked");
				}
			});
		
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
			var $hint = $("<input>").attr("type","text").attr("id",elements.hint).attr("class",elements.hint).attr("lang","value:enter_the_controller_name");
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
//				contentTable._renderPaging(Math.ceil(total/display),1,display);
				service.getResourcesIds=function(start, limit, callback, context) {
		            cloud.Ajax.request({
		                url : "api/machines",
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
							limit:display,
							plc_id:-1
					};
					inputValue=inputValue.match(pattern);
					if(inputValue!==null&&inputValue.length !== 0){
						inputValue=inputValue.toString();
						param.name = inputValue;						
					}
					Model.machine({
						method:"query_list",
						param:param,
						success:function(data){
//							console.log(data);
							var newArr = data["result"];
							self.tableTemplate.modules.content.content.clearTableData();
							self.tableTemplate.modules.content.content.add(newArr);
							updateCount(data);
							refreshPage(data);
							cloud.util.unmask();
						}
					})
				};
				$("#"+elements.input).keypress(function(event){
					if(event.keyCode==13){
						searchFunction();
					}						
			});
				$("#"+elements.button).click(searchFunction);
		},

		destroy: function() {
			if(this.tableTemplate){
				$("#" + this.info.id).empty();
				if(this.tableTemplate.destroy){
					this.tableTemplate.destroy();
				}else{
					this.tableTemplate=null;
				}

				if(this.tagManagerWindow){
				if(this.tagManagerWindow.destroy){
					this.tagManagerWindow.destroy();
				}else{
					this.tagManagerWindow=null;
				}

				if(this.tagManager){
					if(this.tagManager.destroy){
						this.tagManager.destroy();
					}
					else{
						this.tagManager=null;
					}
				}

					if(this.info.destroy){
						this.info.destroy();
					}else{
						this.info=null;
					}
				}				
			}
		}
	});
	return myControllerTable;
});