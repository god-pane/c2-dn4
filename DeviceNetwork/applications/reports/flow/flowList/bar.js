define(function(require){
	var cloud = require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery-ui");
	require("cloud/resources/css/jquery-ui.css");
	require("cloud/lib/plugin/jquery.datetimepicker");
	require("cloud/resources/css/jquery.multiselect.css");
	var service = require("./service");
	var Button = require("cloud/components/button");
	var NoticeBar = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.pars=null;
			this._render();
			this.values = new Array();
			this.values[0] = "0";
			this.values[1] = "1";
			this.opt = null;
		},
		_render:function(){
			var self = this;
			this._draw();
			this._renderSelect();
//			this._queryFun();
//			$("#showMonth").live("change",function(){
//				self._queryFun();
//			});
		},
		
		_draw:function(){
			var self = this;
			var $htmls = $(
					+"<div></div>"
					  +"<div style='width:100%;float:left;margin-top:5px'>"
					  +"<div style='float:left;margin-top: 4px;'>"
					  +"<label style='float:left;margin:auto 10px auto 20px'>"+locale.get({lang:"networking_state+:"})+"</label>"
					  +"<div id='lineBtn' style='float:left'></div>"
//					  +"<input type='checkbox' style='float:left;margin:2px 6px auto 6px;' class='isOnline' checked='checked' value='1'/><p  style='float:left;'>在线&nbsp;(<span id='online'></span>)</p>"
//					  +"<input type='checkbox' style='float:left;margin:2px 6px auto 15px;' class='isOnline' value='0'/><p  style='float:left;'>离线&nbsp;(<span id='offline'></span>)</p>"
					  +"</div>"
                      +"<label style='float:left;margin:4px 10px 0 10px'>"+locale.get({lang:"_month+:"})+"</label>"
                      +"<input id='showMonth' style='width:70px;height:18px;float:left;margin:1px 20px auto auto'/>"
                      +"<label style='float:left;margin:4px 10px auto 0'>"+locale.get({lang:"gateway_name+:"})+"</label>"
                      +"<input class='bar-search-input' style='float:left;margin: 2px 0 0 0;height: 17px;width: 166px;'  placeholder='"+locale.get('empty_is_all')+"'>"
                      +"<div class='bar-button' id='bar-button-query' style='float: left;margin: 0 0 0 5px;line-height: 20px;'></div>"
					  +"<div id='module-bar-exportbtn' style='float:right;margin-right:50px;'></div>"
					  +"</div>"
			);
			this.element.append($htmls);

            $(".bar-search-input").keypress(function(e){
                if(e.keyCode == 13){
                    self._queryFun();
                }
            })
			
			$("#showMonth").val(cloud.util.dateFormat(new Date(new Date().getTime()/1000),"yyyy-MM")).datetimepicker({
				timepicker:false,
				format:'Y-m',
				onShow:function(){
					$(".xdsoft_calendar").hide();
				},
				onChangeMonth:function(a,b){
					var date = new Date(new Date(a).getTime()/1000);
					b.val(cloud.util.dateFormat(date,"yyyy-MM"));
				},
				onClose:function(a,b){
					var date = new Date(new Date(a).getTime()/1000);
					b.val(cloud.util.dateFormat(date,"yyyy-MM"));
				},
				lang:locale.current() === 1 ? "en" : "ch"
			})
			
			this.onlineBtn = new Button({
				container:"#lineBtn",
                checkbox: true,
                id: "alarm-bar-online",
                events: {
                    click: function() { 
                    	if(self.onlineBtn.isSelected() === true){
                    		self.values[1] = "1";
                    	}else{
                    		self.values[1] = "";
                    	}
//                    	self._queryFun();
                    }
                },
                text: locale.get({lang:"online"}),//"在线(0)",
                disabled: false
            });
			this.onlineBtn.setSelect(true);
			this.offlineBtn = new Button({
				container:"#lineBtn",
				checkbox: true,
				id: "alarm-bar-offline",
				cls:"isOnline",
				events: {
					click: function() { 
						if(self.offlineBtn.isSelected() == true){
							self.values[0]= "0";
                    	}else{
                    		self.values[0] = "";
                    	}
//						self._queryFun();
					}
				},
				text: locale.get({lang:"offline"}),//"离线(0)",
				disabled: false
			});
			this.offlineBtn.setSelect(true);
			$(".cloud-button-text").css("margin","-2px 2px 0px 0px");

            new Button({
                container: this.element.find("#bar-button-query"),
                id: "queryBtn",
                text: locale.get({lang:"query"}),
                events: {
                    click: this._queryFun,
                    scope: this
                }
            });

			new Button({
            	container : "#module-bar-exportbtn",
            	id : "module-bar-exportbtn",
            	imgCls : "cloud-icon-daochu",
            	text : locale.get({lang:"export"}),
            	events : {
            		click : function(){
						var opt = self.getOptions();
						var host = cloud.config.FILE_SERVER_URL;
						var reportName = "FlowReport.xls";
						var language = locale._getStorageLang()==="en"? 1 : 2;
						var url="";
            			if(opt.net===0||opt.net===1){
            				url = host + "/api/reports/forms/traffic_month?limit=0&verbose=100&report_name="+reportName+"&month="+opt.month+"&language="+language+"&online="+opt.net + "&access_token=";
            			}
            			else{
            				url=host + "/api/reports/forms/traffic_month?limit=0&verbose=100&report_name="+reportName+"&month="+opt.month+"&language="+language+"&access_token=";
            			}           
                    	
                    	cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
//            			alert("导出");
            		}
            	}
            });
//			service.getDeviceSum(function(total,on){
//				var off = total - on;
//				self.offlineBtn.setText(locale.get({lang:"offline+("})+off+")");
//				self.onlineBtn.setText(locale.get({lang:"online+("})+on+")");
//			});
		},
		
		_renderSelect:function(){
			$(function(){
				/** 初始化月份下拉列表*/
				var date = new Date();
				var year = date.getFullYear();
				var month = date.getMonth()+1;
				var oldYear = year-1;
				var oldMonth = month-12;
				var m = 12;
				var showMonthId = $("#showMonth");
				for(var i=year;i>oldYear;i--){
					year--;
					for(var j = month;j>oldMonth;j--){
						if(j <= 0){
						    if(m<10){
						        showMonthId.append("<option value='"+year+"0"+m+"'>"+year+"-0"+m+"</option>");
						    }else{
						        showMonthId.append("<option value='"+year+""+m+"'>"+year+"-"+m+"</option>");
						    }
							
							m--;
						}else{
						    if(j<10){
						        showMonthId.append("<option value='"+i+"0"+j+"'>"+i+"-0"+j+"</option>");
						    }else{
						        showMonthId.append("<option value='"+i+""+j+"'>"+i+"-"+j+"</option>");
						    }
							
						}
//						if(j <= 0){
//							showMonthId.append("<option value='"+year+""+m+"'>"+year+"年"+m+"月</option>");
//							m--;
//						}else{
//							showMonthId.append("<option value='"+i+""+j+"'>"+i+"年"+j+"月</option>");
//						}
					}
				}
				var mon = $("#showMonth").val();
//				this.opt  = {month:mon,net:'0,1'};
			});
		},
		getOptions:function(){
			var self = this;
			var v;
			if(self.values[0] == "" && self.values[1] == ""){
				v = "-1";
			}else if(self.values[0] == "0" && self.values[1] == ""){
				v = "0";
			}else if(self.values[1] == "1" && self.values[0] == ""){
				v = "1";
			}
			if(self.values[0] != "" && self.values[1] != ""){
				v = undefined;
			}
			var mon = $("#showMonth").val().replace("-","");
			var opt = {
				month:mon,
				net:v
			}
			return opt;
		},
		_queryFun:function(){
			var self = this;
			var v;
				if(self.values[0] == "" && self.values[1] == ""){
					v = "-1";
				}else if(self.values[0] == "0" && self.values[1] == ""){
					v = "0";
				}else if(self.values[1] == "1" && self.values[0] == ""){
					v = "1";
				}
				if(self.values[0] != "" && self.values[1] != ""){
					v = undefined;
				}
				
				var mon = $("#showMonth").val().replace("-","");
				
//				service.getDevicelist(v,function(data){
//					var obj = {month:mon,datas:data};
//					self.fire("query",obj);
//				});

                var name = $(".bar-search-input").val();

				var opt = {month:mon,net:v,name:name};
				this.fire("query",opt);
		}
		
	});
	
	return NoticeBar;
	
});