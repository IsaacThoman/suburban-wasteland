const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const gameVersion = 0.16;
let emitCount = 0;
let utcTime = (new Date()).getTime() / 1000;

let serverPlayerData = [];
let lastPlayerDataEmit = utcTime;
let gameObjects = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    

    socket.on('disconnect', () => {});


    socket.on('playerData', (msg) => {
        utcTime = (new Date()).getTime() / 1000;
     //   console.log('player '+msg.playerNum+' sent '+msg);
        let msgRequirements = ['x','y','inPain','lives','name','playerNum','weaponHeld','crouching','killCount','deathCount','team','isACactus'];
        if(typeof msg != "object") return;
        for(let i in msgRequirements){
            let exists = msgRequirements[i] in msg;
            if(!exists)
                return;
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

        for(let i = 0; i<serverPlayerData.length; i++){ //removes players who haven't sent an update in the last 5 seconds
            if(serverPlayerData[i] == null) continue;

            if( 'name' in serverPlayerData[i] &&  serverPlayerData[i]['name'].length>100) serverPlayerData[i]['name'] = 'Michael Frederick Krol'; //removes long names

            if(serverPlayerData[i]['lastUploadTime']+5<utcTime){
                if(serverPlayerData[i]['isACactus']){
                    if(serverPlayerData[i]['team']==0) {
                        team1CactusTaken = false;
                        io.emit('pointGiven', -1);
                    }
                    else {
                        team2CactusTaken = false;
                        io.emit('pointGiven', -1);
                    }

                }

                serverPlayerData[i] = null;
            }
        }


    });

    socket.on('playerShot', (msg) => {
        io.emit('playerShot',msg);
    });

    socket.on('requestTeamAssign', (msg) => {
        let counts = teamPlayerCounts();
        if(counts[0]<=counts[1])
            socket.emit('teamAssign',0);
        else
            socket.emit('teamAssign',1);
    });





});

function teamPlayerCounts(){
    let out = [0,0];
    for(let i = 0; i<serverPlayerData.length; i++){
        if(serverPlayerData[i]==null)continue;
        out[serverPlayerData[i]['team']]++;
    }
    return out;
}

function serverLoop(){
    utcTime = (new Date()).getTime() / 1000;
    updateGameObjects();
    emitServerUpdate();
    setTimeout(serverLoop,50,'');
}

setTimeout(serverLoop,50,'');

let garage1Height = 0;
let garage2Height = 0;
function updateGameObjects(){
    gameObjects = [];
    updateGarages();
    doCactusStuff();
}

let team1CactusTaken = false;
let team2CactusTaken = false;
function doCactusStuff(){
    let cactus1 = {'x':175,'y':585,'dir':1.95,'type':'cactus'};
    let cactus2 = {'x':2175,'y':585,'dir':1,'type':'cactus'};

if(!team1CactusTaken)
    gameObjects.push(cactus1)

if(!team2CactusTaken)
    gameObjects.push(cactus2)

    let playerTouching1 = playerWithinPoint(175,585,30);
    if(!team1CactusTaken && playerTouching1>=0 && serverPlayerData[playerTouching1]['team']==0){ //red cactus
        team1CactusTaken = true;
        let stolenInfo = {'team':1,'player':serverPlayerData[playerTouching1]};
        io.emit('cactusTaken',stolenInfo);
    }

    let playerTouching2 = playerWithinPoint(2175,585,30);
    if(!team2CactusTaken && playerTouching2>=0 && serverPlayerData[playerTouching2]['team']==1){ //blue cactus
        team2CactusTaken = true;
        let stolenInfo = {'team':0,'player':serverPlayerData[playerTouching2]};
        io.emit('cactusTaken',stolenInfo);
    }

    for(let i = 0; i<serverPlayerData.length; i++){
        if(serverPlayerData[i]==null) continue;
        if(!serverPlayerData[i]['isACactus'])continue; //player mustn't be null and must be a cactus

        if(serverPlayerData[i]['x']<700 && serverPlayerData[i]['team']==1){
            io.emit('pointGiven',1);
            team2CactusTaken = false;
        }

        if(serverPlayerData[i]['x']>1650 && serverPlayerData[i]['team']==0) {
            io.emit('pointGiven', 0);
            team1CactusTaken = false;
        }

    }



}

function updateGarages(){
    //  let wH = (Math.sin(utcTime*1.5)+1);
    if(playerWithinPoint(372,642,50)>-1){
        if(garage1Height<1.8)
            garage1Height+=0.2;
    }else{
        if(garage1Height>0.2)
            garage1Height-=0.2;
    }

    if(playerWithinPoint(1970,642,50)>-1){
        if(garage2Height<1.8)
            garage2Height+=0.2;
    }else{
        if(garage2Height>0.2)
            garage2Height-=0.2;
    }


    let garage1 = new Wall(332,638,413,647,1,garage1Height,'rgba(32,164,168,0.7)','#c7c7c7');
    let garage2 = new Wall(2010,638,1929,647,1,garage2Height,'rgba(32,164,168,0.7)','#c7c7c7');

    gameObjects.push(garage1,garage2);
}

function playerWithinPoint(x,y,dist){
    for(let i = 0; i<serverPlayerData.length; i++){
        if(serverPlayerData[i]==null) continue;
        if(Math.sqrt(Math.pow(serverPlayerData[i]['x']-x,2) + Math.pow(serverPlayerData[i]['y']-y,2))<dist){
            return i;
        }
    }
    return -1;
}

function emitServerUpdate(){

    //let theX = Math.sin(utcTime)*100;
    //let funnyWall = new Wall(theX,0,theX,100,1,0);
   // let gameObjects = [];
    let cactiTaken = [team1CactusTaken,team2CactusTaken];
    let gameState = {'playerData':serverPlayerData,'serverVersion':gameVersion,'serverObjects':gameObjects,'cactusTaken':cactiTaken};

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