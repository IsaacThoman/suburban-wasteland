const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let keys = {'up':false,'down':false,'left':false,'right':false};
let renderMode = 0;
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

requestAnimationFrame(doFrame);
function doFrame(){
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.rect(0,0,1000,1000);
    ctx.fill();
    ctx.closePath();

    if(renderMode==0)
        renderObjects();

    requestAnimationFrame(doFrame);
}

function renderObjects(){


}





