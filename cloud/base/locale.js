/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * Example locale.render(),locale.render({pos:"www"}),locale.render({element:"#id",pos:"www"}),locale.get({lang:"login"})
 * @author PanJC
 * @filename locale
 * @filetype {object}
 * @filedescription "语言国际化对象"
 * @filereturn {object} locale "本地化对象，主要是语言"
 */
define(function(require){
	require("cloud/lib/jquery");
	require("cloud/base/_config");
	
	config = CONFIG;
	packages = config["locale"]["packages"];
	languages = config["locale"]["languages"];
	
	//Initialize the locale object
	locale = {
			
		browserLang:"",
		userLang:"",
		localLang:"",
		storageLang:"",
		langArr:languages,
		langPacks:{},
		packUrl:"",
		element:"*",
		pos:packages["default"],
		lang:"",
		
		/**
		 * Set the locale attribute browser language
		 * @author PANJC
		 * @name _setBrowserLang
		 * @type {method}
		 * @description "设置浏览器的language属性"
		 * @private
		 * @return
		 */
		_setBrowserLang:function(){
			var browser = navigator.language || navigator.browserLanguage;
			var browserLang = browser.toLowerCase().substring(0,2);
			var langArr = this.langArr;
			var arrCurrent;
			for(var num = 0;num < langArr.length;num++){
				arrCurrent = langArr[num].toLowerCase().substring(0,2);
				if(browserLang == arrCurrent){
					this.browserLang = langArr[num];
					return;
				}
			}
		},
		
		/**
		 * Set the locale attribute user language
		 * @author PANJC
		 * @name _setUserLang
		 * @type {method}
		 * @description "设置用户的language属性"
		 * @param {String} opt
		 * @private
		 * @return
		 */
		_setUserLang:function(opt){
			var langArr = this.langArr;
			for(var num = 0;num < langArr.length;num++){
				if(langArr[num].toLowerCase().indexOf(opt.toLowerCase()) > -1){
					this.userLang = langArr[num];
					return;
				}
			}
		},
		
		/**
		 * Set the locale attribute storageLang
		 * @author PANJC
		 * @name _setStorageLang
		 * @type {method}
		 * @description "设置storageLang属性"
		 * @param {String} opt
		 * @private
		 * @return {String}
		 */
		_setStorageLang:function(opt){
			this.storageLang = opt;
		},
		
		/**
		 * Set the locale attribute localLang
		 * @author PANJC
		 * @name _setLocalLang
		 * @type {method}
		 * @description "设置localLang属性"
		 * @private
		 * @return
		 */
		_setLocalLang:function(){
			if(this.storageLang && this.userLang){
				this.localLang = this.userLang;
			}else if(this.storageLang && !this.userLang){
				this.localLang = this.storageLang;
			}else if(!this.storageLang && this.userLang){
				this.localLang = this.userLang;
			}else{
				this.localLang = this.browserLang;
			}
			this._setStorage(this.localLang);
		},
		
		/**
		 * Set local lang
		 * @author PANJC
		 * @name _setLang
		 * @type {method}
		 * @description "设置lang属性"
		 * @private
		 * @return
		 */
		_setLang:function(){
			if(!this.browserLang){
				this._setBrowserLang();
			}
			if(!this.storageLang){
				this._setStorageLang(localStorage.getItem("language"));
			}
			if(this.lang){
				this._setUserLang(this.lang);
			}
			this._setLocalLang();
		},
		
		/**
		 * Set browser local storage attribute language
		 * @author PANJC
		 * @name _setStorage
		 * @type {method}
		 * @description "设置localStorage的属性language"
		 * @param {String} opt
		 * @private
		 * @return
		 */
		_setStorage:function(lang){
			this._setStorageLang(lang);
			localStorage.setItem("language",lang);
		},
		
		/**
		 * Return local storage attribute language
		 * @author PANJC
		 * @name _getStorageLang
		 * @type {method}
		 * @description "获取localStorage中的language"
		 * @private
		 * @return {String}
		 */
		_getStorageLang:function(){
			return localStorage.getItem("language");
		},
		
		/**
		 * Load language pack
		 * @author PANJC
		 * @name _loadPack
		 * @type {method}
		 * @description "加载语言包"
		 * @param {Function} callback
		 * @private
		 * @return
		 */
		_loadPack:function(callback){
			var self = this;
			var url = this.packUrl + "/" + this.storageLang + "/lang.js";
			$.ajax({
				  url: url,
				  dataType: "script",
				  async: false,
				  success: function(){
						self._cacheLangPacks();
						if(callback){
							if($.isArray(callback)){
								for(var num=0;num<callback.length;num++){
									callback[num]();
								}
							}else{
								callback();
							}
						}
					}
			});
		},
		
		/**
		 * To determine whether a language pack has been in existence
		 * @author PANJC
		 * @name _hasPacks
		 * @type {method}
		 * @description "判断语言包是否已经存在"
		 * @private
		 * @return {Boolean}
		 */
		_hasPacks:function(){
			var langPacks = this.langPacks;
			for(var attr in langPacks){
				if(attr == this.storageLang){
					for(var _attr in langPacks[attr]){
						if(_attr == this.pos){
							return true;
						}
					}
				}
			}
		},
		
		/**
		 * Store language pack
		 * @author PANJC
		 * @name _cacheLangPacks
		 * @type {method}
		 * @description "存储语言包"
		 * @private
		 * @return
		 */
		_cacheLangPacks:function(){
			var langName,langObj;
			var pos = this.pos;
			var langPacks = this.langPacks;
			for(var attr in lang){
				langName = attr;
				langObj = lang[attr];
			}
			if(langPacks[langName]){
				langPacks[langName][pos] = langObj;
			}else{
				langPacks[langName] = {};
				langPacks[langName][pos] = langObj;
			}
			this.langPacks = langPacks;
		},
		
		/**
		 * Get language pack url
		 * @author PANJC
		 * @name _getPackUrl
		 * @type {method}
		 * @description "获取语言包的url"
		 * @private
		 * @return
		 */
		_getPackUrl:function(){
			if(this.pos){
				packUrl = packages[this.pos];
				if(packUrl){
					this.packUrl = packUrl;
				}else{
					this.pos = packages["default"];
					this.packUrl = packages[this.pos];
				}
			}else{
				this.pos = packages["default"];
				this.packUrl = packages[this.pos];
			}
		},
		
		/**
		 * Store language pack
		 * @author PANJC
		 * @name _languageIsCorrect
		 * @tyep {method}
		 * @description "存储语言包"
		 * @private
		 * @return {Boolean}
		 */
		_languageIsCorrect:function(){
			if(!this.storageLang || !this._getStorageLang()){
				return false;
			}else{
				if(this.lang && this.lang != this.storageLang){
					return false;
				}else{
					return true;
				}
			}
		},
		
		/*
		 * Locale string
		 * @author PANJC
		 * @param {Object/String} opt {Array} variableArr
		 * @private
		 * @return {String}
		 */
		_get:function(opt,variableArr){
			var self = this;
			var obj = {};
			if(opt && $.isPlainObject(opt)){
				obj.str = opt.lang;
				this.pos = opt.pos ? opt.pos : "base";
			}else{
				obj.str = opt;
				this.pos = "base";
			}
			if(!this._languageIsCorrect()){
				this._setLang();
			}
			if(this._hasPacks()){
				self.str = variableArr ? this._result(obj,variableArr) : this._result(obj);
			}else{
				this._getPackUrl();
				variableArr ? this._loadPack(function(){self.str = self._result(obj,variableArr);}) : this._loadPack(function(){self.str = self._result(obj);});
			};
			return self.str;
		},
		
		/**
		 * Locale string
		 * @author PANJC
		 * @name get
		 * @type {method}
		 * @description "获取locale的属性值"
		 * @param {Object/String} opt 
		 * @param {Array} variableArr
		 * @return {String}
		 */
		get:function(opt,variableArr){
			return this._get(opt,variableArr);
		},
		
		/**
		 * Locale page
		 * @author PANJC
		 * @name _render
		 * @type {method}
		 * @description "本地化分页信息"
		 * @param {Object} opt "配置信息"
		 * @private
		 * @return 
		 */
		_render:function(opt){
			var self = this;
			if(opt.method == "render"){
				this.pos = opt.pos ? opt.pos : "base";
				this.element = opt.element ? opt.element : "*";
			}else if(opt.method == "set"){
				this.lang = opt.lang ? opt.lang : "zh_CN";
				this.pos = opt.pos ? opt.pos : "base";
				this.element = "*";
			}
			if(!this._languageIsCorrect()){
				this._setLang();
			}
			if(this._hasPacks()){
				this._each(self.element);
			}else{
				this._getPackUrl();
				this._loadPack(function(){self._each(self.element);});
			};
		},
		
		/**
		 * Locale page
		 * @author PANJC
		 * @name render
		 * @type {method}
		 * @description "本地化分页信息"
		 * @param {Object} opt "配置信息"
		 * @return
		 */
		render:function(opt){
			if(opt && $.isPlainObject(opt)){
				opt.method = "render";
				this._render(opt);
			}else{
				this._render({method:"render"});
			}
		},
		
		/**
		 * Set user language
		 * @author PANJC
		 * @name set
		 * @type {method}
		 * @description "设置用户语言"
		 * @param {Object} opt "配置信息"
		 * @return
		 */
		set:function(opt){
			if(opt && $.isPlainObject(opt)){
				opt.method = "set";
				this._render(opt);
			}
		},
		
		/**
		 * Traverse elements and internationalization
		 * @author PANJC
		 * @name _each
		 * @type {method}
		 * @description "遍历元素国际化"
		 * @private
		 * @return
		 */
		_each:function(){
			var self = this;
			var element = this.element;
			var storageLang = self.storageLang;
			var langPacks = self.langPacks;
			var $dom;
			if(typeof this.element == "string"){
				$dom = $(element);
			}else{
				$dom = element;
			}
			$dom.find("[lang]").each(function(){
				var $this = $(this);
				var langContent = $this.attr("lang").toLowerCase();
				var semiIndex = langContent.indexOf(";");
				var lbracketIndex = langContent.indexOf("{");
				var strlen = langContent.length;
				var colonIndex,attrId,attrValue,dicKey;
				if(lbracketIndex > -1){
					var rbracketIndex = langContent.indexOf("}");
					if(semiIndex > -1){
						langContent = langContent.substring(lbracketIndex+1,semiIndex);
					}else{
						langContent = langContent.substring(lbracketIndex+1,rbracketIndex);
					}
					attrArr = langContent.split(",");
					for(var num=0,arrLen=attrArr.length;num<arrLen;num++){
						attr = attrArr[num];
						colonIndex = attr.indexOf(":");
						attrId = attr.substring(0,colonIndex);
						attrValue = attr.substring(colonIndex+1);
						result = self._result({str:attrValue});
						self._return({$this:$this,attrId:attrId,str:result});
					}
				}else if(langContent){
					colonIndex = langContent.indexOf(":");
					if(semiIndex > -1){
						attrId = langContent.substring(0,colonIndex);
						attrValue = langContent.substring(colonIndex+1,strlen-1);
					}else{
						attrId = langContent.substring(0,colonIndex);
						attrValue = langContent.substring(colonIndex+1);
					}
					result = self._result({str:attrValue});
					self._return({$this:$this,attrId:attrId,str:result});
				}
			});
		},
		
		/**
		 * Get the result of each
		 * @author PANJC
		 * @name _result
		 * @type {method}
		 * @description "获取遍历的结果"
		 * @param {Object} obj 
		 * @param {Array} variableArr
		 * @private
		 * @return {String}
		 */
		_result:function(obj,variableArr){
			var pos = this.pos;
			var langPacks = this.langPacks;
			var storageLang = this.storageLang;
			var attrValue = obj.str.toString();
			var str = "";
			if(attrValue.indexOf("+") > -1){
				var arr = [];
				var current;
				arr = attrValue.split("+");
				for(var num=0;num<arr.length;num++){
					current = arr[num];
					if(storageLang == "en"){
						if(current.match(/\W/)){
							str += current + " ";
						}else{
							str += langPacks[storageLang][pos][current] + " ";
						}
					}else{
						if(current.match(/\W/)){
							str += current;
						}else{
							str += langPacks[storageLang][pos][current];
						}
					}
				}
				str = str.replace(/\s$/g,"");
			}else{
				str = langPacks[storageLang][pos][attrValue];
			}
			if(variableArr && str){
				for(var num=0;num<variableArr.length;num++){
					if(str.indexOf("{"+num+"}") > -1){
						str = str.replace("{"+num+"}",variableArr[num]);
					}
				};
			}
			return str;
		},
		
		/**
		 * According to the method returns the result
		 * @author PANJC
		 * @name _return
		 * @type {method}
		 * @description "根据方法返回结果"
		 * @param {Object} obj
		 * @private
		 * @return
		 */
		_return:function(obj){
			var $this = obj.$this;
			var attrId = obj.attrId;
			var str = obj.str;
			switch(attrId){
				case "text":
					$this.text(str);
					break;
				case "value":
					$this.val(str);
					break;
				case "title":
					$this.attr("title",str);
					break;
				case "alt":
					$this.attr("alt",str);
					break;
			}
		},
		
		/**
		 * Return language number,if en return 1,if zh_CN return 2
		 * @author PANJC
		 * @name current
		 * @type {method}
		 * @description "返回language的编号"
		 * @return {Number} "英文对应1;中文对应2" 
		 */
		current:function(){
			var lang = this._getStorageLang();
			switch(lang){
				case "en":
					return 1;
					break;
				case "zh_CN":
					return 2;
					break;
			}
		}
		
	};
	
	return locale;
	
});
