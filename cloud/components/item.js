/**
 * @author Jerolin
 * @filename item
 * @filetype {class}
 * @filedescription "展示资源的一个块结构"
 * @filereturn {function} Item "函数引用"
 */
define(function(require){
    //dependency injection
    require("cloud/base/cloud");
    require("cloud/lib/plugin/jquery-ui");
    require("cloud/resources/css/item.css");
    
    var Item = Class.create(cloud.Component, {
        moduleName: "item",
        /**
         * @author JeroLin
         * @name initialize
         * @type {function}
         * @description "该类的实例化函数"
         * @param {function} $super "父类引用"
         * @param {object} options "json对象"
         * @return
         */
        initialize: function($super, options){
            //default parameters
            cloud.util.defaults(options, {
                icon: null,
                name: "",
                description: "",
                status: "default",
                notifications: 0,
                shared: false,
                gateway : false,
                favor: false,
                selected: false,
                selectable: true,
                signal: null,
                width: 170,
                height: 60,
                role: null,
                type: "entity", // marker or entity
                events: {}
            });
            //if not assigned an element, then generate a div element and append it to container which from the parameters
            $super(options);

            this.widgets = {};
            
            //draw all the contents for item module.
            this.draw();
            //set data to item.
            this.setName(options.name);
            this.setDescription(options.description);
            this.setNotifications(options.notifications);
            this.setShared(options.shared);
            this.setFavor(options.favor);
            this.setSelectable(options.selectable, options.selected, true);
            this.setBusinessState(options.businessState);
            this.setGateway(options.gateway);
            this.setOnlineState(options.online);
            var self = this;
            //bind events.
            this.element.click(function(){
                self.fire("click", self);
            }).mousedown(function(){
                self.element.addClass("cloud-item-active");
            }).mouseup(function(){
                self.element.removeClass("cloud-item-active");
            }).mouseleave(function(){
                self.element.removeClass("cloud-item-active");
            });
            [this.widgets.select, this.widgets.notifications, this.widgets.share, this.widgets.favor].invoke("mousedown", function(events){
                return false;
            });
//            console.log(this.options.notifications);
        },
        /**
         * @author JeroLin
         * @name draw
         * @type {method}
         * @description "绘制组件的dom结构"
         * @return
         */
        draw: function(){
            //Disable selection of text content
            this.element.disableSelection();
            this.element.addClass("cloud-item");
            
            this.body = $("<div>").addClass("cloud-item-body");
            this.content = $("<div>").addClass("cloud-item-content").appendTo(this.body);
            
            this.element.addClass("cloud-item-status-" + this.options.status);
            //Create content
            this.widgets.name = $("<div>").addClass("cloud-item-name f13");
            this.widgets.desc = $("<div>").addClass("cloud-item-desc");
            this.widgets.signal = $("<div>").addClass("cloud-item-signal");
            
            //Create widgets
            if(this.options.status != "inherent"){
            	this.widgets.select = $("<div>").addClass("cloud-item-widget cloud-item-select cloud-icon-choice").click(this.onSelectItem.bind(this));
            }else{
            	this.widgets.select = $("<div>");
            }
            this.widgets.gateway = $("<div>").addClass("cloud-item-widget cloud-item-gateway");
            this.widgets.businessState = $("<div>").addClass("cloud-item-widget cloud-item-businessState");
            this.widgets.notifications = $("<div>").addClass("cloud-item-widget cloud-item-notification");
            this.widgets.favor = $("<div>").addClass("cloud-item-widget cloud-item-favor cloud-icon-default cloud-icon-star").attr("title", locale.get({
                lang: "favor"
            })).click(this.onToggleFavorites.bind(this));
            
            this.widgets.share = $("<div>").addClass("cloud-item-widget cloud-item-shared cloud-icon-default cloud-icon-share").attr("title", locale.get({
                lang: "share"
            })).click(this.onToggleShared.bind(this));
            
            //			$("<div>").addClass("cloud-item-icon cloud-icon-item-" + this.options.type).appendTo(this.body);
            
            if (this.options.type == "marker") {
                this.drawMarkerWidgets();
            }
            else {
                this.drawEntityWidgets();
            }
            
            $("<div>").addClass("ui-helper-clearfix").appendTo(this.body);
            this.body.appendTo(this.element);
        },
        
        /**
         * @author JeroLin
         * @name drawEntityWidgets
         * @type {method}
         * @description "渲染展示在模版中心位置的item组件"
         * @return
         * Render item which shown in the middle content of template.
         */
        drawEntityWidgets: function(){
            this.element.addClass("cloud-item-entity");
            this.element.addClass("cloud-item-status-default");
            [this.widgets.name, this.widgets.desc, this.widgets.signal].invoke("appendTo", this.content);
            
            var widgetsContainer = $("<div>").addClass("cloud-item-widget-container").prependTo(this.body);
            
            
            this.widgets.select.appendTo(this.body);
            this.widgets.share.hide();
            this.statusBar = $("<div>").addClass("cloud-item-statusbar").appendTo(this.body);
            [this.widgets.notifications, this.widgets.favor, this.widgets.share, this.widgets.businessState, this.widgets.gateway, $("<div>").addClass("ui-helper-clearfix")].invoke("appendTo", widgetsContainer);
        },
        /**
         * @author JeroLin
         * @name drawMarkerWidgets
         * @type {method}
         * @description "绘制展示在模版左边的item组件"
         * @return
         * Render item which shown in the left overview part of template 
         */
        drawMarkerWidgets: function(){
            this.element.addClass("cloud-item-marker");
            this.element.addClass("cloud-item-status-" + this.options.status);
            
            [this.widgets.name, this.widgets.desc, this.widgets.signal].invoke("appendTo", this.content);
            [this.widgets.select, this.widgets.notifications, this.widgets.favor, this.widgets.share].invoke("appendTo", this.body);
        },
        /**
         * @author JeroLin
         * @name setName
         * @type {method}
         * @description "设置组件的提示信息"
         * @param {string} name "提示信息"
         * @return
         */
        setName: function(name){
            this.options.name = name;
            this.widgets.name.text(this.options.name).attr("title", this.options.name);
        },
        /**
         * @author JeroLin
         * @name setDescription
         * @type {method}
         * @description "设置组件的描述信息"
         * @param {string} desc "描述信息"
         * @return
         */
        setDescription: function(desc){
            this.options.description = desc;
            this.widgets.desc.html(this.options.description);
        },
        /**
         * @author JeroLin
         * @name setFavor
         * @type {method}
         * @description "设置组件所代表资源的收藏状态"
         * @param {boolean} favor "true:收藏;false:不收藏"
         * @return
         */
        setFavor: function(favor){
            var options = this.options, $favor = this.widgets.favor;
            options.favor = favor;
            if (favor === true) {
                $favor.removeClass("cloud-icon-default").addClass("cloud-icon-active");
            }
            else {
                $favor.addClass("cloud-icon-default").removeClass("cloud-icon-active");
            }
            
            if (this.options.favor != favor) {
                this.widgets.favor.toggleClass("cloud-icon-default").toggleClass("cloud-icon-active");
                this.options.favor = !this.options.favor;
            }
        },
        /**
         * @author JeroLin
         * @name setShared
         * @type {method}
         * @description "设置组件代表资源的分享状态"
         * @param {boolean} shared "true:分享;false:不分享"
         * @return
         */
        setShared: function(shared){
            var options = this.options, $shared = this.widgets.share;
            
            options.shared = shared;
            if (options.shared === true) {
                $shared.removeClass("cloud-icon-default").addClass("cloud-icon-active");
            }
            else {
                $shared.addClass("cloud-icon-default").removeClass("cloud-icon-active");
            }
        },
        /**
         * Set the item is selectable or not,and set it selected or not.
         * @author JeroLin
         * @name setSelectable
         * @type {method}
         * @description "设置组件的选择状态"
         * @param {boolean} selectable "true:可选;false:不可选"
         * @param {boolean} selected "true:选中;false:不选中"
         * @param {boolean} notTriggerEvt "是否透传事件"
         * @return
         */
        setSelectable: function(selectable, selected, notTriggerEvt){
            this.options.selectable = selectable;
            this.options.selected = selected || this.options.selected;
            if (selectable) {
                this.widgets.select.show();
                if (this.options.selected) {
                    this.select(notTriggerEvt);
                }
                else {
                    this.unselect(notTriggerEvt);
                }
            }
            else {
                this.widgets.select.hide();
            }
            
        },
        /**
         * @author JeroLin
         * @name setNotifications
         * @type {method}
         * @description "设置组件的通知信息"
         * @param {object} notifications "通知信息的对象"
         * @return
         */
        setNotifications: function(notifications){
            this.options.notifications = notifications;
            
            this.widgets.notifications.text(this.options.notifications);
            if (this.options.notifications > 0 && this.options.type == "entity") {
                this.widgets.notifications.show();
            }
            else {
                this.widgets.notifications.hide();
            }
        },
        /**
         * @author JeroLin
         * @name setStatus
         * @type {method}
         * @description "设置组件状态"
         * @param {string} status "组件状态"
         * @return
         */
        setStatus: function(status){
            var options = this.options;
            this.element.removeClass("cloud-item-status-" + options.status);
            options.status = status || options.status || "default";
            this.element.addClass("cloud-item-status-" + options.status);
        },
        /**
         * @author JeroLin
         * @name setGateway
         * @type {method}
         * @description "设置组件是否为网关"
         * @param {boolean} gateway "true:网关;false:非网关"
         * @return
         */
        setGateway : function(gateway){
            var gatewayIcon = "cloud-icon-config cloud-icon-active";
            if (gateway){
                this.widgets.gateway.attr("title", locale.get("gateway_models")).removeClass(gatewayIcon).addClass(gatewayIcon).show();
            }else{
                this.widgets.gateway.removeAttr("title").removeClass(gatewayIcon).hide();
            }
        },
        /**
         * @author JeroLin
         * @name setBusinessState
         * @type {method}
         * @description "设置组件的业务状态"
         * @param {number} businessState "业务状态"
         * @return
         */
        setBusinessState: function(businessState){
            if (businessState != null){
                var classStr = "";
                
                var inuseCls = "cloud-icon-businesstate-inuse ";
                var buildingCls = "cloud-icon-businesstate-building ";
                var repairCls = "cloud-icon-businesstate-repair ";
                var breakdownCls = "cloud-icon-businesstate-breakdown ";
                var allCls = inuseCls + buildingCls + repairCls + breakdownCls;
                
                var titleStr = "";
                switch (businessState) {
                    case 1:
                        classStr = inuseCls;
                        titleStr = locale.get({
                            lang: "commissioning"
                        });
                        break;
                    case 0:
                        classStr = buildingCls;
                        titleStr = locale.get({
                            lang: "construction"
                        });
                        break;
                    case 3:
                        classStr = repairCls;
                        titleStr = locale.get({
                            lang: "overhaul"
                        });
                        break;
                    case 2:
                        classStr = breakdownCls;
                        titleStr = locale.get({
                            lang: "fault"
                        });
                        break;
                }
                
                this.widgets.businessState.attr("title", titleStr).removeClass(allCls).addClass(classStr).show();
            }else{
                this.widgets.businessState.hide();
            }
            
        },
        /**
         * @author JeroLin
         * @name setOnlineState
         * @type {method}
         * @description "设置组件的在线状态"
         * @param {number} online "在线状态信息"
         * @return
         */
        setOnlineState: function(online){
            if (this.statusBar) {
                if (online) {//online != 0/null/undefined
                    this.statusBar.removeClass("cloud-item-statusbar-offline").addClass("cloud-item-statusbar-online");
                }
                else {
                    this.statusBar.removeClass("cloud-item-statusbar-online").addClass("cloud-item-statusbar-offline");
                }
            }
        },
        /**
         * Toggle the item be selected or not,and trigger 'select' event.
         * @author JeroLin
         * @name onSelectItem
         * @type {method}
         * @description "切换组件被选中和不被选中两种状态"
         * @param {object} event "事件对象"
         * @return {boolean} false
         */
        onSelectItem: function(event){
            this.options.selected = !this.options.selected;
            this.setSelected(this.options.selected);
//            this.fire("select", this);
            event.stopPropagation();
            return false;
        },
        /**
         * Set the item selected or unselect
         * @author JeroLin
         * @name setSelected
         * @type {method}
         * @description "设置组件的选择状态"
         * @param {boolean} selected "true:被选中;false:不被选中"
         * @return
         */
        setSelected: function(selected){
            if (!Object.isUndefined(selected) && selected) {
                this.select();
            }
            else {
                this.unselect();
            }
        },
        
        /**
         * Select the item.
         * @author JeroLin
         * @name select
         * @type {method}
         * @description "选中组件"
         * @param {boolean} notTriggerEvt "是否透传事件"
         * @return
         */
        select: function(notTriggerEvt){
            if (this.options.selectable === true) {
                this.options.selected = true;
                this.widgets.select.removeClass("cloud-icon-default");
                this.widgets.select.addClass("cloud-icon-active");
                if (!notTriggerEvt) {
                    this.fire("select", this);
                };
            }
        },
        
        /**
         * Unselect the item.
         * @author JeroLin
         * @name unselect
         * @type {method}
         * @description "组件撤销选中状态，变为为选中"
         * @param {boolean} notTriggerEvt "是否透传事件"
         * @return
         */
        unselect: function(notTriggerEvt){
            if (this.options.selectable === true) {
                this.options.selected = false;
                this.widgets.select.addClass("cloud-icon-default");
                this.widgets.select.removeClass("cloud-icon-active");
                if (!notTriggerEvt) {
                    this.fire("select", this);
                }
            }
        },
		/**
		 * Judge the item whether selected
		 * @author JeroLin
		 * @name isSelected
		 * @type {method}
		 * @description "查看组件是否处于选中状态"
		 * @return
		 */        
        isSelected: function(){
            return this.options.selected;
        },
		/**
		 * Set option to item,
		 * see method update() to get more info.
		 * @author JeroLin
		 * @name setOption
		 * @type {method}
		 * @description "将参数内容options配置到组件中"
		 * @param {string} option "名字"
		 * @param {string} value "值"
		 */
        setOption: function(option, value){
            var self = this;
            var setter = {
                icon: null,
                name: self.setName,
                description: self.setDescription,
                status: self.setStatus,
                businessState: self.setBusinessState,
                gateway : self.setGateway,
                notifications: self.setNotifications,
                shared: self.setShared,
                favor: self.setFavor,
                online: self.setOnlineState,
                selected: self.setSelected,
                selectable: self.setSelectable,
                signal: self.setSignal,
                role: null,
                events: self.on
            };
            return setter[option] ? setter[option].call(self, value) : null;
        },
        /**
         * @author JeroLin
         * @name onToggleShared
         * @type {method}
         * @description "切换分享状态"
         * @returns {boolean} false
         */
        onToggleShared: function(){
            this.fire("toggleshare", this);
            return false;
        },
        /**
         * @author JeroLin
         * @name onToggleFavorites
         * @description "切换收藏状态"
         * @returns {Boolean} false
         */
        onToggleFavorites: function(){
            this.fire("togglefavor", this);
            return false;
        },
        /**
         * Set options to item, the options accpet icon, name, description, status, notifications, 
         * shared, favor, selected, selectable, signal and events properties. 
         * @author JeroLin
         * @name update
         * @type {method}
         * @description "更新组件信息，配置组件"
         * @return
         */
        update: function(options){
            if (options) {
                $H(options).each(function(option){
                    this.setOption(option.key, option.value);
                }, this);
            }
            
        },
        /**
         * @author JeroLin
         * @name destroy
         * @description "摧毁组件"
         * @param {function} $super "父类引用"
         * @type {method}
         * @return
         */
        destroy: function($super){
            this.widgets = null;
            this.content = null;
            this.body.remove();
            this.body = null;
            this.options.name = null;
            this.options.description = null;
            this.options.notifications = null;
            this.options.selectable = null;
            this.options.selected = false;
            this.options.shared = false;
            $super();
        }
    });
    cloud.Item = cloud.Item || Item;
    return Item;
});
