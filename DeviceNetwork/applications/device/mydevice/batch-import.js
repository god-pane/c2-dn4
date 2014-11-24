/**
 * @author PANJC
 * 
 */
define(function(require){
	require("cloud/base/cloud");
//	var maps = require("cloud/components/map");
    var Button = require("cloud/components/button");
    var template = require("text!./batch-import.html");
	var service = require("cloud/service/service");
	var validator = require("cloud/components/validator");
	require("cloud/lib/plugin/jquery.uploadify");
	var Window = require("cloud/components/window");
	var Uploader = require("cloud/components/uploader");
	
    var BatchImport = Class.create(cloud.Component, {
        initialize: function($super,options){
        	$super(options);
        	
        	this._render();
        	locale.render(this);
        	locale.render({element : this.content});
        },
        
        _render:function(){
        	this._draw();
        	this.renderModels();
        	this.drawAdvancedBtn();
//        	this.renderMap();
        	this.drawUploadRow();
        	this.drawDownTemplateRow();
        	this.drawCreateSiteBtn();
        	this._renderButtons();
        	this.initBatchImportResult();
        	this.initValidator();
//        	this._getResourcesTags(this.resourcesIds);
//        	this._events();
        },
        
        initValidator : function(){
        	var self = this;
			validator.render("#batch-import-wrapper",{
					promptPosition:"bottomRight",
			        scroll: false
			});
        },
        
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
        
        setDeviceModel: function(id) {
        	if (id){
        		if(this.element)this.element.find("#batch-import-model").val(id).change();
        	}
        },
        
        renderModels: function() {
        	var self = this;
        	
        	var $select = $("#batch-import-model");
        	self.modelsMap = $H();
            this.loadDeviceModels(function(models) {
            	
                models.each(function(model) {
                    $("<option>").val(model._id).text(model.name).appendTo($select);
                    self.modelsMap.set(model._id, model);
                }, self);
                if (models.length > 0){
                	$("#batch-import-model").val(models[0]._id).change();
                }
            });
            $select.change(function(){
            	var id = $(this).val();
            	//var modelId = self.element.find("#info-model option:selected").val();
            	if (id){
            		var model = self.modelsMap.get(id);
            		if (model && model.isGateway){
            			//self.setDeviceType(0)
            		}else{
            			//self.setDeviceType(1)
            		}
            	}
            });
        },
        
        /*renderMap: function() {
            this.map = new maps.Map({
                selector: this.content.find("#batch-import-map"),
                zoomControl: true,
                panControl: false
            });
            this.map.setZoom(4);
            this.renderLocMarker();
        },
        
        renderLocMarker : function(){
        	var self = this;
        	if (this.locMarker) {
    			this.locMarker.destroy();
    			this.locMarker = null;
    		}
        	cloud.util.getCurrentLocation(function(position){
            	var location = new maps.LonLat(position.longitude, position.latitude)
            	self.locMarker = self.map.addMarker({
    				position: location,
                    title: locale.get("device_location"),
                    draggable: true
    			});
            	self.map.setCenter(self.locMarker.getPosition());
            })
        },*/
        
        drawAdvancedBtn:function(){
			if(!this.advancedBtn){
				this.advancedBtn = new Button({
					container: "#batch-import-device-button-content",
					id: "batch-import-adv-checkbox",
					imgCls: "cloud-icon-arrow3",
					lang:"{title:}",
					events: {
						click: function(){
							$(this.content.find("#batch-import-device-advanced-form")).toggle(100,"linear");
						},
						scope: this
					}
				});
			}else{
				this.content.find("#batch-import-device-advanced-form").hide();
			}
		},
		
		drawUploadRow : function(){
			var self = this;
			this.uploadFileBtn = new Button({
	        	container : self.content.find("#batch-import-upload-button"),
	        	text : locale.get("select_file"),
	        	lang : "{title:select_file,text:select_file}",//
	        	imgCls : "cloud-icon-shangchuan",
	        });
			this.initUploader();
		},
		
		initUploader : function(){
        	var self = this;
        	this.uploader = new Uploader({
        		browseElement : this.uploadFileBtn,
                autoUpload : true,
                filters : [
                    {title : "Excel files", extensions : "xls"}
                ],
                maxFileSize : "10mb",
        		events : {
        			"onError" : function(err){
						cloud.util.unmask("#ui-window-content");
						dialog.render({text:err.text});
					},
        			"onFilesAdded" : function(files){
//        				uploader.tipsContent.deleteItems();
        				/*if (self.fileTmp){
        					files.each(function(one){
//        						if (one.id != )
        					})
        				}*/
        				self.content.find("#batch-import-upload-tips").text(files[0].name);
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
								self.fileId = response.result._id;
								self.fileTmp = file;
								dialog.render({lang:"uploadcomplete"});
							}
        				}
        				cloud.util.unmask("#ui-window-content");
        			}
        		}
        	});
        },
        
        drawDownTemplateRow : function(){
        	var self = this;
			this.downloadTplBtn = new Button({
	        	container : self.content.find("#batch-import-download-button"),
	        	text : locale.get("download_template_file"),
	        	imgCls : "cloud-icon-download",
	        	events : {
	        		click : function(){
	        			var filename = "template_batch_add.xls";
//	        			var params = {
//	        				access_token : cloud.Ajax.getAccessToken(),
//	        				filename : filename
//	        			};
//	        			params = jQuery.param(params);
	            		var url = cloud.config.FILE_SERVER_URL + "/api/systemfile?filename="+filename+"&access_token=";
	            		cloud.util.ensureToken(function(){window.open(url + cloud.Ajax.getAccessToken());});
	        		}
	        	}
	        });
//			this.initUploader();
		},
		
		drawCreateSiteBtn : function(){
        	if (!this.autoCreateSite){
        		this.autoCreateSite = new Button({
                    container: this.content.find("#batch-import-site-autocreate"),
                    id: "module-batch-import-autocreate-site",
                    checkbox : true,
                    text: locale.get("auto_create_site"),//"自动创建现场",
                    lang:"{title:auto_create_site,text:auto_create_site}",
                    events: {
                        click: function(){
                        },
                        scope : this
                    }
                });
        	}
			this.autoCreateSite.setSelect(true);
        },
        
        _renderWindow:function(){
    		this.window = new Window({
				container: "body",
				title: locale.get({lang:"batch_import_gateway_device"}),
				top: "center",
				left: "center",
				height: 450,
				width: 800,
				drag:true,
				mask: true,
				content: "<div id='device-batch-import-content'></div>",
				events: {
					"onClose": function() {
						this._deleteFile(this.fileId);
						
						this.fire("onComplete");//TODO onComplete event is required when this module is re-designed
					},
					scope: this
				}
			});
        	this.window.show();
        },
        
        _deleteFile : function(fileId){
        	var self = this;
        	if (fileId != undefined){
        		cloud.Ajax.request({
                    url: "api/file/" + fileId,
                    /*parameters: {
                    	verbose : 1,
                    	file_id: this.fileId,
                    	create_site: createSite
                    },*/
                    type: "DELETE",
                    success: function(data) {
                    },
                    error : function(error){
                    }
                });
        	}
        },
        
        _renderButtons : function(){
        	var self = this;
			this.submitBtn = new Button({
	        	container : self.content.find(".batch-import-buttonset-bottom"),
	        	text : locale.get("submit"),
	        	lang:"{title:submit,text:submit}",
	        	events:{
	        		click : function(){
	        			var validateOk = validator.result("#batch-import-wrapper")
	        			if (validateOk){
	        				self.submit();
	        			}
	        		}
	        	}
	        });
			
			this.cancelBtn = new Button({
	        	container : self.content.find(".batch-import-buttonset-bottom"),
	        	text : locale.get("cancel"),
	        	lang:"{title:cancel,text:cancel}",
	        	events:{
	        		click : function(){
	        			self.window.destroy();
	        			self.fire("onBatchImportCancel");
	        		}
	        	}
	        });
        },
        
        getDeviceModel: function() {
            return this.content.find("#batch-import-model option:selected").val();
        },
        
        getDeviceModelName: function() {
            return this.content.find("#batch-import-model option:selected").text();
        },
        
        getVendor:function(){
			return this.content.find("#batch-import-vendor option:selected").val();
		},
		
		getLocation : function(){
			var location= { 
		        longitude : 116.407013,
                latitude : 39.926588,
            };
			return location;
		},
        
        getTimeout : function(){
        	return this.content.find("#batch-import-device-advanced-timeout").val();
        },
        
        getAckTimeout : function(){
        	return this.content.find("#batch-import-device-advanced-acktimeout").val();
        },
        
        getAckRetries : function(){
        	return this.content.find("#batch-import-device-advanced-ackretries").val();
        },
        
        getSync : function(){
        	return this.content.find("#batch-import-device-advanced-sync").val();
        },
		

        setConfig : function(config){
            if (config) {
                this.setTimeout(config.timeout);
                this.setAckTimeout(config.ackTimeout);
                this.setAckRetries(config.ackRetries);
                this.setSync(config.sync)
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
        
		getAdvanced: function(){
			var opt = {
				maxHeartbeatLost : parseInt(this.content.find("#batch-import-device-advanced-maxheartbeatlost").val(),0),
				heartbeatInterval : parseInt(this.content.find("#batch-import-device-advanced-heartbeatinterval").val(),0),
				heartbeatTimeout : parseInt(this.content.find("#batch-import-device-advanced-heartbeattimeout").val(),0),
				resendLogin : parseInt(this.content.find("#batch-import-device-advanced-resendlogin").val(),0)
			};
			return opt;
		},
		
        submit : function(){
        	var self = this;
        	
        	var device = {};
        	device.modelId = this.getDeviceModel();
//            device.modelName = this.getDeviceModelName();
            device.vendorId = this.getVendor();
            device.location = this.getLocation();
            device.deviceConfig = this.getAdvanced();
            device.businessState = 1;
            
            device.plcId = 0;
            device.config = this.getConfig();
//            device.timeout = this.getTimeout();
//			device.ackTimeout = this.getAckTimeout();
//			device.ackRetries = this.getAckRetries();
//			device.sync = this.getSync();
        	
            var createSite = 0;
			if (this.autoCreateSite && this.autoCreateSite.isSelected()){
				createSite = 1;
			}
            
        	if (this.fileId){
//        		self.disable();
        		cloud.util.mask($("#ui-window-content"));
        		cloud.Ajax.request({
                    url: "api/devices/batch_add",
                    parameters: {
                    	verbose : 1,
                    	file_id: this.fileId,
                    	create_site: createSite
                    },
                    data : {
                    	publicAttribute : device
                    },
                    type: "post",
                    success: function(data) {
//                        console.log(arguments, "batch_add_result");
                        cloud.util.unmask($("#ui-window-content"));
//                    	self.enable();
                        self.showBatchImportResult(data);
                        
//                        self.clearUpload();
                        self.fire("onBatchImportSuc");
                    }.bind(this),
                    error : function(error){
                    	if(error.error_code!==21336){
                    		if($.isArray(error.params)){
                    			var _prompt = locale.get(error.error_code,error.params);
    	        				dialog.render({
    	        					text:_prompt
    	        				})
                    		}else{
                    			dialog.render({lang:error.error_code});
                    		}
                        	cloud.util.unmask($("#ui-window-content"));
                    	}
                    	else{
                    		cloud.util.mask($("#ui-window-body"));
                    	}
//                    	self.enable();
//                    	self.clearUpload();
                    }
                });
        		self.clearUpload();
        	}else {
        		dialog.render({
        			lang : "please_select_file"
        		})
        	}
        	
        },
        
        enable : function(){
        	this.submitBtn.enable();
        	this.cancelBtn.enable();
        	this.uploader.enable();
        },
        
        disable : function(){
        	this.submitBtn.disable();
        	this.cancelBtn.disable();
        	this.uploader.disable();
        },
        
        clearUpload : function(){
        	this.content.find("#batch-import-upload-tips").empty();
        	this.fileId = null;
        },
        
        initBatchImportResult : function(){
        	var self = this;
			var buttons = {};
			buttons[locale.get("affirm")] = function(){
			};
			this.BatchImportResultDialog = $("#batch-import-device-result").dialog({
				title:locale.get("prompt"),
				autoOpen: false,
				height: 250,
				minHeight:250,
				maxHeight:250,
				minWidth:400,
				maxWidth:400,
				width: 400,
				modal: true,
				draggable:false,
				resizable:false,
//				buttons: buttons,
				close : function(){
//					self.window.destroy();
				},
				appendTo : "#device-batch-import-content"
			});
			locale.render({element:$("#batch-import-device-result")});
		},
		
		showBatchImportResult : function(data){
			var self = this;
			var resultArr;
			if(data instanceof Array){
				resultArr=data;
			}
			else{
				resultArr = data.result;
			}						
			if (this.BatchImportResultDialog){			
				var listContent = $("#batch-import-device-result-list").empty();
				if(resultArr[0].error){
					$("#batch-import-device-result-sucorfailed").text(locale.get("import_failed"));
					$(".failed-details").text(locale.get("failed_details"));
					var cnt=0;
					resultArr && resultArr.each(function(one){
						cnt++;
						if(one.error_code===20007){
							$("<li>").addClass("batch-import-device-result-row").text(cnt+"."+locale.get(one.error_code+100,one.params)).appendTo(listContent);
						}
						else{
							$("<li>").addClass("batch-import-device-result-row").text(cnt+"."+locale.get(one.error_code,one.params)).appendTo(listContent);
						}
					});
					cloud.util.unmask($("#ui-window-body"));
					this.BatchImportResultDialog.dialog("open");
					
				}
				else{
					$("#batch-import-device-result-sucorfailed").text(locale.get("import_success"));
					$(".failed-details").text("");													
					$(".inhand-dialog").css({"text-align":"center"});
					$(".inhand-dialog span").css({"display":"block","margin-top":"15px"});
					cloud.util.unmask($("#ui-window-body"));
					dialog.render({text:locale.get("import_success")});	
				}
				
			}
		},
		//兼容ie9
        _renderCss:function(){
        	$(".batch-import-header").css({
        		"text-align":"center",
        		"margin-top":"10px",
        		"font-size":"21px"
        	});
        	$(".ui-window-content").css({
        		"background-color":"#F5F6F9"
        	});
        	$(".batch-import-wrapper").css({
        		"width":"350px",
        		"margin":"0 auto",
        		"background-color":"#F5F6F9"
        	});
        	$(".device-batch-import-left").css({
        		"float":"left",
        		"width":"300px",
        		"overflow-y":"auto",
        		"height":"320px"
        	});
        	$(".device-batch-import-right").css({
        		"float":"left",
        		"width":"350px",
        		"height":"320px",
        		"margin-left":"40px"
        	});
        	$("div.batch-import-whether-router-row label.batch-import-whether-router-label").css({
        		"width":"92px"
        	});
        	$(".batch-import-form-row label.batch-import-form-label").css({
        		"display":"inline-block",
        		"width":"107px"
        	});
        	$(".batch-import-form .batch-import-form-text").css({
        		"width":"104px"
        	});
        	$(".batch-import-form .batch-import-form-select").css({
        		"width":"106px"
        	});
        	$(".batch-import-doc-select").css({
        		"width":"136px"
        	});
        	$("#batch-import-site-autocreate a").css({
        		"margin-left":"55px"
        	});
        	$(".batch-import-form-row").css({
        		"margin":"13px auto"
        	});
        	$(".batch-import-form-row #batch-import-serial-number").css({
        		"width":"130px"
        	});
        	$(".batch-import-map").css({
        		"width":"100%",
        		"height":"90%",
        		"margin":"10px 0",
        		"border":"1px solid silver"
        	});
        	$(".batch-import-buttonset-bottom a").css({
        		"margin":"8px 40px 0 0"
        	});
        	$(".batch-import-buttonset-bottom").css({
        		"margin-bottom":"15px"
        	});
        	$("#module-batch-import-tag-edit").css({
        		"padding":"0px",
        		"border":"0px"
        	});
        	$(".batch-import-form-span").css({
        		"displaly":"inline-block",
        		"width":"81px",
        		"margin":"0px 10px"
        	});
        	$(".batch-import-device-pic-row").css({
        		"height":"132px"
        	});
        	$(".batch-import-device-pic-row a").css({
        		"margin":"3px 0px 0px 0px",
        		"float":"right"
        	});
        	$("#batch-import-device-pic").css({
        		"float":"left",
        		"width":"178px",
        		"height":"132px"
        	});
        	$("#device-site-batch-import-qtip .cloud-bubble-hide").css({
        		"display":"none"
        	});
        	$(".batch-import-online-status").css({
        		"float":"left"
        	});
        	$(".batch-import-device-advances-title"	).css({
        		"left":"19px",
        		"position":"relative",
        		"background-color":"#F5F6F9",
        		"z-index":"1",
        		"width":"82px",
        		"padding-left":"12px"
        	});
        	$(".batch-import-device-advanced-form").css({
        		"position":"relative",
        		"top":"-21px",
        		"border":"1px solid rgb(204,204,204)",
        		"padding-left":"15px",
        		"display":"block"
        	}).hide();
        	$(".batch-import-device-ip-row").css({
        		"height":"18px",
        		"line-height":"18px"
        	});
        	$("#batch-import-device-signal-icon").css({
        		"display":"inline-block",
        		"margin-bottom":"-2px"
        	});
        	$("#device-batch-import").css({
        		"background-color":"#F5F6F9",
        		"text-align":"center"
        	});
        	$("#device-batch-import-form-content").css({
        		"display":"inline-block",
        		"text-align":"left"
        	});
        },
        _draw:function(){
        	this._renderWindow();
        	this.content = $("#device-batch-import-content");
        	this.content.html(template);
        	this._renderCss();
        },
        

        destroy: function($super){
        	this.window && this.window.destroy();
        	$super();
        },
        
    });
	
	return BatchImport;
	
});
