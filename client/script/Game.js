var game = new Phaser.Game(800, 600, Phaser.AUTO, 'sheep-tag', { preload: preload, create: create, update: update, render:render });

function preload() {
    game.load.tilemap('level', 'data/Level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tiles.png');
    game.load.image('player', 'assets/player.png');
    game.load.image('wolf', 'assets/wolf.png');
}

var tileLength = 32;
var map;
var line;
var layer;
var layer2;
var hitLayer;
var cursors;
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
var uuid;
var players;
var socket;
var playerType;
var authed = false;

function create() {
    socket = io.connect('http://192.168.1.108:3000');

    players = {};
    
    uuid = guid();

    line = new Phaser.Line();


    game.stage.backgroundColor = '#787878';
    map = game.add.tilemap('level');
    map.addTilesetImage('tiles', 'tiles');
    layer = map.createLayer('Tile Layer 1');
    layer2 = map.createLayer('Tile Layer 2');
    hitLayer = map.createLayer('Hit Layer');

    height = layer.layer.height;
    width = layer.layer.width;
    layer.resizeWorld();
    
    
    
    socket.emit('new_player', {uuid:uuid});

    socket.on('join_game',function(type){
        startGame(type);
    });

    socket.on('player_join',function(player_data){
        players[player_data.uuid] = game.add.sprite(23,32, 'player');
        game.physics.enable(players[player_data.uuid],  Phaser.Physics.ARCADE);
        players[player_data.uuid].body.immovable = true;
        players[player_data.uuid].anchor.setTo(0.5, 1);
    });

    socket.on('player_move',function(player_data){
        if(typeof players[player_data.uuid] !== 'undefined')
        {
            players[player_data.uuid].x = player_data.x;
            players[player_data.uuid].y = player_data.y;
        }
    });

    socket.on('sync_players',function(list){
        for(var i = 0;i<list.length;i++)
        {
            if(list[i] !== uuid)
            {
                players[list[i]] = game.add.sprite(23,32, 'player');
                game.physics.enable(players[list[i]],  Phaser.Physics.ARCADE);
                players[list[i]].body.immovable = true;
                players[list[i]].anchor.setTo(0.5, 1);

            }
        }
    });

    socket.on('disconnected',function(id){
        players[id].destroy();
    });

}

function startGame(type){

    game.physics.startSystem(Phaser.Physics.ARCADE);

    playerType = type;

    if(playerType === 'wolf')
    {
        p = game.add.sprite(23,32, 'wolf');
    }
    else
    {
        p = game.add.sprite(23,32, 'player');
    }
    game.physics.enable(p, Phaser.Physics.ARCADE);
    p.body.collideWorldBounds = true;
    p.anchor.setTo(0.5, 1);

    cursors = game.input.keyboard.createCursorKeys();
    game.input.onDown.add(clickTile, this);
    game.camera.follow(p);
    
    finder = new PF.AStarFinder(
    );
    masterGrid = new PF.Grid(width,height);

    var hitLayerArray = hitLayer.layer.data;
    console.log(hitLayerArray);
    console.log(masterGrid);
    for(var i in hitLayerArray)
    {
        for(var j in hitLayerArray[i])
        {
            if(hitLayerArray[i][j].index !== -1)
            {
                masterGrid.nodes[i][j].walkable = false;
            }
        }
    }
    authed = true;
}

function update() {
    if(!authed)
    {
        return;
    }

    game.physics.arcade.collide(p, players, function(){console.log('hi');});

    for(var i in players)
    {
        game.physics.arcade.collide(p,players[i], function(){
            movePlayer();
        });
    }

    var player_data = {x:p.world.x, y:p.world.y, uuid: uuid};
    socket.emit('move_player', player_data);

    if(moveArray.length !== 0)
    {   
        if(p.world.x > (moveArray[moveIndex][0]*tileLength) && p.world.x < (moveArray[moveIndex][0]*tileLength)+(tileLength) &&
                p.world.y > (moveArray[moveIndex][1]*tileLength) && p.world.y < (moveArray[moveIndex][1]*tileLength)+(tileLength))
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
    if(typeof moveArray[moveIndex] !== 'undefined')
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

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();
