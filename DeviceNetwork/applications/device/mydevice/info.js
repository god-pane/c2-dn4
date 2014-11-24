define(function(require) {
    require("cloud/base/cloud");
    // require("cloud/lib/plugin/jquery-ui");
//    var maps = require("cloud/components/map");
    var Button = require("cloud/components/button");
    var template = require("text!./info.html");
	var service = require("cloud/service/service");
	var validator = require("cloud/components/validator");
	var SiteInfo = require("../../site/mysite/info");
	var _Window = require("cloud/components/window");
	require("cloud/lib/plugin/jquery.uploadify");
	require("cloud/lib/plugin/jquery.qtip");
	
    var InfoModule = Class.create(cloud.Component, {

        initialize: function($super, options) {
            $super(options);
            this.deviceId = null;
            this.element.html(template).addClass("device-info");
            this.infoForm = this.element.find(".info-form");
            this.sites = null;
            this.validatorIsTrue = false;
            this.renderButtons();
			this.drawPicToolbar();
            this.renderModels();
//            this.renderCustomers();
//            this.renderSitesOptions();
//			this.renderDoc();
//            this.renderMap();
			this.validate();
			this._renderCss();
			locale.render({element:this.element});
			this.empower();
        },
      //兼容ie9
		_renderCss:function(){
//			$(".info-wrapper").css({
//				"width":"200px",
//				"margin":"0 auto"
//			});
			$(".info-header").css({
				"margin-top":"10px",
				"min-height":"26px"
			});
			$("#info-wrapper .info-header #info-name").css({
				"margin-left":"12px",
				"float":"left"
			});
			$(".info-header .info-device-favor").css({
				"margin-left":"0px"
			});
			$(".info-form-row label.info-form-label").css({
				"display":"inline-block",
				"width":"70px"
			});
			$(".info-doc-select").css({
				"width":"136px"
			});
			$("#info-site-autocreate a").css({
				"margin-left":"0px"
			});
			$(".info-form-row").css({
				"margin":"8px 0"
			});
			$(".info-map").css({
				"width":"100%",
				"height":"120px",
				"margin":"10px 0",
				"border":"1px solid silver"
			});
			$(".info-buttonset-bottom").css({
				"margin":"6px 0 -5px 0",
				"height":"32px",
				"width":"100%",
				"overflow":"hidden"
			});
			$("#module-info-tag-edit").css({
				"padding":"0px",
				"border":"0px"
			});
			$(".info-form-span").css({
				"display":"inline-block",
				"width":"81px",
				"margin":"0px 0px"
			});
			$(".info-device-pic-row").css({
				"height":"132px"
			});
			$(".info-device-pic-row a").css({
				"margin":"3px 0px 0px 0px",
				"float":"right"
			});
			$("#info-device-pic").css({
				"float":"left",
				"width":"178px",
				"height":"132px"
			});
			$("#device-site-info-qtip .cloud-bubble-hide").css({
				"display":"none"
			});
			$("#device-site-info-qtip").css({
				"height":"350px",
				"width":"250px",
				"overflow":"auto"
			});
			$(".info-online-status").css({
				"float":"left"
			});
			$(".info-header-btn").css({
				"float":"left",
				"width":"72px",
				"height":"17px",
				"margin-top":"3px"
			});
			$(".info-device-advances-title").css({
				"left":"19px",
				"position":"relative",
				"background-color":"#F5F6F9",
				"z-index":"1",
				"padding-left":"12px"
			});
			$(".info-device-advanced-form").css({
				"position":"relative",
				"top":"-21px",
				"border":"1px solid rgb(204,204,204)",
				"padding-top":"13px",
				"padding-left":"15px",
				"display":"block"
			});
			$(".info-form a.cloud-button").css({
				"margin-right":"0px"
			});
			$(".info-device-ip-row").css({
				"height":"18px",
				"line-height":"18px"
			});
			$("#info-device-signal-icon").css({
				"display":"inline-block",
				"margin-bottom":"-2px"
			});
			$(".info-device-advanced-row div#info-device-advanced-form input.info-form-text").css({
				"width":"60px"
			});
			$(".info-device-advanced-sync-select").css({
				"width":"80px"
			});
			$("#module-info-autocreate-site span.cloud-button-text").css({
				"width":"150px",
				"height":"40px"
			});
			$("#module-info-autocreate-site span.cloud-button-checkbox-icon").css({
				"margin-top":"-13px"
			});
			$("#info-site-name option").css({
				"width":"100px!important",
				"margin":"0 -18px 0 0"
			});
		},
        empower: function() {
        	var getawayConfig = permission.app("_gateway");
        	if(!getawayConfig.write) {
        		this.editButton.hide();
			}
        },
		
        validate:function(){
			var self = this;
			validator.render("#info-wrapper",{
					promptPosition:"bottomLeft",
			        scroll: false
			});
		},
		
		renderRemoteControl:function(gatewayId){
//			
			var self = this;
			
			if(this.window) {
				this.window.destroy();
				this.window = null;
			}
			
			this.window = new _Window({
				container: "body",
				title:locale.get("remote_control"),
				lang:"{title:remote_control}",
				top: "center",
				left: "center",
				cls:"mydevice-overvier-configMgr",
				height: 570,
				width: 853,
				mask: true,
				drag:true,
				content: "<div id='overview-window-remote-controll'></div>",
				events: {
					"onClose": function() {
						this.window.destroy();
						this.window = null;
						self.remoteControl.destroy();
					},
					scope: this
				}
			});
			
			require(["./remote-control"],function(RemoteControl){
				self.remoteControl = new RemoteControl({
					selector:"#overview-window-remote-controll",
					id:gatewayId
				});
			});
			
			this.window.show();
			
		},
		
		renderRemoteControllButton:function(deviceInfo){
			 var self = this;
			 $("#module-info-tag-remote").remove();
			 function addRemoteControlBtn(){
				 
				 self.remoteControlBtn = new Button({
						container:$(".info-header-btn"),
						id : "module-info-tag-remote",
						imgCls:"cloud-icon-remote",
						title:locale.get("remote_control"),
						events:{
							click:function(){
								self.renderRemoteControl(self.deviceId);
							}
						}
				});
				if(permission.app("_gateway")["console"]) {
					self.remoteControlBtn.show();
				}
				else{
					self.remoteControlBtn.hide();
				}
			 }
			 if(deviceInfo.online == 1 && (deviceInfo.model.search(/^(IR6XX|IR7XX|IR8XX|IR9XX|IG601){1}.+$/i) > -1)){
				 if($("#module-info-tag-favor").length === 0){
					 addRemoteControlBtn();
				 }else{
					 addRemoteControlBtn();
					 $(".info-header-btn").append($("#module-info-tag-favor"));
				 }
			 }
		},
		deleteKey:function(deviceId){
			var self=this;
			cloud.Ajax.request({
				url:"api/devices/"+deviceId+"/key",
				type:"DELETE",
				error:function(err){
					dialog.render({
						"lang":err.error_code
					});
				},
				success:function(data){
					dialog.render({
						"lang":"text:reset+success"
					});
					self.resetKeyButton.hide();
				}
			})
		},
        renderButtons: function() {
            var self = this;
            
            this.editButton = new Button({
                container: this.element.find(".info-header-btn"),
                id: "module-info-tag-edit",
                imgCls: "cloud-icon-edit",
                lang:"{title:edit}",
//                text: "编辑",
                events: {
                    click: self.enable.bind(this)
                }
            });
            this.editButton.hide();
            this.resetKeyButton=new Button({
            	container:this.element.find(".info-header-btn"),
            	id:"module-info-tag-resetkey",
            	title:"resetkey",
            	imgCls:"cloud-icon-reset",
            	lang:"{title:resetkey}",
            	events:{
            		click:function(){
            			self.deleteKey(self.deviceId);
            		}
            	}
            });
            this.favorButton = new Button({
            	container: this.element.find(".info-header-btn"),
            	id : "module-info-tag-favor",
            	title: "favor",
            	lang:"{title:favor}",
            	checkboxCls: "cloud-icon-star",
            	checkbox: true,
            	events: {
            		click: self.submitFavor.bind(self)
            	}
            });
            
            this.submitButton = new Button({
                container: this.element.find(".info-buttonset-bottom"),
                id: "module-info-tag-submit",
                imgCls: "cloud-icon-yes",
                text: "提交",
                lang:"{title:submit,text:submit}",
                events: {
                    click: function(){
						$("#info-device-advanced-form").css("display","block");
                    	if(validator.result("#info-wrapper")){
							$("#info-device-advanced-form").css("display","none");
                    		self.submit();
                    	}
                    }
                }
            });
            this.submitButton.hide();

            this.cancelButton = new Button({
                container: this.element.find(".info-buttonset-bottom"),
                id: "module-info-tag-cancel",
                imgCls: "cloud-icon-no",
                text: "取消",
                lang:"{title:cancel,text:cancel}",
                events: {
                    click: self.cancelEdit.bind(this)
                }
            });
            this.cancelButton.hide();
			
			this.modalDetailBtn = new Button({
				container:".info-device-model-row",
				id:"info-device-model",
				imgCls:"cloud-icon-watch module-info-imghelper",
				events:{
					
				}
			});
			this.modalDetailBtn.hide();//TODO
			
			this.customerDetailBtn = new Button({
				container:".info-device-customer-row",
				id:"info-device-customer",
				imgCls:"cloud-icon-watch module-info-imghelper",
				events:{
					
				}
			});
			
			this.siteDetailBtn = new Button({
				container:".info-device-site-row",
				id:"info-device-site",
				imgCls:"cloud-icon-watch module-info-imghelper",
				events:{
					click : function(){
						var siteId = self.element.find("#info-site-name").val();
						$("#info-devices-table").css("height","125px");
	        			if (siteId){
	        				$(self.siteDetailBtn.element).qtip("enable");
	        				self.siteInfo.render(siteId);
	        			}else {
	        				$(self.siteDetailBtn.element).qtip("disable",true);
	        			}
					}
				}
			});
			this.renderSiteInfo();
			
			
			this.alarmDetailBtn = new Button({
				container:".info-device-alarm-row",
				id:"info-device-alarm",
				imgCls:"cloud-icon-watch module-info-imghelper",
				events:{
					
				}
			});
			this.alarmDetailBtn.hide();
			
			this.downloadDocBtn = new Button({
				container:".info-doc-row",
				id:"info-doc-download",
				imgCls:"cloud-icon-download",
				events:{
				}
			});
			this.docDetailBtn = new Button({
				container:".info-doc-row",
				id:"info-doc-detail",
				imgCls:"cloud-icon-watch module-info-imghelper",
				events:{
				}
			});
			
//			if(this.advanceBtn){
//				this.element.find("#info-device-advanced-form").hide();
//			}else{
//				this.advanceBtn = new Button({
//					container: "#info-device-button-content",
//					id: "info-adv-checkbox",
//					imgCls: "cloud-icon-arrow3",
//					lang:"{title:}",
//					events: {
//						click: function(){
//							$(this.element.find("#info-device-advanced-form")).toggle(100,"linear");
//						},
//						scope :this
//					}
//				});
//			}
        },
		drawAdvancedBtn:function(){
			if(!this.advancedBtn){
				this.advancedBtn = new Button({
					container: "#info-device-button-content",
					id: "info-adv-checkbox",
					imgCls: "cloud-icon-arrow3",
					lang:"{title:}",
					events: {
						click: function(){
							$(this.element.find("#info-device-advanced-form")).toggle(100,"linear");
						},
						scope: this
					}
				});
			}else{
				this.element.find("#info-device-advanced-form").hide();
			}
		},
        
        drawCreateSiteBtn : function(){
        	if (!this.autoCreateSite){
        		this.autoCreateSite = new Button({
                    container: this.element.find("#info-site-autocreate"),
                    id: "module-info-autocreate-site",
                    checkbox : true,
                    text: locale.get("auto_create_site"),//"自动创建现场",
                    lang:"{title:auto_create_site,text:auto_create_site}",
                    events: {
                        click: function(){
                        	if (this.autoCreateSite.isSelected()){
                        		this.element.find("#info-site-name").attr("disabled", true);
                        		this.element.find(".info-device-site-row").hide();
                        	}else{
                        		this.element.find("#info-site-name").removeAttr("disabled"); 
                        		this.element.find(".info-device-site-row").show();
                        	}
                        },
                        scope : this
                    }
                });
        	}else{
				this.autoCreateSite.setSelect(false);
				this.element.find("#info-site-name").removeAttr("disabled"); 
                this.element.find(".info-device-site-row").show();
			}
        },
        
		renderDoc:function(){
			var self = this;
			cloud.Ajax.request({
                url: "api/documents",
                type: "get",
                parameters: {
                    verbose: 50,
                    limit: 0
                },
                success: function(data) {
                    self.doc = data.result;
                    if(self.element)var $select = self.element.find("#info-doc-select");
                    data.result.each(function (doc) {
                        $("<option>").text(doc.name).val(doc._id).appendTo($select);
                    });
                }
            });
		},

        renderSitesOptions: function() {
            var self = this;
            self.element.find("#info-site-name").empty().append($("<option>"));
            cloud.Ajax.request({
                url: "api/sites",
                type: "get",
                parameters: {
                    verbose: 1,
                    has_gateway : false,
//                    deviceCount : 0,
                    limit: 0
                },
                success: function(data) {
//                    self.sites = data.result;
                	
                    var $select = self.element.find("#info-site-name");
                    data.result.each(function (site) {
                        $("<option>").text(site.name).val(site._id).appendTo($select);
                    });
                    if (self.deviceInfo){
                    	self.setSiteName(self.deviceInfo.siteId);
                    }
                    
                    self.loadSitesComplete = true;
                    if (self.isMasked()){
                    	self.unmask();
                    }
                },
                error : function(){
                	self.loadSitesComplete = true;
                	if (self.isMasked()){
                    	self.unmask();
                    }
                }
            });
        },
		rendervendor: function(){
			//render vendor like models
		},

        renderModels: function() {
        	var self = this;
        	
        	var $select = this.element.find("#info-model");
        	self.modelsMap = $H();
            this.loadDeviceModels(function(models) {
            	
                models.each(function(model) {
                    $("<option>").val(model._id).text(model.name).appendTo($select);
                    self.modelsMap.set(model._id, model);
                }, self);
                //var firstModOpt = this.element.find("#info-model option")[0];
                if (self.deviceInfo && self.deviceInfo.modelId){
                	this.setDeviceModel(self.deviceInfo.modelId);
                }else if (models[0]){
                	//var firstModId = $(firstModOpt).val();
                    this.setDeviceModel(models[0]._id);
                }
                
            });
            $select.change(function(){
            	var id = $(this).val();
            	//var modelId = self.element.find("#info-model option:selected").val();
            	if (id){
            		var model = self.modelsMap.get(id);
            	}
            	/*cloud.Ajax.request({
                    url: "api/models/" + modelId,
                    parameters: {
                        verbose: 100
                    },
                    type: "get",
                    success: function(data) {
                    	if (data.result && data.result.isGateway){
                    		self.setDeviceType(0)
                    	}else {
                    		self.setDeviceType(1)
                    	}
                    }
                });*/
            });
        },
        
        renderSiteInfo : function(){
            var self = this;
            
        	this.SiteInfoQtip = $("<div id = 'device-site-info-qtip'>")
        		.addClass("ui-helper-hidden")
        		.appendTo(this.element);
        		
        	this.siteInfo = new SiteInfo({
        		selector: this.SiteInfoQtip,
        		events : {
        		    "afterInfoUpdated" : function(siteId){
        		        var deviceId = self.deviceId;
//        		        var deviceInfo = self.deviceInfo;
        		        if (deviceId){//&& deviceInfo && (deviceInfo.siteId == siteId)
        		            self.render(deviceId)
        		        }
        		    }
        		}
        	});
        	this.siteInfo.autoPosition.disable();
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
                    width: 250
                }
            });
        	$("#device-site-info-qtip").find(".info-wrapper").css("margin","0");
        },
//        renderCustomers: function() {
//            this.loadMyCustomers(function(customers) {
//                var $select = this.element.find("#info-device-customers");
//                customers.each(function(cus) {
//                    $("<option>").val(cus._id).text(cus.name).appendTo($select);
//                }, this);
//            });
//        },

        render: function(id) {
        	var self=this;
        	$("#info-serial-number").bind("blur",function(){
        		self.checkType();
        	});
        	this.loadSitesComplete = false;
            this.deviceId = id;
            this.removeMySiteOpt();
            this.renderSitesOptions();
//            this.renderMap();
			this.drawAdvancedBtn();
            if (this.deviceId) {
                this.mask();
                this.autoCreateSite && (this.autoCreateSite.hide());
                this.element.find(".info-device-site-row").show();
                this.loadDeviceInfo();
                $(".info-header-btn").show();
//                this.favorButton.show();
                this.favorButton.hide();
                this.getDeviceKey();
            } else {
            	this.deviceInfo = null;
            	this.autoCreateSite && (this.autoCreateSite.show());
            	this.drawCreateSiteBtn();
                this.clear();
                this.enable();
                $(".info-header-btn").hide();
                this.favorButton.hide();
            }
        },
        getDeviceKey:function(){
        	var self=this;
        	cloud.Ajax.request({
        		url:"api/devices/"+self.deviceId+"/key",
        		type:"GET",
//        		parameters:{
//        			id:deviceId
//        		},
        		error:function(){
        			self.resetKeyButton.hide();
        		},
        		success:function(data){
        			self.resetKeyButton.show();
        		}
        	})
        },
		getResId : function(){
        	return this.deviceId ? this.deviceId : null;
        },

        setDeviceInfo: function(data) {
            if (data.result) {
                data = data.result;
            }
//			this.longitude=data.gps.
//			this.latitude=data.gps.
            this.setDeviceName(data.name);
            this.setDeviceAddress(data.address);
            this.setSerialNumber(data.serialNumber);
            
            this.setMobileNumber(data.mobileNumber);
            this.setDeviceModel(data.modelId);
			this.setVendor(data.vendorId);
            this.setBusinessState(data.businessState);
            this.setSiteName(data.siteId);
            //this.setSiteName(data);
			this.setCst(data.customerName);
			this.setAlarmCount(data.alarmCount);
			this.setDeviceConfig(data);
			this.setDeviceIp(data.pubIp);
			
			if (data.config) {
				this.setTimeout(data.config.timeout);
				this.setAckTimeout(data.config.ackTimeout);
				this.setAckRetries(data.config.ackRetries);
				this.setSync(data.config.sync)
			}
			
//			if (data.info){
				this.setDeviceSignal(data.info);
	            this.setBaseStation(data.info);
//			}
            
			/*if(data.location){
            	this.latitude = data.location.latitude;
            	this.longitude = data.location.longitude;
            }*/
//            this.renderLocMarker(data);
            if(this.deviceId == null){
                this.favorButton.setSelect(false);
            }else{
                service.verifyFavorites([this.deviceId], function(data) {
                    this.favorButton.setSelect(data.result.first() == 1);
                }, this);
            }
		},
		
		setDeviceIp : function(ip){
			if (ip){
            	this.element.find(".info-device-ip-row").show();
            	this.element.find("#info-device-ip").html(ip);
            }else{
            	this.element.find(".info-device-ip-row").hide();
            }
		},

		setBaseStation : function(info){
			if (info){
				if ((info.mcc != undefined) && (info.mnc != undefined) && (info.lac != undefined) && (info.cid != undefined)){
					this.element.find(".info-device-basestation-row").show();
					//TODO
					var baseStationStr = info.mcc + "." + info.mnc + "." + info.lac + "." + info.cid;
					this.element.find("#info-device-basestation").html(baseStationStr);
	            }else{
	            	this.element.find(".info-device-basestation-row").hide();
	            }
			}else{
				this.element.find(".info-device-basestation-row").hide();
			}
		},
		
		setDeviceSignal : function(info){
			if (info && info.rssi != undefined){
//				if (info.rssi != undefined){
				this.element.find(".info-device-signal-row").show();
				
				var signalDBm = -113 + 2 * info.rssi;//console.log(signalDBm);
				
				this.element.find("#info-device-signal-num").html(signalDBm + "&nbsp;" + "dBm");
				var signalIconCls = "";
				if (info.rssi < 10){
					signalIconCls = "cloud-icon-xinhao1"
				}else if (info.rssi >= 10 && info.rssi <= 19){
					signalIconCls = "cloud-icon-xinhao2"
				}else if (info.rssi >= 20 && info.rssi <= 31){
					signalIconCls = "cloud-icon-xinhao3"
				}
            	this.element.find("#info-device-signal-icon").removeClass("cloud-icon-xinhao1 cloud-icon-xinhao2 cloud-icon-xinhao3")
            		.addClass("cloud-icons-default").addClass(signalIconCls);
//	            }else{
//	            	this.element.find(".info-device-signal-row").hide();
//	            }
			}else{
				this.element.find(".info-device-signal-row").hide();
			}
		},
		
        clear: function() {
//        	this.loadSitesComplete = false;
            this.deviceId = null;
            this.setDeviceInfo({
                name: "",
                serialNumber: "",
                modelId: "",
                businessState: 0,
                online : 0,
                siteName: "",
				siteId:"",
				customerName:"",
				mobileNumber : "",
				config : {
					timeout : 300000,
					ackTimeout : 120000,
	                ackRetries : 3,
	                sync : 2
				},
				deviceConfig : {
					maxHeartbeatLost : 6 ,
					heartbeatInterval : 120,//sec
					heartbeatTimeout : 10,//sec
					resendLogin : 60//sec
				},
				location : {
                	longitude : 116.46,
                	latitude : 39.92
                }
            });
            var firstModOpt = this.element.find("#info-model option")[0];
            if (firstModOpt){
            	var firstModId = $(firstModOpt).val();
                this.setDeviceModel(firstModId)
            }
            this.autoCreateSite.setSelect(true);
            this.element.find(".info-device-site-row").hide();
        },
        
        setTimeout : function(timeout){
//        	if (timeout) {
        		this.element.find("#info-device-advanced-timeout").val(timeout);
//        	}
        },
        
        getTimeout : function(){
        	return this.element.find("#info-device-advanced-timeout").val();
        },
        
        setAckTimeout : function(ackTimeout){
//        	if (ackTimeout) {
        		this.element.find("#info-device-advanced-acktimeout").val(ackTimeout);
//        	}
        },
        
        getAckTimeout : function(){
        	return this.element.find("#info-device-advanced-acktimeout").val();
        },
        
        setAckRetries : function(ackRetries){
//        	if (ackRetries) {
        		this.element.find("#info-device-advanced-ackretries").val(ackRetries);
//        	}
        },
        
        getAckRetries : function(){
        	return this.element.find("#info-device-advanced-ackretries").val();
        },
        
        setSync : function(sync){
        	this.element.find("#info-device-advanced-sync").val(sync);
        },
        
        getSync : function(){
        	return this.element.find("#info-device-advanced-sync").val();
        },
        
        setConfig : function(config){
            if (config) {
                this.setTimeout(config.timeout);
                this.setAckTimeout(config.ackTimeout);
                this.setAckRetries(config.ackRetries);
                this.setSync(config.sync);
            }
        },
        
        getConfig : function(){
            var config = {
                timeout : this.getTimeout(),
                ackTimeout : this.getAckTimeout(),
                ackRetries : this.getAckRetries(),
                sync : this.getSync()  
            }    
            return config;
        },
        
		setDeviceConfig:function(data){
			if (data.deviceConfig) {
				this.element.find("#info-device-advanced-heartbeattimeout").val(data.deviceConfig.heartbeatTimeout);
				this.element.find("#info-device-advanced-heartbeatinterval").val(data.deviceConfig.heartbeatInterval);
				this.element.find("#info-device-advanced-maxheartbeatlost").val(data.deviceConfig.maxHeartbeatLost);
				this.element.find("#info-device-advanced-resendlogin").val(data.deviceConfig.resendLogin);
			}
		},
		getDeviceConfig: function(){
			var opt = {
				maxHeartbeatLost : parseInt(this.element.find("#info-device-advanced-maxheartbeatlost").val(),0),
				heartbeatInterval : parseInt(this.element.find("#info-device-advanced-heartbeatinterval").val(),0),
				heartbeatTimeout : parseInt(this.element.find("#info-device-advanced-heartbeattimeout").val(),0),
				resendLogin : parseInt(this.element.find("#info-device-advanced-resendlogin").val(),0)
			};
			return opt;
		},
		setVendor:function(vendorId){
			if (vendorId){
        		this.element.find("#info-vendor").val(vendorId).change();
        	}
		},
		getVendor:function(){
			return this.element.find("#info-vendor option:selected").val();
		},
		setCst:function(customerName){
			this.element.find("#info-device-customers").text(customerName);
		},
        setDeviceName: function(name) {
            this.element.find("#info-name").val(name);
        },

        getDeviceName: function() {
            return this.element.find("#info-name").val();
        },
        
        setDeviceAddress: function(address) {
            this.element.find("#info-install-addr").val(address);
        },

        getDeviceAddress: function() {
            return this.element.find("#info-install-addr").val();
        },

        setSerialNumber: function(number) {
            this.element.find("#info-serial-number").val(number);
        },

        getSerialNumber: function() {
            return this.element.find("#info-serial-number").val().toLocaleUpperCase();
        },
        
        
        setMobileNumber : function(mobileNumber){
            this.element.find("#info-mobilenumber").val(mobileNumber);
        },
        
        getMobileNumber : function(){
            return this.element.find("#info-mobilenumber").val();
        },
        
        setAlarmCount : function(alarmCount){
        	this.element.find(".info-form-span").html(alarmCount + " 个");
        },

        setDeviceModel: function(id) {
            /*this.element.find("#info-model option").each(function() {
                var option = $(this);
                if (option.val() === id) {
                    option.attr("selected", true);
                } else {
                    option.removeAttr("selected");
                }
            });*/
        	if (id){
        		if(this.element)this.element.find("#info-model").val(id).change();
        	}
        },

        getDeviceModel: function() {
            return this.element.find("#info-model option:selected").val();
        },
        
        getDeviceModelName: function() {
            return this.element.find("#info-model option:selected").text();
        },
        
//        setSiteName: function(data) {
//            var self = this; //$("<option>").text(site.name).val(site._id).appendTo($select);
//			this.element.find("#info-site-name option").each(function(){
//				var option = $(this);
//				if (option.val() == name) {
//                    option.attr("selected", true);
//                } else {
//                    option.removeAttr("selected");
//                }
//			});
//        },
        
        setSiteName: function(name) {
        	var flag=false;
            var self = this;
            var optionArr=this.element.find("#info-site-name option");
            var no_privilege=$(".no_privilege");
            optionArr.each(function(i,one){
                var option = $(this);
                if (option.val() == name) {
                    option.attr("selected", true);
                    flag=true;                   
                    if(no_privilege){
                    	no_privilege.remove();
                    }
                } else {
                    option.removeAttr("selected");
                }
            });
            if(!flag && name){
            	if(no_privilege){
            		no_privilege.remove();
            	}
            	var no=locale.get("no_privilege");
            	$("<option>").text(no).attr({"selected":true,"disabled":true,"class":"no_privilege"}).appendTo($("#info-site-name"));
            }
        },
        getSiteId: function() {
            return this.element.find("#info-site-name option:selected").val();
        },
        getSiteName: function() {
            return this.element.find("#info-site-name option:selected").text();
        },

        setBusinessState: function(status) {
			var self =this;
            this.element.find("#info-business-state option").each(function() {
                var option = $(this);
                if (option.val() == status) {
                    option.attr("selected", true);
                } else {
                    option.removeAttr("selected");
                }
            });
        },

        getBusinessState: function() {
            return this.element.find("#info-business-state option:selected").val();
        },
        
        loadDeviceInfo: function() {
        	var self = this;
            cloud.Ajax.request({
                url: "api/devices/" + self.deviceId,
                parameters: {
                    verbose: 100
                },
                type: "get",
                success: function(data) {
					if (data.result){
						self.deviceInfo = data.result;
						this.appendMySiteOpt(data.result)
					//	$("<option>").text(data.result.siteName).val(data.result.siteId).appendTo($("#info-site-name"));
						self.setDeviceInfo(data.result);
						
						self.renderRemoteControllButton(data.result);
					}
                    
					self.disable();
                    if (self.loadSitesComplete) {
                    	self.unmask();
                    }
                    var getawayConfig = permission.app("_gateway");
                	if(!getawayConfig.write) {
                		self.editButton.hide();
        			}
                	if(getawayConfig.console || getawayConfig.remoteControl) {
                		//self.remoteControlBtn.show && self.remoteControlBtn.show();
                	}
                	else {
                		self.remoteControlBtn.hide();
                	}
                	
                }.bind(self)
            });
        },
        
       appendMySiteOpt : function(device){
            if (device.siteId && device.siteName){
            	if(this.mySiteOpt){
            		this.mySiteOpt.remove();
            	}
                var siteOptEL = this.element.find("#info-site-name");
                this.mySiteOpt = $("<option>").attr({
                    "value" : device.siteId,
                }).text(device.siteName).appendTo(siteOptEL);
            }
        },
        
        removeMySiteOpt : function(){
            this.mySiteOpt && this.mySiteOpt.remove();
        },

//        loadMyCustomers: function(callback) {
//            var self = this;
//            cloud.Ajax.request({
//                url: "api/customers",
//                parameters: {
//                    verbose: 3
//                },
//                type: "get",
//                success: function(data) {
//                    if (Object.isFunction(callback)) {
//                        callback.call(self, data.result);
//                    }
//                }.bind(this)
//            });
//        },

        loadDeviceModels: function(callback) {
            var self = this;
            cloud.Ajax.request({
                url: "api/models",
                parameters: {
                    verbose: 3,
                    gateway : true,
					limit: 0
                },
                type: "get",
                success: function(data) {
                    if (Object.isFunction(callback)) {
                        callback.call(self, data.result);
                    }
                }.bind(this)
            });
        },
   

        enable: function() {
        	$(".info-buttonset-bottom").show();
            this.editButton.hide();
            this.submitButton.show();
            this.cancelButton.show();
            
            this.locMarker && this.locMarker.setDraggable(true);
            // this.deleteButton.
            this.infoForm.find("input, select").removeAttr("disabled");
            this.element.find("#info-name").removeAttr("disabled");
            //this.element.find("#info-serial-number").attr("disabled", "disabled");
            if (this.deviceId){// model cannot be updated
            	this.element.find("#info-vendor").attr("disabled", true);
            	this.element.find("#info-model").attr("disabled", true);
            	this.element.find("#info-serial-number").attr("disabled", "disabled");
            }else{
            	this.element.find("#info-vendor").removeAttr("disabled");
            	this.element.find("#info-model").removeAttr("disabled");
            }
        },

        disable: function() {
            this.editButton.show();
            $(".info-buttonset-bottom").hide();
            this.submitButton.hide();
            this.cancelButton.hide();
            
            this.locMarker && this.locMarker.setDraggable(false);

            this.infoForm.find("input, select").attr("disabled", true); 
            this.element.find("#info-name").attr("disabled", true);
            
        },

        cancelEdit: function() {
            if (this.deviceId) {
                this.loadDeviceInfo();
            } else {
                // alert("Cancel create new device.");
                this.fire("cancelCreate");
            }
            validator.hideAll();
            this.disable();
            $(".formError").trigger("click");
        },

        submit: function() {
//			if(this.validatorIsTrue === false){
//				return;
//			}
            var device = {}, self = this;
            device.name = this.getDeviceName();
            device.serialNumber = this.getSerialNumber();
            
            device.mobileNumber = this.getMobileNumber(); 
            device.modelId = this.getDeviceModel();
            device.modelName = this.getDeviceModelName();
            device.businessState = this.getBusinessState();
            device.siteName = this.getSiteName();
            device.plcId=0;
            device.address=this.getDeviceAddress();
			device.deviceConfig = this.getDeviceConfig();
			device.vendorId = this.getVendor();
			device.siteId = (this.getSiteId()) ? this.getSiteId() : null;
			
//			device.timeout = this.getTimeout();
//			device.ackTimeout = this.getAckTimeout();
//			device.ackRetries = this.getAckRetries();
//			device.sync = this.getSync();
			
			var defaultLocation= {//TODO
		            longitude : 116.407013,
		            latitude : 39.926588,
		        };
			
			device.config = this.getConfig();
			
			var cancel_site;
			if (device.siteId == null){
				cancel_site = "1";
			}else {
				cancel_site = null;
			}
			var createSite = 0;
			if (this.autoCreateSite && this.autoCreateSite.isSelected() && (this.deviceId === null)){
				createSite = 1;
				device.siteId = null;
			}

            if (device.name.strip().empty()) {
                //alert("设备名不能为空");
            	dialog.render({lang:"device_name_cant_be_null"});
                return;
            }

            if (device.serialNumber.strip().empty()) {
                //alert("设备序列号不能为空");
            	dialog.render({lang:"device_sn_cant_be_null"});
                return;
            }

            if (device.modelId.strip().empty()) {
                //alert("设备机型不能为空");
            	dialog.render({lang:"device_model_cant_be_null"});
                return;
            }
            
            /*if (device.address.strip().empty()) {
            	//alert("安装地址不能为空");
            	dialog.render({lang:"device_install_address_cant_be_null"});
            	return;
            }*/

            if (this.deviceId === null) {
                cloud.Ajax.request({
                    url: "api/devices/",
                    type: "post",
                    parameters : {
                    	create_site : createSite
                    },
                    data: {
						deviceConfig:device.deviceConfig,
						siteName: device.siteName,
						siteId: device.siteId,
                        name: device.name,
                        address: device.address,
                        businessState: device.businessState,
                        modelId: device.modelId,
                        model: device.modelName,
                        location: defaultLocation, //TODO
                        serialNumber: device.serialNumber,
                        mobileNumber : device.mobileNumber,
                        plcId:device.plcId,
                        vendorId : device.vendorId,
                        config : device.config
//                        timeout : device.timeout,
//                        ackTimeout : device.ackTimeout,
//                        ackRetries : device.ackRetries,
//                        sync : device.sync
                    },
                    success: function(data) {
                        //alert("保存成功");
                    	dialog.render({lang:"save_success"});
                        self.fire("afterInfoCreated", data.result._id);
                        self.deviceId = data.result._id;
                        self.render(data.result._id);
                        //self.disable();
                    }
                });
            } else {
                cloud.Ajax.request({
                    url: "api/devices/" + this.deviceId,
                    type: "put",
                    parameters : {
                    	cancel_site : cancel_site
                    },
                    data: {
						deviceConfig:device.deviceConfig,
						siteName: device.siteName,
						siteId: device.siteId,
                        name: device.name,
                        address: device.address,
//                        location: this.location ? this.location : device.location, //TODO
                        businessState: device.businessState,
                        modelId: device.modelId,
                        serialNumber: device.serialNumber,
                        mobileNumber : device.mobileNumber,
                        plcId:device.plcId,
                        config : device.config
//                        timeout : device.timeout,
//                        ackTimeout : device.ackTimeout,
//                        ackRetries : device.ackRetries,
//                        sync : device.sync
//                        vendorId : 3
                    },
                    success: function(data) {
                    	dialog.render({lang:"save_success"});
                        self.fire("afterInfoUpdated", data.result._id);
                        self.render(data.result._id);
//                        self.disable();
                        self.getDeviceKey(data.result._id);
                    }
                    /*,
                    error : function(errorObj){
//                    	console.log(arguments, "error")
                    	if (errorObj && (errorObj.error_code == 20007)){
                    		dialog.render({lang:"device_already_exists"});
                    	}else{
                    		dialog.render({lang:"sys_error_please_wait"});
                    	}
                    }*/
                });
            }
        },
        
        setLocation : function (location){
        	this.location = location;
        },
        
        submitFavor: function() {
        	var self = this;
            if (this.favorButton.isSelected()) {
            	this.addFavorite();
            	/*if (this.currentFavorReq){
//            		alert(locale.get("20016"));
            	}else{
            		this.currentFavorReq = service.addFavorites(this.deviceId, function(data){
                    	if (data.result == "ok"){
//                    		alert(locale.get("favor_added"));
                    		dialog.render({
                    			lang:"favor_added"
                    		});
                    		self.currentFavorReq = null
                    		self.fire("afterInfoUpdated", self.deviceId);
                    	}
                    });
            	}*/
            } else {
            	this.removeFavorite();
            	/*if (this.currentFavorReq){
//            		alert(locale.get("20016"));
            	}else{
            		this.currentFavorReq = service.removeFavorites(this.deviceId, function(data){
	                	if (data.result.id){
//	                		alert(locale.get("favor_removed"));
	                		dialog.render({
	                			lang:"favor_removed"
	                		});
	                		self.currentFavorReq = null
	                		self.fire("afterInfoUpdated", self.deviceId);
	                	}
	                });
            	}*/
            }
        },

        addFavorite : function(){
        	var self = this;
        	if(this.deviceId){
        		service.addFavorites(this.deviceId, function(data) {
                	if (data.result == "ok"){
//                		alert(locale.get("favor_added"));
                		/*dialog.render({
                			lang:"favor_added"
                		});*/
                		self.fire("afterInfoUpdated", self.deviceId);
                	}
                },function(error){
                	dialog.render({lang:error.error_code});
                	self.favorButton.unSelect();
                }, this);
        	}
        },
        
        removeFavorite : function(){
        	var self = this;
        	if(this.deviceId){
        		service.removeFavorites(this.deviceId, function(data) {
        			if (data.result.id){
//                		alert(locale.get("favor_removed"));
                		/*dialog.render({
                			lang:"favor_removed"
                		});*/
                		self.fire("afterInfoUpdated", self.deviceId);
                	}
                },function(error){
                	dialog.render({lang:error.error_code});
                	self.favorButton.select();
                }, this);
        	}
        },
        /*
        renderMap: function() {
            this.map = new maps.Map({
                selector: this.element.find("#info-map"),
                zoomControl: true,
                panControl: false
            });
        },
        
        iconMapping : function(resource){
			var preStr = "cloud/resources/images/";
			
			var iconUrl = preStr + "ui-gis-";
			
			switch (resource.businessState){
				case 1 : iconUrl += "normal";break;
				case 0 : iconUrl += "setting";break;
				case 3 : iconUrl += "fix";break;
				case 2 : iconUrl += "gaojing";break;
			}
			if (resource.online == 1) {
				if (resource.alarmCount){
					iconUrl += "1"
				}else {
					iconUrl += "2"
				}
			} else {
				if (resource.alarmCount){
					iconUrl += "3"
				}else {
					iconUrl += "4"
				}
			}
			return iconUrl + ".png";
		},
        
        renderLocMarker : function(data){
        	//latitude = "34.16181564331055";
        	//longitude = "129.0234375"
//        	if (data.location && (!this.locMarker)){
	        	if (this.locMarker) {
	    			this.locMarker.destroy();
	    			this.locMarker = null;
	    		}
        		var iconUrl = this.iconMapping(data);
            	this.locMarker = this.map.addMarker({
    				position: new maps.LonLat(data.location.longitude, data.location.latitude),
//                    title: "设备位置",
                    title: locale.get("device_location"),
                    // animation: maps.Animation.drop
                    draggable: false,
                    icon: require.toUrl(iconUrl)
    			});
    			this.map.setCenter(this.locMarker.getPosition());
    			this.map.setZoom(6);
//        	}
        },*/
		
		renderPic:function(pics, index){
			var self = this;
    		var accessToken = cloud.Ajax.getAcsessToken();
			var picId = null;
    		if (pics){
				picId = (typeof(index) == "number") ? pics[index] : pics;
			}
    		
    		var url = cloud.config.FILE_SERVER_URL + "/api/file/" + picId + "?access_token=" + accessToken;
    		self.element.find("#info-site-pic").attr("src", url);
    		
    		this.currenPic = picId;
		},
		drawPicToolbar : function(){
        	var self = this;
       
        	this.previousPicBtn = new Button({
	        	container : self.element.find(".info-device-pic-row"),
	        	title : "previous",
	        	imgCls : "cloud-icon-leftarrow1",
	        	events : {
	        		click : function(){
	        			var index = $A(self.siteInfo.pics).indexOf(self.currenPic);
	        			
	        			if (index == 0){
	        				index = self.siteInfo.pics.length - 1;
	        			}else{
	        				index = index -1;
	        			}
	        			
	        			self.renderPic(self.siteInfo.pics, index)
	        		}
	        	}
	        });
        	this.nextPicBtn = new Button({
	        	container : self.element.find(".info-device-pic-row"),
	        	title : "next",
	        	imgCls : "cloud-icon-rightarrow1",
	        	events : {
	        		click : function(){
	        			var index = $A(self.siteInfo.pics).indexOf(self.currenPic);
	        			
	        			if (index == (self.siteInfo.pics.length - 1)){
	        				index = 0;
	        			}else{
	        				index = index + 1;
	        			}
	        			
	        			self.renderPic(self.siteInfo.pics, index)
	        		}
	        	}
	        });
        	
        },
		selectModel:function(mid,modelArray){
					for(var i=0;i<modelArray.length;i++){
						if(modelArray[i].innerHTML==mid){
							modelArray[i].selected=true;
							break;
						}
					}
				},
		checkType:function(){
			var self=this;
	 		var serialNumber = document.getElementById("info-serial-number").value;
	 			var p1 = serialNumber.substring(0,1);//判断是Router还是DTU
	 			var p2 = serialNumber.substring(1,2);//判断网络
	 			var p3 = serialNumber.substring(2,3);//判断700还是300还是600,900
	 			var p4 = serialNumber.substring(3,4);//是300还是320
	 			var deviceType =$("#info-model option");
	 			if(p1=="R"||p1=="r"){//Router
	 				if(p3==7){//700
			 			if(p2=="w"||p2=="W"){
			 				self.selectModel("IR7XX_WCDMA",deviceType);
//			 				for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe66874"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}
			 			}else if(p2=="v"||p2=="V"){
			 				self.selectModel("IR7XX_EVDO/CDMA",deviceType);
//			 				for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe66871"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}			 				
			 			}else if(p2=="g"||p2=="G"){
			 				self.selectModel("IR7XX_GPRS/EDGE",deviceType);
//			 				for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe66872"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}		
			 			}else if(p2=="c"||p2=="C"){
			 				self.selectModel("IR7XX_EVDO/CDMA",deviceType);
//			 				for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe66871"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}
			 			}else if(p2=="e"||p2=="E"){
			 				self.selectModel("IR7XX_GPRS/EDGE",deviceType);
//			 				for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe66872"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}
			 			}else if(p2=="t"||p2=="T"){
			 				self.selectModel("IR7XX_TD-SCDMA",deviceType);
//			 				for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe66873"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}
			 			}
		 			}
	 				else if(p3==3){//300
		 				if(p4==2){
		 					self.selectModel("IR320",deviceType);
//			 				for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe6686d"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}
		 				}else{
		 					self.selectModel("IR300",deviceType);
//		 					for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe6686c"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}
		 				}
		 			}else if(p3==9){
		 				if(p2=="p"||p2=="P"){
		 					self.selectModel("IR9XX_WCDMA",deviceType);
//		 					for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe66875"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}
		 				}else if(p2=="v"||p2=="V"){
		 					self.selectModel("IR9XX_EVDO",deviceType);
//		 					for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe66876"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}		 					
		 				}
//		 				else if(p2=="l"||p2=="L"){
//		 					self.selectModel("IR9XX_FDD-LTE",deviceType);
////		 					for(var i=0;i<deviceType.length;i++){
////			 					if(deviceType[i].value=="529c6735acd437272fe66877"){
////			 						deviceType[i].selected=true;
////			 						break;
////			 					}
////			 				}		
//		 				}
		 				else if(p2=="t"||p2=="T"){
		 					self.selectModel("IR9XX_TDD-LTE",deviceType);
//		 					for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6736acd437272fe66878"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}
		 				}
		 				else if(p2=="f" || p2=="F"){
		 					self.selectModel("IR9XX_FDD-LTE",deviceType);
		 				}
		 			}
		 			else if(p3==6){
		 				if(p2=="w"||p2=="W"){
		 					self.selectModel("IR6XX_WCDMA",deviceType);
//		 					for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe66870"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}
		 				}else if(p2=="v"||p2=="V"){
		 					self.selectModel("IR6XX_EVDO",deviceType);
//		 					for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe6686e"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}		 					
		 				}else if(p2=="t"||p2=="T"){
		 					self.selectModel("IR6XX_TD",deviceType);
//		 					for(var i=0;i<deviceType.length;i++){
//			 					if(deviceType[i].value=="529c6735acd437272fe6686f"){
//			 						deviceType[i].selected=true;
//			 						break;
//			 					}
//			 				}		 
		 				}
		 			}
	 			}else if(p1=="D"||p1=="d"){//DTU
	 				self.selectModel("InDTU3XX_GPRS/EDGE",deviceType);
//	 				for(var i=0;i<deviceType.length;i++){
//	 					if(deviceType[i].value=="529c6734acd437272fe6686b"){
//	 						deviceType[i].selected=true;
//	 						break;
//	 					}
//	 				}		 
	 			}
	 			else if(p1=="p" || p1=="P"){
	 				if(p2=="p"||p2=="P"){
	 					self.selectModel("IR8XX_WCDMA",deviceType);
//	 					for(var i=0;i<deviceType.length;i++){
//		 					if(deviceType[i].value=="529c6735acd437272fe66875"){
//		 						deviceType[i].selected=true;
//		 						break;
//		 					}
//		 				}
	 				}else if(p2=="f"||p2=="F"){
	 					self.selectModel("IR8XX_FDD-LTE",deviceType);
//	 					for(var i=0;i<deviceType.length;i++){
//		 					if(deviceType[i].value=="529c6735acd437272fe66876"){
//		 						deviceType[i].selected=true;
//		 						break;
//		 					}
//		 				}		 					
	 				}
	 				else if(p2=="t"||p2=="T"){
	 					self.selectModel("IR8XX_TDD-LTE",deviceType);
	 				}
//	 				else if(p2=="l"||p2=="L"){
//	 					self.selectModel("IR9XX_FDD-LTE",deviceType);
////	 					for(var i=0;i<deviceType.length;i++){
////		 					if(deviceType[i].value=="529c6735acd437272fe66877"){
////		 						deviceType[i].selected=true;
////		 						break;
////		 					}
////		 				}		
//	 				}
	 				else if(p2=="v"||p2=="V"){
	 					self.selectModel("IR8XX_EVDO",deviceType);
//	 					for(var i=0;i<deviceType.length;i++){
//		 					if(deviceType[i].value=="529c6736acd437272fe66878"){
//		 						deviceType[i].selected=true;
//		 						break;
//		 					}
//		 				}
	 				}		 			
 				
	 			}
	 			else if(p1=="g"||p1=="G"){
	 				if(p2=="p"||p2=="P"){
	 					self.selectModel("IG601_HSPA+",deviceType);
	 				}else if(p2 == 'V' || p2 == 'V') {
	 					self.selectModel("IG601_EVDO", deviceType);
	 				}
	 			}
		}
		
    });
    return InfoModule;
});