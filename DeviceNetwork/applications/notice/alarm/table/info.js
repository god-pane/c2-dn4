var testBean = {
        level : "3",
        siteName : "alarm-info-site",
        state : 1,
        timestamp : new Date(),
        sourceName : "12312",
        desc : "alarm-info-desc"
}

define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./info.html");
	var Button = require("cloud/components/button");
	var service = require("./service");
    require("cloud/lib/plugin/jquery.qtip");
    var SiteInfo = require("../../../site/mysite/info");
    var UserInfo = require("../../../system/user/info");
    var InfoTipsBtn = require("../../../components/info-tips-btn");
    
//	var CusInfo = require("../../../system/customer/info");
	var Info = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this._renderHtml();
			this._renderBtn();
			this.initWrapper();
			this.beanWrapper.setBean(testBean);
			locale.render({element:this.element});
//			this.clear();
			this.empower();
		},
		empower: function() {
			var alarmConfig = permission.app("_alarm");
			return alarmConfig.write;
//        	var alarmConfig = permission.app("_alarm");
//        	if(!alarmConfig.write) {
//        		this.sureButton.hide();
//                this.clearButton.hide();
//        	}
//			this.sureButton.disable();
//            this.clearButton.disable();
        },
		_renderHtml:function(){
			this.element.html(html);
			this._renderCss();
		},
		//兼容ie9
		_renderCss:function(){
			$(".alarm-info-header i").css({
				"float":"left",
				"margin":"auto 15px auto 15px"
			});
			$(".alarm-info-header1").css({
				"margin-top":"15px"
			});
			$("#alarm-info-header-Btn").css({
				"margin-left":"15px"
			});
			$("#alarm-info-header-Btn a+a").css({
				"margin-left":"10px"
			});
			$("#alarm-info-form").css({
				"margin":"auto 10px"
			});
			$(".info-form-row").css({
				"margin":"8px 0"
			});
			$("#alarm-info-form .info-form-label").css({
				"margin-right":"5px",
				"display":"inline-block",
				"width":"85px"
			});
			$("#alarm-info-form .alarm-info-level").css({
				"width":"70px",
				"margin-left":"20px"
			});
			$("#alarm-info-form #alarm-info-sourcename").css({
				"width":"70px",
			});
			$("input#alarm-info-site,#alarm-info-confirmuser,#alarm-info-clearuser").css({
				"width":"70px"
			});
			$(".alarm-site-info-qtip").css({
				"height":"350px",
				"width":"210px",
				"overflow":"auto"
			});
			$(".alarm-site-info-qtip span.site-info-btns .info-edit").css({
				"display":"none !important"
			});
			$(".alarm-site-info-qtip .info-map").css({
				"display":"none !important"
			});
			$(".alarm-user-info-qtip .user-info-title-button").css({
				"display":"none !important"
			});
			$(".alarm-info-notice").css({
				"float":"left !important",
				"margin-left":"20px !important"
			});
		},
		_refreshAlarmSum: function() {
			service.getAlarmstop10({
				levelArr: [1, 2, 3, 4, 5],
				statusArr: [1],
			}, function(data) {
				//alert(data.total+"/"+data._total);
				var $sumIcon = $("#alarm-module-no-alarm-sum");
				if(data.total <= 0) {
					$sumIcon.css("display", "none");
				}
				else if(data.total > 99) {
					$sumIcon.css("display", "block");
					$sumIcon.html("99+");
				}
				else {
					$sumIcon.css("display", "block");
					$sumIcon.html(data.total);
				}
			});
		},
		_renderBtn:function(){
			var self = this;
			this.sureButton = new Button({
                container: this.element.find("#alarm-info-header-Btn"),
                id: "alarm-info-header-sureBtn",
                imgCls: "cloud-icon-yes",
                text: locale.get("_affirm"),
                events: {
                    click:function(){
                        dialog.render({
                            lang: "affirm_confirm_alarm",
                            buttons:[{lang:"yes",click:function(){
                                    self.doSureAlarm();
                                    self._refreshAlarmSum();
                                    dialog.close();
                                }},{lang:"no",click:function(){
                                    dialog.close();
                                }}]
                        });
//                        self.doSureAlarm();
                    }
                }
            });
			$("#alarm-info-header-sureBtn").attr("title",locale.get("_affirm"));
			this.clearButton = new Button({
				container: this.element.find("#alarm-info-header-Btn"),
				id: "alarm-info-header-clearBtn",
				imgCls: "cloud-icon-no",
				text: locale.get("clear"),
				events: {
					click:function(){
					    dialog.render({
    		                lang: "affirm_clear_alarm",
    		                buttons:[{lang:"yes",click:function(){
        		                    self.doClearAlarm();
        		                    self._refreshAlarmSum();
        		                    dialog.close();
    		                    }},{lang:"no",click:function(){
    		                        dialog.close();
    		                    }}]
					    });
//					    self.doClearAlarm();
					}
				}
			});
			/*this.siteDetailBtn = new Button({
				container: this.element.find("#installSiteBtn"),
				id: "alarm-info-table-siteMoreBtn",
				imgCls: "cloud-icon-watch module-info-imghelper",
//				title: "现场详情",
				events: {
					click:function(){
                        if (self.alarmInfo && self.alarmInfo.siteId){
//                            $(self.siteDetailBtn.element).qtip("enable");
                            self.siteInfo.render(self.alarmInfo.siteId);
                        }else {
//                            $(self.siteDetailBtn.element).qtip("disable",true);
                        }
					}
				}
			});
			this.renderSiteInfo();*/
			
			/*this.siteDetail = new InfoTipsBtn({
			    container : this.element.find("#site-info-btn"),
			    info : SiteInfo,
			    contentCls : "alarm-site-info-qtip",
			    events : {
			        "buttonClick" : function(){
			            if (self.alarmInfo && self.alarmInfo.siteId){
			            	 $("#info-devices-table").css("height","125px");
			                this.enable();
			                self.siteDetail.render(self.alarmInfo.siteId);
			            }else {
			                this.disable(true);
			            }
			        }
			    }
			});*/
			
			this.confirmUserDetail = new InfoTipsBtn({
                container : this.element.find("#confirm-user-btn"),
                info : UserInfo,
                contentCls : "alarm-user-info-qtip",
                events : {
                    "buttonClick" : function(){
            			self.confirmUserDetail.info.resetPwdBtn.hide();
            			self.confirmUserDetail.info.editBtn.hide();
                    }
                }
            });
			this.clearUserDetail = new InfoTipsBtn({
                container : this.element.find("#clear-user-btn"),
                info : UserInfo,
                contentCls : "alarm-user-info-qtip",
                events : {
                    "buttonClick" : function(){
                    	self.clearUserDetail.info.resetPwdBtn.hide();
            			self.clearUserDetail.info.editBtn.hide();
                    }
                }
            });
		},
		
		initWrapper : function(){
		    this.beanWrapper = new cloud.PropWrapper({
                map : {
                    level : {
                    	$setter : this.setLevel,
                    	$getter : "alarm-info-level",
                    },//"alarm-info-level",
                    siteName : "alarm-info-site",
                    siteId : {
                        $setter : function(siteId){
//                            this.siteDetail.setResourceId(siteId);
                        }
                    },
                    state : {
                        $setter : this.setState,
                        $getter : this.getState
                    },
                    timestamp : {
                        $setter : this.setTimestamp,
                    },
                    sourceName : "alarm-info-sourcename",
                    confirmUserName : "alarm-info-confirmuser",
                    confirmUserId : {
                        $setter : function(id){
                            this.confirmUserDetail.setResourceId(id);
                            if(permission.code(['5', '7'])) {
                            	this.confirmUserDetail.show();
                            }
                            else {
                            	this.confirmUserDetail.hide();
                            }
                        }
                    },
                    confirmTime : {
                        $setter : this.setTimestamp,
                    },
                    clearUserName : "alarm-info-clearuser",
                    clearUserId : {
                        $setter : function(id){
                            this.clearUserDetail.setResourceId(id);
                            if(permission.code(['5', '7'])) {
                            	this.clearUserDetail.show();
                            }
                            else {
                            	this.clearUserDetail.hide();
                            }
                        }
                    },
                    clearTime : {
                        $setter : this.setTimestamp,
                    },
                    desc : "alarm-info-desc"
                },
                scope : this
            });
		},
		
		setTimestamp : function(timestamp, prop){
		    
		    var string = "";
		    if (timestamp){
		        string = cloud.util.dateFormat(new Date(timestamp), "yyyy-MM-dd hh:mm:ss");
            }
		    if (prop == "timestamp"){
		        this.beanWrapper.setById("alarm-info-time", string);
		    }else if (prop == "confirmTime"){
		        this.beanWrapper.setById("alarm-info-confirmtime", string);
		        timestamp ? 
		                this.element.find("#alarm-info-form div.alarm-confirminfo-row").show() 
		                : this.element.find("#alarm-info-form div.alarm-confirminfo-row").hide() 
		    }else if (prop == "clearTime"){
		        this.beanWrapper.setById("alarm-info-cleartime", string);
		        timestamp ? 
                        this.element.find("#alarm-info-form div.alarm-clearinfo-row").show() 
                        : this.element.find("#alarm-info-form div.alarm-clearinfo-row").hide()
		    }
		},
		
		setState : function(state){
		    var stateStr = "";
            switch(state){
            case service.STATES.AFFIRMED:
                stateStr = locale.get("affirmed");
                break;
            case service.STATES.NOT_AFFIRMED:
                stateStr = locale.get("not_affirmed");
                break;
            case service.STATES.CLEARED:
                stateStr = locale.get("cleared");
                break;
            }
		    this.beanWrapper.setById("alarm-info-state", stateStr);
		},
		
		getState : function(){
		    return this.beanWrapper.getById("alarm-info-state");
		},
		
		toggleStatus : function(){
		    
		},
		
		clear : function(){
		    this.beanWrapper.setBean({
		        level : "1",
		        siteId : null,
		        siteName : "",
		        state : null,
		        timestamp : null,
		        sourceName : "",
		        confirmUserName : "",
		        confirmUserId : null,
                confirmTime : null,
                clearUserName : "",
                clearUserId : null,
                clearTime : null,
		        desc : ""
		    });
		},
		
		setLevel : function (value){
			 this.element.find("#loudspeaker")[0].src="notice/alarm/table/imgs/alarm-level-"+value+".png";
			 var input=this.element.find("#alarm-info-level");
			 input.val(value);
		        if(value=="1"){
//		        	input[0].lang="remind";
		        	input.val(locale.get("remind"));		        	
		        }
		        else if(value=="2"){
//		        	input[0].lang="warn";
		        	input.val(locale.get("warn"));		        	
		        }
		        else if(value=="3"){
//		        	input[0].lang="minor_alarm";
		        	input.val(locale.get("minor_alarm"));		        	
		        }
		        else if(value=="4"){
//		        	input[0].lang="important_alarm";
		        	input.val(locale.get("important_alarm"));
		        	
		        }
		        else if(value=="5"){
//		        	input[0].lang="severe_alarm";
		        	input.val(locale.get("severe_alarm"));		        	
		        }
		        locale.render({element:input});
		},
		
		setAlarmInfo: function(data){
		    if (data){
//		        this.alarmId = data._id;
		        this.alarmInfo = data;
		        this.beanWrapper.setBean(data);
		       
		        this.toggleBtnStatus(data.state);
		    }
		},
		
		toggleBtnStatus : function(state){
		    if (state == 1){
		        this.sureButton.enable();
		        this.clearButton.enable();
		    }else if (state == 0){
		        this.sureButton.disable();
                this.clearButton.enable();
		    }else /*if (state == -1)*/{
		        this.sureButton.disable();
                this.clearButton.disable();
            }
		},
		
		loadInfo : function(){
		    cloud.Ajax.request({
                url: "api/alarms/" + this.alarmId,
                parameters: {
                    verbose: 100
                },
                type: "get",
                success: function(data) {
                    this.setAlarmInfo(data.result);
                    this.unmask();
                    if(!this.empower()) {
            			this.sureButton.hide();
            			this.clearButton.hide();
                    }
                }.bind(this),
                error : function(){
                    this.unmask();
                }.bind(this)
            });
		},

        renderSiteInfo : function(){
            var self = this;
            
            this.SiteInfoQtip = $("<div id = 'alarm-site-info-qtip'>")
                .addClass("ui-helper-hidden")
                .appendTo(this.element);
                
            this.siteInfo = new SiteInfo({
                selector: this.SiteInfoQtip,
                events : {
                    "afterInfoUpdated" : function(siteId){
                        var deviceId = self.deviceId;
//                      var deviceInfo = self.deviceInfo;
                        if (deviceId){//&& deviceInfo && (deviceInfo.siteId == siteId)
                            self.render(deviceId)
                        }
                    }
                }
            });
            
            this.siteDetailBtn.element.qtip({
                content: {
                    text: this.SiteInfoQtip
                },
                position: {
                    my: "top right",
                    at: "left middle"
                },
                show: {
                    event: "click"
                },
                hide: {
                    event: "click unfocus"
                },
                style: {
                    classes: "qtip-shadow qtip-light",
                    width: 220
                }
            });
        },
		
		render: function(id) {
            this.alarmId = id;
            this.clear();
            if (this.alarmId) {
                this.mask();
                this.loadInfo();
            } else {
                this.toggleBtnStatus(-1);
            }
            
            if(!this.empower()) {
    			this.sureButton.hide();
    			this.clearButton.hide();
            }
        },
		
		doSureAlarm:function(id){
//		    id = id || this.alarmId; 
		    service.sureAlarm(id || this.alarmId, function(data) {
                if (data.result && data.result._id){
                    this.fire("afterInfoUpdated",data.result._id);
                    if (!id || (id == this.alarmId)){
                        this.render(data.result._id);
                    }
                }
            }, this);
		},
		doClearAlarm:function(id){
		    service.clearAlarm(id || this.alarmId, function(data) {
                if (data.result && data.result._id){
                    this.fire("afterInfoUpdated",data.result._id);
                    if (!id || (id == this.alarmId)){
                        this.render(data.result._id);
                    }
                }
            }, this);
		},
		destroy: function($super) {
			$super();
		}
	});
	return Info;
});