var game = new Phaser.Game(800, 600, Phaser.AUTO, 'sheep-tag', { preload: preload, create: create, update: update, render:render });

function preload() {

    game.load.tilemap('level', 'data/Level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tiles.png');
    game.load.image('player', 'assets/player.png');


}

var tileLength = 32;

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

var finder;

var lastClick = null;

var moveArray = [];
var moveIndex = 0;

var masterGrid;

function create() {
    line = new Phaser.Line();
    game.stage.backgroundColor = '#787878';
    map = game.add.tilemap('level');
    map.addTilesetImage('tiles', 'tiles');
    layer = map.createLayer('Tile Layer 1');

    finder = new PF.AStarFinder({
         allowDiagonal: true
    });

    height = layer.layer.height;
    width = layer.layer.width;

    layer.resizeWorld();
    cursors = game.input.keyboard.createCursorKeys();
    game.input.onDown.add(clickTile, this);
    p = game.add.sprite(32, 32, 'player');

    game.physics.enable(p);

    p.body.collideWorldBounds = true;
    game.camera.follow(p);

    masterGrid = new PF.Grid(width,height);



}

function update() {
    game.physics.arcade.collide(p, layer);

    // if(moveIndex < moveArray.length)
    // {

    //     //x and y we want to aim to for this movement step
    //     var goal = moveArray[moveIndex];


    //     if(lastTile.x == goal[0] || lastTile.y == goal[1])
    //     {
    //         console.log(lastTile);
    //         console.log(goal);
    //         moveIndex++;
    //     }


    //     var playerGridX = Math.floor(p.world.x/32);
    //     var playerGridY = Math.floor(p.world.y/32);
    //     lastTile = {x:playerGridX, y:playerGridY};

    //     if(playerGridX < goal[0])
    //     {
    //         p.body.velocity.x = 200;
    //     }
    //     else if(playerGridX > goal[0])
    //     {
    //         p.body.velocity.x = -200;
    //     }

    //     if(playerGridY < goal[0])
    //     {
    //         p.body.velocity.y = 200;
    //     }
    //     else if(playerGridY > goal[0])
    //     {
    //         p.body.velocity.y = -200;
    //     }



    // }

    if(moveArray.length !== 0)
    {   
        if(p.world.x > (moveArray[moveIndex][0]*tileLength) && p.world.x < (moveArray[moveIndex][0]*tileLength)+tileLength &&
                p.world.y > (moveArray[moveIndex][1]*tileLength) && p.world.y < (moveArray[moveIndex][1]*tileLength)+tileLength)
        {
            moveIndex++;
            if(moveIndex === moveArray.length)
            {
                moveArray = [];
                moveIndex = 0;
                p.body.velocity.x = 0;
                p.body.velocity.y = 0;
            }
            else
            {
                movePlayer();
            }
        }
    }
}

function movePlayer()
{
    var player = {};
    player.x = p.world.x;
    player.y = p.world.y;

    var path_point = {};
    path_point.x = moveArray[moveIndex][0]*tileLength + tileLength/2;
    path_point.y = moveArray[moveIndex][1]*tileLength + tileLength/2;

    //Get Direction
    var dir = {};
    dir.x = path_point.x - player.x;
    dir.y = path_point.y - player.y;

    //Normalize
    var dir_length =  Math.sqrt(Math.pow(dir.x,2) + Math.pow(dir.y,2));
    var dir_normalized = {};
    dir_normalized.x = dir.x / dir_length;
    dir_normalized.y = dir.y / dir_length;

    player.velx = dir_normalized.x * 200;
    player.vely = dir_normalized.y * 200;

    p.body.velocity.x = player.velx;
    p.body.velocity.y = player.vely;
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


    var grid = this.masterGrid.clone();
    var path = finder.findPath(Math.floor(p.world.x/32),Math.floor(p.world.y/32), tileHits[0].x,tileHits[0].y, grid);

    moveIndex = 0;
    moveArray = path;
    movePlayer();

    return tileHits[0];
}
