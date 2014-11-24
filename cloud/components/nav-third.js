/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved
 * @author PANJC
 * @filename nav-third
 * @filetype {class}
 * @filedescription "第三级导航组件，该组件常用于模版的左侧"
 * @filereturn {function} NavTable2 "函数引用"
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	var css = require("cloud/resources/css/nav-table2.css");
	var NavTable2 = Class.create(cloud.Component,{
		/**
		 * @author PanJC
		 * @name initialize
		 * @type {function}
		 * @description "该类的实例化函数"
		 * @param {function} $super "父类引用"
		 * @param {object} options "json数据对象"
		 */
		initialize:function($super,options){
			$super(options);
			this.main = options.main;
			this.sub = options.sub;
			this._render();
		},
		
		/**
		 * render third nav
		 * @author PANJC
		 * @name _render
		 * @type {method}
		 * @description "渲染组件"
		 * @private
		 * @return
		 */
		_render:function(){
			this._draw();
			this._events();
		},
		
		/**
		 * draw thrid nav
		 * @author PANJC
		 * @name _draw
		 * @type {method}
		 * @description "绘制组件的dom结构"
		 * @private
		 * @return
		 */
		_draw:function(){
			var self = this;
			var $nav = $("<div id='component-nav' class='component-nav'></div>");
			var $navMain = $("<div id='component-nav-main' class='component-nav-main'><div><p id='component-nav-main-text' lang=" + self.main.lang + " class='component-nav-main-text'>" + self.main.text + "</p></div><p class='component-nav-main-downicon'></p></div>");
			var $navSub = $("<ul id='component-nav-sub' class='component-nav-sub'></ul>");
			var $on,$out;
			for(var num=0;num<self.sub.length;num++){
				if(self.sub[num].status){
					$on = $("<li id='" + self.sub[num].id + "' class='component-nav-sub-on'><p class='component-nav-sub-text' lang=" + self.sub[num].lang + ">" + self.sub[num].text + "</p><p class='component-nav-sub-icon' style='display:block'></p></li>");
					$navSub = $navSub.prepend($on);
					cloud.storage.localStorage("appInnerNav","#" + self.sub[num].id);
				}else{
					if(self.sub[num].selected){
						$out = $("<li id='" + self.sub[num].id + "' class='component-nav-sub-on'><p class='component-nav-sub-text' lang=" + self.sub[num].lang + ">" + self.sub[num].text + "</p><p class='component-nav-sub-icon' style='display:block'></p></li>");
						cloud.storage.localStorage("appInnerNav","#" + self.sub[num].id);
					}else{
						$out = $("<li id='" + self.sub[num].id + "' class='component-nav-sub-out'><p class='component-nav-sub-text' lang=" + self.sub[num].lang + ">" + self.sub[num].text + "</p><p class='component-nav-sub-icon' style='display:none'></p></li>");
					}
					$navSub = $navSub.append($out);
				}
			}
			var $nav =  $nav.append($navMain).append($navSub);
			self.element.append($nav);
		},
		
		/**
		 * Events
		 * @author PANJC
		 * @name _events
		 * @type {method}
		 * @description "组件的事件绑定函数"
		 * @private
		 * @return
		 */
		_events:function(){
			var self = this;
			$("#component-nav-sub").children("li").bind("click",function(){
				cloud.storage.localStorage("appInnerNav","#" + $(this).attr("id"));
				$(this).siblings().each(function(){
					$(this).removeAttr("class").attr("class","component-nav-sub-out");
					$(this).children("p").each(function(){
						if($(this).hasClass("component-nav-sub-icon")){
							$(this).hide();
						};
					});
				});
				$(this).removeAttr("class").attr("class","component-nav-sub-on");
				$(this).children("p").each(function(){
					if($(this).hasClass("component-nav-sub-icon")){
						$(this).show();
					};
				});
			});
			for(var num=0;num<self.sub.length;num++){
				var id = self.sub[num].id;
				var click = self.sub[num].click;
				if($.isFunction(click)){
					$("#"+id).bind("click",(function(click){return function(){click();};})(click));
				}
			}
		},
		
		/**
		 * select sub
		 * @author PANJC
		 * @name selectSub
		 * @type {method}
		 * @description "选择下级菜单"
		 * @return
		 */
		selectSub:function(i){
			$("#component-nav-sub").children("li").each(function(index, item){
				if (index == i){
					var $this = item;
					$($this).siblings().each(function(){
						var $li = this;
						$($li).removeAttr("class");
						$($li).attr("class","component-nav-sub-out");
						$($li).children("p").each(function(){
							var $p = this;
							if($($p).hasClass("component-nav-sub-icon")){
								$($p).hide();
							}
						});
					});
					$($this).removeAttr("class");
					$($this).attr("class","component-nav-sub-on");
					$($this).children("p").each(function(){
						var $p = this;
						if($($p).hasClass("component-nav-sub-icon")){
							$($p).show();
						};
					});
				}
			})
		},
		
		/**
		 * Destroy third nav
		 * @author PANJC
		 * @name destroy
		 * @type {method}
		 * @description "摧毁组件"
		 * @return
		 */
		destroy:function(){
			this.element.empty();
		}
		
	});
	
	return NavTable2;
	
});