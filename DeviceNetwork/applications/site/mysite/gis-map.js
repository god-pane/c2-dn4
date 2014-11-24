define(function(require) {
    var Toolbar = require("cloud/components/toolbar");
    var Button = require("cloud/components/button");
    var service = require("./service");
     var InfoModule = require("./info");
    
//    require("../../../lib/plugins/leaflet.draw-src");
//    require("../../../lib/plugins/leaflet-Layer.Deferred");
    require("cloud/components/Lmap");
    
    var iconBaseUrl = "cloud/lib/plugin/leaflet/images/"
    var myIcon = L.icon({
        iconUrl: require.toUrl("cloud/resources/images/ui-gis-normal1.png"),
//            iconSize: [38, 95],
        iconAnchor: [10, 36],
        popupAnchor: [0, -36],
        shadowUrl: require.toUrl(iconBaseUrl + 'marker-shadow.png'),//require.toUrl("cloud/resources/images/shadow.png"),
//            shadowRetinaUrl: require.toUrl(iconBaseUrl + 'my-icon-shadow@2x.png'),
//            shadowSize: [68, 95],
        shadowAnchor: [13, 43]
    });
    
    var MyControl = L.Control.extend({

        initialize : function(el, options) {
            if ((el instanceof jQuery) && (el.length > 0)) {
                el = el[0]
            }
            this._cloud_el = el;
            L.Util.setOptions(this, options);
        },

        onAdd : function(map) {
            var container = L.DomUtil.create('div', 'my-custom-control');

            // ... initialize other DOM elements, add listeners, etc.

            return this._cloud_el;
        }
    });
    
    L.Marker.include({
        setTitle : function(title){
            this._icon.title= title;
        }
    });
    
    var INFO_POPUP_CTNT = $("<div>").addClass("gis-map-popup");
    var INFO_POPUP_CFG = {
            minWidth : 230,
//            autoPan : true,
//            autoPanPadding : new L.Point(500, 500)//TODO
        }
    
    var GisMap = Class.create(cloud.Component, {
        initialize : function($super, options) {
            var self = this;
            this.service = service;
            this.moduleName = "site-gis-map";
            $super(options);
            
            markers = this.markers = $H();
            
            this.initMap();
//            this.addControls();

            locale.render({
                element : this.element
            });
        },

        initMap : function() {
        	var self = this;
            var map = this.map = L.map(this.element[0]).setView(
                    [ 39.926588, 116.407013 ], 8);
            window.map = map;
            //updata by zyl
            var tiles = cloud.Lmap.getTiles(map);
            L.control.layers(
            		{
            			"ArcGisChina":tiles.arcChina,
            			"Google":tiles.google,
            			'ArcGisWorld':tiles.arcWorld
            		},{}
            	).addTo(map);
            
            map.on("baselayerchange",function(layer){
            	var maxzoom = {};
            	switch(layer.name){
            	case "Google":
            		maxzoom = tiles.google.maxZoom;
            		break;
            	case "ArcGisChina":
            		maxzoom = tiles.arcChina.maxZoom;
            		break;
            	case "ArcGisWorld":
            		maxzoom = tiles.arcWorld.maxZoom;
            		break;
            	}
            	var currzoom = map.getZoom();
            	if(maxzoom <currzoom){
            		map.setZoom(maxzoom);
            	}
            	
            	cloud.Lmap.setMap(layer.name);
//            	cloud.storage.sessionStorage("currentMap", layer.name);
            }).on("mousedown", function(e){
                self.element.trigger("mousedown", [e])
            });
            
            
            
            var markerGroup = this.markerGroup = new L.FeatureGroup();
            map.addLayer(markerGroup);
            var drawControl = new L.Control.Draw({
                draw: {
                    polyline: false,
                    polygon: false,
                    circle: false, // Turns off this drawing tool
                    rectangle: false,
                    /*marker: {
                    }*/
                },
                edit: {
                    featureGroup: markerGroup
                }
            });

            this.drawControl = drawControl;

            map.addControl(drawControl);
            
            this.bindMapEvts()
        },

        cancleDelete:function(){
            var deleltebtn = $H(this.drawControl._toolbars).values()[1];
            if(deleltebtn._activeMode){
                deleltebtn._activeMode.handler.revertLayers();
            }
        },
        
        bindMapEvts : function(){
            var self = this;
            var markerGroup = this.markerGroup;
            this.map.on('draw:editstart', function (e) {
//                console.log("draw:editstart", e);
            }).on('draw:editestop', function (e) {
//                console.log("draw:drawstop", e)
            }).on('draw:created', function (e) {
//                console.log("draw:created", e)
                var type = e.layerType,
                    layerItem = e.layer;

                if (type === 'marker') {
                    var marker = layerItem;
//                    var info = null
                    self.procMarker(marker, null);
                    markerGroup.addLayer(marker);
                    marker.openPopup();
                }

            }).on('draw:edited', function (e) {
                var layers = e.layers.getLayers();
                $A(layers).each(function(marker){
                    var siteId = marker.siteId;
                    var location = marker.newLoc;
                    self.updateLocation(siteId, location);
                });
    
            }).on('draw:deleted', function (e) {
                var layers = e.layers.getLayers();
                
                self.deleteSites(layers);
                
                /*$A(layers).each(function(marker){
                    var siteId = marker.siteId;
                    self.deleteLocation(siteId);
                });*/
            }).on('draw:editstart', function (e) {
                    console.log("draw:editstart",e)
                    markerGroup.eachLayer(function(marker){
                        marker.closePopup();
                    });

                    self.markers.each(function(marker){
                        var mak = marker[1];
                        if(mak.data.autoNavi == 1){
                            self.toggleMarker(mak,false);
                            mak.dragging.disable();
                        }
                    })

                    if (e.handler == "remove"){
                        self.states = "REMOVING";
                    }else if(e.handler == "edit"){
                        self.states = "EDITING"
                    }
            }).on('draw:editstop', function (e) {
//                    console.log("draw:editstop",e)
                    markerGroup.eachLayer(function(marker){
                        marker.closePopup();
                    });

                    self.markers.each(function(marker){
                        var mak = marker[1];
                        if(mak.data.autoNavi == 1){
                            self.toggleMarker(mak,true);
                            mak.dragging.disable();
                        }
                    })

//                if (e.handler == "remove"){
                    self.states = null;
//                }
            })     
        },

//        enableMarker:function(marker){
//            var toolbar  = $H(this.drawControl._toolbars).find(function(toolbar){
//                if(toolbar.value._modes.edit){
//                    return toolbar[1]
//                }
//            });
//            if(L.DomUtil.hasClass(marker._icon, 'leaflet-edit-marker-selected')){
//                toolbar[1]._modes.edit.handler._toggleMarkerHighlight(marker);
//            }
//        },

        toggleMarker:function(marker,show){
            var toolbar  = $H(this.drawControl._toolbars).find(function(toolbar){
                    if(toolbar.value._modes.edit){
                        return toolbar[1]
                    }
            });
            if(!L.DomUtil.hasClass(marker._icon, 'leaflet-edit-marker-selected') && show){
                toolbar[1]._modes.edit.handler._toggleMarkerHighlight(marker);
            }
            if(L.DomUtil.hasClass(marker._icon, 'leaflet-edit-marker-selected') && !show){
                toolbar[1]._modes.edit.handler._toggleMarkerHighlight(marker);
            }
//            marker.dragging.disable();
        },
        
        deleteSites : function(markers){
            var self = this;
            var resources = $A(markers).pluck("siteId");
            var content = [{html : "<span id = \"is-del-all-device-row\"></span>"}];
            service.deleteResources(resources, function(){
                //callback here
                dialog.render({lang:"deletesuccessful"});
                self.fire("afterDeleted", resources);
            }, self, true);
            /*if(resources.length>0){
                dialog.render({
                    lang:"is_del_all_device",
//                    content : content,
                    buttons:[{lang:"yes",click:function(){
                        service.deleteResources(resources, function(){
                            //callback here
                            self.fire("afterDeleted", resources);
                        }, self, true);
                        dialog.close();
                    }},{lang:"no",click:function(){
                        service.deleteResources(resources, function(){
                            //callback here
                            self.fire("afterDeleted", resources);
                        }, self, false);
                        dialog.close();
                    }}]
                });
            }*/

            /*if (this.isDelAllDevBtn){
                this.isDelAllDevBtn.destroy();
            }
            this.isDelAllDevBtn = new Button({
                container: $("#is-del-all-device-row"),
                id : "is-del-all-device-btn",
                checkbox : true,
                text : locale.get("is_del_all_device"),
                lang:"{title:is_del_all_device, text:is_del_all_device}",
                events: {
                    click: function(){
                    },
                    scope : this
                }
            });*/
        },
        
        updateLocation : function(siteId, location){
            cloud.Ajax.request({
                url: "api/sites/" + siteId,
                type: "put",
                data: {
                    location: location
                },
                success: function(data) {
//                    self.disable();
                }
            });
        },
        
        deleteMarkers : function(resources){
            var self = this;
            if (resources){
                //TODO
            }else{
                this.markers.each(function(obj){
                    var key = obj.key;
                    var marker = obj.value;
                    try {
                        marker.onRemove(self.map);
                    } catch (e) {
                        console.log("ERROR ocured when deleting markers")
                    }
                    self.markers.unset(key);
                });
            }
        },
        
        procMarker : function(marker, data){
            var self = this;
            var info = null;
            
            var clearContent = function(content){
                info && info.destroy();
                $(content).empty();
                info = null;
            };
            
            marker.siteId = data ? data._id : null;
            marker.data = data;
            marker.bindPopup(INFO_POPUP_CTNT[0], INFO_POPUP_CFG)
            .on("popupopen", function(event){
//                this.dragging.enable();
                if(self.states != null){
                    this.closePopup();
                    return;
                };
                if (self.states != "REMOVING"){
                    clearContent(event.popup.getContent());
                    
                    info = self.renderPopup(marker, event.popup.getContent());
                    event.popup.update();
                }
                info && info.setLocation({
                    longitude : this.getLatLng().lng,
                    latitude : this.getLatLng().lat
                });
                /*if (!marker.siteId){
                    info && info.setLocation({
                        longitude : this.getLatLng().lng,
                        latitude : this.getLatLng().lat
                    });
                    info.on({
                        "afterInfoCreated": function(id, data){
//                            marker.setTitle(data.name);
//                            marker.siteId = id;
//                            self.markers.set(id, marker);
                            self.fire("afterCreated", id, data);
                        },
                        "afterInfoUpdated" : function(id){
                            this.service.getTableResourcesById(id, function(data) {
                                
                            }, this);
                            self.fire("afterUpdated", id)
                        }
                    });
                }*/
            })
            .on("popupclose", function(event){
                clearContent(event.popup.getContent());
                
                if (!marker.siteId){
                    marker.onRemove(self.map);
                }
            })
            /*.on("click", function(){
                this.dragging.enable();
            })*/
            .on("mouseover", function(){
                if (self.states === "REMOVING"){
                    this.setOpacity(0.6)
                }
            })
            .on("mouseout", function(){
                if (self.states === "REMOVING"){
                    this.setOpacity(1)
                }
            })
            .on("dragend", function(){
//                console.log(this.getLatLng(), "dragend");
                marker.newLoc = {
                    longitude : this.getLatLng().lng,
                    latitude : this.getLatLng().lat
                };
                /*info && info.setLocation({
                    longitude : this.getLatLng().lng,
                    latitude : this.getLatLng().lat
                })*/
            })
        },

        addMarkers : function(datas) {
            var self = this;
            
//            var popupContent = INFO_POPUP_CTNT;
//            try {
            datas.each(function(data){
                var loc = data.location;
                var info = null;
                var icon = self._getIcon(data);
                var marker = L.marker([loc.latitude, loc.longitude],{
                    icon : icon,
                    title : data.name,
                    draggable : false
                })
                self.procMarker(marker, data);
                //.addTo(self.map);
                
                self.markerGroup.addLayer(marker);
                self.markers.set(data._id, marker);
            });
                            
//            } catch (e) {
//                // TODO: handle exception
//            }
        },
        
        jumpToSite : function(siteId){
            var marker = this.markers.get(siteId);
            if (marker){
                var latlon = marker.getLatLng();
                this.map.panTo(latlon);
                marker.openPopup();
            }
        },
        
        renderPopup : function(marker, popupContent){
            var self = this;
            var info = new InfoModule({
                container : popupContent
            });
            
            info.on({
                "afterInfoCreated": function(id, data){
//                    marker.setTitle(data.name);
//                    marker.siteId = id;
//                    self.markers.set(id, marker);
                    self.fire("afterCreated", id, data);
                },
                "afterInfoUpdated" : function(id,isSelected){
                    self.service.getTableResourcesById(id, function(data) {
                        data = data[0];

                        marker.data = data;
                        if(isSelected){
                            marker.setLatLng({
                                lon: data.location.longitude,
                                lat: data.location.latitude
                            });
                        }

                        var icon = this._getIcon(data);
                        if(L.DomUtil.hasClass(marker._icon,"leaflet-edit-marker-selected")){
                            marker.setIcon(icon);
                            self.toggleMarker(marker,true)
                        }else{
                            marker.setIcon(icon);
                        }

                        marker.setTitle(data.name);

                        console.log("set icon end");

                        self.fire("afterUpdated", id, data);
                    }, self);
                },
                "onAutoPos" : function(data,auto){
                    var marker = self.markers.get(data._id);
                    if(auto){
                        marker.data.autoNavi = 1;
                    }else{
                        marker.data.autoNavi = 0;
                    }
                }
            });
            
            info.render(marker.siteId);
            if (!marker.siteId){
                info.enable();
            }
            return info;
        },
        
        getSite:function(id,callback,context){
            cloud.Ajax.request({
                url: "api/sites/" + id,
                parameters: {
                    verbose: 100
                },
                type: "get",
                success: function(data) {
                    callback.call( context || this , data.result);
                }
            });
        },
        
        resize : function(){
            this.map.invalidateSize();
        },
        
        _getIcon : function(data){
            if (data){
                var iconUrl = this._iconUrlMapping(data);
            }
            
            var icon = L.icon({
                iconUrl: require.toUrl(iconUrl),
//                iconSize: [38, 95],
                iconAnchor: [10, 36],
                popupAnchor: [0, -36],
                shadowUrl: require.toUrl(iconBaseUrl + 'marker-shadow.png'),//require.toUrl("cloud/resources/images/shadow.png"),
//                shadowRetinaUrl: require.toUrl(iconBaseUrl + 'my-icon-shadow@2x.png'),
//                shadowSize: [68, 95],
                shadowAnchor: [13, 43]
            });
            
            return icon;
        },
        
        _iconUrlMapping : function(resource){
            var preStr = "cloud/resources/images/";
            
            var iconUrl = preStr + "ui-gis-";
            
            switch (resource.businessState){
                case 1 : iconUrl += "normal";break;
                case 0 : iconUrl += "setting";break;
                case 3 : iconUrl += "fix";break;
                case 2 : iconUrl += "gaojing";break;
            }
            if (resource.online == 1) {
                if (resource.alarmCount){
                    iconUrl += "1"
                }else {
                    iconUrl += "2"
                }
            } else {
                if (resource.alarmCount){
                    iconUrl += "3"
                }else {
                    iconUrl += "4"
                }
            }
            
            return iconUrl + ".png";
        },

        destroy : function($super) {
            this.map.remove();
            $super();
        },
        
        addControls : function() {
            var self = this;
            var $legend = $("<div>").addClass(
            "gis-legend gis-control");
            
            var editBtn = new Button({
                container : $legend,
                imgCls: "cloud-icon-edit",
//                lang:"{title:tag}",
                title : "编辑位置",
                events : {
                    click : function(){
                        var markers = self.markers.values();
                        markers.each(function(marker){
                        });
                    },
                    scope : this
                }
            });
            
            this.map.addControl(new MyControl($legend, {
                position : 'topleft'
            }));
        },
    });

    return GisMap;
});