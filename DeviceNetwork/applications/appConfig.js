define(function(require){
	require("cloud/base/cloud");
            var home = {
                    name : "home",
                    order:0,
                    defaultOpen:true,
                    subNavs : [{
                        name : "home",
                        defaultOpen:true,
                        order:0,
                        url :'./homepage/homepage'
                    }]
            };
            var system = {
                name : "system",
                order:1,
                defaultOpen:false,
                subNavs : [{
                    name : "user",
                    order:0,
                    defaultOpen:true,
                    subViews : [{
                        name : "userList",
                        order:0,
                        defaultOpen:true,
                        url : "./system/user/table"
                    }]
                },{
                    name : "role",
                    order:1,
                    defaultOpen:false,
                    subViews : [{
                        name : "list",
                        order:0,
                        defaultOpen:true,
                        url : "./system/role/table"
                    }]
                },
                {
                    name : "tag",
                    order:4,
                    defaultOpen:false,
                    subViews : [{
                        name : "list",
                        order:0,
                        defaultOpen:true,
                        url : "./system/tag/table"
                    }]
                },
                {
                    name : "organ_info",
                    order:3,
                    defaultOpen:false,
                    url : "./system/organ/org-info-token"
                },
                {
                	name : "group_management",
                	order:2,
                	defaultOpen:false,
                	url : "./system/group/group"
                }
                ]    
            };
            var report = {
                    name : "report",
                    order:2,
                    defaultOpen:false,
                    subNavs : [{
                        name : "summary",
                        order:0,
                        defaultOpen:true,
                        url : "./reports/summary/summary"
                    },{
                        name : "online_statistics",
                        order:1,
                        defaultOpen:false,
                        url : "./reports/online/report/report" 
                    },{
                        name : "traffic_statistics",
                        order:2,
                        defaultOpen:false,
                        url : "./reports/flow/flowIndex"
		    },{
			name : "define_report",
			order:3,
			defaultOpen:false,
			url : "../../ReportServer/config/report/report"
                    }]    
                };
            
            var device = {
                    name : "device",
                    order:3,
                    defaultOpen:false,
                    subNavs : [{
                        name : "gateway",
                        order:0,
                        defaultOpen:true,
                        subViews : [{
                            name : "list",
                            order:0,
                            defaultOpen:false,
                            url : "./device/mydevice/table"
                        },{
                            name : "overview",
                            order:1,
                            defaultOpen:true,
                            url : "./device/mydevice/overview"
                        }]
                    },{
                        name : "controller",
                        order:1,
                        defaultOpen:false,
                        subViews : [{
                            name : "plcList",
                            order:0,
                            defaultOpen:false,
                            url : "./device/mycontroller/table"
                        },{
                            name : "plcOverview",
                            order:1,
                            defaultOpen:true,
                            url : "./device/mycontroller/overview"
                        }]
                    },{
                        name : "model",
                        order:2,
                        defaultOpen:false,
                        subViews : [{
                            name : "modelOverview",
                            order:0,
                            defaultOpen:true,
                            url : "./device/mymodel/overview",                    
                        }
                       ]
                    }]
                };
            
            var site = {
                name : "site",
                order:4,
                defaultOpen:false,
                subNavs : [{
                    name : "site",
                    order:0,
                    defaultOpen:true,
                    subViews : [{
                        name : "siteList",
                        order:0,
                        defaultOpen:false,
                        url : "./site/mysite/table"
                    },{
                        name : "siteOverview",
                        order:1,
                        defaultOpen:true,
                        url : "./site/mysite/overview"
                    },{
                        name : "siteGis",
                        order:2,
                        defaultOpen:false,
                        url : "./site/mysite/gis_new"
                    },{
                        name : "siteScada",
                        order:3,
                        defaultOpen:false,
                        url : "./site/mysite/scada/scadaview"
                    }]
                },{
                	name : "global",
                    order:1,
                    defaultOpen:false,
                    url : "./site/globalScada/globalview"
                },
                {
                	name:"devicetouch",
                	order:2,
                	defaultOpen:false,
                	url : "./site/maintain/maintain"
                }],
                renderer : function(){
                }
            };
            var notice = {
                name : "notice",
                order:5,
                defaultOpen:false,
                subNavs : [{
                    name : "alarm",
                    order:0,
                    defaultOpen:true,
                    url : "./notice/alarm/table/all"
                },{
                    name : "log",
                    order:1,
                    defaultOpen:false,
                    url : "./notice/log/behav/behav"
                }]
            };
            
            var task = {
                    name : "task",
                    order:6,
                    defaultOpen:false,
                    subNavs : [{
                        name : "task",
                        order:0,
                        defaultOpen:true,
                        url : "./task/tasking/tasks"
                    }]
            };
            var organ = {
                    name : "organ",
                    order:7,
                    defaultOpen:false,
                    subNavs : [{
                        name : "organ",
                        order:0,
                        defaultOpen:true,
                        url : "./organization/table"
                    }]
            };
            /*
             * subViews视图的命名(name字段)：以list、overview、gis、scada结尾，不论大小写，
             * 都会截取name的结尾和"nav-sub-view-"连接，形成类名
             * 使用已在nav.css定义的样式；
             * 如果不是以‘list、overview、gis、scada’中任何一个结尾的，则需要自定义样式（依旧是和'nav-sub-view-'组成类名），
             * 可以参考预定义的样式书写，
             * 并将结尾添加到下面这个数组，请在命名的时候有良好的区分
             * */
            var viewName=['list','overview','gis','scada'];
            /*
             * 一级导航的命名（name字段）:以以下列出的8种名称命名(不论大小写)，会和'nav-main-left-app-'连接成类名，
             * 默认使用nav.css里已定义的样式，
             * 以其他名称命名，则需要在nav.css自行添加类名定义样式，并且将名称(name)添加到以下数组中，可以参考预定义的样式书写*/
            var navName=['home','system','report','device','site','notice','task','organ'];
            /*
             * 二级导航的命名没有要求
             * */
            /*
             * 所有命名请检查国际化
             * */
            var appConfig = {
            		navArr:[home,system,report,device,site,notice,task,organ],
            		viewName:viewName,
            		navName:navName
            };
	return appConfig;
})
