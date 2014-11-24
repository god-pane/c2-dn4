define(function(require){
	
	var map = [
	[
		"base",[
				["_config","../base/_config.js"],
				["config","../base/config.js"],
				["cloud","../base/cloud.js"],
				["locale","../base/locale.js"],
//				["model","../base/model.js"],
//				["model.custom","../base/model.custom.js"]
		      ]
	],
	[
		"components",[
		        ["_table","../components/_table.js"],
				["button","../components/button.js"],
				["chart","../components/chart.js"],
				["command","../components/command.js"],
				["dialog","../components/dialog.js"],
				["input-suggest","../components/input-suggest.js"],
				["item","../components/item.js"],
				["itembox","../components/itembox.js"],
				["nav-third","../components/nav-third.js"],
				["paging","../components/paging.js"],
				["permission","../components/permission.js"],
				["stockchart","../components/stockchart.js"],
				["table","../components/table.js"],
				["toolbar","../components/toolbar.js"],
				["uploader","../components/uploader.js"],
				["validator","../components/validator.js"],
				["window","../components/window.js"]
		      ]
	],
	[
		"config",[
				["config","../config/config.js"]
		      ]
	]
	]
	
	return map;
	
});