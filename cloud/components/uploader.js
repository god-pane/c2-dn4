/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author QinJunwen
 * @Note: all File object will get an auto-generated property named "id" for specification, and this "id" has no relationship with any property in API
 * @filename uploader
 * @filetype {class}
 * @filedescription "文件上传组件"
 * @filereturn {function} Uploader "函数引用"
 */

// table component, display data in a table, support CRUD features.
define(function(require) {
	var cloud = require("cloud/base/cloud");
	require("cloud/lib/plugin/plupload.full");
	require("cloud/resources/css/uploader.css");
	require("cloud/resources/css/item.css");
	var Button = require("cloud/components/button");
	
	var Uploader = Class.create(cloud.Component, {
	    
	    /**
         * init this component
         * @author QinJunwen
         * @name initialize
         * @type {function}
         * @description "该类实例化函数"
         * @param {function} $super "父类引用"
         * @param {object} options "json参数对象"
         * @return
         */
		initialize : function($super, options) {

			options.buttonId = this._transId(options.browseElement);

			// this._createDefaultElement(options);

			cloud.util.defaults(options, {
				autoInit : true,
				autoUpload : false,
				multiSelection : false,
				maxFileSize : "10mb"
			});

			this.moduleName = "uploader";

			options.selector = $("<div>").addClass("cloud-uploader-container").appendTo(window.document);// $(button.parent()).addClass("cloud-uploader-container");
			$super(options);

			this._initPlugin(options);

			if (options.tipsContainer) {
				this._drawTipsContent(options.tipsContainer);
			}

			this.options = options;

			var button = $("#" + options.buttonId);

			button.wrap(this.element);

//			options.autoInit && (this.init());
			if(options.autoInit) this.init();
			
		},
		
		/**
		 * @deprecated
		 * @author QinJunwen
		 * @name _createDefaultElement
		 * @param options
		 * @type {method}
		 * @private
		 */
		_createDefaultElement : function(options) {
			var defaultElement = $("<div>")
					.addClass("cloud-uploader-container");

			$("#" + options.buttonId).wrap(defaultElement);

			this.defaultElement = defaultElement;
		},
		
		/**
		 * construct pluploader by component options
		 * @author QinJunwen
		 * @name _initPlugin
		 * @type {method}
		 * @description "初始化插件"
		 * @param {object} options
		 * @private
		 * @return
		 */
		_initPlugin : function(options) {
			var pluginOptions = this._optionsAdapter(options);
			this.pluginObj = new plupload.Uploader(pluginOptions);// TODO
		},
		
		/**
		 * init pluploader
		 * @author QinJunwen
		 * @name init
		 * @type {method}
		 * @description "配置插件"
		 * @param {object} options "配置对象"
		 * @return
		 */
		init : function(options) {
			var self = this;
			// bind init before init() called
			this.pluginObj.bind("PostInit", function(up) {
				self.fire("onInit", self);
			});
			this.pluginObj.bind("init", function(up) {
				self._bindElementEvents();
			});

			this.pluginObj.init();

			this._bindPluginEvents(options || this.options);
		},
		
		/**
		 * bind click and hover events to browseElement.
		 * @author QinJunwen
		 * @name _bindElementEvents
		 * @type {method}
		 * @description "为组件的元素绑定事件"
		 * @private
		 * @return
		 */
		_bindElementEvents : function(){
			var self = this;
//			console.log($("#"+this.id), "this.element")
			var pluploadEl = $("#"+this.id).find(".plupload");
			pluploadEl.hover(function(){
				self.browseElement && self.browseElement.trigger("mouseover");
			},function(){
				self.browseElement && self.browseElement.trigger("mouseout");
			}).mousedown(function(){
				self.browseElement && self.browseElement.trigger("mousedown");
			}).mouseup(function(){
				self.browseElement && self.browseElement.trigger("mouseup");
			})
		},
		
		/**
         * destroy this component
         * @author QinJunwen
         * @name destroy
         * @type {method}
         * @description "摧毁插件"
         * @param {function} $super "父类引用"
         * @return
         */
		destory : function() {
			this.pluginObj.destroy();
		},
		
		/**
		 * disable the uploader
		 * @author QinJunwen
		 * @name disable
		 * @type {method}
		 * @description "让插件按钮不可用"
		 * @return
		 */
		disable : function() {
			$("#"+this.id).find(".plupload").hide();
			$("#"+this.id).find(".plupload input").attr("disabled", "disabled");
//			this.element.find(".plupload").hide();// disable at flash runtime
//			this.element.find(".plupload input").attr("disabled", "disabled");// disable
																				// at
																				// html5
																				// runtime
		},
		
		/**
		 * enable the uploader
		 * @author QinJunwen
		 * @name enable
		 * @type {method}
		 * @description "让插件按钮可用"
		 * @return
		 */
		enable : function() {
			this.element.find(".plupload").show();
			this.element.find(".plupload input").removeAttr("disabled");
		},
		
		/**
		 * get file by id
		 * @author QinJunwen
		 * @name getFile
		 * @type  {method}
		 * @description "根据id获取文件对象"
		 * @param {string} id "文件id"
		 * @return
		 */
		getFile : function(id) {
			if (!id) {
				return this.pluginObj.files;
			} else {
				return this.pluginObj.getFile(id);
			}

		},
		
		/**
		 * remove file by id or index
		 * @author QinJunwen
		 * @name removeFile
		 * @type {method}
		 * @description "删除文件对象"
		 * @param {number} idOrIndex "文件id或索引"
		 * @return {object} file  "文件对象"
		 */
		removeFile : function(idOrIndex) {
			var file = null;

			// index
			if ((typeof idOrIndex) === "number") {
				file = this.pluginObj.splice(idOrIndex, 1);
			}
			// id
			else if ((typeof idOrIndex) === "string") {
				file = this.pluginObj.getFile(idOrIndex);
				this.pluginObj.removeFile(file);
			}
			return file;
		},
		
		/**
		 * start upload files
		 * @author QinJunwen
		 * @name start
		 * @type {method}
		 * @description "启动插件"
		 * @return
		 */
		start : function() {
			this.pluginObj.start();
		},
		
		/**
		 * stop upload files
		 * @author QinJunwen
		 * @name stop
		 * @type {method}
		 * @description "停止插件"
		 * @return
		 */
		stop : function() {
			this.pluginObj.stop();
		},
		
		/**
		 * draw tips content to show the process and result of upload
		 * @author QinJunwen
		 * @name _drawTipsContent
		 * @type {method}
		 * @description "绘制提示信息栏"
		 * @param  {string|object} tipsContainer
		 * @private
		 * @return
		 */
		_drawTipsContent : function(tipsContainer) {
			var self = this;
			this.tipsContent = new TipsContent({
				container : tipsContainer,
				events : {
					"onDeleteItems" : function(files) {
						files.each(function(file) {
							self.pluginObj.removeFile(file);
						});
					}
				}
			});
		},

		/**
		 * bind events of pluploader and fire events of this component
		 * @author QinJunwen
		 * @name _bindPluginEvents
		 * @type {method}
		 * @description "为插件绑定事件"
		 * @param {object} options
		 * @private
		 * @return
		 * Events: onInit onDestory onError beforeFileUpload onFilesAdded
         * onFilesRemoved onQueueChanged onFileUploaded onUploadProgress
         * onUploadComplete
		 */
		_bindPluginEvents : function(options) {
			var self = this;
			var pluginObj = this.pluginObj;
			var tipsContent = this.tipsContent;

			pluginObj.bind("Destroy", function(up) {
//				console.log("plupload - Destroy - up",up);
				self.fire("onDestory", self);
			});
			pluginObj.bind("Error", function(up, err) {
//				console.log("plupload - Error - up",up);
//				console.log("plupload - Error - err",err);
				var code = err.code + "";
				if(code === "-600"){
					var maxSize = up.settings.max_file_size / 1024;
					if(maxSize >= 1){
						var _maxSize = maxSize / 1024;
						if(_maxSize >= 1){
							err.text = locale.get(code) + parseInt(_maxSize) + "MB";
						}else{
							err.text = locale.get(code) + parseInt(maxSize) + "KB";
						}
					}else{
						err.text = locale.get(code) + maxSize + "KB";
					}
				}else{
						err.text = locale.get(code);
				}
				if(code !== "-500"){
					self.fire("onError", err);
				}
			});
			pluginObj.bind("BeforeUpload", function(up, file) {
//				console.log("plupload - BeforeUpload - up",up);
//				console.log("plupload - BeforeUpload - file",file);
				var url = up.settings.url.substring(0,9);
				var paramObj = {
						filename:file.name,
						access_token:cloud.Ajax.getAccessToken()
				}
				url = url + "?" + $.param(paramObj);
				up.settings.url = url;
				self.fire("beforeFileUpload", file, self);
			});
			pluginObj.bind("FilesRemoved", function(up, files) {
//				console.log("plupload - FilesRemoved - up",up);
//				console.log("plupload - FilesRemoved - files",files);
				self.fire("onFilesRemoved", files, self);
			});

			pluginObj.bind("QueueChanged", function(up) {
//				console.log("plupload - QueueChanged - up",up);
				self.fire("onQueueChanged", up.files, self);
			});
			
			pluginObj.bind("ChunkUploaded", function(a, b, c) {
//				console.log("plupload - ChunkUploaded - a",a);
//				console.log("plupload - FilesRemoved - b",b);
//				console.log("plupload - ChunkUploaded - c",c);
			});

			pluginObj.bind("FileUploaded", function(up, file, res) {
//				console.log("plupload - FileUploaded - up",up);
//				console.log("plupload - FileUploaded - file",file);
//				console.log("plupload - FileUploaded - res",res);
				var response = JSON.parse(res.response);
//				console.log("response",response);
				if(response.error){
					var errorCode = response.error_code;
					if($.inArray(errorCode,[21327,21334,21335,21336]) !== -1){
						Model.oauth({
							method:"refresh_token",
							data:{
								client_id:CONFIG["oauth"]["client_id"],
								client_secret:CONFIG["oauth"]["client_secret"],
								grant_type:CONFIG["oauth"]["grant_type"]["refresh_token"],
								refresh_token:cloud.refreshToken.get()
							},
							contentType:"application/x-www-form-urlencoded",
							success:function(data){
								cloud.accessToken.remove();
								cloud.accessToken.set(data.access_token);
								cloud.refreshToken.remove();
								cloud.refreshToken.set(data.refresh_token);
							}
						})
						response.error = "Upload failed, please try again";
						response.error_code = 900000000000;
						self.fire("onFileUploaded", response, file, self);
					}else{
						self.fire("onFileUploaded", response, file, self);
					}
				}else{
					tipsContent && (tipsContent.updateItem(file, response));
					self.fire("onFileUploaded", response, file, self);
				}
			});

			pluginObj.bind("UploadComplete", function(up, files) {
//				console.log("plupload - UploadComplete - up",up);
//				console.log("plupload - UploadComplete - files",files);
				self.fire("onUploadComplete", files, self);
			});

			pluginObj.bind("FilesAdded", function(up, files) {
//				console.log("plupload - FilesAdded - up",up);
//				console.log("plupload - FilesAdded - files",files);
				tipsContent && (tipsContent.addItems(files));
				self.fire("onFilesAdded", files, self);
				var autoUpload = self.options.autoUpload;
				autoUpload && (up.start());
			});

			pluginObj.bind("UploadProgress", function(up, file) {
//				console.log("plupload - UploadProgress - up",up);
//				console.log("plupload - UploadProgress - file",file);
				tipsContent && (tipsContent.updateItem(file));
				self.fire("onUploadProgress", file, self);
			});
		},

		/**
		 * @deprecated
		 * @author QinJunwen
		 * @name _bindTipsEvents
		 * @description
		 * @type {method}
		 * @private
		 */
		_bindTipsEvents : function() {
			var self = this;
			this.tipsContent.on("onDeleteItems", function(files) {
				files.each(function(file) {
					self.pluginObj.removeFile(file);
				});
			});

		},
		
		/**
		 * translate component options to fit pluploader 
		 * @author QinJunwen
		 * @name _optionsAdapter
		 * @type {method}
		 * @description "配置适配器"
		 * @param {object} options
		 * @private
		 * @return {object} pluginOpts
		 */
		_optionsAdapter : function(options) {
			var self = this;

			var pluginOpts = {
				browse_button : this.id,// options.buttonId,
				url : CONFIG["server"]["path"]["api"] + "/api/file",
				container : this.id,
				filters : options.filters,
				multi_selection : options.multiSelection,
				max_file_size : options.maxFileSize,
				flash_swf_url : require.toUrl("cloud/resources/flashs/plupload.flash.swf"),
				silverlight_xap_url : require.toUrl("cloud/resources/flashs/plupload.silverlight.xap"),
				multipart : false,
				runtimes : "gears,flash,silverlight,browserplus,html5"
			};

			return pluginOpts;
		},
		
		/**
		 * return or generate id of the element to render pluploader
		 * @author QinJunwen
		 * @name _transId
		 * @type {method}
		 * @description "生成元素id，渲染组件"
		 * @param  {string|object} browseElement
		 * @private
		 * @return {string} id
		 */
		_transId : function(browseElement) {
			if (browseElement) {
				if ((typeof browseElement) == "string") {
					this.browseElement = $("#" + browseElement);
					return browseElement;
				} else if (browseElement instanceof cloud.Component) {
					this.browseElement = browseElement.element;
					return browseElement.id;
				} else if (browseElement instanceof jQuery) {
					var objId = browseElement.attr("id");
					if (!objId) {
						objId = cloud.util.createUniqueID("Uploader");
						browseElement.attr("id", objId);
					}
					this.browseElement = browseElement;
					return objId;
				}
			} else {
				
			}
		}
	});
	/**
	 * @QinJunwen
	 * @name TipsContent
	 * @type {class}
	 * @description "提示信息组件"
	 * @return
	 */
	var TipsContent = Class.create(cloud.Component, {
	    
	    /**
         * init this component
         * @author QinJunwen
         * @name initialize
         * @type {function}
         * @description "该类的实例化函数"
         * @param {function} $super "父类引用"
         * @param {object} options "json参数对象"
         * @return
         */
		initialize : function($super, options) {
			cloud.util.defaults(options, {
				multi : true,// ?
				// hideInMils : 0,
				files : $A()

			});
			$super(options);

			// this.draw();

			this.itemHash = $H();

			this.render(options.files);
		},
		
		/**
		 * draw content of this component
		 * @author QinJunwen
		 * @name draw
		 * @type {method}
		 * @description "绘制组件的dom结构"
		 * @return
		 */
		draw : function() {
			this.queueContent = $("<div>").addClass("cloud-uploader-queue")
					.appendTo(this.element);
		},
		
		/**
		 * render tipsContent by files
		 * @author QinJunwen
		 * @name render
		 * @type {method}
		 * @description "渲染提示信息组件"
		 * @param {array} files "文件对象数组"
		 * @return
		 */
		render : function(files) {
			this.addItems(files);
		},
		
		/**
		 * render tips item
		 * @author QinJunwen
		 * @name _renderItem
		 * @type {method}
		 * @description "渲染提示项目"
		 * @param {object} file
		 * @param {object} context
		 * @private
		 * @return
		 */
		_renderItem : function(file, context) {
			var self = this;
			var queueItem = $("<div>").addClass("cloud-uploader-queue-item")
					.appendTo(self.queueContent);

			queueItem.cancelBtn = new Button(
					{
						container : $("<div>").addClass(
								"cloud-uploader-queue-item-cancel").appendTo(
								queueItem),
						imgCls : "cloud-icon-no",
						title : "cancel",
						events : {
							click : function() {
								self.deleteItems(file);
								if (self.itemHash.size() === 0) {
									self.removeQueue();
								}
							}
						}
					});
			var infoContent = $("<p>").addClass(
					"cloud-uploader-queue-item-info").appendTo(queueItem);

			queueItem.nameEl = $("<span>").addClass(
					"cloud-uploader-queue-item-name").text(file.name).appendTo(
					infoContent);
			$("<span>").text(plupload.formatSize(file.size) + " - ").appendTo(
					queueItem);
			queueItem.percentEl = $("<span>").addClass(
					"cloud-uploader-queue-item-percent").text("0%").appendTo(
					queueItem);

			// TODO progress_bar support
			queueItem.progressEl = $("<div>").addClass(
					"cloud-uploader-queue-item-progress").appendTo(queueItem);

			self.itemHash.set(file.id, queueItem);
		},
		
		/**
		 * add items to tips queue
		 * @author QinJunwen
		 * @name addItems
		 * @type {method}
		 * @description "将项目添加到提示消息队列"
		 * @param {object} files "文件对象数组"
		 * @return
		 */
		addItems : function(files) {
			var self = this;

			files = cloud.util.makeArray(files);

			files.each(function(file) {
				self.queueContent || (self.draw());
				self._renderItem(file);
			});

		},
		
		/**
		 * update status of item by the response of server
		 * @author QinJunwen
		 * @name updateItem
		 * @type {method}
		 * @description "更新项目状态信息"
		 * @param {object} file "文件对象"
		 * @param {object} res "服务器返回的数据"
		 * @return
		 */
		updateItem : function(file, res) {
			var queueItem = this.itemHash.get(file.id);
			if (res){
				if (!res.error) {
					queueItem.percentEl.append("(Success)");
				} else {
					queueItem.percentEl.html("<font color='red'>Error</font>");
				}
			}else{
				var queueItem = this.itemHash.get(file.id);
				queueItem.percentEl.text(file.percent + "%");
			}
//			
//			queueItem.percentEl.text(file.percent + "%");
//
//			if (res && !res.error) {
//				queueItem.percentEl.append("(Success)");
//			} else if (res && res.error) {
//				queueItem.percentEl.html("<font color='red'>Error</font>");
//			}

			// TODO update progress

		},
		
		/**
		 * delete tips items by file
		 * @author QinJunwen
		 * @name deleteItems
		 * @type {method}
		 * @description "删除提示信息"
		 * @param {object} files "文件对象数组"
		 * @return
		 */
		deleteItems : function(files) {
			var self = this;
			
			filesArr = files ? cloud.util.makeArray(files) : this.itemHash.values();
			filesArr.each(function(file) {
				var queueItem = self.itemHash.get(file.id);
				queueItem.remove();
				self.itemHash.unset(file.id);
			});

			self.fire("onDeleteItems", filesArr);
		},
		
		/**
		 * remove the tips queue
		 * @author QinJunwen
		 * @name removeQueue
		 * @type {method}
		 * @description "移除提示消息队列"
		 * @return
		 */
		removeQueue : function() {
			this.queueContent && this.queueContent.remove();
			this.queueContent = null;
		},
		
		/**
         * destroy this component
         * @author QinJunwen
         * @name destroy
         * @type {method}
         * @description "摧毁组件"
         * @param {function} $super "父类引用"
         * @return
         */
		destroy : function($super) {
			$super();

			return null;
		}
	});

	Uploader.TipsContent = TipsContent;

	return Uploader;

});