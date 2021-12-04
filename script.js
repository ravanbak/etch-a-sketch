const GRID_SIZE_DEFAULT = 25;
const BUTTON_HEIGHT_PX = 33;

let gridWidthPx = 960;
let gridSize = GRID_SIZE_DEFAULT;

const container = document.querySelector('#gridcontainer');

addButton();
createGrid(gridSize);

window.onresize = resizeGrid;

function addButton() {
    let b = document.createElement('button');
    b.textContent = 'Reset Grid';
    b.style.margin = '20px';
    b.style.marginBottom = '0';
    b.style.height = '33px';
    b.style.boxShadow = '0px 0px 20px rgba(0, 0, 180, 0.33)';
    b.addEventListener('click', resetGrid);
    document.body.insertBefore(b, container);   
}

function getCellSizePx() {
    return gridWidthPx / gridSize;
}

function getGridSizePx() {
    return Math.min(window.innerWidth - 20, window.innerHeight - BUTTON_HEIGHT_PX - 60);
}

function createGrid(gridSize) {
    
    gridWidthPx = getGridSizePx(); 
    container.style.width = gridWidthPx + 'px';

    let cellSize = getCellSizePx();

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
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

    let cellSize = getCellSizePx();

    let divNodes = container.querySelectorAll('div');
    for (let div of divNodes) {
            div.style.width = cellSize + 'px';
            div.style.height = cellSize + 'px';       
    }

}

function updateCell(e) {
    e.preventDefault();

    let div = e.target;

    let color = div.style.backgroundColor;
    let [r, g, b, a] = color.replace(/[^\d,.]/g, '').split(',');

    a = Math.min(255, parseFloat(a) + 1/9);// 0.1111111111);
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

function resetGrid() {
    gridSize = parseInt(prompt('Please enter the number of cells per side (max 100):', gridSize));
    gridSize = Math.min(gridSize, 100);
    
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    createGrid(gridSize);
}