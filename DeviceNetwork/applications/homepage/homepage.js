/**
 * @author PANJC
 * 
 */
define(function(require) {
	require("cloud/lib/plugin/jquery.layout");
//	require("cloud/lib/plugin/highcharts");
	require("cloud/lib/plugin/highstock");
	var ContentChart = require("../components/content-chart");
	var Service = require("./service");
	var html = require("text!./homepage.html");
    require("./resources/css/homepage.css");
    var HomePage = Class.create(cloud.Component, {
        initialize: function($super, options) {
        	$super(options);
        	var self = this;
	        permission.judge(["_home","read"],function(){
		        	self.device = {
		        			total:null,
		        			online:null,
		        			offline:null,
		        			construction:null,
		        			commissioning:null,
		        			fault:null,
		        			overhaul:null,
		        			IR9XX:null,
		        			IR7XX:null,
		        			IR6XX:null,
		        			IR320:null,
		        			IR300:null,
		        			InDTU:null,
		        			FDD:null,
		        			TDD:null,
		        			WCDMA:null,
		        			EVDO:null,
		        			EVDOCDMA:null,
		        			GPRSEDGE:null,
		        			TDSCDMA:null,
		        			othernetwork:null
		        	};
		        	self.site = {
		        			total:null,
		        			online:null,
		        			offline:null,
		        			construction:null,
		        			commissioning:null,
		        			fault:null,
		        			overhaul:null
		        	};
		        	self.element.css({background:"#eee"});
	        		self.element.html(html);
	        		self._renderDeviceStatistics();
	        		self._event();
		        	locale.render({element:self.element});
	        });
        },

//        renderLayout: function() {
//            this.layout = $("#homepage").layout({
//                defaults: {
//                    paneClass: "layout-pane",
////                    togglerClass: "cloud-layout-toggler",
////                    resizerClass: "cloud-layout-resizer",
//                    spacing_open: 1,
//                    spacing_closed: 1,
////                    togglerLength_closed: 50,
//                    resizable: false,
//                    slidable: false,
//                    closable: false
//                },
//                north: {
//                    paneSelector: "#homepage-statistics",
//	                size: 370,
//                    resizable: false,
//                    closable: false
//                },
//                center:{
//                	paneSelector: "#homepage-tendency",
//                	size: 230,
//                	resizable: false,
//                    closable: false
//                }
//            });
//        },
        
//        _renderContentChart : function(){
//			this.contentChart = new ContentChart({
//	            container : "#homepage-tendency-content",
//	            service : Service,
//	            intervalButtons : [{
//	                name : "24" + locale.get("_hours"),
//	                value : 24 * 3600
//	            },{
//	                name : "7" + locale.get("_days"),
//	                value : 24 * 3600 * 7
//	            },{
//	                name : "30" + locale.get("_days"),
//	                value : 24 * 3600 * 30
//	            }],
//	            chart : {
//	                type : "spline",//"line", "spline", "column"
//	                title : locale.get({lang:"online+statistics+curve"}),
//	                //xAxis : {title : "time"},
//	                yAxis : {
//	                	min : 0,
//	                	max : 1,
//	                    "title" : locale.get({lang:"online_status_said"})
//	 //                   unit : ""
//	                }
//	            }
//	        })
//		},
        
        _renderPie:function(data){
        	if ($(data.element).length > 0){
        		$(data.element).highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    credits : {
                        enabled : false
                    },
                    title: {
                        text: data.title,
                        verticalAlign:'bottom',
                        y:12
                    },
                    tooltip: {
                	    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                    	pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false,
                                color: '#000000',
                                connectorColor: '#000000',
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                            },
                            showInLegend: true,
                            size:155
                        }
                    },
                    legend:{
                        y:-10
                    },
                    series: [{
                        type: 'pie',
                        name: data.seriesName,
                        data: data.data
                    }]
                });
        	}
        },
        
        _renderDeviceStatistics:function(){
        	var self = this;
        	cloud.Ajax.request({
        		url:"api/devices",
        		type:"GET",
        		parameters: {
                    limit: 1,
                    plc_id:0
                },
        		success:function(data1){
        			self.device.total = data1.total;
        			cloud.Ajax.request({
                		url:"api/devices",
                		type:"GET",
                		async:false,
                		parameters: {
                			online:1,
                            limit: 1,
                            plc_id:0
                        },
                		success:function(data2){
                			self.device.online = data2.total;
                			self.device.offline = self.device.total - self.device.online;
                			$("#device-total").text(self.device.total);
                			$("#online-device-total").text(self.device.online);
                			$("#offline-device-total").text(self.device.offline);
                			var pieData;
                			if(self.device.total == 0){
                				pieData = [
                                           ["-",100]
                                           ]
                			}else{
                				pieData = [
                                           [locale.get({lang:"online"}),self.device.online/self.device.total],
                                           [locale.get({lang:"offline"}),self.device.offline/self.device.total]
                                           ]
                			}
                			self._renderPie({
                        		element:"#device-pie",
                        		title:locale.get({lang:"gateway_online_state"}),
                        		seriesName:locale.get({lang:"gateway_number"}),
                        		data:pieData
                        	});
                		}
                	});
        		}
        	});
        	
        	cloud.Ajax.request({
        		url:"api/devices",
        		type:"GET",
        		parameters: {
                    limit: 1,
                    business_state:0
                },
                success:function(data){
                	self.device.construction = data.total;
                	cloud.Ajax.request({
                		url:"api/devices",
                		type:"GET",
                		parameters: {
                            limit: 1,
                            business_state:1
                        },
                        success:function(data){
                        	self.device.commissioning = data.total;
                        	cloud.Ajax.request({
                        		url:"api/devices",
                        		type:"GET",
                        		parameters: {
                                    limit: 1,
                                    business_state:2
                                },
                                success:function(data){
                                	self.device.fault = data.total;
                                	cloud.Ajax.request({
                                		url:"api/devices",
                                		type:"GET",
                                		parameters: {
                                            limit: 1,
                                            business_state:3
                                        },
                                        success:function(data){
                                        	self.device.overhaul = data.total;
                                        	$("#construction-device-total").text(self.device.construction);
                                        	$("#commissioning-device-total").text(self.device.commissioning);
                                        	$("#fault-device-total").text(self.device.fault);
                                        	$("#overhaul-device-total").text(self.device.overhaul);
                                        	var businessTotal = self.device.construction + self.device.commissioning + self.device.fault + self.device.overhaul;
                                        	var pieData;
                                			if(self.device.total == 0){
                                				pieData = [
                                                           ["-",100]
                                                           ]
                                			}else{
                                				pieData = [
                                                           [locale.get({lang:"construction"}),self.device.construction/businessTotal],
                                                           [locale.get({lang:"commissioning"}),self.device.commissioning/businessTotal],
                                                           [locale.get({lang:"fault"}),self.device.fault/businessTotal],
                                                           [locale.get({lang:"overhaul"}),self.device.overhaul/businessTotal]
                                                       ]
                                			}
                                        	self._renderPie({
                                        		element:"#device-business-state-pie",
                                        		title:locale.get({lang:"gateway_business_state"}),
                                        		seriesName:locale.get({lang:"gateway_number"}),
                                        		data:pieData
                                        	});
                                        }
                                	});
                                }
                        	});
                        }
                	});
                }
        	});
        	
        	cloud.Ajax.request({
        		url:"api/devices",
        		type:"GET",
        		parameters: {
                    limit: 1,
                    model:"^InDTU"
                },
                success:function(data){
                	self.device.InDTU = data.total;
                	cloud.Ajax.request({
                		url:"api/devices",
                		type:"GET",
                		parameters: {
                            limit: 1,
                            model:"^IR7"
                        },
                        success:function(data){
                        	self.device.IR7XX = data.total;
                        	cloud.Ajax.request({
                        		url:"api/devices",
                        		type:"GET",
                        		parameters: {
                                    limit: 1,
                                    model:"^IR6"
                                },
                                success:function(data){
                                	self.device.IR6XX = data.total;
                                	cloud.Ajax.request({
                                		url:"api/devices",
                                		type:"GET",
                                		parameters:{
                                			limit:1,
                                			model:"^IG601"
                                		},
                                		success:function(data){
                                			self.device.IG601=data.total;
                                			cloud.Ajax.request({
                                        		url:"api/devices",
                                        		type:"GET",
                                        		parameters: {
                                                    limit: 1,
                                                    model:"^IR320"
                                                },
                                                success:function(data){
                                                	self.device.IR320 = data.total;
                                                	cloud.Ajax.request({
                                                		url:"api/devices",
                                                		type:"GET",
                                                		parameters: {
                                                            limit: 1,
                                                            model:"^IR300"
                                                        },
                                                        success:function(data){
                                                        	self.device.IR300 = data.total;
                                                        	cloud.Ajax.request({
                                                        		url:"api/devices",
                                                        		type:"GET",
                                                        		parameters: {
                                                                    limit: 1,
                                                                    model:"^IR9"
                                                                },
                                                                success:function(data){
                                                                	self.device.IR9XX = data.total;
                                                                	cloud.Ajax.request({
                                                                		url:"api/devices",
                                                                		type:"GET",
                                                                		parameters: {
                                                                            limit: 1,
                                                                            model:"^IR8"
                                                                        },
                                                                        success:function(data){
                                                                        	
                                                                        	self.device.IR8XX = data.total;
                                                                        	$("#ir9xx-total").text(self.device.IR9XX);
                                                                        	$("#ir8xx-total").text(self.device.IR8XX);
                                                                        	$("#ir7xx-total").text(self.device.IR7XX);
                                                                        	$("#ir6xx-total").text(self.device.IR6XX);
                                                                        	$("#ig601-total").text(self.device.IG601);
                                                                        	$("#ir320-total").text(self.device.IR320);
                                                                        	$("#ir300-total").text(self.device.IR300);
                                                                        	$("#indtu-total").text(self.device.InDTU);
                                                                        	var pieData;
                                                                			if(self.device.total == 0){
                                                                				pieData = [
                                                                                           ["-",100]
                                                                                           ]
                                                                			}else{
                                                                				pieData = [
                                                                				           ['IR9XX',self.device.IR9XX/self.device.total],
                                                                				           ['IR8XX',self.device.IR8XX/self.device.total],
                                                                                           ['IR7XX',self.device.IR7XX/self.device.total],
                                                                                           ['IR6XX',self.device.IR6XX/self.device.total],
                                                                                           ['IG601',self.device.IG601/self.device.total],
                                                                                           ['IR320',self.device.IR320/self.device.total],
                                                                                           ['IR300',self.device.IR300/self.device.total],
                                                                                           ['InDTU3XX',self.device.InDTU/self.device.total]
                                                                                       ]
                                                                			}
                                                                        	self._renderPie({
                                                                        		element:"#device-model-pie",
                                                                        		title:locale.get({lang:"gateway_model"}),
                                                                        		seriesName:locale.get({lang:"gateway_number"}),
                                                                        		data:pieData
                                                                        	});
                                                                        }
                                                                        
                                                                	});
                                                                	
//                                                                	self.device.IR9XX = data.total;
//                                                                	$("#ir9xx-total").text(self.device.IR9XX);
//                                                                	$("#ir7xx-total").text(self.device.IR7XX);
//                                                                	$("#ir6xx-total").text(self.device.IR6XX);
//                                                                	$("#ir320-total").text(self.device.IR320);
//                                                                	$("#ir300-total").text(self.device.IR300);
//                                                                	$("#indtu-total").text(self.device.InDTU);
//                                                                	var pieData;
//                                                        			if(self.device.total == 0){
//                                                        				pieData = [
//                                                                                   ["-",100]
//                                                                                   ]
//                                                        			}else{
//                                                        				pieData = [
//                                                        				           ['IR9XX',self.device.IR9XX/self.device.total],
//                                                                                   ['IR7XX',self.device.IR7XX/self.device.total],
//                                                                                   ['IR6XX',self.device.IR6XX/self.device.total],
//                                                                                   ['IR320',self.device.IR320/self.device.total],
//                                                                                   ['IR300',self.device.IR300/self.device.total],
//                                                                                   ['InDTU3XX',self.device.InDTU/self.device.total]
//                                                                               ]
//                                                        			}
//                                                                	self._renderPie({
//                                                                		element:"#device-model-pie",
//                                                                		title:locale.get({lang:"gateway_model"}),
//                                                                		seriesName:locale.get({lang:"gateway_number"}),
//                                                                		data:pieData
//                                                                	});
                                                                }
                                                                
                                                        	});
                                                        	
                                                        }
                                                	});
                                                }
                                        	});
                                		}
                                	})
                                }
                        	});
                        }
                	});
                }
        	});
        	
        	cloud.Ajax.request({
        		url:"api/devices",
        		type:"GET",
        		parameters: {
                    limit: 1,
                    model:"WCDMA"
                },
                success:function(data){
                	self.device.WCDMA = data.total;
                	cloud.Ajax.request({
                		url:"api/devices",
                		type:"GET",
                		parameters: {
                            limit: 1,
                            model:"EVDO/CDMA"
                        },
                        success:function(data){
                        	self.device.EVDOCDMA = data.total;
                        	cloud.Ajax.request({
                        		url:"api/devices",
                        		type:"GET",
                        		parameters: {
                                    limit: 1,
                                    model:"TD-SCDMA$|TD$"
                                },
                                success:function(data){
                                	self.device.TDSCDMA = data.total;
                                	cloud.Ajax.request({
                                		url:"api/devices",
                                		type:"GET",
                                		parameters: {
                                            limit: 1,
                                            model:"IR3.0"
                                        },
                                        success:function(data){
                                        	self.device.othernetwork = data.total;
                                        	cloud.Ajax.request({
                                        		url:"api/devices",
                                        		type:"GET",
                                        		parameters: {
                                                    limit: 1,
                                                    model:"GPRS/EDGE"
                                                },
                                                success:function(data){
                                                	self.device.GPRSEDGE = data.total;
                                                	cloud.Ajax.request({
                                                		url:"api/devices",
                                                		type:"GET",
                                                		parameters: {
                                                            limit: 1,
                                                            model:"FDD-LTE"
                                                        },
                                                        success:function(data){
                                                        	self.device.FDD = data.total;
                                                        	cloud.Ajax.request({
                                                        		url:"api/devices",
                                                        		type:"GET",
                                                        		parameters: {
                                                                    limit: 1,
                                                                    model:"TDD-LTE"
                                                                },
                                                                success:function(data){
                                                                	self.device.TDD = data.total;
                                                                	cloud.Ajax.request({
                                                                		url:"api/devices",
                                                                		type:"GET",
                                                                		parameters: {
                                                                            limit: 1,
                                                                            model:"EVDO$"
                                                                        },
                                                                        success:function(data){
                                                                        	self.device.EVDO = data.total;
                                                                        	cloud.Ajax.request({
                                                                        		url:"api/devices",
                                                                        		type:"GET",
                                                                        		parameters:{
                                                                        			limit:1,
                                                                        			model:"HSPA"
                                                                        		},
                                                                        		success:function(data){
                                                                        			self.device.HSPA=data.total;
                                                                                	cloud.Ajax.request({
																						url:"api/devices",
																						type:"GET",
																						parameters:{
																							limit:1,
																							model:"GPRS-STATUS"
																						},
																						success:function(data){
																							self.device.GPRSSTATUS=data.total;
																							self.device.GPRSEDGE=self.device.GPRSEDGE+self.device.GPRSSTATUS;
																							$("#fdd-total").text(self.device.FDD);
																							$("#tdd-total").text(self.device.TDD);
																							$("#wcdma-total").text(self.device.WCDMA);
																							$("#evdo-total").text(self.device.EVDO);
																							$("#evdocdma-total").text(self.device.EVDOCDMA);
																							$("#gprsedge-total").text(self.device.GPRSEDGE);
																							$("#tdscdma-total").text(self.device.TDSCDMA);
																							$("#hspa-total").text(self.device.HSPA);
																							$("#other-network-total").text(self.device.othernetwork);
																							//$("#gprsstatus-total").text(self.device.GPRSSTATUS);
																							var pieData;
																							if(self.device.total == 0){
																								pieData = [
																										   ["-",100]
																										   ]
																							}else{
																								pieData = [
																										   ['FDD-LTE',self.device.FDD/self.device.total],
																										   ['TDD-LTE',self.device.TDD/self.device.total],
																										   ['WCDMA',self.device.WCDMA/self.device.total],
																										   ['EVDO',self.device.EVDO/self.device.total],
																										   ['EVDO/CDMA',self.device.EVDOCDMA/self.device.total],
																										   ['GPRS/EDGE',self.device.GPRSEDGE/self.device.total],
																										   //['GPRS-STATUS',self.device.GPRSSTATUS/self.device.total],
																										   ['TD-SCDMA',self.device.TDSCDMA/self.device.total],
																										   ['HSPA+',self.device.HSPA/self.device.total],
																										   [locale.get({lang:"others"}),self.device.othernetwork/self.device.total]
																									   ]
																							}
																							self._renderPie({
																								element:"#device-network-pie",
																								title:locale.get({lang:"gateway_network_type"}),
																								seriesName:locale.get({lang:"gateway_number"}),
																								data:pieData
																							});
																						}
																					});
                                                                        		}
                                                                        	});
                                                                        }
                                                                	});
                                                                	
                                                                }
                                                        	});
                                                        	
                                                        }
                                                	});
                                                	
                                                	
                                                }
                                        	});
                                        }
                                	});
                                }
                        	});
                        }
                	});
                }
        	});
        	
        },
        
        _renderSiteStatistics:function(){
        	var self = this;
        	cloud.Ajax.request({
        		url:"api/sites",
        		type:"GET",
        		parameters: {
                    limit: 1
                },
        		success:function(data){
        			self.site.total = data.total;
        			cloud.Ajax.request({
                		url:"api/sites",
                		type:"GET",
                		async:false,
                		parameters: {
                			online:1,
                            limit: 1
                        },
                		success:function(data){
                			self.site.online = data.total;
                			self.site.offline = self.site.total - self.site.online;
                			$("#site-total").text(self.site.total);
                			$("#online-site-total").text(self.site.online);
                			$("#offline-site-total").text(self.site.offline);
                			var pieData;
                			if(self.site.total == 0){
                				pieData = [
                                           ["-",100]
                                           ]
                			}else{
                				pieData = [
                                           [locale.get({lang:"online"}),self.site.online/self.site.total],
                                           [locale.get({lang:"offline"}),self.site.offline/self.site.total]
                                       ]
                			}
                			self._renderPie({
                        		element:"#site-pie",
                        		title:locale.get({lang:"site_online_state"}),
                        		seriesName:locale.get({lang:"site_number"}),
                        		data:pieData
                        	});
                		}
                	});
        		}
        	});
        	
        	cloud.Ajax.request({
        		url:"api/sites",
        		type:"GET",
        		parameters: {
                    limit: 1,
                    business_state:0
                },
                success:function(data){
                	self.site.construction = data.total;
                	cloud.Ajax.request({
                		url:"api/sites",
                		type:"GET",
                		parameters: {
                            limit: 1,
                            business_state:1
                        },
                        success:function(data){
                        	self.site.commissioning = data.total;
                        	cloud.Ajax.request({
                        		url:"api/sites",
                        		type:"GET",
                        		parameters: {
                                    limit: 1,
                                    business_state:2
                                },
                                success:function(data){
                                	self.site.fault = data.total;
                                	cloud.Ajax.request({
                                		url:"api/sites",
                                		type:"GET",
                                		parameters: {
                                            limit: 1,
                                            business_state:3
                                        },
                                        success:function(data){
                                        	self.site.overhaul = data.total;
                                        	$("#construction-site-total").text(self.site.construction);
                                        	$("#commissioning-site-total").text(self.site.commissioning);
                                        	$("#fault-site-total").text(self.site.fault);
                                        	$("#overhaul-site-total").text(self.site.overhaul);
                                        	var businessTotal = self.site.construction + self.site.commissioning + self.site.fault + self.site.overhaul;
                                        	var pieData;
                                			if(self.site.total == 0){
                                				pieData = [
                                                           ["-",100]
                                                           ]
                                			}else{
                                				pieData = [
                                                           [locale.get({lang:"construction"}),self.site.construction/businessTotal],
                                                           [locale.get({lang:"commissioning"}),self.site.commissioning/businessTotal],
                                                           [locale.get({lang:"fault"}),self.site.fault/businessTotal],
                                                           [locale.get({lang:"overhaul"}),self.site.overhaul/businessTotal]
                                                       ]
                                			}
                                        	self._renderPie({
                                        		element:"#site-business-state-pie",
                                        		title:locale.get({lang:"site_business_state"}),
                                        		seriesName:locale.get({lang:"site_number"}),
                                        		data:pieData
                                        	});
                                        }
                                	});
                                }
                        	});
                        }
                	});
                }
        	});
        	
        },
        
        _event:function(){
        	var self = this;
        	$("#homepage-statistics-title-device").bind("click",function(){
        		$("#homepage-statistics-title-site").removeAttr("class").addClass("homepage-statistics-title-out");
        		$("#homepage-statistics-title-device").removeAttr("class").addClass("homepage-statistics-title-on");
        		$("#homepage-statistics-device").show();
        		$("#homepage-statistics-site").hide();
        		self._renderDeviceStatistics();
        	});
        	$("#homepage-statistics-title-site").bind("click",function(){
        		$("#homepage-statistics-title-site").removeAttr("class").addClass("homepage-statistics-title-on");
        		$("#homepage-statistics-title-device").removeAttr("class").addClass("homepage-statistics-title-out");
        		$("#homepage-statistics-site").show();
        		$("#homepage-statistics-device").hide();
        		self._renderSiteStatistics();
        	});
        },
        
        destroy: function(){
        	$("#device-pie").highcharts() && $("#device-pie").highcharts().destroy();
        	$("#device-business-state-pie").highcharts() && $("#device-business-state-pie").highcharts().destroy();
        	$("#device-model-pie").highcharts() && $("#device-model-pie").highcharts().destroy();
        	$("#device-network-pie").highcharts() && $("#device-network-pie").highcharts().destroy();
        	this.element.empty();
        }
    });

    return HomePage;
});