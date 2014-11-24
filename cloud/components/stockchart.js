/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved
 * @author qinjunwen
 * @filename stockchart 
 * @filetype {class}
 * @filedescription "对图表chart的的再次封装"
 * @filereturn {function} StockChart "函数引用"
 */
define(function(require) {
    var cloud = require("cloud/base/cloud");
    require("cloud/lib/plugin/jquery.layout");
    var Button = require("cloud/components/button");
    var Chart = require("cloud/components/chart");
    require("cloud/lib/plugin/jquery-ui");
    require("cloud/resources/css/jquery-ui.css");
    require("./stockchart.css");
    require("cloud/lib/plugin/jquery.multiselect");
//    var html = require("text!./content-chart.html");
    
    var StockChart = Class.create(cloud.Component, {
        
        /**
         * init this component
         * @author QinJunwen
         * @name initialize
         * @type {function}
         * @description "该类的实例化函数"
         * @param {function} $super "父类引用"
         * @param {object} options "json参数对象"
         * @return
         */
        initialize: function($super, options) {
            this.moduleName = "content-chart";
            cloud.util.defaults(options, {
            	fixedAxis : false,
            	chart : {
            		type : "line",//"line", "spline", "column"
            		title : "title",
            		tooltips : {
            			formatter : null,
            			prefix : "",
            			subfix : ""
            		},
            		xAxis : {
            			title : "xAxis",
            			formatter : null
            		},
            		yAxis : {
            			"title" : "yAxis",
            			formatter : null,
            			unit : ""
            		}
            	}
			});
            $super(options);
            this.elements = {
            	content : this.id + "-content", 
                toolbar: this.id + "-toolbar",
                chart: this.id + "-chart"
            };
            this.seriesArr = $A();
            
            this.seriesHash = $H();
            
            this.draw();
            
            this._initParams();
        },
        
        /**
         * draw this component
         * @author QinJunwen
         * @name draw
         * @type {method}
         * @description "绘制插件"
         * @return
         */
        draw : function(){
        	this._drawHtml();
        	this._initSize();
        	this._drawToolbar();
        	this._drawContent();
        },
        
        /**
         * initialize the interval/ startTime / endTime
         * @author QinJunwen
         * @name _initParams
         * @type {method}
         * @description "初始化数据"
         * @private
         * @return
         */
        _initParams : function(){
            var timeNow = Math.round((new Date)/1000);
            var selectorVal = this._getSelectorValue();
            var defaultTime = (timeNow - selectorVal/2) * 1000;
            this.datePicker.datepicker( "setDate", new Date());
            /*this.dateVal = this._getDatepickerValue();
            this.startTime = */
            this._handleTimeChange(true)
        },
        
        /**
         * draw html content of this component
         * @author QinJunwen
         * @name _drawHtml
         * @type {method}
         * @description "绘制dom结构"
         * @private
         * @return
         */
        _drawHtml: function() {
            var html = "<div id=" + this.elements.content + " class='content-chart-content' style='height : 100%; width:100%'>" +
            	"<div id=" + this.elements.toolbar + " class='content-chart-toolbar'></div>" +
                "<div id=" + this.elements.chart + " class='content-chart-chartplugin'></div>" +
                "</div>";
            this.element.css({
            	width : "100%",
            	height : "100%",
            	overflow : "hidden"
            })
            
            this.element.append(html);
//            console.log($("#" + this.elements.toolbar).height());
//            console.log($("#" + this.elements.chart).height());
//            console.log(this.element.height())
        },
        /**
         * @author QinJunwen
         * @name _initSize
         * @type {method}
         * @description "初始化组件大小"
         * @private
         * @return
         */
        _initSize : function(){
            var toolbarHeight = $("#" + this.elements.toolbar).height();
            var totalHeight = this.element.height();
            var chartHeight = totalHeight - toolbarHeight;
            
            $("#" + this.elements.chart).height(chartHeight);
        },
        
        /**
         * draw interval toolbar
         * @author QinJunwen 
         * @name _drawToolbar
         * @type {method}
         * @description "绘制工具栏"
         * @private
         * @return
         */
        _drawToolbar : function(){
        	var self = this;
        	this.toolbar = $("#" + this.elements.toolbar);
        	
        	var panelLeft = $("<span>").addClass("content-chart-toolbar-panel-left").appendTo(this.toolbar);
        	var panelRight = $("<span>").addClass("content-chart-toolbar-panel").appendTo(this.toolbar);
        	var rightContent = $("<span>").attr("id", this.id + "-tbpannel-center").addClass("content-chart-toolbar-panel-center").appendTo(panelRight);
        	
        	this.drawDatePicker(panelLeft);
        	
        	this.intervals = $A(this.options.intervals);
    		this.drawSelector(this.intervals, rightContent)
        },
        
        /**
         * @author QinJunwen
         * @name drawDatePicker
         * @type {method}
         * @description "绘制日期选择框"
         * @param {object} container "jquery对象"
         * @return
         */
        drawDatePicker : function(container){
            var self = this;
            var inputHtml = "<input  class='content-chart-toolbar-datepicker datepicker' type='text' readonly='readonly' id='datepicker' />";
            
            container.append(inputHtml);
            this.datePicker = $("#datepicker").datepicker({
                showOn: "button",
                buttonImage: require.toUrl("cloud/resources/images/calendar.gif"),
                buttonImageOnly: true,
                changeMonth: true,
                changeYear: true,
                dateFormat:"yy/mm/dd",
                dayNamesMin: [
                      locale.get({lang:"sun"}) || "Su",
                      locale.get({lang:"mon"}) || "Mon",
                      locale.get({lang:"tues"}) || "Tu", 
                      locale.get({lang:"wed"}) || "WED", 
                      locale.get({lang:"thur"}) || "TH",
                      locale.get({lang:"fri"}) || "FRI",
                      locale.get({lang:"sat"}) || "SA"
                ],
                monthNamesShort: [
                      locale.get({lang:"jan"}) || "jan", 
                      locale.get({lang:"feb"}) || "feb",
                      locale.get({lang:"mar"}) || "mar",
                      locale.get({lang:"apr"}) || "apr", 
                      locale.get({lang:"may"}) || "may", 
                      locale.get({lang:"jun"}) || "jun", 
                      locale.get({lang:"jul"}) || "jul", 
                      locale.get({lang:"aug"}) || "aug",
                      locale.get({lang:"sep"}) || "sep", 
                      locale.get({lang:"oct"}) || "oct", 
                      locale.get({lang:"nov"}) || "nov", 
                      locale.get({lang:"dec"}) || "dec"
                 ]
            }).change(function(){
                self._handleTimeChange();
            }).bind("click",function(){
            	$("#datepicker").datepicker("show");
            });
        },
        
        /**
         * draw interval selector by intervals
         * @author QinJunwen
         * @name drawSelector
         * @type {method}
         * @description "绘制时间刻度选择框"
         * @param {array} intervals "时间间隔"
         * @param {object} container "DOM容器"
         * @return
         */
        drawSelector : function(intervals, container){
        	var self = this;
//        	var selector = $("<div>").addClass("paginate-selector").prependTo(this.pager.element.find(".paginate-wrapper"));//TODO
        	var selectorId = this.id +"-interval-selector";
        	var selectorHtml = "<select  id='"+ selectorId +"' class='multiselect'>" 
        	if (intervals && intervals.length > 0){
        	    intervals.each(function(one){
        	        var selectedStr =  "";
        	        if (one.selected){
        	            selectedStr = "selected='selected'";
        	        }
            		selectorHtml += "<option value='"+ one.value +"' "+ selectedStr +">"+ one.name +"</option>"
            	})
        	}else{
        		selectorHtml += "<option value='"+ 365*24*3600 +"' selected='selected'> 默认间隔（1年）</option>"
        	}
        	
        	selectorHtml += "</select>";
        	$(selectorHtml).appendTo(container || self.toolbar);
        	
        	self.intervalSelector = $("#" + selectorId);
//        	require(["cloud/lib/plugin/jquery.multiselect"],function(){
        		self.intervalSelector.multiselect({
        			header: locale.get("time_interval"),
                	multiple : false,
                    noneSelectedText: locale.get("time_interval"),
//                    selectedText: "# "+locale.get({lang:"is_selected"}),
                    selectedList: 1,
                    minWidth: 150,
                    height: 120
//                    position : {
//                        my: 'left bottom',
//                        at: 'left top'
//                    }
                }).on("multiselectclick", function(event, ui){
//                	console.log("_getSelectorValue", self._getSelectorValue());
                	self._handleTimeChange();
                }).on("create", function(){
                    //self._initParams();
                });
            	
//        	});
        },
        /**
         * @author QinJunwen
         * @name getStartAndEndTime
         * @type {method}
         * @description "获取开始和结束的时间"
         * @return {object} "开始和结束时间对象"
         */
        getStartAndEndTime : function(){
            return {
                startTime : this.startTime,
                endTime : this.endTime
            }
        },
        /**
         * @QinJunwen
         * @name _getSelectorValue
         * @type {method}
         * @description "获取选择框中的数据"
         * @private
         * @return {number}
         */
        _getSelectorValue : function(){
            if ($().multiselect){
                var selectedItem = this.intervalSelector.multiselect("getChecked")
//              console.log("getChecked", selectedItem.val())
                return parseInt(selectedItem.val());
            }else{
                return parseInt(this.intervalSelector.val());
            }
           
        },
        /**
         * @author QinJunwen
         * @name _getDatepickerValue
         * @type {method}
         * @description "获取日期选择框的内容"
         * @private
         * @return {number}
         */
        _getDatepickerValue : function(){
            var date = this.datePicker.datepicker("getDate");
            return parseInt(Math.round(date/1000));
        },
        /**
         * @author QinJunwen
         * @name _handleTimeChange
         * @type {method}
         * @description "当时间改变时的处理函数"
         * @param {boolean} silent
         * @private
         * @return
         */
        _handleTimeChange : function(silent){
            var self = this;
            var dateVal = this._getDatepickerValue();
            var selectorVal = this._getSelectorValue();
            //var timeNow = Math.round((new Date)/1000);
            
            this.dateVal = dateVal;
            this.startTime = dateVal - selectorVal/2;
            var eT = this.startTime + selectorVal;
            this.endTime = eT ;//> timeNow ? timeNow: eT;
            if (!silent){
                this.fire("timesChange", this.startTime, this.endTime, this.seriesArr.pluck("id"));
            }
        },
        
        /**
         * resize the chart
         * @author QinJunwen
         * @name resizeChart
         * @type {method}
         * @description "调整图标大小"
         * @param {string} width "宽度"
         * @param {string} height "高度"
         * @return
         */
        resizeChart : function(width, height){
        	this.content.resize(width, height);
        },
        
        /**
         * draw the chart
         * @author QinJunwen
         * @name _drawContent
         * @type {method}
         * @description "绘制图标内容"
         * @private
         * @return
         */
        _drawContent : function(){
        	var self = this;
        	
        	var options = this.options;
        	
        	var yAxises = cloud.util.makeArray(options.chart.yAxis);
        	
        	var yAxisOpt = [];
        	
        	if (yAxises.length > 0){
        	    yAxises.each(function(one){
        	        var unit = one.unit || "";
        	        var yAxisFormatter = one.formatter || null;
        	        var yAxis = {  
                        max : one.max || null,
                        min : one.min || null,
                        opposite : one.opposite || false,
                        title :{
                            text : one.title || null,
                            style:{
                        		color:one.color || null
                        	}
                        },
                        plotLines: one.plotLines,
                        plotBands: one.plotBands,
                        labels: {
                        	style:{
                        		color:one.color || null
                        	},
                            format: '{value}' + unit,
                            formatter : yAxisFormatter
                        }
                    };
        	        yAxisOpt.push(yAxis);
                });
        	}else{
        	    yAxisOpt = {
        	    }
        	}
        	
//        	var yAxisFormatter = (options.chart.yAxis && options.chart.yAxis.formatter) ? options.chart.yAxis.formatter : null;
        	var xAxisFormatter = (options.chart.xAxis && options.chart.xAxis.formatter) ? options.chart.xAxis.formatter : null;
        	var tipsFormatter = (options.chart.tooltips && options.chart.tooltips.formatter) ? options.chart.tooltips.formatter : null;
        	
        	
        	this.content = new Chart({
        		container : "#" + this.elements.chart,
        		pluginOpts : ["StockChart", {
        		    //options only for StockChart start
    		        rangeSelector: {
    		            enabled : false
    		        },
    		        navigator : {
    		        	xAxis:{
    		        		dateTimeLabelFormats: {
    		                    second: '%H:%M:%S',
    		                	minute: '%H:%M',
    		                	hour: '%H:%M',
    		                	day: '%m-%d',
    		                	week: '%m-%d',
    		                	month: '%Y-%m',
    		                	year: '%Y'
    		                }
    		        	},
    		            series : {//hide the navigator series
    		                id : 'navigator',
    		                fillOpacity: 0,
    		                lineWidth : 0
    		            },
    		            height : 17
    		        },
    		      //options only for StockChart end
        			title : {
        				text: options.chart.title
        			},
        			plotOptions: {
        	            series: {
        	                events: {
        	                    hide: function(event) {
        	                       self.renderXAXIS();
        	                    },
        	                    show : function(event) {
                                   self.renderXAXIS();
                                }
        	                }
        	            }
        	        },
        			chart: {
		                type: options.chart.type
//		                margin: [50, 50, 120, 80]
		            },
		            tooltip: {
		            	formatter : tipsFormatter,
		                xDateFormat: '%Y-%m-%d %H:%M:%S',
		                valuePrefix : options.chart.tooltips ? options.chart.tooltips.prefix : "",
		                valueSuffix : options.chart.tooltips ? options.chart.tooltips.subfix : ""
//		                shared: true
		            },
		            xAxis: {
		            	title :{
		            		text : options.chart.xAxis ? options.chart.xAxis.title : null
		            	},
		            	ordinal: false,
		            	dateTimeLabelFormats: {
		                    second: '%H:%M:%S',
		                	minute: '%H:%M',
		                	hour: '%H:%M',
		                	day: '%m-%d',
		                	week: '%m-%d',
		                	month: '%Y-%m',
		                	year: '%Y'
		                },
	                    labels: {
	                    	formatter : xAxisFormatter
	                    },
		            	type : "datetime"
		            },
		            yAxis: yAxisOpt,
		            legend : options.chart.legend || {}
		            /*,
	                legend: {
		                layout: 'vertical',
		                align: 'right',
		                verticalAlign: 'top',
		                x: -10,
		                y: 100,
		                borderWidth: 0
		            }*/
        		}]
        	});
        	window.chartObj = this.content.getChartObject();
        },
        /**
         * @author QinJunwen
         * @name procData
         * @type {method}
         * @description "数据处理"
         * @param {object} data "数据数组"
         * @return {object} data "整合后的数据数组"
         */
        procData : function(data){
            var startPointTmp = [this.startTime* 1000 - 1, null];
            var endPointTmp = [this.endTime*1000 + 1, null];
            data = [startPointTmp].concat(data);
            data.push(endPointTmp);
            return data;
        },
        
        /**
         * add series to chart
         * @author QinJunwen
         * @name addSeries
         * @type {method}
         * @description "在图标中添加序列"
         * @param {array} series "序列数组"
         * @return
         */
        addSeries : function(series){
        	var self = this;
        	var series = cloud.util.makeArray(series);
        	var result = $A();
        	if (series.length > 0){
        		var chartObj = this.content.getChartObject();
        		series.each(function(one){
        		    var serObjTmp = chartObj.get(one.id);
        		    var navData = self.procData(one.data)
        		    if (serObjTmp){
        		        serObjTmp.setData(one.data);
        		    }else{
        		        serObjTmp = chartObj.addSeries({
                            id : one.id,
                            name : one.name,
                            data : one.data,
                            step : one.step,
                            type : one.type,
                            color : one.color,
                            dataGrouping: {
                                enabled: false
                            },
                            yAxis : one.yAxis
                        });
        		    }
//        		    console.log(serObjTmp, "serObjTmp")
        		    result.push({id: one.id, name : serObjTmp.name, color : serObjTmp.color, obj : serObjTmp});
        		    chartObj.get("navigator").setData(navData);
                    chartObj.get("navigator").xAxis.setExtremes();
        		    
                    self.seriesArr.push(one);
        		});
        		self.renderXAXIS();
        	};
        	return result;
        },
        /**
         * @author QinJunwen
         * @name renderXAXIS
         * @type {method}
         * @description "渲染图标的x方向"
         * @return
         */
        renderXAXIS : function(){
            var chartObj = this.content.getChartObject();
            chartObj.xAxis[0].setExtremes(this.startTime * 1000, this.endTime * 1000);
            chartObj.xAxis[1].setExtremes(this.startTime * 1000, this.endTime * 1000, true);
        },
        /**
         * @QinJunwen
         * @name updateSeries
         * @type {method}
         * @description "更新图标的序列"
         * @param {string} id "序列id"
         * @param {object} data "数据对象"
         * @return {object} "序列对象"
         */
        updateSeries : function(id, data){
            var chartObj = this.content.getChartObject();
            var serieObj = chartObj.get(id);
            if (serieObj){
                var navData = this.procData(data)
                serieObj.setData(data);
                chartObj.get("navigator").setData(navData);
                chartObj.get("navigator").xAxis.setExtremes();
                this.renderXAXIS();
                return {id: id, name : serieObj.name, color : serieObj.color, obj : serieObj}
            }
        },
        
        /**
         * remove series from chart, if arguments is undefined, remove all series.
         * @author QinJunwen
         * @name removeSeries
         * @type {method}
         * @description "移除指定id的序列"
         * @param {string} seriesId "序列id"
         * @return
         */
        removeSeries : function(seriesId){
        	var self = this;
        	var seriesIds = $A();
        	if (seriesId == "all"){
        	    seriesIds = this.seriesArr.pluck("id");
        	}else if (seriesId){
        	    seriesIds = cloud.util.makeArray(seriesId);
        	}
        	
        	var chartObj = this.content.getChartObject();
        	seriesIds.each(function(one){
        		var serieObj = chartObj.get(one);
        		serieObj && serieObj.remove();
        		var serie = self.seriesArr.find(function(serOne){
        			if (serOne.id == one){
        				return true;
        			}else{
        				return false;
        			}
        		});
        		self.seriesArr = self.seriesArr.without(serie);
        	});
        	if (self.seriesArr.length == 0){
        	    chartObj.get("navigator").setData([]);
        	    chartObj.get("navigator").xAxis.setExtremes();
        	}else{
        	    this.renderXAXIS();
        	}
        }, 
        /**
         * @QinJunwen
         * @name toggleSerieState
         * @type {method}
         * @description "切换指定序列的状态"
         * @param {boolean} showOrHide "true:显示;false:隐藏"
         * @param {string} id "序列id"
         * @return
         */
        toggleSerieState : function(showOrHide, id){
            var chartObj = this.content.getChartObject();
            var serieObj = chartObj.get(id);
            if (serieObj){
                if (showOrHide == true){
                    serieObj.show();
                }else if (showOrHide == false) {
                    serieObj.hide();
                }
//                this.renderXAXIS();
            }else {
                console.debug("serie " + id + " does not exist");
            };
        },
        /**
         * @QinJunwen
         * @name showSerie
         * @type {method}
         * @description "显示指定序列"
         * @param {string} id "序列id"
         */
        showSerie : function(id){
            this.toggleSerieState(true, id);
        },
        /**
         * @author QinJunwen
         * @name hideSerie
         * @type {method}
         * @description "隐藏指定序列"
         * @param {string} id "序列id"
         */
        hideSerie : function(id){
            this.toggleSerieState(false, id);
        },
        
        /**
         * destroy this component
         * @author QinJunwen
         * @name destroy
         * @type {method}
         * @description "摧毁组件"
         * @param {Function} $super "父类引用"
         */
		destroy: function($super){
			this.content && this.content.destroy();
			this.content = null;
			this.elements = null;
			this.intervals = null;
			this.intervalSelector.multiselect("destroy");
			this.datePicker.datepicker("destroy");
			this.seriesArr = null;
			this.startTime = null;
			this.endTime = null;
			$super();
		}
    });

    return StockChart;

});