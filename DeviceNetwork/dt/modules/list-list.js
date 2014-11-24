define(function(require){
	
	require("dt/core/dt");
	
	var TableControl = require("dt/controls/table");
	
	var PagingControl = require("dt/controls/paging");
	
	var listList = {
			
			search:{
					
					render:function(param){
						
						var self = this;
						
						var query_type = $("#search-select").val() ? $("#search-select").val() : "name";
						
						switch(query_type){
							case "name":
								_dt.site.queryList({name:param,limit:100,cursor:0},function(data){
									
									listList.table.destroy();
									listList.paging.destroy();
									
									listList.table.render({
										data:data["result"],
										columns:_page.tableColumns["list"]
						
									});
									
									listList.paging.render({
										data:data,
										current:1,
										total:data.total,
										limit:100,
										requestData:function(options,success){
											_dt.site.queryList({
												name:param,
												cursor:options.cursor,
												limit:options.limit
											},function(_data){
												success(_data);
											});
										},
										turn:function(data){
											listList.table.clearData();
											listList.table.loadData(data.result);
										}
									});
									
								});
								break;
							case "serial":
								_dt.site.querySerial({serial:param,limit:100,cursor:0},function(data){
									
									listList.table.destroy();
									listList.paging.destroy();
									
									listList.table.render({
										data:data["result"],
										columns:_page.tableColumns["list"]
						
									});
									
									listList.paging.render({
										data:data,
										current:1,
										total:data.total,
										limit:100,
										requestData:function(options,success){
											_dt.site.querySerial({
												serial:param,
												cursor:options.cursor,
												limit:options.limit
											},function(_data){
												success(_data);
											})
										},
										turn:function(data){
											listList.table.clearData();
											listList.table.loadData(data.result);
										}
									});
									
								});
								break;
							default:
								break;
						}
						
					}
					
			},
			
			table:{
					
					selector:"#table-bar",
					
					render:function(obj){
						var _obj = {};
						_obj.selector = this.selector;
						_obj.data = obj.data;
						_obj.columns = obj.columns;
						_obj.mark = locale.get({lang: "no_data"});
						_obj.events = {
								onRowClick:function(data){
									_page.siteSidebar.siteData = data;
									_page.siteSidebar.show(data);
								}
						};
						this.instance = new TableControl(_obj);
					},
					
					loadData:function(obj){
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
					},
					refreshIcon: function() {
						if(!this.instance) {
							return ;
						}
						var data = this.instance.getData();
						var $rows = this.instance.getJqueryRows();
						
						var ids = [];
						for(var i = 0 ; i < data.length ; i++) {
							ids.push(data[i]._id);
						}
						
						_dt.channel.getList({
							siteIds: ids
						}, function(dataobject) {
							var rows = dataobject.result;
							if(!rows) {
								return ;
							}
							for(var i = 0 ; i < $rows.length ; i++) {
								//alert(rows[j].active+"-"+rows[j].connected);
								var flag = true;
								for(var j = 0 ; j < rows.length ; j++) {
									if($rows.eq(i).attr("_siteId") == rows[j].clientId) {
										
										if(rows[j].active && rows[j].connected) {
											flag = false;
											if(rows[j].userId == dt.storage.get("client.userId")) {
												$rows.eq(i).find("img").eq(0).attr("title", locale.get({lang: "normal_vpn"})).attr("src", "resources/images/connected.png");
											}
											else {
												$rows.eq(i).find("img").eq(0).attr("title", locale.get({lang: "occupy1"})).attr("src", "resources/images/occupation.png");
											}
										}
										else if(rows[j].active && !rows[j].connected){
											if(rows[j].userId == dt.storage.get("client.userId")) {
												$rows.eq(i).find("img").eq(0).attr("title", locale.get({lang: "connecting"})).attr("src", "resources/images/wait_.gif");
											}
											else {
												$rows.eq(i).find("img").eq(0).attr("title", locale.get({lang: "occupy1"})).attr("src", "resources/images/occupation.png");
											}
											
											flag = false;
											//alert($rows.eq(i).find("img").eq(0).attr("title", "connecting").attr("src"));
										}
									}
								}
								if(flag) {
									for(var k = 0 ; k < data.length ; k++) {
										if($rows.eq(i).attr("_siteId") == data[k]._id) {
											if(data[k].online == 1) {
												$rows.eq(i).find("img").eq(0).attr("title", locale.get({lang: "online"})).attr("src", "resources/images/online.png");
											}
											else {
												$rows.eq(i).find("img").eq(0).attr("title", locale.get({lang: "offline"})).attr("src", "resources/images/offline.png");
											}
										}
									}
								}
							}
						},function(error){
							
						});
					}
			},
			
			paging:{
					
					selector:"#paging-bar",
					
					render:function(obj){
						obj.selector = this.selector;
						this.instance = new PagingControl(obj);
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
	};
	
	return listList;
	
});
