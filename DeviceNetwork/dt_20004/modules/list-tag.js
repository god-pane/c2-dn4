define(function(require){
	
	require("dt/core/dt");
	
	var listTag = {
			render: function(stauts) {
				var self = this;
				var	tags = [];
				var	allSite = {
						id: 1,
						name: locale.get({lang: "all_site"}),
						load: function() {//“所有现场”标签
							var self = this;
							dt.ajax({
								url: "/api/sites",
								type: "GET",
								param: {
									verbose:100,
									limit:100
								},
								success: function(data) {
									self.scope.refreshPaging(data, function(options,success) {
										
										dt.ajax({
											url:"/api/sites",
											type:"GET",
											param:{
												verbose:100,
												cursor:options.cursor,
												limit:options.limit
											},
											success:function(data){
												success(data);
											}
										});
									}, function(data) {
										_page.listbar.table.clearData();
										_page.listbar.table.loadData(data.result);
										dt.unmask(".list-bar");
									});
								}
							});
						},
						scope:this
					};
				var	noneTagSite = {
						id: 2,
						name: locale.get({lang: "not_tag_site"}),
						load: function() {//没有标签的现场
							var self = this;
							dt.ajax({
				                url : "/api/tags/none/resources",
				                type : "GET",
				                param : {
				                    limit : 100,
				                    cursor : 0,
				                    verbose : 100,
				                    type: 14
				                },
				                success : function(data) {
				                	self.scope.refreshPaging(data, function(options,success) {
				                		dt.mask(".list-bar");
				                		dt.ajax({
											url:"/api/tags/none/resources",
											type:"GET",
											param:{
												verbose:100,
												cursor:options.cursor,
												limit:options.limit,
												type: 14
											},
											success:function(datas){
												success(datas);
											}
										});
				                	}, function(data) {
				                		dt.ajax({
											url: "/api/sites/overview",
											type: "POST",
											param : {
							                    verbose : 100,
							                    cursor:0,
												limit:0
							                },
							                data:{
							                	resourceIds: data.result
							                },
							                success : function(_data) {
							                	_page.listbar.table.clearData();
												_page.listbar.table.loadData(_data.result);
												dt.unmask(".list-bar");
							                }
										});
				                		
									});
				                }
				            });
							
						},
						scope:this
					};
				var	onlineSite = {
						id: 3,
						name: locale.get({lang: "online_site"}),
						load: function() {//在线的现场
							var self = this;
							dt.ajax({
								url: "/api/sites",
								type: "GET",
								param: {
									limit:100,
									cursor:0,
									verbose:100,
									online:1
								},
								success: function(data) {
									self.scope.refreshPaging(data, function(options,success) {
										dt.mask(".list-bar");
				                		dt.ajax({
											url:"/api/sites",
											type:"GET",
											param:{
												verbose:100,
												cursor:options.cursor,
												limit:options.limit,
												online:1
											},
											success:function(datas){
												success(datas);
											}
										});
				                	}, function(data) {
//				                		if(!!data) {
//				                			$(".list-bar").unmask();
//				                			return ;
//				                		}
				                		var len = data.result.length, ids = [];
				                		for(var i = 0 ; i < len ; i++) {
				                			ids.push(data.result[i]._id);
				                		}
				                		dt.ajax({
											url: "/api/sites/overview",
											type: "POST",
											param : {
							                    verbose : 100,
							                    cursor:0,
												limit:0
							                },
							                data:{
							                	resourceIds: ids
							                },
							                success : function(_data) {
							                	_page.listbar.table.clearData();
												_page.listbar.table.loadData(_data.result);
												dt.unmask(".list-bar");
							                }
										});
				                		
									});
								}
							});
						},
						scope:this
					};
				var	offlineSite = {
						id: 4,
						name: locale.get({lang: "offline_site"}),
						load: function() {//离线的现场
							var self = this;
							dt.ajax({
								url: "/api/sites",
								type: "GET",
								param: {
									limit:100,
									cursor:0,
									verbose:100,
									online:0
								},
								success: function(data) {
									self.scope.refreshPaging(data, function(options,success) {
										dt.mask(".list-bar");
				                		dt.ajax({
											url:"/api/sites",
											type:"GET",
											param:{
												verbose:100,
												cursor:options.cursor,
												limit:options.limit,
												online:0
											},
											success:function(datas){
												success(datas);
											}
										});
				                	}, function(data) {
				                		var len = data.result.length, ids = [];
				                		
				                		for(var i = 0 ; i < len ; i++) {
				                			ids.push(data.result[i]._id);
				                		}
				                		dt.ajax({
											url: "/api/sites/overview",
											type: "POST",
											param : {
							                    verbose : 100,
							                    cursor:0,
												limit:0
							                },
							                data:{
							                	resourceIds: ids
							                },
							                success : function(_data) {
							                	_page.listbar.table.clearData();
												_page.listbar.table.loadData(_data.result);
												dt.unmask(".list-bar");
							                }
										});
				                		
									});
								}
							});
						},
						scope:this
					};
				tags.push(allSite);	
				tags.push(noneTagSite);
				tags.push(onlineSite);
				tags.push(offlineSite);
				
				var self = this;
				dt.ajax({
					url: "/api/site_tags",
					type: "GET",
					param: {
						verbose : 100
					},
					success: function(data) {
						var
						selfTag = function(id) {
							var _tagId = id;
							dt.ajax({
								url: "/api/tags/"+_tagId+"/resources",
								type: "GET",
								param: {
									resource_type:14,
									cursor:0,
									limit:100,
									verbose:100
								},
								success: function(data) {
									self.refreshPaging(data, function(options,success) {
										dt.mask(".list-bar");
				                		dt.ajax({
											url: "/api/tags/"+_tagId+"/resources",
											type: "GET",
											param: {
												verbose:100,
												cursor:options.cursor,
												limit:options.limit,
												resource_type:14
											},
											success: function(datas){
												success(datas);
											}
										});
				                	}, function(data) {
				                		var len = data.result.length, ids = [];
				                		for(var i = 0 ; i < len ; i++) {
				                			ids.push(data.result[i].id);
				                		}
				                		dt.ajax({
											url: "/api/sites/overview",
											type: "POST",
											param : {
							                    verbose : 100,
							                    cursor: 0,
												limit: 0
							                },
							                data: {
							                	resourceIds: ids
							                },
							                success : function(_data) {
							                	_page.listbar.table.clearData();
												_page.listbar.table.loadData(_data.result);
												dt.unmask(".list-bar");
							                }
										});
				                		
									});
								}
							});
						};
						if(data.result) {
							var len = data.result.length;
							for(var i = 0 ; i < len ; i++) {
								tags.push({
									id: data.result[i]._id,
									name: data.result[i].name,
									load: selfTag
								});
							}
							self.drawHTML(tags);
						}
					}
				});
			},
			
			drawHTML: function(tags) {//画html
				var self = this,
					len = tags.length,
					tagbox = $(".tag-bar");
				for(var i = 0 ; i < len ; i++) {
					$("<div></div>").addClass("tag-button")
					.html(tags[i].name).attr("title", tags[i].name).appendTo(tagbox)
					.click(function() {
						dt.ajax({
							url: "/api/sites",
							type: "GET",
							param: {
								verbose:1,
								limit:1
							},
							success: function(data) {
								//alert(data.total);
								dt.ajax({
									url: "/api/sites",
									type: "GET",
									param: {
										limit:1,
										verbose:1,
										online:1
									},
									success: function(_data) {
										$("#status-online").html(_data.total+"/"+data.total);
										//$("#status-online").html("111");
									}
								});
							}
						});
						dt.mask(".list-bar");
						//tagbox.children().css("background-color", "#E0E0E0");
						tagbox.children().css("background-image", "url(resources/images/backline.jpg)");
						$(this).css("background-image", "url(resources/images/whiteline.jpg)");
						this.prototype.load(this.prototype.id);
					}).get(0).prototype = tags[i];
				}
				tagbox.children().eq(0).css("background-image", "url(resources/images/whiteline.jpg)");
			},
			
			loadSites: function(data) {//加载现场
				_page.listbar.table.clearData();
				_page.listbar.table.loadData(data);
			},
			
			refreshPaging: function(data, requestfn, turnfn) {//刷新分页
				_page.listbar.paging.destroy();
				$("#paging-bar").empty().html("");
				_page.listbar.paging.render({
					selector:"#paging-bar",
					data:data,
					current:1,
					total:data.total,
					limit:100,
					requestData:requestfn,
					turn:turnfn
				});
			}
			
	};
	
	return listTag;
	
})