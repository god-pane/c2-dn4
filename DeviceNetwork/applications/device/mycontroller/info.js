define(function(require) {
    require("cloud/base/cloud");
    // require("cloud/lib/plugin/jquery-ui");
//    var maps = require("cloud/components/map");
    var Button = require("cloud/components/button");
    var template = require("text!./info.html");
    var service = require("cloud/service/service");
    var validator = require("cloud/components/validator");
    var SiteInfo = require("../../site/mysite/info");
    require("cloud/lib/plugin/jquery.uploadify");
    require("cloud/lib/plugin/jquery.qtip");
    
    var defaultPlc = {
        name: "",
        modelId: "",
        siteName: "",
        siteId:"",
        vendorId : 0,
        serialNumber : "",
        alias:"",
        machineConfig : {
            mbAddress : "",
            mbIp : "",
            mbPort : "",
            mbBaud : "",
            mbDataBit : "",
            mbStopBit : "",
            mbParity : "",
            queryInterval : "60",
            alarmTrapInterval : "120",
            alarmTrapTimeout : "30",
            statusTrapInterval : "60",
            statusTrapTimeout : "30",
            sensorRWTimeout : "10",
            usingStatus : "0",
            workMode : "0",
            cmdMode : "0"
        }
    };
    
    var InfoModule = Class.create(cloud.Component, {

        initialize: function($super, options) {
            $super(options);
            this.deviceId = null;
            this.element.html(template).addClass("device-info");
            this._renderCss();
            this.infoForm = this.element.find(".info-form");
            this.sites = null;
            this.renderButtons();
            this.renderSiteInfo();
            this.renderModels();
            this.validate();
            this.initPropWrapper();
//          locale.render({element:this.element});
            this.empower();
        },
        //兼容ie9
        _renderCss:function(){
        	$(".info-wrapper").css({
        		"width":"200px",
        		"margin":"0 auto",
        	});
        	$(".info-header").css({
        		"margin-top":"10px",
        		"height":"24px"
        	});
        	$(".info-header #info-name").css({
        		"margin-left":"19px",
        		"float":"left"
        	});
        	$(".info-header .info-plc-favor").css({
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
        		"margin":"8px 0px"
        	});
        	$(".info-map").css({
        		"width":"100%",
        		"height":"120px",
        		"margin":"10px 0px",
        		"border":"1px solid silver"
        	});
        	$(".info-buttonset-bottom a").css({
        		"margin":"8px 10px 0 0"
        	});
        	$(".info-buttonset-bottom").css({
        		"margin-bottom":"13px"
        	});
        	$("#module-info-tag-edit").css({
        		"padding":"0px",
        		"border":"0px"
        	});
        	$(".info-form-span").css({
        		"display":"inline-block",
        		"width":"81px",
        		"margin":"0px 10px"
        	});
        	$(".info-plc-pic-row").css({
        		"height":"132px"
        	});
        	$(".info-plc-pic-row a").css({
        		"margin":"3px 0px 0px 0px",
        		"float":"right"
        	});
        	$("#info-plc-pic").css({
        		"float":"left",
        		"width":"178px",
        		"height":"132px"
        	});
        	$("#device-site-info-qtip .cloud-bubble-hide").css({
        		"display":"none"
        	});
        	$("#device-site-info-qtip").css({
        		"height":"250px",
        		"width":"210px",
        		"overflow":"auto"
        	});
        	$(".info-online-status").css({
        		"float":"left"
        	});
        	$(".info-header-btn").css({
        		"float":"left",
        		"width":"20px",
        		"height":"17px",
        		"margin-top":"3px"
        	});
        	$(".info-plc-advances-title").css({
        		"left":"19px",
        		"position":"relative",
        		"background-color":"#F5F6F9",
        		"z-index":"1",
        		"width":"120px",
        		"padding-left":"12px"
        	});
        	$(".info-plc-advanced-form").css({
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
        	$(".info-plc-ip-row").css({
        		"height":"18px",
        		"line-height":"18px"
        	});
        	$("#info-plc-signal-icon").css({
        		"display":"inline-block",
        		"margin-bottom":"-2px"
        	});
        	$(".info-plc-advanced-row div#info-plc-advanced-form input.info-form-text").css({
        		"width":"60px"
        	});
        	$(".info-plc-advanced-sync-select").css({
        		"width":"80px"
        	});
        	$("#module-info-autocreate-site span.cloud-button-text").css({
        		"width":"150px",
        		"height":"40px"
        	});
        	$("#module-info-autocreate-site span.cloud-button-checkbox-icon").css({
        		"margin-top":"-13px"
        	});
        	$(".controller-info-site-qtip").css({
        		"width":"220!important",
        		"height":"200!important",
        		"overflow":"auto!important"
        	});
        	$("#info-site-name option").css({
        		"width":"100px!important",
        		"margin":"0 -18px 0 0"
        	});
        },
        empower: function() {
        	var controlConfig = permission.app("_controller");
        	if(!controlConfig.write) {
        		this.element.find(".info-header-btn").hide();
			}
        },
        
        initPropWrapper : function(){

            this.configWrapper = new cloud.PropWrapper({
                map : {
                    mbAddress : "info-form-deviceconfig-mbaddress",
                    mbIp : "info-form-deviceconfig-mbip",
                    mbPort : "info-form-deviceconfig-mbport",
                    mbBaud : "info-form-deviceconfig-mbBaud",
                    mbDataBit : "info-form-deviceconfig-mbDataBit",
                    mbStopBit : "info-form-deviceconfig-mbStopBit",
                    mbParity : "info-form-deviceconfig-mbParity",
                    queryInterval : "info-form-deviceconfig-queryInterval",
                    alarmTrapInterval : "info-form-deviceconfig-alarmTrapInterval",
                    alarmTrapTimeout : "info-form-deviceconfig-alarmTrapTimeout",
                    statusTrapInterval : "info-form-deviceconfig-statusTrapInterval",
                    statusTrapTimeout : "info-form-deviceconfig-statusTrapTimeout",
                    sensorRWTimeout : "info-form-deviceconfig-sensorRWtimeout",
                    usingStatus : "info-form-deviceconfig-usingStatus",
                    workMode : "info-form-deviceconfig-workMode",
                    cmdMode : "info-form-deviceconfig-cmdMode"
                },
                scope : this
            });
            this.ctrlWrapper = new cloud.PropWrapper({
                map : {
                    name : {
                        $setter : this.setDeviceName,
                        $getter : this.getDeviceName
                    },
                    serialNumber : "info-serial-number",
                    siteId : {
                        $setter : this.setSiteName,
                        $getter : this.getSiteId
                    },
                    siteName : {
                        $getter : this.getSiteName
                    },
                    model : {
                        $getter : this.getDeviceModelName,
                    },
                    modelId : {
                        $setter : this.setDeviceModel,
                        $getter : this.getDeviceModel
                    },
                    alias:{
                    	$setter:this.setAliases,
                    	$getter:this.getAliases
                    }
                },
                scope : this
            });
            
//            window.testProp = this;
        },
        
        validate:function(){
            var self = this;
            validator.render("#info-wrapper",{
                    promptPosition:"bottomLeft",
                    scroll: false
            });
        },
        
        renderButtons: function() {
            var self = this;

             this.favorButton = new Button({
                 container: this.element.find(".info-plc-favor"),
                 // id : "div.module-info-tag-favor",
                 title: "favor",
                 lang:"{title:favor}",
                 checkboxCls: "cloud-icon-star",
                 checkbox: true,
                 events: {
                     click: self.submitFavor.bind(self)
                 }
             });
             
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

            this.submitButton = new Button({
                container: this.element.find(".info-buttonset-bottom"),
                id: "module-info-tag-submit",
                imgCls: "cloud-icon-yes",
                text: "提交",
                lang:"{title:submit,text:submit}",
                events: {
                    click: function(){
                        $("#info-plc-advanced-form").css("display","block");
                        if(validator.result("#info-wrapper")){
                            $("#info-plc-advanced-form").css("display","none");
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
                container:".info-plc-model-row",
                id:"info-plc-model",
                imgCls:"cloud-icon-watch module-info-imghelper",
                events:{
                    
                }
            });
            this.modalDetailBtn.hide();//TODO
            
            this.customerDetailBtn = new Button({
                container:".info-plc-customer-row",
                id:"info-plc-customer",
                imgCls:"cloud-icon-watch module-info-imghelper",
                events:{
                    
                }
            });
            
            this.siteDetailBtn = new Button({
                container:".info-plc-site-row",
                id:"info-plc-site",
                imgCls:"cloud-icon-watch module-info-imghelper",
                events:{
                    click : function(){
                        var siteId = self.element.find("#info-site-name").val();
                        $("#info-devices-table").css("height","125px");
                        if (siteId){
                            $(self.siteDetailBtn.element).qtip("enable");
                            self.siteInfo.render(siteId,"controller");
                        }else {
                            $(self.siteDetailBtn.element).qtip("disable",true);
                        }
                    }
                }
            });
            
            
            
            this.alarmDetailBtn = new Button({
                container:".info-plc-alarm-row",
                id:"info-plc-alarm",
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
        },
        
        drawAdvancedBtn:function(){
            if(!this.advancedBtn){
                this.advancedBtn = new Button({
                    container: "#info-plc-button-content",
                    id: "info-adv-checkbox",
                    imgCls: "cloud-icon-arrow3",
                    lang:"{title:}",
                    events: {
                        click: function(){
                            $(this.element.find("#info-plc-advanced-form")).toggle(100,"linear");
                        },
                        scope: this
                    }
                });
            }else{
                this.element.find("#info-plc-advanced-form").hide();
            }
        },
        
        renderSitesOptions: function() {
            var self = this;
            self.element.find("#info-site-name").empty().append($("<option>"));
            cloud.Ajax.request({
                url: "api/sites",
                type: "get",
                parameters: {
                    verbose: 1,
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
//                  this.setDeviceModel(self.deviceInfo.modelId);
                    this.ctrlWrapper.set("modelId", self.deviceInfo.modelId);
                }else if (models[0]){
                    //var firstModId = $(firstModOpt).val();
//                    this.setDeviceModel(models[0]._id);
                    this.ctrlWrapper.set("modelId", models[0]._id);
                }
                
            });
            $select.change(function(){
                var modelId = $(this).val();
                self.swapByModelIOType(modelId);
            });
        },
        
        swapByModelIOType : function(modelId){
            var model = this.modelsMap.get(modelId);
            if (model){
                if (model.ioType == "1" || model.ioType == "3"){//serial_port
                    this.element.find(".info-form-serialport-row").show();
                    this.element.find(".info-form-network-port").show();
                    this.element.find(".info-form-deviceconfig-mbport-row").hide();
                    this.element.find(".info-form-ethernetport-row").hide();
                }else if (model.ioType == "2"){//ethernet_port
                    this.element.find(".info-form-serialport-row").hide();
                    this.element.find(".info-form-network-port").hide();
                    if(model.sensorType=="61446"){
                        this.element.find("#modbus_tcp_net").show();
                        this.element.find(".info-form-deviceconfig-mbport-row").show();
                    }else{
                    	this.element.find(".info-form-deviceconfig-mbport-row").hide();
                    };                   
                    this.element.find(".info-form-ethernetport-row").show();
                }else if (model.ioType == "0"){//GIO
                    this.element.find(".info-form-serialport-row").show();
                    this.element.find(".info-form-network-port").show();
                    this.element.find(".info-form-ethernetport-row").show();
                }
            }
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
//                      var deviceInfo = self.deviceInfo;
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
                    classes: "qtip-shadow qtip-light controller-info-site-qtip",
                    width: 220
                }
            });
        },
        validateStatusTrapTimeout:function(){
        	var self=this;
        	$("#info-form-deviceconfig-statusTrapInterval").bind("change",function(){
        		var queryInput=$("#info-form-deviceconfig-queryInterval");
        		try{
        			var inValue1=parseFloat($(this).val());
        			var inValue2=parseFloat(queryInput.val());
    				var className=$(this).attr("class");
    				var staticClassName="info-form-text validate[required,min[5],max[86400],custom[number],funcCall[cloudInput]]";
    				var posSta=className.indexOf("validate");
    				var posEnd=className.indexOf("]]");
    				var stringPre=className.substring(0,posSta);
    				var stringAft=className.substring(posEnd+2);
    				var validateString="validate[required,min[5],max[86400],custom[number],custom[queryReport],funcCall[cloudInput]]";
    				var tempClassName=stringPre+validateString+stringAft;
        			if((inValue1%inValue2)!="0"){        				
        				$(this).removeClass(className).addClass(tempClassName);
        			}
        			else{
        				if(tempClassName==className){
        					$(this).removeClass(tempClassName).addClass(staticClassName);
        				}
        			}
        		}
        		catch(e){
        			//
        		}
        	});
        	$("#info-form-deviceconfig-queryInterval").bind("change",function(){
        		$("#info-form-deviceconfig-statusTrapInterval").change().focus().blur();
//        		var queryInput=$("#info-form-deviceconfig-statusTrapInterval");
//        		try{
//        			var inValue1=parseFloat($(this).val());
//        			var inValue2=parseFloat(queryInput.val());
//        			var className=$(this).attr("class");
//    				var staticClassName="info-form-text validate[required,custom[number],min[5],max[3600],funcCall[cloudInput]]";
//    				var posSta=className.indexOf("validate");
//    				var posEnd=className.indexOf("]]");
//    				var stringPre=className.substring(0,posSta);
//    				var stringAft=className.substring(posEnd+2);
//    				var validateString="validate[required,custom[number],min[5],max[3600],custom[queryReport],funcCall[cloudInput]]";
//    				var tempClassName=stringPre+validateString+stringAft;
//        			if((inValue2%inValue1)!="0"){       				        				
//        				$(this).removeClass(className).addClass(tempClassName);
//        			}
//        			else{
//        				if(tempClassName==className){
//            				$(this).removeClass(tempClassName).addClass(staticClassName);
//        				}
//        			}
//        		}
//        		catch(e){
//        			//
//        		}
        	});
        },
        render: function(id) {
            this.loadSitesComplete = false;
            this.deviceId = id;
            this.deviceInfo = null;
            this.removeMySiteOpt();
            this.renderSitesOptions();
            this.drawAdvancedBtn();
            if (this.deviceId) {
                this.mask();
                this.loadDeviceInfo();
//                this.favorButton.show();
                this.favorButton.hide();
            } else {
                this.deviceInfo = null;
                this.clear();
                this.enable();
                this.favorButton.hide();
            }
            this.validateStatusTrapTimeout();
            this.renderAliases();
        },
        _autoCreateAlias:function(aliases,siteId){
        	var self=this;
			var preString="m";
			aliases.css({"display":"block"});
			self.lastRequest=cloud.Ajax.request({
				url:"api/machines",
				parameters:{
					verbose:100,
					site_id:siteId,
					limit:0
				},
				success:function(data){
					var tempAlias=[];
					data.result.each(function(one){
						if(one.alias!==undefined){
							if(one.alias.indexOf(preString)==0){
    							var num=parseInt(one.alias.slice(1));
    							if(!isNaN(num)){
    								tempAlias.push(num);
    							}
    						}
						}
				
					});
					for(var j=0;j<tempAlias.length-1;j++){
						for(var k=0;k<tempAlias.length-(j+1);k++){
							if(tempAlias[k]>tempAlias[k+1]){
								var temp=tempAlias[k];
								tempAlias[k]=tempAlias[k+1];
								tempAlias[k+1]=temp;
							}
						}
						
					}
					var preNum;
					var sufNum;
					for(var i=0;i<tempAlias.length;i++){
						if(i==0){
							preNum=tempAlias[i];
							if(preNum>0){
								sufNum=preNum-1;
								break;
							}
							else if(preNum===0){
								sufNum=preNum+1;
								continue;
							}
							else{
								sufNum=preNum;
								break;
							}
						}
						else{           							
							var diff=tempAlias[i]-preNum;
							if(diff>1){
								sufNum=preNum+1;
								break;
							}
							else if(diff===1){
								preNum=tempAlias[i];
								sufNum=preNum+1;
								continue;
							}
							else{
								sufNum=preNum;
								break;
							}
						}
					}
					if(sufNum!==undefined){
						$("#info-plc-aliases").val(preString+sufNum);
					}
					else{
						sufNum=0;
						$("#info-plc-aliases").val(preString+sufNum);
					}
				},
				error:function(){
				}
			})      			            		
        },
        renderAliases:function(id){       	
        	var self=this;
        	var aliases=$("#info-form-row-aliases");
        	if(!id){
        		aliases.css({"display":"none"});
        	}
        	$("#info-site-name").change(function(){    		
        		var siteId=$(this).val();
        		if(siteId){
        			aliases.css({"display":"block"});
        			if(self.deviceInfo!==null){
        				if($(this).val()){
        					var alias=self.deviceInfo.alias;
        					if(alias){
        						$("#info-plc-aliases").val(alias);
        					}
        					else{
        						self._autoCreateAlias(aliases,siteId);
        					}
        				}
        				else{
        					$("#info-plc-aliases").val("");
        				}
        			}
        			else{
        				self._autoCreateAlias(aliases,siteId);
        			}
        		}
        		else{
        			aliases.css({"display":"none"});
        			$("#info-plc-aliases").val("");
        		}
        	});
        },
//        renderAliases_two:function(){     	
//        	var self=this;
//        	var aliases=$("#info-form-row-aliases");
//        	aliases.css({"display":"none"});
//        	var preString="ctr";
//        	$("#info-site-name").change(function(){
//        		var siteId=$(this).val();
//        		if(siteId){
//        			aliases.css({"display":"block"});
//        			cloud.Ajax.request({
//        				url:"api/machines",
//        				parameters:{
//        					verbose:1,
//        					site_id:siteId
//        				},
//        				success:function(data){
//        					var tempAlias=[];
//        					data.result.each(function(one){
//        						if(one.alias.indexOf(preString)==0){
//        							var num=parseInt(one.alias.slice(3));
//        							if(!isNaN(num)){
//        								tempAlias.push(num);
//        							}
//        						}
//        					});
//        					var maxNum;
//        					for(var i=0;i<tempAlias.length;i++){
//        						if(i==0){
//        							maxNum=tempAlias[i];
//        						}
//        						else{
//        							if(maxNum<tempAlias[i]){
//        								maxNum=tempAlias[i];
//        							}
//        						}
//        					}
//        					$("#info-plc-aliases").val(preString+maxNum.toString());
//        				},
//        				error:function(){
//        				}
//        			})      			
//        		}
//        		else{
//        			aliases.css({"display":"none"});
//        			$("#info-plc-aliases").val("");
//        		}
//        	});      	
//        },
        getAliases:function(){
        	return $("#info-plc-aliases").val();
        },
        setAliases:function(aliases){
        	$("#info-plc-aliases").val(aliases);
        },
        getResId : function(){
            return this.deviceId ? this.deviceId : null;
        },

        setDeviceInfo: function(data) {
            if (data.result) {
                data = data.result;
            };
            /*this.setDeviceName(data.name);
            
            this.setDeviceModel(data.modelId);
            this.setSiteName(data.siteId);*/
            
            this.ctrlWrapper.setBean(data);
            if (data.machineConfig){
                this.configWrapper.setBean(data.machineConfig);
            };
            
            if(this.deviceId == null){
                this.favorButton.setSelect(false);
            }else{
                service.verifyFavorites([this.deviceId], function(data) {
                    this.favorButton.setSelect(data.result.first() == 1);
                }, this);
            }
        },
        
        clear: function() {
//          this.loadSitesComplete = false;
            this.deviceId = null;
            this.setDeviceInfo(defaultPlc);
            var firstModOpt = this.element.find("#info-model option")[0];
            if (firstModOpt){
                var firstModId = $(firstModOpt).val();
                this.setDeviceModel(firstModId)
            }
        },
        setDeviceName: function(name) {
            this.element.find("#info-name").val(name);
        },

        getDeviceName: function() {
            return this.element.find("#info-name").val();
        },

        setDeviceModel: function(id) {
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
        
        setSiteName: function(name) {
        	var flag=false;
            var self = this;
            this.element.find("#info-site-name option").each(function(){
                var option = $(this);
                if (option.val() == name) {
                    option.attr("selected", true);
                    flag=true;
                } else {
                    option.removeAttr("selected");
                }
            });
            if(!flag && !!name){
            	var no=locale.get("no_privilege");
            	$("<option>").text(no).val(name).attr({"selected":true,"disabled":true}).appendTo($("#info-site-name"));
            }
        },
        getSiteId: function() {
            var siteId = this.element.find("#info-site-name option:selected").val();
            return siteId ? siteId : null;
        },
        getSiteName: function() {
            return this.element.find("#info-site-name option:selected").text();
        },

        loadDeviceInfo: function() {
            cloud.Ajax.request({
                url: "api/machines/" + this.deviceId,
                parameters: {
                    verbose: 100
                },
                type: "get",
                success: function(data) {
                    if (data.result){
                        if (! data.result.siteId){
                            data.result.siteId = null;
                        }
                        this.deviceInfo = data.result;
                        this.setDeviceInfo(data.result);
                        if(!this.deviceInfo.siteId){
                        	$("#info-form-row-aliases").css("display","none");
                        }
                        else{
                        	$("#info-form-row-aliases").css("display","block");
                        }
                    }                   
                    this.disable();
                    if (this.loadSitesComplete) {
                        this.unmask();
                    }
                    
                }.bind(this)
            });
        },

        loadDeviceModels: function(callback) {
            var self = this;
            cloud.Ajax.request({
                url: "api/models",
                parameters: {
                    verbose: 4,
                    limit: 0,
                    gateway : false
                },
                type: "get",
                success: function(data) {
                    if (Object.isFunction(callback)) {
                        callback.call(self, data.result);
                    }
                }.bind(this)
            });
        },
   
        removeMySiteOpt : function(){
            this.mySiteOpt && this.mySiteOpt.remove();
        },

        enable: function() {
            this.editButton.hide();
            this.submitButton.show();
            this.cancelButton.show();
            
            // this.deleteButton.
            this.infoForm.find("input, select").removeAttr("disabled");
            //this.element.find("#info-whether-router").removeAttr("disabled");
            this.element.find("#info-name").removeAttr("disabled");
            if (this.deviceId){// model cannot be updated
                this.element.find("#info-model").attr("disabled", true);
            }else{
                this.element.find("#info-model").removeAttr("disabled");
            }
        },

        disable: function() {
            this.editButton.show();
            this.submitButton.hide();
            this.cancelButton.hide();
            
            this.infoForm.find("input, select").attr("disabled", true); 
            //this.element.find("#info-whether-router").attr("disabled", true);
            this.element.find("#info-name").attr("disabled", true);
            
        },
        
        getter : function(){
            
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
            
        },

        submit: function() {
            var self = this;
            var device = this.ctrlWrapper.getBean();
            var machineConfig = this.configWrapper.getBean();
            if(device.siteName==locale.get("no_privilege")){
            	device.siteName=self.deviceInfo.siteName;
            }
            device.machineConfig = machineConfig;
            device.vendorId = 0;
            //manual set default vendorId
//            console.log("device from wrapper", device);
            var display=this.element.find(".info-form-network-port").css("display");
            if(display=="none"){
//            	mbBaud : "info-form-deviceconfig-mbBaud",
//              mbDataBit : "info-form-deviceconfig-mbDataBit",
//              mbStopBit : "info-form-deviceconfig-mbStopBit",
//              mbParity : "info-form-deviceconfig-mbParity",
          	delete device.machineConfig.mbBaud;
          	delete device.machineConfig.mbDataBit;
          	delete device.machineConfig.mbStopBit;
          	delete device.machineConfig.mbParity;
          	delete device.machineConfig.mbAddress;
          	if(!device.machineConfig.mbPort){
          		delete device.machineConfig.mbPort;
          	}            	
          }
            if (this.deviceId === null) {
                cloud.Ajax.request({
                    url: "api/machines/",
                    type: "post",
                    data: device,
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
            	var cancelSite;
            	if(!device.siteName){
            		cancelSite=1;
            	}
                cloud.Ajax.request({
                    url: "api/machines/" + this.deviceId,
                    type: "put",
                    parameters:{                   	
                    	cancel_site:cancelSite
                    },
                    data: device,
                    success: function(data) {
                        dialog.render({lang:"save_success"});
                        self.fire("afterInfoUpdated", data.result._id);
                        self.render(data.result._id);
//                        self.disable();
                    }
                    /*,
                    error : function(errorObj){
//                      console.log(arguments, "error")
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
            } else {
                this.removeFavorite();
            }
        },

        addFavorite : function(){
            var self = this;
            if(this.deviceId){
                service.addFavorites(this.deviceId, function(data) {
                    if (data.result == "ok"){
//                      alert(locale.get("favor_added"));
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
//                      alert(locale.get("favor_removed"));
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
        
        destroy : function($super){
            
        }
        
    });
    return InfoModule;
});