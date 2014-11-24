/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author jerolin
 */
define(function(require) {
    require("cloud/base/cloud");
    require("./tag-overview.css");
    var Toolbar = require("cloud/components/toolbar");
    var Button = require("cloud/components/button");
    var ItemBox = require("cloud/components/itembox");
    var service = require("cloud/service/service");
    require("cloud/lib/plugin/jquery.qtip");
    require("cloud/lib/plugin/jquery.layout");
    var myController = require("./controller/tag-overview-ctrl") 
    
    //Create class TagOverview
    var TagOverview = Class.create(cloud.View, {
        moduleName: "tag-overview",
        initialize: function($super, options) {
            options.controllerCls = myController;
            $super(options);
//            this.context.resType = options.resType;
            this.itembox = null;
            this.toolbar = null;
            this.cursor = 0;
            this.step = 10;
            this.draw();
//            this.loadTags();
        },
        
        $control : function(context){
            var view = this;
            
        },
        
        /*
         * draw tagOverview
         */
        draw: function() {
            this.element.addClass("tag-overview");
            this.$toolbar = $("<div>").attr("id", this.id + "-toolbar").appendTo(this.element);
            this.$itembox = $("<div>").attr("id", this.id + "-itembox").appendTo(this.element);

            this.element.layout({
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
                    paneSelector: "#" + this.$toolbar.attr("id"),
                    size: 29
                },
                center: {
                    paneSelector: "#" + this.$itembox.attr("id"),
                    paneClass: this.id
                }
            });
            this.renderToolbar();
            this.renderEditForm();
            this.renderCreateForm();
            this.renderItemBox();
        },
        
        /*
         * Render toolbar
         */
        renderToolbar: function() {
            var self = this;
            var checkbox = new Button({
                checkbox: true,
                id: this.moduleName + "-select-all",
                autoGenTitle : false,
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
                text: "0/0",
                disabled: false
            });

            this.selectAllButton = checkbox;
            var addBtn = new Button({
                imgCls: "cloud-icon-add-tag",
                id: this.moduleName + "-add-button",
//                title:"增加"
                lang:"{title:add_tag}"
            });
            var deleteBtn = new Button({
                imgCls: "cloud-icon-remove-tag",
                id: this.moduleName + "-delete-button",
//                title:"删除",
                lang:"{title:delete_tag}",
                events: {
                    click: self.onDelete,
                    scope: self
                }
            });

            var editBtn = new Button({
                imgCls: "cloud-icon-edit",
                id: this.moduleName + "-edit-button",
//                title:"编辑"
                lang:"{title:edit_tag}"
            });

            this.toolbar = new Toolbar({
                selector: this.$toolbar,
                leftItems: [checkbox],
                rightItems: [addBtn, deleteBtn, editBtn]
            });

            this.toolbar.element.addClass(this.moduleName + "-toolbar");
        },
        
        /*
         * Render itembox
         */
        renderItemBox: function() {
            this.itembox = new ItemBox({
                selector: this.$itembox,
                events: {
                    countchange: this.updateCountInfo,
                    click: this.onClick,
                    togglefavor: this.onToggleFavor,
                    toggleshare: this.onToggleShare,
                    scope: this
                }
            });
            this.itembox.element.addClass(this.moduleName + "-itembox");
        },
        
        /*
         * Create Form
         */
        renderCreateForm: function() {
            this.createForm = $("<form>").addClass(this.moduleName + "-create-form ui-helper-hidden tag-overview-form");
            $("<label>").attr("for", "new-tag-name").text(locale.get({lang:"tag_name+:"})).appendTo(this.createForm);
            $("<input type='text'>").attr("id", "new-tag-name").appendTo(this.createForm);

            new Button({
                // text: "提交",
                container: this.createForm,
                imgCls: "cloud-icon-yes",
                lang:"{title:submit}",
                events: {
                    click: this.onCreate,
                    scope: this
                }
            });

            this.createForm.appendTo(this.element);
            $("#" + this.moduleName + "-add-button").qtip({
                content: {
                    text: this.createForm
                },
                position: {
                    my: "top left",
                    at: "bottom middle"
                },
                show: {
                    event: "click"
                },
                hide: {
                    event: "click unfocus"
                },
                style: {
                    classes: "qtip-shadow qtip-light"
                },
				events: {
					visible: function(){
						$("#new-tag-name").focus();
					}
				},
                suppress:false
            });
        },
        
        /*
         * Render edit form
         */
        renderEditForm: function() {
            this.editForm = $("<form>").addClass(this.moduleName + "-edit-form ui-helper-hidden tag-overview-form");
            $("<label>").attr("for", "new-tag-name").text(locale.get({lang:"tag_name+:"})).appendTo(this.editForm);
            $("<input type='text'>").attr("id", "edit-tag-name").appendTo(this.editForm);
            new Button({
//                title: "提交",
                imgCls: "cloud-icon-yes",
                lang:"{title:submit}",
                container: this.editForm,
                events: {
                    click: this.onUpdate,
                    scope: this
                }
            });
            this.editForm.appendTo(this.element);
            $("#" + this.moduleName + "-edit-button").qtip({
                content: {
                    text: this.editForm
                },
                position: {
                    my: "top left",
                    at: "bottom right"
                },
                show: {
                    event: "click"
                },
                hide: {
                    event: "click unfocus"
                },
                style: {
                    classes: "qtip-shadow qtip-light"
                },
                events: {
					visible: function(){
						$("#edit-tag-name").focus();
					},
                    show: function(event) {
                        //Only modify the first selected tag.
                        if (this.itembox.selectedItemsCount === 0) {
                        	dialog.render({lang:"tag_select_a_label"});
                            event.preventDefault();
                            return false;
                        } else {
                            var selectedTag = this.itembox.getSelectedItems().first().options.data;
                            this.editForm.data("tag", selectedTag);
                            cloud.Ajax.request({
                                url: "api/tags/" + selectedTag._id + "?verbose=100",
                                type: "GET",
                                success: function(data) {
                                    $("#edit-tag-name").val(data.result.name);
                                }.bind(this)
                            });
                        }
						
                    }.bind(this)
                },
                suppress:false
            });
        },
        
        /*
         * Get data and process
         * @param {Array} data
         * @return {Object}
         */
        processData: function(data) {
			var self = this;
            var resourceType = this.context.resType;//this.options.service.getResourceType();
            return cloud.util.makeArray(data).collect(function(tag) {
                var config = {
                    selectable: true
                };
                Object.extend(config, tag);
                config.id = this.moduleName + "-tag-" + (tag.id || tag._id);
                config.favor = tag.isMyFavorite === 1;
                config.data = tag;
                if (tag.status != "inherent"){
                	config.description = locale.get({lang:"total+:"}) + (tag.total || 0);
                }else{
                	config.description = "";
                }
                config.type = "marker";
                tag.loadResourcesData = tag.loadResourcesData || function(start, limit, callback, context) {
                    cloud.Ajax.request({
                        url: "api/tags/" + tag._id + "/resources",
                        type: "get",
                        parameters: {
                            "resource_type": resourceType,
                            cursor: start,
                            limit: limit
                        },
						error: function(error){
                            if(error.error_code === 20006){
                               self.loadTags(false);
                            }
                        },
                        success: function(data) {
                            callback.call(context || this, data.result.pluck("id"));
                        }
                    });
                };
                return config;
            }, this);
        },
        
        /*
         * Check current tag
         * @param {String} name
         * @return {Boolean}
         */
        checkKeywords:function(name){
        	//用户
        	var all_user = locale.get("all_user");
        	var none_tag_user = locale.get("none_tag_user");
        	var admin = locale.get("admin");
        	var device_manager = locale.get("devicemanager");
        	//角色
        	var all_role = locale.get("all_role");
        	var none_tag_role = locale.get("none_tag_role");
        	//设备
        	var all_device = locale.get("all_devices");
        	var none_tag_device = locale.get("none_tag_device");
        	var online_device = locale.get("online_device");
        	var offfline_device = locale.get("offline_device");
        	//现场
        	var all_site = locale.get("all_site");
        	var none_tag_site = locale.get("none_tag_site");
        	
        	if(name===all_user||name===none_tag_user || name===admin || name===device_manager ||name===all_role || name===none_tag_role || name===all_device || name===none_tag_device ||name===online_device||name===offfline_device||name===all_site || name===none_tag_site){
        		return false;
        	}
        	return true;
        },
        
        /*
         * Created event
         */
        onCreate: function() {
        	var name = $("#new-tag-name").val();
        	var is = this.checkKeywords(name);
        	var checkStr = /[^\u4e00-\u9fa5\da-zA-Z0-9\-\_]+/;
            if(checkStr.test(name)){
            	dialog.render({lang:"tag_cant_be_input"});
            }else if(is==false){
            	dialog.render({lang:"tag_no_input_keywords"});
            }else{
	            if (!name.empty()) {
	            	if(name.length <30){
		                cloud.Ajax.request({
		                    url: "api/tags",
		                    type: "post",
		                    data: {
		                        name: name,
		                        shared: false
		                    },
		                    success: function(data) {
		                        this.itembox.appendItems(this.processData(data.result));
		                        $("#" + this.moduleName + "-add-button").data("qtip").hide();
		                        $("#new-tag-name").val(null);
		                    }.bind(this)
		                });
	            	}else{
	            		dialog.render({lang:"tag_length_only_in", buttons:[{lang:"yes",click:function(){$("#new-tag-name").val(null);dialog.close();}}]});
	            	}
	            } else {
	            	dialog.render({lang:"tag_cannot_be_empty"});
	            }
            }
            return false;
        },
        
        /*
         * Delete event
         */
        onDelete: function() {
        	var self = this;
            var tags = this.itembox.getSelectedItems();
            if (tags.size() > 0) {
            			dialog.render({
            				lang:"affirm_delete",
            				buttons: [
            					{
            						lang:"affirm",
            						click:function(){
            							tags.each((function(tag) {
      	                                  cloud.Ajax.request({
      	                                      url: "api/tags/" + tag.options._id,
      	                                      type: "delete",
      	                                      success: (function() {
      	                                          //TODO: delete tag from call api.
      	                                          self.itembox.deleteItems(tag);
//      	                                          self.itembox.switchToSelectStatus();
//      	                                          self.itembox.items.values().first().element.click();
//      	                                          self.itembox.selectMode = false;
      	                                          self.refresh();
      	                                      }).bind(this)
      	                                  });
      	                              }).bind(this));
            							dialog.close();
            						}
            					},
            					{
            						lang:"cancel",
            						click:function(){
            							dialog.close();
            						}
            					}
            				]
            			});
            } else {
            	dialog.render({lang:"tag_choose_tag"});
            }
        },
        
        /*
         * Update event
         */
        onUpdate: function() {
            var name = $("#edit-tag-name").val();
            var is = this.checkKeywords(name);
            var tag = this.editForm.data("tag");
            var id = tag._id;
            var shared = tag.shared;
            var checkStr = /[^\u4e00-\u9fa5\da-zA-Z0-9\-\_]+/;
            if(checkStr.test(name)){
            	dialog.render({lang:"tag_cant_be_input"});
            }else if(is==false){
            	dialog.render({lang:"tag_no_input_keywords"});
            }else{
	            if (!name.empty()) {
	            	if(name.length <30){
		                cloud.Ajax.request({
		                    url: "api/tags/" + id,
		                    type: "PUT",
		                    data: {
		                        name: name,
		                        shared: shared
		                    },
		                    success: function(data) {
		                    	this.updateTagData(data.result);
		                        $("#" + this.moduleName + "-edit-button").data("qtip").hide();
		                        $("#edit-tag-name").val(null);
		                    }.bind(this)
		                });
	            	}else{
	            		dialog.render({lang:"tag_length_only_in"});
	            		$("#new-tag-name").val(null);
	            	}
	            } else {
	            	dialog.render({lang:"tag_cannot_be_empty"});
	            }
            }
            return false;
        },
        
        /*
         * Click event
         * @param {String} data
         */
        onClick: function(data) {
//        	console.log(data, "tag-click")
//        	if((this.options.service.resourceType === 5||this.options.service.resourceType === 14) && (data.id === "tag-overview-tag-4" || data.id === "tag-overview-tag-3")){
//				this.loadNetTags();
//			}
			this.clickedTag = data;
            this.fire("click", data.options.data);
            
            //add by qinjunwen
            if (data.options.data.status != "inherent"){
                data.options.data.params = {tagId : data.options.data._id}
            }
            this.context.$emit("tagoverview.click", data.options.data)
        },
        
        /*
         * Toggle favor event
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
        },
        
        /*
         * Toggle share event
         */
        onToggleShare: function(item) {
            var options = item.options,
                data = options.data;
            var newData = {
                _id: data._id,
                name: options.name,
                shared: !options.shared
            };
            service.updateTag(newData, function(result) {
                item.setShared(result.result.shared);
            }, this);
        },
        
        /*
         * Update count info
         */
        updateCountInfo: function() {
            this.selectAllButton.setText(this.itembox.selectedItemsCount + "/" + this.itembox.size);
            this.selectAllButton.setSelect(this.itembox.selectedItemsCount === this.itembox.size && this.itembox.size !== 0);
            $("#" + this.moduleName + "-select-all label").text(this.itembox.selectedItemsCount + "/" + this.itembox.size);
            if(this.itembox.selectedItemsCount > 1){
            	$("#tag-overview-edit-button").hide();
            }else{
            	$("#tag-overview-edit-button").show();
            }
        },
        
        /*
         * Update tag data
         * @param {Object}
         * @return {String}
         */
        updateTagData: function(data) {
            this.itembox.items.find(function(item) {
                return item.value.id.endsWith(data.id || data._id);
            }).value.update(data);
        },
        
		/*
		 * load online & offline tag
		 */
		loadNetTags:function(){
			this.options.service.getNetTags(function(tags){
				tags = this.processData(tags);
                this.itembox.updateItems(tags);
				var clickedItem = this.itembox.getClickedItem();
                var clickedItemId = clickedItem.options._id;
                if (clickedItemId){
                	this.itembox.getItemsByProp("_id", clickedItemId).pluck("element").invoke("addClass", "cloud-item-clicked");
                }
			},this);
		},
		
		renderTags : function(tags, reloadParam){
		    tags = this.processData(tags);
            // this.itembox.appendItems(tags);
            this.itembox.render(tags, 1);
            if (!reloadParam){
                this.itembox.items.values().first().element.click();
            }else{
                var clickedItem = this.itembox.getClickedItem();
                var clickedItemId = clickedItem.options._id;
                if (clickedItemId){
                    var elements = this.itembox.getItemsByProp("_id", clickedItemId).pluck("element").invoke("addClass", "cloud-item-clicked");
                    if (reloadParam == "clicked"){
                        elements.each(function(one){
                            one.click();
                        })
                    }
                }
            }
		},
		
		/*
		 * Load tags
		 * @param {String,undefined} reloadParam
		 */
        loadTags: function(reloadParam) {
//        	console.log("load tag start")
            this.options.service.getTags(function(tags){
                tags = this.processData(tags);
                // this.itembox.appendItems(tags);
                this.itembox.render(tags, 1);
                if (!reloadParam){
                	this.itembox.items.values().first().element.click();
                }else{
                	var clickedItem = this.itembox.getClickedItem();
                	var clickedItemId = clickedItem.options._id;
                	if (clickedItemId){
                		var elements = this.itembox.getItemsByProp("_id", clickedItemId).pluck("element").invoke("addClass", "cloud-item-clicked");
                		if (reloadParam == "clicked"){
                		    elements.each(function(one){
                                one.click();
                            })
                		}
                	}
                }
                // this.fire("click", this.itembox.items.values().first().options.data);
            }, this);
        },
        
        /*
         * Refresh tag box
         */
        refresh: function() {
        	var self = this;
        	self.loadTags();
        },
        
        /*
         * clear tag
         */
        clear: function() {}
        
    });

    return TagOverview;
});