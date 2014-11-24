define(function(require) {
    require("cloud/base/cloud");
    require("cloud/lib/plugin/jquery-ui");
    var Button = require("cloud/components/button");
    var template = require("text!./info.html");
    var service = require("cloud/service/service");// 公共service
    var validator = require("cloud/components/validator");
    // require("cloud/lib/plugin/jquery.qtip");

    // infoModule
    var InfoModule = Class.create(cloud.Component, {

        /**
         * 初始化组件
         * 
         * @param $super
         *        {Function} 父函数
         * @param options
         *        {object} 参数
         */
        initialize : function($super, options) {
            $super(options);
            this.options = options;
            this.orgId = null;
            this.element.html(template).addClass("org-info");
            this.infoForm = this.element.find("#info-form");
            this.renderButtons();
            
            locale.render({element:this.element});
        },
        /**
         * 初始化验证插件
         */
        initValidate : function() {
            validator.render("#info-form", {
                promptPosition : "bottomLeft"
            });
        },

        /**
         * 渲染按钮
         */
        renderButtons : function() {
            var self = this;

            this.favorBtn = new Button({
                container : $("div.info-header span.info-org-favor"),
                id : "module-info-org-favor",
                lang : "{title:favor}",
                checkboxCls : "cloud-icon-star",
                checkbox : true,
                events : {
                    click : self.toggleFavor.bind(self)
                }
            });
        },

        /**
         * 按id加载info模块
         * 
         * @param id
         *        {string} 要加载的机构的id
         */
        render : function(id) {
            this.orgId = id;
            if (this.orgId) {
                this.mask();
                this.disable();
                this.loadOrgInfo();
                this.favorBtn.show();
            } else {
                this.clear();
                this.enable();
                this.favorBtn.hide();
            }
        },

        /**
         * 获取当前已加载/正在加载的机构的ID
         */
        getResId : function() {
            return this.orgId ? this.orgId : null;
        },

        /**
         * 根据机构对象（参考API）加载机构
         * 
         * @param data
         *        {object} 要加载的机构对象
         */
        setOrgInfo : function(data) {
            var self = this;
            
            this.setName(data.name);
            this.setAddress(data.address);
            this.setEmail(data.email);
            this.setWebSite(data.website);
            this.setFax(data.fax);
            this.setPhone(data.phone);
            this.setCreator(data.creator);
            this.setCreateTime(data.createTime);
            if(typeof data.deviceCount!=="undefined"){
            	this.setDeviceCount(data.deviceCount);
            }
            else{
            	this.setDeviceCount(data.machineCount);
            }
            this.setGatewayCount(data.gatewayCount);
            this.setSiteCount(data.siteCount)
            if (data.dbInfo){
                this.setDbSize(data.dbInfo.fileSize);
            }else{
                this.setDbSize(null);
            }
            
            if(this.orgId == null){
                this.favorBtn.setSelect(false);
                self.unmask();
            }else{
                service.verifyFavorites([this.orgId], function(data) {
                    this.favorBtn.setSelect(data.result.first() == 1);
                    self.unmask();
                }, this);
            }
            
            this.orgInfo = data;
        },
        
        /**
         * 清除并重置info栏的显示
         */
        clear : function() {
            this.orgId = null;
            this.setOrgInfo({
                name : "",
                address : "",
                email : "",
                website : "",
                fax : "",
                TEL : "",
                creator : "",
                createTime : null,
                deviceCount : 0,
                gatewayCount : 0,
                siteCount : 0
            });
        },

        /**
         * 切换收藏状态
         */
        toggleFavor : function() {
            if (this.favorBtn.isSelected()) {
                this.addFavorite();
            } else {
                this.removeFavorite();
            }
        },

        /**
         * 将当前机构添加到收藏
         */
        addFavorite : function() {
            var self = this;
            if (this.orgId) {
                service.addFavorites(this.orgId, function(data) {
                    if (data.result == "ok") {
                        // alert(locale.get("favor_added"));
                        /*
                         * dialog.render({ lang:"favor_added" });
                         */
                        self.fire("afterInfoUpdated", self.orgId);
                    }
                }, this);
            }
        },

        /**
         * 将当前机构从收藏中移除
         */
        removeFavorite : function() {
            var self = this;
            if (this.orgId) {
                service.removeFavorites(this.orgId, function(data) {
                    if (data.result.id) {
                        // alert(locale.get("favor_removed"));
                        /*
                         * dialog.render({ lang:"favor_removed" });
                         */
                        self.fire("afterInfoUpdated", self.orgId);
                    }
                }, this);
            }
        },

        setName : function(name){
            this.element.find("#info-org-name").val(name);
        },

        getName : function(){
            return this.element.find("#info-org-name").val();
        },
        
        setAddress : function(address){
            this.element.find("#info-org-address").val(address);
        },

        getAddress : function(){
            return this.element.find("#info-org-address").val();
        },
        
        setWebSite : function(site){
            this.element.find("#info-org-website").val(site);
        },

        getWebSite : function(){
            return this.element.find("#info-org-website").val();
        },
        
        setPhone : function(phone){
            this.element.find("#info-org-phone").val(phone);
        },

        getPhone : function(){
            return this.element.find("#info-org-phone").val();
        },

        setFax : function(fax){
            this.element.find("#info-org-fax").val(fax);
        },

        getFax : function(){
            return this.element.find("#info-org-fax").val();
        },

        setEmail : function(email){
            this.element.find("#info-org-contact-email").val(email);
        },

        getEmail : function(){
            return this.element.find("#info-org-contact-email").val();
        },

        setCreator : function(creator){
            this.element.find("#info-org-creator").val(creator);
        },

        getCreator : function(){
            return this.element.find("#info-org-creator").val();
        },
        
        setCreateTime : function(time){
            if (time) {
                time = cloud.util.dateFormat(new Date(time), "yyyy-MM-dd hh:mm:ss");
            }else{
                time = "";
            }
            
            this.element.find("#info-org-createtime").val(time);
        },

        getCreateTime : function(){
            return this.element.find("#info-org-createtime").val();
        },

        setGatewayCount : function(gatewayCount){
            this.element.find("#info-org-count-gateway").text(gatewayCount.toString());
        },

        setDeviceCount : function(deviceCount){
            this.element.find("#info-org-count-userdevice").text(deviceCount.toString());
        },

        setSiteCount : function(siteCount){
            this.element.find("#info-org-count-site").text(siteCount.toString());
        },

        setDbSize : function(size){
            if (size){
                size = cloud.util.unitConversion(size);
                this.element.find("#info-org-count-dbsize").text(size.toString());
            }else{
                this.element.find("#info-org-count-dbsize").text("");
            }
            
        },

        /**
         * 从服务器端获取机构信息
         */
        loadOrgInfo : function() {
            var self = this;
            if(this.orgId){
            	Model.organ({
                    method : "query_with_stat",
                    part : this.orgId,
                    param : {
                        verbose : 100
                    },
                    success : function(data) {
                        if (data){
                            self.setOrgInfo(data);
                        }else{
                        	self.unmask();
                        }
                    }
                })
            }
        },

        // loadCustomers: function(callback) {
        // var self = this;
        // cloud.Ajax.request({
        // url: "api/customers",
        // parameters: {
        // verbose: 3
        // },
        // type: "get",
        // success: function(data) {
        // callback && callback.call(self, data.result);
        // }.bind(this)
        // });
        // },

        /**
         * 设置组件为可编辑状态
         */
        enable : function() {
            // this.tipsBubble.open(this.map, this.locMarker);
        },

        /**
         * 设置组件为不可编辑状态
         */
        disable : function() {
            this.infoForm.find("input, select").attr("disabled", true);
        },

        /**
         * 用户点击取消编辑按钮的处理函数
         */
        cancelEdit : function() {
            if (this.orgId) {
                this.loadOrgInfo();
            } else {
                this.fire("cancelCreate");
            }
            this.disable();
        },

        /**
         * 将当前info提交到服务器（更新或新增）
         */
        submit : function() {
        },

        destroy : function($super) {
            this.orgId = null;
            this.orgInfo = null;
            this.favorBtn && this.favorBtn.destroy();
            this.element.html(template).removeClass("org-info");
            this.element.html("");
            // 一系列的清除动作

            $super();
        }

    });
    return InfoModule;
});