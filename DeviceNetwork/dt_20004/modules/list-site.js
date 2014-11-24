//右部的现场信息栏
define(function(require){
	
	require("dt/core/dt");
	
	var TableControl = require("dt/controls/table");
	
	var switchAction = function(button){//更新现场栏的按钮状态
		var $action = $("#site-sidebar-action");
		if(button === 0){
			$action.removeAttr("class").attr("class","site-sidebar-action-none");//.html("");
		}else if(button === 1){
			$action.removeAttr("class").attr("class","site-sidebar-action-connect");//.html(locale.get({lang:"connect"}));
		}else if(button === -1){
			$action.removeAttr("class").attr("class","site-sidebar-action-disconnect");//.html(locale.get({lang:"disconnect"}));
		}
	}
	if(dt.storage.get("isDiscon") == 0) {
		dt.storage.set("isDiscon", false);
	}
	var listSite = {
			selector:"#site-info-0",
			siteInfo: {
				id: null,
				name: null,
				online: null,
				signal: null,
				isDiscon: dt.storage.get("isDiscon") 
			},
			siteData: null,
			show:function(obj){//显示现场栏
				_page.channelSidebar.hide();
				this.remove();
				$(this.selector).show();
				this.remove();
				this.render(obj);
				//$("#site-sidebar-connectiontime-tile").show();
				//$("#site-sidebar-connectiontime-tile").text(locale.get({lang: "connection_time"}));
			},
			hide:function(){//隐藏现场栏
				$(this.selector).hide();
				this.remove();
			},
			refreshData: function() {//刷新现场栏信息
				var siteId = this.siteInfo.id;
				var self = this;
				_dt._client.status(function(state) {
					self.refreshPLCInfo(siteId, state);
					if(siteId) {
						_dt.channel.getList({siteIds: [siteId]}, function(data) {
							var channel = data.result;
							if(!channel) {
								return ;
							}
							if(channel.length > 0) {
								if(channel[0].active && channel[0].connected) { 
									$("#site-sidebar-connectiontime").css("width", "auto");
									$("#site-sidebar-connectiontime-tile").show();
									$("#site-sidebar-ip").text(channel[0].vip);
									if(channel[0].userId == dt.storage.get("client.userId")) { //连接成功
										//if(listSite.siteInfo.isDiscon) { //断开
										if(dt.storage.get("isDiscon")) {
											$("#site-sidebar-status-text").text(locale.get({lang: "disconnecting"}));
											return;
										}
										
										$("#site-sidebar-status").attr("src", "resources/images/connected.jpg");
										$("#site-sidebar-status-text").text(locale.get({lang: "vpn_connect_successful"}));
										
										$("#site-sidebar-connectiontime-tile").text(locale.get({lang: "connection_time"}));
											var currentTime = (new Date()).getTime();
											//var channalTime = parseInt(channel[0].startTime)*1000;
											var channalTime = parseInt(dt.storage.get("site.localStartTime"));
											var _time = currentTime - channalTime;
											_time = dt.util.timeLength(_time / 1000);
											$("#site-sidebar-connectiontime").html("&nbsp;&nbsp;"+_time);
									}
									else {   //占用
										$("#site-sidebar-connectiontime-tile").hide();
										dt.ajax({
											url: "/api2/users/"+channel[0].userId,
											type: "GET",
											param: {
												verbose: 100,
												limit: 1
											},
											success: function(data) {
												var uName = data.result.name;
												var email = data.result.email;
												var _time = dt.util.dateFormat(new Date(parseInt(channel[0].startTime)), "yyyy-MM-dd hh:mm:ss");
												//var _time = dt.util.dateFormat(new Date(dt.storage.get("site.localStartTime") * 1000), "yyyy-MM-dd hh:mm:ss");
												$("#site-sidebar-connectiontime").css({
													"width": "220px"
												}).html(uName+"["+email+"]"+locale.get({lang: "occupy_text-1"})+_time+locale.get({lang: "occupy_text-2"}));
											}
										});
										
										$("#site-sidebar-status").attr("src", "resources/images/occupation.png");
										$("#site-sidebar-status-text").text(locale.get({lang: "occupy1"}));
										
										switchAction(0); //not show
									}
								}
								else if(channel[0].active && !channel[0].connected) { //连接中
									if(channel[0].userId == dt.storage.get("client.userId")) {
										$("#site-sidebar-status").attr("src", "resources/images/wait_.gif");
										//if(listSite.siteInfo.isDiscon) { //断开
										if(dt.storage.get("isDiscon")) {
											$("#site-sidebar-status-text").text(locale.get({lang: "disconnecting"}));
										}
										else { //连接
											$("#site-sidebar-status-text").text(locale.get({lang: "connecting"}));
										}
									}else {
										$("#site-sidebar-status").attr("src", "resources/images/occupation.png");
										$("#site-sidebar-status-text").text(locale.get({lang: "occupy1"}));
									}
								}
							}
							else {
								var online = _page.siteSidebar.siteInfo.online;
								if(online == 1) {
									$("#site-sidebar-status").attr("src", "resources/images/online.png");
									$("#site-sidebar-status-text").text(locale.get({lang: "online"}));
									$("#site-sidebar-ip").text("");
									if(state == 1) {
										switchAction(1); //show connect
									}
									else {
										switchAction(0);
									}
								}
								else if(online == 0){
									$("#site-sidebar-status").attr("src", "resources/images/offline.png");
									$("#site-sidebar-status-text").text(locale.get({lang: "offline"}));
									$("#site-sidebar-ip").text("");
									switchAction(0);
								}
								$("#site-sidebar-connectiontime").html("---");
							}
						},function(error){
							return;
						});
					}
				});
			},
//			refreshData: function() {
//				var siteId = this.siteInfo.id;
//				var channel = _dt._site.info();
//				if(siteId == channel.clientId) {
//					if(channel.active && channel.connected) { 
//						if(channel.userId == dt.storage.get("client.userId")) { //连接成功
//							$("#site-sidebar-ip").text(channel.vip);
//							$("#site-sidebar-status").attr("src", "resources/images/online.png");
//							$("#site-sidebar-status-text").text(locale.get({lang: "online"}));
//							
//							if(dt.storage.get("site.localStartTime")) {
//								var currentTime = (new Date()).getTime();
//								var channalTime = parseInt(dt.storage.get("site.localStartTime"));
//								var _time = currentTime - channalTime;
//								_time = dt.util.timeLength(_time / 1000);
//								$("#site-sidebar-connectiontime-tile").show();
//								$("#site-sidebar-connectiontime").html("&nbsp;&nbsp;"+_time);
//							}
//						}
//						else {   //占用  
//							$("#site-sidebar-status").attr("src", "resources/images/occupation.png");
//							$("#site-sidebar-status-text").text(locale.get({lang: "occupy"}));
//						}
//					}
//					else if(channel.active && !channel.connected) { //连接中
//						if(channel.userId == dt.storage.get("client.userId")) {
//							$("#site-sidebar-status").attr("src", "resources/images/wait_.gif");
//							$("#site-sidebar-status-text").text(locale.get({lang: "connecting"}));
//						}
//						else {
//							$("#site-sidebar-status").attr("src", "resources/images/occupation.png");
//							$("#site-sidebar-status-text").text(locale.get({lang: "occupy"}));
//						}
//					}
//				}
//				else {
//					$("#site-sidebar-status").attr("src", "resources/images/offline.png");
//					$("#site-sidebar-status-text").text(locale.get({lang: "offline"}));
//					$("#site-sidebar-ip").text("");
//					
//					$("#site-sidebar-connectiontime-tile").hide();
//					$("#site-sidebar-connectiontime").text("");
//				}
//			},
			refreshPLCInfo: function(siteId, state) {//刷新plc信息
				if(state != 1 || siteId == null) {
					return ;
				}
				var self = this;
				_dt.machine._queryList(siteId,function(data){
					var deviceList = [];
					if(data.length > 0) {
						for(var _num = 0 ; _num < data.length ; _num++){
							deviceList.push({
								divceName:data[_num]["name"],
								ipaddress:data[_num]["machineConfig"]["mbIp"]
							});
						}
					}
					var ckList = dt.util.stringToArray(external.OnGetVComList());
					if(siteId == dt.storage.get("site.clientId")) {
						if(ckList.length > 0 && ckList[0][1] != 1000) {
							for(var i = 0 ; i < ckList.length ; i++) {
								deviceList.push({
									divceName: ckList[i][1],
									ipaddress: ckList[i][0]
								});
//								if(ckList[i][1] != 1000){
									dt.ajax({
										url: "/api/machines/"+ckList[i][1],
										type: "GET", 
										param: {
											verbose: 1
										},
										success: function(data) {
											var machine = data.result;
											for(var i = 0 ; i < deviceList.length ; i++) {
												if(deviceList[i].divceName == machine._id) {
													deviceList[i].divceName = machine.name;
													break ;
												}
											}
											if(!self.table.instance){
												self.table.render(deviceList);
											}else{
												self.table.loadData(deviceList);
											}
										}
									});
//								}
//								else {
//									if(!self.table.instance){
//										self.table.render(deviceList);
//									}else{
//										self.table.loadData(deviceList);
//									}
//								}
							}
						}
						else {
							deviceList.push({
								divceName: "",
								ipaddress: "com4"
							});
							if(!self.table.instance){
								self.table.render(deviceList);
							}else{
								self.table.loadData(deviceList);
							}
						}
					}
					else {
						var online = _page.siteSidebar.siteInfo.online;
						if(online == 1) {
							deviceList.push({
								divceName: "",
								ipaddress: "com4"
							});
							if(!self.table.instance){
								self.table.render(deviceList);
							}else{
								self.table.loadData(deviceList);
							}
						}
						else {
							self.table.loadData([]);
						}
					}
				},
				function(error){
					
				});
			},
			render:function(obj){//初始化现场栏相关的数据
				var self = this;
				var siteId = obj._id;
				var siteName = obj.name;
				var online = obj.online;
				var status,action;
				this.siteInfo.id = obj._id;
				this.siteInfo.name = obj.name;
				this.siteInfo.online = obj.online;
				
				if(!online){
					status = -1;
					action = 0;
				}else{
					if(!dt.storage.get("site.clientId")){
						_dt.channel.getList({siteIds:[siteId]},function(data){
							
							if(data["result"].length == 0){
								status = 0;
								action = 1;
							}else{
								var _result = data["result"][0];
								if(!_result["active"]){
									status = 0;
									action = 1;
								}else{
									if(!_result["connected"]){
										status = 0;
										action = -1;
									}else{
										if(_result["userId"] == dt.storage.get("client.userId")){
											status = 1;
											action = -1;
											_dt.db.site.set(_result);
										}else{
											status = 2;
											action = 0;
										}
									}
								}
								if(_result["userId"] != dt.storage.get("client.userId")){
									status = 2;
									action = 0;
								}
							}
						},function(error){
							return;
						});
					}else{
						if(dt.storage.get("site.clientId") == siteId){
							_dt._site.status(function(_status){
								switch(_status){
									case -2:
										status = 0;
										action = 0;
										break;
									case -1:
										status = 0;
										action = 1;
										break;
									case 0:
										status = 0;
										action = -1;
										break;
									case 1:
										status = 1;
										action = -1;
										break;
									case 2:
										status = 2;
										action = 0;
										break;
									case 3:
										status = 3;
										action = -1;
										break;
									default:
										break;
								}
							});
						}else{
							_dt.channel.getList({siteIds:[siteId]},function(data){
								
								if(data["result"].length == 0){
									status = 0;
									action = 1;
								}else{
									var _result = data["result"][0];
									if(!_result["active"]){
										status = 0;
										action = 1;
									}else{
										if(!_result["connected"]){
											status = 0;
											action = -1;
										}else{
											status = 2;
											action = 0;
										}
									}
									if(_result["userId"] != dt.storage.get("client.userId")){
										status = 2;
										action = 0;
									}
								}
							},function(error){
								return;
							});
						}
					}
				}
				
				_dt.machine._queryList(siteId,function(data){//获取机器列表
					
					var arr = [];
					for(var _num = 0 ; _num < data.length ; _num++){
						if(data[_num]["name"] != 1000) {
							arr.push({
								divceName:data[_num]["name"],
								ipaddress:data[_num]["machineConfig"]["mbIp"]
							})
						}
					}
					
					var setObj = {};
					setObj.online = online;
					if(siteName.length > 13) {
						setObj.name = siteName.substring(0, 13)+"...";
					}
					else {
						setObj.name = siteName;
					}
					
					setObj.siteId = siteId;
					setObj.status = status;
					setObj.action = action;
					if(arr.length != 0){
						setObj.deviceList = arr;
					}
					if(status === 0){
						if(action === 0){
							
						}else if(action === -1){
							setObj.ip = dt.storage.get("site.vip");
							setObj.connectionTime = dt.storage.get("site.startTime");
						}else if(action === 1){
							
						}
					}else if(status === 1){
						setObj.ip = dt.storage.get("site.vip");
						setObj.connectionTime = dt.storage.get("site.startTime");
					}else if(status === 2){
						
					}else if(status === 3){
						setObj.ip = dt.storage.get("site.vip");
						setObj.connectionTime = dt.storage.get("site.startTime");
					}
					
					_dt._client.status(function(__status){
						if(__status != 1){
							setObj.status = 0;
							setObj.action = 0;
						}
					});
					self.set(setObj);
					
				},
				function(error){
					return;
				});
			},
			
			remove:function(){//重置现场栏信息
				var self = this;
				$("#site-sidebar-sitename").text("");
				$("#site-sidebar-signal").hide();
				//$("#site-sidebar-signal").attr("src", "");
				$("#site-sidebar-ip").text("");
				$("#site-sidebar-status").css("background-image", "url(resources/images/DT_20.png)");
				$("#site-sidebar-status-text").text("");
				$("#site-sidebar-connectiontime-tile").hide();
				switchAction(0);
				$("site-sidebar-connectiontime").text("");
				if(self.table.instance){
					self.table.clearData();
				}
			},
			setSignal: function(number) {//设置信号的显示信息
				var signalIcon = (parseInt(number) / 31) * 100
				var $signal = $("#site-sidebar-signal").show();
				if(signalIcon >= 0 && signalIcon < 20) { //1
					$signal.attr("src", "resources/images/DT_28.jpg");
				}
				else if(signalIcon >= 20 && signalIcon < 40) { //2
					$signal.attr("src", "resources/images/DT_39.jpg");
				}
				else if(signalIcon >= 40 && signalIcon < 60) { //3
					$signal.attr("src", "resources/images/DT_22.jpg");
				}
				else if(signalIcon >= 60 && signalIcon < 80) { //4
					$signal.attr("src", "resources/images/DT_36.jpg");
				}
				else {   //5
					$signal.attr("src", "resources/images/DT_32.jpg");
				}
			},
			
			set:function(obj){//设置现场的相关显示信息
				$("#site-sidebar-connectiontime").css("width", "auto");
				var self = this;
				if(obj.name){
					$("#site-sidebar-sitename").text(obj.name);
				}
				dt.ajax({
					url: "/api/devices",
					type: "GET",
					param: {
						site_id: obj.siteId,
						verbose: 100
					},
					success: function(data) {
						var records = data.result;
						if(records.length > 0) {
							if(obj.online == 1) {
								var signal = records[0].info.rssi;
								self.siteInfo.signal = signal;
								//var $signal = $("#site-sidebar-signal").text("信号值:"+signal);
								self.setSignal(signal);
							}
							
						}
					}
				});
				
				if(obj.ip){
					$("#site-sidebar-ip").text(obj.ip);
				}
				$("#site-sidebar-connectiontime-tile").show();
				if(obj.status == 1 && dt.storage.get("site.localStartTime")) {
					//$("#site-sidebar-connectiontime-tile").show();
					var currentTime = (new Date()).getTime();
					var channalTime = parseInt(dt.storage.get("site.localStartTime"));
					var _time = currentTime - channalTime;
					_time = dt.util.timeLength(_time / 1000);
					
					$("#site-sidebar-connectiontime").html("&nbsp;&nbsp;"+_time);
				}else{
					//$("#site-sidebar-connectiontime-tile").hide();
					$("#site-sidebar-connectiontime-tile").show();
					$("#site-sidebar-connectiontime").text(" ---");
				}
				
				//判断现场链接状态
				//alert(obj.status);
				if(typeof parseInt(obj.status) == "number"){
					var $status = $("#site-sidebar-status");
					var $text = $("#site-sidebar-status-text");
					switch(obj.status){
						case 0:
							if(obj.online == 1) {
								$status.attr("src", "resources/images/online.png");
								$text.text(locale.get({lang: "online"}));
							}
							else if(obj.online == 0){
								$status.attr("src", "resources/images/offline.png");
								$text.text(locale.get({lang: "offline"}));
							}
							break;
						case -1:
							if(obj.online == 1) {
								$status.attr("src", "resources/images/online.png");
								$text.text(locale.get({lang: "online"}));
							}
							else if(obj.online == 0){
								$status.attr("src", "resources/images/offline.png");
								$text.text(locale.get({lang: "offline"}));
							}
							break;
						case 1:
							$status.attr("src", "resources/images/connected.jpg");
							$text.text(locale.get({lang: "vpn_connect_successful"}));
							break;
						case 2:
							$status.attr("src", "resources/images/DT_27.png");
							$text.text(locale.get({lang: "occupy1"}));
							break;
						case 3:
							$status.attr("src", "resources/images/wait_.gif");
							$text.text(locale.get({lang: "connecting"}));
							break;
						default:
							break;
					}
				}
				
				$(".site-sidebar-action-disconnect").die('click').live("click",function(){
					$("#site-sidebar-status-text").text(locale.get({lang: "disconnecting"}));
					$("#site-sidebar-status").attr("src", "resources/images/wait_.gif");
					listSite.siteInfo.isDiscon = true;
					dt.storage.set("isDiscon", true);
					_dt._site.stop(function(_result){
						if(!_result){
							//dt.unmask("body");
						}else{
							switchAction(1);
							//dt.unmask("body");
						}
						//listSite.siteInfo.isDiscon = false;
					});
					
				});
				
				$(".site-sidebar-action-connect").die('click').live("click",function(){
					_dt._site.status(function(state) {
						if(state == 1 || state == 3) {
							var r = confirm(locale.get({lang: "prompt_site_connect_info"}));
							if (r == true){
								$("#channel-status-site-server").trigger("click");
							}
						}else {
							$("#site-sidebar-status-text").text(locale.get({lang: "connecting"}));
							$("#site-sidebar-status").attr("src", "resources/images/wait_.gif");
							listSite.siteInfo.isDiscon = false;
							dt.storage.set("isDiscon", false);
							 _dt._site.start(obj.siteId,function(_result){
								if(!_result){
									dt.unmask("#site-info-0");
								}else{
									switchAction(-1);
									dt.unmask("#site-info-0");
								}
							});
						}
					});
				});
				
				if(obj.action == -1 || obj.action == 0 || obj.action == 1){
					var $action = $("#site-sidebar-action");
					switch(obj.action){
						case 1:
							switchAction(1);
							break;
						case 0:
							switchAction(0);
							break;
						case -1:
							switchAction(-1);
							break;
						default:
							break;
					}
				}
				
				if(obj.connectionTime){
				//	$("#site-sidebar-connectiontime").text(obj.connectionTime);
				}
				
//				//加入窜口列表
//				if(!$.isArray(obj.deviceList)) {
//					obj.deviceList = [];
//				}
//				var ckList = eval(external.OnGetVComList());
//				for(var i = 0 ; i < ckList.length ; i++) {
//					obj.deviceList.push({
//						divceName: ckList[i][0],
//						ipaddress: ckList[i][3]
//					});
//				}
//				if(obj.deviceList){
//					if(!self.table.instance){
//						self.table.render(obj.deviceList);
//					}else{
//						self.table.loadData(obj.deviceList);
//					}
//				}
				
				//加入窜口列表
				if(!$.isArray(obj.deviceList)) {
					obj.deviceList = [];
				}
				var ckList = dt.util.stringToArray(dt.vpn.site.getComList());
				if(obj.siteId == dt.storage.get("site.clientId")) {
					if(ckList.length > 0 && ckList[0][1] != 1000) {
						for(var i = 0 ; i < ckList.length ; i++) {
							obj.deviceList.push({
								divceName: ckList[i][1],
								ipaddress: ckList[i][0]
							});
							dt.ajax({
								url: "/api/machines/"+ckList[i][1],
								type: "GET", 
								param: {
									verbose: 1
								},
								success: function(data) {
									var machine = data.result;
									for(var i = 0 ; i < obj.deviceList.length ; i++) {
										if(obj.deviceList[i].divceName == machine._id) {
											obj.deviceList[i].divceName = machine.name;
											break ;
										}
									}
									if(!self.table.instance){
										self.table.render(obj.deviceList);
									}else{
										self.table.loadData(obj.deviceList);
									}
								}
							});
						}
					}
//					else {
//						if(!self.table.instance){
//							self.table.render(obj.deviceList);
//						}else{
//							self.table.loadData(obj.deviceList);
//						}
//					}
				}
				else {
					if(!self.table.instance){
						self.table.render(obj.deviceList);
					}else{
						self.table.loadData(obj.deviceList);
					}
				}
			},
			table: {//现场列表
				selector:".detaile-info-bar-table",
				render:function(data){//初始化现场列表
					var _obj = {
						selector: this.selector,
						data:data,
						checkbox: false,
						mark: locale.get({lang:"no_data"}),
						events: {
							onRowClick: null
						},
						columns: [{
							"title": locale.get({lang: "devices_name"}),
	                        "dataIndex": "divceName",
	                        "width": "50%"
						},{
							"title": locale.get({lang: "ip_address"}),
	                        "dataIndex": "ipaddress",
	                        "width": "50%"
						}]
					};
					
					this.instance = new TableControl(_obj);
				},
				
				loadData:function(obj){//载入数据
					this.clearData();
					this.instance.loadData(obj);
				},
				
				clearData:function(){//清除数据
					if(this.instance) {
						this.instance.clearData();
					}
				},
				
				destroy:function(){//销毁列表
					$(this.selector).empty();
					this.instance = null;
				},
				
				mask:function(){//模态列表
					dt.mask(this.selector);
				},
				
				unmask:function(){//取消模态
					dt.unmask(this.selector);
				}
			}
	};
	
	return listSite;
	
});

