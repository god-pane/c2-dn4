define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/ext/resources/css/ext-all.css");
	require("cloud/lib/plugin/ext/resources/css/ux-all.css");
	require("cloud/lib/plugin/jquery.layout");
	var Board = require("../../scada/components/canvas/Board");
	require("../../agent/Configure");
	var Toolbar = require("cloud/components/toolbar");
	var Button = require("cloud/components/button");
	require("cloud/lib/plugin/jquery.multiselect");
	var AgentCanvasProperty = require("../../agent/AgentCanvasProperty");
	
	var ContentScada = Class.create(cloud.Component,{
		initialize:function($super,options){
			this.moduleName="content-scadaview";
			$super(options);
			this.elements={
				toolbar:this.id+"-toolbar",
				content:this.id+"-content",
				scada:this.id+"-scada",
				timescroll:this.id+"-time",
				fullScreenEnabled:false
			};
			$('#canvas-move').css("display","none");
			this.toolbar = null;
            this.viewPanel = null;
            this.refreshTimerId = null;
            this.refreshInterval = null;
            this.render();
		},
		
		render:function(){
			this.draw();
			this.renderPlugin();
			this.renderContentLayout();
			this.rendertoolbar();
//			this.showTime();
			this.renderScadaViewPanel();
			this.renderScadaViewSort();
			window.clearInterval(this.refreshTimerId);
			this.renderSiteName();
		},
		draw:function(){
			var html = "<div id=" + this.elements.toolbar + " class=" + this.elements.toolbar + "></div>" +
			
            "<div id=" + this.elements.content + " class=" + this.elements.content + " style=\"height:auot;\">" +
            "<div id=\"scada-comp-101\" style=\"height:100%;\"></div>"+
            "<div id=\"scada-comp-103\" style=\"height:100%;overflow-x:hidden;overflow-y:hidden;\"></div>"+//此处放的现场名称
            "<div id=" + this.elements.scada + " class=" + this.elements.scada + " style=\"height:100%;\"></div>" +
            "<div id=\"scada-comp-102\" style=\"height:100%;\"></div>"+
            "</div>"+
            "<div id=" + this.elements.timescroll + " class=" + this.elements.timescroll + "></div>" ;
			this.element.append(html);
		},
		
		renderPlugin:function(){
			(function(){
			    var fullScreenApi = {
			            supportsFullScreen: false,
			            isFullScreen: function() { return false; },
			            requestFullScreen: function() {},
			            cancelFullScreen: function() {},
			            fullScreenEventName: '',
			            prefix: ''
			        },
			        browserPrefixes = 'webkit moz o ms khtml'.split(' ');
			    if (typeof document.cancelFullScreen != 'undefined') {
			        fullScreenApi.supportsFullScreen = true;
			    } else {
			        for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
			            fullScreenApi.prefix = browserPrefixes[i];
			            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
			                fullScreenApi.supportsFullScreen = true;
			                break;
			            }
			        }
			    }
			    if (fullScreenApi.supportsFullScreen) {
			        fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
			        fullScreenApi.isFullScreen = function() {
			            switch (this.prefix) {
			                case '':
			                    return document.fullScreen;
			                case 'webkit':
			                    return document.webkitIsFullScreen;
			                default:
			                    return document[this.prefix + 'FullScreen'];
			            }
			        }
			        fullScreenApi.requestFullScreen = function(el) {
			            return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
			        }
			        fullScreenApi.cancelFullScreen = function(el) {
			            return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
			        }
			    }
			    if (typeof jQuery != 'undefined') {
			        jQuery.fn.requestFullScreen = function() {
			            return this.each(function() {
			                if (fullScreenApi.supportsFullScreen) {
			                    fullScreenApi.requestFullScreen(this);
			                }
			            });
			        };
			    }
			    window.fullScreenApi = fullScreenApi;
			})();
		},
		
		renderContentLayout:function(){
			this.layout = this.element.layout({
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
                     size: 25
                },
                center: {
                    paneSelector: "#" + this.elements.scada
                    // paneClass: this.elements.content
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
             "<div id='siteName' style='text-align:center;font-weight:bold;font-size:18px;'>" +
             "</div>" 
		     );
             $("#scada-comp-103").append($htmls);
             
		},
		renderDefaultDiv:function(display,defaulthtmls){
			var self = this;
			if(display==true){
				$("#canvas-glasspane").empty();
				$("#canvas-glasspane").append(defaulthtmls);
				$("#canvas-glasspane").addClass("canvas-glasspane");
				$("#canvas-glasspane").css("display","block");
				
				$("#newFrame").click(function(){
					window.clearInterval(self.refreshTimerId);
					self.fire("editClick");
				});
				
				$("#copyOtherFrame").click(function(){
					self.fire("copyFromOther");
				});
				
			}else{
				$("#canvas-glasspane").css("display","none");
			}
			
		},
		renderSiteName_div:function(siteName){
			//火狐不支持innerText，支持textContent
			if(document.getElementById('siteName').innerText){
				document.getElementById('siteName').innerText=siteName;
			}else{
				document.getElementById('siteName').textContent=siteName;
			}
			
		},
		rendertoolbar:function(){
			var self = this;
			var $scadaTime = $(+"<div id='notice-bar' style='width:auto'>" +
					"<div id='notice-bar-timer'>"+
		            "<ul><li style='width:190px'>"+
		            "<p style='background:#1EAB38;color:#fff;text-align:center;' id='timer'></p></li>"+
		            "</ul>"+
		            "</div>"+
					"</div>");
			var $allScreen = new Button({
                id: "toolbar-all-screen-button",
                imgCls: "cloud-icon-full",
                title:locale.get({lang:"full_screen_display"}),
                lang:"{title:full_screen_display}"
            });
			var $exitScreen = new Button({
                id: "toolbar-exit-screen-button",
                imgCls: "cloud-icon-defull",
                title:locale.get({lang:"exit_full_screen"}),
                lang:"{title:exit_full_screen}"
            });
			var $button = new Button({
                id: "toolbar-scada-edit-button",
                imgCls: "cloud-icon-edit",
                title:locale.get({lang:"edit"}),
                lang:"{title:edit}"
            });
			 if(permission.app("_scada")["write"]){
				  this.toolbar = new Toolbar({
		                selector: "#" + this.elements.toolbar,
		                leftItems: [$allScreen,$exitScreen,$button],
		                rightItems: [$scadaTime]
		          });
			 }else{
				 this.toolbar = new Toolbar({
		                selector: "#" + this.elements.toolbar,
		                leftItems: [$allScreen,$exitScreen],
		                rightItems: [$scadaTime]
		         });
			 }
//			 this.toolbar = new Toolbar({
//	                selector: "#" + this.elements.toolbar,
//	                leftItems: [$allScreen,$exitScreen,$button],
//	                rightItems: [$scadaTime]
//	          });
			
			$("#toolbar-scada-edit-button").click(function(){
				window.clearInterval(self.refreshTimerId);
				self.fire("editClick");
			});
			
			//1.按按钮进入全屏状态及退出全屏
			$("#toolbar-all-screen-button").click(function(){
				if(self.searchWindowStatus){
					window.clearInterval(self.searchWindowStatus);
				}
				if(!window.fullScreenApi.supportsFullScreen){
					return;
				}
				if(!self.elements.fullScreenEnabled ) {
					window.fullScreenApi.requestFullScreen(document.body);
					self.allowKeyBoard();
				}
				else{
					window.fullScreenApi.cancelFullScreen(document.body);
				}
			});
			//退出全屏
			$("#toolbar-exit-screen-button").click(function(){
				if(self.searchWindowStatus){
					window.clearInterval(self.searchWindowStatus);
				}
				if(!window.fullScreenApi.supportsFullScreen){
					return;
				}
				if(!self.elements.fullScreenEnabled ) {
					window.fullScreenApi.requestFullScreen(document.body);
					self.allowKeyBoard();
				}else{
					window.fullScreenApi.cancelFullScreen(document.body);
				}
			});
			//2.按F11进入全屏状态及退出全屏
			document.body.onkeydown=function(event){
				var e = event || window.event || arguments.callee.caller.arguments[0];
				if(e && e.keyCode==122){ // 按 F11
					if(window.screenLeft == 0 && window.document.body.clientWidth == window.screen.width){
						if(self.searchWindowStatus){
							window.clearInterval(self.searchWindowStatus);
							self.searchWindowStatus = null;
						}
						
						self.searchWindowStatus = setInterval(function(){
							var editDisplay=$("#toolbar-scada-edit-button").css("display");
							var fullDisplay=$("#toolbar-all-screen-button").css("display");
							if(document.body.offsetHeight === window.screen.height){
								self.allowKeyBoard();
								$("#toolbar-all-screen-button").css("display","none");
								self.elements.fullScreenEnabled = true;
							}else{
                                if (fullDisplay == "none" && editDisplay == "none"){
                                	$("#toolbar-all-screen-button").css("display","none");
								}else{
								    $("#toolbar-all-screen-button").css("display","block");
								}
								self.elements.fullScreenEnabled = false;
								
							}
						},10);
						
					}
				}
			};
			//3.按“全屏显示”按钮进入全屏，按ESC退出全屏
			$( document ).bind(
					'fullscreenchange webkitfullscreenchange mozfullscreenchange',//当全屏状态发生改变时绑定该事件
					function(){
						if( !self.elements.fullScreenEnabled ){//document.fullscreen || document.webkitIsFullScreen ||document.mozFullScreen){//当当前状态为全屏时
							self.elements.fullScreenEnabled = true;
							$("#toolbar-exit-screen-button").show();
							$("#toolbar-all-screen-button").hide();
						}else{
							self.elements.fullScreenEnabled = false;
							$("#toolbar-exit-screen-button").hide();
							$("#toolbar-all-screen-button").show();
						}
					}
		   );
			this.fullScreen();//全屏状态时
			
		},
		allowKeyBoard:function(){
			//全屏状态下允许键盘输入
			if ( window.navigator.userAgent.toUpperCase().indexOf( 'CHROME' ) >= 0 ) {//只有chrome支持全屏状态下允许键盘输入
				var docElm = document.documentElement; 
				docElm.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		},
		fullScreen:function(){
			if( document.fullscreen || document.webkitIsFullScreen ||document.mozFullScreen){//当当前状态为全屏时
				$("#toolbar-all-screen-button").hide();
				$("#toolbar-exit-screen-button").show();
				this.elements.fullScreenEnabled = true;
			}else{
				$("#toolbar-exit-screen-button").hide();
				$("#toolbar-all-screen-button").show();
				this.elements.fullScreenEnabled = false;
			}
		},
		showTime:function(updatetime){
//			var weekday = [locale.get({lang:"Sunday"}),locale.get({lang:"Monday"}),locale.get({lang:"Tuesday"}),locale.get({lang:"Wednesday"}),locale.get({lang:"Thursday"}),locale.get({lang:"Friday"}),locale.get({lang:"Saturday"})];
//			this.interval = setInterval(function(){
//				var now = new Date();
//				var timeValue = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+weekday[now.getDay()]+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
			$("#timer").empty();
			$("#timer").html(updatetime);
//			},1000);
		},
		
		clearTime:function(){
			$("#timer").empty();
		},
		
		getContentBoolbar:function(){
			return this.toolbar;
		},
		
		renderScadaViewPanel:function(){
			var self = this;
			this.viewPanel = new Board({
				selector:"#"+this.elements.scada,
				infoBoard:function(){
					if(self.infoBoard == null){
						self.infoBoard = new Nts.Module.Common.Canvas.Board({
							editable: false,
							selectable: true,
							scrollable: false,
							autofit: false,
							height: 520
						});
					}
					return self.infoBoard;
				}
			});
		},
		
		renderScadaViewSort:function(){
			this.infoBoard.resizeCanvas();
			this.infoBoard.createCanvas();
			this.infoBoard.sortDrawables();
			this.infoBoard.resizeCanvas();
		},
		
		clearCanvas:function(){
			// 清除整个 canvas 画面
			var canvas = this.infoBoard.canvas.dom;
			this.infoBoard.sortedDrawables.clear();
			this.infoBoard.readOnlyDrawables.clear();
			this.infoBoard.canvas.ctx2d.clearRect(0,0,canvas.width,canvas.height);
			
			// 将下拉框里的组态画面清空
			$("#multiselect option").remove();
		},
		
		openCanvasView:function(cp){
			var self = this;
			
//			var canvasData =  (cp) ? cp : Nts.Module.System.Agent.Configure.defaultCanvasData;
//			if( !canvasData )
//			{
//				canvasData = {items: []};
//			}
			
//			if( canvasData && canvasData.region )
//			{
//				this.canvasContainer.setWidth(canvasData.region.width);
//				this.infoBoard.setHeight(canvasData.region.height - 20);
//				this.centerContainer.boxMinWidth = canvasData.region.width;
//				this.centerContainer.setHeight(canvasData.region.height);
////				this.doLayout(false, false);
//			}
			this.infoBoard.redrawCanvas();
			if( this.refreshTimerId == null )
			{
                if(self.refreshInterval){
					
				}else{
					self.refreshInterval=10000;
				}
                this.refreshTimerId = setInterval(function(){
    				self.loadAgentData();
    			}, self.refreshInterval);
				
			}else{
				window.clearInterval(this.refreshTimerId);
			}
		},
		
		loadAgentData:function(){
			this.fire("loadData");
		},
		
		updateCanvasValue: function(agentStatusData,dataTime){
			var self = this;
			//屏蔽乱码
			function F(a){
				var regex=/[0-9,a-z,A-Z,:,\-,\s]$/; 
				var var1; //高八位
				var var2; //低八位
				var val1=String.fromCharCode(a>>>8);
				var val2=String.fromCharCode(a & 0xff);
				if(regex.test(val1)){
					var1=val1 ;
				}else{
					var1='';
				}
				if(regex.test(val2)){
					var2=val2 ;
				}else{
					var2='';
				}
				return var2+''+var1; 
			}

			var timestamp = 0;
			var readOnlyDrawables = this.infoBoard.readOnlyDrawables;
			if(agentStatusData){
				for(id in agentStatusData){
						var formulaId = "_"+id+"";
						if(agentStatusData[id]!="--"){
							eval("var "+formulaId+"="+agentStatusData[id]+";");
						}
						else{
							eval("var "+formulaId+"='';");
						}
				}
			}
			if(readOnlyDrawables && readOnlyDrawables.length>0){
				for(var i=0;i<readOnlyDrawables.length;i++){
					var drawable = readOnlyDrawables[i];
					var varStr = Ext.isArray(drawable.address)?drawable.address[0].varId:null;
					if(drawable && varStr){
//						var varId = varStr.split("_")[0]+""+varStr.split("_")[1];
						var value = "--";
						for(id in agentStatusData){
							//处理公式
							
							if(id == varStr){
								if(timestamp<dataTime[id]){
									timestamp = dataTime[id];
								}
								if(drawable.address[0].formula){
									value = eval(drawable.address[0].formula);
								}else{
									value = agentStatusData[id];
								}
								break;
							}
						}
//						drawable.setTitle(1, {text: String.format('{0}{1}', value, '')}, false);
						drawable.m.onDataChanage(value);
						
						if(timestamp>0){
							var newTime = new Date(timestamp*1000); 
							var updateTimeZ=newTime.getFullYear()+"-"+(newTime.getMonth()+1)+"-"+newTime.getDate()+"  "+newTime.getHours()+":"+newTime.getMinutes()+":"+newTime.getSeconds();
							self.showTime(updateTimeZ);
						}
					}
				}
			}
			
//			var value = 0;
//			var value2 = 0;
//			var address = 0;
//			var drawable = null;
//			
//			// 主水箱水位
//			value = this.agentStatusData[2006];
//			drawable = this.infoBoard.getDrawableByAddress(2006);
//			if( drawable )
//			{
//				if( !(value <= 5) ) value = 0;
//				drawable.setImage(1, {hpercent: Math.max(0.01, 100 - value * 20)}, false);
//			}
//			
//			// 太阳能水箱水位
//			value = this.agentStatusData[2007];
//			drawable = this.infoBoard.getDrawableByAddress(2007);
//			if( drawable )
//			{
//				if( !(value <= 5) ) value = 0;
//				drawable.setImage(1, {hpercent: Math.max(0.01, 100 - value * 20)}, false);
//			}
//			
//			// 电表度数
//			value = this.agentStatusData[2008];
//			value2 = this.agentStatusData[2009];
//			drawable = this.viewPanel.getDrawableByAddress(2008);
//			if( drawable && value < 0xffff )
//			{
//				drawable.setTitle(1, {text: String.format('{0}{1}', value * 0x10000 + value2, this.lang.degreeText)}, false);
//			}
//			
//			// 水表度数
//			value = this.agentStatusData[2010];
//			value2 = this.agentStatusData[2011];
//			drawable = this.infoBoard.getDrawableByAddress(2010);
//			if( drawable && value < 0xffff )
//			{
//				drawable.setTitle(1, {text: String.format('{0}{1}', value * 0x10000 + value2, this.lang.waterUnit)}, false);
//			}
//			
//			// 主水箱温度 T51
//			value = this.getReadableValue(this.agentStatusData[2000]);
//			drawable = this.infoBoard.getDrawableByAddress(2000);
//			if( drawable )
//			{
//				drawable.setTitle(1, {text: String.format('{0}{1}', value, this.lang.celsiusDegreeText)}, false);
//			}
//			
//			// 副水箱温度 T52
//			value = this.getReadableValue(this.agentStatusData[2001]);
//			drawable = this.infoBoard.getDrawableByAddress(2001);
//			if( drawable )
//			{
//				drawable.setTitle(1, {text: String.format('{0}{1}', value, this.lang.celsiusDegreeText)}, false);
//			}
//			
//			for( var m = 0; m < 4; m ++ )
//			{
//				for( var n = 0; n < 16; n ++ )
//				{
//					address = 3000 + (m * 16 + n) * 20;
//					value = this.agentStatusData[address];
//					drawable = this.infoBoard.getDrawableByAddress(address);
//					if( !drawable )
//					{
//						continue;
//					}
//					
//					if( !this.currentHostAddress )
//					{
//						this.currentHostAddress = address;
//					}
//					if( !(value < 0xffff) )
//					{
//						drawable.setImage(0, {el: 'unit-disconnect'}, false);
//						continue;
//					}
//					
//					// 设置温度
//					var temp = this.agentStatusData[address + 4];
//					if( temp < 0xffff ) drawable.setTitle(0, {text: this.getReadableValue(temp) + ' ℃'}, false);
//					
//					// 设置图标颜色
//					// unit-red : 红色
//					// unit-yellow : 黄色
//					// unit-normal : 正常灰色
//					// unit-disconnect : 未连接
//					if( value == 1 ) // 开机
//					{
//						if( temp > 80 ) drawable.setImage(0, {el: 'unit-red'}, false);
//						else if( temp > 50 ) drawable.setImage(0, {el: 'unit-yellow'}, false);
//						else drawable.setImage(0, {el: 'unit-normal'}, false);
//					}
//					else
//					{
//						drawable.setImage(0, {el: 'unit-disconnect'}, false);
//					}
//				}
//			}
			
			this.infoBoard.redrawCanvas();
//			this.updateStatusHtml(this.statusPanel.items.get(0), this.lang.agentStatusList.common, 0);
//			if( this.currentHostAddress > 0 )
//			{
//				this.updateStatusHtml(this.statusPanel.items.get(1), this.lang.agentStatusList.host, this.currentHostAddress);
//			}
		},
		
		/**
		 * 
		 * @param eventname click dbclick mousemoveon mousemoveout
		 * @param event function
		 */
		addEvent:function(eventname,e){
			var event = {};
			var eventDrawables = this.infoBoard.eventDrawables;
			event[eventname] = e;
			eventDrawables.push(event);
		},
		//清除动态组件的定时器
		clearDynamicComponentTimer:function(){
			var readOnlyDrawables = this.infoBoard.readOnlyDrawables;
			if(readOnlyDrawables && readOnlyDrawables.length>0){
				for(var i=0;i<readOnlyDrawables.length;i++){
					var drawable = readOnlyDrawables[i];
					if(drawable.type == '3'){
						if(drawable.maxValue || drawable.minValue){
							if(drawable.m){
								drawable.m.clearTimer();
							}
						}
					}
					
				}
			}
		},
		destroy:function(){
			if (this.layout && (!this.layout.destroyed)) {
            	this.layout.destroy();
            }
			if(this.contentScadaLayout && (!this.contentScadaLayout.destroyed)){
				this.contentScadaLayout.destroy();
			}
			if(this.searchWindowStatus){
				window.clearInterval(this.searchWindowStatus);
			}
			if(this.refreshTimerId){
				window.clearInterval(this.refreshTimerId);
			}
			$("#canvas-glasspane").css("display","none");
			//$(".canvas-thermometer").css("display","none");
			$(".canvas-thermometer").remove();
			this.clearDynamicComponentTimer();
		}
	});
	return ContentScada;
});
