/**
 * @author jerolin
 * @filename itembox
 * @filetype {class}
 * @filedescription "组件item的容器，专门用于装载item组件"
 * @filereturn {function} ItemBox "函数引用"
 */
define(function(require) {
	require("cloud/base/cloud");
	require("./itembox.css");
	require("cloud/lib/plugin/jquery.layout");
	var Item = require("cloud/components/item");
//	var Paginate = require("cloud/components/paginate");

	var ItemBox = Class.create(cloud.Component, {
		/**
		 * @author JeroLin
		 * @name initialize
		 * @type {function}
		 * @description "该类实例化函数"
		 * @param {function} $super "父类引用"
		 * @param {object} options "json数据对象"
		 * @return
		 */
		initialize: function($super, options) {
			this.moduleName = "itembox";
			$super(options);
			this.items = $H();
			this.element.addClass("itembox");
			if (this.options.width) {
				this.element.outerWidth(this.options.width);
			}
			if (this.options.height) {
				this.element.outerHeight(this.options.height);
			}
			this.container = $("<div>").addClass("itembox-container").appendTo(this.element);
			this.$pager = $("<div>").addClass("itembox-pager").appendTo(this.element);
			this.size = 0;
			this.pages = 1;
			this.selectedItemsCount = 0;
			this.selectMode = false;
			this.renderLayout();
			this.clickedItem = null;
		},
		/**
		 * Judge pages,and render paginate modul,get more with renderPager()
		 * render items
		 * @author JeroLin
		 * @name render
		 * @type {method}
		 * @description "渲染该组件"
		 * @param {Array} items "item组件的一个集合"
		 * @return
		 */
		render: function(items) {
//			this.pages = pages;
//			if (this.pages > 1) {
//				this.layout.show("south");
//				this.renderPager(start);
//			} else {
//				if(this.layout.hide){
//					this.layout.hide("south");
//				}
//				if (this.pager) {
//					this.pager.destroy();
//				}
//			}
			this.clear();
			this.appendItems(items);
		},
		/**
		 * Render layout of this element
		 * @author JeroLin
		 * @name renderLayout
		 * @type {method}
		 * @description "设置组件css样式和布局"
		 * @return
		 */
		renderLayout: function() {
			this.layout = this.element.layout({
				defaults: {
					paneClass: "pane",
					"togglerLength_open": 50,
					togglerClass: "cloud-layout-toggler",
					resizerClass: "cloud-layout-resizer",
					"spacing_open": 0,
					"spacing_closed": 0,
					"togglerLength_closed": 50,
					resizable: false,
					slidable: false,
					closable: false
				},
//				south: {
//					paneSelector: ".itembox-pager",
//					size: 29
//				},
				center: {
					paneSelector: ".itembox-container",
					paneClass: this.id
				}
			});
		},
		/**
		 * Return how match items this layout could contain
		 * @author JeroLin
		 * @name getDisplay
		 * @type {method}
		 * @description "获取该组件能展示的item组件的数量"
		 * @return {number} "显示的最大个数"
		 */
		getDisplay:function(){
			var width = this.element.find(".itembox-container").width();
			var height = this.element.find(".itembox-container").height();
			return  Math.floor((width-250)/190)*Math.floor((height-20)/84);
		},
		 // Render paginate modul and set select page
		 // @param {number} whitch page selectes 
//		renderPager: function(start) {
//			if (this.pager) {
//				this.pager.destroy();
//			}
//			this.pager = new Paginate({
//				display: this.options.display,
//				count: this.pages,
//				start: start,
//				container: this.$pager,
//				events: {
//					change: function(page) {
//						this.fire("change", page);
//					},
//					scope: this
//				}
//			});
//			
//		},
        /*
        drawSelector : function(){
        	var self = this;
        	var selector = $("<div>").addClass("paginate-selector").prependTo(this.pager.element.find(".paginate-wrapper"));//TODO
        	var selectorHtml = "<select  id='page-selector' class='multiselect'>" +
            "<option value='0' >自动计算条数</option>" +
            "<option value='10' >10</option>" +
            "<option value='20' >20</option>" +
            "<option value='50' >50</option>" +
            "<option value='100' >100</option>" +
            "<option value='200' >200</option>" +
            "</select>";
        	$(selectorHtml).appendTo(selector);
        	require(["cloud/lib/plugin/jquery.multiselect"],function(){
        		$("#page-selector").multiselect({
        			header: "每页显示数量",
                	multiple : false,
                    noneSelectedText: "每页显示条数",
                    selectedText: "# "+locale.get({lang:"is_selected"}),
                    selectedList: 1,
                    minWidth: 130,
                    height: 120,
                    position : {
                        my: 'left bottom',
                        at: 'left top'
                    }
                }).on("multiselectclick", function(event, ui){
                	var value = ui.value;
                });
            	
        	});
        },
		*/
		/**
		 * render items,and bind events
		 * @author JeroLin
		 * @name appendItems
		 * @type {method}
		 * @description "向该组件中以追加方式添加item组件"
		 * @param {Array} items "item组件的一个集合"
		 * @return
		 */
		appendItems: function(items) {
			items = cloud.util.makeArray(items);

			var item = null,
				self = this;
			items.each(function(option) {
				if (!option.element && !option.container) {
					option.container = this.container;
				}
				//option.notifications = cloud.util.random(0, 99);
				//if(option.type != "marker") option.description = "<p>5个设备</p><p>摇杆机，张三安装" + cloud.util.random(1000000) + "</p>";
				option.events = {
					scope: this,
					select: function(item) {
						var selected = item.isSelected();
						//if not in select mode, and user select one item, then change to select mode.
						if (selected === true && this.selectMode === false) {
							this.selectMode = true;

							//show select button.
							this.items.values().pluck("widgets").pluck("select").invoke("show");
						} else if (selected === false && this.selectMode === true) {
							//caculate selected items count, if it's 0, then quit select mode.
							if (this.getSelectedItems().size() === 0) {
								this.selectMode = false;
								this.items.values().pluck("widgets").pluck("select").invoke("hide");
								item.widgets.select.show();
							}
						}
						this.updateItemsCount();
						//console.log("itembox-afterSelect", item, this.getSelectedItems());
						this.fire("afterSelect", this.getSelectedItems(), item);
					},
					click: function(target) {
						var bua=navigator.userAgent;
						var reg=new RegExp("MSIE ([9][/.0-9]{0,})");
						var result=reg.exec(bua);
						this.clickedItem = target;//add by qinjunwen
						var itemGroup=this.items.values().pluck("element");
						if (this.selectMode === false) {							
							var tagEl=target.element;
							itemGroup.invoke("removeClass", "cloud-item-clicked");
							tagEl.addClass("cloud-item-clicked");
							this.fire("click", target);
							//为了兼容ie9所以才这样，我也不想
							if(result){
								itemGroup.each(function(one){
									if(one.attr("class").indexOf("cloud-item-status-inherent")!=-1){
										one.css({
										"border-bottom": "1px solid #DFDFDF",
									    "background": "#f4f8fb",
									    "background": "-moz-linear-gradient(top,  #f4f8fb 0%, #edeef2 25%, #d9d9d9 61%, #d0cccd 86%, #cccbc9 91%, #ccc8c9 100%)",
									    "background": "-webkit-gradient(linear, left top, left bottom, color-stop(0%,#f4f8fb), color-stop(25%,#edeef2), color-stop(61%,#d9d9d9), color-stop(86%,#d0cccd), color-stop(91%,#cccbc9), color-stop(100%,#ccc8c9))",
									    "background": "-webkit-linear-gradient(top,  #f4f8fb 0%,#edeef2 25%,#d9d9d9 61%,#d0cccd 86%,#cccbc9 91%,#ccc8c9 100%)",
									    "background": "-o-linear-gradient(top,  #f4f8fb 0%,#edeef2 25%,#d9d9d9 61%,#d0cccd 86%,#cccbc9 91%,#ccc8c9 100%)",
									    "background": "-ms-linear-gradient(top,  #f4f8fb 0%,#edeef2 25%,#d9d9d9 61%,#d0cccd 86%,#cccbc9 91%,#ccc8c9 100%)",
									    "background": "linear-gradient(to bottom,  #f4f8fb 0%,#edeef2 25%,#d9d9d9 61%,#d0cccd 86%,#cccbc9 91%,#ccc8c9 100%)",
									    "filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#f4f8fb', endColorstr='#ccc8c9',GradientType=0)",
										});
									}
									else{
										one.css({
											"background": "#999",
											"background": "-moz-linear-gradient(bottom, #e4e7ec 0%, #dfe2e7 4%, #f2f3f7 91%, #f4f8fb 100%)",
											"background": "-webkit-gradient(linear, left bottom, left top, color-stop(0%,#e4e7ec), color-stop(4%,#dfe2e7), color-stop(91%,#f2f3f7), color-stop(100%,#f4f8fb))",
											"background": "-webkit-linear-gradient(bottom, #e4e7ec 0%,#dfe2e7 4%,#f2f3f7 91%,#f4f8fb 100%)",
											"background": "-o-linear-gradient(bottom, #e4e7ec 0%,#dfe2e7 4%,#f2f3f7 91%,#f4f8fb 100%)",
											"background": "-ms-linear-gradient(bottom, #e4e7ec 0%,#dfe2e7 4%,#f2f3f7 91%,#f4f8fb 100%)",
											"background": "linear-gradient(to top, #e4e7ec 0%,#dfe2e7 4%,#f2f3f7 91%,#f4f8fb 100%)",
											"filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#e4e7ec', endColorstr='#f4f8fb',GradientType=0 )",
										});
									}
								});
								target.element.css({
									"filter":""
								});
							}
						} else {
							//为了兼容ie9所以才这样，我也不想
							target.setSelected(!target.isSelected());
							if(result){
								itemGroup.each(function(one){
									if(one.attr("class").indexOf("cloud-item-status-inherent")!=-1){
										one.css({
										"border-bottom": "1px solid #DFDFDF",
									    "background": "#f4f8fb",
									    "background": "-moz-linear-gradient(top,  #f4f8fb 0%, #edeef2 25%, #d9d9d9 61%, #d0cccd 86%, #cccbc9 91%, #ccc8c9 100%)",
									    "background": "-webkit-gradient(linear, left top, left bottom, color-stop(0%,#f4f8fb), color-stop(25%,#edeef2), color-stop(61%,#d9d9d9), color-stop(86%,#d0cccd), color-stop(91%,#cccbc9), color-stop(100%,#ccc8c9))",
									    "background": "-webkit-linear-gradient(top,  #f4f8fb 0%,#edeef2 25%,#d9d9d9 61%,#d0cccd 86%,#cccbc9 91%,#ccc8c9 100%)",
									    "background": "-o-linear-gradient(top,  #f4f8fb 0%,#edeef2 25%,#d9d9d9 61%,#d0cccd 86%,#cccbc9 91%,#ccc8c9 100%)",
									    "background": "-ms-linear-gradient(top,  #f4f8fb 0%,#edeef2 25%,#d9d9d9 61%,#d0cccd 86%,#cccbc9 91%,#ccc8c9 100%)",
									    "background": "linear-gradient(to bottom,  #f4f8fb 0%,#edeef2 25%,#d9d9d9 61%,#d0cccd 86%,#cccbc9 91%,#ccc8c9 100%)",
									    "filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#f4f8fb', endColorstr='#ccc8c9',GradientType=0)",
										});
									}
									else{
										one.css({
											"background": "#999",
											"background": "-moz-linear-gradient(bottom, #e4e7ec 0%, #dfe2e7 4%, #f2f3f7 91%, #f4f8fb 100%)",
											"background": "-webkit-gradient(linear, left bottom, left top, color-stop(0%,#e4e7ec), color-stop(4%,#dfe2e7), color-stop(91%,#f2f3f7), color-stop(100%,#f4f8fb))",
											"background": "-webkit-linear-gradient(bottom, #e4e7ec 0%,#dfe2e7 4%,#f2f3f7 91%,#f4f8fb 100%)",
											"background": "-o-linear-gradient(bottom, #e4e7ec 0%,#dfe2e7 4%,#f2f3f7 91%,#f4f8fb 100%)",
											"background": "-ms-linear-gradient(bottom, #e4e7ec 0%,#dfe2e7 4%,#f2f3f7 91%,#f4f8fb 100%)",
											"background": "linear-gradient(to top, #e4e7ec 0%,#dfe2e7 4%,#f2f3f7 91%,#f4f8fb 100%)",
											"filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#e4e7ec', endColorstr='#f4f8fb',GradientType=0 )",
										});
									}
								});
							}
						}
					},
					togglefavor: function(target) {
						this.fire("togglefavor", target);
					},
					toggleshare: function(target) {
						this.fire("toggleshare", target);
					}
				};
				item = new Item(option);
				(function(item) {
					item.element.hover(function() {
						if (self.selectMode === false) {
							item.widgets.select.show();
						}

					}, function() {
						if (self.selectMode === false) {
							item.widgets.select.hide();
						}
					});

					if (self.selectMode === false) {
						Object.values(cloud.util.pick(item.widgets, "select")).invoke("hide");
					}
				})(item);
				this.items.set(item.id, item);
			}, this);

			this.updateItemsCount();
		},
		/**
		 * Switch to selectable
		 * @author JeroLin
		 * @name switchToSelectStatus
		 * @type {method}
		 * @description "将全部的item组件转换到被选中状态"
		 * @return
		 */
		switchToSelectStatus: function(){
			var self = this;
//			this.items.each(function(option) {
				self.selectMode = true;
				self.items.values().pluck("widgets").pluck("select").invoke("show");
//			});
		},
		/**
		 * Switch to unselectabel
		 * @author JeroLin
		 * @name switchToDefaultStatus
		 * @type {method}
		 * @description "将所有item组件设置为不可选中"
		 * @return
		 */
		switchToDefaultStatus: function(clearClick){
			var self = this;
//			this.items.each(function(option) {
				self.selectMode = false;
				self.items.values().pluck("widgets").pluck("select").invoke("hide");
//			});
			if (clearClick){
				this.items.values().pluck("element").invoke("removeClass", "cloud-item-clicked");
			}
		},
		/**
		 * @author JeroLin
		 * @name clearClick
		 * @type {method}
		 * @description "清除所有item组件的选中状态"
		 * @return
		 */
		clearClick : function(){
			this.items.values().pluck("element").invoke("removeClass", "cloud-item-clicked");
		},
		/**
		 * @author JeroLin
		 * @name getClickedItem
		 * @type {method}
		 * @description "获取被选择的item的资源"
		 * @return {object} "被选择的item资源"
		 */
		getClickedItem : function(){
//			console.log(this.clickedItem, "getClickedItem");
			return this.clickedItem;
		},
		/**
		 * @author JeroLin
		 * @name addClickedClsToItem
		 * @type {method}
		 * @description "为被选中的item组件添加类名，以便显示选中状态"
		 * @param {object} item "item组件资源"
		 * @return
		 */
		addClickedClsToItem : function(item){
			if (item) {
				item.element.invoke("addClass", "cloud-item-clicked");
			}
		},
		/**
		 * @author JeroLin
		 * @name deleteItems
		 * @type {method}
		 * @description "删除item组件"
		 * @param {object} items "item组件的集合"
		 * @return
		 */
		deleteItems: function(items) {
			items = cloud.util.makeArray(items);
			items.each(function(item) {
				this.items.unset(item.id);
				item.destroy();
			}, this);
			this.updateItemsCount();
		},
		/**
		 * @author JeroLin
		 * @name deleteSelectedItems
		 * @type {method}
		 * @description "删除被选中的item"
		 * @return
		 */
		deleteSelectedItems: function() {
			this.deleteItems(this.getSelectedItems());
		},
		/**
		 * @author JeroLin
		 * @name selectItems
		 * @type {method}
		 * @description "选中item组件"
		 * @param {object} items "item的集合"
		 * @return
		 */
		selectItems: function(items) {
			items = cloud.util.makeArray(items);
			items.invoke("select");
			this.updateItemsCount();
		},
		/**
		 * @author JeroLin
		 * @name selectAllItems
		 * @type {method}
		 * @description "选中所有item"
		 * @return
		 */
		selectAllItems: function() {
			this.selectItems(this.items.values());
		},
		/**
		 * @author JeroLin
		 * @name getSelectedItems
		 * @type {method}
		 * @description "获取被选中的item"
		 * @return {object} "被选中的item"
		 */
		getSelectedItems: function() {
			return this.items.values().select(function(item) {
				return item.options.selected;
			});
		},
		/**
		 * @author JeroLin
		 * @name unselectItems
		 * @type {method}
		 * @description "将item组件设置为未选中"
		 * @param {object} items "item组件的集合"
		 * @return
		 */
		unselectItems: function(items) {
			items = cloud.util.makeArray(items);
			items.invoke("unselect");
			this.updateItemsCount();
		},
		/**
		 * @author JeroLin
		 * @name unselectAllItems
		 * @type {method}
		 * @description "将所有item设为未选中"
		 * @return
		 */
		unselectAllItems: function() {
			this.unselectItems(this.items.values());
		},
		/**
		 * @author JeroLin
		 * @name updateItems
		 * @type {method}
		 * @description "更新item"
		 * @param {object} items "当前的items集合"
		 */
		updateItems: function(items) {
			items = cloud.util.makeArray(items);
			items.each(function(item) {
				this.items.get(item.id).update(item);
			}, this);
		},
		/**
		 * @author JeroLin
		 * @name updateItemsCount
		 * @type {method}
		 * @description "更新item组件的数量信息"
		 * @return
		 */
		updateItemsCount: function() {
			this.selectedItemsCount = this.getSelectedItems().size();
			this.size = this.items.values().select(function(item) {
				return item.options.status !== "inherent";
			}).size();
			this.fire("countchange");
		},
		/**
		 * Clear up this itembox
		 * @author JeroLin
		 * @name clear
		 * @type {method}
		 * @description "清除该组件的所有内容"
		 * @return
		 */
		clear: function() {
			this.items.each(function(item) {
				item.value.destroy();
				this.items.unset(item.key);
			}, this);
			this.switchToDefaultStatus(true);
			this.container.empty();
			this.updateItemsCount();
		},
		/**
		 * return the items whitch option[prop] in values
		 * @author JeroLin
		 * @name getItemsByProp
		 * @type {method}
		 * @description "通过属性对比筛选item"
		 * @param {string} prop "属性名"
		 * @param {Object} values "值集"
		 * @return {object} "item的集合"
		 */
		getItemsByProp : function(prop, values){
			var self = this;
            var valueArr = cloud.util.makeArray(values);
            var items = this.items.values().findAll(function(item){
//            	console.log(item, "getItemsByProp")
            	var options = item.options;
            	return valueArr.indexOf(options[prop]) != -1;
            });
            
            return items;
		},
		/**
		 * @author JeroLin
		 * @name destroy
		 * @type {method}
		 * @description "摧毁组件"
		 * @param {function} $super "父类引用"
		 * @return
		 */
		destroy: function($super) {
			this.clear();
			if (this.layout && (!this.layout.destroyed)) {
            	this.layout.destroy();
            }
			this.options.width = 0;
			this.options.height = 0;
			this.items = null;

			$super();
		}
	});
	return ItemBox;
});