const GRID_SIZE_DEFAULT = 25;
const GRID_SIZE_MIN_PX = 200;
const GRID_BORDER_PX = 0;
const GRID_BORDER_COLOR = 'rgb(100, 100, 100, 1)';
const GRID_STYLE_BORDER_RADIUS = '10px';
const GRID_MARGIN_PX = 16;
const FOOTER_MARGIN_PX = 16;
const DEFAULT_PEN_COLOR = 'rgb(100, 100, 100)';
const HIGHLIGHT_COLOR = 'rgb(0, 190, 255, 0.2)';

let gridWidthPx = 960;
let gridSize = GRID_SIZE_DEFAULT;

let gridArray = []; // array of grid cells

let brushOpaque = false;

const controls1 = document.querySelector('#controls1');
const controls2 = document.querySelector('#controls2');
const gridContainer = document.querySelector('#gridcontainer');

let penColor = colorArrayFromRGBString(DEFAULT_PEN_COLOR);

init();

function init() {
    gridContainer.style.margin = GRID_MARGIN_PX + 'px';
    gridContainer.style.border = `${GRID_BORDER_COLOR} ${GRID_BORDER_PX}px solid`;
    gridContainer.style.borderRadius = GRID_STYLE_BORDER_RADIUS;
    gridContainer.style.boxShadow = `0px 0px 20px ${GRID_BORDER_COLOR}`;
    
    // prevent context menu on right-click
    gridContainer.addEventListener('contextmenu', (e) => { e.preventDefault() });
    //gridContainer.addEventListener('touchstart', updateCell);
    //gridContainer.addEventListener('touchmove', updateCell);

    const footer = document.querySelector('#footer');
    footer.style.margin = FOOTER_MARGIN_PX + 'px';

    addHeaderElements();
    createGrid(gridSize);
    
    window.onresize = resizeWindow;

    resizeWindow();
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
    chkBrushOpacity.addEventListener('input', (e) => brushOpaque = e.target.checked);

    b = controls1.querySelector('#clearbutton');
    b.style.height = colorWheelSizePx + 'px'; // '40px';
    b.style.boxShadow = '0px 0px 4px ' + GRID_BORDER_COLOR;
    b.style.border = '1px solid ' + GRID_BORDER_COLOR;
    b.addEventListener('click', clearGrid);
}

function addControls2() {
    const range = document.querySelector('#slidercontainer input');
    range.setAttribute('value', gridSize);
    range.addEventListener('input', moveGridSizeSlider); 
    range.addEventListener('mousedown', moveGridSizeSlider); 
    range.addEventListener('mouseup', changeGridSize);
    range.addEventListener('touchend', changeGridSize);
    
    const gridSizeOutput = document.querySelector('#slidercontainer output');
    gridSizeOutput.textContent = gridSize;
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
    
    gridArray = [];
    for (let i = 0; i < size; i++) {
        let row = [];
        gridArray.push(row);
        
        for (let j = 0; j < size; j++) {
            let div = makeGridCell(cellSize);
            gridArray[i].push(div);
            
            //div.textContent = i;

            gridContainer.appendChild(div);            
        }
    }

    if (size === 1) {
        gridArray[0][0].style.borderRadius = borderRadius;    
    }
    else {
        const s = size - 1;
        gridArray[0][0].style.borderTopLeftRadius = borderRadius;
        gridArray[0][s].style.borderTopRightRadius = borderRadius;
        gridArray[s][0].style.borderBottomLeftRadius = borderRadius;
        gridArray[s][s].style.borderBottomRightRadius = borderRadius;
    }
}

function resizeWindow() {

    gridWidthPx = getGridSizePx();
    gridContainer.style.width = gridWidthPx + 'px';
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
    const colorHex = '#' + colorComponentToHex(color[0]) +
                           colorComponentToHex(color[1]) +
                           colorComponentToHex(color[2]);

    return colorHex;
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

function updateCell(e) {
    console.log('updatecell');
    e.preventDefault(); // prevent mouse drag-drop

    if (e.buttons < 1 || e.buttons > 2) return;

    const div = e.target;
    //console.log(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    let divColor = div.style.backgroundColor.replace(/[^\d,.]/g, '').split(',');

    const pen = (e.buttons === 2) ? [255, 255, 255] : penColor;

    if (brushOpaque) {
        divColor = pen;
    }
    else {
        const divWeight = 2;
        const penWeight = 1;
        const totalWeight = divWeight + penWeight;
        divColor = divColor.map((e, i) => clampColorVal(parseInt(Math.floor((+e * divWeight + parseInt(+pen[i] * penWeight))) / totalWeight)));
    }

    div.style.backgroundColor = `rgb(${divColor[0]}, ${divColor[1]}, ${divColor[2]}, 1)`;
}

function clearGrid() {
    while (gridContainer.firstChild) {
        gridContainer.removeChild(gridContainer.firstChild);
    }
    createGrid(gridSize);
}

function moveGridSizeSlider(e) {
    const gridSizeOutput = document.querySelector('#slidercontainer output');
    gridSizeOutput.textContent = e.target.value;
    gridSizeOutput.style.backgroundColor = HIGHLIGHT_COLOR
    gridSizeOutput.style.boxShadow = '0px 0px 16px ' + HIGHLIGHT_COLOR;

    const rangeLabel = document.querySelector('#slidercontainer label');
    rangeLabel.style.backgroundColor = HIGHLIGHT_COLOR
    rangeLabel.style.boxShadow = '0px 0px 16px ' + HIGHLIGHT_COLOR;
}

function finishMovingGridSizeSlider() {
    const gridSizeOutput = document.querySelector('#slidercontainer output');
    gridSizeOutput.style.backgroundColor = 'transparent';
    gridSizeOutput.style.boxShadow = 'none';

    const rangeLabel = document.querySelector('#slidercontainer label');
    rangeLabel.style.backgroundColor = 'transparent';
    rangeLabel.style.boxShadow = 'none';
}

function changeGridSize(e) {
    if (gridSize !== parseInt(e.target.value)) {
        gridSize = parseInt(e.target.value)

        const gridSizeOutput = document.querySelector('#slidercontainer output');
        gridSizeOutput.textContent = gridSize;

        clearGrid();
    }

    finishMovingGridSizeSlider();
}