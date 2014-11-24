define(function(require){
	require("cloud/base/cloud");
	
	require("cloud/lib/plugin/jquery-ui");
	require("cloud/lib/plugin/jquery.qtip");
	
	var Box = Class.create({
		initialize: function(ops) {
			var alarmConfig = permission.app("_alarm");
			if(!alarmConfig.read) {
				return ;
			}
			this.options = {
				container:"nav-main-left-app-notice",
				service: ops.service,
			};
			
			this._initState = true;
			this._dataList = $A();
			this._dataInfo = $A();
			this._qtipbox = null;
			this._content = null;
			this._infobox = null;
			this._cookePage = null;
			this._index = 0;
			
			//this._currentitem = null;
			//this._nextItem = null;
			
			
			//this._render();
			this._setOpenAlarm();
			this._refreshdData();
		},
		
		_setOpenAlarm: function() {
			var storage = window.localStorage;
			if(storage.getItem("noticeStatus") === "true") {}
			else if(storage.getItem("noticeStatus") === "false"){}
			else {
				storage.setItem("noticeStatus", true);
			}
		},
		
		_refreshdData: function() {
			var cnt=0, self = this;
			var storage = window.localStorage;
			//storage.setItem("noticeStatus", true);
			function getNewAlarms() {
				cnt++;
				this.options.service.getAlarmstop10({
					levelArr: [1, 2, 3, 4, 5],
					statusArr: [1],
				}, function(data) {
					//this._dataList._total = data.total;
					//this._dataList._noalarm = data.result.length;
					this._dataList._total = data._total;
					this._dataList._noalarm = data.total;
					this._dataList.clear();
					var len = 0;
					if(data.result.length >= 20) {
						len = 20;
					}
					else {
						len = this._dataList._noalarm;
					}
					for(var i = 0 ; i < len ; i++) {
						this._dataList.push({
							id: data.result[i]._id,
							time: data.result[i].timestamp,
							site: data.result[i].siteName,
							source: data.result[i].sourceName,
							desc: data.result[i].desc,
						});
					}
					
					if(this._cookePage) {
						if(this._dataList._noalarm <= 0) {
							this._cookePage.css("display", "none");
						}
						else if(this._dataList._noalarm > 99) {
							this._cookePage.css("display", "block");
							this._cookePage.html("99+");
						}
						else {
							this._cookePage.css("display", "block");
							this._cookePage.html(this._dataList._noalarm);
						}
					}
					
					if(this._dataList._noalarm > 0){
						
						if(this._initState) {
							this._render();
							this._initState = false;
						}
						//if(true){
						if(storage.getItem("noticeStatus") === "true") {
							if(data.total > self._index) {
								this._qtipbox.qtip("show");
								$("#alarm-notice-small-text-no").html(locale.get({lang: "not_affirmed_alarm"})+"（"+this._dataList._noalarm+"/"+this._dataList._total+"）");
								$("#alarm-notice-small-box").get(0).checked = false;
								this._addRecrods(this._dataList, this._infobox);
								if($("#alarm-notice-small-box").get(0).checked){
									storage.setItem("noticeStatus", false);
								}
							}
						}
						else{
							this._qtipbox.qtip("hide");
						}
					}
					//console.log(cnt);
					self._index = parseInt(data.total);
				}.bind(this));
			}
			
			getNewAlarms.call(this);
			var self = this;
			setInterval(function(){
				getNewAlarms.call(self);
			}, 5000);
			
//			this.options.service.getAlarmstop10({
//				levelArr: [1, 2, 3, 4, 5],
//				statusArr: [1],
//			}, function(data) {
//				
//			});
		},
		
		_render: function() {
			this._drawHTML();
			this._qtipbox = $("#nav-main-left-app-notice").qtip({
				content: {
		            text: this._content,
		            title: {
		               text: '<div id="alarm-notice-small-text-no" style="color:green;">未处理告警（'+this._dataList._noalarm+'/'+this._dataList._total+'）</div>',
		               button: 'Close' // Show a close link in the title
		            }
                },
                position: {
                    my: "top left",
                    at: "bottom center",
                },
                hide: {
                	event: "click",
                },
                show: {
                	//solo: false,
                	ready: false,
                	event: "unclick",
                },
                style: {
                	width: "550px",
                    classes: "qtip-shadow qtip-light",
                },
			});
		},
		
		
		_drawHTML: function() {
			this._cookePage = $("<div></div>").css({
				border: "1px solid green",
				"background-color": "green",
				"border-radius": "3px",
				width: "24px",
				height: "16px",
				"font-size": "10px",
				position: "absolute",
				//"font-weight": "bold",
				color: "white",
				left: "53px",
				top: "3px",
				"z-index": 10,
				"text-align": "center",
				"line-height": "16px",
			}).attr("id", "alarm-module-no-alarm-sum");
			this._cookePage.appendTo($("#nav-main-left-app-notice").css("position", "relative"));
			if(this._dataList._noalarm <= 0) {
				this._cookePage.css("display", "none");
			}
			else if(this._dataList._noalarm > 99) {
				this._cookePage.css("display", "block");
				this._cookePage.html("99+");
			}
			else {
				this._cookePage.css("display", "block");
				this._cookePage.html(this._dataList._noalarm);
			}
			
			
			this._content = $("<div></div>");
			this._content.css({
				width: "100%",
				//border: "1px solid red",
			});
			
			$("<div></div>").css({
				width: "100%",
				height: "20px",
				"font-size": "11px",
				"color": "black",
				"font-weight": "bold",
				"background-color": "#F0F0F0",
			}).append("<div style='line-height:20px;display:inline-block;height:100%;width:30%'>"+locale.get({lang: "time"})+"</div>" +
					  "<div style='line-height:20px;display:inline-block;height:100%;width:20%'>"+locale.get({lang: "site"})+"</div>" +
					  "<div style='line-height:20px;display:inline-block;height:100%;width:17%'>"+locale.get({lang: "device"})+"</div>" +
					  "<div style='line-height:20px;display:inline-block;height:100%;width:17%'>"+locale.get({lang: "description"})+"</div>" +
					  "<div style='line-height:20px;display:inline-block;height:100%;width:auto'>"+locale.get({lang: "operate"})+"</div>").appendTo(this._content);
			
			this._infobox = $("<div></div>");
			this._infobox.css({
				width: "100%",
				height: "120px",
				margin: "auto",
				position: "relative",
				border: "0px solid #D0D0D0",
				overflow: "auto",
			});
			this._content.append(this._infobox);
			
			//填充数据
			this._addRecrods(this._dataList, this._infobox);
			
			
			
//			this._currentitem = $("<div></div>");
//			this._currentitem.css({
//				width: "100%",
//				height: "80px",
//				position: "absolute",
//				"z-index": 1,
//				left: "0px",
//				top: "0px",
//				//"background-color": "black",
//				
//			});
//			this._infobox.append(this._currentitem);
//			this._addRecrods([this._dataList[0], this._dataList[1]], this._currentitem);
			
//			this._nextItem = $("<div></div>");
//			this._nextItem.css({
//				width: "100%",
//				height: "80px",
//				position: "absolute",
//				"z-index": 1,
//				left: "0px",
//				top: "80px",
//			});
//			this._infobox.append(this._nextItem);
			
			var bar = $("<div></div>").css({
				width: "100%",
				height: "20px",
				"margin-top": "5px",
				//border: "1px solid blue",
			});
			this._content.append(bar);
			
			var suona = $("<div></div>").css({
				border: "0px solid red",
				width: "14px",
				height: "14px",
				"margin-top": "5px",
				"background-image": "url('notice/alarm/table/imgs/piiii.png')",
				float:"left",
				//border: "1px solid red",
			});
			bar.append(suona);
			
			var tempdiv = $("<div></div>").css({
				float: "right",
				//width: "70px",
				width: "auto",
				height: "100%",
				//border: "1px solid red"
			});
			bar.append(tempdiv);
			
			var infobox = $("<div></div>").css({
				float: "left",
				width: "68%",
				height: "100%",
				//border: "1px solid blue",
				position: "relative",
				overflow: "hidden",
			});
			bar.append(infobox);
			
			var current = $("<div></div>").css({
					width: "100%",
					height: "100%",
					position: "absolute",
					left: "0px",
					top: "0px",
					"font-size": "12px",
					"line-height": "20px",
				}),
				next = $("<div></div>").css({
					width: "100%",
					height: "100%",
					position: "absolute",
					left: "0px",
					top: "20px",
					overflow: "hidden",
					"font-size": "12px",
					"line-height": "20px",
				});
			infobox.append(current);
			infobox.append(next);
			
			window.setInterval(function() {
				var item = this._dataInfo.shift();
				if(item) {
					current.animate({
						top: "-=20"
					}, 600, function() {});
					
					var titleText = item.replace(/<[^>]+>/g, "");
					next.attr("title", titleText).html(item).animate({
						top: "-=20"
					}, 600, function() {
						current.css("top", "20px");
						var temp = current;
						current = next;
						next = temp;
					});
				}
			}.bind(this), 1500);
			
			tempdiv.append($("<input id='alarm-notice-small-box' type='checkbox'>").on("click", function() {
				var storage = window.localStorage;
				if($(this).attr("checked")) {
					storage.setItem("noticeStatus", false);
					//alert(storage.getItem("noticeStatus"));
					$(".notification_dialog").find("span").eq(0).removeClass("cloud-icon-active").addClass("cloud-icon-default");
				}else {
					storage.setItem("noticeStatus", true);
					$(".notification_dialog").find("span").eq(0).removeClass("cloud-icon-default").addClass("cloud-icon-active");
				}
			}).css({
				float: "left",
				"margin-top": "5px",
			}));
			tempdiv.append($("<label for='alarm-notice-small-box'>"+locale.get({lang: "No_longer_remind"})+"</label>").css({
				float: "left",
				"margin-left": "5px",
				"margin-top": "4px",
			}));
			
		},
		
		_addRecrods: function(two, itembox) {
			itembox.empty();
			itembox.html("");
			$("<table></table>");
			var self = this;
			for(var i = 0 ; i < two.length ; i++) {
				var color = "";
				if((i+1) % 2 == 0) {
					color = "#FBFFFD";
				}
				else {
					color = "#F0FFF0";
				}
				var item = $("<div></div>").css({
					width:"100%",
					height: "20px",
					"font-size": "12px",
					"line-height": "20px",
					color: "black",
					"text-align": "left",
					"background-color": color,
				});
				
				var time = cloud.util.dateFormat(new Date(two[i].time), "yyyy-MM-dd hh:mm:ss");
				item.append($("<div></div>").attr("title", time).css({
					//display: "inline-block",
					float: "left",
					width:"30%",
					height: "100%",
					overflow: "hidden",
					"line-height": "20px",
				}).html(time));
				
				var siteName = "";
				if(two[i].site && two[i].site.length > 7){
					siteName = two[i].site.substring(0, 4)+"...";
				}
				else {
					siteName = two[i].site;
				}
				item.append($("<div></div>").attr("title", two[i].site).css({
					//display: "inline-block",
					float: "left",
					width:"20%",
					height: "100%",
					overflow: "hidden",
					"line-height": "20px",
				}).html(siteName));
				
				var source = "";
				if(two[i].source && two[i].source.length > 7){
					source = two[i].source.substring(0, 4)+"...";
				}
				else {
					source = two[i].source;
				}
				item.append($("<div></div>").attr("title", two[i].source).css({
					//display: "inline-block",
					float: "left",
					width:"17%",
					height: "100%",
					overflow: "hidden",
					"line-height": "20px",
				}).html(source));
				
				//var discription = /^\[?$/
				var desc = "";
				if(two[i].desc && two[i].desc.length > 9){
					desc = two[i].desc.substring(0, 6)+"...";
				}
				else {
					desc = two[i].desc;
				}
				item.append($("<div></div>").attr("title", two[i].desc).css({
					//display: "inline-block",
					float: "left",
					width:"17%",
					height: "100%",
					overflow: "hidden",
					"line-height": "20px",
				}).html(desc));
				
				var operate = item.append($("<div></div>").css({
					//display: "inline-block",
					float: "left",
					//width:"13%",
					height: "100%",
					//overflow: "hidden",
					"line-height": "20px",
					//"border": "1px solid red",
				})).attr("_data", Object.toJSON(two[i]));
				
				var alarmConfig = permission.app("_alarm");
				var affirmBtn = "<a src='#'>";
				if(!alarmConfig.write) {
					affirmBtn = "<a src='#' style='color:#D0D0D0'>";
				}
				operate.append($(affirmBtn+locale.get({lang: "_affirm"})+"</a>").click(function() {
					if(!alarmConfig.write) {
						return ;
					}
					var data = $(this).parent().attr("_data").evalJSON();
					var ids = $A();
					ids.push(data.id);
					self.options.service.batchSure(ids, function(result) {
						self.options.service.getAlarmstop10({
							levelArr: [1, 2, 3, 4, 5],
							statusArr: [1],
						}, function(data) {
							self._index = parseInt(data.total);
						});
						
						var _data =  result.result;
						if(_data._id) {
							//$(this).attr("src", "").css("color", "#D0D0D0").unbind("click");
							//$(this).next().attr("src", "").css("color", "#D0D0D0").unbind("click");
							//成都
							$(this).parent().remove();
							self._dataInfo.push("<span>"+data.source+"▶"+data.desc+"▶</span><span style='color:green'>"+locale.get({lang: "affirm_successful"})+"</span>");
						}
						else {
							//失败
							self._dataInfo.push("<span>"+data.source+"▶"+data.desc+"▶></span><span style='color:red'>"+locale.get({lang: "affirm_failed"})+"</span>");
						}
					}.bind(this));//→→→→▶
				}));
				operate.append($(affirmBtn+locale.get({lang: "_clear"})+"</a>").css("margin-left", "5px").click(function() {
					if(!alarmConfig.write) {
						return ;
					}
					var data = $(this).parent().attr("_data").evalJSON();
					var ids = $A();
					ids.push(data.id);
					self.options.service.batchClear(ids, function(result) {
						self.options.service.getAlarmstop10({
							levelArr: [1, 2, 3, 4, 5],
							statusArr: [1],
						}, function(data) {
							self._index = parseInt(data.total);
						});
						
						var _data =  result.result;
						if(_data._id) {
							//$(this).attr("src", "").css("color", "#D0D0D0").unbind("click");
							//$(this).prev().attr("src", "").css("color", "#D0D0D0").unbind("click");
							$(this).parent().remove();
							//成都
							self._dataInfo.push("<span>"+data.source+"▶"+data.desc+"▶</span><span style='color:green'>"+locale.get({lang: "clear_successful"})+"</span>");
						}
						else {
							//失败
							self._dataInfo.push("<span>"+data.source+"▶"+data.desc+"▶</span><span style='color:red'>"+locale.get({lang: "clear_failed"})+"</span>");
						}
					}.bind(this));
				}));
				
				itembox.append(item);
			}
			
		}
	});
	return Box;
});