/**
 * @author gaowh
 * @filename permission
 * @filetype {class}
 * @filedescription "权限控制工具组件"
 * @filereturn {function} Permission "函数引用"
 */
define(function(require) {
	
	require("cloud/base/cloud");
	
	var root = window;
	
	var cookie = {
		//设置某条cookie
		set:function(name,value,param){
			var cookieContent = name + "=" + value;
			if($.isPlainObject(param)){
				if(param.secure !== false){
					cookieContent += "; secure=" + true;
				}
			}
			root.document.cookie = cookieContent;
		},
		//获取某条cookie
		get:function(name){
			var cookiesContent = root.document.cookie;
			var cookiesContentArr = cookiesContent.split(";");
			for(var num = 0 ; num < cookiesContentArr.length ; num++){
				var item = cookiesContentArr[num];
				var itemArr = item.split("=");
				var _name = itemArr[0];
				var _value = itemArr[1];
				if(_name){
					_name = _name.replace(/\s/g, "");
				}
				if(_value){
					_value = _value.replace(/\s/g, "");
				}
				if(_name === name){
					return _value;
				}
			}
		},
		//清除某条cookie
		remove:function(name){
			var value = cookie.get(name);
			var date = new Date();
			date.setTime(date.getTime()-10000);
			cookie.set(name,value,{expires:date.toGMTString()});
		}
	};
	
	var session = {
			//设置sessionStorage
			set:function(name,value){
				root.sessionStorage.setItem(name,value);
			},
			//获取sessionStorage
			get:function(name){
				return root.sessionStorage.getItem(name);
			},
			//清除sessionStorage
			remove:function(name){
				root.sessionStorage.removeItem(name);
			}
	};
	
	var Permission = Class.create(cloud.Component, {
		/**
		 * @author gaowh
		 * @name initialize
		 * @type {function}
		 * @description "该类实例化函数"
		 * @param {function} $super "父类引用"
		 * @param {object} options "json参数对象"
		 */
		initialize : function($super, options) {
			var self = this;
//			this.configCode = configCode;
			this.options = options;
			this.options.events = options.events ? options.events : {};
			if(options.custom && $.isArray(options.custom)){
				$.merge(configCode,options.custom);
			}
			this.privileges = {
					accept:"accept",
					deny:"deny",
					"default":"default"
			}
			this.accountInfo = "accountInfo";
			this._loadFiles(function(){
				self._render();
			});
		},
		/**
		 * @author gaowh
		 * @name _initializeMethods
		 * @type {method}
		 * @description "初始化该类的各种方法"
		 * @private
		 * @return
		 */
		_initializeMethods:function(){
			var self = this;
			if(self.config.cache === "session") {
				self._set = session.set;
				self._get = session.get;
				self._remove = session.remove;
			} else if(self.config.cache === "cookie"){
				self._set = cookie.set;
				self._get = cookie.get;
				self._remove = cookie.remove;
			} else if($.isPlainObject(self.config.cache)){
				self._set = function(key,value){
					self.config.cache.set(key, value);
				}
				self._get = function(key){
					return self.config.cache.get(key);
				}
				self._remove = function(key){
					self.config.cache.remove(key);
				}
			}
		},
		/**
		 * @author gaowh
		 * @name _initialize
		 * @type {method}
		 * @description "存储用户角色权限列表和账户信息"
		 * @private
		 * @return
		 */
		_initializeProperties:function(){
			var self = this;
			if($.isPlainObject(self.config.cache)){
				if(self.config.cache.keys){
					if(self.config.cache.keys.privileges){
						self.privileges = self.config.cache.keys.privileges;
					}
					if(self.config.cache.keys.accountInfo){
						self.accountInfo = self.config.cache.keys.accountInfo;
					}
				}
			}
		},
		/**
		 * @author gaowh
		 * @name _render
		 * @type {method}
		 * @description "初始化权限列表方法的包装"
		 * @private
		 * @return
		 */
		_render : function() {
			this._setPrivileges();
		},
		/**
		 * @author gaowh
		 * @name _loadFiles
		 * @type {method}
		 * @description "加载入口和应用的权限配置文件"
		 * @param {function} callback "回掉函数"
		 * @private
		 * @return
		 */
		_loadFiles:function(callback){
			var self = this;
				require([CONFIG.permission.config], function(config){
					self.config = config;
					self._initializeMethods();
					self._initializeProperties();
						require([CONFIG.permission.apps], function(apps){
							self.apps = self._rewriteAppsConfig(apps);
							if(CONFIG.permission.gates){
								require([CONFIG.permission.gates], function(gates){
									self.gates = gates;
									callback();
								});
							}else{
								self.gates = gates;
								callback();
							}
						});
				});
		},
		/**
		 * @author gaowh
		 * @name _rewriteAppsConfig
		 * @type {method}
		 * @description "app的配置"
		 * @param {object} apps
		 * @private
		 * @return {object} newApps
		 */
		_rewriteAppsConfig:function(apps){
			var self = this;
			var newApps = {};
			newApps["default"] = apps["default"];
			for(var attr in apps){
				if(attr !== "default"){
					newApps[attr] = {};
					var _apps = apps[attr];
					for(var _attr in _apps){
						var _arr = $.merge(_apps[_attr],apps["default"]);
						if(_attr !== "read"){
							_arr = $.merge(_arr,_apps["read"]);
						}
						_arr = _arr.uniq();
						_arr.sort(function(a,b){
							return a - b;
						});
						newApps[attr][_attr] = _arr;
					}
				}
			}
			return newApps;
		},
		
		/**
		 * @author panjc
		 * @name _setPrivileges
		 * @type {method}
		 * @description "保存用户的权限表"
		 * @private
		 */
		_setPrivileges : function() {
			var self = this;
			self.removePrivileges();
			Model.oauth({
				method:"get_token_info",
				success:function(data){
					var privileges = data.privileges;
					self._set(self.privileges.default, privileges["default"]);
					self._set(self.privileges.accept, privileges.accept.join(","));
					self._set(self.privileges.deny, privileges.deny.join(","));
					self._setInfo(data);
					if(self.options.events.afterLoad){
						self.options.events.afterLoad();
					}
					
				}
			});
		},
		/**
		 * @author gaowh
		 * @name getInfo
		 * @type {method}
		 * @description "将用户信息整理为对象"
		 * @return {object} obj "用户信息对象"
		 */
		getInfo:function(){
			var self = this;
			var arr = (self._get(self.accountInfo)).split(",");
			var obj = {};
			for(var num = 0 ; num < arr.length ; num++){
				var _arr = arr[num].split(":");
				obj[_arr[0]] = _arr[1];
			}
			return obj;
		},
		/**
		 * @author gaowh
		 * @name _setInfo
		 * @type {method}
		 * @description "设置用户信息"
		 * @param {object} data "用户数据对象"
		 * @private
		 * @return
		 */
		_setInfo:function(data){
			var self = this;
			var _arr = [];
			for(var attr in data){
				if(attr !== "privileges"){
					_arr.push(attr + ":" + data[attr]);
				}
			}
			self._set(self.accountInfo, _arr.join(","));
		},
		/**
		 * @author gaowh
		 * @name _getPrivileges
		 * @type {method}
		 * @description "获取用户权限列表的数组格式"
		 * @return
		 */
		_getPrivileges : function() {
			var self = this;
			var accept = self._get(self.privileges.accept),
				deny = self._get(self.privileges.deny),
				_default = self._get(self.privileges.default);
			var obj = {
					accept:accept ? accept.split(",") : [],
					deny:deny ? deny.split(",") : [],
					default:_default
			}
			return obj;
		},
		
		/**
		 * @author gaowh
		 * @name removePrivileges
		 * @type {method}
		 * @description "移除用户权限列表"
		 * @return
		 */
		removePrivileges: function() {
			var self = this;
			self._remove(self.privileges.accept);
			self._remove(self.privileges.deny);
			self._remove(self.privileges.default);
			self._remove(self.accountInfo);
		},
		
		/**
		 * @author gaowh
		 * @name _getGatesConfig
		 * @type {method}
		 * @description "获取应用的入口配置"
		 * @param {string} type
		 * @private
		 * @return
		 */
		_getGatesConfig: function(type) {
			var self = this;
			var type = type ? type : "bool";
			if(type === "bool"){
				var config = {};
				var permissionArr = this._getPrivileges();
				for(var item in this.gates) {
					config[item] = {};
					for(var o in this.gates[item]) {
						if(self._judge(permissionArr, this.gates[item][o])){
							config[item][o] = true;
						}else{
							config[item][o] = false;
						}
					}
				}
				return config;
			}else if(type === "data"){
				return this.gates;
			}
		},
		
		getGatesConfig:function(type){
			return this._getGatesConfig(type);
		},
		
		/**
		 * @author gaowh
		 * @name _getAppsConfig
		 * @type {method}
		 * @description "获取应用内部配置"
		 * @param {string} appKey "应用的键"
		 * @param {string} type "该键对应的值类型"
		 * @return {object} "应用的配置"
		 */
		//获取app内部配置
		_getAppsConfig: function(appKey,type) {
			var self = this;
			var type = type ? type : "bool";
			if(type === "bool"){
				var userPrivileges = self._getPrivileges(),
					item = this.apps[appKey],
					result = {};
				for(var attr in item){
					if(self._judge(userPrivileges,item[attr])){
						result[attr] = true;
					}else{
						result[attr] = false;
					}
				}
				return result;
			} else if (type === "data"){
				if(typeof appKey === "string") {
					return this.apps[appKey];
				}else{
					return this.apps;
				}
			}
		},
		
		app:function(a,b){
			return this._getAppsConfig(a,b);
		},
		
		code:function(b){
			var self = this;
			return this._judge(self._getPrivileges(),b);
		},
		
		compare:function(a,b){
			return this._judge(a,b);
		},
		
		/**
		 * @author PanJC
		 * @name judge
		 * @type {method}
		 * @description "判断用户是否拥有某个权限"
		 * @param {array} arr "权限列表数组"
		 * @param {function} callback "回掉函数"
		 */
		judge:function(arr,callback){
			if((this._getAppsConfig(arr[0]))[arr[1]]){
				callback();
			}
		},
		
		_judge:function(userPrivileges,appPrivileges){
			var accept = userPrivileges.accept,
				deny = userPrivileges.deny,
				_default = userPrivileges.default;
			var compare = function(a,b){
				for(var i=0,ilen=b.length;i<ilen;i++){
					for(var j=0,jlen=a.length;j<jlen;j++){
						if(b[i] == a[j]){
							break;
						}
						if(j === jlen - 1){
							return false;
						}
					}
					if(i === ilen - 1){
						return true;
					}
				}
			}
			if(deny.length === 0){
				if(accept.length === 0){
					if(_default == "none"){
						return false;
					}else if(_default == "all"){
						return true;
					}
				}else{
					if(_default == "none"){
						return compare(accept,appPrivileges);
					}else if(_default == "all"){
						return true;
					}
				}
			}else{
				for(var i=0,ilen=appPrivileges.length;i<ilen;i++){
					for(var j=0,jlen=deny.length;j<jlen;j++){
						if(deny[j] == appPrivileges[i]){
							return false;
						}
					}
				}
				if(accept.length === 0){
					if(_default == "none"){
						return false;
					}else if(_default == "all"){
						return true;
					}
				}else{
					if(_default == "none"){
						return compare(accept,appPrivileges);
					}else if(_default == "all"){
						return true;
					}
				}
			}
		}
	});
	
	return Permission;

});