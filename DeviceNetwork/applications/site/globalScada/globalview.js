define(function(require){
	require("cloud/lib/plugin/ext/ext-base");
	require("cloud/lib/plugin/ext/ext-all");
	require("cloud/base/cloud");
	var ScadaManager = require("./scadaManager/scadaManager");
	var globalHtml = require("text!./globalview.html");
	require("cloud/lib/plugin/jquery.layout");
	require("../mysite/agent/css/agent-canvas.css");
	var ContentScada = require("../mysite/scada/components/content-scada");
	var AgentCanvasManager = require("./scadaManager/GlobalCanvasManager");
	var Service = require("../mysite/service");
	var Global=require("../mysite/scada/components/canvas/Global");
	var GlobalScadaView = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			
			this.element.html(globalHtml);
			
			this.elements = {
					tag_el:"tag-globalview",
					conent_el:"content-globalview"
			};
			Global.init();
			this.scadaId = options.scadaId;
			this.scadaName = null;
			this.newScadaData = null;
			this.siteList = null; 
			this.display=30;
			$("#canvas-glasspane").addClass("canvas-glasspane");
			$("#canvas-glasspane").css("display","none");
			$("#canvas-edit").addClass("canvas-edit");
			this.render();
		},
		
		render:function(){
			this.mask();
			this.renderLayout();
			this.renderScadaManager();
			this.renderScadaContent();
			this._renderModelEvent();
			this.renderScadaTable();
		},
		
		renderLayout:function(){
			if(this.layout){
				this.layout.destroy();
			}
			var self = this;
			this.layout = $("#global-scada-view").layout({
				defaults: {
                    paneClass: "pane",
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 1,
                    "spacing_closed": 1,
                    "togglerLength_closed": 50,
					togglerTip_open:locale.get({lang:"close"}),
                    togglerTip_closed:locale.get({lang:"open"}),  
                    resizable: false,
                    slidable: false
                },
                west: {
                    paneSelector: "#"+self.elements.tag_el,
                    size: 195
                },
                center: {
                    paneSelector: "#"+self.elements.conent_el
                },
                south:{
                	initClosed: true
                }
			});
		},
	
		renderScadaManager:function(){
			this.scadaTag = new ScadaManager({
				selector:"#"+this.elements.tag_el,
				service:Service
			});
		},
		
		renderScadaContent:function(){
			this.scadaContent = new ContentScada({
				selector:"#"+this.elements.conent_el,
				service:Service
			});
		},
		
		renderScadaTable:function(){
			var self =this;
			this.scadaTag.scadaContent.render(Service,function(data){
				if(data.result.length>0){
					if(self.scadaContent.elements.fullScreenEnabled){
        				$("#toolbar-all-screen-button").hide();
        				$("#toolbar-exit-screen-button").show();
        			}else{
        				$("#toolbar-exit-screen-button").hide();
        				$("#toolbar-all-screen-button").show();
        			}
            		
            		$("#toolbar-scada-edit-button").show();
					
					if(self.scadaId){
						var isNotHave = true;
						for(var i=0;i<data.result.length;i++){
							if(self.scadaId == data.result[i]._id){
								self.scadaTag.scadaContent.scadaTable.getRows()[i].click();
								isNotHave = false;
							}
						}
						if(isNotHave){
							self.scadaTag.scadaContent.scadaTable.getRows()[0].click();
		        		}
					}else{
						self.scadaTag.scadaContent.scadaTable.getRows()[0].click();
					}
				}else{
					var name=locale.get({lang:"no_picture"});
					self.scadaContent.renderSiteName_div(name);
            		self.scadaContent.clearCanvas();
            		$("#toolbar-all-screen-button").hide();
            		$("#toolbar-exit-screen-button").hide();
            		$("#toolbar-scada-edit-button").hide();
					self.unmask();
				}
			});
		},
		renderGetRole:function(display){
			 if(permission.app("_scada")["write"]){
				 $("#toolbar-scada-edit-button").show();
				 $("#tag-overview-add-button").show();
				 $("#tag-overview-delete-button").show();
				 $("#tag-overview-edit-button").show();
				 
				 if(display){
					 $("#canvas-glasspane").css("display","block");
				 }else{
					 $("#canvas-glasspane").css("display","none");
				 }
			 }else{
				 $("#toolbar-scada-edit-button").hide();
				 $("#tag-overview-add-button").hide();
				 $("#tag-overview-delete-button").hide();
				 $("#tag-overview-edit-button").hide();
				 
				 $("#canvas-glasspane").css("display","none");
			 }
		},
		_renderModelEvent:function(){
			var self = this;
			this.scadaContent.on({
				"editClick":function(){
							var scadaId = self.scadaId;
							var scadaName = self.scadaName;
							var newScadaData = self.newScadaData;
							
							var siteList = self.siteList;
							$("#user-content").empty();
							var appUrl = "./scadaManager/GlobalCanvasProperty";
							cloud.util.setCurrentApp({url:appUrl});   //cloud.platform.
				            if (cloud.platform.currentApplication && Object.isFunction(cloud.platform.currentApplication.destroy)) {
				            	cloud.platform.currentApplication.destroy();
				            	cloud.platform.currentApplication = null;
				            }
				            this.requestingApplication = appUrl;
				            require([appUrl], function(Application) {
			                	
								if (cloud.platform.currentApplication && Object.isFunction(cloud.platform.currentApplication.destroy)) {
									cloud.platform.currentApplication.destroy();
									cloud.platform.currentApplication = null;
								}
			                	
			                    //judge if the previous requesting application is canceled.
								$("#user-content").empty();
								cloud.util.unmask("#user-content");
								if (Application) {
									cloud.platform.currentApplication = new Application({
			                             container : "#user-content",
			                             scadaId : scadaId,
			                             scadaName: scadaName,
			                             siteList:siteList,
			                             newScadaData : newScadaData
			                        });
			                    }
			               }.bind(this));
				},
				"copyFromOther":function(){
					var scadaId = self.scadaId;
					new AgentCanvasManager({
						scadaId: scadaId,
	            		service: Service,
	            		optionsT: 0
					});
				},
				"loadData":function(){
//					//获取现场实时数据
					var canvasData = self.scadaContent.infoBoard.getData();
					var items = canvasData.items;
					
					var aliasJson={};
					var aliasList=[];
					var alias_VarId={};
					var siteId_alias_varId={};
					
					for(var i=0;i<items.length;i++){
						if(items[i].a && items[i].a.length > 0){
							for(var j=0;j<items[i].a.length;j++){
								var siteId=items[i].a[j].varId[0].split("_")[0];//现场ID
								var alias=items[i].a[j].varId[0].split("_")[1];//变量别名
								var varIdList=[];
								if(items[i].a[j].varId){
									for(var k=0;k < items[i].a[j].varId.length;k++){
										var varId=items[i].a[j].varId[k].split("_")[2];
										varIdList.push(varId);
										siteId_alias_varId[siteId+"_"+alias+"_"+varId]=varId;
									}
								}
								alias_VarId[siteId+"_"+alias]=varIdList;
							}
						}
					}
					for(key in alias_VarId){
						var aliasObj={};
						aliasObj.siteId=key.split("_")[0];
						aliasObj.alias=key.split("_")[1];
						aliasList.push(aliasObj);
					}
					aliasJson.devices=aliasList;
					//批量转换设备列表
					Service.getTransformDevice(aliasJson,function(data){
						var deviceAlias={};
						//遍历siteId_alias_varId
						for(key in siteId_alias_varId){
							 var varId=key.split("_")[2];
							if(deviceAlias[key.split("_")[0]+"_"+key.split("_")[1]]){
								deviceAlias[key.split("_")[0]+"_"+key.split("_")[1]].push(varId);
							}else{
								deviceAlias[key.split("_")[0]+"_"+key.split("_")[1]]=[];
								deviceAlias[key.split("_")[0]+"_"+key.split("_")[1]].push(varId);
							}
						   
						}
						var deviceList=[];
						var devicesJson={};
						var siteId_alias_varIds={};
						if(data.result){
							for(var j=0;j<data.result.length;j++){
								var deviceObj={};
								var deviceId=data.result[j].deviceId;
								deviceObj.deviceId=deviceId;
								
								var varList=deviceAlias[data.result[j].siteId+"_"+data.result[j].alias];
								deviceObj.varIds=varList;
								
								deviceList.push(deviceObj);
								
								siteId_alias_varIds[deviceId]=data.result[j].siteId+"_"+data.result[j].alias;
							}
						}
						devicesJson.devices=deviceList;
						var agentDataTime = {};
						var agentData = {};
						Service.getScadaVarData(devicesJson,function(data){
							if(data.result){
								for(var j=0;j<data.result.length;j++){
									var varInfo = data.result[j].vars;
									var deviceId= data.result[j].deviceId;
									var siteId_alias=siteId_alias_varIds[deviceId];
									if(varInfo && varInfo.length > 0){
										for(var ii=0;ii<varInfo.length;ii++){
											var times = varInfo[ii].endTime ? varInfo[ii].endTime : 0;
											agentDataTime[siteId_alias+"_"+varInfo[ii].id] = times;
											agentData[siteId_alias+"_"+varInfo[ii].id] = varInfo[ii].value ? varInfo[ii].value : "--";
										}
									}
								}
								if(self.scadaContent){
									self.scadaContent.updateCanvasValue(agentData,agentDataTime);
								}
							}
						
						});
					});
				}
			});
			
			this.scadaTag.scadaContent.scadaTable.on({
				"click":function(id,name){
					self.mask();
    				
    				 var defaulthtmls = $("<div id='noticeText' style='font-family:Droid Sans, Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;margin-left:50px;'>"+locale.get({lang:'the_scada_has_no_picture'})+"</div>" +
	                          "<div id='dosomething' style='padding-top:20px;margin-left:50px;'>" +
	                          "<input type='button' id='newFrame'  value='"+locale.get({lang:'add_content'})+"' class='toolbar-scada-3-button' />"+
	                          "<input type='button' id='copyOtherFrame' value='"+locale.get({lang:'copy_from_the_other_scada'})+"' class='toolbar-scada-3-button'  style='margin-left:40px;'/>"+
	                          "</div>");
					
					Service.getGlobalScadaInfoByScadaId(id,function(data){
						if(!data.result){
							self.scadaId = id;
							self.scadaName = name;
							self.newScadaData = null;
							self.scadaContent.clearDynamicComponentTimer();//清除动态组件的定时器
							self.scadaContent.clearCanvas();
							self.scadaContent.clearTime();
							self.scadaContent.renderSiteName_div(name);
							self.scadaContent.openCanvasView(null);
							self.scadaContent.refreshInterval=10 * 1000;
//							self.scadaContent.renderDefaultDiv(true,defaulthtmls);
							
						}else{
                            var result = data.result;
                            var scadaData = result.content;
                            self.scadaId = id;
							self.scadaName = name;
							self.newScadaData = scadaData;
							self.scadaContent.clearDynamicComponentTimer();
							self.scadaContent.clearCanvas();
							self.scadaContent.clearTime();
							self.scadaContent.renderSiteName_div(name);
							
							if(scadaData.region &&scadaData.items.length > 0){
								if(scadaData.refreshInterval){
									self.scadaContent.refreshInterval=scadaData.refreshInterval * 1000;
								}else{
									self.scadaContent.refreshInterval=10 * 1000;
								}
								if(self.scadaContent.refreshTimerId){
			    					window.clearInterval(self.scadaContent.refreshTimerId);
			    					self.scadaContent.refreshTimerId = null;
			    				}
								self.scadaContent.openCanvasView(scadaData);
							}else{
								if(self.scadaContent.refreshTimerId){
			    					window.clearInterval(self.scadaContent.refreshTimerId);
			    				}
								self.scadaContent.refreshInterval=10 * 1000;
							}
							
							self.scadaContent.infoBoard.loadData(scadaData);
							
							
							if(scadaData.region &&scadaData.items.length > 0){
								self.scadaContent.renderDefaultDiv(false);
								self.renderGetRole(false);
							}else{
								self.scadaContent.renderDefaultDiv(true,defaulthtmls);
								self.renderGetRole(true);
							}
							
						}
						
						self.unmask();
					});
				}
			});
			
			this.scadaTag.scadaToobar.on({
				"loadScadaData":function(id){
					if(id){
						self.scadaId=id;
					}
					self.renderScadaTable();
				},
				"deleteCanvas":function(){
				    var selectedResouces = self.getSelectedResources();
				    if (selectedResouces.length === 0) {
						dialog.render({lang:"please_select_at_least_one_config_item"});
					}else if(selectedResouces.length > 0){
						dialog.render({
		    				lang:"affirm_delete",
		    				buttons: [{
		    					lang:"affirm",
		    					click:function(){
		    						 for(var i=0;i<selectedResouces.length;i++){
		    							 var deleteScadaId=selectedResouces[i]._id;
							              Service.deleteGlobalScada(deleteScadaId,function(data){
							            	  self.scadaId="";
							            	  if(data.result){
										          self.renderScadaTable();
									          }
							              });
		    						 }
						             dialog.close();
		    					}
		    				},
		    				{
		    					lang:"cancel",
		    					click:function(){
		    						dialog.close();
		    					}
		    				}]
						});
				    }
				},
				"editCanvas":function(event){
					var selectedResouces = null;
					selectedResouces=self.getSelectedResources();
					if (selectedResouces.length === 0) {
				    	dialog.render({lang:"please_select_at_least_one_config_item"});
				    	event.preventDefault();
				    	return false;
				    }else if(selectedResouces.length > 1){
						dialog.render({lang:"please_select_at_only_one_config_item"});
						event.preventDefault();
				    	return false;
				    }else if(selectedResouces.length === 1){
						var id=selectedResouces[0]._id;
						var name=selectedResouces[0].name;
						self.scadaTag.scadaToobar.scadaId=id;
						self.scadaTag.scadaToobar.scadaName=name;
						$("#edit-scada-name").val(name);
					}
				}
//				"selectAll":function(selectAll,selectAllButton,moduleName){
//					if(selectAll==true){
//						self.scadaTag.scadaContent.scadaTable.selectRows();
//					}else{
//						self.scadaTag.scadaContent.scadaTable.unSelectRows();
//					}
//					var totalCount=self.scadaTag.scadaContent.scadaTable.getSelectedRows();
//					var selectedCount = self.getSelectedResources().size();
//		            selectAllButton.setText(selectedCount + "/" + totalCount);
//		            selectAllButton.setSelect(selectedCount === totalCount && totalCount !== 0);
//		            $("#" + moduleName + "-select-all label").text(selectedCount + "/" + totalCount);
//				}
			});
		},
		getSelectedResources:function(){
	       var self = this;
	       var selectedRes = $A();
	       self.scadaTag.scadaContent.scadaTable.getSelectedRows().each(function(row){
	           selectedRes.push(self.scadaTag.scadaContent.scadaTable.getData(row));
	       });
	       return selectedRes;
	    },
	    destroy:function(){
			if (this.layout && (!this.layout.destroyed)) {
            	this.layout.destroy();
            }
			
			if(this.scadaTag){
				this.scadaTag.destroy();
				this.scadaTag = null;
			}
			if(this.scadaContent){
				this.scadaContent.destroy();
				this.scadaContent = null;
			}
		}
	});
	return GlobalScadaView;
});