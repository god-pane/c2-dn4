define(function(require){
	var cloud = require("cloud/base/cloud");
//	var html = require("text!./all.html");
//	var layout = require("cloud/lib/plugin/jquery.layout");
//	var Center = require("./center");
	var Button = require("cloud/components/button");
	var Info = require("./info");
	var service = require("./service");
	var Grid = require("../../../template/grid");
	var InputSuggest = require("cloud/components/input-suggest");
	require("cloud/lib/plugin/jquery.multiselect");
	
	var columns = [{
        "title": "级别",
        "lang":"{text:alarm_level}",
        "dataIndex": "level",
        "cls": "level",
        "width": "15%",
        render: function (value, type) {
            if (type == "display"){
                var levelStr = "";
                switch(value){
                case service.LEVELS.TIP:
                    levelStr = locale.get("remind");
                    levelStr="<img src='notice/alarm/table/imgs/alarm-level-1.png' style='position:absolute'/>"+"\t\t"+"<span style='margin-left:20px'>"+levelStr+"</span>";
                    break;
                case service.LEVELS.WARN:
                    levelStr = locale.get("warn");
                    levelStr="<img src='notice/alarm/table/imgs/alarm-level-2.png' style='position:absolute'/>"+"\t\t"+"<span style='margin-left:20px'>"+levelStr+"</span>";
                    break;
                case service.LEVELS.MINOR_ALARM:
                    levelStr = locale.get("minor_alarm");
                    levelStr="<img src='notice/alarm/table/imgs/alarm-level-3.png' style='position:absolute'/>"+"\t\t"+"<span style='margin-left:20px'>"+levelStr+"</span>";
                    break;
                case service.LEVELS.IMPORTANT_ALARM:
                    levelStr = locale.get("important_alarm");
                    levelStr="<img src='notice/alarm/table/imgs/alarm-level-4.png' style='position:absolute'/>"+"\t\t"+"<span style='margin-left:20px'>"+levelStr+"</span>";
                    break;
                case service.LEVELS.SEVERE_ALARM:
                    levelStr = locale.get("severe_alarm");
                    levelStr="<img src='notice/alarm/table/imgs/alarm-level-5.png' style='position:absolute'/>"+"\t\t"+"<span style='margin-left:20px'>"+levelStr+"</span>";
                    break;
                }
                return levelStr;
            }else{
            	return value;
            }
        }
    },{
        "title": "告警来源",
        "lang":"{text:alarm_origin}",
        "dataIndex": "sourceName",
        "cls": "sourceName",
        "width": "15%"
    },
    {
        "title": "现场名称",
        "lang":"{text:site_name}",
        "dataIndex": "siteName",
        "cls": "siteName",
        "width": "15%"
    },
    {
        "title": "状态",
        "lang":"{text:state}",
        "dataIndex": "state",
        "cls": "state",
        "width": "20%",
        render: function (value, type) {
            if (type == "display"){
                var stateStr = "";
                switch(value){
                case service.STATES.AFFIRMED:
                    stateStr = locale.get("affirmed");
                    break;
                case service.STATES.NOT_AFFIRMED:
                    stateStr = locale.get("not_affirmed");
                    break;
                case service.STATES.CLEARED:
                    stateStr = locale.get("cleared");
                    break;
                }
                return stateStr;
            }else{
            	return value;
            }
        }
    },
    {
        "title": "告警描述",
        "lang":"{text:description}",
        "dataIndex": "desc",
        "cls": "desc",
        "width": "20%"
    },
    {
            "title": "时间",
            "lang":"{text:alarm_time}",
            "dataIndex": "timestamp",
            "cls": "timestamp",
            "width": "15%",
            render: function (value, type) {
                if(type === "display"){
                    return cloud.util.dateFormat(new Date(value), "yyyy-MM-dd hh:mm:ss");
                }else{
                    return value;
                }
            }
        }
    ];
	
	var Table = Class.create(cloud.Component,{
        initialize: function($super, options){
            var self = this;
            $super(options);
            var info = null;
            //声明模板
            this.tableModule = new Grid({
                service: service, //传递service
                infoModule: function() {
                    if (info === null) {
                        info = new Info({
                            selector: $("#info-table")
                        });
                    }
                    self.info = info;
    
                    return info;
                },
                contentColumns: columns,
                selector: this.element,
                service: service//,
                /*events : {
                    "afterSelect" : this.toggleBtnStatus,
                    scope : this
                }*/
            });
            this.addToolbarItems();
            
            this._resetParams();
            
            locale.render({element:this.element});
            
            this.empower();
        },
        
        empower: function() {
        	var alarmConfig = permission.app("_alarm");
        	if(!alarmConfig.write) {
        		this.sureButton.hide();
                this.clearButton.hide();
        	}
//        	this.sureButton.disable();
//            this.clearButton.disable();
        },
        
        _resetParams : function(){
            service.queryParams = null;
        },
        
        handleQuery : function(){
//            self.renderByParams();
//            var params = this.getSearchParams();
            var params = this.getSelectParams();
            if (!params){
                return;
            }else{
                if (params.levels.length == 0 || params.status.length == 0){
                    dialog.render({
                        lang: "levels_or_states_cannot_empty"
                    });
                    return;
                }
            };
            this.setParamsToService(params);
            
            this.tableModule.loadData();
        },
        
        addQueryBtn : function(toolbar){
            var self = this;
            this.queryBtn = new Button({
//                container: this.element.find(".alarm-bar-right"),
                text: locale.get("query"),
                events: {
                    click: this.handleQuery,
                    scope : this
                }
            });
            this.queryBtn.element.css({
                "margin" : "0px 0px 4px 10px"
            });
            toolbar.appendLeftItems([this.queryBtn]);
        },
        
        addSiteInput: function(toolbar) {
        	this._inputSuggest = new InputSuggest({
        		//selector: "#input_suggest_box_ID",
     			width: 220,
    			height: 15,
    			prompt: locale.get({lang: "enter_the_site_name"}),
    			event:{search:function(obj) {
    				//alert(obj.name);
    			}},
    			dataProperty: "name",
        	});
        	
        	var spanbox = $("<div><div>").css({
        		border: "0px solid red",
        		//width: "280px",
        		height: "10px",
        		"margin": "-15px 0px 0px 10px",
        	});
        	var labelsite = $("<span>"+locale.get({lang: "site"})+":&nbsp;</span>");
        	spanbox.append(labelsite);
        	spanbox.append(this._inputSuggest._inputText);
        	
        	
        	toolbar.appendLeftItems([spanbox]);
        },       
        addInputBtn : function(toolbar){
        	var self = this;
        	var storage = window.localStorage;
//        	storage.setItem("noticeStatus", true);
        	self.inputBtn = new Button({
             	checkbox: true,
                 disabled: false,
//                 container: this.element.find(".alarm-bar-right"),
                 text: locale.get("show_notification_dialog"),
                 extraClass: "notification_dialog",
                 events: {
                     click: function(){
                     	if(storage.getItem("noticeStatus") === "false"){
                     		self.inputBtn.select();
                     		storage.setItem("noticeStatus",true);
                     		
                     	}else if(storage.getItem("noticeStatus") === "true"){
                     		self.inputBtn.unSelect();
                     		storage.setItem("noticeStatus",false);
                     	}
                     },
                     scope : this
                 }
             });
        	
        	self.inputBtn.element.css({
                "margin-left" : "10px"
            });
        	
//        	$("#" + self.inputBtn.id).attr("id","notification_dialog").attr("_id","notification_dialog");
        	
//        	console.log("self.inputBtn",self.inputBtn);
        	
        	toolbar.appendLeftItems([self.inputBtn]);
        	
        	if(storage.getItem("noticeStatus") === "false"){
        		self.inputBtn.unSelect();
        	}else if(storage.getItem("noticeStatus") === "true"){
        		self.inputBtn.select();
        	}
        	
//            var self = this;
//            this.queryBtn = new Button({
//            	checkbox: true,
//                disabled: false,
////                container: this.element.find(".alarm-bar-right"),
//                text: locale.get("query"),
//                events: {
//                    click: function(){
//                    	addInputBtn.select();
//                    },
//                    scope : this
//                }
//            });
//            this.queryBtn.element.css({
//                "margin-left" : "10px"
//            });
//            toolbar.appendLeftItems([this.queryBtn]);
            
        },
        
        addSelectItems : function(toolbar){
            var self = this;
            var labelCss = {
                    "margin-bottom": "-3px"
                };
            
            var levelLabel = $("<span lang=\"text:alarm_level+:\" class=\"alarm-toolbar-label\"></span>").css(labelCss);
            this.levelSelect = $("<select id=\"alarm-bar-level\" multiple=\"multiple\" >" +
                    "<option id=\"alarm_level_1\" value=\"5\" selected=\"selected\" lang=\"severe_alarm\">"+ locale.get("severe_alarm") +"</option>" +
                    "<option id=\"alarm_level_2\" value=\"4\" selected=\"selected\" lang=\"important_alarm\">"+ locale.get("important_alarm") +"</option>" +
                    "<option id=\"alarm_level_3\" value=\"3\" selected=\"selected\" lang=\"minor_alarm\">"+ locale.get("minor_alarm") +"</option> " +
                    "<option id=\"alarm_level_4\" value=\"2\" selected=\"selected\" lang=\"warn\">"+ locale.get("warn") +"</option>" +
                    "<option id=\"alarm_level_5\" value=\"1\" selected=\"selected\" lang=\"remind\">"+ locale.get("remind") +"</option>" +
                "</select>");
            var stateLabel = $("<span lang=\"text:state+:\" class=\"alarm-toolbar-label\"></span>").css(labelCss);
            this.statusSelect = $("<select id=\"alarm-bar-status\" multiple=\"multiple\">" +
                    "<option  value=\"1\" selected=\"selected\" lang=\"not_affirmed\">"+ locale.get("not_affirmed") +"</option>" +
                    "<option  value=\"0\" selected=\"selected\" lang=\"affirmed\">"+ locale.get("affirmed") +"</option>" +
                    "<option  value=\"-1\" selected=\"selected\" lang=\"cleared\">"+ locale.get("cleared") +"</option>" +
                "</select>");
            
            toolbar.appendLeftItems([levelLabel, this.levelSelect, $("<span>&nbsp;&nbsp;</span>") ,stateLabel, this.statusSelect], 1);
            
            var defautMutiselectCfg = {
                checkAllText:locale.get({lang:"check_all"}),
                uncheckAllText:locale.get({lang:"uncheck_all"}),
                noneSelectedText:locale.get({lang:"please_select"}),
                selectedText: "# " + locale.get({lang:"is_selected"}),
                minWidth:160,
//                checkAll : self.renderByParams.bind(self),
//                uncheckAll : self.renderByParams.bind(self),
//                click : self.renderByParams.bind(self),
                open:function(){
                    $(".ui-multiselect-menu").width(180);
                }
            };
            
            this.levelSelect.multiselect(cloud.util.defaults({
                height:120,
            }, defautMutiselectCfg));
            this.statusSelect.multiselect(cloud.util.defaults({
                height:75,
            }, defautMutiselectCfg));
        },
        /*
        verifyUnfirmed : function(res){
            var result = false;
            var states = $A(res.pluck("state"));
            states = states.uniq();
            if (states.length == 1 && states[0] === service.STATES.NOT_AFFIRMED){
                result = true;
            }
            return result;
        },
        
        verifyUncleared : function(res){
            var result = true;
            var states = $A(res.pluck("state"));
            
            states.find(function(state){
                if (state == service.STATES.CLEARED) {
                    result = false;
                    return true;
                }
            });
            return result;
        },
        
        
        toggleBtnStatus : function(res){
//          console.log(res, "res")
            var self = this;
            self.selectedRes = res;
            if (res.length > 0){
                var unFirmed = self.verifyUnfirmed(res);
                var unCleared = self.verifyUncleared(res);
//                console.log("unFirmed", unFirmed);
//                console.log("unCleared", unCleared);
                if (unFirmed){
                    self.sureButton.enable();
                }else{
                    self.sureButton.disable();
                }
                if (unCleared){
                    self.clearButton.enable();
                }else{
                    self.clearButton.disable();
                }
            }else{
                self.sureButton.enable();
                self.clearButton.enable();
            }
        },*/
        
        handleAffirmOrClear : function(type, selectedRes){
            var self = this;
            
            var resToDo = $A(selectedRes).findAll(function(one){
                if (type == "affirm"){
                    return one.state == service.STATES.NOT_AFFIRMED;
                }else if (type == "clear"){
                    return one.state != service.STATES.CLEARED;
                }
            })
            
//            console.log(type, resToDo);
            
            var ids = resToDo.pluck("_id");
            
            ids.each(function(id){
                if (type == "affirm"){
                    self.info.doSureAlarm(id);
                }else if (type == "clear"){
                    self.info.doClearAlarm(id);
                }
            });
            this.tableModule.modules.content.total-=ids.size();
            this.tableModule.modules.content.unmask();
            this.tableModule.modules.content.refreshPage(this.tableModule.modules.content.nowPage,this.tableModule.modules.content.total);
//                this.content["delete"](this.content.getRowsByProp("_id", idsToDel));
//                this.totalCount -= idsToDel.size();
            this.tableModule.modules.content.updateCountInfo();
        },  
        _refreshAlarmSum: function() {
			service.getAlarmstop10({
				levelArr: [1, 2, 3, 4, 5],
				statusArr: [1],
			}, function(data) {
				//alert(data.total+"/"+data._total);
				var $sumIcon = $("#alarm-module-no-alarm-sum");
				if(data.total <= 0) {
					$sumIcon.css("display", "none");
				}
				else if(data.total > 99) {
					$sumIcon.css("display", "block");
					$sumIcon.html("99+");
				}
				else {
					$sumIcon.css("display", "block");
					$sumIcon.html(data.total);
				}
			});
		},
        addOptBtns : function(toolbar){
            var self = this;
            this.sureButton = new Button({
                container: this.element.find(".alarm-bar-right"),
                id: "alarm-bar-right-sureBtn",
                imgCls: "cloud-icon-yes",
                title: locale.get("batch_affirm"),
                events: {
                    click: function(){
                        var selectedRes = self.tableModule.getSelectedRes();
                        if (selectedRes && (selectedRes.length > 0)){
                            dialog.render({
                                lang: "affirm_confirm_alarm",
                                buttons:[{lang:"yes",click:function(){
                                        self.handleAffirmOrClear("affirm", selectedRes);
                                        self._refreshAlarmSum();
                                        dialog.close();
                                    }},{lang:"no",click:function(){
                                        dialog.close();
                                    }}]
                            });
                        }else{
                            dialog.render({lang:"please_select_at_least_one_config_item"});
                        }
                    }
                }
            });
            this.clearButton = new Button({
                container: this.element.find(".alarm-bar-right"),
                id: "alarm-bar-right-clearBtn",
                imgCls: "cloud-icon-no",
                title: locale.get("batch_clear"),
                events: {
                    click: function(){
                        var selectedRes = self.tableModule.getSelectedRes();
                        if (selectedRes && (selectedRes.length > 0)){
                            dialog.render({
                                lang: "affirm_clear_alarm",
                                buttons:[{lang:"yes",click:function(){
                                        self.handleAffirmOrClear("clear", selectedRes);
                                        self._refreshAlarmSum();
                                        dialog.close();
                                    }},{lang:"no",click:function(){
                                        dialog.close();
                                    }}]
                            });
                            
                        }else{
                            dialog.render({lang:"please_select_at_least_one_config_item"});
                        }
                    }
                }
            });
            toolbar.appendRightItems([this.sureButton, this.clearButton], 0);
        },
        
        addSearchBySite : function(toolbar){
            /*var content = $("<span id=\"alarm-search-by-site>");
            toolbar.appendLeftItems([content]);
            
            temp = new InputSuggest({
                //container: $("#inputbox"),
                selector: "#inputbox",
                width: 220,
                height: 20,
                prompt: "请输入现场名称",
                event:{search:function(obj) {
                    alert(obj.name);
                }},
                dataProperty: "name",
                data: [
                ],
            });*/
        },
        
        addToolbarItems:function(){
            var self = this;
            var toolbar = this.tableModule.getToolbar();
            toolbar.deleteRightItem(0);//delete add button
            toolbar.deleteRightItem(0);//delete del button
            this.tableModule.modules.content.deleteBtn.hide();
            
            
            this.addSelectItems(toolbar);
            this.addSiteInput(toolbar);
            this.addQueryBtn(toolbar);
            this.addInputBtn(toolbar);
            this.addOptBtns(toolbar);
        },
        
        renderByParams : function(){
            var params = this.getSelectParams();
//            console.log("selectedParams", params)
            this.setParamsToService(params)
//            this.tableModule.loadData();
        },
        
        setParamsToService : function(params){
            service.queryParams = params;
        },
        
        getSearchParams : function(){
            return service.queryParams;
        },
        
        getSelectParams:function(){
            var levelSelect = this.levelSelect;
            var statusSelect = this.statusSelect;
            var levels = levelSelect.multiselect("getChecked").map(function(){
                return parseFloat(this.value);  
            }).get();
            var status = statusSelect.multiselect("getChecked").map(function(){
                return parseFloat(this.value);  
            }).get();
            
            var site_name = this._inputSuggest.getValue();
            if(site_name == locale.get({lang: "enter_the_site_name"})) {
            	site_name = null;
            }
            return {
                "levels" : levels,
                "status" : status,
                "site_name" : site_name,
            };
            
        },
        
        destroy:function(){
            try {
                this.clearButton.destroy();
                this.sureButton.destroy();
                this.queryBtn.destroy();
//                this.inputBtn.destroy();
                this.info.destroy();
                this.levelSelect.multiselect("destroy");
                this.statusSelect.multiselect("destroy");
                this.tableModule.destroy();
                this.tableModule = null;
                
                service.queryParams = null;
                
            } catch (e) {
                // TODO: handle exception
            }
        }
	});
	return Table;
});