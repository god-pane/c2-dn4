/**
 * @author PANJC
 * 
 */
define(function(require){
	var cloud = require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery-ui");
	require("cloud/resources/css/jquery-ui.css");
	require("../../resources/css/online-noticebar.css");
	var Button = require("cloud/components/button");
	var NoticeBar = Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.service = options.service;
			this.pars=null;
			this._render();
		},
		_render:function(){
			this._draw();
//			this._setCount();
//			this._selectedState();
			this._events();
			this._addButton();
		},

		_draw:function(){
			var self = this;
			var $html = $(
				"<div class='notice-bar'>"
				+"<div class='notice-bar-state'>"
				+"<p class='notice-bar-state-title'>"+locale.get({lang:"networking_state"})+"</p>"
				+"<div class='notice-bar-state-online'><p><input value='online' type='checkbox' id='noticebar-online-input' class='notice-bar-state-input'/></p><p class='notice-bar-state-text'>"+locale.get({lang:"online"})//+"</p><p class='notice-bar-state-count'>(<span id='noticebar-online-count'></span>)</p></div>"
                +"</div>"
                +"<div class='notice-bar-state-offline'><p><input value='offline' type='checkbox' id='noticebar-offline-input' class='notice-bar-state-input'/></p><p class='notice-bar-state-text'>"+locale.get({lang:"offline"})//+"</p><p class='notice-bar-state-count'>(<span id='noticebar-offline-count'></span>)</p></div>"
				+"</div>"
				+"<div class='notice-bar-calendar'>"
                +"<p class='notice-bar-search-text'>"+locale.get({lang:"gateway_name+:"})+"</p>"
                +"<input class='notice-bar-search-input' placeholder='"+locale.get('empty_is_all')+"'>"
				+"<div class='notice-bar-calendar-button' id='notice-bar-calendar-button-query'></div>"
				+"</div>"

				+"</div>"
                +"</div>"
			);
			this.element.append($html);

            $(".notice-bar-search-input").keypress(function(e){
                if(e.keyCode == 13){
                    self.submit();
                }
            })
		},

        submit:function(){
            var self = this;
            var status;
            var $onlineInput = $("#noticebar-online-input");
            var $offlineInput = $("#noticebar-offline-input");

            if($onlineInput.attr("checked") == "checked" && $offlineInput.attr("checked") == "checked"){
                status = undefined;
            }else if($onlineInput.attr("checked") == "checked"){
                status = "1";
            }else if($offlineInput.attr("checked") == "checked"){
                status = "0";
            }else{
                status = "-1";
            }

            var deviceName = $(".notice-bar-search-input").val();
            obj = {
                name:deviceName,
                online:status,
                start_time:0,
                pic_id:0,
                verbose:10,
                end_time:Math.round((new Date().getTime())/1000)
            };
            self.fire("query",obj);
        },

		_setCount:function(){
			this.service.getSiteList({limit:1},function(data){
				$("#noticebar-online-count").text(data.online);
				$("#noticebar-offline-count").text(data.total - data.online);
			});
//			this.service.getSiteList({online:1,pic_id:0,limit:0},function(data){
//				$("#noticebar-online-count").text(data.result.length);
//			});
//			this.service.getSiteList({online:0,pic_id:0,limit:0},function(data){
//				$("#noticebar-offline-count").text(data.result.length);
//			});
		},
		
		_events:function(){
			$("#noticebar-online-input").attr("checked","checked");
			$("#noticebar-offline-input").attr("checked","checked");
		},
		

		_addButton:function(){
            this.queryButton = new Button({
                container: this.element.find("#notice-bar-calendar-button-query"),
                id: "queryBtn",
                text: locale.get({lang:"query"}),
                events: {
                    click: this.submit,
                    scope: this
                }
            });
            /*this.exportButton = new Button({
                container: this.element.find("#notice-bar-calendar-button-export"),
                id: "exportBtn",
                text: locale.get({lang:"export"})
                imgCls: "cloud-icon-yes",
                events: {
                    click: this.submit,
                    scope: this
                }
            });*/
		}

	});
	
	return NoticeBar;
	
});