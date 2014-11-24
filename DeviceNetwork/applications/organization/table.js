/**
 * @author zhang
 */
define(function(require){
	var TagManager = require("../components/tag-manager");
	var Table = require("../template/table");
	var Button = require("cloud/components/button");
	var service = require("./service");
	var Info = require("./info");
	var TagManager = require("../components/tag-manager");
	var css = require("./resources/css/organ-table.css");
	var columns = [/*
					 * { "title":"状态", "lang":"{text:state}", "dataIndex":
					 * "online", "cls": null, "width": "5%", render:function(){
					 *  }
					 */
	, {
		"title" : "机构名称",
		"lang" : "{text:organization_name}",
		"dataIndex" : "name",
		"cls" : null,
		"width" : "25%"
	},
//	{
//		"title" : "机构地址",
//		"lang" : "{text:organization_address}",
//		"dataIndex" : "address",
//		"cls" : null,
//		"width" : "17%",
//	}, {
//		"title" : "机构网址",
//		"lang" : "{text:website}",
//		"dataIndex" : "website",
//		"cls" : null,
//		"width" : "17%",
//	}, {
//		"title" : "电话",
//		"lang" : "{text:phone}",
//		"dataIndex" : "phone",
//		"cls" : null,
//		"width" : "16%",
//	}, {
//		"title" : "传真",
//		"lang" : "{text:fax}",
//		"dataIndex" : "fax",
//		"cls" : null,
//		"width" : "16%",
//	}, 
	{
//		"title" : "联系人邮箱",
		"lang" : "{text:creator}",
		"dataIndex" : "creator",
		"cls" : null,
		"width" : "25%"
	},
	{
		"title" : "联系人邮箱",
		"lang" : "{text:email}",
		"dataIndex" : "email",
		"cls" : null,
		"width" : "25%"
	},
	{
//		"title" : "联系人邮箱",
		"lang" : "{text:create_time}",
		"dataIndex" : "createTime",
		"cls" : null,
		"width" : "25%",
		render:function(data){
			return cloud.util.dateFormat(new Date(data), "yyyy-MM-dd hh:mm:ss");
		}
	}
	];
	var OrganTabel = Class.create(cloud.Component,{
		initialize : function($super,options){
			$super(options);
			this._renderTable();
			this._addToolbarItems();
			this._renderSearch(this.toolbar);
			locale.render({
				element : this.element
			});
			$("#tag-overview-itembox").find(".cloud-item").live("click",function(){
				if($(this).attr("id") == "tag-overview-tag-1"){
					$("#toolbar-search-box").show();
				}else{
					$("#toolbar-search-box").hide();
				}
			})
		},
		_renderTable:function(){
			var info = null;
			this.tableTemplate = new Table({
				infoModule:function(){
					if (info === null) {
						info = new Info({
							selector: $("#info-table")
						});
					}
					return info;
				},
				contentColumns: columns,
				selector: this.element,
				service: service
			});
			
		},
		_addToolbarItems:function(){
			var toolbar = this.tableTemplate.getToolbar();
			var importBtn = new Button({
				imgCls: "cloud-icon-daochu",
				title: "导入",
				lang:"{title:export}",
				events: {
					click: function() {
						var language = locale._getStorageLang()==="en"? 1 : 2;
                    	var host = cloud.config.FILE_SERVER_URL;
						var reportName = "organizationReport.xls";
            			var url = host + "/api/reports/forms/organizations?limit=0&verbose=100&report_name="+reportName+"&language="+language + "&access_token=";
            			cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
					},
					scope: this
				}
			});
			var labelBtn = new Button({
				imgCls: "cloud-icon-label",
				lang:"{title:batch_tag}",
				events: {
					click: function() {
						var selectedResouces = this.tableTemplate.modules.content.getSelectedResources();
						if (selectedResouces.length == 0) {
							dialog.render({lang:"please_select_at_least_one_config_item"});
						} else {
							var resources = new Hash();
							selectedResouces.each(function(resource) {
								resources.set(resource._id, resource.name);
							});
							this.renderTagManager(resources.toObject());
						}
					},
					scope: this
				}
			});
			toolbar.appendRightItems([importBtn,labelBtn],-1);
			toolbar.deleteRightItem(3);
			toolbar.deleteRightItem(2);
			this.toolbar = toolbar;
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
			var $hint = $("<input>").attr("type","text").attr("id",elements.hint).attr("class",elements.hint).attr("lang","value:enter_the_name_or_number");
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
//				console.log("returnData.total",returnData.total);
//				console.log("currentCount",currentCount);
				contentTable.updateCountInfo();
			};
			var refreshPage = function(data){
				var contentTable = self.tableTemplate.modules.content;
				contentTable.page.reset(data);
//				var display = contentTable.display;
//				console.log("total",total);
//				console.log("display",display);
//				console.log("self.tableTemplate.modules.content.refreshPage",self.tableTemplate.modules.content.refreshPage);
//				if(parseInt(total) > display){
//					contentTable._renderPaging(Math.ceil(total/(display)),1,display);
//                }else{
//                	contentTable.paging ? contentTable.paging.destroy() : "";
//                }
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
					var inputValue = $.trim($("#" + elements.input).val());
					if(inputValue === ""){
						Model.organ({
							method:"query_list",
							param:{
								verbose:100,
								limit:display
							},
							success:function(returnData){
								self.tableTemplate.modules.content.content.clearTableData();
								self.tableTemplate.modules.content.content.add(returnData.result);
								updateCount(returnData);
//								console.log("self.tableTemplate.modules.content",self.tableTemplate.modules.content);
//								console.log("returnData",returnData);
								refreshPage(returnData);
								cloud.util.unmask();
							}
						});
						return;
					}
					if(inputValue.length === 15){
						Model.device({
							method:"query_organ",
							param:{serial_number:inputValue},
							success:function(returnData){
								if(returnData.total !== 0){
									Model.organ({
										method:"query_one",
										param:{
											verbose:100
										},
										part:returnData["result"][0]["oid"],
										success:function(returnDataDevice){
											Model.organ({
												method:"query_list",
												param:{
													name:inputValue,
													verbose:100,
													limit:0
												},
												success:function(returnDataOrgan){
													if(returnDataOrgan.total === 0){
														self.tableTemplate.modules.content.content.clearTableData();
														self.tableTemplate.modules.content.content.add(returnDataDevice["result"]);
														updateCount(returnData);
														refreshPage(returnData);
														cloud.util.unmask();
													}else{
														var newArr = [returnDataDevice["result"],returnDataOrgan["result"][0]];
														self.tableTemplate.modules.content.content.clearTableData();
														self.tableTemplate.modules.content.content.add(newArr);
														updateCount(returnData);
														refreshPage(returnData);
														cloud.util.unmask();
													}
												}
											});
										}
									});
								}else{
									Model.organ({
										method:"query_list",
										param:{
											name:inputValue,
											verbose:100,
											limit:0
										},
										success:function(returnData){
											self.tableTemplate.modules.content.content.clearTableData();
											self.tableTemplate.modules.content.content.add(returnData["result"]);
											updateCount(returnData);
											refreshPage(returnData);
											cloud.util.unmask();
										}
									});
								}
							}
						});
					}else{
						Model.organ({
							method:"query_list",
							param:{
								name:inputValue,
								verbose:100,
								limit:0
							},
							success:function(returnData){
								self.tableTemplate.modules.content.content.clearTableData();
								self.tableTemplate.modules.content.content.add(returnData["result"]);
								updateCount(returnData);
								cloud.util.unmask();
								refreshPage(returnData);
							}
						});
					}
				};
				$("#" + elements.button).click(searchFunction);
				$("#"+elements.input).keypress(function(event){
					if(event.keyCode==13){
						searchFunction();
					}
				})
		},
		
		renderTagManager: function(resources) {
			var self = this;
			this.tagManager = new TagManager({
				obj: resources
			});
			this.tagManager.on({
				"onComplete" : function(){
					self.tableTemplate.reloadTags("clicked");
				}
			})
		},
		
		destroy : function($super){
			this.tableTemplate.destroy();
			$super();
		}
		
	});
	
	return OrganTabel
	
});