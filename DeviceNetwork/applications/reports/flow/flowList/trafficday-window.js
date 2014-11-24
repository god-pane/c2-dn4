define(function(require){
	var cloud = require("cloud/base/cloud");
	var _Window = require("cloud/components/window");
	var Table = require("cloud/components/table");
	var Button = require("cloud/components/button");
	var service = require("./service");
	
	var unitConversion = function(opt,type){
		if(type === "display"){
			if ( typeof opt === "number"){
			 if(opt<1000){
			   	 return opt.toFixed(0)+"B";
			    }else if(opt<1000000){
			        return (opt/1024).toFixed(3)+"KB";
			    }else{
			        return (opt/1024/1024).toFixed(3)+"MB";
			    }
			}else{
			    return opt;
			}
		}else{
			return opt;
		}
	};
	var columns = [
//	{
//        "title": "序号",
//        "dataIndex": "",
//        "cls": "id",
//        "width": "20%"
//    },
    {
        "title": "日期",
		"lang":"text:date",
        "dataIndex": "date",
        "cls": "date",
        "width": "25%"
    },
	{
		"title": "日发送流量",
		"lang":"text:daily_tx",
		"dataIndex": "send",
		"cls": "send",
		"width": "25%",
		render: unitConversion
	},
	{
		"title": "日接收流量",
		"lang":"text:daily_rx",
		"dataIndex": "receive",
		"cls": "receive",
		"width": "25%",
		render: unitConversion
	},
	{
		"title": "日总流量",
		"lang":"text:daily_total",
		"dataIndex": "total",
		"cls": "total",
		"width": "25%",
		render: unitConversion
	}
    ];
	var Window = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.datas = options.datas;
			this._renderWindow();
			locale.render({element:this.element});
		},
		_renderWindow:function(){
			var data = this.datas; 
			var bo = $("body");
			var self = this;
			this.window = new _Window({
				container: "body",
//				title: data.name+" "+locale.get({lang:"detailed_monthly_report"}),
				title: locale.get({lang:"detailed_monthly_report"}) + "(" + data.name + ")",
				top: "center",
				left: "center",
				height: 652,
				width: 1002,
				mask: true,
				drag:true,
				content: "<div id='winContent'></div>",
				events: {
					"onClose": function() {
						this.window.destroy();
						cloud.util.unmask();
					},
					scope: this
				}
			});
			this.window.show();
//			$(".ui-window-title").append("<div id='exportBtn' style='float:right'></div>");
//			$("<div id='exportBtn' style='float:right'></div>").insertAfter(".ui-window-title-name");
			$("<div id='exportBtn' style='float:right;margin:5px 50px;'></div>").appendTo(".ui-window-title");
			this._renderTable();
			$("#exportBtn").find("#module-bar-exportbtn").attr("title",locale.get("export"));
//			var opt = {mon:data.month,deviceid:data.deviceId};
			service.getDayFlows(data,this.table.render,this.table);
		},
		_renderTable:function(){
			var self = this;
			new Button({
            	container : "#exportBtn",
            	id : "module-bar-exportbtn",
            	imgCls : "cloud-icon-daochu",
            	events:{
            		click:function(){
						var opt =  self.datas;
						var host = cloud.config.FILE_SERVER_URL;
						var reportName = "FlowDetail.xls";
						var language = locale._getStorageLang()==="en"? 1 : 2;
                    	var url = host + "/api/reports/forms/traffic_day?limit=0&verbose=100&report_name="+reportName+"&month="+opt.month+"&device_id="+opt.deviceId+"&language="+language + "&access_token=";
                    	cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
            		}
            	}
            });
			this.table = new Table({
//				businessType:this.businessType,
				selector: "#winContent",
				columns: columns,
				datas: [],
                pageSize: 100,
                autoWidth: false,
                pageToolBar: false,
                events: {
                    onRowClick: function(data) {
                    },
                    onRowRendered: function(tr, data, index) {
                        var self = this;
                    },
                    scope: this
                }
			});
		},
		destroy:function(){
			if(this.table){
				this.table.destroy();
			}else{
				this.table = null;
			}
			if(this.window){
				this.window.destroy();
			}else{
				this.window = null;
			}
		}
	});
	return Window;
});