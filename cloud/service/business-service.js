/**
 * Author: Caoshun 2013.1.4
 * Desc:
 * Excemple:
 nothing...
 */
define(function(require){
	require("cloud/base/cloud");
    var businessService = {
        businessMapping: $H({
            user: {
                resourceType: 2,
                infoModule: "../../applications/system/user/info",
                contentDataUrl: "api2/users",
                deleteAPI: new Template("api2/users/#{id}"),
                inherentTags: [{
                    _id: 1,
                    name: "所有用户",
                    description: "",
                    status: "inherent",
                    /**
                     * Load id array.
                     * @param {Object} callback
                     */
                    loadResourcesData: function(callback){
                        cloud.Ajax.request({
                            url: "api2/users",
                            type: "get",
                            success: function(data){
                                callback(data.result.pluck("_id"));
                            }
                        });
                    }
                }]
            },
            
            device: {
                resourceType: 5,
                infoModuleHtml: "info_device.html",
                contentDataAPIUrl: "api/devices",
                deleteAPI: new Template("api2/sites/#{id}")
            },
            
            site: {
                resourceType: 14,
                infoModuleHtml: "info_site.html",
                contentDataAPIUrl: "api/sites",
                deleteAPI: new Template("api2/sites/#{id}")
            },
            
            tag: {
                resourceType: 7,
                infoModuleHtml: "../system/tag/info",
                contentDataAPIUrl: "api/tags",
                deleteAPI: new Template("api/tags/#{id}")
            },
            
            role: {
                resourceType: 3,
                infoModule: "../system/role/info",
//                contentDataUrl: "api2/roles/list",
                contentDataUrl: "api2/roles",
                deleteAPI: new Template("api2/roles/#{id}"),
                inherentTags: [{
                    _id: 1,
                    name: "所有角色",
                    description: "",
                    status: "inherent",
					selectable: false,
                    /**
                     * Load id array.
                     * @param {Object} callback
                     */
                    loadResourcesData: function(callback){
                        cloud.Ajax.request({
                            url: "api2/roles",
                            type: "Get",
                            success: function(data){
                                callback(data.result.pluck("_id"));
                            }
                        });
                    }
                }]
            
            }
        }),
        
        getContentDataUrl: function(business_type){
            var apiUrl = this.businessMapping.get(business_type).contentDataUrl;
            return apiUrl;
        },
        
        getInherentTags: function(businessType){
            return this.businessMapping.get(businessType).inherentTags || [];
        },
        
        getResourceType: function(businessType){
        	if(!!this.businessMapping.get(businessType)){
        		return this.businessMapping.get(businessType).resourceType;
        	}
        },
        
        getInfoModule: function(business_type){
            return this.businessMapping.get(business_type).infoModule;
        },
        
        getDeleteAPI: function(businessType){
            return this.businessMapping.get(businessType).deleteAPI;
        },
        
        getServiceApi: function(methodName, business_type){
        
        },
		
		getTagURL: function(businessType){
			return "api/" + businessType + "_tags";
		}
    };
	cloud.businessService = businessService;
	return businessService;
});

