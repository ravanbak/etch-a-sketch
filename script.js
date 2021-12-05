const MIN_WIDTH_PX = 450;
const GRID_SIZE_DEFAULT = 25;
const BUTTON_HEIGHT_PX = 33;
const MARGIN_PX = 20;
const GRID_BORDER_PX = 10;

let gridWidthPx = 960;
let gridSize = GRID_SIZE_DEFAULT;

const header = document.querySelector('#header');
const controls = document.querySelector('#controls');
const gridContainer = document.querySelector('#gridcontainer');
let rangeOutput; // output for grid size slider

init();

function init() {
    let borderColor = 'rgba(48, 213, 200, 0.33)';

    gridContainer.style.minWidth = `${MIN_WIDTH_PX}px`;
    gridContainer.style.margin = MARGIN_PX + 'px';
    gridContainer.style.border = `${borderColor} ${GRID_BORDER_PX}px solid`;
    gridContainer.style.borderRadius = '8px';
    gridContainer.style.boxShadow = `0px 0px 20px ${borderColor}`;
    
    header.style.marginTop = '0'; // MARGIN_PX + 'px';
    header.style.marginBottom = '0';
    header.style.minWidth = `${MIN_WIDTH_PX}px`;
    //header.style.border = 'solid black 1px';

    controls.style.marginTop = '0'; //MARGIN_PX + 'px';
    controls.style.minWidth = `${MIN_WIDTH_PX}px`;
    //controls.style.border = 'solid black 1px';

    addHeaderElements();
    addControls();
    createGrid(gridSize);
    
    window.onresize = resizeWindow;

    resizeWindow();
}

function addHeaderElements() {
    let h = document.createElement('h1');
    h.textContent = 'Grid Sketch'
    h.style.margin = '10px 0 0'; // auto 0 0';
    header.appendChild(h);

    let p = document.createElement('p');
    p.innerHTML = "hover to draw; hold <strong><kbd>shift</kbd></strong> to erase; hold <strong><kbd>ctrl</kbd></strong> to float";
    p.style.padding = '0';
    p.style.margin = '10px';
    header.appendChild(p);
}

function addControls() {
    let rangeContainer = document.createElement('div');
    rangeContainer.style.display = 'flex';

    let rangeLabel = document.createElement('label');
    rangeLabel.setAttribute('for', 'gridsize');
    rangeLabel.textContent = 'grid size';
    rangeContainer.appendChild(rangeLabel);

    let range = document.createElement('input');
    range.setAttribute('type', 'range');
    range.setAttribute('name', 'gridsize');
    range.setAttribute('min', '1');
    range.setAttribute('max', '100');
    range.setAttribute('value', gridSize);
    range.addEventListener('input', (e) => { rangeOutput.textContent = e.target.value; });
    range.addEventListener('mouseup', changeGridSize);
    rangeContainer.appendChild(range);

    rangeOutput = document.createElement('output');
    rangeOutput.setAttribute('for', 'gridsize');
    rangeOutput.textContent = gridSize;
    rangeContainer.appendChild(rangeOutput);
    
    controls.appendChild(rangeContainer);

    b = document.createElement('button');
    b.textContent = 'Clear';
    b.style.marginLeft = '10px';
    b.style.height = '33px';
    b.style.boxShadow = '0px 0px 20px rgba(0, 0, 30, 0.33)';
    b.addEventListener('click', clearGrid);
    controls.appendChild(b);   
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
            //div.addEventListener('touchstart', updateCell);
            //div.addEventListener('touchmove', updateCell);
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

function updateCell(e) {

    e.preventDefault(); // prevent mouse drag-drop

    if (e.ctrlKey) return;

    let div = e.target;
    let color = div.style.backgroundColor;
    let [r, g, b, a] = color.replace(/[^\d,.]/g, '').split(',');

    if (!a) a = 1;

    const alphaOffset = (e.shiftKey ? -1/9 : 1/9);

    a = Math.max(0, Math.min(1, parseFloat(a) + alphaOffset));
    //div.style.backgroundColor = `rgb(${r}, ${g}, ${b}, ${a})`;
    div.style.backgroundColor = `rgb(16, 0, 64, ${a})`;

    //if (e.buttons === 1) div.style.backgroundColor = 'orangered';

    /*
    if (e.buttons === 1) {
        // left button
        div.style.backgroundColor = 'white';
    }
    else {
        div.style.backgroundColor = 'orangered';
    }
    */

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