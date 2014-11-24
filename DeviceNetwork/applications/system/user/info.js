define(function(require) {
	var cloud = require("cloud/base/cloud");
//    var maps = require("cloud/components/map");
    var template = require("text!./info.html");
    var Button = require("cloud/components/button");
    require("cloud/lib/plugin/jquery.qtip");
    var validator = require("cloud/components/validator");
    
    var InfoModule = Class.create(cloud.Component, {

        initialize: function($super, options) {
            $super(options);

            this.element.html(template);
            this.entityID = null;
            this.status = null;
            this.map = null;
            this.initializeRoles();
            this.intializeElement();
            this.draw();
            this.validateForm();
            this.permission();
            this._renderCss();
            locale.render({element:this.element});
        },
        //兼容ie9
        _renderCss:function(){
        	$(".user-info-body>div").css({
        		"margin":"10px 5jpx 10px 15px"
        	});
//        	$("#user-info-email").css({
//        		"background-color":"#F5F6F9",
//        		"border":"1px solid #F5F6F9"
//        	});
        	$("ul.user-info-form-ul li").css({
        		"overflow":"hidden",
        		"margin":"10px 0 0 15px"
        	});
        	$("ul.user-info-form-ul li p,ul.user-info-form-ul li select").css({
        		"float":"left",
        		"display":"inline"
        	});
        	$(".user-info-body .label").css({
        		"line-height":"22px"
        	});
        	$(".user-info-map-panel .user-info-map-label").css({
        		"margin-bottom":"10px"
        	});
        	$(".user-info-map-panel #user-info-map").css({
        		"height":"120px",
        		"width":"190px",
        		"border":"1px solid #A6A29A"
        	});
        	$(".user-info-map").css({
        		"width":"100%",
        		"height":"100%"
        	});
        	$(".module-info-user-buttonset").css({
        		'text-align':"center"
        	});
        	$(".module-info-user-label").css({
        		"float":"left",
        		"margin":"4px 4px"
        	});
        	$(".module-input-row-el").css({
        		"text-align":"center"
        	});
        	$(".user-info-title-input").css({
        		"float":"left"
        	});
        	$(".user-info-title-button").css({
        		"display":"block",
        		"float":"left"
        	});
        	$(".user-info-input-title").css({
        		"width":"60px",
        		"height":"24px",
        		"line-height":"24px"
        	});
        },
        draw : function(){
        	this.drawLabel();
        	this.drawResetPwdForm();
        },
        
        drawLabel : function(){
        	$(".module-info-user-label").addClass("cloud-icon-disable cloud-icon-user");
        },

        drawResetPwdForm: function() {
        	var self = this;
            this.createForm = $("<form>").addClass(this.moduleName + "-create-form ui-helper-hidden tag-overview-form");
            $("<label>").attr("for", "new-tag-name").attr("class", "resetpwd-form-title").text(locale.get({lang:"please_input_captcha+:"})).appendTo(this.createForm);
            //$("<br>").appendTo(this.createForm);
            
            $("<img>").attr("class", "resetpwd-form-verify-img").appendTo(this.createForm)
            	.css({"margin-left" : "10px"})
            	.click(self.loadVerifyImg.bind(self));
            //$("<br>").appendTo(this.createForm);
            
            var submitLow = $("<div>").css({margin: "10px 3px"}).appendTo(this.createForm);
            
            var verifycodeField = $("<input type='text'>").attr({
            		id: "user-resetpwd-verify-code",
            		autocomplete: "off",
            	}).css({margin : 0, 'float':"left"}).width("100px").appendTo(submitLow);
            
            this.resetpass = new Button({
				lang:"{text:affirm,title:affirm}",
                title: "确认",
                text : "确认",
                container: submitLow,
                imgCls: "cloud-icon-yes",
                events: {
                    click: function(){
                    	this.resetUserPassword();
                    	//verifycodeField.val("");
                    },
                    scope: this
                }
            });

            this.createForm.appendTo(this.element);
            this.resetPwdBtn.element.qtip({
				suppress: false,
                content: {
                    text: this.createForm
                },
                position: {
                    my: "top right",
                    at: "bottom middle"
                },
                show: {
                    event: "click"
                },
                hide: {
                    event: "click unfocus"
                },
                style: {
                    classes: "qtip-shadow qtip-light",
                    width: 203
                }
            });
        },
        
        validateForm:function(){
        	validator.render("#user-info-form",{
            	promptPosition:"bottomLeft",
            	scroll: false
			});
        },
        
        permission:function(){
        	var self = this;
        	if(!(permission.app("_user"))["write"]){
        		self.editBtn.hide();
    			self.cancelBtn.hide();
    			self.saveBtn.hide();
    			self.resetPwdBtn.hide();
        	}
        },
        
        intializeElement: function() {

            /*$("#user-info-button-edit").click(function() {
                this.changeStatus("modify");
            }.bind(this));

            $("#module_info_button_cancel").click(function() {
                if (this.status === "create") {
                    //don't do anything
                    this.fire("cancelCreate");
                } else if (this.status === "modify") {
                    this.changeStatus("showInfo");
                }
            }.bind(this));

            $("#module_info_button_save").click(function() {
                if (this.status == "create") {
                    this.submitByCreateStatus();
                } else if (this.status == "modify") {
                    this.submitByModifyStatus();
                }
            }.bind(this));

            $("#user-info-button-reset-password").click(function() {
                this.resetUserPassword();
            }.bind(this));*/
        	
        	this.editBtn = new Button({
        		container : this.element.find("#user-info-button-edit"),
        		title : "编辑",
				lang: "{title:edit}",
                imgCls: "cloud-icon-edit",
                events : {
                	click : function() {
                        this.changeStatus("modify");
                    }.bind(this)
                }
            });
        	
        	this.cancelBtn = new Button({
        		container : this.element.find("#module_info_button_cancel"),
        		text : "取消",
				lang  : "{text:cancel,title:cancel}",
                imgCls: "cloud-icon-delete",
                events : {
                	click : function() {
                		validator.hideAll("#user-info-form");
                        if (this.status === "create") {
                            //don't do anything
                            this.fire("cancelCreate");
//                            console.log(this.entityID, "this.entityID")
                            this.entityID && (this.getUserDataAndRenderToElement(this.entityID));
                        } else if (this.status === "modify") {
                            this.changeStatus("showInfo");
                            this.entityID&& (this.getUserDataAndRenderToElement(this.entityID));
                        }
//                        this.editBtn.show();
                    }.bind(this)
                }
            });
        	
        	this.saveBtn = new Button({
        		container : this.element.find("#module_info_button_save"),
        		text : "保存",
				lang: "{text:save,title:save}",
                imgCls: "cloud-icon-yes",
                events : {
                	click : function() {
                		if(validator.result("#user-info-form")){
	                        if (this.status == "create") {
	                            this.submitByCreateStatus();
	                        } else if (this.status == "modify") {
	                            this.submitByModifyStatus();
	                        }
//	                        this.editBtn.show();
                		}
                    }.bind(this)
                }
            });
        	
        	this.resetPwdBtn = new Button({
        		container : this.element.find("#user-info-button-reset-password"),
                title:"重置密码",
				lang: "{text:reset_password,title:reset_password}",
                imgCls: "cloud-icon-reset",
                events : {
                	click : function() {
                        //this.resetUserPassword();
                		this.loadVerifyImg();
                    }.bind(this)
                }
            });


        },

        loadVerifyImg : function(){
        	var self = this;
        	cloud.Ajax.request({
            	url: "api/captchas",
            	type: "GET",
            	success: function(data){
            		var imgUrl = cloud.config.FILE_SERVER_URL + "/api/captchas/" + data._id;
            		self.verifyPicId = data.pictureId;
            		var el = self.createForm.find(".resetpwd-form-verify-img");
            		el.removeAttr("src").attr("src",imgUrl);
            	}.bind(self)
            });
        	
        	
        },
        
        initializeRoles: function() {
        	var self = this;
            //tudo : request the Roles that I can get
            cloud.Ajax.request({
                url: "api2/roles",
                type: "GET",
                dataType: "JSON",
                parameters: {
					limit:0,
                    verbose: 4
                },
                success: function(data) {
                    var result = data.result;
                    result.each(function(data) {
                        var _id = data._id;
                        var name = data.name;
                        if (name == "admin"){// forbidden create admin user
                        	self.adminOpt = $("<option value='" + _id + "' id='opt-user-roles-admin'>" + locale.get({lang:"organization_manager"}) + "</option>");
//                        	if (self.status == "create") {
//                            	$("#opt-user-roles-admin").remove();
//                        	}else {
//                        		if ($("#opt-user-roles-admin").length == 0){
//                        			$("#module_info_user_roles").append(self.adminOpt);
//                        		}
//                        		
//                        	}
                        	$("#module_info_user_roles").append(self.adminOpt);
                        }else if(name == "DeviceManager"){
                        	$("#module_info_user_roles").append("<option value='" + _id + "' >" + locale.get({lang:"device_manager"}) + "</option>");
                        }else if(name == "DeviceSense"){
                        	$("#module_info_user_roles").append("<option value='" + _id + "' >" + locale.get({lang:"device_sense"}) + "</option>");
                        }else{
                        	$("#module_info_user_roles").append("<option value='" + _id + "' >" + name + "</option>");
                        }
                    });
                    if (this.entity &&this.entity.roleId) {
                        this.element.find("#module_info_user_roles").val(this.entity.roleId);
                    }


                }.bind(this)
            });
        },

        getUserDataAndRenderToElement: function() {
//        	this.editBtn.show();
            //tudo : request the Roles that I can get
            cloud.Ajax.request({
                url: "api2/users/" + this.entityID,
                type: "GET",
                dataType: "JSON",
                parameters: {
                    verbose: 100
                },
                success: function(data) {
                    var result = data.result;
                    //render to element
                    this.entity = result;
                    
                    var name = result.name;
                    var email = result.email;
                    var phone = result.phone;
                    var roleId = result.roleId;
//                    var state = result.state;
                    switch(result.state){
						case -1:
							var state = locale.get({lang:"logouted"});
							break;
						case 0:
							var state = locale.get({lang:"logined"});
							break;
						case 1:
							var state = locale.get({lang:"locked"});
							break;
						default:
							break;	
					}
					var id = result._id;
                    //var state=$("#user-info-account-status").val();
                    //var roleIds=$("#module_info_user_roles").val();
                    $("#module_info_user_roles option[value='" + roleId + "']").attr("selected", "selected");
//                    $("#user-info-account-status option[value='" + state + "']").attr("selected", "selected");
                    $("#user-info-account-status").val(state)//.attr("title",state);
                    $("#user-info-name").val(name)//.attr("title",name);
                    $("#user-info-email").val(email)//.attr("title",email);
                    $("#user-info-phone").val(phone)//.attr("title",phone);
                    if(!!result.ip){
                    	$("#never-login").text("");
                    	$("#user-info-map").show();
//                    	this.openMap();
                    }else{
                    	$("#user-info-map").hide();
                    	$("#never-login").text("从未登录");
                    }
                }.bind(this)
            });
        },
        
        disable : function(){
            this.changeStatus("showInfo");
        },

        changeStatus: function(status) {
            if (status === "create") {
                this.status = "create";
                this.renderByCreateStatus();
                this.closeMap();
            } else if (status === "modify") {
                this.renderByModifyStatus();
                this.status = "modify";
            } else if (status === "showInfo") {
                this.renderByShowInfoStatus();
//                this.openMap();
                this.status = "showInfo";
            }
            
            if (this.status == "create") {
            	//$("#opt-user-roles-admin").remove();
        	}else {
        		if ($("#opt-user-roles-admin").length == 0){
        			$("#module_info_user_roles").append(this.adminOpt);
        		}
        	}
        },

        renderByCreateStatus: function() {
            //tudo : every elements been reset with empty
            $("#user-info-button-edit").hide();
            $("#user-info-button-reset-password").hide();
            $("#user-info-account-status-panel").hide();
            $("#user-info-account-status ").attr("disabled", "disabled");
            $("#module_info_button_save").show();
            $("#module_info_button_cancel").show();
            $("#user-info-name").val("").attr("title","");
            $("#user-info-email").val("").attr("title","");
            $("#user-info-phone").val("").attr("title","");
//            $("#user-info-account-status-empty ").attr("selected", "selected");
            $("#roles_select_first_options ").attr("selected", "selected");
            $("#user-info-email").removeAttr("disabled");
            $("#user-info-phone").removeAttr("disabled");
            $("#module_info_user_roles ").removeAttr("disabled");
            $("#user-info-name").removeAttr("disabled");
            //$("#user-info-map-panel").hide();
        },

        renderByModifyStatus: function() {
            //tudo : every elements been reset with can be writen
//        	this.editBtn.hide();
            $("#module_info_button_save").show();
            $("#module_info_button_cancel").show();
            $("#user-info-account-status-panel").show();
            $("#user-info-account-status").attr("disabled", "disabled");
            $("#user-info-name").removeAttr("disabled");
            //$("#user-info-email").removeAttr("disabled");
            $("#user-info-phone").removeAttr("disabled").removeAttr("title");
//            $("#module_info_user_roles ").removeAttr("disabled");
            //$("#user-info-map-panel").show();
        },
        
        judgeAuth:function(callback){
        	var self = this;
        	var returnResult = function(){
        		var roleInfo = self.roleInfo;
        		var userInfo = self.userInfo;
        		var obj = {};
        		if(roleInfo["name"] == "admin"){
        			obj = {
        					role:"admin"
        			}
        		}else{
        			obj = {
        					role:"DeviceManager",
        					userId:userInfo["_id"]
        			}
        		}
        		return obj;
        	}
        	if(!self.roleInfo && !self.userInfo){
        		Model.role({
        			method:"query_current",
        			param:{
        				verbose:100
        			},
        			success:function(data){
        				self.roleInfo = data["result"];
        				Model.user({
        					method:"query_current",
        					param:{
        						verbose:100
        					},
        					success:function(_data){
        						self.userInfo = _data["result"];
        						callback(returnResult());
        					}
        				})
        			}
        		})
        	}else if(self.roleInfo && !self.userInfo){
        		Model.user({
					method:"query_current",
					param:{
						verbose:100
					},
					success:function(_data){
						self.userInfo = _data["result"];
						callback(returnResult());
					}
				})
        	}else if(!self.roleInfo && self.userInfo){
        		Model.role({
        			method:"query_current",
        			param:{
        				verbose:100
        			},
        			success:function(data){
        				self.roleInfo = data["result"];
        				callback(returnResult());
        			}
        		})
        	}else{
        		callback(returnResult());
        	}
        },
        
        renderByShowInfoStatus: function() {
            //tudo : every elements been reset with read only
        	var self = this;
        	//根据用户的角色允许用户可以进行的操作
        	self.judgeAuth(function(obj){
        		if(obj.role == "admin"){
        			$("#user-info-button-edit").show();
        			$("#user-info-button-reset-password").show();
        		}else if(obj.role == "DeviceManager"){
        			if(obj.userId == self.entityID){
        				$("#user-info-button-edit").show();
            			$("#user-info-button-reset-password").show();
        			}else{
        				$("#user-info-button-edit").show();
            			$("#user-info-button-reset-password").show();
        			}
        		}
        	});
        	
            $("#user-info-account-status-panel").show();
            $("#module_info_button_save").hide();
            $("#module_info_button_cancel").hide();

            $("#user-info-name").attr("disabled", "disabled");
            $("#user-info-email").attr({"disabled": "disabled"});
            $("#user-info-phone").attr("disabled", "disabled");
            $("#user-info-account-status ").attr("disabled", "disabled");
            $("#module_info_user_roles ").attr("disabled", "disabled");
            //$("#user-info-map-panel").show();
        },

        verifyElements: function(objects) {
            if (objects != null) {
                if (objects.name != null) {
                    if (objects.name == "") {
//                        alert("Name can't be empty !");
                        return false;
                    }
                } else {
                    return false;
                }

                if (objects.email != null) {
                    if (objects.email == "") {
//                        alert("Email can't be empty !");
                        return false;
                    }
                } else {
                    return false;
                }

//                if (objects.phone != null) {
//                    if (objects.phone == "") {
//                        alert("Phone can't be empty !");
//                        return false;
//                    }
//                } else {
//                    return false;
//                }

//                if (objects.roleIds != null) {
//                    if (objects.roleIds == "") {
//                        alert("Role must be selected !");
//                        return false;
//                    }
//                } else {
//                    return false;
//                }

            } else {
                return false;
            }
            return true;
        },
        
        submitByCreateStatus: function() {
            //tudo : submit when this.status is create
            var name = $("#user-info-name").val();
            var email = $("#user-info-email").val();
            var phone = $("#user-info-phone").val();
            var roleId = $("#module_info_user_roles").val();
            //verified the elements
            var isSubmit = this.verifyElements({
                name: name,
                email: email,
                phone: phone,
                roleId: roleId
            });

            if (isSubmit) {
                cloud.Ajax.request({
                    url: "api2/users",
                    type: "POST",
                    dataType: "JSON",
                    parameters: {
                    	language : locale.current(),
                        verbose: 4
                    },
                    data: {
                        name: name,
                        email: email,
                        phone: phone,
//                        language : locale.current(),
                        roleId: roleId
                    },
                    error:function(data){
                    	if(data.error_code == "20007"){
                    		dialog.render({lang:"user_already_exists"});
                    	}else{
                    		dialog.render({lang:data.error_code});
                    	}
                    },
                    success: function(data) {
                        //this.tags.get(data.result._id).setShare(data.result.shared);
                    	/*this.saveBtn.hide();
                    	this.cancelBtn.hide();*/
                    	this.changeStatus("showInfo");
						this.entityID = data.result._id;
                    	dialog.render({lang:"save_success"});
                        this.fire("afterInfoCreated", data.result._id);
                        this.render(data.result._id);
                        // alert(data.result.name + " 已被添加!!!!");
                    }.bind(this)
                });
            }
        },
        
        

        submitByModifyStatus: function() {
            //tudo : submit when this.status is modify
        	var self = this;
            var name = $("#user-info-name").val();
            var email = $("#user-info-email").val();
            var phone = $("#user-info-phone").val();
            var roleId = $("#module_info_user_roles").val();
			var roleName = $("#module_info_user_roles option:selected").text();
            //verified the elements
            var isSubmit = this.verifyElements({
                name: name,
                email: email,
                phone: phone,
                roleId: roleId
            });
            if (isSubmit) {
            	self.judgeAuth(function(obj){
            		var entityID = "";
//            		if(obj.role == "admin"){
            			entityID = self.entityID;
//            		}else if(obj.role == "DeviceManager"){
//            			entityID = "this";
//            		}
            		cloud.Ajax.request({
                        url: "api2/users/" + entityID,
                        type: "PUT",
                        dataType: "JSON",
                        parameters: {
                            verbose: 4
                        },
                        data: {
                            name: name,
                            email: email,
                            phone: phone
//                            roleIds: [roleIds],
//    						roleNames: [roleNames]
                        },
                        success: function(data) {
                            //this.tags.get(data.result._id).setShare(data.result.shared);
                        	/*this.saveBtn.hide();
                        	this.cancelBtn.hide();*/
                        	
                        	self.changeStatus("showInfo");
                        	
                        	self.fire("afterInfoUpdated", data.result._id);
//    						console.log($("#nav-main-right-account-name").text());
                            // alert(data.result.name + " 已被修改!!!!");
                            dialog.render({lang:"save_success"});
    						var id = data.result._id.toLowerCase();
                            var name = data.result.name;
                            cloud.Ajax.request({
                            	url: "/api2/users/this",
                                dataType: "json",
                                parameters: {
                                    verbose: 3
                                },
                            	success: function(data){
//                            		console.log(3);
                            		var _id = data.result._id.toLowerCase();
                            		if(id === _id){
    									if(name.length>9){
    										var subname = name.substr(0,8)+"...";
    									}else{
    										var subname = name;
    									}
                            			$("#nav-main-right-account-name").text(subname);
                            			$("#user-panel-name").val(name).attr("title",name);
    									var $phone = $("#user-panel-phone"); 
    									if($phone){
    										$("#user-info-phone").attr("title",phone);
    									}
                            		}
                				}
                            });
//                            
                        }.bind(this)
                    });
            	});
            }
        },

        resetUserPassword: function() {

            cloud.Ajax.request({
                url: "api2/users/" + this.entityID + "/reset_password?language=" + locale.current(),
                type: "PUT",
                dataType: "JSON",
                parameters: {
                    verbose: 4
                },
                data: {
                	picId : this.verifyPicId,
                    varificationCode : this.createForm.find("#user-resetpwd-verify-code").val()
                },
                success: function(data) {
                	dialog.render({lang:2110007},[data.result.email]);
                	//dialog.render({text:locale.get({lang:2110007},[data.result.email])});
                	
                    //alert(data.result.email + "  的密码已被重置 !!!!");
                    this.resetPwdBtn.element.data("qtip").hide();
                }.bind(this)
            });
            this.createForm.find("#user-resetpwd-verify-code").val("")
        },

        /*openMap: function() {
            if (this.map === null) {
                this.map = new maps.Map({
                    selector: "#user-info-map",
                    zoom: 13,
                    panControl: false
                });
                this.map.setCenter(new maps.LonLat(104.052372,30.586093));	
    			var marker = this.map.addMarker({
    					position: new maps.LonLat(104.052372,30.586093),
    					title: "我的位置",
    					// animation: maps.Animation.drop
    					draggable: false
    					// icon: require.toUrl("cloud/resources/images/map-marker.png")
    				});
                // this.map.addHomeControl(30.66385, 103.96483);


                // this.map.setZoom(11);
            }
//            $(".user-info-map-panel").show();
        },*/

        closeMap: function() {
//            $(".user-info-map-panel").hide();
        },

        /*
         * Author Caoshun
         * Desc:
         * Param  options
         excemple:
         * Return
         * Excemple
         */
        render: function(_id) {
            if (_id == null) {
                this.entityID = null;
                this.changeStatus("create");
            } else {
                this.entityID = _id;
                this.changeStatus("showInfo");
                this.getUserDataAndRenderToElement();
            }
        }
    });

    return InfoModule;
});