/**
 * @author zhang
 */
define(function(require){
	require("cloud/base/cloud");
	var resourceType = 1;
	var allOgan = {
		_id:1,
		name:"所有机构",//locale.get({lang:""}),
		description:"",
		status:"inherent",
		selectable: false,
		loadResourcesData:function(start,limit,callback,context){
			cloud.Ajax.request({
				url:"api2/organizations",
				type:"get",
				parameters:{
					limit : limit,
					cursor: start
				},
				success: function(data){
					data.result = data.result.pluck("_id")
					allOgan.total = data.total;
					callback.call(context || this, data);
				}
			});
		}
	};
	
	var Service = Class.create({
		inherentTags:[allOgan],
		loadTagUrl:"api/organization_tags",
		type:"oganization",
		resourceType: resourceType,
		initialize:function(){},
		getTags:function(callback, context){
			 var self = this;
	            cloud.Ajax.request({
	                url: self.loadTagUrl,
	                type: "GET",
	                parameters: {
	                    verbose: 100
	                },
	                success: function(data) {
	                	var tags = [self.inherentTags, data.result].flatten();
	                    callback.call(context || self, tags);
	                }
	            });
		},
		getResourceType: function() {
			return this.resourceType;
	    },
	    getResourcesIds: function(start, limit, callback, context) {
            cloud.Ajax.request({
                url: "api2/organizations",
                type: "get",
                success: function(data) {
                    callback.call(context || this, data.result.pluck("_id"));
                }
            });
        },
        getTableResourcesById:function(ids, callback,context){
        	if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
        	var self = this;
        	ids = cloud.util.makeArray(ids);
        	
        	cloud.Ajax.request({
    			url:"api2/organizations/list",
    			type:"post",
    			parameters:{
    				verbose:100,
    				limit:0
    			},
    			data:{
    				resourceIds:ids
    			},
    			success:function(data){
    				self.lastGetResroucesRequest = null;
                    callback.call(context || self, data.result);
    			}
    		});
        },
	    
	    getTableResources:function(start , limit ,callback ,context){
	    	if (this.lastGetResroucesRequest) {
                this.lastGetResroucesRequest.abort();
            }
	    	var self = this;
	    	this.getResourcesIds(start, limit, function(ids){
	    		var total = ids.total;
            	var cursor = ids.cursor;
	    		if (ids.result) {
					ids = ids.result;
				}
	    		cloud.Ajax.request({
	    			url:"api2/organizations/list",
	    			type:"post",
	    			parameters:{
	    				verbose:100,
	    				limit:0
	    			},
	    			data:{
	    				resourceIds:ids
	    			},
	    			success:function(data){
	    				data.total = total;
                    	data.cursor = cursor;
	    				self.lastGetResroucesRequest = null;
	                    callback.call(context || self, data);
	    			}
	    		});
	    	});
	    }
		
	});
	return new Service();
});