	angular.module("Docs", [])
	.filter("toType",function(){
		return function(input){
			if(input === undefined){
				return "Undefined"
			}
			var input = input.replace(/{|}/g,"").toLowerCase();
			var typeObj = {
					"boolean":"Boolean",
					 "number":"Number",
					 "string":"String",
					 "null":"Null",
					 "undefined":"Undefined",
					 "array":"Array",
					 "object":"Object",
					 "function":"Function",
					 "class":"Class",
					 "method":"Method"
			}
			if(typeObj[input]){
				return typeObj[input];
			}
			return "Undefined";
		}
	})
	.service('File', ['$rootScope',"$q",function($rootScope,$q){
	      var service = {
		      file: {},
		      get:function(){
		    	  return service.file;
		      },
		      getFile:function(){
		    	  var deferred = $q.defer();
		    	  require(["cloud/lib/jquery","./map","./filter"],function($,map,filter){
		    		  deferred.resolve({map:map,filter:filter});
		    	  });
		    	  return deferred.promise;
		      },
		      update:function(arr){
		    		var obj = {};
			    	var _head = {};
			    	var _attrs = [];
			    	var _methods = [];
			    	var info = arr[0];
			    	var list = arr.slice(1);
			    	for(var num = 0 ; num < info.length ; num++){
			    		var current = info[num];
			    		for(attr in current){
			    			switch(attr){
			    				case "filereparam":
			    					if(!_head.filereparams){
			    						_head.filereparams = [];
			    					}
			    					_head.fileparams.push(current[attr])
			    					break;
			    				default:
			    					_head[attr] = current[attr];
			    					break;
			    			}
			    		}
			    	}
			    	for(var num = 0 ; num < list.length ; num++){
			    		var _obj = {};
			    		for(var _num = 0 ; _num < list[num].length ; _num++){
				    		var current = list[num][_num];
				    		for(attr in current){
				    			switch(attr){
				    				case "param":
				    					if(!_obj.params){
				    						_obj.params = [];
				    					}
				    					_obj.params.push(current[attr])
				    					break;
				    				case "property":
				    					if(!_obj.propertys){
				    						_obj.propertys = [];
				    					}
				    					_obj.propertys.push(current[attr])
				    					break;
				    				default:
				    					_obj[attr] = current[attr];
				    					break;
				    			}
				    		}
			    		}
			    		if(_obj.private !== true){
			    			_methods.push(_obj);
			    		}
			    	}
			    	for(var i = 0 ; i < _methods.length ; i++){
			    		var item = _methods[i];
			    		for(j in item){
			    			if(j === "propertys"){
			    				_attrs = item[j];
			    				_methods.splice(i,1);
			    				break;
			    			}
			    		}
			    	}
			    	obj.head = _head;
			    	obj.attrs = _attrs;
			    	obj.methods = _methods;
			        service.file = obj;
			        $rootScope.$broadcast('file.update');
		      }
	      }
	      return service;
	}])
	.controller("fileList",["$scope","File",function(scope,File){
		File.getFile()
        .then(function(file) {
        	scope.showFile = function(e){
    			$.getScript(e.target.getAttribute("_href"),function(data){
    				File.update(file.filter(data));
    			})
    		}
        	scope.map = file.map;
        }, function(error) {
           // error handling here
        });
	}])
	.controller("fileInfo",["$scope","File",function(scope,File){
		scope.$on("file.update",function(){
			var data = File.get();
			scope.head = data.head;
			scope.attrs = data.attrs;
			scope.methods = data.methods;
			scope.$apply();
		})
	}])