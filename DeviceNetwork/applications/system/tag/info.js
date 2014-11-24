define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery.dataTables");
	var Toolbar = require("cloud/components/toolbar");
	var Button = require("cloud/components/button");
	var commonService = require("cloud/service/service");
	var Table = require("cloud/components/table");
	var validator = require("cloud/components/validator");
	
    var template = require("text!./info.html");
    
    var sysTags = $A();
    sysTags.push(locale.get({lang:"all_role"}));
    sysTags.push(locale.get({lang:"untagged_role"}));
    sysTags.push(locale.get({lang:"all_user"}));
    sysTags.push(locale.get("untagged_user"));
    sysTags.push(locale.get("organization_manager"));
    sysTags.push(locale.get("device_manager"));
    sysTags.push(locale.get("all_gateway"));
    sysTags.push(locale.get("online_gateway"));
    sysTags.push(locale.get("offline_gateway"));
    sysTags.push(locale.get("all_controller"));
    sysTags.push(locale.get("all_models"));
    sysTags.push(locale.get("gateway_models"));
    sysTags.push(locale.get("not_gateway_models"));
    sysTags.push(locale.get("untagged_models"));
    sysTags.push(locale.get("all_site"));
    sysTags.push(locale.get("untagged_site"));
    sysTags.push(locale.get("online_site"));
    sysTags.push(locale.get("offline_site"));
    
    var InfoModule = Class.create(cloud.Component, {
    
        initialize: function($super, options){
            $super(options);
			this.element.html(template);
            this.tagID = null;
            this.renderModule();
            this.renderTable();
            this.disable();
            this.optBtnArray = $A();
            this.isAdd = true;
            this.initValidate();
            this.permission();
        },
        
        initValidate:function(){
            var self = this;
            validator.render("#module-info-tag-form",{
                    promptPosition:"bottomLeft",
                    scroll: false
            });
        },
        
        render: function(id){
        	this.tagID = id;
            if (!!this.tagID) {
            	this.isAdd = false;
            	this.mask();
                this.loadTagInfo();
                this.loadTagResources();
            } else {//op type is add 
            	this.isAdd = true;
                this.clear();
                this.enable();
                //this.element.find("#module-info-tag-delete").hide();
            }
        },
        
        loadTagInfo: function(){
            cloud.Ajax.request({
                url: "api/tags/" + this.tagID,
                parameters: {
                    verbose: 100
                },
                type: "GET",
                success: function(data){
                	this.tagInfo = data.result;
                    this.updatetagInfo(data.result);
                    this.disable();
                    this.unmask();
                }.bind(this)
            });
        },
        
        permission:function(){
			var self = this;
			if(!(permission.app("_tag"))["write"]){
				self.editBtn.hide();
				self.submitBtn.hide();
				self.deleteBtn.hide();
				self.cancelBtn.hide();
			}
		},
        
        loadTagResources: function(){
            cloud.Ajax.request({
                url: "api/tags/" + this.tagID +"/resources",
                parameters: {
                    verbose: 100
                },
                type: "GET",
                success: function(data){
                	this.setTagResources(data.result);
                	this.setResCount(data.total);
                    //this.updatetagInfo(data.result);
                    //this.disable();
                    //this.unmask();
                }.bind(this)
            });
        },
        
        clear: function(){
            this.setTagName(null);
            this.setResCount();
            this.dataTable.clearTableData();
            this.favorBtn.setSelect(false);
            this.shareBtn.setSelect(false);
        },
        
        setTagName: function(name){
            $("#module-info-tag-name").val(name);
        },
        
        setResCount: function(num){
            if (num) {
                $("#module-info-tag-res-count").text(num);
            } else {
                $("#module-info-tag-res-count").text("0");
            }
        },
        
        setTagResources: function(resultArray){
        	var self = this;
        	self.dataTable.render(resultArray);
            
        },
        
        /**
         * delete resource of tag
         * @param id
         */
        deleteResource:function(id, index){
        	//alert(id+"<br>lack of API");
        	//TODO
        	cloud.Ajax.request({
                url: "api/resource_tags",
                type: "DELETE",
                parameters: {
                	resource_id: id,
                	tag_id: this.tagID
                },
                success: function(data){
                	this.render(this.tagID);
                	this.fire("afterInfoUpdated", this.tagID);//TODO
                	
                	//this.dataTable["delete"](index, this.disable());
                	this.dataTable["delete"](this.dataTable.getRowsByProp("id", id));
                }.bind(this)
            });
        	
        },
        updatetagInfo: function(tagInfo){
        	$("#module-info-tag-name").val(tagInfo.name);
        	this.shareBtn.setSelect(tagInfo.shared);
//        	this.favorBtn.setSelect(tagInfo.isMyFavorite);//TODO to be confirmed
        	this.favorBtn.hide();
        	
        },
        
        disable: function(){
            validator.hideAll();
            $("#module-info-tag-name").attr("disabled", "disabled");
//            $("#module-info-tag-share").show();
            $("#module-info-tag-submit").hide();
            $("#module-info-tag-cancel").hide();
            $("#module-info-tag-edit").show();
            if (this.isAdd){
            	this.element.find(".module-info-tag-item").hide();
            	this.element.find("#module-info-tag-delete").hide();
            }else{
            	this.element.find(".module-info-tag-item").show();
            	this.element.find("#module-info-tag-delete").show();
            }
            
            $("#module-info-tag-default-privilege input:radio").attr("disabled", "disabled");
            $("#module-info-tag-table input:radio").attr("disabled", "disabled");
            
            
        },
        
        enable: function(){
            $("#module-info-tag-name").removeAttr("disabled");
//            $("#module-info-tag-share").hide();
            $("#module-info-tag-submit").show();
            $("#module-info-tag-cancel").show();
            $("#module-info-tag-edit").hide();
            if (this.isAdd){
            	this.element.find(".module-info-tag-item").hide();
//            	this.element.find("#module-info-tag-delete").hide();
            }else{
            	this.element.find(".module-info-tag-item").show();
//            	this.element.find("#module-info-tag-delete").hide();
            }
            this.element.find("#module-info-tag-delete").hide();
            $("#module-info-tag-default-privilege input:radio").removeAttr("disabled");
            $("#module-info-tag-table input:radio").removeAttr("disabled");
            
            /*this.optBtnArray && this.optBtnArray.each(function(btn){
            	btn.enable();
            });*/
        },
        
        cancelEdit: function(){
            validator.hideAll();
            
            if (this.tagID) {
                this.loadTagInfo();
            } else {
                this.fire("cancelCreate");
            }
            
            this.disable();
        },
        
        renderModule: function(){
            var self = this;
        	$(".module-info-tag-label").addClass("cloud-icon-default cloud-icon-label");
        	
        	this.favorBtn = new Button({
        		container : $("div.module-info-tag-item"),
        		id : "module-info-tag-favor",
        		title : locale.get("favor"),
        		checkboxCls: "cloud-icon-star",
        		checkbox : true,
        		events : {
        			click : self.submitFavor.bind(self)
        		}
        	});
        	
        	this.shareBtn = new Button({
        		container : $("div.module-info-tag-item"),
        		id : "module-info-tag-share",
        		title : locale.get("share"),
        		checkboxCls: "cloud-icon-share",
        		checkbox : true,
        		events : {
        			click : self.submitShare.bind(self)
        		}
        	});
        	this.renderButtons();
        	
        },
        submitFavor : function(){
        	if (this.favorBtn.isSelected()){
        		this.addFavorite();
        	}else{
        		this.removeFavorite();
        	}
        },
        
        addFavorite : function(){
        	var self = this;
        	if(this.tagID){
        		commonService.addFavorites(this.tagID, function(data) {
                	if (data.result == "ok"){
                		self.fire("afterInfoUpdated", self.tagID);
                	}
                },function(error){
                	dialog.render({lang:error.error_code});
                	self.favorBtn.unSelect();
                }, this);
        	}
        },
        
        removeFavorite : function(){
        	var self = this;
        	if(this.tagID){
        		commonService.removeFavorites(this.tagID, function(data) {
        			if (data.result.id){
                		self.fire("afterInfoUpdated", self.tagID);
                	}
                },function(error){
                	dialog.render({lang:error.error_code});
                	self.favorBtn.select();
                }, this);
        	}
        },
        
        submitShare : function(){
        	if(this.tagID){
	        	cloud.Ajax.request({
	                url: "api/tags/" + this.tagID,
	                type: "PUT",
	                data: {
	                    shared : this.shareBtn.isSelected()
	                },
	                
	                success: function(){
	                    //this.fire("afterInfoUpdated", this.tagID);//TODO
	                }.bind(this)
	            });
        	}
        },
        
        
        renderTable: function(){
        	var self = this;
        	this.dataTable = new Table({
        		selector : "#module-info-tag-table",
        		datas: [],
                pageSize: 100,
                autoWidth: false,
                pageToolBar: false,
                columns: [{
                    title: locale.get("name1"),
                    width : "40%",
                    dataIndex: "name",
                    render: function(data, type, row){
                    	if ("display" == type && row.type == 3) {
                			if(data === "admin"){
                			    return locale.get({lang:"organization_manager"});
                			}else if(data === "DeviceManager"){
                			    return locale.get({lang:"device_manager"});
                			}else{
                			    return data;
                			}
                    	}else {
                    		return data;
                    	}
                    }
                }, {
                    title: locale.get("type"),
                    dataIndex: "type",
                    width : "25%",
                    render: function(data){
                    	return locale.get(commonService.getResourceType(data).name);
                    }
                }, {
                    title: locale.get("operate"),
                    dataIndex: "_id",
                    width : "35%",
                    type : "define_test",
                    render : function(data){
                    	var opt = new Template("<div id='info-tag-resources-#{id}' class=\"module-info-tag-res-opt \"></div>").evaluate({
                            id: data
                        });//cloud-icon-default cloud-icon-delete
                    	return opt;
                    },
                    afterCellCreated: function(td, ele, data, index){
                    	new Button({
                    		container : $("div", td),
                    		title : locale.get("delete"),
                    		imgCls : "cloud-icon-delete",
                    		events : {
                    			click : function(){
                    				var alertItem = $("<p id = \"alertText\">").text(locale.get("affirm_delete"));
                    				var buttons = {};
                    				buttons[locale.get("yes")] = function(){
            							self.deleteResource.bind(self)(data.id, index);
            							
            							$( this ).dialog( "close" );
            						};
            						buttons[locale.get("cancel")] = function(){
            							$( this ).dialog( "close" );
            						}
                    				
                    				alertItem.dialog({
                    					title : locale.get("prompt"),
                    					modal:true,
                    					minHeight: 120,
                    					buttons: buttons,
                    					close : function(){
                    						$( this ).dialog( "destroy" );
                    						alertItem.remove();
                    					}
                    				});
                            	}
                    		}
                    	});
                    }
                }]
        		
        	});
        },
        
        renderButtons : function(){
        	var self = this;
            
            self.editBtn = new Button({
            	container : "div.module-info-tag-buttonset",
            	id : "module-info-tag-edit",
            	imgCls : "cloud-icon-edit",
            	text : "编辑",
            	lang  : "{text:edit,title:edit}",
            	events : {
            		click : self.enable.bind(this)
            	}
            });
            
            self.submitBtn = new Button({
            	container : "div.module-info-tag-buttonset",
            	id : "module-info-tag-submit",
            	imgCls : "cloud-icon-yes",
            	text : "提交",
            	lang  : "{text:submit,title:submit}",
            	events : {
            		click : function(){
            			//return ;--------------------------------------------------------------------------------------
            		    if(validator.result("#module-info-tag-form")) {
            		        self.submit();
            		    }
            		}
            	}
            });
            
            self.cancelBtn = new Button({
            	container : "div.module-info-tag-buttonset",
            	id : "module-info-tag-cancel",
            	imgCls : "cloud-icon-no",
            	text : "取消",
            	lang  : "{text:cancel,title:cancel}",
            	events : {
            		click :  self.cancelEdit.bind(this)
            	}
            });
            
            self.deleteBtn = new Button({
            	container : "div.module-info-tag-buttonset",
            	id : "module-info-tag-delete",
            	imgCls : "cloud-icon-delete",
            	text : "删除",
            	lang  : "{text:delete,title:delete}",
            	events : {
            		click :  function(){
        				var alertItem = $("<p id = \"alertText\">").text(locale.get("affirm_delete"));
        				var buttons = {};
        				buttons[locale.get("yes")] = function(){
							self["delete"].call(self);
							
							$( this ).dialog( "close" );
						};
						buttons[locale.get("no")] = function(){
							$( this ).dialog( "close" );
						};
        				alertItem.dialog({
        					title : locale.get("prompt"),
        					modal:true,
        					minHeight: 120,
        					buttons: buttons/*{
        						"yes" : function(){
        							self["delete"].call(self);
        							
        							$( this ).dialog( "close" );
        						},
        						"no" : function(){
        							$( this ).dialog( "close" );
        						}
        					}*/,
        					close : function(){
        						$( this ).dialog( "destroy" );
        						alertItem.remove();
        					}
        				});
                	}
            			
            			
            			//self["delete"].bind(this)
            	}
            });
            /*$("#module-info-tag-edit").click(this.enable.bind(this));
            $("#module-info-tag-authorize");
            $("#module-info-tag-submit").click(this.submit.bind(this));
            $("#module-info-tag-cancel").click(this.cancelEdit.bind(this));*/
        },
        
        /**
         * Get privileges object from the form.
         */
        getPrivileges: function(){
            var privileges = {
                accept: [],
                deny: []
            }
            
            $("#module-info-tag-table tbody tr").each(function(i, tr){
                var id = parseInt($("input", tr).attr("name").substring(20));
                var radio = $("input:radio:checked", tr);
                switch (radio.val()) {
                    case "1":
                        privileges.accept.push(id);
                        break;
                    case "2":
                        privileges.deny.push(id);
                        break;
                    default:
                        break;
                }
            }.bind(this));
            
            privileges["default"] = $("#module-info-tag-default-privilege input:checked").val();
            
            return privileges;
        },
        
        submit: function(){
            var name = $("#module-info-tag-name").val();
            var flag = false;
            sysTags.each(function(text) {
            	if(name === text) {
            		flag = true;
            	}
            });
            if(flag) {
            	dialog.render({lang:"not_enter_system_tag"});
            	return ;
            }
//            if (name.empty()) {
//                alert("标签名不能为空.");
//                return;
//            }
            var checkStr = /[^\u4e00-\u9fa5\da-zA-Z0-9\-\_]+/;
            if(checkStr.test(name)){
                dialog.render({lang:"tag_cant_be_input"});
            }else{
                if (this.tagID == null) {
                    cloud.Ajax.request({
                        url: "api/tags",
                        type: "POST",
                        data: {
                            name: name,
                            shared : this.shareBtn.isSelected(),
                            favored : this.favorBtn.isSelected()
                        },
                        success: function(data){
                            dialog.render({lang:"save_success"});
                            this.fire("afterInfoCreated", data.result._id);
                            this.render(data.result._id);
                            this.disable();
                        }.bind(this)
                    });
                } else {
                    cloud.Ajax.request({
                        url: "api/tags/" + this.tagID,
                        type: "PUT",
                        data: {
                            name: name,
                            shared : this.shareBtn.isSelected(),
                            favored : this.favorBtn.isSelected()
                        },
                        
                        success: function(){
                            dialog.render({lang:"save_success"});
                            this.disable();
                            this.fire("afterInfoUpdated", this.tagID);
                        }.bind(this)
                    });
                }
            }
        },
        "delete" : function(){
            this.disable();
            this.fire("afterInfoDeleted", this.tagInfo);
        }
    });
    return InfoModule;
});
