/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved.
 */
define(function(require) {
    var service = require("cloud/service/service");
    var defaultTags = require("../common/default-tags");
    
    var TagOverviewCtrl = Class.create(cloud.Controller, {
        
        $prepare : function(){
            
            this.loadTags();
        },
        
        $control: function(context, view){
            var self = this;
            context.$on({
                "tagoverview.load" : this.loadTags,
                scope : this
            });
        },
        
        loadTags : function(data){
            var self = this;
            var context = this.context;
            var view = this.view;
            var reloadParam = null;
            if (data && data.reloadParam) {
                reloadParam = data.reloadParam;
            }
            if (data && data.resType){
                context.resType = data.resType;
            };
            Model.tag({
            	method:"query_type",
            	resourceType : context.resType, 
                param : {
                    verbose : 100
                },
                success : function(data){
                    var tags = data.result;
                    tags = self.mixDefaultTags(context.resType, tags)
                    view.renderTags(tags, reloadParam);
                }
            })
        },
        
        mixDefaultTags : function(resType, tags){
            var resTypeStr = service.getResourceType(resType).name;
            /*require([resTypeStr + "-default-tags"], function(defaultTags){
                
            });*/
            
            var defaultTagsOfRes = defaultTags[resTypeStr];
            
            return [defaultTagsOfRes, tags].flatten();
        }
    });

    return TagOverviewCtrl;
});