const socket = io();

const gameVersion = 0.12;
let serverVersion = gameVersion;
let lastUpload = 0;
let playerCount = 0;

let killOldMikes = true;
let remotePlayers = [];
let uploads = 0;
let lastUploadTime = 0;

function uploadPlayerData(){
    uploads++;
    if(lastUpload==localPlayer.x+localPlayer.y+localPlayer.dir+localPlayer.crouching+localPlayer.inPain*3+localPlayer.name && uploads%(2*60)!=0)
        return;
    if(utcTime<lastUploadTime+0.1) return;
    socket.emit('playerData',localPlayer);
    lastUpload = localPlayer.x+localPlayer.y+localPlayer.dir+localPlayer.crouching+localPlayer.inPain*3+localPlayer.name;
    lastUploadTime = utcTime;
}

let lastShot = 0;
function cKeyPressed(){

    if(localPlayer.weaponHeld == 1){
        if(utcTime>lastShot+1){
            for(let i = 0; i<objectsToRender.length; i++){
                if(objects[objectsToRender[i]]['type']=='remotePlayer' &&playerPointedAt == objects[objectsToRender[i]]['playerNum']&& Math.abs(objects[objectsToRender[i]]['dirDiff'])<0.1){
                    if(!wallBetween(objects[objectsToRender[i]],localPlayer))
                        socket.emit('playerShot', objects[objectsToRender[i]]['playerNum']);
                }

            }

            lastShot = utcTime;
        }
    }

    if(localPlayer.weaponHeld == 2){
        if(utcTime>lastShot+1){
            for(let i = 0; i<objectsToRender.length; i++){
                if(objects[objectsToRender[i]]['type']=='remotePlayer' &&playerPointedAt == objects[objectsToRender[i]]['playerNum']&& Math.abs(objects[objectsToRender[i]]['dirDiff'])<0.25 && Math.abs(objects[objectsToRender[i]]['distFromPlayer'])<30){
                    if(!wallBetween(objects[objectsToRender[i]],localPlayer)) //line above also checks distance < 30 for melee
                       for(let hits = 0; hits<2; hits++) // does 2 damage
                        socket.emit('playerShot', objects[objectsToRender[i]]['playerNum']);
                }

            }

            lastShot = utcTime;
        }
    }



}

socket.on('playerShot', function(msg) {
    if(msg==localPlayer.playerNum){
        localPlayerShot();
    }

});



socket.on('playerDataNew', function(msg) {
remotePlayers = msg;
    playerCount = 0;
    for(let i = 0; i<remotePlayers.length; i++)
        if(remotePlayers[i]!=null)
            playerCount++;

for(let i = 0; i<remotePlayers.length; i++)
    if(remotePlayers[i]!=null && remotePlayers[i]['playerNum']==localPlayer.playerNum)
        remotePlayers[i] = null; //removes you from the list of remote players
});

socket.on('gameVersion', function(msg) {
    serverVersion = msg;
});
