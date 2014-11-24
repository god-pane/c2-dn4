/**
 * @author fenghl
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
    var maps = require("cloud/components/map");
    var Button = require("cloud/components/button");
	var infoHtml = require("text!./info.html");
	var validator = require("cloud/components/validator");
	
	var InfoModel = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.taskId = null;
			this.element.html(infoHtml);
			this.infoForm = this.element.find(".info-form");
			this._render();
			validator.render("#tasks-info-form",{
            	promptPosition:"topLeft",
            	scroll: false
			  });
		},
		
		_render:function(){
			this._renderMap();
			this._renderButtons();
		},
		
		_renderMap:function(){
			this.map = new maps.Map({
				selector:this.element.find("#info-map"),
				zoomControl: false,
				panControl: false
			});
			
		},
		
		_renderButtons:function(){
			var self = this;
			this.editButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-edit",
				imgCls:"cloud-icon-edit",
				text:"编辑",
				events:{
					click:self.enable.bind(this)
				}
			});
			
			this.pauseButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-pause",
				imgCls:"cloud-icon-pause",
				text:"暂停",
				events:{
					click:function(){
						var alertItem = $("<p id = \"alertText\">").text("确认暂停？");
                    	alertItem.dialog({
                    		title : "提示",
                    		modal:true,
                    		minHeight : 120,
                    		buttons:{
                    			"yes" : function(){
                    				self.pause(self.taskId);
                    				$(this).dialog( "close" );
                    			},
                    			"no" : function(){
                    				$(this).dialog( "close" );
                    			}
                    		},
                    		close : function(){
                    			$(this).dialog( "destroy" );
        						alertItem.remove();
                    		}
                    	});
					}.bind(this)//this.pause.bind(this)
				}
			});
			
			this.recoverButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-recover",
				imgCls:"cloud-icon-pause",
				text:"恢复",
				events:{
					click:function(){
						this.recoverButton.hide();
						this.pauseButton.show();
					}
				}
			});
			
			this.cancelButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-cancel",
				imgCls:"cloud-icon-no",
				text:"取消",
				events:{
					click:function(){
						var alertItem = $("<p id = \"alertText\">").text("确认取消？");
                    	alertItem.dialog({
                    		title : "提示",
                    		modal:true,
                    		minHeight : 120,
                    		buttons:{
                    			"yes" : function(){
                    				self.canceTask(self.taskId);
                    				$(this).dialog( "close" );
                    			},
                    			"no" : function(){
                    				$(this).dialog( "close" );
                    			}
                    		},
                    		close : function(){
                    			$(this).dialog( "destroy" );
        						alertItem.remove();
                    		}
                    	});
					}.bind(this)//this.canceTask.bind(this)
				}
			});
			
			this.submitButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-submit",
				imgCls:"cloud-icon-yes",
				text:"提交",
				events:{
					click:function(){
						if(validator.result()){
		    				self.submit();
		    			}
					}.bind(this)
				}
			});
			
			this.editCancelButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-eidtcancel",
				imgCls:"cloud-icon-no",
				text:"取消",
				events:{
					click:this.disable.bind(this)
				}
			});
		},
		
		render:function(id){
			this.taskId = id;
			if(this.taskId){
				this.mask();
				this.loadTaskInfo();
			}else{
				
			}
		},
		
		loadTaskInfo:function(){
			cloud.Ajax.request({
				url:"api2/tasks/"+this.taskId,
				type:"get",
				parameters:{
					verbose:100
				},
				success:function(data){
					this.setTaskinfo(data.result);
					this.disable();
					this.unmask();
				}.bind(this)
			});
			
		},
		
		pause:function(ids){
			var self = this;
			ids = cloud.util.makeArray(ids);
			ids.each(function(id){
				cloud.Ajax.request({
					url:"api2/tasks/"+id,
					type:"delete",
					success:function(data){
						self.fire("afterInfoUpdated",data.result._id);
					}
				});
			});
//			cloud.Ajax.request({
//				url:"api2/tasks/"+self.taskId+"/4",
//				type:"put",
//				success:function(data){
//					self.fire("afterInfoUpdated",data.result._id);
//					self.pauseButton.hide();
//					self.recoverButton.show();
//				}
//			});
		},
		
		canceTask:function(){
			var self = this;
			ids = cloud.util.makeArray(ids);
			ids.each(function(id){
				cloud.Ajax.request({
					url:"api2/tasks/"+id,
					type:"delete",
					success:function(data){
						self.fire("afterInfoUpdated",data.result._id);
					}
				});
			});
//			cloud.Ajax.request({
//				url:"api2/tasks/"+this.taskId,
//				type:"delete",
//				success:function(data){
//					self.fire("afterInfoUpdated",data.result._id);
//				}
//			});
		},
		
		submit:function(){
			var self = this;
			
			var state = this.element.find("#info-task-status").val();
			var priority = this.element.find("#info-task-priority").val();
			var desc = this.element.find("#info-task-desc").val();
			
			var name = this.element.find("#info-name").val();
			
			if (name.trim() == "") {
//                alert("Task's name can't be empty！");
                return;
            }
			
			cloud.Ajax.request({
				url:"api2/tasks/"+self.taskId,
				type:"put",
				data:{
					name:name,
					desc:desc,
					priority:parseInt(priority)
//					state:state
				},
				success:function(data){
//					alert("保存成功");
					self.fire("afterInfoUpdated",data.result._id);
					self.disable();
				}
				
			});
		},
		
		setTaskinfo:function(data){
			if(data){
				this.element.find("#info-name").val(data.name);
				this.element.find("#info-task-name").val(data.name);
//				this.element.find("#info-task-type").val(data.type);
				this.element.find("#info-task-status").val(data.state);
				this.element.find("#info-task-progress").val(data.progress+"%");
				this.element.find("#info-task-sitename").val(data.siteName);
				this.element.find("#info-task-username").val(data.username);
				this.element.find("#info-task-priority").val(data.priority);
//				this.element.find("#info-task-address").val(data)
//				this.element.find("#info-task-customer").val(data)
				this.element.find("#info-task-starttime").val(data.startTime);
				this.element.find("#info-task-updatetime").val(data.updateTime);
				this.element.find("#info-task-desc").val(data.desc);
			}
		},
		
		
		disable:function(){
//			this.editButton.show();
//			this.pauseButton.show();
//			this.cancelButton.show();
			
			this.editButton.hide();
			this.pauseButton.hide();
			this.cancelButton.hide();
			
			this.recoverButton.hide();
			this.submitButton.hide();
			this.editCancelButton.hide();
			
			this.infoForm.find("input,select").attr("disabled",true);
			this.element.find("#info-name").attr("disabled",true);
		},
		
		enable:function(){
//			alert("enable");
			this.editButton.hide();
			this.pauseButton.hide();
			this.cancelButton.hide();
			
			this.recoverButton.hide();
			this.submitButton.show();
			this.editCancelButton.show();
			
//			this.element.find("#info-task-status").removeAttr("disabled");
			this.element.find("#info-task-priority").removeAttr("disabled");
			this.element.find("#info-task-desc").removeAttr("disabled");
			
			//this.infoForm.find("input,select").removeAttr("disabled");
			this.element.find("#info-name").removeAttr("disabled");
		},
		
		destroy:function(){
			if(this.map){
				if(this.map.destroy){
                    this.map.destroy();
                }
			}
			this.editButton.destroy();
			this.cancelButton.destroy();
			this.pauseButton.destroy();
		}
		
		
	});
    
	return InfoModel;
    
});