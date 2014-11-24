/**
 * @author zhang
 */
define(["cloud/lib/plugin/leaflet/leaflet-Layer.Deferred","cloud/lib/plugin/leaflet/leaflet.draw-src","cloud/lib/plugin/leaflet/leaflet-Google"],function(){
    //config
    var maxZoom = {
        ArcGisChina:17,
        Google:19,
        ArcGisWorld:17,
        BlankMap:19
    }
    var tileName = {
        ArcGisChina:"ArcGisChina",
        Google:"Google",
        ArcGisWorld:"ArcGisWorld",
        BlankMap:"BlankMap"
    }
    if(locale.localLang == "en"){
        var defaultType = tileName.ArcGisWorld;
    }else if(locale.localLang == "zh_CN"){
        var defaultType = tileName.ArcGisChina;
    }
    cloud.Lmap = cloud.Lmap ||{};
    //new tile methods
    var newArcChina = function(){
        var tile =  new L.tileLayer("http://www.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",{
            maxZoom : maxZoom.ArcGisChina
        });
        tile.name = tileName.ArcGisChina;
        tile.maxZoom = maxZoom.ArcGisChina;
        return tile
    }
    var newGoogle = function(){
        var tile =  new L.DeferredLayer({
            name: tileName.Google,
            js: ["http://maps.google.com/maps/api/js?v=3&sensor=false&callback=L.Google.asyncInitialize"],
            init: function() {return new L.Google('ROADMAP' , {
                maxZoom : maxZoom.Google
            });}
        });
        tile.name = tileName.Google;
        tile.maxZoom = maxZoom.Google;
        return tile;
    }
    var newArcWorld = function(){
        var tile =  new L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",{
            maxZoom : maxZoom.ArcGisWorld
        });
        tile.name = tileName.ArcGisWorld;
        tile.maxZoom = maxZoom.ArcGisWorld;
        return tile;
    }

    var newBlankMap = function(){
        var tile = new L.tileLayer.canvas()
        tile.name = tileName.BlankMap;
        tile.maxZoom = maxZoom.BlankMap;
        return tile
    }


    cloud.Lmap.getTiles = function(map){
        var mapType = cloud.storage.sessionStorage("currentMap") || defaultType;

        var tiles = {
            arcChina : newArcChina(),
            google : newGoogle(),
            arcWorld : newArcWorld(),
            blankMap:newBlankMap()
        }

        if(map){
            switch(mapType){
                case tileName.ArcGisChina :
                    tiles.arcChina.addTo(map);
                    break;
                case tileName.Google :
                    tiles.google.addTo(map);
                    break;
                case tileName.ArcGisWorld :
                    tiles.arcWorld.addTo(map);
                    break;
                case tileName.BlankMap :
                    tiles.blankMap.addTo(map);
                    break;
            }
        }
        return tiles;
    }

    cloud.Lmap.getTile  = function(map){
        var mapType = cloud.storage.sessionStorage("currentMap") || defaultType;
        switch(mapType){
            case tileName.ArcGisChina :
                var arcChina = newArcChina();
                map && arcChina.addTo(map);
                return arcChina;
                break;
            case tileName.Google :
                var google = newGoogle();
                map && google.addTo(map);
                return google;
                break;
            case tileName.ArcGisWorld :
                var arcWorld = newArcWorld();
                map && arcWorld.addTo(map);
                return arcWorld;
                break;
            case tileName.BlankMap :
                var blankMap = newBlankMap();
                map && blankMap.addTo(map);
                return blankMap;
                break;
        }

    }


    cloud.Lmap.setMap = function(name){
        cloud.storage.sessionStorage("currentMap",name);
    }


    cloud.Lmap.initMap = function(container,config){
        if (!container){
            return null;
        }
        if (container instanceof jQuery){
            container = container[0];
        };
        var map = L.map(container).setView(
            [ 39.926588, 116.407013 ], 11);
        if (config.multiLayer){
            var tiles = cloud.Lmap.getTiles(map);

            L.control.layers(
                {
                    "ArcGisChina":tiles.arcChina,
                    "Google":tiles.google,
                    'ArcGisWorld':tiles.arcWorld,
                    'BlankMap':tiles.blankMap
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
                    case "BlankMap":
                        maxzoom = tiles.blankMap.maxZoom;
                        break;
                }
                var currzoom = map.getZoom();
                if(maxzoom <currzoom){
                    map.setZoom(maxzoom);
                }

                cloud.Lmap.setMap(layer.name);
            })
        }

        /* map.on("mousedown", function(e){
         self.element.trigger("mousedown", [e])
         });*/

        return map;
    }

    L.Marker = L.Marker.extend({
        $twinkling : function(times,speed){
            var times = times || 3;
            var icoEl = $([this._icon,this._shadow]);
            for(var i = 0;i<times;i++){
                icoEl.hide(speed).show(speed)
            }
        },
    });

    L.Marker.include({
        opencusPopup: function () {
            if (this._cuspop && this._map && !this._map.hasLayer(this._cuspop)) {
                this._cuspop.setLatLng(this._latlng);
                this._openPopup(this._cuspop);
            }

            return this;
        },
        _openPopup: function (popup, latlng, options) {
            //        this.closePopup();  // just comment this
            popup._isOpen = true;
            this._cuspop = popup;

            return this._map.addLayer(popup).fire('popupopen', {
                popup: this._cuspop
            });
        },

        closecusPopup: function () {
            if (this._cuspop) {
                this._cuspop._close();
            }
            return this;
        },

        togglecusPopup: function () {
            if (this._cuspop) {
                if (this._cuspop._isOpen) {
                    this.closecusPopup();
                } else {
                    this.opencusPopup();
                }
            }
            return this;
        },

        bindcusPopup: function (content, options) {
            var anchor = L.point(this.options.icon.options.popupAnchor || [0, 0]);

            anchor = anchor.add(L.Popup.prototype.options.offset);

            if (options && options.offset) {
                anchor = anchor.add(options.offset);
            }

            options = L.extend({offset: anchor}, options);

            if (!this._cuspopHandlersAdded) {
                this
//    			    .on('click', this.togglePopup, this)
                    .on('remove', this.closecusPopup, this)
                    .on('move', this._movecusPopup, this);
                this._cuspopHandlersAdded = true;
            }

            if (content instanceof L.Popup) {
                L.setOptions(content, options);
                this._cuspop = content;
            } else {
                this._cuspop = new L.Popup(options, this)
                    .setContent(content);
            }
            //cus flag
            this._cuspop._cus = true;

            return this;
        },

        setcusPopupContent: function (content) {
            if (this._cuspop) {
                this._cuspop.setContent(content);
            }
            return this;
        },

        unbindcusPopup: function () {
            if (this._cuspop) {
                this._cuspop = null;
                this
                    .off('click', this.togglecusPopup, this)
                    .off('remove', this.closecusPopup, this)
                    .off('move', this._movecusPopup, this);
                this._cuspopHandlersAdded = false;
            }
            return this;
        },

        getcusPopup: function () {
            return this._cuspop;
        },

        _movecusPopup: function (e) {
            this._cuspop.setLatLng(e.latlng);
        },
        changeCss: function(){
            $(this._cuspop._wrapper).css({
                "border-radius":"6px"
            })
            $(this._cuspop._contentNode).css({
                "margin":"4px 10px"
            })
            $(this._cuspop._tipContainer).css({
                "width":"24px",
                "height":"12px"
            })
            $(this._cuspop._tip).css({
                "width":"10px",
                "height":"10px",
                "margin":"-8px auto 0"
            })
            this._cuspop.update();
        }
    });

//    L.Popup = L.Popup.extend({
//    	_close: function (e) {
//    		if (this._map) {
//    			if(!this._cus || e.type!="preclick"){
//    				this._map.closePopup(this);
//    			}
//    		}
//    	},
//    })

    L.Polyline = L.Polyline.extend({
        $twinkling : function(times,speed){
            var times = times || 3;
            var pathEl = $(this._path);
            for(var i = 0;i<times;i++){
                pathEl.hide(speed).show(speed)
            }
        },
        $show : function(speed){
            var pathEl = $(this._path);
            pathEl.stop(true, true).show(speed);
        },
        $hide : function(speed){
            var pathEl = $(this._path);
            pathEl.stop(true, true).hide(speed);
        }
    });
    L.FeatureGroup = L.FeatureGroup.extend({
        $twinkling: function(times,speed){
            var times = times || 3;
            for (var id in this._layers) {
                (typeof(this._layers[id].$twinkling) === "function") && this._layers[id].$twinkling(times,speed);
            }
        },
        $show : function(speed){
            for (var id in this._layers) {
                (typeof(this._layers[id].$show) === "function") && this._layers[id].$show(speed);
            }
        },
        $hide : function(speed){
            for (var id in this._layers) {
                (typeof(this._layers[id].$hide) === "function") && this._layers[id].$hide(speed);
            }
        }
    });

    L.customControl = L.Control.extend({
        options: {
            position: ''
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'my-custom-control');

            // ... initialize other DOM elements, add listeners, etc.

            return container;
        }
    })

});