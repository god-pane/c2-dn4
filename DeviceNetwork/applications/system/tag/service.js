define(function(require) {
    require("cloud/base/cloud");
    var tagAll = {
        _id: 1,
        name: "所有角色",
        description: "",
        status: "inherent",
        selectable: false,
        favor: true,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(callback, context) {
            cloud.Ajax.request({
                url: "api/tags",
                type: "Get",
                success: function(data) {
                    callback.call(context || this, data.result.pluck("_id"));
                }
            });
        }
    };

    var Service = Class.create({
        inherentTags: [tagAll],
        loadTagUrl: "api/role_tags",
        type: "tag",
        resourceType: 3,
        initialize: function(options) {
            this.map = $H(this.map);
        },

        getTags: function(callback, context) {
            var self = this;
            cloud.Ajax.request({
                url: self.loadTagUrl,
                type: "GET",
                parameters: {
                    verbose: 100
                },
                success: function(data) {
                    var count = 0,
                        total = self.inherentTags.size();
                    self.inherentTags.each(function(tag) {
                        tag.loadResourcesData(function(ids) {
                            count++;
                            tag.total = ids.size();
                            if (count == total) {
                                var tags = [self.inherentTags, data.result].flatten();
                                callback.call(context || self, tags);
                            }
                        });
                    });
                }
            });
        },

        getResourceType: function() {
            return this.resourceType;
        },

        getResource: function(opt, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            this.lastGetResroucesRequest = cloud.Ajax.request({
                url: "api/tags/" + opt,
                type: "GET",
                parameters: {
                    verbose: 100
                },
                success: function(data) {
                    self.lastGetResroucesRequest = null;
                    callback.call(context || this, data);
                }
            });
        },
        getAllResources: function(callback, context){
        	
        	cloud.Ajax.request({
        		url: "api/tags",
            	type: "GET",
            	dataType: "JSON",
            	parameters: {
            		verbose: 100
            	},
                success: function(data){
                	var dataTemp = data;
                	//allow service do some pre_proccess to data
                	//TODO
                	//deviceCount modelCount siteCount siteTplCount docCount customerCount
                	if (data && data.result){
                		var result = data.result;
                		for (var i = 0; i < result.length ; i++){
                			var temp = result[i];
                    		temp.modelCount = 0;
                    		temp.gatewayCount = 0;
                    		temp.machineCount=0;
                    		temp.siteCount = 0;
                    		temp.siteTplCount = 0;
                    		temp.docCount = 0;
                    		temp.customerCount = 0;
                    		dataTemp[i] = temp;
                    	}
                	}
                	
                	callback(dataTemp);
                }
            });
        },
        
        //TODO no batch query
        getTableResourcesById: function(id,callback,context){
        	//var idArr = cloud.util.makeArray(ids);
        	if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
        	cloud.Ajax.request({
                url: "api/tags/" + id,
                parameters: {
                    verbose: 100
                },
                /*data : {
                	resourceIds : idArr
                },*/
                type: "GET",
                success: function(data){
                	self.lastGetResroucesRequest = null;
                	var dataTemp = data;
                	if (data && data.result){
//                		self.lastGetResroucesRequest = null;
                		
                		var tag = data.result;
                		cloud.Ajax.request({
                    		url: "api/resource_tags/stat",
                        	type: "post",
                        	dataType: "JSON",
                        	data : {
                        		resourceTypes : [2, 3, 5, 6,11,14, 16, 17],//resources : device, model, site, customer, document
                        		tagIds : [id]
                        	},
                            success: function(data){
                            	var countArr = data.result
                        		self.lastGetResroucesRequest = null;
                        		
                            	tag.userCount = 0;
                            	tag.roleCount = 0;
                            	tag.gatewayCount=0;
                    			tag.machineCount = 0;
                    			tag.modelCount = 0;
                    			tag.siteCount = 0;
                    			tag.docCount = 0;
                    			tag.customerCount = 0;
                    			if (countArr){
                    				var countIndex = countArr.pluck("tagId").indexOf(tag._id);
                        			if (countIndex != -1){
                        				var countInfo = countArr[countIndex].total;
                        				countInfo.each(function(count){
                        					var resType = count[0];
                        					var resCount = count[1];
                        					switch (resType){
                        					case 2: 
                        						tag.userCount = resCount;
                        					break;
                        					case 3:
                        						tag.roleCount = resCount;
                        					break;
                        					case 5: 
                        						tag.gatewayCount = resCount;
                        					break;
                        					case 6:
                        						tag.modelCount = resCount;
                        					break;
                        					case 11:
                        						tag.machineCount=resCount;
                        					case 14:
                        						tag.siteCount = resCount;
                        					break;
                        					case 16:
                        						tag.customerCount = resCount;
                        					break;
                        					case 17:
                        						tag.docCount = resCount;
                        					break;
                        					}
                        				});
                        			}
                    			}
                            	callback.call(context || this, cloud.util.makeArray(tag));
                            }
                        });
                	}
                	
//                	callback.call(context || this, cloud.util.makeArray(temp));
                }
            });
        },
        
        getTableResources : function(start, limit, callback, context){
        	var self = this;
        	
        	this.lastGetResroucesRequest = cloud.Ajax.request({
        		url: "api/tags",
            	type: "GET",
            	dataType: "JSON",
            	parameters: {
            		cursor : start,
            		limit : limit,
            		verbose: 5
            	},
                success: function(data){
                	if (data.result){
                		var total = data.total;
                		var cursor = data.cursor;
                		var tagsArray = $A(data.result);
                		var tagsIdArray = tagsArray.pluck("_id");
                    	cloud.Ajax.request({
                    		url: "api/resource_tags/stat",
                        	type: "post",
                        	dataType: "JSON",
                        	data : {
                        		resourceTypes : [2, 3, 5, 6,11,14, 16, 17],//resources : device, model, site, customer, document
                        		tagIds : tagsIdArray
                        	},
                            success: function(data){
                            	var countArr = data.result
                        		self.lastGetResroucesRequest = null;
                        		
                        		tagsArray.each(function(tag){
                        			
                        			tag.userCount = 0;
                                	tag.roleCount = 0;
                                	tag.gatewayCount=0;
                        			tag.machineCount = 0;
                        			tag.modelCount = 0;
                        			tag.siteCount = 0;
//                            			tag.siteTplCount = 0;
                        			tag.docCount = 0;
                        			tag.customerCount = 0;
                        			if (countArr){
                        				var countIndex = countArr.pluck("tagId").indexOf(tag._id);
                            			if (countIndex != -1){
                            				var countInfo = countArr[countIndex].total;
                            				countInfo.each(function(count){
                            					var resType = count[0];
                            					var resCount = count[1];
                            					switch (resType){
                            					case 2:
                            						tag.userCount = resCount;
                            					break;
                            					case 3:
                            						tag.roleCount = resCount;
                            					break;
                            					case 5:
                            						tag.gatewayCount=resCount;
                            					break;
                            					case 6:
                            						tag.modelCount = resCount;
                            					break;
                            					case 11:
                            						tag.machineCount=resCount;
                            					break;
                            					case 14:
                            						tag.siteCount = resCount;
                            					break;
                            					case 16:
                            						tag.customerCount = resCount;
                            					break;
                            					case 17:
                            						tag.docCount = resCount;
                            					break;
                            					}
                            				});
                            			}
                        			}
                        		});
                        		var datas={
                        				result : tagsArray,
                                		total : total,
                                		cursor : cursor
                        		}
//                        		datas.result = tagsArray;
//                        		datas.total = total;
//                        		datas.cursor = cursor;
                            	callback.call(context || this, datas);
                            }
                        });
                	}
                }
            });
        	/*this.lastGetResroucesRequest = cloud.Ajax.request({
        		url: "api/resource_tags/stat",
            	type: "post",
            	dataType: "JSON",
            	parameters: {
//            		verbose: 100
            	},
            	data : {
            		resourceTypes : [5,14],
            		tagIds : ["51BA8B8A421AA90D3200048B", "51BAB950421AA90D32000550"]
            	},
                success: function(data){
                	var dataTemp = data;
//                	console.log(arguments, "test service")
                	if (data && data.result){
                		self.lastGetResroucesRequest = null;
                		
                		var result = data.result;
                		for (var i = 0; i < result.length ; i++){
                			var temp = result[i];
                    		temp.deviceCount = 0;
                    		temp.modelCount = 0;
                    		temp.deviceCount = 0;
                    		temp.siteCount = 0;
                    		temp.siteTplCount = 0;
                    		temp.docCount = 0;
                    		temp.customerCount = 0;
                    		dataTemp[i] = temp;
                    	}
                	}
                	
                	callback.call(context || this, dataTemp.result);
                }
            });*/
        },
        
        getTotal : function(callback, context){
        	cloud.Ajax.request({
        		url: "api/tags",
            	type: "GET",
            	dataType: "JSON",
            	parameters: {
            		limit : 1,
            		verbose: 1
            	},
            	success : function(data){
            		callback.call(context || this, data.total)
            	}
        	});
        },
        
        deleteResources : function(ids, callback, context){
        	var self = this;
            ids = cloud.util.makeArray(ids);
            ids.each(function(id){
            	cloud.Ajax.request({
                    url: "api/tags/" + id,
                    type: "DELETE",
                    success: function(){
//                        console.log("delete " + id + "success");
                    }
                });
            });
            
            callback.call(context || this);
        },
        
        getTagInfo : function(){
        	this[this.type].getTagInfo();
        },
        getAllByType:function(type, args){
        	
        }
    });

    return new Service();
});