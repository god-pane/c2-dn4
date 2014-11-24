/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author QinJunwen
 */
define(function(require) {
    var cloud = require("cloud/base/cloud");
    require("cloud/lib/plugin/jquery.layout");
    var html = require("text!./table.html");
    //var TagModule = require("../components/tag-overview");
    var ContentModule = require("../components/content-table");
    //Create class TableTemplate
    var TableTemplate = Class.create(cloud.Component, {
        initialize: function($super, options) {
            this.moduleName = "gird-template";
            $super(options);
            this.service = options.service;
            this.businessType = this.service.type;
            this.resourceType = this.service.getResourceType();
            this.element.html(html);
            this.elements = {
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
            // options.infoModule.appendTo(this.element.find("#info-table"));
            // this.element.append(options.infoModule.element.attr("id", "info-table"));

            this.layout = null;
            this._render();

        },

        /*
         * Render TableTemplate
         */
        _render: function() {
            this._renderLayout();
            this._renderContent();
            //this._renderTag();
            this._moduleEvents();
            
            /*this.service.getTotal(function(total){
            	this.modules.content.render(this.service, {total : total});
            }, this);*/
            this.loadData();
        },
        
        loadData : function(){
            this.layout.close("east");
            this.service.getTotal(function(total){
                this.modules.content.render(this.service, {total : total});
            }, this);
        },
        
        /*
         * Render layout
         */
        _renderLayout: function() {
            var self = this;
            self.layout = $("#table-template").layout({
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
                /*west: {
                    paneSelector: "#" + self.elements.tag.id,
                    size: 182
                },*/
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
        
        /*
         * Hide layout east
         */
        hideInfo: function() {
            this.layout.hide("east");
        },
        
        
        /*
         * Show layout east
         */
        openInfo: function() {
            this.layout.open("east");
        },
        
        /*
         * Render Template Content
         */
        _renderContent: function() {
            this.modules.content = new ContentModule({
                selector: "#" + this.elements.content.id,
                service: this.service,
                contentColumns: this.options.contentColumns
            });
        },
        
        /*
         * Events
         */
        _moduleEvents: function() {
            this.modules.info.on({
                "afterInfoCreated": function(id) {
                    this.modules.content.addResource(id);
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

            this.modules.content.on({
                "create": function() {
                    this.modules.info.render(null);
                    this.openInfo();
                },
                "click": function(id) {
                    this.modules.info.render(id);
                    this.layout.open("east");
                },
                "delete": function() {
                	this.layout.close("east");
                    this.modules.info.render();
                },
                "update": function() {
                    this.modules.info.render();
                    this.openInfo();
                },
                "onTurnPage" : function(page){
//                    this.modules.info.render(null);
//                    this.layout.close("east");
                },
                "afterSelect" : function(resources){
                    this.fire("afterSelect", resources);//透传事件
                },
                scope: this
            });

        },
        
        getSelectedRes : function(){
            return this.modules.content.getSelectedResources();
        },
        
        /*
         * Get toolbar
         */
        getToolbar : function(){
            return this.modules.content.toolbar;
        },
        
        destroy : function($super){
            this.modules.content.destroy();
            this.modules.info.destroy();
            $super();
        }
        
    });

    return TableTemplate;

});