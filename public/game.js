const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const PI = Math.PI;
const radToDeg = 1/3.14*180;
const screen = {'width':320,'height':200};
let frameOn = 0;
let keys = {'up':false,'down':false,'left':false,'right':false, 'w':false, 'a':false,'s':false,'d':false};
let renderMode = 0;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) {
    switch(e.keyCode){
        case 38: keys.up = true;    break;
        case 40: keys.down = true;  break;
        case 37: keys.left = true;  break;
        case 39: keys.right = true; break;

        case 87: keys.w = true; break;
        case 65: keys.a = true; break;
        case 83: keys.s = true; break;
        case 68: keys.d = true; break;
    }
    if (e.keyCode === 81)
        if (renderMode == 1)
            renderMode = 0;
        else
            renderMode = 1;
}
function keyUpHandler(e) {
    switch(e.keyCode){
        case 38: keys.up = false;    break;
        case 40: keys.down = false;  break;
        case 37: keys.left = false;  break;
        case 39: keys.right = false; break;

        case 87: keys.w = false; break;
        case 65: keys.a = false; break;
        case 83: keys.s = false; break;
        case 68: keys.d = false; break;
    }
}




let objects = [];
let objectsToRender = [];
let localPlayer = {'x':150,'y':150,'dir':-1.2*PI/2,'playerNum':-1};
let playerSpeed = 2.5;
let rotationSpeed = 0.025;
let FOV = 1*3.14;

function doFrame(){

    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.rect(0,0,1000,screen.height/2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "#969696";
    ctx.beginPath();
    ctx.rect(0,screen.height/2,1000,1000);
    ctx.fill();
    ctx.closePath();

    makeObjectsList();

    playerControls();
    prepareForRender();

    if(renderMode==0)
        render3D();
    if(renderMode==1)
        renderTopDown();

    uploadPlayerData();

    requestAnimationFrame(doFrame);
}
requestAnimationFrame(doFrame);

function makeObjectsList(){

    let wall1 = {'type':'wall','x1':100,'y1':100,'x2':100,'y2':25,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall2 = {'type':'wall','x1':100,'y1':25,'x2':25,'y2':25,'color':"#719f38",'outlineColor':"#c7c7c7"};
    let wall3 = {'type':'wall','x1':25,'y1':25,'x2':25,'y2':100,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall4 = {'type':'wall','x1':25,'y1':100,'x2':100,'y2':100,'color':"#9f389d",'outlineColor':"#c7c7c7"};

    objects = [wall1,wall2,wall3,wall4];

    let splitSize = 25;
    let color = "#4b389f";
   // let outlineColor = "#4b389f";
    let outlineColor = "#6464c7";

    for(let i = 0; i<300; i+=splitSize){
        let outerWall = {'type':'wall','x1':i,'y1':5,'x2':i+splitSize,'y2':5,'color':color,'outlineColor':outlineColor};
        objects.push(outerWall);
        outerWall = {'type':'wall','x1':i,'y1':300,'x2':i+splitSize,'y2':300,'color':color,'outlineColor':outlineColor};
        objects.push(outerWall);
        outerWall = {'type':'wall','x1':5,'y1':i,'x2':5,'y2':i+splitSize,'color':color,'outlineColor':outlineColor};
        objects.push(outerWall);
        outerWall = {'type':'wall','x1':300,'y1':i,'x2':300,'y2':i+splitSize,'color':color,'outlineColor':outlineColor};
        objects.push(outerWall);
    }

    for(let i = 0; i<remotePlayers.length; i++){
        if(remotePlayers[i]!=null && remotePlayers[i].hasOwnProperty('x') && remotePlayers[i].hasOwnProperty('y') && remotePlayers[i].hasOwnProperty('dir')){
            let mikeObject = {'type':'remotePlayer','x':remotePlayers[i]['x'],'y':remotePlayers[i]['y'],'dir':remotePlayers[i]['dir']};
            objects.push(mikeObject);
        }
    }


}


function playerControls(){
    if(keys.up||keys.w){
        localPlayer.x+= Math.cos(localPlayer.dir);
        localPlayer.y+= Math.sin(localPlayer.dir);
    }
    if(keys.down||keys.s){
        localPlayer.x-= Math.cos(localPlayer.dir);
        localPlayer.y-= Math.sin(localPlayer.dir);
    }
    //strafing
    if(keys.a){
        localPlayer.x+= Math.cos(localPlayer.dir-3.14/2);
        localPlayer.y+= Math.sin(localPlayer.dir-3.14/2);
    }
    if(keys.d){
        localPlayer.x+= Math.cos(localPlayer.dir+3.14/2);
        localPlayer.y+= Math.sin(localPlayer.dir+3.14/2);
    }

    if(keys.left){
        localPlayer.dir-=rotationSpeed;
    }
    if(keys.right){
        localPlayer.dir+=rotationSpeed;
    }

    localPlayer.dir = localPlayer.dir%(2*PI);
}



