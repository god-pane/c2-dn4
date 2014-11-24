define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/ext/resources/css/ext-all.css");
	require("cloud/lib/plugin/ext/resources/css/ux-all.css");
	var Configure=require("./Configure");
	var Button = require("cloud/components/button");
	var SettingHtml = require("text!./AgentCanvasToolSetting.html");
	require("../scada/utils/Helper");
	require("../scada/components/canvas/Drawable");
	var AgentCanvasTool = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options); 
			this.agentCanvasDraw = options.agentCanvasDraw;
			this.moduleName = "agentCanvasTool";
			this.dragId=null;
			this.dragItem={};
			this.selectedItem = {};
			this.clickFlag=null;
			this.global=options.global;
			this.elements = {
				setting:this.id+"-setting",
				canvasTool:this.id+"-canvasTool",
				setTool:this.id+"-setTool",
				customsidebar:"customsidebar",
				imagesdiv:"nts-module-common-canvas-global-resources"
			};
			this.DragMoveDiv_left=null;
			this.DragMoveDiv_top=null;
			this.moveFlag=false;
			this.defaulthtmls = $("<img src='site/mysite/resources/images/delete.png' style='margin-left:30px;margin-top:0px;'/>");
			this._render();
		},
		
		_render:function(){
			this.draw();
			this.renderLayout();
			this.renderSettingButton();
			this.renderCanvasElement();
			this.renderInfo();
//			this.renderElementDbclick();
		},
		
		draw:function(){
			var html="<div id="+this.elements.canvasTool+" class="+this.elements.canvasTool+" style='height:100%;overflow-x:hidden;overflow-y:hidden;'>"+
			               "<div id="+this.elements.setTool+" class='agent-scanvas-sidebar' style='overflow-x:hidden;overflow-y:auto;'></div>"+
			           "</div>";
			this.element.html(html);
		},

		renderLayout:function(){
			if(this.layout){
				this.layout.destory();
			}
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
                center: {
                    paneSelector: "#" + this.elements.canvasTool
                }
			});
		},
		
		renderSettingButton:function(){
			this.allowCanvasMore = new Button({
                container: $("#"+this.elements.setting).find("#info-canvas-more"),
                id: "module-info-canvas-more",
                checkbox : true,
                text: "允许面画切换",
                lang:"",
                events: {
                    click: function(){
                    	
                    },
                    scope : this
                }
            });
			
			this.showRefreshTime = new Button({
                container: $("#"+this.elements.setting).find("#info-refresh-time"),
                id: "module-info-refresh-time",
                checkbox : true,
                text: "显示数据刷新时间",
                lang:"",
                events: {
                    click: function(){
                    	
                    },
                    scope : this
                }
            });
			
			this.showHistoryTime = new Button({
                container: $("#"+this.elements.setting).find("#info-history-time"),
                id: "module-info-history-time",
                checkbox : true,
                text: "显示时间轴",
                lang:"",
                events: {
                    click: function(){
                    	
                    },
                    scope : this
                }
            });
			
		},
		
		redDrawElement:function(data){
			
			$("#container-"+this.elements.customsidebar).find(".canvas-module-item").unbind();
			for(var i = 0; i < data.length; i++){
				var components = {};
				components["name"] = data[i].el;
				components["images"] = {"el":data[i]._id,"t":"1"};
				cloud.itemsObject[this.elements.customsidebar].push(components);
				
				var src= cloud.config.FILE_SERVER_URL + "/api/file/" + data[i]._id + "?access_token=" + cloud.Ajax.getAccessToken();
				var toolHtml= '<li id="'+(cloud.itemsObject[this.elements.customsidebar].length-1)+'_'+this.elements.customsidebar+'" class="canvas-module-item" title="'+data[i].el+'">'+
				                 '<img  width="25" height="25" src="'+src+'" />'+
				                 '<strong>'+data[i].el+'</strong>'+
		          				 '<input type="hidden" id="'+ data[i]._id+'"/>'+
				              '</li>';
				$('#container-'+this.elements.customsidebar).find('ul').append(toolHtml);
			}
			
//			this.renderElementDbclick(cloud.itemsObject,this.elements.customsidebar);
		},
		
		renderCanvasElement:function(){
			var self = this;
			var toolConfigItems = Configure.drawablePrototypes.items;
			var itemsObject = {};
			for( var i = 0; i < toolConfigItems.length; i ++ ){
				var configItem = toolConfigItems[i];
				itemsObject[configItem._id]=configItem.items;
				$("#"+this.elements.setTool).append(SettingHtml);
				$("#item_href").find("a").first().attr("id",configItem._id);
				$("#item_href").find("div").first().attr("id","container-"+configItem._id);
				$("#"+configItem._id).append(configItem._name);
				$("#item_href").attr("id","item_href_"+i);
				$("#item_href_"+i).attr("title",configItem._name);
			}
			var width = $("#" + this.elements.canvasTool).css('width');
			var el = $("#" + this.elements.canvasTool).find("div").css("width",width);

			this.options.service.getScadaComponents(function(data){
				var result = data.result;
				
				var items = itemsObject[self.elements.customsidebar];
				
				if(items.length>3) items.splice(2,items.length-2);
				
				for(var i=0;i<result.length;i++){
					var components = {};
					components["name"] = result[i].content.el;
					components["images"] = {"el":result[i].content._id,"t":"1"};
					items.push(components);
				}
				if(cloud.itemsObject) delete cloud.itemsObject;
				cloud.itemsObject = itemsObject;
			});
			
			el.find(".agent-title").click(function(dom){
				   var id=$(this).attr("id");
				   
				   if(self.selectedItem.agentTileId && self.selectedItem.agentTileId != id){
					   
					   if(self.selectedItem.containerCSS == "block"){
						   $("#container-"+self.selectedItem.agentTileId).empty();
						   $("#"+self.selectedItem.agentTileId).css("background-image","url('site/mysite/resources/images/collapsed.gif')");
						   $("#container-"+self.selectedItem.agentTileId).css("display","none");
						   $("#container-"+self.selectedItem.agentTileId).removeClass("agent-scanvas-module-view-drawable");
						   self.selectedItem.containerCSS = "none";
					   }
					   self.selectedItem.agentTileId = id;
				   }else if(!self.selectedItem.agentTileId){
					   self.selectedItem.agentTileId = id;
				   }
				   
				   $('#canvas-move').css("display","none");
				   $("#container-"+$(this).attr("id")).empty();
					if($("#container-"+$(this).attr("id")).css("display") == "none"){
						$($(this)).css("background-image","url('site/mysite/resources/images/expanded.gif')");
						$("#container-"+$(this).attr("id")).css("display","block");
						$("#container-"+$(this).attr("id")).addClass("agent-scanvas-module-view-drawable");
						self.selectedItem.containerCSS = "block";
					}else{
						$($(this)).css("background-image","url('site/mysite/resources/images/collapsed.gif')");
						$("#container-"+$(this).attr("id")).css("display","none");
						$("#container-"+$(this).attr("id")).removeClass("agent-scanvas-module-view-drawable");
						self.selectedItem.containerCSS = "none";
					}
					
					var toolHtml = '<ul>';
				    for(var j = 0; j < itemsObject[id].length; j ++){
				    	var item=itemsObject[id][j];
						var imageItem = null;
						if( item.images ){
							var elItem = Ext.isArray(item.images) && item.images[0] ? item.images[0] : item.images;
							imageItem = document.getElementById('canvas-image-' + elItem.el);
							var name = item.name.replace(new RegExp("<br/>", "g"), "");
							toolHtml += '<li id="'+j+'_'+$(this).attr("id")+'"   draggable="true" class="canvas-module-item"  title="'+name+'">'+
				          				   '<img  width="25" height="25" src='+imageItem.src+' />'+
				          				   '<strong>'+item.name+'</strong>'+
				          				   '<input type="hidden" id="'+ elItem.el+'"/>'+
				          				'</li>';
						}
					}
					toolHtml+='</ul>';
					$("#container-"+$(this).attr("id")).append(toolHtml);
					self.renderScroll();
					self.renderRightEvent();
					//拖拽组件
					self.renderMouseOver(itemsObject,$(this).attr("id"));
					self.renderMouseDown();
					self.renderMouseUp();
					self.renderMouseOut();
//					self.renderElementDbclick(itemsObject,$(this).attr("id"));
			});
			
//			el.find(".agent-title").first().trigger("click");
		},
		renderScroll:function(){
			var self=this;
			$(".agent-scanvas-side").scroll(function () {
				$('#canvas-move').empty();
			});
		},
		renderRightEvent:function(){
			//禁用右键、文本选择功能、复制按键
			$(document).bind("contextmenu",function(){return false;});
			
		},
		renderMouseOver:function(items,childId){
			var self=this;
			if(self.moveFlag){
				return;
			}
			$("#container-"+childId).find(".canvas-module-item").mouseover(function(event){
				var oldDragId = self.dragId;
				self.dragId= $(this).attr("id");
				if(oldDragId && oldDragId != self.dragId) $("#"+oldDragId).removeClass("agent-view-drawable-hover");
				$("#"+self.dragId).addClass("agent-view-drawable-hover");
				
				//===========================删除自定义组件==================================================
				if(childId == "customsidebar"){//自定义组件
					if(self.dragId == "1_customsidebar"){//单击删除按钮
						$('#canvas-move').empty();
					}else if(self.dragId == "0_customsidebar"){
						$('#canvas-move').empty();
						$("#canvas-move").click(function(){
						    if($("#"+self.dragId).attr("class") == "canvas-module-item canvas-new agent-view-drawable-hover"){
						    	dialog.render({lang:"please_cancel_the_delete"});
						    }
						});
					}else{ //自定义上传的图片
							var text=$("#1_customsidebar strong").text();
							if(text === locale.get({lang:"cancleDelete"})){
								$('#canvas-move').append(self.defaulthtmls);//添加删除的图片
								$("#canvas-move").click(function(){
									 	if($("#"+self.dragId).attr("class") == "canvas-module-item canvas-delete agent-view-drawable-hover"){
											var id=$("#"+self.dragId+" input").attr("id");
											var deleteLiId=self.dragId;
											//获取自定义监控组件
											dialog.render({
							    				lang:"affirm_delete",
							    				buttons: [{
							    					lang:"affirm",
							    					click:function(){
							    						self.options.service.getScadaComponents(function(data){
															if(data.result && data.result.length > 0){
																for(var i=0; i<data.result.length; i++ ){
																	var contentId=data.result[i].content._id;
																	var resultId=data.result[i]._id;
																	if(contentId == id){
																		//删除自定义组件
																		self.options.service.deleteScadaComponents(resultId,function(data){
																			$("#"+deleteLiId).remove();
																			$('#canvas-move').empty();
																			var configItem = items.customsidebar;
																			if(configItem.length && configItem.length > 0){
																				for(var i=0;i<configItem.length;i++){
																					var ids=configItem[i].images.el;
															    					if(id == ids){
															    						configItem.splice(i,1);
															    					}
															    				}
//																				$("#1_customsidebar strong").text(locale.get({lang:"dele_components"}));
																			}
																		});
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
								});
							  }
					}
				}
				//===============================================================================
				//var li_title = $("#"+self.dragId).attr("title");
				var li_title = $("#"+self.dragId+" strong").text();
				$('#canvas-move').attr("title",li_title);
				
				self.dragItem=items;
				var left=$(this).offset().left;
				var top=$(this).offset().top;
				$('#canvas-move').removeClass("canvas-move-dashed");
				$('#canvas-move').addClass("canvas-move");
				$('#canvas-move').css("margin-left",left);
				$('#canvas-move').css("margin-top",top);
				$('#canvas-move').css("height","55px");
				$('#canvas-move').css("width","50px");
				$('#canvas-move').css("display","block");
				
				self.DragMoveDiv_left=left;
				self.DragMoveDiv_top=top;
			});
		},
		renderMouseDown:function(){
			var self=this;
			 $('#canvas-move').mousedown(function(event){
				 self.clickFlag=null;
				 var selectedText=null;
				 event.preventDefault && event.preventDefault();
				 
				 if(self.global == 0){
					 selectedText=$("#multiselect").text();
				 }else{
					 selectedText=true;
				 }
				 
				 if(selectedText){
		            document.onmousemove = function (event) {
		        	  var do_event=event || window.event;//兼容火狐浏览器的处理
				      var left=do_event.clientX-25;
					  var top=do_event.clientY-25;
					  if(self.DragMoveDiv_left - left < 10){
					  }else{
						  $('#canvas-move').css("margin-left",left);
						  $('#canvas-move').css("margin-top",top);
						  $('#canvas-move').removeClass("canvas-move");
						  $('#canvas-move').addClass("canvas-move-dashed");
						  $('#canvas-move').css("height","70px");
						  $('#canvas-move').css("width","60px");
						  self.clickFlag=true;
						  self.moveFlag=true;
					  }
		            }
			    }else{
					  $('#canvas-move').css("display","none");
					  dialog.render({lang:"The_site_has_no_canvas"});
				}
			 });
		},
		renderMouseOut:function(){
			var self=this;
			$('#canvas-move').mouseout(function(event){
//				if($('#canvas-move').attr("class")=="canvas-move" && self.clickFlag != "true"){
//					 setTimeout(function(){
//						 $('#canvas-move').css("display","none");
//					 },2000);
//				}
			});
		},
		renderMouseUp:function(){
			var self=this;
			 $('#canvas-move').mouseup(function(event){
				 var do_event=event || window.event;//兼容火狐浏览器的处理
				 if($('#canvas-move').css("display")=="block"){
					    $('#canvas-move').css("display","none");
						document.onmousemove =null;
						var items=self.dragItem;
						self.moveFlag=false;
						//==============================删除自定义组件====================================================================
						var clickId = self.dragId;
						if(clickId == "1_customsidebar"){//点击“单击删除”
							$('#canvas-move').removeClass("canvas-move");
							$('#canvas-move').css("display","none");
							$('#canvas-move').unbind();
							
							var toolConfigItems = Configure.drawablePrototypes.items;
							var configItem = toolConfigItems[2];
							$("#canvas-move").toggle(function(){
								if(self.dragId == "1_customsidebar"){
									if($("#1_customsidebar strong").text() == locale.get({lang:"dele_components"})){
										 $("#1_customsidebar strong").text(locale.get({lang:"cancleDelete"}));
										 if(configItem.items && configItem.items.length > 0){
											for(var i=0;i < configItem.items.length;i++){
											  if($("#0_customsidebar").attr("class") == "canvas-module-item canvas-new"){
											  }else{
												   $("#0_customsidebar").addClass("canvas-new");
											  }
											  if(i>1){
													$("#"+i+"_customsidebar").addClass("canvas-delete");
											  }
										      }
									    }
									}else{
										$("#1_customsidebar strong").text(locale.get({lang:"dele_components"}));
										 if(configItem.items && configItem.items.length > 0){
												for(var i=0;i < configItem.items.length;i++){
													if($("#0_customsidebar").attr("class") == "canvas-module-item canvas-new"){
														 $("#0_customsidebar").removeClass("canvas-new");
													}
													if(i>1){
														$("#"+i+"_customsidebar").removeClass("canvas-delete");
												    }
										        }
										 }
										self.renderMouseDown();
										self.renderMouseUp();
										self.renderMouseOut();
									}
							 }
							},function(){
								if(self.dragId == "1_customsidebar"){
									if($("#1_customsidebar strong").text() == locale.get({lang:"dele_components"})){
										 $("#1_customsidebar strong").text(locale.get({lang:"cancleDelete"}));
										 if(configItem.items && configItem.items.length > 0){
											for(var i=0;i < configItem.items.length;i++){
											  if($("#0_customsidebar").attr("class") == "canvas-module-item canvas-new"){
											  }else{
												   $("#0_customsidebar").addClass("canvas-new");
											  }
											  if(i>1){
													$("#"+i+"_customsidebar").addClass("canvas-delete");
											  }
										      }
									    }
									}else{
										$("#1_customsidebar strong").text(locale.get({lang:"dele_components"}));
										 if(configItem.items && configItem.items.length > 0){
												for(var i=0;i < configItem.items.length;i++){
													if($("#0_customsidebar").attr("class") == "canvas-module-item canvas-new"){
														 $("#0_customsidebar").removeClass("canvas-new");
													}
													if(i>1){
														$("#"+i+"_customsidebar").removeClass("canvas-delete");
												    }
										        }
										 }
										self.renderMouseDown();
										self.renderMouseUp();
										self.renderMouseOut();
									}
								}
							});
							return;
						}else{
						}
						//==============================================================================================
						var index = clickId.split("_")[0];
						var thisId = clickId.split("_")[1];
						var toolConfigItems = items[thisId];//Nts.Module.System.Agent.Configure.drawablePrototypes.items;
						var config = Nts.Utils.Helper.deepCopyTo({}, toolConfigItems[index]);
						
						if(self.clickFlag){      //拖拽
							 //获取鼠标相对全屏的位置
							var left=do_event.clientX;
							var top=do_event.clientY;
							//获取canvas原点相对全屏的位置
							var point=self.agentCanvasDraw.infoBoard.point;
							var drawableLeft=left-point.left;
							var drawableTop=top-point.top;
							
							config.x = drawableLeft; 
							config.y = drawableTop; 
						}else{      //单击
							
							//config.x = 25; 
							//config.y = 10; 
							config.x = 150; 
							config.y = 200;
						}
						
						if( !config.width || !config.height )
						{
							var imageItem = null;
							if( config.images )
							{
								var elItem = Ext.isArray(config.images) ? config.images[0] : config.images;
								imageItem = document.getElementById('canvas-image-' + elItem.el);
							}
							if( imageItem )
							{
								config.width = parseInt(imageItem.width);
								config.height = parseInt(imageItem.height);
							}
						}
						
						var drawable = new Nts.Module.Common.Canvas.Drawable(config);
						drawable.z=1;
						if(config.url){
							require([config.url+"jslib/element"],function(moduleApp){
								if(moduleApp){
									drawable.m = new moduleApp({
										drawable:drawable
									});
								}
							});
						}
     
						
						if(drawable.type && drawable.type == '5'){
//							if(drawable.width){
								//delete drawable.width;
//							}
//							if(drawable.height){
								//delete drawable.height;
//							}
							var drawables = [];
							self.agentCanvasDraw.infoBoard.addDrawable(drawable, true);
							self.agentCanvasDraw.infoBoard.selectedDrawables.push(drawable)
							drawables.push(drawable);
							self.agentCanvasDraw.infoBoard.setSelections(drawables,true);
							self.agentCanvasDraw.onProperty();
						}else if(drawable.type && drawable.type == '7'){
							if(drawable.width){
								delete drawable.width;
							}
							if(drawable.height){
								delete drawable.height;
							}
							var drawables = [];
							self.agentCanvasDraw.infoBoard.addDrawable(drawable, true);
							self.agentCanvasDraw.infoBoard.selectedDrawables.push(drawable)
							drawables.push(drawable);
							self.agentCanvasDraw.infoBoard.setSelections(drawables,true);
						}else{
							var drawables = [];
							self.agentCanvasDraw.infoBoard.addDrawable(drawable, true);
							drawables.push(drawable);
							self.agentCanvasDraw.infoBoard.setSelections(drawables,true);
							self.agentCanvasDraw.infoBoard.redrawCanvas();
							
							if(drawable.type && drawable.type == '2'){
								self.fire("showOptionWin");
							}else if(drawable.type == 'text'){
							}else{
								if(drawable.endPoints){
								}else{
									drawable.endPoints=[];
									var endPoints={};
									endPoints.x=100;
									endPoints.y=50;
									endPoints.rs=3;
									endPoints.cl='blue';
									endPoints.fs='orange';
									drawable.endPoints.push(endPoints);
								}
							}
						}
						//====================================================================================================
				 }
			  
			 });
		},
		renderInfo:function(){
			 var self=this;
			 var width=null;
			 var height=null;
			 $("#agentcanvas-info-toggler").toggle(function(){
				 width=self.agentCanvasDraw.infoBoard.canvas.dom.width;
				 height=self.agentCanvasDraw.infoBoard.canvas.dom.height;
				 $(window).resize();
				 self.agentCanvasDraw.infoBoard.resizeCanvas();
				 $('#canvas-move').css("display","none");
				 
			 },function(){
				 self.agentCanvasDraw.infoBoard.canvas.region.width=width;
				 self.agentCanvasDraw.infoBoard.canvas.region.height=height;
				 $(window).resize();
				 self.agentCanvasDraw.infoBoard.resizeDrawableCanvas("toggler");
			 });
		},
//		renderElementDbclick:function(items,childId){
//			var self = this;
//			$("#container-"+childId).find(".canvas-module-item").dblclick(function(event){
//				var clickId = $(this).attr("id");
//				var index = clickId.split("_")[0];
//				var thisId = clickId.split("_")[1];
//				var toolConfigItems = items[thisId];//Nts.Module.System.Agent.Configure.drawablePrototypes.items;
//				var config = Nts.Utils.Helper.deepCopyTo({}, toolConfigItems[index]);
//				config.x = 25; //100 + Math.round(200 * Math.random());
//				config.y = 10; //100 + Math.round(200 * Math.random());
//
//				if( !config.width || !config.height )
//				{
//					var imageItem = null;
//					if( config.images )
//					{
//						var elItem = Ext.isArray(config.images) ? config.images[0] : config.images;
//						imageItem = document.getElementById('canvas-image-' + elItem.el);
//					}
//					if( imageItem )
//					{
//						config.width = parseInt(imageItem.width);
//						config.height = parseInt(imageItem.height);
//					}
//				}
//				
//				var drawable = new Nts.Module.Common.Canvas.Drawable(config);
//				drawable.z=1;
//				
//				if(config.url){
//					require([config.url+"jslib/element"],function(moduleApp){
//						if(moduleApp){
//							drawable.m = new moduleApp({
//								drawable:drawable
//							});
//						}
//					});
//				}
//				
//				var drawables = [];
//				self.agentCanvasDraw.infoBoard.addDrawable(drawable, true);
//				drawables.push(drawable);
//				self.agentCanvasDraw.infoBoard.setSelections(drawables,true);
//				self.agentCanvasDraw.infoBoard.redrawCanvas();
//				if(drawable.type && drawable.type == '2'){
//					self.fire("showOptionWin");
//				}
//				
//			});
//		},
		
		destroy:function(){
			if(this.layout && (!this.layout.destroyed))this.layout.destroy();
			$('#canvas-move').unbind();
			$('#canvas-move').css("display","none");
		}
	});
	return AgentCanvasTool;
});