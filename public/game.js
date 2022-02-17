const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const PI = Math.PI;
const radToDeg = 1/3.14*180;
const debugMode = true;
const screen = {'width':320,'height':200};
let frameOn = 0;
let keys; resetKeys();
function resetKeys(){ keys = {'arrowup':false,'down':false,'arrowleft':false,'arrowright':false, 'w':false, 'a':false,'s':false,'d':false,'shift':false,'control':false,'u':false,'h':false,'j':false,'k':false,'space':false} }
let renderMode = 0;
let interfaceEnabled = false;
let usernameTyped = '';
const startingPoints = [
    [
        {x: 2065, y: 580, dir: PI},
        {x: 2065, y: 550, dir: PI},
        {x: 2065, y: 610, dir: PI}
    ]
    ,
    [
        {x: 265, y: 580, dir: 0},
        {x: 265, y: 550, dir: 0},
        {x: 265, y: 610, dir: 0}
    ]
]

const playerWidth = 7;


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

    keys[e.key.toLowerCase()] = true;

    switch(e.keyCode){
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

    if(e.key == '`')
        showStats = !showStats;
}
function keyUpHandler(e) {
    if(interfaceEnabled)return;
    keys[e.key.toLowerCase()] = false;
}

let utcTime = (new Date()).getTime() / 1000;
let objects = [];
let disallowedMoveBlocks = [];
let objectsToRender = [];
let localPlayer = {'x':0,'y':0,'dir':0,'playerNum':Math.floor(Math.random()*90000+10000),'lives':3,'crouching':false,'inPain':false,'weaponHeld':1,'name':'','killCount':0,'deathCount':-1,'team':0};
requestTeamAssign();
let playerSpeed = 1.6;
let playerSpeedMultiplier = 1;
let rotationSpeed = 0.025;
let FOV = 0.4*3.14;

let comicTelemetry = '';
let showStats = true;
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


fillSky();
    if(renderMode==0)
        render3D();
    if(renderMode==1)
        renderTopDown(false);

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
        framesPerSecond = framesSinceLastSecond-1;
        framesSinceLastSecond = 0;
    }
let KDR = 0;
    if(localPlayer.killCount!=0||localPlayer.deathCount!=0)
     KDR = Math.floor(localPlayer.killCount/localPlayer.deathCount*10)/10;
if(showStats)
    comicTelemetry = framesPerSecond+'FPS, '+playerCount+' players\n'+localPlayer.killCount+' kills'+'\n'+localPlayer.deathCount+' deaths'+'\nratio: '+KDR+'';
else
    comicTelemetry = '';


  if(serverVersion!=gameVersion)
      comicTelemetry = 'You\'re running an outdated version. Try a hard refresh.';
    gameSpeed = 1*60/framesPerSecond;

    ctx.fillStyle = "#9ae090";
    ctx.font = '8px Comic Sans MS';
    let telemList = comicTelemetry.split('\n');
    for(let i = 0; i<telemList.length; i++)
        ctx.fillText(telemList[i], 1, i*8+8);

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

let floorTiles = [];
function makeObjectsList(){

    let wall1 = {'type':'wall','x1':100,'y1':300,'x2':25,'y2':380,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall2 = {'type':'wall','x1':200,'y1':300,'x2':275,'y2':380,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall3 = {'type':'wall','x1':145,'y1':380,'x2':155,'y2':380,'color':"#9f389d",'outlineColor':"#c7c7c7"};

    let wall4 = {'type':'wall','x1':145,'y1':380,'x2':145,'y2':450,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let wall5 = {'type':'wall','x1':155,'y1':380,'x2':155,'y2':450,'color':"#9f389d",'outlineColor':"#c7c7c7"};

    // let heightTemp = frameOn%100;
    // if(frameOn%200>=100)
    //     heightTemp = 200-frameOn%200;
    let heightTemp = (Math.sin(utcTime)+1)*50;

    let wallTest = new Wall(200,200,200,210,1.5,0,'#9f389d','#c7c7c7');
    let wallTest2 = new Wall(200,210,200,270,1.1,heightTemp/50,'rgba(32,164,168,0.7)','#c7c7c7');
    let wallTest3 = new Wall(200,270,200,280,1.5,0,'#9f389d','#c7c7c7');
    let wallTest4 = new Wall(200,200,200,280,-0.6,1.5+0.6,'#9f389d','#c7c7c7',true);



    let gWall2 = new Wall(200,200,300,200,1.5);
    let gWall3 = new Wall(200,280,300,280,1.5);
    let gWall4 = new Wall(300,200,300,280,1.5);

    let p1 = new Point3D(300,280,1.5);
    let p2 = new Point3D(300,200,1.5);
    let p3 = new Point3D(200,200,1.5);
    let p4 = new Point3D(200,280,1.5);
    let testPlane = new Plane([p1,p2,p3,p4],"#cc5d5d",'#ffffff');

 //   objects = [wallTest,wallTest2,wallTest3,wallTest4,gWall3,gWall2,gWall4,testPlane];
    objects = [];

    let cactus = {'type':'cactus','x':270,'y':220,'dir':-3.55};
objects.push(cactus);


// for(let i = 0; i<floorTiles.length; i++)
//     objects.push(floorTiles[i]);
// if(frameOn%(60)==0){
//     floorTiles = [];
//     let sqrSize = 40;
//     let tilesLength = 1000;
//     let startX = Math.floor(localPlayer.x/sqrSize)*sqrSize;
//     let startY = Math.floor(localPlayer.y/sqrSize)*sqrSize;
//     for(let x = startX-tilesLength; x<startX+tilesLength; x+=sqrSize){
//         for(let y = startY-tilesLength; y<startY+tilesLength; y+=sqrSize){
//             let colorToUse = "#ffffff";
//             if((x+y)/sqrSize%2==0)colorToUse = "#000000";
//             let z = -1;
//             let p1 = new Point3D(x,y,z);
//             let p2 = new Point3D(x,y+sqrSize,z);
//             let p3 = new Point3D(x+sqrSize,y+sqrSize,z);
//             let p4 = new Point3D(x+sqrSize,y,z);
//             let testPlane = new Plane([p1,p2,p3,p4],colorToUse,'rgba(255,255,255,0)',-1000);
//             floorTiles.push(testPlane);
//         }
//     }
// }



for(let i = 0; i<serverObjects.length; i++)
    objects.push(serverObjects[i])


    for(let i = 0; i<addedObjects.length; i++)
        objects.push(addedObjects[i]);

// /*
 for(let i = 0; i<levelBuilt.length; i++){
        objects.push(levelBuilt[i])
    }
//*/

    //pillar turtle
    let pT = {x:300,y:0,dir:0,faceCount:70,size:25};
/*
    for(let i = 0; i<pT.faceCount; i++){
        let nextX = pT.x+(Math.cos(pT.dir)*pT.size);
        let nextY = pT.y+(Math.sin(pT.dir)*pT.size);

        let pillarWall = {'type':'wall','x1':pT.x,'y1':pT.y,'x2':nextX,'y2':nextY,'color':"#663db9",'outlineColor':"#c7c7c7"};
        objects.push(pillarWall);
        pT.x = nextX;
        pT.y = nextY;
        pT.dir+=2*PI/pT.faceCount;

    }
*/
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
    let moveKeyHeld = (keys.arrowup||keys.w||keys.down||keys.s||keys.a||keys.d);
    let moveX = 0;
    let moveY = 0;

    if(keys.arrowup||keys.w)
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

    if(keys.arrowleft){
        localPlayer.dir-=rotationSpeed*gameSpeed;
    }
    if(keys.arrowright){
        localPlayer.dir+=rotationSpeed*gameSpeed;
    }

    if(!wallBetween(localPlayer,newPos,'z',true,1.5)){
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
    let randomPoint = Math.floor(Math.random()*startingPoints[localPlayer.team].length);
    localPlayer.x = startingPoints[localPlayer.team][randomPoint].x;
    localPlayer.y = startingPoints[localPlayer.team][randomPoint].y;
    localPlayer.dir = startingPoints[localPlayer.team][randomPoint].dir;
    localPlayer.lives = 3;
    localPlayer['deathCount']++;
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
    //let newWall = {'type':'wall','x1':firstWallPos.x,'y1':firstWallPos.y,'x2':localPlayer.x,'y2':localPlayer.y,'color':"#9f389d",'outlineColor':"#c7c7c7"};
    let newWall = new Wall(firstWallPos.x,firstWallPos.y,localPlayer.x,localPlayer.y)
    addedObjects.push(newWall)
    console.log(addedObjects)
}