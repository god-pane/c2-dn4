define(function(require){
	var config = {
			button:{
				"default":"16x16",
				"16x16":{
					curve:{
						lang:"widget_button_curve",
						iconClass:["widget-button-16x16-icon-bg","widget-button-16x16-icon-curve"],
						boxClass:"widget-button-16x16"
					},
					download:{
						lang:"widget_button_download",
						iconClass:["widget-button-16x16-icon-bg","widget-button-16x16-icon-download"],
						boxClass:"widget-button-16x16"
					}
				}
			},
			checkbox:{
				lang:"widget_checkbox",
				iconClass:"widget-checkbox"
			}
	}
	return config;
})