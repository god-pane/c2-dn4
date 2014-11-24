/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 */
define(function(require) {
    //引入依赖
	require("cloud/base/cloud");
	var TableTemplate = require("../../template/table");//模板
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var Info = require("./info");//info栏
	var service = require("./service");
	var TagManager = require("../../components/tag-manager");
	var HistoryPanel = require("../../reports/historydata/history-panel");
	require("./resources/css/site-table.css");
	//定义table列，配置项参照cloud/components/table
	var columns = [
	{
		"title": "状态",
		"dataIndex": "online",
		"lang":"{text:state}",
		"cls": null,
		"width": "5%",
		render:function(data, type, row){
			var display = "";
			if ("display" == type) {
				switch (data) {
					case 1:
						var onlineStr = locale.get({lang:"online"});
						display += new Template(
						"<div  style = \"display : inline-block;\" class = \"cloud-table-online\" title = \"#{status}\"}></div>")
						.evaluate({
							status : onlineStr
						});
						break;
					case 0:
						var offlineStr = locale.get({lang:"offline"});
						display += new Template(
						"<div  style = \"display : inline-block;\" class = \"cloud-table-offline\" title = \"#{status}\"}></div>")
						.evaluate({
							status : offlineStr
						});
						break;
					
					default:
						break;
				}
				return display;
			} else {
				return data;
			}
		}
	} , {
		"title": "现场名称",
		"dataIndex": "name",
		"width": "35%",
		"lang":"{text:site_name}"
	},/*{
		"title": "所属客户",
		"dataIndex": "customerName",
		"cls": null,
		"width": "20%"
	}, */{
		"title": "安装地址",
		"dataIndex": "address",
		"cls": null,
		"width": "20%",
		"lang":"{text:installation_address}"
	}, {
		"title": "业务状态",
		"dataIndex": "businessState",
		"cls": null,
		"width": "10%",
		"lang":"{text:business_state}",
		render: function(data, type, row) {
			var display = "";
			if ("display" == type) {
				switch (data) {
					case 0:
						display = locale.get({lang:"construction"});
						break;
					case 1:
						display = locale.get({lang:"commissionin"});
						break;
					case 2:
						display = locale.get({lang:"fault"});
						break;
					case 3:
						display = locale.get({lang:"overhaul"});
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
		"title": "联系人姓名",
		"dataIndex": "contact.name",
		"cls": null,
		"width": "10%",
		"lang":"{text:contacter_name}"
	}, {
		"title": "联系人电话",
		"dataIndex": "contact.phone",
		"cls": null,
		"width": "10%",
		"lang":"{text:contacter_phone}"
	}, {
		"title": "邮件",
		"dataIndex": "contact.email",
		"cls": null,
		"width": "10%",
		"lang":"{text:email}"
	}];

	var MySiteTable = Class.create(cloud.Component, {
	    
	    /**
	     * 初始化组件
	     * @param $super {Function} 父函数
	     * @param options {object} 参数
	     */
		initialize: function($super, options) {
		    
		    //初始化父类
			$super(options);
			var info = null;
			var self=this;
			//使用模板初始化
			permission.judge(["_site","read"],function(){
				self.tableTemplate = new TableTemplate({
					infoModule: function() {
						if (info === null) {
							info = new Info({
								selector: $("#info-table")
							});
						}

						return info;//向模板传入site的info栏
					},
					selector: self.element,
					service: service,//向模板传入service，模板使用此service加载数据
					contentColumns: columns//列表行定义
				});

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
			});		
		},
		permission:function(){
			var self = this;
			var flag=permission.app("_site")["write"];
			if(!flag){
				self.tableTemplate.modules.content.addBtn.hide();
				self.tableTemplate.modules.content.deleteBtn.hide();
			};
		},
		/**
		 * 初始化site模块特有的功能按钮，并放入模板的工具栏中
		 */
		addToolbarItems: function() {
			var self = this;
			
			//获取模板toolbar
			var toolbar = this.tableTemplate.getToolbar();
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
			var maintainBtn = new Button({
				imgCls: "cloud-icon-arrow4",
				title: "现场维护",
				events: {
					click: function() {
//						alert("现场维护！！！");
					},
					scope: this
				}
			});
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
			monitorBtn.hide();
			maintainBtn.hide();
//			reportBtn.hide();//TODO
			var labelBtn = new Button({
				imgCls: "cloud-icon-label",
				lang:"{title:batch_tag}",
				events: {
					click: function() {
						var selectedResouces = this.tableTemplate.modules.content.getSelectedResources();
						if (selectedResouces.length === 0) {
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
			
			
			var historyBtn = new Button({
				imgCls: "cloud-icon-history",
				lang: "{title:history_data}",
				events: {
					click: function() {
						var row = this.tableTemplate.modules.content.getSelectedResources();
						if(row.length == 1) {
							new HistoryPanel({
								deviceId: row[0]._id,
								deviceName: row[0].name
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
			toolbar.appendRightItems([labelBtn,historyBtn], -1);
			//为MySiteTabel初始化toolbar
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
			var input_value="";
			searchBox.append($hint).append($input).append($button);
			$(toolbarElement).find(toolbarLeftElement).after(searchBox);
			var updateCount=function(returnData){
				var contentTable=self.tableTemplate.modules.content;
				var display=contentTable.display;
				var currentCount;
				if(returnData.total<=display){
					currentCount=returnData.total;
				}
				else{
					currentCount=display;
				}
				contentTable.selectedCount=0;
				contentTable.total=returnData.total;
				contentTable.totalCount=currentCount;
				contentTable.updateCountInfo();
			};
			var refreshPage=function(data){
				var contentTable=self.tableTemplate.modules.content;
					contentTable.page.reset(data);
//					contentTable._renderPaging(Math.ceil(total/display),1,display);
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
					self.tableTemplate.service.getResourcesIds=service.getResourcesIds;
					self.tableTemplate.hideInfo();
					var display=self.tableTemplate.modules.content.display;
					cloud.util.mask(self.element);
					$("#"+elements.hint).hide();
					$("#"+elements.input).show().focus();
					var pattern=/^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/i;
					inputValue=$("#" + elements.input).val().replace(/\s/g,"");
					if(inputValue===""){
						Model.site({
							method:"query_list",
							param:{
								verbose:100,
								limit:display
							},
							success:function(returnData){
								self.tableTemplate.modules.content.content.clearTableData();
								self.tableTemplate.modules.content.content.add(returnData.result);
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
									self.tableTemplate.modules.content.content.clearTableData();
									self.tableTemplate.modules.content.content.add(returnData.result);
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
//									console.log(returnData);
									self.tableTemplate.modules.content.content.clearTableData();
									self.tableTemplate.modules.content.content.add(returnData.result);
									updateCount(returnData);
									cloud.util.unmask();
									refreshPage(returnData);
								}
							});
						}
					}
				};
				$("#"+elements.button).click(searchFunction);
				$("#"+elements.input).keypress(function(event){
					if(event.keyCode==13){
						searchFunction();
					}
				});
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
					self.tableTemplate.reloadTags("clicked");
				}
			});
		},
		
		destroy: function() {
			this.tableTemplate.destroy();
			this.tableTemplate.element.empty();
			this.tableTemplate = null;
		}
	});
	return MySiteTable;
});