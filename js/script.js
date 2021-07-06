let buttons = document.querySelectorAll(".buoy");
let waves = document.getElementById('wave-container');
let lineWidth = 10;

addWaves();

function addWaves(){
  for(let x = 0; x * lineWidth < window.innerWidth; x++){
    var rect = document.createElement("div");
    rect.classList.add("wave");
    waves.appendChild(rect);
  }
}

function calc(){
  for(let i = 0; i < buttons.length; i++){
    let box = buttons[i].getBoundingClientRect();
    let width = box.right - box.left;
    let middleX = box.left + width/2;
    let middleShift = (middleX/window.innerWidth)*2;
    let margin = getY(middleShift) + getBouancy(middleShift) - 8;
    let rotation = getRotation(middleShift);
    buttons[i].style = `position: relative; bottom: ${margin}px; transform: rotate(${rotation}deg); transform-origin: 50% 50%;`;
  }
  
  for(let i = 0; i < waves.children.length; i++){
    let middleX = (i * lineWidth + lineWidth/2)/window.innerWidth*2;
    let bottom = Math.abs(getY(middleX) - 30);
    let height = window.innerHeight - bottom;
    waves.children[i].style = `position: absolute; width: ${lineWidth}px; left:${i*lineWidth}px; bottom: ${0}px; height: ${height}px; z-index: -1;`;
  }
  window.requestAnimationFrame(calc);
}

function getY(x){
  return Math.sin((Date.now()/1000) + x) * 70 - window.innerHeight/2;
}

function getBouancy(x){
  return Math.sin((Date.now()/1000) + x) * 8;
}

function getRotation(x){
  return (Math.sin((Date.now()/1000) + (x+5)) * (180/Math.PI))/5;
}

function handleResize(){
  if(waves.children.length * lineWidth < window.innerWidth){
    for(let x = waves.children.length; x * lineWidth < window.innerWidth; x++){
      var rect = document.createElement("div");
      rect.classList.add("wave");
      waves.appendChild(rect);
    }
  }
}

function modal(text){
  document.getElementById("modal").style = "display: block;"
  document.getElementById("modal-title").innerText = text;
}

function closeModal(){
  document.getElementById("modal").style = "display: none;";
}

function jumpto(text){
	window.location.href = text;
}

window.onresize = handleResize;

window.requestAnimationFrame(calc);