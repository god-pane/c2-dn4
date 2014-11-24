define(function(require){
	var cloud = require("cloud/base/cloud");
	var _Window = require("./window")
	var winCss = require("./login_window.css");
//	var winHtml = require("text!./login_window.html");
	var Login = Class.create(cloud.Component,{
		initialize: function($super, options){
			var Win = new _Window({
				container: "#login_window",
				title:"登陆",
				top:120,
				left:200,
				height:300,
				width:455,
				content:"./login_window.html"
			});
			this._click(Win);
        },
		_click:function(Win){
			$(function(){
				$(".login").bind("click",function(){
					Win.show();
				});
			});
		},
		
		_login:function(){
			$(function(){
        		$("#home-login-submit").bind("click",function(){
        			var user = $("#home-login-user").val();
        			var pwd = $("#home-login-pwd").val();
                    var error = function(err){
                        alert(err.error);
                    };
                    cloud.Ajax.login({
                        username: user,
                        password: pwd,
                        redirectURL: "../applications/",
                        error: error,
                        success: function(){
                            alert("登录成功");
                        }
                    });
        		});
        	});
		}
		
	});
	return Login;
});
