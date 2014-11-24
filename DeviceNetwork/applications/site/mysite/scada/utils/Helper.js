define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/ext/ext-base");
	require("cloud/lib/plugin/ext/ext-all");
	
	Ext.ns('Nts.Utils');

	Nts.Utils.Helper = 
	{
		getDate: function()
		{
			var now = new Date();
		
			var year = now.getFullYear();
			var month = now.getMonth() + 1;
			var day = now.getDate();
		
			if( month < 10 ) month = "0" + month;
			if( day < 10 ) day = "0" + day;
		
			var hour = now.getHours();
			var min  = now.getMinutes();
			var sec  = now.getSeconds();
		
			if( hour < 10 ) hour = "0" + hour;
			if( min < 10 ) min = "0" + min;
			if( sec < 10 ) sec = "0" + sec;
		
			var msec = now.getMilliseconds();
			if( msec < 10 ) msec = "00" + msec;
			else if( msec < 100 ) msec = "0" + msec;
			 
			return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec + "." + now.getMilliseconds();
		},
		
		addDebugData: function( obj )
		{
			obj.__debugData__ = [];
			for( var i = 0; i < 500000; i ++ )
			{
				obj.__debugData__.push(i + '__debugEntry__');
			}
		},
		
		formatPassword: function( pwd )
		{
			// Use MD5 Encryption
			return Nts.Utils.Md5Crypto.hex('nts-' + pwd).toUpperCase();
		},
		
		getMd5Checksum: function( value, upperCase )
		{
			var checksum = Nts.Utils.Md5Crypto.hex(value);
			return upperCase ? checksum.toUpperCase() : checksum;
		},
		
		getMicroTimeRenderer: function( fmt )
		{
			return function( v )
			{
				return v > 0 ? (new Date(v / 1000)).format(fmt) : '-';
			}
		},
		
		getUUID : function()
		{
			var s = [], itoh = '0123456789ABCDEF';
	 
		    // Make array of random hex digits. The UUID only has 32 digits in it, but we
		    // allocate an extra items to make room for the '-'s we'll be inserting.
		    for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10);
		 
		    // Conform to RFC-4122, section 4.4
		    s[14] = 4;  // Set 4 high bits of time_high field to version
		    s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence
		 
		    // Convert to hex chars
		    for (var i = 0; i <36; i++) s[i] = itoh[s[i]];
		 
		    // Insert '-'s
		    s[8] = s[13] = s[18] = s[23] = '-';
		 
		    return s.join('');
		},
		
		safeDecodeJson: function( jsonValue, defaultValue )
		{
			if( typeof(jsonValue) != 'string' )
			{
				return jsonValue ? jsonValue : defaultValue;
			}
			
			var decodedValue = {};
			try
			{
				decodedValue = eval('(' + jsonValue + ')');
			}
			catch( e )
			{
				Utils.WebLog.error('Safe decode json({0}) failed, error: {1}', jsonValue, e.message ? e.message : e);
				return defaultValue;
			}
			
			return decodedValue;
		},
		
		styleEncodeJson: function( jsonValue )
		{
			if( JSON && JSON.stringify ) return JSON.stringify(jsonValue, null, '  ');
			else return Ext.encode(jsonValue);
		},
		
		asyncCall: function( proc, scope, param )
		{
			return setTimeout(function()
			{
				proc.call(scope, param);
				scope = null;
				proc = null;
			}, 100);
		},
		
		delayCall: function( proc, scope, delay )
		{
			if( !Ext.isFunction(proc) )
			{
				return;
			}
			
			var applyArguments = [];
			for( var i = 3; i < arguments.length; i ++ )
			{
				applyArguments.push(arguments[i]);
			}
			return setTimeout(function()
			{
				proc.apply(scope, applyArguments);
				scope = null;
				proc = null;
			}, delay);
		},
		
		compareValue: function( operator, value1, value2 )
		{
			if( value1 == null )
			{
				return true;
			}
			
			switch( operator )
			{
				case '>': return value1 > value2;
				case '>=': return value1 >= value2;
				case '<': return value1 < value2;
				case '<=': return value1 <= value2;
				case '!=': return value1 != value2;
				case '==': return value1 == value2;
				default: return value1 == value2;
			}
		},
		
		downloadUrl: function( url, params )
		{
			Ext.MessageBox.show(
			{
			   title: Lang.Common.msgTitle,
			   iconCls: 'icon-download',
			   msg: Lang.Common.loadingText,
			   progress: true,
			   progressText: Lang.Common.loadingText,
			   width: 300,
			   wait: true,
			   waitConfig: {interval: 500}
			});
			
			Utils.delayCall(Ext.MessageBox.hide, Ext.MessageBox, 1500);
			
			if( Ext.isIE )
			{
				var downloadElId = 'nts-global-download-iframe-item';
				var downloadEl = Ext.get(downloadElId);
				if( !downloadEl )
				{
					var newFrameEl = document.createElement('iframe');
					newFrameEl.style.display = 'none';
					newFrameEl.id = downloadElId;
					newFrameEl.name = downloadElId;
					document.body.appendChild(newFrameEl);
					downloadEl = Ext.get(downloadElId);
				}
				
				var downloadFormElId = 'nts-global-download-form-item';
				var downloadFormEl = Ext.get(downloadFormElId);
				if( !downloadFormEl )
				{
					var newFormEl = document.createElement('form');
					newFormEl.style.display = 'none';
					newFormEl.id = downloadFormElId;
					newFormEl.name = downloadFormElId;
					newFormEl.method = 'POST';
					newFormEl.target = Ext.isIE6 ? '_blank' : downloadElId;
					
					document.body.appendChild(newFormEl);
					downloadFormEl = Ext.get(downloadFormElId);
				}
				
				while( downloadFormEl.dom.childNodes.length > 0 )
				{
					downloadFormEl.dom.removeChild(downloadFormEl.dom.childNodes[0]);
				}
				
				for( var name in params )
				{
					var oInput = document.createElement('input');
					oInput.name  = name;
					oInput.value = params[name].toString();
					downloadFormEl.dom.appendChild(oInput);
				}
				
				downloadFormEl.dom.action = url;
				downloadFormEl.dom.submit();
			}
			else
			{
				var downloadElId = 'nts-global-download-iframe-item';
				var downloadEl = Ext.get(downloadElId);
				if( !downloadEl )
				{
					var newFrameEl = document.createElement('iframe');
					newFrameEl.style.display = 'none';
					newFrameEl.id = downloadElId;
					newFrameEl.name = downloadElId;
					document.body.appendChild(newFrameEl);
					downloadEl = Ext.get(downloadElId);
				}
				
				downloadEl.dom.src =  Ext.urlEncode(params, url + '?');
			}
		},
		
		saveCanvasImageAs: function( canvas, imageName )
		{
			Ext.MessageBox.show(
			{
			   title: Lang.Common.msgTitle,
			   iconCls: 'icon-download',
			   msg: Lang.Common.loadingText,
			   progress: true,
			   progressText: Lang.Common.loadingText,
			   width: 300,
			   wait: true,
			   waitConfig: {interval: 500}
			});
			
			Utils.delayCall(Ext.MessageBox.hide, Ext.MessageBox, 2000);
			
			var downloadElId = 'nts-global-save-image-as-iframe-item';
			var downloadEl = Ext.get(downloadElId);
			if( !downloadEl )
			{
				var newFrameEl = document.createElement('iframe');
				newFrameEl.style.display = 'none';
				newFrameEl.id = downloadElId;
				newFrameEl.name = downloadElId;
				document.body.appendChild(newFrameEl);
				downloadEl = Ext.get(downloadElId);
			}
			
			var saveImageElId = 'nts-global-save-image-as-form-item';
			var saveImageEl = Ext.get(saveImageElId);
			if( !saveImageEl )
			{
				var newFormEl = document.createElement('form');
				newFormEl.style.display = 'none';
				newFormEl.id = saveImageElId;
				newFormEl.name = saveImageElId;
				newFormEl.method = 'POST';
				newFormEl.target = downloadElId;

				var dataInput = document.createElement("textarea");
				dataInput.name = 'data';
				newFormEl.appendChild(dataInput);

				document.body.appendChild(newFormEl);
				saveImageEl = Ext.get(saveImageElId);
			}
			
			saveImageEl.dom.action = Ext.urlEncode({filename: imageName}, '/saveCanvasImageAs?');
			saveImageEl.dom.childNodes[0].value = canvas.toDataURL('image/png');    
			saveImageEl.dom.submit();
		},
		
		saveDataAs: function( data, fileName, url, extraParams )
		{
			Ext.MessageBox.show(
			{
			   title: Lang.Common.msgTitle,
			   iconCls: 'icon-download',
			   msg: Lang.Common.loadingText,
			   progress: true,
			   progressText: Lang.Common.loadingText,
			   width: 300,
			   wait: true,
			   waitConfig: {interval: 500}
			});
			
			Utils.delayCall(Ext.MessageBox.hide, Ext.MessageBox, 2000);
			
			var downloadElId = 'nts-global-save-data-as-iframe-item';
			var downloadEl = Ext.get(downloadElId);
			if( !downloadEl )
			{
				var newFrameEl = document.createElement('iframe');
				newFrameEl.style.display = 'none';
				newFrameEl.id = downloadElId;
				newFrameEl.name = downloadElId;
				document.body.appendChild(newFrameEl);
				downloadEl = Ext.get(downloadElId);
			}
			
			var saveDataElId = 'nts-global-save-data-as-form-item';
			var saveDataEl = Ext.get(saveDataElId);
			if( !saveDataEl )
			{
				var newFormEl = document.createElement('form');
				newFormEl.style.display = 'none';
				newFormEl.id = saveDataElId;
				newFormEl.name = saveDataElId;
				newFormEl.method = 'POST';
				newFormEl.target = downloadElId;

				var dataInput = document.createElement("textarea");
				dataInput.name = 'data';
				newFormEl.appendChild(dataInput);

				document.body.appendChild(newFormEl);
				saveDataEl = Ext.get(saveDataElId);
			}
			
			var getParams = Ext.apply({filename: fileName}, extraParams ? extraParams : {});		
			saveDataEl.dom.action = Ext.urlEncode(getParams, url + '?');
			saveDataEl.dom.childNodes[0].value = Ext.isString(data) ? data : Ext.encode(data);
			saveDataEl.dom.submit();
		},

		ipv4ToLong: function( ip )
		{
			var ips = ip.split('.');
			if( ips.length != 4 ) return 0;
			
			for( var i = 0; i < ips.length; i ++ )
			{
				ips[i] = parseInt(ips[i].trim());
			}
			
			return (ips[3] * 0x1000000) + (ips[2] * 0x10000) + (ips[1] * 0x100) + parseInt(ips[0]);
		},
		
		ipv4ToHostLong: function( ip )
		{
			var ips = ip.split('.');
			if( ips.length != 4 ) return 0;
			
			for( var i = 0; i < ips.length; i ++ )
			{
				ips[i] = parseInt(ips[i].trim());
			}
			
			return (ips[0] * 0x1000000) + (ips[1] * 0x10000) + (ips[2] * 0x100) + parseInt(ips[3]);
		},
		
		longToIpv4: function( ip )
		{
			if( typeof(ip) != 'number' )
			{
				return '';
			}
			
			return String.format('{0}.{1}.{2}.{3}', ip % 0x100, parseInt(ip / 0x100) % 0x100, parseInt(ip / 0x10000) % 0x100, parseInt(ip / 0x1000000));
		},
		
		hostLongToIpv4: function( ip )
		{
			if( typeof(ip) != 'number' )
			{
				return '';
			}
			
			return String.format('{0}.{1}.{2}.{3}', parseInt(ip / 0x1000000), parseInt(ip / 0x10000) % 0x100, parseInt(ip / 0x100) % 0x100, ip % 0x100);
		},
		
		doErrorResponse: function( opr, res, disableAlert )
		{
			Utils.WebLog.error('Failed to ' + opr + '({0}, {1})', res.errorCode, Lang.Error[res.errorCode]);
			if( !disableAlert )
			{
				Ext.MessageBox.alert(Lang.Common.msgErrorTitle, String.format(Lang.Utils.failedMsg, opr, res.ec, Lang.Error[res.ec]));
			}
		},

		normalizeFileName: function( name )
		{
			return name.replace(/ /g, '').replace(/[\: &\|\*\?><;]/g, '_');
		},
		
		parseCsvLine: function( line )
		{
			var values = [];
			var inQuote = false;
			var offsetPos = 0;
			var sepCharCode = ','.charAt(0);
			var quoteCharCode = '"'.charAt(0);
			
			for( var j = 0; j < line.length; j ++ )
			{
				var ch = line.charAt(j);
				if( ch == sepCharCode )
				{
					if( !inQuote )
					{
						// trim ""
						var subItem = line.substr(offsetPos, j - offsetPos).trim().replace(/(^\x22*)|(\x22*$)/g,"");
						offsetPos = j + 1;
						values.push(subItem);
					}
				}
				else if( ch == quoteCharCode )
				{
					inQuote = !inQuote;
				}
			}
			values.push(offsetPos >= line.length ? '' : line.substr(offsetPos, line.length - offsetPos).trim().replace(/(^\x22*)|(\x22*$)/g,""));
			return values;
		},
		
		restrictWindowRegion: function( parentEl, win, x, y )
		{
			if( (x + win.getWidth()) <= 0 || y < 0 )
			{
				win.setPosition(Math.max(x, 0), Math.max(y, 0));
			}
			
			var maxWidth  = parentEl.getWidth() - 10;
			var maxHeight = parentEl.getHeight() - 10;
			if( x >= maxWidth || y >= maxHeight )
			{
				win.setPosition(Math.min(x, maxWidth), Math.min(y, maxHeight));
			}
		},
		
		randomCenterWindow: function( win, maxX, maxY )
		{
			var vs   = win.container.getViewSize(false);
			var left = (vs.width - win.getWidth()) / 2 + ((Math.random() - 0.5) * maxX * 2);
			var top  = (vs.height - win.getHeight()) / 2 + ((Math.random() - 0.5) * maxY * 2);
			
			win.setPosition(left, top);
		},
		
		copyToClipboard: function( strData )
		{
			if( window.clipboardData && window.clipboardData.setData )
			{
				try
				{
					window.clipboardData.setData("Text", strData);
				}
				catch( e )
				{
					Ext.Msg.alert(Lang.Common.msgTitle, Lang.Common.copyToClipboardFailedText + ', ' + (e.message ? e.message : e));
					return false;
				}
				
				Ext.Msg.alert(Lang.Common.msgTitle, Lang.Common.copyToClipboardOkText);
				return true;
			}
			else
			{
				var textWin = new Ext.Window(
				{
					title: 'Clipboard',
					maximizable: true,
					width: 500,
					height: 400,
					layout: 'fit',
					items:
					{
						xtype: 'textarea',
						value: strData
					}
				});
				textWin.show();
			}
		},

		BYTE_UINTS_PER_KILO: 1024,
		BYTE_UINTS_PER_MEGA: 1024 * 1024,
		BYTE_UINTS_PER_GIGA: 1024 * 1024 * 1024,
		BYTE_UINTS_PER_TERA: 1024 * 1024 * 1024 * 1024,
		
		getFileSizeString: function(size)
		{
			if( size < Utils.BYTE_UINTS_PER_KILO )
			{
				return size + " Bytes";
			}
			else if( size < Utils.BYTE_UINTS_PER_MEGA )
			{
				return (Math.round(size * 10 / Utils.BYTE_UINTS_PER_KILO) / 10) + " KB";
			}
			else if( size < Utils.BYTE_UINTS_PER_GIGA )
			{
				return (Math.round(size * 10 / Utils.BYTE_UINTS_PER_MEGA) / 10) + " MB";
			}
			else if( size < Utils.BYTE_UINTS_PER_TERA )
			{
				return (Math.round(size * 10 / Utils.BYTE_UINTS_PER_GIGA) / 10) + " GB";
			}
			else
			{
				return (Math.round(size * 10 / Utils.BYTE_UINTS_PER_TERA) /10) + " TB";
			}
		},
		
		getSpeedString: function( speed, unitBits, shortName, precision )
		{
			if( !precision )
			{
				precision = 100;
			}
			
			if( !unitBits )
			{
				if( speed < Utils.BYTE_UINTS_PER_KILO )
				{
					return Math.round(speed) + (shortName ? " B" : " B/s");
				}
				else if( speed < Utils.BYTE_UINTS_PER_MEGA )
				{
					return (Math.round(speed * precision / Utils.BYTE_UINTS_PER_KILO) / precision) + (shortName ? " K" : " KB/s");
				}
				else if( speed < Utils.BYTE_UINTS_PER_GIGA )
				{
					return (Math.round(speed * precision / Utils.BYTE_UINTS_PER_MEGA) / precision) + (shortName ? " M" : " MB/s");
				}
				else
				{
					return (Math.round(speed * precision / Utils.BYTE_UINTS_PER_GIGA) / precision) + (shortName ? " G" : " GB/s");
				}
			}
			else
			{
				if( speed < 1000 )
				{
					return Math.round(speed) + (shortName ? " b" : " bps");
				}
				else if( speed < 1000 * 1000 )
				{
					return (Math.round(speed * precision / 1000) / precision) + (shortName ? " K" : " Kbps");
				}
				else if( speed < 1000 * 1000 * 1000 )
				{
					return (Math.round(speed * precision / (1000 * 1000)) / precision) + (shortName ? " M" : " Mbps");
				}
				else
				{
					return (Math.round(speed * precision / (1000 * 1000 * 1000)) / precision) + (shortName ? " G" : " Gbps");
				}
			}
		},
		
		getBitSpeed: function( speed, type, shortName, precision )
		{
			if( !precision )
			{
				precision = 100;
			}
			
			if( typeof(type) == 'undefined' )
			{
				type = 2;
			}
			
			switch( type )
			{
			case 0: return Math.round(speed) + (shortName ? " b" : " bps");
			case 1: return (Math.round(speed * precision / 1000) / precision) + (shortName ? " K" : " Kbps");
			case 2: return (Math.round(speed * precision / (1000 * 1000)) / precision) + (shortName ? " M" : " Mbps");
			default: return (Math.round(speed * precision / (1000 * 1000 * 1000)) / precision) + (shortName ? " G" : " Gbps");
			}
		},
		
		MILLI_UNITS_PER_SEC: 1000,
		MICRO_UNITS_PER_MILLI: 1000,
		MICRO_UNITS_PER_SEC: 1000 * 1000,
		SECOND_UNITS_PER_MINUTE: 60,
		MINUTE_UNITS_PER_HOUR: 60,
		HOUR_UNITS_PER_DAY: 24,
		SECOND_UNITS_PER_HOUR: 3600,
		SECOND_UNITS_PER_DAY: 86400,
		
		getTimeLengthString: function( secs )
		{
			if( secs < 60 )
			{
				return String.format('{0}{1}', secs, Lang.Common.timeLength.second);
			}
			else if( secs < 3600 )
			{
				return String.format('{0}{1} {2}{3}', 
					parseInt(secs / 60), Lang.Common.timeLength.minute, 
					parseInt(secs % 60), Lang.Common.timeLength.second);
			}
			else if( secs < 86400 )
			{
				return String.format('{0}{1} {2}{3}', 
					parseInt(secs / 3600), Lang.Common.timeLength.hour, 
					parseInt(secs % 3600 / 60), Lang.Common.timeLength.minute);
			}
			else
			{
				return String.format('{0}{1} {2}{3}', 
					parseInt(secs / 86400), Lang.Common.timeLength.day, 
					parseInt(secs % 86400 / 3600), Lang.Common.timeLength.hour);
			}
		},
		
		getRandomColor: function( maxRed, maxGreen, maxBlue )
		{
			var colorRed   = Math.round(Math.min(255, Math.random() * maxRed)).toString(16);
			var colorGreen = Math.round(Math.min(255, Math.random() * maxGreen)).toString(16);
			var colorBlue  = Math.round(Math.min(255, Math.random() * maxBlue)).toString(16);
			
			return String.format('#{0}{1}{2}', (colorRed.length > 1 ? '' : '0') + colorRed,
				(colorGreen.length > 1 ? '' : '0') + colorGreen,
				(colorBlue.length > 1 ? '' : '0') + colorBlue);
		},
		
		formatHtmlTitle: function( value )
		{
			if( typeof(value) != 'string' )
			{
				value = value ? value.toString() : '';
			}
			
			return value ? value.replace(/\"/g, '') : '';
		},
		
		htmlTitleRenderer: function( value, metaData )
		{
			if( value == null || value == undefined )
			{
				return '';
			}
			
			metaData.attr = metaData.tdAttr = String.format('title="{0}"', Utils.formatHtmlTitle(value));
			return value.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
		},
		
		formatIndexValue: function( value, indexHandler, noConvert )
		{
			if( indexHandler.valueConvertor && !noConvert )
			{
				value = indexHandler.valueConvertor(value);
			}
			
			return Math.floor(value / indexHandler.units * indexHandler.precision) / indexHandler.precision;
		},
		
		indexGridRenderer: function( value, metaData, indexName, indexNameHandler, testInfo )
		{
			if( !indexNameHandler )
			{
				return value;
			}
			else if( indexNameHandler.linkable )
			{
				if( value )
				{
					metaData.attr = metaData.tdAttr = 'style="cursor:pointer"';
					return String.format('<a href="#" style="text-decoration:underline" onclick="return false;">{0}</a>', value);
				}
				else
				{
					return value;
				}
			}
			
			var strText = '';
			var textRenderered = true;
			var testType = testInfo ? testInfo.testType : 0;
			switch( indexNameHandler.dataType )
			{
			case 'string':
				strText = (value != undefined && value != null) ? value : indexNameHandler.defaultValue;
				break;
			case 'int':
				strText = (value != undefined && value != null) ? value.toString() : indexNameHandler.defaultValue;
				break;
			case 'bool':
				strText = (value != undefined && value != null) ? Lang.Common.yesText : Lang.Common.noText;
				break;
			case 'enum':
				strText = (indexNameHandler.store && indexNameHandler.store[value]) ? indexNameHandler.store[value] : value;
				break;
			case 'enum2':
				strText = (indexNameHandler.store && indexNameHandler.store[testType] && indexNameHandler.store[testType][value]) ? indexNameHandler.store[testType][value] : value;
				break;
			case 'ipv4':
				strText = Utils.longToIpv4((value != undefined && value != null) ? value : indexNameHandler.defaultValue);
				break;
			default :
				// float for index values
				textRenderered = false;
				break;
			}
			
			if( textRenderered )
			{
				if( indexNameHandler.renderer )
				{
					return indexNameHandler.renderer(value, testInfo, metaData);
				}
				
				if( strText == undefined || strText == null )
				{
					strText = '';
				}
				metaData.attr = metaData.tdAttr = metaData.tdAttr = String.format('title="{0}"', strText.toString().replace(/\"/g, ''));
				return strText;
			}
			else if( typeof(value) == 'undefined'|| value == null || value < 0 )
			{
				value = '-'; //indexNameHandler.defaultValue ? indexNameHandler.defaultValue : -1;
				metaData.attr = metaData.tdAttr = String.format('title="{0}"', value.toString().replace(/\"/g, ''));
				metaData.attr += ' style="background-color:#eeee00"';
				return value;
			}
			
			metaData.attr = '';
			
			var thresholds = testInfo ? testInfo.thresholds : {};
			if( thresholds && typeof(thresholds[indexName]) != 'undefined' )
			{
				var thresholdValue = thresholds[indexName];
				if( Utils.compareValue(indexNameHandler.operator, value, thresholdValue) )
				{
					metaData.attr += ' style="background-color:#eeee00"';
				}
			}
			
			var strValue = indexNameHandler.renderer ? indexNameHandler.renderer(value, testInfo, metaData) :
				String.format('{0}{1}', Utils.formatIndexValue(value, indexNameHandler), indexNameHandler.unitsName);
			
			metaData.attr += String.format(' title="{0}"', strValue.replace(/\"/g, ''));
			metaData.tdAttr = metaData.attr;
			
			return strValue;
		},
		
		initTreeNodeList: function( treePanel, groupConfig, allNodesInfo, excludeTypes, configCallback, nodeCallback, scope )
		{
			var typeRootNodes = {};
			
			for( var type in Nts.Config.Details.graphNode )
			{
				var graphNodeType = Nts.Config.Details.graphNode[type];
				if( graphNodeType.disabled || !graphNodeType.isCopied ||
				   type == Nts.Config.Type.graphNode.CLOUD )
				{
					continue;
				}
				
				if( excludeTypes )
				{
					var isExclude = false;
					for( var i = 0; i < excludeTypes.length; i ++ )
					{
						var excludeType = excludeTypes[i]; 
						if( excludeType == type )
						{
							isExclude = true;
							break;
						}
					}
					
					if( isExclude )
					{
						continue;
					}
				}
				
				var newGroupConfig = Ext.apply(
				{
					iconCls: String.format('icon-node-image-{0}', type),
					text: graphNodeType.name,
					checked: false,
					expanded: false,
					graphNodeInfo: {id: 0, name: graphNodeType.name, nodeType: type, lineType: 0}
				}, groupConfig ? groupConfig : {});
				
				var newNode = treePanel.root.appendChild(new Ext.tree.TreeNode(newGroupConfig));
				typeRootNodes[type] = 
				{
					nodeType: type,
					rootNode: newNode,
					groupCount: 0,
					groupMarks: {},
					groupNodes: {}
				};
			}
						
			// stat group for each type
			for( var i = 0; i < allNodesInfo.length; i ++ )
			{
				var nodeInfo = allNodesInfo[i];
				var parentNode = typeRootNodes[nodeInfo.type];
				if( !parentNode )
				{
					continue;
				}
				
				// test if needed
				var extraConfig = configCallback.call(scope, nodeInfo, i);
				if( !extraConfig )
				{
					continue;
				}
				
				var groupName = (nodeInfo.testAttributes && nodeInfo.testAttributes.group) ? nodeInfo.testAttributes.group : '';
				if( !parentNode.groupMarks[groupName] )
				{
					parentNode.groupMarks[groupName] = true;
					parentNode.groupCount ++;
				}
			}
			
			// create group node for each type
			for( var type in typeRootNodes )
			{
				var typeNode = typeRootNodes[type];
				if( typeNode.groupCount == 1 && typeNode.groupMarks[''] )
				{
					// empty groups
					typeNode.groupCount = 0;
					typeNode.groupMarks = {};
					continue;
				}
				
				for( var groupName in typeNode.groupMarks )
				{
					var groupDisplayName = groupName ? groupName : Lang.Common.noneGroupText;
					var newGroupConfig = Ext.apply(
					{
						iconCls: 'icon-node-group',
						text: groupDisplayName,
						expanded: true,
						checked: false,
						graphNodeInfo: {id: 0, name: groupDisplayName, nodeType: type, linkAttributes: {}}
					}, groupConfig ? groupConfig : {});
					
					var newNode = typeNode.rootNode.appendChild(new Ext.tree.TreeNode(newGroupConfig));
					typeNode.groupNodes[groupName] = newNode;
				}
			}
			
			for( var i = 0; i < allNodesInfo.length; i ++ )
			{
				var nodeInfo = allNodesInfo[i];
				var groupName = (nodeInfo.testAttributes && nodeInfo.testAttributes.group) ? nodeInfo.testAttributes.group : '';
				
				var newNodeConfig =
				{
					iconCls: String.format('icon-node-image-{0}', nodeInfo.type),
					text: nodeInfo.name,
					leaf: true,
					cls: 'text-text-normal'
				};
				
				if( configCallback )
				{
					var extraConfig = configCallback.call(scope, nodeInfo, i);
					if( !extraConfig )
					{
						continue;
					}
					
					Ext.apply(newNodeConfig, extraConfig);
				}
				
				var parentTree = typeRootNodes[nodeInfo.type];
				if( !parentTree )
				{
					continue;
				}
				
				var parentNode = parentTree.rootNode;
				if( parentTree.groupNodes[groupName] )
				{
					parentNode = parentTree.groupNodes[groupName];
				}

				var newNode = parentNode.appendChild(new Ext.tree.TreeNode(newNodeConfig));
				if( nodeCallback )
				{
					nodeCallback.call(scope, newNode, nodeInfo, i);
				}
			}
				
			// remove empty nodes and mark checked
			for( var i = treePanel.root.childNodes.length - 1; i >= 0; i -- )
			{
				var treeNode = treePanel.root.childNodes[i];
				if( treeNode.childNodes.length == 0 )
				{
					treePanel.root.removeChild(treeNode);
					treeNode = null;
				}
				else
				{
					Utils.initChildNodesChecked(treeNode, true, {node: 0, checked: 0});
				}
			}
		},
		
		initTreeAreaList: function( treePanel, groupConfig, allAreasInfo, excludeTypes, configCallback, nodeCallback, scope )
		{
			var typeRootNodes = {};
			var areaRootConfig = Ext.apply(
			{
				iconCls: 'icon-node-image-1',
				text: Lang.Common.allAreaName,
				checked: false,
				expanded: true,
				graphNodeInfo: {id: 0, name: '', nodeType: 0, lineType: 0}
			}, groupConfig ? groupConfig : {});
			
			var areaRootNode = treePanel.root.appendChild(new Ext.tree.TreeNode(areaRootConfig));
			for( var i = 0; allAreasInfo && i < allAreasInfo.length; i ++ )
			{
				var areaInfo = allAreasInfo[i];
				var newAreaConfig =
				{
					iconCls: String.format('icon-node-image-{0}', areaInfo.type),
					text: areaInfo.name,
					leaf: true,
					cls: 'text-text-normal'
				};
				
				if( configCallback )
				{
					var extraConfig = configCallback.call(scope, areaInfo, i);
					if( !extraConfig )
					{
						continue;
					}
					
					Ext.apply(newAreaConfig, extraConfig);
				}

				var newNode = areaRootNode.appendChild(new Ext.tree.TreeNode(newAreaConfig));
				if( nodeCallback )
				{
					nodeCallback.call(scope, newNode, areaInfo, i);
				}
			}
				
			// remove empty nodes and mark checked
			for( var i = treePanel.root.childNodes.length - 1; i >= 0; i -- )
			{
				var treeNode = treePanel.root.childNodes[i];
				if( treeNode.childNodes.length == 0 )
				{
					treePanel.root.removeChild(treeNode);
					treeNode = null;
				}
				else
				{
					Utils.initChildNodesChecked(treeNode, true, {node: 0, checked: 0});
				}
			}
		},
		
		initTreeLocationList: function( treePanel, groupConfig, allAreasInfo, excludeTypes, configCallback, nodeCallback, scope )
		{
			var typeRootNodes = {};
			var areaRootConfig = Ext.apply(
			{
				iconCls: 'icon-node-image-1',
				text: Lang.Common.allAreaName,
				checked: false,
				expanded: true,
				graphNodeInfo: {id: 0, name: Lang.Common.allAreaName, nodeType: 0, lineType: 0}
			}, groupConfig ? groupConfig : {});
			
			var areaRootNode = treePanel.root.appendChild(new Ext.tree.TreeNode(areaRootConfig));
		
			for( var i = 0; allAreasInfo && i < allAreasInfo.length; i ++ )
			{
				var areaInfo = allAreasInfo[i];
				
				if(areaInfo.parentId == 0)
				{
					var newAreaConfig =
					{
						iconCls: String.format('icon-node-image-{0}',1),
						text: areaInfo.name,
						leaf: false,
						cls:  "folder"
					};
				
					if( configCallback )
					{
						var extraConfig = configCallback.call(scope, areaInfo, i);
						if( !extraConfig )
						{
							continue;
						}
						
						Ext.apply(newAreaConfig, extraConfig);
					}

					var newNode = areaRootNode.appendChild(new Ext.tree.TreeNode(newAreaConfig));
					Utils.appendLocationChild(newNode,allAreasInfo,areaInfo.id,configCallback,scope,nodeCallback);
					
					if( nodeCallback )
					{
						nodeCallback.call(scope, newNode, areaInfo, i);
					}
				}	
			}
			// remove empty nodes and mark checked
			for( var i = treePanel.root.childNodes.length - 1; i >= 0; i -- )
			{
				var treeNode = treePanel.root.childNodes[i];
				if( treeNode.childNodes.length == 0 )
				{
					treePanel.root.removeChild(treeNode);
					treeNode = null;
				}
				else
				{
					Utils.initChildNodesChecked(treeNode, true, {node: 0, checked: 0});
				}
			}
		},
		
		appendLocationChild: function(newNode ,allAreasInfo, id,configCallback,scope,nodeCallback)
		{
			var m = 0;
			for( var n = 0; allAreasInfo && n < allAreasInfo.length; n ++ )
			{
				var areaInfo = allAreasInfo[n];
				if(id == areaInfo.parentId)
				{
					if(m == 0)
					{
						var newAreaConfig1 =
						{
							iconCls: String.format('icon-node-image-{0}', 1),
							text: Lang.Common.selectAll,
							leaf: true,
							cls: 'text-text-normal'
						};
						if( configCallback )
						{
							var extraConfig1 = 
							{
								checked: false,
								cls: 'text-text-normal',
								graphNodeInfo: {id: 0, name: Lang.Common.selectAll, parentId: 0, type: 0}
							};
							Ext.apply(newAreaConfig1, extraConfig1);
						}
						newNode.appendChild(new Ext.tree.TreeNode(newAreaConfig1));
					}
					
					var isLeaf = true;
					var clsValue = "text-text-normal";
					var clsType = String.format('icon-node-image-{0}', areaInfo.type);
					for( var j = 0; allAreasInfo && j < allAreasInfo.length; j ++ )
					{
						var areaInfo1 = allAreasInfo[j];
						if(areaInfo1.parentId == areaInfo.id)
						{
							isLeaf = false;
							clsValue = "folder";
							clsType = String.format('icon-node-image-{0}', 6);
							break;
						}
					}
					var newAreaConfig =
					{
						iconCls:clsType,// String.format('icon-node-image-{0}', areaInfo.type),
						text: areaInfo.name,
						leaf: isLeaf,
						cls: clsValue
					};
					
					if( configCallback )
					{
						var extraConfig = configCallback.call(scope, areaInfo, n);
						if( !extraConfig )
						{
							continue;
						}
						Ext.apply(newAreaConfig, extraConfig);
					}
					
					var newNode2 = newNode.appendChild(new Ext.tree.TreeNode(newAreaConfig));
					Utils.appendLocationChild(newNode2 ,allAreasInfo, areaInfo.id,configCallback,scope);
					
					if( nodeCallback )
					{
						nodeCallback.call(scope, newNode2, areaInfo, n);
					}
				 	m ++;
				}
			}
		},
		
		toggleLocationTreeNodeChecked: function( node, checked, noRecursion )
		{
			node.getUI().removeClass(checked ? 'text-text-normal' : 'text-text-bold');
			node.getUI().addClass(checked ? 'text-text-bold' : 'text-text-normal');

			if( node.attributes.graphNodeInfo.id == 0 )
			{
				node.attributes.checked = checked;
				node = node.parentNode;
			}
			else
			{
				return;
			}
			
			if( !node.childNodes || node.childNodes.length == 0 || node.attributes.toggleCheckDisabled )
			{
				return;
			}
			if( !node.isExpanded() )
			{
				node.expand(true, false);
			}
			
			for( var n = 0 ; n < node.childNodes.length; n ++ )
			{
				var childNode = node.childNodes[n];
				if( childNode.disabled )
				{
					continue;
				}
				
				if(childNode.attributes.graphNodeInfo.id != 0)
				{
					childNode.attributes.checked = checked;
					childNode.getUI().toggleCheck(checked);
					if( !noRecursion && node.childNodes && node.childNodes.length > 0 )
					{
						Utils.toggleLocationTreeNodeChecked(childNode, checked, noRecursion);
					}
				}
			}
		},
		
		toggleTreeNodeChecked: function( node, checked, noRecursion )
		{
			node.getUI().removeClass(checked ? 'text-text-normal' : 'text-text-bold');
			node.getUI().addClass(checked ? 'text-text-bold' : 'text-text-normal');
			
			if( !node.childNodes || node.childNodes.length == 0 || node.attributes.toggleCheckDisabled )
			{
				return;
			}
			
			if( !node.isExpanded() )
			{
				node.expand(true, false);
			}
			
			for( var n = 0 ; n < node.childNodes.length; n ++ )
			{
				var childNode = node.childNodes[n];
				if( childNode.disabled )
				{
					continue;
				}
				
				childNode.attributes.checked = checked;
				childNode.getUI().toggleCheck(checked);
				
				if( !noRecursion && node.childNodes && node.childNodes.length > 0 )
				{
					Utils.toggleTreeNodeChecked(childNode, checked, noRecursion);
				}
			}
		},
		
		initChildNodesChecked: function( node, statCount, statInfo )
		{
			if( !node.childNodes || node.childNodes.length == 0 )
			{
				return node.attributes.checked;
			}
			
			var bHaveChildSelected = false;
			for( var i = 0; i < node.childNodes.length; i ++ )
			{
				var childNode = node.childNodes[i];
							
				if( childNode.childNodes && childNode.childNodes.length > 0 )
				{
					var subStatInfo = {node: 0, checked: 0};
					if( Utils.initChildNodesChecked(childNode, statCount, subStatInfo) )
					{
						bHaveChildSelected = true;
					}
					
					statInfo.node += subStatInfo.node;
					statInfo.checked += subStatInfo.checked;
				}
				else
				{
					statInfo.node ++;
				}
				
				if( childNode.attributes.checked )
				{
					if( !(childNode.childNodes && childNode.childNodes.length > 0) )
					{
						statInfo.checked ++;
					}
					
					bHaveChildSelected = true;
				}
			}
			
			// maybe not rendered
			node.attributes.toggleCheckDisabled = true;
			node.attributes.checked = bHaveChildSelected;
			node.getUI().toggleCheck(bHaveChildSelected);
			node.attributes.toggleCheckDisabled = false;
			
			if( statCount )
			{
				node.setText(String.format('{0} ({1})', node.attributes.text, statInfo.node));
			}
			
			if( node.childNodes.length > 0 )
			{
				if( node.getUI() && node.getUI().getContainer() )
				{
					if( bHaveChildSelected )
						node.expand(false, false);
					else
						node.collapse(false, false);
				}
				else
				{
					// not rendered
					node.expanded = bHaveChildSelected;
				}
			}
			
			return bHaveChildSelected;
		},
		
		getTreeNodeCheckHandler: function( rootNode, type )
		{
			switch( type )
			{
			case 'select':
				return function()
				{
					var typeNodes = rootNode.childNodes;
					for( var i = 0; i < typeNodes.length; i ++ )
					{
						var typeNode = typeNodes[i];
						typeNode.getUI().toggleCheck(true);
					}
				};
			case 'unselect':
				return function()
				{
					var typeNodes = rootNode.childNodes;
					for( var i = 0; i < typeNodes.length; i ++ )
					{
						var typeNode = typeNodes[i];
						typeNode.getUI().toggleCheck(false);
					}
				};
			case 'reverse':
				return function()
				{
					var typeNodes = rootNode.childNodes;
					for( var i = 0; i < typeNodes.length; i ++ )
					{
						var typeNode = typeNodes[i];
						typeNode.getUI().toggleCheck(!typeNode.getUI().isChecked());
					}
				};
			default:
				return null;
			}
		},
		
		autoChangeTimeRange: function( timeLength, beginDateCtrl, beginTimeCtrl, endDateCtrl, endTimeCtrl, intervalSameAsLength )
		{
			var timeInterval = timeLength;
			endDateCtrl.setDisabled(timeLength > 0);
			endTimeCtrl.setDisabled(timeLength > 0);
			
			var date = new Date();	
			switch( timeLength )
			{
			case 3600: // hour
				beginTimeCtrl.setValue((date.add(Date.HOUR, -1)).format("H"));
				beginDateCtrl.setValue(new Date());
				timeInterval = 0;
				break;
			case 86400: // day
				beginTimeCtrl.setValue("00");
				beginDateCtrl.setValue(date.add(Date.DAY, -1));
				timeInterval = 3600;
				break;
			case 86400 * 7: // week
				beginTimeCtrl.setValue("00");
				beginDateCtrl.setValue(date);
				date = date.add(Date.DAY, -1 * date.getDay());
				beginDateCtrl.setValue(date);
				timeInterval = 86400;
				break;
			case 86400 * 31: // month
				beginTimeCtrl.setValue("00");
				date.setDate(1);
				beginDateCtrl.setValue(date);
				timeInterval = 86400;
				break;
			case 86400 * 365: // year
				beginTimeCtrl.setValue("00");
				date.setMonth(0);
				date.setDate(1);
				beginDateCtrl.setValue(date);
				timeInterval = 86400 * 31;
				break;
			default:
				break;
			}
			
			if( intervalSameAsLength )
			{
				timeInterval = timeLength;
			}
			
			if( timeLength < 3600 )
			{
				beginTimeCtrl.setValue((date.add(Date.HOUR, -1)).format("H"));
				beginDateCtrl.setValue(new Date());
				timeLength = 86400;
			}
			
			var dateString = beginDateCtrl.getRawValue();
			var timeString = beginTimeCtrl.getRawValue();
			var beginTime = Date.parseDate(String.format('{0} {1}:00:00', dateString, timeString), 'Y-m-d H:i:s');
			var endTime   = beginTime.add(Date.SECOND, timeLength - 1);
			endDateCtrl.setValue(endTime.format('Y-m-d'));
			endTimeCtrl.setValue(endTime.format('H'));
			
			return timeInterval;
		},
		
		formatTimeLabel: function( timeValue, timeInterval )
		{
			var label = '';
			var separator = '-';
			if( timeInterval < 3600 )
			{
				label = Date.parseDate(timeValue, 'U').format(Lang.Common.timeFormat.custom) 
					+ separator + Date.parseDate(timeValue + timeInterval - 1, 'U').format(Lang.Common.timeFormat.custom);
			}
			else if( timeInterval < 86400 )
			{
				if( timeInterval == 3600 )
				{
					label = Date.parseDate(timeValue, 'U').format(Lang.Common.timeFormat.hourly);
				}
				else
				{
					label = Date.parseDate(timeValue, 'U').format(Lang.Common.timeFormat.hourly) 
						+ separator + Date.parseDate(timeValue + timeInterval - 1, 'U').format(Lang.Common.timeFormat.hourly);
				}
			}
			else if( timeInterval < (86400 * 31) )
			{
				if( timeInterval == 86400 )
				{
					label = Date.parseDate(timeValue, 'U').format(Lang.Common.timeFormat.daily);
				}
				else
				{
					label = Date.parseDate(timeValue, 'U').format(Lang.Common.timeFormat.daily) 
						+ separator + Date.parseDate(timeValue + timeInterval - 1, 'U').format(Lang.Common.timeFormat.daily);
				}
			}
			else if( timeInterval < (86400 * 365) )
			{
				if( timeInterval == (86400 * 31) )
				{
					label = Date.parseDate(timeValue, 'U').format(Lang.Common.timeFormat.monthly);
				}
				else
				{
					label = Date.parseDate(timeValue, 'U').format(Lang.Common.timeFormat.monthly) + 
						+ separator + Date.parseDate(timeValue + timeInterval - 1, 'U').format(Lang.Common.timeFormat.monthly);
				}
			}
			else
			{
				if( timeInterval == (86400 * 365) )
				{
					label = Date.parseDate(timeValue, 'U').format(Lang.Common.timeFormat.yearly);
				}
				else
				{
					label = Date.parseDate(timeValue, 'U').format(Lang.Common.timeFormat.yearly) + 
						+ separator + Date.parseDate(timeValue + timeInterval - 1, 'U').format(Lang.Common.timeFormat.yearly);
				}
			}

			return label;
		},
		
		formatHttpError: function( error )
		{
			if( error < 0 )
			{
				return Lang.HttpError['-1'];
			}
			else if( Lang.HttpError[error] )
			{
				return String.format('{0},{1}', error, Lang.HttpError[error]);
			}
			else
			{
				return Lang.HttpError['unknown'];
			}
		},
		
		// get an sub array from arr1 if the element exists in arr2
		getSubArrayFrom: function( arr1, arr2 )
		{
			var subArray = [];
			for( var i = 0; i < arr1.length; i ++ )
			{
				var item = arr1[i];
				for( var j = 0; j < arr2.length; j ++ )
				{
					if( item == arr2[j] )
					{
						subArray.push(item);
						break;
					}
				}
			}
			
			return subArray;
		},
		
		getDataReportTitle: function( reportItem )
		{
			if( reportItem.multiTestInfo )
			{
				var title = [];
				for( var i = 0; i < reportItem.multiTestInfo.length; i ++ )
				{
					title.push(reportItem.multiTestInfo[i].name);
				}
				return title.join(',');
			}
			else
			{
				return reportItem.testInfo.name;
			}
		},
		
		getExcludeArray: function( arr, exlcudeItems )
		{
			var attrMap = {};
			var newArray = [];

			if( Ext.isArray(exlcudeItems) )
			{
				for( var i = 0; i < exlcudeItems.length; i++ )
				{
					attrMap[exlcudeItems[i]] = true;
				}
			}
			else
			{
				attrMap[exlcudeItems] = true;
			}
			
			for( var i = 0; arr && i < arr.length; i ++ )
			{
				var value = arr[i];
				if( attrMap[value] )
				{
					continue;
				}
				
				newArray.push(value);
			}
			
			return newArray;
		},
		
		getIdObjectListMap: function( infoList )
		{
			var newInfoMap = {};
			for( var i = 0; infoList && i < infoList.length; i ++ )
			{
				var infoItem = infoList[i];
				newInfoMap[infoItem.id] = infoItem;
			}
			
			return newInfoMap;
		},
		
		compareVersion: function( version1, version2, separator )
		{
			var version1Values = version1 ? version1.toString().split(separator ? separator : '.') : [];
			var version2Values = version2 ? version2.toString().split(separator ? separator : '.') : [];
			
			// padding for 0
			var verLength = Math.max(version1Values.length, version2Values.length);
			for( var i = 0; i < verLength; i ++ )
			{
				if( version1Values.length <= i ) version1Values.push(0);
				else version1Values[i] = parseInt(version1Values[i]);
				
				if( version2Values.length <= i ) version2Values.push(0);
				else version2Values[i] = parseInt(version2Values[i]);
			}
			
			for( var i = 0; i < verLength; i ++ )
			{
				if( version1Values[i] != version2Values[i] )
				{
					return version1Values[i] - version2Values[i];
				}
			}
			
			return 0;
		},
		
		parseUrl: function( url )
		{
			var subUrl = url + '';
			var result = {};
			
			var pos = subUrl.indexOf('://');
			if( pos < 0 )
			{
				result.protocol = '';
			}
			else
			{
				result.protocol = subUrl.substr(0, pos);
				subUrl = subUrl.substr(pos + 3);
			}
			
			pos = subUrl.indexOf('/');
			var pos2 = subUrl.indexOf(':');
			if( pos2 > 0 && (pos < 0 || pos2 < pos) )
			{
				result.hostname = subUrl.substr(0, pos2);
				result.port = subUrl.substr(pos2 + 1, pos > 0 ? pos - pos2 - 1 : subUrl.length - pos2 - 1);
			}
			else
			{
				result.hostname = subUrl.substr(0, pos > 0 ? pos : subUrl.length);
				result.port = 0;
			}
			
			result.uri = pos > 0 ? subUrl.substr(pos) : '/';
			return result;
		},
		
		nameAscSorter: function( name1, name2 )
		{
			return (name1 > name2) ? 1 : ((name1 == name2) ? 0 : -1);
		},
		
		rankClassAscSorter: function( item1, item2 )
		{
			if( item1.rankClass != item2.rankClass )
			{
				return parseInt(item1.rankClass) - parseInt(item2.rankClass);
			}
			
	        return (item1.name > item2.name) ? 1 : ((item1.name == item2.name) ? 0 : -1);
		},
		
		sortRankClassWithGroups: function( items, groups )
		{
			items.sort(function( item1, item2 )
			{
				var group1 = groups ? groups[item1.groupId] : null;
				var group2 = groups ? groups[item2.groupId] : null;
				
				if( !group1 ) group1 = {id: 0, rankClass: 1000, name: ''};
				if( !group2 ) group2 = {id: 0, rankClass: 1000, name: ''};
				if( group1.rankClass != group2.rankClass )
				{
					return group1.rankClass - group2.rankClass;
				}
				else if( group1.name != group2.name )
				{
					return (group1.name > group2.name) ? 1 : -1;
				}
				else if( group1.id != group2.id )
				{
					return group1.id - group2.id;
				}
				else if( item1.rankClass != item2.rankClass )
				{
					return item1.rankClass - item2.rankClass;
				}
				else
				{
					return (item1.name > item2.name) ? 1 : ((item1.name == item2.name) ? 0 : -1);
				}
			});
		},
		
		fillMapAndStoreWidthItems: function( items, groups, map, store )
		{
			for( var i = 0; i < items.length; i ++ )
			{
				var item = items[i];
				var group = groups ? groups[item.groupId] : null;
				var prefixName = '';
				var groupDepth = 0;
				
				map[item.id] = item;
				if( groups && !group )
				{
					continue;
				}
				
				while( group && groupDepth < 10 )
				{
					prefixName = (group.name + ' | ' + prefixName);
					group = groups[group.parentId];
					groupDepth ++;
				}
				
				store.push([item.id, prefixName + item.name]);
			}
		},
		
		setTimer: function( fn, scope, interval, once )
		{
			if( once )
			{
				return setTimeout(function()
				{
					fn.call(scope);
				}, interval);
			}
			else
			{
				return setInterval(function()
				{
					fn.call(scope);
				}, interval);
			}
		},
		
		getCompatibleIconUrl: function( name )
		{
			return String.format('{0}{1}', name, Ext.isIE6 ? '.jpg' : '.png')
		},
		
		deepCopyTo: function( to, from )
		{
			if( Ext.isArray(from) )
			{
				if( !Ext.isArray(to) )
				{
					return to;
				}
				
				to.length = 0;
				for( var i = 0; i < from.length; i ++ )
				{
					var fromItem = from[i];
					var toItem = fromItem;
					if( Ext.isArray(fromItem) )
					{
						toItem = Utils.deepCopyTo([], fromItem);
					}
					else if( Ext.isObject(fromItem) )
					{
						toItem = Utils.deepCopyTo({}, fromItem);
					}
					to.push(toItem);
				}
			}
			else if( Ext.isObject(from) )
			{
				if( !Ext.isObject(to) )
				{
					return to;
				}
				
				for( var name in from )
				{
					var fromItem = from[name];
					var toItem = fromItem;
					if( Ext.isArray(fromItem) )
					{
						toItem = Utils.deepCopyTo([], fromItem);
					}
					else if( Ext.isObject(fromItem) )
					{
						toItem = Utils.deepCopyTo({}, fromItem);
					}
					to[name] = toItem;
				}
			}
			else
			{
				return from;
			}
			
			return to;
		},
		
		encodeTestSerialId: function( isWeb, testType, testId )
		{
			var serialId = isWeb ? '8' : '6';
			var verifyNumber = (parseInt(serialId.substr(0, 1)) * parseInt(testType) * parseInt(testId)) % 9 + 1;
			
			serialId += String.leftPad(testType.toString(), 4, '0');
			serialId += verifyNumber;
			serialId += String.leftPad(testId.toString(), 6, '0');
			
			return serialId;
		},
		
		decodeTestSerialId: function( serialId )
		{
			if( typeof(serialId) != 'string' )
			{
				serialId = serialId.toString();
			}
			
			var result = null;		
			if( serialId.length < 7 )
			{
				// orignal
				result =
				{
					isValid: false,
					isWeb: false,
					testType: 0,
					id: parseInt(serialId, 10)
				};
			}
			else
			{
				result =
				{
					isValid: true,
					isWeb: (serialId.substr(0, 1) == '8'),
					testType: parseInt(serialId.substr(1, 4), 10),
					id: parseInt(serialId.substr(6), 10)
				};
				var verifyNumber = parseInt(serialId.substr(5, 1));
				result.isValid = (verifyNumber == ((parseInt(serialId.substr(0, 1) * result.testId * result.testType)) % 9 + 1));
			}
			
			return result;
		},
		
		clone: function( obj )
		{
			if( !obj || 'object' !== typeof obj )
			{
				return obj;
			}
			if( 'function' === typeof obj.clone )
			{
				return obj.clone();
			}
			var c = '[object Array]' === Object.prototype.toString.call(obj) ? [] : {};
			var p, v;
			for( p in obj )
			{
				if( obj.hasOwnProperty(p) )
				{
					v = obj[p];
					if( v && 'object' === typeof v )
					{
						c[p] = this.clone(v);
					}
					else
					{
						c[p] = v;
					}
				}
			}
			return c;
		},
		
		getWideString: function( value, wideLength, suffix )
		{
			if( !value )
			{
				return '';
			}
			else if( typeof(value) != 'string' )
			{
				value = value.toString();
			}
			
			var newLength = 0;
			var index = 0;
			for( index = 0; index < value.length && newLength < wideLength; index ++ )
			{
				if( value.charCodeAt(index) > 127 ) newLength += 2;
				else newLength += 1;
			}
			
			if( index >= value.length ) suffix = '';
			return value.substr(0, index) + (suffix ? suffix : '');
		},
		
		comboFuzzyQueryFilter: function( ev )
		{
			var combo = ev.combo;
			if( !ev.forceAll )
			{
				var input = ev.query;
				var regExp = new RegExp(".*" + input + ".*");
				combo.store.filterBy(function( record, id )
				{
					var text = record.get(combo.displayField);
					return regExp.test(text);
				});
				combo.expand();
				return false;
			}
			
			return true;
		},

		fullUrlDecode: function( url )
		{
			url = url ? url.toString() : '';
			var result =
			{
				protocol: '',
				hostname: '',
				uri: '',
				params: {}
			};

			var protocolPos = url.indexOf('://');
			if( protocolPos <= 0 )
			{
				return result;
			}

			result.protocol = url.substr(0, protocolPos);
			url = url.substr(protocolPos + 3);

			var hostnamePos = url.indexOf('/');
			if( hostnamePos < 0 )
			{
				result.hostname = url;
				return result;
			}

			result.hostname = url.substr(0, hostnamePos);
			url = url.substr(hostnamePos);

			var urlPos = url.indexOf('?');
			if( urlPos < 0 )
			{
				result.uri = url;
				return result;
			}

			result.uri = url.substr(0, urlPos);
			url = url.substr(urlPos + 1);
			result.params = Ext.urlDecode(url);

			return result;
		},
		
		exportGrid: function( grid, title, titles )
		{
			var store = grid.getStore();
			var filename = (title || 'grid') + '.xls';
			
			if( !titles && grid.plugins )
			{
				var titlePlugin = null;
				var plugins = Ext.isArray(grid.plugins) ? grid.plugins : [grid.plugins];
				for( var i = 0; i < plugins.length; i ++ )
				{
					var pluginItem = plugins[i];
					if( pluginItem.rows || pluginItem.config.rows )
					{
						titlePlugin = pluginItem;
						break;
					}
				}
				
				if( titlePlugin )
				{
					titles = titlePlugin.rows ? pluginItem.rows : pluginItem.config.rows;
				}
			}
			
			var data = 
			{
				titles: titles || [],
				columns: [],
				rows: []
			};
			
			var colModel = grid.getColumnModel();
			var columns = [];
			for( var col = 0; col < colModel.getColumnCount(); col ++ )
			{
				var item = colModel.config[col];
				if( item.hidden )
				{
					continue;
				}
				
				columns.push(
				{
					name:  item.dataIndex,
					title: item.header,
					width: item.width,
					renderer: item.renderer,
					scope: item.scope
				});
				
				data.columns.push(
				{
					name: item.dataIndex,
					title: item.header,
					width: item.width,
					align: item.align
				});
			}
			
			var rowIndex = 0;
			store.each(function( record )
			{
				var rowItem = [];
				for( var i = 0; i < columns.length; i ++ )
				{
					var columnItem = columns[i];
					var value = record.get(columnItem.name);
					if( columnItem.renderer )
					{
						value = columnItem.renderer.call(columnItem.scope, value, {}, record, rowIndex, i, store);
					}
					rowItem.push(value);
				}
				data.rows.push(rowItem);
				
				rowIndex ++;
			});
			
			Nts.Utils.Helper.saveDataAs(Ext.encode(data), filename, '/saveTextExcelAs');
		},

		isArrayHave: function( array, item, type, start )
		{
			if( start == null )
			{
				start = 0;
			}
			else if( start < 0 )
			{
				start = Math.max(0, array.length + start);
			}
			for( var i = start; i < array.length; i++ )
			{
				if( type === 1 )
				{
					if( array[i].name === item.name && array[i].testType === item.testType )
					{
						return i;
					}
				}
				else if( type === 2 )
				{
					if( array[i].name === item.name && array[i].testType !== item.testType )
					{
						return i;
					}
				}
				else if( type === 3 )
				{
					if( array[i].name === item )
					{
						return i;
					}
				}
				else if( type === 4 )
				{
					if( array[i] === item )
					{
						return i;
					}
				}
			}
			return -1;
		},

		removeColumnConfig: function( array, index )
		{
			if( isNaN(index) || index > array.length )
			{
				return false;
			}
			for( var i = 0, n = 0; i < array.length; i++ )
			{
				if( array[i] != array[index] )
				{
					array[n++] = array[i];
				}
			}
			array.length -= 1;
		},

		addColumnToGrid: function( grid, field, column, colIndex )
		{
			if( !column )
			{
				if( field.dataIndex )
				{
					column = field;
					field = field.dataIndex;
				}
				else
				{
					column = field.name || field;
				}
			}
			this.addFieldToStore(grid.store, field);
			this.addColumnToColumnModel(grid.colModel, column, colIndex);
		},

		removeColumnOfGrid: function( grid, name, colIndex )
		{
			this.removeFieldOfStore(grid.store, name);
			if( typeof colIndex != 'number' )
			{
				colIndex = grid.colModel.findColumnIndex(name);
			}
			if( colIndex >= 0 )
			{
				this.removeColumnOfColumnModel(grid.colModel, colIndex);
			}
		},

		addFieldToStore: function( store, field )
		{
			if( typeof field == 'string' )
			{
				field =
				{
					name: field
				};
			}
			store.recordType.prototype.fields.replace(field);
			if( typeof field.defaultValue != 'undefined' )
			{
				store.each(function( r )
				{
					if( typeof r.data[field.name] == 'undefined' )
					{
						r.data[field.name] = field.defaultValue;
					}
				});
			}
		},
		
		removeFieldOfStore: function( store, name )
		{
			store.recordType.prototype.fields.removeKey(name);
			store.each(function( r )
			{
				delete r.data[name];
			});
		},

		addColumnToColumnModel: function( colModel, column, colIndex )
		{
			if( typeof column == 'string' )
			{
				column =
				{
					header: column,
					dataIndex: column
				};
			}
			var config = colModel.config;
			colModel.config = [];
			if( typeof colIndex == 'number' )
			{
				config.splice(colIndex, 0, column);
			}
			else
			{
				colIndex = config.push(column);
			}
			colModel.setConfig(config);
			return colIndex;
		},

		removeColumnOfColumnModel: function( colModel, colIndex )
		{
			var config = colModel.config;
			colModel.config =
			[
				config[colIndex]
			];
			this.removeColumnConfig(config, colIndex);
			colModel.setConfig(config);
		}
	};
	var Utils = Nts.Utils.Helper;
	return Utils;
	// compatible for old version

//	Utils.WebLog = Nts.Utils.WebLog;
});

