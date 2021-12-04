const GRID_SIZE_DEFAULT = 25;
const BUTTON_HEIGHT_PX = 33;
const MARGIN_PX = 20;
const GRID_BORDER_PX = 10;

let gridWidthPx = 960;
let gridSize = GRID_SIZE_DEFAULT;

const header = document.querySelector('#header');
const container = document.querySelector('#gridcontainer');

init();

function init() {
    container.style.margin = MARGIN_PX + 'px';
    container.style.border = 'rgb(0, 200, 255, 0.5) ' + GRID_BORDER_PX + 'px solid';
    container.style.borderRadius = '10px';
    container.style.boxShadow = '0px 0px 20px rgba(0, 200, 255, 0.5)';
    header.style.margin = MARGIN_PX + 'px';

    addHeaderElements();
    createGrid(gridSize);
    
    window.onresize = resizeGrid;

    resizeGrid();
}

function addHeaderElements() {
    let h = document.createElement('h1');
    h.textContent = 'Etch-a-Sketch'
    h.style.margin = 0;
    header.appendChild(h);

    let b = document.createElement('button');
    b.textContent = 'Change Grid Size';
    b.style.marginLeft = 'auto';
    b.style.height = '33px';
    b.style.boxShadow = '0px 0px 20px rgba(0, 0, 30, 0.33)';
    b.addEventListener('click', changeGridSize);
    header.appendChild(b);   

    b = document.createElement('button');
    b.textContent = 'Clear Grid';
    b.style.marginLeft = '10px';
    b.style.height = '33px';
    b.style.boxShadow = '0px 0px 20px rgba(0, 0, 30, 0.33)';
    b.addEventListener('click', clearGrid);
    header.appendChild(b);   
}

function getCellSizePx() {
    return gridWidthPx / gridSize;
}

function getGridSizePx() {
    return Math.min(window.innerWidth - MARGIN_PX * 2 - 20, window.innerHeight - BUTTON_HEIGHT_PX - 60);
}

function createGrid(size) {
    
    gridWidthPx = getGridSizePx(); 
    container.style.width = gridWidthPx + 'px';

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
            container.appendChild(div);
        }
    }

}

function resizeGrid() {

    gridWidthPx = getGridSizePx();
    container.style.width = gridWidthPx + 'px';
    header.style.width = gridWidthPx + GRID_BORDER_PX * 2 + 'px';

    let cellSize = getCellSizePx();

    let divNodes = container.querySelectorAll('div');
    for (let div of divNodes) {
            div.style.width = cellSize + 'px';
            div.style.height = cellSize + 'px';       
    }

}

function updateCell(e) {

    //e.preventDefault();

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
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    createGrid(gridSize);
}

function changeGridSize() {
    gridSize = parseInt(prompt('Please enter the number of cells per side (max 100):', gridSize));
    gridSize = Math.min(gridSize, 100);
    
    clearGrid();
}