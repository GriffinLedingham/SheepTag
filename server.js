var http = require('http');
var express = require('express');
var app = express();
var path    = require('path');
app.use(express.static(path.join(__dirname, 'client')));
app.configure(function(){
  app.use(express.bodyParser());
});
var server = http.createServer(app);
var io = require('socket.io').listen(server); 
server.listen(3000);  
io.set('log level', 0);

var players = [];

io.sockets.on('connection', function (socket) {
    console.log('joined');
    socket.uuid = null;

    socket.on('new_player',function(player_data){
      socket.uuid = player_data.uuid;
      players.push(player_data.uuid);
      socket.emit('sync_players',players);
      socket.broadcast.emit('player_join', player_data);
    });

    socket.on('move_player',function(player_data){
      socket.broadcast.emit('player_move', player_data );
    });

    socket.on('disconnect',function(){
      socket.broadcast.emit('disconnected', socket.uuid);
      for(var i in players){
            if(players[i]==socket.uuid){
                players.splice(i,1);
                break;
                }
        }
    });
});