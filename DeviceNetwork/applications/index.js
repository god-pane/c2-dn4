require(["./platform","cloud/base/cloud","cloud/components/permission"], function(Platform,cloud,Permission) {
	$(function() {
		window.permission = new Permission({
			events:{
				afterLoad:function(){
					cloud.platform = new Platform();
				}
			}
		})
//		$("#title").text(locale.get({lang:"inhand+-+device_cloud"}));
	});

	window.onbeforeunload = function() {
		Model.user({
			method:"logout"
		});
		//return "";
	};
});