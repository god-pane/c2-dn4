/*
 * copy from other site
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var Window = require("cloud/components/window");
	var html = require("text!./AgentCanvasManager.html");
	var Table = require("cloud/components/table");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var NoticeBar = require("./notice-bar");
	var Paging = require("cloud/components/paging");
	var columns = [
	           	{
	           		"title":locale.get({lang:"state"}),
	           		"dataIndex": "online",
//	           		"lang":"{text:state}",
	           		"cls": null,
	           		"width": "8%",
	           		render:function(data, type, row){
	           			var display = "";
	           			if ("display" == type) {
	           				switch (data) {
	           					case 1:
	           						var onlineStr = locale.get({lang:"online"});
	           						display += new Template(
	           						"<div  style = \"display : inline-block;\" class = \"cloud-table-online\" title = \"#{status}\"}></div>")
	           						.evaluate({
	           							status : onlineStr
	           						});
	           						break;
	           					case 0:
	           						var offlineStr = locale.get({lang:"offline"});
	           						display += new Template(
	           						"<div  style = \"display : inline-block;\" class = \"cloud-table-offline\" title = \"#{status}\"}></div>")
	           						.evaluate({
	           							status : offlineStr
	           						});
	           						break;
	           					
	           					default:
	           						break;
	           				}
	           				return display;
	           			} else {
	           				return data;
	           			}
	           		}
	           	} , {
	           		"title":locale.get({lang:"site_name"}),
	           		"dataIndex": "name",
	           		"width": "20%",
//	           		"lang":"{text:site_name}"
	           	},/*{
	           		"title": "所属客户",
	           		"dataIndex": "customerName",
	           		"cls": null,
	           		"width": "20%"
	           	}, */{
	           		"title":locale.get({lang:"installation_address"}),
	           		"dataIndex": "address",
	           		"cls": null,
	           		"width": "20%",
//	           		"lang":"{text:installation_address}"
	           	}, {
	           		"title":locale.get({lang:"business_state"}),
	           		"dataIndex": "businessState",
	           		"cls": null,
	           		"width": "18%",
//	           		"lang":"{text:business_state}",
	           		render: function(data, type, row) {
	           			var display = "";
	           			if ("display" == type) {
	           				switch (data) {
	           					case 0:
	           						display = locale.get({lang:"construction"});
	           						break;
	           					case 1:
	           						display = locale.get({lang:"commissionin"});
	           						break;
	           					case 2:
	           						display = locale.get({lang:"fault"});
	           						break;
	           					case 3:
	           						display = locale.get({lang:"overhaul"});
	           						break;
	           					default:
	           						break;
	           				}
	           				return display;
	           			} else {
	           				return data;
	           			}
	           		}
	           	}, {
	           		"title":locale.get({lang:"contact_name"}),
	           		"dataIndex": "contact.name",
	           		"cls": null,
	           		"width": "15%",
//	           		"lang":"{text:contacter_name}"
	           	}, {
	           		"title":locale.get({lang:"contact_phone"}),
	           		"dataIndex": "contact.phone",
	           		"cls": null,
	           		"width": "15%",
//	           		"lang":"{text:contacter_phone}"
	           	}, {
	           		"title":locale.get({lang:"email"}),
	           		"dataIndex": "contact.email",
	           		"cls": null,
	           		"width": "10%",
//	           		"lang":"{text:email}"
	           	},
	           	{
	           		"title": "",
	           		"dataIndex": "_id",
	           		"cls": "_id" + " " + "hide"
	           	}];
	var CopyFromSitePanel = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.service=options.service;
			this.canvasData=options.canvasData;
			this.siteId=options.siteId;
			this.optionsT = options.optionsT;
			this.display = null;
			this.pageDisplay = 30;
			this.appUrl = "../scada/template/scadaview";
		    this.elements = {
		                bar: {
		                    id: "copyFromSite-bar",
		                    "class": null
		                },
		                table: {
		                    id: "copyFromSite-table",
		                    "class": null
		                },
		                paging: {
		                	id: "copyFromSite-paging",
		                	"class": null
		                }
		            };
			this.render();
			//初始化国际化
			locale.render({element:this.element});
		},
		
		render:function(){
			this.destroy();
	        this._renderHtml();
			this.renderCopyFromSiteWindow();
			this.renderLayout();
			this._renderTable();
			this._renderNoticeBar();
		},
	    _renderHtml: function(){
	            this.element.html(html);
	    },
		renderCopyFromSiteWindow:function(){
			var title=null;
			if(this.optionsT){//应用到其他现场
				title=locale.get({lang:"application_to_other_site"});
			}else{//从其他现场复制
				title=locale.get({lang:"copy_from_the_other_site"});
			}
			this.windowCopyFromSite = new Window({
				container: "body",
				title: title,
				top: "center",
				left: "center",
				width: 900,
				height: 500,
				drag:true,
				mask: true,
				content: "<div id='canvas-panel-box'></div>",
				events: {
					"beforeClose": function() {
					}.bind(this),
					"onClose": function() {
					}.bind(this),
					"onShow": function() {
					}
				},
				scope: this
			});
			this.windowCopyFromSite.show();
			this.windowCopyFromSite.setContents(html);
		},
		renderLayout:function(){
			if(this.layout){
				this.layout.destory();
			}
			this.layout = $("#copyFromSite").layout({
				defaults: {
					paneClass: "pane",
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 1,
                    "spacing_closed": 1,
                    "togglerLength_closed": 50,
                    resizable: false,
                    slidable: false,
                    closable: false
                },
                north: {
                	 paneSelector: "#" + this.elements.bar.id,
                     size: "33"
                },
                center:{
                	 paneSelector: "#" +this.elements.table.id
                },
				south:{
					 paneSelector: "#" + this.elements.paging.id,
					 size: "38"
				}
			});
		},
        _renderNoticeBar: function(){
            var self = this;
            this.noticeBar = new NoticeBar({
                selector: "#" + this.elements.bar.id,
                service: this.service,
                canvasData:this.canvasData,
                siteTable:self.siteTable,
                optionsT : this.optionsT,
                events: {
                	 query: function(siteName){
                		cloud.util.mask("#copyFromSite");
                		var changeDisplay=$(".paging-limit-select").val();
 						if(siteName){  //查询条件不为空
 							  self.options.service.getSitelistByName(siteName,0,changeDisplay, function(datas){
 		 					    	cloud.util.unmask("#copyFromSite");
 		 					    	if(datas.result && datas.result.length >0 ){
 		 					    		for(var i=0;i<datas.result.length;i++){
 		 					    			if(self.siteId == datas.result[i]._id){
 		 					    				datas.result.splice(i,1);
 		 			    						break;
 		 					    			}
 		 					    		}
 		 					    	}
 									 if(self.siteTable){
 										 self.siteTable.render(datas.result);
 										 self._renderpage(datas, 1);
 									 }
 								});
 						}else{       //查询条件为空是默认显示所有的现场
 							self.loadData();
 						}
 					  
                     },
                    /*
                     * “从其他现场复制”和“复制到其他现场”，应该是整体替换现场的所有画面，不是追加
                     */
                    copyToOther: function(selectedResouces){//应用到其他现场
                		dialog.render({
            				lang:"affirm_copy",
            				buttons: [{
            					lang:"affirm",
            					click:function(){
            						cloud.util.mask("#copyFromSite");
            						self.service.getScadaBySiteId(self.siteId,function(data){
            						 if(data.result){
            						   var canvasData=data.result.content;
            						   for(var i=0;i<selectedResouces.length;i++){
										  var scadaId=selectedResouces[i]._id;
										  if(canvasData){
        									 for(var ii=0;ii<canvasData.length;ii++){
	 											var items = canvasData[ii].items;
            									for(var iii=0;iii<items.length;iii++){
            										if(items[iii].a) delete items[iii].a;
            									}
            									canvasData[ii].items = items;
	 										}
        								  }
        								var data = {
        										name:"a_scada_"+cloud.util.random(1,999999999),
												type:"1",
												content:canvasData
										};
        								self.service.onScadaOk(scadaId,data,function(data){
											if(i==selectedResouces.length){
												cloud.util.unmask("#copyFromSite");
												self.windowCopyFromSite.destroy();
											}
										});
            						  }
            						 }else{
	 										dialog.render({lang:"this_item_canvas_empty"});
        	 								cloud.util.unmask("#copyFromSite");
	 								  }
            						 });
            						
//            							var isHaveCanvas = false;
//            							var canvas = {};
//            							if(data.result){
//            								var canvasData =data.result.content;
//            								for(var ii=0;ii<canvasData.length;ii++){
//            									if(canvasData[ii].items.length > 0) {
//            										isHaveCanvas = true;
//            										canvas[canvasData[ii].canvasId] = canvasData[ii];
//            									}
//            									var items = canvasData[ii].items;
//            									for(var iii=0;iii<items.length;iii++){
//            										if(items[iii].a) delete items[iii].a;
//            									}
//            									canvasData[ii].items = items;
//            								}
//            								if(canvasData.length>0 && isHaveCanvas){
//            									cloud.util.mask("#copyFromSite");
//            									for(var i=0;i<selectedResouces.length;i++){
//            										var id=selectedResouces[i]._id;
//            										self.service.getScadaBySiteId(selectedResouces[i]._id,function(data,id){
//            											var thisId = id;
//            											var newCanvas = [];
//            											if(data.result){
//            												newCanvas = data.result.content;
//            												for(var j=0;j<newCanvas.length;j++){
//            													var scadasId = cloud.util.random(1,999999999);
//            													if(canvas[newCanvas[j].canvasId]) newCanvas[j].canvasId=scadasId;
//            												}
//            												
//            												for(src in canvas){
//            													newCanvas.push(canvas[src]);
//            												}
//            											}else{
//            												newCanvas = canvasData;
//            											}
//            											var data = {
//            													name:"a_scada_"+cloud.util.random(1,999999999),
//            													type:"1",
//            													content:newCanvas
//            											};
//            											self.service.onScadaOk(thisId,data,function(data){
//            												if(i==selectedResouces.length){
//            													cloud.util.unmask("#copyFromSite");
//            													self.windowCopyFromSite.destroy();
//            												}
//            											});
//            											
//            										});
//            									}
//            								}else{
//            									dialog.render({lang:"this_item_canvas_empty"});
//                								cloud.util.unmask("#copyFromSite");
//            								}
//            							}else{
//            								dialog.render({lang:"this_item_canvas_empty"});
//            								cloud.util.unmask("#copyFromSite");
//            							}
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
                     },
                     copyFromOther:function(selectedResouces){//从其他现场复制
                    		dialog.render({
                				lang:"affirm_copy",
                				buttons: [{
                					lang:"affirm",
                					click:function(){
                						cloud.util.mask("#copyFromSite");
                						//获取当前现场的组态画面
                						self.service.getScadaBySiteId(selectedResouces[0]._id,function(data){
                							if(data.result){
                								var otherCanvas = data.result.content;
                								if(otherCanvas){
                									for(var ii=0;ii<otherCanvas.length;ii++){
        	 											var items = otherCanvas[ii].items;
                    									for(var iii=0;iii<items.length;iii++){
                    										if(items[iii].a) delete items[iii].a;
                    									}
                    									otherCanvas[ii].items = items;
        	 										}
                								}
                								
    	 										var data = {
    	 												name:"a_scada_"+Math.random(),
                	 				    				type:"1",
    	 				    							content:otherCanvas
    	 				    						};
    	 										self.service.onScadaOk(self.siteId,data,function(data){
                	 								self.windowCopyFromSite.destroy();
                	 								self.loadApplication(self.appUrl);
                	 								cloud.util.unmask("#copyFromSite");
                	 							});
    	 									}else{
    	 										dialog.render({lang:"this_item_canvas_empty"});
            	 								cloud.util.unmask("#copyFromSite");
    	 									}
//                							var canvasData = [];
//                							if(data.result){
//            	 								canvasData = data.result.content;
//            	 								for(var i = 0;i<canvasData.length;i++){
//            	 									scadas[canvasData[i].canvasId] = canvasData[i];
//            	 								}
//                							}
//                							self.service.getScadaBySiteId(selectedResouces[0]._id,function(data){
//        	 									if(data.result){
//        	 										var isHaveCanvas = false;
//        	 										var otherCanvas = data.result.content;
//        	 										for(var ii=0;ii<otherCanvas.length;ii++){
//        	 											if(otherCanvas[ii].items.length > 0){
//        	 												isHaveCanvas = true;
//        	 												var scadasId = cloud.util.random(1,999999999);
//        	 												if(scadas[otherCanvas[ii].canvasId]) otherCanvas[ii].canvasId = scadasId;
//        	 											}
//        	 										}
//        	 										if(otherCanvas.length>0 && isHaveCanvas){
//        	 											for(var ii=0;ii<otherCanvas.length;ii++){
//            	 											var items = otherCanvas[ii].items;
//                        									for(var iii=0;iii<items.length;iii++){
//                        										if(items[iii].a) delete items[iii].a;
//                        									}
//                        									otherCanvas[ii].items = items;
//                        									
//                        									if(otherCanvas[ii].items.length >0){
//            	 												canvasData.push(otherCanvas[ii]);
//            	 											}
//            	 										}
//        	 											
//        	 											var data = {
//        	 													name:"a_scada_"+Math.random(),
//                        	 				    				type:"1",
//                        	 				    				content:canvasData
//                            							};
//                        	 							self.service.onScadaOk(self.siteId,data,function(data){
//                        	 								self.windowCopyFromSite.destroy();
//                        	 								self.loadApplication(self.appUrl);
//                        	 								cloud.util.unmask("#copyFromSite");
//                        	 							});
//        	 										}else{
//        	 											dialog.render({lang:"this_item_canvas_empty"});
//                    	 								cloud.util.unmask("#copyFromSite");
//        	 										}
//        	 									}else{
//        	 										dialog.render({lang:"this_item_canvas_empty"});
//                	 								cloud.util.unmask("#copyFromSite");
//        	 									}
//        	 								});
                						});
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
                  
                }
            });
        },
        _renderTable: function(){
            this.siteTable = new Table({
                selector:"#" + this.elements.table.id,
                columns: columns,
                datas: [],
                pageSize: 100,
                autoWidth: false,
                pageToolBar: false,
                checkbox:"full",
                events: {
                }
            });
            
            this.setDataTable();
        },
        setDataTable: function(){
        	this.loadData();
        },
        
        loadData:function(){
        	cloud.util.mask("#copyFromSite");
    		var self = this;
        	this.service.inherentTags[0].loadResourcesData(0,this.pageDisplay,function(data){
    			var total = data.total-1;
    			var cursor = data.cursor;
    			if(data.result){
    				var ids = data.result;
    				for(var i=0;i<ids.length;i++){
    					if(self.siteId == ids[i]){
    						ids.splice(i,1);
    						break;
    					}
    				}
        			cloud.Ajax.request({
        				url : "api/sites/list",
                        type : "post",
                        parameters : {
                            verbose : 100,
                            limit : self.pageDisplay
                        },
                        data : {
                            resourceIds : ids
                        },
                        success : function(data) {
                        	data.total = total;
                        	data.cursor = cursor;
                        	self.totalCount = data.result.length;
                        	self.selectedCount = 0;
                        	if(self.siteTable){
                        		cloud.util.unmask("#copyFromSite");
                        		self.siteTable.render(data.result);
                        		self._renderpage(data, 1);
                        	}
                        }
        			});
    			}
    		});
        },
        
        _renderpage:function(data, start){
        	var self = this;
        	if(this.page){
        		this.page.reset(data);
        	}else{
        		this.page = new Paging({
        			selector : "#" + this.elements.paging.id,
        			data:data,
    				current:1,
    				total:data.total,
    				limit:this.pageDisplay,
        			requestData:function(options,callback){
//        				self.service.getTableResources(options.cursor, options.limit, function(data){
//        					callback(data);
//        				});
        				var siteName=$("#sitename").val();
        	        	self.service.inherentTags[0].loadAllSiteData(siteName,options.cursor,options.limit,function(data){
        	    			var total = data.total-1;
        	    			var cursor = data.cursor;
        	    			if(data.result){
        	    				var ids = data.result;
        	    				for(var i=0;i<ids.length;i++){
        	    					if(self.siteId == ids[i]){
        	    						ids.splice(i,1);
        	    						break;
        	    					}
        	    				}
        	        			cloud.Ajax.request({
        	        				url : "api/sites/list",
        	                        type : "post",
        	                        parameters : {
        	       	                	limit:options.limit,
        	       	                	verbose:100
        	                        },
        	                        data : {
        	                            resourceIds : ids
        	                        },
        	                        success : function(data) {
        	                        	data.total = total;
        	                        	data.cursor = cursor;
        	                        	callback(data);
        	                        }
        	        			});
        	    			}
        	    		});
        				
        				
        			},
        			turn:function(data, nowPage){
        			    self.totalCount = data.result.length;
        			    self.siteTable.clearTableData();
        			    self.siteTable.render(data.result);
        				self.nowPage = parseInt(nowPage);
        			},
        			events : {
        			    "displayChanged" : function(display){
        			        self.display = parseInt(display);
        			    }
        			}
        		});
        		this.nowPage = start;
        	}
        },
        loadApplication:function(application){
			var self = this;
			cloud.util.setCurrentApp({url:application});
            if (this.currentApplication && Object.isFunction(this.currentApplication.destroy)) {
                this.currentApplication.destroy();
                this.currentApplication = null;
            }
            this.requestingApplication = application;
            require([application], function(Application) {
            	
				if (this.currentApplication && Object.isFunction(this.currentApplication.destroy)) {
					this.currentApplication.destroy();
					this.currentApplication = null;
				}
            	
                //judge if the previous requesting application is canceled.
				$("#user-content").empty();
				cloud.util.unmask("#user-content");
				if (Application) {
                    this.currentApplication = new Application({
                         container: "#user-content",
                         service: self.service,
                         siteid: self.siteId
                    });
                }
           }.bind(this));
		},
        destroy: function(){
            if (this.layout) {
                if (this.layout.destroy) {
                    this.layout.destroy();
                }
                else {
                    this.layout = null;
                }
            }
            if(this.paging){
				this.paging.destroy();
				this.paging = null
			}
			
			
			if(this.siteTable){
				this.siteTable.destory();
				this.siteTable = null;
			}
			
            if (this.noticeBar) {
                this.noticeBar.destroy();
            }
			$("#canvas-glasspane").css("display","none");
        }
           
        
	});
	return CopyFromSitePanel;
});