/**
 * @author QinJunwen
 * @filename chart
 * @filetype {class}
 * @filedescription "对插件的highstock进行封装,形成图表组件"
 * @filereturn {function}
 */
//table component, display data in a table, support CRUD features.
define(function(require){
	var cloud = require("cloud/base/cloud");
//	require("cloud/lib/plugin/highcharts-more");
	require("cloud/lib/plugin/highstock");
	/**
	 * @see http://www.highcharts.com/
	 */
	var Chart = Class.create(cloud.Component,{
		
	    /**
	     * init this component
	     * @author QinJunwen
	     * @name initialize
	     * @type {function}
	     * @description "该类的实例化函数"
	     * @param {function} $super "父类引用"
	     * @param {object} options "json对象"
	     * @return
	     */
        initialize : function($super, options){
        	this.container = null;//contian the chart
        	cloud.util.defaults(options, {
        		pluginOpts : null,// the option object of plugin, now is highcharts
        		overLayerItems : []// array of object like {element : jquery/html, top : num, left : num, bottom : num, right : num }
			});
        	
        	$super(options);
        	
        	this.options = options;
        	
        	//this.container = $("<div>");
        	
        	this.chart = null;
        	
        	this.overLayerElements = $A();
        	
        	this._setDeafaultOpts();
        	
        	this._render();
        },
        
        /**
         * render this component
         * @author QinJunwen
         * @private
         * @name _render
         * @type {method}
         * @description "绘制该实例的dom结构"
         * @return
         */
        _render:function(){
        	this._draw();
        },
        
        /**
         * resize the chart by parameters, while no arguments is passing, resize chart by the size of this component
         * @author QinJunwen
         * @name resize
         * @type {method}
         * @description "调整图标的大小"
         * @param {string} widthParam "设置图表的宽度参数"
         * @param {string} heightParam "设置图表的高度参数"
         */
        resize: function(widthParam, heightParam){
        	if (this.element && this.chart){
        		var width = widthParam || this.element.width();
        		var height = heightParam || this.element.height();
//        		console.log("setSize : " + width + ";" + height)
        		this.chart.setSize(
        				width, 
        				height,
        				false);
        	}
        },
        
        /**
         * set global default options to HighCharts
         * @author QinJunwen
         * @name _setDeafaultOpts
         * @type {method}
         * @private
         * @description "为图标插件设置默认的配置"
         * @return
         */
        _setDeafaultOpts : function(){
        	Highcharts.setOptions({
        		global: {
                    useUTC: false//add to fit UTC time
                },
        		credits: {
        			enabled : false,
                    href : "",
                    text : ""
                },
                dateTimeLabelFormats:{
                	second: '%H:%M:%S',
                	minute: '%H:%M',
                	hour: '%H:%M',
                	day: '%e. %b',
                	week: '%e. %b',
                	month: '%b \'%y',
                	year: '%Y'
                },
                lang: {//TODO
        			//numericSymbols: [' thousands', ' millions'],
                    shortMonths : [
									/*locale.get({lang:"jan"}) || "jan", 
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
									locale.get({lang:"dec"}) || "dec"*/
                                   "1", "2","3", "4","5", "6","7", "8","9", "10","11", "12"
                                   ],
                    months :  [
							/*	locale.get({lang:"jan"}) || "jan", 
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
								locale.get({lang:"dec"}) || "dec"*/
								"1", "2","3", "4","5", "6","7", "8","9", "10","11", "12"
                               //"一", "二","三", "四","五", "六","七", "八","九", "十","十一", "十二"
                               ]
        		}
            });
        },
        
        /**
         * @deprecated
         * @author QinJunwen
         * @name _optionsAdapter
         * @type {method}
         * @private
         * @description "translate component options to HighCharts options"
         */
        _optionsAdapter : function(){
        	var self = this;
        	var pluginOpt = {
        		chart : {
        			type : "line" ,
        			renderTo : this.container,
        			showAxes: true,
        			//zoomType //TODO
        			plotBorderWidth : 1,
        			plotBorderColor : "#C0C0C0",
        			//plotBackgroundImage : null,
        			//plotBackgroundColor : null,
        			style : null
        		},
        		plotOptions : {
        			series : {
        				//enableMouseTracking : true,
        				lineWidth : 2,
        				marker : {
        					enabled : true,
        					symbol: null // possible values are "circle", "square", "diamond", "triangle" and "triangle-down". Additionally, the URL to a graphic can be given on this form: "url(graphic.png)".
        				},
        				//negativeColor : null,
        				//threshold : null,
        				events : {
        					checkboxClick : function(){
        						self.fire("");
        					}
        					
    					}
        				//point : {
        				//	events : {
        						
        				//	}
        				//}
        				
        			}
        			
        		},
        		
        		series : [],//TODO array to be translate
        		
        		title : {
        			align : "center",
        			floating : false,
        			style : null,
        			text : null,
        			verticalAlign: "top",
        			x : 0,
        			y : 15
        		},
        		tooltip : {
        			enabled : true,
        			crosshairs : [false, false],
        			formatter : null, //a Function return a html string 
        			positioner : null, //a Function return a object in this format : { x: 100, y: 100 }.
        			shared : false, // multi-series  will be shown in a single bubble 
        			valueDecimals : null,
        			valuePrefix : null,
        			valueSuffix : null
        		},
        		xAxis : {
        			allowDecimals : true, //When counting integers, like persons, decimals must be avoided in the axis tick labels
        			labels : {
        				enabled : true,
        				align : "center",
        				formatter : null, //Function return a HTML string, The value is given by this.value. Additional properties for this are axis, chart, isFirst and isLast
        				overflow : null, //Can be undefined or "justify"
        				rotation: 0 //Rotation of the labels in degrees. Defaults to 0.
        				
        			},
        			//lineColor : "#C0D0E0",
        			lineWidth : 1,
        			//linkedTo : 0,
        			max : null,
        			min : null,
        			minRange : null,
        			opposite : false,
        			reversed : false,
        			//tickPositioner : null, //Function return TODO
        			title : {
        				text : null
        			}
        		}, //xAxis can be an array of xAxis object
        		yAxis : {
        			allowDecimals : true, //When counting integers, like persons, decimals must be avoided in the axis tick labels
        			labels : {
        				enabled : true,
        				align : "center",
        				formatter : null, //Function return a HTML string, The value is given by this.value. Additional properties for this are axis, chart, isFirst and isLast
        				overflow : null, //Can be undefined or "justify"
        				rotation: 0 //Rotation of the labels in degrees. Defaults to 0.
        				
        			},
        			//lineColor : "#C0D0E0",
        			lineWidth : 1,
        			//linkedTo : 0,
        			max : null,
        			min : null,
        			minRange : null,
        			opposite : false,
        			reversed : false,
        			//tickPositioner : null, //Function return TODO
        			title : {
        				text : null
        			}
        		}//yAxis can be an array of xAxis object
        	}
        },
        
        /**
         * @deprecated
         * translate component series options to HighCharts options
         * @author QinJunwen
         * @name _seriesAdapter
         * @type {method}
         * @description "translate component series options to HighCharts options"
         * @param series {object|array} series options
         * @private
         * @returns {Array} HighCharts series array
         */
        _seriesAdapter : function(series){
        	var seriesArr = cloud.util.makeArray(series);
        	var resultArr = $A();
        	seriesArr.each(function(seriesItem){
        		var newItem = {
        			data : seriesItem.data,
        			name : seriesItem.name,
        			type : seriesItem.type,
        			xAxis: seriesItem.xAxis,
        			yAxis : seriesItem.yAxis
        		};
        		resultArr.put(newItem);
        	});
        	return resultArr;
        },
        
        /**
         * @deprecated
         * translate component axies options to HighCharts options
         * @name _axisAdapter
         * @type {method}
         * @description "translate component axies options to HighCharts options"
         * @author QinJunwen
         * @private
         * @param axies {object|array} axies options
         * @returns {Array} HighCharts axies array
         */
        _axisAdapter : function(axis){
        	var axisArr = cloud.util.makeArray(axis);
        	var resultArr = $A(); 
        	axisArr.each(function(axisItem){
        		var newLabels = $A(axisItem.labels).each();
        		
        		var newItem = {
        				allowDecimals : axisItem.allowDecimals, //When counting integers, like persons, decimals must be avoided in the axis tick labels
            			labels : axisItem.allowDecimals,
            			lineWidth : axisItem.allowDecimals,
            			//linkedTo : 0,
            			max : axisItem.allowDecimals,
            			min : axisItem.allowDecimals,
            			minRange : axisItem.allowDecimals,
            			opposite : axisItem.allowDecimals,
            			reversed : axisItem.allowDecimals,
            			//tickPositioner : null, //Function return TODO
            			title : axisItem.allowDecimals
        		};
        		resultArr.put(newItem);
        	});
        	return resultArr;
        },
        
        _renderOverLayer : function(){
        	
        },
        
        /**
         * draw chart and overlayer
         * @author QinJunwen
         * @name _draw
         * @type {method}
         * @private
         * @description "绘制图表和覆盖物"
         * @return
         */
        _draw: function(){
        	this._drawChart();
        	
        	this._drawOverLayer();
        },
        
        /**
         * init HighChart
         * @author QinJunwen
         * @name _drawChar
         * @private
         * @type {method}
         * @description "绘制图表"
         * @return
         */
        _drawChart : function(){
        	this.element.css({
        		height : "100%",
        		width : "100%",
        		display : "block"
        	});
        	if ($.isArray(this.options.pluginOpts)){
        	    this.element.highcharts(this.options.pluginOpts[0], this.options.pluginOpts[1]);
        	}else{
        	    this.element.highcharts(this.options.pluginOpts);
        	};
        	
        	this.chart = this.element.highcharts();
        	
        	/*this.chart = new Highcharts.Chart(this.options.pluginOpts);
        	
        	this.element.append(this.chart);*/
        },
        
        /**
         * draw items over the chart
         * @author QinJunwen
         * @name _drawOverLayer
         * @type {method}
         * @private
         * @description "绘制图表上的覆盖物"
         * @return
         */
        _drawOverLayer : function(){
        	var self = this;
        	var items = cloud.util.makeArray(this.options.overLayerItems);
        	
        	items.each(function(item){
        		var itemCon=$("<div style='display:inline-block; position : absolute;'></div>")//.appendTo(self.element);
        		
    			itemCon.css("top", item.top ? item.top : "auto");
        		itemCon.css("left", item.left ? item.left : "auto");
        		itemCon.css("bottom", item.bottom ? item.bottom : "auto");
        		itemCon.css("right", item.right ? item.right : "auto");
        		
        		var tempEl = null;
				
        		item = item.element;
        		
				if ((item instanceof cloud.Component)){
					tempEl = item.element;
					
				}else if ((typeof item) == "string" || (item instanceof jQuery)){
					
					tempEl = $(item);
					//$(item).addClass("cloud-toolbar-item-content").appendTo(tempEl);
				}
				tempEl.appendTo(itemCon);
				
				self.overLayerElements.push(itemCon);
				
				self.element.append(itemCon);
        	});
        },
        
        /**
         * get HighCharts object
         * @author QinJunwen
         * @name getChartObject
         * @type {method}
         * @description "获取图表对象"
         * @return {object} "该类实例的图表属性"
         */
        getChartObject : function(){
        	return this.chart;
        },
        
        /**
         * render data to chart by specified series
         * if arguments of this function only contains data, data will be render to the first series
         * @author QinJunwen
         * @name render
         * @type {method}
         * @description "根据图表插件规定的序列来渲染数据"
         * @param {string} seriesId "展示数据的序列编号"
         * @param {array} data "数据数组"
         * @return
         */
        render:function(seriesId, data){
        	var series = null;
        	var data = data;
        	if (arguments.length === 1){
        		series = this.chart.series[0];
        		data = arguments[0];
        	}else{
        		series = this.chart.series[seriesId] || this.chart.get(seriesId);
        	}
        	
        	series && series.setData(data);
        },
        
        /**
         * destroy this component
         * @author QinJunwen
         * @name destroy
         * @type {method}
         * @description "摧毁该组件"
         * @param {Function} $super "父类引用"
         */
        destory : function($super){
        	this.chart.destroy();
        	this.overLayerElements.each(function(el){
        		el.remove();
        	});
        	$super();
        }
    });
	
	return Chart;
	
});