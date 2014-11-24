/**
 * @author PanJC
 * @filename _config
 * @filetype {object}
 * @filedescription "新版本系统配置文件,用户不可修改，全局对象"
 * @filereturn
 */
define(["cloud/config/config"],function(config){
	
	var root = window;
	
	CONFIG = root.CONFIG = {};
	/*
	 * @property {string} CONFIG.ouath.client_id "oauth2 client_id参数"
	 * @property {string} CONFIG.ouath.client_secret "oauth2 client_secret参数"
	 * @property {string} CONFIG.ouath.grant_type.password "oauth2 请求令牌标识"
	 * @property {string} CONFIG.ouath.grant_type.refresh_token "oauth2  刷新令牌标识"
	 * @property {string} CONFIG.ouath.token.access_token "oauth2  访问令牌标识"
	 * @property {string} CONFIG.ouath.token.refresh_token "oauth2  刷新令牌标识"
	 * @property {object} CONFIG.ouath.gatewayModel "机型文件及对应文件位置"
	 * @property {string} CONFIG.ouath.modelSensorTypes[$].id "传感器类型id"
	 * @property {string} CONFIG.ouath.modelSensorTypes[$].name "传感器类型名"
	 */
	CONFIG = {
			
			oauth:{
				client_id:"000017953450251798098136",
				client_secret:"08E9EC6793345759456CB8BAE52615F3",
				grant_type:{
					password:"password",
					refresh_token:"refresh_token"
				}
			},
			
			token:{
				access_token:"accessToken",
				refresh_token:"refreshToken"
			},
			
			gatewayModel : $H({
				"InDTU3XX_GPRS-STATUS":{path:"0_1",html:"InDTU"},
		        "InDTU3XX_GPRS/EDGE":{path:"0_1",html:"InDTU"},
		        "IR300":{path:"0_31",html:"IR300"},
		        "IR320":{path:"0_36",html:"IR300"},
		        "IR6XX_TD":{path:"0_45",html:"IR700"},
		        "IR6XX_EVDO":{path:"0_44",html:"IR700"},
		        "IR6XX_CDMA":{path:"0_44",html:"IR700"},
		        "IR6XX_WCDMA":{path:"0_46",html:"IR700"},
		        "IG601_HSPA+":{path:"0_46",html:"IR700"},
		        "IG601_EVDO":{path:"0_46",html:"IR700"},
//		        "IR6XX_WCDMA":{path:"0_71",html:"IR900"},
		        "IR7XX_EVDO":{path:"0_63",html:"IR700"},
		        "IR7XX_CDMA":{path:"0_63",html:"IR700"},
		        "IR7XX_EVDO/CDMA":{path:"0_63",html:"IR700"},
		        "IR7XX_GPRS":{path:"0_51",html:"IR700"},
		        "IR7XX_EDGE":{path:"0_51",html:"IR700"},
		        "IR7XX_GPRS/EDGE":{path:"0_51",html:"IR700"},
		        "IR7XX_TD-SCDMA":{path:"0_60",html:"IR700"},
		        "IR7XX_WCDMA":{path:"0_54",html:"IR700"},
		        "IR9XX_WCDMA":{path:"0_71",html:"IR900"},
		        "IR9XX_EVDO":{path:"0_70",html:"IR900"},
		        "IR9XX_FDD-LTE":{path:"0_73",html:"IR900"},
		        "IR9XX_TDD-LTE":{path:"0_72",html:"IR900"},
		        "RTU":{path:"0_80",html:"InDTU"},
		        "IR8XX_EVDO": {path: "0_83", html:"IR800"},
		        "IR8XX_TDD-LTE": {path: "0_84", html:"IR800"},
		        "IR8XX_FDD-LTE": {path: "0_85", html:"IR800"},
		        "IR8XX_WCDMA": {path: "0_86", html:"IR800"},
		    }),
			
			modelSensorTypes : [{
                id : 0,
                name : "inRouter"
            }, {
                id : 3,
                name : "modbus_rtu"
            }, {
                id : 61705,
                name : "ab"
            }, {
                id : 61706,
                name : "mpi"
            }, {
                id : 61701,
                name : "midea_frequency_centrifuge"
            }, {
                id : 61446,
                name : "modbus_tcp"
            },
            /*
            {
                id : 1025,
                name : "common_network_port"
            },
            {
                id : 1026,
                name : "universal_serial"
            }, 
            */
            {
                id : 61702,
                name : "siemens_ppi"
            }, {
                id : 61699,
                name : "midea_air_cooled_heat_pump"
            }, {
                id : 61698,
                name : "midea_screw_machine"
            }],
            
            map : "cloud/components/mapImpl/gmapImpl"
	};
	
	for(var attr in config){
		CONFIG[attr] = config[attr];
	}
	
})