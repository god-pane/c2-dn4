define(function(require){
    var cloud = require("cloud/base/cloud");
    require("cloud/lib/plugin/jquery-ui");
    require("cloud/resources/css/jquery-ui.css");
    var Button = require("cloud/components/button");
    var Toolbar = require("cloud/components/toolbar");
    var NoticeBar = Class.create(cloud.Component, {
        initialize: function($super, options){
            $super(options);
			this.service=options.service;
			this.canvasData = options.canvasData;
			this.siteTable=options.siteTable;
			this._render();
        },
        _render: function(){
        	this.draw();
        	this._renderBtn();
        },
    	draw:function(){
    		  var self = this;
              var $htmls = $(+"<div></div>" +
              "<div id='search-bar' style='width:auto;margin-top:3px'>" +
              "<label style='margin:auto 10px auto 10px'>" + locale.get({lang:"site_name"}) + "</label>" +
              "<input style='width:120px' type='text'  id='sitename' />"  +
              "</div>");
              this.element.append($htmls);
		},
		
        _renderBtn: function(){
            var self = this;
            var queryBtn = new Button({
                text: locale.get({lang:"query"}),
                container: $("#search-bar"),
                events: {
                    click: function(){
                    	var siteName=$("#sitename").val();
                        self.fire("query", siteName);
                    }
                }
            });
            var saveBtn = new Button({
                text: locale.get({lang:"copy"}),
                container: $("#search-bar"),
                events: {
                    click: function(){
                    	if(self.options.optionsT){//复制到其他现场
                    		 var selectedResouces = self.getSelectedResources();
                    		 if (selectedResouces.length === 0) {
 	 							dialog.render({lang:"please_select_at_least_one_config_item"});
 	 						}else{
 	 							self.fire("copyToOther",selectedResouces);
 	 						}
                    		
                    	}else{
                    		 var selectedResouces = self.getSelectedResources();
                    		 if (selectedResouces.length === 0) {
 	 							dialog.render({lang:"please_select_at_least_one_config_item"});
 	 						}else if(selectedResouces.length > 1){
	 							dialog.render({lang:"please_select_at_only_one_config_item"});
	 						}else{
 	 							self.fire("copyFromOther",selectedResouces);
 	 						}
                    		 
                    	}//从其他现场复制
                    }
                }
            });
            $("#search-bar a").css({
                margin: "auto 10px auto 10px"
            });
            
        },
        
        getSelectedResources:function(){
        	var self = this;
        	var selectedRes = $A();
        	self.siteTable && self.siteTable.getSelectedRows().each(function(row){
        		selectedRes.push(self.siteTable.getData(row));
        	});
        	return selectedRes;
        }
        
    });
    
    return NoticeBar;
    
});
