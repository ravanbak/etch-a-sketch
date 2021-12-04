const GRID_SIZE = 25;
const GRID_WIDTH_PIXELS = 960;

const container = document.querySelector('#gridcontainer');

let b = document.createElement('button');
b.textContent = 'Reset Grid';
b.addEventListener('click', resetGrid);
document.body.insertBefore(b, container);

createGrid(GRID_SIZE);

function createGrid(gridSize) {
    
    container.style.width = GRID_WIDTH_PIXELS + 'px';

    let cellSize = GRID_WIDTH_PIXELS / gridSize;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            let div = document.createElement('div');
            div.style.width = cellSize + 'px';
            div.style.height = cellSize + 'px';
            div.classList.add('cell');
            div.addEventListener('mouseover', (e) => updateCell(e));
            container.appendChild(div);
        }
    }

}

function updateCell(e) {
    let div = e.target;

    if (e.buttons === 1) {
        // left button
        div.style.backgroundColor = 'white';
    }
    else {
        div.style.backgroundColor = 'orangered';
    }
}

function resetGrid() {
    let gridSize = parseInt(prompt('Please enter the number of cells per side (max 100):'));
    gridSize = Math.min(gridSize, 100);
    
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    createGrid(gridSize);
}