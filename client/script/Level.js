(function (window) {

    var p = Level.prototype = new createjs.Container();

    p.stage;
    var tileset;
    var mapData;

    function Level(stage) {
        this.initialize();
        this.stage = stage;
    }

    p.Container_initialize = p.initialize; 
    p.initialize = function (sprite) {
        this.Container_initialize();

         $.ajax({
            url: 'data/Level1.json',
            async: false,
            dataType: 'json',
            success: function (response) {
                mapData = response;
                tileset = new Image();
                tileset.src = mapData.tilesets[0].image;
                tileset.onLoad = initLayers();
            }
        }); 
    }

    function initLayers() {
		var w = mapData.tilesets[0].tilewidth;
		var h = mapData.tilesets[0].tileheight;
		var imageData = {
			images : [ tileset ],
			frames : {
				width : w,
				height : h
			}
		};
		var tilesetSheet = new createjs.SpriteSheet(imageData);
		
		for (var idx = 0; idx < mapData.layers.length; idx++) {
			var layerData = mapData.layers[idx];
			if (layerData.type == 'tilelayer')
				initLayer(layerData, tilesetSheet, mapData.tilewidth, mapData.tileheight);
		}
	}

	function initLayer(layerData, tilesetSheet, tilewidth, tileheight) {
		for ( var y = 0; y < layerData.height; y++) {
			for ( var x = 0; x < layerData.width; x++) {
				var cellBitmap = new createjs.Sprite(tilesetSheet);
				var idx = x + y * layerData.width;
				cellBitmap.gotoAndStop(layerData.data[idx] - 1);
				cellBitmap.x = x * tilewidth;
				cellBitmap.y = y * tileheight;
				this.stage.addChild(cellBitmap);
			}
		}
	}

window.Level = Level;

}(window));