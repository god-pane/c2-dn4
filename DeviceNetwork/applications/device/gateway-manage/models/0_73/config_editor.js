/**
 * @author zhang
 */
define(function(require){
	require("cloud/base/cloud");
	var jsoneditor = require("cloud/lib/plugin/jsoneditor");
	
	var Editor = Class.create(cloud.Component,{
		initialize:function($super,options){
			this._renderEditor();
		},
		_renderEditor:function(){
			var container = $("#config-editor");
			var option = {
					mode : "code",
					error : function(err){
//						var message = err.toString();
//						if(message.indexOf("Unexpected token")>=0){
//							var errmsg = locale.get("syntax_error_at") + message.substr(message.length-1,message.length);
//							dialog.render({text:errmsg});
//						}else{
//							dialog.render({text:locale.get("syntax_error")});
//						}
					}
			}
			this.editor = new jsoneditor.JSONEditor(container[0], option );
			$(".menu").remove();
			$(".outer").css({ margin : "0" , padding : "0"});
			
			
		},
		updateScheme:function(config){
			this.editor.set(config);
		},
		savePage:function(){
			return this.editor.get();
		}
		
		
	});
	return Editor
});