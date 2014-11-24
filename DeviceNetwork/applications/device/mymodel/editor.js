/**
 * @author zhang
 */
define(function(require){
	require("cloud/base/cloud");
	var NormalEditor=require("./normalEditor");
	var window = require("cloud/components/window");
	var jsoneditor = require("cloud/lib/plugin/jsoneditor");
	require("cloud/resources/css/jsoneditor-min.css");
	var button = require("cloud/components/button");
	var Editor = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.readonly= options.readonly || false;
//			this.container = options.container;
			this.json = options.json || null;
			this._renderwin();
			this._rendereditor();
			//this.flag=false;
			this.jsonObj = this.json;
			this.varInfo=this.json;
		},
		_renderwin:function(){
			var self=this;
			this.window = new window({
				container: "body",
				title:locale.get({lang:"editor"}),
				top:"center",
				left:"center",
				height:650,
				width:550,
				mask:true,
				drag:true,
				content:"<div id='editor-container' style='height:100%'>" +
						"<div id='json-editor'></div>" +
						"<div id='normal-editor'></div>"+
						"<button id='change-bar' style='text-align:center'></div>"+
						"</button>",
				events:{
					"onClose":function(){
						if(self.currentEditor==self.jsonEditor){
							self.fire("editorClose",this.json,this.getChange());
						}
						else{
							self.fire("editorClose",this.varInfo,false);
						}
					},
					scope: this
				}
			});
			this.window.show();	
			this.$jsonEditor=$("#json-editor");
			this.$jsonEditor.css({"height":"95%","display":"none"});
			this.$jsonEditor.changBarText=locale.get("json_editor");
			this.$normalEditor=$("#normal-editor");
			this.$normalEditor.changBarText=locale.get("normal_editor");
			this.$normalEditor.css({"height":"95%"});
				var $editorArray=[];
				if(this.$jsonEditor.css("display")=="none"){
					$editorArray[0]=this.$normalEditor;
					$editorArray[1]=this.$jsonEditor;
				}else{
					$editorArray[0]=this.$jsonEditor;
					$editorArray[1]=this.$normalEditor;
				};
			this.$currentEditor=$editorArray[0];
			$("#normal-editor").css({
				"border-bottom":"2px solid #dde1e4 "
			});
			$("#change-bar").text($editorArray[1].changBarText).css({
				"cursor":"pointer",
				"border-top":"2px solid #E3E6EA",
				"height":"20px",
				"width":"100%",
				"margin-top":"9px"
				//"background-color":"red"
					}).click(function(evt){														
							if(self.$currentEditor===self.$jsonEditor){
								self.jsonWhenBarChange=self.editor.get();
//								if(){
								if(typeof self.jsonWhenBarChange=="object"){
									$("#change-bar").text(self.$currentEditor.changBarText);
									self.$currentEditor.hide();
									self.$currentEditor=self.$normalEditor;
									self.normalEditor.set(self.jsonWhenBarChange);
									self.$currentEditor.show();
								}									
//								}								
							}
							else{
								$("#change-bar").text(self.$currentEditor.changBarText);
								var varInfo=self.normalEditor.get();
								varInfo.each(function(one){
									one.vars.each(function(two){
										delete two.bakId;
									})
								});	
								self.$currentEditor.hide();
								self.normalEditor.varibleDetailElement.hide();
								self.editor.set(varInfo);
								self.$currentEditor=self.$jsonEditor;
								self.$currentEditor.show();
							}
							
			});
		},
		_renderNormalEditor:function(){
		
		},
		_rendereditor:function(){
			var self=this;
			var container = $("#json-editor");
			var option = {
					mode : "code",
					error : function(err){
						var message = err.toString();
						if(message.indexOf("Unexpected token")>=0){
							var errmsg = locale.get("syntax_error_at") + message.substr(message.length-1,message.length);
							dialog.render({text:errmsg});
						}
						else if(message.indexOf("Unexpected end of input")>=0){
							if(!self.jsonWhenBarChange){
								dialog.render({text:locale.get("input_json")});
							}							
						}
						else{
							dialog.render({text:locale.get("syntax_error")});
						}
					}
			}
			this.editor = new jsoneditor.JSONEditor(container[0], option ,this.json);
			this.normalEditor=new NormalEditor({
				container:"#normal-editor",
				json:self.json,
				events:{
					"editorClose":function(varInfo){
						varInfo.each(function(one){
							one.vars.each(function(two){
								delete two.bakId;
							})
						});
						self.fire("editorClose",varInfo,true);
						self.window.destroy();
					}
//					"normalEditorSaveWhenBlur":function(varInfo){
//						self.varInfo=varInfo;
//						//self.flag=true;
//					}
				}
			});
			this._renderBtn();
		},
		_renderNormalEditor:function(){
			
		},
		_renderBtn:function(){
			this.saveBtn = new button({
				container: $(".menu"),
                id: "editor-save",
                text:locale.get({lang:"save1"}),
                events:{
                	click:function(){
                		var result = this.editor.get();
                		if(typeof result === "string"){
                			dialog.render({text:result});
                		}else if(typeof result === "object"){
                			this.jsonObj = result;
                			var idCollection=[];
                			this.jsonObj.each(function(one){
                				one.vars.each(function(two){
                					idCollection.push(two._id);
                				});
                			});
                			var prelength=idCollection.length;
                			var aftlength=0;
                			var tempCollection=[];
                			var tempFinal=[];
                			while(prelength!=aftlength){
                				tempBelow=[];
                				tempCollection=idCollection;
                				prelength=idCollection.length;
                				idCollection=idCollection.uniq();
                				aftlength=idCollection.length;
                				if(prelength!=aftlength){
                					for(var i=0;i<idCollection.length;i++){
                						var index=tempCollection.indexOf(idCollection[i]);
                						tempCollection.splice(index, 1);         					
                					}                  				
                    				tempFinal=tempCollection;
                				}
                			};
                			tempFinal=tempFinal.uniq();
    						if(tempFinal.length!=0){
    							var idstring=tempFinal.join(",");
    							dialog.render({
    								content:[{lang:"varidshouldbeuniq"},{html:"<br />"},{text:idstring}]
    							});
    						}else{
                    			this.fire("editorClose",this.jsonObj,this.getChange());
                    			this.window.destroy();
    						}
                		} 
                	},
                	scope:this
                }
			});
			$("#editor-save").css('float','right');
			$("button.format").attr("title",locale.get({lang:"format_json"}));
			$("button.compact").attr("title",locale.get({lang:"compact_json"}));
			 
			if( this.editor.get()[0] === undefined){
				$("textarea[class='content']").val(null);
				$("textarea[class='content']").bind({
				    focus:function(){
				        this.placeholder = null; 
				    },
				    blur:function(){
				        this.placeholder = '[{"name":"Network Status","_id":1,"vars":[{"name":"varname"}]}]';
				    }
				}).attr("placeholder",'[{"name":"Network Status","_id":1,"vars":[{"name":"varname"}]}]');//{"array":[1,2,3],"boolean":true,"null":null,"number":123,"object":{"a":"b","c":"d"},"string":"Hello World"}
			}
		},
		getJson:function(){
			return this.jsonObj;
		},
		getChange:function(){
			var same = JSON.stringify(this.json) === JSON.stringify(this.jsonObj);
			return !same
		},
		destroy:function($super){
			this.window.destroy();
			this.saveBtn.destroy();
			$super();
		}
	});
	return Editor;
})