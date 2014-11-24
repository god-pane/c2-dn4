define(function(require) {
	require("cloud/base/cloud");
	var OverviewTemplate = require("../../template/overview");
	var Button = require("cloud/components/button");
	var _Window = require("cloud/components/window");
	var InfoModule = require("./info");
	var TagManager = require("../../components/tag-manager");
	var service = require("./service");
	var XmlImport=require("./xml-import");
	//	var TagManager = require("../../components/tag-manager");

	var MyDeviceModelOverview = Class.create(cloud.Component, {
		initialize: function($super, options) {
			var self = this;
			this.moduleName = "mydevicemodel-overview";
			$super(options);
			var modelConfig = permission.app("_model");
			if(!modelConfig.read) {
				return ;
			}

			this.infoModule = null;
			this.element.empty().addClass("cloud-application mydevicemodel-overview");
			this.overview = new OverviewTemplate({
				selector: this.element,
				service: service,
				infoModule: function() {
					if (self.infoModule === null) {
						self.infoModule = new InfoModule({
							selector: "#overview-info"
						});
					}
					return self.infoModule;
				},
				filters : {
				    "delete" : function(res){
				        return self.verifyNoGateway(res);
				    }
				}
			});
			
			this.addToolbarItems();
			this.window = null;
			locale.render({element:this.element});
			this.empower();
		},
		
		empower: function() {
			var modelConfig = permission.app("_model");
			if(!modelConfig.write) {
				this.overview.contentModule.addBtn.hide();
				this.overview.contentModule.deleteBtn.hide();
			}
			if(!modelConfig.import) {
				this.importBtn.hide();
			}
		},
		
		verifyNoGateway : function(res){
		    var doAlert = false;
		    res = res.findAll(function(one){
		        if (one.system == false) {
		            return true;
		        }else{
		            doAlert = true;
		        }
		    });
		    if(doAlert){
		    	alert(locale.get("cannot_del_system_model"));
		    }
//		    console.log(res, "verifyNoGateway");
		    return res;
		},
		
//		verifyDevCountZero : function(res){
//		    var doAlert = false;
//            res = $A(res).findAll(function(one){
//                if (one.deviceCount == 0){//只能删除机型下设备数为0的机型
//                    return true;
//                }else{
//                    doAlert = true;
//                }
//            });
//            
//            if (doAlert){
//                window.alert(locale.get("can_only_del_no_device_model"))
//            };
//            return res;
//		},

		addToolbarItems: function() {
			var self = this;
			var toolbar = this.overview.getToolbar();
			var labelBtn = new Button({
				imgCls: "cloud-icon-label",
//				title:"打标签",
//				title: locale.get("gateway_management"),
				lang:"{title:batch_tag}",
				events: {
					click: function() {
						var selectedResouces = this.overview.contentModule.getSelectedResources();
						if (selectedResouces.length == 0) {
//							alert("At least select one item , Please!");
						    dialog.render({lang:"at_lease_select_one"});
						} else {

							service.getTableResourcesById(selectedResouces, function(_resources) {
								var resources = new Hash();
								_resources.each(function (resource) {
									resources.set(resource._id, resource.name);
								});
								self.renderTagManager(resources.toObject());
								
							}, this);
							// this.renderTagManager();
						}
					},
					scope: this
				}
			});
			var importBtn = new Button({
				imgCls: "cloud-icon-daoru",
				title: locale.get("import_model"),
				lang:"{title:import_model}",
				events: {
					click: function() {
						var bua=navigator.userAgent;
						var reg=new RegExp("MSIE ([9,8,7][/.0-9]{0,})");
						var result=reg.exec(bua);
						if(result){
							dialog.render({"text":locale.get("not_support")});
						}
						else{
							this.renderXmlImport(); 
						}
					},
					scope: this
				}
			});
			this.importBtn = importBtn;
			toolbar.appendRightItems([importBtn,labelBtn], -1);
		},
		renderXmlImport:function(){
			var self = this;
			if (this.xmlImport){
				this.xmlImport.destroy();
			}
			this.xmlImport = new XmlImport({
				events : {
					"onXmlImportSuc" : function(){
//						console.log("onXmlImportSuc");
						self.overview.reloadTags();
					}
				}
			});
//			this.batchImport.on()
		
		},
		renderTagManager: function(resources) {
			/*if (!this.tagManagerWindow) {
				this.tagManagerWindow = new _Window({
					container: "body",
					title: "标签批量操作",
					top: "center",
					left: "center",
					height: 620,
					width: 605,
					mask: false,
					content: "<div id='overview-window-tag'></div>",
					events: {
						"onClose": function() {
							this.tagManager.destroy();
							this.tagManager = null;
							this.tagManagerWindow = null;
						},
						scope: this
					}
				});
				var self = this;
				require(["../../components/tag-manager"], function(TagManager) {
					self.tagManager = new TagManager({
						selector: self.tagManagerWindow.element.find("#overview-window-tag"),
						obj: resources
					});
				});
				this.tagManagerWindow.show();
			} else {
				this.tagManagerWindow.show();
			}*/
		    var self = this;
            if (this.tagManager){
                this.tagManager.destroy();
            }
            this.tagManager = new TagManager({
                obj: resources
            });
            this.tagManager.on({
                "onComplete" : function(){
                    self.overview && (self.overview.reloadTags("clicked"));
                }
            })
		},

		destroy: function() {
			this.element.removeClass("mydevicemodel-overview cloud-application");
			this.overview.destroy();
			$("#overview-info").empty();
			if (this.tagManager != null) this.tagManager.destroy();
			if (this.infoModule.destroy) this.infoModule.destroy();
		}
	});
	return MyDeviceModelOverview;
});