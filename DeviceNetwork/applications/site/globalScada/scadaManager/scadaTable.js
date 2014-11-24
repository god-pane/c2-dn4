define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery.dataTables");
	var Table = require("cloud/components/table");
	var Paginate = require("cloud/components/paginate");
	var columns = [
	           	{
	           		"title": locale.get({lang:"scadaName"}),
	           		"dataIndex": "name",
	           		"width": "90%"
//	           		"lang":"{text:scadaName}"
	           	},
	           	{
	           		"title": "",
	           		"dataIndex": "_id",
	           		"cls": "_id" + " " + "hide"
	           	}];
	
	
	var Scada = Class.create(cloud.Component,{
		
		initialize:function($super,options){
			$super(options);
		    this.service=options.service;
		    this.elements = {
		            table: this.id+"-table",
		            paging: this.id+"-paging"
		        };
		     this.display = 30;
		     this.pageDisplay = 3;
		     this._render();
		     //初始化国际化
		     locale.render({element:this.element});	
		},
		
		_render:function(){
			 this._draw();
			 this.renderLayout();
			 this._renderTable();
			 this.renderToggler();
		},
		_draw:function(){  //"<div id=" + this.elements.toolbar + " class="+this.elements.toolbar+"></div>" +
			this.element.addClass("tag-overview");
			var html = "<div id=" + this.elements.table + " class=" + this.elements.table + " style=\"height:100%\"></div>" +
            "<div id="+this.elements.paging+" class="+this.elements.paging+"></div>" ;
			this.element.append(html);
		},
		
		render:function(service,callback){
			var self = this;
			 service.getGlobalScadaInfo(0, this.display,function(data) {
				 var total = data.result.length;
				 this.total = total;
        	     this.selectedCount = 0;
        	     if(this.scadaTable){
        	    	 if(parseInt(total,0) > this.display){
        	    		 service.getGlobalScadaInfoPage(0, this.display,function(data) {
        	    			 self.totalCount = data.result.length;
        	    			 self.scadaTable.render(data.result);
        	    			 self._renderOldPage(Math.ceil(total/(this.display)),1);
        	    			 callback && callback.call(this,data);
        	    		 },this);
        	    	 }else{
        	    		 self.scadaTable.render(data.result);
        	    		 this.nowPage = 1;
        	    		 $("#"+this.elements.paging).empty();
        	    		 this.paging = null;
        	    		 callback && callback.call(this,data);
        	    	 }
        	     }
        	     
        	}, this);
			 
	        	
		},
	    renderLayout:function(){
			if(this.layout){
				this.layout.destory();
			}
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
                center: {
                    paneSelector: "#"+this.elements.table
                },
                south: {
                	"spacing_open":0,
                    paneSelector: "#"+this.elements.paging,
                    size: 30
                }
			});
		},
		renderToggler:function(){
			 $("#tag-globalview-toggler").click(function(){
				 $(window).resize();
			 });
		},
		 _renderTable: function(){
			 this.scadaTable = new Table({
				 selector:"#"+this.elements.table,
				 columns: columns,
				 datas: [],
				 pageSize: 100,
				 autoWidth: false,
				 pageToolBar: false,
				 checkbox:"full",
				 events: {
					 onRowClick: function(data) {
						 if(data){
							 this.fire("click", data._id,data.name);
						 }
					 }
				 }
	         });
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
				this.mask();
				self.service.getGlobalScadaInfoPage((page-1)*(this.display),this.display,function(data){
					self.totalCount = data.result.length;
					self.selectedCount = 0;
	                self.scadaTable.clearTableData();
 			        self.scadaTable.render(data.result);
 			        self.unmask();
 			        self.nowPage = page;
				});
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
				
				
				if(this.scadaTable){
					this.scadaTable.destroy();
					this.scadaTable = null;
				}
				
	        }
	
	});
	return Scada;
});