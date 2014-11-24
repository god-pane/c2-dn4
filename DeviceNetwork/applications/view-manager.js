/**
 * @author Jerolin
 */
define(function(require) {
    require("cloud/base/cloud");
    var View = Class.create(cloud.Component, {
        initialize: function($super, id, logo, name, url) {
            $super("View-Item");

            this.id = id;
            this.logo = cloud.config.FILE_SERVER_URL + "/api/file/" + logo + "?access_token=" + cloud.Ajax.getAccessToken();
            this.name = name;
            this.url = url;
            this.wrapper = "#user-nav-view-model";

            this.template = new Template("<li id='user-nav-view-#{id}'><a href='javascript:void(0)'><img src='123' height=25 title='#{name}' /></a></li>");
            //this.template = new Template("<li id='user-nav-view-#{id}'><a href='javascript:void(0)'><img src='#{logo}' height=25 title='#{name}' /></a></li>");

            this.element = $(this.template.evaluate(this)).appendTo(this.wrapper).addClass("view-item").click(this.url, function(event) {
                cloud.Platform.loadApplication(event.data);
                $("#user-nav-view-model .view-item").removeClass("view-item-active");
                $(this).addClass("view-item-active");
            });
        },

        active: function() {
            cloud.Platform.loadApplication(this.url);
            $("#user-nav-view-model .view-item").removeClass("view-item-active");
            this.element.addClass("view-item-active");
        }
    });

    var ViewManager = Class.create(cloud.Component, {
        initialize: function($super, type) {
            $super("View", "#nav-sub-left-view");

            if (type) {
                this.type = type;
            } else {
                throw new Error("Miss type parameter.");
            }
            this.clients = $H();
            this.element.empty();
            this.loadClients();
        },

        loadClients: function() {
            //            cloud.Ajax.request({
            //                url: "api/apps",
            //                type: "Get",
            //                parameters: {
            //                    verbose: 100,
            //                    types: this.type
            //                },
            //                success: function(data){
            //                    this.render(data.result);
            //                    
            //                    var defaultView = data.result.find(function(view){
            //                        return view["default"] == 1;
            //                    });
            //                    this.getItem(defaultView._id).active();
            //                }.bind(this)
            //            });

            var data = null;


            data = [{
                oid: "ABCD",
                _id: "123",
                name: "Overview",
                type: this.type,
                "class": "view",
                url: "./system/role/overview",
                logo: "510955d970e7cd45043fb834",
                "default": 1
            }, {
                oid: "ABCD",
                _id: "124",
                name: "Table",
                type: this.type,
                "class": "view",
                url: "./system/role/table",
                logo: "510955d970e7cd45043fb834",
                "default": 0
            }, {
                oid: "ABCD",
                _id: "125",
                name: "GIS",
                type: this.type,
                "class": "view",
                url: "xxx.html",
                logo: "510955d970e7cd45043fb834",
                "default": 0
            }];
            this.render(data);

            var defaultView = data.find(function(view) {
                return view["default"] == 1;
            });
            this.getItem(defaultView._id).active();
        },

        getItem: function(id) {
            return this.clients.get(id);
        },

        render: function(data) {
            data.each(function(client) {
                this.clients.set(client._id, new View(client._id, client.logo, client.name, client.url));
            }, this);
        },
        destroy: function() {
            this.element.empty();
            this.clients = null;
        }
    });

    cloud.ViewManager = ViewManager;
    return ViewManager;
});