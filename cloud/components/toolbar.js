/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved
 * @author QinJunwen
 * @filename toolbar
 * @filetype {class}
 * @filedescription "工具栏组件"
 * @filereturn {function} Toolbar "函数引用"
 */
define(function(require) {
	require("cloud/base/cloud");
	require("cloud/components/button");
	require("cloud/components/toolbar.css");

	var Toolbar = Class.create(cloud.Component, {	    
	    /**
         * init this component
         * @author QinJunwen
         * @name initialize
         * @type {function}
         * @description "该类实例化函数"
//       * @param {function} $super "父类引用"
         * @param {object} options "json参数对象"
         * @return
         */
	    initialize: function($super, options) {

			cloud.util.defaults(options, {
				leftItems: null,
				rightItems: null
			});
			this.moduleName = "cloud-toolbar";
			$super(options);
			this._draw();
		},
		
		/**
         * destroy this component
         * @author QinJunwen
         * @name destroy
         * @type {method}
         * @description "摧毁组件"
         * @param {function} $super "父类引用"
         * @return
         */
		destroy: function($super) {
			$super();

			for (var el in this.options) {
				delete this.options[el];
			}

			for (el in this) {
				delete this[el];
			}

			return null;
		},
		
		/**
		 * append items to left panel
		 * @author QinJunwen
		 * @name appendLeftItems
		 * @type {method}
		 * @description "在组件左边添加项目"
		 * @param {array} leftItems "左边的选项数组"
		 * @param {number} index "数组索引"
		 * @return
		 */
		appendLeftItems: function(leftItems, index) {
			var target = (this.leftDiv.children())[index + 1];

			this._appendItems(leftItems, target, this.leftDiv);
		},
		
		/**
		 * append items to right panel
		 * @author QinJunwen
		 * @name appendRightItems
		 * @type {method}
		 * @description "在组件右边添加项目"
		 * @param {array} rightItems "右边的选项数组"
		 * @param {number} index "数组索引"
		 * @return
		 */
		appendRightItems: function(rightItems, index) {
			var target = (this.rightDiv.children())[index + 1];

			this._appendItems(rightItems, target, this.rightDiv);
		},
		
		/**
		 * delete item of left panel by given index
		 * @author QinJunwen
		 * @name deleteLeftItem
		 * @type {method}
		 * @description "删除组件左边指定的项目"
		 * @param {number} index "数组索引"
		 * @return
		 */
		deleteLeftItem: function(index) {
			var target = (this.leftDiv.children())[index];
			target && target.remove();
		},
		
		/**
         * delete item of right panel by given index
         * @author QinJunwen
         * @name deleteRightItem
         * @type {method}
         * @description "删除组件右边指定的项目"
         * @param {number} index "数组索引"
         * @return
         */
		deleteRightItem: function(index) {
			var target = (this.rightDiv.children())[index];
			if(navigator.userAgent.indexOf("MSIE")>0){
				target && target.removeNode();
			}else{
				target && target.remove();
			}			
		},

		/**
		 * append items to left/right panel
		 * @author QinJunwen
		 * @name _appendItems
		 * @type {method}
		 * @description "添加项目到组件左/右边"
		 * @param {array} items
		 * @param {object} target
		 * @param {object} parent
		 * @return
		 */
		_appendItems: function(items, target, parent) {

			if (items) {
				$.each(items, function(index, item) {
					var tempEl = null;

					if ((item instanceof cloud.Component)) {
						tempEl = item.element;

					} else if ((typeof item) == "string" || (item instanceof jQuery)) {

						if (item === "|") {
							//TODO separator support
						} else {
							tempEl = $("<div>").addClass("cloud-toolbar-item");
							$(item).addClass("cloud-toolbar-item-content").appendTo(tempEl);
						}
					}
					if (target) {
						target = $(target);
						target.before(tempEl);
					} else {
						tempEl.appendTo(parent);
					}

				});
			}
		},
		
		/**
		 * draw this component
		 * @author QinJunwen
		 * @name _draw
		 * @type {method}
		 * @description "绘制组件dom结构"
		 * @return
		 */
		_draw: function() {
			this.leftDiv = $("<div>").addClass("cloud-toolbar-leftcontainer").appendTo(this.element);
			this.rightDiv = $("<div>").addClass("cloud-toolbar-rightcontainer").appendTo(this.element);
			this.helpDiv = $("<div>").addClass("ui-helper-clearfix").appendTo(this.element);

			var leftItems = this.options.leftItems;
			var rightItems = this.options.rightItems;

			this.appendLeftItems(leftItems);
			this.appendRightItems(rightItems);

			this.element.addClass("cloud-toolbar-container");
		}

	});
	cloud.Toolbar = cloud.Toolbar || Toolbar;
	return Toolbar;
});