// namespace Lang
define(function(require){
	require("cloud/base/cloud");
//	require("cloud/lib/plugin/ext/ext-base");
//	require("cloud/lib/plugin/ext/ext-all");
	
	var Lang = {};

	Lang.Error = 
	{
		0:  '操作成功',
		1:  '访问被拒绝',
		2:  '无效的输入参数',
		3:  '系统内部错误',
		4:  '目标不可用',
		5:  '服务繁忙',
		6:  '网络不可用',
		7:  '对应的内容已经存在',
		8:  '对应的脚本不存在',
		9:  '对应的项不存在',
		10: '会话不存在或者由于超时已经被注销，请重新登陆',
		11: '对应的项不存在',
		12: '网络错误',
		13: '操作超时',
		14: '对应内容没有准备就绪',
		15: '已经取消',
		16: '超出门限值',
		17: '验证失败，用户名不存在或者密码错误',
		18: '没有对应的权限',
		19: '用户已经登陆,同一用户不允许重复登陆',
		20: '由于目标不在线,无法提供指定的服务',
		21: '不支持指定的操作',
		22: '密码已经过期，需要修改密码才能继续',
		23: '无效的服务器授权',
		24: '已超过服务器授权限制',
		25: '服务器授权已经到期',
		
		unknown: '未知的网络错误'
	};

	Lang.HttpError = 
	{
		'unknown': '未知的网络错误',
		'-1': '网络超时',
		0:   '连接断开',
		200: '成功',
		301: '对应的页面被临时移除',
		302: '对应的页面被永久移除',
		
		400: '错误请求',
		401: '未授权',
		402: '未付费',
		403: '访问被禁止',
		404: '不存在该方法/页面',
		405: '不允许请求该方法',
		
		500: '服务器内部错误',
		501: '服务器未实现对应的方法',
		502: '错误的网关',
		503: '服务不可用',
		504: '网关超时',
		505: '不支持的版本'
	};

	Lang.Common = 
	{
		charset: 'GBK',
		msgTitle: '提示信息',
		msgErrorTitle: '错误信息',
		msgServerErrorFmt: '系统错误，错误码：{0}',
		msgGeneralError: '操作失败',
		msgGeneralErrorFmt: '操作失败，{0}:{1}',
		msgGeneralOperateFmt: '操作结果，{0}:{1}',
		
		notSupportFmt: '“{0}”功能目前还不支持',
		loadDataFailed: '加载数据失败，可能是网络断开，或者当前用户会话已经过期，请重新登陆。',
		loadDataFailedFmt: '加载数据失败，{0}:{1}',
		blankNotAllowed: '不允许为空内容',
		dateValueInvalid: '填写的时间或日期格式不正确，请重新选择',
		colorValueInvalid: '颜色格式不正确，格式为：#FFFFFF',
		noItemsSelected: '没有选择内容，至少要选择其中一项',
		itemSelectedConflict: '选择的条件有相互排斥的内容，请重新选择',
		tooLongTextFmt: '输入内容过长，最长允许 {0} 字节',
		msgFieldIncompleted: '字段信息不合法，请按照提示重新输入',
		msgFieldInvalidFmt: '{0}: {1} 输入无效，请重新输入',
		confirmDelete: '警告！删除的内容将不可恢复，要删除选中的项吗？',
		confirmDeleteFmt: '警告！删除的内容将不可恢复，要删除选中的 {0} 项内容吗？',
		confirmStop: '确认要停止吗？',
		confirmCancel: '确认取消当前操作吗？',
		confirmStopFmt: '确认要停止({0})吗？',
		confirmToConfirm: '警告！确认的内容将不可恢复，要确认选中的项吗？',
		confirmToConfirmFmt: '警告！确认的内容将不可恢复，要确认选中的 {0} 项内容吗？',
		confrimToSave: '内容已经修改，是否保存？',
		previousNotCompleted: '由于上一次操作还未完成，无法执行当前操作，请稍后再试……',
		noPermissionMsg: '没有权限操作 {0}, 当前用户组: {1}',
		tooManyItems: '已经存在的内容太多，无法再加入新的项',
		yesText: '是',
		noText: '否',
		allowText: '允许',
		notAllowText: '不允许',
		enabledText: '启用',
		disabledText: '禁用',
		disabled: '禁用',
		allText: '全部',
		showAllText: '显示全部',
		okText: '确定',
		cancelText: '取消',
		initText: '初始化',
		openText: '打开',
		openInNewTabText: '在新选项卡中打开',
		openTopologyText: '打开拓扑图',
		openMapText: '打开地图',
		closeText: '关闭',
		resetText: '重设',
		newText: '新建',
		newMultiText: '新建多个 ...',
		addText: '添加',
		newGroupText: '新建组',
		newItemText: '新建项',
		editText: '编辑',
		modifyText: '修改',
		removeText: '移除',
		removeAllText: '全部移除',
		deleteText: '删除',
		deleteItemText: '删除项',
		deleteGroupText: '删除组',
		deleteAllText: '全部删除',
		refreshText: '刷新',
		refreshTimeText: '刷新时间',
		saveText: '保存',
		setupText: '设置',
		confirmText: '确认',
		groupText: '组',
		noneGroupText: '未分组',
		itemText: '项',
		itemsText: '项',
		importAndExportText: '导入/导出',
		exportText: '导出',
		exportListText: '导出列表',
		exportResultText: '导出结果',
		exportConfigText: '导出配置',
		importText: '导入',
		importListText: '导入列表',
		importConfigText: '导入配置',
		downloadText: '下载',
		uploadText: '上传',
		printText: '打印',
		baseConfigText: '基础配置',
		saveTemplateText: '保存模板',
		saveImageText: '保存图片',
		saveImageAsText: '图片另存为…',
		queryText: '查询',
		propertyText: '属性',
		groupPropertyText: '组属性',
		moreText: '更多',
		viewText: '查看',
		previewText: '预览',
		colseHideText:'关闭隐藏',
		colseDeleteText:'关闭删除',
		maxPanelNum:'最大模块数',
		submittingText: '正在提交……',
		submittingTextFmt: '正在提交({0})……',
		executingText: '正在执行……',
		executingTextFmt: '正在执行({0})……',
		loadingText: '正在加载数据……',
		loadingTextFmt: '正在加载数据({0})……',
		loadingFailedFmt: '加载数据失败，错误（{0}：{1}）',
		executeFailedFmt: '执行操作失败，错误（{0}：{1}）',
		totalRecordCountFmt: '一共 {0} 条记录',
		totalRecordCount2Fmt: '一共 {0} 条记录(查询 {1}ms)',
		select: '选择',
		selectAll: '全选',
		selectReverse: '反选',
		selectClear: '清除',
		timeText: '时间',
		beginTimeText: '开始时间',
		endTimeText: '结束时间',
		serverText: '服务器',
		agentText: '代理设备',
		readyText: '准备就绪',
		noneText: '无',
		unlimitedText: '无限制',
		moveUpText: '上移',
		moveDownText: '下移',
		supportText: '支持',
		notSupportText: '不支持',
		copyText: '复制',
		pasteText: '粘贴',
		startTestText: '开始测试',
		stopTestText: '停止测试',
		timeDiffTooLargeWithServerFmt: '本地时间与服务器时间({0}) 偏差过大，请调整时间避免影响使用',
		licenseWillBeExpiredFmt: '请注意：服务器授权将于 {0}后，{1} 过期，请联系管理员尽快更新。',
		copyToClipboardOkText: '复制到剪切板成功',
		copyToClipboardFailedText: '操作错误，复制到剪切板失败',
		showImage: '获取 PNG 格式图片',
		manage: '管理',
		allAreaName: '所有地区',
		fullScreenKeyTip: '由于您的浏览器不支持自动化全屏操作，请按下 F11 实现浏览器全屏和退出全屏。',
		timeLength:
		{
			micro: '微秒',
			milli: '毫秒',
			second: '秒',
			minute: '分钟',
			hour: '小时',
			day: '天',
			week: '周',
			month: '月',
			year: '年'
		},
		timeScale:
		{
			micro: '微秒',
			milli: '毫秒',
			second: '秒',
			minute: '分',
			hour: '点',
			day: '号',
			week: '周',
			month: '月',
			year: '年'
		},
		timeFormat:
		{
			custom: 'H:i',
			hourly: 'H:i',
			daily: 'm月d日',
			weekly: 'm月d日',
			monthly: 'Y年m月',
			yearly: 'Y年'
		},
		weeks:
		[
			[0, '星期一'],
			[1, '星期二'],
			[2, '星期三'],
			[3, '星期四'],
			[4, '星期五'],
			[5, '星期六'],
			[6, '星期日']
		],
		noRunText:  '停止运行',
		yesRunText: '运行中',
		licenseUnlimited: '无限制',
		licenses:
		{
			name: '名称',
			//version: '版本',
			serialNumber: '序列号',
			hardwareIdentify: '硬件标识',
			companyName: '公司名称',
			beginTime: '授权生效时间',
			endTime: '授权结束时间',
			onlineUserCount: '在线用户数量',
			userCount: '总用户数量',
			onlineDeviceCount: '在线设备数量',
			testableDeviceCount: '可使用设备数量',
			deviceCount: '总设备数量',
			testModules: '模块'
		}
	};

	//
	// Config
	//
	Lang.Config = {};

	Lang.Config.Common = 
	{
		defaultFontName: '"微软雅黑",Arial'
	};

	Lang.Config.Type = 
	{
		group:
		{
			ALL: '所有组',
			SYSTEM_USER: '用户组',
			DATA_REPORT: '数据报表组',
			DEVICE_AGENT: '代理设备组',
			WEB_MODULE: '系统模块组'
		},
		userGroup:
		{
			ALL: '所有用户',
			ADMINISTRATORS: '管理员',
			POWER_USERS: '操作员',
			NORMAL_USERS: '普通用户',
			GUESTS: '访客用户'
		},
		deviceAgent:
		{
			ALL: '所有设备',
			HOT_SOURCE: '热源管理器'
		},
		systemLogType:
		{
			ALL: '所有类型',
			TRAFFIC_AGENT: '测试代理',
			SYSTEM_USER: '用户'
		},
		systemLogLevel:
		{
			ALL: '所有级别',
			INFORMATTION: '信息',
			WARNING: '警告',
			ERROR: '错误',
			FATAL: '严重错误'
		},
		systemAlertType:
		{
			ALL: '所有类型',
			CPU_OVERLOAD: 'CPU',
			MEMORY_OVERLOAD: '内存',
			DISK_OVERLOAD: '磁盘',
			SYS_PROCESS_EXCEED: '进程数量',
			SYS_PROCESS_MEM_EXCEED: '进程内存',
			AGENT_OFFLINE: '代理设备离线'
		}
	};

	Lang.Config.SystemProperty = 
	{
		basic:
		{	
			systemAlertDays: {name: '系统告警存储(天)'},
			systemLogDays:   {name: '系统日志存储(天)'}
		},
		server: 
		{
			runLogDays: {name: '运行日志存储(天)'},
			cpuUsed:    {name: 'CPU 使用率门限(%)'},
			memoryUsed: {name: '内存使用率门限(%)'},
			diskUsed:   {name: '磁盘使用率门限(%)'}
		},
		web:
		{
			title: {name: '系统标题'},
			theme:
			{
				name: '界面主题',
				store:
				{
					'default': '常规'
				}
			},
			lang:
			{
				name: '界面语言',
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
			threshold:   {name: '门限'},
			usedPercent: {name: '使用率'}
		},
		memory:
		{
			available:   {name: '可用'},
			total:       {name: '总数'},
			threshold:   {name: '门限'},
			usedPercent: {name: '使用率'}
		},
		disk:
		{
			available:   {name: '可用'},
			total:       {name: '总数'},
			threshold:   {name: '门限'},
			usedPercent: {name: '使用率'}
		}
	};

	//
	// Window
	//
	Lang.Common.Window = {};

	Lang.Common.Window.DownloadDialog = 
	{
		title: '下载对话框',
		clickToDownload: '点击下载文件'
	};

	Lang.Common.Window.UploadDialog =
	{
		titleFmt: '{0}',
		pleaseSelectFile: '请选择上传的文件',
		selectFile: '选择...',
		path: '路径',
		tip: '说明',
		upload: '上传',
		uploading: '正在上传,请稍候...',
		uploadFailed: '服务器或者网络错误，上传失败',
		cleanExistData: '覆盖已有数据/文件',
		notSupportFileExtFmt: '不支持文件格式({0}), 需要是({1})的文件格式',
		supportFileExtTipFmt: '支持文件名后缀为 .{0} 的文件格式',
		supportAllFileExtTip: '支持所有文件格式'
	};

	Lang.Common.Window.EditPassword =
	{
		title: '修改用户密码',
		passwordTab: '密码信息',
		passwordNotMatch: '新密码不匹配，请重新输入',
		editSuccess: '密码修改完成，请记住新的密码并使用新的密码登陆',
		columnHeader:
		{
			username: '用户名',
			oldPassword: '原始密码',
			newPassword: '新密码',
			confirmPassword: '确认密码'
		}
	};

	Lang.Common.Window.GroupProperty = 
	{
		titleFmt: '{0}, ID: {1} - 组信息',
		basicLabelTitle: '基础信息',
		columnHeader:
		{
			id: 'ID',
			type: '类型',
			parentId: '上级组',
			name: '名称',
			description: '描述',
			url: '链接功能',
			rankClass: '排序级别'
		}
	};

	Lang.Extension = {};
	Lang.Extension.StatusGrid = 
	{
		group: '组别',
		unitsCount: '总机组数',
		onCount: '开启台数',
		status: '状态',
		protectOrFault: '保护/故障',
		query: '查询',
		details: '详情'
	};

	Lang.Extension.MaintenanceField = 
	{
		maintenanceRemind: '保养提醒',
		faultRemind: '故障提醒'
	};
	return Lang;
});
