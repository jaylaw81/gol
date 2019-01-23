const CANVAS = document.getElementById('mainCanvas');
const CTX	= CANVAS.getContext("2d");
const BUTTON = document.getElementById('btn');
const GENERATE_BUTTON	= document.getElementById('generateBtn');
const RESTART_BUTTON = document.getElementById('restartBtn');
const CELL_SIZE_BUTTON = document.getElementById('cellSizeBtn');

const WIDTH = CANVAS.width;
const HEIGHT = CANVAS.height;

const CELL_SIZE	= 20;

const CELL_WIDTH = CELL_SIZE;
const CELL_HEIGHT = CELL_SIZE;
const CELL_COLOR = '#333333';
const BACKGROUND_COLOR	= '#E1E1E1';

const TIME_INTERVAL_IN_MS	= 10;

const globals = {
  ms:	TIME_INTERVAL_IN_MS,
  c: CTX,
  w: WIDTH,
  h: HEIGHT,
  cellW: CELL_WIDTH,
  cellH: CELL_HEIGHT,
  color: CELL_COLOR,
  bgColor: BACKGROUND_COLOR,
  btn: BUTTON,
  generateButton:	GENERATE_BUTTON,
  resetButton:	RESTART_BUTTON,
  cellSizeButton:	CELL_SIZE_BUTTON,
  animState: false,
  anim:	'',	// setInterval placeholder
  cells: []	// array placeholder
}


function init(globals) {
  resetScreen(globals);
  
  globals.btn.innerText = "Start";
  
  // main button click event handler
  globals.btn.addEventListener("click", function() {
    if(!globals.animState) {
      globals.animState = true;
      globals.btn.innerText = "Pause";
      globals.anim = setInterval(function() {
        mainGameLoop(globals);
      }, globals.ms);
      globals.generateButton.disabled = true;
      globals.cellSizeButton.disabled = true;
    } else {
      globals.animState = false;
      globals.btn.innerText = "Start";
      clearInterval(globals.anim);
      globals.generateButton.disabled = false;
      globals.cellSizeButton.disabled = false;
    }
  });
  
  // generate button click event handler
  globals.generateButton.addEventListener("click", function() {
    if(!globals.animState) {
      resetScreen(globals);
      randomizeCells(globals);
      printCellMatrix(globals);
    }
  });
  
  globals.cellSizeButton.addEventListener("change", function() {
    var cellSize = this.value - 0;	// string to number
    
    globals.cellW = cellSize;
    globals.cellH = cellSize;
    resetScreen(globals);
    randomizeCells(globals);
    printCellMatrix(globals);
  });
  
  randomizeCells(globals);
  printCellMatrix(globals);
}

/* pre-initialize cells */
function randomizeCells(g) {
  var newArray = [];
  
  var maxRow = g.w / g.cellW;
  var maxCol = g.h / g.cellH;
  
  for(var i = 0; i < maxRow; i++) {
    for(var j = 0; j < maxCol; j++) {
      var cell = {
        x: i,
        y: j,
        state: getRandomState()	// 2 states: alive, dead
      }
      
      newArray.push(cell);
    }
  }
  
  g.cells = newArray;
}

/* close range: [0, max] */
function getRandom(max) {
  return Math.floor(Math.random()*(max+1));
}

function getRandomBool() {
  return getRandom(1) === 1 ? true : false;
}

function getRandomState() {
  if(getRandomBool()) {
    return "alive";
  }
  
  return "dead";
}

// Reset the playing field
function resetScreen(g) {
  clearScreen(g);
  printGrid(g);
}

// Clear out Canvas elements
function clearScreen(g) {
  g.c.fillStyle= g.bgColor;
  g.c.fillRect(0, 0, g.w, g.h);
}

function printGrid(g) {
  for(var i = 0; i < g.w; i+= g.cellW) {
    drawLine(g, i, 0, i, g.h);
  }
  drawLine(g, g.w, 0, g.w, g.h);
  
  for(var j = 0; j < g.h; j+= g.cellH) {
    drawLine(g, 0, j, g.w, j);
  }
  drawLine(g, 0, g.h, g.w, g.h);
}

function drawLine(g, x0, y0, x, y) {
  g.c.beginPath();
  g.c.moveTo(x0, y0);
  g.c.lineTo(x , y) ;
  g.c.lineWidth = 3;

  // set line color
  g.c.strokeStyle = g.color;
  g.c.stroke();
}

function fillCell(g, x, y) {
  g.c.fillStyle = g.color;
  g.c.fillRect(x*g.cellW, y*g.cellH, g.cellW, g.cellH);
}

function getCurrentState(g, x, y) {
  for(var i = 0; i < g.cells.length; i++) {
    if(g.cells[i].x === x && g.cells[i].y === y) {
      return g.cells[i].state;
    }
  }
}

function printCellMatrix(g) {
  for(var i = 0; i < g.cells.length; i++) {
    if(g.cells[i].state === "alive") {
      fillCell(g, g.cells[i].x, g.cells[i].y);
    }
  }
}

function mainGameLoop(g) {
  processMatrix(g);
  resetScreen(g);
  printCellMatrix(g);
}

function processMatrix(g) {
  var newArray = [];
  
  for(var i = 0; i < g.cells.length; i++) {
    var newCell = {
      x: g.cells[i].x,
      y: g.cells[i].y,
      state: handleCellState(g, g.cells[i].x, g.cells[i].y)
    };
    
    newArray.push(newCell);
  }
  
  g.cells = newArray;
}

function handleCellState(g, x, y) {
  var count = countCellNeighboors(g, x, y);
  
  if(getCurrentState(g, x, y) === "alive") {
    if(count < 2) {
      return "dead";			// dead by underpopulation
    } else if (count <= 3) {
      return "alive";
    } else {
      return "dead";			// dead by overpopulation
    }
  } else if(getCurrentState(g, x, y) === "dead") {
    if(count === 3) {
      return "alive";
    } else {
      return "dead";
    }
  }

}

function countCellNeighboors(g, x, y) {
  var count = 0;
  
  for(var i = x-1; i <= x+1 ; i++) {
    for(var j = y-1; j <= y+1; j++) {
      if(i==x && j == y) {
        continue;
      }
      if(getCurrentState(g, i, j) === "alive") {	// for invalid cells like [-1,-1], undefined values will be ignored
        count++;
      }
    }
  }
  
  return count;
}

// start the game
init(globals);