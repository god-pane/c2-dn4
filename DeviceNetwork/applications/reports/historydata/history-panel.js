define(function(require) {
	require("cloud/base/cloud");
	var Window = require("cloud/components/window");
	var html = require("text!./history-panel.html");
	var Table = require("cloud/components/table");
	var ContentChar = require("cloud/components/stockchart");
	var service = require("./service.js");
	
	var columns1 = [
		{
			//"title" : "设备名称",
			"title":locale.get({lang:"history_device_name"}),
			"dataIndex":"name",
			"cls":null,
			"width":"50%"
		},
		{
			//"title" : "设备型号",
			"title":locale.get({lang:"model"}),
			"dataIndex":"type",
			"cls":null,
			"width":"50%"
		}
	];
	
	var columns2 = [
		{
			//"title" : "变量名",
			"title":locale.get({lang:"history_device_var"}),
			"dataIndex":"varName",
			"cls":null,
			"width":"20%"
		},
		{
			//"title" : "变量类型",
			"title":locale.get({lang:"history_device_var_type"}),
			"dataIndex":"varType",
			"cls":null,
			"width":"20%"
		},
		{
			//"title" : "变量值",
			"title":locale.get({lang:"history_device_var_value"}),
			"dataIndex":"varvalue",
			"cls":null,
			"width":"25%"
		},
		{
			//"title" : "单位",
			"title":locale.get({lang:"history_device_var_units"}),
			"dataIndex":"units",
			"cls":null,
			"width":"15%"
		},
		{
			//"title" : "更新时间",
			"title":locale.get({lang:"history_device_update"}),
			"dataIndex":"update",
			"cls":null,
			"width":"20%"
		}
	];
	
	var varCacheList = $A();
	
	var varTypes = [
	    locale.get({lang: "var_BIT_0"}),
	    locale.get({lang: "var_WORD_1"}),
	    locale.get({lang: "var_DWORD_2"}),
	    locale.get({lang: "var_FLOAT_3"}),
	    locale.get({lang: "var_STRING_4"}),
	    locale.get({lang: "var_BYTE_5"}),
	    locale.get({lang: "var_BYTE_ARRAY_6"}),
	    locale.get({lang: "var_IPV4_4BYTE_7"}),
	    locale.get({lang: "var_NOW_SECONDS_8"}),
	    locale.get({lang: "var_NOW_MILLISECOND_9"}),
	    locale.get({lang: "var_INTEGER_10"}),
	    locale.get({lang: "var_PERCENTAGE_11"}),
	    locale.get({lang: "var_TIME_STRING_12"}),
	    locale.get({lang: "var_INTEGER_ARRAY_REFERENCE_13"}),
	    locale.get({lang: "var_SIGNED_INTEGER_14"}),
	    locale.get({lang: "var_UNSIGNED_INTEGER_15"}),
	    locale.get({lang: "var_MAC_16"}),
	    locale.get({lang: "var_IP_PORT_17"}),
	    locale.get({lang: "var_URL_STRING_18"})
	];
	
	var HistoryPanel = Class.create({
		initialize: function(options) {
			this.deviceId = options.deviceId;
			this.deviceName = options.deviceName;
			this._render();
		},
		_render: function() {
			this._renderWindow();
			this._renderTable();
			this._renderDataTable();
			this._renderChart();
			
			this._modelId = 0;
			this._deviceId = 0;
			this._name = "";
			
			//30 seconds refresh data
			this.loopThrid = window.setInterval(function() {
				this._refreshData(this._modelId, this._deviceId, this._name, "");
			}.bind(this), 5000);
		},
		addGroupVarline: function(deviceId, deviceName, varId, varName, color) {
			var self = this;
			var $varLineBox = $("#left-vargroup-box");
			if($varLineBox.find("#"+deviceId).children().length == 0) {
				$varLineBox.append("<div id="+deviceId+"></div>");
				var _deviceName = "";
				if(deviceName.length > 20) 
					_deviceName = deviceName.substring(0, 15)+"...";
				else 
					_deviceName = deviceName;
				
				$("<div>"+locale.get({lang:"device"})+
				"-"+_deviceName+"</div>").attr("title", deviceName).css({
					//"border": "1px solid red",
					"height": "25px",
					"font-size": "13px",
					"margin-left": "20px",
					"margin-top": "20px",
					"font-weight": "bold"
				}).appendTo($varLineBox.find("#"+deviceId));
			}
			var _varName = "";
			if(varName.length > 15)
				_varName = varName.substring(0, 12)+"...";
			else 
				_varName = varName;
			$("<div id="+varId+">" +
					"<div title='"+varName+"' text='varName' style='cursor:pointer;font-size:12px;float:left;color:#3C3C3C;'>"+_varName+"</div>" +
					"<div style='float:right;width:30px;height:5px;margin-top:7px;background-color:"+color+";'></div>" +
			  "</div>").css({
				  "height": "20px",
				  "width": "70%",
				  "margin-left": "30px",
			  }).appendTo($varLineBox.find("#"+deviceId))
			  .children().eq(0).attr("isHide", "false")
			  .next().css({
				  cursor: "pointer"
			  }).click(function() {
				  var $txt = $(this).prev();
				  if($txt.attr("isHide") == "false") {  //隐藏
					  $txt.attr("isHide", "true");
					  $txt.css("color", "#D0D0D0");
					  self.contentChar.hideSerie(varId);
				  }
				  else { //显示
					  $txt.attr("isHide", "false");
					  $txt.css("color", "#3C3C3C");
					  self.contentChar.showSerie(varId);
				  }
			  });
			$("#"+varId).children().eq(0).click(function() {
			  if($(this).attr("isHide") == "false") {  //隐藏
				  $(this).attr("isHide", "true");
				  $(this).css("color", "#D0D0D0");
				  self.contentChar.hideSerie(varId);
			  }
			  else { //显示
				  $(this).attr("isHide", "false");
				  $(this).css("color", "#3C3C3C");
				  self.contentChar.showSerie(varId);
			  }
			});
		},
		removeGroupVarline: function(deviceId, varId) {
			var $varLineBox = $("#left-vargroup-box");
			var $deviceBox = $varLineBox.find("#"+deviceId);
			$deviceBox.find("#"+varId).remove();
			if($deviceBox.children().length == 1) {
				$deviceBox.remove();
			}
		},
		_renderWindow: function() {
			this.windowHistory = new Window({
				container: "body",
				title: locale.get({lang:"history_data_title_preview"})+"["+this.deviceName+"]",
				top: "center",
				left: "center",
				width: 1200,
				height: 660,
				drag:true,
				mask: true,
				content: "<div id='history-panel-box'></div>",
				events: {
					"beforeClose": function() {
						varCacheList.clear();
						this.deviceTable.destroy();
						this.varTable.destroy();
						this.contentChar.destroy();
						this.windowHistory.destroy();
						window.clearInterval(this.loopThrid);
						//this.destroy();
					}.bind(this),
					"onClose": function() {
						//varCacheList.clear();
					}.bind(this),
					"onShow": function() {
						varCacheList.clear();
					}
				},
				scope: this
			});
			this.windowHistory.show();
			this.windowHistory.setContents(html);
			var $body=$('body');
			var $dataTable=$body.find(".history-data-table");
			$dataTable.css({
				//'width':'1194px',
				'height':'210px',				
			});
			var $leftTableBox=$body.find(".left-table-box");
			$leftTableBox.css({
				'border':'1px solid #E0E0E0',
				//'height':'210px',
				//'width':'360px','
				'height':'100%',
				'width':'30%',
				'float':'left',
				'overflow':'auto'
			});
			var $rightTableBox1=$body.find(".right-table-box-1");
			$rightTableBox1.css({
				'border':'1px solid #E0E0E0',
				//'height':'210px',
				//'width':'826px',
				'height':'100%',
				'width':'69%',
				'float':'right',
				'overflow':'auto'
			})
			var $rightTableBox=$body.find(".right-table-box");
			$rightTableBox.css({
				//'width':'826px',
//				'height':'210px',
				'width':'100%',
				'height':'100%',
				'overflow':'auto'
			})
			var $dataMap=$body.find(".history-data-map");
			$dataMap.css({
				'boder':'1px solid #E0E0E0',
				'height':'405px',
				//'width':'1194px',
				'margin-top':'10px'
			})
			var $vargroupBox=$body.find(".left-vargroup-box");
			$vargroupBox.css({
//				'width':'238px',
//				'height':'405px',
				'width':'20%',
				'height':'100%',
				'float':'left',
				'overflow':'auto'
			});
			var $dataCharBox=$body.find(".right-datachart-box");
			$dataCharBox.css({
//				'width':'942px',
//				'height':'405px',
				'width':'79%',
				'height':'100%',
				"float":'right'
			});
		},
		_renderTable: function() {
			this.deviceTable = new Table({
				selector:"#left-table-box",
				columns:[columns1].flatten(),
				datas:[],
				pageSize:100,
				autoWidth:false,
				pageToolBar:false,
				checkbox:"none",
				events:{
					onRowClick : function(dataRow) {
						this._modelId = dataRow.id;
						this._deviceId = dataRow.deviceId;
						this._name = dataRow.name;
						this._refreshData(this._modelId, this._deviceId, this._name, "");
                    },
                    scope: this
				}
			});
			this.varTable = new Table({
				selector:"#right-table-box",
				columns:[columns2].flatten(),
				datas:[],
				pageSize:100,
				autoWidth:false,
				pageToolBar:false,
				checkbox:"full",
				events:{
					onRowCheck: function(isChecked) {
						var row = arguments[2];
						if(isChecked) {
							varCacheList.push(row.varId);
							var times = this.contentChar.getStartAndEndTime();
							service.getVarDataHistory(
								times.startTime,
								times.endTime,
								row.vid,
								row.deviceId,
								function(data) {
									var historydata = null;
									try{
										historydata = $A(data.result[0].vars[0].values);
									}
									catch(e){
										historydata = $A();
									}
									//alert(historydata.flatten());
									historydata.reverse();
									var color = this._drawLine(
										row.varId, 
										row.varName, 
										historydata
									);
									this.addGroupVarline(
										row.deviceId, 
										row.deviceName, 
										row.varId, 
										row.varName, 
										color[0].color
									);
								}.bind(this)
							);
							
						}
						else {
							var index = varCacheList.indexOf(row.varId);
							varCacheList.splice(index, 1);
							this._removeLine(row.varId);
							this.removeGroupVarline(row.deviceId, row.varId);
						}
					}.bind(this)
				},
				scope: this
			});
			var spanCheckBox = $("#right-table-box").find(".cloud-button-item.cloud-button-checkbox-icon.cloud-button-img.cloud-icon-choice.cloud-icon-default");
			spanCheckBox.css("display", "none");
		},
		_renderDataTable: function() {
			
			service.getDeviceList(this.deviceId, function(data) {
				var result = data.result;
				var deviceList = [];
				for(var i = 0 ; i < result.length ; i++) {
					deviceList.push({
						id: result[i].modelId,
						deviceId: result[i]._id,
						name: result[i].name,
						type: result[i].model
					});
				}
				this.deviceTable.render(deviceList);
				if(deviceList.length <= 0) {
					return ;
				}
				this._modelId = deviceList[0].id;
				this._deviceId = deviceList[0].deviceId;
				this._name = deviceList[0].name;
				this._refreshData(this._modelId, this._deviceId, this._name);

			}.bind(this));
		},
		_refreshData: function(_modelId, _deviceId, _deviceName) {
			cloud.util.mask("#right-table-box-1");
			if(arguments.length <= 3) {
				this.deviceTable.getRows()[0].click();
			}
			service.getDeviceVarList(_modelId, function(data) {
				var varResults = data.result.varInfo;
				var varList = [], checkedList = [], varIds = [];
				for(var i = 0 ; i < varResults.length ; i++) {
					for(var j = 0 ; j < varResults[i].vars.length ; j++) {
						var _varId = _deviceId.toLocaleUpperCase()+"_"+varResults[i].vars[j]._id;
						varIds.push( varResults[i].vars[j]._id);
						varList.push({
							vid: varResults[i].vars[j]._id,
							varId: _varId,
							//deviceId: deviceList[0].deviceId,
							deviceId: _deviceId,
							//deviceName: deviceList[0].name,
							deviceName: _deviceName,
							varName: varResults[i].vars[j].name,
							varType: varTypes[parseInt(varResults[i].vars[j].vType)],
							//varvalue: varResults[i].vars[j].paramValue,
							units: varResults[i].vars[j].unit || "",
							//update: varResults[i].vars[j]._id || ""
							//update: cloud.util.dateFormat(new Date(data.result.updateTime), "yyyy-MM-dd hh:mm:ss")
						});
						for(var k = 0 ; k < varCacheList.length ; k++) {
							if(varCacheList[k] == _varId) {
								checkedList.push(_varId);
							}
						}
					}
				}
				var deviceVarIds = [{"deviceId": _deviceId, "varIds": varIds}];
				service.getDeviceVarRealTime(deviceVarIds, function(data) {
					var vars = data.result[0].vars;
					for(var j = 0 ; j < vars.length ; j++) {
						for(var k = 0 ; k < varList.length ; k++) {
//							console.log(varList[k].vid+":"+vars[j].id);
							if(varList[k].vid == vars[j].id) {
								varList[k].varvalue = vars[j].value || "";
								if(vars[j].unit && vars[j].unit != 'undefined') {
									varList[k].units = vars[j].unit;
								}
								else varList[k].units = "";
								if(vars[j].timestamp) {
									varList[k].update = cloud.util.dateFormat(
											new Date(vars[j].endTime), 
											"yyyy-MM-dd hh:mm:ss"
										);
//									console.log(varList[k].update);
								}									
								else 
									{
										varList[k].update = "";
									}								
							}
						}
					}
					
//					for(var i = 0 ; i < result.length ; i++) {
//						var vars = result[i].vars;
//						for(var j = 0 ; j < vars.length ; j++) {
//							for(var k = 0 ; k < varList.length ; k++) {
//								if(varList[k].vid == vars[j]._id) {
//									varList[k].varvalue = vars[j].value || "";
//									if(vars[j].unit && vars[j].unit != 'undefined') {
//										varList[k].units = vars[j].unit;
//									}
//									else varList[k].units = "";
//									if(vars[j].timestamp) 
//										varList[k].update = cloud.util.dateFormat(
//											new Date(vars[j].timestamp), 
//											"yyyy-MM-dd hh:mm:ss"
//										);
//									else 
//										varList[k].update = "";
//								}
//							}
//						}
//					}
					this.varTable.clearTableData();
					this.varTable.render(varList);
					for(var i = 0 ; i < checkedList.length ; i++) {
						var row = this.varTable.getRowsByProp("varId", checkedList[i]);
						this.varTable.selectRows(row);
					}
					cloud.util.unmask("#right-table-box-1");
				}.bind(this));
				
//				service.getDeviceVarRealTime(_deviceId, function(data) {
//					var result = data.result.varInfo;
//					for(var i = 0 ; i < result.length ; i++) {
//						var vars = result[i].vars;
//						for(var j = 0 ; j < vars.length ; j++) {
//							for(var k = 0 ; k < varList.length ; k++) {
//								if(varList[k].vid == vars[j]._id) {
//									varList[k].varvalue = vars[j].value || "";
//									if(vars[j].unit && vars[j].unit != 'undefined') {
//										varList[k].units = vars[j].unit;
//									}
//									else varList[k].units = "";
//									if(vars[j].timestamp) 
//										varList[k].update = cloud.util.dateFormat(
//											new Date(vars[j].timestamp), 
//											"yyyy-MM-dd hh:mm:ss"
//										);
//									else 
//										varList[k].update = "";
//								}
//							}
//						}
//					}
//					this.varTable.clearTableData();
//					this.varTable.render(varList);
//					for(var i = 0 ; i < checkedList.length ; i++) {
//						var row = this.varTable.getRowsByProp("varId", checkedList[i]);
//						this.varTable.selectRows(row);
//					}
//					cloud.util.unmask("#right-table-box-1");
//				}.bind(this));
			}.bind(this));
		},
		_drawLine: function(id, name, data) {
			data.each(function(key) {
				key[0] = parseFloat(key[0]) * 1000;
				key[1] = parseFloat(key[1]);
			});
			//获取时间
            //var times = this.contentChar.getStartAndEndTime();
            
            //var datas = this.genData(times.startTime, times.endTime);
            //alert(datas);
            //插入曲线
            return this.contentChar.addSeries([{
                id : id,
                name : name,
                data : data
            }]);
		},
		_removeLine: function(id) {
			this.contentChar.removeSeries(id);
		},
		_renderChart: function() {
			var self = this;
			this.contentChar = new ContentChar({
				container : "#right-datachart-box",
                intervals : [{
                    name : "24" + locale.get({lang:"_hours"}),
                    value : 24 * 3600
                },{
                    name : "7" + locale.get({lang:"_days"}),
                    value : 24 * 3600 * 7,
                    selected: true
                },{
                    name : "30" + locale.get({lang:"_days"}),
                    value : 24 * 3600 * 30,
                    
                },{
                    name : "1" + locale.get({lang:"year"}),
                    value : 360 * 24 * 3600
                     //设为默认选中
                }],
                chart : {
                    type : "spline",//"line", "spline"
                    //title : locale.get({lang:"history_data_title_preview"}),
                    title: "  ",
                    yAxis : {//非必须
                        //定制y轴刻度格式，非必须
                        formatter : function(){
                            if (!this.isLast){
                                return this.value;
                            }
                        }
                    }
                },
                events : {
                    //用户选择的时间变化 时触发此事件
                    "timesChange" : function(sT, eT, ids){
                    	var data = {
                    		devices:[]
                    	};
                    	if(Object.isArray(ids)) {
                    		$A(ids).each(function(idStr) {
                    			var unique = idStr.split("_");
                    			var len =  data.devices.length;
                    			if(len <= 0) {
                    				data.devices.push({
                    					varIds: [unique[1]],
                						deviceId: unique[0]
                    				});
                    			}
                    			for(var i = 0 ; i < len; i++) {
                    				if(unique[0] == data.devices[i].deviceId) {
                    					data.devices[i].varIds.push(unique[1]);
                    				}
                    				else {
                    					data.devices.push({
                    						varIds: [unique[1]],
                    						deviceId: unique[0]
                    					});
                    				}
                    			}
                    		});
                    		cloud.util.mask("#right-datachart-box");
                    		//update data of series here
                    		service.getVarListDataHistory(sT, eT, data, function(data) {
                    			cloud.util.unmask("#right-datachart-box");
                    			var result = data.result;
                    			$A(result).each(function(item) {
                    				
                    				for(var i = 0 ; i < item.vars.length ; i++) {
                    					var id = item.deviceId.toLocaleUpperCase()+"_"+item.vars[i].varId;
                    					var tempData = $A(item.vars[i].values);
                    					tempData.each(function(key) {
                    						key[0] = parseFloat(key[0]) * 1000;
                    						key[1] = parseFloat(key[1]);
                    					});
                    					//alert(tempData.length);
                    					tempData.reverse();
                    					self.contentChar.updateSeries(id, tempData);
                    				}
                    			});
//                    			var $varLineBox = $("#left-vargroup-box");
//                    			$varLineBox.find("[text='varName']").css({
//                    				color: '#3C3C3C'
//                    			}).attr("isHide", "false");
                    		});
                    	}
                    }
                }
			});
		},
		//制造伪数据
//        genData: function(startTime, endTime, pointCount){
//            if (!pointCount) {
//                pointCount = 40;//默认生成40个点
//            }
//            
//            var interval = (endTime - startTime) * 1000 / pointCount;
//            
//            var data = [];
//            for (var i = 0; i < (pointCount + 1); i++){
//                var time = startTime * 1000 + i * interval;
//                data.push([time, Math.floor(Math.random()*100)]);
//            }
//            return data;
//        }
	});
	
	return HistoryPanel;
});