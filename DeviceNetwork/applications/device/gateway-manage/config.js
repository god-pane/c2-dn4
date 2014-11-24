define(function(require) {
	var cloud = require("cloud/base/cloud");
	var html = require("text!./config.html");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var service = require("./service");
	var Button = require("cloud/components/button");
	var Table = require("cloud/components/table");
	var validator = require("cloud/components/validator");
	
	var gatewayType = CONFIG.gatewayModel;
	var DeviceFirmware = Class.create(cloud.Component, {
		initialize: function($super, options) {
			$super(options);
			this.moduleName = "gateway-config";
			this.resources = options.resources;
			this.modelId=options.modelId;
	        this.model=null;
	        this.getConfigTimer=null;
	        this.getConfigTaskInfo=null;
	        this.containerFrame=null;
	        this._renderHtml();
	        this.renderDeviceList();
			this._renderModel();
			this.loadPolicyList(this.model.name);
			this.initPolicy();
			this.initNewConfigForm();
			this.initWriteCfgResult();
			this.initValidator();
			this.sendBySms = false;
			this.newConfigNameOk = false;
			this.currentState(5000);
			
			this.refreshDeviceList();
			
//			if (this.resources.length == 1){
//				if (!this.isAlreadyGetCfg){
//					this.getConfig();
//					this.isAlreadyGetCfg = true;
//				}
//			};
			
			locale.render({element:this.element});
		},

		/*initialize the button of GetConfig
		*f the resources list's length greater than 1 , the button of GetConfig must be disabled
		*when length is 0,all the buttons must be disabled
		*when length is 1,all the buttons must be enable
		*/
		_initConfigButton:function(){
			var resourcesLength=this.resources.length;
			this.smsConfigButton.disable();
			if(resourcesLength>1){
				this.getConfigButton.disable();
				if(!this.putConfigButton.isEnable()){this.putConfigButton.enable();}
				if(!this.smsConfigButton.isEnable()){this.smsConfigButton.enable();}
				
				this.element.find(".config-synchronous-status-info").hide();
			}
			else if(resourcesLength==1){
				if(!this.getConfigButton.isEnable()){this.getConfigButton.enable();}
				if(!this.putConfigButton.isEnable()){this.putConfigButton.enable();}
				if(!this.smsConfigButton.isEnable()){this.smsConfigButton.enable();}	
				
				this.element.find(".config-synchronous-status-info").show();
			}
			else if(resourcesLength==0){
				this.getConfigButton.disable();
				this.putConfigButton.disable();
				this.smsConfigButton.disable();
				
				this.element.find(".config-synchronous-status-info").hide();
			}
			this.smsConfigButton.disable();//TODO 
		},
		
		loadPolicyList:function(modelName, idToLoad){
			var self = this;
			var $select = this.element.find("#config-policy");
			$select.empty();
			$("<option value='0' lang='text:config_scheme'>"+ locale.get("config_scheme") +"</option>").appendTo($select);
			service.getPolicyList(modelName,function(policys){
				policys.each(function(policy) {
                    $("<option>").val(policy._id).text(policy.policyName).appendTo($select);
                }, self);
			});
			self.updatePolicyButton.disable();
			self.deletePolicyButton.disable();
			if (idToLoad != undefined && idToLoad != null){
				$select.val(idToLoad).trigger("change");
//				self.setConfigToFrame(self.frameContentWindow.default_scheme);
			}
//			this.initPolicy();
		},
		initPolicy:function(){
			var self = this;
			this.element.find("#config-policy").bind("change",function(){
					var policyId=$(this).val();
					console.log("policyId",policyId);
					if (policyId != 0){
						self.loadConfigPolicy(policyId);
						self.updatePolicyButton.enable();
						self.deletePolicyButton.enable();
					}
					else {
						self.setConfigToFrame(self.frameContentWindow.default_Scheme);
						self.updatePolicyButton.disable();
						self.deletePolicyButton.disable();
					}
					
			});
			self.updatePolicyButton.disable();
			self.deletePolicyButton.disable();
		},
		strToJson:function(str){
			var josn=str.replace(/\s/g,"','").replace(/=/g,"':'");
			var res = "{'"+josn+"'}";
			var res1 = eval("(" + res+ ")"); 
			return res;
		},

		loadConfigPolicy:function(policyId){
			var self = this;
			service.getConfigPolicy(policyId,function(policy){
				var config = policy.sourcePolicy;
//				config=self.strToJson(config);
				self.setConfigToFrame(config);
//				self.setConfigToFrame(policy.sourcePolicy)
			});
		},
		
		getConfig : function(){
			var self = this;
			cloud.util.mask(
            	self.element,
            	locale.get("getting_config_please_wait")
            );
			service.getDeviceConfig(
				{
					resources:self.getResourceIdArray()//TODO
				},
				function(result) {
					console.log(result);
	                if (result && (result.length > 0)){
	                	
	                	var config = result[0].sourcePolicy;
	                	if (!cloud.util.isEmpty(config)){//in case of sourcePolicy = {}
	                		try {
		                		dialog.render({
		                			lang:"get_config_success"
								});
		                		if (self.frameContentWindow && self.frameContentWindow.default_scheme) {
		                			self.setConfigToFrame(self.frameContentWindow.default_scheme);
		                		}
		                		self.setConfigToFrame(config);
	                        } catch (e) {
	                        	dialog.render({
		                			lang:"load_config_failed"
								});
	                        }
	                	}else{}
	                }
	                else {
//		                	alert("获取配置失败");
	                	dialog.render({
                			lang:"get_config_failed"
						});
	                }
	                
	                cloud.util.unmask(self.element);
	                self.getConfigButton._onMouseOver();
	            },
	            function(data) {
	                
	                dialog.render({
                		lang:"get_config_failed"
					});
	                cloud.util.unmask(self.element);
	            },
	            this
            );
		},

		_renderHtml: function() {
			var self=this;
			this.element.html(html);
			this.element.addClass("device-config");
			this.layout = this.element.layout({
				defaults: {
					paneClass: "pane",
					// togglerClass: "cloud-layout-toggler",
					resizerClass: "device-config-layout-resizer",
					spacing_open: 10,
					spacing_closed: 0,
					togglerLength_open: 0,
					togglerLength_closed: 0,
					resizable: false,
					slidable: false
				},
				west: {
					paneSelector: "#device-list",
					size: 210
				},
				center: {
					//为了避免插件的默认设定，用了一个傀儡div
					paneSelector: "#replace-config-info-for-plugin"
				}
			});
			
			//TODO red font
			this.getConfigButton = new Button({
				container: this.element.find("#device-config-button1"),
				text: "获取配置",
				lang:"{text:get_config, title: get_config}",
				id: "config-get-button",
				events: {
					click: function() {
						//remote by qinjunwen start
						/*cloud.Ajax.request({
			    			url: "api/config/list",
//			    			async: false,
			    			type: "POST",
			    			dataType: "JSON",
			    			parameters: {
			    				types:4
			                },
			    			data:{
			    				resourceIds:["517b578870e7fcf06d6777bb"]
			    			},
			    			success: function(data) {
			    			}
			    		});*/
						//remoted by qinjunwen end
						//get configuration from the device
						//then render on the model html
						//options:{"deviceId":xxx,"deviceName":[xxxxx]}
						
						//unremote by qinjunwen start
						
						////unremote by qinjunwen end
						this.getConfig();
					},
					scope: this
				}
			});

			this.putConfigButton = new Button({
				//imgCls: "cloud-icon-no",
				text: "下发配置",
				lang:"{text:apply_config, title : apply_config}",
				id: "config-hand-button",
				container: this.element.find("#device-config-button2"),
				events: {
					click: function() {
						this.configButtonClick();
					},
					scope: this
				}
			});

			this.smsConfigButton = new Button({
				text: "通过短信下发配置",
				lang:"{text:sms_apply_config, title: sms_apply_config}",
				id: "config-sms-button",
				container: this.element.find("#device-config-button3"),
				events: {
					click: function(){
//						alert("短信下发配置任务正在处理中，请稍等！");
//						self.containerFrame.contentWindow.setParams();
						this.configButtonClick(true);
//						this.sendBySms = true;
//						this.newConfigDialog.dialog("open");
						
					},
					scope: this
				}
			});
			this.updatePolicyButton = new Button({
				text: "修改方案",
				lang:"{text:modify_scheme, title : modify_scheme}",
				id: "policy-update-button",
				container:this.element.find("#device-config-button4"),
				events: {
					click: function(){
						var alertItem = $("<p id = \"alertText\">").text(locale.get("affirm_modify+?"));

						var buttons = {};
						buttons[locale.get("yes")] = function(){
	            			var policyId=self.element.find("#config-policy").val();
							var configScheme=self.getConfigFromFrame();
							if(configScheme){
								service.updateConfigPolicy(configScheme,policyId,function(){
								
								});
							}
							$( this ).dialog( "close" );
						};
						buttons[locale.get("no")] = function(){
							$( this ).dialog( "close" );
						}
						
			            alertItem.dialog({
							title : locale.get("prompt"),
							modal:true,
							minHeight: 120,
							buttons: buttons,
							/*{
								"yes" : function(){
			            			var policyId=self.element.find("#config-policy").val();
									var configScheme=self.getConfigFromFrame();
									if(configScheme){
										service.updateConfigPolicy(configScheme,policyId,function(){
										
										});
									}
									$( this ).dialog( "close" );
								},
								"no" : function(){
									$( this ).dialog( "close" );
								}
							},*/
							close : function(){
								$( this ).dialog( "destroy" );
								alertItem.remove();
							}
						});
					},
					scope: this
				}
			});
			this.deletePolicyButton = new Button({
				text: "删除方案",
				lang:"{text:delete_scheme, title: delete_scheme}",
				id: "policy-delete-button",
				container:this.element.find("#device-config-button5"),
				events:{
					click:function(){
						var alertItem = $("<p id = \"alertText\">").text(locale.get("affirm_delete+?"));
						
						var buttons = {};
						buttons[locale.get("yes")] = function(){
							var policyId=self.element.find("#config-policy").val();
							service.deleteConfigPolicy(policyId,function(){
								
								self.loadPolicyList(self.model.name, 0);
							});
							$( this ).dialog( "close" );
						};
						buttons[locale.get("no")] = function(){
							$( this ).dialog( "destroy" );
						}
						
			            alertItem.dialog({
							title : locale.get("prompt"),
							modal:true,
							minHeight: 120,
							buttons: buttons,
							/*{
				            	"yes" : function(){
			            			var policyId=self.element.find("#config-policy").val();
									service.deleteConfigPolicy(policyId,function(){
										
										self.loadPolicyList(self.model.name);
									});
									$( this ).dialog( "close" );
								},
								"no" : function(){
									$( this ).dialog( "close" );
								}
							},*/
							close : function(){
								$( this ).dialog( "destroy" );
								alertItem.remove();
							}
						});
					},
					scope: this
				}
			});
			self.updatePolicyButton.disable();
			self.deletePolicyButton.disable();
		},
		
		compareModelConfig : function(config){
			var templateKeys = $H(this.frameContentWindow.default_scheme).keys();
			var configKeys = $H(config).keys();
			
			var isInclude = function (a,b){
				  for(var i=0;i<a.length;i++){
				    var bo=false;
				    for(var j=0;j<b.length;j++) if(a[i]==b[j]){bo=true;break;}
				if(!bo) return false;
				  }
				  return true;
			}
			
			return isInclude(templateKeys, configKeys);
		},
		
		configButtonClick : function(isSms){
/*			//get configuration from the model html
			//then save the params to device

			//don't forget to notice users to create a config policy 
			var self = this;
			var configScheme=self.getConfigFromFrame();
			var gatewayTypeStr  = gatewayType.get(self.model.model) ? gatewayType.get(self.model.model).name : "";
			if(configScheme){
				service.issuedConfigParmas(
				{
					model:self.model,
					issueMethod:0,
					gatewayType : gatewayTypeStr,
					savePolicy:1,
					name : "policy"+cloud.util.random(0,99),
					deviceList:self.getResourceIdArray(),
					config:configScheme
				}, 
				function(result) {
//	                 console.log(result, "issuedConfigParmas");
	            }, 
	            this
	            );
			}
			//$("#new-config-dialog-form").dialog("open");
			//this.newConfigDialog.dialog("open");
 		*/	
			var isSchemaOk = this.varlidateSchema();
			
			if (isSchemaOk){
				this.isCreateNewConfBtn && (this.isCreateNewConfBtn.setSelect(false));
				this.newConfigFormName.attr("disabled", true).val("");
				
				if(isSms){
					this.sendBySms = true;
					this.newConfigDialog.dialog("option", "title", locale.get("sms_apply_config"));
					this.newConfigDialog.dialog("open");	
				}else {
					this.sendBySms = false;
					this.newConfigDialog.dialog("option", "title", locale.get("apply_config"));
					this.newConfigDialog.dialog("open");	
				}
			}
		},
		
		writeConfig : function(configScheme){
			var self = this;
			
//			var gatewayTypeStr  = gatewayType.get(self.model.model) ? gatewayType.get(self.model.model).name : "";
			var gatewayTypeStr  = gatewayType.get(self.model.model) ? gatewayType.get(self.model.model).path : "";
			var isSavePolicy = this.isCreateNewConfBtn.isSelected() ? 1 : 0;
			var policyName = this.newConfigFormName.val();
			var isSms = this.sendBySms ? 1 : 0;
			this.sendBySms = false;
			cloud.util.mask(this.element);
			if(configScheme && (configScheme != -1)){
				var resourcesIds = self.getResourceIdArray();
				service.issuedConfigParmas(
					{
						model:self.model,
						issueMethod:isSms,
						gatewayType : gatewayTypeStr,
						savePolicy:isSavePolicy,
						name : policyName,
						deviceList:resourcesIds,
						config:configScheme
					}, 
					function(result) {
						cloud.util.unmask(this.element);						
							if (result){
								var sucArray = $A();
								var failArray = $A();
								$A(result).each(function(one){
									if (one.taskId){
										sucArray.push(one)
									}else{
										self.resources.each(function(res){
											if (res._id == one.deviceId){
												one.name = res.name
											}
										});
										failArray.push(one);
									}
								});
//								console.log(failArray, "failArray");
								
								/*var sucArr = $A(result).pluck("taskId");
								//var resourcesId = this.getResourceIdArray();
								var fArr = $A(result).pluck("errorInfo");
								var failedArr = this.resources.findAll(function(one){
									return sucArr.indexOf(one._id) == -1;
								});*/
//								console.log(failArray, "failArr");
								this.showWriteCfgResult(failArray, this.resources);
								if(isSavePolicy == 1){							
									this.loadPolicyList(this.model.name, 0);
									
								}
							}
						

		            }, 
	            this);
			}
		},
		
		initWriteCfgResult : function(){
			var buttons = {};
			buttons[locale.get("affirm")] = function(){
				$(this).dialog("close");
			};
			this.writeCfgResultDialog = $("#write-config-result").dialog({
				title:locale.get("prompt"),
				autoOpen: false,
				height: 200,
				width: 300,
				modal: true,
				buttons: buttons,
				close : function(){
					
				},
				appendTo : "#" + this.id
			});
			locale.render({element:$("#write-config-result")});
		},
		
		showWriteCfgResult : function(failedArr, totalArr){
			if (this.writeCfgResultDialog){
				var self = this;
				var resultContent = this.writeCfgResultDialog.find("#write-config-fail-content");
				resultContent.hide();
				
				$("#write-config-suc").text(totalArr.length - failedArr.length);
				$("#write-config-fail").text(failedArr.length);
				
				if (failedArr.length > 0){
					this.writeCfgResultDialog.find("#write-config-fail-list").empty();
					failedArr.each(function(one){
						var errorStr;
						if (one.errorInfo && (one.errorInfo.error_code == 20007)){
							errorStr = locale.get("gateway_already_has_task");
						}else if (one.errorInfo && one.errorInfo.error_code){
							errorStr = locale.get(one.errorInfo.error_code);
						}else{
							errorStr = locale.get("10001");
						}
						var promptStr = one.name + "(" + errorStr + ")";
						$("<li>").html(promptStr).appendTo(self.writeCfgResultDialog.find("#write-config-fail-list"));
					});
					resultContent.show();
					/*buttons["查看失败列表"] = function(){
						
					};*/
				};
				this.writeCfgResultDialog.dialog("open");
			}
		},
		
		//render the config template html in the iframe
		renderDeviceConfigContainer:function(model){
			var self=this;
			var frame = document.getElementById("device-config-container-body");
//			var urlSrc = require.toUrl("./models/"+gatewayType.get(model).name+"/"+gatewayType.get(model).path+".html");
			var urlSrc = require.toUrl("./models/"+gatewayType.get(model).path+"/"+gatewayType.get(model).html+".html");
			frame.src=urlSrc;
			self.containerFrame=frame;
			self.frameContentWindow = frame.contentWindow;//$(window.frames["device-config-container-body"])[0];//add by qinjunwen
			// this.containerFrame.onload = function() {
			// 	// self.containerFrame.contentWindow.initModelHtml({
			// 	// 	"modelName":"IR700"
			// 	// });
			//  };
			
			$(frame).load(function(){// auto load config when resources.length = 1
				if (self.resources.length == 1){
					if (!self.isAlreadyGetCfg){
						self.getConfig();
						self.isAlreadyGetCfg = true;
					}
				};
			});
		},
		
		//add by qinjunwen
		setConfigToFrame : function(config){
			if (this.frameContentWindow ){
				console.log("setConfigToFrame()",1);
				console.log("frameContentWindow",this.frameContentWindow)
				return this.frameContentWindow.updateScheme(config);
			}else {
				return null
			}
		},
		
		//add by qinjunwen
		getConfigFromFrame : function(){
			if (this.frameContentWindow ){
				return this.frameContentWindow.savePage();
			}else {
				return null
			}
		},

		getResourceIdArray:function(){
			var resourcesIdArray=[];
			this.resources.each(function(one){
				resourcesIdArray.push(one._id);				
			});
			return resourcesIdArray;
		},

		/*
		*read the task state 5 second interval,
		*if the task state is 3(finished),get the scheme,hide the mask ,and clear the timer
		*/
		currentGetConfigTask:function(ids){
			var self=this;
			service.getTaskState(ids, 
				function(taskInfo) {
	                //render scheme in model html
					 self.containerFrame.contentWindow.setParams({
					 		"currentScheme":taskInfo.data
					 });

	                //hide the mask
					cloud.util.mask(self.element);

	                //clear the timer
	                window.clearInterval(self.getConfigTimer);

	                //update the time(the deivce's config synchronous time)
	                //taskInfo.updateTime
	                self.element.find("#config-synchronous-time").html("2099-12-05");

	            },
	            this
	           );
		},
		currentState:function(time){
			var self = this;
//			var ids = self.getResourceIdArray();
			this.timer = setInterval(function(){
				if ($("#gateway-manage-content-config").is(":visible")) {
					self.refreshDeviceList();
				}
			},time);
		},
		
		refreshDeviceList : function(){
			var self = this;
			var ids = self.getResourceIdArray();
			
			service.getResources(ids,function(data){
				self.resources = data;
//					self.renderDeviceList();
				self.table && self.table.render(self.resources)
				if (self.resources && (self.resources.length == 1)) {
					self.refreshSyncstateInfo(self.resources[0]);
				}
			});
		},
		
		refreshSyncstateInfo : function(data){
			var stateEl = this.element.find("#config-synchronous-status");//config-synchronous-time
			var timeEl = this.element.find("#config-synchronous-time");
			
			var syncStateStr, syncTimeStr = "";
			
			if (data.updateTime){
				var syncDate = new Date(parseInt(data.updateTime));
				syncTimeStr = cloud.util.dateFormat(syncDate, "yyyy-MM-dd hh:mm:ss");
			}else{
				syncTimeStr = locale.get("not_geted");
			}
			
			switch (parseInt(data.syncState)){
			case 0:
				syncStateStr = locale.get("not_sync");//"未同步";
				break;
			case 1:
				syncStateStr = locale.get("getting_config");//"正在获取配置";
				break;
			case 2:
				syncStateStr = locale.get("applying_config");//"正在下发配置";
				break;
			case 3:
				syncStateStr = locale.get("sync_succeed");//"同步成功";
				break;
			case 4:
				syncStateStr = locale.get("sync_fail");//"同步失败";
				break;
			default :
				syncStateStr = locale.get("not_sync");//"未同步";
				break;
			}
			stateEl.html(syncStateStr);
			timeEl.html(syncTimeStr);
		},

		renderDeviceList: function() {
			var onlineStatus = function(online,type){
				if("display"===type){
					var resStatus;
					switch(online){
					case 1:
						resStatus = locale.get("online");
						break;
					case 0:
						resStatus = locale.get("offline2");
						break;
					}
					return resStatus;
				}else{
					return online;
				}
			};
			this.table = new Table({
                selector: this.element.find("#device-list-content-config"),
                datas: this.resources,
                pageSize: 100,
                autoWidth: false,
                pageToolBar: false,
                checkbox : "none",
                columns: [{
                    "title":"网关",
                    "lang":"{text:gateway}",
                    "dataIndex":"name",
                    "cls":null,
                    "width":"50%"
                },{
                    "title":"在线状态",
                    "lang":"{text:online_state}",
                    "dataIndex":"online",
                    "cls":null,
                    "width":"30%",
					render:onlineStatus
                },{
                    "title": "",
                    "dataIndex": "empty",
                    "defaultContent": "",
                    "width": "20%",
                    sortable: false
                }],
                events: {
                    onRowRendered: function(tr, data, index) {
                        var self = this;
                        if (data.button) {
                            return;
                        }
                        var button = new Button({
							cls:"delete-buttom",
                            container: $(tr).find("td:eq(2)"),
                            imgCls: "cloud-icon-delete",
                            title : locale.get("delete"),
                            events: {
                                click: function() {
                                	self.deleteResource(data);
                                },
                                scope: self
                            }
                        });
                        data.button = button;
                    },
                    scope: this
                }
            });
		},

        _renderModel:function(){
        	var self=this;
             service.getModelByModelId(self.modelId,function(model){
            	 self.model=model;
                 self.renderDeviceConfigContainer(self.model.name);
                 self._initConfigButton();
                 var modelName = self.model.name;
                 if(modelName.length > 12){
                	 newModelName = modelName.substring(0,11) + "..";
                	 self.element.find("#device-config-model-name").html(newModelName).attr("title",modelName);
                 }else{
                	 self.element.find("#device-config-model-name").html(modelName);
                 }
             },this);
        },

		deleteResource: function(data){
			var row = this.table.getRowById(data._id);
			this.table["delete"](row);
			var resource = this.resources.find(function(resource){
				return resource._id === data._id;
			});

			this.resources = this.resources.without(resource);
			this._initConfigButton();
		},

		destroy: function() {
			this.resources=null;
			this.isAlreadyGetCfg = null;
			if(this.table){
				if(this.table.destroy){
					this.table.destroy();
				}else{
					this.table=null;
				}
			}
			 if(this.layout){
			 	this.layout=null;
			 }
			 if(this.deletePolicyButton){
			 	if(this.deletePolicyButton.destroy){
			 		this.deletePolicyButton.destroy();
			 	}else{
			 		this.deletePolicyButton=null;
			 	}
			 }
			 if(this.updatePolicyButton){
			 	if(this.updatePolicyButton.destroy){
			 		this.updatePolicyButton.destroy();
			 	}else{
			 		this.updatePolicyButton=null;
			 	}
			 }
			 if(this.smsConfigButton){
			 	if(this.smsConfigButton.destroy){
			 		this.smsConfigButton.destroy();
			 	}else{
			 		this.smsConfigButton=null;
			 	}
			 }
			 if(this.putConfigButton){
			 	if(this.putConfigButton.destroy){
			 		this.putConfigButton.destroy();
			 	}else{
			 		this.putConfigButton=null;
			 	}
			 }
			 if(this.getConfigButton){
			 	if(this.getConfigButton.destroy){
			 		this.getConfigButton.destroy();
			 	}else{
			 		this.getConfigButton=null;
			 	}
			 }
			 if (this.isCreateNewConfBtn){
				 this.newConfigDialog.find("#new-config-form-iscreate-row").children().remove();
			 }
			 if (this.newConfigDialog.is( ":ui-dialog" )){
				 this.newConfigDialog.dialog("destroy");
			 }
			 if (this.writeCfgResultDialog.is( ":ui-dialog" )){
				 this.writeCfgResultDialog.dialog("destroy");
			 }
			 
			 window.clearInterval(this.timer);
//			 window.clearInterval(this.getConfigTimer);
			 this.element.html("");
		},
		
		validateConfigName : function(){
			var self = this;
			var configName = this.newConfigFormName.val();
			var requestParams = {
				name : configName,
				model : this.model.name
			}
			//这里被修改了，只是不进行后台请求，因为在后台完成请求前，已经对名字进行了判断，所以这个根本没起到作用！
			this.newConfigNameOk = true;
			service.getPolicyListByParams(requestParams,function(policys){
				if (policys.length){
					this.newConfigNameOk = false;
					validator.prompt("#"+self.newConfigFormName.attr("id"),{text:locale.get("name_cannot_repeat"),promptPosition:"topLeft"});
				}else{					
					this.newConfigNameOk = true;
				}
			}, this);
		},
		
		varlidateSchema : function(){
			var result = false;
			var configScheme=this.getConfigFromFrame();
			if(!configScheme){
//				alert(locale.get("please_check_input"))
				dialog.render({
					lang:"please_check_input"
				});
				result = false;
			}else if (configScheme == -1){
//				alert(locale.get("please_select_at_least_one_config_item"))
				dialog.render({
					lang:"please_select_at_least_one_config_item"
				});
				result = false;
			}else {
				result = true;
			}
			return result;
		},
		
		validateConfigForm : function(){
			var result = false;
			if (this.isCreateNewConfBtn.isSelected()){
				if (validator.result() && this.newConfigNameOk){
					result = true;
				}else {
					result = false;
				}
			}else {
				result = true;
			}
			return result;
		},
		
		initValidator : function(){
			validator.render("#new-config-dialog-form",{
				promptPosition:"topLeft",
		        scroll: false
			});
		},
		initNewConfigForm : function(){
			var self = this;
			
			var buttons = {};
			buttons[locale.get("affirm")] = function(){
				var configScheme=self.getConfigFromFrame();
				self.validateConfigName();
				if (self.validateConfigForm.bind(self)()){
					
					self.writeConfig.bind(self)(configScheme);
					$( this ).dialog( "close" );
				}else{
					validator.prompt("#"+self.newConfigFormName.attr("id"),{text:locale.get("please_check_input"),promptPosition:"topLeft"});
				}
			};
			buttons[locale.get("cancel")] = function(){
				$( this ).dialog( "close" );
			}
			
			this.newConfigDialog = $("#new-config-dialog-form").dialog({
				autoOpen: false,
				height: 210,
				width: 400,
				modal: true,
				buttons: buttons,
				close : function(){
					if(validator){
						validator.hide("#new-config-dialog-form");
					}
				},
				appendTo : "#" + this.id
			});
			var isCreateNewConfRow = this.newConfigDialog.find("#new-config-form-iscreate-row");
			var newConfigFormName = this.newConfigDialog.find("#new-config-form-name");
			this.newConfigFormName = newConfigFormName;
			var newConfigFormNameRow = this.newConfigDialog.find("#new-config-form-name-row");
			newConfigFormName.attr("disabled", true);
			//newConfigFormNameRow.hide();
			//if (isCreateNewConfRow.children().length == 0){
			if (this.isCreateNewConfBtn){
				this.isCreateNewConfBtn.destroy();
			}
			isCreateNewConfRow && (isCreateNewConfRow.empty());
			this.isCreateNewConfBtn = new Button({
                container: isCreateNewConfRow,
                id : "new-config-form-iscreate-btn",
                checkbox : true,
                text: "将当前配置保存为新配置方案",
                lang:"{text:save_scheme_as_new,title:save_scheme_as_new}",
                events: {
                    click: function(){
                    	if (this.isCreateNewConfBtn.isSelected()){
                    		//newConfigFormNameRow.show();
                    		newConfigFormName.removeAttr("disabled");
                    	}else{
                    		//newConfigFormNameRow.hide();
                    		validator.hide("#new-config-dialog-form");
                    		newConfigFormName.attr("disabled", true);
                    	}
                    },
                    scope : this
                }
            });
			//}
			locale.render({element:$("#new-config-dialog-form")});
		}
	});

	return DeviceFirmware;
});