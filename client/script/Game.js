var game = new Phaser.Game(800, 600, Phaser.AUTO, 'sheep-tag', { preload: preload, create: create, update: update });

function preload() {

    game.load.tilemap('level', 'data/Level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tiles.png');

}

var map;
var layer;
var cursors;
var line;
var tileHits = [];
var plotting = false;

function create() {
    line = new Phaser.Line();
    game.stage.backgroundColor = '#787878';
    map = game.add.tilemap('level');
    map.addTilesetImage('tiles', 'tiles');
    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();
    layer.debug = true;
    cursors = game.input.keyboard.createCursorKeys();
    game.input.onDown.add(clickTile, this);
}

function update() {

    if (cursors.left.isDown)
    {
        game.camera.x -= 8;
    }
    else if (cursors.right.isDown)
    {
        game.camera.x += 8;
    }

    if (cursors.up.isDown)
    {
        game.camera.y -= 8;
    }
    else if (cursors.down.isDown)
    {
        game.camera.y += 8;
    }

}

function clickTile(pointer) {

    if (tileHits.length > 0)
    {
        for (var i = 0; i < tileHits.length; i++)
        {
            tileHits[i].debug = false;
        }

        layer.dirty = true;
    }

    line.start.set(pointer.worldX, pointer.worldY);

    plotting = true;

    console.log(raycast(pointer));

}

function raycast(pointer) {

    line.end.set(pointer.worldX, pointer.worldY);

    tileHits = layer.getRayCastTiles(line, 4, false, false);

    if (tileHits.length > 0)
    {
        //  Just so we can visually see the tiles
        for (var i = 0; i < tileHits.length; i++)
        {
            tileHits[i].debug = true;
        }

        layer.dirty = true;
    }

    plotting = false;

    return tileHits[0];
}
