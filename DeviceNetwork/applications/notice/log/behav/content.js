/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var NoticeBar = require("./notice-bar");
	var html = require("text!./content.html");
	var Table = require("cloud/components/table");
	require("cloud/lib/plugin/jquery.layout");
	var Button = require("cloud/components/button");
//	var Paginate = require("cloud/components/paginate");
	var Paging = require("cloud/components/paging");
	var dateConvertor = function(name, type, data) {
		if ("display" == type) {
			return cloud.util.dateFormat(new Date(parseInt(name)), "yyyy-MM-dd hh:mm:ss");
		} else {
			return name;
		}
	};
	var opLevel = function(name, type, data){
		if ("display" === type) {
			var reInfo;
			switch (name) {
			case 2:
				reInfo = locale.get({lang:"debug"});
				reInfo="<img src='notice/log/imgs/log-level-3.png' />"+"\t\t"+reInfo;
				break;
			case 3:
				reInfo = locale.get({lang:"info"});
				reInfo="<img src='notice/log/imgs/log-level-2.png' />"+"\t\t"+reInfo;
				break;
			case 4:
				reInfo = locale.get({lang:"alert"});
				reInfo="<img src='notice/log/imgs/log-level-4.png' />"+"\t\t"+reInfo;
				break;
			case 5:
				reInfo = locale.get({lang:"error"});
				reInfo="<img src='notice/log/imgs/log-level-5.png' />"+"\t\t"+reInfo;
				break;
			case 6:
				reInfo = locale.get({lang:"serious_error"});
				reInfo="<img src='notice/log/imgs/log-level-6.png' />"+"\t\t"+reInfo;
				break;
			}
			return reInfo;
		}else{
			name="<img src='notice/log/imgs/log-level-1.png' />"+"\t\t"+name;
			return name;
		}
	};
	var columns = [
//	               {
//                        "title": "",
//                        "dataIndex": "",
//                        "cls": "first",
//                        "width": "2%",
//                    },
                    {
                        "title": "操作级别",
                        "dataIndex": "level",
                        "cls": "oplevel",
                        "width": "10%",
                        "lang":"{text:level}",
                        render:opLevel
                    },
                    //                          {"sTitle":"机构","mData":"oid","sClass":null,"sWidth": "20%"},
                    //                          {"sTitle":"用户","mData":"owner","sClass":null,"sWidth": "20%"},//
                    {
                        "title": "内容",
                        "dataIndex": "content",
                        "cls": "content",
                        "lang":"{text:content}",
                        "width": "40%"
                    },
					{
						"title": "IP地址",
						"dataIndex": "ip",
						"cls": "ipAddr",
						"lang":"{text:ip_address}",
						"width": "15%"
					},
					{
						"title": "操作员",
						"dataIndex": "username",
						"cls": "username",
						"lang":"{text:operator}",
						"width": "20%"
					},
					{
						"title": "操作时间",
						"dataIndex": "timestamp",
						"cls": "time",
						"width": "15%",
						"lang":"{text:time}",
						render:dateConvertor
					},
					{
						"title": "Id",
						"dataIndex": "_id",
						"cls": "_id" + " "+"hide"
					}
                    ];
	
	var Content = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.service = options.service;
			this.businessType = options.businessType;
			this.elements = {
					bar:{
						id:"content-bar",
						"class":null
					},
					table:{
						id:"content-table",
						"class":null
					},
					paging: {
	                    id: "content-paging",
	                    "class": null
	                }
			};
			this.display = null;
			this.pageDisplay = 10;
			this._render();
		},
		
		_render:function(){
			this._renderHtml();
			this._renderLayout();
			this._renderNoticeBar();
			this._renderTable();
		},
		
		_renderHtml:function(){
			this.element.html(html);
		},
		
		_renderLayout:function(){
			this.layout = this.element.layout({
                defaults: {
                    paneClass: "pane",
                    "togglerLength_open": 50,
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 0,
                    "spacing_closed": 1,
                    "togglerLength_closed": 50,
                    resizable: false,
                    slidable: false,
                    closable: false
                },
                north: {
                    paneSelector: "#" + this.elements.bar.id,
                    size: 34
                },
                center: {
                    paneSelector: "#" + this.elements.table.id
//					paneClass:this.elements.content["class"]
                },
				south:{
					paneSelector: "#" + this.elements.paging.id,
					size: 38
				}
            });
			var height = this.element.find("#" + this.elements.table.id).height();
			this.display = Math.ceil((height-60)/34);
        },
        _getLog:function(opt){
//        	console.log("-------"+opt);
        },
		_renderNoticeBar:function(){
			var self = this;
			var noticeBar = new NoticeBar({
				selector: "#" + this.elements.bar.id,
				events:{
					query:function(opt){
						self.fire("closeInfo");  //点击查询 关闭右侧Info模块 ---杨通
						self.opt = opt;
						self.mask();
						self.options.service.getBehaveLogs(self.opt, 0, /*self.display*/30, function(datas){
//							datas.reverse();
							//var data = datas.slice(0,self.display);
							self.content.render(datas);
							self.unmask();
							//new page
							self.page.reset(datas);
							
							//old page
//							if( datas.total > self.display ){
//								self._renderPagin(Math.ceil(datas.total/(self.display)));
//							}else{
//								if(self.paging){
//									self.paging.destroy();
//									self.paging=null;
//								}
//							}
						});
					},
					exportExl:function(){
						var opt = self.opt;
						var reportName = "OperationLog.xls";
						var url = cloud.config.FILE_SERVER_URL + "/api/reports/forms/behav_log?limit=0&verbose=100&report_name="+reportName+"&level="+opt.arr+"&start_time="+opt.startTime+"&end_time="+opt.endTime+"&language="+locale.current()+"&access_token=";
						cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
					}
				}
			});
		},
		
		_renderTable:function(){
			var self = this;
			this.content = new Table({
//				businessType:this.businessType,
				selector: this.element.find("#" + this.elements.table.id),
				columns: columns,
				datas: [],
                pageSize: 100,
                autoWidth: false,
                pageToolBar: false,
                checkbox:"none",
                events: {
                    onRowClick: function(data) {
//                        this.fire("click", data._id);
                    	data && (self.fire("openInfo"));
                    	self.fire("onClickLog",data);
                    },
                    onRowRendered: function(tr, data, index) {
                        var self = this;
//                        if (data.checkbox) {
//                            return;
//                        }
//                        var checkbox = new Button({
//                            checkbox: true,
//                            disabled: false,
//                            container: $(tr).find("td").first(),
//                            events: {
//                                click: function($checkbox) {
//                                   /* var selected = $checkbox.isSelected();
//                                    if (selected == true) {
//                                        $(tr).toggleClass("content-table-row-selected");
//                                    } else {
//                                        $(tr).toggleClass("content-table-row-selected");
//                                    }
//                                    self.updateCountInfo();*/
//                                },
//                                scope: self
//                            }
//                        });
//                        data.checkbox = checkbox;
                    },
                    scope: this
                }
			});
			
			this.initDataTable();
//			$(".cloud-table .dataTable thead th").css("padding-left","12px");
//			$(".cloud-table .dataTable tbody td").css("padding-left","12px");
		},
		
		destroy:function(){
			if (this.layout && (!this.layout.destroyed)) {
            	this.layout.destroy();
            }
			this.content.clearTableData();
			this.content.destroy();
			$("#"+this.elements.content.id).empty();
		},
		
		reload:function(businessType){
			this.destroy();
			this.content = null;
			
		},
		//old page
		_renderPagin:function(pagination){
			var self = this;
			if (this.paging) {
				this.paging.destroy();
				this.paging=null;
			}
				this.paging = new Paginate({
					display: this.pageDisplay,
					count: pagination,
					start: 1,
					container: $("#" + this.elements.paging.id),
					events: {
						change: function(page) {
							self._turnPage(page);
						},
						scope: this
					}
				});
		},
		_turnPage:function(page){
			this.mask();
			this.fire("onTurnPage", page);
			this.options.service.getBehaveLogs(this.opt, (page - 1) * (this.display), this.display, function(data){
				this.content.clearTableData();
				this.content.render(data);
				this.unmask();
			}, this);
		},
		//new page
		_renderpage:function(data){
			var self = this;
			this.page = new Paging({
				selector : $("#" + this.elements.paging.id),
				data : data,
				total:data.total,
				current : 1,
				limit : 30,
				requestData:function(options,callback){
					self.options.service.getBehaveLogs(self.opt, options.cursor, options.limit, function(data){
						callback(data);
					});
				},
				turn:function(data){
					self.content.clearTableData();
					self.content.render(data);
				}
			});
		},
		
		initDataTable: function(){
//			var end = parseInt(new Date().getTime()/1000);
//			var start = end - 86400*7;
			var start = $( "#startTime" ).datepicker("getDate").getTime() / 1000;
			var end = $( "#endTime" ).datepicker( "getDate").getTime() / 1000 + 86399;
			this.opt = {arr:[1,2,3,4,5,6],startTime:start,endTime:end};
//			this.options.service.getBehaveLogs(opt,this.content.render,this.content);
			this.options.service.getBehaveLogs(this.opt,0,/*this.display*/30,function(data){
				this.content.render(data);
				//new page
				this._renderpage(data);
				
				//old page
//				var total = data.total
//				if(total>this.display){
//					this._renderPagin(Math.ceil(data.total/(this.display)));
//				}
			},this);
		}
		
		
	});
	
	return Content;
	
});