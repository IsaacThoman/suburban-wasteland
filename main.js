const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


let playerCount = 0;
let playerNumAssign = 0;

let storedPlayerData = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    //use socket.emit to send to single listener
    playerCount++;

    playerNumAssign++;
    if(playerNumAssign>1000)
        playerNumAssign = 0;

    console.log(playerCount+' users connected.')
    io.emit('playerCount',playerNumAssign);

    socket.on('disconnect', () => {
        playerCount--;
        console.log(playerCount+' users connected.');
        io.emit('playerCount',playerNumAssign);
    });

    socket.on('playerData', (msg) => {
     //   console.log('player '+msg.playerNum+' sent '+msg);
        io.emit('playerData',msg);
        storedPlayerData[msg['playerNum']] = msg;
    });

    socket.on('playerShot', (msg) => {
        io.emit('playerShot',msg);
    });





});


server.listen(3000, () => {
    console.log('listening on *:3000');
});