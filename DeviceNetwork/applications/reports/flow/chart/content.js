/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var NoticeBar = require("./bar");
	var html = require("text!./content.html");
	var Table = require("cloud/components/table");
//	var TraffiCday = require("./trafficday");
	var service = require("./service");
	var ContentChart = require("../../../components/content-chart");
	var Layout = require("cloud/lib/plugin/jquery.layout");
	var Paging = require("cloud/components/paging");
//	var Paginate = require("cloud/components/paginate");
	var Button = require("cloud/components/button");
	var columns = [
//	{
//	    "title": "",
//	    "dataIndex": null,
//	    "width": "20%",
//	    sortable: false,
//	    "defaultContent": "<input type='checkbox' class='table-input' />",
//	    cls: "checkbox"
//	},
//	{
//        "title": "序号",
//        "dataIndex": "_id",
//        "cls": "id hide",
//    },
    {
        "title": "现场名称",
		"lang": "text:site_name",
        "dataIndex": "siteName",
        "cls": "date",
        "width": "50%"
    },
	{
		"title": "网关名称",
		"lang": "text:gateway_name",
		"dataIndex": "name",
		"cls": "send",
		"width": "50%"
	}
    ];
	
	var Content = Class.create(cloud.Component,{
		initialize:function($super,options){
			this.ids = $A();
			this.moduleName = "flow-list";
			$super(options);
			this.service = options.service;
			this.businessType = options.businessType;
			this.flowChart = null;
			this.elements = {
					bar:{
						id:"content-bar",
						"class":null
					},
					chart:{
						id:"content-chart",
						"class":null
					},
					west:{
						id:"content-west",
						"class":null
					},
					paging:{
						id:"content-west-paging",
						"class":null
					},
					table:{
						id:"content-west-table",
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
			this._renderChart();
			this._renderTable();
			this.load();
			this._renderNoticeBar();
			locale.render({element:this.element});
		},
		
		_renderHtml:function(){
			this.element.html(html);
		},
		
		_renderLayout:function(){
			var self= this;
			this.layout = this.element.layout({
                defaults: {
                    paneClass: "pane",
                    togglerLength_open: 50,
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    spacing_open: 1,
                    spacing_closed: 1,
                    togglerLength_closed: 50
//                    resizable: true,
//                    slidable: false,	
//                    closable: false
                },
                north: {
                    paneSelector: "#" + this.elements.bar.id,
                    size: 35,
                    closable: false
                },
                west: {
                	paneSelector: "#" + this.elements.west.id,
                	size: 300,
                	closable: false
                },
                center: {
                    paneSelector: "#" + this.elements.chart.id
//					paneClass:this.elements.content["class"]
                },
				onresize_end : function(){
//                	console.log("content.resize");
//                	$(window).trigger("resize")
                	self.contentChart.resizeChart();
                }
            });
			this.westLayout = this.element.find("#"+this.elements.west.id).layout({
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
                center: {
                    paneSelector: "#" + this.elements.table.id
                },
				south: {
					paneSelector: "#" + this.elements.paging.id,
					size: 38
				}
			});
			var height = this.element.find("#" + this.elements.west.id).height();
			if(Math.ceil((height-60)/34-1) === 0 ){
				this.display = 1;
			}else{
				this.display = Math.ceil((height-60)/34-1);
			}
        },
        _getLog:function(opt){
//        	console.log("-------"+opt);
        },
		_renderNoticeBar:function(){
			var self = this;
			var noticeBar = new NoticeBar({
				selector: "#" + this.elements.bar.id,
				events:{
					query:function(opt,name){
						self.opt = opt;
                        self.name = name;
						self.mask();
						service.getDevicelist(opt,name,0,self.pageDisplay,function(data){
							self._renderPagin(data);
						});
//						if(self.opt !== "-1"){
//							service.getDevicelist(opt,0,self.display,function(data){
//								var total = data.total;
//								self.table.clearTableData();
//								self.table.render(data.result);
//								if( total > self.display){
//									self._renderPagin(Math.ceil(total/(self.display)));
//								}else{
//									if(self.paging){
//										self.paging.destroy();
//										self.paging=null;
//									}
//								}
//								self.unmask();
//							});
//						}else{
//							self.unmask();
//							self.table.clearTableData();
//							if(self.paging){
//								self.paging.destroy();
//								self.paging=null;
//							}
//						}
//						self.contentChart && self.contentChart.removeSeries();
////						service.getDevicelist(opt,self.table.render, self.table);
					}
				}
			});
		},
		
		_renderTable:function(){
			var self = this;
			this.table = new Table({
//				businessType:this.businessType,
				selector:"#" + this.elements.table.id,
				columns: columns,
				datas: [],
                pageSize: 100,
                autoWidth: false,
                pageToolBar: false,
                checkbox : "multi",
                events: {
                    onRowClick: function(data) {
//                    	self.flowChart.render("test", [{name : "14:00", y : 100},{name : "15:00", y : 10},{name : "17:00", y : 0}]);
                    },
                    onRowCheck : function(isSelected, rowEl, data){
//						console.log(data,"data");
//						console.log(rowEl,"rowEl");
//						console.log(isSelected,"isSelected");
						
						if (isSelected && this.contentChart){
							self.ids.push(data._id);
                    		this.contentChart.addSeries({
                                resourceId : data._id,
                                name : data.name
                            });
							
                    	}else if (this.contentChart){
                    		var len = self.ids.length;
                    		for(var i = 0 ; i < len ; i++) {
                    			if(data._id === self.ids[i]) {
                    				self.ids.splice(i, 1);
                    				break ;
                    			}
                    		}
                    		this.contentChart.removeSeries([data._id]);
                    	}
//                    	var deviceids = self.getSelectedIds();
//    					var opt = {startTime:0,endTime:100000000000000,numb:1,datas:deviceids};
//    					service.getFlowChartData(opt,function(data){
//    						$("#content-chart-body").empty();
//    						this.flowChart = new FlowChart({
//    							contanor:"#content-chart-body",
//    							datas:data,
//    							service:self.service,
//    							deviceIds:self.getSelectedIds()
//    						});
//    					});
                    },
                    onRowRendered: function(tr, data, index) {
                        var self = this;
                    },
					
                    scope: this
                }
			});
//			service.getDevicelist(1,this.table.render,this.table);
		},
		load:function(){
			var self = this;
//			this.opt = "0,1";
//			service.getDevicelist(this.opt,0,this.display,function(data){
//				var total = data.total;
//				self.table.clearTableData();
//				self.table.render(data.result);
//				if( total > self.display){
//					self._renderPagin(Math.ceil(total/(self.display)));
//				}else{
//					if(self.paging){
//						self.paging.destroy();
//						self.paging=null;
//					}
//				}
//			});
			service.getDevicelist(self.opt,self.name,0,self.pageDisplay,function(data){
				self._renderPagin(data);
			});
		},
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
					service.getDevicelist(self.opt,self.name,options.cursor,options.limit,function(returnData){
						success(returnData);
					});
				},
				turn:function(returnData){
					var len = self.ids.length;
					for(var i = 0 ; i < len ; i++) {
						self.contentChart.removeSeries(self.ids[i]);
					}
					self.table.clearTableData();
					self.table.render(returnData.result);
					self.unmask();
				}
			});
        	$("#" + self.elements.paging.id).children().css("margin-left","10px");
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
//							self.contentChart && self.contentChart.removeSeries();
//						},
//						scope: this
//					}
//				});
//		},
//		_turnPage:function(page){
//			var self = this;
//			this.mask();
//			var self = this;
//			service.getDevicelist(this.opt,(page - 1)*this.display,this.display,function(data){
//				var total = data.total;
//				self.table.clearTableData();
//				self.table.render(data.result);
//				self.unmask();
//			});
//		},
		_renderChart:function(){
			var self = this;
			this.contentChart = new ContentChart({
            container : "#content-chart-body",
            service : service,
            fixedAxis : true,
            intervalButtons : [{
                name : "24" + locale.get({lang:"_hours"}),
                value : 24 * 3600
            },{
                name : "7" + locale.get({lang:"_days"}),
                value : 24 * 3600 * 7
            },{
                name : "30" + locale.get({lang:"_days"}),
                value : 24 * 3600 * 30
            }],
            chart : {
                type : "line",//"line", "spline", "column"
                title : locale.get({lang:"flow_chart"}),
				tooltips : {
					formatter:function(){
						var value = self.unitConversion(this.y);
						return cloud.util.dateFormat(new Date(this.x/1000),"yyyy-MM-dd hh:mm:ss")+"<br/>"
						+this.series.name + " : " +value;
						
					}
            	},
                //xAxis : {title : "time"},
                yAxis : {
                	min : 0,
					formatter:function(){
//						console.log("yAxis_formatter", this);
                           return self.unitConversion(this.value);
					}
                }
            }
        })
		},
		unitConversion:function(opt){
            if ( typeof opt === "number"){
		        if(opt<1024){
                    return opt.toFixed(3)+"B";
                }else if(opt< 1024*1024){
                    return (opt/1024).toFixed(3)+"KB";
                }else{
                    return (opt/1024/1024).toFixed(3)+"MB";
                }
		    }else{
		        return opt;
		    }
        },
		destroy:function(){
			this.table.clearTableData();
			this.table.destroy();
			$("#"+this.elements.chart.id).empty();
		},
		
		getSelectedIds:function(){
			var arr = [];
			var self = this;
        	var selectedRes = $A();
        	self.table.getSelectedRows().each(function(row){
        		selectedRes.push(self.table.getData(row));
        	});
			for(var i = 0;i< selectedRes.length;i++){
				arr[i] = selectedRes[i]._id;
			}
			return arr;
		},
		
		reload:function(businessType){
			this.destroy();
			this.content = null;
			
		}
		
	});
	
	return Content;
	
});