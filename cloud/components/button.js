/**
 * @author panjc
 * @filename button
 * @filetype {class}
 * @filedescription "按钮类,用于生成按钮组件"
 * @filereturn {function} Button
 */
define(function(require) {
	require("cloud/base/cloud");
	require("./button.css");

	var Button = Class.create(cloud.Component, {

		/**
		 * @author panjc
		 * @name initialize
		 * @type {function}
		 * @description "该类的实例化函数"
		 * @param {function} $super "父类引用"
		 * @param {object} options "json对象"
		 * @return 
		 */
		initialize: function($super, options) {
			//var defaultCls = "cloud-button-body";

			cloud.util.defaults(options, {
				title: null,
				text: "",
				lang: "",
				imgCls: null,
				imgBaseCls: "cloud-icon",
				checkboxCls: "cloud-icon-choice",
				cls: "cloud-button-body", //TODO
				disabled: false,
				checkbox: false,
				stateful : false,
				autoGenTitle : true,
				selected: false, // enable if checkbox == true	
				events: {}

			});
			this.moduleName = "button";
			this.defaultElement = "<a>";
			this.mousedown = false;
			$super(options);
			
			if(this.options.lang.indexOf("{") > -1){
				this.options.lang = cloud.util.strToJson(this.options.lang);
			}

			this.disableBackGroud = false;
			this._draw();

			if (this.checkbox) {
				this.setSelect(this.options.selected || false);
			}

			if (this.options.disabled === true) {
				this.disable();
			}

			this.caculateType();

		},
		
		/**
		 * @author QinJunwen
		 * @name caculateType 
		 * @type {method}
		 * @description "设置按钮的展示样式：检查框或是普通的按钮，并设置显示文字"
		 * @return 
		 */
		caculateType: function() {

			if (this.options.checkbox === true) {
				this.element.addClass("cloud-button-checkbox");
			} else {
				this.element.removeClass("cloud-button-checkbox");
				if (this.options.imgCls === null || this.options.imgCls === "") {
					this.element.addClass("cloud-button-text-only");
				} else {
					this.element.removeClass("cloud-button-text-only");
				}
			}

			if (this.options.text === null || this.options.text === "") {
				this.element.addClass("cloud-button-icon-only");
			} else {
				this.element.removeClass("cloud-button-icon-only");
			}

		},
		
		/**
		 * @author QinJunwen
		 * @name destroy
		 * @type {method}
		 * @description "摧毁按钮"
		 * @param {function} @super "父类引用"
		 * @return {null} "空"
		 */
		destroy: function($super) {
			$super();

			/*for (var el in this.options) {
				delete this.options[el];
			}

			for (el in this) {
				delete this[el];
			}*/

			return null;
		},
		
		/**
		 * set text of button
		 * @author QinJunwen
		 * @name setText
		 * @type {method}
		 * @description "设置按钮上显示的文字内容"
		 * @param {string} text "显示的文本内容"
		 * @return
		 */
		setText: function(text) {
			this._drawText(text);
		},

		/**
		 * select the item, enabled only when this button display as checkbox
		 * @author QinJunwen
		 * @name select
		 * @type {method}
		 * @description "当按钮为选择框时，该方法能将该按钮设置为选中状态"
		 * @return
		 */
		select: function() {
			this.options.selected = true;
			/*this.checkbox.removeClass("cloud-button-checkbox");
			this.checkbox.addClass("cloud-button-checkbox-select");*/
			this.checkbox.removeClass(this.options.imgBaseCls + "-default").addClass(this.options.imgBaseCls + "-active");
		},

		/**
         * unselect the item, enabled only when this button display as checkbox
         * @author QinJunwen
         * @name unSelect
         * @type {method}
         * @description "当按钮为选择框时，该方法能将该按钮设置为未选中状态"
         */
		unSelect: function() {
			this.options.selected = false;
			/*this.checkbox.addClass("cloud-button-checkbox");
			this.checkbox.removeClass("cloud-button-checkbox-select");*/
			this.checkbox.addClass(this.options.imgBaseCls + "-default").removeClass(this.options.imgBaseCls + "-active");
		},
		
		/**
		 * select or unselect the item, enabled only when this button display as checkbox
		 * @author QinJunwen
		 * @name setSelect
		 * @type {method}
		 * @description "当按钮为选择框时，该方法能根据参数设置选择框是否被选中"
		 * @param {boolean} isSelect "true:被选中；false:为被选中"
		 * @return 
		 */
		setSelect: function(isSelect) {
			this.options.selected = isSelect;
			if (isSelect) {
				this.select();
			} else {
				this.unSelect();
			}
		},
		
		/**
		 * return the select status of button, enabled only when this button display as checkbox
		 * @author QinJunwen
		 * @name isSelected
		 * @type {method}
		 * @description "当按钮为选择框时，获取该按钮的选择状态"
		 * @returns {boolean|undefined}
		 */
		isSelected: function() {
			if (this.checkbox) {
				return this.options.selected;
			} else {
				return undefined;
			}
		},
		
		/**
		 * disable this component, click/select will not work
		 * @author QinJunwen
		 * @name disable
		 * @type {method}
		 * @description "让按钮处于不能被点击和选中状态"
		 * @param {function} $super "父类引用"
		 * @return 
		 */
		disable: function($super) {
			if (this.options.disabled === false){
//				this.element.unbind("click", this._onclick);
				this.element.addClass("cloud-button-disabled");
				this.options.disabled = true;
				$super();
			}
			
		},
		
		/**
         * enable this component, click/select will be work
         * @author QinJunwen
         * @name enable
         * @type {method}
         * @description "重新让按钮处于可点击和选中状态"
         * @param {function} "父类引用"
         * @return
         */
		enable: function($super) {
			if (this.options.disabled === true){
//				this.element.bind("click", this._onclick.bind(this));
				this.element.removeClass("cloud-button-disabled");
				this.options.disabled = false;
				$super();
			}
		},
		
		/**
		 * return the enable state of this button
		 * @author QinJunwen
		 * @name isEnable
		 * @type {method}
		 * @description "获取按钮是否处于点击或选中的状态"
		 * @returns {boolean} "true:可点击或选中;false:不可点击和选中"
		 */
		isEnable: function() {
			return !(this.options.disabled);
		},
		
		/**
		 * change display state from active to default, enabled when options.stateful equals true
		 * @author QinJunwen
		 * @name removeState
		 * @type {method}
		 * @description "当按钮是活跃状态的时候，改变其样式，从活跃状态变为默认状态"
		 * @return
		 */
		removeState : function(){
			if (this.options.stateful){
				this.element.addClass(this.options.cls);
				this.element.removeClass("cloud-button-active");
				this.imgDiv && (this.imgDiv.removeClass(this.options.imgBaseCls + "-active").addClass(this.options.imgBaseCls + "-default"));
				this.status = false;
			}
		},
		
		/**
		 * draw this component
		 * @author QinJunwen
		 * @private
		 * @name _draw
		 * @type {method}
		 * @description "绘制按钮的dom结构"
		 * @return 
		 */
		_draw: function() {
			var lang = this.options.lang;
			// initialize element
			
			this.element.addClass("cloud-button").addClass(this.options.cls)
				.hover(this._onMouseOver.bind(this), this._onMouseOut.bind(this))
				.mousedown(this._onMousedown.bind(this)).mouseup(this._onMouseup.bind(this))
				//.attr("title", this.options.title || this.options.text)
				.bind("click",this._onclick.bind(this));
			
			if (this.options.title){
				this.element.attr("title", this.options.title);
			}else if (this.options.autoGenTitle){
				this.element.attr("title", this.options.text);
			}
			
			if(lang.title){
				this.element.attr("lang", "title:" + lang.title);
			}
			//draw check box
			this.options.checkbox && this._drawCheckBox();

			//draw image
			this._drawImg(this.options.imgBaseCls, this.options.imgCls);

			//draw text
			this._drawText(this.options.text);

			// this.helpDiv = $("<span>").addClass("ui-helper-clearfix").appendTo(this.element);

		},
		
		/**
		 * draw checkbox of this component
		 * @author QinJunwen
		 * @private
		 * @type {method}
		 * @name _drawCheckBox
		 * @description "绘制选择框"
		 * @return
		 */
		_drawCheckBox: function() {
			this.checkbox = $("<span>").addClass("cloud-button-item").addClass("cloud-button-checkbox-icon cloud-button-img").addClass(this.options.checkboxCls);

			this._disableBackGroud();

			this.checkbox.appendTo(this.element);
		},
		
		/**
		 * draw icon of this button
		 * @author QinJunwen
		 * @private
		 * @type {method}
		 * @name _drawImg
		 * @description "为按钮添加背景图"
		 * @param imgBaseCls {String} "默认的按钮背景图的类名，这是一张大图"  
		 * @param imgCls {String} "控制按钮背景位于大图上的位置的类名"
		 * @return
		 */
		_drawImg: function(imgBaseCls, imgCls) {
			if ((imgCls !== null)) {
				this.imgDiv = this.imgDiv || $("<i>").addClass("cloud-button-item").addClass("cloud-button-img").appendTo(this.element);
				this.imgDiv.addClass(imgBaseCls + "-default").addClass(imgCls);
				if (this.checkbox) {
					this.checkbox.after(this.imgDiv);
				} else {
					this.imgDiv.prependTo(this.element);
				}
			}
		},
		
		/**
		 * draw text of this button
		 * @author QinJunwen
		 * @private
		 * @type {method}
		 * @name _drawText
		 * @description "在按钮上添加文字内容"
		 * @param text {string} "文字内容"
		 * @return
		 */
		_drawText: function(text) {
			if (text !== "") {
				this.textDiv = this.textDiv || $("<span>").addClass("cloud-button-item").addClass("cloud-button-text");
				var lang = this.options.lang;
				if(lang.text){
					this.textDiv.attr("lang","text:" + lang.text);
				}
				this.textDiv.text(text);
				if (this.helpDiv) {
					this.helpDiv.before(this.textDiv);
				} else {
					this.textDiv.appendTo(this.element);
				}

			} else {
				this._disableBackGroud();
			}
		},
		/**
		 * @author QinJunwen
		 * @private
		 * @type {method}
		 * @name _disableBackGroud
		 * @description "当参数options.cls为'cloud-button-body'时,按钮的背景将不可设置"
		 */
		_disableBackGroud: function() {
			if (this.options.cls === "cloud-button-body") {
				this.element.removeClass(this.options.cls);
				this.disableBackGroud = true;
			}
		},
		
		/**
		 * handle and fire the click event of button
		 * @author QinJunwen
		 * @name _onclick
		 * @type {method}
		 * @private
		 * @description "触发将来按钮实例化时的'click'事件"
		 * @param event {object} "事件对象"
		 * @param args {object} "参数"
		 * @returns {Boolean} "false"
		 */
		_onclick: function(event, args) {
		    if (!this.options.disabled){
		        
		        if (this.options.checkbox === true) {
		            
		            this.options.selected = !this.options.selected;
		            
		            this.setSelect(this.options.selected);
		        }
		        this.fire("click", this, args);
		        event.stopPropagation();
		        this.options.stateful && (this.status = true);
		        return false;
		    }
		},

		/**
		 * handle MouseOver event of button
		 * @author QinJunwen
		 * @name _onMouseOver
		 * @type {method}
		 * @private
		 * @description "为按钮的mouseover事件定义处理函数"
		 * @return
		 */
		_onMouseOver: function() {
			this.element.addClass("cloud-button-hover").addClass(this.options.cls + "-hover");
			if (this.imgDiv) {
				this.imgDiv.removeClass(this.options.imgBaseCls + "-default").addClass(this.options.imgBaseCls + "-active");
			}
		},
		
		/**
         * handle MouseOut event of button
         * @author QinJunwen
         * @name _onMouseOut
         * @type {method}
         * @private
         * @description "为按钮的mouseout事件添加处理函数"
         * @return
         */
		_onMouseOut: function() {
			this.element.removeClass("cloud-button-hover").removeClass(this.options.cls + "-hover");
			if(this.mousedown && !this.checkbox){
				this.element.removeClass("cloud-button-active")
				if(!this.disableBackGroud){
					this.element.addClass(this.options.cls);
				}
				this.mousedown = false;
			}
			if (this.imgDiv) {
				if (!this.status){
					this.imgDiv.removeClass(this.options.imgBaseCls + "-active").addClass(this.options.imgBaseCls + "-default");
				}
			}
		},
		
		/**
         * handle MouseDown event of button
         * @author QinJunwen
         * @name _onMousedown
         * @type {method}
         * @private
         * @description "为按钮的mousedown添加事件处理函数"
         * @return
         */
		_onMousedown: function() {
			var self = this;
			this.mousedown = true;
			if (!this.disableBackGroud) {
				this.element.removeClass(this.options.cls);
			}
			if (!this.checkbox) {
				this.element.addClass("cloud-button-active");
			}

		},
		
		/**
         * handle MouseDown event of button
         * @author QinJunwen
         * @name _onMouseup
         * @type {method}
         * @private
         * @description "为按钮的mouseup添加事件处理函数"
         * @return
         */
		_onMouseup: function() {
			if (!this.disableBackGroud && !this.options.stateful) {
				this.element.addClass(this.options.cls);
			}
			if (!this.checkbox && !this.options.stateful) {
				this.element.removeClass("cloud-button-active");
			}
			this.mousedown = false;
		}
	});
	cloud.Button = cloud.Button || Button;
	return Button;
});