/**
 * @author fenghl
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var html = require("text!./content.html");
	var Table = require("cloud/components/table");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var Button = require("cloud/components/button");
	var Toolbar = require("cloud/components/toolbar");
//	var Paginate = require("cloud/components/paginate");
	var Paging = require("cloud/components/paging");
	var Content = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.service = options.service;
			this.columns = options.columns;
			this.businessType = options.businessType;
			this.elements = {
	           toolbar: this.id + "-toolbar",
	           content: this.id + "-content",
	           paging: this.id + "-paging"
	        };
			this.content = "";
			this.display = null;
			this.pageDisplay = 10;
			this._render();
		},
		
		_render:function(){
			this._renderHtml();
			this._renderLayout();
			this._renderCenterTable();
			this._renderNoticeBar();
			this._renderSelect();
		},
		_renderHtml:function(){
			this.element.append(html);
			
		},
		
		_renderLayout:function(){
			this.layout = this.element.layout({
				defaults: {
					paneClass: "pane",
	                "togglerLength_open": 50,
	                togglerClass: "cloud-layout-toggler",
	                resizerClass: "cloud-layout-123",
	                "spacing_open": 0,
	                "spacing_closed": 1,
	                "togglerLength_closed": 50,
	                resizable: false,
	                slidable: false,
	                closable: false
	            },
	            north:{
	               paneSelector: "#" + this.elements.toolbar,
	               size: 35
	            },
	            center:{
	               paneSelector: "#" + this.elements.content
	            },
				south:{
					paneSelector: "#" + this.elements.paging,
					size: 38
				}
			});
			var height = this.element.find("#" + this.elements.content).height();
			this.display = Math.ceil((height-60)/30);
		},
		getSelectedResources: function() {
        	var self = this;
        	var selectedRes = $A();
        	self.content.getSelectedRows().each(function(row){
        		selectedRes.push(self.content.getData(row));
        	});
        	return selectedRes;
        },
        cancelResource: function(resources) {
            resources = cloud.util.makeArray(resources);
            this.fire("cancel",resources.pluck("_id"));
        },

        editResource: function(resources) {
        	resources = cloud.util.makeArray(resources);
        	this.fire("edit",resources.pluck("_id"));
        },
        recoverResource: function(resources) {
        	resources = cloud.util.makeArray(resources);
        	this.fire("recover",resources.pluck("_id"));
        },
        pauseResource: function(resources) {
        	resources = cloud.util.makeArray(resources);
        	this.fire("pause",resources.pluck("_id"));
        },
		onEdit: function() {
			var self = this;
            var resources = this.getSelectedResources();
            if(resources.length === 0){
//                alert("Select one item , Please!");
                return;
            }else if(resources.length > 1){
//            	alert("Only can select one item!");
                return;
            }
            self.editResource(resources);
		},
		onRecover: function() {
			var self = this;
			var lang = "affirm_recover+?";
            var resources = this.getSelectedResources();
//			console.log(resources);
            if(resources.length === 0){
//                alert("At least select one item , Please!");
                 dialog.render({
                	  	lang:"please_select_at_least_one_config_item"
                	  });
                return;
            }
			resources.each(function(resource){
				if(resource.state !== 4){
					lang = "recover_prompt";
					return false;
				}
			});
            dialog.render({
			  	lang:lang,
			  	buttons:[{lang:"yes",click:function(){
			  		self.recoverResource(resources);
			  		dialog.close();
			  		}},{lang:"no",click:function(){
			  			dialog.close();
			  		}}]
			  });
		},
		onPause: function() {
			var self = this;
			var lang = "affirm_pause";
            var resources = this.getSelectedResources();
            if(resources.length === 0){
//                alert("At least select one item , Please!");
            	dialog.render({
            	  	lang:"please_select_at_least_one_config_item"
            	  });
                return;
            }
			resources.each(function(resource){
				if(resource.state !== 5 && resource.state !== 0 ){
					lang = "pause_prompt";
					return false;
				}
			});
            dialog.render({
			  	lang: lang,
			  	buttons:[{lang:"yes",click:function(){
			  		self.pauseResource(resources);
			  		dialog.close();
			  		}},{lang:"no",click:function(){
			  			dialog.close();
			  		}}]
			  });
		},
		onCancel: function() {
			var self = this;
			var lang = "affirm_cancel";
            var resources = this.getSelectedResources();
            if(resources.length === 0){
//                alert("At least select one item , Please!");
            	dialog.render({
            	  	lang:"please_select_at_least_one_config_item"
            	  });
                return;
            }
			resources.each(function(resource){
				if(resource.state === 3 || resource.state === -1){
					lang = "cancel_prompt";
					return false;
				}
			});
            dialog.render({
			  	lang:lang,
			  	buttons:[{lang:"yes",click:function(){
			  		self.cancelResource(resources);
			  		dialog.close();
			  		}},{lang:"no",click:function(){
			  			dialog.close();
			  		}}]
			  });
		},
		_renderNoticeBar:function(){
//			this.noticeBar = new NoticeBar({
//				selector:"#"+this.elements.bar.id
//			});
			var self = this;
			
			var recoverBtn = new Button({
        		imgCls:"cloud-icon-rightarrow1",
        		id:"content-table-recover-button",
        		lang:"{title:batch_recover}",
        		events:{
					click: this.onRecover,
					scope: this
        		}
        	});
			this.recoverBtn=recoverBtn;
			var pauseBtn = new Button({
				id:"content-table-pause-button",
				imgCls:"cloud-icon-pause",
				title:"批量暂停",
				lang:"{title:batch_pause}",
				events:{
					click: this.onPause,
					scope: this
				}
			});
			this.pauseBtn=pauseBtn;
        	var cancelBtn = new Button({
                 id: "content-table-cance-button",
                 imgCls: "cloud-icon-no",
                 title:"批量取消",
                 lang:"{title:batch_cancel}",
                 events: {
	        		click: this.onCancel,
					scope: this
                 }
             });
        	this.cancelBtn=cancelBtn;
        	this.optionBtns = $H({
        		"recoverBtn" : this.recoverBtn,
        		"pauseBtn" : this.pauseBtn,
        		"cancelBtn" : this.cancelBtn
        	})
        	var taskStatus = "";
        	if(self.businessType=='historytask'){
        		taskStatus = "<select  id='multiselect1' class='multiselect' multiple='multiple'>" +
		            "<option value='-1' selected='selected' lang='text:exec_failure'>执行失败</option>" +
		            "<option value='2' selected='selected' lang='text:canceled'>已取消</option>" +
		            "<option value='3' selected='selected' lang='text:Completed'>已完成</option>" +
		            "</select>";
        	}else{
        		taskStatus = "<select  id='multiselect1' class='multiselect' multiple='multiple'>" +
		            "<option id='taskStatus_1' value='-1' selected='selected' lang='text:exec_failure'>执行失败</option>" +
		            "<option id='taskStatus_2' value='0' selected='selected' lang='text:wait_execute'>等待执行</option>" +
		            "<option id='taskStatus_3' value='1' selected='selected' lang='text:executing'>正在执行</option>" +
		            "<option id='taskStatus_4' value='2' selected='selected' lang='text:canceled'>已取消</option>" +
		            "<option id='taskStatus_5' value='3' selected='selected' lang='text:Completed'>已完成</option>" +
		            "<option id='taskStatus_6' value='4' selected='selected' lang='text:pause'>暂停</option>" +
		            "<option id='taskStatus_7' value='5' selected='selected' lang='text:wait_publish'>等待发布</option>" +
		            "</select>";
        	}
			var $htmls = $(+"<div></div>" +
		            "<div id='notice-bar' style='width:auto'>" +
		            "<label style='margin:auto 10px auto 10px' lang='text:task_state+:'>任务状态:</label>" +
		            taskStatus +
		            "<label style='margin:auto 10px auto 10px' lang='text:sponsor_type+:'>发起者类型:</label>" +
		            "<select  id='multiselect2' class='multiselect' multiple='multiple'>" +
		            "<option value='0' selected='selected' lang='text:system'>系统</option>" +
		            "<option value='1' selected='selected' lang='text:user'>用户</option>" +
		            "<option value='2' selected='selected' lang='text:others'>其它</option>" +
		            "</select>" +
		            "<label style='margin:auto 10px auto 10px' lang='text:task_type+:'>任务类型:</label>" +
		            "<select  id='multiselect3' class='multiselect' multiple='multiple'>" +
		            "<option value='1' selected='selected' lang='text:run_config_apply'>运行配置下发</option>" +
		            "<option value='2' selected='selected' lang='text:interactive_command'>交互命令</option>" +
		            "<option value='3' selected='selected' lang='text:ovdp_config'>OVDP配置</option>" +
		            "<option value='4' selected='selected' lang='text:get_running_config'>获取运行配置</option>" +
		            "<option value='6' selected='selected' lang='text:import_upgrade_file'>升级文件</option>" +
		            "<option value='8' selected='selected' lang='text:get_formatting_parameters'>获取格式化参数</option>" +
		            "<option value='9' selected='selected' lang='text:device_function_test'>设备功能测试</option>" +
		            "<option value='10' selected='selected' lang='text:evt_files'>EVT文件</option>" +
		            "<option value='11' selected='selected' lang='text:inrouter_certificate_profile'>InRouter证书配置文件</option>" +
		            "<option value='12' selected='selected' lang='text:vpn_temporary_channel_config'>VPN 临时通道配置</option>" +
		            "<option value='13' selected='selected' lang='text:vpn_link_order'>VPN连接指令</option>" +
		            "<option value='14' selected='selected' lang='text:zip_format_config_file'>zip压缩格式配置文件</option>" +
		            "<option value='15' selected='selected' lang='text:periodic_cleaning_access_token'>定期清理access_token</option>" +
		            "<option value='16' selected='selected' lang='text:cost_timing_statistics'>费用定期统计</option>" +
		            "<option value='17' selected='selected' lang='text:visit_timing_statistics'>访问定期统计</option>" +
		            "<option value='18' selected='selected' lang='text:flow_timing_statistics'>流量定期统计</option>" +
		            "<option value='19' selected='selected' lang='text:channel_status_timing_update'>通道状态定期更新</option>" +
		            "<option value='20' selected='selected' lang='text:Idle_task_timing_notice'>"+locale.get({lang:"Idle_task_timing_notice"})+"</option>" +
		            "</select>" +
		            "</div>");
			if(self.businessType=='historytask'){
				this.toolbar = new Toolbar({
					selector:"#"+self.elements.toolbar,
					leftItems: [$htmls],
					rightItems:[]
				});
			}else{
				this.toolbar = new Toolbar({
					selector:"#"+self.elements.toolbar,
					leftItems: [$htmls],
//					rightItems:[editBtn,pauseBtn,cancelBtn]
					rightItems:[recoverBtn,pauseBtn,cancelBtn]
				});
			}
		},
		_renderCenterTable:function(){
			var self = this;
//			var col =this._getColumns(this.businessType);
			this.content = new Table({
				selector:"#"+this.elements.content,
				columns:[this.columns].flatten(),
				datas:[],
				pageSize:100,
				autoWidth:false,
				pageToolBar:false,
				checkbox:"full",
				events:{
					onRowClick: function(data) {
						if(data) self.fire("click", data._id);
                    },
                    onRowCheck : function(){
                    	//self.updateCountInfo();
                    	var selectedRows = this.content.getSelectedRows();
                    	var checkedData = $A();
                    	selectedRows.each(function(one){
                    		checkedData.push(self.content.getData(one));
                    	});
//                    	console.log(checkedData, "checkedData");
                    	var checkedStateArray = checkedData.pluck("state").uniq();
//                    	console.log(checkedStateArray, "checkedStateArray");
                    	this._resetBtnsByState(checkedStateArray);
                    },
                    onCheckAll : function(selectedRows){
                    	var checkedData = $A();
                    	selectedRows.each(function(one){
                    		checkedData.push(self.content.getData(one));
                    	});
//                    	console.log(checkedData, "checkedData");
                    	var checkedStateArray = checkedData.pluck("state").uniq();
//                    	console.log(checkedStateArray, "checkedStateArray");
                    	this._resetBtnsByState(checkedStateArray);
                    },
                    scope: this
				}
			});
			//this.setDataTable();
		},
		
		_resetBtnsByState : function(stateArray){
			var self = this;
			var isDisableAllOpt = $A(stateArray).include(-1) || $A(stateArray).include(2) || $A(stateArray).include(3)||$A(stateArray).include(1);//0,1,4,5 remain
			var isDisablePause = $A(stateArray).include(1) || $A(stateArray).include(4);
			var isDisableRecover = $A(stateArray).include(0) || $A(stateArray).include(1) || $A(stateArray).include(5);
			
			if(isDisableAllOpt){//失败、正在执行、已取消、完成 的，不能进行任何操作
				this.optionBtns.each(function(btn){
					btn.value.disable();
				})
			}else {
				this.optionBtns.each(function(btn){
					btn.value.enable();
				})
				if (isDisablePause){
					this.optionBtns.get("pauseBtn").disable();
				}
				if (isDisableRecover){
					this.optionBtns.get("recoverBtn").disable();
				}
			}
		},
		
		refreshState : function(){
			var self = this;
			var selectedRows = this.content.getSelectedRows();
        	var checkedData = $A();
        	selectedRows.each(function(one){
        		checkedData.push(self.content.getData(one));
        	});
        	var checkedStateArray = checkedData.pluck("state").uniq();
        	this._resetBtnsByState(checkedStateArray);
		},
		
		renderBtn:function(){
			var self = this;
			var searchBtn = new Button({
                container: $("#notice-bar"),
                id:"content-table-search-button",
                text:"查询",
                lang:"{text:query,title:query}",
                events: {
					 click: function(){
		                var state = $("#multiselect1").multiselect("getChecked").map(function(){
		                    return parseFloat(this.value);
		                }).get();
		                var userType = $("#multiselect2").multiselect("getChecked").map(function(){
		                    return parseFloat(this.value);
		                }).get();
		                var taskType = $("#multiselect3").multiselect("getChecked").map(function(){
		                    return parseFloat(this.value);
		                }).get();
		                var is = 0;
		                var is = self._checkFormat(state, userType, taskType);
		                
		                /*if(state.length == 0){
		                	state = "-1,0,1,2,3,4,5";
		                }
		                if(userType.length == 0){
		                	userType = "0,1,2";
		                }
		                if(taskType.length == 0){
		                	taskType = "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20";
		                }*/
		                var obj = {
		                	states: state,
		                	ut: userType,
		                	types: taskType
		                };
		                if (is == 0) {
		                	self.getQueryResources(obj);
		                	self.optionBtns.each(function(btn){
		    					btn.value.enable();
		    				});
		                	
		                }
		            }
                }
            });
			
			$("#notice-bar a").css({
                margin: "auto 10px auto 10px"
            });
		},
		
		_checkFormat: function(values1, values2, values3){
            var isTrue = 0;
            if (values1.length == 0) {
            	dialog.render({lang:"task_state_not_null+!"});
                isTrue += 1;
            }else{
            	if (values2.length == 0) {
                	dialog.render({lang:"sponsor_type_not_null+!"});
                    isTrue += 1;
                }else{
                    if (values3.length == 0) {
                    	dialog.render({lang:"task_type_not_null+!"});
                        isTrue += 1;
                    }
                }
            }
            return isTrue;
        },
		_renderSelect:function(){
			this.renderBtn();
			require(["cloud/lib/plugin/jquery.multiselect"], function(){
                $("#multiselect1").multiselect({
                	header: true,
                	checkAllText : locale.get("check_all"),
                	uncheckAllText : locale.get("uncheck_all"),  
                    noneSelectedText: locale.get({lang:"please_select"}),
                    selectedText: "# "+locale.get({lang:"is_selected"}),
                    minWidth: 130,
                    height: 120,
                    open:function(){
                    	$(".ui-multiselect-menu").width(180);
                    }
                });
                $("#multiselect2").multiselect({
                	header: true,
                	checkAllText : locale.get("check_all"),
                	uncheckAllText : locale.get("uncheck_all"),  
                	noneSelectedText: locale.get({lang:"please_select"}),
                	selectedText: "# "+locale.get({lang:"is_selected"}),
                	minWidth: 130,
                	height: 120,
                	open:function(){
                    	$(".ui-multiselect-menu").width(180);
                    }
                });
                $("#multiselect3").multiselect({
                	header: true,
                	checkAllText : locale.get("check_all"),
                	uncheckAllText : locale.get("uncheck_all"),  
                	noneSelectedText: locale.get({lang:"please_select"}),
                	selectedText: "# "+locale.get({lang:"is_selected"}),
                	minWidth: 130,
                	height: 120,
                	open:function(){
                    	$(".ui-multiselect-menu").width(180);
                    }
                });
            });
		},
		
		updateResource:function(id){
			this.options.service.getTasksTableResourceById(id,function(data){
				this.content.update(data[0],this.content.getRowsByProp("_id", data[0]._id)[0]);
				this.refreshState();
				//this.updateCountInfo()
			},this);
		},
		
		selectAllResources: function() {
        	this.content.selectRows();
            this.updateCountInfo();
        },
        
        unselectAllResources: function() {
        	this.content.unSelectRows();
            this.updateCountInfo();
        },
        
        updateCountInfo: function() {
            this.selectedCount = this.getSelectedResources().size();
            this.selectAllButton.setText(this.selectedCount + "/" + this.totalCount);
            this.selectAllButton.setSelect(this.selectedCount === this.totalCount && this.totalCount !== 0);
        },
        
        getSelectedResources: function() {
        	var self = this;
        	var selectedRes = $A();
        	self.content.getSelectedRows().each(function(row){
        		selectedRes.push(self.content.getData(row));
        	});
        	return selectedRes;
        },
        getQueryResources:function(opt){
        	var self = this;
        	self.fire("close");//点击查询 关闭右侧Info模块 ---杨通
        	
        	//清空Info数据
        	$("#info-name").val("");
        	$("#info-task-name").val("");
        	$("#info-task-type").val("");
        	$("#info-task-status").val("");
        	$("#info-task-priority").val("");
        	$("#info-task-progress").val("");
        	$("#info-task-sitename").val("");
        	$("#info-task-username").val("");
//        	$("#info-task-address").val("");
        	$("#info-task-starttimee").val("");
        	$("#info-task-updatetimee").val("");
        	$("#info-task-desc").val("");
        	$("#info-table-toggler").hide();
        	
        	
			this.opt= opt;
			cloud.util.mask(this.element);
        	self.service.getTasksList(this.opt,0,/*self.display*/30,function(datas){
//				var data = datas.slice(0,self.display);
				self.content.render(datas);
				cloud.util.unmask(self.element);
				//new page
				self.page.reset(datas);
				//old page
//				if( datas.total > self.display ){
//					self._renderPagin(Math.ceil(datas.total/(self.display)));
//				}else{
//					if(self.paging){
//					self.paging.destroy();
//					self.paging=null;
//					}
//				}
			});
        },
        render:function(){
        	var self = this;
        	var statusVal = [];
        	if(self.businessType=='historytask'){
        		statusVal = [-1,2,3];
        	}else{
        		statusVal = [-1,0,1,2,3,4,5];
        	}
        	this.opt = {ut:[0,1,2],types:[1,2,3,4,6,8,9,10,11,12,13,14,15,16,17,18,19,20],states:statusVal};
//        	this.options.service.getTasksList(opt,this.content.render,this.content);
        	this.options.service.getTasksList(this.opt,0,/*this.display*/30,function(data){
				this.content.render(data);
//				console.log(data.length);
				//new page
				this._renderpage(data);
				//old page
//				if(data.total > this.display ){
//					this._renderPagin(Math.ceil(data.total/(this.display)));
//				}
			},this);
        },
        //new page
        _renderpage:function(data){
			var self = this;
			this.page = new Paging({
				selector : $("#" + this.elements.paging),
				data : data,
				total:data.total,
				current : 1,
				limit : 30,
				requestData:function(options,callback){
					self.options.service.getTasksList(self.opt, options.cursor, options.limit, function(data){
						callback(data);
					});
				},
				turn:function(data){
					self.content.clearTableData();
					self.content.render(data);
				}
			});
		},
        //old page
		_renderPagin:function(pagination){
			var self = this;
			if (this.paging) {
				this.paging.destroy();
			}
				this.paging = new Paginate({
					display: this.pageDisplay,
					count: pagination,
					start: 1,
					container: $("#" + this.elements.paging),
					events: {
						change: function(page) {
							self._turnPage(page);
						},
						scope: this
					}
				});
		},
		_turnPage:function(page){
			this.mask();
			this.fire("close");//点击翻页 关闭右侧Info模块 ---杨通
			this.service.getTasksList(this.opt,(page-1)*(this.display),this.display,function(data){
				this.totalCount = data.length;
                this.content.clearTableData();
                this.content.render(data);
                this.unmask();
			},this);
		}
	});
	return Content;
});