define(function(require){
	var cloud = require("cloud/base/cloud");
	var infoHtml = require("text!./info.html");
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
		},
		submit:function(){
			
		},
		setInfo: function(data){
            $("#level").val(data.level);
            $("#time").val(data.timestamp);
            $("#from").val(data.ip);
            $("#operator").val(data.username);
            $("#content").val(data.content);
        }
	});
	return info;
});