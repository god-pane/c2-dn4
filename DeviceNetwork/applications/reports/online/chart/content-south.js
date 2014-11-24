/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./content-south.html");
	var rightHtml = require("text!./content-south-right.html");
	var rightCss = require("../../resources/css/online-chart.css");
	var Table = require("cloud/components/table");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var Button = require("cloud/components/button");
//	var HighCharts = require("cloud/lib/plugin/highcharts");
	var Paging = require("cloud/components/paging");
//	var Paginate = require("cloud/components/paginate");
	var ContentChart = require("../../../components/content-chart");
	var columns = [
					{
						"sortable": false,
					    "title": "",
					    "dataIndex": "",
					    "cls": "center",
					    "width": "0%"
					},
	               {
						"title": "现场名称",
						"lang":"text:site_name",
                        "dataIndex": "siteName",
                        "cls": "null",
                        "width": "40%"
                    },
                    {
                        "title": "设备名称",
                        "lang":"text:gateway_name",
                        "dataIndex": "name",
                        "width": "60%"
                    },
					{
						"title": "id",
						"dataIndex": "_id",
						"cls": "_id" + " "+"hide"
					}
                   ];
	
	var ContentSouth = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.ids = $A();
			this.service = options.service;
			this.businessType = options.businessType;
			this.elements = {
					box:{
						id:"content-south",
						"class":null
					},
					left:{
						id:"content-south-left",
						"class":null
					},
					right:{
						id:"content-south-right",
						"class":null
					},
					paging:{
						id:"content-south-paging",
						"class":null
					},
					table:{
						id:"content-south-table",
						"class":null
					}
			};
			this.display = null;
			this.pageDisplay = 30;
			this._render();
		},
		
		_render:function(){
			this._renderHtml();
			this._renderLayout();
			this._renderLeft();
			this._renderRight();
			this.obj1 = {
					cursor:0,
					limit:this.display,
//					online:"0,1",
					start_time:0,
					end_time:(new Date()).getTime(),
					verbose:100
			};
			this.tempObj1=this.obj1;
			this.load(this.obj1);
//			this._addButton();
			this._renderContentChart();
			this._events();
		},
		
		_events:function(){
			var self = this;
			$("#noticebar-online-input").live("click",function(){
				self.obj1=self.tempObj1;
				var thisChecked = $(this).attr("checked");
				var offlineChecked = $("#noticebar-offline-input").attr("checked");
				if(thisChecked === "checked" && offlineChecked === "checked"){
					self.obj1.online = "0,1";
				}else if(thisChecked === "checked"){
					self.obj1.online = "1";
				}else if(offlineChecked === "checked"){
					self.obj1.online = "0";
				}
			});
			$("#noticebar-offline-input").live("click",function(){
				self.obj1=self.tempObj1;
				var thisChecked = $(this).attr("checked");
				var onlineChecked = $("#noticebar-online-input").attr("checked");
				if(thisChecked === "checked" && onlineChecked === "checked"){					
					self.obj1.online = "0,1";
				}else if(thisChecked === "checked"){
					self.obj1.online = "0";
				}else if(onlineChecked === "checked"){
					self.obj1.online = "1";
				}
			});
		},
		
		load:function(listObj){
//			if(!listObj.limit){
//				listObj.limit = this.display;
//			}
			var self = this;
//			if(listObj.online !== "-1"){
				this.service.getSiteList(listObj,0,this.pageDisplay,function(data){
//					console.log(data);
//					var total = data.total;
//					if( total > self.display){
						self._renderPagin(data);
//					}else{
//						if(self.paging){
//							self.paging.destroy();
//							self.paging=null;
//						}
//					}
//					self._loadData(data.result);
					cloud.util.unmask();
//					self.contentChart && self.contentChart.removeSeries();// add by qinjunwen
////				console.log("getSiteList")
				});
//			}else{
//				cloud.util.unmask();
//				self.left.clearTableData();
//				if(self.paging){
//					self.paging.destroy();
//					self.paging = null;
//				}
//			}
		},
		
		_renderPagin:function(data){
        	var self = this;
        	$("#" + this.elements.paging.id).empty();
        	this.paging = null;
        	this.paging = new Paging({
				selector:"#" + this.elements.paging.id,
				data:data,
				current:1,
				total:data.total,
				limit:30,
				requestData:function(options,success){
					var $onlineInput = $("#noticebar-online-input");
					var $offlineInput = $("#noticebar-offline-input");
					if($onlineInput.attr("checked") == "checked" && $offlineInput.attr("checked") == "checked"){
						self.obj1 = undefined;
					}else if($onlineInput.attr("checked") == "checked"){
						self.obj1=self.tempObj1;
						self.obj1.online = "1";
					}else if($offlineInput.attr("checked") == "checked"){
						self.obj1=self.tempObj1;
						self.obj1.online = "0";
					}else{
						self.obj1=self.tempObj1;
						self.obj1.online = "-1";
					}
					self.service.getSiteList(self.obj1,options.cursor,options.limit,function(returnData){
						success(returnData);
						cloud.util.unmask();
					});
				},
				turn:function(returnData){
					var len = self.ids.length;
					for(var i = 0 ; i < len ; i++) {
						self.contentChart.removeSeries(self.ids[i]);
					}
					self._loadData(returnData.result);
					self.unmask();
				}
			});
        	$("#" + this.elements.paging.id).children().css("margin-left","10px");
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
//							self.contentChart && self.contentChart.removeSeries();// add by qinjunwen
//							self._turnPage(page);
//						},
//						scope: this
//					}
//				});
//		},
//		_turnPage:function(page){
//			var self = this;
//			this.mask();
//			this.obj1.cursor=(page - 1) * (this.display);
//			this.service.getSiteList(this.obj1,function(data){
//				self._loadData(data.result);
//				self.unmask();
//			});
//		},
		
		_loadData:function(data){
			this.left.clearTableData();
			this.left.add(data);
//			var self = this, 
//				len = self.ids.length;
//			data.each(function(item) {
//				for(var i = 0 ; i < len ; i++) {
//					if(self.ids[i] === item._id) {
//						self.left.getRowsByProp("id", checkedList[i]);
//					}
//				}
//			});
//			for(var i = 0 ; i < checkedList.length ; i++) {
//				var row = this.varTable.getRowsByProp("varId", checkedList[i]);
//				this.varTable.selectRows(row);
//			}
		},
		
		_renderHtml:function(){
			this.element.html(html);
		},
		
		_renderLayout:function(){
			var self = this;
			this.layout = this.element.layout({
                defaults: {
                    paneClass: "pane",
                    togglerLength_open: 50,
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    spacing_open: 1,
                    spacing_closed: 1,
                    togglerLength_closed: 50,
                    resizable: false,
                    slidable: false,
                    closable: false
                },
                west: {
                    paneSelector: "#" + this.elements.left.id,
                    size: 300
                },
                center: {
                    paneSelector: "#" + this.elements.right.id
                }
            });
			this.leftlayout = this.element.find("#" +this.elements.left.id).layout({
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
				},
                onresize_end : function(){
//                	console.log("content.resize");
//                	$(window).trigger("resize")
//                	self.contentChart.resizeChart(1000, 500);// resize chart with specified width and height in px
                	self.contentChart.resizeChart(); // resize chart by default 
                }
			});
			var height = this.element.find("#" + this.elements.left.id).height();
			this.display = Math.ceil((height-60)/34-1);
        },
        
		_renderLeft:function(){
			var self = this;
			this.left = new Table({
				selector: this.element.find("#" + this.elements.table.id),
				columns: columns,
				datas: [],
                pageSize: 100,
                autoWidth: false,
                checkbox : "multi",
                pageToolBar: false,
                events: {
//                    onRowClick: function(data) {
//                        this.fire("click", data._id);
//                    },
                    onRowRendered: function(tr, data) {
//                        var self = this;
//                        if (data.checkbox) {
//                            return;
//                        }
//                        var checkbox = new Button({
//                            checkbox: true,
//                            disabled: false,
//                            container: $(tr).find("td").first(),
//                            events: {
//                                click: function() {
//                                    self.renderChart({round:1});
//                                },
//                                scope: self
//                            }
//                        });
//                        data.checkbox = checkbox;
                    },
                    onRowCheck : function(isSelected, rowEl, data){
                    	if (isSelected && this.contentChart){
                    		self.ids.push(data._id);
                    		this.contentChart.addSeries({
                                resourceId : data._id,
                                name : data.name,
                                step : "left"
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
                    },
                    scope: this
                }
			});
		},
		
		_renderRight:function(){
			$("#content-south-right").html(rightHtml);
		},
		
		renderChart:function(paramObj){
			var self = this;
			var idArr = self.left.getSelectedIds();
			var round = paramObj.round;
			var timeArr = [];
			var catArr = [];
			var dataArr = [];
			var newDate;
			var currentTime = (new Date()).getTime();
			var month = 30*24*60*60*1000;
			if(round == 1){
				for(var num=0;num<24;num++){
					timeArr.unshift(Math.round(currentTime/1000) - num*3600);
					newDate = new Date(currentTime - num*60*60*1000 + month);
					newDate = newDate.getFullYear() + "/" + newDate.getMonth() + "/" + newDate.getDate() + "（" + newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds() + "）";
					catArr.unshift(newDate);
				}
			}else if(round == 7){
				for(var num=0;num<7;num++){
					timeArr.unshift(Math.round(currentTime/1000) - num*3600*24);
					newDate = new Date(currentTime - num*60*60*1000*24 + month);
					newDate = newDate.getFullYear() + "/" + newDate.getMonth() + "/" + newDate.getDate();
					catArr.unshift(newDate);
				}
			}else if(round == 31){
				for(var num=0;num<31;num++){
					timeArr.unshift(Math.round(currentTime/1000) - num*3600*24);
					newDate = new Date(currentTime - num*60*60*1000*24 + month);
					newDate = newDate.getFullYear() + "/" + newDate.getMonth() + "/" + newDate.getDate();
					catArr.unshift(newDate);
				}
			}
			var obj = {
					idArr:idArr,
					resourcesArr:self.left.getSelectedResources(),
					timeArr:timeArr,
					catArr:catArr,
					dataArr:dataArr
			};
			if(idArr.length != 0){
				self.service.getOnlineCurve(obj,function(obj){
//					console.log(obj);
//					self._renderChart(obj);
				});
			}else{
				if(!!self.highcharts){
					$('#reports-online-chart').highcharts().destroy();
					self.highcharts = null;
				}
			}
		},
		
		_renderContentChart : function(){
			
			this.contentChart = new ContentChart({
	            container : "#online-chart-right-content",
	            service : this.service,
	            intervalButtons : [{
	                name : "24" + locale.get("_hours"),
	                value : 24 * 3600
	            },{
	                name : "7" + locale.get("_days"),
	                value : 24 * 3600 * 7
	            },{
	                name : "30" + locale.get("_days"),
	                value : 24 * 3600 * 30
	            }],
	            chart : {
//	                type : "spline",//"line", "spline", "column"
	                title : locale.get({lang:"online_statistics_curve"}),
	                tooltips : {
	                	formatter:function(){
	                		var value = this.y === 1 ? locale.get({lang:"online"}): locale.get({lang:"offline"});
	                		return cloud.util.dateFormat(new Date(this.x/1000),"yyyy-MM-dd hh:mm:ss")+"<br/>"+ this.series.name+ " : "+ value;
	                	}
//            			subfix : "%"
            		},
	                //xAxis : {title : "time"},
	                yAxis : {
	                	min : 0,
	                	max : 1,
	                    "title" : locale.get({lang:"online"})
	 //                   unit : ""
	                }
	            }
	        })
		},
		
		_renderChart:function(paramObj){
			var self = this;
			if(!!self.highcharts){
				if(self.highcharts.length == 1){
					$('#reports-online-chart').highcharts().destroy();
				}
			}
//			$(function(){
		        self.highcharts = $('#reports-online-chart').highcharts({
		            chart: {
		                type: 'line',
		                margin: [50, 50, 120, 80]
		            },
		            title: {
		                text: locale.get({lang:"online_statistics_curve"}),
		                x: -20 //center
		            },
		            subtitle: {
		                text: "",
		                x: -20
		            },
		            xAxis: {
		                categories: paramObj.catArr,
		                labels: {
		                    rotation: -45,
		                    align: 'right',
		                    style: {
		                        fontSize: '11px',
		                        fontFamily: 'Arial'
		                    }
		                }
		            },
		            yAxis: {
		                title: {
		                    text: locale.get({lang:"online_status_said"})
		                },
		                plotLines: [{
		                    value: 0,
		                    width: 1,
		                    color: '#808080'
		                }],
		                max: 1
		            },
//		            tooltip: {
//		                valueSuffix: '°C'
//		            },
		            legend: {
		                layout: 'vertical',
		                align: 'right',
		                verticalAlign: 'top',
		                x: -10,
		                y: 100,
		                borderWidth: 0
		            },
		            series: paramObj.dataArr
		        });
//		    });
		},
		
//		_events:function(){
//			var buttonArr = ["#queryBtn31","#queryBtn7","#queryBtn1"];
//			var focusStyle = {background:"#55B235",color:"#fff",border:"1px solid #55B235"};
//			var restoreDefaults = function(){
//				$.each(buttonArr,function(index,element){
//					$(element).removeAttr("style");
//				});
//			};
//			$("#queryBtn31").bind("click",function(){
//				restoreDefaults();
//				$(this).css(focusStyle);
//				$("#queryBtn31:hover").css({"color":"#fff"});
//			});
//			$("#queryBtn7").bind("click",function(){
//				restoreDefaults();
//				$(this).css(focusStyle);
//			});
//			$("#queryBtn1").bind("click",function(){
//				restoreDefaults();
//				$(this).css(focusStyle);
//			});
//		},
		
		_addButton:function(){
			var self = this;
            this.button31 = new Button({
                container: this.element.find("#online-chart-button-31"),
                id: "queryBtn31",
                text: 31+" "+locale.get({lang:"_days"}),
                stateful:true,
                events: {
                    click: function(){
                    	self.button7.removeState();
                    	self.button1.removeState();
                    	this.renderChart({round:31});
                    	},
                    scope: this
                }
            });
            this.button7 = new Button({
                container: this.element.find("#online-chart-button-7"),
                id: "queryBtn7",
                text: 7+" "+locale.get({lang:"_days"}),
                stateful:true,
                events: {
                    click: function(){
                    	self.button31.removeState();
                    	self.button1.removeState();
                    	this.renderChart({round:7});
                    	},
                    scope: this
                }
            });
            this.button1 = new Button({
                container: this.element.find("#online-chart-button-1"),
                id: "queryBtn1",
                text: 24+" "+locale.get({lang:"_hours"}),
                stateful:true,
                events: {
                    click: function(){
                    	self.button31.removeState();
                    	self.button7.removeState();
                    	this.renderChart({round:1});
                    	},
                    scope: this
                }
            });
		},
		
		destroy:function(){
			this.left.clearTableData();
			this.left.destroy();
			if (this.paging) {
				this.paging.destroy();
				this.paging=null;
			}
		}
		
	});
	
	return ContentSouth;
	
});