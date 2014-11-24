define(function(require){
	require("cloud/base/cloud");
	require("cloud/lib/plugin/jquery.layout");
	var Tag = require("./tag-group");
	var Content = require("./content");
	var Group = Class.create(cloud.Component,{
		initialize:function($super,options){
			if((permission.getInfo())["roleType"] <= 51){
				this.element = $("#user-content");
				this.elements = {
						tag: {
							id: "group-tag"
						},
						content: {
							id: "group-content"
						}
				};
				this._render();
			}
			
		},
		_render:function(){
			this._drawLayout();
			this._renderTag();
		},
		_drawLayout:function(){
			this.element.empty();
			this.element.append($("<div>").attr("id",this.elements.tag.id));
			this.element.append($("<div>").attr("id",this.elements.content.id));
			this.layout = this.element.layout({
	                defaults: {
	                    paneClass: "pane",
	                    togglerClass: "cloud-layout-toggler",
	                    resizerClass: "cloud-layout-resizer",
	                    spacing_open: 1,
	                    spacing_closed: 1,
	                    togglerLength_closed: 50,
						togglerTip_open:locale.get({lang:"close"}),
	                    togglerTip_closed:locale.get({lang:"open"}),  
	                    resizable: false,
	                    slidable: false
	                },
	                west: {
	                    paneSelector: "#" + this.elements.tag.id,
	                    size: 187
	                },
	                center: {
	                    paneSelector: "#" + this.elements.content.id
	                }
	        });
		},
		_renderTag:function(){
			var self = this;
			var tag = new Tag({
				selector:"#" + this.elements.tag.id,
				context:this,
				events:{
					click:function(_id){
						self._renderContent(_id);
					}
				}
			});
		},
		_renderContent:function(_id){
			var self = this;
			this.content = null;
			var content = new Content({
				id:this.elements.content.id,
				_id:_id,
				context:this,
				events:{
					beforeLoad:function(){
						cloud.util.mask("#user-content");
					},
					afterLoad:function(){
						cloud.util.unmask("#user-content");
					}
				}
			});
		},
        destroy: function(){
            if(this.layout){
                if(this.layout.destroy){
                    this.layout.destroy();
                }else{
                    this.layout = null;
                }
            }
            this.element.empty();
        }
	});
	return Group;
});