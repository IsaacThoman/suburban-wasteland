const socket = io();

let lastUpload = 0;
let playerCount = 0;

let killOldMikes = true;
let remotePlayers = [];
let uploads = 0;

function uploadPlayerData(){
    uploads++;
    if(lastUpload==localPlayer.x+localPlayer.y+localPlayer.dir+localPlayer.crouching+localPlayer.inPain*3 && uploads%(2*60)!=0)
        return;
    socket.emit('playerData',localPlayer);
    lastUpload = localPlayer.x+localPlayer.y+localPlayer.dir+localPlayer.crouching;
}

let lastShot = 0;
function cKeyPressed(){
    if(utcTime>lastShot+1){
        for(let i = 0; i<objectsToRender.length; i++){
            if(objects[objectsToRender[i]]['type']=='remotePlayer' &&playerPointedAt == objects[objectsToRender[i]]['playerNum']&& Math.abs(objects[objectsToRender[i]]['dirDiff'])<0.1)
                socket.emit('playerShot', objects[objectsToRender[i]]['playerNum']);
        }

        lastShot = utcTime;
    }
}

socket.on('playerShot', function(msg) {
    if(msg==localPlayer.playerNum){
        localPlayerShot();
    }

});

socket.on('playerCount', function(msg) {
   if(killOldMikes) remotePlayers = [];
    playerCount = msg;
    if(localPlayer.playerNum == -1)
        localPlayer.playerNum = msg;
});


socket.on('playerData', function(msg) {
    if(msg.playerNum == localPlayer.playerNum)
        return;
    remotePlayers[msg.playerNum] = msg;
});