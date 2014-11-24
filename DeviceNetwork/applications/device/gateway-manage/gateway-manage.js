define(function(require) {
    var cloud = require("cloud/base/cloud");
    var html = require("text!./gateway-manage.html");
    var NavThird = require("cloud/components/nav-third");
    var layout = require("cloud/lib/plugin/jquery.layout");
    var service = require("./service");
    
    var GatewayManage = Class.create(cloud.Component, {
        initialize: function($super, options) {
            $super(options);
            this.business = options.business;
            this.elements = {
                nav: {
                    id: "gateway-manage-nav",
                    "class": null
                },
                content: {
                    id: "gateway-manage-content",
                    "class": null
                }
            };
            this.resources = options.resources;
            this.modelId = this.resources[0]["modelId"];
            this.deviceConfig = null;
            this.deviceFirmware = null;
            this.deviceConsole = null;
            this.navThird = null;
            this._render();
            locale.render({element:this.element});
        },

        _render: function() {
            this._renderHtml();
            this._renderLayout();
            this._renderNavThird();
        },

        _renderHtml: function() {
            this.element.html(html);
        },

        _renderLayout: function() {
            var self = this;
                self.layout = this.element.find('#gateway-manage').layout({
                    defaults: {
                        paneClass: "pane",
                        togglerClass: "cloud-layout-toggler",
                        resizerClass: "cloud-layout-resizer",
                        spacing_open: 1,
                        spacing_closed: 1,
                        togglerLength_closed: 50,
                        resizable: false,
                        slidable: false
                    },
                    west: {
                        paneSelector: "#" + self.elements.nav.id,
                        size: 182
                    },
                    center: {
                        paneSelector: "#" + self.elements.content.id
                    }
                });
        },

        _renderNavThird: function() {
            var self = this;
            var initActive_config = 0;
            var initActive_upgrade = 0;
            var initActive_console = 0;
            if (this.business == "config") {
                initActive_config = 1;
            } else if (this.business == "upgrade") {
                initActive_upgrade = 1;
            } else if (this.business == "console") {
                initActive_console = 1;
            } else {
                initActive_config = 1;
            }
            this.navThird = new NavThird({
                selector: this.element.find("#" + this.elements.nav.id),
                main: {
                    text: locale.get("gateway_management"),//"网关管理",
                    lang: "gateway-manage"
                },
                sub: [{
                    text: locale.get("device_config"),//"设备配置",
                    lang: "gateway-manage-config",
                    id: "gateway-manage-config-nav",
                    status: initActive_config,
                    click: function() {
                        self._renderDeviceConfig();
                    }

                }, {
                    text: locale.get("device_upgrade"),//"设备升级",
                    lang: "gateway-manage-upgrade",
                    id: "gateway-manage-upgrade-nav",
                    status: initActive_upgrade,
                    click: function() {
                        self._renderDeviceFirmware();
                    }
//                }, {
//                    text: "远程控制",
//                    lang: "gateway-manage-console",
//                    id: "gateway-manage-console-nav",
//                    status: initActive_console,
//                    click: function() {
//                        self._renderDeviceConsole();
//                    }
                }]
            });
            if (this.business == "config") {
                self._renderDeviceConfig();
            } else if (this.business == "upgrade") {
                self._renderDeviceFirmware();
            } else if (this.business == "console") {
                self._renderDeviceConsole();
            } else {
                self._renderDeviceConfig();
            }
        },

        _renderDeviceConfig: function() {
            $("#gateway-manage-content-config").show();
            $("#gateway-manage-content-upgrade").hide();
            $("#gateway-manage-content-console").hide();
            var self = this;
            if (!this.deviceConfig) {
                require(["./config"], function(DeviceConfig) {
                    self.deviceConfig = new DeviceConfig({
                        selector: self.element.find("#gateway-manage-content-config"),
                        resources: self.resources,
                        modelId: self.modelId
                    });
                });
            }
        },

        _renderDeviceFirmware: function() {
            $("#gateway-manage-content-config").hide();
            $("#gateway-manage-content-upgrade").show();
            $("#gateway-manage-content-console").hide();
            var self = this;
            if (!this.deviceFirmware) {
                require(["./upgrade"], function(DeviceFirmware) {
                    self.deviceFirmware = new DeviceFirmware({
                        selector: self.element.find("#gateway-manage-content-upgrade"),
                        resources: self.resources,
                        modelId: self.modelId
                    });
                });
            }
        },

        _renderDeviceConsole: function() {
            $("#gateway-manage-content-config").hide();
            $("#gateway-manage-content-upgrade").hide();
            $("#gateway-manage-content-console").show();
            var self = this;
            if (!this.deviceConsole) {
                require(["./console"], function(DeviceConsole) {
                    self.deviceConsole = new DeviceConsole({
                        selector: self.element.find("#gateway-manage-content-console")
                    });
                });
            }
        },

        destroy: function() {
            if (this.navThird) {
                if (this.navThird.destroy) {
                    this.navThird.destroy();
                }
            }
            if (this.deviceConfig) {
                if (this.deviceConfig.destroy) {
                    this.deviceConfig.destroy();
                }
            }
            if (this.deviceFirmware) {
                if (this.deviceFirmware.destroy) {
                    this.deviceFirmware.destroy();
                }
            }
            if (this.deviceConsole) {
                if (this.deviceConsole.destroy) {
                    this.deviceConsole.destroy();
                }
            }
            this.layout.destroy();
            this.navThird.destroy();
            this.element.empty();
            this.elements = null;
        }
    });

    return GatewayManage;

});