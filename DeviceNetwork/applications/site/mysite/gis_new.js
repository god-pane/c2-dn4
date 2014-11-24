/**
 * Created by zhangyl on 14-6-4.
 */
define(function(require) {
    // var maps = require("cloud/components/map");
    var Toolbar = require("cloud/components/toolbar");
    var Button = require("cloud/components/button");
    var TagOverview = require("../../components/tag-overview");
    var ContentTable = require("../../components/content-table");
    var service = require("./service");
    var html = require("text!./gis.html");
    // var InfoModule = require("./info");
    require("./gis.css");
    require("cloud/lib/plugin/jquery.qtip");
    var locale = require("cloud/base/locale");


//    require("cloud/lib/plugin/leaflet-src");
    var GisMap = require("./gis-map");
    var columns = [
        {
            "title": "状态",
            "dataIndex": "online",
            "lang":"{text:state}",
            "cls": null,
            "width": "17%",
            render:function(data, type, row){
                var display = "";
                if ("display" == type) {
                    switch (data) {
                        case 1:
                            var onlineStr = locale.get({lang:"online"});
                            display += new Template(
                                "<div  style = \"display : inline-block;\" class = \"cloud-table-online\" title = \"#{status}\"}></div>")
                                .evaluate({
                                    status : onlineStr
                                });
                            break;
                        case 0:
                            var offlineStr = locale.get({lang:"offline"});
                            display += new Template(
                                "<div  style = \"display : inline-block;\" class = \"cloud-table-offline\" title = \"#{status}\"}></div>")
                                .evaluate({
                                    status : offlineStr
                                });
                            break;

                        default:
                            break;
                    }
                    return display;
                } else {
                    return data;
                }
            }
        } , {
            "title": "现场名称",
            "dataIndex": "name",
            "width": "83%",
            "lang":"{text:site_name}"
        }];
    var SitesGis = Class.create(cloud.Component, {
        initialize : function($super, options) {
            var self = this;
            this.service = service;
            this.moduleName = "site-gis";
            $super(options);
            this.element.html(html);
            // this.element.addClass(this.moduleName);
            this.initLayout();

            this.initMap();
            this.initList();
            this._initToolbar();

            locale.render({
                element : this.element
            });
        },

        initMap : function(){
            this.gisMap = new GisMap({
                selector : this.element.find(".site-gis-map"),
                events : {
                    "afterCreated" : function(id, data){
                        this.siteList.addResource(id);
                        this.reloadTags(true);
                    },
                    "afterUpdated" : function(id, data){
                        this.siteList.updateRowByData(data);
                        this.reloadTags(true);
                    },
                    "afterDeleted" : function(res){
                        this.reloadTags();
                    },
                    scope : this
                }
            })
        },

        initLayout: function(){
            var self = this;
            this.layout = $(".site-gis").layout({
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
                    paneSelector: ".site-gis-list",
                    size: 350
                },
                center: {
                    paneSelector: ".site-gis-map",
                    onresize_end : function(){
                        self.gisMap.resize();
                    }
                },

            });
        },

        initList : function() {
            var self = this;
            this.siteList = new ContentTable({
                selector: this.element.find(".site-gis-list"),
                toolbarFeatrues : false,
                rowSelectModel : "none",
                service: this.service,
                contentColumns: columns,
                events : {
                    "afterSelect" : function(reses, row, isSelected){
//                        console.log(arguments, "afterSelect")
                    },
                    "checkAll" : function(res){
//                        console.log(res, "checkAll")
                    },
                    "onTurnPage" : function(page, data){
                        this.gisMap.deleteMarkers();
//                         self.gisMap.addMarkers(data.result ? data.result : data);
                    },
                    "afterRendered" : function(data){
                        this.gisMap.deleteMarkers();
                        this.gisMap.addMarkers(data);
                    },
                    "click" : function(id){
                        this.gisMap.jumpToSite(id);
                    },
                    scope : this
                }
            });


        },

        _initToolbar : function(){
            /* toolbar start */
            var toolbar = this.siteList.getToolbar();
            var tagBtn = new Button({
                imgCls: "cloud-icon-label",
                lang:"{title:tag}",
                id: this.moduleName + "-tag-button"
            });

            var tagLabel = $("<span>").addClass("gis-sitelist-tb-item").text(locale.get("tag+:"));
            this.tagName = $("<span>").addClass("gis-sitelist-tb-item").text("");

            toolbar.appendLeftItems([tagBtn, tagLabel, this.tagName]);

            var tagContent = $("<div id='gis-tag-overview'>").appendTo(this.element);

            this.createTagOverview(tagBtn, tagContent);

//            this._initSearchBar(toolbar);
        },

        _initSearchBar : function(toolbar){
            var searchBtn = new Button({
//                imgCls: "cloud-icon-label",
//                lang:"{title:tag}",
                text : "Search"
            });

            var searchContent = $("<span>").width(200);

            toolbar.appendRightItems([searchBtn, searchContent]);
        },

        createTagOverview: function(btn, tagContent) {
            var self = this;
            this.tagOverview = new TagOverview({
                events: {
                    "click": function(tag,tagobj){
                        var self = this;
                        this.mask();
                        this.tagName.text(tagobj.name);
                        this.tagId = tagobj._id;
                        this.gisMap.deleteMarkers();
                        //get the resources ids in the tag, then use content module to render these resources.
                        this.service.getResourcesIds = tag.loadResourcesData;
                        this.siteList.render(this.service,tag,function(){
                            self.unmask();
//                            var data = self.siteList.getContentData();
//                            self.gisMap.addMarkers(data);
                        });
                    },
                    "update":function(tag){
                        if(tag._id == this.tagId){
                            this.tagName.text(tag.name);
                        }
                    },
                    scope: this
                },
                service: this.service,
                selector: tagContent
            });

            //bind a qtip window on the tag bubbon, to show tag overview component.
            btn.element.qtip({
                content: {
                    text: tagContent
                },
                position: {
                    my: "top left",
                    at: "bottom middle"
                },
                show: {
                    event: "click"
                },
                events: {
                    render: function() {
                        //before render, set the tag overview component's position to the visiable window.
                        tagContent.css({
                            marginLeft: 0
                        });
                    }
                },
                hide: {
                    event: "click unfocus"
                },
                style: {
                    classes: "qtip-shadow cloud-qtip qtip-rounded",
                    def: false
                }
            });
        },

        reloadTags : function(notRefreshContent){
            this.tagOverview.loadTags(notRefreshContent);
        },

        destroy : function($super) {
            $super();
        }
    });

    return SitesGis;
});