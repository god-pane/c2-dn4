define(function(require){
	var cloud = require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery-ui");
	require("cloud/resources/css/jquery-ui.css");
	require("cloud/resources/css/jquery.multiselect.css");
	var service = require("./service");
	var Button = require("cloud/components/button");
	var NoticeBar = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.pars=null;
			this._render();
			this.values = new Array();
			this.values[0] = "0";
			this.values[1] = "1";
		},
		_render:function(){
			this._draw();
//			this._renderSelect();
//			this._queryFun();
		},

		_draw:function(){
			var self = this;
			var $htmls = $(
				  +"<div></div>"
				  +"<div style='width:100%;margin-top:5px'>"
				  +"<div style='float:left;margin-top: 4px;'>"
				  +"<label style='float:left;margin:auto 10px auto 20px'>"+locale.get({lang:"networking_state+:"})+"</label>"
				  +"<div id='lineBtn' style='float:left'></div>"
//				  +"<input type='checkbox' style='float:left;margin:2px 6px auto 6px;' class='isOnline' checked='checked' value='1'/><p  style='float:left;'>在线&nbsp;(<span id='online'></span>)</p>"
//				  +"<input type='checkbox' style='float:left;margin:2px 6px auto 15px;' class='isOnline' value='0'/><p  style='float:left;'>离线&nbsp;(<span id='offline'></span>)</p>"
                  +"<label style='float:left;margin:auto 10px auto 20px'>"+locale.get({lang:"gateway_name+:"})+"</label>"
                  +"<input class='bar-search-input' style='float:left;margin: -3px 0 0 0;height: 17px;width: 166px;'  placeholder='"+locale.get('empty_is_all')+"'>"
                  +"<div class='bar-button' id='bar-button-query' style='float: left;margin: -4px 0 0 5px;line-height: 20px;'></div>"
                  +"</div>"
				  +"<div id='module-bar-btn' style='float:right;margin:auto 50px auto 30px'></div>"
				  +"</div>"
			);
			this.element.append($htmls);

            $(".bar-search-input").keypress(function(e){
                if(e.keyCode == 13){
                    self._queryFun();
                }
            })
			
			this.onlineBtn = new Button({
				container:"#lineBtn",
                checkbox: true,
                id: "alarm-bar-online",
                events: {
                    click: function() { 
                    	if(self.onlineBtn.isSelected() === true){
                    		self.values[1] = "1";
                    	}else{
                    		self.values[1] = "";
                    	}
//                    	self._queryFun();
                    }
                },
                text: locale.get({lang:"online"}),//"在线(0)",
                disabled: false
            });
			
			this.offlineBtn = new Button({
				container:"#lineBtn",
				checkbox: true,
				id: "alarm-bar-offline",
				 cls:"isOnline",
				events: {
					click: function() { 
						if(self.offlineBtn.isSelected() == true){
							self.values[0] = "0";
                    	}else{
                    		self.values[0] = "";
                    	}
//						self._queryFun();
					}
				},
				text: locale.get({lang:"offline"}),//"离线(0)",
				disabled: false
			});
			this.onlineBtn.setSelect(true);
			this.offlineBtn.setSelect(true);
			$(".cloud-button-text").css("margin","-2px 2px 0px 0px");

            this.queryButton = new Button({
                container: this.element.find("#bar-button-query"),
                id: "queryBtn",
                text: locale.get({lang:"query"}),
                events: {
                    click: this._queryFun,
                    scope: this
                }
            });
			
//			new Button({
//            	container : "#module-bar-btn",
//            	id : "module-info-tag-edit",
//            	imgCls : "cloud-icon-daochu",
//            	text :locale.get({lang:"export"})// "导出"
//            	events : {
//            		click : self.enable.bind(this)
//            	}
//            });
//			service.getDeviceSum(1,function(num){
//				$("#online").text(num);
//			});

//			service.getDeviceSum(function(total,on){
//				var off = total - on;
//				self.offlineBtn.setText(locale.get({lang:"offline+("})+off+")");
//				self.onlineBtn.setText(locale.get({lang:"online+("})+on+")");
//			});
			
//			service.getDeviceSum(0,function(num,on){
//				self.onlineBtn.setText("在线("+on+")");
//				self.offlineBtn.setText("离线("+num+")");
//			});
		},
		
		_renderSelect:function(){
			$(function(){
					require(["cloud/lib/plugin/jquery.multiselect"],function(){
					$("#multiselect").multiselect({ 
						checkAllText:"全选",
						uncheckAllText:"取消全选",
						noneSelectedText:"请选择",
						selectedText:"# 项被选择",
						minWidth:160,
						height:60
					});
					$("#multiselectId").width("160");
					});
			});
		},
		_queryFun:function(){
			var self = this;
			var v;
			if(self.values[0] == "" && self.values[1] == ""){
				v = "-1";
			}else if(self.values[0] == "0" && self.values[1] == ""){
				v = "0";
			}else if(self.values[1] == "1" && self.values[0] == ""){
				v = "1";
			}
			if(self.values[0] != "" && self.values[1] != ""){
				v = undefined;
			}

            var name = $(".bar-search-input").val();
			self.fire("query",v,name);
				
		}
		
	});
	
	return NoticeBar;
	
});