/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var NoticeBar = require("./notice-bar");
	var html = require("text!./content.html");
	var Table = require("cloud/components/table");
	var Paging = require("cloud/components/paging");
//	var Paginate = require("cloud/components/paginate");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var Signal = require("./signal/signal-window");
	try {
		
	} catch (e) {
		// TODO: handle exception
	}
	
	//计算时间---将秒换算成XX小时XX分钟XX秒
	function computationTime(seconds){
		seconds *= 1;
		var strTime = "";
		if(seconds < 60){
			strTime = seconds + locale.get("seconds");
		}else if(seconds >= 60 && seconds < 3600){
			strTime += saveInteger(seconds % (60 * 60) / 60) + locale.get("minutes");
			strTime += seconds % 60 + locale.get("seconds");
		}else if(seconds > 3600 && seconds < 3600 * 24){
			strTime += saveInteger(seconds / (60 * 60)) + locale.get("hours");
			strTime += saveInteger(seconds % (60 * 60) / 60) + locale.get("minutes");
			strTime += seconds % 60 + locale.get("seconds");
		}else{
			strTime += saveInteger(seconds / (60 * 60 * 24)) + locale.get("days");
			strTime += saveInteger(seconds / (60 * 60) % 24) + locale.get("hours");
			strTime += saveInteger(seconds % (60 * 60) / 60) + locale.get("minutes");
			strTime += seconds % 60 + locale.get("seconds");
		}
		return strTime;
	}
	
	function saveInteger(data){
		data += "";
		if(data.indexOf(".") > 0){
			data = data.substring(0,data.indexOf("."));
		}
		return data;
	}
	
	
	var columns = [
					{
						"sortable": false,
					    "title": "",
					    "dataIndex": "",
					    "cls": "center",
					    "width": "5%"
					},
	               {
						"title": "现场名称",
						"lang": "text:site_name",
                        "dataIndex": "siteName",
                        "cls": "siteName",
                        "width": "15%"
                    },
                    {
						"title": "设备名称",
						"lang": "text:gateway_name",
                        "dataIndex": "deviceName",
                        "cls": "siteName",
                        "width": "10%"
                    },
					{
						"title": "最大在线时长",
						"lang": "text:the_largest_online_time",
						"dataIndex": "maxOnline",
						"cls": null,
						"width": "10%",
						render: function (data, type, row){
							return computationTime(data);
						}
					},
					{
						"title": "总计在线时长",
						"lang": "text:the_total_online_time",
						"dataIndex": "totalOnline",
						"cls": null,
						"width": "10%",
						render: function (data, type, row){
							return computationTime(data);
						}
					},
					{
						"title": "最大掉线时长",
						"lang": "text:the_biggest_drop_time",
						"dataIndex": "maxOffline",
						"cls": null,
						"width": "10%",
						render: function (data, type, row){
							return computationTime(data);
						}
					},
					{
						"title": "总计掉线时长",
						"lang": "text:a_total_drop_length",
						"dataIndex": "totalOffline",
						"cls": null,
						"width": "10%",
						render: function (data, type, row){
							return computationTime(data);
						}
					},
					{
						"title": "在线率",
						"lang": "text:online_rate",
						"dataIndex": "onlineRate",
						"cls": null,
						"width": "10%",
						render:function(data){
							return (data * 100).toFixed(2) + "%";
						}
					},
					{
                        "title": "上线次数",
                        "lang": "text:online_times",
                        "dataIndex": "login",
                        "cls": null,
                        "width": "10%"
                    },
					{
						"title": "异常掉线次数",
						"lang": "text:abnormal_dropped",
						"dataIndex": "exception",
						"cls": "",
						"width": "10%"
					},
					{
						"title": "id",
						"dataIndex": "deviceId",
						"cls": "_id hide"
//						"width": "15%"
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
					paging:{
						id:"content-paging",
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
			this._renderTable();
			this._renderNoticeBar();
			/*this.obj1 = {
					cursor:0,
					limit:this.display,
					online:"0,1",
					end_time:(new Date()).getTime(),
					start_time:(new Date()).getTime() - 86400000*7
			};
			this.obj2 = {
					end_time:(new Date()).getTime(),
					start_time: (new Date()).getTime() - 86400000*7
			};
			//this.load(this.obj1,this.obj2);*/
		},
		
		/*load:function(listObj,onlineObj){
			var self = this;
			this.service.getDevicesList(listObj,function(idArr){
				var total = idArr.total;
				if( total > self.display){
					self._renderPagin(Math.ceil(total/(self.display)));
				}else{
					if(self.paging){
						self.paging.destroy();
						self.paging=null;
					}
				}
				self.service.getOnlineInfo(onlineObj,idArr,function(data){
					self._loadData(data);
				});
			});
		},*/
		
		_loadData:function(data){
			this.content.clearTableData();
			this.content.dataTable.fnAddData(data);
//			this._idToName();
		},
		
//		_idToName:function(){
//			var self = this;
//			var id,name,$this;
//			var arr = [];
//			self.element.find(".siteName").each(function(){
//				$this = $(this);
//				arr.push($this.text());
//			});
//			arr.splice(0,1);
//			cloud.Ajax.request({
//            	url:"api/sites/list",
//                type:"POST",
//                dataType:"JSON",
//                data:{
//                	resourceIds:arr
//                },
//                success: function(data){
//                	var result = data.result;
//                	var obj = {};
//                	for(var num=0;num<result.length;num++){
//                		obj[result[num]["_id"]] = result[num]["name"];
//                	};
//                	self.element.find(".siteName").each(function(){
//        				$this = $(this);
//        				id = $this.text();
//        				if(!!obj[id]){
//        					name = obj[id];
//        				}else if(!!obj[id.toLowerCase()]){
//        					name = obj[id.toLowerCase()];
//        				}else{
//        					name = obj[id.toUpperCase()];
//        				}
//        				if(!!name){
//        					$this.text(name);
//        				}
//        			});
//                }
//            });
//		},
		
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
                    size: 35
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
			this.display = Math.ceil((height-60)/34);
        },
        
		_renderNoticeBar:function(){
			var self = this;
			var noticeBar = new NoticeBar({
				selector: "#" + this.elements.bar.id,
				service:this.service,
				events:{
					query:function(listObj, onlineObj){
						self.mask();
						self.obj1=listObj;
						self.obj1.limit = self.pageDisplay;
						self.obj1.cursor = 0;
						self.obj2=onlineObj;
						self.service.getDevicesList(self.obj1,0,self.pageDisplay,function(idArr,devicesData){
//							var total = idArr.total;
//							if( total > self.display){
//								self._renderPagin(Math.ceil(total/(self.display)));
//							}else{
//								if(self.paging){
//									self.paging.destroy();
//									self.paging=null;
//								}
//							}
//							self.obj1.limit = self.display;
							var datas = idArr.slice(0,self.pageDisplay);
							self.service.getOnlineInfo(self.obj2,datas,function(data){
								devicesData.result = data;
//								console.log("devicesData",devicesData);
								self._renderPagin(devicesData);
							});
						});
					}
				}
			});
			noticeBar.submit();
		},
		
		_renderTable:function(){
			this.content = new Table({
//				businessType:this.businessType,
				selector: this.element.find("#" + this.elements.table.id),
				columns: columns,
				datas: [],
                pageSize: 100,
                autoWidth: false,
                pageToolBar: false,
                events: {
                    onRowClick: function(data) {
                    	if(data){
                    		if(this.signal){
                    			this.signal.destroy();
                    		}
                    		this.signal = new Signal({
//                    			selector:"body",
                    			data:data
                    		});
                    	}
                    },
                    /*onRowRendered: function(tr, data, index) {
                        var self = this;
                    },*/
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
					self.service.getDevicesList(self.obj1,options.cursor, options.limit,function(idArr,devicesData){
						self.service.getOnlineInfo(self.obj2,idArr,function(returnData){
//							console.log("_renderPagin() - returnData",returnData);
							devicesData.result = returnData;
//							console.log("_renderPagin() - devicesData",devicesData);
							success(devicesData);
						});
					});
				},
				turn:function(returnData){
					self._loadData(returnData.result);
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
//			this.obj1.cursor=(page - 1) * (this.display);
//			this.service.getDevicesList(self.obj1,function(idArr){
//				self.service.getOnlineInfo(self.obj2,idArr,function(data){
//					self._loadData(data);
//					self.unmask();
//				});
//			});
//		},
		
		destroy:function(){
			if (this.paging) {
				this.paging.destroy();
				this.paging=null;
			}
			this.content.clearTableData();
			this.content.destroy();
		}
		
	});
	
	return Content;
	
});