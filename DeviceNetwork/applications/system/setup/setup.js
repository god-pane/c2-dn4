define(function(require) {
    var cloud = require("cloud/base/cloud");
    var html = require("text!./setup.html");
    var NavThird = require("cloud/components/nav-third");
    var layout = require("cloud/lib/plugin/jquery.layout");
    var service = require("./service");
    var SystemSetup = Class.create(cloud.Component, {
        initialize: function($super, options) {
            $super(options);
            this.elements = {
                nav: {
                    id: "system-setup-nav",
                    "class": null
                },
                content: {
                    id: "system-setup-content",
                    "class": null
                }
            };
            this.alarmSetup = null;
            this.dtSetup = null;
            this.logSetup = null;
            this.navThird = null;
            this._render();
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
                self.layout = this.element.find('#system-setup').layout({
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
            this.navThird = new NavThird({
                selector: this.element.find("#" + this.elements.nav.id),
                main: {
                    text: "系统设置",
                    lang: "system-setup"
                },
                sub: [{
                    text: "机构信息",
                    lang: "system-setup-orgnization-info",
                    id: "system-setup-orgnization-info-nav",
                    status: 0,
                    click: function() {
//                        alert("机构信息");
                    }

                }, {
                    text: "界面风格",
                    lang: "system-setup-page-style",
                    id: "system-setup-page-style-nav",
                    status: 0,
                    click: function() {
//                        alert("界面风格");
                    }
                }, {
                    text: "告警设置",
                    lang: "system-setup-alarm-setup",
                    id: "system-setup-alarm-setup-nav",
                    status: 0,
                    click: function() {
//                        alert("告警设置");
                    }
                },{
                    text: "日志设置",
                    lang: "system-setup-log-setup",
                    id: "system-setup-log-setup-nav",
                    status: 0,
                    click: function() {
//                        alert("日志设置");
                    }
                },{
                    text: "数据备份与恢复",
                    lang: "system-setup-dbbackup-rec",
                    id: "system-setup-dbbackup-rec-nav",
                    status: 0,
                    click: function() {
//                        alert("数据备份与恢复");
                    }
                },{
                    text: "软件授权管理",
                    lang: "system-setup-softAuth-mgr",
                    id: "system-setup-softAuth-mgr-nav",
                    status: 0,
                    click: function() {
//                        alert("软件授权管理");
                    }
                },{
                    text: "设备快线服务设置",
                    lang: "system-setup-dtSetup",
                    id: "system-setup-dtSetup-nav",
                    status: 1,
                    click: function() {
                        self._renderDtSetup();
                    }
                },{
                    text: "流量预警设置",
                    lang: "system-setup-flowAlarmSetup",
                    id: "system-setup-flowAlarmSetup-nav",
                    status: 0,
                    click: function() {
//                        alert("流量预警设置");
                    }
                },{
                    text: "地图服务设置",
                    lang: "system-setup-mapSeverSetup",
                    id: "system-setup-mapSeverSetup-nav",
                    status: 0,
                    click: function() {
//                        alert("地图服务设置");
                    }
                },{
                    text: "其他设置",
                    lang: "system-setup-othersSetup",
                    id: "system-setup-othersSetup-nav",
                    status: 0,
                    click: function() {
//                        alert("其他设置");
                    }
                }]
            });
            
            //初始化
            self._renderDtSetup();
        },


        _hideDivExceptThis:function(divElement){
            $("#system-setup-content-alarmSetup").hide();
            $("#system-setup-content-dtSetup").hide();
            $("#system-setup-content-logSetup").hide();
            $("#system-setup-orgnization-info").hide();
            $("#system-setup-page-style").hide();
            $("#system-setup-dbbackup-rec").hide();
            $("#system-setup-softAuth-mgr").hide();
            $("#system-setup-flowAlarmSetup").hide();
            $("#system-setup-mapSeverSetup").hide();
            $("#system-setup-othersSetup").hide();

            $("#"+divElement).show();            
        },

        _renderAlarmSetup: function() {
            /*
            $("#system-setup-content-alarmSetup").show();
            $("#system-setup-content-dtSetup").hide();
            $("#system-setup-content-logSetup").hide();
            var self = this;
            if (!this.deviceConfig) {
                require(["./config"], function(DeviceConfig) {
                    self.deviceConfig = new DeviceConfig({
                        selector: self.element.find("#system-setup-content-config"),
                        resources: self.resources,
                        modelId: self.modelId
                    });
                });
            }
            */
        },

        _renderDtSetup: function() {
            this._hideDivExceptThis("system-setup-content-dtSetup");
            var self = this;
            if (!this.dtSetup) {
                require(["./dt-setup"], function(DTSetup) {
                    self.dtSetup = new DTSetup({
                        selector: self.element.find("#system-setup-content-dtSetup")
                    });
                });
            }
        },

        _renderLogSetup: function() {
            /*
            $("#system-setup-content-alarmSetup").hide();
            $("#system-setup-content-dtSetup").hide();
            $("#system-setup-content-logSetup").show();
            var self = this;
            if (!this.deviceConsole) {
                require(["./console"], function(DeviceConsole) {
                    self.deviceConsole = new DeviceConsole({
                        selector: self.element.find("#system-setup-content-console")
                    });
                });
            }
            */
        },

        destroy: function() {
            if (this.navThird) {
                if (this.navThird.destroy) {
                    this.navThird.destroy();
                }
            }
            if (this.dtSetup) {
                if (this.dtSetup.destroy) {
                    this.dtSetup.destroy();
                }
                else{
                    this.dtSetup=null;
                }
            }
            this.layout.destroy();
            this.navThird.destroy();
            this.element.empty();
            this.elements = null;
        }
    });

    return SystemSetup;

});