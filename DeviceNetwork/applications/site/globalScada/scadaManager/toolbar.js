define(function(require) {
    require("cloud/base/cloud");
    var Toolbar = require("cloud/components/toolbar");
    var Button = require("cloud/components/button");
    var ItemBox = require("cloud/components/itembox");
    require("cloud/lib/plugin/jquery.qtip");
    require("cloud/lib/plugin/jquery.layout");
    
    var TagOverview = Class.create(cloud.Component, {
        moduleName: "tag-overview",
        initialize: function($super, options) {
            $super(options);
            this.toolbar = null;
            this.service = options.service;
            this.scadaId=null;
            this.scadaName=null;
            this.display=30;
            this.isExist=false;
            this.itembox = null;
            this.draw();
        },
        
        draw: function() {
//            this.element.addClass("tag-overview");
            this.$toolbar = $("<div>").attr("id", this.id + "-toolbar").appendTo(this.element);

            this.element.layout({
                defaults: {
                    paneClass: "pane",
                    "togglerLength_open": 50,
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 1,
                    "spacing_closed": 1,
                    "togglerLength_closed": 50,
                    resizable: false,
                    slidable: false,
                    closable: false
                },
                center: {
                    paneSelector: "#" + this.$toolbar.attr("id"),
                    size: 29
                }
            });
            this.renderToolbar();
            this.renderCreateForm();
            this.renderEditForm();
        },
        
        /*
         * Render toolbar
         */
        renderToolbar: function() {
            var self = this;
            var checkbox = new Button({
                checkbox: true,
                id: this.moduleName + "-select-all",
                autoGenTitle : false,
                events: {
                    click: function() {
                    	var selectAll=null;
                        if (this.selectAllButton.isSelected() === true) {
                        	selectAll=true;
                        } else {
                        	selectAll=false;
                        }
                        self.fire("selectAll",selectAll,this.selectAllButton,this.moduleName);
                    },
                    scope: self
                },
                text: "0/0",
                disabled: false
            });

            this.selectAllButton = checkbox;
            var addBtn = new Button({
                imgCls: "cloud-icon-add-tag",
                id: this.moduleName + "-add-button",
                title:locale.get({lang:"newText"})
            });
            var deleteBtn = new Button({
                imgCls: "cloud-icon-remove-tag",
                id: this.moduleName + "-delete-button",
                title:locale.get({lang:"deleteText"}),
                events: {
                    click: self.onDelete,
                    scope: self
                }
            });

            var editBtn = new Button({
                imgCls: "cloud-icon-edit",
                id: this.moduleName + "-edit-button",
                title:locale.get({lang:"edit"})
            });
			 if(permission.app("_scada")["write"]){
				 this.toolbar = new Toolbar({
		                selector: this.$toolbar,
		                leftItems: [],
		                rightItems: [addBtn, deleteBtn, editBtn]
		         });
			 }else{
				 this.toolbar = new Toolbar({
		                selector: this.$toolbar,
		                leftItems: [],
		                rightItems: []
		         });
			 }
            

            this.toolbar.element.addClass(this.moduleName + "-toolbar");
        },
        //创建 全局监控画面
        renderCreateForm: function() {
        	var self=this;
            this.createForm = $("<form>").addClass(this.moduleName + "-create-form ui-helper-hidden tag-overview-form");
            $("<label>").attr("for", "new-scada-name").text(locale.get({lang:"scadaName+:"})).appendTo(this.createForm);
            $("<input type='text'>").attr("id", "new-scada-name").appendTo(this.createForm);
            new Button({
                container: this.createForm,
                imgCls: "cloud-icon-yes",
                lang:"{title:submit}",
                events: {
                    click: this.onCreate,
                    scope: this
                }
            });
           this.createForm[0].childNodes[1].onkeydown=function(event){    
        	   if(event.keyCode==13){       		   
        		   self.onCreate();
        		   return false;
        	   }       	  
           };
            this.createForm.appendTo(this.element);
            $("#" + this.moduleName + "-add-button").qtip({
                content: {
                    text: this.createForm
                },
                position: {
                    my: "top left",
                    at: "bottom middle"
                },
                show: {
                    event: "click"
                },
                hide: {
                    event: "click unfocus"
                },
                style: {
                    classes: "qtip-shadow qtip-light"
                },
				events: {
					visible: function(){
						$("#new-scada-name").val(null);
						$("#new-scada-name").focus();						
					}
				},
                suppress:false
            });
        },
        
        onCreate: function() {
        	var newScadaname = $("#new-scada-name").val();
	        if (!newScadaname.empty()) {
	            if(newScadaname.length <= 30){
	            	this.newScadasNameIsExist(newScadaname);//画布名称唯一性校验
	              }else{
	            	  dialog.render({lang:"tag_length_only_in", buttons:[{lang:"yes",click:function(){$("#new-scada-name").val(null);dialog.close();}}]});
	              }
	        } else {
	        	dialog.render({lang:"scadaName_cannot_be_empty"});
	        }
        },
        //编辑全局监控画面名称
        renderEditForm:function(){
        	var self=this;
            this.editForm = $("<form>").addClass(this.moduleName + "-create-form ui-helper-hidden tag-overview-form");
            $("<label>").attr("for", "edit-scadaname").text(locale.get({lang:"scadaName+:"})).appendTo(this.editForm);
            $("<input type='text'>").attr("id", "edit-scada-name").appendTo(this.editForm);
            new Button({
                container: this.editForm,
                imgCls: "cloud-icon-yes",
                lang:"{title:submit}",
                events: {
                    click: this.onEdit,
                    scope: this
                }
            });
           this.editForm[0].childNodes[1].onkeydown=function(event){    
        	   if(event.keyCode==13){       		   
        		   self.onEdit();
        		   return false;
        	   }       	  
           };
          
            this.editForm.appendTo(this.element);
            $("#" + this.moduleName + "-edit-button").qtip({
                     content: {
                         text: this.editForm
                     },
                     position: {
                         my: "top left",
                         at: "bottom middle"
                     },
                     show: {
                         event: "click"
                     },
                     hide: {
                         event: "click unfocus"
                     },
                     style: {
                         classes: "qtip-shadow qtip-light"
                     },
     				events: {
     					visible: function(){
     						$("#edit-tag-name").focus();
     					},
     					 show: function(event) {
     						self.fire("editCanvas",event);
     					 }
     				},
                     suppress:false
            });
        },
        newScadasNameIsExist:function(scadasName){
			var self = this;
        	var nameExist = false; 
			this.service.getGlobalScadaInfo(0, this.display, function(data) {
				if(data.result && data.result.length>0){
					for(var i = 0 ; i < data.result.length ; i++) {
						if($.trim(data.result[i].name) == $.trim(scadasName)){
							nameExist=true;
						 }
					}
				}
				if(!nameExist){
					var data = {
	        				name:scadasName,
	        				content:{}
	        		};
	        		self.service.addGlobalScada(data,function(data){
	        			if(data.result){
	        				self.fire("loadScadaData",data.result._id);
	        				$("#" + self.moduleName + "-add-button").data("qtip").hide();
	        				$("#new-scada-name").val(null);
	        			}
	        		});
				}else{
	        		dialog.render({lang:"frames_already_exists"});
	        	}
			});
		},
        scadasNameIsExist:function(editName){
        	var self = this;
        	var nameExist = false; 
			this.service.getGlobalScadaInfo(0, this.display, function(data) {
				if(data.result && data.result.length>0){
					for(var i = 0 ; i < data.result.length ; i++) {
						if($.trim(data.result[i].name) == $.trim(editName)){
							nameExist=true;
						 }
					}
				}
				if(!nameExist){
	        		   var updateScada = {
	            			      name:editName,
							      content:{}
				        };
	            	   self.service.updateGlobalScada(self.scadaId,updateScada,function(data){
			    	      if(data.result){
			    		     self.fire("loadScadaData",data.result._id);
			    		     $("#" + self.moduleName + "-edit-button").data("qtip").hide();
			    		     $("#edit-scada-name").val(null);
			    	      }
					   });
	        	}else{
	        		   dialog.render({lang:"frames_already_exists"});
	        	}
			});
		},
        onEdit:function(){
        	var editName =$("#edit-scada-name").val();
	        if (!editName.empty()) {
	        	if(editName.length <= 30){
	        		this.scadasNameIsExist(editName);//画布名称唯一性校验
	        	}else{
	        		dialog.render({lang:"tag_length_only_in", buttons:[{lang:"yes",click:function(){$("#edit-scada-name").val(null);dialog.close();}}]});
	        	}
	        } else {
	        	dialog.render({lang:"scadaName_cannot_be_empty"});
	        }
		},
        //删除全局监控画面
		onDelete:function(){
			this.fire("deleteCanvas");
        }
    });

    return TagOverview;
});