const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const PI = Math.PI;
const radToDeg = 1/3.14*180;
const debugMode = false;
const screen = {'width':320,'height':200};
let frameOn = 0;
let keys = {'up':false,'down':false,'left':false,'right':false, 'w':false, 'a':false,'s':false,'d':false,'shift':false,'control':false,'u':false,'h':false,'j':false,'k':false,'space':false};
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

        case 85: keys.u = true; break;
        case 72: keys.h = true; break;
        case 74: keys.j = true; break;
        case 75: keys.k = true; break;

        case 16: keys.shift = true; break;
        case 17: keys.control = true; break;
    }
    if (e.keyCode === 81)
        if (renderMode == 1)
            renderMode = 0;
        else
            renderMode = 1;

    if(e.keyCode == 67 || e.keyCode == 32)
        cKeyPressed();

    if(e.keyCode == 76 && debugMode)
        lockToClosestWall();

    if(e.keyCode == 79 && debugMode)
        setFirstWallPos();

    if(e.keyCode == 80 && debugMode)
        setSecondWallPos();
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

        case 85: keys.u = false; break;
        case 72: keys.h = false; break;
        case 74: keys.j = false; break;
        case 75: keys.k = false; break;

        case 16: keys.shift = false; break;
        case 17: keys.control = false; break;
    }
}


let utcTime = (new Date()).getTime() / 1000;
let objects = [];
let objectsToRender = [];
let localPlayer = {'x':235,'y':50,'dir':1.8,'playerNum':-1,'lives':3,'crouching':false,'inPain':false};
let playerSpeed = 1;
let rotationSpeed = 0.025;
let FOV = 0.5*3.14;

let comicTelemetry = '';
let timeLocalWasShot = 0;
let framesSinceShot = 10;
let framesSinceHeal =10;

let playerPointedAt = -1;

let firstWallPos = {};
let addedObjects = [];


function doFrame(){

    if(localPlayer.crouching)
        screen.height = 160;
    else
        screen.height = 200;

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

    getCrosshairObject();

    if(renderMode==0)
        render3D();
    if(renderMode==1)
        renderTopDown(false);

    uploadPlayerData();


    ctx.fillStyle = "#9ae090";
    ctx.font = '12px Comic Sans MS';
    ctx.fillText(comicTelemetry, 0, 12);

    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.rect(screen.width/2,100,2,2);
    ctx.fill();
    ctx.closePath();

    framesSinceShot++;
    framesSinceHeal++;
    localPlayer.inPain = (framesSinceShot<5);
    if(framesSinceShot<5 || framesSinceHeal<5){
        if(framesSinceShot<5)
            ctx.fillStyle = "rgba(255,0,0,0.3)";
        else
            ctx.fillStyle = "rgba(0,255,0,0.3)";
        ctx.beginPath();
        ctx.rect(0,0,1000,1000);
        ctx.fill();
        ctx.closePath();
    }
    if(timeLocalWasShot+5<utcTime && localPlayer.lives<3){
        timeLocalWasShot = utcTime;
        localPlayer.lives++;
        framesSinceHeal = 0;
    }


    utcTime = (new Date()).getTime() / 1000;
    requestAnimationFrame(doFrame);
}
requestAnimationFrame(doFrame);

function makeObjectsList(){

    let wall1 = {'type':'wall','x1':100,'y1':300,'x2':100,'y2':380,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall2 = {'type':'wall','x1':200,'y1':300,'x2':200,'y2':380,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall3 = {'type':'wall','x1':145,'y1':380,'x2':155,'y2':380,'color':"#9f389d",'outlineColor':"#c7c7c7"};

    let wall4 = {'type':'wall','x1':145,'y1':380,'x2':145,'y2':450,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall5 = {'type':'wall','x1':155,'y1':380,'x2':155,'y2':450,'color':"#9f389d",'outlineColor':"#c7c7c7"};


    objects = [wall1,wall2,wall3,wall4,wall5];

    for(let i = 0; i<addedObjects.length; i++)
        objects.push(addedObjects[i]);

    //pillar turtle
    // let pt = {x:150,y:150,dir:0,faceCount:6,size:15};
    // for(let i = 0; i<pt.faceCount; i++){
    //     let nextX = pt.x+(Math.cos(pt.dir)*pt.size);
    //     let nextY = pt.y+(Math.sin(pt.dir)*pt.size);
    //
    //     let pillarWall = {'type':'wall','x1':pt.x,'y1':pt.y,'x2':nextX,'y2':nextY,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    //     objects.push(pillarWall);
    //     pt.x = nextX;
    //     pt.y = nextY;
    //     pt.dir+=2*PI/pt.faceCount;
    //
    // }

    let splitSize = 25;
    let color = "#4b389f";
    let outlineColor = "#6464c7";

    for(let i = 0; i<300; i+=splitSize){
        let outerWall = {'type':'wall','x1':i,'y1':5,'x2':i+splitSize,'y2':5,'color':color,'outlineColor':outlineColor};
        objects.push(outerWall);
        outerWall = {'type':'wall','x1':5,'y1':i,'x2':5,'y2':i+splitSize,'color':color,'outlineColor':outlineColor};
        objects.push(outerWall);
        outerWall = {'type':'wall','x1':300,'y1':i,'x2':300,'y2':i+splitSize,'color':color,'outlineColor':outlineColor};
        objects.push(outerWall);
    }

    color = "#608dc4";
    outlineColor = "#6464c7";
    for(let i = 0; i<100; i+=splitSize){
        let outerWall = {'type':'wall','x1':i,'y1':300,'x2':i+splitSize,'y2':300,'color':color,'outlineColor':outlineColor};
        objects.push(outerWall);
        outerWall = {'type':'wall','x1':300-i,'y1':300,'x2':300-i-splitSize,'y2':300,'color':color,'outlineColor':outlineColor};
        objects.push(outerWall);
    }



    for(let i = 0; i<remotePlayers.length; i++){
        if(remotePlayers[i]!=null && remotePlayers[i].hasOwnProperty('x') && remotePlayers[i].hasOwnProperty('y') && remotePlayers[i].hasOwnProperty('dir') && remotePlayers[i].hasOwnProperty('playerNum')){
            //let mikeObject = {'type':'remotePlayer','x':remotePlayers[i]['x'],'y':remotePlayers[i]['y'],'dir':remotePlayers[i]['dir'],'playerNum':remotePlayers[i]['playerNum']};
            let mikeObject = remotePlayers[i];
            mikeObject['type'] = 'remotePlayer';
            objects.push(mikeObject);
        }
    }


}

function getCrosshairObject(){
    for(let i = objectsToRender.length-1; i>=0; i--){
        let theObject = objects[objectsToRender[i]];
        if(theObject.type=='remotePlayer'){
            if(Math.abs(theObject['dirDiff'])<0.1){
                playerPointedAt =  theObject['playerNum'];
            }else{
                playerPointedAt = -1;
            }

        }
    }
}

function playerControls(){
    if(keys.up||keys.w){
        localPlayer.x+= Math.cos(localPlayer.dir)*playerSpeed;
        localPlayer.y+= Math.sin(localPlayer.dir)*playerSpeed;
    }
    if(keys.down||keys.s){
        localPlayer.x-= Math.cos(localPlayer.dir)*playerSpeed;
        localPlayer.y-= Math.sin(localPlayer.dir)*playerSpeed;
    }
    //strafing
    if(keys.a){
        localPlayer.x+= Math.cos(localPlayer.dir-3.14/2)*playerSpeed;
        localPlayer.y+= Math.sin(localPlayer.dir-3.14/2)*playerSpeed;
    }
    if(keys.d){
        localPlayer.x+= Math.cos(localPlayer.dir+3.14/2)*playerSpeed;
        localPlayer.y+= Math.sin(localPlayer.dir+3.14/2)*playerSpeed;
    }

    if(keys.left){
        localPlayer.dir-=rotationSpeed;
    }
    if(keys.right){
        localPlayer.dir+=rotationSpeed;
    }


    playerSpeed = 1;

    if(keys.shift){
        localPlayer.crouching = true;
        playerSpeed = 0.4;
    }else{
        localPlayer.crouching = false;
    }

    localPlayer.dir = localPlayer.dir%(2*PI);

    if(debugMode){
        if(keys.u)
            localPlayer.y-=1;
        if(keys.j)
            localPlayer.y+=1;
        if(keys.h)
            localPlayer.x-=1;
        if(keys.k)
            localPlayer.x+=1;
    }

}

function localPlayerShot(){
    console.log('you\'ve been shot!!')
    localPlayer.lives--;
framesSinceShot = 0;

    if(localPlayer.lives<=0){
        localPlayer.x = 235;
        localPlayer.y = 50;
        localPlayer.dir = 1.8;
        localPlayer.lives = 3;
    }
    timeLocalWasShot = utcTime;
}

function lockToClosestWall(){
    let smallestDist = 1000;
    let smallestX = 0;
    let smallestY = 0;
    for(let i = 0; i<objects.length; i++){
        let dist1 = Math.sqrt(Math.pow(objects[i].x1-localPlayer.x,2)+Math.pow(objects[i].y1-localPlayer.y,2));
        let dist2 = Math.sqrt(Math.pow(objects[i].x2-localPlayer.x,2)+Math.pow(objects[i].y2-localPlayer.y,2));
        if(dist1<smallestDist){
            smallestDist = dist1;
            smallestX = objects[i].x1;
            smallestY = objects[i].y1;
        }
        if(dist2<smallestDist){
            smallestDist = dist2;
            smallestX = objects[i].x2;
            smallestY = objects[i].y2;
        }

    }
    localPlayer.x = smallestX;
    localPlayer.y = smallestY;
}


function setFirstWallPos(){
firstWallPos = {x:localPlayer.x, y:localPlayer.y};
}

function setSecondWallPos(){
    let newWall = {'type':'wall','x1':firstWallPos.x,'y1':firstWallPos.y,'x2':localPlayer.x,'y2':localPlayer.y,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    addedObjects.push(newWall)
    console.log(addedObjects)
}