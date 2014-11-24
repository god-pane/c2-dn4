/**
 * @author PANJC
 * @filename config
 * @filetype {object}
 * @filedescription "用户配置文件"
 * @filereturn
 */
define(function(require){
	/*
	 * @property {string} config.server.path.oauth "oauth2服务器地址"
	 * @property {string} config.server.path.api "api服务器地址"
	 * @property {boolean} config.server.debugMode "服务端是否调试模式"
	 * @property {number} config.ajax.timeout "ajax超时时间设置"
	 * @property {number} config.ajax.cacheTime "刷新令牌的缓存时间"
	 * @property {string} config.url.login.fail "登录失败跳转到的页面地址"
	 * @property {string} config.url.login.success "登录成功跳转到的页面地址"
	 * @property {string} config.dialog.module "提示组件所在位置"
	 * @property {string} config.locale.packages.default "默认语言包地址"
	 * @property {string} config.locale.packages "语言包"
	 * @property {string} config.locale.languages "语言种类"
	 * @property {string} config.permission "权限控制"
	 * @property {boolean} config.debug "客户端是否调试模式"
	 */
	var config = {
    		
    		server:{
				path:{
					oauth:"",
					api:"",
				},
				debugMode:true
			},
			
			ajax:{
				timeout:120000,
				cacheTime:2000
			},
			
			url:{
				login:{
					fail:"../www/index.html",
					success:"../applications/index.html"
				}
			},
			
			dialog:{
				module:require("cloud/components/dialog")
			},
			
			locale:{
				packages:{
					"default":"base",
					cloud:require.toUrl("../resources/language"),
			    	base:"../resources/language"
				},
				languages:["en","zh_CN"]
			},
			
			permission:{
				apps:"http://" + location.host + "/DeviceNetwork/permission/apps.js",
				config:"http://" + location.host + "/DeviceNetwork/permission/config.js",
				gates:"http://" + location.host + "/DeviceNetwork/permission/gates.js"
			},			
			debug:false			
    };
	var path=window.location.pathname;
	var pathArr=path.split("/");
	var indexURL;
	if(path.indexOf("DeviceNetwork/applications/")==-1){
		if(path.indexOf("/www/")==-1){
			window.localStorage.setItem("indexURL","index/"+pathArr[3]);
			indexURL=window.localStorage.getItem("indexURL");
			config.url.login.fail="../"+indexURL+"/index.html";
			config.url.login.success="../../applications/index.html";
			config.locale.packages.cloud=require.toUrl("../../resources/language");
			config.locale.packages.base="../../resources/language";
		}
		else{
			window.localStorage.setItem("indexURL",pathArr[2]);
			indexURL=window.localStorage.getItem("indexURL");
		}		
	}
	else{
		indexURL=window.localStorage.getItem("indexURL");
			config.url.login.fail="../"+indexURL+"/index.html";
	}
	return config;
	
});