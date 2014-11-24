/**
 * @author PANJC
 * @filename command
 * @filetype {class}
 * @filedescription "dt里的WebSocket组件"
 * @filereturn {function} Command "函数引用"
 */
define(function(require){

	require("cloud/base/cloud");
	
	var Command = Class.create(cloud.Component,{
		/**
		 * @name initialize
		 * @description "该类的实例函数"
		 * @type {function}
		 * @param {function} $super "父类引用"
		 * @param {object} options "参数json对象"
		 * @return
		 */
		initialize:function($super,options){
			$super(options);
//			this.element = $(options.selector);
			this.elements = {
					box:"#command-form",
					content:"#command-text",
					input:"#command-input"
			}
			this._render(options);
		},
		/**
		 * @name _render
		 * @type {method}
		 * @description "渲染组件"
		 * @param {object} obj "参数json对象"
		 * @private
		 * @return
		 */
		_render:function(obj){
			this._drawInterface(obj.ui);
			this._renderWebSocket(obj.socket);
		},
		/**
		 * @name _drawInterface
		 * @type {method}
		 * @description "绘制dom结构"
		 * @param {object} ui "json对象"
		 * @private
		 * @return
		 */
		_drawInterface:function(ui){
			var ui = $.isPlainObject(ui) ? ui : {};
			var width = ui.width ? ui.width : 500;
			var height = ui.height ? ui.height : 300;
			var $box = $("<form></form>").attr("id",this.elements.box).css({width:width,height:height,border:"1px solid #666"});
			var $content = $("<textarea></textarea>").attr("id",this.elements.content).css({resize:"none",width:width,height:height-30});
			var $input = $("<input></input>").attr("id",this.elements.input).css({width:width,height:30,border:"1px solid #666"});
			$box.append($content).append($input);
			this.element.append($box);
		},
		/**
		 * @name _renderWebSocket
		 * @type {method}
		 * @description "绘制websocket"
		 * @param {object} socket "json对象"
		 * @private
		 * @return
		 */
		_renderWebSocket:function(socket){
			var socket = $.isPlainObject(socket) ? socket : {};
			this.socket = new WebSocket(socket.url);
			this.socket.onopen = this._onopen;
			this.socket.onmessage = this._onmessage;
			this.socket.onclose = this._onclose;
			this.socket.onerror = this._onerror;
		},
		/**
		 * @name _onopen
		 * @type {method}
		 * @description "socket打开处理函数"
		 * @private
		 * @return
		 */
		_onopen:function(){
			var self = this;
			self.socket.binaryType = "arraybuffer";
		},
		/**
		 * @name _onmessage
		 * @type {method}
		 * @description "socket发送信息处理"
		 * @param {object} data "json对象"、
		 * @private
		 * @return
		 */
		_onmessage:function(data){
			var self = this;
			self._loadMessage(data);
		},
		/**
		 * @deprecated
		 * @name _onclose
		 * @type {method}
		 * @description "关闭socket"
		 * @param {object} data "json对象"
		 * @private
		 * @return
		 */
		_onclose:function(data){
			var self = this;
		},
		/**
		 * @deprecated
		 * @name _onerror
		 * @type {method}
		 * @description "错误处理函数"
		 * @param {object} error "json对象"
		 * @private
		 * @return
		 */
		_onerror:function(error){
			var self = this;
		},
		/**
		 * @name send
		 * @type {method}
		 * @description "socket发送数据"
		 * @param {object} data "json对象"
		 * @retrun
		 */
		send:function(data){
			var self = this;
			$(self.elements.content).append(data);
			self.socket.send(data);
		},
		/**
		 * @name _loadMessage
		 * @type {method}
		 * @description "加载数据"
		 * @param {object} data "json对象"
		 * @private
		 * @return
		 */
		_loadMessage:function(data){
			var self = this;
			$(self.elements.content).append(data);
		},
		/**
		 * @name close
		 * @type {method}
		 * @description "关闭socket"
		 * @return
		 */
		close:function(){
			var self = this;
			if(self.socket){
				self.socket.close();
			}
			self.element.empty();
		},
		_events:function(){
			
		}
		
	})
	
	return Command;
	
});