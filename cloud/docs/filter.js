define(function(require){
	
	require("cloud/lib/jquery");
	
	var _filter = function(fileArr){
		var returnArr = [];
		for(var num = 0; num < fileArr.length; num++){
			var _returnArr = [];
			var str = fileArr[num];
			_arr = str.split("*@");
			_arr = _arr.slice(1);
			if(_arr.length - 1 >= 0){
				_arr[_arr.length - 1] = _arr[_arr.length - 1].replace(/\*+\//,"");
			}
			for(var _num = 0; _num < _arr.length; _num++){
				var _str = _arr[_num].replace(/\s{2,}/g," ");
				if(_str.indexOf(" ") > -1){
					if(_str.indexOf("\"") > -1){
						var _strMatch = _str.match(/\".*\"/);
						_strMatch = _strMatch[0].replace(/\"/g,"");
						_str = _str.replace(_strMatch,_strMatch.replace(/\s/g,"_abc123efg456hij789_"));
						var _str2Arr = _str.split(" ");
						_str2Arr[_str2Arr.length -1] = _str2Arr[_str2Arr.length -1].replace(/\_abc123efg456hij789\_/g," ");
					}else{
						var _str2Arr = _str.split(" ");
					}
					var obj = {};
					_str2Arr[_str2Arr.length -1] = _str2Arr[_str2Arr.length -1].replace(/\"/g,"");
					if(_str2Arr.length === 2){
						switch(_str2Arr[0]){
							case "fileparam":
							case "filereturn":
							case "param":
							case "return":
								obj[_str2Arr[0]] = [_str2Arr[1]];
								break;
							default:
								obj[_str2Arr[0]] = _str2Arr[1];
						}
					}else{
						obj[_str2Arr[0]] = _str2Arr.slice(1);
					}
					_returnArr.push(obj);
				}else{
					if(_str === "private"){
						_returnArr.push({"private":true});
					}else if(_str === "deprecated"){
						_returnArr.push({"deprecated":true});
					}
				}
			}
			returnArr.push(_returnArr);
		}
		return returnArr;
	};
	
	var filter = function(file){
		var _file = file.replace(/\n*/g,"")
					.replace(/\*\s+/g,"*")
					.replace(/\s+\*/g,"*")
					.replace(/\,\s+/g,",")
					.replace(/\s+\,/g,",")
					.replace(/\;\s+/g,";")
					.replace(/\s+\;/g,";")
					.replace(/\{\s+/g,"{")
					.replace(/\s+\}/g,"}")
					.replace(/\*\/\s+/g,"*/")
					.replace(/\s+\*\//g,"*/");
//		console.log("_file",_file);
		var _fileArr = _file.match(/\/\*{2,}[^/]{1,}\*{1,}\//g);
//		console.log("_fileArr",_fileArr);
		return _filter(_fileArr);
	}
	
	return filter;
	
});