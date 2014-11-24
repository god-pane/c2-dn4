define(function(require){
	require("cloud/base/cloud");
	var Button=require("cloud/components/button");
	var template=require("text!./xml-import.html");
	var service=require("cloud/service/service");
	var validator=require("cloud/components/validator");
	require("cloud/lib/plugin/jquery.uploadify");
	var Window=require("cloud/components/window");
	var Uploader=require("cloud/components/uploader");
	var XmlImport=Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.configFile=null;
			this._render();
			locale.render(this);
			locale.render({element:this.content});
		},
		_render:function(){
			this._draw();
			this._fileReader();
//			this.renderModels();
//			this.drawAdvancedBtn();
//			this.drawUploadRow();
//			this.drawDownTemplateRow();
//			this.drawCreateSiteBtn();
			this._renderButtons();
			this._renderSensorType();
			this.initXmlImportResult();
			this.initValidator();
		},
		initValidator:function(){
			var self=this;
			validator.render("#batch-import-wrapper",{
				promptPosition:"bottomRight",
				scroll:false
			});
		},
//		drawUploadRow:function(){
//			var self=this;
//			this.uploadFileBtn=new Button({
//			container:self.content.find("#batch-import-upload-button"),
//			text:locale.get("select_file"),
//			lang:"{title:select_file,text:select_file}",
//			imgCls:"cloud-icon-shangchuan"
//			});
//			this.initUploader();
//		},
//		initUploader:function(){
//			var self=this;
//			var uploaderUrl=cloud.config.FILE_SERVER_URL+"/api/file?access_token="+cloud.Ajax.getAccessToken();
//			this.uploader=new Uploader({
//				browseElement:this.uploadFileBtn,
//				url:uploaderUrl,
//				autoUpload:true,
//				filters:[
//				    {title:"Xml files",extensions:"xml"}
//				],
//				maxFileSize:"1mb",
//				events:{
//					"onFilesAdded":function(files){
//						self.content.find("#batch-import-upload-tips").text(files[0].name);
//						dialog.render({lang:"uploadcomplete"});
//					},
//					"onFileUploaded":function(response,file){
//						if(response.result._id){
//							self.fileId=response.result._id;
//						}
//					}
//				}
//			})
//		},
		_renderWindow:function(){
			this.window=new Window({
				container:"body",
				title:locale.get({lang:"import_model"}),
				top:"center",
				left:"center",
				height:450,
				width:800,
				drag:false,
				mask:true,
				content:"<div id='model-import-content'></div>",
				events:{
					"onClose":function(){
//						this._deleteFile(this.fileId);
					},
					scope:this
				}
			});
			this.window.show();
		},
//		_deleteFile:function(fileId){
//			var self=this;
//			if(fileId!="undefined"){
//				cloud.Ajax.request({
//					url:"api/file/"+fileId,
//					type:"DELETE",
//					success:function(data){
//						alert("删除成功！");
//					},
//					error:function(error){
//						alert(error);
//					}
//				})
//			}
//		},
		_renderButtons:function(){
			var self=this;
			this.submitBtn=new Button({
				container:self.content.find(".batch-import-buttonset-bottom"),
				text:locale.get("submit"),
				lang:"{title:submit,text:submit}",
				events:{
					click:function(){
						var validateOk=validator.result("#batch-import-wrapper");
						if(validateOk){
							self.submit();
						}
					}
				}
			});
			this.cancelBtn=new Button({
				container:self.content.find(".batch-import-buttonset-bottom"),
				text:locale.get("cancel"),
				lang:"{title:cancle,text:cancel}",
				events:{
					click:function(){
						self.window.destroy();					
					}
				}
			});
		},
		clearUpload:function(){
			this.content.find("#batch-import-upload-tips").empty();
			this.fileId=null;
		},
		initXmlImportResult:function(){
			var self=this;
			var buttons={};
			buttons[locale.get("affirm")]=function(){				
			};
			this.ImportResultDialog=$("#import-device-result").dialog({
				title:locale.get("prompt"),
				autoOpen:false,
				height:250,
				minHeight:250,
				maxHeight:250,
				minWidth:400,
				maxWidth:400,
				width:400,
				modal:true,
				draggable:false,
				resizable:false,
				close:function(){
				},
				appendTo:"#model-import-content"
			});
			locale.render({element:$("#batch-import-device-result")});
		},
		_renderSensorType:function(){
			var sensorTypeEl=$("#select-sensorType");
            var sensorTypes = CONFIG.modelSensorTypes;
            $A(sensorTypes).each(function(sensorType){
                var option = $("<option>").val(sensorType.id).html(locale.get(sensorType.name));
//                if (sensorType.id == 0){
//                    self.inRouterOpt = option;
//                    option.appendTo(sensorTypeEl);
//                }else {
//                    option.appendTo(sensorTypeEl);
//                }
                option.appendTo(sensorTypeEl);
            });
		},
		submit:function(){
        	var self = this;       	
        	var model = {};
        	model.model=this.getModelName();
        	var choice=$("#select-sensorType option:selected").val();
        	if(choice=="0"){
        		model.gateway=true;
        	}
        	else{
        		model.gateway=false;
        	}
        	model.sensorType=choice;
        	model.configFile=this.configFile;
        	model.system=false;
//            device.timeout = this.getTimeout();
//			device.ackTimeout = this.getAckTimeout();
//			device.ackRetries = this.getAckRetries();
//			device.sync = this.getSync();
        	if (this.configFile!==null){
//        		self.disable();
        		cloud.util.mask($("#ui-window-content"));
        		cloud.Ajax.request({
                    url: "api/models/",
                    type:"post",
                    data : {
                    	name:model.model,
                    	gateway:model.gateway,
                    	configFile:model.configFile,
                    	system:model.system,
                    	sensorType:model.sensorType
                    },
                    success: function(data) {
//                        console.log(arguments, "batch_add_result");
                        cloud.util.unmask($("#ui-window-content"));
//                    	self.enable();
                        self.showImportResult(data);                       
//                        self.clearUpload();
                        self.fire("onXmlImportSuc");
                        self._clearAllField();
                    }.bind(this),
                    error : function(error){
                    	if(error.error_code!==21336){
                    		self.showImportResult(error);
                        	cloud.util.unmask($("#ui-window-content"));
                    	}
                    	else{                    		
                    		cloud.util.mask($("#ui-window-body"));
                    	}
//                    	self.enable();
//                    	self.clearUpload();
                    	self._clearAllField();
                    }
                });
        	}        	
        	else {
        		self._clearFileField();
        		dialog.render({
        			lang : "please_select_xml_file"
        		})
        	}
		},
		showImportResult:function(data){
			var slef=this;
			var resultArr;
			if(data.result){
				resultArr=data.result;
			}
			else{
				resultArr=data;
			}
			if(this.ImportResultDialog){
				var listContent=$("#batch-import-device-result-list").empty();
				if(resultArr.error){
					$("#batch-import-device-result-sucorfailed").text(locale.get("import_failed"));
					$(".failed-details").text(locale.get("failed_details+:"));
					$("<li>").addClass("batch-import-device-result-row").text(locale.get(resultArr.error_code,resultArr.params)).appendTo(listContent);
					cloud.util.unmask($("#ui-window-body"));
					this.ImportResultDialog.dialog("open");				
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
			this.content=$("#model-import-content");
			this.content.html(template);
			this._renderCss();
			var options=this.content.find("#gateway-choose option");
			options.eq(0).text(locale.get("yesText"));
			options.eq(1).text(locale.get("noText"));
			this.content.find("#file_button").text(locale.get("choose_file"));
		},
		//兼容ie9
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
				"margin-top":"50px"
			});
			$("#device-site-batch-import-qtip .cloud-bubble-hide").css({
				"display":"none"
			});
			$("#device-batch-import").css({
				"background-color":"#F5F6F9",
				"text-align":"center"
			});
			$("#device-batch-import-form-content").css({
				"display":"inline-block",
				"text-align":"left"
			});
			$("#import-xmlfile").css({
				"cursor":"pointer"
			});
			$(".model-name-div").css({
				"margin":"13px auto"
			});
			$(".import-xmlfile-div .cloud-button").css({
				"margin-right":"15px"
			});
		},
		_fileReader:function(){
			var self=this;
			$("#import-xmlfile").live("change",function(evt){
				var f=evt.target.files[0];
				self.file=f;
				$("#file_name").val(f.name);
				var reader= new FileReader();
				reader.onload=function(){
					self.configFile=reader.result;
				}
//				reader.onload=(function(theFile){
//					return function(e){
//						var cnt=0;
//						for(var i=0;i<e.target.result.length;i++){
//							if(e.target.result[i]==","){
//								cnt++;
//								continue;
//							}
//							if(cnt==1&&e.target.result[i]=="/"){
//								break;
//							}
//						}						
//						var str=e.target.result.slice(i+1);
//						var str=reader.result;
//						self.configFile=self.uft8to16(self.base64decode(str));							
//					}
//				})(f);
//					reader.readAsDataURL(f);
//				if(navigator.userAgent.indexOf("MSIE")>0){
//					alert(f.type);
//					if(f.type==""){
//						reader.readAsText(f);
//					}
//					else{
//						self.configFile=null;
//					}	
//				}
//				else{
					if(f.type.match("text/xml")){
						reader.readAsText(f);
//						reader.readAsDataURL(f);
					}
					else{
						self.configFile=null;
					}	
//				}							
			})
		},
		getModelName:function(){
			return $("#input-model-name").val();
		},
		_clearAllField:function(){
			$("#import-xmlfile").remove();
			$("#file_name").after("<input type='file' id='import-xmlfile' name='import_xmlfile' accept='text/xml' style='display:none'/>");
			this.configFile=null;
			$("#file_name").val("");
			$("#input-model-name").val("");
			$("#gateway-choose").val("1");
		},
		_clearFileField:function(){
			$("#import-xmlfile").remove();
			$("#file_name").after("<input type='file' id='import-xmlfile' name='import_xmlfile' accept='text/xml' style='display:none'/>");
			$("#file_name").val("");
			this.configFile=null;
		},
		base64decode:function(str) {
			var base64DecodeChars = new Array(
			 -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
			52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
			-1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
			15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
			-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
			41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
		       var c1, c2, c3, c4;
		       var i, len, out;
		      len = str.length;
		      i = 0;
		      out = "";
		      while(i < len) {
		      
		      do {
		         c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
		      } while(i < len && c1 == -1);
		     if(c1 == -1)
		          break;
		      
		      do {
		          c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
		       } while(i < len && c2 == -1);
		      if(c2 == -1)
		          break;
		      out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
		      
		       do {
		          c3 = str.charCodeAt(i++) & 0xff;
		          if(c3 == 61)
		          return out;
		          c3 = base64DecodeChars[c3];
		      } while(i < len && c3 == -1);
		      if(c3 == -1)
		          break;
		      out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
		     
		       do {
		           c4 = str.charCodeAt(i++) & 0xff;
		          if(c4 == 61)
		          return out;
		          c4 = base64DecodeChars[c4];
		      } while(i < len && c4 == -1);
		       if(c4 == -1)
		          break;
		       out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
		      }
		      return out;
		  },
		  uft8to16:function(str) {
		      var out, i, len, c;
		      var char2, char3;
		      out = "";
		      len = str.length;
		      i = 0;
		      while(i < len) {
		      c = str.charCodeAt(i++);
		      switch(c >> 4)
		      { 
		        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
		          // 0xxxxxxx
		          out += str.charAt(i-1);
		          break;
		        case 12: case 13:
		          // 110x xxxx   10xx xxxx
		          char2 = str.charCodeAt(i++);
		          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
		          break;
		        case 14:
		          // 1110 xxxx  10xx xxxx  10xx xxxx
		          char2 = str.charCodeAt(i++);
		          char3 = str.charCodeAt(i++);
		          out += String.fromCharCode(((c & 0x0F) << 12) |
		                         ((char2 & 0x3F) << 6) |
		                         ((char3 & 0x3F) << 0));
		          break;
		      }
		      }
		      return out;
		  },
		destroy:function($super){
			this.window&&this.window.destroy();
			$super();
		}
	});
	return XmlImport;
})