const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let playerCount = 0;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    //use socket.emit to send to single listener
    playerCount++;
    if(playerCount>1000)
        playerCount = 0;

    console.log(playerCount+' users connected.')
    io.emit('playerCount',playerCount);

    socket.on('disconnect', () => {
        console.log(playerCount+' users connected.');
        io.emit('playerCount',playerCount);
    });

    socket.on('playerData', (msg) => {
     //   console.log('player '+msg.playerNum+' sent '+msg);
        io.emit('playerData',msg);
    });

    socket.on('playerShot', (msg) => {
        io.emit('playerShot',msg);
    });





});


server.listen(3000, () => {
    console.log('listening on *:3000');
});