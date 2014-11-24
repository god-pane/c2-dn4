define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/ext/ext-base");
	require("cloud/lib/plugin/ext/ext-all");
	
	Ext.ns('Lang.Module.System.Agent');

	Lang.Module.System.Agent.Activity = 
	{
		module:
		{
			name: '系统设备',
			title: '设备管理',
			description: '代理设备配置和管理'
		},
		navigatorTitle: '设备管理'
	};

	Lang.Module.System.Agent.Configure = 
	{
		user: '用户',
		mainTank: '主水箱',
		runningWater: '自来水',
		meterReadings: '电表读数',
		waterReadings: '水表读数',
		viceWaterTempT52: '副水箱水温T52',
		mainWaterTempT51: '主水箱水温T51',
		solarWaterTank: '太阳能水箱'
	};

	Lang.Module.System.Agent.TreeManager = 
	{
		rootTitle: '所有设备'
	};

	Lang.Module.System.Agent.AgentManager =
	{
		title: '代理设备管理',
		title2: '设备管理',
		emptyDeviceId: '系统自动生成',
		exportScriptText: '导出脚本',
		exportTipText: '导出选中的项，不选择任何项则全部导出',
		importAgentList: '导入代理设备列表',
		importAgentListTip: '导入已经存在的 "设备 ID" 将自动忽略',
		confirmToUpdateSubAgent: '确定要更新选中的服务器下属的代理列表？',
		msgChooseAgentNull: '请至少选择一个设备',
		searchNameEmpty: '输入名称查找',
		selectAll: '全选',
		unSelectAll: '全不选',
		columnHeader:
		{
			id: '编号',
			type: '类型',
			name: '名称',
			groupId: '组',
			hostName: '主机名',
			description: '设备描述',
			disabled: '禁用',
			agentIp: '管理 IP',
			agentPort: '管理端口',
			sessionId: '会话 ID',
			agentUpTime: '上线时间',
			osUpTime: '开机时间',
			statusUpdateTime: '最后更新',
			agentVersion: '设备版本',
			rankClass: '排序级别'
		}
	};

	Lang.Module.System.Agent.AgentProperty = 
	{
		titleFmt: '{0} - 设备信息',
		basicLabelTitle: '设备信息',
		editCanvas: '组态图'
	};

	Lang.Module.System.Agent.AgentCanvasProperty = 
	{
		titleFmt: '{0} - 设备组态图',
		toolsTitle: '工具栏 (双击添加)'
	};

	Lang.Module.System.Agent.AgentDataProperty = 
	{
		title: '数据信息 (复制/粘贴文本保存到文件)'
	};

	Lang.Module.System.Agent.AgentDrawableProperty = 
	{
		title: '元件属性',
		variablesTitle:'变量',
		basicTabTitle: '位置',
		titleGridTitle: '文字',
		imageGridTitle: '图片',
		endPointGridTitle: '端点',
		columnHeader:
		{
			address: '地址',
			x: 'X 坐标',
			y: 'Y 坐标',
			z: 'Z 坐标',
			start: '开始',
			width: '宽度',
			height: '高度',
			el: '元素',
			text: '文字',
			bold: '加粗',
			size: '大小',
			font: '字体',
			color: '颜色',
			horz: '水平',
			percent: '比例 (%)',
			wpercent: '宽比例 (%)',
			hpercent: '高比例 (%)',
			dx: 'X 坐标(目标)',
			dy: 'X 坐标(目标)',
			dw: '宽度(目标)',
			dh: '高度(目标)',
			textAlign: '水平对齐'
		}
	};
	
	return Lang.Module.System.Agent.Activity;
	
});

