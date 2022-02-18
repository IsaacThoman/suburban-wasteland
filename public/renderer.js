let viewDistance = 2500;

let mikeImages = [];
for(let i = 0; i<64; i++)
    mikeImages[i] = new Image();

let mikeSheet = new Image(); mikeSheet.src = 'mike-sheet-combined.webp'; mikeSheet.onload = function(){mikeSheetLoaded();};

function mikeSheetLoaded(){
    let tempMikes = imgArrayFromSheet(mikeSheet,382,640,32,0);
    for(let i = 0; i<8; i++){
        mikeImages[i] = tempMikes[i];
        mikeImages[i+16] = tempMikes[i+8]

        mikeImages[i+32] = tempMikes[i+16];
        mikeImages[i+48] = tempMikes[i+24];
    }
    createMikesInPain();
}

let mikesInPainCreated = false;

let cactiLoaded = false;

let cactiSheet = new Image();
cactiSheet.src = 'cacti-sheet-128.webp';
cactiSheet.onload = function (){cactiLoaded = true;}


let handImg = [];
for(let i = 0; i<=2; i++){
    handImg[i] = new Image();
    handImg[i].src = 'hands/'+i+'.webp';
}

let handToUse = 0;


function imgArrayFromSheet(img,width,height,count,startIndex){
    let imgEditorCanvas = document.createElement("canvas");
    imgEditorCanvas.width = width;
    imgEditorCanvas.height = height;
    let editorCtx = imgEditorCanvas.getContext("2d");

    let out = [];
    for(let i = startIndex; i<count; i++){
        out[i] = new Image();
        editorCtx.clearRect(0,0,width*count,height);
        editorCtx.drawImage(img,width*i,0,width,height,0,0,width,height);

        out[i].src = imgEditorCanvas.toDataURL();
    }
    return out;
}

    function createMikesInPain(){
    console.log('started');
    let imgEditorCanvas = document.createElement("canvas");
    imgEditorCanvas.width = 382;
    imgEditorCanvas.height = 640;
    let editorCtx = imgEditorCanvas.getContext("2d");
    let indexesToHurt = [0,1,2,3,4,5,6,7,16,17,18,19,20,21,22,23,32,33,34,35,36,37,38,39,48,49,50,51,52,53,54,55];
    for(let j = 0; j<indexesToHurt.length; j++){
        let i = indexesToHurt[j];
        editorCtx.clearRect(0,0,1000,1000);
        editorCtx.drawImage(mikeImages[i],0,0)
        let tempImg = editorCtx.getImageData(0,0,382,640);
        let tempImgData = tempImg.data;
        let tempImgLength = tempImgData.length;
        for(let i=0; i < tempImgLength; i+=4){
            if(tempImgData[i+3]>15){
                tempImgData[i] +=50;
            }
        }
        tempImg.data = tempImgData;
        editorCtx.putImageData(tempImg,0,0);
        mikeImages[i+8].src = imgEditorCanvas.toDataURL()
    }
    mikesInPainCreated = true;
    console.log('done!');
    imgEditorCanvas.remove();
}

class Wall{
    constructor(x1,y1,x2,y2,height,z,color,outlineColor,priority) {
        this.color = "#b68181";
        this.outlineColor = "#ffffff";
        this.z = 0;
        this.height = 1;
        this.priority = false;

        this.type = 'wall';
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        if(color!=null)this.color = color;
        if(outlineColor!=null)this.outlineColor = outlineColor;
        if(height!=null)this.height = height;
        if(z!=null)this.z = z;
        if(priority!=null)this.priority = priority;
    }
}

class Point3D{
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Plane {
    constructor(points,color,outlineColor,priority) {
        this.type = 'plane';
        this.points = points;
        this.color = "#ff0000";
        this.outlineColor = "#ff4848";
        this.priority = false;
        if(color!=null)this.color = color;
        if(outlineColor!=null)this.outlineColor = outlineColor;
        if(priority!=null)this.priority = priority;
    }
}


function prepareForRender(){
    for(let i = 0; i<objects.length; i++){
        let thisObject = objects[i];
        if(objects[i].type == 'remotePlayer' || objects[i].type == 'cactus'){
            thisObject['x1'] = thisObject.x; thisObject['x2'] = thisObject.x;
            thisObject['y1'] = thisObject.y; thisObject['y2'] = thisObject.y;
        }


        thisObject['centerX'] = (thisObject.x1+thisObject.x2)/2;
        thisObject['centerY'] = (thisObject.y1+thisObject.y2)/2;

        thisObject['centerDistFromPlayer'] = Math.sqrt(Math.pow(localPlayer.x-objects[i].centerX ,2)+Math.pow(localPlayer.y-objects[i].centerY,2));

        thisObject['distFromPlayer'] = Math.sqrt(Math.pow(localPlayer.x-objects[i].x1 ,2)+Math.pow(localPlayer.y-objects[i].y1,2));
        thisObject['dirFromPlayer'] = Math.atan2(objects[i].y1 - localPlayer.y,objects[i].x1 - localPlayer.x);

        objects[i]['distFromPlayer2'] = Math.sqrt(Math.pow(localPlayer.x-objects[i].x2 ,2)+Math.pow(localPlayer.y-objects[i].y2,2));
        objects[i]['dirFromPlayer2'] = Math.atan2(objects[i].y2 - localPlayer.y,objects[i].x2 - localPlayer.x);

        if('priority' in thisObject){
            thisObject['centerDistFromPlayer'] -= thisObject['priority'];
        }


        objects[i]['dirDiff'] = (localPlayer.dir - objects[i]['dirFromPlayer'] +PI + 2*PI) % (2*PI)-PI
        objects[i]['dirDiff2'] = (localPlayer.dir - objects[i]['dirFromPlayer2'] +PI + 2*PI) % (2*PI)-PI

        let wallDirTest = Math.atan2(thisObject.y1 - localPlayer.y, thisObject.x1 - localPlayer.x);
        let wallDirTest2 = Math.atan2(thisObject.y2 - localPlayer.y, thisObject.x2 - localPlayer.x);

        let angDiff = (localPlayer.dir - wallDirTest + PI + 2*PI) % (2*PI) - PI;
        let angDiff2 = (localPlayer.dir - wallDirTest2 + PI + 2*PI) % (2*PI) - PI;


            let FOVEndPoint1 = new Point((localPlayer.x + Math.cos(localPlayer.dir + FOV / 2) * 1000), (localPlayer.y + Math.sin(localPlayer.dir + FOV / 2) * 1000));
            let FOVEndPoint2 = new Point((localPlayer.x + Math.cos(localPlayer.dir - FOV / 2) * 1000), (localPlayer.y + Math.sin(localPlayer.dir - FOV / 2) * 1000));
            let originPoint = new Point(localPlayer.x, localPlayer.y);
            let wallPoint1 = new Point(thisObject['x1'],thisObject['y1']); let wallPoint2 = new Point(thisObject['x2'],thisObject['y2']);
            thisObject['inFOV'] = ((angDiff>0-FOV/2&&angDiff<FOV/2) || (angDiff2>0-FOV/2&&angDiff2<FOV/2)) || (doIntersect(originPoint,FOVEndPoint1,wallPoint1,wallPoint2));

        if(thisObject['type']=='plane'){ //does its own sort of thing
            let sumDir = 0;
            let ptCount = thisObject['points'].length;
            for(let i = 0; i<ptCount; i++){
                let this3DPoint = thisObject['points'][i];
                this3DPoint['distFromPlayer'] = Math.sqrt(Math.pow(localPlayer.x-this3DPoint.x ,2)+Math.pow(localPlayer.y-this3DPoint.y,2));
                this3DPoint['dirFromPlayer'] = Math.atan2(this3DPoint.y - localPlayer.y,this3DPoint.x - localPlayer.x);
                this3DPoint['dirDiff'] = (localPlayer.dir - this3DPoint['dirFromPlayer'] +PI + 2*PI) % (2*PI)-PI;
                this3DPoint['inFOV'] = ((this3DPoint['dirDiff']>0-FOV/2&&this3DPoint['dirDiff']<FOV/2));
                if(this3DPoint['inFOV'])
                    thisObject['inFOV'] = true;
                sumDir+=this3DPoint['distFromPlayer'];
            }
            thisObject['centerDistFromPlayer'] = sumDir/ptCount;
        }

        if(thisObject['centerDistFromPlayer']>viewDistance)
            thisObject['inFOV'] = false;

    }

    objectsToRender = [];  //this bit of code fills the array with indexes of objects, sorted by distance from player
    let objectsCopy = objects.slice();
    for(let i = 0; i<objects.length; i++)
        objectsToRender[i] = i;

    for(let i = 0; i<objects.length; i++){
        for(let j = i; j<objects.length; j++){
            if(objectsCopy[j]['centerDistFromPlayer']>objectsCopy[i]['centerDistFromPlayer'] ){ //&& objectsCopy[i]['type']!='plane' ughhhh
                let iWas = objectsCopy[i];
                objectsCopy[i] = objectsCopy[j];
                objectsCopy[j] = iWas;
                let indIWas = objectsToRender[i];
                objectsToRender[i] = objectsToRender[j];
                objectsToRender[j] = indIWas;
            }
        }
    }

    for(let i = 0; i<remotePlayers.length; i++){
        let thePlayer = remotePlayers[i];
        let probablyReal = (thePlayer!= null && 'x' in thePlayer && 'y' in thePlayer && 'dir' in thePlayer);
        if(!probablyReal) continue;
        let playerPlane = new Wall(thePlayer['x']+ Math.cos(thePlayer.dir+PI/2)*playerWidth,thePlayer['y']+ Math.sin(thePlayer.dir+PI/2)*playerWidth,thePlayer['x']+ Math.cos(thePlayer.dir-PI/2)*playerWidth,thePlayer['y']+ Math.sin(thePlayer.dir-PI/2)*playerWidth,0.6,0,'#ff741b','#ffffff',false);
        let playerPlane2 = new Wall(thePlayer['x']+ Math.cos(thePlayer.dir)*playerWidth,thePlayer['y']+ Math.sin(thePlayer.dir)*playerWidth,thePlayer['x']+ Math.cos(thePlayer.dir-PI)*playerWidth,thePlayer['y']+ Math.sin(thePlayer.dir-PI)*playerWidth,0.6,0,'#ff741b','#ffffff',false);
        thePlayer['hitboxPlane'] = playerPlane;
        thePlayer['hitboxPlane2'] = playerPlane2;
    }


}
let topDownScale = 7;
function renderTopDown(showWallLines){

    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.rect(0,0,1000,1000);
    ctx.fill();
    ctx.closePath();

    for(let i = 0; i<objects.length; i++){
        //   if(objects[i].type=='wall'){
        ctx.strokeStyle = objects[i]['color'];
        ctx.beginPath();
        ctx.moveTo(objects[i].x1/topDownScale,objects[i].y1/topDownScale);
        ctx.lineTo(objects[i].x2/topDownScale,objects[i].y2/topDownScale);
        ctx.stroke();
        ctx.closePath();

        if(objects[i].inFOV && showWallLines){
            ctx.strokeStyle = "#31ffa5";
            ctx.beginPath();
            ctx.moveTo(localPlayer.x/topDownScale,localPlayer.y/topDownScale);
            ctx.lineTo((localPlayer.x +Math.cos(objects[i]['dirFromPlayer'])*objects[i]['distFromPlayer'])/topDownScale,(localPlayer.y +Math.sin(objects[i]['dirFromPlayer'])*objects[i]['distFromPlayer'])/topDownScale);
            ctx.stroke();
            ctx.closePath();
        }

        if(objects[i].type=='remotePlayer'){
            ctx.fillStyle = "#eead62";
            ctx.beginPath();
            ctx.rect((objects[i].x-3)/topDownScale,(objects[i].y-3)/topDownScale,6,6);
            ctx.fill();
            ctx.closePath();
        }

    }

    ctx.fillStyle = "#50a142"; //local player
    ctx.beginPath();
    ctx.rect((localPlayer.x-2)/topDownScale,(localPlayer.y-2)/topDownScale,4,4);
    ctx.fill();
    ctx.closePath();

if(showWallLines) {
    ctx.beginPath();
    ctx.moveTo(localPlayer.x / topDownScale, localPlayer.y / topDownScale);
    ctx.lineTo((localPlayer.x + Math.cos(localPlayer.dir - FOV / 2) * 1000) / topDownScale, (localPlayer.y + Math.sin(localPlayer.dir - FOV / 2) * 1000) / topDownScale);
    ctx.stroke();
    ctx.moveTo(localPlayer.x / topDownScale, localPlayer.y / topDownScale);
    ctx.lineTo((localPlayer.x + Math.cos(localPlayer.dir + FOV / 2) * 1000) / topDownScale, (localPlayer.y + Math.sin(localPlayer.dir + FOV / 2) * 1000) / topDownScale);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.closePath();
}
}

const magicViewNumber = 0.6;
const magicViewNumber2 = 5000;
function render3D(){
    for(let i = 0; i<objectsToRender.length; i++){
        let theObject = objects[objectsToRender[i]];
        if(theObject.inFOV){



            let planeXStart = (0-theObject['dirDiff'] + magicViewNumber) / (magicViewNumber*2)*screen.width;
            let planeXEnd = (0-theObject['dirDiff2'] + magicViewNumber) / (magicViewNumber*2)*screen.width;
            let planeYStart = magicViewNumber2/theObject['distFromPlayer'];
            let planeYEnd = magicViewNumber2/theObject['distFromPlayer2'];



            let lowerYStart = screen.height/2-planeYStart;
            let lowerYEnd = screen.height/2-planeYEnd;
            let upperYStart = screen.height/2+planeYStart;
            let upperYEnd = screen.height/2+planeYEnd;



            if(theObject.type == 'wall'){
                let topViewNumber = magicViewNumber2*theObject['height'];
                let bottomViewNumber = magicViewNumber2;
                topViewNumber+= theObject['z']*magicViewNumber2;
                bottomViewNumber-= theObject['z']*magicViewNumber2;
                let planeYStart2 = topViewNumber/theObject['distFromPlayer']; //tops
                let planeYEnd2 = topViewNumber/theObject['distFromPlayer2'];

                let planeYStart3 = bottomViewNumber/theObject['distFromPlayer']; //bottoms
                let planeYEnd3 = bottomViewNumber/theObject['distFromPlayer2'];
                lowerYStart = screen.height/2-planeYStart2;
                lowerYEnd = screen.height/2-planeYEnd2;
                upperYStart = screen.height/2+planeYStart3;
                upperYEnd = screen.height/2+planeYEnd3;


                ctx.beginPath();
                ctx.fillStyle = theObject.color;
                ctx.moveTo(planeXEnd,lowerYEnd);
                ctx.lineTo(planeXEnd,upperYEnd);
                ctx.lineTo(planeXStart,upperYStart);
                ctx.lineTo(planeXStart,lowerYStart)
                ctx.lineTo(planeXEnd,lowerYEnd);
                ctx.fill();
                if('outlineColor' in theObject){
                    ctx.strokeStyle = theObject.outlineColor;
                    ctx.stroke();
                }
                ctx.closePath();
            }

            if(theObject['type'] == 'plane'){
                ctx.beginPath();
                ctx.fillStyle = theObject.color;
                for(let i = 0; i<theObject['points'].length+1; i++){
                    let doFirstAgain = i == theObject['points'].length;
                    if(doFirstAgain) i = 0;
                    let the3DPoint = theObject['points'][i];
                    let x = (0-the3DPoint['dirDiff'] + magicViewNumber) / (magicViewNumber*2)*screen.width;
                    let y = (magicViewNumber2*the3DPoint['z'])/(the3DPoint['distFromPlayer']);
                    ctx.lineTo(x,screen.height/2-y)
                    if(doFirstAgain)break;
                }
                ctx.fill();
                if('outlineColor' in theObject){
                    ctx.strokeStyle = theObject.outlineColor;
                    ctx.stroke();
                }
                ctx.closePath();
            }



            if(theObject.type == 'remotePlayer'){
                let viewingAngle = (theObject['dirFromPlayer']+PI); //0-2PI value

                viewingAngle-= 15/radToDeg;

                let imgToShow = (Math.floor((0-(viewingAngle-(theObject['dir']))/6.28*8))+ 8 )% 8;

                let mikeWidth = 0.8*(upperYStart-lowerYStart);
                let mikeHeight = 1*(upperYStart-lowerYStart);

                while(imgToShow<0){
                    imgToShow+=8;
                    imgToShow%=8;
                }

                let drawX = planeXStart-mikeWidth/2;
                let drawY = (lowerYStart+mikeHeight/8);  // the +mikeHeight/8 makes them more eye-level
                let drawWidth = mikeWidth;
                let drawHeight = mikeHeight;
                if(theObject['crouching']){
                    drawHeight/=2;
                    drawY+=mikeHeight/2;
                }

                if(theObject['inPain'])
                    imgToShow+=8;
                if(theObject['weaponHeld']==2)
                    imgToShow+=16;
                if(theObject['team']===1)
                    imgToShow+=32;

                //   if(imgToShow>=0 && (imgToShow<8 || (mikesInPainCreated && imgToShow<16))){
                ctx.fillStyle = "rgba(255,255,255,0.6)";
                ctx.font = drawHeight/12+'px Comic Sans MS';
                let remoteName = theObject['name'];
                ctx.fillText(remoteName,drawX+drawWidth/2-ctx.measureText(remoteName).width/2,drawY)

                if(mikesInPainCreated)
                ctx.drawImage(mikeImages[imgToShow],drawX,drawY,drawWidth,drawHeight);

                //    }else{
                //        console.log('mike image out of bounds: '+imgToShow);
                //   }


            }

            if(theObject.type == 'cactus'){
           //     console.log(theObject)
                let totalImgCount = 127;
                let viewingAngle = (theObject['dirFromPlayer']+PI); //0-2PI value

              //  viewingAngle-=1/radToDeg; //only needed for mike model

                let imgToShow = (Math.floor((0-(viewingAngle-(theObject['dir']))/6.28*totalImgCount))+ totalImgCount )% totalImgCount;

                let mikeWidth = 0.8*(upperYStart-lowerYStart);
                let mikeHeight = 1*(upperYStart-lowerYStart);

                while(imgToShow<0){
                    imgToShow+=totalImgCount;
                    imgToShow%=totalImgCount;
                }

                let drawX = planeXStart-mikeWidth/2;
                let drawY = (lowerYStart+mikeHeight/8);  // the +mikeHeight/8 makes them more eye-level
                let drawWidth = mikeWidth;
                let drawHeight = mikeHeight;

                imgToShow = totalImgCount - imgToShow;

                if(cactiLoaded)
                    ctx.drawImage(cactiSheet,imgToShow*460/4.25,0,460/4.25,200,drawX,drawY,drawWidth,drawHeight);
                // ctx.drawImage(cactiImages[imgToShow],drawX,drawY,drawWidth,drawHeight);


                //    }else{
                //        console.log('mike image out of bounds: '+imgToShow);
                //   }


            }

        }



    }
   drawOverlay();
}

function drawOverlay(){
    let handSourceX = 0;
    if(localPlayer.team == 1) handSourceX= 320;
     ctx.drawImage(handImg[handToUse],handSourceX,0,320,200,0,handY,screen.width,200);
     let overlayMikeSize = 30;
     let overlayMikeDir = Math.floor(utcTime*10%8);
     let imgToShow = 7;
     if(localPlayer.team==1)
         imgToShow+=32;
     if(localPlayer.weaponHeld==2)
         imgToShow+=16;

     ctx.drawImage(mikeImages[imgToShow],0,240-overlayMikeSize/0.75-(overlayMikeSize/0.75*localPlayer.lives/3),overlayMikeSize,overlayMikeSize/0.75*localPlayer.lives/3);
}

function fillSky(){
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.rect(0,0,1000,screen.height);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "#969696";
    ctx.beginPath();
    ctx.rect(0,screen.height/2,1000,1000);
    ctx.fill();
    ctx.closePath();
}