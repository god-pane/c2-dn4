/**
 * @author gaowh
 * @filename input-suggest
 * @filetype {class}
 * @filedescription "输入框自动补全组件"
 * @filereturn {function} InputSuggest "函数引用"
 */
define(function(require) {
	require("cloud/base/cloud");
	//var Model = require("cloud/base/model");
	
	var InputSuggest = Class.create(cloud.Component, {
		/**
		 * @name initialize
		 * @type {method}
		 * @description "该类的实例化方法"
		 * @param {function} $super "父类引用"
		 * @param {object} options "json对象"
		 * @return
		 */
		initialize: function($super, options) {
			this._inputText = null;
			this._suggestbox = null;
			this._currentItem = null;
			this._startSite = null;
			this._endSite = null;
			this._cache = $A();
			this._isBlur = true;
			this._scaleTime = (new Date).getTime();
			this._currentText = "";
			
			cloud.util.defaults(options, {
				width: 220,
				height: 20,
				focusborderColor: "green",
				blurborderColor: "#D0D0D0",
				bgColor: "white",
				fgColor: "black",
				fontSize: 12,
				prompt: "",
				event:{},
				dataProperty: "name",
				data: [],
			});
			$super(options);
			this._render();
			
//			var self = this;
//			window.setInterval(function() {
//				var text = self._inputText.val();
//				text = text.replace(/\s/g,"");
//				text = text.replace(/[^A-Za-z0-9_0-9\u4e00-\u9faf]/g, "");
//				if(text === "") {
//					self._suggestbox.empty().css("display", "none");
//					return ;
//				}
//				//alert("text:"+text+"||||self._currentText:"+self._currentText);
//				alert("text:"+text+"----currentText:"+self._currentText);
//				if(text != self._currentText) {
//					Model.site({
//						method:"query_list",
//						param:{
//							name:text,
//							verbose:1,
//							limit:0
//						},
//						success:function(returnData){
//							var datas = returnData.result;
//							var len = datas.length;
//							self._cache.clear();
//							for(var i = 0 ; i < len ; i++) {
//								if(datas[i][self.options.dataProperty].indexOf(text) > -1) {
//									self._cache.push(datas[i]);
//								}
//							}
//							
//							if(self._cache.length > 0) {
//								self._showSuggestBox(self._cache);
//							}
//							else {
//								self._suggestbox.empty().css("display", "none");
//							}
//							self._currentItem = null;
//						}
//					});
//				}
//			}, 800);
		},
		/**
		 * render the componet of use assemble function
		 * 
		 * @author gaoweihong
		 * @name _render
		 * @type {method}
		 * @description "渲染该组件"
		 * @private
		 * @return
		 */
		_render: function() {
			this._drawHTML();
			this._addEvent();
			
		},
		/**
		 * @author gaowh
		 * @name _drawHTML
		 * @type {method}
		 * @description "绘制组件的dom结构"
		 * @private
		 * @return
		 */
		_drawHTML: function() {
			this._inputText = $("<input type='text'/>").addClass("input-suggest-textfield");
			this._inputText.css({
				"width": this.options.width+"px",
				"height": this.options.height+"px",
				//"height": "20px",
				"border": "1px solid "+this.options.blurborderColor,
				"background-color": this.options.bgColor,
				"font-size": this.options.fontSize+"px",
				//"color": this.options.fgColor,
				"color": "#BEBEBE",
				"line-height": this.options.height+"px",
			}).val(this.options.prompt);
			this.element.append(this._inputText);
			this._suggestbox = $("<div></div>");//.addClass("input-suggest-sgbox");
			this._suggestbox.css({
				"border": "1px solid #D0D0D0",
				"position": "absolute",
				"overflow-x": "hidden",
				"overflow-y": "auto",
				"width": this.options.width+"px",
				"height": this.options.height+"px",
				"border": "1px solid "+this.options.blurborderColor,
				"background-color": this.options.bgColor,
				"z-index": 1000000,
				"display": "none"
			});
			$(document.body).append(this._suggestbox);
		},
		/**
		 * @author gaowh
		 * @name _addEvent
		 * @type {method}
		 * @description "为组件绑定事件监听"
		 * @private
		 * @return
		 */
		_addEvent: function() {
			var self = this;
			this._inputText.on("focus", function() {
				$(this).css("border", "1px solid "+self.options.focusborderColor);
				if(self._inputText.val() == self.options.prompt) {
					self._inputText.val("");
					self._inputText.css("color", self.options.fgColor);
				}
				
			}).on("blur", function() {
				$(this).css("border", "1px solid "+self.options.blurborderColor);
				if(self._isBlur) {
					self._suggestbox.empty().css("display", "none");
					self._currentItem = null;
				}
				if(self._inputText.val() == "") {
					self._inputText.val(self.options.prompt);
					self._inputText.css("color", "#BEBEBE");
				}
					
			}).on("keydown", function(e) { //回车键
				var code = e.which || event.keyCode;
				var count = self._cache.length;
				var property = self.options.dataProperty;
				if(code == 13) {
					self._suggestbox.empty().css("display", "none");
					var evt = self.options.event;
					if(!cloud.util.isEmpty(evt)) {
						if(self._currentItem) {
							evt.search && evt.search(self._currentItem.attr("userdata").evalJSON());
						}
						else {
							evt.search && evt.search(self._inputText.val());
						}
					}
					//self._currentItem = null;
				}
				else if(code == 38) { //向上
					var children = self._suggestbox.children();
					if(count <= 1) {
						self._suggestbox.children().eq(0).css({
							"background-color": self.options.focusborderColor,
							"color": "white",
						});
						self._currentItem = self._suggestbox.children().eq(0);
						var text = self._currentItem.attr("userdata").evalJSON()[property];
						self._inputText.val(text);
						return ;
					}
					if(self._currentItem) {
						var index = parseInt(self._currentItem.attr("_index")),
							len = self._cache.length,
							pageNumber = Math.round((len-index) / 15)+1;
						
						
						
						//alert(children.length+"-"+index+"="+(children.length - index));
						//alert((children.length - index) % 15);
						if(index <= 1) {
							if(len > 15) {
								self._suggestbox.scrollTop((len - 15)*20);
							}
							else {
								self._suggestbox.scrollTop(0);
							}
							self._startSite = children.eq(children.length-15);
							self._endSite = children.eq(children.length-1);
							
							children.eq(children.length-1).css({
								"background-color": self.options.focusborderColor,
								"color": "white",
							});
							self._currentItem.css({
								"background-color": "white",
								"color": "black",
							});
							self._currentItem = self._suggestbox.children().eq(children.length-1);
							var text = self._currentItem.attr("userdata").evalJSON()[property];
							self._inputText.val(text);
						}
//						else if((children.length - index) % 15 == 14) {
//							self._suggestbox.scrollTop((len-pageNumber*15)*20);
//							self._currentItem.css({
//								"background-color": "white",
//								"color": "black",
//							});
//							self._currentItem.prev().css({
//								"background-color": self.options.focusborderColor,
//								"color": "white",
//							});
//							self._currentItem = self._currentItem.prev();
//							var text = self._currentItem.attr("userdata").evalJSON()[property];
//							self._inputText.val(text);
//						}
						else if(self._currentItem.attr("_index") === self._startSite.attr("_index")) {
							
							self._suggestbox.scrollTop((index-16)*20);
							if(index-15 < 0) {
								self._startSite = children.eq(0);
								self._endSite = children.eq(14);
							}
							else {
								self._startSite = children.eq(index-16);
								self._endSite = children.eq(index-2);
							}
							
							self._currentItem.css({
								"background-color": "white",
								"color": "black",
							});
							self._currentItem.prev().css({
								"background-color": self.options.focusborderColor,
								"color": "white",
							});
							self._currentItem = self._currentItem.prev();
							var text = self._currentItem.attr("userdata").evalJSON()[property];
							self._inputText.val(text);
						}
						else {
							self._currentItem.css({
								"background-color": "white",
								"color": "black",
							});
							self._currentItem.prev().css({
								"background-color": self.options.focusborderColor,
								"color": "white",
							});
							self._currentItem = self._currentItem.prev();
							var text = self._currentItem.attr("userdata").evalJSON()[property];
							self._inputText.val(text);
						}
					}
					else {
						if(self._cache.length > 15) {
							self._suggestbox.scrollTop((self._cache.length - 15)*20);
						}
						else {
							self._suggestbox.scrollTop(0);
						}
						self._startSite = children.eq(children.length-15);
						self._endSite = children.eq(children.length-1);
						
						var children = self._suggestbox.children();
						children.eq(children.length-1).css({
							"background-color": self.options.focusborderColor,
							"color": "white",
						});
						self._currentItem = children.eq(children.length-1);
						var text = self._currentItem.attr("userdata").evalJSON()[property];
						self._inputText.val(text);
					}
					e.preventDefault();
				}
				else if(code == 40) { //向下
					var children = self._suggestbox.children();
					if(count <= 1) {
						self._suggestbox.children().eq(0).css({
							"background-color": self.options.focusborderColor,
							"color": "white",
						});
						self._currentItem = self._suggestbox.children().eq(0);
						var text = self._currentItem.attr("userdata").evalJSON()[property];
						self._inputText.val(text);
						return ;
					}
					if(self._currentItem) {
						//alert(self._currentItem.attr("_index") === self._endSite.attr("_index"));
						var index = parseInt(self._currentItem.attr("_index")),
							pageNumber = Math.floor(index / 15);
//						if(count <= 1) {
//							self._suggestbox.children().eq(0).css({
//								"background-color": self.options.focusborderColor,
//								"color": "white",
//							});
//							self._currentItem = self._suggestbox.children().eq(0);
//						}
						if(index >= self._cache.length) {
							self._startSite = children.eq(0);
							self._endSite = children.eq(14);
							
							self._suggestbox.scrollTop(0);
							self._suggestbox.children().eq(0).css({
								"background-color": self.options.focusborderColor,
								"color": "white",
							});
							self._currentItem.css({
								"background-color": "white",
								"color": "black",
							});
							self._currentItem = self._suggestbox.children().eq(0);
							var text = self._currentItem.attr("userdata").evalJSON()[property];
							self._inputText.val(text);
						}
//						else if(index % 15 == 0){
//							self._suggestbox.scrollTop(pageNumber * 300);
//							//self._suggestbox.scrollTop(_pageNumber * 150);
//							self._currentItem.css({
//								"background-color": "white",
//								"color": "black",
//							});
//							self._currentItem.next().css({
//								"background-color": self.options.focusborderColor,
//								"color": "white",
//							});
//							self._currentItem = self._currentItem.next();
//							var text = self._currentItem.attr("userdata").evalJSON()[property];
//							self._inputText.val(text);
//						}
						else if(self._currentItem.attr("_index") === self._endSite.attr("_index")) {
							//更新第一个与最后一个项
							if(children.length - index > 15) {
								self._startSite = children.eq(index);
								self._endSite = children.eq(index+14);
							}
							else {
								self._startSite = children.eq(children.length - 15);
								self._endSite = children.eq(children.length - 1);
							}
							self._suggestbox.scrollTop(index * 20);
							self._currentItem.css({
								"background-color": "white",
								"color": "black",
							});
							self._currentItem.next().css({
								"background-color": self.options.focusborderColor,
								"color": "white",
							});
							self._currentItem = self._currentItem.next();
							var text = self._currentItem.attr("userdata").evalJSON()[property];
							self._inputText.val(text);
						}
						else {
							self._currentItem.css({
								"background-color": "white",
								"color": "black",
							});
							self._currentItem.next().css({
								"background-color": self.options.focusborderColor,
								"color": "white",
							});
							self._currentItem = self._currentItem.next();
							var text = self._currentItem.attr("userdata").evalJSON()[property];
							self._inputText.val(text);
						}
					}
					else {
						self._suggestbox.scrollTop(0);
						self._suggestbox.children().eq(0).css({
							"background-color": self.options.focusborderColor,
							"color": "white",
						});
						self._currentItem = self._suggestbox.children().eq(0);
						var text = self._currentItem.attr("userdata").evalJSON()[property];
						self._inputText.val(text);
					}
					self._inputText.get(0).focus();
					//alert(e.preventDefault);
					//e.preventDefault();
				}
			}).on("keyup", function(e) {
				var code = e.which || event.keyCode;
				if(code != 13 && code != 38 && code != 40) {
					var text = self._inputText.val();
					text = text.replace(/\s/g,"");
					text = text.replace(/[^A-Za-z0-9_0-9\u4e00-\u9faf]/g, "");
					self._currentText = text;
					if(text === "") {
						self._suggestbox.empty().css("display", "none");
						return ;
					}
					//window.setTimeout(function() {
						Model.site({
							method:"query_list",
							param:{
								name:text,
								verbose:1,
								limit:0
							},
							success:function(returnData){
								var datas = returnData.result;
								var len = datas.length;
								self._cache.clear();
								for(var i = 0 ; i < len ; i++) {
									if(datas[i][self.options.dataProperty].indexOf(self._currentText) > -1) {
										self._cache.push(datas[i]);
									}
								}
								
								if(self._cache.length > 0) {
									self._showSuggestBox(self._cache);
								}
								else {
									self._suggestbox.empty().css("display", "none");
								}
								self._currentItem = null;
							}
						});
					//}, 300);
				}
				
			}.bind(this));
		},
		/**
		 * @author gaowh
		 * @name _showSuggestBox
		 * @type {method}
		 * @description "设置自动补全框的样式"
		 * @param {object} data "json数据对象"
		 * @private
		 * @return
		 */
		_showSuggestBox: function(data) {
			this._currentItem = null;
			var self = this;
			this._suggestbox.empty();
			
			var pos = this._inputText.get(0).getBoundingClientRect(),
				windowHeight = $(window).height(),
				_left, _top, _width, _height;
			if(windowHeight-pos.top-this.options.height > 300) {
				//往下
				_left = pos.left;
				_top = pos.top+this.options.height;
				_top = _top + 5;
			}
			else {
				//往上
				_left = pos.left;
				if(data.length > 15) {
					_top = pos.top-300;
				}
				else {
					_top = pos.top - data.length * 20;
				}
				_top = _top - 5;
			}
			if(data.length > 15) {
				_width = this.options.width;
				_height = 300;
			}
			else {
				_width = this.options.width;
				_height = data.length*20;
			}
			 
			this._suggestbox.css({
				left: _left+"px",
				top: _top+"px",
				width: _width+"px",
				height: _height+"px",
				display: "block",
				"text-align": "left"
			});
			for(var i = 0 ; i < data.length ; i++) {
				var temp = $("<div>"+data[i][this.options.dataProperty]+"</div>").on("mouseover", function(e) {
					self._suggestbox.children().css({
						"background-color": "white",
						"height":"auto",
						"color": "black",
					});
					$(this).css({
						"background-color": self.options.focusborderColor,
						"color": "white",
					});
					self._isBlur = false;
					self._currentItem = $(this);
					
					var evt = e || window.event;
					var top = self._suggestbox.get(0).getBoundingClientRect().top;
					var index = Math.ceil((evt.clientY - top) / 20);
					self._startSite = self._suggestbox.children().eq(parseInt($(this).attr("_index"))-index);
					self._endSite = self._suggestbox.children().eq(parseInt($(this).attr("_index"))+(15-index-1));
					//alert(self._startSite.html()+"-------------"+self._endSite.html());
					//alert(index);
				}).on("mouseout", function() {
					/*$(this).css({
						"background-color": "white",
						"color": "black",
					});*/
					self._isBlur = true;
					//self._currentItem = null;
				}).on("click", function() {
					self._suggestbox.empty().css("display", "none");
					var evt = self.options.event;
					var obj = self._currentItem.attr("userdata").evalJSON();
					self._inputText.val(obj[self.options.dataProperty]);
					if(!cloud.util.isEmpty(evt)) {
						evt.search && evt.search(obj);
					}
					//self._currentItem = null;
					self._currentItem = $(this);
				}).attr("_index", i+1);
				temp.css({
					"width": "100%",
					"height": "20px",
					"overflow": "hidden",
					"line-height": "20px",
					"font-size": "12px",
					"padding-left": "10px",
				});
				temp.addClass("input-suggest-sgbox-item").appendTo(this._suggestbox);
				temp.attr("userdata", Object.toJSON(data[i]));
			}
			this._startSite = this._suggestbox.children().eq(0);
			if(data.length > 15) {
				this._endSite = this._suggestbox.children().eq(14);
			}
			
		},
		/**
		 *@author gaowh
		 *@name destroy
		 *@type {method}
		 *@description "摧毁组件"
		 *@return
		 */
		destroy: function() {
			this._currentItem.remove();
			this._inputText.remove();
			this._suggestbox.remove();
			
			this._currentItem = null;
			this._inputText = null;
			this._suggestbox = null;
			this._cache = null;
		},
		/**
		 * @author gaowh
		 * @name getValueObject
		 * @type {method}
		 * @description "获取值对象"
		 * @return {object} "值对象"
		 */
		getValueObject: function() {
			var result = null;
			if(this._currentItem) {
				result = this._currentItem.attr("userdata").evalJSON();
			}
			else {
				result = this._inputText.val();
			}
			return result;
		},
		/**
		 * @author gaowh
		 * @name getValue
		 * @type {method}
		 * @description "获取输入框的值"
		 * @return
		 */
		getValue: function() {
			return this._inputText.val();
		}
	});
	
	return InputSuggest ;
});