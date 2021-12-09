const GRID_SIZE_DEFAULT = 25;
const GRID_SIZE_MIN_PX = 200;
const BUTTON_HEIGHT_PX = 33;
const GRID_BORDER_PX = 0;
const GRID_BORDER_COLOR = 'rgb(100, 100, 100, 1)';
const GRID_BORDER_RADIUS = 10;
const GRID_MARGIN_PX = 16;
const FOOTER_MARGIN_PX = 16;
const DEFAULT_PEN_COLOR = 'rgb(100, 100, 100)';
const HIGHLIGHT_COLOR = 'rgb(0, 190, 255, 0.2)';

let gridWidthPx = 960;
let gridSize = GRID_SIZE_DEFAULT;
let rangeOutput; // output for grid size slider

let brushOpaque = false;

const header = document.querySelector('#header');
const title = document.querySelector('#title');
const controls1 = document.querySelector('#controls1');
const controls2 = document.querySelector('#controls2');
const gridContainer = document.querySelector('#gridcontainer');
const footer = document.querySelector('#footer');

let colorWheelBackground;
let colorImg;
let colorinput;

let penColor = colorArrayFromRGBString(DEFAULT_PEN_COLOR);

init();

function init() {
    gridContainer.style.margin = GRID_MARGIN_PX + 'px';
    gridContainer.style.border = `${GRID_BORDER_COLOR} ${GRID_BORDER_PX}px solid`;
    gridContainer.style.borderRadius = GRID_BORDER_RADIUS + 'px';
    gridContainer.style.boxShadow = `0px 0px 20px ${GRID_BORDER_COLOR}`;
    
    // prevent context menu on right-click
    gridContainer.addEventListener('contextmenu', (e) => { e.preventDefault() });
    //gridContainer.addEventListener('touchstart', updateCell);
    //gridContainer.addEventListener('touchmove', updateCell);

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

    let colorContainer = controls1.querySelector('#colorcontainer');
    colorContainer.style.minHeight = colorWheelSizePx + 10 + 'px';
    colorImg = document.querySelector('#colorwheel');

    colorImg.style.width = colorWheelSizePx + 'px';
    colorImg.style.height = colorWheelSizePx + 'px';
    colorImg.addEventListener('click', colorWheelClick);
    
    colorWheelBackground = document.querySelector('#colorwheelbackground');
    colorWheelBackground.style.width = colorWheelSizePx - 4 + 'px';
    colorWheelBackground.style.height = colorWheelSizePx - 4 + 'px';
    colorWheelBackground.style.backgroundColor = DEFAULT_PEN_COLOR;
    
    colorinput = document.querySelector('#colorinput');
    colorinput.setAttribute('value', hexFromColorArray(colorArrayFromRGBString(DEFAULT_PEN_COLOR)));
    colorinput.style.width = colorWheelSizePx + 'px';
    colorinput.style.height = colorWheelSizePx + 'px';
    colorinput.addEventListener('change', changePenColor);
    colorinput.addEventListener('input', changePenColor);
    
    let chkBrushOpacity = document.querySelector('#opacityinput');
    chkBrushOpacity.addEventListener('input', (e) => brushOpaque = e.target.checked);

    b = controls1.querySelector('#clearbutton');
    b.style.height = colorWheelSizePx + 'px'; // '40px';
    b.style.boxShadow = '0px 0px 4px ' + GRID_BORDER_COLOR;
    b.style.border = '1px solid ' + GRID_BORDER_COLOR;
    b.addEventListener('click', clearGrid);
}

function addControls2() {
    let range = document.querySelector('#slidercontainer input');
    range.setAttribute('value', gridSize);
    range.addEventListener('input', moveGridSizeSlider); 
    range.addEventListener('mousedown', moveGridSizeSlider); 
    range.addEventListener('mouseup', changeGridSize);
    range.addEventListener('touchend', changeGridSize);
    
    rangeOutput = document.querySelector('#slidercontainer output');
    rangeOutput.textContent = gridSize;
}

function colorWheelClick(e) {
    colorinput.dispatchEvent(new e.constructor(e.type));
}

function getCellSizePx() {
    return gridWidthPx / gridSize;
}

function getHeaderFooterTotalHeight() {
    return header.offsetHeight + footer.offsetHeight + FOOTER_MARGIN_PX * 2; // + controls1.offsetHeight + controls2.offsetHeight;
}

function getGridSizePx() {
    let size = Math.min(window.innerWidth, window.innerHeight - getHeaderFooterTotalHeight());

    return Math.max(GRID_SIZE_MIN_PX, size - GRID_MARGIN_PX * 2 - GRID_BORDER_PX * 2 - 1);
}

function createGrid(size) {
    gridWidthPx = getGridSizePx(); 
    gridContainer.style.width = gridWidthPx + 'px';

    let cellSize = getCellSizePx();

    const borderRadius = GRID_BORDER_RADIUS + 'px';
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let div = document.createElement('div');
            div.style.id = i + j;
            div.style.width = cellSize + 'px';
            div.style.height = cellSize + 'px';
            //div.style.border = 'none';
            div.style.backgroundColor = 'rgb(255, 255, 255, 0)';
            div.classList.add('cell');
            div.addEventListener('mouseover', updateCell);
            div.addEventListener('mousedown', updateCell);
            
            // round outer corners of corner cells
            // do not use 'else' statements so that all corners will be
            // rounded when grid size = 1
            if (i == 0) {
                if (j === 0) {
                    div.style.borderTopLeftRadius = borderRadius;
                }
                if (j === size - 1) {
                    div.style.borderTopRightRadius = borderRadius;
                }
            }
            if (i === size - 1) {
                if (j === 0) {
                    div.style.borderBottomLeftRadius = borderRadius;
                }
                if (j === size - 1) {
                    div.style.borderBottomRightRadius = borderRadius;
                }
            }

            gridContainer.appendChild(div);
        }
    }
}

function resizeWindow() {

    if (getGridSizePx() === gridWidthPx) return;

    gridWidthPx = getGridSizePx();
    gridContainer.style.width = gridWidthPx + 'px';
    controls1.style.width = gridWidthPx + GRID_BORDER_PX * 2 + 'px';
    controls2.style.width = controls1.style.width;

    const hseparators = document.querySelectorAll('.hseparator');
    for (let div of hseparators) {
        div.style.width = parseInt(gridWidthPx * 0.6) + 'px';
    }

    let cellSize = getCellSizePx();

    let divNodes = gridContainer.querySelectorAll('div');
    for (let div of divNodes) {
        div.style.width = cellSize + 'px';
        div.style.height = cellSize + 'px';       
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
    let colorHex = '#' + colorComponentToHex(color[0]) +
                         colorComponentToHex(color[1]) +
                         colorComponentToHex(color[2]);

    return colorHex;
}

function changePenColor(e) {
    penColor = colorArrayFromHex(e.target.value);
    colorWheelBackground.style.backgroundColor = e.target.value;
}

function colorArrayFromRGBString(color) {
    return color.replace(/[^\d,.]/g, '').split(',');
}

function clampColorVal(val) {
    return Math.min(255, Math.max(0, Math.floor(val)));
}

function updateCell(e) {
    e.preventDefault(); // prevent mouse drag-drop

    if (e.buttons < 1 || e.buttons > 2) return;

    let div = e.target;
    //console.log(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    let divColor = div.style.backgroundColor.replace(/[^\d,.]/g, '').split(',');

    let pen = (e.buttons === 2) ? [255, 255, 255] : penColor;

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
    rangeOutput.textContent = e.target.value;
    rangeOutput.style.backgroundColor = HIGHLIGHT_COLOR
    rangeOutput.style.boxShadow = '0px 0px 16px ' + HIGHLIGHT_COLOR;

    let rangeLabel = document.querySelector('#slidercontainer label');
    rangeLabel.style.backgroundColor = HIGHLIGHT_COLOR
    rangeLabel.style.boxShadow = '0px 0px 16px ' + HIGHLIGHT_COLOR;
}

function finishMovingGridSizeSlider() {
    rangeOutput.style.backgroundColor = 'transparent';
    rangeOutput.style.boxShadow = 'none';

    let rangeLabel = document.querySelector('#slidercontainer label');
    rangeLabel.style.backgroundColor = 'transparent';
    rangeLabel.style.boxShadow = 'none';
}

function changeGridSize(e) {
    if (gridSize !== parseInt(e.target.value)) {
        gridSize = parseInt(e.target.value)
        rangeOutput.textContent = gridSize;
        clearGrid();
    }

    finishMovingGridSizeSlider();
}