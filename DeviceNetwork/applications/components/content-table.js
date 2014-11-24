/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author PANJC
 */
define(function(require) {
    var cloud = require("cloud/base/cloud");
    require("cloud/lib/plugin/jquery.layout");
    var Toolbar = require("cloud/components/toolbar");
    var Table = require("cloud/components/table");
    var Button = require("cloud/components/button");
//    var Paginate = require("cloud/components/paginate");
    var Paging = require("cloud/components/paging");
    require("./content-table.css");
    // var service = require("cloud/service/business-service");
    var ContentTableModule = Class.create(cloud.Component, {
        
        /**
         * init this component
         * @author QinJunwen
         * @param $super {Function} parent method
         * @param options
         */
        initialize: function($super, options) {
            this.moduleName = "content-table";

            cloud.util.defaults(options, {
                toolbarFeatrues : true,
                rowSelectModel : "multi"//see cloud/components/table options.checkbox
            });

            $super(options);
            this.businessType = options.service.type;
            this.service = options.service;
            this.resourceType = this.service.getResourceType(this.businessType);
            this.elements = {
                toolbar: this.id + "-toolbar",
                content: this.id + "-content",
                table: this.id + "-table",
                paging: this.id + "-paging"
            };
            this.toolbar = null;
            this.content = null;
            this.display = 30;
            this.pageDisplay = 10;
            this._render();

        },
        
        /**
         * render this component
         * @author QinJunwen
         */
        _render: function() {
            this._draw();
            this._renderLayout();
            this._renderContent();
            this._renderToolbar();
        },
        
        /**
         * draw html of this component
         * @author QinJunwen
         */
        _draw: function() {
            var html = "<div id=" + this.elements.toolbar + " class=" + this.elements.toolbar + "></div>" +
                "<div id=" + this.elements.content + " class=" + this.elements.content + " style=\"height:auot;\">" +
                "<div id=" + this.elements.table + " class=" + this.elements.table + " style=\"height:100%\"></div>" +"</div>"+
                "<div id=" + this.elements.paging + " class=" + this.elements.paging + "></div>" ;
            this.element.append(html);
        },

        /**
         * layout this component
         * @author QinJunwen
         */
        _renderLayout: function() {
            this.layout = this.element.layout({
                defaults: {
                    paneClass: "pane",
                    "togglerLength_open": 50,	
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 0,
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
                    paneSelector: "#" + this.elements.content
                    // paneClass: this.elements.content
                },
				south: {
					paneSelector: "#" + this.elements.paging,
					size : 38
				}
            });
			var height = this.element.find("#" + this.elements.content).height();
//			this.display = Math.ceil((height-60)/30);
        },

        /**
         * render toolbar and toolbar items
         * @author QinJunwen
         */
        _renderToolbar: function() {
            var self = this;
            this.selectAllButton = new Button({
                checkbox: true,
                id: this.moduleName + "-select-all",
                events: {
                    click: function() {
                        if (this.selectAllButton.isSelected() === true) {
                            this.selectAllResources();
                        } else {
                            this.unselectAllResources();
                        }
                    }.bind(self)
                },
                autoGenTitle : false,
                text: "0/0",
                disabled: false
            });
            var addBtn = new Button({
                imgCls: "cloud-icon-add",
                id: this.moduleName + "-add-button",
                title:"增加",
                lang:"{title:add}",
                events: {
                    click: function() {
                        self.fire("create");
                    }
                }
            });
            this.addBtn = addBtn;
            var deleteBtn = new Button({
                imgCls: "cloud-icon-reduce",
                id: this.moduleName + "-delete-button",
                title:"删除",
                lang:"{title:delete}",
                events: {
                    click: this.deleteSelectedResource,
                    scope: this
                }
            });
            this.deleteBtn = deleteBtn;
            
            this.toolbar = new Toolbar({
                // container: this.element,
                selector: "#" + this.elements.toolbar,
//                leftItems: [this.selectAllButton],
//                rightItems: [addBtn, deleteBtn]
            });

            if (this.options.toolbarFeatrues){
                this.toolbar.appendLeftItems([this.selectAllButton], 0);
                this.toolbar.appendRightItems([addBtn, deleteBtn], 0);
            }

            this.toolbar.element.addClass(this.moduleName + "-toolbar");
            
        },

        getToolbar : function(){
            return this.toolbar;
        },
        
        getLayout : function(){
            return this.element.layout();
        },
        
        /**
         * initialize table component to it's content.
         * @author QinJunwen
         */
        _renderContent: function() {
        	if (!this.content){
        		this.content = new Table({
                    selector: "#" + this.elements.table,
                    // service: this.service,
                    datas: [],
                    pageSize: 100,
                    autoWidth: false,
                    pageToolBar: false,
                    checkbox : this.options.rowSelectModel ||"multi",
                    columns: [/*{
                        "title": "",
                        "dataIndex": null,
                        // "defaultContent": "<input type='checkbox' class='table-input'/>",
                        "width": "6%",
                        sortable: false,
                        cls: "content-table-select-column"
                    },*/
                    this.options.contentColumns].flatten(),
                    events: {
                        onRowClick: function(data) {
                            this.fire("click", data._id, data);
                        },
                        onRowCheck : function(isSelected, RowEl, rowData){
                        	this.updateCountInfo();
                        	var selectedRes = this.getSelectedResources();
                        	this.fire("afterSelect", selectedRes, rowData, isSelected);//add isSelected by qinjunwen 
                        },
                        onCheckAll : function(selectedRows){
                            var selectedRes = this.getSelectedResources();
                            this.fire("checkAll", selectedRes);
                        },
                        /*onRowRendered: function(tr, data) {
                            var self = this;
                            if (data.checkbox) {
                                return;
                            }
                            var checkbox = new Button({
                                checkbox: true,
                                disabled: false,
                                container: $(tr).find("td").first(),
                                events: {
                                    click: function() {
                                        self.updateCountInfo();
                                    },
                                    scope: self
                                }
                            });
                            data.checkbox = checkbox;
                        },*/
                        onLoad : function(data){
                            this.fire("afterRendered", data);
                        },
                        scope: this
                    }
                    // businessType:this.businessType
                });
        	}
        },
        //new page
        _renderpage:function(data, start){
        	var self = this;
        	if(this.page){
        		this.page.reset(data);
        	}else{
        		this.page = new Paging({
        			selector : $("#" + this.elements.paging),
        			data : data,
        			total:data.total,
        			current : start,
        			limit : 30,
        			requestData:function(options,callback){
        				self.service.getTableResources(options.cursor, options.limit, function(data){
        					callback(data);
        				});
        			},
        			turn:function(data, nowPage){
        			    self.fire("onTurnPage", nowPage, data)
        			    self.totalCount = data.result.length;
        				self.content.clearTableData();
        				self.content.render(data.result);
        				self.updateCountInfo();
        				self.nowPage = parseInt(nowPage);
        			},
        			events : {
        			    "displayChanged" : function(display){
//        			        console.log("displayChanged:", display)
        			        self.display = parseInt(display);
        			    }
        			}
        		});
        		this.nowPage = start;
        	}
        },
        
        
        //old page
        /**
         * render Paginate to this component
         * @author QinJunwen
         * @param pagination {number} number of pages
         * @param start {number} page now
         */
        _renderPaging: function(pagination,start) {
        	var self = this;
			if (this.paging) {
				this.paging.destroy();
				this.paging = null;
			}
				this.paging = new Paginate({
					display: this.pageDisplay,
					count: pagination,
					start: start,
					container: $("#" + this.elements.paging),
					events: {
						change: function(page) {
							self._turnPage(page);
						},
						scope: this
					}
				});
				this.nowPage = start;
		},
		
		/**
         * handle the page change event, request data from server and render
         * @author QinJunwen
         * @param page {number} page now
         */
		_turnPage:function(page){
			this.fire("onTurnPage", page)
			this.mask();
			this.service.getTableResources((page-1)*(this.display),this.display,function(data){
				this.totalCount = data.length;
                this.selectedCount = 0;
                this.content.clearTableData();
                this.content.render(data);
                this.updateCountInfo();
                this.unmask();
                this.nowPage = page;
			},this);
		},
		/*
		refreshContent : function(notStayPage){
			if (notStayPage){
				this._turnPage(1);
			}else {
				this._turnPage(this.nowPage);
			}
		},*/
		
		getContentData : function(){
		    return this.content.getAllData();
		},
		
		/**
         * request data from server by given service and render these data
         * @author QinJunwen
         * @param service {object} service contains Function named getTableResources
         * @param tag {object} object like {total:{number}}
         * @param callback {Function} callback to process after render
         */
        render: function(service,tag,callback) {
        	var self = this;
//        	total = total.total;
			
            this.service = service;
//            this.mask();
            this.service.getTableResources(0, this.display, function(data) {
            	var total = tag.total;
            	this.total = total;
                this.totalCount = data.result.length;
                this.selectedCount = 0;
                if(this.content){
                	this.content.render(data.result);
                	//new page
//                	if(this.page){
//                		this.page.reset(data);
//                	}else{
                		this._renderpage(data, 1);
//                	}
                	
                	//old page
                	/*if(parseInt(total,0) > this.display){
                		this._renderPaging(Math.ceil(total/(this.display)),1);
                	}//TODO
                	else{
                		this.nowPage = 1;
                		this.paging && (this.paging.destroy());
                	}*/
                }
//                var config = $("#dev-overview-gatewayConfigMgr");
//				if(config.length == 1){
//					self.devicedata = data;
//				}
                this.updateCountInfo();
                callback && callback.call(this);
//                this.unmask();
            }, this);
        },

        /**
         * refresh page and clear table click after resource added
         * @author QinJunwen
         * @param id {string} deprecated
         */
        addResource: function(id) {
        	if(this.total){
				this.total++;
			}else{
				this.total = 1;
			}
        	this.refreshPage(1/*Math.ceil(this.total/(this.display))*/,this.total);
//            this.service.getTableResourcesById([id], this.content.add, this.content);
//            this.totalCount++;
//            this.updateCountInfo();
            this.content.clearClick();
            // this.content.add(id);
        },
        
        deleteResource : function(resources){
            var delFilter = $H(this.options.filters).get("delete");
            if (delFilter){
                resources = delFilter(resources);
            }
            if(resources.length){
                if (resources.length > 0){
                    this.doDeleteResources(resources);
                }else{
                    this.unselectAllResources();
                }
            }
            else{
            	this.doDeleteResources(resources);
            }
        },
        
        /**
         * delete resources from server, and delete the resources in table after success
         * @author QinJunwen
         * @param resources {object} resources to delete
         */
        doDeleteResources: function(resources) {
        	this.mask();
            resources = cloud.util.makeArray(resources);
            var isDelAllDev;
			if (this.options.service.resourceType == 14 && this.isDelAllDevBtn){
				isDelAllDev = this.isDelAllDevBtn.isSelected();
			}
            this.options.service.deleteResources(resources.pluck("_id"), function(ids) {
            	var callback = function(){
	                //this.content.deleteById(resources.pluck("_id"));
	            	var idsToDel = ids ? ids : resources.pluck("_id");
					this.total-=idsToDel.size();
					this.unmask();
					this.refreshPage(this.nowPage,this.total);
	//                this.content["delete"](this.content.getRowsByProp("_id", idsToDel));
	//                this.totalCount -= idsToDel.size();
	                this.updateCountInfo();
	                this.fire("delete");
            	}.bind(this);
				setTimeout(callback, 500)  // time delay for 0.5 s 
            }, this, isDelAllDev);
        },

        /**
         * update resource in the table by the given id.
         * this will load the resource detail infomation through the id, and update it in the table.
         * @author QinJunwen
         * @param id {string} specify resources to update
         */
        updateResource: function(id) {
            this.service.getTableResourcesById(id, function(data) {
                this.content.update(data[0], this.content.getRowsByProp("_id", data[0]._id)[0]);
                this.updateCountInfo();
            }, this);
        },
        
        updateRowByData : function(data){
            this.content.update(data, this.content.getRowsByProp("_id", data._id)[0]);
            this.updateCountInfo();
        },

        /**
         * get all resources selected count info, update the selected all checkbox label in the toolbar. 
         * @author QinJunwen
         */
        updateCountInfo: function() {
            this.selectedCount = this.getSelectedResources().size();
            this.selectAllButton.setText(this.selectedCount + "/" + this.totalCount);
            this.selectAllButton.setSelect(this.selectedCount === this.totalCount && this.totalCount !== 0);
            /*var config = $("#dev-overview-gatewayConfigMgr");
			if(config.length ===1 && this.selectedCount > 1){
//				var tt = this.arr;
//				var tt = this.devicedata;
				var select = this.getSelectedResources();
				var firstModeId;
				var f = false;
//				var modeId;
				firstModeId=select[0].modelId;
				config.removeAttr("style");
				for(var i = 0;i<select.length;i++){
					if(select[i].modelId !== firstModeId){
						config.css("display","none");
					}
				}
			}else if (this.selectedCount <= 1){
				config.removeAttr("style");
			}*/
        },

        /**
         * get selected resources of table
         * @author QinJunwen
         * @return {array} array of data of selected rows
         */
        getSelectedResources: function() {
            /*return this.content.getAllData().findAll(function(data) {
                return data.checkbox.isSelected();
            });*/
        	var self = this;
        	var selectedRes = $A();
        	self.content && self.content.getSelectedRows().each(function(row){
        		selectedRes.push(self.content.getData(row));
        	});
        	return selectedRes;
        },
        
        /**
         * refresh page
         * @author QinJunwen
         * @param page {number} page now
         * @param total {number} total record
         */
		refreshPage:function(page,total){
			var self = this;
			this.mask();
			//after add or delete,count pagination,
			var count = Math.ceil(total/(this.display));
			//if pagination less than nowpage
			if(count < page) page = count;
			if(page === 0 )page=1;
			this.service.getTableResources((page-1)*(this.display),this.display,function(data){
				this.totalCount = data.result.length;
                this.selectedCount = 0;
                this.content.render(data.result);
				this.updateCountInfo();
//                if(parseInt(total,0) > this.display){
                	this._renderpage(data, page);
//                }//TODO
//                else{
//                	this.paging && (this.paging.destroy());
//                	this.nowPage = page;
//                }
                this.unmask();
			},this);
		},
		
		/**
         * return data of click row 
         * @author QinJunwen
         */
		getClickedResource : function(){
			var self = this;
			var clickedRowEl = self.content.getClickedRow();
			if (clickedRowEl){
				return self.content.getData(clickedRowEl);
			}else {
				return null;
			}
		},

		/**
         * delete selected rows and resources by service
         * @author QinJunwen
         */
        deleteSelectedResource: function() {
        	var self = this;
            var resources = this.getSelectedResources();
            if(resources.length === 0){
//                alert("At least select one item , Please!");
                dialog.render({
            	  	lang:"please_select_at_least_one_config_item"
            	  });
                return;
            }
            var content;
//            if (this.options.service.resourceType == 14){
//				content = [{html : "<span id = \"is-del-all-device-row\"></span>"}]
//			}
//            
            dialog.render({
			  	lang:"affirm_delete",
			  	content : content,
			  	buttons:[{lang:"yes",click:function(){
			  		dialog.close();
			  		self.deleteResource(resources);
			  		//dialog.close(); //move this line to top of this block by qinjunwen
			  		}},{lang:"no",click:function(){
			  			dialog.close();
			  		}}]
			  });
            if (this.options.service.resourceType == 14){
				if (this.isDelAllDevBtn){
					this.isDelAllDevBtn.destroy();
				}
				this.isDelAllDevBtn = new Button({
	                container: $("#is-del-all-device-row"),
	                id : "is-del-all-device-btn",
	                checkbox : true,
	                text : locale.get("is_del_all_device"),
	                lang:"{title:is_del_all_device, text:is_del_all_device}",
	                events: {
	                    click: function(){
	                    },
	                    scope : this
	                }
	            });
			}
        },
        
        /**
         * select all rows in table
         * @author QinJunwen
         */
        selectAllResources: function() {
            /*this.content.getAllData().pluck("checkbox").select(function (checkbox) {
                return checkbox.isSelected() === false;
            }).pluck("element").invoke("trigger", "click");*/
        	this.content.selectRows();
            this.updateCountInfo();
            var selectedRes = this.getSelectedResources();
            this.fire("afterSelect", selectedRes, null);
        },

        /**
         * unselect all rows in table
         * @author QinJunwen
         */
        unselectAllResources: function() {
        	/*this.content.getAllData().pluck("checkbox").select(function (checkbox) {
                return checkbox.isSelected() === true;
            }).pluck("element").invoke("trigger", "click");*/
        	this.content.unSelectRows();
            this.updateCountInfo();
            var selectedRes = this.getSelectedResources();
            this.fire("afterSelect", selectedRes, null);
        },
        
        /**
         * deprecated
         */
        selectResource: function(row) {
            row.find("input.table-input");
        },
        
        /**
         * destroy this component
         * @author QinJunwen
         * @param $super {Function} parent method
         */
		destroy: function($super){
			if (this.layout && (!this.layout.destroyed)) {
            	this.layout.destroy();
            }
			if(this.toolbar){
				this.toolbar.destroy();
				this.toolbar = null
			}
			if(this.content){
				this.content.destroy();
				this.content = null
			}
			if(this.paging){
				this.paging.destroy();
				this.paging = null
			}
//			this.display = null;
            this.pageDisplay = null;
			this.total = null;
			this.nowPage = null;
			$super();
		}
    });

    return ContentTableModule;

});