const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const PI = Math.PI;
const radToDeg = 1/3.14*180;
const debugMode = false;
const screen = {'width':320,'height':200};
let frameOn = 0;
let keys; resetKeys();
function resetKeys(){ keys = {'up':false,'down':false,'left':false,'right':false, 'w':false, 'a':false,'s':false,'d':false,'shift':false,'control':false,'u':false,'h':false,'j':false,'k':false,'space':false} }
let renderMode = 0;
let interfaceEnabled = false;
let usernameTyped = '';
const startingPoints = [
    {x: 124, y: 454, dir: -1.07},
    {x: 65, y: 366, dir: -0.068},
    {x: 70, y: 403, dir: -0.39},
    {x: 50, y: 232, dir: 0.43},
    {x: 65, y: 208, dir: 0.45},
    {x: 241, y: 39, dir: 1.37},
    {x: 329, y: 54, dir: 1.99},
    {x: 391, y: 113, dir: 2.25},
    {x: 501, y: 140, dir: 2.60},
    {x: 547, y: 318, dir: 3.36},
    {x: 494, y: 443, dir: 3.89},
    {x: 407, y: 514, dir: 4.32},
    {x: 257, y: 539, dir: 5.17}
]
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) {
    if(interfaceEnabled) {
        let nonLetters = [9,20,16,8,13,46,17,18];

        if (e.keyCode == 27) {// escape
            interfaceEnabled = false;
            return;
        }

        if (e.keyCode == 13) { //enter
            localPlayer.name = usernameTyped;
            interfaceEnabled = false;
            return;
        }

    if(e.keyCode==8)//backspace
        usernameTyped = usernameTyped.substring(0,usernameTyped.length-1);

        if(nonLetters.indexOf(e.keyCode)==-1)
            usernameTyped+= e.key;

    localPlayer.name = usernameTyped;

        return;}

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

        case 84: interfaceEnabled = true; resetKeys(); usernameTyped=''; break;
    }

    switch(e.keyCode){
        case 49: if(localPlayer.weaponHeld!=1){localPlayer.weaponHeld = 1; lastShot = utcTime; }break;// 1
        case 50: if(localPlayer.weaponHeld!=2){localPlayer.weaponHeld = 2; lastShot = utcTime; }break;// 2
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

    if(e.keyCode == 90)
        addedObjects.pop();
}
function keyUpHandler(e) {
    if(interfaceEnabled)return;
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
let disallowedMoveBlocks = [];
let objectsToRender = [];
let localPlayer = {'x':0,'y':0,'dir':0,'playerNum':Math.floor(Math.random()*90000+10000),'lives':3,'crouching':false,'inPain':false,'weaponHeld':1,'name':''};
resetPlayer();
let playerSpeed = 1.2;
let playerSpeedMultiplier = 1;
let rotationSpeed = 0.025;
let FOV = 0.4*3.14;

let comicTelemetry = '';
let timeLocalWasShot = 0;
let framesSinceShot = 10;
let framesSinceHeal =10;

let playerPointedAt = -1;

let firstWallPos = {};
let addedObjects = [];

let handAnimFrame = 0;
let handY = 0;
let framesInHandAnim = 15;

let lastSecond = utcTime;
let framesSinceLastSecond = 0;
let framesPerSecond = 60;
let gameSpeed = 1;


function doFrame(){

    if(localPlayer.crouching)
        screen.height = 160;
    else
        screen.height = 200;


    makeObjectsList();

    playerControls();
    prepareForRender();

    getCrosshairObject();

fillSky();
    if(renderMode==0)
        render3D();
    if(renderMode==1)
        renderTopDown(true);

    if(interfaceEnabled){
        let blinker = '|';
        if(frameOn%40<20)blinker = '';
        ctx.fillStyle = "#9ae090";
        ctx.font = '14px Comic Sans MS';
        ctx.fillText('Set name: '+usernameTyped+blinker, 15, screen.height/4);
    }


    uploadPlayerData();

    if(handAnimFrame==0) //sets hand
        updateHeldWeapon();

    if(handAnimFrame <=framesInHandAnim)
        handY = screen.height-handAnimFrame*screen.height/framesInHandAnim;
    if(utcTime>lastShot+1 && handAnimFrame<=framesInHandAnim){
        handAnimFrame++;
    }
    if(utcTime<lastShot+1 && handAnimFrame>=0){
        handAnimFrame--;
    }





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

    framesSinceLastSecond++;
    if(utcTime>lastSecond+1){
        lastSecond = utcTime;
        framesPerSecond = framesSinceLastSecond;
        framesSinceLastSecond = 0;
    }
  if(serverVersion!=gameVersion)
      comicTelemetry = 'You\'re running an outdated version. Try a hard refresh.';
    gameSpeed = 1*60/framesPerSecond;

    ctx.fillStyle = "#9ae090";
    ctx.font = '10px Comic Sans MS';
    ctx.fillText(comicTelemetry, 0, 10);

    utcTime = (new Date()).getTime() / 1000;
    frameOn++;
    requestAnimationFrame(doFrame);
}
requestAnimationFrame(doFrame);

function updateHeldWeapon(){
    if(localPlayer.weaponHeld==1)
        handToUse = 0;
    if(localPlayer.weaponHeld==2)
        handToUse = 1;
}

function makeObjectsList(){

    let wall1 = {'type':'wall','x1':100,'y1':300,'x2':25,'y2':380,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall2 = {'type':'wall','x1':200,'y1':300,'x2':275,'y2':380,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall3 = {'type':'wall','x1':145,'y1':380,'x2':155,'y2':380,'color':"#9f389d",'outlineColor':"#c7c7c7"};

    let wall4 = {'type':'wall','x1':145,'y1':380,'x2':145,'y2':450,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall5 = {'type':'wall','x1':155,'y1':380,'x2':155,'y2':450,'color':"#9f389d",'outlineColor':"#c7c7c7"};



    objects = [];


    for(let i = 0; i<addedObjects.length; i++)
        objects.push(addedObjects[i]);

    for(let i = 0; i<levelBuilt.length; i++){
        objects.push(levelBuilt[i])
    }

    //pillar turtle
    let pT = {x:300,y:0,dir:0,faceCount:70,size:25};

    for(let i = 0; i<pT.faceCount; i++){
        let nextX = pT.x+(Math.cos(pT.dir)*pT.size);
        let nextY = pT.y+(Math.sin(pT.dir)*pT.size);

        let pillarWall = {'type':'wall','x1':pT.x,'y1':pT.y,'x2':nextX,'y2':nextY,'color':"#663db9",'outlineColor':"#c7c7c7"};
        objects.push(pillarWall);
        pT.x = nextX;
        pT.y = nextY;
        pT.dir+=2*PI/pT.faceCount;

    }

    let splitSize = 25;
    let color = "#4b389f";
    let outlineColor = "#6464c7";

    // for(let i = 0; i<300; i+=splitSize){
    //     let outerWall = {'type':'wall','x1':i,'y1':5,'x2':i+splitSize,'y2':5,'color':color,'outlineColor':outlineColor};
    //     objects.push(outerWall);
    //     outerWall = {'type':'wall','x1':5,'y1':i,'x2':5,'y2':i+splitSize,'color':color,'outlineColor':outlineColor};
    //     objects.push(outerWall);
    //     outerWall = {'type':'wall','x1':300,'y1':i,'x2':300,'y2':i+splitSize,'color':color,'outlineColor':outlineColor};
    //     objects.push(outerWall);
    // }

    // color = "#608dc4";
    // outlineColor = "#6464c7";
    // for(let i = 0; i<100; i+=splitSize){
    //     let outerWall = {'type':'wall','x1':i,'y1':300,'x2':i+splitSize,'y2':300,'color':color,'outlineColor':outlineColor};
    //     objects.push(outerWall);
    //     outerWall = {'type':'wall','x1':300-i,'y1':300,'x2':300-i-splitSize,'y2':300,'color':color,'outlineColor':outlineColor};
    //     objects.push(outerWall);
    // }



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
                //playerPointedAt = -1;
            }

        }
    }
}

// mouse locking from https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
canvas.requestPointerLock = canvas.requestPointerLock;  //mouse lock stuff
document.exitPointerLock = document.exitPointerLock;
canvas.onclick = function() {
    canvas.requestPointerLock();
    cKeyPressed();
}
document.addEventListener('pointerlockchange', toggleUseMouse, false);
let usingMouse = false;
function toggleUseMouse(){
    usingMouse = (document.pointerLockElement === canvas);
    if(usingMouse)
        document.addEventListener("mousemove", mouseUpdate, false);
    else
        document.removeEventListener("mousemove", mouseUpdate, false);
}
function mouseUpdate(e){
    localPlayer.dir+= e.movementX/550;
}


function playerControls(){
    let newPos = {x:localPlayer.x, y:localPlayer.y};
    let moveKeyHeld = (keys.up||keys.w||keys.down||keys.s||keys.a||keys.d);
    let moveX = 0;
    let moveY = 0;

    if(keys.up||keys.w)
        moveY = 1;
    if(keys.down||keys.s)
        moveY = -1;
    if(keys.a)
        moveX = -1;
    if(keys.d)
        moveX = 1;

    let movementDir = Math.atan2(moveX,moveY);

if(moveKeyHeld) {
    newPos.x += Math.cos(localPlayer.dir + movementDir) * playerSpeed *playerSpeedMultiplier* gameSpeed;
    newPos.y += Math.sin(localPlayer.dir + movementDir) * playerSpeed *playerSpeedMultiplier* gameSpeed;
}

    if(keys.left){
        localPlayer.dir-=rotationSpeed*gameSpeed;
    }
    if(keys.right){
        localPlayer.dir+=rotationSpeed*gameSpeed;
    }

    if(!wallBetween(localPlayer,newPos)){
        localPlayer.x = newPos.x;
        localPlayer.y = newPos.y;
    }


    playerSpeedMultiplier = 1;

    if(keys.shift){
        localPlayer.crouching = true;
        playerSpeedMultiplier = 0.4;
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
        resetPlayer();
    }
    timeLocalWasShot = utcTime;
}

function resetPlayer(){
    let randomPoint = Math.floor(Math.random()*startingPoints.length);
    localPlayer.x = startingPoints[randomPoint].x;
    localPlayer.y = startingPoints[randomPoint].y;
    localPlayer.dir = startingPoints[randomPoint].dir;
    localPlayer.lives = 3;
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