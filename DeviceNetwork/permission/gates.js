//DN4二级菜单入口的权限类型配置
define(function(require) {
	return {
		home: {
			home: [11, 29]
		},
		system: {
			user: [5, 7],
			role: [7, 5],
			tag: [15, 87],
			group_management: [ 5, 11, 29, 93 ],
			organ_info: [ 3, 101 ]
		},
		report: {
			summary: [11,29,81],
			online_statistics: [ 11,29, 81 ],
			traffic_statistics: [11,29,73, 81],
			define_report: [11, 29, 81] 
		},
		device: {
			gateway: [11, 13, 29],
			controller: [13, 29, 89],
			model: [13]
		},
		site: {			
			site: [11, 13, 29, 89],
			global: [91],
			devicetouch: [53, 54, 55, 56]
		},
		notice: {
			alarm: [29, 49],
			log: [39,40]
		},
		task: {
			task: [41]
		},
		organ: {
			organ: []
		}
	};
});