/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * Example locale.render(),locale.render({pos:"www"}),locale.render({element:"#id",pos:"www"}),locale.get({lang:"login"})
 */
define(function(require){
	
	require("dt/core/dt.core");
	
	(function(){
		
		var root = window;
		
		var packages = {
			"default":"base",
	    	base:"dt/resources/language"
		};
		
		var langArr = ["en","zh_CN"];
		
		//Initialize the locale object
		root.locale = {
				
			browserLang:"",
			userLang:"",
			localLang:"",
			storageLang:"",
			langArr:langArr,
			langPacks:{},
			packUrl:"",
			element:"*",
			pos:packages["default"],
			lang:"",
			
			/*
			 * Set the locale attribute browser language
			 * @author PANJC
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
			
			/*
			 * Set the locale attribute user language
			 * @author PANJC
			 * @param {String} opt
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
			
			/*
			 * Set the locale attribute storageLang
			 * @author PANJC
			 * @param {String} opt
			 * @return {String}
			 */
			_setStorageLang:function(opt){
				this.storageLang = opt;
			},
			
			/*
			 * Set the locale attribute localLang
			 * @author PANJC
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
			
			/*
			 * Set local lang
			 * @author PANJC
			 */
			_setLang:function(){
				if(!this.browserLang){
					this._setBrowserLang();
				}
				if(!this.storageLang){
					this._setStorageLang(dt.storage.get("language"));
				}
				if(this.lang){
					this._setUserLang(this.lang);
				}
				this._setLocalLang();
			},
			
			/*
			 * Set browser local storage attribute language
			 * @author PANJC
			 * @param {String} opt
			 */
			_setStorage:function(lang){
				this._setStorageLang(lang);
				dt.storage.set("language",lang);
			},
			
			/*
			 * Return local storage attribute language
			 * @author PANJC
			 * @return {String}
			 */
			_getStorageLang:function(){
				return dt.storage.get("language");
			},
			
			/*
			 * Load language pack
			 * @author PANJC
			 * @param {Function} callback
			 */
			_loadPack:function(callback){
				var self = this;
				var url = require.toUrl(this.packUrl + "/" + this.storageLang + "/lang.js");
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
			
			/*
			 * To determine whether a language pack has been in existence
			 * @author PANJC
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
			
			/*
			 * Store language pack
			 * @author PANJC
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
			
			/*
			 * Get language pack url
			 * @author PANJC
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
			
			/*
			 * Store language pack
			 * @author PANJC
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
			
			/*
			 * Locale string
			 * @author PANJC
			 * @param {Object/String} opt {Array} variableArr
			 * @return {String}
			 */
			get:function(opt,variableArr){
				return this._get(opt,variableArr);
			},
			
			/*
			 * Locale page
			 * @author PANJC
			 * @param {Object} opt
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
			
			/*
			 * Locale page
			 * @author PANJC
			 * @param {Object} opt
			 */
			render:function(opt){
				if(opt && $.isPlainObject(opt)){
					opt.method = "render";
					this._render(opt);
				}else{
					this._render({method:"render"});
				}
			},
			
			/*
			 * Set user language
			 * @author PANJC
			 * @param {Object} opt
			 */
			set:function(opt){
				if(opt && $.isPlainObject(opt)){
					opt.method = "set";
					this._render(opt);
				}
			},
			
			/*
			 * Traverse elements and internationalization
			 * @author PANJC
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
			
			/*
			 * Get the result of each
			 * @author PANJC
			 * @param {Object} obj {Array} variableArr
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
			
			/*
			 * According to the method returns the result
			 * @author PANJC
			 * @param {Object} obj
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
			
			/*
			 * Return language number,if en return 1,if zh_CN return 2
			 * @author PANJC
			 * @return {Number}
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
		
	})(window)
	
});
