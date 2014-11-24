var root = window;
var Model = angular.module("Model", []);
Model.factory('service', function($q) {
	var s = {};
	s.getStructure = function () {
	        var deferred = $q.defer();
	        require(["cloud/base/model","cloud/base/model.custom"],function(model,custom){
	    		deferred.resolve(Model);
	    	})
	        return deferred.promise;
	    }
	return s;
});
Model.controller("docs",["$scope","service",function(scope,service){
		service.getStructure()
            .then(function(data) {
            	scope.structure = data.structure;
            	scope.setMethodData = function(resName,methodName,methodData){
            		$(".method-inner").height(0)
            		scope.resName = resName;
            		scope.methodName = methodName;
            		scope.methodData = methodData;
            	}
            }, function(error) {
               // error handling here
            });
}]);