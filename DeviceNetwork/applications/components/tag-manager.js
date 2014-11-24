/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 * @author PANJC
 */
define(function(require){
	require("cloud/base/cloud");
	require("./tag-manager.css");
	var Window = require("cloud/components/window");
	//Create class TagManager
    var TagManager = Class.create(cloud.Component, {
        initialize: function($super,options){
        	$super(options);
        	this.resourcesObj = options.obj;
        	this.resourcesIds = [];
        	for(var attr in this.resourcesObj){
        		this.resourcesIds.push(attr);
        	}
        	this.isOperated = false;
        	this.requestCount = 0;
        	this.resourcesTags = "";
        	this.selectedArrObj = "";
        	this._render();
        },
        
        /*
         * Render tagManager
         * @author PANJC
         */
        _render:function(){
        	this._draw();
        	this._getResourcesTags(this.resourcesIds);
        	this._events();
        },
        
        /*
         * destroy tagManager
         * @author PANJC
         */
        destroy: function($super){
			var $tagManager = $("#tag-manager");
        	$tagManager.find(".tag-manager-list-p").die("click");
        	$tagManager.find(".tag-manager-dropdown").die("click");
        	this.window.destroy();
//        	$super();
        },
        
        /*
         * Render window
         * @author PANJC
         */
        _renderWindow:function(){
        	var self = this;
        	this.window = new Window({
				container: "body",
				title: locale.get({lang:"tag_batch_operate"}),
				top: "center",
				left: "center",
				height: 550,
				width: 605,
				drag:true,
				mask: true,
				content: "<div id='tag-manager-box'></div>",
				events: {
					"onClose": function() {
						self.isVisible = false;
						if (this.requestCount == 0 && this.isOperated){
							this.fire("onComplete");//TODO onComplete event is required when this module is re-designed
						}
					},
					"onShow" : function(){
						self.isVisible = true;
					},
					scope: this
				}
			});
        	this.window.show();
        },
        
        /*
         * Draw tagManager
         * @author PANJC
         */
        _draw:function(){
        	this._renderWindow();
        	var $tagManager = $("<div>").attr("id","tag-manager").attr("class","tag-manager");
        	var $tagManagerContent = $("<div>").attr("id","tag-manager-content").attr("class","tag-manager-content");
        	$tagManager.append($tagManagerContent);
        	$("#tag-manager-box").append($tagManager);
        },
        
        /*
         * Load data into tagManager
         * @author PANJC
         */
        _loadData:function(){
        	var self = this;
        	var $tagManager = $("<div>");
        	var resourcesTags = self.resourcesTags;
        	var tagBlock = "tag-manager-block";
        	var block = "<div class="+tagBlock+">" +
        			"<div class='"+tagBlock+"-title'></div>" +
	        		"<div class='"+tagBlock+"-own'><div class='"+tagBlock+"-own-title'>"+locale.get({lang:"existing_tags+:"})+"</div><div class='"+tagBlock+"-own-content'></div></div>" +
        			"<div class='"+tagBlock+"-unown'><div class='"+tagBlock+"-unown-title'>"+locale.get({lang:"no_tags+:"})+"</div><div class='"+tagBlock+"-unown-content'></div></div>" +
        			"</div>";
        	var $content = $("#tag-manager-content");
        	var drapdown = "<div class='tag-manager-dropdown tag-dropdown-close'></div>";
        	$content.empty();
        	var $block,own,unown,resourceName;
        	for(var num=0;num<resourcesTags.length;num++){
        		own = "";
        		unown = "";
        		$block = $(block);
        		blockId = tagBlock+"-"+resourcesTags[num].resourceId;
        		$newBlock = $block.attr("id",blockId);
        		$content.append($newBlock);
        		for(var onum=0;onum<resourcesTags[num].tags.length;onum++){
        			if(resourcesTags[num].tags[onum].length != 0){
        				own+="<p class='tag-manager-list-p' tagid="+"own-"+resourcesTags[num]["tags"][onum]["_id"]+" resourceid="+resourcesTags[num].resourceId+" title="+resourcesTags[num].tags[onum].name+">"+ resourcesTags[num].tags[onum].name +"</p>";
        			}
        		}
        		if(resourcesTags[num].tags.length > 6){
        			$block.find("."+tagBlock+"-own").append($(drapdown));
        		}
        		for(var unum=0;unum<resourcesTags[num].noneTags.length;unum++){
//        			if(resourcesTags[num].noneTags[unum].length != 0){
        				unown+="<p class='tag-manager-list-p' tagid="+"unown-"+resourcesTags[num]["noneTags"][unum]["_id"]+" resourceid="+resourcesTags[num].resourceId+" title="+resourcesTags[num].noneTags[unum].name+">"+ resourcesTags[num].noneTags[unum].name +"</p>";
//        			}
        		}
        		if(resourcesTags[num].noneTags.length > 6){
        			$block.find("."+tagBlock+"-unown").append($(drapdown));
        		}
        		resourceName = self.resourcesObj[resourcesTags[num].resourceId.toLowerCase()] ? self.resourcesObj[resourcesTags[num].resourceId.toLowerCase()] : self.resourcesObj[resourcesTags[num].resourceId.toUpperCase()];
        		$block.find("."+tagBlock+"-title").text(locale.get({lang:"resource_name+:"})+resourceName);
        		$block.find("."+tagBlock+"-own-content").append($(own));
        		$block.find("."+tagBlock+"-unown-content").append($(unown));
        		$tagManager.append($block);
        	}
        	$("#tag-manager-content").append($tagManager);
        },
        
        /*
         * Events
         * @author PANJC
         */
        _events:function(){
        	var self = this;
        	var $tagManager = $("#tag-manager");
    		$tagManager.find(".tag-manager-dropdown").live("click",function(){
    			$this = $(this);
    			$tagManager.find(".tag-manager-dropdown").removeAttr("class").attr("class","tag-manager-dropdown tag-dropdown-close");
    			$this.removeAttr("class").attr("class","tag-manager-dropdown tag-dropdown-open");
    			$tagManager.find(".tag-manager-block-own").height(30);
    			$tagManager.find(".tag-manager-block-unown").height(30);
    			$thisParent = $this.parent("div");
    			$thisParent.css("height","auto");
    		});
    		var flag_add,flag_del;
    		$tagManager.find(".tag-manager-list-p").live("click",function(){
    			$this = $(this);
    			var tagId = $this.attr("tagid");
    			var state;
    			if(tagId.indexOf("unown") > -1){
    				tagId = $this.attr("tagid").substring(6);
        			state = $this.attr("tagid").substring(0,5);
    			}else{
    				tagId = $this.attr("tagid").substring(4);
        			state = $this.attr("tagid").substring(0,3);
    			}
    			var resourceId = $this.attr("resourceid");
    			var text = $this.text();
    			var requestArrObj = [{
    				resourceId:resourceId,
    				tagIds:[tagId]
    			}];
    			if(state == "own"){
    				function callback(){
    					$("#tag-manager-block-"+resourceId).find(".tag-manager-block-own-content").children("p").each(function(){
    						$this = $(this);
    						if($this.attr("tagid") == "own-"+tagId){
    							$this.remove();
    							$("#tag-manager-block-"+resourceId).find(".tag-manager-block-unown-content").append($("<p class='tag-manager-list-p' tagid='unown-"+tagId+"' resourceid='"+resourceId+"' title='"+text+"'>"+text+"</p>"));
    							$ownList = $("#tag-manager-block-"+resourceId).find(".tag-manager-block-own-content").find("p");
    							if($ownList.length <= 6){
    								if($("#tag-manager-block-"+resourceId).find(".tag-manager-block-own").find(".tag-manager-dropdown").length > 0){
    									$("#tag-manager-block-"+resourceId).find(".tag-manager-block-own").find(".tag-manager-dropdown").remove();
    								}
    							}
    							$unownList = $("#tag-manager-block-"+resourceId).find(".tag-manager-block-unown-content").find("p");
    							if($unownList.length > 6){
    								if($("#tag-manager-block-"+resourceId).find(".tag-manager-block-unown").find(".tag-manager-dropdown").length == 0){
    									$("#tag-manager-block-"+resourceId).find(".tag-manager-block-unown").append($("<div class='tag-manager-dropdown tag-dropdown-close'></div>"));
    								}
    							}
    						}
    					});
    					flag_del="";
    				}
    				if(flag_del!=requestArrObj[0].tagIds[0]){
    					flag_del=requestArrObj[0].tagIds[0]
    					self._deleteResourcesTags(requestArrObj, function(){callback()});
    				}   				
    			}else if(state == "unown"){
    				function callback1(){  					
    					$("#tag-manager-block-"+resourceId).find(".tag-manager-block-unown-content").children("p").each(function(){
    						$this = $(this);
    						if($this.attr("tagid") == "unown-"+tagId){
    							$this.remove();
    							$("#tag-manager-block-"+resourceId).find(".tag-manager-block-own-content").append($("<p class='tag-manager-list-p' tagid='own-"+tagId+"' resourceid='"+resourceId+"' title='"+text+"'>"+text+"</p>"));
    							$unownList = $("#tag-manager-block-"+resourceId).find(".tag-manager-block-unown-content").find("p");
    							if($unownList.length <= 6){
    								if($("#tag-manager-block-"+resourceId).find(".tag-manager-block-unown").find(".tag-manager-dropdown").length > 0){
    									$("#tag-manager-block-"+resourceId).find(".tag-manager-block-unown").find(".tag-manager-dropdown").remove();
    								}
    							}
    							$ownList = $("#tag-manager-block-"+resourceId).find(".tag-manager-block-own-content").find("p");
    							if($ownList.length > 6){
    								if($("#tag-manager-block-"+resourceId).find(".tag-manager-block-own").find(".tag-manager-dropdown").length == 0){
    									$("#tag-manager-block-"+resourceId).find(".tag-manager-block-own").append($("<div class='tag-manager-dropdown tag-dropdown-close'></div>"));
    								}
    							}
    						}
    					});
    					flag_add="";
    				}  
//    				console.log(++flag);
    				if(flag_add!=requestArrObj[0].tagIds[0]){
    					flag_add=requestArrObj[0].tagIds[0];
    					self._addResourcesTags(requestArrObj, function(){callback1()});
    				}  				
    			}
    		});
        },
        
        /*
         * Get respirces tags
         * @author PANJC
         * @param {Array} ids
         */
        _getResourcesTags:function(ids){
        	var self = this;
        	cloud.Ajax.request({
                url: "api/resources_tags",
                type: "POST",
                dataType: "JSON",
                data:{
                	resourceIds:ids
                },
                parameters: {
                	verbose:100
                },
                success: function(data){
                	self.resourcesTags = data.result;
                	self._loadData();
                }
            });
        },
        
        /*
         * Add resources tags
         * @author PANJC
         * @param {Array} arrObj {Function} callback
         */
        _addResourcesTags:function(arrObj,callback){
        	var self = this;
        	this.isOperated = true;
        	this.requestCount++;
        	cloud.Ajax.request({
                url: "api/resources_multiple_tags",
                type: "POST",
                dataType: "JSON",
                data:{
                	resourceTags:arrObj
                },
                parameters: {
                	verbose:100
                },
                success: function(data){
                	self.requestCount--;
                	if (self.isVisible == false) {
                		self.fire("onComplete");
                	}
                	if(callback){
                		callback();
                	}
                }
            });
        },
        
        /*
         * Delete resources tags
         * @author PANJC
         * @param {Array} arrObj {Function} callback
         */
        _deleteResourcesTags:function(arrObj,callback){
        	var self = this;
        	this.isOperated = true;
        	this.requestCount++;
        	cloud.Ajax.request({
                url: "api/resources_multiple_tags",
                type: "PUT",
                dataType: "JSON",
                data:{
                	resourceTags:arrObj
                },
                parameters: {
                	verbose:100
                },
                success: function(data){
                	self.requestCount--;
                	if (self.isVisible == false) {
                		self.fire("onComplete");
                	}
                	if(callback){
                		callback();
                	}
                }
            });
        }
    });
	
	return TagManager;
	
});
