/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved..
 * Example 
 * validator.render("#formId",{promptPosition:"centerRight",scroll: false}) render validator
 * varlidator.result() get validator result,true if the form validates, false if it failed
 * varlidator.result("#id") specified element,get validator result,true if the form validates, false if it failed
 * varlidator.hide("#form") specified element,hide prompt
 * varlidator.hide() hide prompt
 * varlidator.hideAll() hide all prompts
 * @author PANJC
 * @filename validator
 * @filetype {object}
 * @filedescription "验证表单组件"
 * @filereturn {object} validator "验证组件对象"
 */
define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery.validationEngine");
	require("cloud/resources/css/jquery.validationEngine.css");
	
	validator = {
		storageLang:null,
		langPacks:{},
		element:null,
		elements:[],
		validation:null,
		
		/**
		 * Render validator
		 * @author PANJC
		 * @name render
		 * @type {method}
		 * @description "渲染组件"
		 * @param {String} element "渲染的dom元素"
		 * @param {Object} paramObj "配置参数"
		 * @return 
		 */
		render:function(element,paramObj){
			this._cacheElements(element,paramObj);
			this._cacheStorageLang();
			this.hideAll();
			this._destroy();
			this._render();
		},
		
		/**
		 * Store storage lang
		 * @author PANJC
		 * @name _cacheStorageLang
		 * @type {method}
		 * @description "设置语言"
		 * @private
		 * @return
		 */
		_cacheStorageLang:function(){
			var lang = this._returnStorageLang();
			if(!this.storageLang){
				this.storageLang = lang ? lang : "zh_CN";
			}else{
				if(this.storageLang != lang){
					this.storageLang = lang ? lang : "zh_CN";
				}
			}
		},
		
		/**
		 * Store elements
		 * @author PANJC
		 * @name _cacheElements
		 * @type {method}
		 * @description "缓存dom结构和配置项"
		 * @param {String} element
		 * @param {Object} paramObj
		 * @private
		 * @return
		 */
		_cacheElements:function(element,paramObj){
			var self = this;
			this.element = element;
			var elements = this.elements;
			var defaultObj = {
				fadeDuration: 0,
				showOneMessage:true,
				focusFirstField:true,
				customFunctions:{
					/* called by funcCall[functionName]
					* @param {jqObject} field
					* @param {Array[String]} rules
					* @param {int} i rules index
					* @param {Map}  user options
					*/
					cloudInput:function(field, rules, i, options){
						var nohtml  = new RegExp("(<[^>]+>)|(&gt|&lt|&amp|&quot|&nbsp)");
						if( nohtml.test(field.val()) ){
							//add rules at validationengine.lang 
							return options.allrules.nohtml.alertText;
						}
//						if(field.val()==="test"){
//							return "no test";
//						}
						return true;
					}
				}
			};
			paramObj = $.extend(paramObj,defaultObj);
			if(elements.length > 0){
				var count = 0;
				$.each(elements,function(index,obj){
					if(element == obj.element){
						//if element is same,reset paramObj
						var currentParamObj = obj.paramObj;
						var newParamObj = $.extend(currentParamObj,paramObj);
						self.elements[index]["paramObj"] = newParamObj;
						count++;
					}
				});
				if(count === 0){
					this.elements.push({element:element,paramObj:paramObj});
				}
			}else{
				this.elements.push({element:element,paramObj:paramObj});
			}
		},
		
		/**
		 * Return the validation result
		 * @author PANJC
		 * @name result
		 * @type {method}
		 * @description "显示验证结果信息"
		 * @param {String} element "dom元素"
		 * @return {boolean} "验证结果:true,false"
		 */
		result:function(element){
			if(this.validation){
				if(element){
					return $(element).validationEngine('validate');
				}else{
					return $(this.element).validationEngine('validate');
				}
			}
		},
		
		/**
		 * Row prompt
		 * @author PANJC
		 * @name prompt
		 * @type {method}
		 * @description "验证结果提示信息"
		 * @param {String} element "dom元素"
		 * @param {Object} obj "配置对象"
		 * @return
		 */
		prompt:function(element,obj){
			$(element).validationEngine("showPrompt",obj.text,"load",obj.promptPosition?obj.promptPosition:"topLeft",true);
		},
		
		/**
		 * Hide prompt
		 * @author PANJC
		 * @name hide
		 * @type {method}
		 * @description "隐藏提示"
		 * @param {String} element "dom元素"
		 * @return
		 */
		hide:function(element){
			if(element){
				$(element).validationEngine('hide');
			}else{
				$(this.element).validationEngine('hide');
			}
		},
		
		/**
		 * Hide all prompt
		 * @author PANJC
		 * @name hideAll
		 * @type {method}
		 * @description "隐藏所有提示"
		 * @param {String} element "dom元素"
		 * @return
		 */
		hideAll:function(element){
			if(element){
				$(element).validationEngine('hideAll');
			}else{
				var elements = this.elements;
				if(this.validation){
					$.each(elements,function(index,obj){
						$(obj.element).validationEngine('hideAll');
					});
				}
			}
		},
		
		/**
		 * detach prompt
		 * @author PANJC
		 * @name _destroy
		 * @type {method}
		 * @description "摧毁提示框"
		 * @private
		 * @return
		 */
		_destroy:function(){
			var elements = this.elements;
			if(this.validation){
				this.validation = null;
				$.each(elements,function(index,obj){
					$(obj.element).validationEngine('detach');
				});
			}
		},
		
		/**
		 * Render validatior
		 * @author PANJC
		 * @name _render
		 * @type {method}
		 * @description "渲染表单验证结果"
		 * @private
		 * @return
		 */
		_render:function(){
			var storageLang = this.storageLang;
			var hasPack = function(){
				var langPacks = self.langPacks;
				for(var attr in langPacks){
					if(attr == storageLang){
						return true;
					}
				}
			};
			if(hasPack()){
				this._renderForm();
			}else{
				this._loadPack();
			}
		},
		
		/**
		 * Return storage lang
		 * @author PANJC
		 * @name _returnStorageLang
		 * @type {method}
		 * @description "国际化"
		 * @private
		 * @return {String}
		 */
		_returnStorageLang:function(){
			return cloud.storage.localStorage("language");
		},
		
		/**
		 * Render form
		 * @author PANJC
		 * @name _renderForm
		 * @type {method}
		 * @description "渲染表单验证结果"
		 * @private
		 * @return
		 */
		_renderForm:function(){
			var self = this;
			var elements = this.elements;
			self._returnAllRules();
			$.each(elements,function(index,obj){
				self.validation = $(obj.element).validationEngine('attach',obj.paramObj);
			});
		},
		
		/**
		 * Load pack
		 * @author PANJC
		 * @name _loadPack
		 * @type {method}
		 * @description "加载语言包"
		 * @private
		 * @return
		 */
		_loadPack:function(){
			var self = this;
			var url = require.toUrl("cloud/resources/language/") + self.storageLang + "/validationengine.lang.js";
			$.getScript(url,function(data){
				self._cacheLangPacks();
				self._renderForm();
			});
		},
		
		/**
		 * Return all rules
		 * @author PANJC
		 * @name _returnAllRules
		 * @type {method}
		 * @description "设置所有验证规则"
		 * @private
		 * @return {Object/Json}
		 */
		_returnAllRules:function(){
			var self = this;
			var returnAllRules = function(){
				$.validationEngineLanguage.allRules = self.langPacks[self.storageLang];
			};
			return returnAllRules();
		},
		
		/**
		 * Store lang pack
		 * @author PANJC
		 * @name _cacheLangPacks
		 * @type {method}
		 * @description "缓存语言包"
		 * @private
		 * @return
		 */
		_cacheLangPacks:function(){
			var self = this;
			var lang = $.validationEngineLanguage;
			var langName,langObj;
			for(var attr in lang){
				langName = attr;
				langObj = lang[attr];
			}
			self.langPacks[langName] = langObj;
		}
		
	};
	
	return validator;
	
});