define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery.dataTables");
	var Toolbar = require("cloud/components/toolbar");
    var Button = require("cloud/components/button");
	var Table = require("cloud/components/table");
	var Paginate = require("cloud/components/paginate");
//	var Paging = require("cloud/components/paging");
	var columns = [
				{
					"title": "状态",
					"dataIndex": "online",
					"lang":"{text:state}",
					"cls": null,
					"width": "30%",
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
				},
	           	{
	           		"title": "现场名称",
	           		"dataIndex": "name",
	           		"width": "70%",
	           		"lang":"{text:site_name}"
	           	},
	           	{
	           		"title": "",
	           		"dataIndex": "_id",
	           		"cls": "_id" + " " + "hide"
	           	}];
	
	
	var ScadaViewSiteTable = Class.create(cloud.Component,{
		
		initialize:function($super,options){
			$super(options);
			this.display = 30;
		    this.pageDisplay = 3;
		    this.service=options.service;
		    this.elements = {
		    	toolbar:this.id+"-toolbar",
		    	content: this.id+"-content",
	            table: this.id+"-table",
	            paging: this.id+"-paging"
	        };
		    
		    this._render();
		  //初始化国际化
			locale.render({element:this.element});	
		},
		
		_render:function(){
			this._draw();
			this._renderLayout();
//			this.renderToolbar();
			this.renderScadaTable();
			this.renderToggler();
		},
		_draw:function(){  //"<div id=" + this.elements.toolbar + " class="+this.elements.toolbar+"></div>" +
			this.element.addClass("tag-overview");
			var html ="<div id=" + this.elements.content + " class="+this.elements.content+" style=\"height:auot;\">" +
            "<div id=" + this.elements.table + " class=" + this.elements.table + " style=\"height:100%\"></div>" +"</div>"+
            "<div id=" + this.elements.paging + " class="+this.elements.paging+"></div>" ;
			this.element.append(html);
		},
		
		_renderLayout:function(){
			this.layout = this.element.layout({
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
//                north:{
//                	paneSelector:"#"+this.elements.toolbar,
//                	size:30
//                },
                center: {
                    paneSelector: "#"+this.elements.content
                },
                south: {
                	"spacing_open":0,
                    paneSelector: "#"+this.elements.paging,
                    size: 30
                }
			});
		},
		renderToggler:function(){
			 $("#tag-scadaview-toggler").click(function(){
				 $(window).resize();
			 });
		},
		
		renderToolbar:function(){
			var editBtn = new Button({
                imgCls: "cloud-icon-edit",
                id: this.moduleName + "-edit-button",
                lang:"{title:edit_tag}"
            });

            this.toolbar = new Toolbar({
                selector: "#"+this.elements.toolbar,
                leftItems: [],
                rightItems: [editBtn]
            });
		},
		
		render:function(service,tag,callback){
			this.service.getTableResources(0, this.display, function(data) {
            	var total = tag.total;
            	this.total = total;
                this.totalCount = data.result.length;
                this.selectedCount = 0;
                if(this.dataTable){
                	this.dataTable.render(data.result);
//                	this._renderpage(data, 1);
                	if(parseInt(total,0) > this.display){
                		this._renderOldPage(Math.ceil(total/(this.display)),1);
                	}else{
                		this.nowPage = 1;
                		$("#"+this.elements.paging).empty();
                		this.paging = null;
                	}
                }
                callback && callback.call(this,data);
            }, this);
		},
		_renderOldPage: function(pagination,start) {
	        	var self = this;
				if (this.paging) {
					this.paging.render(start,pagination);
				}else{
					this.paging = new Paginate({
						display: this.pageDisplay,
						count: pagination,
						start: start,
						selector : $("#" + this.elements.paging),
						events: {
							change: function(page) {
								self._turnPage(page);
							},
							scope: this
						}
					});
				}
				
				this.nowPage = start;
			},
			
			
			_turnPage:function(page){
				var self = this;
//				this.fire("onTurnPage", page)
				this.mask();
				self.service.getTableResources((page-1)*(this.display),this.display,function(data){
					self.totalCount = data.length;
					self.selectedCount = 0;
	                self.dataTable.clearTableData();
    			    self.dataTable.render(data.result);
//    			    self.updateCountInfo();
    			    self.unmask();
    			    self.nowPage = page;
				},this);
			},

//		   _renderpage:function(data, start){
//	        	var self = this;
//	        	if(this.page){
//	        		this.page.reset(data);
//	        	}else{
//	        		this.page = new Paging({
//	        			selector : $("#" + this.elements.paging),
//	        			data : data,
//	        			total:data.total,
//	        			current : start,
//	        			limit : 3,
//	        			requestData:function(options,callback){
//	        				self.service.getTableResources(options.cursor, options.limit, function(data){
//	        					callback(data);
//	        				});
//	        			},
//	        			turn:function(data, nowPage){
//	        			    self.totalCount = data.result.length;
//	        			    self.dataTable.clearTableData();
//	        			    self.dataTable.render(data.result);
//	        				self.nowPage = parseInt(nowPage);
//	        			},
//	        			events : {
//	        			    "displayChanged" : function(display){
//	        			        self.display = parseInt(display);
//	        			    }
//	        			}
//	        		});
//	        		this.nowPage = start;
//	        	}
//	        },
//		
		renderScadaTable:function(){
			this.dataTable = new Table({
				selector:"#"+this.elements.table,
				data:[],
				pageSize:5000,
				autoWidth:false,
				pageToolBar:false,
				columns:columns,
                service:this.options.service,
                events: {
                    onRowClick: function(data) {
                    	if(data){
                    		this.fire("click", data._id,data.name);
                    	}
	                }
				}
			});
		},
		
		destroy:function(){
			
			if(this.paging){
				this.paging.destroy();
				this.paging = null
			}
			
			if(this.layout){
				this.layout.destroy();
				this.layout = null;
			}
			
			if(this.dataTable){
				this.dataTable.destroy();
				this.dataTable = null;
			}
		}
	
	});
	return ScadaViewSiteTable;
});