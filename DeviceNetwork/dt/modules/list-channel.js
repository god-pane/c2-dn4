define(function(require){
	
	require("dt/core/dt");
	
	var TableControl = require("dt/controls/table");

    var flag = location.host;
	
	var listChannel = {
			selector:"#channel-info-0",
			thread:"",
			show:function(callback){
				var self = this;
				_page.siteSidebar.hide();
				$(this.selector).show();
				thread = function(){
					_dt._client.status(function(_status){
						if(_status == 1){
							self.client.set({
								ip:dt.storage.get("client.vip"),
								time:dt.storage.get("client.localStartTime")/1000,
								status:_status
							});
						}
					});
					if(dt.storage.get("client.serverIp")) {
						self.server.set({
							ipList:[{ipName:dt.storage.get("client.serverIp")}],
							accessPoint:dt.storage.get("accessPoint")
						});
					}
					_dt._site.status(function(_status){
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
				                		self.site.set({
											ip:dt.storage.get("site.vip"),
											name: data.result[0].name,
											signal:_page.siteSidebar.siteInfo.signal,
											status:_status
										});
				                	}
				                },
				                error: function(error) {
				                	if(error.error_code == 20006) {
				                		dt.storage.set("site_id", "undefined_");
				                	}
				                }
							});
						}
						
					});
				};
				thread();
				self.thread = setInterval("thread()",5000);
			},
			hide:function(){
				var self = this;
				$(this.selector).hide();
				this.client.remove();
				this.server.remove();
				this.site.remove();
				if(self.thread){
					clearInterval(self.thread);
				}
			},
			client:{
				set:function(obj){
					if(obj.ip){
						$("#ip-value").text(obj.ip);
					}
					if(obj.time){
						var currentTime = (new Date()).getTime();
						var channalTime = parseInt(obj.time)*1000;
						var _time = currentTime - channalTime;
						_time = dt.util.timeLength(_time / 1000);
						//var _time = dt.util.dateFormat(new Date(parseInt(obj.time)), "yyyy-MM-dd hh:mm:ss");
						$("#this-value").text(_time);
					}
					if(obj.status){
						var status = obj.status;
						$id = $("#ibcl-client-cloud");
						if(status == -1 || status == 0) {
							$id.css("background-image", "url(resources/images/DT_20.png)");
						}else if(status == 1) {
							$id.css("background-image", "url(resources/images/DT_14.png)");
						}else if(status == 2) {
							$id.css("background-image", "url(resources/images/DT_27.png)");
						}else if(status == 3) {
							$id.css("background-image", "url(resources/images/wait_.gif)");
						}
					}
				},
				remove:function(){
					$("#ip-value").text("");
					$("#this-value").text("");
					$("#ibcl-client-cloud").css("background-image", "url(resources/images/DT_20.png)");
				}
			},
			server:{
				set:function(obj){
					if(obj.accessPoint){
						$("#info-bar-title-2").text(CONFIG["accessPoint"][obj.accessPoint]);
					}
					if(obj.ipList){
						if(obj.ipList){
                            if(flag == "jsjinxin.f3322.org"){
                                obj.ipList.each(function(one){
                                    if(one.ipName=="c2.inhandnetworks.com"){
                                        one.ipName ="";
                                    }
                                });
                            }
                        }
						if(!this.table.instance){
							this.table.render(obj.ipList);
						}else{
							this.table.loadData(obj.ipList);
						}
					}
				},
				remove:function(){
					$("#info-bar-title-2").text("");
					if(!this.table.instance){
						this.table.render([{ipName:""}]);
					}else{
						this.table.loadData([{ipName:""}]);
					}
				},
				table:{
					instance:null,
					selector:"#info-bar-content-right-cloud-table",
					render:function(ipList){
						var _obj = {
							selector: this.selector,
//							data: [{
//								ipName:""
//							}],
							data:ipList,
							checkbox: false,
							mark: locale.get({lang: "no_data"}),
							events: {
								onRowClick: function(obj) {
									//alert(obj.ipName);
								}
							},
							columns: [{
								"title": locale.get({lang: "ip_address"}),
		                        "dataIndex": "ipName",
		                        "width": "100%"
							}]
						};
						this.instance = new TableControl(_obj);
					},
					loadData:function(obj){
						this.clearData();
						this.instance.loadData(obj);
					},
					clearData:function(){
						this.instance.clearData();
					},
					destroy:function(){
						$(this.selector).empty();
						this.instance = null;
					},
					mask:function(){
						dt.mask(this.selector);
					},
					unmask:function(){
						dt.unmask(this.selector);
					}
				}
			},
			site:{
				set:function(obj){
					var $site = $("#info-bar-content-right-sitetext");
					if(obj.name){
						if(obj.name.length > 13) {
							$("#infobar-site-name").text(obj.name.substring(0, 13)+"...");
						}
						else {
							$("#infobar-site-name").text(obj.name);
						}
					}
					if(obj.signal){
						switch(obj.signal){
							case 0:
								$site.find("img").attr("src", "");
								break;
							case 1:
								$site.find("img").attr("src", "resources/images/DT_28.png");
								break;
							case 2:
								$site.find("img").attr("src", "resources/images/DT_39.png");
								break;
							case 3:
								$site.find("img").attr("src", "resources/images/DT_22.png");
								break;
							case 4:
								$site.find("img").attr("src", "resources/images/DT_36.png");
								break;
							case 5:
								$site.find("img").attr("src", "resources/images/DT_32.png");
								break;
							default:
								break;
						}
					}
					//alert(obj.ip);
					if(obj.ip){
						$("#infobar-site-ip").text(obj.ip);
					}
					if(obj.status){
						var $id = $("#ibcl-cloud-site");
						var status = obj.status;
						if(status == -1 || status == 0) {
							$id.css("background-image", "url(resources/images/DT_20.png)");
						}else if(status == 1) {
							$id.css("background-image", "url(resources/images/DT_14.png)");
						}else if(status == 2) {
							$id.css("background-image", "url(resources/images/DT_27.png)");
						}else if(status == 3) {
							$id.css("background-image", "url(resources/images/wait_.gif)");
						}
					}
				},
				remove:function(){
					$("#infobar-site-name").text("");
					$("#info-bar-content-right-sitetext").find("img").attr("src", "");
					$("#infobar-site-ip").text("");
					$("#ibcl-cloud-site").css("background-image", "url(resources/images/DT_20.png)");
				}
			
			}
		};
	
	return listChannel;
	
});



