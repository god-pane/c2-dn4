/**
 * @author PANJC
 * 
 */
define(function(require){
	require("cloud/base/cloud");
//	var maps = require("cloud/components/map");
    var Button = require("cloud/components/button");
    var template = require("text!./misi-import.html");
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
//        	this.renderModels();
//        	this.drawAdvancedBtn();
//        	this.renderMap();
        	this.drawUploadRow();
        	this.drawDownTemplateRow();
//        	this.drawCreateSiteBtn();
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
	        			var filename = "template_mobile.xls";
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
        _renderWindow:function(){
    		this.window = new Window({
				container: "body",
				title: locale.get({lang:"imsi_mobilenumber"}),
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
                    url: "api/imsi/" + fileId,
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
        getVendor:function(){
			return this.content.find("#batch-import-vendor option:selected").val();
		}, 
        submit : function(){
        	var self = this;
        	if (this.fileId){
//        		self.disable();
        		cloud.util.mask($("#ui-window-content"));
        		cloud.Ajax.request({
                    url: "api/imsi",
                    parameters: {
                    	verbose : 1,
                    	file_id: this.fileId
                    },
                    type: "post",
                    success: function(data) {
//                        console.log(arguments, "batch_add_result");
                        cloud.util.unmask($("#ui-window-content"));
//                    	self.enable();
                        self.showBatchImportResult(data);                       
//                        self.clearUpload();
                        self.fire("onMISIImportSuc");
                    }.bind(this),
                    error : function(error){
                    	if(error.error_code!==21336){
                    		dialog.render({lang:error.error_code});
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
        
        _draw:function(){
        	this._renderWindow();
        	this.content = $("#device-batch-import-content");
        	this.content.html(template);
        	this._renderCss();
        },
      //为解决ie9兼容
        _renderCss:function(){
        	$(".ui-window-content").css({
        		"background-color":"#F5F6F9"
        	});
        	$(".batch-import-wrapper").css({
        		"width":"350px",
        		"margin":"0 auto",
        		"background-color":"#F5F6F9"
        	});
        	$(".batch-import-header").css({
        		"margin-top":"10px",
        		"text-align":"center",
        		"font-size":"21px"
        	});
        	$(".device-batch-import-left").css({
        		"float":"left",
        		"width":"300px",
        		"overflow-y":"auto",
        		"height":"150px"
        	});
        	$("div.batch-import-whether-router-row label.batch-import-whether-router-label").css({
        		"width":"92px"
        	});
        	$(".batch-import-form-row label.batch-import-form-label").css({
        		"display":"inline-block",
        		"width":"107px"
        	});
        	$(".batch-import-doc-select").css({
        		"width":"136px"
        	});
        	$(".batch-import-form-row").css({
        		"margin":"13px auto"
        	});
        	$(".batch-import-form-row #batch-import-serial-number").css({
        		"width":"130px"
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
        		"display":"inline-block",
        		"width":"81px",
        		"margin":"0px 10px"
        	});
        	$(".batch-import-form a.cloud-button").css({
        		"margin-right":"0px"
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

        destroy: function($super){
        	this.window && this.window.destroy();
        	$super();
        },
        
    });
	
	return BatchImport;
	
});
