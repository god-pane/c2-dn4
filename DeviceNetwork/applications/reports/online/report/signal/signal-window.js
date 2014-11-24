define(function(require){
	require("cloud/base/cloud");
	var Window = require("cloud/components/window");
	var Table = require("cloud/components/table");
	var CententChart = require("cloud/components/stockchart");
	var service = require("./service.js");
	var signal = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.data = options.data;
			this._render();
		},
		_render:function(){
			this._renderWindow();
			this._renderChart();
			this._drawLine();
		},
		_drawLine:function(){
			var self = this;
			var times = this.contentChart.getStartAndEndTime();
			var timeNow = (new Date()).getTime();
			if(self.signalchart){
				self.contentChart.removeSeries(self.signalchart[0].id)
			}
			if(self.onlinechart){
				self.contentChart.removeSeries(self.onlinechart[0].id)
			}
			if(timeNow < times.startTime*1000){
				dialog.render({lang:"time_range_error"});
			}else{
				service.getSignal(times.startTime, times.endTime,this.data.deviceId,function(data){
					var datas = data.result[0] && data.result[0].signal.collect(function(data){
						data[0] = data[0]*1000;
						return data;
					});
					datas && datas.sort();
					if(datas){
						self.signalchart = self.contentChart.addSeries([{
//							type:"column",
							step:"left",
							id:"1",
							name: locale.get({lang:"signal"}),
							color:"#89A54E",
							data : datas
						}]);
					}
				});
				service.getOnline(times.startTime, times.endTime,this.data.deviceId,function(data){
					var datas = data.result[0].data.collect(function(data){
						data[0] = data[0]*1000;
						return data;
					});
					datas.sort();
					self.onlinechart = self.contentChart.addSeries([{
						step:"left",
						id:'2',
						name: locale.get({lang:"online"}),
						color:"#4572A7",
						data : datas,
						yAxis : 1
					}])
				});
			}
		},
		_renderWindow:function(){
			this.signalWin = new Window({
				container: "body",
				title: locale.get({lang:"signal_window"}),
				top: "center",
				left: "center",
				width: 1000,
				height: 650,
				drag:true,
				mask: true,
				content: "<div id='signal-window' style='height:100%'></div>",
				events:{
					
				}
			});
			this.signalWin.show();
		},
		_renderChart:function(){
			this.contentChart = new CententChart({
				container : "#signal-window",
				intervals : [{
                    name : "24" + locale.get({lang:"_hours"}),
                    value : 24 * 3600,
                    selected : true //设为默认选中
                },{
                    name : "7" + locale.get({lang:"_days"}),
                    value : 24 * 3600 * 7
                },{
                    name : "30" + locale.get({lang:"_days"}),
                    value : 24 * 3600 * 30
                    
                },{
                    name : "1" + locale.get({lang:"year"}),
                    value : 360 * 24 * 3600
                }],
				chart : {
//					title:"信号曲线",
//					type: "spline",
					yAxis :[{
						title:locale.get({lang:"signal"}),
						color:"#89A54E",
						max: 30,
						min: "0",
						plotLines: [{
				    		value: 14,
				    		width: 1,
				    		color: 'red',
				    		dashStyle: 'dash',
				    		label: {
				    			text: locale.get({lang:"thresholds_14"}),//'阈值(14)',
				    			align: 'left',
				    			style:{color:"red"},
				    			y: 12,
				    			x: -30
				    		}
				    	}],
						formatter : function(){
							if(!this.isLast){
								return this.value //+ "dBm"
							}
						}
					},{
						title:locale.get({lang:"online"}),
						opposite : true,
						min:-0.1,
						max:1.1,
						formatter: function(){
						    if(this.value === 0 ){
						        return locale.get({lang:"offline"})
						    }else if(this.value === 1){
						        return locale.get({lang:"online"})
						    }
						},
						color:"#4572A7"
					}],
					legend:{
						enabled:true,
						layout: 'horizontal',
//		                align: 'left',
//		                x: 160,
		                verticalAlign: 'top',
//		                y: 0,
//		                floating: true,
		                backgroundColor: '#FFFFFF'
					}
				},
				events:{
					"timesChange":function(){
						this._drawLine();
					},
					scope:this
				}
			});
		},
		destroy:function(){
			
		}
	});
	return signal;
})