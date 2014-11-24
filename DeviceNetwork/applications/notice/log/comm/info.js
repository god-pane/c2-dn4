define(function(require){
	var cloud = require("cloud/base/cloud");
	var infoHtml = require("text!./info.html");
	
	var dateConvertor = function(name) {
			return cloud.util.dateFormat(new Date(parseInt(name)), "yyyy-MM-dd hh:mm:ss");
	};
	var opLevel = function(level){
		var reInfo;
		switch (level) {
		case 2:
			reInfo = locale.get({lang:"debug"});
			reInfo="<img src='notice/log/imgs/log-level-3.png' />"+"\t\t"+reInfo;
			break;
		case 3:
			reInfo = locale.get({lang:"info"});
			reInfo="<img src='notice/log/imgs/log-level-2.png' />"+"\t\t"+reInfo;
			break;
		case 4:
			reInfo = locale.get({lang:"alert"});
			reInfo="<img src='notice/log/imgs/log-level-4.png' />"+"\t\t"+reInfo;
			break;
		case 5:
			reInfo = locale.get({lang:"error"});
			reInfo="<img src='notice/log/imgs/log-level-5.png' />"+"\t\t"+reInfo;
			break;
		case 6:
			reInfo = locale.get({lang:"serious_error"});
			reInfo="<img src='notice/log/imgs/log-level-6.png' />"+"\t\t"+reInfo;
			break;
		}
		return reInfo;
	}
	var info = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.datas = options.datas;
			this._render();
		},
		render: function(){
            if (this.id) {
            	this.mask();
                this.loadRoleInfo();
            } else {
                this.clear();
            }	
        },
		_render:function(){
			var self = this;
			self.element.html(infoHtml);
			$("td>input").attr("disabled","disabled");
			$("#log-system-table-edit").click(function(){
				$("td>input").removeAttr("disabled");
				$("#log-system-table-submit").css("display","block");
				$("#log-system-table-cancel").css("display","block");
			});
			$("#log-system-table-cancel").click(function(){
				$("td>input").attr("disabled","disabled");
				$("#log-system-table-submit").css("display","none");
				$("#log-system-table-cancel").css("display","none");
			});
			//兼容ie9
			$("#log-system-table tr td").css({
				"font-size":"12px",
				"color":"#333",
				"text-align":"left"
			});
			$("#log-system span").css({
				"float":"left",
				"margin":"0 15px 0 20px"
			});
			$(".td160").css({
				"width":"136px",
				"overflow":"hidden"
			});
			$("#content").css({
				"resize":"none",
				"width":"136px",
				"height":"60px"
			});
			$("#log-system").css({
				"margin":"0 auto",
				"width":"100%",
				"height":"25px",
				"text-align":"center"
			});
			$("#log-system-table").css({
				"margin":"0 auto",
				"border-collapse":"separate",
				"border-spacing":"8px 15px"
			});
			$("#log-system-infos").css({
				"text-align":"center",
				"vertical-align":"middle"
			});
			$("#log-system-table-submit").css({
				"display":"none",
				"float":"left"
			});
			$("#log-system-table-cancel").css({
				"display":"none",
				"float":"left"
			});
			$("#log-system-table-edit").css({
				"float":"left"
			});
			$("#log-system-buttons").css({
				"padding-left":"70px"
			});
		},
		submit:function(){
			
		},
		setInfo: function(data){
			if (data){
				//$("#level").text(opLevel(data.level));
				$("#level")[0].innerHTML=opLevel(data.level);
	            $("#time").text(dateConvertor(data.timestamp));
	            $("#devicename").text(data.deviceName.length>16?data.deviceName.substring(0,15)+"...":data.deviceName).attr("title",data.deviceName);
	            $("#sitName").text(data.siteName.length>16?data.siteName.substring(0,15)+"...":data.siteName).attr("title",data.siteName);
	            $("#from").text(data.ip);
	            $("#content").val(data.content);
			}else{
				$("#level").text("");
	            $("#time").text("");
	            $("#devicename").text("").attr("title","");
	            $("#sitname").text("").attr("title","");
	            $("#from").text("");
	            $("#content").val("");
			}
        }
	});
	return info;
});