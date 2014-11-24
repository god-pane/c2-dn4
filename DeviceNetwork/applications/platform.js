define(function(require) {
	require("cloud/base/cloud");
    require("cloud/lib/plugin/jquery-ui");
    require("cloud/lib/plugin/jquery.watermark");
    require("cloud/lib/plugin/jquery.qtip");
    require("cloud/lib/plugin/jquery.layout");
    var Navigator = require("./navigator/nav");
    //load scada image
    //var Global=require("../applications/site/mysite/scada/components/canvas/Global");
    var Box = require("./notice/alarm/table/box");
    var service = require("./notice/alarm/table/service");
    //引入导航配置文件
	var appConfig=require("./appConfig");
    //If do not log in, return to home page
    cloud.Ajax.checkLogin();
	
    var Platform = Class.create({
        initialize: function() {
            this.currentApplication = null;
            this.viewNavDom = $("#user-nav-view-model");
            this.content = $("#user-content");
            this.currentElement = "";
           // Global.init();
            //获取应用的监视权限列表
            this.gatesConfig=permission.getGatesConfig();
            this.roleInfo=this._getRoleInfo();
            this.renderHeader();
            cloud.platform = Platform;
            new Box({service:service});
            this.navs=appConfig.navArr;
            this._loadApps();             
            this.ignoreHistory = false;
            var self = this;
            this.customlogo();
            this.extend();
        },
        extend: function() {
        	var bool=permission.code(["91"]);
        	if(!bool) {
        		$("#nav-sub-view-site-siteScada").remove();
        	}
        },
        customlogo:function(){
            var indexURL=window.localStorage.getItem("indexURL");
            if(indexURL!="www"){
                if(indexURL=="index/whiteboard"){
                    var urlArr=indexURL.split("/");
                    var href="../"+indexURL+"/images/favicon.ico";
                    $("#title").text(locale.get("welcome"));
                    $("#icon-link").attr({
                        "href":href
                    });
                    $("#shortcut-link").attr({
                        "href":href
                    });
                    $("#bookmark-link").attr({
                        "href":href
                    });
                }else{
                    var urlArr=indexURL.split("/");
                    $("#title").text(locale.get(urlArr[1]+"+"+"-+device_cloud"));
                    var href="../"+indexURL+"/images/favicon.ico";
                    $("#icon-link").attr({
                        "href":href
                    });
                    $("#shortcut-link").attr({
                        "href":href
                    });
                    $("#bookmark-link").attr({
                        "href":href
                    });
                    $(".nav-main-corp-content-p2").text(locale.get(urlArr[1]+"_device_cloud"));
                }
            }else{
                var href="../favicon.ico";
                $("#title").text(locale.get({lang:"inhand+-+device_cloud"}));
                $("#icon-link").attr({
                    "href":href
                });
                $("#shortcut-link").attr({
                    "href":href
                });
                $("#bookmark-link").attr({
                    "href":href
                });
                $(".nav-main-corp-content-p2").text(locale.get("inhand_device_cloud"));
            }
        },
        //获取角色信息
        _getRoleInfo:function(){
        	return permission.getInfo();
        },
        //在页面上设置用户帐户信息的位置
        _setAccountPosition:function(){
        	$("#nav-main-right").hide();
			var offsetWidth = parseFloat(document.body.offsetWidth);
			if(offsetWidth > 1030){
				$("#nav-main-right").css({left:offsetWidth-230});
			}else{
				$("#nav-main-right").css({left:1030});
			}
			$("#nav-main-right").show();
        
        },
        //展示用户信息面板
        _renderAccount:function(){
			var self = this;
			if(self.account){
				self.account.destroy();
			}
			require(["./navigator/account"], function(Account){
	        	self.account = new Account({
	        		container:"#nav-account-panel"
	        	});
			});
        
        },
        //为“用户名字”绑定打开事件以及事件处理函数
        _openUserInfoEvents:function(){
        	var self = this;
			$("#nav-main-right-account-name").qtip({
				content:{
					text:$("#nav-account-panel")
				},
				position: {
					my:"top right",
					at: "bottom middle",
					of: "#nav-main-right-account-name"
			  	},
				show:{
					event:"click"
				},
				hide:{
					event:"click unfocus"
				},
				style: {
                    classes: "qtip-shadow cloud-qtip",
					width: 318,
					def:false
                },
				events:{
					hide:function(){
						self.account.initbuttonstatus();
					},
					show:function(){
						self._renderAccount();
					}
				}
			});
			
			//on reize reset account position
			var resizeTimer = null;
			function doResize(){
				self._setAccountPosition();
				$(window).resize(function(){
					if(resizeTimer){
						clearTimeout(resizeTimer); 
					}
					resizeTimer = setTimeout(function(){doResize();},300); 
				});
			}
			
			doResize();
			
        
        },
        //请求用户信息
        _getUserInfo:function(){
			cloud.Ajax.request({
        	url: "/api2/users/this",
        	type:"GET",
            dataType: "json",
            parameters: {
                verbose: 3
            },
        	success: function(data){
        		var result = data.result;
        		cloud.platform.loginedUser = {"_id" : result._id};// add by qinjunwen
//				cloud.storage.sessionStorage("userName",result)
				if(result.name.length > 8){
					result.name = result.name.substr(0,8)+"...";
				}
				$("#nav-main-right-account-name").text(result.name);
			}
        });	
        },
        //进入系统时，打开默认的导航视图
        _loadApps : function(){
            var self = this;
            
            self._getUserInfo();
            self._drawNavigator();
            self.loadApp();
        },
        //绘制导航栏的入口函数
        _drawNavigator : function(){
            var self = this;
            //经过监视权限筛选的一级导航项数组
            var navsByAuthority=[];
            //经过字段order排序（小到大）的一级导航项数组
            var navsByOrder=[];
            //判断一级导航对应的二级导航项是否存在监视权限为true的，如果存在则将该一级导航项存储
            this.navs.each(function(one){
            	if(one.subNavs){
    	        	var gateConfigBool=false;
    	             one.subNavs.each(function(subNav,i,subNavs){
    	              gateConfigBool=gateConfigBool || (self.gatesConfig[one.name][subNav.name]);
    	             });
    	            if(gateConfigBool){
    	            	//主导航的“机构”比较特别，需要通过其他的方式验证
    	            	if(one.name=="organ"){
    	            		if(self.roleInfo.oid=="0000000000000000000abcde" && self.roleInfo.roleType==1){
    	            			navsByAuthority.push(one);
    	            		}
    	            	}else{
    	            		navsByAuthority.push(one);
    	            	}  	            	
    	         	}
    	        }
            });
            //将navsByAuthority数组按一级导航项的order字段进行升序排序，生成navsByOrder数组
        	navsByAuthority.each(function(one){
        		navsByOrder.push(one.order);
        	});
        	for(var i=0;i<navsByOrder.length-1;i++){
        		for(var j=0;j<navsByOrder.length-i-1;j++){
        			if(navsByOrder[j]>navsByOrder[j+1]){
        				var temp=navsByOrder[j+1];
        				navsByOrder[j+1]=navsByOrder[j];
        				navsByOrder[j]=temp;
        			}
        		}
        	};
    		for(var k=0;k<navsByOrder.length;k++){
    			navsByAuthority.each(function(one){
    				if(one.order==navsByOrder[k]){
    					navsByOrder[k]=one;
        			}
    			}) ;              			
    		};
    		//将最终的数组赋值给this.navs
    		this.navs=navsByOrder;
    		this.navs.each(this._drawNavs.bind(this));
        },  
        //绘制具体某个主导航项的元素节点
        _drawNavs : function(one, i, array){
            var self = this;
            var contentId="nav-main-left-app";
            var content = $("#"+contentId);
            var navStr=one.name.toLowerCase();
            one.id=contentId+"-"+navStr;
            //一级导航项名字数组（很重要），用来检测添加的一级导航项的类名是否已经在nav.css中定义
            //，主要是提示开发者是否需要自己定义样式
            var navName=appConfig.navName;
            var subStr;
            navName.each(function(one,i,arr){
            	if(navStr==one){
            		subStr=one;
            		return false;
            	}
            });
            if(subStr){
            	one.cls=contentId+"-"+navStr;
            }else{
            	dialog.render({lang:"main_nav_name"});
            };
            //导航项的元素节点
            var el = $("<li>").attr({
                id : one.id,
                title : locale.get(one.name),
            }).addClass(one.cls)
            .click(function(){
                self.loadNav(one, array, true);
            })
            .mouseover(function(){
                el.addClass(one.cls + "-on");
            })
            .mouseout(function(){
                el.removeClass(one.cls + "-on");
            });            
            el.append($("<p>")).appendTo(content);
            one.el = el;
            //如果一级导航项有二级导航（一般都有），则生成一个装载该二级导航的元素节点，作为该一级导航项的属性（形成控制）
            if (one.subNavs){           	
            	var subNavCnt = $("<ul>").attr({
                        id : one.id + "-ul"
                    }).addClass("nav-sub-left-app").hide().appendTo($("#nav-sub-left-app"));
                    one.subNavEl = subNavCnt;
                    //利用应用的监视权限列表筛选出可视的二级导航项，形成数组subNavsByAuthority
                    var subNavsByAuthority=[];
                    one.subNavs.each(function(subNav,i,subNavs){
                    	if(self.gatesConfig[one.name][subNav.name]){
                    		//对现场下的siteScada进行差异处理
                    		if(subNav.name=="site" && subNav.subViews){
                                var scadaRead=permission.app("_scada")["read"];
                    			if(!scadaRead){
                    				subNav.subViews.pop();
                    			}
                    		}
                    		subNavsByAuthority.push(subNav);
                    	}
                    });
                    one.subNavs=subNavsByAuthority;
                    //对subNavsByAuthority进行升序排列
                    var subNavsByOrder=[];
                    var tempArr=one.subNavs;
                    tempArr.each(function(one){
                    		subNavsByOrder.push(one.order);
                    	});
                    	for(var i=0;i<subNavsByOrder.length-1;i++){
                    		for(var j=0;j<subNavsByOrder.length-i-1;j++){
                    			if(subNavsByOrder[j]>subNavsByOrder[j+1]){
                    				var temp=subNavsByOrder[j+1];
                    				subNavsByOrder[j+1]=subNavsByOrder[j];
                    				subNavsByOrder[j]=temp;
                    			}
                    		}
                    	};
                    		for(var k=0;k<subNavsByOrder.length;k++){
                    			tempArr.each(function(one){
                    				if(one.order==subNavsByOrder[k]){
                        				subNavsByOrder[k]=one;
                        			}
                    			})               			
                    		};
                    one.subNavs=subNavsByOrder;
                    one.subNavs.each(function(subNav, i, subNavs){                  	
                            self._drawSubNavs(subNav, i, subNavs, subNavCnt,one);    
                    });              
            }
        },
        //绘制具体某一个二级导航项元素节点
        _drawSubNavs :function(subNav, i, subNavs, subNavCnt,nav){
            var self = this;
            subNav.id="nav-subnav-"+nav.name+"-"+subNav.name;
            subNav.cls="nav-subnav-"+nav.name+"-"+subNav.name;
            var prefix = "";
            if (subNavs.length > 1 && i > 0){
                subNavCnt.append($("<li>").html("  |  &nbsp;&nbsp;"));
            };
            var el = $("<a>").attr({
                id : subNav.id,
                title : locale.get(subNav.name)
            })
            .text(locale.get(subNav.name))
            .addClass(subNav.cls)
            .addClass("nav-subnav")
            .appendTo($("<li>").appendTo(subNavCnt));
            el.click(function(){
                self.loadSubNav(subNav, subNavs, true);                
            });
            subNav.el = el;
            //如果该二级导航项有三级应用视图，则生成装载三级应用视图的元素节点，作为该二级导航项属性（形成控制）
            //目前没有对三级视图进行监视权限的控制，因此默认所有应用视图可见
            var tempArr=subNav.subViews;
            if (tempArr){
                var viewContent = $("<span>").hide().appendTo($("#nav-sub-left-view"));
                subNav.viewContent = viewContent;
                //对应用视图根据order字段进行升序排序（）
                var subViewsByOrder=[];
                tempArr.each(function(one){
                	subViewsByOrder.push(one.order);
            	});
            	for(var i=0;i<subViewsByOrder.length-1;i++){
            		for(var j=0;j<subViewsByOrder.length-i-1;j++){
            			if(subViewsByOrder[j]>subViewsByOrder[j+1]){
            				var temp=subViewsByOrder[j+1];
            				subViewsByOrder[j+1]=subViewsByOrder[j];
            				subViewsByOrder[j]=temp;
            			}
            		}
            	};
            		for(var k=0;k<subViewsByOrder.length;k++){
            			tempArr.each(function(one){
            				if(one.order==subViewsByOrder[k]){
            					subViewsByOrder[k]=one;
                			}
            			})               			
            		};
            		subNav.subViews=subViewsByOrder;
            		subNav.subViews.each(function(view, i, subViews){
                    self._drawSubviews(view, i, subViews, viewContent,subNav);
                });
            }
        },
        //绘制具体的某一个应用视图项
        _drawSubviews : function(view, i, subViews, viewContent,subNav){
            var self = this;
            view.id="nav-sub-view-"+subNav.name+"-"+view.name;
            var viewStr=view.name.toLowerCase();
            var viewName=appConfig.viewName;
            var subStr;
            //检测视图对象的名称是否按规则命名（集体说明见appConfig.js文件），如果按规则命名那么就使用
            //已定义的css样式(nav.css)，否则需要开发者去nav.css中自定义样式
            viewName.each(function(one,i,arr){
            	var lastIndex=viewStr.lastIndexOf(one);
            	if(lastIndex>-1){
            		if(viewStr.slice(lastIndex)==one){
            			subStr=one;
                		return false;
            		}          		
              	}

            });
            if(subStr){
             	view.cls="nav-sub-view-"+subStr;            	
             }
            else{
            	dialog.render({lang:"subview_name"});
            };
            	var el = $("<span>").attr({
                    id : view.id,
                    title : locale.get(view.name)
                }).addClass(view.cls).addClass("nav-sub-views")
                .click(function(){
                    self.loadSubView(view, subViews);
                }).appendTo(viewContent);
                view.el = el;      
        },
        //触发选中事件的主导航项的事件处理函数
        loadNav : function(nav, navs, chain){
            navs.each(function(one){
               one.el.removeClass("header-icon-on").removeClass(one.cls + "-active").addClass(one.cls);
            });
            nav.el.removeClass(nav.cls).addClass(nav.cls + "-active").addClass("header-icon-on");
            
            $("#nav-sub-left-app").children().hide();
            nav.subNavEl.show();           
            if (chain){
            	var self=this;
            	var flag=false;
            	var subNav=nav.subNavs.find(function(subNav){
            		if(subNav.defaultOpen){
            			return subNav;
            		}
            	});
            	if(subNav){
            		self.loadSubNav(subNav,nav.subNavs,true);
            	}else{
            		self.loadSubNav(nav.subNavs[0],nav.subNavs,true);
            	}     
            }
        },
        //触发选中事件的二级导航项的事件处理函数
        loadSubNav : function(subNav, subNavs, chain){
            subNavs.each(function(one){
                one.el.removeClass("nav-subnav-active").addClass("nav-subnav");
            });
            subNav.el.addClass("nav-subnav-active");
            
            $("#nav-sub-left-view").children().hide();
            
            if (subNav.url){
                this.loadApplication(subNav);
            }else if (subNav.subViews){
            	var self=this;
                subNav.viewContent.show();
                if(chain) {
                	var flag=false;
                	var subView=subNav.subViews.find(function(subView){
                		if(subView.defaultOpen){               			
                			return subView;
                		}
                	});
                	if(subView){
                		self.loadSubView(subView,subNav.subViews);
                	}
                	else{
                		self.loadSubView(subNav.subViews[0],subNav.subViews);
                	}
                }
            }
        }, 
        //触发选中事件的三级视图导航项的事件处理函数
        loadSubView : function(view, views){
            views.each(function(one){
                one.el.removeClass("nav-sub-view-active");
            });
            view.el.addClass("nav-sub-view-active");           
            if (view.url){
                this.loadApplication(view);
            }
        },       
        replaceAppState : function(stateMsg){
            if (history && history.replaceState){
                history.replaceState({app : this.appNow, msg : stateMsg}, document.title, window.location.href);
            }
        },
        //首次进入系统事件的处理函数，打开默认的应用视图
        loadApp : function(){
        	var self=this;
        	var nav=this.navs.find(function(nav){
        		if(nav.defaultOpen){
        			flag=true;
        			return nav;
        		}
        	});
        	if(nav){
        		self.loadNav(nav,self.navs,true);
        	}else{
        		self.loadNav(self.navs[0],self.navs,true);
        	}
        },       
        sendMsg : function(appName, msg){
            cloud.message.post("cloud.platform.apps." + appName, "onLoad", msg);
        },
        //加载具体应用的函数，这是核心方法
        loadApplication: function(application) {
            var msg = this.msgToSend;
            this.msgToSend = null;            
            var appUrl = application.url;
        	cloud.util.setCurrentApp(application);
            if (this.currentApplication && Object.isFunction(this.currentApplication.destroy)) {
                this.currentApplication.destroy();
                this.currentApplication = null;
            }           
            if (appUrl.endsWith(".html")) {
                $("#user-content").load(appUrl);
                this.appNow = application;
                msg && this.sendMsg(application.name, msg);
            } else {
                cloud.util.mask("#user-content");
                this.requestingApplication = appUrl;
                require([appUrl], function(Application) {
                    //judge if the previous requesting application is canceled.
                    if (this.requestingApplication === appUrl) {
                        if (this.currentApplication && Object.isFunction(this.currentApplication.destroy)) {
                            this.currentApplication.destroy();
                            this.currentApplication = null;
                        }
                        $("#user-content").empty();
                        cloud.util.unmask("#user-content");
                        if (Application) {
                            
                            this.currentApplication = new Application({
                                container: "#user-content"
                            });
                            this.appNow = application;
                            msg && this.sendMsg(application.name, msg);
                        }
                    }else{
                        console.log("app ignored: " + appUrl)
                    }
                }.bind(this));
            }
        },
        renderLayout: function() {
			var self = this;
            $("body").layout({
                defaults: {
                    paneClass: "pane",
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 1,
                    "spacing_closed": 1,
                    "togglerLength_closed": 50,
					togglerTip_open:locale.get({lang:"close"}),  
                    togglerTip_closed:locale.get({lang:"open"}),  
                    resizable: false,
                    slidable: false
                },
                north: {
                    paneSelector: "#user-header",
                    size: 61
                },
                center: {
                    paneSelector: "#user-content"
                },
				onresize: function(){
						$(window).resize();  
				}
            });
        },
        renderHeader: function() {
        	var self = this;
            this.navigat = new Navigator({
                selector: "#user-header"
            });
            this._openUserInfoEvents();
            this.renderLayout();
        }   
    });
    return Platform;
});