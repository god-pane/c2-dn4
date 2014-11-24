define(function(require){
	require("cloud/base/cloud");
	var html = require("text!./remote-control.html");
    var RemoteControl = Class.create(cloud.Component, {
    	
        initialize: function($super,options){
        	$super(options);
        	this.render(options);
        	this.empower();
        },
        
        empower: function() {
        	var config = permission.app("_gateway");
        	if(!config.console) {
        		this.element.find("#normal-mode").find("input").attr("disabled", true);
        		this.element.find("#advance-mode").find("input").click();
        	}
        	if(!config.remoteControl) {
        		this.element.find("#advance-mode").find("input").attr("disabled", true);
        	}
        },
        
        _mask:function(element){
        	cloud.util.mask(element);
        	$("#remote-control-submit1").attr("disabled","disabled");
        	$("#remote-control-submit2").attr("disabled","disabled");
        	$("#remote-control-input").attr("disabled","disabled");
        },
        
        _unmask:function(){
        	cloud.util.unmask();
        	$("#remote-control-submit1").removeAttr("disabled");
        	$("#remote-control-submit2").removeAttr("disabled");
        	$("#remote-control-input").removeAttr("disabled");
        },
        
        destroy:function(){
        	this.element.empty();
        },
        
        render:function(options){
        	var self = this;
        	self.command = self._command();
        	self._setGatewayId(options.id);
        	self._draw();
        	self._showMode();
        	self._bindEvents();
        	locale.render({element:self.element});
        },
        
        _setTask:function(obj){
        	var self = this;
        	self.task = {
        		id:obj["_id"],
        		name:obj["name"]
        	}
        },
        
        _clearTask:function(){
        	var self = this;
        	self.task = null;
        },
        
        _getTask:function(){
        	var self = this;
        	return self.task;
        },
        
        _judgeTask:function(callback){
        	var self = this;
        	self._mask(".remote-control-body");
        	if(self._getTask()){
        		var task = self._getTask();
        		self._output("Please stop executing task { " + task["name"] + " - " + task["id"] + " } first " + "<a class='remote-control-stop-task'>" + locale.get("cancel") + "</a>");
        		self._unmask();
        	}else{
        		self._apiQueryActiveTask(function(data){
        			var result = data["result"];
        			if(result.length > 0){
        				self._setTask(result[0]);
        				var task = self._getTask();
        				self._output("Please stop executing task { " + task["name"] + " - " + task["id"] + " } first " + "<a class='remote-control-stop-task'>" + locale.get("cancel") + "</a>");
        				self._unmask();
        			}else{
        				callback();
        			}
        		});
        	}
        },
        
        _autoScroll:function(){
        	var $remote = document.getElementById("remote-control-content");
    		var offsetHeight = $remote.offsetHeight;
    		var scrollHeight = $remote.scrollHeight;
    		if(scrollHeight > offsetHeight){
    			var mul = parseInt(scrollHeight/offsetHeight);
    			$remote.scrollTop = mul * offsetHeight;
    		}
        },
        
        _performTask:function(task){
        	var self = this;
        	self._setTask(task);
        	var date = new Date();
        	self.task.startTime = date.getTime();
        	self.loop = function(){
        		self._apiQueryTask(task["_id"],function(data){
        			var result = data["result"];
        			var state = parseInt(result["state"]);
        			if(state === 3){
        				self._output(result["data"]["response"]);
        				self._unmask();
        				self._clearTask();
        				window.clearInterval(self.t);
        				self._autoScroll();
        			}else if(state === -1 || state === 2){
        				self._output(result["error"]);
        				self._unmask();
        				self._clearTask();
        				window.clearInterval(self.t);
        				self._autoScroll();
        			}else{
        				var _date = new Date();
        				var now = _date.getTime();
        				if((now - self.task.startTime)/1000 > 30){
        					self._cancelCurrentTask("Task Timeout - ");
        					self._autoScroll();
        				}
        			}
        		})
        	}
        	self.t = window.setInterval(self.loop,5000);
        },
        
//        _cancelTask:function(){
//        	var self = this;
//        	var task = self._getTask();
//        	if(task){
//        		self._apiCancelTask(task["id"], function(data){
//        			self._output("Stop the task { " + task["name"] + " - " + task["id"] + " } successfully");
//		        	window.clearInterval(self.t);
//		        	self._clearTask();
//		        	self._unmask();
//        		},function(error){
//        			self._output("Stop the task { " + task["name"] + " - " + task["id"] + " } failure");
//        			self._unmask();
//        		});
//        	}else{
//        		self._apiQueryActiveTask(function(data){
//        			var result = data["result"];
//        			if(result.length > 0){
//        				self._setTask(result[0]);
//        				self._apiCancelTask(result[0][_id], function(data){
//        					self._output("Stop the task { " + task["name"] + " - " + task["id"] + " } successfully");
//        		        	window.clearInterval(self.t);
//        		        	self._clearTask();
//        		        	self._unmask();
//                		},function(error){
//                			self._output("Stop the task { " + task["name"] + " - " + task["id"] + " } failure");
//                			self._unmask();
//                		});
//        			}
//        		});
//        	}
//        	
//        },
        
        _cancelCurrentTask:function(prefix){
        	var self = this;
        	var prefix = prefix ? prefix : "";
        	var task = self._getTask();
        	if(task){
        		self._apiCancelTask(task["id"], function(data){
        			self._output(prefix + "Stop the task { " + task["name"] + " - " + task["id"] + " } successfully");
		        	window.clearInterval(self.t);
		        	self._clearTask();
		        	self._unmask();
        		},function(error){
        			self._output(prefix + "Stop the task { " + task["name"] + " - " + task["id"] + " } failure");
        			self._unmask();
        		});
        	}else{
        		self._apiQueryActiveTask(function(data){
        			var result = data["result"];
        			if(result.length > 0){
        				self._setTask(result[0]);
        				self._apiCancelTask(result[0][_id], function(data){
        					self._output("Stop the task { " + task["name"] + " - " + task["id"] + " } successfully");
        		        	window.clearInterval(self.t);
        		        	self._clearTask();
        		        	self._unmask();
                		},function(error){
                			self._output("Stop the task { " + task["name"] + " - " + task["id"] + " } failure");
                			self._unmask();
                		});
        			}
        		});
        	}
        },
        
        _output:function(content){
        	if(content){
        		var content = content.replace(/<.{0,5}>/g,"<br/>");
        		$("#remote-control-content").append($("<span></span>").html(content));
        		$("#remote-control-content").append($("<br />"));
        	}
        },
        
        _command:function(){
        	var self = this;
        	function addTask(taskName){
        		self._judgeTask(function(){
        			self._getGateway(function(data){
        				Model.task({
        					method:"add",
        					param:{
        						verbose:100
        					},
        					data:{
        						userType:1,
        						name:taskName,
        						type:2,
        						priority:40,
        						objectId:data["_id"],
        						objectName:data["name"],
        						siteId:data["siteId"],
        						siteName:data["siteName"],
        						data: {
        							"deviceDesc": "CMD",
        							"sensorId" : 0,
        							"deviceType": 0,
        							"deviceContent": taskName
        						}
        					},
        					success:function(data){
        						self._performTask(data["result"]);
//        						console.log("data",data);
        					},
        					error:function(error){
        						console.log("error",error);
        					}
        				});
        			})
        		})
        	}
        	var structure = {
        			show:{
        				log:function(){
        					addTask("show log");
        				},
        				running:function(){
        					addTask("show running");
        				}
        			},
        			inhandsh:{
        				_:function(str){
        					addTask("inhandsh");
        				},
        				exit:function(){
        					addTask("inhandsh exit");
        				}
        			}
        		};
        		
        		function printError(error){
        			$("#remote-control-content").append($("<span></span>").text(error));
        			$("#remote-control-content").append($("<br />"));
        		}
        		
        		function printResult(data){
        			$("#remote-control-content").append(data);
        		}
        		
        		function parseCommand(str){
        			var str = str.replace(/\s{2,}/g," ");
        			var arr = str.split(" ");
        			var _arr = [];
        			for(var num = 0;num < arr.length;num++){
        				if(arr[num]){
        					_arr.push(arr[num]);
        				}
        			}
        			return _arr;
        		}
        		
//        		function send(command){
//        			if(!command){
//        				return;
//        			}
//        			var _command = parseCommand(command);
//        			var commandText = "";
//        			for(var _num = 0 ; _num < _command.length ; _num++){
//        				commandText += _command[_num] + " ";
//        			}
//        			self._getAccountInfo(function(data){
//            			self._output(data["email"] + " : " + commandText);
//            			$("#remote-control-input").val("");
//            			self._autoScroll();
//            		});
//        			var result,_result;
//        			for(var num = 0;num < _command.length;num++){
//        				if(num === 0){
//        					result = structure[_command[num]];
//        				}else{
//        					result = result[_command[num]];
//        				}
//        				if(num === _command.length - 2){
//        					_result = result;
//        				}
//        				if(num === _command.length - 1){
//        					if(!result){
//        						if(_result){
//        							if(_result["_"]){
//        								_result["_"](_command[_command.length-1]);
//        							}else{
//        								printError("Command " + _command[num] + "  does not exist!");
//                    					return;
//        							}
//        						}else{
//                					printError("Command " + _command[num] + " does not exist!");
//                					return;
//        						}
//        					}else{
//        						if(_command.length === 1){
//        							result["_"]();
//        						}else{
//        							if(result){
//        								result();
//        							}else if(result["_"]){
//        								result["_"]();
//        							}
//        						}
//        					}
//        				}else{
//        					if(!result){
//        						printError("Command " + _command[num] + " does not exist!");
//        						return;
//        					}
//        				}
//        			}
//        		}
        		
        		function send(command){
        			self._getAccountInfo(function(data){
            			self._output(data["email"] + " : " + command);
            			$("#remote-control-input").val("");
            			self._autoScroll();
            		});
        			addTask(command);
        		}
        		
        		var obj = {
        				send:send
        		};
        		
        		return obj;

        },
        
        _setGatewayId:function(gatewayId){
        	var self = this;
        	self.gatewayId = gatewayId;
        },
        
        _getGatewayId:function(){
        	var self = this;
        	return self.gatewayId;
        },
        
        _setGateway:function(gateway){
        	var self = this;
        	self.gateway = gateway;
        },
        
        _getGateway:function(callback){
        	var self = this;
        	if(!self.gateway){
        		self._apiQueryGateway(self._getGatewayId(),function(data){
        			var result = data.result;
        			self._setGateway(result);
        			callback(self.gateway);
        		});
        	}else{
        		callback(self.gateway);
        	}
        },
        
        _setAccountInfo:function(account){
        	var self = this;
        	self.account = account;
        },
        
        _getAccountInfo:function(callback){
        	var self = this;
        	if(!self.account){
        		self._apiQueryUserInfo(function(data){
        			self.account = data["result"];
        			if(callback){
        				callback(self.account);
        			}
        		})
        	}else{
        		if(callback){
        			callback(self.account);
        		}
        	}
        },
        
        _apiQueryTask:function(_id,callback){
        	Model.task({
        		method:"query_one",
        		part:_id,
        		param:{
        			verbose:100
        		},
        		success:function(data){
        			callback(data);
        		}
        	})
        },
        
        _apiCancelTask:function(_id,callback,_callback){
        	Model.task({
        		method:"delete",
        		part:_id,
        		param:{
        			verbose:100
        		},
        		success:function(data){
        			callback(data);
        		},
        		error:function(error){
        			if(_callback){
        				_callback(error);
        			}
        		}
        	})
        },
        
        _apiQueryActiveTask:function(callback){
        	Model.task({
        		method:"query_list",
        		param:{
        			user_types:[0,1,2],
        			states:[0,1,4,5],
        			types:[1,2,3,4,6,8,9,10,11,12,13,14,15,16,17,18,19,20],
        			object_id:this._getGatewayId(),
        			verbose:100
        		},
        		success:function(data){
        			callback(data);
        		}
        	})
        },
        
        _apiQueryUserInfo:function(callback){
        	Model.user({
        		method:"update_current",
        		param:{
        			verbose:100
        		},
        		success:function(data){
        			callback(data);
        		}
        	})
        },
        
        _apiQueryGateway:function(gatewayId,callback){
        	Model.device({
        		method:"query_one",
        		part:gatewayId,
        		param:{
        			verbose:100
        		},
        		success:function(data){
        			callback(data);
        		}
        	})
        },
        
        _apiQueryMachines:function(gatewayId,callback){
        	Model.device({
        		method:"query_one",
        		part:gatewayId,
        		param:{
        			verbose:10,
        			limit:0
        		},
        		success:function(data){
        			var siteId = data["result"]["siteId"];
        			Model.machine({
        				method:"query_list",
        				param:{
        					site_id:siteId,
        					limit:0,
        					verbose:100
        				},
        				success:function(_data){
        					callback(_data);
        				}
        			})
        		}
        	})
        },
        
        _showUserInfo:function(){
        	var self = this;
        	var $lastTime = $("#remote-control-user-lasttime");
        	var $lastIp = $("#remote-control-user-lastip");
        	var lastTime = $lastTime.text();
        	var lastIp = $lastIp.text();
        	if(!lastTime && !lastIp){
        		self._getAccountInfo(function(data){
        			$lastTime.text(cloud.util.dateFormat(new Date(data["thisLogin"]), "yy-MM-dd hh:mm:ss"));
        			$lastIp.text(data["thisIp"]);
        		});
        	}
        },
        
        _showGateway:function(){
        	var self = this;
        	var $gateway = $("#current-gateway-name");
        	var gatewayname = $gateway.text();
        	if(!gatewayname){
        		self._apiQueryGateway(self._getGatewayId(),function(data){
        			var result = data.result;
        			self._setGateway(result);
        			$gateway.text(result["name"]);
        			$("#title-gateway-name").text(result["name"]);
        		});
        	}
        },
        
        _showMachines:function(){
        	var self = this;
        	$("#current-machines-arrow").show();
        	$("#current-machines-box").show();
        	$("#current-machines-list").empty();
        	var $machines = $("#current-machines-list");
        	self._apiQueryMachines(self._getGatewayId(),function(data){
        			var result = data["result"];
        			if(result.length === 0){
        				var $select = $("<select></select>");
        				$select.append($("<option></option>").val("---").text("---"));
        				$machines.append($select);
        			}else{
        				var $select = $("<select></select>");
        				for(var num = 0;num < result.length;num++){
        					$select.append($("<option></option>").val(result[num]["_id"]).text(result[num]["name"]));
        				}
        				$machines.append($select);
        			}
        	});
        },
        
        _hideMachines:function(){
        	var self = this;
        	$("#current-machines-arrow").hide();
        	$("#current-machines-box").hide();
        },
        
        _draw:function(){
        	var self = this;
        	self.element.html(html);
        },
        
        _bindEvents:function(){
        	var self = this;
        	$("#normal-mode").children("input").click(function(){
        		self._showNormalMode();
        	});
        	$("#advance-mode").children("input").click(function(){
        		self._showAdvanceMode();
        	});
        	$("#hex").children("input").click(function(){
        		var checked = $(this).attr("checked");
        		if(checked){
        			$("#crlf").children("input").removeAttr("checked");
        		}
        	});
        	$("#crlf").children("input").click(function(){
        		var checked = $(this).attr("checked");
        		if(checked){
        			$("#hex").children("input").removeAttr("checked");
        		}
        	});
        	$("#command-list").change(function(){
        		var value = $(this).val();
        		if(value === "commandLine"){
        			$("#command-run-normal").hide();
        			$("#command-run-commandline").show();
        		}else{
        			$("#command-run-normal").show();
        			$("#command-run-commandline").hide();
        		}
        	})
        	
        	$("#remote-control-submit1").click(function(){
        		var value = $("#command-list").val();
        		self.command.send(value);
        	})
        	
        	$("#remote-control-cancel1").click(function(){
        		self._cancelCurrentTask();
        	})
        	
        	$("#remote-control-submit2").click(function(){
        		var commandText = $("#remote-control-input").val();
        		self.command.send(commandText);
        	})
        	
        	$("#remote-control-input").keydown(function(event){
        		if(event.keyCode == 13){
        			$("#remote-control-submit2").trigger("click");
        			return false;
        		}
        	})
        	
        	$("#remote-control-cancel2").click(function(){
        		self._cancelCurrentTask();
        	})
        	
        	$(".remote-control-cleanscreen").click(function(){
        		$("#remote-control-content").empty();
        	})
        	
        	$(".remote-control-stop-task").live("click",function(){
        		self._cancelCurrentTask();
        	});
        },
        
        _showMode:function(){
        	var self = this;
        	var mode = self.returnMode();
        	if(mode === 1){
        		self._showNormalMode();
        	}else if(mode === 2){
        		self._showAdvanceMode();
        	}
        },
        
        _showNormalMode:function(){
        	this._hideMachines();
        	$("#command-list").empty();
        	$("#command-list").append($("<option></option>").val("show log").text(locale.get("show_system_log")));
        	$("#command-list").append($("<option></option>").val("show running").text(locale.get("show_running")));
        	$("#command-list").append($("<option></option>").val("inhandsh").text(locale.get("enter_advanced_mode")));
        	$("#command-list").append($("<option></option>").val("inhandsh exit").text(locale.get("exit_advanced_mode")));
        	$("#command-list").append($("<option></option>").val("commandLine").text(locale.get("customized_cmd")));
        	$("#normal-mode").children("input").attr("checked","checked");
        	$("#advance-mode").children("input").removeAttr("checked");
        	$("#command-run-normal").show();
			$("#command-run-commandline").hide();
			$("#command-run-commandline").children("input").val("");
        	$("#remote-control-foot").height(35);
        	$("#hex-crlf").hide();
        	this._showGateway();
        	this._showUserInfo();
        },
        
        _showAdvanceMode:function(){
        	$("#command-list").empty();
        	$("#command-list").append($("<option></option>").val("commandLine").text(locale.get("customized_cmd")));
        	$("#normal-mode").children("input").removeAttr("checked");
        	$("#advance-mode").children("input").attr("checked","checked");
        	$("#command-run-normal").hide();
			$("#command-run-commandline").show();
			$("#command-run-commandline").children("input").val("");
        	$("#remote-control-foot").height(62);
        	$("#hex-crlf").show();
        	$("#hex").children("input").removeAttr("checked");
        	$("#crlf").children("input").removeAttr("checked");
        	this._showMachines();
        },
        
        returnMode:function(){
        	//１为普通模式,２为高级模式
        	var normal = $("#normal-mode").children("input").attr("checked");
        	var advance = $("#advance-mode").children("input").attr("checked");
        	if(normal && !advance){
        		return 1;
        	}else if(!normal && advance){
        		return 2;
        	}else{
        		return 1;
        	}
        },
        
        returnCommandMode:function(){
        	//0为无格式,1为HEX,2为CRLF
        	var hex = $("#hex").children("input").attr("checked");
        	var crlf = $("#crlf").children("input").attr("checked");
        	if(!hex && !crlf){
        		return 0;
        	}
        	if(hex){
        		return 1;
        	}
        	if(crlf){
        		return 2;
        	}
        }
       
    });
    
    return RemoteControl;
    
});