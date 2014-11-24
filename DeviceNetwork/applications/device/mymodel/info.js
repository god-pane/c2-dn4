define(function(require) {
    var cloud = require("cloud/base/cloud");
    var Button = require("cloud/components/button");
    var template = require("text!./info.html");
    var Table = require("cloud/components/table");
    var service = require("cloud/service/service");
    var validator = require("cloud/components/validator");
    require("cloud/lib/plugin/jquery.uploadify");
    var editor = require("./editor");
    
    var getVarType = function (value) {
        var status = null;
        switch(value){
        case 0:
            status = "BIT"//"开关量";
            break;
        case 1:
            status = "WORD"//"整数";
            break;
        case 2:
            status = "DWORD"//"单字节";
            break;
        case 3:
            status = "FLOAT"//"双字节";
            break;
        case 4:
            status = "STRING"//"四字节";
            break;
        case 5:
            status = "BYTE"//"字符串";
            break;
        case 6:
            status = "BYTE_ARRAY"//"浮点数";
            break;
        case 7:
            status = locale.get("ipv4_addr") || "IPV4_Address"//"锁定";
            break;
        case 8:
            status = locale.get("timestamp_s") || "Timestamp(S)"//"锁定";
            break;
        case 9:
            status = locale.get("timestamp_ms") || "Timestamp(ms)"//"锁定";
            break;
        case 10:
            status = locale.get("number") || "number"//"锁定";
            break;
        case 11:
            status = locale.get("percent") || "PERCENT"//"锁定";
            break;
        case 12:
            status = locale.get("time_string") || "Time(String)"//"锁定";
            break;
        case 13:
            status = locale.get("reserved") || "RSERVE"//"锁定";
            break;
        case 14:
            status = locale.get("signed_int") || "Signed Int"//"锁定";
            break;
        case 15:
            status = locale.get("unsigned_int") || "Unsigned Int"//"锁定";
            break;
        case 16:
            status = locale.get("mac_addr") || "MAC address"//"锁定";
            break;
        case 17:
            status = locale.get("ip_port") || "IP+Port"//"锁定";
            break;
        case 18:
            status = locale.get("url_string") || "URL String"//"锁定";
            break;
        default:
            status = locale.get("locked")//"锁定";
            break;
        }
        return status;
    };
    
    var columns = [
	               {
						"title": "变量名称",
						"lang":"{text:var_name}",
                       "dataIndex": "name",
                       "cls": "null",
                       "width": "50%"
                   }/*,{
                       "title": "分组",
                       "dataIndex": "group",
                       "cls": "null",
                       "width": "60%"
                   }*/,
                   {
                       "title": "类型",
                       "lang":"{text:type}",
                       "dataIndex": "type",
                       "width": "50%",
                       render: function (value, type) {
               			if(type === "display"){
               				var status = null;
               				status = getVarType(value);
               				return status;
               			}else{
               				return value;
               			}
               		}
                   },
					{
						"title": "id",
						"dataIndex": "_id",
						"cls": "_id" + " "+"hide"
					}
                  ];
    var InfoModule = Class.create(cloud.Component, {

        initialize: function($super, options) {
            $super(options);
            this.modelId = null;
            this.element.html(template).addClass("model-info");
            this.infoForm = this.element.find(".info-form");
            this._renderCss();
            this.renderButtons();
            this.renderSensorTypes();
            this.renderModels();
            this.renderCloneDialog();
            this._renderTable();
            this.varInfoTmp = null;
            this.initValidate();
//            this.loadDocumentList();
            locale.render({element:this.element});
        },
        //兼容ie9
        _renderCss:function(){
        	$(".info-wrapper").css({
        		"width":"200px",
        		"margin":"0 auto"
        	});
        	$(".info-header").css({
        		"margin-top":"10px"
        	});
        	$(".info-header #info-name").css({
        		"margin":"0px 5px",
        		"float":"left",
        		"width":"110px"
        	});
        	$(".info-header .info-favor").css({
        		"margin-left":"9px",
        		"float":"left",
        		"margin-bottom":"10px"
        	});
        	$(".info-form-row").css({
        		"margin":"8px 0"
        	});
        	$("#info-model-form .info-form-label").css({
        		"margin-right":"5px",
        		"display":"inline-block",
        		"width":"73px"
        	});
        	$(".info-form-input").css({
        		"float":"left",
        		"width":"110px",
        		"height":"20px"
        	});
        	$(".update-button").css({
        		"float":"left",
        		"width":"50px",
        		"height":"10px"
        	});
        	$(".info-form-vars-table").css({
        		"display":"inline-block",
        		"margin-top":"5px",
        		"height":"auto"
        	});
        	$(".info-map").css({
        		"width":"100%",
        		"height":"120px",
        		"margin":"10px 0",
        		"border":"1px solid silver"
        	});
        	$(".info-buttonset").css({
        		"margin":"10px 0 0 10px",
        		"display":"inline-block"
        	});
        	$(".info-form-document").css({
        		"float":"left",
        		"margin-right":"10px",
        		"width":"120px"
        	});
        	$(".info-button").css({
        		"float":"left"
        	});
        	$(".info-form-pic").css({
        		"width":"190px",
        		"height":"70px",
        		"border":"1px solid #ccc"
        	});
        	$(".info-model-var-info-title").css({
        		"background-color":"rgb(231,231,231)",
        		"height":"25px",
        		"line-height":"25px"
        	});
        	$(".info-model-var-info").css({
        		"border":"1px solid rgb(194,194,194)"
        	});
        	$(".info-model-var-info-content-row").css({
        		"margin":"5px 0px 5px 10px"
        	});
        	$(".info-model-var-info-title").css({
        		"padding-left":"10px"
        	});
        	$("#info-model-vars-table").css({
        		"max-height":"300px",
        		"overflow-y":"auto"
        	});
        	$(".info-model-var-info-close").css({
        		"float":"right",
        		"margin-top":"-2px"
        	});
        	$(".info-model-var-info-content-row span").css({
        		"word-wrap":"break-word",
        		"margin-left":"14px"
        	});
        },
        empower: function() {
        	var modelConfig = permission.app("_model");
        	return modelConfig.write;
//        	this.element.find("#module-info-tag-edit").hide();
//        	this.element.find("#module-info-tag-copy").hide();
        },
        
        initValidate : function(){
            var self = this;
            validator.render("#info-model-form",{
                    promptPosition:"bottomLeft",
                    scroll: false
            });
            validator.render("#clone-model-form",{
                promptPosition:"bottomLeft",
                scroll: false
            });
        },
        
        renderButtons: function() {
            var self = this;
            this.editButton = new Button({
                container: this.element.find(".info-header"),
                id: "module-info-tag-edit",
                imgCls: "cloud-icon-edit",
                lang:"{title:edit}",
                title: "编辑",
                events: {
                    click: self.enable.bind(this)
                }
            });
            this.editButton.hide();
            
            this.cloneButton = new Button({
                container: this.element.find(".info-header"),
                id: "module-info-tag-copy",
                imgCls: "cloud-icon-copy",//TODO
                title: "克隆",
                lang:"{title:clone}",
                events: {
                    click: function(){
                        if (validator.result("#info-model-form")){
                            this.cloneModelDialog.dialog("open");
                        }
                    },
                    scope : this
                }
            });
            
            this.favorButton = new Button({
                container: this.element.find(".info-header"),
                // id : "div.module-info-tag-favor",
                title: "favor",
                lang:"{title:favor}",
                checkboxCls: "cloud-icon-star",
                checkbox: true,
                events: {
                    click: self.submitFavor.bind(self)
                }
            });
            
            /*this.exportFile = function(){
            	var fileid = $("#fileid").val();
            	var href = "http://localhost/api/file/" + fileid + "?access_token=";
            	cloud.util.ensureToken(function(){window.open (href + cloud.Ajax.getAccessToken());});
            };
            
            this.exportButton = new Button({
                container: this.element.find(".info-favor"),
                id: "module-info-tag-export",
                imgCls: "cloud-icon-daochu",
                title: "导出",
                events: {
                    click: self.exportFile.bind(this)
                }
            });
            this.exportButton.hide();*/
            
            this.submitButton = new Button({
                container: this.element.find(".info-buttonset"),
                id: "module-info-tag-submit",
                imgCls: "cloud-icon-yes",
                text: "提交",
                lang:"{title:submit,text:submit}",
                events: {
                    click: function(){
                        if(validator.result("#info-model-form")){
                            self.submit();
                        }
                    }
                }
            });
            this.submitButton.hide();

            this.cancelButton = new Button({
                container: this.element.find(".info-buttonset"),
                id: "module-info-tag-cancel",
                imgCls: "cloud-icon-no",
                text: "取消",
                lang:"{title:cancel,text:cancel}",
                events: {
                    click: self.cancelEdit.bind(this)
                }
            });
            this.cancelButton.hide();
            
//            this.cloneButton.hide();
            
            /*this.exportDocument = function(){
            	var documentId = $("#info-document").val();
            	if(!!documentId){
            		var href = "http://localhost/api/file/" + documentId + "?access_token=";
            		cloud.util.ensureToken(function(){window.open(href + cloud.Ajax.getAccessToken());});
            	}
            };
            
            this.documentDownloadButton = new Button({
                container: this.element.find("#info-button"),
                id: "info-document-download",
                imgCls: "cloud-icon-download",
                text: "",
                events: {
                    click: self.exportDocument.bind(this)
                }
            });*/
            /*
            this.enterDocumentButton = new Button({
                container: this.element.find("#info-button"),
                id: "info-enter-document",
                imgCls: "cloud-icon-watch",
                text: "",
                events: {
                    click: function(){
//                    	alert("enterDocumentButton");
                    }
                }
            });*/
            
            this.editVar = new Button({
                container: this.element.find(".info-model-edit-var"),
                text: "编辑变量",
                lang:"{title:edit_var,text:edit_var}",
                events: {
                    click: function(){
                        //TODO
                        if (this.modelInfo){
                            var json = this.varInfoTmp;
                            if(this.editor){
                                this.editor.destroy();
//                                json = this.editor.getJson();
                            };
                            this.editor = new editor({
                                json:json,
                                events : {
                                    "editorClose" : function(jsonObj, isChange){
                                //        console.log(json, "after edit")
                                        if (isChange) {
                                            this.varInfoTmp = jsonObj;
                                            this.setVarTable(jsonObj);
                                        }                                          
                                    },
                                    scope : this
                                }
                            })
                        }
                    },
                    scope :this
                }
            });
            this.editVar.hide();
            
            this.closeVarInfo = new Button({
                container: this.element.find(".info-model-var-info-close"),
                imgCls: "cloud-icon-no",
                events: {
                    click: function(){
//                      alert("enterDocumentButton");
                        this.element.find("#info-model-var-info-name").text("");
                        this.element.find("#info-model-var-info-unit").text("");
                        this.element.find("#info-model-var-info-desc").text("");
                        this.element.find("#info-model-var-info-vtype").text("");
                        this.element.find("#info-model-var-info").hide(250, "linear");
                    },
                    scope : this
                }
            });
        },
        
        
        submitFavor: function() {
            var self = this;
            if (this.favorButton.isSelected()) {
                this.addFavorite();
            } else {
                this.removeFavorite();
            }
        },

        addFavorite : function(){
            var self = this;
            if(this.modelId){
                service.addFavorites(this.modelId, function(data) {
                    if (data.result == "ok"){
                        self.fire("afterInfoUpdated", self.modelId);
                    }
                },function(error){
                	dialog.render({lang:error.error_code});
                	self.favorButton.unSelect();
                }, this);
            }
        },
        
        removeFavorite : function(){
            var self = this;
            if(this.modelId){
                service.removeFavorites(this.modelId, function(data) {
                    if (data.result.id){
                        self.fire("afterInfoUpdated", self.modelId);
                    }
                },function(error){
                	dialog.render({lang:error.error_code});
                	self.favorButton.select();
                }, this);
            }
        },
        
        
        
        doCloneModel : function(){
            var self = this;
//            self.mask();
            var newName = $(this.cloneModelDialog).find("#clone-model-name").val();
            var model = {}
            model.name = newName;
            model.model = newName;
            model.sensorType= this.getSensorType();
            model.ioType = this.getIoType();
            model.plcTypeId = this.getPlcTypeId();
            
            if (this.getSensorType() == "0"){
                model.gateway = true;
            }else {
                model.gateway = false;
            }
            
            if (this.varInfoTmp){
                model.varInfo = this.varInfoTmp;
            }else {
                dialog.render({lang : "please_input_vars"})
                return;
            };
            
            cloud.Ajax.request({
                url: "api/models/",
                type: "post",
                data: {
                    name: model.name,
//                    model:model.model,
                    gateway : model.gateway,
                    sensorType:model.sensorType,
                    ioType : model.ioType,
                    plcTypeId : model.plcTypeId,
                    varInfo : model.varInfo
                },
                success: function(data) {
//                    alert("保存成功");
//                    self.unmask();
                    self.cloneModelDialog && self.cloneModelDialog.dialog("close");
                    self.fire("afterInfoCreated", data.result._id);
                    self.render(data.result._id);
                    self.disable();
                },
                error : function(err) {
//                  console.log(err, "err")
//                    self.unmask();
                      if (err.error_code == "21322") {
                          dialog.render({lang : "model_already_exist"});
                      }
                }
            });
        },
        
        renderCloneDialog : function(){
            var self = this;
            var buttons = {};
            buttons[locale.get("affirm")] = function(){
                if (validator.result("#clone-model-form")){
                    $( this ).dialog( "close" );
                    self.doCloneModel();
                }
            }
                
            buttons[locale.get("cancel")] = function(){
                $( this ).dialog( "close" );
            };
            $("#clone-model-form").keypress(function(event){
            	if(event.keyCode==13){
                    $( this ).dialog( "close" );
                    self.doCloneModel();
                    return false;
            	}
            });
            this.cloneModelDialog = $("#clone-model-form").dialog({
                autoOpen: false,
                height: 180,
                width: 300,
                title : locale.get("save_as"),
                modal: true,
                resizable: false,
                buttons: buttons,
                close : function(){
                    
                },
                open : function(){
                    $(this).find("#clone-model-name").val("");
                }
//                appendTo : "#" + this.id
            });
            locale.render({element:$("#clone-model-form")});
        },

        renderSensorTypes : function() {
            var self = this;
            var sensorTypeEl = this.element.find("#info-device-sensorType");
            this.sensorTypeEl = sensorTypeEl;
            var gatewayModelRow = this.element.find(".info-device-model-gateway");
            var userModelRow = this.element.find(".info-device-model-user");
            var sensorTypes = CONFIG.modelSensorTypes;
            $A(sensorTypes).each(function(sensorType){
                var option = $("<option>").val(sensorType.id).html(locale.get(sensorType.name));
                if (sensorType.id == 0){
                    self.inRouterOpt = option;
                    option.appendTo(sensorTypeEl);
                }else {
                    option.appendTo(sensorTypeEl);
                }
            });
            sensorTypeEl.on("change", function(){
                if ($(this).val() == "0"){
                    userModelRow.hide();
                    gatewayModelRow.show();
                }else {
                    gatewayModelRow.hide();
                    userModelRow.show();
//                    self.element.find("#info-device-model").val("");
                }
            })
        },

        renderModels: function() {
            var gatewayModel = CONFIG.gatewayModel;
            var gatewayModelEl = this.element.find("#info-device-model-gateway");
//             var userModelEl = this.element.find("#info-device-model");
            this.gatewayModelEl = gatewayModelEl;
//             this.userModelEl = userModelEl;
            gatewayModel.each(function(gateway){
                $("<option>").val(gateway.key).html(gateway.key).appendTo(gatewayModelEl);
            })
        },
        
        setSensorType : function(sensorType){
            this.sensorTypeEl.val(sensorType).trigger("change");
        },
        
        getSensorType : function(){
            return this.sensorTypeEl.val();
        },
        
        setModel: function(model){
            if (this.getSensorType() == "0"){
                this.setGatewayModel(model);
//                 this.setUserModel("");
					this.setmodelName("");
            }else {
//                 this.setUserModel(model);
					this.setmodelName(model);
            }
        },
        
        getModel : function(){
            if (this.getSensorType() == "0"){
                return this.getGatewayModel();
            }else {
//                 return this.getUserModel();
					return this.getmodelName();
            }
        },
        
        setGatewayModel : function(model){
            this.gatewayModelEl.val(model);
        },
        
        getGatewayModel : function(){
            return this.gatewayModelEl.val();
        },
        
//         setUserModel : function(model){
//             this.userModelEl.val(model);
//         },
        
//         getUserModel : function(){
//             return this.userModelEl.val();
//         },

        render: function(id) {
            this.modelId = id;
            if (this.modelId) {
                this.mask();
                this.loadmodelInfo();
                this.cloneButton.show();
//                this.favorButton.show();
                this.favorButton.hide();
            } else {
                this.clear();
                this.enable();
                this.cloneButton.hide();
                this.favorButton.hide();
            }
        },
        
        setVarTable : function(varInfo){
            var self = this;
            this.varCountEl = $("#info-model-vars-count");
            if(!!this.modelTable){
                this.modelTable.clearTableData();
            };
            if(!!varInfo){
                try {
                    var varCount = 0;
                    varInfo.each(function(varGroup){
                        /*var groupName = varGroup.name;
                        varGroup.vars.each(function(varObj){
                            varObj.group = groupName;
                        });*/
                        self.modelTable.add(varGroup.vars);
                        varCount = varCount + varGroup.vars.length;
                    });
                    this.varCountEl.text(locale.get("total_vars", [varCount]));
                    
                    this.varInfoTmp = varInfo;
//                    this.modelTable.add(varInfo[0].vars);
                   /* if(varInfo[0].vars.length == 0){
                        this.varCountEl.text("0");
                    }else{
                        this.varCountEl.text(varInfo[0].vars.length);
                    };*/
                } catch (e) {
                    this.varInfoTmp = null;
                    dialog.render({lang : "json_wrong"});
                }
            }else{
                this.varCountEl.text(locale.get("total_vars", [0]));
            };
            this.closeVarInfo && this.closeVarInfo.fire("click")
        },

        setModelInfo: function(data) {
            if (data.result) {
                data = data.result;
            }
            this.renderByIsGateway(data);
            this.modelInfo = data;
            this.setmodelName(data.name);
//            $("#info-device-model option[value='" + data.model + "']").attr("selected", "selected");
//            $("#info-device-sensorType option[value='" + data.sensorType + "']").attr("selected", "selected");
            this.setSensorType(data.sensorType);
//             this.setModel(data.model);
            this.setIoType(data.ioType);
            this.setPlcTypeId(data.plcTypeId);
            this.varInfoTmp = data.varInfo;
            this.setVarTable(data.varInfo);
            
            if(this.modelId == null){
                this.favorButton.setSelect(false);
            }else{
                this.favorButton.setSelect(data.isMyFavorite == 1);
            }
        },
        
        renderVarDesc : function(varData){
            
            if (varData) {
                this.element.find("#info-model-var-info").show(250, "linear");
                this.element.find("#info-model-var-info-name").text(varData.name);
                this.element.find("#info-model-var-info-unit").text(varData.unit);
                this.element.find("#info-model-var-info-desc").text(varData.desc);
                this.element.find("#info-model-var-info-vtype").text(getVarType(varData.type));
            }else{
                this.element.find("#info-model-var-info-name").text("");
                this.element.find("#info-model-var-info-unit").text("");
                this.element.find("#info-model-var-info-desc").text("");
                this.element.find("#info-model-var-info-vtype").text("");
            }
        },

        clear: function(){
            this.modelId = null;
            this.modelInfo = null;
            this.varInfoTmp = null;
            this.setModelInfo({
                name: "",
                model: "",
                sensorType:"0"
            });
            this.closeVarInfo && this.closeVarInfo.fire("click");
        },
        
        _renderTable:function(){
			this.modelTable = new Table({
//				businessType:this.businessType,
				selector: this.element.find("#info-model-vars-table"),
				columns: columns,
				datas: [],
                pageSize: 100,
                autoWidth: false,
                pageToolBar: false,
                events: {
                    onRowClick: function(data) {
//                        console.log(data, "var data");
                        this.renderVarDesc(data);
                    },
                    scope: this
                }
			});
		},
        
        setmodelName: function(name) {
            this.element.find("#info-name").val(name);
        },

        getmodelName: function() {
            return this.element.find("#info-name").val();
        },
        
        setIoType : function(ioType){
            this.element.find("#info-device-iotype").val(ioType);
        },
        
        getIoType : function(){
            return this.element.find("#info-device-iotype").val();
        },
        
        setPlcTypeId : function(plcTypeId){
            this.element.find("#info-device-plctypeid").val(plcTypeId);
        },
        
        getPlcTypeId : function(){
            return this.element.find("#info-device-plctypeid").val();
        },

        loadmodelInfo: function() {
            cloud.Ajax.request({
                url: "api/models/" + this.modelId,
                parameters: {
                    verbose: 100
                },
                type: "get",
                success: function(data) {
//                    this.renderByIsGateway(data.result);
                    this.setModelInfo(data.result);
//                    $("#fileid").val("").val(data.result.configFileId);
                    this.disable();
                    this.unmask();
                    if(!this.empower()) {
                    	this.editButton.hide();
                    	this.cloneButton.hide();
                    }
//                    this.editButton.hide();
//                	this.cloneButton.hide();
                }.bind(this)
            });
        },
        
        renderByIsGateway : function(data){
            if (data && data.system){
            	//.attr("disabled", "disabled")
                this.inRouterOpt.appendTo(this.sensorTypeEl);
                this.cloneButton.hide();
            }else {
//                this.inRouterOpt.remove();//屏蔽添加网关入口
                this.cloneButton.show();
            }
        },

        enable: function() {
            this.editButton.hide();
            this.cloneButton.hide();
            this.submitButton.show();
            this.cancelButton.show();
            this.editVar.show();
            // this.deleteButton.
            this.infoForm.find("input, select").removeAttr("disabled");
            this.element.find("#info-name").removeAttr("disabled");
            if (this.modelId){
                this.element.find("#info-device-sensorType").attr("disabled", true);
                this.element.find("#info-device-plctypeid").attr("disabled", true);
                this.element.find("#info-device-iotype").attr("disabled", true);
            }
            
//            $("#import-file").show();
        },

        disable: function() {
            validator.hideAll();
            
            if (this.modelInfo && this.modelInfo.system == true){
                this.editButton.hide();
            }else{
                this.editButton.show();
            }
            
            this.submitButton.hide();
            this.cancelButton.hide();
            this.editVar.hide();
            this.infoForm.find("input, select").attr("disabled", true);
            this.element.find("#info-name").attr("disabled", true);
//            $("#import-file").hide();
        },

        cancelEdit: function() {
            if (this.modelId) {
                this.loadmodelInfo();
            } else {
                this.fire("cancelCreate");
            }
            validator.hideAll();
            this.disable();
        },
        
        submit: function() {

            var model = {}, self = this;
            model.model = this.getmodelName();//this.element.find("#info-name").val();
//             model.model = this.getModel();
            model.sensorType= this.getSensorType();
            model.ioType = this.getIoType();
            model.plcTypeId = this.getPlcTypeId();
            model.system=false;
            if (this.getSensorType() == "0"){
                model.gateway = true;
            }else {
                model.gateway = false;
            }
            
            if (this.varInfoTmp){
                model.varInfo = this.varInfoTmp;
            }else {
            	model.varInfo=[];
//                dialog.render({lang : "please_input_vars"})
//                return;
            };
            //TODO validate form

            if (this.modelId == null) {
                cloud.Ajax.request({
                    url: "api/models/",
                    type: "post",
                    data: {
                        name:model.model,
//						model:model.model,
                        gateway : model.gateway,
                        sensorType:model.sensorType,
                        ioType : model.ioType,
                        plcTypeId : model.plcTypeId,
                        varInfo : model.varInfo,
                        system:model.system
                    },
                    success: function(data) {
//                        alert("保存成功");
                        self.fire("afterInfoCreated", data.result._id);
                        self.render(data.result._id);
//                        self.disable();
                    },
                    error : function(err) {
//                        console.log(err, "err")
                        if (err.error_code == "20007"||err.error_code=="21322") {
                            dialog.render({lang : "model_already_exist"});
                        }
                        else if(err.error_code=="100027"){
                        	dialog.render({
                        		text:locale.get(err.error_code,err.params)
                        	});
                        }
                    }
                });
            } else {
                cloud.Ajax.request({
                    url: "api/models/" + this.modelId,
                    type: "put",
                    data: {
                        name: model.model,
                        sensorType:model.sensorType,
                        ioType : model.ioType,
                        plcTypeId : model.plcTypeId,
                        varInfo : model.varInfo
                    },
                    success: function(data) {
//                        alert("修改成功");
                        self.fire("afterInfoUpdated", data.result._id);
                        self.render(data.result._id);
                        dialog.render({text:locale.get("modify_successful+!")});
//                        self.disable();
                    }
                    ,
                    error:function(err){
                    	if(err.error_code=="100027"){
                        	dialog.render({
                        		text:locale.get(err.error_code,err.params)
                        	});
                        }
                    	else if (err.error_code == "20007"||err.error_code=="21322") {
                            dialog.render({lang : "model_already_exist"});
                        }
                    }
                });
            }
        },

        renderMap: function() {
        },

        destroy: function() {
            this.editButton.destroy();
            this.submitButton.destroy();
            this.cancelButton.destroy();
            this.cloneModelDialog.dialog("destroy");
            this.editor && this.editor.destroy();
            //一系列的清除动作
        }

    });
    return InfoModule;
});