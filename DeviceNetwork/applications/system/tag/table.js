/**
 * @author PANJC
 * 
 */
define(function(require){
	require("cloud/base/cloud");
	var Grid = require("../../template/grid");
	var Info = require("./info");
	var Toolbar = require("cloud/components/toolbar");
	var Button = require("cloud/components/button");
	var service = require("./service");
	var commonService = require("cloud/service/service");
	
	var columns = [
			
			{
				"title" : "标签名",
				"lang":"text:tag_name",
				"dataIndex" : "name",
				"cls" : "cloud-table-row",
				"width" : "14%",
				render : function(name, type, data) {
					var html = data.name;
					/*if (data.shared) {
						html += new Template(
								"<div  style = \"display : inline-block; margin-left: 4px; float: right; margin-right:10px;\" class=\"cloud-icon-active cloud-icon-share\"></div>")
								.evaluate();
					}*/
					/*if (data.isMyFavorite) {
						html += new Template(
								"<div  style = \"display : inline-block; margin-left: 4px; float: right;margin-right:10px;\" class=\"cloud-icon-active cloud-icon-star\"></div>")
								.evaluate();
					}*/
					return html;
				}
			}, {
				"title" : "网关数量",
				"lang":"text:gateway_count",
				"dataIndex" : "gatewayCount",
				"cls" : null,
				"width" : "14%"
			},
			{
				"title":"控制器数量",
				"lang":"text:machine_count",
				"dataIndex":"machineCount",
				"cls":null,
				"width":"14%"
			},
			{
				"title":"机型数量",
				"lang":"text:model_count",
				"dataIndex":"modelCount",
				"cls":null,
				"width":"14%"
			},
			{
				"title" : "现场数量",
				"lang":"text:site_count",
				"dataIndex" : "siteCount",
				"cls" : null,
				"width" : "14%"
			},/* {
				"title" : "现场模版数量",
				"dataIndex" : "siteTplCount",
				"cls" : null,
				"width" : "14%"
			}, {
				"title" : "文档数量",
				"dataIndex" : "docCount",
				"cls" : null,
				"width" : "16%"
			}, {
				"title" : "客户数量",
				"dataIndex" : "customerCount",
				"cls" : null,
				"width" : "16%"
			}, */{
				"title" : "用户数量",
				"lang":"text:user_count",
				"dataIndex" : "userCount",
				"cls" : null,
				"width" : "14%"
			}, {
				"title" : "角色数量",
				"lang":"text:role_count",
				"dataIndex" : "roleCount",
				"cls" : null,
				"width" : "16%"
			},{
				"title" : "Id",
				"dataIndex" : "_id",
				"cls" : "_id" + " " + "hide"
			} ];
	
	
	var TagTable = Class.create(cloud.Component,{
		initialize: function($super, options){
			var $this = this;
			$super(options);
			var self = this;
			permission.judge(["_tag","read"],function(){
				var info = null;
				//声明模板
				self.tableModule = new Grid({
					//businessType:"tag", //传递businessType
					//tagElement:"#tag-table",
					//contentElement:"#content-table",
					//selector:options.selector,
					service: service, //传递service
					infoModule: function() {
						if (info === null) {
							info = new Info({
								selector: $("#info-table")
							});
						}
						
						return info;
					},
					
					contentColumns: columns,
					selector: self.element,
					service: service
				});
				
				/*this.infoModule = new Info({
				businessType:"tag",
				selector: "#info-table"
			});
			this.tableModule.setInfoModule(this.infoModule);
			
			this.tableModule.contentModule.getAllByService();*/
				//$this._modulesEvents();
				self.addToolbarItems();
				self.permission();
				locale.render({element:self.element});
			});
			
		},
		
		addToolbarItems:function(){
			var self = this;
			var toolbar = this.tableModule.getToolbar();
			var favorBtn = new Button({
				imgCls : "cloud-icon-star1",
				title : locale.get("batch_favor"),
				//id: this.moduleName + "-add-button",
				events : {
					click:this.batchFavore.bind(this)
				}
			});
			var shareBtn = new Button({
				imgCls : "cloud-icon-share1",
				title : locale.get("batch_share"),
				//id: this.moduleName + "-add-button",
				events : {
					click:this.batchShare.bind(this)
				}
			});
			shareBtn.hide();//TODO
//			toolbar.appendRightItems([favorBtn, shareBtn], -1);
			toolbar.appendRightItems([shareBtn], -1);
		},
		
		batchFavore : function(){
			var self = this;
			var selectedRes = $A(this.tableModule.modules.content.getSelectedResources());
			if (selectedRes.length > 0){
				this.lastBatchShareRequest = cloud.Ajax.request({
	                url: "api/favorites",
	                type: "post",
	                data: {
	                	resourceIds: selectedRes.pluck("_id")
	                },
	                success: function(data) {
	                    self.lastBatchShareRequest = null;
	                    self.tableModule.hideInfo();
	                    if (data.result == "ok"){
	                    	dialog.render({
	                			lang:"batch_favor_success"
	                		});
	                    };
	                }
	            });
			}else {
				dialog.render({
            	  	lang:"please_select_at_least_one_config_item"
            	});
			}
		},
		
		permission:function(){
			var self = this;
			if(!(permission.app("_tag"))["write"]){
				self.tableModule.modules.content.addBtn.hide();
				self.tableModule.modules.content.deleteBtn.hide();
			}
		},
		
		batchShare : function(){
			
		},
		
        destroy:function(){
        	this.tableModule.element.empty();
        	this.tableModule = null;
        }
	});
	return TagTable;
});