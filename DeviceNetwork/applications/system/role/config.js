define(function(require) {
	var config = {
		"systemManage": {
			"item1": [5, 6, 7],           //用户管理
			"item2": [7, 8],              //角色管理
			"item3": [75, 76]             //权限管理
		},
		"networkManage": {        
			"item1": [3, 11, 13, 15, 16, 19, 25, 26, 29, 39, 40, 41, 83, 84, 87, 88, 89, 101], //  监视
			"item2": [12, 14, 28, 30, 38, 42, 58, 62, 83, 84, 85, 90],                     //创建、更改12, 90,  83, 84, 85 
			"item3": [21, 22],           //配置、升级
			"item4": [11, 456]                //控制台
		},
		"remoteMaintenance": {
			"item1": [53, 54, 55, 56]            //允许
		},
		"remoteControl": {
			"item1": [91, 95 ,97],               //组态图查看
			"item2": [92, 96, 98],                  //组态图编辑
			"item3": [89, 457],                      //远程控制
			"item4": [73, 81, 100,103,104]             //查看业务报表
		},
		"alarmProcessing": {
			"item1": [29, 49],                  //查看
			"item2": [50]                       //确认、清除
		} 
	};
	//勾选依赖
	config.systemManage.item1.dependent = [];                                 //用户管理
	config.systemManage.item2.dependent = [];                                 //角色管理
	config.systemManage.item3.dependent = [];                                 //权限管理
	
	config.networkManage.item1.dependent = [];                                //监视
	config.networkManage.item2.dependent = ['10'];                              //创建。更改
	config.networkManage.item3.dependent = ['10', '11'];                          //配置 升级
	config.networkManage.item4.dependent = ['10', '11'];                          //控制台 , '11', '32'
	
	config.remoteMaintenance.item1.dependent = ['11'];                            //dt允许
	
	config.remoteControl.item1.dependent = [];                                //组态图查看
	config.remoteControl.item2.dependent = ['30'];                                //组态图编辑
	config.remoteControl.item3.dependent = ['10', '11'];                                //远程控制 , '11', '13'
	config.remoteControl.item4.dependent = [];                                //查看业务报表
	
	config.alarmProcessing.item1.dependent = [];                                //查看
	config.alarmProcessing.item2.dependent = ['40'];                                //确认、清除
	
	return config;
});


