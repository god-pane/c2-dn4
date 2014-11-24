/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 */
define(function(require) {
    
    var allUser = {
        _id: 1,
        name: locale.get({lang:"all_user"}),
        description: "",
        params : {
        },
        status: "inherent",
        selectable: false,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start, limit,callback, context) {
            cloud.Ajax.request({
                url: "api2/users",
                type: "get",
                parameters: {
                    limit: limit,
                    cursor: start
//                            verbose: 1
                },
                success: function(data) {
                    data.result = data.result.pluck("_id");
                    allUser.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };

    var noneTagUser = {
        _id: 2,
        name: locale.get("untagged_user"),
        description: "",
        params : {
            tagId : "none"
        },
        status: "inherent",
        selectable: false,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start, limit,callback, context) {
            cloud.Ajax.request({
                url: "api/tags/none/resources",
                type: "get",
                parameters: {
                    limit: limit,
                    cursor: start,
                    type: 2
                },
                success: function(data) {
                    noneTagUser.total = data.total;
                    callback.call(context || this, data);
                }
            });
        }
    };
        
    var adminManager = {
        _id: 3,
        name: locale.get("organization_manager"),
        description: "",
        status: "inherent",
        params : {
            roleName : "admin"
        },
        selectable: false,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start, limit,callback, context) {
            cloud.Ajax.request({
              url: "api2/roles",
              type: "get",
              parameters: {
                limit:1,
                name:"admin"
              },
              success: function(data) {
                  cloud.Ajax.request({
                    url: "api2/users",
                    type: "get",
                    parameters: {
                        verbose:10,
                        role_ids:data["result"][0]["_id"],
                        limit: limit,
                        cursor: start,
                        type: 2
                    },
                    success: function(data) {
                        data.result = data.result.pluck("_id");
                        adminManager.total = data.total;
                        callback.call(context || this, data);
                    }
                });
              }
          });
        }
    };
    
    var deviceManager = {
        _id: 4,
        name: locale.get("device_manager"),
        description: "",
        status: "inherent",
        params : {
            roleName : "DeviceManager"
        },
        selectable: false,
        /**
         * Load id array.
         * @param {Object} callback
         */
        loadResourcesData: function(start, limit,callback, context) {
            cloud.Ajax.request({
              url: "api2/roles",
              type: "get",
              parameters: {
                limit:1,
                name:"DeviceManager"
              },
              success: function(data) {
                  cloud.Ajax.request({
                    url: "api2/users",
                    type: "get",
                    parameters: {
                        verbose:10,
                        role_ids:data["result"][0]["_id"],
                        limit: limit,
                        cursor: start,
                        type: 2
                    },
                    success: function(data) {
                        data.result = data.result.pluck("_id");
                        deviceManager.total = data.total;
                        callback.call(context || this, data);
                    }
                });
              }
          });
        }
    };
    
    return  [allUser, noneTagUser,adminManager,deviceManager];
});