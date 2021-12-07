const GRID_SIZE_DEFAULT = 25;
const BUTTON_HEIGHT_PX = 33;
const GRID_BORDER_PX = 0;
const GRID_BORDER_COLOR = 'rgb(100, 100, 100, 1)';
const GRID_BORDER_RADIUS = 10;
const GRID_MARGIN_PX = 16;
const DEFAULT_PEN_COLOR = 'rgb(100, 100, 100)';
const HIGHLIGHT_COLOR = 'rgb(0, 190, 255, 0.2)';

let gridWidthPx = 960;
let gridSize = GRID_SIZE_DEFAULT;
let rangeLabel;
let rangeOutput; // output for grid size slider

let hoverDraw = false;

const header = document.querySelector('#header');
const controls = document.querySelector('#controls');
const gridContainer = document.querySelector('#gridcontainer');

let colorContainer;
let colorWheelBackground;
let colorImg;
let colorPicker;

let penColor = colorArrayFromRGBString(DEFAULT_PEN_COLOR);

init();

function init() {
    gridContainer.style.margin = GRID_MARGIN_PX + 'px';
    gridContainer.style.border = `${GRID_BORDER_COLOR} ${GRID_BORDER_PX}px solid`;
    gridContainer.style.borderRadius = GRID_BORDER_RADIUS + 'px';
    gridContainer.style.boxShadow = `0px 0px 20px ${GRID_BORDER_COLOR}`;
    
    // prevent context menu on right-click
    gridContainer.addEventListener('contextmenu', (e) => { e.preventDefault() });

    addHeaderElements();
    addControls();
    createGrid(gridSize);
    resizeWindow();
    
    window.onresize = resizeWindow;
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
    controls.appendChild(colorContainer);

    colorContainer.style.id = 'colorcontainer';
    colorContainer.style.display = 'flex';
    colorContainer.style.alignItems = 'center';
        
    colorImg = document.createElement('img');
    colorContainer.appendChild(colorImg);

    colorImg.setAttribute('src', 'color-spectrum.png');
    colorImg.style.width = colorWheelSizePx + 'px';
    colorImg.style.height = colorWheelSizePx + 'px';
    colorImg.style.borderRadius = '50%';
    colorImg.style.position = 'absolute';
    colorImg.style.backgroundColor = 'transparent';
    //colorImg.style.pointerEvents = 'none';
    colorImg.addEventListener('click', colorWheelClick);
    
    colorWheelBackground = document.createElement('div');
    colorContainer.appendChild(colorWheelBackground);

    colorWheelBackground.style.width = colorWheelSizePx - 4 + 'px';
    colorWheelBackground.style.height = colorWheelSizePx - 4 + 'px';
    colorWheelBackground.style.margin = '1px';
    colorWheelBackground.style.borderRadius = '50%';
    colorWheelBackground.style.backgroundColor = DEFAULT_PEN_COLOR;
    
    colorPicker = document.createElement('input');
    colorContainer.appendChild(colorPicker);

    colorPicker.setAttribute('type', 'color');
    colorPicker.setAttribute('name', 'colorpicker');
    colorPicker.setAttribute('value', hexFromColorArray(colorArrayFromRGBString(DEFAULT_PEN_COLOR)));
    colorPicker.style.visibility = 'hidden';
    colorPicker.style.width = colorWheelSizePx + 'px';
    colorPicker.style.height = colorWheelSizePx + 'px';
    colorPicker.style.position = 'absolute';
    colorPicker.addEventListener('change', changePenColor);
    colorPicker.addEventListener('input', changePenColor);
    
    let rangeContainer = document.createElement('div');
    controls.appendChild(rangeContainer);

    rangeContainer.style.display = 'flex';
    rangeContainer.style.flex = '1';
    rangeContainer.style.alignItems = 'center';
    rangeContainer.style.width = '100%';
    rangeContainer.style.margin = '0 5%';
    
    rangeLabel = document.createElement('label');
    rangeContainer.appendChild(rangeLabel);

    rangeLabel.setAttribute('for', 'gridsize');
    rangeLabel.style.minWidth = '70px';
    rangeLabel.style.textAlign = 'center';
    rangeLabel.style.borderRadius = '10px';
    rangeLabel.textContent = 'grid size';

    let range = document.createElement('input');
    rangeContainer.appendChild(range);

    range.setAttribute('type', 'range');
    range.setAttribute('name', 'gridsize');
    range.setAttribute('min', '1');
    range.setAttribute('max', '100');
    range.setAttribute('value', gridSize);
    range.style.width = '100%';
    range.style.margin = '0 10px';
    range.addEventListener('input', moveGridSizeSlider); 
    range.addEventListener('mousedown', moveGridSizeSlider); 
    range.addEventListener('mouseup', changeGridSize);
    range.addEventListener('touchend', changeGridSize);

    rangeOutput = document.createElement('output');
    rangeOutput.setAttribute('for', 'gridsize');
    rangeOutput.textContent = gridSize;
    rangeOutput.style.borderRadius = '50%';
    rangeOutput.style.minWidth = '26px';
    rangeOutput.style.textAlign = 'center';
    rangeContainer.appendChild(rangeOutput);

    b = document.createElement('button');
    b.textContent = 'clear';
    b.style.marginLeft = '10px';
    b.style.height = '40px';
    b.style.width = '50px';
    b.style.backgroundColor = '';
    b.style.boxShadow = '0px 0px 4px ' + GRID_BORDER_COLOR; // rgba(0, 0, 30, 0.33)';
    b.style.border = '1px solid ' + GRID_BORDER_COLOR; // rgba(48, 213, 200, 0.33)';
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
    let headerHeight = header.offsetHeight;
    let controlsHeight = controls.offsetHeight;

    let size = Math.min(window.innerWidth, 
                        window.innerHeight - headerHeight - controlsHeight);

    return size - GRID_MARGIN_PX * 2 - GRID_BORDER_PX * 2;
}

function createGrid(size) {
    gridWidthPx = getGridSizePx(); 
    gridContainer.style.width = gridWidthPx + 'px';

    let cellSize = getCellSizePx();

    const borderRadius = GRID_BORDER_RADIUS + 'px';
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let div = document.createElement('div');
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

    if (getGridSizePx === gridWidthPx) return;

    gridWidthPx = getGridSizePx();
    gridContainer.style.width = gridWidthPx + 'px';
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

function changePenColor(e) {

    penColor = colorArrayFromHex(e.target.value);
    colorWheelBackground.style.backgroundColor = e.target.value;

    //gridContainer.style.boxShadow = `0px 0px 20px ${e.target.value}`;
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

function moveGridSizeSlider(e) {
    rangeOutput.textContent = e.target.value;
    rangeOutput.style.backgroundColor = HIGHLIGHT_COLOR
    rangeOutput.style.boxShadow = '0px 0px 16px ' + HIGHLIGHT_COLOR;

    rangeLabel.style.backgroundColor = HIGHLIGHT_COLOR
    rangeLabel.style.boxShadow = '0px 0px 16px ' + HIGHLIGHT_COLOR;
}

function changeGridSize(e) {
    gridSize = +e.target.value; // parseInt(prompt('Please enter the number of cells per side (max 100):', gridSize));
    gridSize = Math.min(gridSize, 100);
 
    rangeOutput.textContent = gridSize;
    rangeOutput.style.backgroundColor = 'transparent';
    rangeOutput.style.boxShadow = 'none';

    rangeLabel.style.backgroundColor = 'transparent';
    rangeLabel.style.boxShadow = 'none';

    if (!gridSize) gridSize = GRID_SIZE_DEFAULT;

    clearGrid();
}