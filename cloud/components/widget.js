define(function(require){
	
	require("cloud/components/widget.css");
	
	var config = require("cloud/components/widget.config");
	var root = window;
	
	var widget = root.widget = function(objectParam){
		
		var objectParam = objectParam || {};
		var _type = objectParam.type;
		var _name = objectParam.name;
		var _opt = objectParam.opt || {};
		_opt.events = _opt.events || {};
		
		if(!_type || !_name){
			console.log("组件无法找到");
			return;
		}
		
		switch(_type){
		
			case "button":
				
				var thisCase;

				if(!_opt.size){
					thisCase = config[_type][config[_type]["default"]][_name];
				}else{
					thisCase = config[_type][_opt.size][_name];
				}
				
				var thisAlt;
				
				if(!_opt.lang && !_opt.title){
					thisAlt = locale.get(thisCase["lang"]);
				}
				
				if(_opt.lang){
					thisAlt = locale.get(lang);
				}
				
				if(_opt.title){
					thisAlt = title;
				}
				
				var iconClass = thisCase["iconClass"];
				
				var boxClass = thisCase["boxClass"];
				
				var $p = $("<p></p>").addClass(boxClass).attr({alt:thisAlt,title:thisAlt});
				
				var $a = $("<a></a>");
				
				if(typeof iconClass === "object"){
					for(var i=0,len=iconClass.length;i<len;i++){
						$a.addClass(iconClass[i]);
					}
				}else{
					$a.addClass(iconClass);
				}
				
				$p.append($a);
				
				if(_opt.suffixText){
					$span = $("<span></span>").addClass("widget-button-16x16-text").text(_opt.suffixText);
					$p.append($span);
				}
				
				if(_opt.events.click){
					$p.click(function(){
						_opt.events.click();
					})
				}
				
				if(_opt.css){
					$p.css(_opt.css);
				}
				
				return $p;
				
				break;
				
			case "checkbox":
				
				var thisCase = config[_type];
				
				var thisAlt;
				
				if(!_opt.lang && !_opt.title){
					thisAlt = locale.get(thisCase["lang"]);
				}
				
				if(_opt.lang){
					thisAlt = locale.get(lang);
				}
				
				if(_opt.title){
					thisAlt = title;
				}
				
				var iconClass = thisCase["iconClass"];
				
				var $a = $("<a></a>").addClass(iconClass).attr({alt:thisAlt,title:thisAlt});
				
				if(_opt.events.click){
					$a.click(function(){
						_opt.events.click();
					})
				}
				
				if(_opt.css){
					$a.css(_opt.css);
				}
				
				return $a;
				
				break;
				
			default:
				
				return;
		}
	}
	
})