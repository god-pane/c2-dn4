/**
 * @author PANJC
 *
 */
define(function(require){
    var cloud = require("cloud/base/cloud");
    var NoticeBar = require("./notice-bar");
    var html = require("text!./content.html");
    var Table = require("cloud/components/table");
    var layout = require("cloud/lib/plugin/jquery.layout");
    var Button = require("cloud/components/button");
//	var Paginate = require("cloud/components/paginate");
	var Paging = require("cloud/components/paging");
    var Content = Class.create(cloud.Component, {
        initialize: function($super, options){
            this.moduleName = "content";
            $super(options);
            this.service = options.service;
            this.businessType = options.businessType;
            this.elements = {
                bar: {
                    id: "content-bar",
                    "class": null
                },
                table: {
                    id: "content-table",
                    "class": null
                },
				paging: {
                    id: "content-paging",
                    "class": null
                }
            };
			this.display = null;
			this.pageDisplay = 30;
            this._render();
        },
        _render: function(){
            this.destroy();
            this._renderHtml();
            this._renderLayout();
            this._renderTable();
            this._renderNoticeBar();
        },
        _renderHtml: function(){
            this.element.html(html);
        },
        _renderLayout: function(){
            //							if (this.businessType == "alarmreprot") {
            //								this.layout = this.element.layout({
            //									defaults : {
            //										paneClass : "pane",
            //										togglerLength_open : 50,
            //										togglerClass : "cloud-layout-toggler",
            //										resizerClass : "cloud-layout-resizer",
            //										spacing_open : 1,
            //										spacing_closed : 1,
            //										togglerLength_closed : 50,
            //										resizable : false,
            //										slidable : false,
            //										closable : false
            //									},
            //									north : {
            //										paneSelector : "#"
            //												+ this.elements.bar.id,
            //										size : "50"
            //									},
            //									center : {
            //										paneSelector : "#"
            //												+ this.elements.table.id,
            //									}
            //								});
            //							} else {
//            console.log(this.element);
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
                    paneSelector: "#" +
                    this.elements.bar.id,
                    size: "33"
                },
                center: {
                    paneSelector: "#" +
                    this.elements.table.id
                },
				south:{
					paneSelector: "#" + this.elements.paging.id,
					size: 38
				}
            });
			var height = this.element.find("#" + this.elements.table.id).height();
			this.display = Math.ceil((height-60)/34);
            //							}
        },
        _renderNoticeBar: function(){
            var self = this;
            this.noticeBar = new NoticeBar({
                selector: "#" + this.elements.bar.id,
                service: this.service,
                businessType: this.businessType,
                events: {
                    query: function(opt){
						self.mask();
						self.opt = opt;
                        switch (self.businessType) {
                            case 'sitereprot':
                                self.options.service.getSitelist(self.opt,0,self.pageDisplay, function(datas){
									self.unmask();
//									//var data = datas.slice(0,self.display);
//									self.content.render(datas);
//									if( datas.total > self.display ){
										self._renderPagin(datas);
//									}else{
//										if(self.paging){
//											self.paging.destroy();
//											self.paging=null;
//										}
//									}
								});
                                break;
                            case "devicereprot":
                                self.options.service.getDevicelist(self.opt,0,self.pageDisplay,function(datas){
									self.unmask();
//									var data = datas.slice(0,self.display);
//									self.content.render(data);
//									if( datas.length > self.display ){
										self._renderPagin(datas);
//									}else{
//										if(self.paging){
//											self.paging.destroy();
//											self.paging=null;
//										}
//									}
								});
                                break;
                            case "alarmreprot":
                                self.options.service.getAlarmlist(self.opt, self.content.render, self.content);
                                break;
                            default:
                        }
                    },
                    exReport: function(){
						var opt = self.opt;
						var language = locale._getStorageLang()==="en"? 1 : 2;
                    	var host = cloud.config.FILE_SERVER_URL;
                        switch (self.businessType) {
                            case 'sitereprot':
                    			var reportName = "SiteSummary.xls";
                    			var url="";
                    			if(opt.net===0||opt.net===1){
                    				url = host + "/api/reports/forms/sites?limit=0&verbose=100&report_name="+reportName+"&business_state="+opt.arr+"&online="+opt.net+"&start_time="+opt.startTime+"&end_time="+opt.endTime+"&language="+language + "&access_token=";
                    			}
                    			else{
                    				url=host + "/api/reports/forms/sites?limit=0&verbose=100&report_name="+reportName+"&business_state="+opt.arr+"&start_time="+opt.startTime+"&end_time="+opt.endTime+"&language="+language + "&access_token=";
                    			}
                    			cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
                                break;
                            case "devicereprot":
                            	var reportName = "GatewaySummary.xls";
                    			var url="";
                    			if(opt.net===0||opt.net===1){
                    				url = host + "/api/reports/forms/devices?limit=0&verbose=100&report_name="+reportName+"&business_state="+opt.arr+"&online="+opt.net+"&start_time="+opt.startTime+"&end_time="+opt.endTime+"&language="+language + "&access_token=";
                    			}
                    			else{
                    				url=host + "/api/reports/forms/devices?limit=0&verbose=100&report_name="+reportName+"&business_state="+opt.arr+"&start_time="+opt.startTime+"&end_time="+opt.endTime+"&language="+language + "&access_token=";
                    			}                    			 
                    			cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
                                break;
                            case "alarmreprot":
                                self.options.service.expDevicelist();
                                break;
                            default:
                        }
                    }
                
                }
            });
        },
        // get columns by businesstype
        _getColumns: function(businessType){
            var dateConvertor = function(time, type){
                if ("display" == type) {
                    var time = time;
                    return cloud.util.dateFormat(new Date(time), "yyyy-MM-dd hh:mm:ss");
                }
                else {
                    return time;
                }
            };
            var businessStatus = function(data, type){
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
                }
                else {
                    return data;
                }
            }
            
            var columns;
            switch (businessType) {
                case 'sitereprot':
                    columns = [/*{
                        "title": "",
                        "dataIndex": "",
                        "cls": "first",
                        "width": "2%",
                    },*/ {
                        "title": "现场名称",
                        "lang": "text:site_name",
                        "dataIndex": "name",
                        "cls": null,
                        "width": "18%"
                    }, /*{
                        "title": "标签",
                        "lang": "text:tag",
                        "dataIndex": "tags",
                        "cls": null,
                        "width": "10%"
                    },*/ {
                        "title": "安装地址",
                        "lang": "text:address2",
                        "dataIndex": "address",
                        "cls": null,
                        "width": "12%"
                    }, {
                        "title": "所属客户",
                        "lang": "text:customer",
                        "dataIndex": "customerName",
                        "cls": null,
                        "width": "12%"
                    }, {
                        "title": "业务状态",
                        "lang": "text:business_state",
                        "dataIndex": "businessState",
                        "cls": null,
                        "width": "8%",
                        render: businessStatus
                    },{
                        "title": "位置",
                        "lang": "text:coord",
                        "dataIndex": "location",
                        "cls": null,
                        "width": "13%",
                        render:function(location,type){
                        	if(type == "display"){
                        		return cloud.util.LatitudeLongitudeConversion(location.longitude) + "E," + cloud.util.LatitudeLongitudeConversion(location.latitude) + "N";
                        	}
                        }
                    },{
                        "title": "联系人",
                        "lang": "text:contact",
                        "dataIndex": "contact.name",
                        "cls": null,
                        "width": "7%"
                    }, {
                        "title": "电话",
                        "lang": "text:phone",
                        "dataIndex": "contact.phone",
                        "cls": null,
                        "width": "9%"
                    }, {
                        "title": "邮件地址",
                        "lang": "text:email",
                        "dataIndex": "contact.email",
                        "cls": null,
                        "width": "10%"
                    }, {
                        "title": "创建时间",
                        "lang": "text:create_time",
                        "dataIndex": "createTime",
                        "cls": null,
                        "width": "11%",
                        render: dateConvertor
                    }, {
                        "title": "Id",
                        "dataIndex": "_id",
                        "cls": "_id" + " " + "hide"
                    }]
                    break;
                case 'devicereprot':
                    columns = [/*{
                        "title": "",
                        "dataIndex": "",
                        "cls": "first",
                        "width": "2%",
                    },*/{
                        "title": "设备名称",
                        "lang": "text:gateway_name",
                        "dataIndex": "name",
                        "cls": null,
                        "width": "10%"
                    }, /*{
                        "title": "标签",
                        "lang": "text:tag",
                        "dataIndex": "tags",
                        "cls": null,
                        "width": "11%"
                    },*/ {
                        "title": "序列号",
                        "lang": "text:serial_number2",
                        "dataIndex": "serialNumber",
                        "cls": null,
                        "width": "10%"
                    },{
                    	"title":"手机号",
                    	"lang":"{text:mobile_number}",
                    	"dataIndex":"mobileNumber",
                    	"width":"10%"
                    },
                    {
                    	"title":"IP地址",
                    	"lang":"{text:ip_address}",
                    	"dataIndex":"pubIp",
                    	"width":"10%"
                    },
                    {
                        "title": "机型",
                        "lang": "text:model",
                        "dataIndex": "model",
                        "cls": null,
                        "width": "10%"
                    }, {
                        "title": "所属现场",
                        "lang": "text:site_name",
                        "dataIndex": "siteName",
                        "cls": null,
                        "width": "18%"
                    }, {
                        "title": "所属客户",
                        "lang": "text:customer",
                        "dataIndex": "customerName",
                        "cls": null,
                        "width": "10%"
                    }, {
                        "title": "业务状态",
                        "lang": "text:business_state",
						"dataIndex": "businessState",
                        "cls": null,
                        "width": "10%",
                        render: businessStatus
                    }, 
//                    {
//                        "title": "安装地址",
//                        "lang": "text:address2",
//						"dataIndex": "address",
//                        "cls": null,
//                        "width": "10%"
//                    },
                    {
                        "title": "创建时间",
                        "lang": "text:create_time",
                        "dataIndex": "createTime",
                        "cls": null,
                        "width": "15%",
                        render: dateConvertor
                    }, {
                        "title": "Id",
                        "dataIndex": "_id",
                        "cls": "_id" + " " + "hide"
                    }]
                    break;
                case 'alarmreprot':
                    columns = [{
                        "title": "",
                        "dataIndex": "",
                        "cls": "first",
                        "width": "2%"
                    },{
                        "title": "现场名称",
                        "lang": "text:site_name",
                        "dataIndex": "",
                        "cls": null,
                        "width": "13%"
                    }, {
                        "title": "现场模板",
                        "lang": "text:create_time",
                        "dataIndex": "",
                        "cls": null,
                        "width": "15%"
                    }, {
                        "title": "安装地址",
                        "lang": "text:address",
                        "dataIndex": "",
                        "cls": null,
                        "width": "10%"
                    }, {
                        "title": "所属客户",
                        "lang": "text:customer",
                        "dataIndex": "",
                        "cls": null,
                        "width": "10%"
                    }, {
                        "title": "业务状态",
                        "lang": "text:business_state",
                        "dataIndex": "",
                        "cls": null,
                        "width": "10%",
                        render: businessStatus
                    }, {
                        "title": "位置",
                        "lang": "text:location",
                        "dataIndex": "",
                        "cls": null,
                        "width": "10%"
                    }, {
                        "title": "Id",
                        "dataIndex": "_id",
                        "cls": "_id" + " " + "hide"
                    }]
                    break;
                default:
                    
            }
            return columns;
        },
        
        _renderTable: function(){
            var col = this._getColumns(this.businessType);
            this.content = new Table({
                // businessType:this.businessType,
                selector: this.element.find("#" + this.elements.table.id),
                columns: col,
				sorting : [[9, "desc"]],
                datas: [],
                pageSize: 100,
                autoWidth: false,
                pageToolBar: false,
                checkbox:"none",
                events: {
                    onRowRendered: function(tr, data, index){
                        var self = this;
                        if (data.checkbox) {
                            return;
                        }
                    },
                    scope: this
                }
            });
            
            this.setDataTable();
        },
        
        destroy: function(){
            if (this.layout) {
                if (this.layout.destroy) {
                    this.layout.destroy();
                }
                else {
                    this.layout = null;
                }
            }
            
            if (this.content) {
                if (this.content.clearTableData) {
                    this.content.clearTableData();
                }
                if (this.content.destroy) {
                    this.content.destroy();
                }
                else {
                    this.content = null;
                }
            }
            
            if (this.noticeBar) {
                this.noticeBar.destroy();
            }
			if (this.paging) {
				this.paging.destroy();
			}
        },
        
        reload: function(businessType){
            this.destroy();
            this.content = null;
            
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
				limit:this.pageDisplay,
				requestData:function(options,success){
					switch (self.businessType) {
					 	case 'sitereprot':
					 		self.options.service.getSitelist(self.opt, options.cursor, options.limit, function(returnData){
					 			success(returnData);
					 		}, self);
							break;
						case 'devicereprot':
							self.options.service.getDevicelist(self.opt, options.cursor, options.limit, function(returnData){
								success(returnData);
							}, self);
							break;		
					}	
				},
				turn:function(returnData){
					var obj = returnData.result;
					obj.total = returnData.total;
					self.content.render(obj);
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
//			this.mask();
//			 switch (this.businessType) {
//			 	case 'sitereprot':
//			 		this.options.service.getSitelist(this.opt, (page - 1) * (this.display), this.display, function(data){
//			 			this.totalCount = data.length;
//			 			this.content.clearTableData();
//			 			this.content.render(data);
//			 			this.unmask();
//			 		}, this);
//					break;
//				case 'devicereprot':
//					this.options.service.getDevicelist(this.opt, (page - 1) * (this.display), this.display, function(data){
//				 			this.totalCount = data.length;
//				 			this.content.clearTableData();
//				 			this.content.render(data);
//				 			this.unmask();
//				 		}, this);
//					break;		
//			 }	
//		},
        
        setDataTable: function(){
			var date = new Date();
			var today = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()
			var end = parseInt(date.getTime()/1000);
			var start =parseInt(new Date(today).getTime()/1000 - 86400*7);
            switch (this.businessType) {
                case 'sitereprot':
                    this.opt = {
                        arr: [0, 1, 2, 3],
//                        net: [0, 1],
                        startTime: start,
                        endTime: end
                    };
                    this.options.service.getSitelist(this.opt,0,this.pageDisplay,function(data){
//						this.content.render(data);
//						var total = data.total;
//						if( total > this.display){
							this._renderPagin(data);
//						}
					}, this);
                    break;
                case 'devicereprot':
                    this.opt = {
                        arr: [0, 1, 2 ,3],
//                        net: [0, 1],
                        startTime:start,
                        endTime: end
                    };
                    this.options.service.getDevicelist(this.opt,0,this.pageDisplay,function(data){
//						this.content.render(data);
//						var total = data.total
//						if(total>this.display){
							this._renderPagin(data);
//						}
					},this);
                    break;
                case 'alarmreprot':
                    this.opt = {
                        level: [0, 1, 2, 3, 4, 5],
                        state: [0, 1, -1],
                        startTime: start,
                        endTime: end
                    };
                    this.options.service.getAlarmlist(this.opt, this.content.render, this.content);
                    break;
            }
            
        }
        
    });
    
    return Content;
    
});
