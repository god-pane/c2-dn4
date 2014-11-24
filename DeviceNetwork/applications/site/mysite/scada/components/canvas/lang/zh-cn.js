define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/ext/ext-base");
	require("cloud/lib/plugin/ext/ext-all");
	
	Ext.ns('Lang.Module.Common.Canvas');

	Lang.Module.Common.Canvas.DrawableItem = 
	{
		defaultFontName: '微软雅黑'
	};
	return Lang.Module.Common.Canvas.DrawableItem
});


