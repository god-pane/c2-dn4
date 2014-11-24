/**
 * @author PanJC
 * @filename layout
 * @filetype {class}
 * @filedescription "扩展布局组件"
 * @filereturn {function} Layout "函数引用"
 */
define(function(require){
	
	require("cloud/base/cloud");
	require("../lib/plugin/jquery.layout");
	
	var Layout = Class.create(cloud.Component,{		
		initialize:function($super,options){
			$super(options);
			var arrObj = [
			              {width:"50%",height:"50%",show:true,handle:{top:false,right:true,bottom:false,left:false}},
			              {width:"50%",height:"30%",show:true,handle:{top:false,right:false,bottom:true,left:false}}
			              ];
		}								
	});	
	return Layout;	
});