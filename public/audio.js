let audio = [];
const audioFileNames = ['bowling-1','bowling-2','bowling-3','sports-1','sports-2','tf2-hit','tf2-hit','tf2-hit','trainer1','trainer2','trainer3','trainer4','trainer5','trainer6','zelda-item-obtained','bowling'];
for(let i = 0; i<audioFileNames.length; i++){
    audio.push(new Audio('audio/'+audioFileNames[i]+'.wav'))
}
