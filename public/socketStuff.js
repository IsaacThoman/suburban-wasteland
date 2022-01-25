const socket = io();

let lastUpload = 0;
let playerCount = 0;

let killOldMikes = true;
let remotePlayers = [];
let uploads = 0;

function uploadPlayerData(){
    uploads++;
    if(lastUpload==localPlayer.x+localPlayer.y+localPlayer.dir && uploads%(3*60)!=0)
        return;
    socket.emit('playerData',localPlayer);
    lastUpload = localPlayer.x+localPlayer.y+localPlayer.dir;
}

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