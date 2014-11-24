/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author Jerolin
 */
define(function(require) {
    var template = require("text!./overview.html");
    var ContentOverview = require("../components/content-overview");
    var PopupOverviewModule = require("../components/tag-overview");
    require("cloud/lib/plugin/jquery.layout");
    var validator = require("cloud/components/validator");

    var OverviewTemplate = Class.create(cloud.Component, {
        moduleName: "overview",
        initialize: function($super, options) {
            $super(options);
            this.element.html(template);
            this.contentModule = null;
            this.tagOverview = null;
            this.infoModule = cloud.util.result(options, "infoModule");
            this.draw();
            if (this.infoModule) {
                this.bindInfoEvents();
            }
            $("#user-footer-toggler").css("display","none");
        },
		/*
		 * render layout 
		 */
        draw: function() {
            this.element.addClass("overview");
			if (this.layout){
				this.layout.destroy();
			}
//            this.layout = this.element.layout({
            this.layout = $("#overview-template").layout({
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
                    paneSelector: "#tag-overview",
                    size: 187
                },
                center: {
                    paneSelector: "#overview-content"
                },
                east: {
                    paneSelector: "#overview-info",
                    initClosed: true,
                    size: 228
                },
                south:{
                	initClosed: true
                }
            });
            this.renderContent();
            this.renderTagOverview();
        },
		/*
		 *inject info module and bind it's events. 
		 */
        bindInfoEvents: function() {
            this.infoModule.on({
                "afterInfoCreated": function(id) {
                    this.contentModule.appendResource(id);
                    this.tagOverview.loadTags(true);
                },
                "afterInfoUpdated": function(id) {
                    this.contentModule.updateResource(id);
                },
                "cancelCreate": function () {
                    if(Object.isFunction(this.infoModule.clear)){
                        this.infoModule.clear();
                    }
                    this.hideInfo();
                },
                "afterInfoDeleted": function(obj) {
                    this.contentModule.deleteResources(obj);
                    this.infoModule.render(null);
//                    this.infoModule.clear();
                    this.layout.close("east");
                },
                scope: this
            });
        },

        /*
         * Load content module then load content toolbar and popup module.
         */
        renderContent: function() {
            if (this.contentModule) {
                this.contentModule.abort();
            }
            var deleteFilter = null;
            if (this.options.filters && this.options.filters["delete"]) {
                deleteFilter = this.options.filters["delete"];
            }
            this.contentModule = new ContentOverview({
                service: this.options.service,
                selector: "#overview-content",
                filters : {
                    "delete" : deleteFilter
                },
                events: {
                    click: function(data) {
                        this.openInfo();
                        this.infoModule.render(data._id);
                        validator.hideAll();
                    },
                    create: function() {
                        this.openInfo();
                        this.infoModule.render(null);
                    },
                    "delete": function() {
                    	this.layout.close("east");
                    	var self = this;
                    	var loadTag = function(){
                    		self.tagOverview.loadTags(true)
                    	}
                    	loadTag();
//                    	setTimeout(loadTag, 500);
                        this.infoModule.render(null);
//                    	this.infoModule.clear();
                    },
                    "onToggleFavor" : function(id){
                    	if (this.infoModule.getResId){
                    		var infoId = this.infoModule.getResId();
                    		if (infoId == id){
                    			this.infoModule.render(id);
                    		}
                    	}
                    },
                    "onTurnPage" : function(page){
                    	this.infoModule.render(null);
//                        this.infoModule.clear();
                    	this.hideInfo("east");
                    },
                    "afterSelect" : function(resources){
                        this.fire("afterSelect", resources);//透传事件
                    },
                    scope: this
                }
            });

        },

        /*
         * Load popup module, initialize the data in popup module.
         */
        renderTagOverview: function() {
        	this.mask();
            this.tagOverview = new PopupOverviewModule({
                events: {
                    click: this.onTagClick,
                    scope: this
                },
                service: this.options.service,
                selector: "#tag-overview"
            });
        },
        /*
         * Callback of tag clicked in popup module.
         * @param {Object} item
         */
        onTagClick: function(item) {
			var self = this;
        	if(this.contentModule){
        		this.contentModule.clear();
        	}
            this.hideInfo();
            //get the resources ids in the tag, then use content module to render these resources.
            this.options.service.getResourcesIds = item.loadResourcesData;
            // item.loadResourcesData(0, 10, this.contentModule.render, this.contentModule);
            if(this.contentModule){
//				alert(item.total);
            	this.mask();
				this.contentModule.render(this.options.service,item,function(){
				    self.unmask();
				});
            }
        },

        getToolbar: function() {
            return this.contentModule.toolbar;
        },

        hideInfo: function() {
        	if(this.layout && this.layout.hide){
        		this.layout.hide("east");
        	}
        },

        openInfo: function() {
        	this.layout.open("east");
        },

        appendToolbarButton: function(items, index) {
            this.content.appendToolbarButton(items, index);
        },
        
        reloadTags : function(notRefreshContent){
        	
        	this.tagOverview.loadTags(notRefreshContent);
        },
        
        destroy: function() {
            if (this.layout && (!this.layout.destroyed)) {
            	this.layout.destroy();
            }

            if (this.contentModule) {
                this.contentModule.destroy();
                this.contentModule = null;
            }

            if (this.tagOverview) {
                this.tagOverview.destroy();
                this.tagOverview = null;
            }

            this.element.removeClass("overview");
        }
    });

    return OverviewTemplate;
});