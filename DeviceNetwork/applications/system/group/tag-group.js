define(function(require) {
    require("cloud/base/cloud");
    require("./resources/css/tag-group.css");
    require("../../components/tag-overview.css");
    var Toolbar = require("cloud/components/toolbar");
    var Button = require("cloud/components/button");
    require("cloud/lib/plugin/jquery.qtip");
    require("cloud/lib/plugin/jquery.layout");
    
    //Create class TagOverview
    var TagManage = Class.create(cloud.Component, {
    	
        initialize: function($super,options) {
            $super(options);
            this.options = options;
        	if(!$.isPlainObject(this.options.events)){
        		this.options.events = {};
        	}
            this.moduleName = "tag-group";
            this.ids = {
            		"toolbar":"tag-group-toolbar",
            		"select":"tag-group-select",
            		"add":"tag-group-add",
            		"delete":"tag-group-delete",
            		"edit":"tag-group-edit",
            		"body":"tag-group-body",
            		"filter":"tag-group-body-filter",
            		"_select":"tag-group-body-filter-select",
            		"content":"tag-group-body-content"
            };
            this._render();
            this.permission();
        },
        
        _render:function(){
        	this._renderFrame();
        	this._renderLayout();
        	this._renderToolbar();
        	this._renderEditForm();
            this._renderCreateForm();
            this._renderBody();
            this._events();
            locale.render(this.element);
        },
        
        _renderFrame:function(){
        	this.element.append($("<div></div>").attr("id",this.ids.toolbar)).append($("<div></div>").attr("id",this.ids.body));
        },
        
        permission:function(){
        	var self = this;
			if(!(permission.app("_group"))["write"]){
				$("#tag-group-add").hide();
				$("#tag-group-delete").hide();
				$("#tag-group-edit").hide();
			}
        },
        
        _renderLayout:function(){
        	this.element.layout({
                defaults: {
                    paneClass: "pane",
                    "togglerLength_open": 50,
                    togglerClass: "cloud-layout-toggler",
                    resizerClass: "cloud-layout-resizer",
                    "spacing_open": 1,
                    "spacing_closed": 1,
                    "togglerLength_closed": 50,
                    resizable: false,
                    slidable: false,
                    closable: false
                },
                north: {
                    paneSelector: "#" + this.ids.toolbar,
                    size: 29
                },
                center: {
                    paneSelector: "#" + this.ids.body,
                }
            });
        },
        
        _renderToolbar:function(){
        	var self = this;
        	
            var checkbox = new Button({
                checkbox: true,
                id: this.ids.select,
                autoGenTitle : false,
                events: {
                    click: function() {
//                        if (this.selectAllButton.isSelected() === true) {
//                            this.itembox.selectAllItems();
//                        } else {
//                            this.itembox.unselectAllItems();
//                        }
                    },
                    scope: self
                },
                text: "0/0",
                disabled: false
            });

//            this.selectAllButton = checkbox;
            
            var addBtn = new Button({
                imgCls: "cloud-icon-add-tag",
                id: this.ids.add,
                lang:"{title:add_group}"
            });
            
            var deleteBtn = new Button({
                imgCls: "cloud-icon-remove-tag",
                id: this.ids["delete"],
                lang:"{title:delete_group}",
                events: {
                    click: function(){
                    	var ids = self._getSelectedIds();
                    	if(ids.length === 0){
                			dialog.render({lang:"select_least_one_group"})
                			return;
                		}
                    	dialog.render({
                    		lang:"confirm_to_delete_group",
                    		buttons:[{
                    			lang:"affirm",
                    			click:function(){
                    				self._deleteItems(ids);
                    			}
                    		},{
                    			lang:"cancel",
                    			click:function(){
                    				dialog.close();
                    			}
                    		}]
                    	});
                    },
                    scope: self
                }
            });

            var editBtn = new Button({
                imgCls: "cloud-icon-edit",
                id: this.ids.edit,
                lang:"{title:edit_group}",
                events:{
                	click:function(){
                		if((self._getSelectedIds()).length !== 1){
                			dialog.render({lang:"select_one_group"})
                			return;
                		}
                	}
                }
            });

            this.toolbar = new Toolbar({
                selector: "#" + this.ids.toolbar,
                leftItems: [checkbox],
                rightItems: [addBtn, deleteBtn, editBtn]
            });

        },
        
        _setSelectedCount:function(num){
        	var self = this;
        	$("#" + self.ids.select).find("span").eq(1).each(function(){
        		var text = $(this).text();
        		var arr = text.split("/");
        		arr[0] = num;
        		var newText = arr[0] + "/" + arr[1];
        		$(this).text(newText);
        	})
        },
        
        _refreshSelectedCount:function(){
        	var self = this;
        	var num = 0;
        	$("#" + self.ids.content).find("input").each(function(){
        		if($(this).attr("checked")){
        			num++;
        		}
        	});
        	self._setSelectedCount(num);
        },
        
        _getTotal:function(){
        	var self = this;
        	var total = 0;
        	$("#" + self.ids.select).find("span").eq(1).each(function(){
        		var text = $(this).text();
        		var arr = text.split("/");
        		total =  arr[1] * 1;
        	})
        	return total;
        },
        
        _setTotal:function(num){
        	var self = this;
        	$("#" + self.ids.select).find("span").eq(1).each(function(){
        		var text = $(this).text();
        		var arr = text.split("/");
        		arr[1] = num;
        		var newText = arr[0] + "/" + arr[1];
        		$(this).text(newText);
        	})
        },
        
        _refreshTotal:function(){
        	var self = this;
        	self._setTotal($("#" + self.ids.content).find("input").size());
        },
        
        _refreshState:function(){
        	var self = this;
        	self._refreshSelectedCount();
        	self._refreshTotal();
        	if((self._getSelectedIds()).length === self._getTotal() && (self._getSelectedIds()).length !== 0){
        		$("#" + self.ids.select).find("span").eq(0).removeClass("cloud-icon-default").addClass("cloud-icon-active");
        	}else{
        		$("#" + self.ids.select).find("span").eq(0).removeClass("cloud-icon-active").addClass("cloud-icon-default");
        	}
        },
        
        _renderBody:function(){
        	this._renderFilter();
        	this._renderContent();
        },
        
        _renderFilter:function(){
			var $filter = $("<div></div>").attr({
				"id":this.ids.filter,
				"class":"group-filter tag-group-filter"
				});
			var $icon = $("<p></p>").addClass("tag-group-filter-icon");
			var $title = $("<div></div>").text(locale.get("user") + ":").addClass("tag-group-filter-title");
			var $select = $("<select></select>").attr({
				"id":this.ids._select,
				"class":"group-filter-select tag-group-filter-select"
				});
			$select.append($("<option></option>").text(locale.get("all_user")).val("").attr({"selected":"selected"}));
			Model.user({
				method:"query_list",
				param:{
					verbose:100,
					limit:0
				},
				success:function(data){
					var result = data.result;
					for(var num = 0 ; num < result.length ; num++){
						if(result[num]["roleName"] !== "admin"){
							$select.append($("<option></option>").val(result[num]["_id"]).text(result[num]["name"]));
						}
					}
				}
			})
			$filter.append($icon).append($title).append($select);
			$("#" + this.ids.body).prepend($filter);
        },
        
        _renderContent:function(){
        	$("#" + this.ids.body).append($("<div></div>").attr({"id":this.ids.content}));
        	this._load();
        },
        
        _renderDefaultItems:function(){
        	var self = this;
        	var arr = [{
        		id:"tag-group-item-not",
        		title:locale.get("ungrouped")
        	}];
        	for(var num = 0; num < arr.length; num++){
        		var $item = $("<div></div>").attr({"id":arr[num]["id"],"class":"tag-group-item tag-group-item-not-out","_id":"ungrouped"});
        		$item.append($("<p></p>").attr({"class":"tag-group-item-text"}).text(arr[num]["title"]));
        		$("#" + self.ids.content).append($item);
        	}
        },
        
        _renderItem:function(data){
        	var self = this;
        	var $item = $("<div></div>").attr({"class":"tag-group-item tag-group-item-out","_id":data._id});
        	$item.append($("<input>").attr({"type":"checkbox","class":"tag-group-item-checkbox"}).hide());
        	$item.append($("<p></p>").attr({"class":"tag-group-item-text"}).text(data.name));
        	$("#" + self.ids.content).append($item);
        },
        
        _clickOnTheFirstItem:function(){
        	console.log("_clickOnTheFirstItem")
        	var self = this;
        	var $divList = $("#" + self.ids.content).children("div");
			if($divList.length === 1){
				$divList.eq(0).trigger("click");
			}else{
				$divList.eq(1).trigger("click");
			}
        },
        
        _deleteItems:function(arr){
        	var self = this;
        	for(var num = 0 ; num < arr.length; num++){
        		(function(num){
        			var num = num;
        			Model.group({
            			method:"delete",
            			param:{
            				verbose:100
            			},
            			part:arr[num],
            			success:function(data){
            				$("#" + self.ids.content).find("div").each(function(){
            	        		if($(this).attr("_id") === data.result._id){
            	        			$(this).remove();
            	        			return;
            	        		}
            	        	});
            				self._refreshState();
            				dialog.close();
                			dialog.render({lang:"delete_group_success"});
                			if(num === arr.length - 1){
                				self._clickOnTheFirstItem();
                    		}
            			},
            			error:function(error){
            				dialog.close();
            				if(error.error_code == "20005"){
            					dialog.render({lang:"please_empty_the_resources_in_the_group"})
            				}else{
            					dialog.render({lang:error.error_code});
            				}
            				if(num === arr.length - 1){
            					self._clickOnTheFirstItem();
                    		}
            			}
            		})
        		})(num)
        	}
        },
        
        _addItem:function(){
        	var self = this;
        	var __text = self.createForm.find("#new-tag-name").val();
        	if(!__text.replace(/\s/g,"") || __text.match(/[^a-zA-z0-9\u4e00-\u9faf]+/g) || __text.length > 30){
        		dialog.render({lang:"group_error"});
        		return;
        	}
        	Model.group({
        		method:"add",
        		param:{
        			verbose:100
        		},
        		data:{
        			name:self.createForm.find("#new-tag-name").val()
        		},
        		success:function(data){
        			var groupData = data.result;
        			if($("#" + self.ids._select).val()){
        				Model.group({
            				method:"assign_group_resources",
            				part:groupData["_id"],
            				param:{
            					verbose:100,
            					type:2
            				},
            				data:{
            					resourceIds:[$("#" + self.ids._select).val()]
            				},
            				success:function(){
            					refresh();
            				}
            			})
        			}else{
        				refresh();
        			}
        			function refresh(){
        				var $item = $("<div></div>").attr({"class":"tag-group-item tag-group-item-out","_id":groupData._id});
        				$item.append($("<input>").attr({"type":"checkbox","class":"tag-group-item-checkbox"}).hide());
        				$item.append($("<p></p>").attr({"class":"tag-group-item-text"}).text(groupData.name));
        				$("#tag-group-item-not").after($item);
        				self.createForm.find("#new-tag-name").val("");
        				self._refreshState();
//        				dialog.render({lang:"add_group_success"});
        				$("#" + self.ids.add).data("qtip").hide();
        				$("#" + self.ids.content).find("div").eq(1).trigger("click");
        			}
        		}
        	})
        },
        
        _updateItem:function(_id){
        	var self = this;
        	var __text = self.editForm.find("#edit-tag-name").val();
        	if(!__text.replace(/\s/g,"") || __text.match(/[^a-zA-z0-9\u4e00-\u9faf]+/g) || __text.length > 30){
        		dialog.render({lang:"group_error"});
        		return;
        	}
        	Model.group({
    			method:"update",
    			param:{
    				verbose:100
    			},
    			part:_id,
    			data:{
    				name:self.editForm.find("#edit-tag-name").val()
    			},
    			success:function(data){
    				$("#" + self.ids.content).find("div").each(function(){
    	        		if($(this).attr("_id") === data.result._id){
    	        			$(this).children("p").text(data.result.name);
    	        			if($(this).hasClass("tag-group-item-on")){
    	        				$("#group-name").text(data.result.name);
    	        			}
    	        			return;
    	        		}
    	        	});
    				self.editForm.find("#edit-tag-name").val("");
    				dialog.render({lang:"update_group_success"});
    			}
    		})
        },
        
        _load:function(_id,defaultItem){
        	var self = this;
        	var _id = _id ? _id : "";
        	var defaultItem = defaultItem ? defaultItem : 1;
        	$("#" + self.ids.content).empty();
        	self._renderDefaultItems();
        	var param = {};
        	if(!_id){
        		param = {
        				verbose:100,
            			limit:0	
        		}
        	}else{
        		param = {
        				verbose:100,
            			limit:0,
            			uid:_id
        		}
        	}
        	Model.group({
        		method:"query_list",
        		param:param,
        		success:function(data){
        			var result = data.result;
        			for(var num = 0;num < result.length;num++){
        				self._renderItem(result[num]);
        			}
        			self._setTotal(result.length);
        			if(defaultItem === 0){
        				$("#tag-group-item-not").trigger("click");
        			}else{
        				var $currentItem = $("#" + self.ids.content).find("div").eq(defaultItem);
        				if($currentItem.length === 0){
        					$("#" + self.ids.content).find("div").eq(0).trigger("click");
        				}else{
        					$currentItem.trigger("click");
        				}
        			}
        			self._refreshState();
        		}
        	});
        },
        
        _getSelectedIds:function(){
        	var self = this;
        	var idArr = [];
        	$("#" + self.ids.content).find("input").each(function(){
        		if($(this).attr("checked")){
        			idArr.push($(this).parent("div").attr("_id"));
        		}
        	});
        	return idArr;
        },
        
        _events:function(){
        	var self = this;
        	
        	$("#" + self.ids.select).bind("click",function(){
        		$span = $(this).find("span").eq(0);
        		if($span.hasClass("cloud-icon-active")){
        			$("#" + self.ids.content).find("input").attr("checked","checked");
        			self._setSelectedCount($("#" + self.ids.content).find("input").size());
        			$("#" + self.ids.content).find("input").show();
        		}else if($span.hasClass("cloud-icon-default")){
        			$("#" + self.ids.content).find("input").removeAttr("checked");
        			self._setSelectedCount(0);
        			$("#" + self.ids.content).find("input").hide();
        		}
        	});
        	
        	$("#" + self.ids.content).find("input").live("click",function(event){
        		var _selctedNum = 0;
        		$("#" + self.ids.content).find("input").each(function(){
        			if($(this).attr("checked")){
        				_selctedNum++;
        			}
        		})
        		self._setSelectedCount(_selctedNum);
        		if(_selctedNum !== self._getTotal()){
        			$("#" + self.ids.select).find("span").eq(0).removeClass("cloud-icon-active").addClass("cloud-icon-default");
        		}else{
        			$("#" + self.ids.select).find("span").eq(0).removeClass("cloud-icon-default").addClass("cloud-icon-active");
        		}
        		event.stopPropagation();
        	});
        	
        	$("#" + self.ids.content).find("div").live({
        		"mouseover":function(){
        			$(this).find("input").show();
        		},
        		"mouseout":function(){
        			var $input = $(this).children("input");
        			if($input.attr("checked")){
        				$input.show();
        			}else{
        				$input.hide();
        			}
        		},
        		"click":function(){
        			$(this).siblings().each(function(){
        				if($(this).attr("id") === "tag-group-item-not"){
        					$(this).removeClass("tag-group-item-not-on").addClass("tag-group-item-not-out");
        				}else{
        					$(this).removeClass("tag-group-item-on").addClass("tag-group-item-out");
        				}
            		})
            		if($(this).attr("id") === "tag-group-item-not"){
            			$(this).removeClass("tag-group-item-not-out").addClass("tag-group-item-not-on");
            		}else{
            			$(this).removeClass("tag-group-item-out").addClass("tag-group-item-on");
            		}
        			if($.isFunction(self.options.events.click)){
        				self.options.events.click($(this).attr("_id"));
        				$("#group-name").text($(this).children("p").text());
        			}
        		}
        	});
        	
        	$("#" + self.ids._select).die("change").live("change",function(){
        		self._load($(this).val(),1);
        	});
        	
        },
        
        /*
         * Create Form
         */
        _renderCreateForm: function() {
        	var self = this;
            this.createForm = $("<form>").addClass(this.moduleName + "-create-form ui-helper-hidden tag-overview-form");
            $("<label>").attr("for", "new-tag-name").text(locale.get({lang:"group_name+:"})).appendTo(this.createForm);
            $("<input type='text'>").attr("id", "new-tag-name").appendTo(this.createForm);
            new Button({
                // text: "提交",
                container: this.createForm,
                imgCls: "cloud-icon-yes",
                lang:"{title:submit}",
                events: {
                    click: function(){
                    	self._addItem();
                    },
                    scope: this
                }
            });
           this.createForm[0].childNodes[1].onkeydown=function(event){    
        	   if(event.keyCode==13){       		   
        		   self.onCreate();
        		   return false;
        	   }       	  
           };
            this.createForm.appendTo(this.element);
            this.addQtip = $("#" + this.ids.add).qtip({
                content: {
                    text: this.createForm
                },
                position: {
                    my: "top left",
                    at: "bottom middle"
                },
                show: {
                    event: "click"
                },
                hide: {
                    event: "click unfocus"
                },
                style: {
                    classes: "qtip-shadow qtip-light"
                },
				events: {
					visible: function(){
						$("#new-tag-name").focus();						
					}
				},
                suppress:false
            });
        },
        
        /*
         * Render edit form
         */
        _renderEditForm: function() {
        	var self = this;
            this.editForm = $("<form>").addClass(this.moduleName + "-edit-form ui-helper-hidden tag-overview-form");
            $("<label>").attr("for", "new-tag-name").text(locale.get({lang:"group_name+:"})).appendTo(this.editForm);
            $("<input type='text'>").attr("id", "edit-tag-name").appendTo(this.editForm);
            new Button({
//                title: "提交",
                imgCls: "cloud-icon-yes",
                lang:"{title:submit}",
                container: this.editForm,
                events: {
                    click: function(){
                    	var ids = self._getSelectedIds();
                    	if(ids.length === 1){
                    		self._updateItem(ids[0]);
                    	}
                    },
                    scope: this
                }
            });
            this.editForm.appendTo(this.element);
            this.editQtip = $("#" + this.ids.edit).qtip({
                content: {
                    text: this.editForm
                },
                position: {
                    my: "top left",
                    at: "bottom right"
                },
                show: {
                    event: "click"
                },
                hide: {
                    event: "click unfocus"
                },
                style: {
                    classes: "qtip-shadow qtip-light"
                },
                events: {
					visible: function(){
						$("#edit-tag-name").focus();
					},
                    show: function(event,api) {
                    	if((self._getSelectedIds()).length !== 1){
                    		event.preventDefault();
                    		return false;
                    	}
						
                    }.bind(this)
                },
                suppress:false
            });
        }
        
    });

    return TagManage;
});