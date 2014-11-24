Ext.ns('Lang.Module.System.Agent');

Lang.Module.System.Agent.Activity = 
{
	module:
	{
		name: 'Devices',
		title: 'Devices',
		description: 'Agent  equipment configuration and management'
	},
	navigatorTitle: 'Equipment management'
};

Lang.Module.System.Agent.TreeManager = 
{
	rootTitle: 'All Devices'
};

Lang.Module.System.Agent.Configure = 
{
	user: 'User',
	mainTank: 'Main Tank',
	runningWater: 'Running Water',
	meterReadings: 'Meter Readings',
	waterReadings: 'Water Readings',
	viceWaterTempT52: 'Vice Water T52',
	mainWaterTempT51: 'Main Water T51',
	solarWaterTank: 'Solar Water Tank'
};

Lang.Module.System.Agent.AgentManager =
{
	title: 'Device Management',
	title2: 'Device Management',
	emptyDeviceId: 'The system automatically generate',
	exportScriptText: 'export script',
	exportTipText: 'Export the selected item, do not select any items are all exported',
	importAgentList: 'Import agent for the equipment list',
	importAgentListTip: 'Import the existing \"device ID\" is automatically ignored',
	confirmToUpdateSubAgent: 'Sure to update the selected server subordinate agent list?',
	msgChooseAgentNull: 'Please select at least one device',
	searchNameEmpty: 'Type in the name for lookuping',
	selectAll: 'Select All',
	unSelectAll: 'Select None',
	columnHeader:
	{
		id: 'ID',
		type: 'Type',
		name: 'Name',
		groupId: 'Group',
		hostName: 'Host Name',
		description: 'Description',
		disabled: 'Disabled',
		agentIp: 'IP Address',
		agentPort: 'Port',
		sessionId: 'Session ID',
		agentUpTime: 'Online Time',
		osUpTime: 'Up Time',
		statusUpdateTime: 'Last Update Time',
		agentVersion: 'Version',
		rankClass: 'Rank Class'
	}
};

Lang.Module.System.Agent.AgentProperty = 
{
	titleFmt: '{0} - equipment information',
	basicLabelTitle: 'Equipment information',
	editCanvas: 'The configuration diagram'
};

Lang.Module.System.Agent.AgentCanvasProperty = 
{
	titleFmt: '{0} - Device Configuration',
	toolsTitle: 'Toolbar (db-click to add)'
};

Lang.Module.System.Agent.AgentDataProperty = 
{
	title: 'Data information (copy/paste text saved to a file)'
};

Lang.Module.System.Agent.AgentDrawableProperty = 
{
	title: 'Element attributes',
	basicTabTitle: 'Basic properties',
	titleGridTitle: 'word',
	imageGridTitle: 'pictures',
	endPointGridTitle: 'endpoint',
	columnHeader:
	{
		address: 'address',
		x: 'X coordinate',
		y: 'Y coordinate',
		z: 'Z coordinate',
		start: 'start',
		width: 'width',
		height: 'highly',
		el: 'element',
		text: 'word',
		bold: 'bold',
		size: 'The size',
		font: 'font',
		color: 'color',
		horz: 'level',
		percent: 'Percentage (%)',
		wpercent: 'Width ratio (%)',
		hpercent: 'High percentage (%)',
		dx: 'X coordinates (target)',
		dy: 'X coordinates (target)',
		dw: 'The width (target)',
		dh: 'Height (target)',
		textAlign: 'Horizontal alignment'
	}
};
