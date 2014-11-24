define(function(require) {
	
	require("dt/core/dt");
	require("./resources/css/table.css");
	
	var Table = Class.create({
		initialize: function(options) {
			this.options = options;
			this.currentSelect = null;
			this.rows = [];
			this.currentColor = "";
			this._render();
		},
		_render: function() {
			this._drawTile();
			this._drawContent();
		},
		_drawTile: function() {
			var self = this;
			var divTitile = $("<div></div>").css({
				width:"100%",
				height:"30px",
				"background-color": "#E0E0E0"
			});
			var len = this.options.columns.length,
				columns = this.options.columns,
				index = 0, isCheck = false;
			if(this.options.checkbox) {
				index = 1;
				isCheck = true;
				$("<div></div>").attr("_index", 0).addClass("title-column")
				.css("padding-left", "0px").appendTo(divTitile);
			}
			for(var i = 0 ; i < len ; i++) {
				var _width = this._convert(columns[i].width, isCheck);
				$("<div></div>").attr("_index", i+index).addClass("title-column")
				.css("width", (_width-10)+"px").attr("sort", "0").click(function() {
					//if(parseInt($(this).attr("_index")) > 0) {
						var title = $(this).html(),
						len = title.length;
						if($(this).attr("sort") === "1") {
							$(this).attr("sort", "0");
							title = title.substring(0, len-1)+"▼";
							$(this).html(title);
							self._bubbleSort(parseInt($(this).attr("_index")), 0);
						}
						else {
							$(this).attr("sort", "1");
							title = title.substring(0, len-1)+"▲";
							$(this).html(title);
							self._bubbleSort(parseInt($(this).attr("_index")), 1);
						}
					//}
					
				}).html(columns[i].title+"▼").appendTo(divTitile);
			}
			divTitile.appendTo($(this.options.selector));
		},
		_drawContent: function() {
			var box = $(this.options.selector),
				len = this.options.columns.length;
			this.contentbox = $("<div></div>").css({
				width:"100%",
				height: (box.height()-30)+"px",
				"overflow-x": "hidden",
				"overflow-y": "auto",
				"text-align": "center"
			}).appendTo(box);
			this.loadData(this.options.data);
		},
		_initEvent: function(tr) {
			var self = this;
			tr.click(function() {
				//alert(tr._userData.siteName);
				if(self.currentSelect) {
					self.currentSelect.css("background-color", self.currentColor);
				}
				
				self.currentColor = tr.css("background-color");
				tr.css("background-color", "#B7FAB7");
				self.currentSelect = tr;
				
				var evt = self.options.events;
				if(evt) {
					evt.onRowClick && evt.onRowClick(tr._userData);
				}
			});
		},
		_sort: function(array, low, high, property) {
			var key = array[low][property],
				objKey = array[low];
			while (low < high)
			{                
				while (array[high][property] >= key && high > low)
					--high;                         
				array[low] = array[high];           
				while (array[low][property] <= key && high > low)
					++low;                             
				array[high] = array[low];
			}                                           
			array[low] = objKey;
			return high;
		},
		_qksort: function(array, low, high, property) {
			if (low >= high) return;                           
			var index = this._sort(array, low, high, property);             
			this._qksort(array, low, index - 1, property);                       
			this._qksort(array, index + 1, high, property);
		}, 
		_quickSort: function(index, order) {
			var columns = Array(), 
				rows = this.contentbox.find("tr"),
				len = rows.length;
			for(var i = 0 ; i < len ; i++) {
				var cellText = rows.eq(i).find("td").eq(index).html();
				columns.push({
					index: i, 
					text: cellText
				});
			}
			this._qksort(columns, 0, columns.length, "text");
			var str = "";
			for(var i = 0 ; i < columns.length ; i++) {
				str += "--"+columns[i].text;
			}
			alert(str);
		},
		_bubbleSort: function(index, order) {
			//this._quickSort(index, order);
			//return ;
//			var len = this.contentbox.find("tr").length;
//			for(var i = 0 ; i < len ; i++) {
//				for(var j = 0 ; j < len-i ; j++) {
//					var rows = this.contentbox.find("tr"),
//						first = rows.eq(j).children().eq(index).html(),
//						next = rows.eq(j+1).children().eq(index).html();
//					if(order === 0) {
//						if(first < next) {
//							rows.eq(j).before(rows.eq(j+1));
//						}
//					}
//					else if(order === 1) {
//						if(first > next) {
//							rows.eq(j).before(rows.eq(j+1));
//						}
//					}
//				}
//			}
			
			var columns = Array(), 
				rows = this.contentbox.find("tr"),
				len = rows.length;
			for(var i = 0 ; i < len ; i++) {
				var cellText = rows.eq(i).find("td").eq(index).html();
				columns.push({
					index: i, 
					text: cellText
				});
			}
			for(var i = 0 ; i < len ; i++) {
				for(var j = 0 ; j < len-i-1 ; j++) {
					if(order == 1) {
						if(columns[j].text > columns[j+1].text) {
							var temp = columns[j];
							columns[j] = columns[j+1];
							columns[j+1] = temp;
						}
					}
					else if(order == 0) {
						if(columns[j].text < columns[j+1].text) {
							var temp = columns[j];
							columns[j] = columns[j+1];
							columns[j+1] = temp;
						}
					}
				}
			}
			var lastRows = this.contentbox.find("tr");
			for(var i = 0  ; i < columns.length ; i++) {
				var rows = this.contentbox.find("tr");
				if(rows.eq(i).attr("index") 
						!= lastRows.eq(columns[i].index).attr("index")) {
					rows.eq(i).before(lastRows.eq(columns[i].index));
				}
			}
			
			this._setbgColor();
		},
		_setbgColor: function() {
			
			var rows = this.contentbox.find("tr"),
				len = rows.length;
			for(var i = 0 ; i < len ; i++) {
				if(this.currentSelect && rows.eq(i).css("background-color") 
						=== this.currentSelect.css("background-color")) {
					if(i % 2 == 0)
						this.currentColor = "#FCFCFC";
					else 
						this.currentColor = "#F3F3F3";
					continue ;
				}
				else if(i % 2 == 0)
					rows.eq(i).css("background-color", "#FCFCFC");
				else 
					rows.eq(i).css("background-color", "#F3F3F3"); // #F0F0F0
					
			}
		},
		_convert: function(value, isCheckbox) {
			var txt = value+"";
			if(txt.indexOf("%") > -1) {
				var number = parseInt(txt.substring(0, txt.length-1)) / 100;
				if(isCheckbox)
					number = ($(this.options.selector).width()-30) * number;
				else 
					number = $(this.options.selector).width() * number;
				return number;
			}
			else {
				return parseInt(txt);
			}
		},
		getSelectedRowsData: function() {
			if(!this.rows) {
				return [];
			}
			var len = this.rows.length;
			var list = [];
			for(var i = 0 ; i < len ; i++) {
				if(this.rows[i].find("input:checked").length > 0) {
					list.push(this.rows[i]._userData.siteName);
				}
			}
			return list;
		},
		getJqueryRows: function() {
			if(this.table) {
				return this.table.find("tr"); 
			}
			return [];
		},
		loadData: function(data) {
			this._data_ = data;
			if($.isArray(data)) {
				if(data.length <= 0) {
					this.contentbox.html("<br/>"+this.options.mark);
					return ;
				}
				this.rows = [];
				this.currentSelect = null;
				this.currentColor = "";
				var columns = this.options.columns;
				var len = columns.length;
				this.table = $("<table cellSpacing='0' ></table>").css({
					width: "100%",
					"font-size": "12px",
					"table-layout": "fixed"
				});
				
				for(var i = 0 ; i < data.length ; i++) {
					var tr = $("<tr></tr>").attr("_siteId", data[i]._id).addClass("table-rows").attr("index", i),
						isCheck = false;
					tr._userData = data[i];
					if(this.options.checkbox) {
						$("<td></td>").addClass("checkbox-column")
						.append($("<input type='checkbox' />").click(function(event) {
							event.stopPropagation();
						})).appendTo(tr);
						isCheck = true;
					}
					for(var j = 0 ; j < len ; j++) {
						var _width = this._convert(columns[j].width, isCheck);
						var cell = $("<td></td>").addClass("context-column")
						.css("width", (_width-20)+"px").attr("width", (_width-20)+"px")
						.appendTo(tr);
						if(columns[j].render) {
							var text = columns[j].render(data[i][columns[j].dataIndex]);
							cell.html(text);
						}
						else {
							cell.html(data[i][columns[j].dataIndex]);
						}
					}
					this._initEvent(tr);
					this.rows.push(tr);
					this.table.append(tr);
					
				}
				this.table.appendTo(this.contentbox);
				this._setbgColor();
				//this.table.appendTo(this.contentbox);
			}
		},
		getData: function() {
			return this._data_;
		},
		clearData: function() {
			//this.table.empty();
			//this.table.html("");
			this.talbe = null;
			this.contentbox.empty();
			this.contentbox.html("");
			//this.rows.splice(0, this.rows.length-1);
			this.rows = null;
		}
	});
	
	return Table;
	
});