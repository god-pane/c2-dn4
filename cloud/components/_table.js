/**
 * @author PANJC
 * @filename _table
 * @filetype {class}
 * @filedescription "带有分页的表格组件"
 * @filereturn {function} Table
 * 
 */
define(function(require) {
    require("cloud/base/cloud");
    require("./_table.css");
    var Paging = require("cloud/components/paging");
    var Table = Class.create(cloud.Component,{
    	/**
    	 * @author PanJC
    	 * @name initialize
    	 * @type {function}
    	 * @description "该类的实例化函数"
    	 * @param {function} $super "父类引用"
    	 * @param {object} options "json对象"
    	 */
        initialize: function($super,options){
        	$super(options);
        	this.options = options;
        	if(!$.isPlainObject(this.options.events)){
        		this.options.events = {};
        	}
        	this.classes = {
        			box:"table-box",
        			table:"table-table",
        			thead:"table-thead",
        			tbody:"table-tbody",
        			page:"table-page",
        			nodata:"table-nodata"
        	};
        	this.selected = "";
        	this.cache = [];
        	this._render();
        },
        /**
         * @author PanJC
         * @name _initalizeAttr
         * @type {method}
         * @description "用随机数来拼接类名"
         * @private
         * @return
         */
        _initializeAttr:function(){
        	this.ids = {};
        	var ran = (Math.random() + "").replace(".","");
        	for(var attr in this.classes){
        		this.ids[attr]= this.classes[attr] + "-" + ran;
        	}
        },
        /**
         * @author PanJC
         * @name _initializeData
         * @type {method}
         * @description "请求数据，并进行处理"
         * @private
         * @return
         */
        _initializeData:function(){
        	var self = this;
        	if(self.options.page !== false){
        		self.options.request(0,self.options.limit ? self.options.limit : 30,function(data){
        			self._load(data);
        			self._initializePage(data);
        			self._unmask();
        		});
        	}else{
        		self.options.request(0,0,function(data){
        			self._load(data);
        			self._unmask();
        		});
        		$("#" + self.ids.page).hide();
        	}
        },
        
        /**
         * @author PanJC
         * @name _render
         * @type {method}
         * @description "渲染表格"
         * @private
         * @return
         */
        _render:function(){
        	this._mask();
        	this._initializeAttr();
        	this._renderBox();
        	this._renderTable();
        	this._renderThead();
        	this._renderTbody();
        	this._renderPage();
        	this._renderSelectedInfo();
        	this._initializeData();
        	this._event();
        },
        /**
         * @name _renderBox
         * @type {method}
         * @description "绘制box的dom结构"
         * @private
         * @return
         */
        _renderBox:function(){
        	var $box = $("<div></div>").attr({"id":this.ids.box,"class":this.classes.box}).css({height:this.element.height()-38});
        	this.element.append($box);
        },
        /**
         * @name _renderTable
         * @type {method}
         * @description "绘制表格"
         * @private
         * @return
         */
        _renderTable:function(){
        	var $table = $("<table></table>").attr({"id":this.ids.table,"class":this.classes.table});
        	if(this.options.style){
        		$table.addClass(this.options.style);
        	}
        	$("#" + this.ids.box).append($table);
        },
        /**
         * @name _renderThead
         * @type {method}
         * @description "绘制表格头部"
         * @private
         * @return
         */
        _renderThead:function(){
        	var $thead = $("<thead></thead>").attr({"id":this.ids.thead,"class":this.classes.thead});
        	$thead.append($("<tr></tr>"));
        	for(var num=0;num < this.options.columns.length;num++){
        		var $th = $("<th></th>").text(this.options.columns[num].title).attr({"field":this.options.columns[num].field})
        		if(this.options.columns[num].width){
        			$th.css("width",this.options.columns[num].width);
        		}
        		$thead.children("tr").append($th);
        	}
        	$("#" + this.ids.table).append($thead);
        	this._renderThCheckbox();
        	if(this.options.thead === false){
        		$("#" + this.ids.thead).hide();
        	}
        },
       /**
        * @name _renderTbody
        * @type {method}
        * @description "绘制表格主体"
        * @private
        * @return
        */
        _renderTbody:function(){
        	var $tbody = $("<tbody></tbody>").attr({"id":this.ids.tbody,"class":this.classes.tbody});
        	$("#" + this.ids.table).append($tbody);
        },
        /**
         * @name _renderPage
         * @type {method}
         * @description "绘制翻页组件"
         * @private
         * @return
         */
        _renderPage:function(){
        	var $page = $("<div></div>").attr({"id":this.ids.page,"class":this.classes.page});
        	this.element.append($page);
        },
        /**
         * @name _renderSelectedInfo
         * @type {method}
         * @description "绘制关于已选信息的dom结构"
         * @private
         * @return
         */
        _renderSelectedInfo:function(){
        	if(this.options.count !== false){
        		var $selectedInfo = $("<div></div>").attr({"class":"table-selected-info"});
        		$selectedInfo.append($("<p></p>").attr({"class":"table-selected-info-title"}).text("已选:"));
        		$selectedInfo.append($("<p></p>").attr({"class":"table-selected-info-count"}).text(0));
        		$selectedInfo.append($("<a></a>").attr({"class":"table-selected-info-invert"}).text("x"));
        		$("#" + this.ids.page).prepend($selectedInfo);
        	}
        },
        /**
         * @name _initializePage
         * @type {method}
         * @description "实例化分页组件"
         * @param {object} data "分页数据"
         * @private
         * @return
         */
        _initializePage:function(data){
        	var self = this;
        	self.page = new Paging({
				selector : $("#" + self.ids.page),
				data : data,
				total:data.total,
				current : 1,
				limit : self.options.limit ? self.options.limit : 30,
				requestData:function(options,callback){
					self.options.request(options.cursor,options.limit,function(data){
						callback(data);
					});
				},
				turn:function(data){
					self._empty();
					self._load(data);
				}
			});
        },
        /**
         * @name refreshForNoPage
         * @description "无分页刷新"
         * @type {method}
         * @return
         */
        refreshForNoPage:function(){
        	var self = this;
        	self._empty();
        	self._initializeData();
        },
        /**
         * @name refresh
         * @description "刷新页面"
         * @type {method}
         * @return
         */
        refresh:function(){
        	var self = this;
        	self.page.refresh();
        },
        /**
         * @name _renderThCheckbox
         * @type {method}
         * @private
         * @return
         */
        _renderThCheckbox:function(){
        	var self = this;
        	if(self.options.checkbox !== false){
        		var $th = $("<th></th>").attr("style","width:30px!important").addClass("th-checkbox").append($("<input type='checkbox'>"));
        		$("#" +　self.ids.thead).children("tr").prepend($th);
        	}
        },
        /**
         * @name _load
         * @type {method}
         * @description "表格装载数据"
         * @param {object} data "表格数据对象"
         * @private
         * @return 
         */
        _load:function(data){
        	var self = this;
        	self._uncheckThCheckbox();
        	var result = data.result;
        	self._setCache(result);
        	var $tbody = $("#" + self.ids.tbody);
        	var currentDataSelectedCount = 0;
        	for(var num=0;num<result.length;num++){
        		var $tr = $("<tr></tr>").attr({"_id":result[num]["_id"]});
        		var _checkboxStatus;
        		if(self.selected.indexOf(result[num]["_id"]) === -1){
        			_checkboxStatus = false;
        		}else{
        			_checkboxStatus = "checked";
        			currentDataSelectedCount++;
        		}
        		if(self.options.checkbox !== false){
        			$tr.append($("<td></td>").addClass("td-checkbox").append($("<input>").attr({"type":"checkbox","_id":result[num]["_id"],"checked":_checkboxStatus})));
        		}
        		for(var _num=0;_num<self.options.columns.length;_num++){
            		var $td = $("<td></td>").attr({"field":self.options.columns[_num]["field"]});
            		var fieldContent;
            		if($.isFunction(self.options.columns[_num].process)){
            			fieldContent = self.options.columns[_num].process(result[num][self.options.columns[_num]["field"]]);
            		}else{
            			fieldContent = result[num][self.options.columns[_num]["field"]];
            		}
            		$td.html(fieldContent);
        			var _class;
        			if(num%2 === 0){
        				_class = "_odd"; 
        			}else{
        				_class = "_even";
        			}
        			$tr.addClass(_class).append($td);
            	}
        		$tbody.append($tr);
        	}
        	if(result.length === 0){
        		var $p = $("<p></p>")
        			.attr({
        				id:self.ids.nodata
        			})
        			.css({
	        			position: "absolute",
		        		width: "100%",
		        		"text-align": "center",
		        		top: ($("#" + self.ids.thead).height() + 10)+"px"
        			})
        			.text(locale.get("nodata"));
        		$("#"+self.ids.box).append($p);
        	}else{
        		$("#"+self.ids.nodata).remove();
        	}
        	if(result.length === currentDataSelectedCount && result.length !== 0){
        		self._checkThCheckbox();
        	}
        },
        /**
         * @name _empty
         * @type {method}
         * @description "清空表格数据"
         * @private
         * @return
         */
        _empty:function(){
        	var self = this;
        	$("#" + self.ids.tbody).empty();
        	self._clearCache();
        },
        /**
         * @name _getCache
         * @type {method}
         * @description "获得cache"
         * @private
         * @return {object} this.cache "缓存对象"
         */
        _getCache:function(){
        	var self = this;
        	return self.cache;
        },
        /**
         * @name _setCache
         * @type {method}
         * @desription "将数据保存于cache中"
         * @param {object} data "数据对象"
         * @private
         * @return
         */
        _setCache:function(data){
        	var self = this;
        	var _cache = self.cache;
        	var _strArr = "";
        	if(_cache.length > 0){
        		for(var num = 0;num < _cache.length;num++){
        			_strArr += _cache[num]["_id"] + ",";
        		}
        	}
        	for(var _num = 0;_num < data.length;_num++){
        		if(_strArr.indexOf(data[_num]["_id"]) === -1){
        			_cache.push(data[_num]);
        		}
        	}
        	self.cache = _cache;
        },
        /**
         * @name _clearCache
         * @type {method}
         * @description "清除cache的内容"
         * @private
         * @return
         */
        _clearCache:function(){
        	var self = this;
        	self.cache = [];
        },
        /**
         * @name get
         * @description "刷选cache中的数据"
         * @param {boolean} detail "是否获取详细信息"
         * @type {method}
         * @reutn {array} _arr "数据数组"
         */
        get:function(detail){
        	var self = this;
        	if(!detail){
        		return self._getSelected();
        	}else{
        		var _selected = self._getSelected();
        		var _cache = self._getCache();
        		var _arr = [];
        		for(var num = 0;num < _selected.length;num++){
        			for(var _num = 0;_num < _cache.length;_num++){
        				if(_selected[num] === _cache[_num]["_id"]){
        					_arr.push(_cache[_num]);
        					break;
        				}
        			}
        		}
        		return _arr;
        	}
        },
        getAll:function(){
        	
        },
        /**
         * @name getCurrent
         * @description "获取被选中的行"
         * @type {method}
         * @return {object} "当前的行的数据对象"
         */
        getCurrent:function(){
        	var self = this;
        	var current = null;
        	$("#" + self.ids.tbody).find("tr").each(function(){
        		if($(this).hasClass("table-row-onclick")){
        			var _id = $(this).attr("_id");
            		var cache = self._getCache();
            		for(var num = 0;num < cache.length;num++){
            			if(cache[num]["_id"] === _id){
            				current = cache[num];
            			}
            		}
        		}
        	});
        	return current;
        },
        /**
         * @name getCurrentPage
         * @type {method}
         * @description "获取当前页的数据内容"
         * @return {object} "包含本页的数据对象的数组"
         */
        getCurrentPage:function(){
        	var self = this;
        	var cache = self._getCache();
        	var currentPage = [];
        	var arr = [];
        	$("#" + self.ids.tbody).find("tr").each(function(){
//        		if($(this).hasClass("table-row-onclick")){
//        			var _id = $(this).attr("_id");
//            		var cache = self._getCache();
//            		for(var num = 0;num < cache.length;num++){
//            			if(cache[num]["_id"] === _id){
//            				current = cache[num];
//            			}
//            		}
//        		}
        		arr.push($(this).attr("_id"));
        	});
        	for(var num = 0; num < arr.length; num++){
        		for(var _num = 0; _num < cache.length; _num++){
        			if(arr[num] === cache[_num]["_id"]){
        				currentPage.push(cache[_num]);
        				break;
        			}
        		}
        	}
        	return currentPage;
        },
        /**
         * @name _getSelected
         * @type {method}
         * @description "获取被选中的内容"
         * @param {string} type "类型"
         * @private
         * @return {array} _return "内容数组"
         */
        _getSelected:function(type){
        	var self = this;
        	var _return;
        	if(!type || type === "array"){
        		var arr = self.selected.split(",");
        		arr.length = arr.length - 1;
        		_return = arr;
        	}else if(type === "string"){
        		_return = self.selected;
        	}
        	return _return;
        },
        /**
         * @name _setSelected
         * @type {method}
         * @description "设置行为选中"
         * @param {boolean} selected "true:被选中;false:为被选中"
         * @private
         */
        _setSelected:function(selected){
        	var self = this;
        	self.selected = selected;
        },
        /**
         * @name _clearSelected
         * @description "清除选中状态"
         * @type {method}
         * @private
         * @return
         */
        _clearSelected:function(){
        	var self = this;
        	self.selected = "";
        	self._uncheckThCheckbox();
        	self._uncheckAllTdCheckbox();
        	self._clearSelectedCount();
        	if(self.options.events.change){
        		self.options.events.change(self._getSelected());
        	}
        },
        /**
         * @name _setSelectedCount
         * @type {method}
         * @description "显示选中资源的数目"
         * @private
         * @return
         */
        _setSelectedCount:function(){
        	var self = this;
        	$("#" + self.ids.page).find(".table-selected-info-count").text((self._getSelected()).length);
        	if(self.options.events.change){
        		self.options.events.change(self._getSelected());
        	}
        },
        /**
         * @name _clearSelectedCount
         * @type {method}
         * @description "清除显示的资源数目"
         * @private
         * @return
         */
        _clearSelectedCount:function(){
        	var self = this;
        	$("#" + self.ids.page).find(".table-selected-info-count").text(0);
        },
        /**
         * @name _checkThCheckbox
         * @type {method}
         * @description "设置选择框选中状态"
         * @private
         * @return
         */
        _checkThCheckbox:function(){
        	var self = this;
        	$("#" +　self.ids.thead).find("input").attr({"checked":"checked"});
        },
        /**
         * @name _uncheck
         * @type {method}
         * @description "设置选择框为未选中状态"
         * @private
         * @return
         */
        _uncheckThCheckbox:function(){
        	var self = this;
        	$("#" +　self.ids.thead).find("input").removeAttr("checked");
        },
        /**
         * @name _checkAllTdCheckbox
         * @type {method}
         * @description "选中所有选择框"
         * @private
         * @return
         */
        _checkAllTdCheckbox:function(){
        	var self = this;
        	$("#" +　self.ids.tbody).find("input").attr({"checked":"checked"});
        },
        /**
         * @name _uncheckAllIdCheckbox
         * @type {method}
         * @description "撤销全选选择框"
         * @private
         * @return
         */
        _uncheckAllTdCheckbox:function(){
        	var self = this;
        	$("#" +　self.ids.tbody).find("input").removeAttr("checked");
        },
        /**
         * @name _event
         * @type {method}
         * @description "dom的事件绑定"
         * @private
         * @return
         */
        _event:function(){
        	var self = this;
        	$("#" + self.ids.thead).find("input").die("click").live("click",function(){
        		if($(this).attr("checked")){
        			$("#" + self.ids.tbody).find("input").each(function(){
        				$(this).attr("checked","checked");
        				var _id = $(this).attr("_id");
        				var _selected = self._getSelected("string");
        				if(_selected.indexOf(_id) === -1){
            				self._setSelected(_selected + _id + ",");
            			}
        			})
        		}else{
        			$("#" + self.ids.tbody).find("input").each(function(){
        				$(this).removeAttr("checked");
        				var _id = $(this).attr("_id");
        				var _selected = self._getSelected("string");
        				if(_selected.indexOf(_id) > -1){
            				_selected = _selected.replace(_id + ",","");
            				self._setSelected(_selected);
            			}
        			})
        		}
        		self._setSelectedCount();
        	});
        	$("#" + self.ids.tbody).find("input").die("click").live("click",function(){
        		var _checked = $(this).attr("checked");
        		var _id = $(this).attr("_id");
        		var _selected = self._getSelected("string");
        		if(_checked){
        			if(_selected.indexOf(_id) === -1){
        				self._setSelected(_selected + _id + ",");
        			}
        		}else{
        			if(_selected.indexOf(_id) > -1){
        				_selected = _selected.replace(_id + ",","");
        				self._setSelected(_selected);
        			}
        			self._uncheckThCheckbox();
        		}
        		self._setSelectedCount();
			});
        	$("#" + self.ids.page).find(".table-selected-info-invert").die("click").live("click",function(){
        		self._clearSelected();
        	});
        	if(self.options.rowBackground !== false){
	        	$("#" + self.ids.tbody).find("tr").die("click").live("click",function(){
	        		$(this).siblings().each(function(){
	        			$(this).removeClass("table-row-onclick");
	        		})
	        		$(this).addClass("table-row-onclick");
	        	});
        	}
        },
        /**
         * @name _mask
         * @type {method}
         * @description "遮罩该组件"
         * @private
         * @return
         */
        _mask:function(){
        	var self = this;
        	if(self.options.mask === true){
        		cloud.util.mask(self.element);
        	}
        },
        /**
         * @name _unmask
         * @type {method}
         * @description "取消该组件的遮罩"
         * @private
         * @return
         */
        _unmask:function(){
        	var self = this;
        	if(self.options.mask === true){
        		cloud.util.unmask(self.element);
        	}
        },
        /**
         * @name destroy
         * @description "摧毁该组件"
         * @type {method}
         * @return
         */
        destroy:function(){
        	var self = this;
        	this.ids = null;
        	this.classes = null;
        	this.selected = null;
        	this.cache = null;
        	this.userTable = null;
        	this._userTable = null;
        	this.gatewayTable = null;
        	this._gatewayTable = null;
        	this.siteTable = null;
        	this._siteTable = null;
        }
        
    });
    return Table;
});