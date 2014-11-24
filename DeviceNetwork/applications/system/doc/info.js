define(function(require) {
    require("cloud/base/cloud");
    var Button = require("cloud/components/button");
    var template = require("text!./info.html");
    var service = require("cloud/service/service");
    var validator = require("cloud/components/validator");
    require("cloud/lib/plugin/jquery.uploadify");
    var InfoModule = Class.create(cloud.Component, {

        initialize: function($super, options) {
            $super(options);
            this.documentId = null;
            this.element.html(template).addClass("document-info");
            this.infoForm = this.element.find(".info-form");
            this.md5 = null;
            this.renderMap();
            this.renderUploadify();
            this.renderButtons();
            this.renderdocuments();
            this.renderDocumentBelongOptions();
            validator.render("#doc-info-form",{
            	promptPosition:"topLeft",
            	scroll: false
			  });
        },
        
        renderUploadify: function() {
            var self = this;
            self.fileName = "document-" + new Date().getTime();
            self.inputFileName = this.inputFileName;
            self.uploadify = this.element.find("#document-info-file").uploadify({
                swf: require.toUrl('cloud/resources/flashs/uploadify.swf'),
                //auto: false,
                buttonClass: "cloud-upload-button",
                buttonText: "浏览",
                height: 20,
                method: "post",
                removeCompleted: false,
                width: 40,
                multi: false,
                uploader: cloud.config.FILE_SERVER_URL + "/api/file?access_token=" + cloud.Ajax.getAccessToken() + "&file_name=" + self.fileName,
                onUploadSuccess: function(file, data, response){
                    var result = data.evalJSON();
                    if(result.error){
//                        alert(result.error);
                    }else{
                        result = result.result;
                        self.md5 = result.md5;
                        self.uploadedFileID=result._id;
                    }
                }
            });
        },
        
        renderButtons: function() {
            var self = this;

            this.editButton = new Button({
                container: this.element.find(".info-buttonset"),
                id: "module-info-tag-edit",
                imgCls: "cloud-icon-edit",
                text: "编辑",
                events: {
                    click: self.enable.bind(this)
                }
            });
            
            this.deleteButton = new Button({
                container: this.element.find(".info-buttonset"),
                id: "module-info-tag-delete",
                imgCls: "cloud-icon-delete",
                text: "删除",
                events: {
                    click: function(){
                    	var alertItem = $("<p id = \"alertText\">").text("确认删除？");
                    	alertItem.dialog({
                    		title : "提示",
                    		modal:true,
                    		minHeight : 120,
                    		buttons:{
                    			"yes" : function(){
                    				self["delete"].call(self);
                    				$(this).dialog( "close" );
                    			},
                    			"no" : function(){
                    				$(this).dialog( "close" );
                    			}
                    		},
                    		close : function(){
                    			$( this ).dialog( "destroy" );
        						alertItem.remove();
                    		}
                    	});
                    }//self.deleteFile.bind(this)
                }
            });
            
            this.downloadButton = new Button({
                container: this.element.find(".info-buttonset"),
                id: "module-info-tag-download",
                imgCls: "cloud-icon-download",
                text: "下载",
                events: {
                    click: self.downloadFile.bind(this)
                }
            });

            this.submitButton = new Button({
                container: this.element.find(".info-buttonset"),
                id: "module-info-tag-submit",
                imgCls: "cloud-icon-yes",
                text: "提交",
                events: {
                    click: function() {
		            	if(validator.result()){
		    				self.submit();
		    			}
                    }.bind(this)
                }
            });

            this.cancelButton = new Button({
                container: this.element.find(".info-buttonset"),
                id: "module-info-tag-cancel",
                imgCls: "cloud-icon-no",
                text: "取消",
                events: {
                    click: self.cancelEdit.bind(this)
                }
            });
        },

        renderdocuments: function() {
            this.loaddocuments(function(documents) {
                var $select = this.element.find("#info-document-document");
                documents.each(function(document) {
                    $("<option>").val(document._id).text(document.name).appendTo($select);
                }, this);
            });
        },
        
        renderDocumentBelongOptions : function(){
        	var self = this;
        	cloud.Ajax.request({
        		url:"api/models",
        		type:"get",
        		parameters:{
        			verbose: 1
        		},
        		success:function(datas){
        			var $select = self.element.find("#info-document-belong");
        			var results = datas.result;
        			results.each(function(result){
        				$("<option>").val(result._id).text(result.name).appendTo($select);
        			});
        		}
        	});
        },

        render: function(id) {
            this.documentId = id;
            if (this.documentId) {
                this.mask();
                this.loaddocumentInfo();
            } else {
                this.clear();
                this.enable();
            }
        },

        setdocumentInfo: function(data) {
            if (data.result) {
                data = data.result;
            }
            this.element.find("#info-name").val(data.name);
            this.element.find("#info-document-type").val(data.type);            
            this.element.find("#info-document-belong").val(data.belong);
            this.fileId = data._id;
            this.uploadedFileID = data.chunkId;
        },

        clear: function(){
            this.documentId = null;
            this.setdocumentInfo({
                name: "",
                type: "",
                belong:""
            });

        },

        setdocumentModel: function(id) {
            this.element.find("#info-model option").each(function() {
                var option = $(this);
                if (option.val() == id) {
                    option.attr("selected", true);
                } else {
                    option.removeAttr("selected");
                }
            });
        },

        getdocumentModel: function() {
          
        },

        setdocumentName: function(name) {
           
        },

        getdocumentName: function() {
           
        },

        setBusinessState: function(status) {
            
        },

        getBusinessState: function() {
            
        },

        loaddocumentInfo: function() {
            cloud.Ajax.request({
                url: "api/documents/" + this.documentId,
                parameters: {
                    verbose: 100
                },
                type: "get",
                success: function(data) {
                	this.documentInfo=data.result;
                    this.setdocumentInfo(data.result);
                    this.disable();
                    this.unmask();
                }.bind(this)
            });
        },

        loaddocuments: function(callback) {

        },

        enable: function() {
            this.editButton.hide();
            this.deleteButton.hide();
            this.downloadButton.hide();
            this.submitButton.show();
            this.cancelButton.show();
            // this.deleteButton.
            this.infoForm.find("input, select").removeAttr("disabled");
            this.element.find("#info-name").removeAttr("disabled");
        },

        disable: function() {
            this.editButton.show();
            this.deleteButton.show();
            this.downloadButton.show();
            this.submitButton.hide();
            this.cancelButton.hide();

            this.infoForm.find("input, select").attr("disabled", true);
            this.element.find("#info-name").attr("disabled", true);
        },

        cancelEdit: function() {
            if (this.documentId) {
                this.loaddocumentInfo();
            } else {
               this.fire("cancelCreate");
               this.clear();
            }
            this.disable();
        },
        
        downloadFile : function(){
        	var self = this;
        	var chunkId = self.uploadedFileID;
        	
//        	cloud.Ajax.request({
//        		url : "api/file/"+self.uploadedFileID,
//        		type : "get",
//        		contentType : "application/octet-stream ; charset=UTF-8",
//        		success:function(data){
//        			alert(data);
//        		}
//        	});
        	
        },
        
        "delete" : function(){
        	this.disable();
            this.fire("afterInfoDeleted", this.documentInfo);
        },

        submit: function() {
        	var self = this;
            if(self.md5 === null && self.uploadedFileID === null){
//                alert("Import the file,please!");
                return;
            }

            var document = {}, self = this;
            document.name = this.element.find("#info-name").val();
            document.type= this.element.find("#info-document-type").val();
            document.belong = this.element.find("#info-document-belong").val();
            document.chunkId=this.uploadedFileID;
            
            self.url="api/documents?"+document.name;
            self.type="post";
            self.fireMed="afterInfoCreated";
            
            if (document.name.trim() == "") {
//                alert("document's name can't be empty！");
                return;
            }
            if(document.type==""){
//                alert("document's type can't be empty！");
                return;
            }
            if(document.belong==""){
//                alert("document's belong can't be empty！");
                return;
            }
            if(this.fileId != null){
            	self.url = "api/documents/"+this.fileId;
            	self.type = "PUT";
            	self.fireMed = "afterInfoUpdated";
            }

            cloud.Ajax.request({
                url: self.url,
                type: self.type,
                data: {
                    name: document.name,
                    type: document.type,
                    belong: document.belong,
                    chunkId: document.chunkId
                },
                success: function(data) {
//                    alert("保存成功");
                    self.fire(self.fireMed, data.result._id);
                    self.disable();
                }
            });
        },
        submitFavor: function() {

            /*if (this.favorButton.isSelected()) {
                service.addFavorites(this.documentId);
            } else {
                service.removeFavorites(this.documentId);

            }*/
        },

        renderMap: function() {

        },

        destroy: function() {
            if(this.uploadify) this.uploadify.uploadify("destroy");
            this.editButton.destroy();
            this.submitButton.destroy();
            this.cancelButton.destroy();
            this.uploadify = null;
            this.element.html(template).removeClass("document-info");
            this.element.html("");
            //一系列的清除动作
        }

    });
    return InfoModule;
});