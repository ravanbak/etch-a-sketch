const GRID_SIZE_DEFAULT = 25;
const GRID_SIZE_MAX = 200;
const GRID_SIZE_MIN_PX = 200;
const GRID_BORDER_PX = 0;
const GRID_BORDER_COLOR = 'rgb(100, 100, 100, 1)';
const GRID_STYLE_BORDER_RADIUS = '10px';
const GRID_MARGIN_PX = 16;
const FOOTER_MARGIN_PX = 16;
const DEFAULT_PEN_COLOR = 'rgb(100, 100, 100)';
const HIGHLIGHT_COLOR = 'rgb(0, 190, 255, 0.2)';

let gridSize = GRID_SIZE_DEFAULT; // number of cells per side
let gridWidthPx = 960;
let penSize = 1; // diameter in grid cells
let maxPenSize = GRID_SIZE_DEFAULT; 
let penOpaque = false;
let penColor = colorArrayFromRGBString(DEFAULT_PEN_COLOR);

let gridArray = []; // array of arrays of rows of grid cells

const controls1 = document.querySelector('#controls1');
const controls2 = document.querySelector('#controls2');
const gridContainer = document.querySelector('#gridcontainer');

let ongoingTouches = [];

document.addEventListener('DOMContentLoaded', init);

function init() {
    gridContainer.style.margin = GRID_MARGIN_PX + 'px';
    gridContainer.style.border = `${GRID_BORDER_COLOR} ${GRID_BORDER_PX}px solid`;
    gridContainer.style.borderRadius = GRID_STYLE_BORDER_RADIUS;
    gridContainer.style.boxShadow = `0px 0px 20px ${GRID_BORDER_COLOR}`;
    
    const footer = document.querySelector('#footer');
    footer.style.margin = FOOTER_MARGIN_PX + 'px';

    addHeaderElements();
    createGrid(gridSize);
    updatePenSizeInput();
    
    window.onresize = resizeWindow;

    resizeWindow();

    // prevent context menu on right-click
    gridContainer.addEventListener('contextmenu', (e) => { e.preventDefault() });

    gridContainer.addEventListener('touchstart', handleTouchStart, false);
    gridContainer.addEventListener('touchmove', handleTouchMove, false);    
    gridContainer.addEventListener('touchend', handleTouchEnd, false);
    gridContainer.addEventListener('touchcancel', handleTouchEnd, false);
}

function addHeaderElements() {
    addControls1();
    addControls2();
}

function addControls1() {
    const colorWheelSizePx = 40;

    const colorContainer = controls1.querySelector('#colorcontainer');
    colorContainer.style.minHeight = colorWheelSizePx + 10 + 'px';
    
    const colorImg = document.querySelector('#colorwheel');
    colorImg.style.width = colorWheelSizePx + 'px';
    colorImg.style.height = colorWheelSizePx + 'px';
    colorImg.addEventListener('click', colorWheelClick);
    
    const colorWheelBackground = document.querySelector('#colorwheelbackground');
    colorWheelBackground.style.width = colorWheelSizePx - 4 + 'px';
    colorWheelBackground.style.height = colorWheelSizePx - 4 + 'px';
    colorWheelBackground.style.backgroundColor = DEFAULT_PEN_COLOR;
    
    const colorinput = document.querySelector('#colorinput');
    colorinput.setAttribute('value', hexFromColorArray(colorArrayFromRGBString(DEFAULT_PEN_COLOR)));
    colorinput.style.width = colorWheelSizePx + 'px';
    colorinput.style.height = colorWheelSizePx + 'px';
    colorinput.addEventListener('change', changePenColor);
    colorinput.addEventListener('input', changePenColor);
    
    const chkBrushOpacity = document.querySelector('#opacityinput');
    chkBrushOpacity.addEventListener('input', (e) => penOpaque = e.target.checked);

    b = controls1.querySelector('#clearbutton');
    b.style.height = colorWheelSizePx + 'px'; // '40px';
    b.style.boxShadow = '0px 0px 4px ' + GRID_BORDER_COLOR;
    b.style.border = '1px solid ' + GRID_BORDER_COLOR;
    b.addEventListener('click', clearGrid);
}

function addControls2() {
    const gridInput = document.querySelector('#gridsizeslidercontainer input');
    gridInput.setAttribute('max', GRID_SIZE_MAX);
    gridInput.setAttribute('value', gridSize);
    gridInput.addEventListener('input', moveGridSizeSlider); 
    gridInput.addEventListener('mousedown', moveGridSizeSlider); 
    gridInput.addEventListener('mouseup', changeGridSize);
    gridInput.addEventListener('touchend', changeGridSize);
    
    const gridSizeOutput = document.querySelector('#gridsizeslidercontainer output');
    gridSizeOutput.textContent = gridSize;

    const penInput = document.querySelector('#pensizeslidercontainer input');
    penInput.setAttribute('value', penSize);
    penInput.addEventListener('input', movePenSizeSlider); 
    penInput.addEventListener('mousedown', movePenSizeSlider); 
    penInput.addEventListener('mouseup', finishMovingPenSizeSlider);
    penInput.addEventListener('touchend', finishMovingPenSizeSlider);

    const penSizeOutput = document.querySelector('#pensizeslidercontainer output');
    penSizeOutput.textContent = penSize;
}

function colorWheelClick(e) {
    const colorinput = document.querySelector('#colorinput');
    colorinput.dispatchEvent(new e.constructor(e.type));
}

function getCellSizePx() {
    return gridWidthPx / gridSize;
}

function getHeaderFooterTotalHeight() {
    const header = document.querySelector('#header');
    const footer = document.querySelector('#footer');
    return header.offsetHeight + footer.offsetHeight + FOOTER_MARGIN_PX * 2;
}

function getGridSizePx() {
    const size = Math.min(window.innerWidth, window.innerHeight - getHeaderFooterTotalHeight());

    return Math.max(GRID_SIZE_MIN_PX, size - GRID_MARGIN_PX * 2 - GRID_BORDER_PX * 2 - 1);
}

function makeGridCell(cellSize) {
    let div = document.createElement('div');

    div.style.width = cellSize + 'px';
    div.style.height = cellSize + 'px';
    //div.style.border = 'none';

    div.style.backgroundColor = 'rgb(255, 255, 255, 0)';
    div.classList.add('cell');
    div.addEventListener('mouseover', updateCell);
    div.addEventListener('mousedown', updateCell);

    return div;
}

function createGrid(size) {
    const cellSize = getCellSizePx();
    const borderRadius = GRID_STYLE_BORDER_RADIUS;
    
    gridArray = []; // 2d array

    for (let i = 0; i < size; i++) {
        let row = [];
        gridArray.push(row);
        
        for (let j = 0; j < size; j++) {
            let div = makeGridCell(cellSize);
            div.setAttribute('data-row', i);
            div.setAttribute('data-col', j);

            div.addEventListener('touchstart', (e) => { e.preventDefault() });
            div.addEventListener('touchmove', (e) => { e.preventDefault() });

            gridArray[i].push(div);

            gridContainer.appendChild(div);            
        }
    }

    // round the outer corners of corner cells:
    const s = size - 1;
    gridArray[0][0].style.borderTopLeftRadius = borderRadius;
    gridArray[0][s].style.borderTopRightRadius = borderRadius;
    gridArray[s][0].style.borderBottomLeftRadius = borderRadius;
    gridArray[s][s].style.borderBottomRightRadius = borderRadius;
}

function resizeWindow() {
    gridWidthPx = getGridSizePx();
    gridContainer.style.width = gridWidthPx + 'px';
    gridContainer.style.height = gridWidthPx + 'px';
    controls1.style.width = gridWidthPx + GRID_BORDER_PX * 2 + 'px';
    controls2.style.width = controls1.style.width;

    const hseparators = document.querySelectorAll('.hseparator');
    for (let div of hseparators) {
        div.style.width = parseInt(gridWidthPx * 0.6) + 'px';
    }

    const cellSize = getCellSizePx() + 'px';
    for (let div of gridContainer.querySelectorAll('div')) {
        div.style.width = cellSize;
        div.style.height = cellSize;       
    }
}

function colorComponentToHex(c) {
    const hex = Number(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function colorArrayFromHex(hex) {
    return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(m, r, g, b) => '#' + r + r + g + g + b + b).substring(1).match(/.{2}/g).map(x => parseInt(x, 16));
}

function hexFromColorArray(color) {
    return '#' + colorComponentToHex(color[0]) +
                 colorComponentToHex(color[1]) +
                 colorComponentToHex(color[2]);
}

function changePenColor(e) {
    penColor = colorArrayFromHex(e.target.value);

    const colorWheelBackground = document.querySelector('#colorwheelbackground');
    colorWheelBackground.style.backgroundColor = e.target.value;
}

function colorArrayFromRGBString(color) {
    return color.replace(/[^\d,.]/g, '').split(',');
}

function clampColorVal(val) {
    return Math.min(255, Math.max(0, Math.floor(val)));
}

function copyTouch({ identifier, pageX, pageY }) {
    return { identifier, pageX, pageY };
}

function getTouchIndexById(idx) {
    for (let i = 0; i < ongoingTouches.length; i++) {
        if (ongoingTouches[i].identifier == idx) {
            return i;
        }
    }
    return -1;
}

function handleTouchStart(e) {
    e.preventDefault;

    let touches = e.changedTouches;

    const cellSize = getCellSizePx();
    for (let i = 0; i < touches.length; i++) {
        ongoingTouches.push(copyTouch(touches[i]));
        
        let row = Math.floor((touches[i].pageY - gridContainer.offsetTop) / cellSize);
        let col = Math.floor((touches[i].pageX - gridContainer.offsetLeft) / cellSize);
        
        markCell(row, col);
    }
}

function handleTouchMove(e) {
    e.preventDefault;

    let touches = e.changedTouches;

    const cellSize = getCellSizePx();
    for (let i = 0; i < touches.length; i++) {
        let idx = getTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
            let t = touches[i];
            let row = Math.floor((t.pageY - gridContainer.offsetTop) / cellSize);
            let col = Math.floor((t.pageX - gridContainer.offsetLeft) / cellSize);

            let touchOngoing = ongoingTouches[idx];
            let rowOngoing = Math.floor((touchOngoing.pageY - gridContainer.offsetTop) / cellSize);
            let colOngoing = Math.floor((touchOngoing.pageX - gridContainer.offsetLeft) / cellSize);

            if (rowOngoing != row || colOngoing != col) {
                // only mark the cell again if row or col has changed.
                markCell(row, col);
            }

            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault;

    let touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let idx = getTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            ongoingTouches.splice(idx, 1);
        }
    }
}

function markCell(row, col, erase) {
    const pen = (erase) ? [255, 255, 255] : penColor;
    let penOffset = parseInt(penSize / 2); 

    const rowStart = Math.max(0, row - penOffset);
    const rowEnd = Math.min(gridSize - 1, row + penOffset);
    
    const colStart = Math.max(0, col - penOffset);
    const colEnd = Math.min(gridSize - 1, col + penOffset);

    const penRad = penSize / 2;

    for (let i = rowStart; i <= rowEnd; i++) {
        for (let j = colStart; j <= colEnd; j++) {
            let div = gridArray[i][j];
            let divColor = div.style.backgroundColor.replace(/[^\d,.]/g, '').split(',');

            // ratio of pen color to current cell color
            const penWeight = 100;
            const divWeight = 100;

            let divWeightCurrent = (penOpaque) ? 0 : divWeight;
            let penWeightCurrent = penWeight;

            if (penSize > 1) {
                let rowDelta = Math.abs(i - row);
                let colDelta = Math.abs(j - col);
                let d = Math.sqrt(rowDelta ** 2 + colDelta ** 2);
                if (d > penRad) {
                    penWeightCurrent = 0;
                    //divWeightCurrent = 1;
                }
                else if (penOpaque) {
                    //penWeightCurrent = 1;
                    divWeightCurrent = 0;
                }
                else {
                    //divWeightCurrent = divWeight * d ** 2 / penRad ** 2;
                    penWeightCurrent = Math.max(0, penWeight * (penRad - d) / penRad);
                    divWeightCurrent = divWeight;
                }
            }
            
            if (penWeightCurrent > 0) {
                const totalWeight = divWeightCurrent + penWeightCurrent;
                divColor = divColor.map((el, i) => clampColorVal(
                                                    Math.floor((+el * divWeightCurrent + (+pen[i] * penWeightCurrent))) / totalWeight));
                
                gridArray[i][j].style.backgroundColor = `rgb(${divColor[0]}, ${divColor[1]}, ${divColor[2]}, 1)`;                                          
            }
        }
    }
}

function updateCell(e) {
    e.preventDefault(); // prevent mouse drag-drop

    if (e.buttons < 1 || e.buttons > 2) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    markCell(row, col, (e.buttons === 2) ? true : false);
}

function clearGrid() {
    while (gridContainer.firstChild) {
        gridContainer.removeChild(gridContainer.firstChild);
    }
    createGrid(gridSize);
}

function movePenSizeSlider(e) {
    const penSizeOutput = document.querySelector('#pensizeslidercontainer output');
    penSizeOutput.textContent = e.target.value;
    penSizeOutput.style.backgroundColor = HIGHLIGHT_COLOR
    penSizeOutput.style.boxShadow = '0px 0px 16px ' + HIGHLIGHT_COLOR;

    const rangeLabel = document.querySelector('#pensizeslidercontainer label');
    rangeLabel.style.backgroundColor = HIGHLIGHT_COLOR
    rangeLabel.style.boxShadow = '0px 0px 16px ' + HIGHLIGHT_COLOR;
}

function finishMovingPenSizeSlider(e) {
    penSize = parseInt(e.target.value);

    const penSizeOutput = document.querySelector('#pensizeslidercontainer output');
    penSizeOutput.style.backgroundColor = 'transparent';
    penSizeOutput.style.boxShadow = 'none';

    const rangeLabel = document.querySelector('#pensizeslidercontainer label');
    rangeLabel.style.backgroundColor = 'transparent';
    rangeLabel.style.boxShadow = 'none';
}

function moveGridSizeSlider(e) {
    const gridSizeOutput = document.querySelector('#gridsizeslidercontainer output');
    gridSizeOutput.textContent = e.target.value;
    gridSizeOutput.style.backgroundColor = HIGHLIGHT_COLOR
    gridSizeOutput.style.boxShadow = '0px 0px 16px ' + HIGHLIGHT_COLOR;

    const rangeLabel = document.querySelector('#gridsizeslidercontainer label');
    rangeLabel.style.backgroundColor = HIGHLIGHT_COLOR
    rangeLabel.style.boxShadow = '0px 0px 16px ' + HIGHLIGHT_COLOR;
}

function finishMovingGridSizeSlider(e) {
    const gridSizeOutput = document.querySelector('#gridsizeslidercontainer output');
    gridSizeOutput.style.backgroundColor = 'transparent';
    gridSizeOutput.style.boxShadow = 'none';

    const rangeLabel = document.querySelector('#gridsizeslidercontainer label');
    rangeLabel.style.backgroundColor = 'transparent';
    rangeLabel.style.boxShadow = 'none';
}

function changeGridSize(e) {
    if (gridSize !== parseInt(e.target.value)) {
        gridSize = parseInt(e.target.value)
        
        const gridSizeOutput = document.querySelector('#gridsizeslidercontainer output');
        gridSizeOutput.textContent = gridSize;

        updatePenSizeInput();

        clearGrid();
    }

    finishMovingGridSizeSlider();
}

function updatePenSizeInput() {
    maxPenSize = gridSize;
    penSize = Math.min(maxPenSize, penSize);

    const penSizeInput = document.querySelector('#pensizeslidercontainer input');
    penSizeInput.setAttribute('max', maxPenSize);
    penSizeInput.setAttribute('value', penSize);
    const penSizeOutput = document.querySelector('#pensizeslidercontainer output');
    penSizeOutput.textContent = penSize;
}