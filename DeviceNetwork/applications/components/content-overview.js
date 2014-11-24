/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 */
define(function (require) {
	var cloud = require("cloud/base/cloud");
	var Toolbar = require("cloud/components/toolbar");
	var ItemBox = require("cloud/components/itembox");
	var Button = require("cloud/components/button");
	require("cloud/lib/plugin/jquery.layout");
	var service = require("cloud/service/service");
//	var Paginate = require("cloud/components/paginate");
	var Paging = require("cloud/components/paging");
	var ContentOverviewModule = Class.create(cloud.Component, {

		initialize: function ($super, options) {
			this.moduleName = "content-overview";
			$super(options);
			this.service1 = options.service;
			this.items = $H();
			this.itemsCount = 0;
			this.selectedItemsCount = 0;
			this.display = 30;
			this.pageDisplay = 10;
			this.elements = {
				toolbar: this.id + "-toolbar",
				itembox: this.id + "-itembox",
				pager: this.id + "-pager",
				
			};
			this.nowPage = 1;
			this.type = options.type;
			this.draw();
		},
		/*
		 * render the layout and content
		 */
		draw: function() {
			this.element.addClass("content-overview");

			$("<div>").attr("id", this.elements.toolbar).appendTo(this.element);
			$("<div>").attr("id", this.elements.itembox).appendTo(this.element);
			$("<div>").attr("id", this.elements.pager).appendTo(this.element);
			this.layout = this.element.layout({
				defaults: {
					paneClass: "pane",
					"togglerLength_open": 50,
					togglerClass: "cloud-layout-toggler",
					resizerClass: "cloud-layout-resizer",
					"spacing_open": 1,
					"spacing_closed": 1,
					"togglerLength_closed": 50,
					resizable: false,
					slidable: false,
					closable: false
				},
				north: {
					paneSelector: "#" + this.elements.toolbar,
					size: 29
				},
				center: {
					paneSelector: "#" + this.elements.itembox,
					paneClass: this.id
				},
				south: {
					"spacing_open":0,
					paneSelector: "#" + this.elements.pager,
					size: 38
				}
			});
			this.renderItemBox();
			this.renderToolbar();
		},
		/*
		 * append extra button
		 * @param {Object} items Buttons array
		 * @param {number} index 
		 */
		appendToolbarButton: function(items, index) {
			this.toolbar.appendRightItems(items, index);
		},
		/*
		 * Render buttons for default toolbar ,bind event for each button 
		 * Load default toolbar 
		 */
		renderToolbar: function() {
			var self = this;
			var checkbox = new Button({
				checkbox: true,
				id: this.moduleName + "-select-all",
				events: {
					click: function() {
						if (this.selectAllButton.isSelected() === true) {
							this.itembox.selectAllItems();
						} else {
							this.itembox.unselectAllItems();
						}
					},
					scope: self
				},
				autoGenTitle : false,
				text: "0/0",
				disabled: false
			});

			this.selectAllButton = checkbox;
			var addBtn = new Button({
				imgCls: "cloud-icon-add",
//				title: "添加",
				lang:"{title:add}",
				id: this.moduleName + "-add-button",
				events: {
					click: self.onCreate,
					scope: self
				}
			});
			this.addBtn=addBtn;
			var deleteBtn = new Button({
				imgCls: "cloud-icon-reduce",
//				title: "删除",
				lang:"{title:delete}",
				id: this.moduleName + "-delete-button",
				events: {
					click: self.onDelete,
					scope: self
				}
			});
			this.deleteBtn=deleteBtn;
			this.toolbar = new Toolbar({
				selector: "#" + this.elements.toolbar,
				leftItems: [checkbox],
				rightItems: [self.addBtn, self.deleteBtn]
			});

			this.toolbar.element.addClass(this.moduleName + "-toolbar");
		},
		/*
		 * Load itembox to content and bind events for it
		 */
		renderItemBox: function() {
			this.itembox = new ItemBox({
				selector: "#" + this.elements.itembox,
				display: 10,
				events: {
					countchange: this.updateCountInfo,
//					change: this.renderPage,
					click: this.onClick,
					togglefavor: this.onToggleFavor,
					afterSelect : function(selectedRes, currentSelectRes){
					    this.fire("afterSelect", selectedRes.pluck("options").pluck("data"));
					},
					scope: this
				}
			});
			this.itembox.element.addClass(this.moduleName + "-itembox");
//			this.display = this.itembox.getDisplay();
		},

		abort: function() {},
		
		//new page
        _renderpage:function(data, start){
            var self = this;
            if(this.page){
                this.page.reset(data);
            }else{
                this.page = new Paging({
                    selector : $("#" + this.elements.pager),
                    data : data,
                    total:data.total,
                    current : start,
                    limit : 30,
                    requestData:function(options,callback){
                        self.options.service.getOverviewResources(options.cursor, options.limit, function(data){
                            callback(data);
                        });
                    },
                    turn:function(data, nowPage){
//                        console.log("overview data", data)
                        self.fire("onTurnPage", nowPage)
                        var resourcesData = self.processData(data.result);
                        self.itembox.clear();
                        self.itembox.appendItems(resourcesData);
                        self.nowPage = parseInt(nowPage);
                    },
                    events : {
                        "displayChanged" : function(display){
                            self.display = parseInt(display);
                        }
                    }
                });
                this.nowPage = start;
            }
        },
        
        
        //old page
		/*
		 * Render paginate
		 * @param {number} page count
		 * @param {number} selected page
		 */
		renderPager: function(count,start){
			if(this.paging){
				this.paging.destroy();
			}
			this.paging = new Paginate({
				container:"#" + this.elements.pager,
				display:this.pageDisplay,
				count:count,
				start:start,
				events: {
					change: function(page){
						this.turnPage(page);
					},
					scope: this
				}
			});
			this.nowPage = start;
		},
		/*
		 * When trun page ,get resources and render them to content
		 * @param {number} page The selected page
		 */
		turnPage: function(page) {
			this.nowPage = page;
			this.fire("onTurnPage", page)
			this.mask();
			this.options.service.getOverviewResources((page-1)*this.display, this.display, function(resources) {
				this.unmask();
				var resourcesData = this.processData(resources.result);
				this.itembox.clear();
				this.itembox.appendItems(resourcesData);
//				var config = $("#dev-overview-gatewayConfigMgr");
//				if(config.length == 1){
//					this.devicedata = resourcesData;
//				}
			}, this);
		},
		/*
		 * refresh data and page module after add or delete resource
		 * @param {number} page The selected page
		 * @param {number} total Resources total
		 */
		refreshPage:function(page,total){
			this.mask();
			//after add or delete,count pagination,
			var count = Math.ceil(total/(this.display));
			//if pagination less than nowpage
			if(count < page) page = count;
			if(page === 0 ) page = 1;
			this.options.service.getOverviewResources((page-1)*(this.display),this.display, function(resources) {
//				var total = resources.total;
				var resourceData = this.processData(resources.result);
				this.itembox.render(resourceData/* Math.ceil(total/this.display),page*/);
				this._renderpage(resources, page);
				/*if(total > this.display){
					this.renderPager(count,page);
				}else{
					this.nowPage = page;
					this.paging && (this.paging.destroy());
				}*/
//				var config = $("#dev-overview-gatewayConfigMgr");
//				if(config.length == 1){
//					self.devicedata = resourceData;
//				}
				this.unmask();
			}, this);
		},
		/* 
		 * Load resources data and process it,then render it by itembox,
		 * render paginate.
		 * @param {Object}
		 * @param {Object}
		 * @param {Object}
		 */
		render: function(service,tag,callback) {
//			this.mask();
			
			this.options.service = service;
			// ids = cloud.util.makeArray(ids);
			var self = this;
			service.getOverviewResources(0, this.display, function(resources) {
				var total = tag.total;
				this.total = total;
//				var total = resources.total;
				var resourceData = this.processData(resources.result);
				if(this.itembox){
					this.itembox.render(resourceData);
					
					/*if(total > this.display){
						this.renderPager(Math.ceil(total/(this.display)),1);
					}else{
						this.nowPage = 1;
						this.paging && (this.paging.destroy());
					}*/
				}
				this._renderpage(resources, 1)
//				var config = $("#dev-overview-gatewayConfigMgr");
//				if(config.length == 1){
//					self.devicedata = resourceData;
//				}
//				this.unmask();
				callback && callback.call(this);
			}, this);
		},
		
		/*
		 * Process datas, set id and data
		 * @param {Array} 
		 */
		processData: function(resourceArray) {
			return cloud.util.makeArray(resourceArray).collect(function(resource) {
				var data = {};
				// resource.notifications = 1;
				Object.extend(data, resource);
				data.selectable = true;
				data.id = this.moduleName + "-resource-" + resource._id;
				// data.favor = false;
				data.data = resource;
				return data;
			}, this);
		},
		/*
		 * update resource info by id
		 * @param {number} resource id
		 */
		updateResource: function(id) {
			this.options.service.getOverviewResourcesById([id], function(resources) {
				resources = this.processData(resources);
				this.itembox.updateItems(resources);
			}, this);
		},
		/*
		 * update statistics info like "selected/pagetotal",
		 * Judge whether the selected resources have same modal,if not hidden config button 
		 */
		updateCountInfo: function() {
			this.selectAllButton.setText(this.itembox.selectedItemsCount + "/" + this.itembox.size);
			this.selectAllButton.setSelect(this.itembox.selectedItemsCount === this.itembox.size && this.itembox.size !== 0);
			$("#" + this.moduleName + "-select-all label").text(this.itembox.selectedItemsCount + "/" + this.itembox.size);
			
			/*var config = $("#dev-overview-gatewayConfigMgr");
			var selectCont = this.itembox.selectedItemsCount;
			if(config.length ==1 && selectCont > 1){
//				var tt = this.arr;
//				var deviceArr = this.getSelectedResOpt();
//				var selectedIdArr = $A(this.getSelectedResources());
				
//				var firstModeId;
//				var f = false;
				
//				deviceArr.each(function(one){
//					if (selectedIdArr.include(one._id)) {
//						selectedModelArr.push(one.modelId)
//					}
//				})
				var selectedModelArr = $A(this.getSelectedResByProp("modelId"));
				selectedModelArr = selectedModelArr.uniq();
				if (selectedModelArr.length > 1){
					config.css("display","none");
				} else {
					config.removeAttr("style");
				}
				
				select.each(function(select){
					var modeId;
					tt.each(function(device){
						if(select == device._id){
							modeId = device.modelId;
							if (f === false) {
								firstModeId = device.modelId;
								f = true;
							}
						}
					});
					if(modeId != firstModeId){
						config.css("display","none");
					}else{
						config.removeAttr("style");
					}
				});
			}else if (selectCont <= 1){
				config.removeAttr("style");
			}*/
		},
		/*
		 * after add sources,turn to first page and render data
		 */
		appendResource: function(ids) {
			if(this.total){
				this.total++;
			}else{
				this.total = 1;
			}
			this.refreshPage(1/*Math.ceil(this.total/(this.display))*/,this.total);
			this.itembox.clearClick();
//			ids = cloud.util.makeArray(ids);
//			this.options.service.getOverviewResourcesById(ids, function(resources) {
//				resources = this.processData(resources);
//				this.itembox.appendItems(resources);
//				this.itembox.clearClick();
//				var config = $("#dev-overview-gatewayConfigMgr");
//				if(config.length == 1){
//					this.devicedata = this.devicedata.concat(resources);
//				}
//			}, this);
		},

		getSelectedResources: function() {
			return this.itembox.getSelectedItems().pluck("options").pluck("_id");
		},
		
		getSelectedResOpt: function() {
			return this.itembox.getSelectedItems().pluck("options");
		},
		
		getSelectedResByProp: function(property) {
			return this.itembox.getSelectedItems().pluck("options").pluck(property);
		},

		clear: function() {
			this.itembox.clear();
		},

		onClick: function(data) {
			this.fire("click", data.options.data);
		},
		/*
		 * get the selected resources' id 
		 * if resourceType id 14,ask whether delete deivces of this site
		 */
		onDelete: function() {
			var self = this;
			var resources = this.itembox.getSelectedItems();
			var total_device=0;
//			resources.each(function(one){
//				total_device+=one.options.deviceCount;
//			});
			if(resources.length === 0){
//                alert("At least select one item , Please!");
				dialog.render({
            	  	lang:"please_select_at_least_one_config_item"
            	  });
                return;
            }			
			var content="";
			
//			if (this.options.service.resourceType == 6){
//				//如果所选为机型			
//				content = locale.get("Delete_this_model_will_also_delete_devices_related")+"<br />";				
//			}
			dialog.render({
			  	text:content+locale.get("affirm+delete+?"),			  	
//			  	content :content,
			  	buttons:[{lang:"yes",click:function(){
			  		self.itembox.switchToDefaultStatus();
					self.deleteResources(resources.pluck("options").pluck("data"));
			  		dialog.close();
			  		}},{lang:"no",click:function(){
			  			dialog.close();
			  		}}]
			});
			if (this.options.service.resourceType == 14){
				if (this.isDelAllDevBtn){
					this.isDelAllDevBtn.destroy();
				}
				//如果所选现场有设备
//				if(total_device>0){
//					this.isDelAllDevBtn = new Button({
//		                container: $("#is-del-all-device-row"),
//		                id : "is-del-all-device-btn",
//		                checkbox : true,
//		                text : locale.get("is_del_all_device"),
//		                lang:"{title:is_del_all_device, text:is_del_all_device}",
//		                events: {
//		                    click: function(){
//		                    },
//		                    scope : this
//		                }
//		            });
//				}
			}
		},
		
		deleteResources : function(resources){
		    var delFilter = $H(this.options.filters).get("delete");
		    if (delFilter){
		        resources = delFilter(resources);
		    }
		    if (resources.length > 0){
                this.doDeleteResources(resources);
            }else{
                this.itembox.unselectAllItems();
                this.updateCountInfo();
            }
		},
		
		/*
		 *  delete sources and refresh current page 
		 *  @param {Array} Resources ids
		 */
		doDeleteResources:function(resources){
			this.mask();
			resources = cloud.util.makeArray(resources);
			var isDelAllDev;
			if (this.options.service.resourceType == 14 && this.isDelAllDevBtn){
				isDelAllDev = this.isDelAllDevBtn.isSelected();
			}
			this.options.service.deleteResources(resources.pluck("_id"),function(ids){
				var callback = function(){
					var idsToDel = ids ? ids : resources.pluck("_id");
					
//					console.log("idsToDel: "+ idsToDel.length, "total:", this.total)
					this.total-=idsToDel.size();
//					console.log("total", this.total)
					this.unmask();
					this.refreshPage(this.nowPage,this.total);
//					var resourceItem = this.itembox.getItemsByProp("_id", idsToDel);//this.itembox.getSelectedItems();
//					var resourcesData = resourceItem.pluck("data");
//					this.itembox.deleteItems(resourceItem);
					this.updateCountInfo();
					this.fire("delete");
					var resType=this.options.service.getResourceType();
//					if(resType===6){
//						var modelNameForMachines=[];
//						var modelNameForGateway=[];
//						resources.each(function(one){
//							if(one.gateway){
//								modelNameForGateway.push(one.name);
//							}
//							else{
//								modelNameForMachines.push(one.name);
//							}
//						})
//						for(var i=0;i<modelNameForMachines.length;i++){
//							cloud.Ajax.request({
//								url:"api/machines",
//								type:"get",
//								parameters:{
//									verbose:1,
//									model:modelNameForMachines[i]
//								},
//								success:function(data){
//									data.result.each(function(one){
//										cloud.Ajax.request({
//											url:"api/machines/"+one._id,
//											type:"DELETE",
//											parameters:{
//												verbose:100
//											},
//											success:function(redata){
//												console.log(redata);
//											}
//										})
//									})
//								}
//							});
//						}
//						var deviceIds={};
//						deviceIds.resourceIds=[];
//						var cnt=0;
//						for(var j=0;j<modelNameForGateway.length;j++){
//							cloud.Ajax.request({
//								url:"api/devices",
//								type:"get",
//								parameters:{
//									verbose:1,
//									model:modelNameForGateway[j]
//								},
//								success:function(data){
//									data.result.each(function(one){
//										deviceIds.resourceIds.push(one._id);
//									});
//									cnt++;
//									if(cnt==modelNameForGateway.length){
//										cloud.Ajax.request({
//											url:"api/devices/batch_delete",
//											type:"POST",
//											patameters:{
//												verbose:1
//											},
//											data:deviceIds,
//											success:function(data){
//												console.log(data);
//											},
//											error:function(err){
//												console.log(deviceIds);
//											}
//										})
//									}
//								}
//							})
//						}
//
//					}					
				}.bind(this);
				setTimeout(callback, 500)  // time delay for 0.5 s 
			}, this, isDelAllDev);
			
//			if(resType===6){
//				cloud.Ajax.request({
//					url:"api/devices",
//					type:"get",
//					parameters:{
//						verbose:1,
//						model:
//					}
//				});
//			}
		},

		onCreate: function() {
			this.fire("create");
		},
		/*
		 * toggle favor this resource
		 */
		onToggleFavor: function(item) {
			var options = item.options;
			var id = options.data._id;
			function handler() {
				item.setFavor(!item.options.favor);
			}

			if (options.favor) {
				service.removeFavorites(id, handler, this);
			} else {
				service.addFavorites(id, handler, this);

			}
			this.fire("onToggleFavor", id);
		},
		destroy: function($super){
			if (this.layout && (!this.layout.destroyed)) {
            	this.layout.destroy();
            }
			if(this.toolbar){
				this.toolbar.destroy();
				this.toolbar = null
			}
			if(this.itembox){
				this.itembox.destroy();
				this.itembox = null
			}
			if(this.paging){
				this.paging.destroy();
			}
			this.pageDisplay = null;
			this.total = null;
			this.nowPage = null;
//			this.display = null;
			this.total = null;
			$super();
		}
	});

	return ContentOverviewModule;
});