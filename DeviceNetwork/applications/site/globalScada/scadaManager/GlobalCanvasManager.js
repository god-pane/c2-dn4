/*
 * copy from other scada
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var Window = require("cloud/components/window");
	var html = require("text!./GlobalCanvasManager.html");
	var Table = require("cloud/components/table");
	var layout = require("cloud/lib/plugin/jquery.layout");
	var NoticeBar = require("./notice-bar");
	var Paging = require("cloud/components/paging");
	var columns = [
		           	{
		           		"title": locale.get({lang:"scadaName"}),
		           		"dataIndex": "name",
		           		"width": "90%"
//		           		"lang":"{text:scadaName}"
		           	},
		           	{
		           		"title": "",
		           		"dataIndex": "_id",
		           		"cls": "_id" + " " + "hide"
		           	}];
	var CopyFromScadaPanel = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.service=options.service;
			this.canvasData=options.canvasData;
			this.scadaId=options.scadaId;
			this.optionsT = options.optionsT;
			this.display = null;
			this.pageDisplay = 30;
			this.appUrl = "../globalview";
		    this.elements = {
		                bar: {
		                    id: "copyFromScada-bar",
		                    "class": null
		                },
		                table: {
		                    id: "copyFromScada-table",
		                    "class": null
		                },
		                paging: {
		                	id: "copyFromScada-paging",
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
				title=locale.get({lang:"application_to_other_scada"});
			}else{//从其他现场复制
				title=locale.get({lang:"copy_from_the_other_scada"});
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
			this.layout = $("#copyFromScada").layout({
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
                	 query: function(scadaName){
                		
                     },
                    copyToOther: function(canvasData,selectedResouces){//应用到其他现场
                		dialog.render({
            				lang:"affirm_copy",
            				buttons: [{
            					lang:"affirm",
            					click:function(){
            						cloud.util.mask("#copyFromScada");
            						self.service.getGlobalScadaInfoByScadaId(self.scadaId,function(data){
               						 if(data.result){
               						   var canvasData=data.result.content;
										  if(canvasData){
											  var items = canvasData.items;
											  if(items && items.length > 0){
												 for(var j=0;j<items.length;j++){
		        								         if(items[j].a) delete items[j].a;
		        							     }
		        								 canvasData.items = items;
		        								 var data = {
		      									         content:canvasData
		      									 };
		        								 for(var i=0;i<selectedResouces.length;i++){
		   										    var scadaId=selectedResouces[i]._id;
		        								    self.service.updateGlobalScada(scadaId,data,function(data){
      											    if(i==selectedResouces.length){
                  	 						            cloud.util.unmask("#copyFromScada");
                  	 								    self.windowCopyFromSite.destroy();
      											    }
      										        });
		        								 }
											  }else{
			 										dialog.render({lang:"this_item_canvas_empty"});
		        	 								cloud.util.unmask("#copyFromScada");
			 								  }
       								     }
           						      }
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
                     },
                     copyFromOther:function(selectedResouces){//从其他现场复制
                    		dialog.render({
                				lang:"affirm_copy",
                				buttons: [{
                					lang:"affirm",
                					click:function(){
                						cloud.util.mask("#copyFromScada");
                						//获取当前组态画面
                						self.service.getGlobalScadaInfoByScadaId(selectedResouces[0]._id,function(data){
                							if(data.result){
                								var canvasData = data.result.content;
                								if(canvasData){
                									var items = canvasData.items;
                									if(items && items.length > 0){
                										for(var i=0;i<items.length;i++){
                    										if(items[i].a) delete items[i].a;
                    									}
                										canvasData.items = items;
                										var data = {
            	 				    							content:canvasData
            	 				    						};
            	 										self.service.updateGlobalScada(self.scadaId,data,function(data){
            	 											if(data.result){
        	 				    								self.windowCopyFromSite.destroy();
                            	 								self.loadApplication(self.appUrl);
                            	 								cloud.util.unmask("#copyFromScada");
        	 				    					    	}
        	 				    						});
                									}else{
            	 										dialog.render({lang:"this_item_canvas_empty"});
                    	 								cloud.util.unmask("#copyFromScada");
            	 									}
                								}
    	 									}
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
        	cloud.util.mask("#copyFromScada");
        	 var self = this;
        	 var pageDisplay = this.pageDisplay;
        	 self.service.getGlobalScadaInfo(0, pageDisplay, function(data) {
        		 var total = data.result.length;
        		 var result=data.result;
        		 if(result.length){
        			 for(var i=0; i < result.length; i++){
        				 if(result[i]._id == self.scadaId){
        					result.splice(i,1);
        				 }
        			 }
        		 }
				 this.total = total;
        	     this.selectedCount = 0;
        	    	 if(parseInt(total,0) > pageDisplay){
        	    		 self.service.getGlobalScadaInfoPage(0, pageDisplay,function(data) {
        	    			 self.totalCount = data.result.length;
        	    			 cloud.util.unmask("#copyFromScada");
        	    			 self.siteTable.render(data.result);
        	    			 self._renderpage(data,1);
        	    		 },this);
        	    	 }else{
        	    		 self.totalCount = data.result.length;
                     	 self.selectedCount = 0;
                     	 cloud.util.unmask("#copyFromScada");
                     	 self.siteTable.render(data.result);
                     	 self._renderpage(data, 1);
        	    	 }
        	},this);
        },
        
        _renderpage:function(data, start){
        	var self = this;
        	if(this.page){
        		this.page.reset(data);
        	}else{
        		this.page = new Paging({
        			selector : $("#" + this.elements.paging.id),
        			data : data,
        			total:data.result.length,
        			current : start,
        			limit : this.pageDisplay,
        			requestData:function(options,callback){
        				self.service.getGlobalScadaInfoPage(options.cursor, options.limit, function(data){
//        					var total = data.result.length-1;
//        	    			var cursor = data.cursor;
//        					data.total = total;
//                        	data.cursor = cursor;
        					callback(data);
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
                         scadaId: self.scadaId
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
				this.paging = null;
			}
			
			
			if(this.siteTable){
				this.siteTable.destory();
				this.siteTable = null;
			}
			
            if (this.noticeBar) {
                this.noticeBar.destroy();
            }
           
        }
           
        
	});
	return CopyFromScadaPanel;
});