/**
 * @author PanJC
 * @filename config
 * @filetype {object}
 * @filedescription "老版本配置文件，用户不可修改"
 * @filereturn {object} config "配置对象"
 */
define(function(require){
	//Set cloud config
	/*
	 * @property {string} config.debugMode "是否调试模式"
	 * @property {string} config.CLIENT_ID "oauth2 CLIENT_ID"
	 * @property {string} config.CLIENT_SECRET "oauth2 CLIENT_SECRET"
	 * @property {string} config.AUTH_SERVER_URL "oauth2 AUTH_SERVER_URL oauth2验证服务器地址"
	 * @property {string} config.API_SERVER_URL "oauth2 API_SERVER_URL api服务器地址"
	 * @property {string} config.FILE_SERVER_URL "oauth2 FILE_SERVER_URL 文件服务器地址"
	 * @property {string} config.UPGRADE_SERVER "升级服务器地址"
	 * @property {number} config.UPGRADE_PORT.DTU "DTU升级端口号"
	 * @property {number} config.UPGRADE_PORT.ROUTE "ROUTE升级端口号"
	 */
    var config = {
        debugMode: false,
        CLIENT_ID: "17953450251798098136",
        CLIENT_SECRET: "08E9EC6793345759456CB8BAE52615F3",
        AUTH_SERVER_URL: "/oauth2",
        API_SERVER_URL: "",
        FILE_SERVER_URL: "",
		UPGRADE_SERVER:"210.51.180.210",
		UPGRADE_PORT:{
			DTU:20010,
			ROUTE:20008,
			ENH:80
		}
    };
	return config;
});

