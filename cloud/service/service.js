/**
 * Author: Caoshun 2013.1.4
 * Desc:
 * Excemple:
 nothing...
 */
define(function(require) {
    require("cloud/base/cloud");

    var Resources = [{
        id: 1,
        name: "organization",
        name_zh: "机构"
    }, {
        id: 2,
        name: "user",
        name_zh: "用户"
    }, {
        id: 3,
        name: "role",
        name_zh: "角色"
    }, {
        id: 4,
        name: "client",
        name_zh: "客户端"
    }, {
        id: 5,
        name: "gateway",
        name_zh: "网关"
    }, {
        id: 6,
        name: "model",
        name_zh: "机型"
    }, {
        id: 7,
        name: "tag",
        name_zh: "标签"
    }, {
        id: 8,
        name: "contract",
        name_zh: "合同"
    }, {
        id: 9,
        name: "Data",
        name_zh: "实时数据"
    }, {
        id: 10,
        name: "config",
        name_zh: "配置"
    }, {
        id: 11,
        name: "controller",
        name_zh: "控制器"
    }, {
        id: 12,
        name: " ",
        name_zh: "机构"
    }, {
        id: 13,
        name: " ",
        name_zh: "机构"
    }, {
        id: 14,
        name: "site",
        name_zh: "现场"
    }, {
        id: 15,
        name: "firmware",
        name_zh: "固件"
    }, {
        id: 16,
        name: "customer",
        name_zh: "客户"
    }, {
        id: 17,
        name: "document",
        name_zh: "文档"
    }, {
        id: 18,
        name: "",
        name_zh: "任务"
    }, {
        id: 19,
        name: "task",
        name_zh: "任务"
    }, {
        id: 20,
        name: "app",
        name_zh: "开发者应用"
    }, {
        id: 21,
        name: "userClient",
        name_zh: "使用者应用"
    }, {
        id: 22,
        name: "systemFile",
        name_zh: "系统文件"
    }];

    var service = {
        favoriteUrl: "api/favorites",
        updateTagUrl: "api/tags/",
        verifyFavoritesUrl: "api/favorites/mine",

        getViews: function(type, success, error, context) {
            if (!Object.isFunction(error) && Object.isUndefined(context)) {
                context = error;
                error = null;
            }

            return cloud.Ajax.request({
                url: "api/apps",
                type: "get",
                parameters: {
                    verbose: 100,
                    types: type
                },
                success: function(data) {
                    if (success) {
                        success.apply(context || this, arguments);
                    }
                }.bind(this)
            });
        },

        verifyFavorites: function(resourceIds, success, error, context) {
            if (!Object.isFunction(error) && Object.isUndefined(context)) {
                context = error;
                error = null;
            }

            return cloud.Ajax.request({
                url: this.verifyFavoritesUrl,
                type: "post",
                data: {
                    ids: resourceIds
                },
                success: function(data) {
                    // console.log(data);
                    if (success) {
                        success.call(context || this, data);
                    }
                }
            });
        },

        addFavorites: function(resourceId, success, error, context) {
        	var self = this;
            if (!Object.isFunction(error) && Object.isUndefined(context)) {
                context = error;
                error = null;
            }
            if (this.addFavorRequest == null){
            	this.addFavorRequest = cloud.Ajax.request({
                    url: this.favoriteUrl,
                    type: "post",
                    data: {
                        resourceIds: [resourceId]
                    },
                    success: function(data) {
                    	self.addFavorRequest = null;
                        // console.log(data);
                        if (success) {
                            success.call(context || this, data);
                        }
                    },
                    error : function(err){
                    	self.addFavorRequest = null;
                    	error && (error.call(context || this, err));
                    }
                });
            }
            return this.addFavorRequest;
        },

        removeFavorites: function(resourceId, success, error, context) {
        	var self = this;
            if (!Object.isFunction(error) && Object.isUndefined(context)) {
                context = error;
                error = null;
            }

            if (this.delFavorRequest == null){
            	this.delFavorRequest = cloud.Ajax.request({
	                url: this.favoriteUrl + "/" + resourceId,
	                type: "delete",
	                success: function(data) {
	                	self.delFavorRequest = null;
	                    if (success) {
	                        success.call(context || this, data);
	                    }
	                },
                    error : function(err){
                    	self.delFavorRequest = null;
                    	error && (error.call(context || this, err));
                    }
	            });
            }
            return this.delFavorRequest;
        },

        updateTag: function(tag, success, error, context) {
            if (!Object.isFunction(error) && Object.isUndefined(context)) {
                context = error;
                error = null;
            }

            return cloud.Ajax.request({
                url: this.updateTagUrl + tag._id,
                type: "put",
                data: tag,
                parameters: {
                    verbose: 100
                },
                success: function(data) {
                    if (success) {
                        success.call(context || this, data);
                    }
                }
            });
        },
        getResourceType: function(resId) {
            var obj = null;


            $.each(Resources, function(index, res) {
                if (res.id == resId) {
                    obj = res;
                }
            });
            return obj;
        }
    };
    cloud.service = service;
    return service;
});