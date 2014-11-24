/**
 * @author fenghl
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
//    var maps = require("cloud/components/map");
    var Button = require("cloud/components/button");
	var infoHtml = require("text!./info.html");
	var validator = require("cloud/components/validator");
	var InfoModel = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.taskId = null;
			this.element.html(infoHtml);
			this._renderCss();
			this.infoForm = this.element.find(".info-form");
			this._render();
			validator.render("#tasks-info-form",{
            	promptPosition:"topLeft",
            	scroll: false
			  });
		},
		//兼容ie9
		_renderCss:function(){
			$(".info-wrapper").css({
				"margin":"0 auto"
			});
			$("textarea").css({
				"margin-top":"9px",
				"height":"74px",
				"width":"197px",
				"resize":"none"
			});
			$(".info-header").css({
				"margin-top":"10px"
			});
			$(".info-header #info-name").css({
				"margin-left":"30px"
			});
			$(".info-header .info-favor").css({
				"margin-left":"9px"
			});
			$(".info-form-row .info-form-label").css({
				"display":"inlien-block",
				"width":"90px"
			});
			$(".info-form .info-form-text").css({
				"width":"96px"
			});
			$(".info-form .info-form-select").css({
				"width":"100px"
			});
			$(".info-form").css({
				"margin-left":"15px",			
			});
			$(".info-form-row").css({
				"margin":"8px auto"
			});
			$(".info-form-row #info-serial-number").css({
				"width":"130px"
			});
			$(".info-map").css({
				"width":"100%",
				"height":"120px",
				"margin":"10px 0",
				"border":"1px solid silver"
			});
			$(".info-buttonset").css({
				"overflow":"hidden",
				"height":"25px",
				"margin":"5px 0 5px 15px"
			});
			$(".info-buttonset a").css({
				"float":"left",
				"margin":"0 10px 5px 0"
			});
			$(".info-buttonset .cloud-button-body-main").css({
				"margin":"1px 2px",
				"padding":"1px 5px"
			});
		},
		_render:function(){
//			this._renderMap();
			this._renderButtons();
		},
		
//		_renderMap:function(){
//			this.map = new maps.Map({
//				selector:this.element.find("#info-map"),
//				zoomControl: false,
//				panControl: false
//			});
//		},
		
		_renderButtons:function(){
			var self = this;
			this.editButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-edit",
				imgCls:"cloud-icon-edit",
				text:"编辑",
				lang:"{text:edit,title:edit}",
				events:{
					click:self.enable.bind(this)
				}
			});
			this.editButton.hide();
			
			this.pauseButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-pause",
				imgCls:"cloud-icon-pause",
				text:"暂停",
				lang:"{text:pause,title:pause}",
				events:{
					click:function(){
						  dialog.render({
							  	lang:"affirm_pause",
							  	buttons:[{lang:"yes",click:function(){
							  		self.pause(self.taskId);
							  		dialog.close();
							  		}},{lang:"no",click:function(){
							  			dialog.close();
							  		}}]
							  });
					}.bind(this)//this.pause.bind(this)
				}
			});
			
			this.recoverButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-recover",
				imgCls:"cloud-icon-rightarrow1",
				text:"恢复",
				lang:"{text:recover,title:recover}",
				events:{
					click:function(){
						dialog.render({
						  	lang:"affirm_recover+?",
						  	buttons:[{lang:"yes",click:function(){
						  		self.recover(self.taskId);
						  		dialog.close();
						  		}},{lang:"no",click:function(){
						  			dialog.close();
						  		}}]
						  });
					}.bind(this)
				}
			});
			
			this.cancelButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-cancel",
				imgCls:"cloud-icon-no",
				text:"取消",
				lang:"{text:cancel,title:cancel}",
				events:{
					click:function(){
						dialog.render({
						  	lang:"affirm_cancel",
						  	buttons:[{lang:"yes",click:function(){
						  		self.canceTask(self.taskId);
						  		dialog.close();
						  		}},{lang:"no",click:function(){
						  			dialog.close();
						  		}}]
						  });
					}.bind(this)//this.canceTask.bind(this)
				}
			});
			
			this.submitButton = new Button({
				container:this.element.find(".info-buttonset"),
				id:"module-info-tag-submit",
				imgCls:"cloud-icon-yes",
				text:"提交",
				lang:"{text:submit,title:submit}",
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
				lang:"{text:cancel,title:cancel}",
				events:{
					click:function(){
//						self.setTaskinfo(self.data)
//						self.disable();
						self.loadTaskInfo()
					}
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
		
		transLocale : function(one){
			var localeName = locale.get(one.name.replace(/ /g, "_"));
			one.name = localeName ? localeName : one.name;
		},
		
		loadTaskInfo:function(){
			var self = this;
			cloud.Ajax.request({
				url:"api2/tasks/"+this.taskId,
				type:"get",
				parameters:{
					verbose:100
				},
				success:function(data){
					this.data = data.result;
					self.transLocale(data.result);
					this.setTaskinfo(data.result);
					this.disable(data.result.state);
					this.unmask();
					this.permission();
				}.bind(this)
			});
			
		},
		permission:function(){
			var self = this;
			var flag=permission.app("_task")["write"];
			if(!flag){
				self.editButton.hide();
				self.pauseButton.hide();
				self.recoverButton.hide();
				self.cancelButton.hide();
				self.submitButton.hide();
				self.editCancelButton.hide();
			}
		},
		pause:function(ids){
			var self = this;
			cloud.Ajax.clearDelay();
			ids = cloud.util.makeArray(ids);
			ids.each(function(id){
				cloud.Ajax.request({
					url:"api2/tasks/"+id+"/status",
					type:"put",
					parameters:{
						status:4
					},
//					error:function(error){
////						if(error.error_code==10017){
////							alert("错误：资源已经暂停");
////						}
//					},
					success:function(data){
						if(self.taskId === id){
							self.loadTaskInfo();
						}
						self.fire("afterInfoUpdated",data.result._id);
						self.pauseButton.hide();
						self.recoverButton.show();
						self._resetBtnsByState(4);// pause success, now state is 4
					},
					delay:60
				});
			});
		},
		recover:function(ids){
			var self = this;
			cloud.Ajax.clearDelay();
			ids = cloud.util.makeArray(ids);
			ids.each(function(id){
				cloud.Ajax.request({
					url:"api2/tasks/"+id+"/status",
					type:"put",
					parameters:{
						status:5
					},
//					error:function(error){
//
//					},
					success:function(data){
						if(self.taskId === id){
							self.loadTaskInfo();
						}
						self.fire("afterInfoUpdated",data.result._id);
						self.recoverButton.hide();
						self.pauseButton.show();
						self._resetBtnsByState(5);// recover success, now state is 5
					},
					delay:60
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
		
		canceTask:function(ids){
			var self = this;
			cloud.Ajax.clearDelay();
			ids = cloud.util.makeArray(ids);
			ids.each(function(id){
				cloud.Ajax.request({
					url:"api2/tasks/"+id,
					type:"delete",
//					error:function(error){
//						
//					},
					success:function(data){
						if(self.taskId === id){
							self.loadTaskInfo();
						}
						self.fire("afterInfoUpdated",data.result._id);
						self.editButton.hide();
						self.pauseButton.hide();
						self.cancelButton.hide();
						self.recoverButton.hide();
					},
					delay:60
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
			//var state = this.element.find("#info-task-status").val();
			//var priority = this.element.find("#info-task-priority").val();
			var desc = this.element.find("#info-task-desc").val();
			
			var name = this.element.find("#info-task-name").val();
			
			if (name.trim() == "") {
//                alert("Task's name can't be empty！");
                return;
            }
			
			cloud.Ajax.request({
				url:"api2/tasks/"+self.taskId,
				type:"put",
				data:{
//					name:name,
					desc:desc
				//	priority:parseInt(priority)
//					state:state
				},
				success:function(data){
//					alert("保存成功");
					dialog.render({lang:"save_success"});
					self.fire("afterInfoUpdated",data.result._id);
//					self.disable();
					self.loadTaskInfo()
				}
				
			});
		},
		selectTaskType:function(type){
			switch (type) {
				case 1:
					return locale.get("run_config_apply");
					break;
				case 2:
					return locale.get("interactive_command");
					break;
				case 3:
					return locale.get("ovdp_config");
					break;
				case 4:
					return locale.get("get_running_config");
					break;
				case 6:
					return locale.get("import_upgrade_file");
					break;
				case 8:
					return locale.get("get_formatting_parameters");
					break;
				case 9:
					return locale.get("device_function_test");
					break;
				case 10:
					return locale.get("evt_files");
					break;
				case 11:
					return locale.get("inrouter_certificate_profile");
					break;
				case 12:
					return locale.get("vpn_temporary_channel_config");
					break;
				case 13:
					return locale.get("vpn_link_order");
					break;
				case 14:
					return locale.get("zip_format_config_file");
					break;
				case 15:
					return locale.get("periodic_cleaning_access_token");
					break;
				case 16:
					return locale.get("cost_timing_statistics");
					break;
				case 17:
					return locale.get("visit_timing_statistics");
					break;
				case 18:
					return locale.get("flow_timing_statistics");
					break;
				case 19:
					return locale.get("channel_status_timing_update");
					break;
				case 20:
					return locale.get("Idle_task_timing_notice");
					break;
				default:
					return locale.get("error");
					break;
			}
		},
		setTaskinfo:function(data){
			if(data){
				var taskDeviceName = data.objectName;
				var taskType = this.selectTaskType(data.type);
				if(taskDeviceName){
					if(taskDeviceName.length > 10){
						taskDeviceName = taskDeviceName.substr(0,3) + "..." + taskDeviceName.substr(taskDeviceName.length - 4,taskDeviceName.length - 1);
					}
				}
				var taskName_ = (taskDeviceName ? taskDeviceName : one.objectName) + "_" + taskType;
				this.element.find("#info-name").val(taskName_).attr("title",taskName_);
				this.element.find("#info-task-name").val(data.name);
				var state = data.state;
				switch (state) {
				case -1:
					state = locale.get({lang:"exec_failure"});
					break;
				case 0:
					state = locale.get({lang:"wait_execute"});
					break;
				case 1:
					state = locale.get({lang:"executing"});
					break;
				case 2:
					state = locale.get({lang:"canceled"});
					break;
				case 3:
					state = locale.get({lang:"completed"});
					break;
				case 4:
					state = locale.get({lang:"pause"});
					break;
				case 5:
					state = locale.get({lang:"wait_publish"});
					break;
				default:
					break;
				}
				this.element.find("#info-task-name").attr("title",data.name);
				this.element.find("#info-task-type").val(this.selectTaskType(data.type));
				this.element.find("#info-task-status").val(state).attr("title",state);
				this.element.find("#info-task-progress").val(data.progress*100+"%");
				this.element.find("#info-task-sitename").val(data.objectName).attr("title",data.objectName);
				this.element.find("#info-task-username").val(data.username);
				var priority = data.priority;
				switch (priority) {
					case 10:
						priority = locale.get({lang:"timed_task"});
						break;
					case 20:
						priority = locale.get({lang:"low"});
						break;
					case 30:
						priority = locale.get({lang:"normal"});;
						break;
					case 40:
						priority = locale.get({lang:"advanced"});;
						break;
					default:
						break;
				}
//				console.log(priority);
				this.element.find("#info-task-priority").val(priority);
				this.element.find("#info-task-username").attr("title",data.username);
//				this.element.find("#info-task-priority").val(data.priority);
//				this.element.find("#info-task-address").val(data)
//				this.element.find("#info-task-customer").val(data)
				
				var startTime = data.startTime;
				var updateTime = data.updateTime;
				
				if(startTime){
					startTime = cloud.util.dateFormat(new Date(startTime), "yyyy-MM-dd hh:mm:ss");
					this.element.find("#info-task-starttime").val(startTime).attr("title",startTime);
				}else{
					this.element.find("#info-task-starttime").val("").removeAttr("title");
				}
				if(updateTime){
					updateTime = cloud.util.dateFormat(new Date(updateTime),"yyyy-MM-dd hh:mm:ss");
					this.element.find("#info-task-updatetime").val(updateTime).attr("title",updateTime);
				}else{
					this.element.find("#info-task-updatetime").val("").removeAttr("title");
				}
				this.element.find("#info-task-desc").val(data.desc).attr("title",data.desc);
			}
		},
		
		_resetBtnsByState : function(state){
			if(state === -1||state === 1||state === 2||state === 3){
				this.editButton.hide();
				this.pauseButton.hide();
				this.cancelButton.hide();
				this.recoverButton.hide();
			}else{
				if (state === 0 ||state === 5){//add by qinjunwen
//					this.editButton.show();
				}else{
					this.editButton.hide();
				}
				this.pauseButton.show();
				if(state === 4 ){
					this.pauseButton.hide();
					this.recoverButton.show();
				}else{
					this.recoverButton.hide();
					this.pauseButton.show();
				}
//				if (state === 1){
//					this.editButton.hide();
//					this.pauseButton.hide();
//					this.recoverButton.hide();
//				}
				this.cancelButton.show();
			}
		},
		
		disable:function(state){
			/*if(state === -1||state === 2||state === 3){
				this.editButton.hide();
				this.pauseButton.hide();
				this.cancelButton.hide();
				this.recoverButton.hide();
			}else{
				if (state === 0 ||state === 5){//add by qinjunwen
					this.editButton.show();
				}else{
					this.editButton.hide();
				}
				this.pauseButton.show();
				if(state === 4 ){
					this.pauseButton.hide();
					this.recoverButton.show();
				}else{
					this.recoverButton.hide();
					this.pauseButton.show();
				}
				this.cancelButton.show();
			}*/
			if (this.data){
				state = state || this.data.state;
			}
			this._resetBtnsByState(state);
			this.submitButton.hide();
			this.editCancelButton.hide();
			
			this.infoForm.find("input,select,textarea").attr("disabled",true);
			this.element.find("#info-name").attr("disabled",true);
		},
		
		enable:function(){
			this.editButton.hide();
			this.pauseButton.hide();
			this.cancelButton.hide();
			
			this.recoverButton.hide();
			this.submitButton.show();
			this.editCancelButton.show();
			
//			this.element.find("#info-task-status").removeAttr("disabled");
//			this.element.find("#info-task-priority").removeAttr("disabled");
			this.element.find("#info-task-desc").removeAttr("disabled");
			
			//this.infoForm.find("input,select").removeAttr("disabled");
//			this.element.find("#info-task-name").removeAttr("disabled");
		},
		
		destroy:function(){
//			if(this.map){
//				if(this.map.destroy){
//                    this.map.destroy();
//                }
//			}
			this.editButton.destroy();
			this.cancelButton.destroy();
			this.pauseButton.destroy();
		}
	});
    
	return InfoModel;
    
});