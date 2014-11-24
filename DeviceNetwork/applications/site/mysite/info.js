define(function(require) {
    require("cloud/base/cloud");
    require("cloud/lib/plugin/jquery-ui");
//    var maps = require("cloud/components/map");
    var Button = require("cloud/components/button");
    var template = require("text!./info.html");
    var service = require("cloud/service/service");//公共service
	var Table = require("cloud/components/table");
	var Uploader = require("cloud/components/uploader");
//	var CusInfo = require("../../system/customer/info");
	var validator = require("cloud/components/validator");
    require("cloud/lib/plugin/jquery.qtip");
	require("cloud/lib/plugin/jquery.uploadify");

    require("cloud/components/Lmap");

	//infoModule
    var InfoModule = Class.create(cloud.Component, {

        /**
         * 初始化组件
         * @param $super {Function} 父函数
         * @param options {object} 参数
         */
        initialize: function($super, options) {
            $super(options);
            this.options = options;
            this.siteId = null;
            this.element.html(template).addClass("site-info");
            this.infoForm = this.element.find(".info-form");

            //渲染现场下的设备列表
            var flag=permission.app("_controller")["read"]&&permission.app("_gateway")["read"];
            if(flag){
            	this.drawDevicesTable();
            }
            //渲染现场图片工具栏
            this.drawPicToolbar();
            this.renderButtons();
//            this.renderCustomers();
            this._renderCss();
            //初始化验证插件
            this.initValidate();
            locale.render({element:this.element});
//            this._events();
        },
        //兼容ie9
        _renderCss:function(){
//        	$(".info-wrapper").css({
//        		"width":"200px",
//        		"margin":"0 auto"
//        	});
        	$(".info-header").css({
        		"margin-top":"10px",
        		"overflow":"hidden"
        	});
        	$(".info-header #info-name").css({
        		"margin-left":"12px"
        	});
        	$(".info-form-row .site-info-form-label").css({
        		"text-align":"left",
        		"display":"inline-block",
        		"width":"70px"
        	});
        	$(".info-form-row").css({
        		"margin":"8px 0"
        	});
        	$(".info-site-ip-row").css({
        		"height":"18px",
        		"line-height":"18px"
        	});
        	$(".info-site-ip-signal").css({
        		"display":"inline-block",
        		"margin-bottom":"-2px"
        	});
        	$(".info-map").css({
        		"width":"228px",
        		"height":"120px",
        		"margin":"10px 0",
        		"border":"1px solid silver"
        	});
        	$(".info-buttonset-site").css({
        		"text-align":"left",
        		"margin":"8px 0 13px 0"
        	});
        	$(".info-buttonset-site .cloud-button-body-main").css({
        		"margin":"1px 2px",
        		"padding":"1px 5px"
        	});
        	$(".info-site-pic-row").css({
        		"height":"132px",
        		"border":"1px solid rgb(172,166,168)"
        	});
        	$(".info-site-pic-row a").css({
        		"margin":"3px 0px 0px 0px",
        		"float":"right"
        	});
        	$("#info-site-pic").css({
        		"float":"left",
        		"width":"176px",
        		"height":"132px"
        	});
        	$("#info-devices-table").css({
        		"border":"1px solid rgb(215,216,218)",
        		"overflow":"auto",
        		"width":"228px"
        	});
        	$("#site-cus-info-qtip .cloud-bubble-hide").css({
        		"display":"none"
        	});
        	$("#info-site-contact-form .site-info-form-label").css({
        		"margin-left":"10px"
        	});
        	$(".site-info-btns").css({
        		"width":"22px",
        		"height":"23px",
        		"float":"left"
        	});
        	$(".info-site-favor").css({
        		"float":"left"
        	});
        	$(".info-device-info").css({
        		"border":"1px solid rgb(194,194,194)"
        	});
        	$(".info-device-info-title").css({
        		"background-color":"rgb(231,231,231)",
        		"height":"25px",
        		"line-height":"25px",
        		"padding-left":"10px"
        	});
        	$(".info-device-info-content-row").css({
        		"margin":"5px 0px 5px 10px"
        	});
        	$(".info-device-info-content-row span").css({
        		"word-wrap":"break-word",
        		"margin-left":"14px"
        	});
        	$(".info-device-info-close").css({
        		"float":"right"
        	});
        	$(".info-site-automatic-positioning a").css({
        		"margin-left":"0px"
        	});
        	$("#info-site-automatic-positioning-site span.cloud-button-text").css({
        		"width":"150px",
        		"height":"40px"
        	});
        	$("#info-site-automatic-positioning-site span.cloud-button-checkbox-icon").css({
        		"margin-top":"-13px"
        	});
        },
        permission:function(){
        	var self = this;
			var flag=permission.app("_site")["write"];
			if(!flag){
				self.editButton.hide();
				self.cancelButton.hide();
				self.submitButton.hide();
				self.favorBtn.hide();
				self.contactButton.hide();
				self.autoPosition.disable();
			};
        },
//        _events:function(){
//        	var self = this;
//        	this.element.find("#info-name").focusout(function(){
//        		if(!$(this).val()){
//        			validator.prompt("#info-name",{text:locale.get({lang:"not_null"}),promptPosition:"bottomLeft"});
//        			return false;
//        		}
//        		if(!self.validateName()){
//        			validator.prompt("#info-name",{text:locale.get({lang:"site+already_exists"}),promptPosition:"bottomLeft"});
//        			return false;
//        		}
//        	});
//        },

        /**
         * 初始化验证插件
         */
        initValidate:function(){
        	validator.render("#info-form",{
        		promptPosition:"bottomLeft"
        	});
        },

//        validateName : function(){
//        	var self = this;
//        	var result;
//        	cloud.Ajax.request({
//                url: "api/sites",
//                type: "get",
//                async:false,
//                parameters: {
//                    verbose: 100,
//                    limit: 1,
//                    name : self.element.find("#info-name").val()
//                },
//                success: function(data) {
//                	if (data.result.length > 0){
//                		result = false;
//                	}else {
//                		result = true;
//                	}
//                }
//            });
//        	return result;
//        },

        /**
         * 渲染按钮
         */
        renderButtons: function() {
            var self = this;

            this.editButton = new Button({
                container: this.element.find(".info-edit"),
                id: "module-info-site-edit",
                imgCls: "cloud-icon-edit",
                lang:"{title:edit}",
                events: {
                    click: function(){
                    	self.preventAutoPos=true;
                    	self.enable();
                    }
                }
            });
            this.favorBtn = new Button({
        		container : $("div.info-header span.info-site-favor"),
        		id : "module-info-site-favor",
        		lang:"{title:favor}",
        		checkboxCls: "cloud-icon-star",
        		checkbox : true,
        		events : {
        			click : self.toggleFavor.bind(self)
        		}
        	});

            this.submitButton = new Button({
                container: this.element.find(".info-buttonset-site"),
                id: "module-info-site-submit",
                imgCls: "cloud-icon-yes",
                text:locale.get("submit"),
                lang:"{title:submit,text:submit}",
                events: {
                    click: function(){
                    	self.submit();
                    }
                }
            });

            this.cancelButton = new Button({
                container: this.element.find(".info-buttonset-site"),
                id: "module-info-site-cancel",
                imgCls: "cloud-icon-no",
                text:locale.get("cancel"),
                lang:"{title:cancel,text:cancel}",
                events: {
                    click: function(){
                    	self.preventAutoPos=false;
                    	self.cancelEdit();
                    	$(".formError").trigger("click");
                    	}
                }
            });

            this.contactButton = new Button({
                container: this.element.find("#info-site-button-content"),
                id: "module-info-site-contact",
                imgCls: "cloud-icon-arrow3",
                lang:"{title:view_detail,text:view_detail}",
                events: {
                    click: function(){
                    	$(this.element.find("#info-site-contact-form")).toggle(100, "linear");
                    },
                    scope : this
                }
            });
            this.closeDeviceInfo=new Button({
            	container:this.element.find(".info-device-info-close"),
            	imgCls:"cloud-icon-no",
            	events:{
            		click:function(){
            			this.element.find("#info-device-info-device-type").text("");
            			this.element.find("#info-device-info").hide(250,"linear");
            		},
            		scope:this
            	}
            });
            this.autoPosition=new Button({
            	container:this.element.find("#info-site-automatic-positioning"),
            	id:"info-site-automatic-positioning-site",
            	checkbox:true,
            	text:locale.get("automatic_positioning"),
            	lang:"{title:automatic_positioning,text:automatic_positioning}",
            	events:{
//                    click: function(){
//                    	if (this.autoCreateSite.isSelected()){
//                    		this.element.find("#info-site-name").attr("disabled", true);
//                    		this.element.find(".info-device-site-row").hide();
//                    	}else{
//                    		this.element.find("#info-site-name").removeAttr("disabled");
//                    		this.element.find(".info-device-site-row").show();
//                    	}
//                    },
//                    scope : this
//
            		click:function(){

            			if(!self.autoPosition.isSelected()){
//            				self.locMarker && self.locMarker.setDraggable(true);
                            self.locMarker && self.locMarker.dragging.enable();
            			}
            			else{
//							self.locMarker && self.locMarker.setDraggable(false);
                            self.locMarker && self.locMarker.dragging.disable();
						}
            			if(self.siteId){
            				if(!self.preventAutoPos){
            					self.preventSucDialog=true;
                				self.submit(function(data){
                                    self.fire("onAutoPos",data,self.autoPosition.isSelected());
                                });
            				}
            			}
            		}
            	}
            });
        },
        //点击"自动定位"后，2秒，去刷新info中的marker
        refreshCurMarker:function(){
        	var self=this;
         return	function(){
           	 cloud.Ajax.request({
   	                url: "api/sites/" + self.siteId,
   	                parameters: {
   	                    verbose: 100
   	                },
   	                type: "get",
   	                success: function(data) {
   	                	self.renderLocMarker(data.result);
   	                }
   	            });
           }
        },
//        renderCustomers: function() {
//        	var self = this;
//            this.loadCustomers(function(customers) {
//                var $select = this.element.find("#info-site-customer");
//                customers.each(function(customer) {
//                    $("<option>").val(customer._id).text(customer.name).appendTo($select);
//                }, this);
//            });
//            this.element.find("#info-business-state").change(function(){
//
//            })
//        },

        /**
         * 按id加载info模块
         * @param id {string} 要加载的现场的id
         */
        render: function(id,string) {
        	this.preventSucDialog=false;
        	this.preventAutoPos=false;
        	this.element.find("#info-device-info").hide(250,"linear");
            this.siteId = id;
            this.string=string;
            this.renderMap();
            this.initUploader();
            if (this.siteId) {
                this.mask();
                this.loadSiteInfo();
//                this.favorBtn.show();
                this.favorBtn.hide();
                if(string=="controller"){
                	$("#info-map").css({
                		"display":"none"
                	});
                	this.editButton.hide();
                }

            } else {
                this.clear();
                this.enable();
                this.favorBtn.hide();
            }
//            this.permission();
        },

        /**
         * 获取当前已加载/正在加载的现场的ID
         */
        getResId : function(){
        	return this.siteId ? this.siteId : null;
        },

        /**
         * 根据现场对象（参考API）加载现场
         * @param data {object} 要加载的现场对象
         */
        setSiteInfo: function(data) {
        	var self = this;
        	//this.siteInfo = null
            if (data.result) {
                data = data.result;
            }

            this.siteInfo = data;
            this.element.find("#info-name").val(data.name);

            if(this.siteId == null){
                this.favorBtn.setSelect(false);
            }else{
                service.verifyFavorites([this.siteId], function(data) {
                    this.favorBtn.setSelect(data.result.first() == 1);
                }, this);
            }

            this.element.find("#info-business-state").val(data.address);

            //TODO
//            data.pubIp = "10.6.15.34!";
//            data.signalStrength = 1;
            if (data.pubIp){
            	this.element.find(".info-site-ip-row").show();
            	this.element.find("#info-site-ip").html(data.pubIp);
            }else{
            	this.element.find(".info-site-ip-row").hide();
            }

            if (data.signalStrength){


            	this.element.find(".info-site-ip-signal").addClass("cloud-icons-default cloud-icon-xinhao4");
            }

            //address
            this.element.find("#info-site-address").val(data.address);

            //业务状态
            this.element.find("#info-business-state option[value='" + data.businessState + "']")
                .attr("selected", "selected");

            /*self.statDetailBtn || (self.statDetailBtn = new Button({
	        	container : self.element.find(".info-business-state-row"),
	        	id : "info-business-state-detail",
	        	imgCls : "cloud-icon-watch module-info-imghelper",
	        	events : {
	        		click : function(){}
	        	}
	        }));*/
            //自动定位
            if(data.autoNavi){
            	this.autoPosition.setSelect(true);
            }
            else{
            	this.autoPosition.setSelect(false);
            }
            //事件告警
            var alarmCount = 0;
            if (data.alarmCount){
            	alarmCount = data.alarmCount;
            }
            this.element.find("#info-site-event-alarm").text("  " +alarmCount + "  个");

            self.eventDetailBtn || (self.eventDetailBtn = new Button({
	        	container : self.element.find(".info-site-event-row"),
	        	id : "info-business-event-detail",
	        	imgCls : "cloud-icon-watch module-info-imghelper",
	        	events : {
	        		click : function(){}
	        	}
	        }));

            //所属客户
            this.element.find("#info-site-customer option[value='" + data.customerId + "']")
                .attr("selected", "selected");

            self.customerDetailBtn || (self.customerDetailBtn = new Button({
	        	container : self.element.find(".info-site-customer-row"),
	        	id : "info-business-customer-detail",
	        	imgCls : "cloud-icon-watch module-info-imghelper",
	        	events : {
	        		click : function(){
	        			var cusId = self.element.find("#info-site-customer").val();
	        			if (cusId){
	        				self.cusInfo.render(cusId);
	        			}
	        		}
	        	}
	        }));

//            self.renderCusInfo();
            self.customerDetailBtn.element.qtip({
                content: {
                    text: self.cusInfoQtip
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


            self.setContact(data.contact);
            self.renderLocMarker(data);
            if(self.siteId)self._renderDeviceTable(self.siteId);

//            if (data && data.deviceIdList && data.deviceIdList.length > 0) {
//            	self.renderDevicesTable(data);
//            }else {
//            	self.deviceTable && self.deviceTable.render([])
//            }

//            self.renderDoc();

//            self.renderPic(data.pics, 0)
            //this.siteId && (self.renderDoc(this.siteId));
        },

        /**
         * 初始化客户显示qtip
         */
        renderCusInfo : function(){

        	this.cusInfoQtip = $("<div id = 'site-cus-info-qtip'>")
        		.addClass("ui-helper-hidden")
        		.appendTo(this.element);

        	this.cusInfo = new CusInfo({
        		selector: this.cusInfoQtip
        	})
        },

        /**
         * 加载联系人信息
         * @param contact {object} 联系人对象
         */
        setContact : function(contact){
        	var nameEl = this.element.find("#info-device-contact-name");
        	var phoneEl = this.element.find("#info-device-contact-phone");
        	var emailEl = this.element.find("#info-device-contact-email");

        	this.element.find(".info-site-contact-row input").val("");
        	if (contact){ // && contact.name !== "" && contact.phone !== "" && contact.email !== ""

            	this.element.find("#info-site-contact-tips").html("");

            	if (contact.name){
            		nameEl.val(contact.name);
            		//nameRow.show();
            	}else {
            		//nameRow.hide();
            	};
            	if (contact.phone){
            		phoneEl.val(contact.phone);
            		//phoneRow.show();
            	}else {
            		//phoneRow.hide();
            	};
            	if (contact.email){
            		emailEl.val(contact.email);
            		//emailRow.show();
            	}else {
            		//emailRow.hide();
            	}
        	}else{
//        		this.element.find("#info-site-contact-tips").html(locale.get({lang:"none"}));
        		nameEl.val("");
        		phoneEl.val("");
        		emailEl.val("");
//        		nameRow.hide();
//        		phoneRow.hide();
//        		emailRow.hide();
        	}
        },

        /**
         * 获取联系人对象
         */
        getContact : function(){
        	var contact = {};

        	var nameEl = this.element.find("#info-device-contact-name");
        	var phoneEl = this.element.find("#info-device-contact-phone");
        	var emailEl = this.element.find("#info-device-contact-email");

        	contact.name = nameEl.val();
        	contact.phone = phoneEl.val();
        	contact.email = emailEl.val();

        	return contact;
        },

        /**
         * 根据现场的业务状态和在线状态，返回在地图上显示的icon
         * @param resource {object} 现场对象
         * @return iconUrl {string} icon的路径
         */
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
					iconUrl += "1";
				}else {
					iconUrl += "2";
				}
			} else {
				if (resource.alarmCount){
					iconUrl += "3";
				}else {
					iconUrl += "4";
				}
			}
			return iconUrl + ".png";
		},

		/**
         * 在地图上显示现场位置marker
         * @param data {object} 现场对象
         */
        renderLocMarker : function(data){
//        	if (data.location && (!this.locMarker)){
            if (this.locMarker) {
                this.locMarker.onRemove(this.map);
                this.locMarker = null;
            }
            var self = this;
            /*var iconUrl = this.iconMapping(data);
             this.locMarker = this.map.addMarker({
             position: new maps.LonLat(data.location.longitude, data.location.latitude),
             title: data.name,
             draggable: false,
             icon : require.toUrl(iconUrl)
             });*/
            this.locMarker = L.marker([ data.location.latitude,data.location.longitude],{
                draggable : false
            }).addTo(this.map);
            //                window.locMarker = this.locMarker;
            this.map.setView([ data.location.latitude,data.location.longitude],6);
//        	}
        },

        /**
         * 初始化和渲染现场下的设备列表
         */
        drawDevicesTable : function(){
        	var self = this;
        	this.deviceTable = new Table({
        		container : this.element.find("#info-devices-table"),
        		datas: [],
                pageSize: 100,
                autoWidth: false,
                checkbox : "none",
                pageToolBar: false,
                events:{
                	onRowClick:function(data){
                		this.renderDeviceDesc(data);
                	},
                	scope:this
                },
                columns: [
                      	{
                            title: locale.get({lang:"device"}),
                            width : "60%",
                            dataIndex: "name"
                        },{
                            title: locale.get({lang:"operate"}),
                            dataIndex: "_id",
                            width : "40%",
                            cls : "devicetable-operate",
                            sortable : false,
                            render : function(data){
                            	var opt = new Template("<div id='info-tag-resources-#{id}' class=\"module-info-tag-res-opt \"></div>").evaluate({
                                    id: data
                                });//cloud-icon-default cloud-icon-delete
                            	return opt;
                            },
                            afterCellCreated: function(td, ele, data, index){
//                            	console.log(data);
                            	var deviceTableRowButton=new Button({
                            		container : $("div", td),
                            		title: locale.get({lang:"unbound"}),
                            		imgCls : "cloud-icon-delete",
                            		events : {
                            			click : function(){
                            				dialog.render({
                            					lang:"affirm_unbound+?",
                            					buttons:[{
                            						lang:"affirm",
                            						click:function(){
                            							self.element.find("#info-device-info").hide(250,"linear");
                            							var device = {};
                            							self.updateDevice.bind(self)(data, index);

                            							dialog.close();
                            							/*cloud.Ajax.request({
                        					                url: "api/devices/" + data._id,
                        					                parameters: {
                        					                    verbose: 100
                        					                },
                        					                type: "get",
                        					                success: function(data) {
                        										if (data.result){
                        											device = data.result;
                        											self.updateDevice.bind(self)(device, index);
                                        							dialog.close();
                        										}
                        					                }.bind(this)
                        					            });*/
                            						}
                            					},{
                            						lang:"cancel",
                            						click:function(){
                            							dialog.close();
                            						}
                            					}]
                            				});
                                    	}
                            		}
                            	});
                            	var flag1=permission.app("_controller")["write"];
                            	var flag2=permission.app("_gateway")["write"];
                            	if(data.plcId!=0){
                            		if(!flag1){
                                		deviceTableRowButton.disable();
                                	}
                            	}
                            	else{
                            		if(!flag2){
                                		deviceTableRowButton.disable();
                                	}
                            	}
                            }
                        }
                    ]
        	});
        },
        renderDeviceDesc:function(data){
        	if(data){
        		this.element.find("#info-device-info").show(250,"linear");
        		var device_type;
        		if(data.sensorId==0&&data.plcId==0){
        			device_type=locale.get("gateway");
        		}
        		else{
        			device_type=locale.get("controller");
        		}
        		this.element.find("#info-device-info-device-type").text(device_type);
        	}
        	else{
        		this.element.find("#info-device-info-device-type").text("");
        	}
        },
        /**
         * 根据现场对象加载网关和控制器列表
         * @param data {object} 现场对象
         */
        _renderDeviceTable : function(id){
        	var flag = [false,false];
        	var self = this;
        	Model.device({
        		method:"query_list",
        		param:{
        			verbose: 1,
        			limit:0,
        			site_id: id
        		},
        		error:function(err){
        			console.log(err);
        			flag[0]=true;
        		},
        		success:function(dev){
        		Model.machine({
        		method:"query_list",
        		param:{
        			verbose: 100,
        			limit:0,
        			site_id: id
        		},
        		error:function(err){
        			console.log(err);
        			flag[1]=true;
        		},
        		success:function(machine){
        			flag[1]=true;
//        			console.log(machine);
        			var data=machine.result.concat(dev.result);
        			if(self.deviceTable){
        				self.deviceTable.render(data);
        			}
        		}
        	})
        }
      });

        },

        /**
         * 根据现场对象加载设备列表
         * @param data {object} 现场对象
         */
        renderDevicesTable : function(data){
        	var self = this;
        	var deviceIdList = $A(data.deviceIdList);
        	if (this.loadDevicesTableReq){
        	    this.loadDevicesTableReq.abort();
        	}
        	this.loadDevicesTableReq = cloud.Ajax.request({
        		url: "api/devices/list",
                type: "post",
                parameters: {
                    verbose: 1,
                    limit: 0
                },
                data: {
                    resourceIds: deviceIdList
                },
                success: function(data) {
                    self.loadDevicesTableReq = null;
                	self.deviceTable.render(data.result);//TODO
                }
            });
        },

        /**
         * 加载现场文档信息
         */
        renderDoc : function(){

        	var self = this;
        	this.loadDocs(function(docs) {
                var $select = this.element.find("#info-site-doc");
                docs.each(function(doc) {
                    $("<option>").val(doc._id).text(doc.name).appendTo($select);
                }, this);
            });


            self.docDetailBtn || (self.docDetailBtn = new Button({
	        	container : self.element.find(".info-site-doc-row"),
	        	id : "info-docs-download",
	        	imgCls : "cloud-icon-download module-info-imghelper",
	        	events : {
	        		click : function(){
	        			//TODO
	        		}
	        	}
	        }));

            self.downloadDocBtn || (self.downloadDocBtn = new Button({
	        	container : self.element.find(".info-site-doc-row"),
	        	id : "info-docs-detail",
	        	imgCls : "cloud-icon-watch module-info-imghelper",
	        	events : {
	        		click : function(){
	        			//TODO
	        		}
	        	}
	        }));

        },

        /**
         * 加载现场图片信息
         */
        renderPic : function(pics, index){
        	var self = this;
//        	self.initUploader();
			var picId = null;
    		if (pics){
				picId = (typeof(index) == "number") ? pics[index] : pics;
			}
    		var accessToken = cloud.Ajax.getAccessToken();
    		var url = cloud.config.FILE_SERVER_URL + "/api/file/" + picId + "?access_token=" + accessToken;

    		self.element.find("#info-site-pic") && self.element.find("#info-site-pic").remove();
    		self.element.find(".info-site-pic-row").prepend($("<img>").attr({"src": url, "id" : "info-site-pic"}))

    		this.currenPic = picId;
        },

        /**
         * 渲染图片工具栏
         */
        drawPicToolbar : function(){
        	var self = this;
        	if (!this.picToolBarReady){
        		this.uploadPicBtn = new Button({
    	        	container : self.element.find(".info-site-pic-row"),
    	        	title : "upload",
    	        	imgCls : "cloud-icon-shangchuan",
    	        });
            	//self.initUploader();// TODO

            	this.downloadPicBtn = new Button({
    	        	container : self.element.find(".info-site-pic-row"),
    	        	title : "download",
    	        	imgCls : "cloud-icon-download",
    	        	events : {
    	        		click : function(){
    	            		var url = cloud.config.FILE_SERVER_URL + "/api/file/" + self.currenPic + "?access_token=";
    	            		cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
    	        		}
    	        	}
    	        });
            	this.deletePicBtn = new Button({
    	        	container : self.element.find(".info-site-pic-row"),
    	        	title : "delete",
    	        	imgCls : "cloud-icon-no",
    	        	events : {
    	        		click : function(){
    	        			var index = $A(self.siteInfo.pics).indexOf(self.currenPic);
                        	self.siteInfo.pics.splice(index, 1);

    	        			cloud.Ajax.request({
    	                        url: "api/sites/" + self.siteId,
    	                        type: "put",
    	                        data: {
    	                            pics : self.siteInfo.pics
    	                        },
    	                        success: function(data) {//TODO update 接口返回字段太少
    	                            self.renderPic(self.siteInfo.pics, 0)
    	                        }
    	                    });
    	        		}
    	        	}
    	        });
            	this.previousPicBtn = new Button({
    	        	container : self.element.find(".info-site-pic-row"),
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
    	        	container : self.element.find(".info-site-pic-row"),
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
            	this.picToolBarReady = true;
        	}
        },

        /**
         * 初始化上传插件
         */
        initUploader : function(){
        	var self = this;
        	var uploaderUrl = cloud.config.FILE_SERVER_URL + "/api/file?access_token=" + cloud.Ajax.getAccessToken() //+ "&file_name=" + fileName;
        	var uploader = new Uploader({
        		browseElement : this.uploadPicBtn,
                url : uploaderUrl,
                autoUpload : true,
                filters : [
                    {title : "Image files", extensions : "jpg,gif,png"}
                ],
                maxFileSize : "10mb",
        		tipsContainer : this.element.find("#info-site-pic-tips"),
        		events : {
        			"onError" : function(err){
        				dialog.render({text:err.text});
					},
        			"onFileUploaded" : function(response, file){
        				if (response.result._id){
        					self.siteInfo.pics || (self.siteInfo.pics = $A());
        					self.siteInfo.pics.push(response.result._id);

        					cloud.Ajax.request({
    	                        url: "api/sites/" + self.siteId,
    	                        type: "put",
    	                        data: {
    	                            pics : self.siteInfo.pics
    	                        },
    	                        success: function(data) {//update 接口返回字段太少
    	                        	self.renderPic(response.result._id);
    	                        }
    	                    });
        				}
        			}
        		}
        	});
        },

        /**
         * 切换收藏状态
         */
        toggleFavor : function(){
        	if (this.favorBtn.isSelected()){
        		this.addFavorite();
        	}else{
        		this.removeFavorite();
        	}
        },

        /**
         * 将当前现场添加到收藏
         */
        addFavorite : function(){
        	var self = this;
        	if(this.siteId){
        		service.addFavorites(this.siteId, function(data) {
                	if (data.result == "ok"){
//                		alert(locale.get("favor_added"));
                		/*dialog.render({
                			lang:"favor_added"
                		});*/
                		self.fire("afterInfoUpdated", self.siteId);
                	}
                },function(error){
                	dialog.render({lang:error.error_code});
                	self.favorBtn.unSelect();
                }, this);
        	}
        },

        /**
         * 将当前现场从收藏中移除
         */
        removeFavorite : function(){
        	var self = this;
        	if(this.siteId){
        		service.removeFavorites(this.siteId, function(data) {
        			if (data.result.id){
//                		alert(locale.get("favor_removed"));
                		/*dialog.render({
                			lang:"favor_removed"
                		});*/
                		self.fire("afterInfoUpdated", self.siteId);
                	}
                },function(error){
                	dialog.render({lang:error.error_code});
                	self.favorBtn.select();
                }, this);
        	}
        },

        /**
         * 清除并重置info栏的显示
         */
        clear: function(){
        	var self=this;
            this.siteId = null;
            this.location = null;
            if(this.deviceTable){
            	this.deviceTable.clearTableData();
            };
            this.setSiteInfo({
            	autoNavi:1,
            	name:"",
            	address:"",
            	ip:"",
            	customer:"",
            	businessState:0,
            	online:0,
            	location:{
            		longitude:116.407013,
            		latitude:39.926588
            	},
            	contact:{
            		name:"",
            		phone:"",
            		email:""
            	}
            });
          //新建现场时，默认位置为“我的位置”
//            navigator.geolocation.getCurrentPosition(function(position){
//            	locObj= {longitude:position.coords.longitude,latitude : position.coords.latitude};
//            	self.setSiteInfo({
//            		autoNavi:1,
//                    name: "",
//                    address: "",
//                    ip:"",
//                    customer: "",
//                    businessState: 0,
//                    online : 0,
//                    location : locObj,
//                    contact : {
//                    	name : "",
//                    	phone : "",
//                    	email : ""
//                    }
//                });
//            },function(){
//            	locObj={longitude:116.407013,latitude:39.926588};
//            	self.setSiteInfo({
//            		autoNavi:1,
//                    name: "",
//                    address: "",
//                    ip:"",
//                    customer: "",
//                    businessState: 0,
//                    online : 0,
//                    location : locObj,
//                    contact : {
//                    	name : "",
//                    	phone : "",
//                    	email : ""
//                    }
//                });
//            }
//       )
//        	this.setSiteInfo({
//        		autoNavi:1,
//                name: "",
//                address: "",
//                ip:"",
//                customer: "",
//                businessState: 0,
//                online : 0,
//                location : {
//                	longtitude:116.46,
//                	latitude:39.92
//                },
//                contact : {
//                	name : "",
//                	phone : "",
//                	email : ""
//                }
//            });
        },

        /**
         * deprecated
         */
        setSiteModel: function(id) {
            this.element.find("#info-model option").each(function() {
                var option = $(this);
                if (option.val() == id) {
                    option.attr("selected", true);
                } else {
                    option.removeAttr("selected");
                }
            });
        },

        /**
         * deprecated
         */
        getSiteModel: function() {
            return this.element.find("#info-model option:selected").val()
        },

        /**
         * 设置现场名称
         */
        setSiteName: function(name) {
            this.element.find("#info-site-name").val(name);
        },

        /**
         * 获取现场名
         */
        getSiteName: function() {
            return this.element.find("#info-site-name").val()
        },

        /**
         * 设置现场业务类型
         */
        setBusinessState: function(status) {
            this.element.find("#info-business-state option").each(function() {
                var option = $(this);
                if (option.val() == status) {
                    option.attr("selected", true);
                } else {
                    option.removeAttr("selected");
                }
            });
        },

        /**
         * 获取现场业务类型
         */
        getBusinessState: function() {
            return this.element.find("#info-business-state option:selected").val()
        },

        /**
         * 从服务器端获取现场信息
         */
        loadSiteInfo: function() {
        	var self=this;
            cloud.Ajax.request({
                url: "api/sites/" + this.siteId,
                parameters: {
                    verbose: 100
                },
                type: "get",
                success: function(data) {
                    this.setSiteInfo(data.result);
                    this.disable();
                    this.permission();
                    this.unmask();
                }.bind(this)
            });
        },

//        loadCustomers: function(callback) {
//            var self = this;
//            cloud.Ajax.request({
//                url: "api/customers",
//                parameters: {
//                    verbose: 3
//                },
//                type: "get",
//                success: function(data) {
//                    callback && callback.call(self, data.result);
//                }.bind(this)
//            });
//        },

        /**
         * 获取现场的文档信息
         */
        loadDocs : function(callback) {
            var self = this;
            cloud.Ajax.request({
                url: "api/documents",
                parameters: {
                    verbose: 100,
                    type : "14",
                    belong : self.siteId
                },
                type: "get",
                success: function(data) {
                    callback && callback.call(self, data.result);
                }.bind(this)
            });
        },

        /**
         * 设置组件为可编辑状态
         */
        enable: function() {
            this.editButton.hide();
//            this.waveButton.hide();
            this.element.find(".info-buttonset-operate").hide();
            this.submitButton.show();
            this.cancelButton.show();

            // this.deleteButton.
            this.infoForm.find("input, select").removeAttr("disabled");
            this.element.find("#info-name").removeAttr("disabled");
//            this.locMarker && this.locMarker.setDraggable(true);
            if(!this.autoPosition.isSelected()){
//              this.locMarker && this.locMarker.setDraggable(true);
                this.locMarker && this.locMarker.dragging.enable();
            }else{
//              this.locMarker && this.locMarker.setDraggable(false);
                this.locMarker && this.locMarker.dragging.disable();
            }

            /* this.tipsBubbleContent = $("<div>").text("拖动以选择").width(100);
             this.tipsBubble = new maps.Bubble({
             content: this.tipsBubbleContent[0],
             maxWidth: 1 //
             });*/
            //this.tipsBubble.open(this.map, this.locMarker);
        },

        /**
         * 设置组件为不可编辑状态
         */
        disable: function() {
            if(this.string=="controller"){
                this.editButton.hide();
            }
            else{
                this.editButton.show();
            }
            this.submitButton.hide();
            this.cancelButton.hide();

            this.infoForm.find("input, select").attr("disabled", true);
            this.element.find("#info-name").attr("disabled", true);

//           this.locMarker && this.locMarker.setDraggable(false);
            if(this.locMarker) {
                this.locMarker.dragging.disable();
                $(this.locMarker._icon).removeClass("gis-edit-marker-selected");
            }

            this.tipsBubble && this.tipsBubble.close();
        },

        /**
         * 用户点击取消编辑按钮的处理函数
         */
        cancelEdit: function() {
            if (this.siteId) {
                this.loadSiteInfo();
            } else {
            	this.fire("cancelCreate");
            }
            this.disable();
        },

        /**
         * 将当前info提交到服务器（更新或新增）
         */
        submit: function(callback) {
        	if (!(validator.result("#info-form"))){
        		this.element.find("#info-form input").trigger("blur");
        		//this.element.find("#info-name").trigger("blur");
        		return false;
        	};

            var site = {}, self = this;
            if(this.autoPosition.isSelected()){
            	site.autoNavi=1;
            }
            else{
            	site.autoNavi=0;
            }
            site.name = this.element.find("#info-name").val();
            site.businessState = this.element.find("#info-business-state").val();
            site.address=this.element.find("#info-site-address").val();
            site.customerId=this.element.find("#info-site-customer").val();
            var customerNameOpt = $A(this.element.find("#info-site-customer option").toArray()).select(function(option){
            	return $(option).val() == site.customerId;
            });
            site.customerName = $(customerNameOpt).text();
            site.contact = this.getContact();

            var lonlat = this.locMarker.getLatLng();
            site.location= {
                            //"region": "北京",
                            "longitude": lonlat.lng,
                            "latitude": lonlat.lat
                          }
			if(this.siteId ==null){
				cloud.Ajax.request({
                url: "api/sites/",
                type: "post",
                data: {
                	autoNavi:site.autoNavi,
                    name: site.name,
                    businessState: site.businessState,
                    address: site.address,
                    customerId: site.customerId,
                    customerName: site.customerName,
                    contact : site.contact,
                    location:this.location ? this.location : site.location
                },
                success: function(data) {
//                	dialog.render({lang:"networking_state_cannot_be_empty"});
					dialog.render({lang:"save_success"});
                    self.fire("afterInfoCreated", data.result._id);
//                    self.disable();
                    self.siteId = data.result._id;//add by qinjunwen
                    self.render(data.result._id);
                }
                /*,
                error : function(errorObj){
//                	console.log(arguments, "error")
                	if (errorObj && (errorObj.error_code == 20007)){
                		dialog.render({lang:"site_already_exists"});
                	}else{
                		dialog.render({lang:"sys_error_please_wait"});
                	}
                }*/
          	  });
			}else{
				cloud.Ajax.request({
                    url: "api/sites/" + this.siteId,
                    type: "put",
                    data: {
                    	autoNavi:site.autoNavi,
                        name: site.name,
	                    businessState: site.businessState,
	                    address: site.address,
	                    customerId: site.customerId,
	                    customerName: site.customerName,
	                    contact : site.contact,
	                    location:this.location ? this.location : site.location
                    },
                    success: function(data) {
                    	if(!self.preventSucDialog){
                    		dialog.render({lang:"save_success"});
                    	}
                    	self.preventSucDialog=false;
                    	self.preventAutoPos=false;
//                        self.fire("afterInfoUpdated", data.result._id);
                        self.render(data.result._id);
                        var delay=self.options.delay?self.options.delay:1000;
                        if(self.autoPosition.isSelected()){
                        	 setTimeout(self.refreshCurMarker(),delay);
        				}
                      //延迟触发afterInfoUpdated，为了准确获取“基站定位”信息
                        setTimeout(self.delayFire(self.autoPosition.isSelected()),delay);
                        callback && callback.call(this,data.result);
//                        self.disable();
                    }
                    /*,
                    error : function(errorObj){
//                    	console.log(arguments, "error")
                    	if (errorObj && (errorObj.error_code == 20007)){
                    		dialog.render({lang:"site_already_exists"});
                    	}else{
                    		dialog.render({lang:"sys_error_please_wait"});
                    	}
                    }*/
                });
			}


        },
        //延迟fire，为了获取准确的现场位置
        delayFire:function(isSelected){
        	var self=this;
        	return function(){
        		self.fire("afterInfoUpdated",self.siteId,isSelected);
        	}
        },
        /**
         * 设置info位置信息
         */
        setLocation : function(location){
        	this.location = location;
        },

        /**
         * 初始化地图
         */
        renderMap: function() {
            /*this.map = new maps.Map({
                selector: this.element.find("#info-map"),
                zoomControl: true,
                panControl: false
            });*/
            if(this.map){
                this.map.remove();
            }
            this.map = L.map(this.element.find("#info-map")[0],{
                zoomControl : false
            });

            cloud.Lmap.getTile(this.map);
        },

        /**
         * 更新设备信息（解除与本现场的绑定关系）
         */
        updateDevice:function(device, index){
        	var self=this;
        	var siteid = this.siteId;
        	if(device.plcId!==0){
            	cloud.Ajax.request({
                    url: "api/machines/" + device._id,
                    type: "put",
                    parameters : {
                    	cancel_site:1,
                    	verbose:100,
                    	oid:device.oid
                    },
                    data: {
    					siteName: "",
    					siteId: null
                    },
                    success: function(data) {
//                    	if (self.siteInfo && self.siteInfo.online == 1){
//                    		self.fire("onDelOnlineDev");
//                    	}else{
                    		self.fire("afterInfoUpdated", siteid);
                    		self.render(siteid);
//                    	}
//                    	self.deviceTable["delete"](self.deviceTable.getRowsByProp("_id", device._id));
//                    	$("#info-site-name").val(0);  //将设备Info中的下拉框清空
                    }
                });
        	}
        	else{
            	cloud.Ajax.request({
                    url: "api/devices/" + device._id,
                    type: "put",
                    parameters : {
                    	cancel_site:1,
                    	verbose:100,
                    	oid:device.oid
                    },
                    data: {
    					siteName: "",
    					siteId: null
                    },
                    success: function(data) {
//                    	if (self.siteInfo && self.siteInfo.online == 1){
//                    		self.fire("onDelOnlineDev");
//                    	}else{
                    		self.fire("afterInfoUpdated", siteid);
                    		self.render(siteid);
//                    	}
//                    	self.deviceTable["delete"](self.deviceTable.getRowsByProp("_id", device._id));
//                    	$("#info-site-name").val(0);  //将设备Info中的下拉框清空
                    }
                });
        	}

        },

        /**
         * 删除设备
         */
        deleteDevice:function(id, index){
        	cloud.Ajax.request({
                url: "api/devices/" + id,
                type: "DELETE",
                success: function(data){
                	this.fire("afterInfoUpdated", this.siteId);

                	//this.deviceTable["delete"](index, this.disable());
                	this.deviceTable["delete"](this.deviceTable.getRowsByProp("_id", id));
                }.bind(this)
            });

        },

        /*initDelAllDevForm : function(){
			var self = this;

			var buttons = {};
			buttons[locale.get("affirm")] = function(){
			};
			buttons[locale.get("cancel")] = function(){
				$( this ).dialog( "close" );
			}

			this.delAllDevDialog = $("#is-delete-all-dev-form").dialog({
				autoOpen: false,
				height: 180,
				width: 300,
				modal: true,
				buttons: buttons,
				close : function(){

				},
				appendTo : "#" + this.id
			});
			var isDeleteAllRow = this.delAllDevDialog.find("#is-del-all-device-row");

			if (this.isDelAllDevBtn){
				this.isDelAllDevBtn.destroy();
			}
			isDeleteAllRow && (isDeleteAllRow.empty());
			this.isDelAllDevBtn = new Button({
                container: isDeleteAllRow,
                id : "is-del-all-device-btn",
                checkbox : true,
                lang:"{title:is_del_all_device}",
                events: {
                    click: function(){
                    },
                    scope : this
                }
            });
			//}

		}*/

        destroy: function() {
            this.element.html(template).removeClass("site-info");
            this.editButton.destroy();
            this.submitButton.destroy();
            this.cancelButton.destroy();
            this.element.html("");
            //一系列的清除动作

        }

    });
    return InfoModule;
});