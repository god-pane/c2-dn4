define(function(require){
	require("cloud/base/cloud");
//	require("./lang/zh-cn");
//	Ext.ns('Nts.Module.System.Agent');

	var Configure = 
	{
			drawablePrototypes:{
				items:
				[
				 	{
				 		_name:locale.get({lang:"general"}),
				 		_id:'gesidebar',
				 		items:
				 		[
				 		 	{
				 		 		name: locale.get({lang:"meter_Reading"}),
								width: 151,
								height: 23,
								type: 1,
								titles:
								[
									{
										x: 10,
										y: 3,
										font: 'Arial',
										size: 12,
										text: locale.get({lang:"meter_Reading"})
									},
									{
										x: 100,
										y: 3,
										size: 12,
										bold: true,
										font: 'Arial',
										text: '----'
									}
								],
								endPoints:
								[{
									x:0,
									y:10,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:50,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:100,
									y:10,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:0,
									y:90,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:100,
									y:90,
									rs:3,
									cl:"blue",
									fs:"orange"
								}],
								images:
								[{
									el: 'round-rect-label',
									t:'0'
//									width:151,
//									height:23
								}],
								url:'components/text/'
				 		 	},
				 		 	{
				 		 		name: locale.get({lang:"textEdit"}),
				 		 		width: 135,
								height: 21,
								type:'text',
								titles:
									{
										x: 10,
										y: 3,
										font: 'Arial'
										//text:locale.get({lang:"editTextContent"})
									},
								images:
								[{
									el: 'textEdit',
									t:'0'
								}]
						    },
						    {
				 		 		name: locale.get({lang:"user_components"}),
				 		 		type: 6,
								images:
								{
									el: 'user',
									t:'0'
								},
								endPoints:
								[{
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
						    },
							{
								name: locale.get({lang:"pipe_Corner"})+'<br/>'+'('+locale.get({lang:"blue"})+locale.get({lang:"NE"})+')',
								type: 6,
								images:
								{
									el: 'pipe-cb-ne',
									t:'0'
								},
								endPoints:
								[{
									x:0,
									y:18,
									rs:3,
									cl:"blue",
									fs:"orange"
								  },{
									x:80,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
							},
							{
								name: locale.get({lang:"pipe_Corner"})+'<br/>'+'('+locale.get({lang:"blue"})+locale.get({lang:"NW"})+')',
								type: 6,
								images:
								{
									el: 'pipe-cb-nw',
									t:'0'
								},
								endPoints:
								[{
									x:100,
									y:18,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:18,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
							},
							{
								name: locale.get({lang:"pipe_Corner"})+'<br/>'+'('+locale.get({lang:"blue"})+locale.get({lang:"SE"})+')',
								type: 6,
								images:
								{
									el: 'pipe-cb-se',
									t:'0'
								},
								endPoints:
								[{
									x:0,
									y:80,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:80,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
							},
							{
								name: locale.get({lang:"pipe_Corner"})+'<br/>'+'('+locale.get({lang:"blue"})+locale.get({lang:"SW"})+')',
								type: 6,
								images:
								{
									el: 'pipe-cb-sw',
									t:'0'
								},
								endPoints:
								[{
									x:18,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:100,
									y:80,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
							},
							{
								name: locale.get({lang:"pipe_Corner"})+'<br/>'+'('+locale.get({lang:"yellow"})+locale.get({lang:"NE"})+')',
								type: 6,
								images:
								{
									el: 'pipe-cy-ne',
									t:'0'
								},
								endPoints:
								[{
									x:0,
									y:18,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:80,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
							},
							{
								name: locale.get({lang:"pipe_Corner"})+'<br/>'+'('+locale.get({lang:"yellow"})+locale.get({lang:"NW"})+')',
								type: 6,
								images:
								{
									el: 'pipe-cy-nw',
									t:'0'
								},
								endPoints:
								[{
									x:18,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:100,
									y:18,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
							},
							{
								name: locale.get({lang:"pipe_Corner"})+'<br/>'+'('+locale.get({lang:"yellow"})+locale.get({lang:"SE"})+')',
								type: 6,
								images:
								{
									el: 'pipe-cy-se',
									t:'0'
								},
								endPoints:
								[{
									x:0,
									y:80,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:80,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
							},
							{
								name: locale.get({lang:"pipe_Corner"})+'<br/>'+'('+locale.get({lang:"yellow"})+locale.get({lang:"SW"})+')',
								type: 6,
								images:
								{
									el: 'pipe-cy-sw',
									t:'0'
								},
								endPoints:
								[{
									x:18,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:100,
									y:80,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
							},
							{
								name: locale.get({lang:"valve"})+'<br/>'+'('+locale.get({lang:"three_Way_east"})+')',
//								titles:
//								{
//									text: 'SV1',
//									size: '12'
//								},
								type: 6,
								images:
								{
									el: 'valve-3w-e',
									t:'0'
								},
								endPoints:
								[{
									x:30,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
									},{
									x:100,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								},{
									x:30,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
							    }]
							},
							{
								name: locale.get({lang:"valve"})+'<br/>'+'('+locale.get({lang:"three_Way_south"})+')',
//								titles:
//								{
//									text: 'SV1',
//									size: '12'
//								},
								type: 6,
								images:
								{
									el: 'valve-3w-s',
									t:'0'
								},
								endPoints:
								[{
									x:0,
									y:30,
									rs:3,
									cl:"blue",
									fs:"orange"
  								 },
								 {
									x:100,
									y:30,
									rs:3,
									cl:"blue",
									fs:"orange"
								},
								{
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
							},
							{
								name: locale.get({lang:"valve"})+'<br/>'+'('+locale.get({lang:"three_Way_west"})+')',
//								titles:
//								{
//									text: 'SV1',
//									size: '12'
//								},
								type: 6,
								images:
								{
									el: 'valve-3w-w',
									t:'0'
								},
								endPoints:
								[{
									x:80,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:0,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:80,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }]
							},
							{
								name: locale.get({lang:"valve"})+'<br/>'+'('+locale.get({lang:"three_Way_north"})+')',
//								titles:
//								{
//									text: 'SV1',
//									size: '12'
//								},
								type: 6,
								images:
								{
									el: 'valve-3w-n',
									t:'0'
								},
								endPoints:
								[{
									x:50,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:0,
									y:80,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:100,
									y:80,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }]
							},
							{
								name: locale.get({lang:"yellow"})+locale.get({lang:"pipe"})+'<br/>'+'('+locale.get({lang:"horz"})+')',
								type: 6,
								images:
								{
									el: 'pipe-y-h',
									t:'0'
								},
								endPoints:
								[
								 {
									x:0,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:100,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }
								]
							},
							{
								name: locale.get({lang:"yellow"})+locale.get({lang:"pipe"})+'<br/>'+'('+locale.get({lang:"vert"})+')',
								type: 6,
								images:
								{
									el: 'pipe-y-v',
									t:'0'
								},
								endPoints:
								[
								{
									x:50,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }
								]
							},
							{
								name: locale.get({lang:"blue"})+locale.get({lang:"pipe"})+'<br/>'+'('+locale.get({lang:"horz"})+')',
								type: 6,
								images:
								{
									el: 'pipe-b-h',
									t:'0'
								},
								endPoints:
								[
								{
									x:0,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:100,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }
								]
							},
							{
								name:  locale.get({lang:"blue"})+locale.get({lang:"pipe"})+'<br/>'+'('+locale.get({lang:"vert"})+')',
								type: 6,
								images:
								{
									el: 'pipe-b-v',
									t:'0'
								},
								endPoints:
								[
								{
									x:50,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }
								]
							}
							,{//=====================动态组件===========================================
								name:locale.get({lang:"indicating_lamp"}),
								type:'3',
								width:56,
								height:56,
								images:
								[
								 {
									 el:'red-lamp',
									 t:'0'
								 },{
									 el:'yellow-lamp',
									 t:'0',
									 hpercent: 0.01
								 },{
									 el:'green-lamp',
									 t:'0',
									 hpercent: 0.01 
								 }
								],
								endPoints:
								[{
									 x:50,
									 y:0,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:0,
									 y:50,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:100,
									 y:50,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:50,
									 y:100,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								}],
								url:'components/indicate-lamp/'
							},{
								name:locale.get({lang:"switch"}),
								type:'3',
								width:233,
								height:80,
								images:
								[
								 {
									 el:'switch-off',
									 t:'0'
								 },{
									 el:'switch-on',
									 t:'0',
									 hpercent: 0.01
								 }
								],
								endPoints:
								[{
									 x:0,
									 y:81,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:100,
									 y:81,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								}],
								url:'components/switch/'
							},{
								name:locale.get({lang:"thermometer"}),
								type:'3',
								minValue:-30,
								maxValue:50,
							    width:100,
								height:300,
								images:
								[
								 {
									 el:'thermometer-self',
									 t:'0',
									 width:100,
									 height:300
								 }
								],
								endPoints:
								[{
									 x:55,
									 y:0,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:55,
									 y:100,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								}],
								url:'components/thermometer/'
							},{
								name:locale.get({lang:"thermometer_experiment"}),
								type:'3',
								minValue:-20,
								maxValue:120,
								width:100,
								height:300,
								images:
								[
								 {
									 el:'thermometer_experiment',
									 t:'0',
									 width:100,
									 height:300
								 }
								],
								endPoints:
								[{
									 x:55,
									 y:0,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
									},{
									 x:55,
									 y:100,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								}],
								url:'components/thermometer_experiment/'
							},{
								name:locale.get({lang:"dashboard"}),
								type:'5',
								width:190,
								height:190,
								defaultValue:'default',
								titles:
									[
										{
											x: 48,
											y: 50,
											size:20,
											color:'#ccc',
											font: 'Italic',
											text: 'Dashboard'
										},
										{
											x: 30,
											y: 105,
											size:16,
											color:'#ccc',
											font: 'Italic',
											text: 'Water temperature'
										}
									],
								images:
								[
								 {
									 el:'dashboard',
									 t:'0',
									 width:190,
									 height:190
								 }
								],
								endPoints:
								[{
									 x:50,
									 y:0,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:0,
									 y:50,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:100,
									 y:50,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:50,
									 y:100,
								     rs:3,
									 cl:"blue",
									 fs:"orange"
							   }],
								url:'components/dashboard/'
							},{
								name:locale.get({lang:"pipeFlow"}),
								type:'7',
								width:377,
								height:20,
								images:
								[
								 {
									 el:'transverseWater',
									 t:'0'
								 }
								],
								endPoints:
								[{
									 x:50,
									 y:0,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:50,
									 y:100,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								}],
								url:'components/pipeFlow/'
							},{
								name:locale.get({lang:"verticalWater"}),
								type:'7',
								width:377,
								height:20,
								images:
								[
								 {
									 el:'verticalWater',
									 t:'0'
								 }
								],
								endPoints:
								[{
									 x:0,
									 y:50,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:100,
									 y:50,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								}],
								url:'components/verticalWater/'
							},{
								name:locale.get({lang:"ElectricMachinery"}),
								type:'3',
								width:221,
								height:137,
								images:
								[
								 {
									 el:'machineRed',
									 t:'0'
								 },{
									 el:'machineGreen',
									 t:'0',
									 hpercent: 0.01
								 }
								],
								endPoints:
								[{
									 x:0,
									 y:50,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								},{
									 x:100,
									 y:50,
									 rs:3,
									 cl:"blue",
									 fs:"orange"
								}],
								url:'components/ElectricMachinery/'
							}
				 		 ]
				 	},
				 	{
				 		_name:locale.get({lang:"air_conditioning_components"}),
				 		_id:'acsidebar',
				 		items:
				 		[
							{
								name:  locale.get({lang:"tank"}),
								type: 6,
								titles:
								{
									text: locale.get({lang:"tank"}),
									size: 12
								},
								images:
								[
									{
										el: 'tank',
										t:'0'
									},
									{
										el: 'tank-bar',
										t:'0',
										x: 17,
										y: 35,
										width: 53,
										height: 188,
										hpercent: 0.01
									}
								],
								endPoints:
								[
								    {
								        x:50,
										y:0,
										rs:3,
										cl:"blue",
										fs:"orange"
								    },
									{
										x:50,
										y:100,
										rs:3,
										cl:"blue",
										fs:"orange"
									 }
								]
							},
							{
								name: locale.get({lang:"solar"}),
								type: 6,
								images:
								{
									el: 'solar',
									t:'0'
								},
								endPoints:
								[
								 {
									x:50,
								    y:35,
									rs:3,
									cl:"blue",
									fs:"orange"
							     },
							     {
									x:15,
								    y:70,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:90,
								    y:70,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }
							  ]
							},
							{
								name: locale.get({lang:"valve"})+'<br/>'+'('+locale.get({lang:"north"})+')',
//								titles:
//								{
//									text: 'SV1'
//								},
								type: 6,
								images:
								{
									el: 'valve-n',
									t:'0'
								},
								endPoints:
								[{
									x:0,
									y:25,
									rs:3,
									cl:"blue",
									fs:"orange"
								  },
								  {
									x:100,
									y:25,
									rs:3,
									cl:"blue",
									fs:"orange"
								  },
								  {
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								  }]
							},
							{
								name: locale.get({lang:"valve"})+'<br/>'+'('+locale.get({lang:"south"})+')',
//								titles:
//								{
//									text: 'SV1'
//								},
								type: 6,
								images:
								{
									el: 'valve-s',
									t:'0'
								},
								endPoints:
								[{
									x:50,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:0,
									y:75,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:100,
									y:75,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }]
							},
							{
								name: locale.get({lang:"valve"})+'<br/>'+'('+locale.get({lang:"east"})+')',
								type: 6,
//								titles:
//								{
//									text: 'SV1'
//								},
								images:
								{
									el: 'valve-e',
									t:'0'
								},
								endPoints:
								[{
									x:25,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:100,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
								    x:25,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }]
							},
							{
								name:locale.get({lang:"valve"})+'<br/>'+'('+locale.get({lang:"west"})+')',
								type: 6,
//								titles:
//								{
//									text: 'SV1'
//								},
								images:
								{
									el: 'valve-w',
									t:'0'
								},
								endPoints:
								[{
									x:75,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:0,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:75,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }]
							},
							{
//								name: 'Valve <br/>(1 Way Horz)',
								name: locale.get({lang:"valve"})+'<br/>'+'('+'1'+locale.get({lang:"way"})+locale.get({lang:"horz"})+')',
//								titles:
//								{
//									text: 'SV1'
//								},
								type: 6,
								images:
								{
									el: 'valve-1w-h',
									t:'0'
								},
								endPoints:
								[{
									x:0,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:100,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }]
							},
							{
								name: locale.get({lang:"valve"})+'<br/>'+'('+'1'+locale.get({lang:"way"})+locale.get({lang:"vert"})+')',
//								titles:
//								{
//									text: 'SV1'
//								},
								type: 6,
								images:
								{
									el: 'valve-1w-v',
									t:'0'
								},
								endPoints:
								[{
									x:50,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }]
							},
							{
								name: locale.get({lang:"pump"})+'<br/>'+'('+locale.get({lang:"SE"})+')',
								type: 6,
								images:
								{
									el: 'pump-es',
									t:'0'
								},
								endPoints:
								[{
									x:25,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								  },
								  {
									x:15,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								  }]
							},
							{
								name: locale.get({lang:"pump"})+'<br/>'+'('+locale.get({lang:"NE"})+')',
								type: 6,
								images:
								{
									el: 'pump-ne',
									t:'0'
								},
								endPoints:
								[{
									x:0,
									y:75,
									rs:3,
									cl:"blue",
									fs:"orange"
								  },
								  {
									x:100,
									y:90,
									rs:3,
									cl:"blue",
									fs:"orange"
								  }]
							},
							{
								name: locale.get({lang:"pump"})+'<br/>'+'('+locale.get({lang:"NW"})+')',
								type: 6,
								images:
								{
									el: 'pump-nw',
									t:'0'
								},
								endPoints:
								[{
									x:0,
									y:90,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:100,
									y:75,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }]
							},
							{
								name: locale.get({lang:"pump"})+'<br/>'+'('+locale.get({lang:"SW"})+')',
								type: 6,
								titles:
								{
									x: 8,
									y: -8,
									text: 'P4',
									size: 12
								},
								images:
								{
									el: 'pump-ws',
									t:'0'
								},
								endPoints:
								[{
									x:75,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								  },
								  {
									x:90,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								  }]
							},
							{
								name: locale.get({lang:"Unit_Normal"}),
								type: 6,
								images:
								{
									el: 'unit-normal',
									t:'0'
								},
								titles:
								{
									x: 25,
									y: 28,
									size: 10,
									text: '0 C',
									color: '#ffffff'
								},
								endPoints:
								[{
									x:50,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:0,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:100,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }]
							},
							{
								name: locale.get({lang:"Unit_Disconnect"}),
								type: 6,
								images:
								{
									el: 'unit-disconnect',
									t:'0'
								},
								endPoints:
								[{
									x:50,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:0,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:100,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								 },
								 {
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								 }]
							},
							{
								name: locale.get({lang:"Unit_Yellow"}),
								type: 6,
								images:
								{
									el: 'unit-yellow',
									t:'0'
								},
								titles:
								{
									x: 25,
									y: 28,
									size: 10,
									text: '0 C',
									color: '#ffffff'
								},
								endPoints:
								[{
									x:50,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								},
								{
									x:0,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								},
								{
									x:100,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								},
								{
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
							    }]
							},
							{
								name: locale.get({lang:"Unit_Red"}),
								type: 6,
								images:
								{
									el: 'unit-red',
									t:'0'
								},
								titles:
								{
									x: 25,
									y: 28,
									size: 10,
									text: '0 C',
									color: '#ffffff'
								},
								endPoints:
								[{
									x:50,
									y:0,
									rs:3,
									cl:"blue",
									fs:"orange"
								},
								{
									x:0,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								},
								{
									x:100,
									y:50,
									rs:3,
									cl:"blue",
									fs:"orange"
								},
								{
									x:50,
									y:100,
									rs:3,
									cl:"blue",
									fs:"orange"
								}]
							},
							{
								name: locale.get({lang:"Water_Tap"}),
								type: 6,
								images:
								{
									el: 'water-tap',
									t:'0'
								},
								endPoints:
									[{
										x:0,
										y:90,
										rs:3,
										cl:"blue",
										fs:"orange"
									}]
							},
							{
								name: locale.get({lang:"Thermometer"}),
								type: 6,
								width: 12,
								height: 4,
								titles:
								[
									{
										x: -21,
										y: -5,
										size: 12,
										font: 'Arial',
										text: 'T51'
									}
								],
								images:
								{
									el: 'thermometer',
									t:'0'
								}
							}
				 		 ]
				 	}
//				 	},
				 	,{
				 		_name:locale.get({lang:"user_defined"}),
				 		_id:'customsidebar',
				 		items:
				 		[
				 		 	{
				 		 		name: locale.get({lang:"new_components"}),
				 		 		type:'2',
								images:{
									el: 'custom-none',
									t:'0'
								}
				 		 	}
				 		 	,{
		                        name: locale.get({lang:"dele_components"}),
		                        type:'delete',
	                            images:{
		                             el: 'custom-delete', 
		                              t:'0'
	                            }
	                        }
				 		]
				 	}
				 ]
			},
		define:{
			items:[
                   {
		           name: 'slide4_h',
	               titles:
	                     {
		                  text: 'slide4_h'
	                     },
	               images:
	                     [
		                  {
								el: 'slide4_h'
							},
							{
								el: 'slide4_h',
								x: 17,
								y: 35,
								width: 53,
								height: 188,
								hpercent: 0.01
							}
						]
					}
			      ]
		},
		defaultDeviceAttributes:{}
	};
	return Configure;
});

