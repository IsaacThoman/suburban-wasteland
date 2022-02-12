const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const gameVersion = 0.14;
let emitCount = 0;
let utcTime = (new Date()).getTime() / 1000;

let serverPlayerData = [];
let lastPlayerDataEmit = utcTime;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
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


    });

    socket.on('playerShot', (msg) => {
        io.emit('playerShot',msg);
    });





});

function serverLoop(){
    emitServerUpdate();
    setTimeout(serverLoop,50,'');
}
setTimeout(serverLoop,50,'');


function emitServerUpdate(){
    let utcTime = (new Date()).getTime() / 1000;
    //let theX = Math.sin(utcTime)*100;
    //let funnyWall = new Wall(theX,0,theX,100,1,0);
    let gameObjects = [];
    let gameState = {'playerData':serverPlayerData,'serverVersion':gameVersion,'serverObjects':gameObjects};

    io.emit('gameStateUpdate', gameState);

    lastPlayerDataEmit = utcTime;
    emitCount++;
}


server.listen(3000, () => {
    console.log('listening on *:3000');
});

class Wall{
    constructor(x1,y1,x2,y2,height,z,color,outlineColor,priority) {
        this.color = "#ffffff";
        this.outlineColor = "#737373";
        this.z = 0;
        this.height = 1;
        this.priority = false;

        this.type = 'wall';
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        if(color!=null)this.color = color;
        if(outlineColor!=null)this.outlineColor = outlineColor;
        if(height!=null)this.height = height;
        if(z!=null)this.z = z;
        if(priority!=null)this.priority = priority;
    }
}