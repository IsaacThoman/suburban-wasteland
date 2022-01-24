const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const PI = Math.PI;
const radToDeg = 1/3.14*180;
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
let wall1 = {'type':'wall','x1':100,'y1':100,'x2':100,'y2':25};
let wall2 = {'type':'wall','x1':100,'y1':25,'x2':25,'y2':25};
let wall3 = {'type':'wall','x1':25,'y1':25,'x2':25,'y2':100};
let wall4 = {'type':'wall','x1':25,'y1':100,'x2':100,'y2':100};

let objects = [wall1,wall2,wall3,wall4,mikeObject];
let objectsToRender = [];

let localPlayer = {'x':150,'y':150,'dir':3.14/2};
let playerSpeed = 2.5;
let rotationSpeed = 0.025;
let FOV = 3.14/2;

requestAnimationFrame(doFrame);
function doFrame(){
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

function playerControls(){
    if(keys.up){
        localPlayer.x+= Math.cos(localPlayer.dir);
        localPlayer.y-= Math.sin(localPlayer.dir);
    }
    if(keys.down){
        localPlayer.x-= Math.cos(localPlayer.dir);
        localPlayer.y+= Math.sin(localPlayer.dir);
    }
    if(keys.left){
        localPlayer.dir+=rotationSpeed;
    }
    if(keys.right){
        localPlayer.dir-=rotationSpeed;
    }

    if(localPlayer.dir<0)
        localPlayer.dir=2*PI;
    if(localPlayer.dir>2*PI)
        localPlayer.dir = 0;
}
let frameOn = 0;


function prepareForRender(){
    for(let i = 0; i<objects.length; i++){
        if(objects[i].type == 'remotePlayer'){
            objects[i]['x1'] = objects[i].x; objects[i]['x2'] = objects[i].x;
            objects[i]['y1'] = objects[i].y; objects[i]['y2'] = objects[i].y;
        }
        objects[i]['centerX'] = (objects[i].x1+objects[i].x2)/2;
        objects[i]['centerY'] = (objects[i].y1+objects[i].y2)/2;
        objects[i]['distFromPlayer'] = Math.sqrt(Math.pow(localPlayer.x-objects[i].x1 ,2)+Math.pow(localPlayer.y-objects[i].y1,2));
        objects[i]['dirFromPlayer'] = Math.atan2(objects[i].y1 - localPlayer.y,objects[i].x1 - localPlayer.x);

        objects[i]['distFromPlayer2'] = Math.sqrt(Math.pow(localPlayer.x-objects[i].x2 ,2)+Math.pow(localPlayer.y-objects[i].y2,2));
        objects[i]['dirFromPlayer2'] = Math.atan2(objects[i].y2 - localPlayer.y,objects[i].x2 - localPlayer.x);



        //this line mods by a rotation, and shifts up by a rotation, and mods again. This makes it positive.
        let adjustedDirFromPlayer = ((((objects[0]['dirFromPlayer']%(2*PI))+(2*PI))%(2*PI)));

        let side1 = 0*PI-(localPlayer.dir+FOV/2);
        let side2 = 2*PI-(localPlayer.dir-FOV/2);
        side1 = ((((side1%(2*PI))+(2*PI))%(2*PI)));
        side2 = ((((side2%(2*PI))+(2*PI)%(2*PI))));

        let angDiffOld = (localPlayer.dir - (Math.atan2(objects[i]['y1']-localPlayer.y,objects[i]['x1']-localPlayer.x)+ PI + 2*PI)%(2*PI)-PI);

        objects[i]['inFOV'] = angDiffOld>FOV/2&&angDiffOld<0-FOV/2;
     //   objects[i]['inFOV'] = adjustedDirFromPlayer>=side1 && adjustedDirFromPlayer<=side2 ;
        ///   side2>adjDir>side1
        //  objects[i]['inFOV'] = true;
        frameOn++;
        if(frameOn%60==0){
            //    console.log('adjDir:    '+Math.floor(adjustedDirFromPlayer*radToDeg));
            //    console.log('playerDir: '+ Math.floor(side2*radToDeg)+','+Math.floor(side1*radToDeg));
            console.log(localPlayer.dir*radToDeg)
        //    console.log(adjustedDirFromPlayer*radToDeg)
        }


    }

    objectsToRender = [];
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
    ctx.lineTo(localPlayer.x+Math.cos(localPlayer.dir-FOV/2)*1000,localPlayer.y-Math.sin(localPlayer.dir-FOV/2)*1000);
    ctx.stroke();
    ctx.moveTo(localPlayer.x,localPlayer.y);
    ctx.lineTo(localPlayer.x+Math.cos(localPlayer.dir+FOV/2)*1000,localPlayer.y-Math.sin(localPlayer.dir+FOV/2)*1000);
    ctx.stroke();
    ctx.closePath();




}

function render3D(){

}