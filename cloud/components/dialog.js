/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author PANJC
 * Example
 * dialog.render({
 *  container:"#window-login",
 * 	lang:"confirm_the_deletion",
 * 	buttons:[{lang:"yes",click:function(){alert("yes")}},{lang:"no",click:function(){alert("no")}}],
 *  close:function(){alert("close")}
 * });
 * 
 * dialog.render({
 * 	lang:"confirm_the_deletion"
 * });
 * 
 * dialog.render({
 * 	text:"Confirm the deletion?"
 * });
 * 
 * dialog.render({
 * 	content:[{lang:21304},{html:"<p id='confirm'></p>"},{text:"cancel"}...],
 * });
 * 
 */
/**
 * @author PANJC
 * @filename dialog
 * @filetype {object}
 * @filedescription "这是一个对话框对象"
 * @filereturn {object} "dialog对象"
 * 
 * */
define(function(require){
	require("cloud/lib/jquery");
	require("cloud/lib/plugin/jquery-ui");
	require("cloud/resources/css/jquery-ui.css");
	dialog = {
		element:"",
		defaultObj:{
				appendTo:"body",
				autoOpen:true,
				buttons:{},
				closeOnEscape:true,
				closeText:"hide",
				dialogClass:"dialogclass",
				draggable:true,
				hide:50,
				show:10,
				width:360,
				minWidth:360,
				maxWidth:460,
				height:150,
				minHeight:150,
				maxHeight:250,
				modal:true,
				position:{my:"center",at:"center",of:window},
				resizable:false,
				stack:false,
				title:"",
				beforeClose:null,
				close:null,
				create:null,
				drag:null,
				dragStart:null,
				dragStop:null,
				focus:null,
				open:null,
				resize:null,
				resizeStart:null,
				resizeStop:null
		},
		
		/**
		 * @author PANJC
		 * @name render
		 * @type {method}
		 * @description "显示对   话框"
		 * @param {object} userObj "以json形式组织的参数对象"
		 * @param {array} variableArr "变量数组"
		 */
		render:function(userObj,variableArr){
			if($(".inhand-dialog").length > 0){
				return;
			}
			this._setDialogIntoContainer(userObj,this._returnDialogContent(userObj,variableArr));
			$(this.element).dialog(this._returnExtendOptions(userObj));
		},
		
		/**
		 * @author PANJC
		 * @name _returnExtendOptions
		 * @type {method}
		 * @description "扩展传入的参数对象"
		 * @param {Object} userObj "json对象"
		 * @return {Object} "新的json对象"
		 * @private
		 */
		_returnExtendOptions:function(userObj){
			var self = this;
			var newObj = {};
			var defaultObj = this.defaultObj;
			
			if(userObj.container){
				newObj.appendTo = userObj.container;
				newObj.position = {my:"center",at:"center",of:userObj.container};
				newObj.width = 260;
				newObj.minWidth = 260;
				newObj.height = 130;
				newObj.minHeight = 130;
				newObj.draggable = false;
			}else{
				newObj.appendTo = "body";
				newObj.position = {my:"center",at:"center",of:window};
				newObj.width = 360;
				newObj.minWidth = 360;
				newObj.height = 150;
				newObj.minHeight = 150;
				newObj.draggable = false;
			}
			
			if(userObj.buttons){
				var arr = [];
				$.each(userObj.buttons,function(index,obj){
					var buttonObj = {};
					if(obj.text){
						buttonObj.text = obj.text;
					}else if(obj.lang){
						buttonObj.text = locale.get({lang:obj.lang,pos:"base"});
					}
					buttonObj.click = obj.click;
					arr.push(buttonObj);
				});
				newObj.buttons = arr;
				newObj.title = locale.get({lang:"prompt",pos:"base"});
			}else{
				newObj.buttons = [{text:locale.get({lang:"ok",pos:"base"}),click:function(){self.close();}}];
				newObj.title = locale.get({lang:"prompt",pos:"base"});
			}
			if(userObj.model){
				newObj.modal = true;
			}
			
			if(userObj.open && ($.isFunction(userObj.open))){
				newObj.open = function(){userObj.open();};
			}
			
			if(userObj.close && ($.isFunction(userObj.close))){
				newObj.close = function(){self.close();userObj.close();};
			}else{
				newObj.close = function(){self.close();};
			}
			
			if(userObj.create && ($.isFunction(userObj.create))){
				newObj.create = function(){userObj.create();};
			}
			
			if(userObj.width){
				newObj.width = userObj.width;
				newObj.minWidth = userObj.width;
			}
			
			if(userObj.height){
				newObj.height = userObj.height;
				newObj.minHeight = userObj.height;
			}
			
			newObj = $.extend(defaultObj,newObj);
			
			return newObj;
			
		},
		
		/**
		 * @author PANJC
		 * @name _returnDialogContent
		 * @type {method}
		 * @description "获取要显示对话框的文字内容"
		 * @param {Object} userObj "json格式的对象"
		 * @param {Array} variableArr "变量数组"
		 * @return {String} "对话框文字内容"
		 * @private
		 */
		_returnDialogContent:function(userObj,variableArr){
			var dialogContent = "";
			if(!userObj.content){
				if(userObj.text){
					dialogContent = userObj.text;
				}else if(userObj.lang){
					dialogContent = variableArr ? locale.get({lang:userObj.lang,pos:"base"},variableArr) : locale.get({lang:userObj.lang,pos:"base"});
				}
			}else{
				var content = userObj.content;
				for(var num=0;num<content.length;num++){
					if(content[num]["lang"]){
						if(variableArr){
							dialogContent += locale.get({lang:content[num]["lang"],pos:"base"},variableArr);
						}else{
							dialogContent += locale.get({lang:content[num]["lang"],pos:"base"});
						}
					}else if(content[num]["text"]){
						dialogContent += content[num]["text"];
					}else if(content[num]["html"]){
						dialogContent += content[num]["html"];
					}
				}
			}
			return dialogContent;
		},
		
		/**
		 * @author PANJC
		 * @name _setDialogIntoContainer
		 * @type {method}
		 * @description "将对话框添加到显示页面中的dom结构中去"
		 * @param {Object} userObj "json格式的对象"
		 * @param {String} content "对话框文字内容"
		 * @private
		 */
		_setDialogIntoContainer:function(userObj,content){
			var element = this._createRandomElement();
			var $dialog = this._createDialogElement(element,content);
			if(userObj.container){
				$dialog.appendTo($(userObj.container));
			}else{
				$dialog.appendTo("body");
			}
		},
		
		/**
		 * @author PANJC
		 * @name _createRandomElement
		 * @type {method}
		 * @description "以时间为区分，创建dom的jquery选择器"
		 * @return {String}
		 * @private
		 */
		_createRandomElement:function(){
			var date = (new Date()).toString().md5();
			var random = (Math.random()).toString().md5();
			element = "#" + "dialog-" + date + random;
			this.element = element;
			return element;
		},
		
		/**
		 * @author PANJC
		 * @name _createDialogElement
		 * @type {method}
		 * @description "创建对话框的内容元素"
		 * @param {string} element "dom的id选择器"
		 * @param {string} content "对话框的文字内容"
		 * @return {Object} "jquery对象"
		 * @private
		 */
		_createDialogElement:function(element,content){
			var $dialog = $("<div>").attr("id",element.substring(1)).attr("class","inhand-dialog").css({width:"100%",height:60});
			var $content = $("<span>").html(content);
			$content.appendTo($dialog);
			return $dialog;
		},
		
		/**
		 * @author PANJC
		 * @name close
		 * @type {method}
		 * @description "关闭对话框"
		 */
		close:function(){
			var self = this;
			$(self.element).dialog("close");
			$(self.element).dialog("destroy");
			$(self.element).remove();
		}
		
	};
	
	return dialog;
	
});