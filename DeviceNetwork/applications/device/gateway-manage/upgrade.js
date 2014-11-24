define(function(require) {
	var cloud = require("cloud/base/cloud");
	var html = require("text!./upgrade.html");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var service = require("./service");
	var Button = require("cloud/components/button");
	var Table = require("cloud/components/table");
	var Uploader = require("cloud/components/uploader");
//	require("cloud/lib/plugin/jquery.uploadify");
	var validator = require("cloud/components/validator");

	var DeviceFirmware = Class.create(cloud.Component, {
		initialize: function($super, options) {
			this.moduleName = "gateway-upgrade";
			$super(options);
			this.resources = options.resources;
			this.modelId=options.modelId;
			this.renderHtml();
			this.renderDeviceList();
//			this.renderUploadify();
			this.initWriteCfgResult();
			this.md5 = null;
			this.validate();
			this.currentState(5000);
			
			locale.render({element:this.element});
//			this.validation = this.element.find("form.upgrade-info-content").validationEngine({
//				// promptPosition: "centerRight",
//				scroll: false,
//				showOneMessage: true,
//				autoHidePrompt: true,
//				autoHideDelay: 2000
//			});
		},
		validate:function(){
			validator.render("#upgrade-info-content",{
				promptPosition:"topLeft",
			    scroll: false
			});
		},

		renderHtml: function() {
			this.element.html(html);
			this.element.addClass("device-upgrade");
			this.layout = this.element.layout({
				defaults: {
					paneClass: "pane",
					// togglerClass: "cloud-layout-toggler",
					resizerClass: "device-upgrade-layout-resizer",
					spacing_open: 10,
					spacing_closed: 0,
					togglerLength_open: 0,
					togglerLength_closed: 0,
					resizable: false,
					slidable: false
				},
				west: {
					paneSelector: "#device-list",
					size: 400
				},
				center: {
					paneSelector: "#upgrade-info"
				}
			});
			this.setServerInfo();

			this.saveButton = new Button({
				imgCls: "cloud-icon-save",
				container: this.element.find(".upgrade-info-content-buttonset"),
				text: "保存",
				lang:"{text:save, title : save}",
				events: {
					click: this.submit,
					scope: this
				}
			});
			this.uploadButton = new Button({
				imgCls: "cloud-icon-shangchuan",
				container: this.element.find("#upgrade-info-file"),
				text: "上传文件",
				lang:"{text:upload_files}",
				events: {
					
				}
			});
			this.initUploader();
		},
		setServerInfo:function(){
			var modelName=this.resources[0].modelName;
			this.element.find("#upgrade-info-ip").val(cloud.config.UPGRADE_SERVER);
//			console.log(this.resources);
			if(modelName.indexOf("DTU")=== -1 ){
				if(modelName.indexOf("9")!==-1 || modelName.indexOf("8")!==-1){
					this.element.find("#upgrade-info-port").val(cloud.config.UPGRADE_PORT.ENH);
				}
				else{
					 this.element.find("#upgrade-info-port").val(cloud.config.UPGRADE_PORT.ROUTE);
				}			   
			}else{
			    this.element.find("#upgrade-info-port").val(cloud.config.UPGRADE_PORT.DTU);
			}
		},

		submit: function(){
			if(validator.result() === false){
				return;
			}

			if(this.md5 === null){
//				alert("请先导入升级文件");
				dialog.render({lang:"please_lead_into_the_update_file"})
				return;
			}

			var ip = this.element.find("#upgrade-info-ip").val();
			var port = parseInt(this.element.find("#upgrade-info-port").val());
//			var version = this.element.find("#upgrade-info-version").val();
//			var username = this.element.find("#upgrade-info-username").val();
//			var password = this.element.find("#upgrade-info-password").val();
			var self =this;
			
			var data = {
				version:"1",
				filename: this.md5,
				ip: ip,
				port: port,
				username: "2",
				password: "3"
			};
			var failedArr = $A();
			var rescount = this.resources.length;
			this.mask();
			this.resources.each(function(resource){
				cloud.Ajax.request({
					url: "api2/tasks",
					type: "post",
					parameters: {
						verbose: 100
					},
					data: {
						objectId: resource._id,
						objectName: resource.name,
						userType : 1,
						name : "device upgrade",
						type: 6,
						priority: 30,
						data: data
					},
					error : function(data){
						data.name = resource.name;
						if(data.error_code !== 21336){
						    failedArr.push(data);
						    rescount--;
						} 
						if(rescount === 0 ){
							self.showWriteCfgResult(failedArr, self.resources);
						}
					},
					success: function(result){
						rescount--;
						if(rescount === 0 ){
							self.showWriteCfgResult(failedArr, self.resources);
						}
					}
				});
			});

		},
		showWriteCfgResult : function(failedArr, totalArr){
			if (this.writeCfgResultDialog){
				var self = this;
				var resultContent = this.writeCfgResultDialog.find("#write-upgrade-fail-content");
				resultContent.hide();
				
				$("#write-upgrade-suc").text(totalArr.length - failedArr.length);
				$("#write-upgrade-fail").text(failedArr.length);
				
				if (failedArr.length > 0){
					this.writeCfgResultDialog.find("#write-upgrade-fail-list").empty();
					failedArr.each(function(one){
						var errorStr;
						if (one && (one.error_code === 20007)){
							errorStr = locale.get("gateway_already_has_task");
						}else{
							errorStr = locale.get(one.error_code);
						}
						var promptStr = one.name + "(" + errorStr + ")";
						$("<li>").html(promptStr).appendTo(self.writeCfgResultDialog.find("#write-upgrade-fail-list"));
					});
					resultContent.show();
					/*buttons["查看失败列表"] = function(){
						
					};*/
				}
				if(totalArr.length - failedArr.length){
					$("#write-upgrade-suc-text").css("display","inline-block");
				}else{
					$("#write-upgrade-suc-text").css("display","none");
				};
				this.unmask();
				this.writeCfgResultDialog.dialog("open");
			}
		},
		initWriteCfgResult : function(){
			var buttons = {};
			buttons[locale.get("affirm")] = function(){
				$(this).dialog("close");
			};
			this.writeCfgResultDialog = $("#write-upgrade-result").dialog({
				title:locale.get("prompt"),
				autoOpen: false,
				height: 200,
				width: 300,
				modal: true,
				resizable: false,
				buttons: buttons,
				close : function(){
					
				},
				appendTo : "#" + this.id
			});
			locale.render({element:$("#write-upgrade-result")});
		},
		initUploader:function(){
			var self = this;
        	this.uploader = new Uploader({
        		browseElement : this.uploadButton,
                autoUpload : true,
                filters : [
                    {title : "Firmware files", extensions : "bin,ihd"}
                ],
                maxFileSize : "50mb",
        		events : {
					"onError" : function(err){
						cloud.util.unmask("#ui-window-content");
						dialog.render({text:err.text});
					},
					"onFilesAdded" : function(file){
						$("#upgrade-info-name").val(file[0].name);
					},
					"beforeFileUpload":function(){
						cloud.util.mask(
		                	"#ui-window-content",
		                	locale.get("uploading_files")
		                );
					},
        			"onFileUploaded" : function(response, file){
        				if ($.isPlainObject(response)){
							if(response.error){
								dialog.render({lang:response.error_code});
							}else{
								dialog.render({lang:"uploadcomplete"});
								self.md5 = response.result.md5;
							}
        				}
        				cloud.util.unmask("#ui-window-content");
        			}
					
        		}
        	});
		},

		/*
		renderUploadify: function() {
			var self = this;
			self.fileName = "device-upgrade-" + new Date().getTime();
			self.uploadify = this.element.find("#upgrade-info-file").uploadify({
				swf: require.toUrl('cloud/resources/flashs/uploadify.swf'),
				// auto: false,
				buttonClass: "cloud-upload-button",
				buttonText: "选择文件",
				height: 20,
				method: "post",
				removeCompleted: false,
				width: 70,
				multi: false,
				uploader: cloud.config.FILE_SERVER_URL + "/api/file?access_token=" + cloud.Ajax.getAccessToken() + "&file_name=" + self.fileName,
				onUploadSuccess: function(file, data, response){
					var result = data.evalJSON();
					if(result.error){
						alert(result.error);
					}else{
						result = result.result;
						self.md5 = result.md5;
					}
				}
			});
		},*/

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
				selector: this.element.find("#device-list-content-upgrade"),
				// service: this.service,
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
                    "width":"35%"
                },{
                    "title":locale.get("version_now"),
                    "lang":"{text:version_now}",
                    "dataIndex":"info",
                    "cls":null,
                    "width":"25%",
					render:function(info){
						if (info && info.swVersion){
							return info.swVersion;
						}else{
							return "";
						}
					}
                },{
                    "title":"在线状态",
                    "lang":"{text:online_state}",
                    "dataIndex":"online",
                    "cls":null,
                    "width":"25%",
					render:onlineStatus
                },{
                    "title": "",
                    "dataIndex": "empty",
                    "defaultContent": "",
                    "width": "15%",
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
                            container: $(tr).find("td:eq(3)"),
							imgCls: "cloud-icon-delete",
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
		currentState:function(time){
			var self = this;
			this.timer = setInterval(function(){
				if ($("#gateway-manage-content-upgrade").is(":visible")) {
					var ids = self.getResourceIdArray();
					service.getResources(ids,function(data){
						self.resources = data;
	//					self.renderDeviceList();
						self.table && self.table.render(self.resources);
					});
				}
			},time);
		},
		getResourceIdArray:function(){
			var resourcesIdArray=[];
			this.resources.each(function(one){
				resourcesIdArray.push(one._id);				
			});
			return resourcesIdArray;
		},

		deleteResource: function(data) {
			var row = this.table.getRowById(data._id);
			this.table["delete"](row);
			var resource = this.resources.find(function(resource) {
				return resource._id === data._id;
			});

			this.resources = this.resources.without(resource);
			this._initSavebtn();
		},
		_initSavebtn:function(){
			if(this.resources.length < 1){
				this.saveButton.disable();
			}else{
				if(!this.saveButton.isEnable()){this.saveButton.enable();}
			}
		},

		destroy: function() {
//			if(this.uploadify) this.uploadify.uploadify("destroy");
			if(this.uploader) this.uploader.destroy();
			this.table.destroy();
			this.saveButton.destroy();
			this.uploadButton.destroy();

			this.layout.destroy();

			this.resources = null;
//			this.uploadify = null;
			this.uploader = null;
			this.table = null;
			this.saveButton = null;
			this.uploadButton = null;
			this.md5 = null;
			this.layout = null;
			if (this.writeCfgResultDialog.is( ":ui-dialog" )){
				 this.writeCfgResultDialog.dialog("destroy");
			};
			window.clearInterval(this.timer);

			//一系列的清除动作

		}
	});

	return DeviceFirmware;
});