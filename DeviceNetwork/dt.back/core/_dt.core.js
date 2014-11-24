define(function(require){
	
	require("dt/core/dt.core");
	
	(function(){
		
		var root = window;
		
		var _dt = root._dt = {};
		
		//通道API的相关方法
		_dt.channel = {
				
				//客户端通道的相关方法
				client:{
					
					//建立客户端通道
					start:function(_success,_error){
						dt.ajax({
							url:"/api/channel",
							type:"POST",
							data:{
								clientType:1
							},
							success:function(data){
								if(_success){
									_success(data);
								}
							},
							error:function(error){
								if(_error){
									_error(error);
								}
							}
						});
					},
					
					//断开客户端通道
					stop:function(channelId,_success,_error){
						dt.ajax({
							url:"/api/channel/" + channelId,
							type:"DELETE",
							success:function(data){
								if(_success){
									_success(data);
								}
							},
							error:function(error){
								if(_error){
									_error(error);
								}
							}
						});
					}
					
				},
				
				//现场通道的相关方法
				site:{
					
					//建立现场通道
					start:function(siteId,_success,_error){
						dt.ajax({
							url:"/api/channel",
							type:"POST",
							data:{
								clientType:2,
								siteId:siteId
							},
							success:function(data){
								if(_success){
									_success(data);
								}
							},
							error:function(error){
								if(_error){
									_error(error);
								}
							}
						});
					},
					
					//断开现场通道
					stop:function(channelId,_success,_error){
						dt.ajax({
							url:"/api/channel/" + channelId,
							type:"DELETE",
							success:function(data){
								if(_success){
									_success(data);
								}
							},
							error:function(error){
								if(_error){
									_error(error);
								}
							}
						});
					}
					
				},
				
				//获取批量现场的通道列表
				getList:function(obj,_success,_error){
					var param = {};
					if(obj.cursor){
						param.cursor = obj.cursor;
					}
					if(obj.limit){
						param.limit = obj.limit;
					}else{
						param.limit = 0;
					}
					param.verbose = 100;
					dt.ajax({
						url:"/api/channel/list",
						type:"POST",
						param:param,
						data:{
							resourceIds:obj.siteIds
						},
						success:function(data){
							if(_success){
								_success(data);
							}
						},
						error:function(error){
							if(_error){
								_error(error);
							}
						}
					});
				},
				
				//获取某条通道的信息
				get:function(channelId,_success,_error){
					dt.ajax({
						url:"/api/channel/" + channelId + "?" + Math.random(),
						type:"GET",
						success:function(data){
							if(_success){
								_success(data);
							}
						},
						error:function(error){
							if(_error){
								_error(error);
							}
						}
					});
				}
				
		}
		
		//机器API的相关方法
		_dt.machine = {
				
				//获取现场下的网口设备列表
				_queryList:function(siteId,_success,_error){
					dt.ajax({
						url:"/api/machines",
						type:"GET",
						param:{
							verbose:100,
							limit:0,
							site_id:siteId
						},
						success:function(data){
								var _machinesResult = data.result;
								dt.ajax({
									url:"/api/models",
									type:"GET",
									param:{
										verbose:100,
										limit:0,
										site_id:siteId
									},
									success:function(_data){
											var _modelsResult = _data.result;
											var _iplistArr = [];
											for(var num = 0; num < _machinesResult.length; num++){
												for(var _num = 0; _num < _modelsResult.length; _num++){
													if(_machinesResult[num]["modelId"] === _modelsResult[_num]["_id"]){
														if( _modelsResult[_num]["ioType"] == 2){
															_iplistArr.push(_machinesResult[num]);
														}
													}
												}
											}
											if(_success){
												_success(_iplistArr);
											}
									},
									error:function(error){
										if(_error){
											_error(error);
										}
									}
								});
						},
						error:function(error){
							if(_error){
								_error(error);
							}
						}
					});
				},
				
				//获取现场下的网口设备与串口设备列表
				queryList:function(siteId,_success,_error){
					dt.ajax({
						url:"/api/machines",
						type:"GET",
						param:{
							verbose:100,
							limit:0,
							site_id:siteId
						},
						success:function(data){
							
								var _machinesResult = data.result;
								dt.ajax({
									url:"/api/models",
									type:"GET",
									param:{
										verbose:100,
										limit:0,
										site_id:siteId
									},
									success:function(_data){
											var _modelsResult = _data.result;
											var _iplistArr = [];
											var _iplistStr = "";
											var _portsArr = [];
											var _portsStr = "";
											var ___port = 10001;
											for(var num = 0; num < _machinesResult.length; num++){
												for(var _num = 0; _num < _modelsResult.length; _num++){
													if(_machinesResult[num]["modelId"] === _modelsResult[_num]["_id"]){
														if(_modelsResult[_num]["ioType"] == 2){
															_iplistArr.push(_machinesResult[num]["machineConfig"]["mbIp"]);
														}else if(_modelsResult[_num]["ioType"] == 1 || _modelsResult[_num]["ioType"] == 3){
															//_portsArr.push(_machinesResult[num]["plcId"] + ":" + _machinesResult[num]["machineConfig"]["mbPort"]);
															_portsArr.push(_machinesResult[num]["_id"] + ":" + (___port++));
														}
													}
												}
											}
											
											if(_iplistArr.length === 0){
												_iplistStr = "1000";
											}else{
												_iplistStr = _iplistArr.join(",");
											}
											
											if(_portsArr.length === 0){
												_portsStr =  "1000:1000";
											}else{
												_portsStr =  _portsArr.join(",");
											}
											
											_success({
												ipList:_iplistStr,
												portList:_portsStr
											})
											
									},
									error:function(error){
										if(_error){
											_error(error);
										}
									}
								});
							
						},
						error:function(error){
							if(_error){
								_error(error);
							}
						}
					});
				}
				
		}
		
		//现场API的相关方法
		_dt.site = {
				
				//按照某个条件查询现场列表
				queryList:function(obj,_success,_error){
					var _obj = {};
					_obj.verbose = 100;
					if(obj.verbose){
						_obj.verbose = obj.verbose;
					}
					if(obj.cursor){
						_obj.cursor = obj.cursor;
					}
					if(obj.limit){
						_obj.limit = obj.limit;
					}else{
						_obj.limit = 0;
					}
					if(obj.name){
						_obj.name = obj.name;
					}
					if(obj.online){
						_obj.online = obj.online;
					}
					dt.ajax({
						url:"/api/sites",
						type:"GET",
						param:_obj,
						success:function(data){
							if(_success){
								_success(data);
							}
						},
						error:function(error){
							if(_error){
								_error(error);
							}
						}
					});
				},
				
				//获取单个现场的信息
				queryOne:function(siteId,_success,_error){
					dt.ajax({
						url:"/api/sites/" + siteId,
						type:"GET",
						param:{
							verbose:1
						},
						success:function(data){
							if(_success){
								_success(data);
							}
						},
						error:function(error){
							if(_error){
								_error(error);
							}
						}
					});
				},
				
				//通过序列号查询现场
				querySerial:function(obj,_success,_error){
					var self = this;
					var _serial = obj.serial.replace(/\s/g, "");
					if(_serial == "") {
						delete obj.serial;
						obj.name = "";
						this.queryList(obj,_success,_error);
						return ;
					}
					if(!_serial || _serial.length !== 15){
						_success({
							total:0,
							cursor:0,
							limit:0,
							result:[]
						});
						return;
					}
					dt.ajax({
						url:"/api/devices",
						type:"GET",
						param:{
							serial_number:_serial,
							cursor:0,
							limit:0,
							verbose:100
						},
						success:function(data){
							
								if(data.total == 0){
									_success({
										total:0,
										cursor:0,
										limit:0,
										result:[]
									})
								}else{
									dt.ajax({
										url:"/api/sites/" + data['result'][0]["siteId"],
										type:"GET",
										param:{
											verbose:100
										},
										success:function(_data){
											
											_success({
													total:1,
													cursor:0,
													limit:0,
													result:[_data.result]
												});
											
										},
										error:function(error){
											if(_error){
												_error(error);
											}
										}
										
									})
								}
							
						},
						error:function(error){
							if(_error){
								_error(error);
							}
						}
					})
				}
				
		};
		
		//用户API的相关方法
		_dt.user = {
				logout:function(){
					dt.ajax({
						url:"/api2/logout",
						type:"GET"
					})
				}
		};
		
		//通道信息
		_dt.db = {};
		
		//客户端通道信息的相关方法
		_dt.db.client = {
			//客户端通道信息结构
			structure:[
			           "client.account",//账户名，email
			           "client.password",//密码
			           "client.channelId",//通道id
			           "client.active",//活跃状态，true表示可用，false表示不可用
			           "client.clientId",//客户端id
			           "client.clientType",//客户端类型
			           "client.connected",//连接状态，true为已连接，false为未连接
			           "client.createTime",//通道创建时间
			           "client.rip",//实ip
			           "client.serverIp",//服务器地址
			           "client.serverPort",//服务器端口
			           "client.userId",//用户id
			           "client.vip",//虚ip
			           "client.startTime",//通道连接时间
			           "client.localStartTime"//通道连接本地时间
			           ],
			//获取客户端通道信息
			get:function(){
				var _returnObject = {};
				for(var _num = 0 ; _num < this.structure.length ; _num++){
					_returnObject[this["structure"][_num]] = dt.storage.get(this["structure"][_num]);
				}
				return _returnObject;
			},
			//设置客户端通道信息
			set:function(_result){
				dt.storage.set("client.account",_result["account"]);
				dt.storage.set("client.password",_result["passwd"]);
				dt.storage.set("client.channelId",_result["channel"]["_id"]);
				dt.storage.set("client.active",_result["channel"]["active"]);
				dt.storage.set("client.clientId",_result["channel"]["clientId"]);
				dt.storage.set("client.clientType",_result["channel"]["clientType"]);
				dt.storage.set("client.connected",_result["channel"]["connected"]);
				dt.storage.set("client.createTime",_result["channel"]["createTime"]);
				dt.storage.set("client.rip",_result["channel"]["rip"]);
				dt.storage.set("client.serverIp",_result["channel"]["server"]["ip"]);
				dt.storage.set("client.serverPort",_result["channel"]["server"]["port"]);
				dt.storage.set("client.userId",_result["channel"]["userId"]);
				dt.storage.set("client.vip",_result["channel"]["vip"]);
			},
			//清除客户端通道信息
			remove:function(param){
				if(param){
					dt.storage.remove(param);
				}else{
					if(dt.storage.get("client.channelId") || dt.storage.get("client.account")){
						for(var _num = 0 ; _num < this.structure.length ; _num++){
							dt.storage.remove(this["structure"][_num]);
						}
					}
				}
			}
		};
		
		//现场通道信息的相关方法
		_dt.db.site = {
			//现场通道信息结构
			structure:[
			           "site.channelId",//通道id
			           "site.active",//活跃状态，true表示可用，false表示不可用
			           "site.clientId",//现场id
			           "site.clientType",//
			           "site.connected",//连接状态，true为已连接，false为未连接
			           "site.createTime",//通道创建时间
			           "site.localNoConnectionStartTime",//通道无连接本地开始时间
			           "site.rip",//实ip
			           "site.serverIp",//服务器地址
			           "site.serverPort",//服务器端口
			           "site.userId",//用户id
			           "site.vip",//虚ip
			           "site.ipList",//网络列表
			           "site.portList",//串口列表
			           "site.startTime",//通道连接时间
			           "site.name",//现场名
			           "site.localStartTime",//通道连接本地时间
			           "site.clientStartStatus"//客户端连接现场状态
			           ],
			//获取现场通道信息
			get:function(){
				var _returnObject = {};
				for(var _num = 0 ; _num < this.structure.length ; _num++){
					_returnObject[this["structure"][_num]] = dt.storage.get(this["structure"][_num]);
				}
				return _returnObject;
			},
			//设置现场通道信息
			set:function(_result){
				dt.storage.set("site.channelId",_result["_id"]);
				dt.storage.set("site.active",_result["active"]);
				dt.storage.set("site.clientId",_result["clientId"]);
				dt.storage.set("site.clientType",_result["clientType"]);
				dt.storage.set("site.connected",_result["connected"]);
				dt.storage.set("site.createTime",_result["createTime"]);
				dt.storage.set("site.rip",_result["rip"]);
				dt.storage.set("site.serverIp",_result["server"]["ip"]);
				dt.storage.set("site.serverPort",_result["server"]["port"]);
				dt.storage.set("site.startTime",_result["startTime"]);
				dt.storage.set("site.userId",_result["userId"]);
				dt.storage.set("site.vip",_result["vip"]);
			},
			//清除现场通道信息
			remove:function(param){
				if(param){
					dt.storage.remove(param);
				}else{
					if(dt.storage.get("site.channelId") || dt.storage.get("site.clientId")){
						for(var _num = 0 ; _num < this.structure.length ; _num++){
							dt.storage.remove(this["structure"][_num]);
						}
					}
				}
			}
		};
		
		//客户端的相关方法
		_dt._client = {
				//获取客户端的通道信息
				info:function(){
					return _dt.db.client.get();
				},
				//获取客户端的状态
				// -1:从未连接
				// 0:连接失败
				// 1:已连接
				// 2:被占用
				// 3:正在连接
				status:function(callback){
					var _status;
					var _clientStatus = dt.vpn.client.getStatus();
					var callback = callback ? callback : function(){};
					if(_clientStatus == 0){
						_status = -1;
					}else if(_clientStatus == 1){
						_status = 1;
					}else if(_clientStatus == 2){
						_status = 2;
					}else if(_clientStatus == 101){
						_status = 3;
					}else{
						_status = 0;
					}
					callback(_status);
				},
				//启动客户端
				start:function(callback){
					var self = this;
					var callback = callback ? callback : function(){};
					this.status(function(_status){
						if(_status == -1 || _status == 0){
							if(dt.storage.get("client.channelId")){
								_dt.channel.get(dt.storage.get("client.channelId"),function(data){
										if(!data["result"]["active"]){
											_dt.db.client.remove();
											_dt.channel.client.start(function(data){
												if(data["result"]["channel"]["_id"]){
													_dt.db.client.set(data["result"]);
													dt.vpn.client.start(data["result"]["channel"]["server"]["ip"] + ":" + data["result"]["channel"]["server"]["port"],0,data["result"]["account"],data["result"]["passwd"]);
													dt.prompt("client_channel_created");
													callback(true);
												}else{
													callback(false);
												}
											},function(error){
												dt.prompt(error);
												callback(false);
											});
										}else{
											if(!data["result"]["connected"]){
												//获取客户端通道的信息结构与创建客户端通道的信息结构不同,不能使用_dt.db.client.set方法
												if(data["result"]["account"]){
													dt.vpn.client.start(dt.storage.get("client.serverIp") + ":" + dt.storage.get("client.serverPort"),0,dt.storage.get("client.account"),dt.storage.get("client.password"));
													dt.prompt("client_channel_created");
													callback(true);
												}else{
													callback(false);
												}
											}
										}
								},function(error){
									
								});
							}else{
								_dt.channel.client.start(function(data){
										if(data["result"]["channel"]["_id"]){
											_dt.db.client.remove();
											_dt.db.client.set(data["result"]);
											dt.vpn.client.start(data["result"]["channel"]["server"]["ip"] + ":" + data["result"]["channel"]["server"]["port"],0,data["result"]["account"],data["result"]["passwd"]);
											dt.prompt("client_channel_created");
											callback(true);
										}else{
											callback(false);
										}
								},function(error){
									dt.prompt(error);
									callback(false);
								});
							}
						}else{
							if(_status == 1){
								dt.prompt("client_connected");
							}else if(_status == 2){
								dt.prompt("client_channel_occupied");
							}
							callback(false);
						}
					});
				},
				//停止客户端
				stop:function(callback){
					var self = this;
					var callback = callback ? callback : function(){};
					if(dt.storage.get("client.channelId")){
						_dt.channel.client.stop(dt.storage.get("client.channelId"));
					}
					self.status(function(_status){
						if(_status == 1 || _status == 3){
							dt.vpn.client.stop();
						}
					})
					_dt._site.status(function(_status){
						if(_status == 1 || _status == 3){
							_dt.channel.site.stop(dt.storage.get("site.channelId"));
							dt.vpn.site.stop(dt.storage.get("site.clientId"));
						}
					});
					_dt.db.client.remove();
					_dt.db.site.remove();
					dt.prompt("client_disconnected");
				}
		};
		
		//现场的相关方法
		_dt._site = {
				//获取现场的通道信息
				info:function(){
					return _dt.db.site.get();
				},
				//获取现场通道的状态
				// -2:后台错误
				// -1:从未连接
				// 1:已连接
				// 2:被占用
				// 3:正在连接
				status:function(callback){
					var callback = callback ? callback : function(){};
					if(!dt.storage.get("site.channelId")){
						callback(-1);
					}else{
						_dt.channel.get(dt.storage.get("site.channelId"),function(data){
								if(data["result"]["userId"] == dt.storage.get("client.userId")){
									if(!data["result"]["active"]){
										_dt.db.site.remove();
										callback(-1);
									}else{
										if(!data["result"]["connected"]){
											callback(3);
										}else{
											callback(1);
										}
									}
								}else{
									_dt.db.site.remove();
									callback(2);
								}
						},function(error){
							dt.prompt(error);
							callback(-2);
						});
					}
				},
				//启动连接现场
				start:function(siteId,callback){
					var self = this;
					var callback = callback ? callback : function(){};
					if(!dt.storage.get("site.clientId")){
						_dt.channel.site.start(siteId,function(data){
								_dt.db.site.remove();
								_dt.db.site.set(data["result"]);
								var date = new Date();
								dt.storage.set("site.localNoConnectionStartTime",date.getTime());
								_dt.machine.queryList(data["result"]["clientId"],function(_data){
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
										dt.prompt("site_channel_created");
										callback(true);
									
								},function(error){
									dt.prompt(error);
									callback(false);
								});
						},function(error){
							dt.prompt(error);
							callback(false);
						});
					}
//					else{
//							self.stop(function(_result){
//								if(!_result){
//									callback(false);
//								}else{
//									_dt.channel.site.start(siteId,function(data){
//											_dt.db.site.remove();
//											_dt.db.site.set(data["result"]);
//											var date = new Date();
//											dt.storage.set("site.localNoConnectionStartTime",date.getTime());
//											_dt.machine.queryList(data["result"]["clientId"],function(_data){
//												var ipList;
//												var portList;
//												if(!_data["ipList"]){
//													ipList = "[]";
//												}else{
//													ipList = _data["ipList"];
//												}
//												if(!_data["portList"]){
//													portList = "[]";
//												}else{
//													portList = _data["portList"];
//												}
//												dt.storage.set("site.ipList",ipList);
//												dt.storage.set("site.portList",portList);
//												dt.prompt("site_channel_created");
//											});
//											callback(true);
//									},function(error){
//										dt.prompt(error);
//										callback(false);
//									});
//								}
//							});
//					}
				},
				//断开连接现场
				stop:function(callback){
					var self = this;
					var callback = callback ? callback : function(){};
					self.status(function(_status){
						if(_status == 1 || _status == 3){
							_dt.channel.site.stop(dt.storage.get("site.channelId"),function(data){
									dt.vpn.site.stop(dt.storage.get("site.clientId"));
									_dt.db.site.remove();
									dt.prompt("site_disconnected");
									callback(true);
							},function(error){
								dt.prompt(error);
								callback(false);
							});
						}else if(_status == -1){
							_dt.db.site.remove();
							callback(true);
						}else if(_status == 2){
							_dt.db.site.remove();
							callback(true);
						}
					});
				}
		};
		
		//注销登录dt系统
		_dt.logout = function(){
			if(root.t){
				root.clearInterval(root.t);
			}
			_dt._site.stop();
			_dt._client.stop();
			_dt.user.logout();
			dt.accessToken.remove();
			dt.refreshToken.remove();
			dt.storage.set("startClient",false);
			location.href = "./index.html";
		};
		
		//退出dt系统
		_dt.exit = function(){
			if(root.t){
				root.clearInterval(root.t);
			}
			_dt._site.stop();
			_dt._client.stop();
			_dt.user.logout();
			dt.accessToken.remove();
			dt.refreshToken.remove();
			dt.storage.set("startClient",false);
		};
		
	})(window)
	
});