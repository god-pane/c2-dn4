define(function(require){
	
	require("dt/core/dt");
	//用户如果未登录，返回登录页
	if(!(dt.accessToken.get() && dt.refreshToken.get())){
		location.href = "./index.html";
	}
	
	/** TEST **/

//	$("#connect-client").click(function(){
//		
//		_dt._client.start();
//		
//	});
//	
//	$("#disconnect-client").click(function(){
//		
//		_dt._client.stop();
//		
//	});
//	
	//调试客户端通道，显示客户端通道的信息
	$("#show-client-channel").click(function(){
		//log.debug(_dt.db.client.get());
	});
	
//	$("#connect-site").click(function(){
//		_dt._site.start();
//	});
//	
//	$("#disconnect-site").click(function(){
//		_dt._site.stop();
//		
//	});
//	
	//调试现场通道，显示现场通道的信息
	$("#show-site-channel").click(function(){
		//log.debug(_dt.db.site.get());
	});


    var $clientPopup = $(".client-channel-popup");
    var $siteText = $("#site-channel-popup-text");
    var $clientText = $("#client-channel-popup-text");
    var $sitePopup = $(".site-channel-popup");
    //从storage里面获取状态，防止刷新后无状态。
    dt.popup(1,dt.storage.get("client.statusInfo"));
    dt.popup(2,dt.storage.get("site.statusInfo")||locale.get("site_disconnected"));
//    $siteText.text(dt.storage.get("site.statusInfo")||locale.get("site_disconnected"));
//    $clientText.text(dt.storage.get("client.statusInfo"));
    //绑定通道popup事件
    $("#channel-status-client-server").mouseover(function(e){
        if($clientText.text() != ""){
            $clientPopup.show()
        }
    }).mouseout(function(){
        $clientPopup.fadeOut(800)
    })
    $("#channel-status-site-server").mouseover(function(e){
        if($siteText.text()!=""){
            $sitePopup.show()
        }
    }).mouseout(function(){
        $sitePopup.fadeOut(800)
    })

	var root = window;
	
	var _page = root._page = {};
	
	//现场列表的结构
	_page.tableColumns = {
			list:[
					{
						"title": locale.get({lang: "stutas"}),
                        "dataIndex": "online",
                        "width": "10%",
                        render:function(data){
                        	//alert(locale.get({lang: "online"}));
                        	if(data == 1 ){
                        		return "<img title="+locale.get({lang: "online"})+" src='./resources/images/online.png'></img>";
                        	}else{
                        		return "<img title="+locale.get({lang: "offline"})+" src='./resources/images/offline.png'></img>";
                        	}
                        }
					},
					{
                        "title": locale.get({lang: "site_name"}),
                        "dataIndex": "name",
                        "width": "45%"
                    },
                    {
                    	"title": locale.get({lang: "install_address"}),
                    	"dataIndex": "address",
                    	"width": "45%"
                    }
                  ]
	};
	
	//头部的相关方法
	_page.headerbar = {
		//绑定事件
		initEvent: function() {
			$(".button-box").find("span")
			.eq(0).on("mouseover", function() {
				$(this).find("img").attr("src", "resources/images/4.png");
				$(this).find("label").css("color", "#0FE40F");
			}).on("mouseout", function() {
				$(this).find("img").attr("src", "resources/images/3.png");
				$(this).find("label").css("color", "white");
			});
			$(".button-box").find("span")
			.eq(1).on("mouseover", function() {
				$(this).find("img").attr("src", "resources/images/2.png");
				$(this).find("label").css("color", "#0FE40F");
			}).on("mouseout", function() {
				$(this).find("img").attr("src", "resources/images/1.png");
				$(this).find("label").css("color", "white");
			});
		},
		//更新在线现场数量
		updateOnline:function(val){
			$("#status-online").text(val);
		}
	};
	
	//尾部的相关方法
	_page.footerbar = {
			
			//初始化尾部
			render: function() {
				this.initEvent();
			},
			
			//绑定相关事件
			initEvent: function() {
				$(".channel-status-server").on("click", function() {
					_page.siteSidebar.hide();
				});
			}
	};
	
	//尾部通道展示的相关方法
	_page.footerbar.channel = {
		//更新通道状态
		update:function(channel,channelStatus){
			var _channel = "client";
			if(channel === "site"){
				_channel = "site";
			}
			idObj = {
					client:"#channel-status-client-server",
					site:"#channel-status-site-server"
			}
			switch(channelStatus){
				case -1:
				case 0:
					$(idObj[_channel]).css({background:"url(" + require.toUrl("dt/resources/images/c-disconnected.png") + ") no-repeat"});
					break;
				case 1:
					$(idObj[_channel]).css({background:"url(" + require.toUrl("dt/resources/images/c-connected.png") + ") no-repeat"});
					break;
				case 2:
					$(idObj[_channel]).css({background:"url(" + require.toUrl("dt/resources/images/c-occupied.png") + ") no-repeat"});
					break;
				case 3:
					$(idObj[_channel]).css({background:"url(" + require.toUrl("dt/resources/images/c-connecting.gif") + ") no-repeat"});
					break;
				default:
					break;
			}
		}
	};
	
	//加载list-list模块
	require( ['dt/modules/list-list'], function(list){
		_page.listbar = list;
		//渲染现场列表
		_dt.site.queryList({limit:100,cursor:0},function(data){
				_page.listbar.table.destroy();
				_page.listbar.paging.destroy();
				
				_dt.site.queryList({limit:1,online:1,verbose:1},function(_data){
					_page.headerbar.updateOnline(_data.total + "/" + data.total);
				});
				
//				_page.headerbar.updateTotal(data.total);
				_page.listbar.table.render({
					data:data["result"],
					columns:_page.tableColumns["list"]
				});
				
				_page.listbar.paging.render({
					data:data,
					current:1,
					total:data.total,
					limit:100,
					requestData:function(options,success){
						_dt.site.queryList({
							cursor:options.cursor,
							limit:options.limit
						},function(_data){
							success(_data);
						});
					},
					turn:function(data){
						_page.listbar.table.clearData();
						_page.listbar.table.loadData(data.result);
					}
				});
		},function(error){
//			dt.prompt(error);
            al.setValue(error);
		});
		
		//加载list-tag模块
		require( ['dt/modules/list-tag'], function(tag){
			_page.tagbar = tag;
			_page.tagbar.render();
			
			//加载list-site模块
			require( ['dt/modules/list-site'], function(site){
				_page.siteSidebar = site;
				
				//加载list-channel模块
				require( ['dt/modules/list-channel'], function(channel){
					_page.channelSidebar = channel;
					_page.channelSidebar.show();
					
					
					//模块加载完成后的初始化
					var render= function(){
						
						//绑定事件，点击左下角客户端通道时，加载右边通道页
						$("#channel-status-client-server").click(function(){
							_page.siteSidebar.isShow = false;
							_page.channelSidebar.show();
						}).attr("title", locale.get({lang: "check_the_channel_state"}));
						
						//绑定事件，点击左下角现场通道时，加载右边现场详情页
						$("#channel-status-site-server").click(function(){
							var siteId = dt.storage.get("site.clientId");
							if(siteId) {
								dt.ajax({
									url: "/api/sites/overview",
									type: "POST",
									param : {
					                    verbose : 100,
					                    cursor: 0,
										limit: 0
					                },
					                data: {
					                	resourceIds: [siteId]
					                },
					                success : function(data) {
					                	if(!data.error) {
					                		_page.siteSidebar.show(data.result[0]);
					                	}
					                },
					                error:function(error){
					                	if(error.error_code == 20006){
					                		site.siteInfo.id = null;
					                		var r = confirm(locale.get({lang: "site_delete_info"}));
											if (r == true){
												_dt._site.stop(function(flag) {
													if(flag) {
//														dt.prompt(locale.get({lang: "disconnect_successful"}));
                                                        al.setValue("disconnect_successful");
													}
													else {
//														dt.prompt(locale.get({lang: "disconnect_failure"}));
                                                        al.setValue("disconnect_failure");
													}
												});
						                		$("#channel-status-client-server").trigger("click");
											}
					                	}
					                }
								});
							}
						}).attr("title", locale.get({lang: "check_the_vpn_connect_state"}));
						
						//绑定事件，点击左下角现场名时，加载右边现场详情页
						$("#currrent-site-name").css("cursor", "pointer").click(function() {
							var siteId = dt.storage.get("site.clientId");
							if(siteId) {
								dt.ajax({
									url: "/api/sites/overview",
									type: "POST",
									param : {
					                    verbose : 100,
					                    cursor: 0,
										limit: 0
					                },
					                data: {
					                	resourceIds: [siteId]
					                },
					                success : function(data) {
					                	if(!data.error) {
					                		_page.siteSidebar.show(data.result[0]);
					                	}
					                },
					                error:function(error){
					                	if(error.error_code == 20006){
					                		site.siteInfo.id = null;
					                		var r = confirm(locale.get({lang: "site_delete_info"}));
											if (r == true){
												_dt._site.stop(function(flag) {
													if(flag) {
//														dt.prompt(locale.get({lang: "disconnect_successful"}));
                                                        al.setValue("disconnect_successful");
													}
													else {
//														dt.prompt(locale.get({lang: "disconnect_failure"}));
                                                        al.setValue("disconnect_successful");
													}
												});
						                		$("#channel-status-client-server").trigger("click");
											}
					                	}
					                }
								});
							}
						});
						
						$("#search-box").on("keypress", function(e) {
							var evt = e || window.event;
							if(evt.keyCode == 13) {
								$("#tag-bar-container").children().css("background-image", "url(resources/images/backline.jpg)").eq(0).css("background-image", "url(resources/images/whiteline.jpg)");
								
								//$("#tag-bar-container").children().eq(0).trigger("click");
								var param = $("#search-box").val();
								_page.listbar.search.render(param);
								window.event.cancelBubble = true;//停止冒泡
								window.event.returnValue = false;//阻止事件的默认行为
							}
						});
						
						//绑定事件，点击搜索按钮，刷新现场列表
						$("#search-submit").click(function(){
							$("#tag-bar-container").children().css("background-image", "url(resources/images/backline.jpg)").eq(0).css("background-image", "url(resources/images/whiteline.jpg)");
							
							//$("#tag-bar-container").children().eq(0).trigger("click");
							var param = $("#search-box").val();
							_page.listbar.search.render(param);
						});
						
						//当客户端更新虚拟串口时，客户端调用这个方法
						root.UpdateVComList = function(data){
//							var list = eval(data);
//							if(list.length > 0) {
//								alert("info:"+data);
//							}
						};
						
						//当客户端关闭时，客户端调用这个方法
						root.CloseClient = function(){
							_dt.exit();
						};
						
						//当客户端进行连接，更新连接状态时，客户端调用这个方法
						root.UpdateVPNStatus = function(status,vip){
							if(status == 1){
								if(!dt.storage.get("client.localStartTime")){
									var date = new Date();
									time = date.getTime();
									dt.storage.set("client.localStartTime",time);
								}
//								dt.prompt("client_connected");
                                dt.popup(1,"client_connected");
								_page.footerbar.channel.update("client",1);
							}
						};
						
						//当客户端更新网路状态时，客户端调用这个方法
						root.UpdateNetStatus = function(a,b,c,d){

						};
						
						//判断客户端状态，更新左下角客户端通道状态
						_dt._client.status(function(_status){
							_page.footerbar.channel.update("client",_status);
						});
						
						//判断现场连接状态，更新左下角现场通道状态
						_dt._site.status(function(_status){
							_page.footerbar.channel.update("site",_status);
						});
						dt.ajax({
							url: "/api2/users/this",
							type: "GET",
							param: {
								verbose: 100
							},
							success: function(data) {
								if(data.result) {
									$("#user-name").text(data.result.name+"["+dt.storage.get("username")+"]");
								}
								else {
									$("#user-name").text(dt.storage.get("username"));
								}
							}
						});
						//设置用户名
						//$("#user-name").text(dt.storage.get("username"));
						
						//点击网页图表跳转到网页
//						$("#skip-web").click(function(){
//							 window.open("http://c2.inhandnetworks.com/");
//						})
						
						//点击注销，注销dt页并跳转到首页
						$("#logout-dt").click(function(){
							 var r = confirm(locale.get({lang: "confirm_the_cancellation_of_the_client"}));
							  if (r == true){
								 _dt.logout();
							  }
						})
						
						locale.render();
						
						
					};
					
					
					render();
					
					
					//客户端自动连接一次
					//初始化重新连接机制
					var _render = function(){
						
						//如果startClient这个参数不存在于本地数据库，设置为0
						if(!dt.storage.get("startClient") && dt.storage.get("startClient") !== false){
							dt.storage.set("startClient",false);
						}
						
						//如果startClient=0，如果客户端未连接，进行连接客户端
						if(!dt.storage.get("startClient")){
							_dt._client.status(function(_status){
								if(_status == -1 || _status == 0){
									_dt._client.start();
								}
							});
							dt.storage.set("startClient",true);
						}
						
						$autoReconnection = $("#auto-reconnection");
						
						//如果autoReconnection这个参数不存在于本地数据库，设置为1
						if(!dt.storage.get("autoReconnection") && dt.storage.get("autoReconnection") !== false){
							dt.storage.set("autoReconnection",true);
						}
						
						//如果autoReconnection=0 或者autoReconnection=1，设置重新连接勾选状态 
						if(dt.storage.get("autoReconnection") === false){
							$autoReconnection.removeAttr("checked");
						}else if(dt.storage.get("autoReconnection") === true){
							$autoReconnection.attr("checked","checked");
						}
						
						//绑定事件，重新连接复选框改变状态
						$autoReconnection.unbind("click").bind("click",function(){
							if($autoReconnection.attr("checked") == "checked"){
								dt.storage.set("autoReconnection",true);
							}else{
								dt.storage.set("autoReconnection",false);
							}
						});
						
					}
					
					
					_render();
					

					//线程机制，模拟长连接
					root.dtThread = function(){
						
						//如果现场通道已连接
						if(dt.storage.get("site.channelId")){
							//如果ipList（网口列表）与portList（串口列表）不存在于本地数据库，请求这两个参数
							if(!dt.storage.get("site.ipList") || !dt.storage.get("site.portList")){
								_dt.machine.queryList(dt.storage.get("site.clientId"),function(_data){
										var ipList;
										var portList;
										if(!_data["ipList"]){
											ipList = "[]";
										}else{
											ipList = _data["ipList"];
										}
										if(!_data["portList"]){
											portList = "[]";
										}else{
											portList = _data["portList"];
										}
										dt.storage.set("site.ipList",ipList);
										dt.storage.set("site.portList",portList);
                                        //log.debug("ipList:"+ipList);
                                        //log.debug("portList:"+portList);
								},function(error){
									
								});
							}
							//如果vip（虚拟串口），ipList（网口列表），portList（串口列表），active（通道活跃状态）都存在，而connected（连接状态）为false的情况下，客户端连接现场
                            //log.debug("clientStartStatus"+dt.storage.get("site.clientStartStatus"));
                            //log.debug("vip"+dt.storage.get("site.vip"));
                            //log.debug("ipList"+dt.storage.get("site.ipList"));
                            //log.debug("portList"+dt.storage.get("site.portList"));
                            //log.debug("active"+dt.storage.get("site.active"));

							if(!dt.storage.get("site.clientStartStatus") && dt.storage.get("site.vip") && dt.storage.get("site.ipList") && dt.storage.get("site.portList") && dt.storage.get("site.active")){
								dt.vpn.site.start(dt.storage.get("site.clientId"),dt.storage.get("site.channelId"),dt.storage.get("site.ipList"),dt.storage.get("site.vip"),dt.storage.get("site.portList"));
							    //log.debug("site.start portList:"+dt.storage.get("site.portList"));
                            }
//							//log.debug(_dt._site.info());
							//如果vip（虚拟串口），startTime（通道开始时间），localStartTime（通道开始本地时间）不存在的情况下，请求前两个参数
							_dt.channel.get(dt.storage.get("site.channelId"),function(data){
									if(!dt.storage.get("site.vip") && data["result"]["vip"]){
										dt.storage.set("site.vip",data["result"]["vip"]);
									}
									if(!dt.storage.get("site.startTime") && data["result"]["startTime"]){
										dt.storage.set("site.startTime",data["result"]["startTime"]);
										var date = new Date();
										dt.storage.set("site.localStartTime",date.getTime());
									}
									if(dt.storage.get("site.startTime") && !dt.storage.get("site.localStartTime")){
										var date = new Date();
										dt.storage.set("site.localStartTime",date.getTime());
									}
									if(!data["result"]["active"]){
										_dt.db.site.remove();
									}else{
										_dt.db.site.set(data["result"]);
										if(!data["result"]["connected"]){
											//设备超时300秒，如果连接不上自动断开
											var date = new Date();
											var currentTime = date.getTime();
											var localNoConnectionStartTime = dt.storage.get("site.localNoConnectionStartTime");
											if((currentTime - localNoConnectionStartTime)/1000 >= 180){
												_dt._site.stop();
											}
										}else{
											dt.storage.set("site.localNoConnectionStartTime",0);
										}
									}
								
							},function(error){
								
							});
							
							//如果vip（虚拟串口）已经存在，提示现场连接成功
							if(dt.storage.get("site.vip")){
//								dt.prompt("site_connected");
                                dt.popup(2,"site_connected");
							}
						};
						
						//如果客户端通道已建立
						if(dt.storage.get("client.channelId")){
							//如果vip（虚ip），rip(实ip)，startTime（开始时间）不存在，请求获取三个参数
							if(!dt.storage.get("client.vip") || !dt.storage.get("client.rip") || !dt.storage.get("client.startTime")){
								_dt.channel.get(dt.storage.get("client.channelId"),function(data){
										var result = data["result"];
										if(result["vip"]){
											dt.storage.set("client.vip",result["vip"]);
										}
										if(result["rip"]){
											dt.storage.set("client.rip",result["rip"]);
										}
										if(result["startTime"]){
											dt.storage.set("client.startTime",result["startTime"]);
										}
								},function(error){
									
								});
							}
						};
						
						//判断客户端状态，如果自动连接选项为true且客户端连接失败，客户端自动重新连接
						_dt._client.status(function(_status){
							if(dt.storage.get("autoReconnection") === true){
								if(_status == -1 || _status == 0){
									_dt._client.start();
								}
							}
							_page.footerbar.channel.update("client",_status);
						});
						
						//判断现场通道状态，如果连接成功，添加现场名到左下角的现场图标后
						_dt._site.status(function(_status){
							_page.footerbar.channel.update("site",_status);
							if(_status == 1){
								var siteId = dt.storage.get("site.clientId");
								var flag = dt.storage.get("site_id");
								if(siteId && flag != "undefined_") {
									dt.ajax({
										url: "/api/sites/overview",
										type: "POST",
										param : {
						                    verbose : 100,
						                    cursor: 0,
											limit: 0
						                },
						                data: {
						                	resourceIds: [siteId]
						                },
						                success : function(data) {
						                	if(data.result){
						                		dt.storage.set("site_id", true);
						                		if(data.result[0].name.length > 13) {
							                		$("#currrent-site-name").text(data.result[0].name.substring(0, 4)+"...");
							                	}
							                	else {
							                		$("#currrent-site-name").text(data.result[0].name);
							                	}
						                	}
						                },
						                error: function(error) {
						                	if(error.error_code == 20006) {
						                		dt.storage.set("site_id", "undefined_");
						                	}
						                }
									});
								}
							}
							else {
								$("#currrent-site-name").html("");
							}
						});
						
						//现场状态刷新
						_page.listbar.table.refreshIcon();
						
						//耍新现场详细信息
						_page.siteSidebar.refreshData();
						
					}

					//维护通道线程
					
					root.t = setInterval("dtThread()",5000);
					
				});
			});
		});
	});
	
});