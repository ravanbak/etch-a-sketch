const MIN_WIDTH_PX = 450;
const GRID_SIZE_DEFAULT = 25;
const BUTTON_HEIGHT_PX = 33;
const MARGIN_PX = 20;
const GRID_BORDER_PX = 10;

const DEFAULT_PEN_COLOR = 'rgb(100, 100, 100)';

let gridWidthPx = 960;
let gridSize = GRID_SIZE_DEFAULT;

let hoverDraw = false;

const header = document.querySelector('#header');
const controls = document.querySelector('#controls');
const gridContainer = document.querySelector('#gridcontainer');

let colorContainer;
let colorWheelBackground;
let colorImg;
let colorPicker;

let rangeOutput; // output for grid size slider

let penColor = colorArrayFromRGBString(DEFAULT_PEN_COLOR);

init();

function init() {
    let borderColor = 'rgba(48, 213, 200, 0.33)';

    gridContainer.style.minWidth = `${MIN_WIDTH_PX}px`;
    gridContainer.style.margin = MARGIN_PX + 'px';
    gridContainer.style.border = `${borderColor} ${GRID_BORDER_PX}px solid`;
    gridContainer.style.borderRadius = '8px';
    gridContainer.style.boxShadow = `0px 0px 20px ${borderColor}`;
    
    // prevent context menu on right-click
    gridContainer.addEventListener('contextmenu', (e) => { e.preventDefault() });

    header.style.marginTop = '0'; // MARGIN_PX + 'px';
    header.style.marginBottom = '0';
    header.style.minWidth = `${MIN_WIDTH_PX}px`;

    controls.style.marginTop = '0'; //MARGIN_PX + 'px';
    controls.style.minWidth = `${MIN_WIDTH_PX}px`;

    addHeaderElements();
    addControls();
    createGrid(gridSize);
    
    window.onresize = resizeWindow;

    resizeWindow();
}

function addHeaderElements() {
    let h = document.createElement('h1');
    h.textContent = 'Sketch Grid'
    h.style.margin = '10px 0 0'; // auto 0 0';
    header.appendChild(h);

    let p = document.createElement('p');
    p.innerHTML = "<kbd>mouse left</kbd> to draw; <kbd>mouse right</kbd> to erase";
    p.style.padding = '0';
    p.style.margin = '10px';
    header.appendChild(p);
}

function addControls() {
    
    const colorWheelSizePx = 40;

    colorContainer = document.createElement('div');
    colorContainer.style.display = 'flex';
    colorContainer.style.alignItems = 'center';
    colorContainer.style.height = colorWheelSizePx + 'px';
    controls.appendChild(colorContainer);

    colorImg = document.createElement('img');
    colorImg.setAttribute('src', 'color-spectrum.png');
    colorImg.style.width = colorWheelSizePx + 'px';
    colorImg.style.borderRadius = '50%';
    colorImg.style.marginRight = '4px';
    colorImg.style.position = 'absolute';
    colorImg.style.backgroundColor = 'transparent'; // DEFAULT_PEN_COLOR;
    //colorImg.style.pointerEvents = 'none';
    colorImg.addEventListener('click', colorWheelClick);
    colorContainer.appendChild(colorImg);

    colorWheelBackground = document.createElement('div');
    colorWheelBackground.style.width = colorWheelSizePx - 4 + 'px';
    colorWheelBackground.style.height = colorWheelSizePx - 4 + 'px';
    colorWheelBackground.style.margin = '1px';
    colorWheelBackground.style.borderRadius = '50%';
    colorWheelBackground.style.backgroundColor = DEFAULT_PEN_COLOR;
    colorContainer.appendChild(colorWheelBackground);

    colorPicker = document.createElement('input');
    colorPicker.setAttribute('type', 'color');
    colorPicker.setAttribute('name', 'colorpicker');
    colorPicker.setAttribute('value', hexFromColorArray(colorArrayFromRGBString(DEFAULT_PEN_COLOR)));
    colorPicker.style.visibility = 'hidden';
    colorPicker.style.width = colorWheelSizePx + 'px';
    colorPicker.style.height = colorWheelSizePx + 'px';
    colorPicker.addEventListener('change', changeColor);
    colorPicker.addEventListener('input', changeColor);
    colorContainer.appendChild(colorPicker);

    let rangeContainer = document.createElement('div');
    rangeContainer.style.display = 'flex';
    rangeContainer.style.alignItems = 'center';
    controls.appendChild(rangeContainer);

    let rangeLabel = document.createElement('label');
    rangeLabel.setAttribute('for', 'gridsize');
    rangeLabel.style.marginRight = '4px';
    rangeLabel.textContent = 'grid size';
    rangeContainer.appendChild(rangeLabel);

    let range = document.createElement('input');
    range.setAttribute('type', 'range');
    range.setAttribute('name', 'gridsize');
    range.setAttribute('min', '1');
    range.setAttribute('max', '100');
    range.setAttribute('value', gridSize);
    range.style.width = '150px';
    //range.style.height = '30px';
    range.addEventListener('input', (e) => { rangeOutput.textContent = e.target.value; });
    range.addEventListener('mouseup', changeGridSize);
    rangeContainer.appendChild(range);

    rangeOutput = document.createElement('output');
    rangeOutput.setAttribute('for', 'gridsize');
    rangeOutput.textContent = gridSize;
    rangeContainer.appendChild(rangeOutput);

    b = document.createElement('button');
    b.textContent = 'clear';
    b.style.marginLeft = '10px';
    b.style.height = '40px';
    b.style.width = '50px';
    b.style.backgroundColor = '';
    b.style.boxShadow = '0px 0px 20px rgba(0, 0, 30, 0.33)';
    b.style.border = '2px solid rgba(48, 213, 200, 0.33)';
    b.style.borderRadius = '10px';
    b.addEventListener('click', clearGrid);
    controls.appendChild(b);   
}

function colorWheelClick(e) {
    colorPicker.dispatchEvent(new e.constructor(e.type));
}

function getCellSizePx() {
    return gridWidthPx / gridSize;
}

function getGridSizePx() {
    let headerHeight = parseInt(header.offsetHeight);

    let size = Math.min(window.innerWidth - MARGIN_PX * 2 - 20, 
                        window.innerHeight - MARGIN_PX * 2 - BUTTON_HEIGHT_PX - headerHeight - 60);

    if (size < MIN_WIDTH_PX) size = MIN_WIDTH_PX;
    
    return size;

}

function createGrid(size) {
    
    gridWidthPx = getGridSizePx(); 
    gridContainer.style.width = gridWidthPx + 'px';

    let cellSize = getCellSizePx();

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let div = document.createElement('div');
            div.style.width = cellSize + 'px';
            div.style.height = cellSize + 'px';
            div.style.backgroundColor = 'rgb(255, 255, 255, 0)';
            div.classList.add('cell');
            div.addEventListener('mouseover', updateCell);
            div.addEventListener('mousedown', updateCell);
            
            gridContainer.appendChild(div);
        }
    }

}

function resizeWindow() {

    gridWidthPx = getGridSizePx();
    gridContainer.style.width = gridWidthPx + 'px';
    header.style.width = gridWidthPx + GRID_BORDER_PX * 2 + 'px';
    controls.style.width = gridWidthPx + GRID_BORDER_PX * 2 + 'px';

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

function changeColor(e) {

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
    let divColor = div.style.backgroundColor.replace(/[^\d,.]/g, '').split(',');

    let pen = (e.buttons === 2) ? [255, 255, 255] : penColor;

    const divWeight = 3;
    const penWeight = 1;
    const totalWeight = divWeight + penWeight;
    divColor = divColor.map((e, i) => clampColorVal(parseInt((+e * divWeight + parseInt(+pen[i] * penWeight)) / totalWeight)));

    div.style.backgroundColor = `rgb(${divColor[0]}, ${divColor[1]}, ${divColor[2]}, 1)`;
}

function clearGrid() {
    while (gridContainer.firstChild) {
        gridContainer.removeChild(gridContainer.firstChild);
    }
    createGrid(gridSize);
}

function changeGridSize(e) {
    gridSize = +e.target.value; // parseInt(prompt('Please enter the number of cells per side (max 100):', gridSize));
    gridSize = Math.min(gridSize, 100);
 
    rangeOutput.textContent = gridSize;

    if (!gridSize) gridSize = GRID_SIZE_DEFAULT;

    clearGrid();
}