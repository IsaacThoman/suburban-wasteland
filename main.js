const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const gameVersion = 0.11;
let emitCount = 0;
let utcTime = (new Date()).getTime() / 1000;

let serverPlayerData = [];
let lastPlayerDataEmit = utcTime;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    

    socket.on('disconnect', () => {});


    socket.on('playerData', (msg) => {
        utcTime = (new Date()).getTime() / 1000;
     //   console.log('player '+msg.playerNum+' sent '+msg);
        let msgRequirements = ['x','y','inPain','lives','name','playerNum','weaponHeld','crouching'];
        if(typeof msg != "object") return;
        for(let i in msgRequirements)
        if(!msgRequirements[i] in msg)
            return;

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

        for(let i = 0; i<serverPlayerData.length; i++){ //removes players who haven't sent an update in the last 5 seconds
            if(serverPlayerData[i] == null) continue;

            if( 'name' in serverPlayerData[i] &&  serverPlayerData[i]['name'].length>100) serverPlayerData[i]['name'] = 'Michael Frederick Krol'; //removes long names

            if(serverPlayerData[i]['lastUploadTime']+5<utcTime) serverPlayerData[i] = null;
        }


if(utcTime>lastPlayerDataEmit+0.08) {
    io.emit('playerDataNew', serverPlayerData)
    if(emitCount%10==0)
        io.emit('gameVersion',gameVersion)
    lastPlayerDataEmit = utcTime;
    emitCount++;
}

    });

    socket.on('playerShot', (msg) => {
        io.emit('playerShot',msg);
    });





});

function playerCount(){
let out = 0;
for(let i = 0; i<serverPlayerData.length; i++)
    if(serverPlayerData[i]!=null) out++;
return out;

}


server.listen(3000, () => {
    console.log('listening on *:3000');
});