define(function(require){
	require("cloud/lib/plugin/jquery.layout");
	var Toolbar = require("cloud/components/toolbar");
	var Board = require("../../mysite/scada/components/canvas/Board");
//	require("../../mysite/agent/Configure");
	require("../../mysite/scada/utils/Helper");
	require("cloud/lib/plugin/jquery.qtip");
	require("../../mysite/agent/AgentDrawableFromProperty");
	var AgentCanvasManager = require("../scadaManager/GlobalCanvasManager");
	var Button = require("cloud/components/button");
	var Configure=require("../../mysite/agent/Configure");
	var GlobalCanvasDrable = Class.create(cloud.Component,{
		initialize:function($super,options){
			this.moduleName = "agent-drawable-center";
			$super(options);
			this.elements={
					toolbar:this.id+"-toolbar",
					content:this.id+"-content",
					canvas:this.id+"-canvas",
					timescroll:this.id+"-time",
					imagesdiv:"nts-module-common-canvas-global-resources"
			};
			this.canvasOptions = {
			};
			this.allScadaData = [];
			this.scadaId = options.scadaId;
			this.canvasOptions[this.scadaId] = null;
			this.scadaName = options.scadaName;
			this.newScadaData = options.newScadaData;
			this.service = options.service;
			this.siteList = options.siteList;
			this.appUrl = "../globalview";
			this.toolbar = null;
			this.Canvastoolbar = null;
			this.agentCanvasTool= null;
			$("#toolbar").empty();
			this._render();
		},
		
		_render:function(){
			this.draw();
			this.renderLayout();
			this.renderToolbar();
			this.renderScadaViewPanel();
			this.renderScadaViewSort();
			this.renderScadaViewData();
			this.infoBoard.canvas.el.on('dblclick', this.onBoardDblClick, this);
			this.renderSiteName();
			this.renderCanvasToolbar();
			this.renderRefreshTime();
		},
		
		draw:function(){
			var html = "<div id="+this.elements.toolbar+" class="+this.elements.toolbar+"></div>"+
					   "<div id="+this.elements.content+" class="+this.elements.content+" style=\"height:auto\">"+
					   "<div id=\"scada-comp-101\" style=\"height:100%;\"></div>"+
					   "<div id=\"scada-comp-103\" style=\"height:100%;overflow-x:hidden;overflow-y:hidden;\"></div>"+//此处放的现场名称
					   "<div id="+this.elements.canvas+" class="+this.elements.canvas+" style=\"height:100%\"></div>"+
					   "<div id=\"scada-comp-102\" style=\"height:100%;\"></div>"+
					   "</div>"+
					   "<div id=" + this.elements.timescroll + " class=" + this.elements.timescroll + "></div>";
			this.element.html(html);
		},
		
		renderLayout:function(){
			this.layout = this.element.layout({
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
                north: {
                    paneSelector: "#" + this.elements.toolbar,
                    size: 29
                },
                center: {
                    paneSelector: "#" + this.elements.content
                },
                south: {
					"spacing_open": 0,
					paneSelector: "#" + this.elements.timescroll,
					size : 30
				}
			});
			
			this.contentScadaLayout = $("#"+this.elements.content).layout({
				defaults: {
                    paneClass: "pane",
                    "togglerLength_open": 50,	
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 0,
                    "spacing_closed": 1,
                    "togglerLength_closed": 50,
                    resizable: false,
                    slidable: false,
                    closable: false
                },
                west: {
                    paneSelector: "#scada-comp-101",
                    size: 30
                },
                north: {
               	 paneSelector: "#scada-comp-103",
                    size: 20
                },
                center: {
                    paneSelector: "#" + this.elements.canvas
                },
				east: {
					paneSelector: "#scada-comp-102",
					size : 30
				}
			});
		},
		renderSiteName:function(){
			 var self = this;
            var $htmls = $(+"<div></div>" +
            "<div id='scadaName' style='text-align:center;font-weight:bold;font-size:18px'>" +
            "</div>");
            $("#scada-comp-103").append($htmls);
		},
		renderSiteName_div:function(scadaName){
			document.getElementById('scadaName').innerText=scadaName;
		},
		onText:function(){
			var inputText=$("#textEdits").val();
			if(!inputText.empty()){//不能为空
				if(inputText.length <= 30){
					this.infoBoard.selectedDrawables[0].editText=$("#textEdits").val();
					this.infoBoard.redrawCanvas();
					$("#canvas-edit").css("display","none");
				}else{
					dialog.render({lang:"tag_length_only_in"});
				}
			}else{
				dialog.render({lang:"textEdit_cannot_be_empty"});
			}
			
		},
		renderCanvasToolbar:function(){
			var self = this;
			var $editScadaButton = new Button({
                id: "toolbar-scada-edit-button",
                imgCls: "cloud-icon-edit",
                title:locale.get({lang:"edit"}),
                lang:"{title:edit}"
            });
			var $delButton = new Button({
                id: "toolbar-scada-delete-el-button",
                imgCls: "cloud-icon-reduce",
                title:locale.get({lang:"delete_scada"}),
                lang:"{title:delete_scada}"
            });
			var $copyPastButton = new Button({
                id: "toolbar-scada--copyPast-button",
                imgCls: "cloud-icon-copy",
                title:locale.get({lang:"copyPast_scada"}),
                lang:"{title:copyPast_scada}"
            });
			var $rotation= new Button({
                id: "toolbar-scada--rotation-button",
                imgCls: "cloud-icon-reset",
                title:locale.get({lang:"rotation"}),
                lang:"{title:rotation}"
            });
			var $stackingOrder= new Button({//叠放次序--向下
                id: "toolbar-scada-stackingOrder-button",
                imgCls: "cloud-icon-stackingOrder",
                title:locale.get({lang:"stacking_order"}),
                lang:"{title:stacking_order}"
            });
			var $stackingUp= new Button({//叠放次序--向上
                id: "toolbar-scada-stackingUp-button",
                imgCls: "cloud-icon-stackingup",
                title:locale.get({lang:"stacking_up"}),
                lang:"{title:stacking_up}"
            });
			var $editTextButton = new Button({//编辑文字标签
                id: "toolbar-text-edit-button",
                imgCls: "cloud-icon-edit",
                title:locale.get({lang:"edit"}),
                lang:"{title:edit}"
            });
			var $textBold=new Button({
                id: "toolbar-text-bold-button",
                imgCls: "canvas-icon-bold",
                title:locale.get({lang:"bold"}),
                lang:"{title:bold}"
            });
			//========文字大小==========================================
			var $textFont = $(+"<div></div>" +
					"<div id='textFont-bar' style='color:black;width:auto;margin-top:1px;'>" +locale.get({lang:"fontSize"})+
					"<select id='textFont' style='width:53px;height:25px;'>"+
                    "<option value='0'>12</option>"+
                    "<option value='1'>14</option>"+
                    "<option value='2'>16</option>"+
                    "<option value='3'>18</option>"+
                    "<option value='4'>20</option>"+
                    "<option value='5'>22</option>"+
                    "<option value='6'>26</option>"+
                    "<option value='7'>28</option>"+
                    "<option value='8'>36</option>"+
                    "<option value='9'>48</option>"+
                    "<option value='10'>56</option>"+
                    "<option value='11'>72</option>"+
                    "</select>"+
                    "</div>");
			//========编辑文字标签=======================================
            var $htmls = $(+"<div></div>" +
                    "<div id='text-bar' style='color:black;width:auto;margin-top:1px;'>" +locale.get({lang:"textContent"})+
                    "<input style='color:black;width:120px' type='text'  id='textEdits' />"  +
                    "</div>");
            new Button({
                container: $htmls,
                imgCls: "cloud-icon-yes",
                events: {
                    click: self.onText,
                    scope: self
                }
            });
            //=========================================================
            this.Canvastoolbar = new Toolbar({
                selector: "#toolbar",
                leftItems: [$editScadaButton,$editTextButton,$textBold,$textFont,$delButton,$copyPastButton,$rotation,$stackingOrder,$stackingUp]
            });
          //改变文字大小
			$("#textFont-bar").removeClass("cloud-toolbar-item-content");
			$("#textFont").bind('change', function () {
				var selectedId = $("#textFont").find("option:selected").text();
				self.infoBoard.selectedDrawables[0].titles[0].size=selectedId;
				if(selectedId == '72'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+55;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+55;
				}else if(selectedId == '56'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+45;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+45;
				}else if(selectedId == '48'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+35;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+35;
				}else if(selectedId == '36'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+25;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+25;
				}else if(selectedId == '28'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+17;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+17;
				}else if(selectedId == '26'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+15;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+15;
				}else if(selectedId == '22'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+10;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+10;
				}else if(selectedId == '20'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+8;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+8;
				}else if(selectedId == '18'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+6;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+6;
				}else if(selectedId == '16'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+4;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+4;
				}else if(selectedId == '14'){
					self.infoBoard.selectedDrawables[0].width=135;
					self.infoBoard.selectedDrawables[0].height=21;
					self.infoBoard.selectedDrawables[0].width=self.infoBoard.selectedDrawables[0].width+2;
					self.infoBoard.selectedDrawables[0].height=self.infoBoard.selectedDrawables[0].height+2;
				}
		    	self.infoBoard.redrawCanvas();
	        });
			//编辑文字内容
		    $("#toolbar-text-edit-button").click(function(){
		    	$("#toolbar").addClass("edit");
		    	$("#toolbar-text-edit-button").hide();
		    	$("#toolbar-scada-delete-el-button").hide();
		    	$("#toolbar-text-bold-button").hide();
		    	$("#textFont-bar").hide();
		    	$("#toolbar-text-edit-button").after($htmls);
		    	$("#text-bar").show();
		    	if(self.infoBoard.selectedDrawables[0].editText){
		    		$("#textEdits").val(self.infoBoard.selectedDrawables[0].editText);
		    	}else{
		    		$("#textEdits").val("");
		    	}
		    });
		    //文字加粗
		    $("#toolbar-text-bold-button").toggle(function(){
		    	self.infoBoard.selectedDrawables[0].titles[0].bold="bold";
		    	self.infoBoard.redrawCanvas();
		    },function(){
		    	self.infoBoard.selectedDrawables[0].titles[0].bold="";
		    	self.infoBoard.redrawCanvas();
		    });
			//编辑组件
			$("#toolbar-scada-edit-button").click(function(){
				self.onProperty();
			});
			//删除组件
			$("#toolbar-scada-delete-el-button").click(function(){
				self.infoBoard.deleteSelections();
				$("#canvas-edit").css("display","none");
			});
			//复制粘贴
			$("#toolbar-scada--copyPast-button").click(function(){
				//复制
				self.clipboardDrawables = [];
				for( var i = 0; self.infoBoard.selectedDrawables && i < self.infoBoard.selectedDrawables.length; i ++ )
				{
					self.clipboardDrawables.push(self.infoBoard.selectedDrawables[i]);
				}
				
				//粘贴
				var newDrawables = [];
				for( var i = 0 ; self.clipboardDrawables && i < self.clipboardDrawables.length; i ++ )
				{
					var drawable = self.clipboardDrawables[i];
					var config = drawable.getData();
					config.x += 50;
					config.y += 50;
					var newDrawable = new Nts.Module.Common.Canvas.Drawable(config);
					self.infoBoard.addDrawable(newDrawable);
					newDrawables.push(newDrawable);
				}
				self.infoBoard.sortDrawables();
				self.infoBoard.resizeDrawableRegion(false);
				self.infoBoard.setSelections(newDrawables);
			});
			//旋转
			$("#toolbar-scada--rotation-button").click(function(){
				var drawable = self.infoBoard.selectedDrawables;
				//一次只能旋转一张图片
				if(drawable[0].images[0].rotation){
					 drawable[0].images[0].rotation=drawable[0].images[0].rotation+ 90;
				}else{
					 drawable[0].images[0].rotation=90;
				}
					
				if(drawable[0].images[0].rotation > "360"){
					 drawable[0].images[0].rotation = 90;
				}
					
				if(drawable[0].titles && drawable[0].titles.length > 0){
				     for(var i=0;i<drawable[0].titles.length;i++){
						  drawable[0].titles[i].rotation=drawable[0].images[0].rotation;
					  }	
				}
					
				self.infoBoard.redrawCanvas();
				
				$("#canvas-edit").css("display","block");
				
			});
			//向下
			$("#toolbar-scada-stackingOrder-button").click(function(){
				var min_mz=[];
				var index_up=-1;
				var index_down=-1;
				for( var i = 0; i < self.infoBoard.sortedDrawables.length; i ++ )
				{
					var drawable= self.infoBoard.sortedDrawables[i];
					min_mz.push(drawable.mz);
				}
				var drawable = self.infoBoard.selectedDrawables;
				if(drawable[0].mz == min_mz.min()){
					dialog.render({lang:"has_been_at_the_bottom"});
				}else{
					for( var i = 0; i < self.infoBoard.sortedDrawables.length; i ++ )
					{
						var drawables= self.infoBoard.sortedDrawables[i];
						if(drawables.mz == drawable[0].mz){
							index_down=i;
						}
						if(drawables.mz == drawable[0].mz - 1){
							index_up=i;
						}
						if(index_down !=-1 && index_up !=-1){
							break;
						}
					}
						self.infoBoard.sortedDrawables[index_down].mz -=1;
						self.infoBoard.sortedDrawables[index_up].mz +=1;
						
						self.infoBoard.sortDrawables();
						self.infoBoard.redrawCanvas();
				}
			});
			//向上
			$("#toolbar-scada-stackingUp-button").click(function(){
				var max_mz=[];
				var index_up=-1;
				var index_down=-1;
				for( var i = 0; i < self.infoBoard.sortedDrawables.length; i ++ )
				{
					var drawable= self.infoBoard.sortedDrawables[i];
					max_mz.push(drawable.mz);
				}
				var drawable = self.infoBoard.selectedDrawables;
				if(drawable[0].mz == max_mz.max()){
					dialog.render({lang:"has_been_at_the_top"});
				}else{
					for( var i = 0; i < self.infoBoard.sortedDrawables.length; i ++ )
					{
						var drawables= self.infoBoard.sortedDrawables[i];
						if(drawables.mz == drawable[0].mz){
							index_up=i;
						}
						if(drawables.mz == drawable[0].mz + 1){
							index_down=i;
						}
						if(index_down !=-1 && index_up !=-1){
							break;
						}
					}
						self.infoBoard.sortedDrawables[index_down].mz -=1;
						self.infoBoard.sortedDrawables[index_up].mz +=1;
						
						self.infoBoard.sortDrawables();
						self.infoBoard.redrawCanvas();
				}
			});
		},
		renderRefreshTime:function(){
			var self = this;
			this.createForm = $("<form>").addClass(this.moduleName + "-create-form ui-helper-hidden tag-overview-form");
            $("<label>").attr("for", "refresh_time").text(locale.get({lang:"refresh_time"})).appendTo(this.createForm);
            $("<input type='text'>").attr("id", "refresh").appendTo(this.createForm);
            new Button({
                container: this.createForm,
                imgCls: "cloud-icon-yes",
                events: {
                    click: this.onTime,
                    scope: this
                }
            });
            
            this.createForm[0].childNodes[1].onkeydown=function(event){
         	   if(event.keyCode==13){
         		   self.onTime();
         		   return false;
         	   }
            };
            
            this.createForm.appendTo(this.element);
            $("#toolbar-scada-time-button").qtip({
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
						if($("#refresh").val()){
						}else{
							if(self.newScadaData){
								if(self.newScadaData.refreshInterval){
									$("#refresh").val(self.newScadaData.refreshInterval);
								}else{
									$("#refresh").val("10");
								}
							}
						}
						$("#refresh").focus();
					}
				},
                suppress:false
            });
		},
		onTime:function(){
			var self = this;
			var time = $("#refresh").val();
			var reg = /^[0-9]*[1-9][0-9]*$/;
			if(!time.empty()){
				if(!(reg.test(time))){
					dialog.render({lang:"must_be_a_positive_integer"});
				}else{
					if(time < 5){
						dialog.render({lang:"refresh_time_xz"});
					}else{
						$("#toolbar-scada-time-button").data("qtip").hide();
					}
				}
			}else{
				dialog.render({lang:"refresh_time_cannot_be_empty"});
			}
		},
		renderToolbar:function(){
			var self = this;
			var $copyButton=$("<input>").attr("type","button").attr("id","toolbar-scada-copy-button").attr("value",locale.get({lang:"copy"})).attr("class","toolbar-scada-1-button");
			var $paseButton=$("<input>").attr("type","button").attr("id","toolbar-scada-pase-button").attr("value",locale.get({lang:"paste"})).attr("class","toolbar-scada-1-button");
			var $saveButton = new Button({
                id: "toolbar-scada-save-button",
                imgCls: "cloud-icon-yes",
                title:locale.get({lang:"save"}),
                lang:"{title:save}"
            });
			var $cancleButton = new Button({
                id: "toolbar-scada-cancle-button",
                imgCls: "cloud-icon-no",
                title:locale.get({lang:"cancel"}),
                lang:"{title:cancel}"
            });
			var $copyToButton = new Button({
	          id: "toolbar-scada-copyTo-button",
	          imgCls: "cloud-icon-export",
	          title:locale.get({lang:"copy_from_the_other_scada"}),
	          lang:"{title:copy_from_the_other_scada}"
			});
			var $copyOtherButton = new Button({
	          id: "toolbar-scada-copyOther-button",
	          imgCls: "cloud-icon-import",
	          title:locale.get({lang:"application_to_other_scada"}),
	          lang:"{title:application_to_other_scada}"
			});
			
			var $delElButton = new Button({
                id: "toolbar-scada-delete-el-button",
                imgCls: "cloud-icon-reduce",
                title:locale.get({lang:"delete_components"}),
                lang:"{title:delete_components}"
            });
			var $editButton = new Button({
                id: "toolbar-scada-edit-button",
                imgCls: "cloud-icon-edit",
                title:locale.get({lang:"edit_components"}),
                lang:"{title:edit_components}"
            });
			var $time = new Button({
                id: "toolbar-scada-time-button",
                imgCls: "cloud-icon-calendar",
                title:locale.get({lang:"refresh_time"}),
                lang:"{title:refresh_time}"
            });
			this.toolbar = new Toolbar({
                selector: "#" + this.elements.toolbar,
                leftItems: [$saveButton,$cancleButton,$copyToButton,$copyOtherButton,$time]
//                rightItems: [$editButton,$delElButton,$copyButton,$paseButton]
            });
			
			//取消当前编辑操作   
            $("#toolbar-scada-cancle-button").click(function(){
                
                //获取当前被选中的画面
			    //返回上一级目录
			    dialog.render({
    				lang:"affirm_cancel",
    				buttons: [{
    					lang:"affirm",
    					click:function(){
    					    self.loadApplication(self.appUrl);
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
			});
            
			 //从其他组态图复制 
            $("#toolbar-scada-copyTo-button").click(function(){
            	new AgentCanvasManager({
            		scadaId: self.scadaId,
            		service: self.service,
            		optionsT: 0
				});
			});
            
            //应用到其他组态图
            $("#toolbar-scada-copyOther-button").click(function(){
            	var canvasData = self.infoBoard.getData();
            	new AgentCanvasManager({
            		scadaId: self.scadaId,
            		service: self.service,
            		canvasData:canvasData,
            		optionsT: 1
				});
			});
			$("#toolbar-scada-save-button").click(function(){
				dialog.render({
    				lang:"affirm_save",
    				buttons: [{
    					lang:"affirm",
    					click:function(){
    						cloud.util.mask("#user-content");
    						var canvasData = self.infoBoard.getData();
    						canvasData.refreshInterval = $("#refresh").val();
    						var data = {
    							content:canvasData
    						};
    						self.service.updateGlobalScada(self.scadaId,data,function(data){
    							if(data.result){
    								self.loadApplication(self.appUrl);
        				    	    cloud.util.unmask("#user-content");
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
				
//				var initialAgentData = (JSON && JSON.stringify) ? JSON.stringify(canvasData, null, '') : Ext.encode(canvasData);
//				alert(initialAgentData);
			});
		},
		renderScadaViewPanel:function(){
			var self = this;
			this.viewPanel = new Board({
				selector:"#"+this.elements.canvas,
				infoBoard:function(){
					if(self.infoBoard == null){
						self.infoBoard = new Nts.Module.Common.Canvas.Board({
							region: 'center',
							style: {backgroundColor: 'white'}
						});
					}
				}
			});
		},
		
		onBoardDblClick:function(panel){
			this.onProperty();
		},
		
		renderScadaViewData:function(){
			var canvasData = null;
			
			if(this.newScadaData){
				canvasData = this.newScadaData;
				this.infoBoard.loadData(canvasData);
			}else{
//				canvasData = Nts.Module.System.Agent.Configure.defaultCanvasData
			}
		},
		
		renderScadaViewSort:function(){
			this.infoBoard.resizeCanvas(true);
			this.infoBoard.createCanvas();
			this.infoBoard.sortDrawables();
			this.infoBoard.resizeCanvas(true);
			this.infoBoard.afterRender();
		},
		
		onProperty: function(){
			var self = this;
			
			var sels = this.infoBoard.selectedDrawables;
			if( sels.length == 0 ){
				return;
			}
			
			 var siteList=[];
			 self.service.getAllSite(0, this.display, function(data) {
				cloud.util.mask("#user-content");
				$("#canvas-edit").css("display","none");
				if(data.result && data.result.length>0){
					for(var i = 0 ; i < data.result.length ; i++) {
						var list = [];
						list.push(data.result[i]._id);
						list.push(data.result[i].name);
						siteList.push(list);
					}
					this.win = new Nts.Module.System.Agent.AgentDrawableProperty({
						renderTo: this.el,
						drawable: sels[0],
						siteList:siteList,
						siteId: null,
						global:1,
						cancelCallback:{
							fn: function()
							{
								var sels = self.infoBoard.selectedDrawables;
								if(sels[0].aliquots){
								}else{
									self.infoBoard.deleteSelections();
								}
							},
							scope: this
						},
						userCallback:
						{
							fn: function()
							{
								self.infoBoard.sortDrawables();
								self.infoBoard.redrawCanvas();
								self.infoBoard.resizeCanvas(true);
								
								var sels = self.infoBoard.selectedDrawables;
								
								var custom = sels[0].custom;
								for(var i=0;i<custom.length;i++){
									self.service.addScadaComponents(custom[i],function(data){
										var src= cloud.config.FILE_SERVER_URL + "/api/file/" + data.result.content._id + "?access_token=" + cloud.Ajax.getAccessToken();
										var $img = '<img id="canvas-image-'+data.result.content._id+'" src="'+src+'" width="'+data.result.content.width+'" height="'+data.result.content.height+'" />';
										$("#"+self.elements.imagesdiv).append($img);
									});
								}
								self.fire("rendDraw",custom);
								if(sels[0].type == '2'){
									self.infoBoard.deleteSelections();
								}
								
								var toolConfigItems = Configure.drawablePrototypes.items;
								var itemsObject = {};
								for( var i = 0; i < toolConfigItems.length; i ++ ){
									var configItem = toolConfigItems[i];
									itemsObject[configItem._id]=configItem.items;
								}
								self.agentCanvasTool.renderMouseOver(itemsObject,"customsidebar");
								self.agentCanvasTool.renderMouseDown();
								self.agentCanvasTool.renderMouseUp();
								self.agentCanvasTool.renderMouseOut();
							},
							scope: this
						}
					});
					this.win.show();
				}
				 cloud.util.unmask("#user-content");
			 });
		},
		
		loadApplication:function(application){
			var self = this;
			cloud.util.setCurrentApp({url:application});
            if (cloud.platform.currentApplication && Object.isFunction(cloud.platform.currentApplication.destroy)) {
            	cloud.platform.currentApplication.destroy();
            	cloud.platform.currentApplication = null;
            }
            this.requestingApplication = application;
            require([application], function(Application) {
            	
				if (cloud.platform.currentApplication && Object.isFunction(cloud.platform.currentApplication.destroy)) {
					cloud.platform.currentApplication.destroy();
					cloud.platform.currentApplication = null;
				}
            	
                //judge if the previous requesting application is canceled.
				$("#user-content").empty();
				cloud.util.unmask("#user-content");
				if (Application) {
					cloud.platform.currentApplication = new Application({
                         container: "#user-content",
                         service: self.service,
                         scadaId: self.scadaId
                    });
                }
           }.bind(this));
		},
		
		destroy:function(){
			if(this.layout && (!this.layout.destroyed)){
				this.layout.destroy();
			}
			if(this.contentScadaLayout && (!this.contentScadaLayout.destroyed)){
				this.contentScadaLayout.destroy();
			}
			if(this.win)this.win.close();
			$("#canvas-edit").css("display","none");
		}
		
	
	});
	
	return GlobalCanvasDrable;
});