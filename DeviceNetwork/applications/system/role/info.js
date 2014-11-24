/*
 * 用户管理：    【3, 4,5, 6】
 * 角色管理：    【7, 8】
 * 权限管理：    【】
 * 监视：             【11,13,21,25, 27, 29, 31, 37, 】
 * 创建和更改     [12, 14, ]
 * 配置和升级    【】
 * 控制台             【】
 * 允许                  【】
 * 组态图查看    【】
 * 组态图编辑    【】
 * 远程控制         【】
 * 查看业务报表【】
 * 查看                  【】
 * 确认和清除     【】
 * */

define(function(require) {
    require("cloud/base/cloud");
    require("cloud/lib/plugin/jquery-ui");
    var Table = require("cloud/components/table");
    var Button = require("cloud/components/button");
    var RadioGroup = require("cloud/components/radio-group");
    var template = require("text!./info.html");
    var config = require("./config.js");
    
    var InfoModule = Class.create(cloud.Component, {

        initialize: function($super, options) {
            this.moduleName = "role-info";
            $super(options);
            this.element.html(template);
            this.initEvent();
            this.roleId = null;
            this.roleData = null;
//
            this.saveButton = new Button({
                container: this.element.find(".module-info-role-active-yes"),
                text: "提交",
				lang:"{text:submit,title:submit}",
                imgCls: "cloud-icon-yes",
                events: {
                    click: function() {
                    	if(validator.result("#role-info-form")) {
                    		this.submit();
                    	}
                    },
                    scope: this
                }
            });

            this.cancelButton = new Button({
                container: this.element.find(".module-info-role-active-cancel"),
                text: "取消",
				lang:"{text:cancel,title:cancel}",
                imgCls: "cloud-icon-no",
                events: {
                    click: this.cancelEdit,
                    scope: this
                }
            });
            
            this.validateForm();
            this.disable();

        },
        
        validateForm:function(){
        	validator.render("#role-info-form",{
            	promptPosition:"bottomLeft",
            	scroll: false
			});
        },

        render: function(id) {
        	this.roleId = id;
        	var self = this;
        	if(this.roleId) {
        		this.mask();
        		cloud.Ajax.request({
        			url: "api2/roles/"+this.roleId,
        			type: "GET",
        			parameters: {
        				verbose:50
        			},
        			error: function(err) {
        				//this.log.error(err);
        				alert(err.error);
        			},
        			success: function(data) {
        				self.roleData = data;
        				self.setValue(data);
        				
        				cloud.util.unmask(self.element);
        			}
        		});
        	}
        	else {
        		this.clearInfo();
        		var $items = this.element.find(".module-info-role-items");
        		$items.eq(0).hide();
        		this.element.find(".module-info-role-type-value").text(locale.get({lang: "user_defined_role"}));
        	}
        },
        
        initEvent: function() {
        	
        	var $items = this.element.find(".module-info-role-items"),
    			len = $items.length, self = this,
    			names = ["systemManage", 
            	         "networkManage", 
            	         "remoteMaintenance", 
            	         "remoteControl", 
            	         "alarmProcessing"];
        	for(var i = 0 ; i < len ; i++) {
        		var $input = $items.eq(i).find("input");
        		$input.eq(0).on("click", function() {
        			var index = parseInt($(this).attr("group"));
        			var $inputs = $items.eq(index).find("input");
        			
        			if($(this).attr("checked"))  $inputs.attr("checked", true);
        			else  $inputs.attr("checked", false);
        			
        			for(var i = 1 ; i < $inputs.length ; i++) {
        				if($inputs.eq(i).attr("checked")) {
        					var dpt = config[names[parseInt($inputs.eq(i).attr("group"))]]
        									["item"+parseInt($inputs.eq(i).attr("number"))].dependent;
        					for(var k = 0 ; k < dpt.length ; k++) {
        						var group = parseInt(dpt[k].charAt(0)),
        							number = parseInt(dpt[k].charAt(1));
        						$items.eq(group).find("input").eq(number+1).attr("checked", true);
        					}
        				}
        				else {
        					var dpt = $inputs.eq(i).attr("group")+""+(parseInt($inputs.eq(i).attr("number"))-1);
        					for(var m = 0 ; m < len ; m++) {
        						var inputs = $items.eq(m).find("input");
        						for(n = 1 ; n < inputs.length ; n++) {
        							var dpts = config[names[m]]["item"+n].dependent;
        							if(dpts.indexOf(dpt) > -1) {
        								$items.eq(m).find("input").eq(n).attr("checked", false);
        							}
        						}
        					} 
        				}
        			}
        			
        			for(var i = 0 ; i < len ; i++) {
    					var $inputs = $items.eq(i).find("input");
    					var count = 0;
    					for(var j = 1 ; j < $inputs.length ; j++) {
    						if($inputs.eq(j).attr("checked")) {
    							count++
    						}
    					}
    					if(count > 0) {
    						$inputs.eq(0).attr("checked", true);
    					}
    					else {
    						$inputs.eq(0).attr("checked", false);
    					}
    				}
        		}).attr({
        			group: i,
        			number: 0
        		});
        		for(var j = 1 ; j < $input.length ; j++) {
        			$input.eq(j).on("click", function() {
        				if($(this).attr("checked")) {
        					var dpt = config[names[parseInt($(this).attr("group"))]]
        									["item"+parseInt($(this).attr("number"))].dependent;
        					for(var k = 0 ; k < dpt.length ; k++) {
        						var group = parseInt(dpt[k].charAt(0)),
        							number = parseInt(dpt[k].charAt(1));
        						$items.eq(group).find("input").eq(number+1).attr("checked", true);
        					}
        				}
        				else {
        					var dpt = $(this).attr("group")+""+(parseInt($(this).attr("number"))-1);
        					for(var m = 0 ; m < len ; m++) {
        						var inputs = $items.eq(m).find("input");
        						for(n = 1 ; n < inputs.length ; n++) {
        							var dpts = config[names[m]]["item"+n].dependent;
        							if(dpts.indexOf(dpt) > -1) {
        								$items.eq(m).find("input").eq(n).attr("checked", false);
        							}
        						}
        					} 
        				}
        				for(var i = 0 ; i < len ; i++) {
        					var $inputs = $items.eq(i).find("input");
        					var count = 0;
        					for(var j = 1 ; j < $inputs.length ; j++) {
        						if($inputs.eq(j).attr("checked")) {
        							count++
        						}
        					}
        					if(count > 0) {
        						$inputs.eq(0).attr("checked", true);
        					}
        					else {
        						$inputs.eq(0).attr("checked", false);
        					}
        				}
        			}).attr({
        				group: i,
        				number: j
        			});
        		}
        	}
        	
        	$("#module-info-role-edit").click(function() {
        		self.enable();
        	});
        },
        
        disable:function() {
        	var self = this;
        	var $items = this.element.find(".module-info-role-items");
        	$items.find("input").attr("disabled", true);
        	$items.find("label").css("color", "#9D9D9D");
        	this.element.find(".module-info-role-active-button").css("display", "none");
        	this.element.find(".module-info-role-edit").css("display", "inline-block");
        	this.element.find(".module-info-role-name-show").css("display", "inline-block").val(this.element.find(".module-info-role-name-edit").val());
        	this.element.find(".module-info-role-name-edit").css("display", "none");
        },
        
        enable:function() {
        	var $items = this.element.find(".module-info-role-items");
        	$items.find("input").attr("disabled", false);
        	$items.find("label").css("color", "black");
        	this.element.find(".module-info-role-active-button").css("display", "block");
        	this.element.find(".module-info-role-edit").css("display", "none");
        	this.element.find(".module-info-role-name-show").css("display", "none");
        	this.element.find(".module-info-role-name-edit").css("display", "inline-block").val(this.element.find(".module-info-role-name-show").val());
        	
        	//var $items = this.element.find(".module-info-role-items");
    		$items.eq(1).find("input").eq(0).attr({
        		"disabled": true,
        		"checked": true
        	});
        	$items.eq(1).find("input").eq(1).attr({
        		"disabled": true,
        		"checked": true
        	});
        },
        
        clearInfo: function() {
        	//this.roleId = null;
        	this.enable();
        	this.element.find(".module-info-role-name-edit").val('');
        	var $items = this.element.find(".module-info-role-items");
        	$items.find("input").attr("checked", false);
        	
        	
        	$items.eq(1).find("input").eq(0).attr({
        		"disabled": true,
        		"checked": true
        	});
        	$items.eq(1).find("input").eq(1).attr({
        		"disabled": true,
        		"checked": true
        	});
        },
        
        setValue: function(data) {
        	
        	this.clearInfo();
        	this.disable();
        	
        	var roleName = data.result.name,
        		roleType;
        	this.element.find(".module-info-role-items").eq(0).hide();
        	if(data.result.system) {
        		if(roleName == "admin") {
        			roleName = locale.get({lang: "organization_manager"});
        			this.element.find(".module-info-role-items").eq(0).show();
        		}else if(roleName == "DeviceManager") {
        			roleName = locale.get({lang: "device_manager"});
        		}else if(roleName == "DeviceSense") {
        			roleName = locale.get({lang: "device_sense"});
        		}
        		roleType = locale.get({lang:"system_role"});
        		this.element.find("#module-info-role-edit").hide();
        	}else{
        		roleType = locale.get({lang:"user_defined_role"});
        		this.element.find("#module-info-role-edit").show();
        	}
        	this.element.find(".module-info-role-name-show").val(roleName);
        	this.element.find(".module-info-role-type-value").text(roleType).attr("xtype", data.result.type);
        	
        	var names = ["systemManage","networkManage","remoteMaintenance","remoteControl","alarmProcessing"],
        	    $items = this.element.find(".module-info-role-items");
        	for(var i = 0 ; i < $items.length ; i++) {
        		var $inputs = $items.eq(i).find("input");
        		for(var j = 1 ; j < $inputs.length ; j++) {
        			var privileges = data.result.privileges,
        				item = config[names[i]]["item"+j];
        			if(permission.compare(privileges, item)) {
        				$inputs.eq(0).attr("checked", true);
        				$inputs.eq(j).attr("checked", true);
        			}
//        			console.log($inputs.eq(j).next("label").text(),permission.compare(privileges, item));
//        			console.log("privileges",privileges.accept.sort(function(a,b){return a*1 - b*1}));
//        			console.log("item",item.sort(function(a,b){return a*1 - b*1}));
        		}
        	}
        	
        },
        
        pushArray: function(self, target) {
        	for(var i = 0 ; i < target.length ; i++) {
        		var flag = false;
        		for(var j = 0 ; j < self.length ; j++) {
        			if(target[i] == self[j]) {
        				flag = true;
        				continue;
        			}
        		}
        		if(!flag) {
        			self.push(target[i]);
        		}
        	}
        },
        inArray: function (self, target) {
        	var len = target.length,
        		count = 0;
        	for(var i = 0 ; i < len ; i++) {
        		if($A(self).indexOf(target[i]) > -1) {
        			count++;
        		}
        	}
        	if(count >= len) {
        		return true;
        	}
        	else {
        		return false;
        	}
        },
        
        getValue: function() {
        	
        	var record = {};
        	record.name = this.element.find(".module-info-role-name-edit").val();
        	record.type = 52;
        	record.privileges = {
        		"accept": [],
        		"deny": [],
        		"default": "none"
        	};
        	var $items = this.element.find(".module-info-role-items").filter(":gt(0)");
        	console.log("$items",$items);
        	var names = ["networkManage","remoteMaintenance","remoteControl","alarmProcessing"];
        	for(var i = 0 ; i < $items.length ; i++) {
        		var $inputs = $items.eq(i).find("input");
        		for(var j = 1 ; j < $inputs.length ; j++) {
        			if($inputs.eq(j).attr("checked")) {
        				var arr = record.privileges.accept;
        				this.pushArray(arr, config[names[i]]["item"+j]);
        			}
        		}
        	}
        	console.log("record",record);
        	return record;
        	
        },
        
        cancelEdit: function() {
        	if(this.roleId) {
        		this.setValue(this.roleData);
        	}
        	else {
        		this.fire("cancelCreate");
        		this.clearInfo();
        	}
        },
        
        submit: function() {
        	var result = this.getValue();
        	var self = this;
        	if(this.roleId) {
        		cloud.Ajax.request({
        			url: "api2/roles/"+this.roleId,
        			type: "PUT",
        			data: result,
        			error: function(err) {
        				if(err.error.indexOf("already exists") > -1) {
        					dialog.render({text:locale.get({lang:"resource_already_exists"}).replace("{0}", "("+result.name+")")});
        				}
        			},
        			success: function(data) {
        				self.disable();
        				self.fire("afterInfoUpdated", data.result._id);
        				dialog.render({lang:"save_success"});
        			}
        		});
        	} else {
        		cloud.Ajax.request({
        			url: "api2/roles",
        			type: "POST",
        			data:result,
        			error: function(err) {
        				if(err.error.indexOf("already exists") > -1) {
        					dialog.render({text:locale.get({lang:"resource_already_exists"}).replace("{0}", "("+result.name+")")});
        				}
        			},
        			success: function(data) {
        				if(data.result._id) {
        					self.disable();
        					dialog.render({lang:"save_success"});
        					self.roleId = data.result._id;
        					self.fire("afterInfoCreated", data.result._id);
        				}
        			}
        		});
        	}
        }

    });
    return InfoModule;
});