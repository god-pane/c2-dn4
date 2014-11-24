define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery-ui");
	require("./resources/css/content.css");
	var html = require("text!./content.html");
	var Table = require("cloud/components/_table");
	var Button = require("cloud/components/button");
	var Content = Class.create(cloud.Component,{
		initialize:function($super,options){
			var self = this;
			permission.judge(["_group","read"],function(){
				self._id = options._id;
				self.options = options;
				if(!$.isPlainObject(self.options.events)){
					self.options.events = {};
				}
				self.elements = {
						user:"group-own-user",
						userTitle:"group-own-user-title",
						userTable:"group-own-user-table",
						_user:"group-notown-user",
						_userTitle:"group-notown-user-title",
						_userTable:"group-notown-user-table",
						res:"own-group-res",
						resTitle:"own-group-res-title",
						resTable:"own-group-res-table",
						_res:"notown-group-res",
						_resTitle:"notown-group-res-title",
						_resTable:"notown-group-res-table",
						buttons:"group-buttons",
				}
				self.resourceType = {
						user:2,
						gateway:5,
						site:14
				}
				self._render();
				self.permission();
			});
			
		},
		
		_render:function(){
			this._renderHtml();
			this._renderUser();
			this._renderResources();
			this._renderButtons();
			this._event();
			if(this._id === "ungrouped"){
				$("#" + this.elements._resTitle).removeAttr("lang").text(locale.get({lang:"no_grouping_device_site+:"}));
				$("#" + this.elements.userTitle).hide();
				$("#" + this.elements.userTable).hide();
				$("#" + this.elements._userTitle).hide();
				$("#" + this.elements._userTable).hide();
				$("#group-user-move").hide();
				$("#own-group-res").hide();
				$("#" + this.elements.resTitle).hide();
				$("#" + this.elements.resTable).hide();
				$("#group-gateway-move").hide();
				$("#group-site-move").hide();
				$("#tabs-notown-gateway").die("click");
				$("#tabs-notown-site").die("click");
				$("#" + this.elements._res).append("<div id='linshianniu' style='margin-top:10px;height:30px'></div>");
				new Button({
		                text: locale.get({lang:"new_group"}),
		                container: "#linshianniu",
		                events: {
		                    click: function(){
		                    	$("#tag-group-add").trigger("click");
		                    },
		                    scope: this
		                }
		        });
			}
			locale.render(this.element);
		},
		
		_renderHtml:function(){
			$("#"+this.options.id).html(html);
		},
		
		_renderUser:function(){
			var self = this;
			if(self._id !== "ungrouped"){
				self._renderOwnUser();
				self._renderNotownUser();
			}
		},
		
		_beforeLoadEvent:function(){
			var self = this;
			if(self.options.events.beforeLoad){
				self.options.events.beforeLoad();
			}
		},
		
		_afterLoadEvent:function(){
			var self = this;
			if(self.options.events.afterLoad){
				self.options.events.afterLoad();
			}
		},
		
		permission:function(){
			var self = this;
			if(!(permission.app("_group"))["write"]){
				$("#group-user-move").empty();
				$("#group-gateway-move").empty();
				$("#group-site-move").empty();
			}
		},
		
		_renderOwnUser:function(){
			var self = this;
			this.userTable = new Table({
				selector:"#"+this.elements.userTable,
				limit:100,
				checkbox:false,
				count:false,
				mask:true,
				page:false,
				columns:[
				 {
				     "title": locale.get("username"),
				     "field": "name",
				     "width": "10%"
				 },
				 {
				     "title": locale.get("role"),
				     "field": "roleName",
				     "width": "40%",
				     process:function(_data){
				    	 var text = "";
				    	 if(_data === "admin"){
				    		 text = locale.get("organization_manager");
				    	 }else if(_data === "DeviceManager"){
				    		 text = locale.get("device_manager");
				    	 }else if(_data === "DeviceSense"){
				    		 text = locale.get("device_sense");
				    	 }else{
				    		 text = _data;
				    	 }
				    	 return text;
				     }
				 }
				 ],
				 request:function(cursor,limit,callback){
						Model.group({
							method:"query_group_resources",
							part:self._id,
							param:{
								type:self.resourceType.user,
								verbose:100,
								cursor:0,
								limit:0
							},
							success:function(data){
								var odata = data;
								Model.user({
									method:"query_list_post",
									param:{
										verbose:100,
										limit:0
									},
									data:{
										resourceIds:cloud.util.objectArrayToArray(odata.result,"_id")
									},
									success:function(data){
										var result = data.result;
										var arr = [];
										for(var num = 0 ; num < result.length ; num++){
											if(result[num]["roleName"].toLowerCase() !== "admin" ){
												arr.push(result[num]);
											}
										}
										odata.result = arr;
										odata.total = arr.length;
										callback(odata);
									}
								})
							}
						});
				},
				events:{
					change:function(selectedData){
						var length = selectedData.length;
						var $updateUser = $("#group-update-user");
							$updateUser.show();
							$updateUser.find("input").attr("checked","checked");
					}
				}
			});
		},
		
		_renderNotownUser:function(){
			var self = this;
			this._userTable = new Table({
				selector:"#"+this.elements._userTable,
				limit:100,
				checkbox:false,
				count:false,
				mask:true,
				page:false,
				columns:[
				 {
				     "title": locale.get("username"),
				     "field": "name",
				     "width": "10%"
				 },
				 {
				     "title": locale.get("role"),
				     "field": "roleName",
				     "width": "40%",
				     process:function(_data){
				    	 var text = "";
				    	 if(_data === "admin"){
				    		 text = locale.get("organization_manager");
				    	 }else if(_data === "DeviceManager"){
				    		 text = locale.get("device_manager");
				    	 }else if(_data === "DeviceSense"){
				    		 text = locale.get("device_sense");
				    	 }else{
				    		 text = _data;
				    	 }
				    	 return text;
				     }
				 }
				 ],
				 request:function(cursor,limit,callback){
					 
					 Model.user({
						 method:"query_list",
						 param:{
							verbose:100,
							cursor:0,
							limit:0
						 },
						 success:function(data){
							 if(self._id === "ungrouped"){
								 callback(data);
							 }else{
								 var udata = data.result;
								 var newData = {
										 result:[],
										 cursor:0,
										 limit:0,
										 total:0
								 };
								 
								 Model.group({
									 method:"query_group_resources",
									 part:self._id,
									 param:{
										 type:self.resourceType.user,
										 verbose:100,
										 cursor:0,
										 limit:0
									 },
									 success:function(data){
										 var result = data.result;
										 for(var num = 0 ; num < udata.length;num++){
											 var count = 0;
											 for(var _num = 0; _num < result.length;_num++){
												 if(udata[num]["_id"] === result[_num]["_id"]){
													 count++;
												 }
											 }
											 if(count === 0){
												 newData.result.push(udata[num]);
											 }
										 }
											var arr = [];
											var result = newData.result;
											for(var num = 0 ; num < result.length ; num++){
												if(result[num]["roleName"].toLowerCase() !== "admin" ){
													arr.push(result[num]);
												}
											}
										 newData.result = arr;
										 newData.total = newData.result.length;
										 callback(newData);
									 }
								 });
							 }
							 
						 }
					 });
					 
				},
				events:{
					change:function(selectedData){
						var length = selectedData.length;
						var $updateUser = $("#group-update-user");
							$updateUser.show();
							$updateUser.find("input").attr("checked","checked");
					}
				}
			});
		},
		
		_renderOwnGateways:function(){
			var self = this;
			this.gatewayTable = new Table({
				selector:"#own-tabs-1",
				limit:30,
				checkbox:false,
				count:false,
				mask:true,
				columns:[
						 {
						     "title": locale.get("name1"),
						     "field": "name",
						     "width": "15%"
						 },
						 {
						     "title": locale.get("model"),
						     "field": "model",
						     "width": "40%"
						 }
				],
				request:function(cursor,limit,callback){
					Model.group({
						method:"query_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.gateway,
							verbose:100,
							cursor:cursor,
							limit:limit
						},
						success:function(data){
							Model.device({
								method:"post_query_list",
								param:{
									verbose:2,
									limit:0
								},
								data:{
									resourceIds:data.result.pluck('_id')
								},
								success:function(_data){
									data.result = _data.result;
									callback(data);
								}
							})
						}
					});
				},
				events:{
					change:function(selectedData){
						var length = selectedData.length;
						var $deleteGateway = $("#group-delete-gateway");
						if(length === 0){
							$deleteGateway.hide();
							$deleteGateway.find("input").removeAttr("checked");
						}else{
							$deleteGateway.show();
							$deleteGateway.find("input").attr("checked","checked");
						}
					}
				}
			});
		},
		
		_renderOwnSites:function(){
			var self = this;
			this.siteTable = new Table({
				selector:"#own-tabs-2",
				limit:30,
				checkbox:false,
				count:false,
				mask:true,
				columns:[
						 {
						     "title": locale.get("site_name"),
						     "field": "name",
						     "width": "15%"
						 }
				],
				request:function(cursor,limit,callback){
					Model.group({
						method:"query_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.site,
							verbose:100,
							cursor:cursor,
							limit:limit
						},
						success:function(data){
							callback(data);
						}
					});
				},
				events:{
					change:function(selectedData){
						var length = selectedData.length;
						var $deleteSite = $("#group-delete-site");
						if(length === 0){
							$deleteSite.hide();
							$deleteSite.find("input").removeAttr("checked");
						}else{
							$deleteSite.show();
							$deleteSite.find("input").attr("checked","checked");
						}
					}
				}
			});
		},
		
		_renderNotownGateways:function(){
			var self = this;
			this._gatewayTable = new Table({
				selector:"#notown-tabs-1",
				limit:30,
				checkbox:false,
				count:false,
				mask:true,
				columns:[
						  {
						     "title": locale.get("name1"),
						     "field": "name",
						     "width": "15%"
						 },
						 {
						     "title": locale.get("model"),
						     "field": "model",
						     "width": "40%"
						 }
				],
				request:function(cursor,limit,callback){
					Model.group({
						method:"query_nogroup_resources",
						param:{
							type:self.resourceType.gateway,
							verbose:100,
							cursor:cursor,
							limit:limit
						},
						success:function(data){
							Model.device({
								method:"post_query_list",
								param:{
									verbose:2,
									limit:0
								},
								data:{
									resourceIds:data.result.pluck('_id')
								},
								success:function(_data){
									data.result = _data.result;
									callback(data);
								}
							})
						}
					});
				},
				events:{
					change:function(selectedData){
						var length = selectedData.length;
						var $addGateway = $("#group-add-gateway");
						if(length === 0){
							$addGateway.hide();
							$addGateway.find("input").removeAttr("checked");
						}else{
							$addGateway.show();
							$addGateway.find("input").attr("checked","checked");
						}
					}
				}
			});
		},
		
		_renderNotownSites:function(){
			var self = this;
			this._siteTable = new Table({
				selector:"#notown-tabs-2",
				limit:30,
				checkbox:false,
				count:false,
				mask:true,
				columns:[
						 {
						     "title": locale.get("site_name"),
						     "field": "name",
						     "width": "15%"
						 }
				],
				request:function(cursor,limit,callback){
					Model.group({
						method:"query_nogroup_resources",
						param:{
							type:self.resourceType.site,
							verbose:100,
							cursor:cursor,
							limit:limit
						},
						success:function(data){
							callback(data);
						}
					});
				},
				events:{
					change:function(selectedData){
						var length = selectedData.length;
						var $addsite = $("#group-add-site");
						if(length === 0){
							$addsite.hide();
							$addsite.find("input").removeAttr("checked");
						}else{
							$addsite.show();
							$addsite.find("input").attr("checked","checked");
						}
					}
				}
			});
		},
		
		_renderResources:function(){
			var self = this;
			$("#own-tabs").tabs();
			$("#notown-tabs").tabs();
			if(self._id !== "ungrouped"){
				this._renderOwnGateways();
			}
			if(self._id !== "ungrouped"){
				this._renderOwnSites();
			}
			this._renderNotownGateways();
			this._renderNotownSites();
		},
		
		_renderOptions:function(){
			
		},
		
		_renderButtons:function(){
			var self = this;
			var saveBtn = new Button({
                container: $("#"+this.elements.buttons),
                id:"buttons-save",
                text:"保存",
                lang:"{text:save,title:save}",
                events: {
					click: function(){}
                }
            });
			
			var cancelBtn = new Button({
                container: $("#"+this.elements.buttons),
                id:"buttons-cancel",
                text:"取消",
                lang:"{text:cancel,title:cancel}",
                events: {
					click: function(){}
                }
            });
			
		},
		
		_event:function(){
			var self = this;
			function showGatewayButtons(){
				$("#group-gateway-move").show();
				$("#group-site-move").hide();
			}
			function showSiteButtons(){
				$("#group-site-move").show();
				$("#group-gateway-move").hide();
			}
			$("#tabs-own-gateway").live("click",function(){
				$("#notown-tabs").tabs({active:0});
				showGatewayButtons();
			});
			$("#tabs-own-site").live("click",function(){
				$("#notown-tabs").tabs({active:1});
				showSiteButtons();
			});
			$("#tabs-notown-gateway").live("click",function(){
				$("#own-tabs").tabs({active:0});
				showGatewayButtons();
			});
			$("#tabs-notown-site").live("click",function(){
				$("#own-tabs").tabs({active:1});
				showSiteButtons();
			});
			
			var $userMove = $("#group-user-move");
			$userMove.find(".group-move-remove-one").bind("click",function(){
				var current = self.userTable.getCurrent();
				if(!current){
					dialog.render({lang:"select_least_one"});
				}else{
					Model.group({
						method:"cancel_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.user,
							verbose:100
						},
						data:{
							resourceIds:[current["_id"]]
						},
						success:function(data){
							self.userTable.refreshForNoPage();
							self._userTable.refreshForNoPage();
							dialog.render({lang:"remove_success"});
						}
					});
				}
			});
			$userMove.find(".group-move-remove-whole").bind("click",function(){
				var currentPage = self.userTable.getCurrentPage();
				if(currentPage.length === 0){
					dialog.render({lang:"page_is_empty"});
				}else{
					Model.group({
						method:"cancel_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.user,
							verbose:100
						},
						data:{
							resourceIds:cloud.util.objectArrayToArray(currentPage,"_id")
						},
						success:function(data){
							self.userTable.refreshForNoPage();
							self._userTable.refreshForNoPage();
							dialog.render({lang:"remove_success"});
						}
					});
				}
			});
			$userMove.find(".group-move-add-one").bind("click",function(){
				var current = self._userTable.getCurrent();
				if(!current){
					dialog.render({lang:"select_least_one"});
				}else{
					Model.group({
						method:"assign_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.user,
							verbose:100
						},
						data:{
							resourceIds:[current["_id"]]
						},
						success:function(data){
							self.userTable.refreshForNoPage();
							self._userTable.refreshForNoPage();
							dialog.render({lang:"add_success"});
						}
					});
				}
			});
			$userMove.find(".group-move-add-whole").bind("click",function(){
				var currentPage = self._userTable.getCurrentPage();
				if(currentPage.length === 0){
					dialog.render({lang:"page_is_empty"});
				}else{
					Model.group({
						method:"assign_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.user,
							verbose:100
						},
						data:{
							resourceIds:cloud.util.objectArrayToArray(currentPage,"_id")
						},
						success:function(data){
							self.userTable.refreshForNoPage();
							self._userTable.refreshForNoPage();
							dialog.render({lang:"add_success"});
						}
					});
				}
			});
			
			
			var $gatewayMove = $("#group-gateway-move");
			$gatewayMove.find(".group-move-remove-one").bind("click",function(){
				var current = self.gatewayTable.getCurrent();
				if(!current){
					dialog.render({lang:"select_least_one"});
				}else{
					Model.group({
						method:"cancel_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.gateway,
							verbose:100
						},
						data:{
							resourceIds:[current["_id"]]
						},
						success:function(data){
							self.gatewayTable.refresh();
							self._gatewayTable.refresh();
							dialog.render({lang:"remove_success"});
						}
					});
				}
			});
			$gatewayMove.find(".group-move-remove-whole").bind("click",function(){
				var currentPage = self.gatewayTable.getCurrentPage();
				if(currentPage.length === 0){
					dialog.render({lang:"page_is_empty"});
				}else{
					Model.group({
						method:"cancel_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.gateway,
							verbose:100
						},
						data:{
							resourceIds:cloud.util.objectArrayToArray(currentPage,"_id")
						},
						success:function(data){
							self.gatewayTable.refresh();
							self._gatewayTable.refresh();
							dialog.render({lang:"remove_success"});
						}
					});
				}
			});
			$gatewayMove.find(".group-move-add-one").bind("click",function(){
				var current = self._gatewayTable.getCurrent();
				if(!current){
					dialog.render({lang:"select_least_one"});
				}else{
					Model.group({
						method:"assign_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.gateway,
							verbose:100
						},
						data:{
							resourceIds:[current["_id"]]
						},
						success:function(data){
							self.gatewayTable.refresh();
							self._gatewayTable.refresh();
							dialog.render({lang:"add_success"});
						}
					});
				}
			});
			$gatewayMove.find(".group-move-add-whole").bind("click",function(){
				var currentPage = self._gatewayTable.getCurrentPage();
				if(currentPage.length === 0){
					dialog.render({lang:"page_is_empty"});
				}else{
					Model.group({
						method:"assign_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.gateway,
							verbose:100
						},
						data:{
							resourceIds:cloud.util.objectArrayToArray(currentPage,"_id")
						},
						success:function(data){
							self.gatewayTable.refresh();
							self._gatewayTable.refresh();
							dialog.render({lang:"add_success"});
						}
					});
				}
			});
			
			
			var $siteMove = $("#group-site-move");
			$siteMove.find(".group-move-remove-one").bind("click",function(){
				var current = self.siteTable.getCurrent();
				if(!current){
					dialog.render({lang:"select_least_one"});
				}else{
					Model.group({
						method:"cancel_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.site,
							verbose:100
						},
						data:{
							resourceIds:[current["_id"]]
						},
						success:function(data){
							self.siteTable.refresh();
							self._siteTable.refresh();
							dialog.render({lang:"remove_success"});
						}
					});
				}
			});
			$siteMove.find(".group-move-remove-whole").bind("click",function(){
				var currentPage = self.siteTable.getCurrentPage();
				if(currentPage.length === 0){
					dialog.render({lang:"page_is_empty"});
				}else{
					Model.group({
						method:"cancel_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.site,
							verbose:100
						},
						data:{
							resourceIds:cloud.util.objectArrayToArray(currentPage,"_id")
						},
						success:function(data){
							self.siteTable.refresh();
							self._siteTable.refresh();
							dialog.render({lang:"remove_success"});
						}
					});
				}
			});
			$siteMove.find(".group-move-add-one").bind("click",function(){
				var current = self._siteTable.getCurrent();
				if(!current){
					dialog.render({lang:"select_least_one"});
				}else{
					Model.group({
						method:"assign_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.site,
							verbose:100
						},
						data:{
							resourceIds:[current["_id"]]
						},
						success:function(data){
							self.siteTable.refresh();
							self._siteTable.refresh();
							dialog.render({lang:"add_success"});
						}
					});
				}
			});
			$siteMove.find(".group-move-add-whole").bind("click",function(){
				var currentPage = self._siteTable.getCurrentPage();
				if(currentPage.length === 0){
					dialog.render({lang:"page_is_empty"});
				}else{
					Model.group({
						method:"assign_group_resources",
						part:self._id,
						param:{
							type:self.resourceType.site,
							verbose:100
						},
						data:{
							resourceIds:cloud.util.objectArrayToArray(currentPage,"_id")
						},
						success:function(data){
							self.siteTable.refresh();
							self._siteTable.refresh();
							dialog.render({lang:"add_success"});
						}
					});
				}
			});
			
		},
		
	});
	return Content;
});