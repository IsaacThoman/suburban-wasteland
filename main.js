const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let utcTime = (new Date()).getTime() / 1000;
let playerCount = 0;
let playerNumAssign = 0;

let serverPlayerData = [];
let lastPlayerDataEmit = utcTime;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {

    console.log('someone connected')

    socket.on('disconnect', () => {
        console.log('someone disconnected');
    });


    socket.on('playerData', (msg) => {
        utcTime = (new Date()).getTime() / 1000;
     //   console.log('player '+msg.playerNum+' sent '+msg);

        for(let i = 0; i<serverPlayerData.length; i++){ //removes players who haven't sent an update in the last 5 seconds
            if(serverPlayerData[i] == null) continue;
            if(serverPlayerData[i]['lastUploadTime']+5<utcTime) serverPlayerData[i] = null;
        }

        let playerExists = false;
for(let i = 0; i<serverPlayerData.length; i++){
    if(serverPlayerData[i]==null) continue;
    if(serverPlayerData[i]['playerNum']==msg['playerNum']) {
        serverPlayerData[i] = msg;
        serverPlayerData[i]['lastUploadTime'] = utcTime;
        playerExists = true;
    }
}
if(!playerExists){
    for(let i = 0; i<serverPlayerData.length+1; i++){
        if(serverPlayerData[i]==null){
            serverPlayerData[i] = msg;
            serverPlayerData[i]['lastUploadTime'] = utcTime;
            break;
        }
    }
}


if(utcTime>lastPlayerDataEmit+0.08) {
    io.emit('playerDataNew', serverPlayerData)
    lastPlayerDataEmit = utcTime;
}

    });

    socket.on('playerShot', (msg) => {
        io.emit('playerShot',msg);
    });





});


server.listen(3000, () => {
    console.log('listening on *:3000');
});