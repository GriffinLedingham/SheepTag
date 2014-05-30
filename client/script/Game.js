var game = new Phaser.Game(800, 600, Phaser.AUTO, 'sheep-tag', { preload: preload, create: create, update: update, render:render });

function preload() {

    game.load.tilemap('level', 'data/Level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tiles.png');
    game.load.image('player', 'assets/player.png');


}

var map;
var layer;
var layer2;
var layer3;
var cursors;
var line;
var tileHits = [];
var plotting = false;
var p;
var height;
var width;

var lastClick = null;

var pathGrid = [];

function create() {
    line = new Phaser.Line();
    game.stage.backgroundColor = '#787878';
    map = game.add.tilemap('level');
    map.addTilesetImage('tiles', 'tiles');
    layer = map.createLayer('Tile Layer 1');
    height = layer.layer.height;
    width = layer.layer.width;
    layer.resizeWorld();
    cursors = game.input.keyboard.createCursorKeys();
    game.input.onDown.add(clickTile, this);
    p = game.add.sprite(32, 32, 'player');
    game.physics.enable(p);
    p.body.collideWorldBounds = true;
    game.camera.follow(p);

    for(var i = 0; i< width;i++)
    {
        pathGrid[i] = [];
        for(var j = 0; j< height ;j++)
        {
            pathGrid[i][j] = 0;
        }
    }

    var grid = new PF.Grid(width,height, pathGrid);
}

function update() {
    game.physics.arcade.collide(p, layer);
    p.body.velocity.x = 0;
    p.body.velocity.y = 0;

    if (cursors.up.isDown)
    {
            p.body.velocity.y = -200;
    }
    else if(cursors.down.isDown)
    {
        p.body.velocity.y = 200;
    }

    if (cursors.left.isDown)
    {
        p.body.velocity.x = -150;
    }
    else if (cursors.right.isDown)
    {
        p.body.velocity.x = 150;
    }


}

function render() {

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

    if(lastClick !== null)
    {
        var finder = new PF.AStarFinder();
        var path = finder.findPath(lastClick.x,lastClick.y, tileHits[0].x,tileHits[0].y, pathGrid);

        console.log(path);
    }

    lastClick = {x: tileHits[0].x, y: tileHits.y};

    return tileHits[0];
}
