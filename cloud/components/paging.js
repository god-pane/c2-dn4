/**
 * @author zhangyl
 * @filename paging
 * @filetype {class}
 * @filedecription "分页组件"
 * @filereturn {function} Paging "函数引用"
 */
define(function(require){
	
	require("cloud/base/cloud");
	require("./resources/css/paging.css");
	
	var Paging = function(options){
		
		var doms = (function(){
			var myDate = new Date();
			var suffix = cloud.util.md5((myDate.getTime() + Math.random()).toString());
			var box = "paging-box";
			var pageBox = "paging-page-box";
			var previousPage = "paging-page-previouspage";
			var current = "paging-page-current";
			var sprit = "paging-page-sprit";
			var total = "paging-page-total";
			var jump = "paging-page-jump";
			var nextPage = "paging-page-nextpage";
			var limitBox = "paging-limit-box";
			var limitText1 = "paging-limit-text1";
			var limitSelect = "paging-limit-select";
			var limitText2 = "paging-limit-text2";
			var domsId = {
					box:box,
					pageBox:pageBox,
					previousPage:previousPage,
					current:current,
					sprit:sprit,
					total:total,
					jump:jump,
					nextPage:nextPage,
					limitBox:limitBox,
					limitText1:limitText1,
					limitSelect:limitSelect,
					limitText2:limitText2
			};
			var domsClass = {
					box:box,
					pageBox:pageBox,
					previousPage:previousPage,
					current:current,
					sprit:sprit,
					total:total,
					jump:jump,
					nextPage:nextPage,
					limitBox:limitBox,
					limitText1:limitText1,
					limitSelect:limitSelect,
					limitText2:limitText2
			};
			for(var attr in domsId){
				domsId[attr] = domsId[attr] + "-" + suffix;
			};
			var doms = {
					id:domsId,
					"class":domsClass
			};
			return doms;
		})()
		
		var mask = function(){cloud.util.mask("#" + doms.id.box)};
		
		var unmask = function(){cloud.util.unmask("#" + doms.id.box)}
		
		var PagingClass = Class.create(cloud.Component, {
			/**
			 * @author zhangyl
			 * @name initialize
			 * @type {method}
			 * @description "PagingClass类的实例化函数"
			 * @param {function} $super "父类引用"
			 * @param {object} options "json参数对象"
			 * @return
			 */
			initialize: function($super, options) {
				$super(options);
				this.render(options);
			},
			/**
			 * @author zhangyl
			 * @name _draw
			 * @type {method}
			 * @description "绘制分页的dom结构"
			 * @param {object} doms "选择器组成的对象"
			 * @param {object} options "json参数对象"
			 * @private
			 * @return
			 */
			_draw:function(doms,options){
			    var self = this;
				var total = parseInt(options.total);
				var limit = parseInt(options.limit);
				var current = options.current ? parseInt(options.current) : 1;
				var totalPages = Math.ceil(total/limit);
				current = current > totalPages || current < 1 ? 1 : current; 
				var ids = doms["id"];
				var classs = doms["class"];
				var $box = $("<div>").attr("id",ids.box).attr("class",classs.box);
				var $pageBox = $("<div>").attr("id",ids.pageBox).attr("class",classs.pageBox);
				var $previousPage = $("<p>").attr("id",ids.previousPage).attr("class",classs.previousPage).attr("alt",locale.get("previous_page")).attr("title",locale.get("previous_page"));
				var $current = $("<input>").attr("type","text").attr("id",ids.current).attr("class",classs.current).val(current);
				var $sprit = $("<p>").attr("id",ids.sprit).attr("class",classs.sprit).text("/");
				var $total = $("<p>").attr("id",ids.total).attr("class",classs.total).text(totalPages);
				var $jump = $("<p>").attr("id",ids.jump).attr("class",classs.jump).attr("alt",locale.get("refresh_page")).attr("title",locale.get("refresh_page"));
				var $nextPage = $("<p>").attr("id",ids.nextPage).attr("class",classs.nextPage).attr("alt",locale.get("next_page")).attr("title",locale.get("next_page"));
				var $limitBox = $("<div>").attr("id",ids.limitBox).attr("class",classs.limitBox);
				var $limitText1 = $("<p>").attr("id",ids.limitText1).attr("class",classs.limitText1).text(locale.get("per_page"));
				var $limitSelect = $("<select>").attr("id",ids.limitSelect).attr("class",classs.limitSelect).change(function(){
				    self.fire("displayChanged", $(this).val());
				});
				var $option30 = $("<option>").attr("value",30).text(30);
				var $option50 = $("<option>").attr("value",50).text(50);
				var $option100 = $("<option>").attr("value",100).text(100);
//				var $limitText2 = $("<p>").attr("id",ids.limitText2).attr("class",classs.limitText2).text("条");;
				
				switch(limit){
					case 30:
						$option30.attr("selected","selected");
						break;
					case 50:
						$option50.attr("selected","selected");
						break;
					case 100:
						$option100.attr("selected","selected");
						break;
					default:
						$option30.attr("selected","selected");
						break;
				}
				
				$limitSelect.append($option30).append($option50).append($option100);
				
				if(current === 1 && current === totalPages){
					$previousPage.hide();
					$nextPage.hide();
				}
				
				if(current === 1){
					$previousPage.hide();
				}
				
				if(current === totalPages){
					$nextPage.hide();
				}
				
				$pageBox.append($previousPage).append($current).append($sprit).append($total).append($jump).append($nextPage);
				
				$limitBox.append($limitText1).append($limitSelect);
				
				$box.append($pageBox).append($limitBox);
				
				this.element.append($box);
				
				$box.hide();
				
			},
			/**
			 * @author zhangyl
			 * @name render
			 * @type {method}
			 * @description "将options配置设置到分页组件中，并用数据进行渲染"
			 * @param {object} options "json参数对象"
			 * @return
			 */
			render:function(options){
				var self = this;
				this.options = options;
				this._draw(doms,options);
				this._event();
				this._effect();
				if(options.autoClick !== false){
					options.turn(options.data, options.current);
					self.reset(options.data);
				}
			},
			/**
			 * @author zhangyl
			 * @name reset
			 * @type {method}
			 * @description "重置分页组件显示的数据信息"
			 * @param {object} obj "分页数据信息对象"
			 * @return
			 */
			reset:function(obj){
				unmask();
				var self = this;
				var $box = $("#" + doms.id.box);
				var $previousPage = $("#" + doms.id.previousPage);
				var $nextPage = $("#" + doms.id.nextPage);
				var $current = $("#" + doms.id.current);
				var $total = $("#" + doms.id.total);
				var $select = $("#" + doms.id.limitSelect);
				var limit = parseInt($select.val());
				var total = (obj.total || obj.total === 0) ? obj.total : options.total;
				var current = $current.val();
				var cursor = parseInt(obj.cursor);
				if(cursor === 0){
					current = 1;
				}else{
					current = Math.ceil(cursor/limit + 1);
				}
				options.limit = limit;
				options.total = total;
				options.current = current;
				
				var totalPages = Math.ceil(total/limit);
				
//				console.log("limit",limit);
//				console.log("total",total);
//				console.log("cursor",cursor);
//				console.log("current",current);
//				console.log("totalPages",totalPages);
				
				current = current > totalPages ? 1 : current;
				
				if(current === 1 && current === totalPages){
					$previousPage.hide();
					$nextPage.hide();
				}
				
				if(current === 1){
					$previousPage.hide();
				}else{
					$previousPage.show();
				}
				
				if(current === totalPages){
					$nextPage.hide();
				}else{
					$nextPage.show();
				}
				
				$current.val(current);
				
				$total.text(totalPages);
				
				if(options.total !== 0){
					$box.show();
				}else{
					$box.hide();
				}
				
			},
			/**
			 * @author zhangyl
			 * @name refresh
			 * @type {method}
			 * @description "刷新页面"
			 * @return
			 */
			refresh:function(){
				$("#" + doms.id.jump).trigger("click");
			},
			/**
			 * @author zhangyl
			 * @name _event
			 * @type {method}
			 * @description "分页组件事件绑定"
			 * @private
			 * @return
			 */
			_event:function(){
				
				var self = this;
				var $previousPage = $("#" + doms.id.previousPage);
				var $nextPage = $("#" + doms.id.nextPage);
				var $current = $("#" + doms.id.current);
				var $total = $("#" + doms.id.total);
				var $jump = $("#" + doms.id.jump);
				var $select = $("#" + doms.id.limitSelect);
				
				var checkPage = function(){
					
					if(isNaN($current.val() * 1) || parseInt($current.val()) === 0 || parseInt($current.val()) * -1 > 0){
						$current.val(1);
					}else if(parseInt($current.val()) > parseInt($total.text())){
						$current.val(parseInt($total.text()));
					}
					
					if(parseInt($current.val()) === 1){
						if(parseInt($total.text()) === 1){
							$previousPage.hide();
							$nextPage.hide();
						}else{
							$previousPage.hide();
							$nextPage.show();
						}
					}
					
					if(parseInt($current.val()) === parseInt($total.text())){
						if(parseInt($current.val()) === 1){
							$previousPage.hide();
							$nextPage.hide();
						}else{
							$previousPage.show();
							$nextPage.hide();
						}
					}
					
					if(parseInt($current.val()) !== 1 && parseInt($current.val()) !== parseInt($total.text())){
						$previousPage.show();
						$nextPage.show();
					}
					
				}
				
				var turn = function(){
					var limit = parseInt($select.val());
					var cursor = (parseInt($current.val()) * limit) - limit;
					options.requestData(
						{
							limit:limit,
							cursor:cursor
						},
						function(data){
							if(data.cursor == data.total){
								options.requestData(
									{
										limit:limit,
										cursor:parseInt(data.total - limit) >= 0 ? parseInt(data.total - limit) : 0 
									},
									function(data){
										options.turn(data, $current.val());
										self.reset(data)
									}
									
								);
							}else{
								options.turn(data, $current.val());
								self.reset(data)
							}
						}
					);
				}
				
				$current.blur(function(){
					checkPage();
					mask();
					turn();
				});
				
//				$current.keypress(function(event){
//					if (event.which == 13) {
//						$current.trigger("blur");
//						mask();
//						turn();
//					}
//				});
				
				$previousPage.click(function(){
					mask();
					$current.val(parseInt($current.val()) - 1);
					turn();
				});
				
				$jump.click(function(){
					mask();
					turn();
				});
				
				$nextPage.click(function(){
					mask();
					$current.val(parseInt($current.val()) + 1);
					turn();
				});
				
				$select.change(function(){
					mask();
					$current.val(1);
					turn();
				});
				
			},
			/**
			 * @author zhangyl
			 * @name _effect
			 * @type {method}
			 * @description "分页组件显示效果控制"
			 * @private
			 * @return
			 */
			_effect:function(){
				
				var $previousPage = $("#" + doms.id.previousPage);
				var $nextPage = $("#" + doms.id.nextPage);
				var $jump = $("#" + doms.id.jump);
				//effect
				$previousPage.mouseover(function(){
					$(this).css("background","url('../../cloud/components/resources/images/left2.png')");
				}).mouseout(function(){
					$(this).css("background","url('../../cloud/components/resources/images/left1.png')");
				});
				
				$nextPage.mouseover(function(){
					$(this).css("background","url('../../cloud/components/resources/images/right2.png')");
				}).mouseout(function(){
					$(this).css("background","url('../../cloud/components/resources/images/right1.png')");
				});
				
				$jump.mouseover(function(){
					$(this).css("background","url('../../cloud/components/resources/images/shuaxin2.png') 1px 1px no-repeat");
				}).mouseout(function(){
					$(this).css("background","url('../../cloud/components/resources/images/shuaxin1.png') 1px 1px no-repeat");
				});
				
			},
			/**
			 * @author zhangyl
			 * @name destroy
			 * @type {method}
			 * @description "摧毁组件"
			 * @return
			 */
			destroy:function(){
				$("#" + doms["id"]["box"]).remove();
			}
		
		})
		
		return new PagingClass(options);
		
	};
	
	return Paging;
	
});