const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const PI = Math.PI;
const radToDeg = 1/3.14*180;
const screen = {'width':320,'height':200};
let frameOn = 0;
let keys = {'up':false,'down':false,'left':false,'right':false};
let renderMode = 1;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) {
    switch(e.keyCode){
        case 38: keys.up = true;    break;
        case 40: keys.down = true;  break;
        case 37: keys.left = true;  break;
        case 39: keys.right = true; break;
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
    }
}

let mikeObject = {'type':'remotePlayer','x':140,'y':60};
let wall1 = {'type':'wall','x1':100,'y1':100,'x2':100,'y2':25,'color':"#9f389d"};
let wall2 = {'type':'wall','x1':100,'y1':25,'x2':25,'y2':25,'color':"#9f389d"};
let wall3 = {'type':'wall','x1':25,'y1':25,'x2':25,'y2':100,'color':"#9f389d"};
let wall4 = {'type':'wall','x1':25,'y1':100,'x2':100,'y2':100,'color':"#9f389d"};

let objects = [wall1,wall2,wall3,wall4,mikeObject];
let objectsToRender = [];

let localPlayer = {'x':150,'y':150,'dir':-1.5*PI/2};
let playerSpeed = 2.5;
let rotationSpeed = 0.025;
let FOV = 3.14/3;

let newFrameOn = 0;
function doFrame(){
    if(newFrameOn%10==0)
        console.log(localPlayer.dir);

    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.rect(0,0,1000,1000);
    ctx.fill();
    ctx.closePath();

    playerControls();
    prepareForRender();

    if(renderMode==0)
        render3D();
    if(renderMode==1)
        renderTopDown();

    requestAnimationFrame(doFrame);
}
requestAnimationFrame(doFrame);

function playerControls(){
    if(keys.up){
        localPlayer.x+= Math.cos(localPlayer.dir);
        localPlayer.y+= Math.sin(localPlayer.dir);
    }
    if(keys.down){
        localPlayer.x-= Math.cos(localPlayer.dir);
        localPlayer.y-= Math.sin(localPlayer.dir);
    }
    if(keys.left){
        localPlayer.dir-=rotationSpeed;
    }
    if(keys.right){
        localPlayer.dir+=rotationSpeed;
    }

    localPlayer.dir = localPlayer.dir%(2*PI);
}



function prepareForRender(){
    for(let i = 0; i<objects.length; i++){
        let thisObject = objects[i];
        if(objects[i].type == 'remotePlayer'){
            thisObject['x1'] = thisObject.x; thisObject['x2'] = thisObject.x;
            thisObject['y1'] = thisObject.y; thisObject['y2'] = thisObject.y;
        }
        thisObject['centerX'] = (thisObject.x1+thisObject.x2)/2;
        thisObject['centerY'] = (thisObject.y1+thisObject.y2)/2;
        thisObject['distFromPlayer'] = Math.sqrt(Math.pow(localPlayer.x-objects[i].x1 ,2)+Math.pow(localPlayer.y-objects[i].y1,2));
        thisObject['dirFromPlayer'] = Math.atan2(objects[i].y1 - localPlayer.y,objects[i].x1 - localPlayer.x);

        objects[i]['distFromPlayer2'] = Math.sqrt(Math.pow(localPlayer.x-objects[i].x2 ,2)+Math.pow(localPlayer.y-objects[i].y2,2));
        objects[i]['dirFromPlayer2'] = Math.atan2(objects[i].y2 - localPlayer.y,objects[i].x2 - localPlayer.x);

        let wallDirTest = Math.atan2(thisObject.y1 - localPlayer.y, thisObject.x1 - localPlayer.x);

        let angDiff = (localPlayer.dir - wallDirTest + PI + 2*PI) % (2*PI) - PI;



        frameOn++;

        thisObject['inFOV'] = angDiff>0-FOV/2&&angDiff<FOV/2;

    }

    objectsToRender = [];  //this bit of code fills the array with indexes of objects, sorted by distance from player
    let objectsCopy = objects.slice();
    for(let i = 0; i<objects.length; i++)
        objectsToRender[i] = i;

    for(let i = 0; i<objects.length; i++){
        for(let j = i; j<objects.length; j++){
            if(objectsCopy[j]['distFromPlayer']<objectsCopy[i]['distFromPlayer']){
                let iWas = objectsCopy[i];
                objectsCopy[i] = objectsCopy[j];
                objectsCopy[j] = iWas;
                let indIWas = objectsToRender[i];
                objectsToRender[i] = objectsToRender[j];
                objectsToRender[j] = indIWas;
            }
        }
    }

}

function renderTopDown(){
    for(let i = 0; i<objects.length; i++){
        if(objects[i].type=='wall'){
            ctx.strokeStyle = "#e37a4b";
            ctx.beginPath();
            ctx.moveTo(objects[i].x1,objects[i].y1);
            ctx.lineTo(objects[i].x2,objects[i].y2);
            ctx.stroke();
            ctx.closePath();

            if(objects[i].inFOV){
                ctx.strokeStyle = "#31ffa5";
                ctx.beginPath();
                ctx.moveTo(localPlayer.x,localPlayer.y);
                ctx.lineTo(localPlayer.x +Math.cos(objects[i]['dirFromPlayer'])*objects[i]['distFromPlayer'],localPlayer.y +Math.sin(objects[i]['dirFromPlayer'])*objects[i]['distFromPlayer']);
                ctx.stroke();
                ctx.closePath();
            }

        }
        if(objects[i].type=='remotePlayer'){
            ctx.fillStyle = "#eead62";
            ctx.beginPath();
            ctx.rect(objects[i].x-2,objects[i].y-2,4,4);
            ctx.fill();
            ctx.closePath();
        }

    }

    ctx.fillStyle = "#50a142"; //local player
    ctx.beginPath();
    ctx.rect(localPlayer.x-2,localPlayer.y-2,4,4);
    ctx.fill();
    ctx.closePath();

    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(localPlayer.x,localPlayer.y);
    ctx.lineTo(localPlayer.x+Math.cos(localPlayer.dir-FOV/2)*1000,localPlayer.y+Math.sin(localPlayer.dir-FOV/2)*1000);
    ctx.stroke();
    ctx.moveTo(localPlayer.x,localPlayer.y);
    ctx.lineTo(localPlayer.x+Math.cos(localPlayer.dir+FOV/2)*1000,localPlayer.y+Math.sin(localPlayer.dir+FOV/2)*1000);
    ctx.stroke();
    ctx.closePath();

}

const magicViewNumber = 0.6;
const magicViewNumber2 = 3000;
function render3D(){
for(let i = 0; i<objectsToRender.length; i++){
    let theObject = objects[objectsToRender[i]];
    if(theObject.type == 'wall'){
        if(theObject['inFOV']){
            ctx.beginPath();
            ctx.fillStyle = theObject.color;
            let planeXStart = (0-theObject['dirDiff'] + magicViewNumber) / (magicViewNumber*2)*screen.width;
            let planeXEnd = (0-theObject['dirDiff2'] + magicViewNumber) / (magicViewNumber*2)*screen.width;
            let adjPointDistStart = magicViewNumber2/theObject['dirDiff'];
            let adjPointDistEnd = magicViewNumber2/theObject['dirDiff2'];

            let lowerYStart = screen.height/2-adjPointDistStart;
            let upperYStart = screen.height/2+adjPointDistStart;
            let lowerYEnd = screen.height/2-adjPointDistEnd;
            let upperYEnd = screen.height/2+adjPointDistEnd;


            ctx.moveTo(planeXEnd,lowerYEnd);
            ctx.lineTo(planeXEnd,upperYEnd);
            ctx.lineTo(planeXStart,upperYStart);
            ctx.lineTo(planeXStart,lowerYStart)
            ctx.lineTo(planeXEnd,lowerYEnd);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();



            //     var pointDisplayX = (0-allRenderWalls1Dir[i][j] + magicViewNumber) /(magicViewNumber*2)*cWidth; //don't ask me how i got here

        }

    }
}
}