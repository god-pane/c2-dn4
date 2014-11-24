// namespace Lang
var Lang = {};

Lang.Error = 
{
	0:  'Operation success',
	1:  'Access denied',
	2:  'invalid parameter',
	3:  'system error',
	4:  'Target unused',
	5:  'Service is busy',
	6:  'Network unused',
	7:  'Content already exists',
	8:  'Script does not exist',
	9:  'Item does not exist',
	10: 'Please log in again',
	11: 'Item does not exist',
	12: 'Network error',
	13: 'operation timeout',
	14: 'Content isn\'t ready',
	15: 'Canceled',
	16: 'Beyond the limit',
	17: 'Validation fails, the name/password is error',
	18: 'No authority',
	19: 'The same user is not allowed to repeat login',
	20: 'Goals don\'t online, can\'t provide the services',
	21: 'Does not support the operations',
	22: 'The password has expired, change the password to continue',
	23: 'Invalid license',
	24: 'Beyond the authorized limits',
	25: 'License expired',
	
	unknown: 'Network error'
};

Lang.HttpError = 
{
	'unknown': 'Network error',
	'-1': 'Network timeout',
	0:   'Connection break',
	200: 'Success',
	301: 'The page has been removed temporary',
	302: 'The page has been permanently removed',
	
	400: 'request error',
	401: 'unauthorized',
	402: 'Do not pay',
	403: 'Access prohibited',
	404: 'The method/page does not exist',
	405: 'Not allowed to request this method',
	
	500: 'Internal server error',
	501: 'Did not implement the corresponding method',
	502: 'Network error',
	503: 'Service is not available',
	504: 'Gateway timeout',
	505: 'Does not support version'
};

Lang.Common = 
{
	charset: 'GBK',
	msgTitle: 'Prompt message',
	msgErrorTitle: 'Error message',
	msgServerErrorFmt: 'System error, error code:{0}',
	msgGeneralError: 'Operation failure',
	msgGeneralErrorFmt: 'Operation failure,{0}:{1}',
	msgGeneralOperateFmt: 'result,{0}:{1}',
	
	notSupportFmt: '\"{0}\"Functionality is not supported currently',
	loadDataFailed: 'Loading the data failure, please log in again.',
	loadDataFailedFmt: 'Load the data failure,{0}:{1}',
	blankNotAllowed: 'Don\'t allow content is empty',
	dateValueInvalid: 'The time or date format is not correct, please choose again',
	colorValueInvalid: 'Color format is not correct,format is:#FFFFFF',
	noItemsSelected: 'Choose at least one of them',
	itemSelectedConflict: 'Choose the mutually exclusive content，Please choose again',
	tooLongTextFmt: 'The input is too long, the longest allow {0} bytes',
	msgFieldIncompleted: 'Not legal field information, please re-enter',
	msgFieldInvalidFmt: '{0}:{1} input is invalid, please enter again',
	confirmDelete: 'Warning! Delete the content will be unrecoverable, want to delete the selected item?',
	confirmDeleteFmt: 'Warning!Delete the content will be unrecoverable, want to delete {0}?',
	confirmStop: 'Confirm to stop?',
	confirmCancel: 'Confirm to cancel the current operation?',
	confirmStopFmt: 'Confirm to stop({0})?',
	confirmToConfirm: 'Warning!Confirmed content will not resume, want to confirm the selected item?',
	confirmToConfirmFmt: 'Warning!Confirmed content will not resume, want to confirm the {0} content?',
	confrimToSave: 'Content has been modified. Save?',
	previousNotCompleted: 'Last operation has yet not be completed,unable to perform the current operation, please try again later...',
	noPermissionMsg: 'Has no right to operation {0}, The current user group:{1}',
	tooManyItems: 'There are too many content, unable to add new item',
	yesText: 'yes',
	noText: 'No',
	allowText: 'Allow',
	notAllowText: 'Not allow',
	enabledText: 'Start using',
	disabledText: 'Forbidden',
	disabled: 'Forbidden',
	allText: 'All',
	showAllText: 'Display all',
	okText: 'OK',
	cancelText: 'Cancel',
	initText: 'Initialize',
	openText: 'Open',
	openInNewTabText: 'Open in new TAB',
	openTopologyText: 'Open the diagram',
	openMapText: 'Open the map',
	closeText: 'Close',
	resetText: 'Reset',
	newText: 'New',
	newMultiText: 'New multiple…',
	addText: 'Add',
	newGroupText: 'Add group',
	newItemText: 'Add item',
	editText: 'Edit',
	modifyText: 'Modify',
	removeText: 'Remove',
	removeAllText: 'Remove all',
	deleteText: 'Delete',
	deleteItemText: 'Delete item',
	deleteGroupText: 'Delete group',
	deleteAllText: 'Delete all',
	refreshText: 'Refresh',
	refreshTimeText: 'Refresh time',
	saveText: 'Save',
	setupText: 'Set',
	confirmText: 'OK',
	groupText: 'Group',
	noneGroupText: 'Ungrouped',
	itemText: 'Item',
	itemsText: 'Item',
	importAndExportText: 'Import/Export',
	exportText: 'Export',
	exportListText: 'Exporting the list',
	exportResultText: 'Export the result',
	exportConfigText: 'Export the setting',
	importText: 'Import',
	importListText: 'Import list',
	importConfigText: 'Import setting',
	downloadText: 'Download',
	uploadText: 'Upload',
	printText: 'Print',
	baseConfigText: 'Basic configuration',
	saveTemplateText: 'Save the template',
	saveImageText: 'Save images',
	saveImageAsText: 'Save image as…',
	queryText: 'Query',
	propertyText: 'Property',
	groupPropertyText: 'Group Property',
	moreText: 'More',
	viewText: 'View',
	previewText: 'Preview',
	colseHideText:'Close hide',
	colseDeleteText:'Close the  delete',
	maxPanelNum:'Maximum number of modules',
	submittingText: 'Are submitting…',
	submittingTextFmt: 'Is submitted ({0})............',
	executingText: 'Are performing…',
	executingTextFmt: 'Being performed ({0})............',
	loadingText: 'Loading data…',
	loadingTextFmt: 'Loading data ({0})............',
	loadingFailedFmt: 'Loading data failed, error({0}, {1})',
	executeFailedFmt: 'Perform operations failed, error ({0}, {1})',
	totalRecordCountFmt: '{0} record',
	totalRecordCount2Fmt: 'There are {0} records (query {1}ms)',
	select: 'Select',
	selectAll: 'Select all',
	selectReverse: 'Invert selection',
	selectClear: 'Clear',
	timeText: 'Time',
	beginTimeText: 'Start time',
	endTimeText: 'Stop time',
	serverText: 'Server',
	agentText: 'Proxy equipment',
	readyText: 'Be ready',
	noneText: 'None',
	unlimitedText: 'Unlimited',
	moveUpText: 'Move up',
	moveDownText: 'Move down',
	supportText: 'Support',
	notSupportText: 'Nonsupport',
	copyText: 'Copy',
	pasteText: 'Paste',
	startTestText: 'Start test',
	stopTestText: 'Stop test',
	timeDiffTooLargeWithServerFmt: 'The gap between the local time and server time ({0}) is big, please adjust the time',
	licenseWillBeExpiredFmt: 'Please note: the server authorization will be {0} later, {1} expire, please contact administrator to update.',
	copyToClipboardOkText: 'Copied to the clipboard successfully',
	copyToClipboardFailedText: 'Operating errors, copied to the clipboard failed',
	showImage: 'Get the PNG format images',
	manage: 'Manage',
	allAreaName: 'All regions',
	fullScreenKeyTip: 'Press F11 to full-screen browser and exit full screen please.',
	timeLength:
	{
		micro: 'Microseconds',
		milli: 'ms',
		second: 'second',
		minute: 'minutes',
		hour: 'hour',
		day: 'day',
		week: 'week',
		month: 'month',
		year: 'year'
	},
	timeScale:
	{
		micro: 'us',
		milli: 'ms',
		second: 's',
		minute: 'm',
		hour: 'h',
		day: 'day',
		week: 'week',
		month: 'month',
		year: 'year'
	},
	timeFormat:
	{
		custom: 'H:i',
		hourly: 'H:i',
		daily: 'm/d',
		weekly: 'm/d',
		monthly: 'Y/m',
		yearly: 'Y'
	},
	weeks:
	[
		[0, 'Monday'],
		[1, 'Tuesday'],
		[2, 'Wednesday'],
		[3, 'Thursday'],
		[4, 'Friday'],
		[5, 'Saturday'],
		[6, 'Sunday']
	],
	noRunText:  'Stop running',
	yesRunText: 'running',
	licenseUnlimited: 'Unlimited',
	licenses:
	{
		name: 'name',
		//version: 'Version',
		serialNumber: 'no.',
		hardwareIdentify: 'Hardware id',
		companyName: 'company name',
		beginTime: 'License activation time',
		endTime: 'License stop time',
		onlineUserCount: 'The number of users online',
		userCount: 'The total number of users',
		onlineDeviceCount: 'Equipment number online',
		testableDeviceCount: 'Equipment number of that can be used',
		deviceCount: 'The total number of equipment',
		testModules: 'module'
	}
};

//
// Config
//
Lang.Config = {};

Lang.Config.Common = 
{
	defaultFontName: 'tahoma,arial,verdana,sans-serif'
};

Lang.Config.Type = 
{
	group:
	{
		ALL: 'All groups',
		SYSTEM_USER: 'User groups',
		DATA_REPORT: 'Data report group',
		DEVICE_AGENT: 'Agent equipment group',
		WEB_MODULE: 'System modules group'
	},
	userGroup:
	{
		ALL: 'All user',
		ADMINISTRATORS: 'Administrator',
		POWER_USERS: 'operator',
		NORMAL_USERS: 'regular user',
		GUESTS: 'Visitors'
	},
	deviceAgent:
	{
		ALL: 'All Devices',
		HOT_SOURCE: 'Heat Source Manager'
	},
	systemLogType:
	{
		ALL: 'All Types',
		TRAFFIC_AGENT: 'Test Agent',
		SYSTEM_USER: 'Users'
	},
	systemLogLevel:
	{
		ALL: 'All Levels',
		INFORMATTION: 'Info',
		WARNING: 'Warning',
		ERROR: 'Error',
		FATAL: 'Fatal'
	},
	systemAlertType:
	{
		ALL: 'All Types',
		CPU_OVERLOAD: 'CPU',
		MEMORY_OVERLOAD: 'Memory',
		DISK_OVERLOAD: 'Disc',
		SYS_PROCESS_EXCEED: 'Number of Processes',
		SYS_PROCESS_MEM_EXCEED: 'Process Memory',
		AGENT_OFFLINE: 'Agent Device Offline'
	}
};

Lang.Config.SystemProperty = 
{
	basic:
	{	
		systemAlertDays: {name: 'System alarms storage (days)'},
		systemLogDays:   {name: 'System log storage (days)'}
	},
	server: 
	{
		runLogDays: {name: 'Run log storage (days)'},
		cpuUsed:    {name: 'CPU usage limit (%)'},
		memoryUsed: {name: 'Memory usage limit (%)'},
		diskUsed:   {name: 'Disk usage limit (%)'}
	},
	web:
	{
		title: {name: 'System title'},
		theme:
		{
			name: 'Interface theme',
			store:
			{
				'default': 'conventional'
			}
		},
		lang:
		{
			name: 'Interface language',
			store:
			{
				'zh-cn': '中文 (简体)',
				'en-us': 'English'
			}
		}
	}
};

Lang.Config.SystemAlert =
{
	cpu:
	{
		threshold:   {name: 'limit'},
		usedPercent: {name: 'usage rate'}
	},
	memory:
	{
		available:   {name: 'available'},
		total:       {name: 'sum'},
		threshold:   {name: 'limit'},
		usedPercent: {name: 'usage rate'}
	},
	disk:
	{
		available:   {name: 'available'},
		total:       {name: 'sum'},
		threshold:   {name: 'limit'},
		usedPercent: {name: 'usage rate'}
	}
};

//
// Window
//
Lang.Common.Window = {};

Lang.Common.Window.DownloadDialog = 
{
	title: 'Download dialog',
	clickToDownload: 'Click to download file'
};

Lang.Common.Window.UploadDialog =
{
	titleFmt: '{0}',
	pleaseSelectFile: 'Please select  file that upload',
	selectFile: 'Selection…',
	path: 'way',
	tip: 'instructions',
	upload: 'Upload',
	uploading: 'Are uploading, please wait…',
	uploadFailed: 'A server or network error, upload failed',
	cleanExistData: 'Overwrite existing data/file',
	notSupportFileExtFmt: 'Does not support the file format ({0}), need the file format is({1})',
	supportFileExtTipFmt: 'Support the filename suffix for. {0} file format',
	supportAllFileExtTip: 'Support all file formats'
};

Lang.Common.Window.EditPassword =
{
	title: 'Modify the user password',
	passwordTab: 'The password information',
	passwordNotMatch: 'New passwords do not match, please enter again',
	editSuccess: 'Password modification completion, please remember the new password and use the new password to login',
	columnHeader:
	{
		username: 'name',
		oldPassword: 'old pwd',
		newPassword: 'new pwd',
		confirmPassword: 'confirm pwd'
	}
};

Lang.Common.Window.GroupProperty = 
{
	titleFmt: '{0}, ID: {1} - group information',
	basicLabelTitle: 'Basic information',
	columnHeader:
	{
		id: 'ID',
		type: 'type',
		parentId: 'The superior group',
		name: 'name',
		description: 'describe',
		url: 'Link function',
		rankClass: 'Sorting level'
	}
};

Lang.Extension = {};
Lang.Extension.StatusGrid = 
{
	group: 'Group',
	unitsCount: 'Units Count',
	onCount: 'On Count',
	status: 'Status',
	protectOrFault: 'Protect/Fault',
	query: 'Query',
	details: 'Detail'
};

Lang.Extension.MaintenanceField = 
{
	maintenanceRemind: 'MT Remind',
	faultRemind: 'FT Remind'
};
