define(function(require){
	require("cloud/base/cloud");
	var maintain=require("text!./maintain.html");
	var MaintainChannel=Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.render();
			locale.render({element:this.element});
		},
		render:function(){
			this.element.html(maintain);
			this._renderCss();
			var language=locale.localLang;
			if(language=="en"){
				this.element.find(".maintain-channel-download").removeClass("maintain-channel-download-cn").addClass("maintain-channel-download-en");
				this.element.find(".par-first").removeClass("p-font-size-cn p-line-height").addClass("p-line-height p-font-size-en maintain-channel-download-en");
				this.element.find(".par-second").removeClass("p-font-size-cn p-line-height").addClass("p-line-height p-font-size-en");
				this.element.find(".par-third").removeClass("p-font-size-cn p-line-height").addClass("p-font-size-en");
			}
			else{
				this.element.find(".maintain-channel-download").removeClass("maintain-channel-download-en").addClass("maintain-channel-download-cn");
				this.element.find(".maintain-channel-row p").removeClass("p-font-size-en").addClass("p-font-size-cn p-line-height");
			}
			$("#download-dt-client").attr("href",require.toUrl("../../../downloads/DeviceTouch.rar"));
		},
		_renderCss:function(){
			$(".maintain-channel-wrapper").css({
				"width":"700px",
				"height":"500px",
				"margin":"70px auto"
			});
			$(".maintain-channel-holder div").css({
				"background":"url(site/maintain/res/wear.png)",
				"margin-top":"35px",
				"-moz-border-radius":"10px",
				"-webkit-border-radius":"10px",
				"border-radius":"10px"
			});
			$(".maintain-channel-title").css({
				"color":"#8DB552",
				"font-size":"26px"
			});
			$(".maintain-channel-row").css({
				"position":"relative",
				"border":"1px solid #DDDDDE",
				"width":"700px",
				"height":"38px"
			});
			$(".maintain-channel-row p").css({
				"position":"absolute",
				"font-family":"arial",
				"color":"#6A6A6A",
				"left":"79px"
			});
			$(".p-line-height").css({
				"line-height":"38px"
			});
			$(".p-font-size-cn").css({
				"font-size":"15px"
			});
			$(".p-font-size-en").css({
				"font-size":"16px"
			});
			$(".maintain-channel-state").css({
				"display":"block",
				"position":"absolute",
				"left":"10px",
				"top":"-9px",
				"width":"51px",
				"height":"52px",
				"font-size":"26px",
				"font-weight":"bold",
				"color":"white",
				"text-align":"center",
				"line-height":"52px",
				"background":"url(site/maintain/res/circle.png)"
			});
			$(".maintain-channel-state label").css({
				"left":"5px",
				"top":"5px"
			});
			$(".maintain-channel-download").css({
				"position":"absolute",
				"border":"0px"
			});
			$(".maintain-channel-download-en").css({
				"left":"420px"
			});
			$(".maintain-channel-download-cn").css({
				"left":"295px"
			});
		}
	});
	return MaintainChannel;
})