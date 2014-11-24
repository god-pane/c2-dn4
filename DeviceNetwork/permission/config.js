define(function(require) {
	
	var config = {

//		cache:{
//			keys:{
//				privileges:"privileges",
//				accountInfo:"accountInfo"
//			},
//			set:function(key,value){
//				sessionStorage.setItem(key,value);
//			},
//			get:function(key){
//				console.log("get - key",key);
//				return sessionStorage.getItem(key);
//			},
//			remove:function(key){
//				sessionStorage.removeItem(key);
//			}
//		},
		
		cache:"session"

	}

	return config;

});