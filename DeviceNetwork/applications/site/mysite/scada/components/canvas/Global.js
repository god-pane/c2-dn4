define(function(require){
	var Configure=require("../../../agent/Configure");
	var Global =
	{
		images:
		[
			['tank', 89, 251],
			['tank-bar', 53, 188],
			['tank-bar-s', 46, 160],
			['solar', 98, 74],
			['valve-n', 26, 24],
			['valve-s', 26, 24],
			['valve-e', 24, 26],
			['valve-w', 24, 26],
			['valve-1w-v', 13, 31],
			['valve-1w-h', 31, 13],
			['valve-3w-e', 16, 27],
			['valve-3w-s', 27, 16],
			['valve-3w-w', 16, 27],
			['valve-3w-n', 27, 16],
			['pipe-b-h', 100, 6],
			['pipe-b-v', 6, 100],
			['pipe-y-h', 100, 6],
			['pipe-y-v', 6, 100],
//			['round-rect-label', 151, 23],
			['unit-normal', 44, 44],
			['unit-disconnect', 44, 44],
			['unit-yellow', 44, 44],
			['unit-red', 44, 44],
			['pump-es', 47, 34],
			['pump-ne', 34, 47],
			['pump-nw', 34, 47],
			['pump-ws', 47, 34],
			['user', 23, 18],
			['water-tap', 17, 15],
			['pipe-cb-ne', 29, 28],
			['pipe-cb-nw', 29, 28],
			['pipe-cb-se', 29, 28],
			['pipe-cb-sw', 28, 29],
			['pipe-cy-ne', 29, 29],
			['pipe-cy-nw', 29, 29],
			['pipe-cy-se', 29, 29],
			['pipe-cy-sw', 29, 29],
			['thermometer', 12, 4],
			['custom-none',100,100],
			['custom-delete',100,100],
			['textEdit',135,21]
//			['connector',15,15]
//			['smalltree',224,224]
//			['tree-twotrunks',224,224],
//			['thermometerred',86,313]
		],
		
		init: function()
		{   
			var id = 'nts-module-common-canvas-global-resources';
			var el = document.getElementById(id);
			
			var idd = 'canvas-glasspane';
			var ell = document.getElementById(idd);
			
			var ids='canvas-edit';
			var ells = document.getElementById(ids);
			
			var idOver='canvas-move';
			var ellsOver = document.getElementById(idOver);
			
//			var thermometer="thermometer";
//			var thermometerObj=document.getElementById(thermometer);
//			
//			var thermometer_value="thermometer_value";
//			var thermometer_valueObj=document.getElementById(thermometer_value);
//			if( el && ell && ells && ellsOver && thermometerObj && thermometer_valueObj)
//			{
//				return true;
//			}
			if( el && ell && ells && ellsOver)
			{
				return true;
			}
			var htmls = [];
			for( var i = 0; i < this.images.length; i ++ )
			{
				var image = this.images[i];
				htmls.push('<img id="canvas-image-'+image[0]+'" src="/DeviceNetwork/applications/site/mysite/scada/components/canvas/images/resource/'+image[0]+'.png" width="'+image[l]+'" height="'+image[2]+'" />');
			}
			
			var drawablePro =Configure.drawablePrototypes;
			for( var i=0;i<drawablePro.items.length;i++){
				var items = drawablePro.items[i].items;
				for(var j=0;j<items.length;j++){
					if(items[j].type && items[j].url){
						var images = items[j].images;
						for(var l=0;l<images.length;l++){
							htmls.push('<img id="canvas-image-'+images[l].el+'" src="/DeviceNetwork/applications/'+items[j].url+'images/'+images[l].el+'.png" width="'+images[l].width+'" height="'+images[l].height+'" />');
						}
					}
				}
			}
			
			el = document.createElement('div');
			el.id = id;
			el.style.display = 'none';
			el.innerHTML = htmls.join('\r\n');
			
//			cloud.images = {};
			
			cloud.Ajax.request({
				url:"api/scada_components",
				type : "GET",
				parameters:{
					limit:0
				},
				success:function(data){
					var result = data.result;
					for(var i=0;i<result.length;i++){
						var src = cloud.config.FILE_SERVER_URL + "/api/file/" + result[i].content._id + "?access_token=" + cloud.Ajax.getAccessToken();
						htmls.push('<img id="canvas-image-'+result[i].content._id+'" src="'+src+'" width="'+result[i].content.width+'" height="'+result[i].content.height+'" />');
					}
					el.innerHTML = htmls.join('\r\n');
				}
			});
			
			document.body.appendChild(el);
			
			ell = document.createElement("div");
			ell.id = idd;
			ell.style.display = 'none';
			document.body.appendChild(ell);
			
			ells= document.createElement("div");
			ells.id = ids;
			ells.style.display = 'none';
			ells.height='23';
			document.body.appendChild(ells);
			$("#canvas-edit").append("<div id='toolbar'></div>");
			
//			var scriptId = "uguide";
//			var script = document.getElementById(scriptId);
//			
//			if(!script){
//				script = document.createElement("script");
//				script.id = scriptId;
//				document.body.appendChild(script);
//			}
//			script.src = "components/jquery-uguide.min.js";
			
			ellsOver = document.createElement("div");
			ellsOver.id = idOver;
			ellsOver.style.display = 'none';
			document.body.appendChild(ellsOver);
			
//			thermometerObj = document.createElement("div");
//			thermometerObj.id = thermometer;
//			thermometerObj.style.display = 'none';
//			document.body.appendChild(thermometerObj);
//			
//			thermometer_valueObj = document.createElement("div");
//			thermometer_valueObj.id = thermometer_value;
//			thermometer_valueObj.style.display = 'none';
//			document.body.appendChild(thermometer_valueObj);
			
		}
	};
	return Global;
});
