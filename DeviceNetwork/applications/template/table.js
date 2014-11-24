/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author PANJC
 */
define(function(require) {
    var cloud = require("cloud/base/cloud");
    require("cloud/lib/plugin/jquery.layout");
    var html = require("text!./table.html");
    var TagModule = require("../components/tag-overview");
    var ContentModule = require("../components/content-table");
    var validator = require("cloud/components/validator");
    var TableTemplate = Class.create(cloud.Component, {
        initialize: function($super, options) {
            this.moduleName = "table-template";
            $super(options);
            this.service = options.service;
            this.businessType = this.service.type;
            this.resourceType = this.service.getResourceType();
            this.element.html(html);
            this.elements = {
                tag: {
                    id: "tag-overview"
                },
                content: {
                    id: "content-table"
                },
                info: {
                    id: "info-table"
                }
            };
            this.modules = {
                tag: null,
                content: null,
                info: cloud.util.result(options, "infoModule")
            };
            this.columns = options.contentColumns;
            // options.infoModule.appendTo(this.element.find("#info-table"));
            // this.element.append(options.infoModule.element.attr("id", "info-table"));

            this.layout = null;
            this._render();

        },

        _render: function() {
        	this.mask();
            this._renderLayout();
            this._renderContent();
            this._renderTag();
            this._moduleEvents();
        },
		/*
		 * render layout 
		 */
        _renderLayout: function() {
            var self = this;
            self.layout = $("#table-template").layout({
//            self.layout = this.element.layout({
                defaults: {
                    paneClass: "pane",
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 1,
                    "spacing_closed": 1,
                    "togglerLength_closed": 50,
					togglerTip_open:locale.get({lang:"close"}),
                    togglerTip_closed:locale.get({lang:"open"}),  
                    resizable: false,
                    slidable: false
                },
                west: {
                    paneSelector: "#" + self.elements.tag.id,
                    size: 187
                },
                center: {
                    paneSelector: "#" + self.elements.content.id
                },
                east: {
                    paneSelector: "#" + self.elements.info.id,
                    initClosed: true,
                    size: 228
                }
            });

            self.hideInfo();

        },

        hideInfo: function() {
            this.layout.hide("east");
        },

        getToolbar: function() {
            return this.modules.content.toolbar;
        },

        appendToolbarButton: function(items, index) {
            this.modules.content.appendToolbarButton(items, index);
        },

        openInfo: function() {
            this.layout.open("east");
        },

		/*
         * Load popup module
         */
        _renderTag: function() {
            this.modules.tag = new TagModule({
                selector: "#" + this.elements.tag.id,
                service: this.service
            });
        },
		/*
         * Load content module 
         */
        _renderContent: function() {
            var deleteFilter = null;
            if (this.options.filters && this.options.filters["delete"]) {
                deleteFilter = this.options.filters["delete"];
            }
            this.modules.content = new ContentModule({
                selector: "#" + this.elements.content.id,
                service: this.service,
                filters : {
                    "delete" : deleteFilter
                },
                contentColumns:this.columns
            });
        },
		/*
		 * bind events for info,content and tag module
		 */
        _moduleEvents: function() {
            this.modules.info.on({
                "afterInfoCreated": function(id) {
                    this.modules.content.addResource(id);
					this.reloadTags(true);
                },
                "afterInfoUpdated": function(id) {
                    this.modules.content.updateResource(id);
                },
                "cancelCreate": function () {
                    if(Object.isFunction(this.modules.info.clear)){
                        this.modules.info.clear();
                    }
                    this.hideInfo();
                },
                "afterInfoDeleted": function(obj) {
                    this.modules.content.deleteResource(obj);
                    this.modules.info.render(null);
                    this.layout.close("east");
                },
                scope: this
            });
			//Callback of tag clicked in tag module.
            this.modules.tag.on({
                click: function(tag) {
					var self = this;
					this.mask();
					//get the resources ids in the tag, then use content module to render these resources.
                    this.service.getResourcesIds = tag.loadResourcesData;
                    this.modules.content.render(this.service,tag,function(){
						self.unmask();
					});
                },
                scope: this
            });

            this.modules.content.on({
                "create": function() {
                    this.openInfo();
                    this.modules.info.render(null);
                },
                "click": function(id) {
                	this.layout.open("east");
                    this.modules.info.render(id);
                    validator.hideAll();
                },
                "delete": function() {
                    this.modules.info.render(null);
                    this.layout.close("east");
					this.reloadTags(true);
                },
                "update": function() {
                    this.openInfo();
                    this.modules.info.render();
                },
                "onTurnPage" : function(page){
                	this.modules.info.render(null);
                	this.hideInfo("east");
                },
                "afterSelect" : function(resources){
                    this.fire("afterSelect", resources);//透传事件
                },
                scope: this
            });

        },

        reloadTags : function(notRefreshContent){
        	
        	this.modules.tag.loadTags(notRefreshContent);
        },
        
        destroy: function() {
            if (this.layout) {
                if (this.layout.destroy) {
                    this.layout.destroy();
                } else {
                    this.layout = null;
                }
            }
            if (this.modules.content) {
                if (this.modules.content.destroy) {
                    this.modules.content.destroy();
                } else {
                    this.modules.content = null;
                }
            }
			if (this.modules.tag){
				if (this.modules.tag.destroy){
					this.modules.tag.destroy();
				}
			}
            if (this.modules.info) {
                if (this.modules.info.destroy) {
                    this.modules.info.destroy();
                }
            }
        }

    });

    return TableTemplate;

});