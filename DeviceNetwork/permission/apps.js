define(function(require) {

	var apps = {

		"default" : [ 15, 16, 25, 26, 87, 88 ],

		_home : {
			read : [ 11, 29 ]
		},

		_user : {
			read : [ 5, 7 ],
			write : [ 6 ]
		},

		_role : {
			read : [ 5, 7 ],
			write : [ 8 ]
		},

		_tag : {
			read : [ 15, 87 ],
			write : [ 16, 88 ]
		},

		_group : {
			read : [ 5, 11, 29, 93 ],
			write : [ 94 ]
		},

		_organ : {
			read : [ 3, 101 ],
			write : [ 4, 94, 102 ]
		},

		_summary : {
			read : [ 11,29,81 ]
		},

		_connectionStatus : {
			read : [ 11,29, 81 ]
		},

		_flowStatus : {
			read : [ 11,29,73, 81 ]
		},

		_gateway : {
			read : [ 11, 13, 29 ],
			write : [ 12 ],
			import : [ 83, 84, 85 ],
			management : [ 21, 22 ],
			console : [ 11,12, 41, 42, 456],
			remoteControl : [ 41, 42, 89,90 ]
		},

		_controller : {
			read : [ 13, 29, 89 ],
			write : [ 90 ]
		},

		_model : {
			read : [ 13 ],
			write : [ 14 ],
			import : [ 83, 84, 85 ]
		},

		_site : {
			read : [ 11, 13, 29, 89 ],
			write : [ 30 ],
			historyData : []
		},
		
		_scada: {
			read: [91, 95 ,97],
			write: [92, 96 ,98]
		},

		_global : {
			read : [ 91 ],
			write : [ 92 ]
		},

		_deviceTouch : {
			read : [ 53, 54, 55, 56 ]
		},

		_alarm : {
			read : [ 29, 49 ],
			write : [ 50 ]
		},

		_log : {
			read:[39,40,81]
		},
		
		_task : {
			read : [ 41 ],
			write : [ 42 ]
		}

	}

	return apps;

});