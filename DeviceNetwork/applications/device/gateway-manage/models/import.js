// add by qinjunwen for i18n in DN4
function $import(url, callback)
{
	var async = true;
	var caller = this.caller;
	if(typeof(callback) != 'function')
	{
	   async = false;
	}
	var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject('Msxml2.XMLHTTP');
	xmlhttp.open("GET", url, false);
	xmlhttp.onreadystatechange = function(){
	   if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	    if(window.execScript)
	    {// eval in global scope for IE
	     window.execScript(xmlhttp.responseText);
	    }
	    else
	    {// 关键：用call来解决作用域问题 fo FF
	     eval.call(window, xmlhttp.responseText);
	    }
	    if(typeof(callback) == "function")
	    {
	     callback.call(caller);
	    }
	   }
	}
	xmlhttp.send();
}
(function(){
	var lang = parent.cloud.storage.localStorage("language");
	//console.log(lang, "import.js")
	 if (lang == "en"){
	     $import("lang_pack/English.res");
	 }else if (lang == "zh_CN"){
		 $import("lang_pack/Chinese.res");
	 }else {
		 $import("lang_pack/Chinese.res");
	 }
	 $import("js/misc.js");
	 $import("js/mix.js");
})()