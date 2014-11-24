define(function(require){
//	require("../../../scada/utils/Helper");
	require("./lang/zh-cn");
	var Utils = require("../scada/utils/Helper");
	require("cloud/lib/plugin/ext/resources/css/ext-all.css");
	require("cloud/lib/plugin/ext/resources/css/ux-all.css");
//	require("cloud/lib/plugin/ext/RadioboxSelectionModel");
	require("../resources/css/index.css");
//	require("../scada/components/canvas/Global");
	Ext.ns('Nts.Module.System.Agent');
	var cloud = require("cloud/base/cloud");
	var Button = require("cloud/components/button");
	var Uploader = require("cloud/components/uploader"); 
	var service = require("../../../reports/historydata/service");
	Nts.Module.System.Agent.AgentDrawableProperty = function( config, handler, scope )
	{
		Ext.applyIf(config,
		{
			lang: Lang.Module.System.Agent.AgentDrawableProperty,
			maximizable: false,
			minimizable: false,
			closable: true,	
			constrainHeader: true,
			modal:true,//表示弹出窗口后，父窗口能否有效
			width: 580,
			height: 320
		});
		
		Nts.Module.System.Agent.AgentDrawableProperty.superclass.constructor.call(this, config);
		Ext.QuickTips.init();
	};

	Ext.extend(Nts.Module.System.Agent.AgentDrawableProperty, Ext.Window,
	{
		lang: null,
		formPanel: null,
		titleGrid: null,
		imageGrid: null,
		endPointGrid: null,
		scalePanel:null,
		userCallback: null,
		drawable: null,
		img_name:null,
		img_id:null,
		src:null,
//		deviceList:null,
		siteId:null,
		siteList:null,
		global:null,
		initComponent: function()
		{
			var self = this;
			this.varTypes = [
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
			
			 this.variateGrid = this.createGridPanel({
				 name: 'variateGrid',
				 id:"variateGrid",
				 title: locale.get({lang:"variablesTitle"}),
				 tbar:true,
				 sm:true,
				 items: [],
				 columns:[
						{
							dataIndex: 'varName',
							header: locale.get({lang:"history_device_var"}),
							width: 180,
							defaultValue: 'New',
							sortable:true
						},
						{
							dataIndex: 'varType',
							header: locale.get({lang:"history_device_var_type"}),
							width: 100,
							defaultValue: 0,
							sortable:true
						},
						{
							dataIndex: 'units',
							header: locale.get({lang:"history_device_var_units"}),
							width: 100,
							defaultValue: 0,
							sortable:true
						},
						{//编辑变量公式
							dataIndex: 'formula',
							header: locale.get({lang:"history_device_var_formula"}),
//							+''+'('+locale.get({lang:"double_click_to_edit"})+')',
							width: 250,
							defaultValue: 0,
							sortable:true
//							editor: new Ext.form.TextField({})
						},
						{//newSite
							dataIndex: 'varId',
							header: '',
							width: 100,
							hidden:true,
							hideable:false
						},{
							dataIndex: 'deviceId',
							header: '',
							width: 100,
							hidden:true,
							hideable:false
						},{
							dataIndex: 'vid',
							header: '',
							width: 100,
							hidden:true,
							hideable:false
						}]
			});  
			if(this.drawable.type == '3'){
				 var data=[['120','120'],['100','100'],['90','90'],['80','80'],['70','70'],['60','60']];
			}else{
				 var data=[['240','240'],['180','180'],['140','140'],['120','120'],['100','100'],['90','90'],['80','80'],['70','70'],['60','60']];
			}
		   
			this.formPanel = new Ext.form.FormPanel(
			{
				iconCls: 'icon-grid',
				title: locale.get({lang:"basicTabTitle"}),
				frame: true,
				labelWidth: 80,
				labelAlign: 'right',
				defaultType: 'numberfield',
				defaults:
				{
					width: 90
				},
				items:
				[
				    {
					    fieldLabel: locale.get({lang:"x"}),
					    name: 'x',
					    value: this.drawable ? this.drawable.x : 0,
					    allowBlank : false,
					    emptyText:locale.get({lang:"cannot_be_empty"}),
					    regex:/^\d+$/,
					    regexText:locale.get({lang:"Can_not_be_negative"}),
					    maxValue:2000, //最大值   
		                maxText:locale.get({lang:"value_too_large"}),
				    },
				    {
					    fieldLabel: locale.get({lang:"y"}),
					    name: 'y',
					    value: this.drawable ? this.drawable.y : 0,
					    allowBlank : false,
						emptyText:locale.get({lang:"cannot_be_empty"}),
					    regex:/^\d+$/,
					    regexText:locale.get({lang:"Can_not_be_negative"}),
					    maxValue:2000, //最大值   
		                maxText:locale.get({lang:"value_too_large"}),
				    },
//				    {
//					    fieldLabel: locale.get({lang:"z"}),
//					    name: 'z',
//					    value: this.drawable ? this.drawable.z : 0,
//					    allowBlank : false,
//					    emptyText:locale.get({lang:"cannot_be_empty"}),
//					    regex:/^\d+$/,
//					    regexText:locale.get({lang:"Can_not_be_negative"}),
//				    },
				    {
					    fieldLabel: locale.get({lang:"width"}),
					    name: 'width',
					    value: this.drawable ? this.drawable.width : 0,
					    allowBlank : false,
					    emptyText:locale.get({lang:"cannot_be_empty"}),
					    regex:/^[1-9]\d*(\.\d+)?$/,
						regexText:locale.get({lang:"Can_not_be_Positive"}),
						maxValue:2000, //最大值   
			            maxText:locale.get({lang:"value_too_large"})
				    },
				    {
					    fieldLabel: locale.get({lang:"height"}),
					    name: 'height',
					    value: this.drawable ? this.drawable.height : 0,
					    allowBlank : false,
					    emptyText:locale.get({lang:"cannot_be_empty"}),
					    regex:/^[1-9]\d*(\.\d+)?$/,
						regexText:locale.get({lang:"Can_not_be_Positive"}),
						maxValue:2000, //最大值   
			            maxText:locale.get({lang:"value_too_large"})
				    },{
				    	xtype:'combo',
				    	fieldLabel: locale.get({lang:"displayScale"}),
						id:'display',
                        store: new Ext.data.SimpleStore({
                        fields: ['id', 'name'],
                        data: data,
                        }),
                        mode: 'local',
                        displayField:'name',
                        valueField:'id',
                        triggerAction: 'all',
                        listeners:{
                            'select':function() {
                            	var value=this.getValue();
                            	self.onDisplayScale(value);
                            }
                        }
				    }
				],
				keys:
				{
					key: Ext.EventObject.ENTER,
					handler: this.onOK,
					scope: this
				}
			});
			var widthValue=null;
			var heightValue=null;
			if(this.drawable.m){
				if(this.drawable.m.pipeTo || this.drawable.m.pipeTo == 0){
					if(this.drawable.m.pipeTo == 1){
						widthValue=this.drawable && this.drawable.pipeW ? this.drawable.pipeW : 452;
						heightValue=this.drawable && this.drawable.pipeH ? this.drawable.pipeH : 20;
					}else if(this.drawable.m.pipeTo == 0){
					    widthValue=this.drawable && this.drawable.pipeW ? this.drawable.pipeW : 20;
						heightValue=this.drawable && this.drawable.pipeH ? this.drawable.pipeH : 452;
					}
				}
			}
			
			this.pipeForm = new Ext.form.FormPanel(
			{
					iconCls: 'icon-grid',
					title: locale.get({lang:"basicTabTitle"}),
					frame: true,
					labelWidth: 80,
					labelAlign: 'right',
					defaultType: 'numberfield',
					defaults:
					{
						width: 90
					},
					items:
					[
                      {
                        fieldLabel: locale.get({lang:"x"}),
                        name: 'x',
                        value: this.drawable ? this.drawable.x : 0,
                        allowBlank : false,
                        emptyText:locale.get({lang:"cannot_be_empty"}),
                        regex:/^\d+$/,
                        regexText:locale.get({lang:"Can_not_be_negative"}),
                        maxValue:2000, 
                        maxText:locale.get({lang:"value_too_large"})
                      },
                      {
                        fieldLabel: locale.get({lang:"y"}),
                        name: 'y',
                        value: this.drawable ? this.drawable.y : 0,
                        allowBlank : false,
	                    emptyText:locale.get({lang:"cannot_be_empty"}),
                        regex:/^\d+$/,
                        regexText:locale.get({lang:"Can_not_be_negative"}),
                        maxValue:2000,   
                        maxText:locale.get({lang:"value_too_large"})
                      }, 
                      {
					    fieldLabel: locale.get({lang:"width"}),
					    name: 'pipeW',
					    value: widthValue,
					    allowBlank : false,
					    emptyText:locale.get({lang:"cannot_be_empty"}),
					    regex:/^[1-9]\d*(\.\d+)?$/,
						regexText:locale.get({lang:"Can_not_be_Positive"}),
						maxValue:2000,  
			            maxText:locale.get({lang:"value_too_large"})
				      },  
				      {
					    fieldLabel: locale.get({lang:"height"}),
					    name: 'pipeH',
					    value: heightValue,
					    allowBlank : false,
					    emptyText:locale.get({lang:"cannot_be_empty"}),
					    regex:/^[1-9]\d*(\.\d+)?$/,
						regexText:locale.get({lang:"Can_not_be_Positive"}),
						maxValue:2000, 
			            maxText:locale.get({lang:"value_too_large"})
				      }
					]
			});
			var disabled=null;
			var pipeFlag=null;
			var pipeCo=null;
			if(this.drawable.machine){
				disabled="hidden";
				pipeFlag="hidden";
				pipeCo="hidden";
			}else{
				disabled="combo";
				pipeFlag="button";
				pipeCo="textfield";
			}
			this.variateForm = new Ext.form.FormPanel(
			{
				iconCls: 'icon-grid',
				title: locale.get({lang:"variableSet"}),
				frame: true,
				labelWidth: 80,
				labelAlign: 'right',
				defaultType: 'numberfield',
				defaults:
				{
					width: 90
				},
				items:
					[
					   {
						    xtype:disabled,
						    fieldLabel: locale.get({lang:"flowTo"}),
							id:'flowTo',
		                    store: new Ext.data.SimpleStore({
		                        fields: ['id', 'name'],
		                        data: [['0','反向'],['1','正向']]}),
		                    mode: 'local',
		                    displayField:'name',
		                    valueField:'id',
		                    triggerAction: 'all',
		                    listeners:{
		                            'select':function() {
		                            	var value=this.getValue();
		                            	self.onFlowTo(value);
		                             }
		                    }
						},{
							xtype: pipeCo,
							readOnly:true,
							fieldLabel: locale.get({lang:"pipeColor"}),
							name: 'pipeColor',
							id:'pipe_Color',
							value: this.drawable && this.drawable.pipeColor ? this.drawable.pipeColor : '#000000',
							allowBlank : false,
							emptyText:locale.get({lang:"cannot_be_empty"})
						},{
						    xtype:pipeFlag, 
						    fieldLabel:locale.get({lang:"please_select"}),
				            width:90,  
				            height: 23,  
				            menu:  
				                {  
				                    xtype:'colormenu',  
				                    listeners:   
				                    {  
				                        select: function(picker, color)       
				                        {  
				                          var color = "#"+color;
				                          Ext.getCmp("pipe_Color").setValue(color);
				                        }  
				                    }  
				                }
						},{
							 xtype:'combo',
							 fieldLabel: locale.get({lang:"variableValue"}) + '('+locale.get({lang:"variableflow"}) + ')',
							 id:'variableValueflow',
			                 store: new Ext.data.SimpleStore({
			                        fields: ['id', 'name'],
			                        data: [['1','大于'],['2','等于'],['3','小于']]}),
			                 mode: 'local',
			                 displayField:'name',
			                 valueField:'id',
			                 triggerAction: 'all',
			                 listeners:{
			                          'select':function() {
			                             var value=this.getValue();
			                             self.onvariableValueflow(value);
			                          }
			                 }
						},{
							  name: 'flowValue',
							  value: this.drawable && this.drawable.flowValue ? this.drawable.flowValue : 0,
							  allowBlank : false,
							  emptyText:locale.get({lang:"cannot_be_empty"})
						},{
							 xtype:'combo',
							 fieldLabel: locale.get({lang:"variableValue"}) + '('+locale.get({lang:"variablestop"}) + ')',
							 id:'variableValuestop',
			                 store: new Ext.data.SimpleStore({
			                        fields: ['id', 'name'],
			                        data: [['1','大于'],['2','等于'],['3','小于']]}),
			                 mode: 'local',
			                 displayField:'name',
			                 valueField:'id',
			                 triggerAction: 'all',
			                 listeners:{
			                          'select':function() {
			                             var value=this.getValue();
			                             self.onvariableValuestop(value);
			                          }
			                 }
						},{
						    name: 'stopValue',
						    value: this.drawable && this.drawable.stopValue ? this.drawable.stopValue : 0,
						    allowBlank : false,
						    emptyText:locale.get({lang:"cannot_be_empty"})
					     }
					]
			});
			this.titleGrid = this.createGridPanel(
			{
				name: 'titleGrid',
				title: locale.get({lang:"titleGridTitle"}),
				items: this.drawable ? this.drawable.titles : [],
				deleteType:2,
				columns:
				[
					{
						dataIndex: 'text',
					    header: locale.get({lang:"text"}),
					    width: 60,
					    defaultValue: 'New',
					    editor: new Ext.form.TextField({})
					},
					{
						dataIndex: 'x',
					    header: locale.get({lang:"x"}),
					    width: 80,
					    defaultValue: 0,
					    editor: new Ext.form.NumberField({})
					},
					{
						dataIndex: 'y',
					    header: locale.get({lang:"y"}),
					    width: 80,
					    defaultValue: 0,
					    editor: new Ext.form.NumberField({})
					},
					this.createBooleanColumn(
					{
						dataIndex: 'bold',
					    header:locale.get({lang:"bold"}),
					    width: 40,
					    defaultValue: 0
					}),
					{
						dataIndex: 'size',
					    header: locale.get({lang:"size"}) + '(px)',
					    width: 60,
					    defaultValue: 0,
					    editor: new Ext.form.NumberField({})
					},
					{
						dataIndex: 'font',
					    header: locale.get({lang:"font"}),
					    width: 40,
					    defaultValue: '',
					    editor: new Ext.form.TextField({})
					},
					{
						dataIndex: 'color',
					    header: locale.get({lang:"color"}),
					    width: 50,
					    defaultValue: '',
					    editor: new Ext.form.TextField({})
					},
					{
						dataIndex: 'textAlign',
					    header:locale.get({lang:"textAlign"}),
					    width: 130,
					    defaultValue: '',
					    editor: new Ext.form.TextField({})
					},
					{
						dataIndex: 'deleteType',
						header: '',
						defaultValue: '0',
						hidden:true,
						hideable:false
					},
					{
						dataIndex: 'rotation',
						header: '',
						defaultValue: '',
						hidden:true,
						hideable:false
					}
				]
			});
			
			this.imageGrid = this.createGridPanel(
			{
				name: 'imageGrid',
				title: locale.get({lang:"imageGridTitle"}),
				items: this.drawable ? this.drawable.images : [],
				imgvar:true,		
				columns:
				[
					{
						dataIndex: 'el',
					    header: locale.get({lang:"el"}),
					    width: 150,
					    defaultValue: '',
					    editor: new Ext.form.TextField({})
					},
//					,{
//						dataIndex: 'x',
//					    header: locale.get({lang:"x"}),
//					    width: 50,
//					    defaultValue: 0,
//					    editor: new Ext.form.NumberField({})
//					},
//					{
//						dataIndex: 'y',
//					    header: locale.get({lang:"y"}),
//					    width: 50,
//					    defaultValue: 0,
//					    editor: new Ext.form.NumberField({})
//					},
					{
						dataIndex: 'width',
					    header:locale.get({lang:"width"}),
					    width: 70,
					    defaultValue: 0,
					    editor: new Ext.form.NumberField({})
					},
					{
						dataIndex: 'height',
					    header: locale.get({lang:"height"}),
					    width: 70,
					    defaultValue: 0,
					    editor: new Ext.form.NumberField({})
					},
					{
						dataIndex: 'wpercent',
					    header: locale.get({lang:"wpercent"}),
					    width: 120,
					    defaultValue: 0,
					    editor: new Ext.form.NumberField({})
					},
					{
						dataIndex: 'hpercent',
					    header: locale.get({lang:"hpercent"}),
					    width: 140,
					    defaultValue: 0,
					    editor: new Ext.form.NumberField({})
					},
					{
						dataIndex: 'deleteType',
						header: '',
						defaultValue: '0',
						hidden:true,
						hideable:false
					},
					{
						dataIndex: 'rotation',
						header: '',
						defaultValue: '',
						hidden:true,
						hideable:false
					}
				]
			});
			
			this.endPointGrid = this.createGridPanel(
					{
						name: 'endPointGrid',
						title: locale.get({lang:"endPointGridTitle"}),
						items: this.drawable ? this.drawable.endPoints : [],
						columns:
						[
                            {
	                            dataIndex: 'x',
                                header: locale.get({lang:"x"}),
                                width: 100,
                                editor: new Ext.form.NumberField({
                                	allowBlank : false,
							    	blankText:locale.get({lang:"cannot_be_empty"}),
							    	maxValue:100,   
						            maxText:locale.get({lang:"value_too_large"}),
						            regex: /^[0-9]*[1-9][0-9]*$/,
		        				    regexText:locale.get({lang:"must_be_a_positive_integer"}),
                                })
                            },
                            {
	                            dataIndex: 'y',
                                header: locale.get({lang:"y"}),
                                width: 100,
                                editor: new Ext.form.NumberField({
                                	allowBlank : false,
							    	blankText:locale.get({lang:"cannot_be_empty"}),
							    	maxValue:100,   
						            maxText:locale.get({lang:"value_too_large"}),
						            regex: /^[0-9]*[1-9][0-9]*$/,
		        				    regexText:locale.get({lang:"must_be_a_positive_integer"}),
                                })
                            },
                            {
	                            dataIndex: 'rs',
                                header: locale.get({lang:"fontSize"}),
                                width: 100
                            },
                            {
	                            dataIndex: 'cl',
                                header: locale.get({lang:"border_color"}),
                                width: 100
                            },
                            {
	                            dataIndex: 'fs',
                                header: locale.get({lang:"fill_color"}),
                                width: 100
                            }
						]
					});
			this.customImageGrid = this.createGridPanel(
					{
						name: 'customImageGrid',
						title: locale.get({lang:"customImageGridTitle"}),
						items:[],
						ctb:true,
						columns:
						[
							{
								dataIndex: 'el',
							    header: locale.get({lang:"el"}),
							    width: 200,
							    defaultValue: '',
							    editor: new Ext.form.TextField({
							    	allowBlank : false,
							    	blankText:locale.get({lang:"cannot_be_empty"}),
							    	maxLength : 15,
							    	maxLengthText : locale.get({lang:"cannot_be_max"})
							    })
							},
							{
								dataIndex: 'width',
							    header:locale.get({lang:"width"}),
							    width: 70,
							    defaultValue: 0
//							    editor: new Ext.form.NumberField({})
							},
							{
								dataIndex: 'height',
							    header: locale.get({lang:"height"}),
							    width: 70,
							    defaultValue: 0
//							    editor: new Ext.form.NumberField({})
							},
							{
								dataIndex: '_id',
								header: '',
								hidden:true,
								hideable:false
							}
						]
					});
			//==================刻度设置tab页面======================================
			var self=this;
			this.scalePanel= new Ext.form.FormPanel(
			{
				iconCls: 'icon-grid',
				title: locale.get({lang:"scaleTitle"}),
				frame: true,
				labelWidth: 80,
				labelAlign: 'right',
				defaultType: 'numberfield',
				defaults:
				{
					width: 90
				},
				items:
				[
				    {
					    fieldLabel: locale.get({lang:"minValue"}),//最小值
					    name: 'minValue',
					    value: this.drawable.minValue ? this.drawable.minValue : 0,
					    allowBlank : false,
					    emptyText:locale.get({lang:"cannot_be_empty"}),
					    regex:/^-?\d+$/,
					    regexText:locale.get({lang:"valueInteger"})
				    },{
					    fieldLabel: locale.get({lang:"maxValue"}),//最大值
					    name: 'maxValue',
					    value: this.drawable.maxValue ? this.drawable.maxValue :100,
					    allowBlank : false,
					    emptyText:locale.get({lang:"cannot_be_empty"}),
					    regex:/^-?\d+$/,
					    regexText:locale.get({lang:"valueInteger"}),
					    vtype:'maxValue'
				    },{
					    fieldLabel: locale.get({lang:"aliquots"}),//几等分
					    name: 'aliquots',
					    value: this.drawable.aliquots ? this.drawable.aliquots : 5,
					    allowBlank : false,
					    emptyText:locale.get({lang:"cannot_be_empty"}),
					    maxValue:10, //最大为10等分   
			            maxText:locale.get({lang:"value_too_large"}),
					    regex:/^-?\d+$/,
					    regexText:locale.get({lang:"valueInteger"}),
					    vtype:'aliquots'
				    },{
				    	xtype:'combo',
				    	fieldLabel: locale.get({lang:"displayScale"}),
						id:'displayScale',
                        store: new Ext.data.SimpleStore({
                        fields: ['id', 'name'],
                        data: [['120','120'],['110','110'],['100','100'],['90','90'],['80','80'],['70','70'],['60','60']]}),
                        mode: 'local',
                        displayField:'name',
                        valueField:'id',
                        triggerAction: 'all',
                        listeners:{
                            'select':function() {
                            	var value=this.getValue();
                            	self.onDisplayScale(value);
                            }
                        }
				    }
				]
			});
			//对最大值和等分进行校验
			Ext.apply(Ext.form.VTypes,{
				'aliquots':function(_v){
					var scaleValues=self.scalePanel.getForm().getFieldValues();
					var range=scaleValues.maxValue-scaleValues.minValue;
				    if(range % _v === 0){
				    	return true;
				    }else{
				    	return false;
				    }
			     },   
			     aliquotsText:locale.get({lang:"aliquotsCheck"})
		    },{
		    	'maxValue':function(_v){
		    		var scaleValues=self.scalePanel.getForm().getFieldValues();
		    		if(_v > scaleValues.minValue){
		    			return true;
		    		}else{
		    		    return false;
		    		}
		    	},
		    	maxValueText:locale.get({lang:"maxValueCheck"})
		    }); 
            //==============================================================================
			var items=[];
			if(this.drawable.machine){//电机
				items=[this.variateGrid,this.variateForm,this.formPanel,this.titleGrid, this.imageGrid];
			}else{
				if(this.drawable.type==1 || this.drawable.type==3){//标签  || 动态组件
					items=[this.variateGrid,this.formPanel, this.titleGrid, this.imageGrid];
				}else if(this.drawable.type==2){//自定义上传按钮
					items=[this.customImageGrid];
				}else if(this.drawable.type==5){//仪表盘
					items=[this.variateGrid,this.scalePanel];
				}else if(this.drawable.type==6){//其他组件
					items=[this.formPanel, this.titleGrid, this.imageGrid];
				}else if(this.drawable.type==7){
					items=[this.variateGrid,this.variateForm,this.pipeForm];
				}else{//自定义图片
					items=[this.formPanel, this.titleGrid, this.imageGrid, this.endPointGrid];
				}
			}
			
			
			
			Ext.applyIf(this, 
			{
				iconCls: 'icon-property',
				title: locale.get({lang:"title"}),
				layout: 'fit',
				items:
				{
					xtype: 'tabpanel',
					activeTab: 0,
					id:'optionTable',
					frame: false,
					bodyBorder: false,
					border: false,
					deferredRender: false,
					resizeTabs: true,
					tabWidth: 100,
					minTabWidth: 30,
					items:items,
					listeners:{
						'tabchange':function(){
						}
					}
				},
				buttons:
				[
					{
						iconCls: 'icon-ok',
						text: locale.get({lang:"okText"}),
						handler: this.onOK,
						scope: this
					},
					{
						iconCls: 'icon-cancel',
						text:locale.get({lang:"cancelText"}),
						handler: this.onCancel,
						scope: this
					}
				],
				listeners:
				{
					'afterrender': function()
					{
						Utils.randomCenterWindow(this, 20, 20);
						Utils.delayCall(this.onAfterRender, this, 100);
						var siteId=null;
						//填充全局   现场下拉框
						var siteStore=new Ext.data.SimpleStore({
							fields : ['id', 'name'],
						    data :this.siteList
						});
						Ext.getCmp('siteCom').clearValue();
			            Ext.getCmp('siteCom').store = siteStore;
			            if (Ext.getCmp('siteCom').view) {  //刷新视图,避免视图值与实际值不相符
			            	Ext.getCmp('siteCom').view.setStore(siteStore);
			            }
						if(this.siteList){
							if(this.siteId){
								siteId=Ext.isArray(this.drawable.address)&&this.drawable.address[0].varId?this.drawable.address[0].varId.split("_")[0]:this.siteId;
							}else{
								var idFirst=this.siteList[0];
								var id=idFirst[0];
								siteId=Ext.isArray(this.drawable.address)&&this.drawable.address[0].varId?this.drawable.address[0].varId[0].split("_")[0]:id;
							}
							Ext.getCmp('siteCom').setValue(siteId);
							this.onSelectSite(siteId);
							if(this.drawable.type == 2){
								this.initUploader();
							}
						}
						if(this.drawable.displayScale){
							Ext.getCmp('displayScale').setValue(this.drawable.displayScale);
						}else{
							Ext.getCmp('displayScale').setValue("100");
						}
						if(this.drawable.displayScale){
							Ext.getCmp('display').setValue(this.drawable.displayScale);
						}else{
							Ext.getCmp('display').setValue("100");
						}
						if(this.drawable.flowTo){
							Ext.getCmp('flowTo').setValue(this.drawable.flowTo);
						}else{
							Ext.getCmp('flowTo').setValue("1");
						}
						if(this.drawable.variableValueflow){
							Ext.getCmp('variableValueflow').setValue(this.drawable.variableValueflow);
						}else{
							Ext.getCmp('variableValueflow').setValue("1");
						}
						if(this.drawable.variableValuestop){
							Ext.getCmp('variableValuestop').setValue(this.drawable.variableValuestop);
						}else{
							Ext.getCmp('variableValuestop').setValue("3");
						}
					}
				}
			});
			
			Nts.Module.System.Agent.AgentDrawableProperty.superclass.initComponent.call(this);
		},
		onDisplayScale:function(value){
			this.drawable.displayScale=value;
		},
		onFlowTo:function(value){
			this.drawable.flowTo=value;
		},
		onvariableValueflow:function(value){
			this.drawable.variableValueflow=value;
		},
		onvariableValuestop:function(value){
			this.drawable.variableValuestop=value;
		},
		createGridPanel: function( config )
		{
			var self = this;
			var fields = [];
			var columns = [];
			var defaultValues = {};
			
			if(config.items && config.items.length > 0 && this.drawable.type=='1' && config.deleteType){
				for(var i=0; i < config.items.length; i++){
					config.items[i].deleteType=1;
					if(i == 1){
						break;
					}
				}
			}
			
//			if(this.drawable.type == '3' && config.imgvar){
//				var column = {
//						dataIndex: 'var',
//					    header: locale.get({lang:"history_device_var_value"}),
//					    width: 70,
//					    defaultValue: '',
//					    editor: new Ext.form.TextField({})
//					};
//				config.columns.push(column);
//			}
			
			//上传按钮
			var upload= {
					iconCls: 'icon-move-up',
					cls:'upload-button',
					text: locale.get({lang:"upload_picture"}),
					scope: this
			};
			//其它工具按钮
			var tbarTool = [
							{
								iconCls: 'icon-new',
								text: locale.get({lang:"newText"}),
								handler: this.getGridAction(config.name, this.onAddGridItem, this),
								scope: this
							},
							{
								iconCls: 'icon-delete',
								text: locale.get({lang:"deleteText"}),
								handler: this.getGridAction(config.name, this.onDeleteGridItem, this),
								scope: this
							}
//							,
//							'-',
//							{
//								iconCls: 'icon-move-up',
//								text: locale.get({lang:"moveUpText"}),
//								handler: this.getGridAction(config.name, this.onMoveGridItem, this, true),
//								scope: this
//							},
//							{
//								iconCls: 'icon-move-down',
//								text: locale.get({lang:"moveDownText"}),
//								handler: this.getGridAction(config.name, this.onMoveGridItem, this, false),
//								scope: this
//							}
						];
			var customToolbar = [
									{
										iconCls: 'icon-delete',
										text: locale.get({lang:"deleteText"}),
										handler: this.getGridAction(config.name, this.onDeleteGridItem, this),
										scope: this
									},
									'-',
									upload
			                     ];
			//判断是否是全局的还是现场的
			var editable=null;
			var readOnly=null;
			
			if(self.global==1){
				 editable=true;
				 readOnly=false;
				 
			}else{
				 editable=false;
				 readOnly=true;
			}
			
			//现场选择
			var variateTbar = [locale.get({lang:"site"}),
			                   {
									xtype:'combo',
									id:'siteCom',
			                        store: new Ext.data.SimpleStore({
			                        fields: ['id', 'name'],
			                        data: this.siteList}),
			                        mode: 'local',
			                        displayField:'name',
			                        valueField:'id',
			                        triggerAction: 'all',
			                        emptyText: locale.get({lang:"please_select_site"}),
			                        editable: editable,
			                        readOnly:readOnly,
			                        listeners : {
			                            'select' : function() {
			                            	var siteId=this.getValue();
			                            	self.onSelectSite(siteId);
			                            }
			                        }
			                	},locale.get({lang:"device"}),
			                 	{
			                		xtype:'combo',
			                 		id:"deviceCom",
			                        store: new Ext.data.Store(),
			                        mode: 'local',
			                        displayField:'name',
			                        valueField:'id',
			                        triggerAction: 'all',
			                        emptyText: locale.get({lang:"please_select_device"}),
			                        listeners : {
			                            'select' : function() {
			                            	var deviceId = this.getValue().split("_")[0];
			                            	var moduleId = this.getValue().split("_")[1];
			                            	self.onSelectDevice(moduleId,deviceId);
			                            }
			                        }
			                	},
								{
			                		iconCls: 'icon-formula',
									text: locale.get({lang:"editFormula"}),
									handler: this.getGridAction(config.name, this.getFormulaAction, this),
									scope: this
								}
			                ];
			if(config.tbar){
				tbarTool = variateTbar;
			}
			
			if(config.ctb){
				tbarTool = customToolbar;
			}
			var sm = null;
			if(config.sm){
				if(self.global==1){
					
					if(this.drawable.type==1){
						sm = new Ext.grid.CheckboxSelectionModel({singleSelect : true});
					}else{
						sm = new Ext.grid.CheckboxSelectionModel();
					}
				}else{
					sm = new Ext.grid.CheckboxSelectionModel({singleSelect : true});
//					sm = new Ext.grid.RadioboxSelectionModel({singleSelect : true});
				}
				columns.push(sm);
			}
			for( var i = 0; i < config.columns.length; i ++ )
			{
				var column = config.columns[i];
//				if( !column.tooltip )
//				{
//					column.tooltip = column.header;
//				}
				fields.push(column.dataIndex);
				columns.push(Ext.apply({}, column));
				defaultValues[column.dataIndex] = column.defaultValue;
			}
			
			var store = new Ext.data.JsonStore(
			{
				fields: fields,
				root: 'rows'
			});
			var grid = new Ext.grid.EditorGridPanel(
			{
				iconCls: 'icon-grid',
				title: config.title,
				store: store,
				columns: columns,
				sm:sm,
				defaultValues: defaultValues,
				tbar:tbarTool
			});
			
			store.loadData(
			{
				rows: config.items || []
			});
			return grid;
		},
		//上传自定义图片
	    initUploader: function(){
	            var self = this;
	            var btnId = $(".upload-button").find("button").first().attr("id");
	            if(this.uploader){
	            	this.uploader.destroy();
	            }
	            var uploaderUrl = cloud.config.FILE_SERVER_URL + "/api/file?access_token=" + cloud.Ajax.getAccessToken(); //+ "&file_name=" + fileName;
	            this.uploader = new Uploader({
	                browseElement:btnId,
	                url: uploaderUrl,
	                autoUpload: true,
	                filters: [{
	                    title: "Image files",
	                    extensions: "jpg,png"
	                }],
	                maxFileSize: "1024kb",//1M
	                events: {
						"onFilesAdded" : function(file){
//							console.log(file);
							img_name=file[0].name.substring(0,file[0].name.lastIndexOf('.'));
							
						//	console.log(img_name);
							
						},
	                    "onFileUploaded": function(response, file){
	                    	if (response.result && response.result._id) {
	                    		img_id=response.result._id;
	                    		var record = new Ext.data.Record({"el":img_name,"width":"100","height":"100","_id":img_id});
	                    		self.customImageGrid.getStore().add([record]);
	                    	}
	                    },
						"onError": function(err){
							if(err.code == -600){
								Ext.Msg.alert(locale.get({lang:"prompt"}), locale.get({lang:"file_too_large"}));
							}else if(err.code == -601){
								Ext.Msg.alert(locale.get({lang:"prompt"}), locale.get({lang:"file_format_not_correct"}));
							}
							
//							err.code === -600 && dialog.render({container:"#nav-account-panel",lang:"file_too_large"});
						}
	                    
	                }
	            });
	    },
		createBooleanColumn: function( config )
		{
			var column = Ext.apply(
			{
			    editor: new Ext.form.ComboBox(
			    {
			    	model: 'local',
			    	triggerAction: 'all',
			    	editable: false,
			    	store: [[1, locale.get({lang:"yesText"})], [0, locale.get({lang:"noText"})]]
			    }),
			    renderer: function( value )
			    {
			    	return value ? locale.get({lang:"yesText"}) : locale.get({lang:"noText"});
			    }
			}, config);
			return column;
		},
		
		getGridAction: function( name, callback, scope, params )
		{
			return function()
			{
				callback.call(scope, scope[name], params);
			};
		},
		
		onAddGridItem: function( grid )
		{
			var record = null;
			if(grid.title == locale.get({lang:"endPointGridTitle"})){
				var data = {};
				data.x='';
				data.y='';
				data.rs=3;
				data.cl='blue';
				data.fs='orange';
				record  = new Ext.data.Record(data);
			}else if(grid.title == locale.get({lang:"titleGridTitle"})){
				var data = {};
				data.text='New';
				data.x='';
				data.y='';
				data.bold='';
				data.size='';
				data.font='';
				data.color='';
				data.textAlign='';
				record  = new Ext.data.Record(data);
			}else if(grid.title == locale.get({lang:"imageGridTitle"})){
				var data = {};
				data.el='';
				data.width=0;
				data.height=0;
				data.wpercent=0;
				data.hpercent=0;
				record  = new Ext.data.Record(data);
			}else{
				record  = new Ext.data.Record(grid.defaultValues);
			}
			
			grid.getStore().add([record]);
		},
		getFormulaAction:function(grid){
			var self = this;
			var formulas = {};
			var variateSelected=grid.getSelectionModel().getSelected();
			if(variateSelected){
				
				var formula = variateSelected.get('formula');
				
				var formulaVal = "";
				if(formula!=""){
					formulaVal = formula;
				}else{
					formulaVal = "_"+variateSelected.get('varId');
				}
				
				Ext.MessageBox.show({
					title:locale.get({lang:"history_device_var_formula"}),
					width: 300 ,
					buttons:{ok : locale.get({lang:"okText"}),
						cancel : locale.get({lang:"cancelText"})
					},
					multiline:  true ,
					fn:callBack,
					value:formulaVal
				});
				function callBack(id,msg){
					if(id=="ok"){
						var vars = variateSelected.get('deviceId').split("_");
						var deviceId = vars[0];
						var modelId = vars[1];
						var formula_varId=vars[2];
						formulas[variateSelected.get('varId')]= msg;
						self.selectDeviceCallBack(self.varResults,deviceId,modelId,formulas);
						//==================================================================
						var formula_varId=variateSelected.get('varId');
						var total = self.variateGrid.getStore().getCount();
			            for (var i = 0; i <total; i++) {
				    	     var varId=self.variateGrid.getStore().getAt(i).get('varId');
				             if(varId == formula_varId){
				                	self.variateGrid.getSelectionModel().selectRow(i);
				             }
			            }
			            //==================================================================
					}
				}
			}else{
				dialog.render({lang:"please_select_var"});
			}
		},
		onSelectSite:function(siteId){
			var self = this;
			var deviceList = [];
			
			service.getDeviceList(siteId,function(data){
				var deviceResult = data.result;
				//获取drawable里已保存的变量信息
				var siteId_alias_varId=[];
				if(self.global==1){
					 if(self.drawable.address && Ext.isArray(self.drawable.address)&&self.drawable.address[0].varId){
		                	siteId_alias_varId=self.drawable.address[0].varId[0].split("_");
		                }
				}else{
					 if(self.drawable.address && Ext.isArray(self.drawable.address)&&self.drawable.address[0].varId){
		                	siteId_alias_varId=self.drawable.address[0].varId.split("_");
		                }
				}
                
                var deviceName=null;
                var deviceAlias=null;
                var varObj={};//key:设备列表      value:modelId
				for(var i = 0 ; i < deviceResult.length ; i++) {
					varObj[deviceResult[i].alias]=deviceResult[i].modelId;
					var list=[];
					if(deviceResult[i].alias){
						list.push(deviceResult[i].alias+"_"+deviceResult[i].modelId);
					}else{
						list.push("gw_"+deviceResult[i].modelId);
					}
					list.push(deviceResult[i].name);
					deviceList.push(list);
					
					if(deviceResult[i].alias){
					   if(deviceResult[i].alias == siteId_alias_varId[1]){
						  deviceName = deviceResult[i].name;
						  deviceAlias=deviceResult[i].alias;
					   }
					}else{
					   deviceAlias="gw";
					}
				}
				
				var deviceStore=new Ext.data.SimpleStore({
					fields : ['id', 'name'],
				    data : deviceList
				});
				Ext.getCmp('deviceCom').clearValue();
                Ext.getCmp('deviceCom').store = deviceStore;
                if (Ext.getCmp('deviceCom').view) {  //刷新视图,避免视图值与实际值不相符
                	Ext.getCmp('deviceCom').view.setStore(deviceStore);
                }
                Ext.getCmp('deviceCom').enable();
                //设备下拉框回显设备名称
                Ext.getCmp('deviceCom').setValue(Ext.isArray(self.drawable.address)&&self.drawable.address[0].varId?deviceName:(deviceResult[0]?deviceResult[0].name : ""));
                //显示变量列表
                if(siteId_alias_varId.length>0 && deviceName){ 
                	self.onSelectDevice(Ext.isArray(self.drawable.address)&&self.drawable.address[0]?varObj[siteId_alias_varId[1]]:deviceResult[0].modelId,Ext.isArray(self.drawable.address)&&self.drawable.address[0].varId?siteId_alias_varId[1]:deviceAlias);
                }else{
                	if(deviceResult.length>0){
                		var alias=null;
                		if(deviceResult[0].alias){
                			alias=deviceResult[0].alias;
                		}else{
                			alias="gw";
                		}
                		Ext.getCmp('deviceCom').setValue(deviceResult[0].name);
                		self.onSelectDevice(deviceResult[0].modelId,alias);
                		
                	}
                }
                
				
//				Model.machine({
//	        		method:"query_list",
//	        		param:{
//	        			verbose: 100,
//	        			site_id: siteId
//	        		},
//	        		error:function(err){
//	        		},
//	        		success:function(machine){
//	        			var result = machine.result;
//	        			for(var i=0;i<result.length;i++){
//	        				var machineList = [];
//	        				machineList.push(result[i]._id+"_"+result[i].modelId);
//	        				machineList.push(result[i].name);
//	        				deviceList.push(machineList);
//	        				if(result[i]._id == deviceId_modelId[0]){
//	        					deviceName = result[i].name;
//	        				}
//	        			}
//	        			
//	        			
//	        		}
//	        	});
			});
		},
		
		onSelectDevice: function(_modelId,alias){
			var self = this;
			self.modelId = _modelId;
			self.deviceId = alias;
			cloud.Ajax.request({
				url:"api/models/"+_modelId,
				parameters:{
					limit:0,
					verbose:100
				},
				success:function(data){
					self.varResults = data.result.varInfo;
					self.selectDeviceCallBack(self.varResults,alias,_modelId);
				}
			});
		},
		
		onDeleteGridItem: function( grid )
		{
			var cell = grid.getSelectionModel().getSelectedCell();
			if(cell){
				if(grid.getStore().getAt(cell[0]).get('deleteType') && grid.getStore().getAt(cell[0]).get('deleteType') == 1){
					Ext.Msg.alert(locale.get({lang:"notices"}),locale.get({lang:"cannt_del_the_text"}));
				}else{
					if(grid.getStore().getAt(cell[0]).get('_id')){
						cloud.Ajax.request({
							url:"api/file/"+grid.getStore().getAt(cell[0]).get('_id'),
							type : "DELETE",
							success:function(data){
								grid.getStore().removeAt(cell[0]);
								return;
							}
						});
					}
					grid.getStore().removeAt(cell[0]);
				}
			}
			
		},
		selectDeviceCallBack:function(varResults,alias,_modelId,formula){
			var self = this;
			var varList = [], checkedList = [];
			for(var i = 0 ; i < varResults.length ; i++) {
				for(var j = 0 ; j < varResults[i].vars.length ; j++) {
					
					var siteId=Ext.getCmp('siteCom').getValue();
					
					var _varId =siteId+"_"+ alias+"_"+varResults[i].vars[j]._id;
					var _formula = "";
					
					if(formula && formula[_varId]){
						_formula = formula[_varId];
					}else{
						if(self.drawable.address && self.drawable.address[0].varId==_varId && self.drawable.address[0].formula){
							_formula=self.drawable.address[0].formula;
						}
					}
					varList.push({
						vid: varResults[i]._id,
						varId: _varId,
						formula:_formula,
						//deviceId: deviceList[0].deviceId,
						deviceId: alias+"_"+_modelId,
						//deviceName: deviceList[0].name,
//						deviceName: _deviceName,
						varName: varResults[i].vars[j].name,
						varType: self.varTypes[parseInt(varResults[i].vars[j].vType)],
						varvalue: varResults[i].vars[j].paramValue,
						units: varResults[i].vars[j].unit || "",
//						update: cloud.util.dateFormat(new Date(data.result.updateTime), "yyyy-MM-dd hh:mm:ss")
					});
				}
			}
			
			self.variateGrid.getStore().loadData({
				rows: varList || []
			});
			
			
			
			//选中列表的一行或者多行
			var total = self.variateGrid.getStore().getCount();
			//编辑公式回填选中一行
            if(formula){
            	var formula_varId=null;
            	for(key in formula){
            		formula_varId=key;
				}
            	 for (var i = 0; i <total; i++) {
	    			 var varId=self.variateGrid.getStore().getAt(i).get('varId');
	                 if(varId==formula_varId){
	                		self.variateGrid.getSelectionModel().selectRow(i);
	                 }
                 }
			}
			
			var deviceId_varId=Ext.isArray(self.drawable.address)?self.drawable.address[0].varId:null;
			if(self.global==1){
				 if(deviceId_varId && deviceId_varId.length > 0){
					 for(var i=0; i<deviceId_varId.length; i++){
						 for (var j = 0; j <total; j++) {
			    			 var varId=self.variateGrid.getStore().getAt(j).get('varId');
			                 if(varId==deviceId_varId[i]){
			                		self.variateGrid.getSelectionModel().selectRow(j,true);
			                 }
		               }
					 }
				 }
			}else{
				  if(deviceId_varId){
				    	 for (var i = 0; i <total; i++) {
				    			 var varId=self.variateGrid.getStore().getAt(i).get('varId');
				                 if(varId==deviceId_varId){
				                		self.variateGrid.getSelectionModel().selectRow(i);
				                 }
			             }
				    }
			}
		},
		onMoveGridItem: function( grid, up )
		{
			var cell = grid.getSelectionModel().getSelectedCell();
			if( !cell )
			{
				return;
			}
			
			var idx = cell[0];
			var record = grid.getStore().getAt(idx);
			if( up )
			{
				if( idx <= 0 ) return;
				grid.getStore().remove(record);
				grid.getStore().insert(idx - 1, [record]);
			}
			else
			{
				if( (idx + 1) >= grid.getStore().getCount() ) return;
				grid.getStore().remove(record);
				grid.getStore().insert(idx + 1, [record]);
			}
			
			grid.getSelectionModel().select(up ? idx - 1 : idx + 1, cell[1]);
		},
		onOK: function()
		{
			if(this.drawable.type == 5){
				if(this.formPanel.getForm().isValid() && this.scalePanel.getForm().isValid() ){
					var formValues = this.formPanel.getForm().getFieldValues();
					Ext.apply(this.drawable, formValues);
					
					var scaleValues=this.scalePanel.getForm().getFieldValues();
					Ext.apply(this.drawable, scaleValues);
					
					var images = [];
					this.imageGrid.getStore().each(function( record )
					{
						var item = Ext.apply({}, record.data);
						delete item.id;
						item.dom = document.getElementById('canvas-image-' + item.el);
						images.push(item);
					}, this);
					
					var titles = [];
					this.titleGrid.getStore().each(function( record )
					{
						var item = Ext.apply({}, record.data);
						delete item.id;
						titles.push(item);
					}, this);
					
					var endPoints = [];
					this.endPointGrid.getStore().each(function( record )
					{
						var item = Ext.apply({}, record.data);
						delete item.id;
						endPoints.push(item);
					}, this);
					
					var custom = [];
					this.customImageGrid.getStore().each(function(record){
						var item = Ext.apply({}, record.data);
						delete item.id;
						custom.push(item);
					},this);
					
					var self = this;
					var variateSelected=null;
					var variate=[];
					var varObj ={};
					if(self.global==1){
						variateSelected=this.variateGrid.getSelectionModel().getSelections();
						if(variateSelected && variateSelected.length > 0){
							var varList=[];
							for(var i=0;i<variateSelected.length;i++){
								varList.push(variateSelected[i].get('varId'));
							}
							varObj.formula=variateSelected[0].get('formula');
							varObj.varId=varList;
						}
					}else{
					   variateSelected=this.variateGrid.getSelectionModel().getSelected();
					   if(variateSelected){
							varObj.varId = variateSelected.get('varId');
							varObj.formula=variateSelected.get('formula');//formula 变量公式
						}
					}
					variate.push(varObj);
					Ext.apply(this.drawable,
					{
						images: images,
						titles: titles,
//						endPoints: endPoints,
						address:variate,
						custom:custom
					});
					
					if( this.userCallback )
					{
						this.userCallback.fn.call(this.userCallback.scope, this);
					}
				    
					this.close();
					
					
				}
			}else{
				if(this.formPanel.getForm().isValid()){
					var formValues = this.formPanel.getForm().getFieldValues();
					Ext.apply(this.drawable, formValues);
					
					var pipeValues = this.pipeForm.getForm().getFieldValues();
					Ext.apply(this.drawable, pipeValues);
					
					var variateValues = this.variateForm.getForm().getFieldValues();
					Ext.apply(this.drawable, variateValues);
					var images = [];
					this.imageGrid.getStore().each(function( record )
					{
						var item = Ext.apply({}, record.data);
						delete item.id;
						item.dom = document.getElementById('canvas-image-' + item.el);
						images.push(item);
					}, this);
					
					var titles = [];
					this.titleGrid.getStore().each(function( record )
					{
						var item = Ext.apply({}, record.data);
						delete item.id;
						titles.push(item);
					}, this);
					
					var endPoints = [];
					this.endPointGrid.getStore().each(function( record )
					{
						var item = Ext.apply({}, record.data);
						delete item.id;
						endPoints.push(item);
					}, this);
					
					var custom = [];
					this.customImageGrid.getStore().each(function(record){
						var item = Ext.apply({}, record.data);
						delete item.id;
						custom.push(item);
					},this);
					
					var self = this;
					var variateSelected=null;
					var variate=[];
					var varObj ={};
					if(self.global==1){
						variateSelected=this.variateGrid.getSelectionModel().getSelections();
						if(variateSelected && variateSelected.length > 0){
							var varList=[];
							for(var i=0;i<variateSelected.length;i++){
								varList.push(variateSelected[i].get('varId'));
							}
							varObj.formula=variateSelected[0].get('formula');
							varObj.varId=varList;
						}
					}else{
					   variateSelected=this.variateGrid.getSelectionModel().getSelected();
					   if(variateSelected){
							varObj.varId = variateSelected.get('varId');
							varObj.formula=variateSelected.get('formula');//formula 变量公式
						}
					}
					variate.push(varObj);
					Ext.apply(this.drawable,
					{
						images: images,
						titles: titles,
						endPoints: endPoints,
						address:variate,
						custom:custom
					});
					
					if( this.userCallback )
					{
						this.userCallback.fn.call(this.userCallback.scope, this);
					}
				    
					this.close();
					
					
				}
			}
		
		},
		
		onCancel: function()
		{  
			if(this.drawable.type == 5){
				if( this.cancelCallback )
				{
					this.cancelCallback.fn.call(this.cancelCallback.scope, this);
				}
			}else if(this.drawable.type == 2){
				if( this.userdefineCallback )
				{
					this.userdefineCallback.fn.call(this.userdefineCallback.scope, this);
				}
			}
			this.close();
		}
	});
	
	
	
});


