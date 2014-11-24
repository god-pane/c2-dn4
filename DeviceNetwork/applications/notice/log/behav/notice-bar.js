define(function(require){
	var cloud = require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery-ui");
	require("cloud/resources/css/jquery-ui.css");
	require("cloud/resources/css/jquery.multiselect.css");
	var Button = require("cloud/components/button");
	var service = require("./service");
	var NoticeBar = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.pars=null;
			this._render();
		},
		_render:function(){
			this._draw();
			this._renderSelect();
//			this._queryFun();
		},
		
		_draw:function(){
			var self = this;
			var $htmls = $(
			  +"<div></div>"
			  +"<div id='behav-all' style='width:auto;float:left;margin-top:5px'>"
			  +"<label style='margin:5px 20px auto 20px;float:left;' lang='text:level+:'>等级:</label>"
			  +"<select  id='multiselect' multiple='multiple' style='float:left;'>"
			  +"<option id='log_level_1' value='6' selected='selected' lang='text:serious_error'>严重错误</option>"
			  +"<option id='log_level_2' value='5' selected='selected' lang='text:error'>错误</option>"
			  +"<option id='log_level_3' value='4' selected='selected' lang='text:alert'>警告</option>"
			  +"<option id='log_level_4' value='3' selected='selected' lang='text:info'>信息</option>"
			  +"<option id='log_level_5' value='2' selected='selected' lang='text:debug'>调试</option>"
			  +"<option id='log_level_6' value='1' selected='selected' lang='text:trace'>详细</option>"
			  +"</select>"
			  +"<label style='margin:5px 20px auto 20px;float:left' lang='text:from+:'>从</label>"
			  +"<input style='width:85px;float:left;margin-top: 3px;' type='text' readonly='readonly' id='startTime' class='dateStyle' />"
			  +"<label style='margin:5px 20px auto 20px;float:left' lang='text:to+:'>到</label>"
			  +"<input style='width:85px;float:left;margin-top: 3px;' type='text' readonly='readonly' id='endTime' class='dateStyle' />"
//			  +"<button style='margin:auto 20px auto 20px' id='queryBtn'>查询</button>"
//			  +"<button id='btn'>导出</button>"	
			  +"</div>"
			  +"<div id='queryBtn' style='float:left;margin:5px auto auto 10px'></div>"
			  +"<div id='exportBtn' style='float:left;margin:5px auto auto 10px'></div>"
			);
			this.element.append($htmls);	
		},
		
		_renderSelect:function(){
			var self = this;
			$(function(){
				var datePickerOpts = {
//					      showButtonPanel: true,
					showOn: "button",
					buttonImage: require.toUrl("../../../navigator/resources/images/calendar.gif"),
					buttonImageOnly: true,
					dateFormat:"yy/mm/dd",
					changeMonth: true,
      				changeYear: true,
					dayNamesMin: [locale.get({lang:"sun"}),locale.get({lang:"mon"}), locale.get({lang:"tues"}), locale.get({lang:"wed"}), locale.get({lang:"thur"}), locale.get({lang:"fri"}), locale.get({lang:"sat"})],
					monthNamesShort: [locale.get({lang:"jan"}), locale.get({lang:"feb"}),locale.get({lang:"mar"}), locale.get({lang:"apr"}), locale.get({lang:"may"}), locale.get({lang:"jun"}), locale.get({lang:"jul"}), locale.get({lang:"aug"}), locale.get({lang:"sep"}), locale.get({lang:"oct"}), locale.get({lang:"nov"}), locale.get({lang:"dec"})]
				};
				$( "#startTime" ).datepicker(datePickerOpts);
				$( "#endTime" ).datepicker(datePickerOpts);
//				$( "#startTime" ).datepicker( "setDate", "yy/mm/dd");
				$("#startTime").datepicker( "setDate", "-7d" );
				$( "#endTime" ).datepicker( "setDate", new Date());
				$("#startTime").bind("click",function(){
					$( "#startTime" ).datepicker("show");
				});
				$("#endTime").bind("click",function(){
					$( "#endTime" ).datepicker("show");
				});
					require(["cloud/lib/plugin/jquery.multiselect"],function(){
					$("#multiselect").multiselect({ 
						header:true,
						checkAllText:locale.get({lang:"check_all"}),
						uncheckAllText:locale.get({lang:"uncheck_all"}),
						noneSelectedText:locale.get({lang:"please_select"}),
						selectedText:"# "+locale.get({lang:"is_selected"}),
						minWidth:170,
						height:120
					});
//					$("#multiselectId").width("160");
					$("#multiselect+button").css("float","left");
					});
					$("#behav-all .ui-datepicker-trigger").css({'float':"left",margin:"4px 0 0 3px"});
			});
			new Button({
            	container : "#queryBtn",
            	id : "notice-bar-querybtn",
//            	imgCls : "cloud-icon-daoru",
            	text : "查询",
            	lang:"{title:query,text:query}",
            	events : {
            		click : self._queryFun.bind(this)
            	}
			});
			new Button({
            	container : "#exportBtn",
            	id : "notice-bar-exportbtn",
            	imgCls : "cloud-icon-daochu",
            	text : "导出",
            	lang:"{title:export,text:export}",
            	events : {
            		click : self._reportExcel.bind(this)
            	}
            });
		},
		_reportExcel:function(){
			this.fire("exportExl");
		},
		_queryFun:function(){
			var self = this;
//			$("#queryBtn").click(function(){
				var values = $("#multiselect").multiselect("getChecked").map(function(){
					return parseFloat(this.value);	
				}).get();
				var startTime = $( "#startTime" ).datepicker("getDate").getTime()/1000;
				var endTime = $( "#endTime" ).datepicker( "getDate").getTime()/1000 + 86399;
				var date = new Date();
				var hms = (date.getHours()*60*60)+(date.getMinutes()*60)+(date.getSeconds());
				var is = self._checkFormat(values,startTime,endTime);
				if(startTime === endTime){
					endTime += 86400;
				}
//				startTime+=hms;
//				endTime+=hms;
				var obj = {arr:values,startTime:startTime,endTime:endTime};
//				var testObj = {arr:[1,2,3,4,5],startTime:1352538973313,endTime:1364462119106};
				if(is == 0){
					self.fire("query",obj);
				}
//			});
		},
		_checkFormat:function(values,startTime,endTime){
			var isTrue = 0;
			if(values==0){
//				alert("日志等级不能为空！");
				dialog.render({lang:"level_not_null+!"});
				isTrue += 1;
			}
			if(startTime > endTime){
				dialog.render({lang:"start_date_cannot_be_greater_than_end_date+!"});
//				alert("开始日期不能大于结束日期！");
				isTrue += 1;
			}
			return isTrue;
		}
		
	});
	
	return NoticeBar;
	
});