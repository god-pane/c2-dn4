/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery-ui");
	require("cloud/resources/css/jquery-ui.css");
	require("../../resources/css/online-noticebar.css");
    require("cloud/lib/plugin/jquery.datetimepicker");
	var Button = require("cloud/components/button");
	var NoticeBar = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.service = options.service;
			this.pars=null;
			this._render();
		},
		_render:function(){
			this._draw();
			this._renderSelect();
//			this._setCount();
			this._defualtChecked();
			this._addButton();
			
			
			
			/*//系统加载时执行查询
			var startTime,endTime,date;
			date = new Date($("#startTime").val());
			startTime = Math.round((date.getTime())/1000);
			date = new Date($("#endTime").val());
			endTime = Math.round((date.getTime())/1000 + 86399);
			var obj1 = {
					online:"0,1",
					start_time:0,
					end_time:Math.round((new Date().getTime())/1000)
			};
			var obj2 = {
					start_time:startTime,
					end_time:endTime
			};
			this.fire("query",obj1,obj2);*/
		},
		
		_draw:function(){
			var self = this;
			var $html = $(
				"<div class='notice-bar' style='width:1100px'>"
				+"<div class='notice-bar-state'>" 
				+"<p class='notice-bar-state-title'>" + locale.get({lang:"networking_state"}) + "</p>"
				+"<div class='notice-bar-state-online'><p><input value='online' type='checkbox' id='noticebar-online-input' class='notice-bar-state-input'/></p><p class='notice-bar-state-text'>"+locale.get({lang:"online"})//+"</p><p class='notice-bar-state-count'>(<span id='noticebar-online-count'></span>)</p></div>"
				+"<div class='notice-bar-state-offline'><p><input value='offline' type='checkbox' id='noticebar-offline-input' class='notice-bar-state-input'/></p><p class='notice-bar-state-text'>"+locale.get({lang:"offline"})//+"</p><p class='notice-bar-state-count'>(<span id='noticebar-offline-count'></span>)</p></div>"
				+"</div>"
				+"<div class='notice-bar-calendar'>"
				+"<p class='notice-bar-calendar-text'>"+locale.get({lang:"from"})+"</p>"
				+"<input style='width:125px' class='notice-bar-calendar-input datepicker' type='text' readonly='readonly' id='startTime' />"
//				+"<p class='notice-bar-calendar-icon datepicker'></p>"
				+"<p class='notice-bar-calendar-text'>"+locale.get({lang:"to"})+"</p>"
				+"<input style='width:125px' class='notice-bar-calendar-input datepicker' type='text' readonly='readonly' id='endTime' />"
//				+"<p class='notice-bar-calendar-icon datepicker'></p>"
                +"<p class='notice-bar-search-text'>"+locale.get({lang:"gateway_name+:"})+"<p>"
                +"<input class='notice-bar-search-input' type='text' placeholder='"+locale.get('empty_is_all')+"'>"
				+"<div class='notice-bar-calendar-button' id='notice-bar-calendar-button-query' style='margin-left:10px'></div>"
				+"<div class='notice-bar-calendar-button' id='notice-bar-calendar-button-export'></div>"
				+"</div>" 
				+"</div>"
			);
			this.element.append($html);

            $(".notice-bar-search-input").keypress(function(e){
                if(e.keyCode == 13){
                    self.submit();
                }
            })
		},
		
		_renderSelect:function(){
			$(function(){
//				$(".datepicker").datepicker({
//					showOn: "button",
//					buttonImage: require.toUrl("../../resources/images/calendar.gif"),
//					buttonImageOnly: true,
//					changeMonth: true,
//      				changeYear: true,
//					dateFormat:"yy/mm/dd",
//					dayNamesMin: [locale.get({lang:"sun"}),locale.get({lang:"mon"}), locale.get({lang:"tues"}), locale.get({lang:"wed"}), locale.get({lang:"thur"}), locale.get({lang:"fri"}), locale.get({lang:"sat"})],
//					monthNamesShort: [locale.get({lang:"jan"}), locale.get({lang:"feb"}),locale.get({lang:"mar"}), locale.get({lang:"apr"}), locale.get({lang:"may"}), locale.get({lang:"jun"}), locale.get({lang:"jul"}), locale.get({lang:"aug"}), locale.get({lang:"sep"}), locale.get({lang:"oct"}), locale.get({lang:"nov"}), locale.get({lang:"dec"})]
//				});
//				$("#startTime").datepicker( "setDate", "-7d");
//				$("#endTime").datepicker( "setDate", new Date());
//				$("#startTime").bind("click", function(){
//                    $("#startTime").datepicker("show");
//                });
//                $("#endTime").bind("click", function(){
//                    $("#endTime").datepicker("show");
//                });
				$("#startTime").val(cloud.util.dateFormat(new Date(((new Date()).getTime() - 1000 * 60 * 60 * 24 * 7)/1000),"yyyy/MM/dd") + " 00:00").datetimepicker({
					format:'Y/m/d H:i',
					step:1,
					startDate:'-1970/01/08',
					lang:locale.current() === 1 ? "en" : "ch"
				})
				
				$("#endTime").val(cloud.util.dateFormat(new Date((new Date()).getTime()/1000),"yyyy/MM/dd") + " 23:59").datetimepicker({
					format:'Y/m/d H:i',
					step:1,
					lang:locale.current() === 1 ? "en" : "ch"
				})
			});
		},
		
		_setCount:function(){
			this.service.getDevicesList({limit:1},function(data){
				$("#noticebar-online-count").text(data.online);
				$("#noticebar-offline-count").text(data.total - data.online);
			});
//			this.service.getDevicesList({online:0,limit:1},function(data){
//				$("#noticebar-offline-count").text(data.total);
//			});
		},
		
		submit:function(callback){
			var self = this;
			var status,startTime,endTime,date;
			var $onlineInput = $("#noticebar-online-input");
			var $offlineInput = $("#noticebar-offline-input");
			if($onlineInput.attr("checked") == "checked" && $offlineInput.attr("checked") == "checked"){
				status = undefined;
			}else if($onlineInput.attr("checked") == "checked"){
				status = "1";
			}else if($offlineInput.attr("checked") == "checked"){
				status = "0";
			}else{
				status = "2";
			}
			date = new Date($("#startTime").val());
			startTime = Math.round((date.getTime())/1000);
			date = new Date($("#endTime").val());
			endTime = Math.round((date.getTime())/1000);
            var deviceName = $(".notice-bar-search-input").val();
			if(startTime > endTime){
				dialog.render({lang:"start_date_cannot_be_greater_than_end_date"});
			}else{
				if(status == "2"){
					dialog.render({lang:"networking_state_cannot_be_empty"});
				}else{
					var obj1 = {
                            name:deviceName,
							online:status,
							start_time:0,
							end_time:Math.round((new Date().getTime())/1000)
					};
					var obj2 = {
							start_time:startTime,
							end_time:endTime
					};
					self.startTime = startTime;
					self.endTime = endTime;
					self.status = status;
					self.fire("query",obj1,obj2);
				}
			}
		},
		
		_defualtChecked:function(){
			$("#noticebar-online-input").attr("checked","checked");
			$("#noticebar-offline-input").attr("checked","checked");
		},
		
		_addButton:function(){
			this.queryButton = new Button({
                container: this.element.find("#notice-bar-calendar-button-query"),
                id: "queryBtn",
                text: locale.get({lang:"query"}),
                events: {
                    click: this.submit,
                    scope: this
                }
            });
            this.exportButton = new Button({
                container: this.element.find("#notice-bar-calendar-button-export"),
                id: "exportBtn",
                text: locale.get({lang:"export"}),
                imgCls : "cloud-icon-daochu",
                lang:"{text:export}",
                events: {
                    click: this._exportReports,
                    scope: this
                }
            });
		},
		
		_exportReports:function(){
			var reportName = "OnlineStatistics.xls";
			var language = locale._getStorageLang()==="en"? 1 : 2;
			var url;
			if(typeof this.status=="undefined"){
				url=cloud.config.FILE_SERVER_URL + "/api/reports/forms/online?limit=0&verbose=100&report_name="+reportName+"&start_time="+this.startTime+"&end_time="+this.endTime+"&language="+language + "&access_token=";
			}
			else{
				url = cloud.config.FILE_SERVER_URL + "/api/reports/forms/online?limit=0&verbose=100&report_name="+reportName+"&online="+this.status+"&start_time="+this.startTime+"&end_time="+this.endTime+"&language="+language + "&access_token=";
			}
			cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
		}
	});
	
	return NoticeBar;
	
});