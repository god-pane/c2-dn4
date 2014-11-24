/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved
 * @author QinJunwen
 * @filename table
 * @filetype {class}
 * @filedescription "表格组件"
 * @filereturn {function} Table "函数引用"
 */
define(function(require) {
    var cloud = require("cloud/base/cloud");
    var Button = require("cloud/components/button");
    var dataTable = require("cloud/lib/plugin/jquery.dataTables");
    require("cloud/resources/css/table.css");
    var Table = Class.create(cloud.Component, {

        /**
         * init this component
         * @author QinJunwen
         * @name initialize
         * @type {function}
         * @description "该类的实例化函数"
         * @param {function} $super "父类引用"
         * @param {object} options "json参数对象"
         */
        initialize: function($super, options) {
        	var self = this;
            cloud.util.defaults(options, {
                datas: [],
                sorting : [],
                columns: null, //{title : sTitle, dataIndex : mData, defaultContent: sDefaultContent, cls: sClass, width : sWidth, render: mRender, sortable : bSortable, afterCellCreated : fnCreatedCell}
                autoWidth: false,
                pageToolBar: false,
                lengthChangeAble: false,
                pageSize: 15,
                rowCallBack: null, //(nRow, aData, iDisplayIndex, iDisplayIndexFull )
                checkbox : "none" // "none" | "multi" | "single"  , "full" will display with a check_box in title row and "rows" won't , "single" will allow users to select 1 row for most (0 is allowed)
                //checkAllEnabled : false //enabled only "checkable" equals true
            });
            
            this.moduleName = "table";
            $super(options);
            this.element.addClass("cloud-table");
            //this.datas = null;

            this.startNum = 0;
            this.limitNum = this.options.pageSize;
            this.pageNow = 0;
            this.total = null;
            //this.service = options.service;
            //this.businessType = this.service.type;
            //this.resourceType = this.service.getResourceType();
            
            this.selectedRows = $A();

            this.dataTable = null;
            this.elements = {
                table: this.id + "-table"
            };
            this.datas = [];
            //this._extendTypes();
            //this.selectedRows = {
            //		total:null,
            //		count:null,
            //		arr:null,
            // };
            //this.rowResourceData = null;
            //this.currentResources = {
            //		data:null,
            //		id:null,
            //		arr:null,
            //};

            this._render();
        },
        
        /**
         * render this component
         * @author QinJunwen
         * @name _render
         * @type {method}
         * @description "渲染组件"
         * @private
         * @return
         */
        _render: function() {
            this._draw();
            this.render();
            this._bindEvents();
            //this.get({_id:1});
        },

        /**
         * adapter to make options fit plugin
         * @author QinJunwen
         * @name _optionsAdapter
         * @type {method}
         * @description "插件配置适配器"
         * @param {object} options
         * @private
         * @return {object} pluginOpt
         */
        _optionsAdapter: function(options) {
            var self = this;
            var newColumns = null;
            this.unSortableIndexes = [];
            if (options.columns) {
                newColumns = [];
                if (options.checkbox != "none"){ //push a column at first for draw check_box
                	
                	newColumns.push({
                		stitle: "",
                        mData: null,
                        //sDefaultContent: "<input type='checkbox' class='table-input'/>",
                        sWidth: "30px",
                        bSortable: false,
                        sClass: "cloud-table-select-column"
                    });
                }
                $.each(options.columns, function(index, column) {
                    newColumns.push({
                        sTitle: column.title,
                        mData: column.dataIndex,
                        sDefaultContent: column.defaultContent,
                        sClass: column.cls,
                        sWidth: column.width,
                        mRender: column.render,
                        bSortable: column.sortable,
                        sType: column.type,
                        fnCreatedCell: column.afterCellCreated,
                        sLang: column.lang
                    });
                    if (column.sortable == false) {
                    	var unsortableIndex = index;
                    	if (options.checkbox != "none"){
                    		unsortableIndex = unsortableIndex + 1;
                    	}
                    	self.unSortableIndexes.push(unsortableIndex);
                    }
                });
                newColumns.push({
                	sTitle: "width-helper",
                    sClass: "hide"
                });
            }

            var pluginOpt = {
                "aaData": options.datas,
                "aaSorting" : options.sorting,
                "aoColumns": newColumns,
                "bAutoWidth": options.autoWidth,
                "bJQueryUI": false,
                "bPaginate": options.pageToolBar,
                "bFilter": false,
                "bInfo": false,
                "bLengthChange": options.lengthChangeAble,
                "iDisplayLength": options.pageSize,
                "fnRowCallback": function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    //draw check_box start
                    if (options.checkbox != "none"){ 
                    	
                    	if ($(nRow).data("checkbox")) {
                            return;
                        }
                        var checkbox = new Button({
                            checkbox: true,
                            disabled: false,
                            container: $(nRow).find("td").first(),
                            events: {
                                click: function(event, isSilent) {
                                	// if checkbox was defined to be single select and there're some row already been selected , end this callback;
                                	if (options.checkbox === "single" &&  self.selectedRows[0] != nRow){//self.selectedRows.length != 0 &&
                                		
                                		self.selectedRows[0] && $(self.selectedRows[0]).data("checkbox").unSelect();
                                		
                                		self.selectedRows.clear();
                                	}
                            		if (this.isSelected() == true){
                            			self.selectedRows.push(nRow);
                                	}else{
                                		self.selectedRows = self.selectedRows.without(nRow);
                                	}
                            		
                            		if (self.selectedRows.length > 0){
                            			self.enableSelectModel();
                            		}else{
                            			self.disableSelectModel();
                            		}
                            		
                            		if (options.checkbox === "full"){
                                		var selectedCount = self.selectedRows.length;
                                		var totalCount = self.getAllData().length;
                                		
                                		if (self.checkAllBox){
                                			var isSelectAllChecked = (selectedCount === totalCount) && (totalCount !== 0);
//                                			console.log(isSelectAllChecked, "checkAllBox");
                                			self.checkAllBox.setSelect((selectedCount === totalCount) && (totalCount !== 0));
                                		}
                                	}
                            		
                            		if (!(isSilent && isSilent == true)){
                            			self.fire("onRowCheck", 
                                			this.isSelected(),
                                    		nRow,
                                            aData,
                                            iDisplayIndex,
                                            iDisplayIndexFull);
                            		}
                                	
                                }
                            }
                        });
                        if (self.selectedRows.indexOf(nRow) != -1){
                        	checkbox.select();
                        }
                        
                        $(nRow).data("checkbox", checkbox);
                    }
                    
                    $(nRow).data("data", aData);

                    if (options.rowCallBack) {
                        options.rowCallBack(nRow, aData, iDisplayIndex, iDisplayIndexFull);
                    }

                    self.fire("onRowRendered",
                    nRow,
                    aData,
                    iDisplayIndex,
                    iDisplayIndexFull);
                },
                "fnDrawCallback": function( oSettings){
                	
        			if (options.drawCallback) {
                        options.drawCallback(oSettings);
                    }
        			if (self.selectedRows.length > 0){
            			self.enableSelectModel();
            		}else{
            			self.disableSelectModel();
            		}
        			
        			if (self.unSortableIndexes.length > 0){
        				$A(self.unSortableIndexes).each(function(index){
        					$(self.element.find("table tr th:eq(" + index + ")")).addClass("cloud-unsortable");//th add cloud-sortable
        					$(self.element.find("table tr")).each(function(){
        						$(this).find("td:eq(" + index + ")").addClass("cloud-unsortable");
        					})
        				})
        			}
                },
                "fnStateLoaded" : function(){
                    //self.disableSelectModel();
                }
                
                /*,
                "fnHeaderCallback" : function(nHead, aData, iStart, iEnd, aiDisplay){//
                	if (self.options.checkbox == "full" && (!$(nHead).data("checkbox"))){
                		
                		var checkbox = new Button({
                            checkbox: true,
                            disabled: false,
                            container: $(this).find("th").eq(0),
                            events: {
                                click: function() {
                                	if (this.isSelected() == true){
                                		self.selectAllRows();
                                	}else{
                                		self.unselectAllRows();
                                	}
                                	
                                    self.fire("onCheckAll", self.selectedRows);
                                }
                            }
                        });
                		$(nHead).data("checkbox", checkbox);
                	}
                }*/
            };
            var columnsLang = options.lang;
            return pluginOpt;
        },
        
        /**
         * draw this component
         * @author QinJunwen
         * @name _draw
         * @type {method}
         * @private
         * @description "绘制组件"
         * @return
         */
        _draw: function() {
            var self = this;

            var html = "<table id=" + this.elements.table + " class=" + this.elements.table + " style='float:left;table-layout:fixed;word-wrap:break-word;text-overflow: elipsis;overflow:hidden;'></table>";
            this.element.append(html);
            
            var options = self._optionsAdapter(self.options);
            
            var sLang = [];
            
            $.each(options.aoColumns,function(index,obj){
            	sLang.push(obj.sLang);
            });
            
            options.fnHeaderCallback = function( nHead, aData, iStart, iEnd, aiDisplay ) {
            	$.each(sLang,function(index,obj){
            		$(nHead).find('th').eq(index).attr("lang",obj);
            	});
            	if (self.options.checkbox == "full" && (!$(nHead).data("checkbox"))){
            		
            		var checkbox = new Button({
                        checkbox: true,
                        disabled: false,
                        container: $(this).find("th").eq(0),
                        events: {
                            click: function() {
                            	if (this.isSelected() == true){
                            		self.selectRows();
                            	}else{
                            		self.unSelectRows();
                            	}
                            	
                                self.fire("onCheckAll", self.selectedRows);
                            }
                        }
                    });
            		$(nHead).data("checkbox", checkbox);
            		self.checkAllBox = checkbox;
            	}
            };
            
            options.oLanguage = {"sEmptyTable": " "};
            
            self.dataTable = this.element.find("#" + self.elements.table).dataTable(options);
            console.log($.fn.dataTableSettings.length);
            self.dataTable.fnDraw();
        },
        
        /**
         * render the table by data
         * @author QinJunwen
         * @name render
         * @type {method}
         * @description "渲染表格数据"
         * @param {array} dataArr "数据数组"
         * @param {number} total "数据总数"
         * @return
         */
        render: function(dataArr, total) {
            var self = this;
            
            this.selectedRows.clear();
            
            (self.checkAllBox) && (self.checkAllBox.unSelect());
            
            self._cacheDatas(dataArr);
            
            var datas = dataArr || this.dataArr;

            var total = total || this.total;

            if (dataArr) {
                if (dataArr.length == 0) {
                    self._clearTableData();
                    self.element.find("table").children("tbody").children("tr").children("td").text(locale.get({lang:"no_data"}));
                } else {
                    self._clearTableData();
                    self.dataTable.fnAddData(dataArr);
                }
            }
            
            this.renderPageToolBar();
            var datas = self.getAllData();
            var settings = self.dataTable.fnSettings();
            this.fire("onLoad",
            //event : $.Event("onLoad"),
            datas,
            settings);
        },

        //TODO
        renderPageToolBar: function() {
            
        },
        
        /**
         * bind events to table
         * @author QinJunwen
         * @name _bindEvents
         * @type {method}
         * @description "绑定事件"
         * @private
         * @return
         */
        _bindEvents: function() {
            this._bindOnRowClick();
            
            //this._bindOnRowCheck();
            //_bindOnRowDelete();
        },
        
        /**
         * enable select model
         * @author QinJunwen
         * @name enableSelectModel
         * @type {method}
         * @description "允许行资源被选中"
         * @return
         */
        enableSelectModel : function(){
        	$A(this.getRows()).each(function(rowEl){
        		var checkbox = $(rowEl).data("checkbox");
        		if (checkbox){
        			checkbox.element.show();
        			$(rowEl).unbind('mouseenter mouseleave');
        		}
        		
        	})
        	
        },
        
        
        /**
         * disable select model
         * @author QinJunwen
         * @name disableSelectModel
         * @type {method}
         * @description "禁止行本选中"
         * @return
         */
        disableSelectModel : function(){
        	var self = this;
        	$A(self.getRows()).each(function(rowEl){
        		var checkbox = $(rowEl).data("checkbox");
        		if (checkbox){
        			checkbox.element.hide();
        			$(rowEl).hover(function(){
        				checkbox.element.show();
	        		}, function(){
	        			checkbox.element.hide();
	        		});
        			//$(rowEl).unbind("click", self._RowCheckByClick)
        		}
        	})
        },
        
        /**
         * @deprecated
         * @author QinJunwen
         * @name _RowCheckByClick
         * @type {method}
         * @description "行点击事件"
         * @private
         */
        _RowCheckByClick : function(){
        	var checkbox = $(this).data("checkbox");
    		checkbox.element.trigger("click");
        },
        
        /**
         * bind row click event
         * @author QinJunwen
         * @name _bindOnRowClick
         * @type {method}
         * @description "行点击事件"
         * @private
         * @return
         */
        _bindOnRowClick: function() {
            var self = this;
            self.dataTable.on("click", "tbody tr", function() {
            	
            	//switch to select model if row has been selected
            	if (self.selectedRows.length > 0){
            		var checkbox = $(this).data("checkbox");
            		checkbox.element.trigger("click");
            		//self.enableSelectModel();
            	}else{
            		//self.disableSelectModel();
            	};
            	
            	self.element.find(".cloud-table-shadow").removeClass("cloud-table-shadow");
            	$(this).addClass("cloud-table-shadow");
            	
                var aData = self.dataTable.fnGetData(this); // get datarow
                self.fire("onRowClick",
                aData,
                this);
            });

        },
        
        /**
         * get the row element which has been clicked
         * @author QinJunwen
         * @name getClickedRow
         * @type {method}
         * @description "获取被点击行的数据"
         * @return {object} row
         */
        getClickedRow :function (){
        	var row = this.element.find(".cloud-table-shadow");
        	if (row.length > 0){
        		return row;
        	}else {
        		return null;
        	}
        },
        
        /**
         * clear the css of clicked row
         * @author QinJunwen
         * @name clearClick
         * @type {method}
         * @description "清除行被选中状态"
         * @return
         */
        clearClick : function(){
        	this.element.find(".cloud-table-shadow").removeClass("cloud-table-shadow");
        },
        
        /**
         * select rows by given rows dom element
         * @author QinJunwen
         * @name selectRows
         * @type {method}
         * @description "选中多行"
         * @param {object} rows "行集合"
         * @return
         */
        selectRows : function (rows){
        	
        	var rowsArr = rows || this.getRows();
        	
        	$A(rowsArr).each(function(rowEl){
        		var checkbox = $(rowEl).data("checkbox");
        		if (checkbox && checkbox.isSelected() === false ){
        			checkbox.element.trigger("click", [true]);
        		}
        	})
        },
        
        /**
         * unselect rows by given rows dom element
         * @author QinJunwen
         * @name unSelectRows
         * @type {method}
         * @description "撤销多行选中"
         * @param {object} rows "行集合"
         * @return
         */
        unSelectRows : function (rows){
        	
        	var rowsArr = rows || this.getRows();
        	
        	$A(rowsArr).each(function(rowEl){
        		var checkbox = $(rowEl).data("checkbox");
        		if (checkbox && checkbox.isSelected() === true ){
        			checkbox.element.trigger("click", [true]);
        		}
        	})
        },
        
        /**
         * @deprecated
         * @author QinJunwen
         * @name unselectAllRows
         * @type {method}
         * @description "选择所有的行"
         */
        selectAllRows: function() {
            //this.getAllData().pluck("checkbox").select(function (checkbox) {
            //    return checkbox.isSelected() === false;
            //}).pluck("element").invoke("trigger", "click");
        	if (this.options.checkbox !== "single"){
        		//this.getRows().each(function(rowEl){
            	//	var checkbox = $(rowEl).data("checkbox");
            	//	if (checkbox && checkbox.isSelected() === false ){
            	//		checkbox.element.trigger("click", [true]);
            	//	}
            	//})
        		this.selectedRows(this.getRows());
        	}
        	
        },

        /**
         * @deprecated
         * @author QinJunwen
         * @name unselectAllRows
         * @type {method}
         * @description "反选所有的行"
         */
        unselectAllRows: function() {
            //this.getAllData().pluck("checkbox").select(function (checkbox) {
            //    return checkbox.isSelected() === true;
            //}).pluck("element").invoke("trigger", "click");
        	
        	if (this.options.checkbox !== "single"){
        		this.getRows().each(function(rowEl){
            		var checkbox = $(rowEl).data("checkbox");
            		if (checkbox && checkbox.isSelected() === true ){
            			checkbox.element.trigger("click", [true]);
            		}
            	})
        	}
        	
        },
        
        /**
         * get array of row element of selected rows
         * @author QinJunwen
         * @name getSelectedRows
         * @type {method}
         * @description "获取被选中行"
         * @returns {array} this.selectedRows
         */
        getSelectedRows : function(){
        	return this.selectedRows;
        },
        
        //_bindOnRowCheck : function(){
        //	self.element.find("tr.table-input")
        //},
        
        /**
         * get all data of this table
         * @author QinJunwen
         * @name getAllData
         * @type {method}
         * @description "获取表格所有数据"
         * @returns {array}
         */
        getAllData: function() {
            return this.dataTable.fnGetData();
        },
        
        /**
         * get data of one row by row element
         * @author QinJunwen
         * @name getData
         * @type {method}
         * @description "获取指定行"
         * @param  {object} rowEl "行元素"
         * @return {object} "数据对象"
         */
        getData: function(rowEl) {
            return this.dataTable.fnGetData(rowEl);
        },
        
        /**
         * get array of dom element of all rows 
         * @author QinJunwen
         * @name getRows
         * @type {method}
         * @description "获取所有行"
         * @return {array} rows
         */
        getRows: function() {
        	var rows = this.element.find("tbody tr").toArray();
            return rows;
        },
        
        /**
         * clear the table
         * @author QinJunwen
         * @name _clearTableData
         * @type {method}
         * @description "清除表格中所有数据"
         * @private
         * @return
         */
        _clearTableData: function() {
            var self = this;
            if ( !! self.dataTable) {
            	try{
            		self.dataTable.fnClearTable();
            	}catch (e) {
					console.log(e)
				}
                
            }
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
            var self = this;
            self.element && (self.element.removeClass("cloud-table"));
//            self.clearTableData();
            if ( !! self.dataTable) {
                try{
                    self.dataTable.fnDestroy(true);
                }catch(e){
                    
                }
            }

            this.options.datas = null;
            this.options.columns = null;
            this.options.autoWidth = null;
            this.options.pageToolBar = null;
            this.options.pageSize = null;
            this.options.rowCallBack = null;
            this.options.events = null;

            $super();
        },

        /**
         * add rows to table by given data
         * @author QinJunwen
         * @name add
         * @type {method}
         * @description "根据数据增加表格显示行数"
         * @param {array} datas "数据数组"
         * @return
         */
        add: function(datas) {
            var self = this;
            if(!datas || datas.length == 0){
            }
            self._cacheDatas(datas);
            self.dataTable.fnAddData(datas);
        },
        /**
         * @author QinJunwen
         * @name _cacheDatas
         * @type {method}
         * @description "缓存数据"
         * @param {object} data
         * @private
         * @return
         */
        _cacheDatas:function(data){
        	if(data && data.length > 0){
        		var self = this;
        		var thisDatas = self.datas;
        		if(thisDatas.length > 0){
        			if(thisDatas[0]["_id"] != data[0]["_id"]){
        				$.each(data,function(index,content){
        					self.datas.push(content);
        				});
        			}
        		}else{
        			$.each(data,function(index,content){
        				self.datas.push(content);
        			});
        		}
        	}
        },
        
        /**
         * update row by data and row element
         * @author QinJunwen
         * @name update
         * @type {method}
         * @description "更新指定行数据"
         * @param {object} data "更新的数据"
         * @param {object} row "更新的行"
         * @return
         */
        update: function(data, row) {
            //var row = this.getRowById(data._id);
            if (row) {
            	$(row).removeData("checkbox");
            	//this.selectedRows = this.selectedRows.without(nRow);
                this.dataTable.fnUpdate(data, row);
            }
        },

        /**
         * delete rows by row element
         * @author QinJunwen
         * @name delete
         * @type {method}
         * @description "删除指定行"
         * @param {array} rows "删除的行"
         * @param {function} callback "删除后的回调函数"
         * @return
         */
        "delete": function(rows, callback) {
            if ( !! rows) {
                var self = this;
                var rowArr = cloud.util.makeArray(rows);
                rowArr.each(function(row) {
                    self.dataTable.fnDeleteRow(row, callback);
                    self.selectedRows = self.selectedRows.without(row);
                });
            }
        },
        
        /**
         * get row element by id, enabled only if data of the row contains "_id"
         * @author QinJunwen
         * @name getRowById
         * @type {method}
         * @description "获取指定id的行"
         * @param {string} id "行id"
         * @return {array} "jQuery对象集合"
         */
        getRowById: function(id) {
            return $("#" + this.elements.table).find("tbody tr").toArray().find(function(tr) {
                var $tr = $(tr);
                var data = $tr.data("data");
                return id == data._id;
            });
        },
        
        /**
         * get ids of selected row
         * @author QinJunwen
         * @name getSelectedIds
         * @type {method}
         * @description "获取被选中行的id"
         * @return {array} "id数组"
         */
        getSelectedIds:function(){
        	var arr = [];
        	var $this,text;
        	$("#" + this.elements.table).find("span").each(function(){
        		$this = $(this);
        		if($this.hasClass("cloud-icon-active")){
        			$this.closest("td").siblings().each(function(){
        				$this = $(this);
        				if($this.hasClass("_id")){
        					id = $this.text();
        					arr.push(id);
        				}
        			});
        		}
        	});
        	return arr;
        },
        
        /**
         * get array of datas of selected rows
         * @author QinJunwen
         * @name getSelectedResources
         * @type {method}
         * @description "获取被选选中的行的数据"
         * @return {array} "数据对象的数组"
         */
        getSelectedResources:function(){
        	var self = this;
    		var thisDatas = self.datas;
        	var selectedIds = self.getSelectedIds();
        	var arr = [];
        	$.each(selectedIds,function(index,id){
        		$.each(thisDatas,function(index1,obj){
        			if(id == obj._id){
        				arr.push(obj);
        			}
        		});
        	});
        	return arr;
        },
        
        /**
         * get rows by key and value.
         * return rows element if data of the row contain the given key (param:prop), and value of this key equals to one of the given values(param:values)
         * @author QinJunwe
         * @name getRowsByProp
         * @type {method}
         * @description "根据键/属性对应关系获取行"
         * @param {string} prop "行的索引" 
         * @param {array} values
         * @return {array}  rows
         */
        getRowsByProp: function(prop, values) {
            var self = this;
            var valueArr = cloud.util.makeArray(values);
            //        	var rowsArr = $A();
            //        	valueArr.each(function(value){
            var rows = $("#" + self.elements.table).find("tbody tr").toArray().findAll(function(tr) {
                var $tr = $(tr);

                var data = $tr.data("data");
                return valueArr.indexOf(data[prop]) != -1;
                //                    return data[prop] == value;
            });
            //        		rowsArr.push(rows);
            //        	});
            return rows;
        },
        
        /**
         * clear table
         * @author QinJunwen
         * @name clearTableData
         * @type {method}
         * @description "清除表格的所有数据"
         * @return
         */
        clearTableData: function() {
            var self = this;
            try{
	            this.unSelectRows();
	            if ( !! self.dataTable) {
	                
	                	self.dataTable.fnClearTable();
	                
	            }
            }catch(e){
            	console.log(e);
            }
            self.datas = [];
        },
        
        /**
         * resizing this table
         * @author QinJunwen
         * @name refresh
         * @type {method}
         * @description "刷新表格数据"
         * @return
         */
        refresh: function() {
            this.dataTable.fnAdjustColumnSizing();
        }

    });

    return Table;

});