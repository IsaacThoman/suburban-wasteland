const socket = io();

const gameVersion = 0.15;
let serverVersion = gameVersion;
let lastUpload = 0;
let playerCount = 0;
let serverObjects = [];

let killOldMikes = true;
let remotePlayers = [];
let uploads = 0;
let lastUploadTime = 0;

function uploadPlayerData(){
    uploads++;
     if(lastUpload==localPlayer.x+localPlayer.y+localPlayer.dir+localPlayer.crouching+localPlayer.inPain*3+localPlayer.name && uploads%(2*60)!=0)
         return;
    if(utcTime<lastUploadTime+0.08) return;
    socket.emit('playerData',localPlayer);
    lastUpload = localPlayer.x+localPlayer.y+localPlayer.dir+localPlayer.crouching+localPlayer.inPain*3+localPlayer.name;
    lastUploadTime = utcTime;
}

let lastShot = 0;
function cKeyPressed(){
    if(utcTime<=lastShot+1) return;
    for(let i = 0; i<objectsToRender.length; i++){
        if(objects[objectsToRender[i]]['type']!='remotePlayer')continue;
        let lpViewPoint = new Point(localPlayer.x + Math.cos(localPlayer.dir)*1000,localPlayer.y + Math.sin(localPlayer.dir)*1000);
        let theObject = objects[objectsToRender[i]];
        let isPointedAt = doIntersect(localPlayer,lpViewPoint,new Point(theObject['hitboxPlane']['x1'],theObject['hitboxPlane']['y1']),new Point(theObject['hitboxPlane']['x2'],theObject['hitboxPlane']['y2'])) || doIntersect(localPlayer,lpViewPoint,new Point(theObject['hitboxPlane2']['x1'],theObject['hitboxPlane2']['y1']),new Point(theObject['hitboxPlane2']['x2'],theObject['hitboxPlane2']['y2']));
        if(!wallBetween(objects[objectsToRender[i]],localPlayer) && isPointedAt){
            if(localPlayer.weaponHeld==1){
                sendShot(objects[objectsToRender[i]]);
            }

            if(localPlayer.weaponHeld==2 && Math.abs(theObject['distFromPlayer'])<30){
                for(let shots = 0; shots<2; shots++)
                    sendShot(objects[objectsToRender[i]]);
            }



        }

    }
    lastShot = utcTime;

}
function sendShot(playerToShoot){
    if(playerToShoot['lives']<=1)
        localPlayer['killCount'] ++;
    socket.emit('playerShot', playerToShoot['playerNum']);
}

socket.on('playerShot', function(msg) {
    if(msg==localPlayer.playerNum){
        localPlayerShot();
    }

});



socket.on('gameStateUpdate', function(msg) {
gotPlayerData(msg['playerData']);
serverVersion = msg['serverVersion'];
serverObjects = msg['serverObjects'];
});

function gotPlayerData(msg){
    remotePlayers = msg;
    playerCount = 0;
    for(let i = 0; i<remotePlayers.length; i++)
        if(remotePlayers[i]!=null)
            playerCount++;

    for(let i = 0; i<remotePlayers.length; i++)
        if(remotePlayers[i]!=null && remotePlayers[i]['playerNum']==localPlayer.playerNum)
            remotePlayers[i] = null; //removes you from the list of remote players
}
