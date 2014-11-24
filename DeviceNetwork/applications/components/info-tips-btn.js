/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author jerolin
 */
define(function(require) {
    require("cloud/base/cloud");
    var Button = require("cloud/components/button");
    require("cloud/lib/plugin/jquery.qtip");
    
    //TODO use Button instead of Component as parent class
    var InfoTipsBtn = Class.create(cloud.Component, {
        moduleName: "info-tips-btn",
        defaultElement : "<span>",
        initialize: function($super, options) {
            cloud.util.defaults(options, {
//              info : ,
//                buttonTitle : null,
//                contentCls : null,
//                infoEvents : null,
                btnImgCls : "cloud-icon-watch",
                positon : {
                    my: "top right",
                    at: "left middle"
                },
                showTipEvent : "click",
                hideTipEvent : "click unfocus",
                tipWidth : 220
            });
            
            $super(options);
            
            this.resourceId = null;
            
            this._initButton();
//            this._initInfo();
            this._initContent();
            this._initTip();
        },
        
        _initButton : function(){
            var self = this;
            this.button = new Button({
                container: this.element,
                imgCls: this.options.btnImgCls + " module-info-imghelper",
                title: this.options.buttonTitle,
                events: {
                    click:function(){
                        if (self.info){
                            self.info.destroy();
                            self.info = null;
                        }
                        self._initInfo();
                        
                        self.render(self.resourceId);
//                        console.log("buttonClick")
                        self.fire("buttonClick");
                    }
                }
            });
        },
        
        _initContent : function(){
            
            this.content = $("<div>")
            .addClass("ui-helper-hidden")
            .appendTo(this.element);
            if (this.options.contentCls){
                this.content.addClass(this.options.contentCls);
            }else{
                //default content CSS
                this.content.css({
                    "max-height": "350px",
                    width: "215px",
                    overflow: "auto"
                })
            }
        },
        
        _initInfo : function(){
            
            this.info = new this.options.info({
                container: this.content,
                events : this.options.infoEvents
            });
            
        },
        
        _initTip : function(){
            var self = this;
            this.tip = this.button.element.qtip({
                content: {
                    text: this.content
                },
                position: this.options.positon,
                show: {
                    event: this.options.showTipEvent
                },
                hide: {
                    event: this.options.hideTipEvent
                },
                style: {
                    classes: "qtip-shadow qtip-light",
                    width: this.options.tipWidth
                },
                events : {
                    show : function(){
//                        console.log("show")
                    },
                    hide : function(){
//                        console.log("hide")
                        if (self.info){
                            self.info.destroy();
                            self.info = null;
                        }
                    }
                }
            });
        },
        
        disable : function(onlyTip){
            !onlyTip && this.button.disable();
            $(this.tip).qtip("disable");
//            $(this.tip).qtip("api").disable(true);
        },
        
        enable : function(){
            this.button.enable();
            $(this.tip).qtip("enable");
//            $(this.tip).qtip("api").enable();
        },
        
        showTip : function(){
            $(this.tip).qtip("show");
        },
        
        hideTip : function(){
            $(this.tip).qtip("hide");
        },
        
        show : function(){
            this.button.show();
        },
        
        hide : function(){
            this.button.hide();
        },
        
        render : function(id){
            if (id){
                this.info.render(id);
            }else{
                if ((typeof this.info.disable) == "function"){
                    this.info.disable();
                }
            }
        },
        
        setResourceId : function(resourceId){
            this.resourceId = resourceId;
            if (this.resourceId){
                this.enable();
            }else{
                this.disable();
            }
        },
        
        getResourceId : function(){
            return this.resourceId;
        },
        
        destroy : function($super){
            $super();
        }
    });

    return InfoTipsBtn;
});