/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var NoticeBar = require("./bar");
	var html = require("text!./content.html");
	var Table = require("cloud/components/table");
	var Trafficday = require("./trafficday-window");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var Paging = require("cloud/components/paging");
//	var Paginate = require("cloud/components/paginate");
	var Button = require("cloud/components/button");
	
	var unitConversion = function(opt,type){
		if(type === "display"){
			if ( typeof opt === "number"){
			 if(opt<1024){
			   	 return opt.toFixed(0)+"B";
			    }else if(opt< 1024*1024){
			        return (opt/1024).toFixed(3)+"KB";
			    }else{
			        return (opt/1024/1024).toFixed(3)+"MB";
			    }
			}else{
			    return opt;
			}
		}else{
//			return opt;
		}
	};
	var columns = [
                    //                          {"sTitle":"机构","mData":"oid","sClass":null,"sWidth": "20%"},
                    //                          {"sTitle":"用户","mData":"owner","sClass":null,"sWidth": "20%"},//
                    
					{
                        "title": "现场名称",
						"lang": "text:site_name",
                        "dataIndex": "siteName",
                        "cls": "siteName",
                        "width": "20%"
                    },
					{
						"title": "智能网关",
						"lang": "text:gateway_name",
						"dataIndex": "name",
						"cls": "smartGateway",
						"width": "20%"
					},
					{
						"title": "月发送流量",
						"lang":"text:monthly_tx",
						"dataIndex": "send",
						"cls": "monthSendFlow",
						"width": "15%",
						render: unitConversion
					},
					{
						"title": "月接收流量",
						"lang":"text:monthly_rx",
						"dataIndex": "receive",
						"cls": "monthSendFlow",
						"width": "15%",
						render: unitConversion
					},
					{
						"title": "月总流量",
						"lang":"text:monthly_total",
						"dataIndex": "total",
						"cls": "time",
						"width": "15%",
						render: unitConversion
					},
					{
						"title": "日最大流量",
						"lang":"text:daily_max",
						"dataIndex": "max",
						"cls": "dayMaxFlow",
						"width": "15%",
						render: unitConversion
					}
                    ];
	
	var Content = Class.create(cloud.Component,{
		initialize:function($super,options){
			this.moduleName = "flow-list";
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
					paging:{
						id:"content-paging",
						"class":null
					}
			};
			this.element.addClass("flow-list").css({
				height: "100%"
			});
			this.display = null;
			this.pageDisplay = 30;
			this._render();
		},
		
		_render:function(){
			this._renderHtml();
			this._renderLayout();
			this._renderTable();
			this._renderNoticeBar();
			locale.render({element:this.element});
		},
		
		_renderHtml:function(){
			this.element.html(html);
		},
		
		_renderLayout:function(){
			this.layout = this.element.layout({
                defaults: {
                    paneClass: "pane",
                    togglerLength_open: 50,
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    spacing_open: 0,
                    spacing_closed: 1,
                    togglerLength_closed: 50,
                    resizable: false,
                    slidable: false,	
                    closable: false
                },
                north: {
                    paneSelector: "#" + this.elements.bar.id,
                    size: 35,
                    closable: false
                },
                center: {
                    paneSelector: "#" + this.elements.table.id
//					paneClass:this.elements.content["class"]
                },
				south: {
					paneSelector: "#" + this.elements.paging.id,
					size: 38
				}
            });
			var height = this.element.find("#" + this.elements.table.id).height();
			this.display = Math.ceil((height-60)/30-1);
        },
        _getLog:function(opt){
//        	console.log("-------"+opt);
        },
		_renderNoticeBar:function(){
			var self = this;
			this.noticeBar = new NoticeBar({
				selector: "#" + this.elements.bar.id,
//				servcie:self.service
				events:{
					query:function(opt){
						self.opt = opt;
						self.mask();
//						if(self.opt.net !== "-1"){
//							self.options.service.getDevicelist(self.opt.net,0,self.display,function(datas){
//								self.options.service.getflows(self.opt.month,datas.data,function(data){
//									self.content.clearTableData();
//									self.content.render(data);
//									var total = datas.total;
//									if(total>self.display){
//										self._renderPagin(Math.ceil(total/(self.display)));
//									}else{
//										if(self.paging){
//											self.paging.destroy();
//											self.paging=null;
//										}
//									}
//									self.unmask();
//								});
//							});
//						}else{
//							self.unmask();
//							self.content.clearTableData();
//							if(self.paging){
//								self.paging.destroy();
//								self.paging=null;
//							}
//						}
						self.options.service.getFlowReports(self.opt.name,self.opt.net,0,self.pageDisplay,self.opt.month,function(returnData){
							self._renderPagin(returnData);
						});
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
                checkbox : "multi",
                events: {
                    onRowClick: function(data) {
//						console.log(data,"data");
                    	if(data){
                    		data.month = self.opt.month;
                    		if(this.trafficday){
                    			this.trafficday.destroy();
                    		}
                    		this.trafficday = new Trafficday({
                    			selector:"body",
                    			datas:data
                    		});
                    	}
                    },
                    onRowRendered: function(tr, data, index) {
                        var self = this;
                    },
                    scope: this
                },
				drawCallback: function ( oSettings ) {
        			/* Need to redo the counters if filtered or sorted */
        			if ( oSettings.bSorted || oSettings.bFiltered )
        			{
        				for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
        				{
        					$('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
        				}
        			}
        		}
			});
			
			this.initDataTable();
		},
		destroy:function(){
			this.content.clearTableData();
			this.content.destroy();
			if(this.trafficday&&Object.isFunction(this.trafficday.destroy)){
				this.trafficday.destroy();
				this.trafficday = null;
			}
			$("#"+this.elements.table.id).empty();
		},
		
//		reload:function(businessType){
//			this.destroy();
//			this.content = null;
//			
//		},
		
		_renderPagin:function(data){
        	var self = this;
        	$("#" + self.elements.paging.id).empty();
        	self.paging = null;
        	self.paging = new Paging({
				selector:"#" + self.elements.paging.id,
				data:data,
				current:1,
				total:data.total,
				limit:30,
				requestData:function(options,success){
					self.options.service.getFlowReports(self.opt.name,self.opt.net,options.cursor,options.limit,self.opt.month,function(returnData){
						success(returnData);
					});
				},
				turn:function(returnData){
					self.content.clearTableData();
					self.content.render(returnData.result);
					self.unmask();
				}
			})
        },
		
//		_renderPagin:function(pagination){
//			var self = this;
//			if (this.paging) {
//				this.paging.destroy();
//				this.paging=null;
//			}
//				this.paging = new Paginate({
//					display: this.pageDisplay,
//					count: pagination,
//					start: 1,
//					container: $("#" + this.elements.paging.id),
//					events: {
//						change: function(page) {
//							self._turnPage(page);
//						},
//						scope: this
//					}
//				});
//		},
		
//		_turnPage:function(page){
//			var self = this;
//			this.mask();
////			this.obj1.cursor=(page - 1) * (this.display);
//			this.options.service.getDevicelist(this.opt.net,(page-1)*this.display,this.display,function(datas){
//				self.options.service.getflows(self.opt.month,datas.data,function(data){
//					self.content.clearTableData();
//					self.content.render(data);
//					self.unmask();
//				});
//			});
//		},
		
		initDataTable: function(){
			var self = this;
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			if(month<10){
				var mon = year+"0"+month;
			}else{
				var mon = year+""+month;
			}
			this.opt={
				month:mon
//				net:"0,1"
			}
//			this.options.service.getDevicelist(this.opt.net,0,this.display,function(datas){
//				self.options.service.getflows(self.opt.month,datas.data,function(data){
//					self.content.clearTableData();
//					self.content.render(data);
//					var total = datas.total;
//					if(total>self.display){
//						self._renderPagin(Math.ceil(total/(self.display)));
//					}
//				});
//			});
			self.options.service.getFlowReports(self.opt.name,self.opt.net,0,self.pageDisplay,self.opt.month,function(returnData){
				self._renderPagin(returnData);
			});
		}
	});
	
	return Content;
	
});