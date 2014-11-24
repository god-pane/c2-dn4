define(function(require) {
    require("cloud/base/cloud");

    // 资源类型，见API
    var resourceType = 14;

    // define inherent tags start

    // 标签-所有现场
    var allSite = {
        _id : 1,
        name : locale.get({
            lang : "all_site"
        }), 
        description : "",
        status : "inherent",
        selectable : false,
        favor : false,
        /**
         * Load id array.
         * 
         * @param {Object}
         *        callback
         */
        loadResourcesData : function(start, limit, callback, context) {
            cloud.Ajax.request({
                url : "api/sites",
                type : "get",
                parameters : {
                    limit : limit,
                    cursor : start,
                    verbose : 1
                },
                success : function(data) {
                    data.result = data.result.pluck("_id");
                    allSite.total = data.total;
                    callback.call(context || this, data);
                    // callback.call(context || this, data.result.pluck("_id"));
                }
            });
        },
        loadAllSiteData : function(siteName,start, limit, callback, context) {
            cloud.Ajax.request({
                url : "api/sites",
                type : "get",
                parameters : {
                    limit : limit,
                    cursor : start,
                    verbose : 1,
                    name:siteName
                },
                success : function(data) {
                    data.result = data.result.pluck("_id");
                    allSite.total = data.total;
                    callback.call(context || this, data);
                    // callback.call(context || this, data.result.pluck("_id"));
                }
            });
        }
    };

    // 标签-无标签现场
    var noneTagSite = {
        _id : 2,
        name : locale.get({
            lang : "untagged_site"
        }),
        description : "",
        status : "inherent",
        selectable : false,
        favor : false,
        /**
         * Load id array.
         * 
         * @param {Object}
         *        callback
         */
        loadResourcesData : function(start, limit, callback, context) {
            cloud.Ajax.request({
                url : "api/tags/none/resources",
                type : "get",
                parameters : {
                    limit : limit,
                    cursor : start,
                    type : resourceType
                },
                success : function(data) {
                    noneTagSite.total = data.total;
                    // console.log("data",data);
                    // callback.call(context || this, data.result);
                    callback.call(context || this, data);
                }
            });
        }
    };
    
    //标签-在线现场
    var tagOnline = {
        _id : 3,
        name : locale.get("online_site"),
        description : "online",
        status : "inherent",
        selectable : false,
        favor : false,
        /**
         * Load id array.
         * 
         * @param {Object}
         *        callback
         */
        loadResourcesData : function(start, limit, callback, context) {
            cloud.Ajax.request({
                url : "api/sites",
                type : "get",
                parameters : {
                    limit : limit,
                    cursor : start,
                    verbose : 1,
                    online : 1
                },
                success : function(data) {
                    data.result = data.result.pluck("_id");
                    tagOnline.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };
    
    //标签-离线现场
    var tagOffline = {
        _id : 4,
        name : locale.get("offline_site"),
        description : "offline",
        status : "inherent",
        selectable : false,
        favor : false,
        /**
         * Load id array.
         * 
         * @param {Object}
         *        callback
         */
        loadResourcesData : function(start, limit, callback, context) {
            cloud.Ajax.request({
                url : "api/sites",
                type : "get",
                parameters : {
                    limit : limit,
                    cursor : start,
                    verbose : 1,
                    online : 0
                },
                success : function(data) {
                    data.result = data.result.pluck("_id");
                    tagOffline.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };

    // define inherent tags start

    var Service = Class.create({
        netTags : [ tagOnline, tagOffline ],//在关状态标签
        inherentTags : [ allSite, noneTagSite, tagOnline, tagOffline ],//内置标签
        loadTagUrl : "api/site_tags",//获取现场标签的URL
        type : "site",
        resourceType : 14,
        initialize : function() {
            this.map = $H(this.map);
        },
        getNetTags : function(callback, context) {
            var self = this;
            var tags = [ self.netTags ].flatten();
            callback.call(context || self, tags);
            /*
             * var count = 0, total = self.netTags.size();
             * this.netTags.each(function(tag) { tag.loadResourcesData(0, 1,
             * function(_data) { count++; tag.total = _data.total; if (count ===
             * total) { var tags = [self.netTags].flatten();
             * callback.call(context || self, tags); } }); });
             */
        },

        getTags : function(callback, context) {
            var self = this;
            cloud.Ajax.request({
                url : self.loadTagUrl,
                type : "GET",
                parameters : {
                    verbose : 100
                },
                success : function(data) {
                    
                    //将请求到的tags和预定义的固有tags混合组装到同一个数组
                    var tags = [ self.inherentTags, data.result ].flatten();
                    callback.call(context || self, tags);
                    /*
                     * var count = 0, total = self.inherentTags.size();
                     * self.inherentTags.each(function(tag) {
                     * tag.loadResourcesData(0, 1, function(_data) { count++;
                     * tag.total = _data.total; if (count === total) { var tags =
                     * [self.inherentTags, data.result].flatten();
                     * callback.call(context || self, tags); } }); });
                     */
                }
            });
        },

        getResourceType : function() {
            return this.resourceType;
        },

        getResourcesIds : function(start, limit, callback, context) {
            cloud.Ajax.request({
                url : "api/sites",
                type : "get",
                success : function(data) {
                    callback.call(context || this, data.result.pluck("_id"));
                }
            });
        },
        
        /**
         * 用于content-table请求数据
         */
        getTableResourcesById : function(ids, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;
            ids = cloud.util.makeArray(ids);
            this.lastGetResroucesRequest = cloud.Ajax.request({
                url : "api/sites/list",
                type : "post",
                parameters : {
                    verbose : 100,
                    limit : 0
                },
                data : {
                    resourceIds : ids
                },
                success : function(data) {
                    self.lastGetResroucesRequest = null;
                    callback.call(context || this, data.result);
                }
            });
        },
        getSitelistByName:function(name,start, limit, callback,context) {
          	 cloud.Ajax.request({
   	                url : "api/sites",
   	                type : "get",
   	                parameters:{
   	                	name:name,
   	                	cursor:start,
   	                	limit:limit,
   	                	verbose:100
   	                },
   	                success : function(data) {
   	                    callback.call(context || this, data);
   	                }
   	            });
   		},
        /**
         * 用于content-table请求数据
         */
        getTableResources : function(start, limit, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;

            this.getResourcesIds(start, limit, function(ids) {
            	var total = ids.total;
            	var cursor = ids.cursor;
                if (ids.result) {
                    ids = ids.result;
                }
                this.lastGetResroucesRequest = cloud.Ajax.request({
                    url : "api/sites/list",
                    type : "post",
                    parameters : {
                        verbose : 100,
                        limit : limit
                    },
                    data : {
                        resourceIds : ids
                    },
                    success : function(data) {
                    	data.total = total;
                    	data.cursor = cursor;
                        self.lastGetResroucesRequest = null;
                        callback.call(context || this, data);
                    }
                });
            }, this);
        },
        
        /**
         * 用于gis视图请求数据
         */
        getGisResources : function(start, limit, params, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
            var self = this;

            params = (params) ? params : {};

            cloud.util.defaults(params, {
                verbose : 100,
                limit : limit
            });

            this.getResourcesIds(start, limit, function(ids) {
                if (ids.result) {
                    ids = ids.result;
                }
                this.lastGetResroucesRequest = cloud.Ajax.request({
                    url : "api/sites/list",
                    type : "post",
                    parameters : params,
                    data : {
                        resourceIds : ids
                    },
                    success : function(data) {
                        self.lastGetResroucesRequest = null;
                        callback.call(context || this, data.result);
                    }
                });
            }, this);
        },
        
        /**
         * 用于overview视图请求数据
         */
        getOverviewResourcesById : function(ids, callback, context) {
            if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }

            var self = this;
            var statusMap = new Hash({
                0 : "stop",
                1 : "running",
                2 : "debug"
            });

            this.lastGetResroucesRequest = cloud.Ajax.request({
                url : "api/sites/overview",
                type : "post",
                parameters : {
                    verbose : 100,
                    limit : 0
                },
                data : {
                    resourceIds : ids
                },
                success : function(data) {
                    data.result.each(function(one) {
                        one.notifications = one.alarmCount;
                        one.favor = one.isMyFavorite === 1;
                        one.status = statusMap.get(one.businessState);

//                        one.description = locale.get({
//                            lang : "device_total+:"
//                        }) + one.deviceCount;
                    });
                    self.lastGetResroucesRequest = null;
                    callback.call(context || this, data.result);
                }
            });
        },
        
        /**
         * 用于overview视图请求数据
         */
        getOverviewResources : function(start, limit, callback, context) {
            var statusMap = new Hash({
                0 : "stop",
                1 : "running",
                2 : "debug"
            });

            this.getResourcesIds(start, limit, function(totalIds) {
                
                var total = totalIds.total;
                var cursor = totalIds.cursor;
                if (totalIds.result) {
                    totalIds = totalIds.result;
                }
                // var idArrays = totalIds.partition(function(value, index) {
                // return index >= start && index < start + limit;
                // });

                cloud.Ajax.request({
                    url : "api/sites/overview",
                    type : "post",
                    parameters : {
                        verbose : 100,
                        limit : 0
                    },
                    data : {
                        resourceIds : totalIds
                    },
                    success : function(data) {
                        // console.log(data, "site overview api")
                        data.result.each(function(one) {
                            one.notifications = one.alarmCount;
                            one.favor = one.isMyFavorite === 1;
                            one.status = statusMap.get(one.businessState);
//                            one.description = locale.get({
//                                lang : "device_total+:"
//                            }) + one.deviceCount;
                        });
                        data.total = total;
                        data.cursor = cursor;
                        callback.call(context || this, data);
                    }
                });
            }, this);

        },
        
        /**
         * 删除现场，用于talbe和overview视图
         */
        deleteResources : function(ids, callback, context, isDelAllDev) {
            ids = cloud.util.makeArray(ids);
            var count = ids.length;
            var res = new Array();
            // ids = ids.without(ids[0])
            // console.log(ids, "ids to del");
            var deleteAll = 0;
            if (isDelAllDev) {
                deleteAll = 1;
            }
            ids.each(function(id, index) {
                cloud.Ajax.request({
                    url : "api/sites/" + id,
                    type : "delete",
                    parameters : {
                        delete_all : deleteAll
                    },
                    error : function(data) {
                        count--;
                    },
                    success : function(data) {
                        // console.log("delete"+id+"success");
                        if (data.result && data.result.id) {
                            res.push(data.result.id);
                            count--;
                            // console.log(data.result.id, "del suc");
                            // callback.call(context || this,
                            // cloud.util.makeArray(data.result.id));
                            if (count === 0) {
                                callback.call(context || this, res);
                            }
                        }
                    }
                });
            });
        },
        
        getScadaBySiteId:function(id,callback,context){
        	cloud.Ajax.request({
        		url:"api/sites/"+id+"/scada",
        		type:"get",
        		success:function(data){
        			callback.call(context || this,data,id);
        		}
        	});
        },
        
        onScadaOk:function(id,scadaData,callback,context){
        	var self = this;
        	this.getScadaBySiteId(id, function(data){
        		if(data.result){
        			if(scadaData.name){
        				delete scadaData.name
        			}
        			self.updateScada(id, scadaData, callback);
        		}else{
        			
        			self.addScada(id, scadaData, callback);
        		}
        	});
        },
        
        addScada:function(id,scadaData,callback,context){
        	cloud.Ajax.request({
                url : "api/sites/"+id+"/scada",
                type : "POST",
                data:scadaData,
                success : function(data) {
                	  callback.call(context || this,data.result);
                }
            });
        },
        
        updateScada:function(id,scadaData,callback,context){
        	cloud.Ajax.request({
                url : "api/sites/"+id+"/scada",
                type : "PUT",
                data:scadaData,
                success : function(data) {
                	  callback.call(context || this,data.result);
                }
            });
        },
        
        deleteScada:function(id,callback,context){
        	cloud.Ajax.request({
		    	  url : "api/sites/"+id+"/scada",
		    	  type : "DELETE",
		    	  success : function(data) {
                	  callback.call(context || this,data.result);
                  }
            });
        },
        
		getDeviceList: function(id, callback,context) {
			cloud.Ajax.request({
				url:"api/devices",
				type:"get",
				parameters:{
					limit:0,
					site_id:id,
					verbose:100
				},
				success:function(data){
					callback.call(context || this,data);
				}
			});
		},
		
		getMachinesList: function(id, callback,context) {
			cloud.Ajax.request({
				url:"api/machines",
				type:"get",
				parameters:{
					limit:0,
					site_id:id,
					verbose:100
				},
				success:function(data){
					callback.call(context || this,data);
				}
			});
		},
		
		getScadaVarListData:function(id,api,callback,context){
			cloud.Ajax.request({
				url:"api/"+api+"/"+id+"/rt_data",
				type : "GET",
				parameters:{
					limit:0
				},
				success:function(data){
					callback.call(context || this,data);
				}
			});
		},
		
		addScadaComponents:function(data,callback,context){
			cloud.Ajax.request({
				url:"api/scada_components",
				type : "POST",
				data : {
					content:data
				},
				parameters:{
					limit:0
				},
				success:function(data){
					callback.call(context || this,data);
				}
			});
		},
		
		getScadaComponents:function(callback,context){
			cloud.Ajax.request({
				url:"api/scada_components",
				type : "GET",
				parameters:{
					limit:0
				},
				success:function(data){
					callback.call(context || this,data);
				}
			});
		},
		
		 //获取全局监控画面列表
   		getGlobalScadaInfo: function(start,limit, callback, context) {
            cloud.Ajax.request({
                url : "api/scada_views",
                type : "get",
                parameters : {
                    cursor : start,
                    limit:0,
                    verbose : 1
                },
                success : function(data) {
                	callback.call(context || this, data);
                }
            });
   		},
   		getGlobalScadaInfoPage: function(start,limit, callback, context) {
   			cloud.Ajax.request({
                url : "api/scada_views",
                type : "get",
                parameters : {
                    cursor : start,
                    limit:limit,
                    verbose : 1
                },
                success : function(data) {
                    callback.call(context || this, data);
                }
            });
   		},
   		//获取指定的监控画面
   		getGlobalScadaInfoByScadaId:function(id,callback,context){
        	cloud.Ajax.request({
        		url:"api/scada_views/"+id,
        		type:"get",
        		success:function(data){
        			callback.call(context || this,data);
        		}
        	});
   		},
   		//创建全局监控画面
   		addGlobalScada:function(scadaData,callback,context){
   			cloud.Ajax.request({
                url : "api/scada_views",
                type : "POST",
                data:scadaData,
                success : function(data) {
                	  callback.call(context || this,data);
                }
            });
   		},
   	   updateGlobalScada:function(id,updateScada,callback,context){
   			cloud.Ajax.request({
                url : "api/scada_views/"+id,
                type : "PUT",
                data : updateScada,
                success : function(data) {
                	  callback.call(context || this,data);
                }
            });
   		},
   	   deleteGlobalScada:function(id,callback,context){
     	    cloud.Ajax.request({
     	    	  url:"api/scada_views/"+id,
		    	  type : "DELETE",
		    	  success : function(data) {
             	      callback.call(context || this,data);
               }
            });
       },
       getAllSite : function(start, limit, callback, context) {
       	if (this.lastGetResroucesRequest) {
               this.lastGetResroucesRequest.abort();
           }
           var self = this;

           this.getResourcesIds(start, 0, function(ids) {
           	var total = ids.total;
           	var cursor = ids.cursor;
               if (ids.result) {
                   ids = ids.result;
               }
               this.lastGetResroucesRequest = cloud.Ajax.request({
                   url : "api/sites/list",
                   type : "post",
                   parameters : {
                       verbose : 100,
                       limit : 0
                   },
                   data : {
                       resourceIds : ids
                   },
                   success : function(data) {
//                   	data.total = total;
//                   	data.cursor = cursor;
                       self.lastGetResroucesRequest = null;
                       callback.call(context || this, data);
                   }
               });
           }, this);
       },
       
       getScadaVarData:function(devices,callback,context){
			cloud.Ajax.request({
				url:"api/rt_data",
				type : "POST",
				data:devices,
				parameters:{
					limit:0
				},
				success:function(data){
					callback.call(context || this,data);
				}
			});
		},
		
		getTransformDevice:function(aliasJson,callback,context){
			cloud.Ajax.request({
				url:"api/sites/list/device_alias",
				type : "POST",
				data:aliasJson,
				parameters:{
					limit:0
				},
				success:function(data){
					callback.call(context || this,data);
				}
			});
		},
		
		deleteScadaComponents:function(id,callback,context){
	     	    cloud.Ajax.request({
	     	    	  url:"api/scada_components/"+id,
			    	  type : "DELETE",
			    	  success : function(data) {
	             	      callback.call(context || this,data);
	               }
	            });
	    }
    });

    return new Service();
});