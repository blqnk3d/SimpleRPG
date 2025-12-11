document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const gridSize = 25;
    const fovRadius = 10; // Reintroduced FOV radius
    
    const TILE = {
        FLOOR: 0,
        WALL: 1
    };

    let map = [];
    let visibleCells = new Set(); // Reintroduced
    let discoveredCells = new Set(); // Reintroduced
    
    const itemTypes = [
        { color: 'green', name: 'a Potion' },
        { color: 'gold', name: 'some Gold' },
        { color: 'lightblue', name: 'a Scroll' }
    ];

    const monsters = [
        { name: 'Schleim', level: 1},
        { name: 'Ratte', level: 1},
        { name: 'Goblin', level: 2},
        { name: 'Wolf', level: 3}
    ];

    let enemies = [];
    let items = [];

    function printGridToConsole() {
        console.log("--- Current Grid State ---");
        let gridString = "";
        for (let y = 0; y < gridSize; y++) {
            let row = "";
            for (let x = 0; x < gridSize; x++) {
                if (playerPosition.x === x && playerPosition.y === y) {
                    row += "P ";
                } else if (enemies.some(e => e.x === x && e.y === y)) {
                    row += "E ";
                } else if (items.some(i => i.x === x && i.y === y)) {
                    row += "I ";
                } else if (map[y * gridSize + x] === TILE.WALL) {
                    row += "# ";
                } else {
                    row += ". ";
                }
            }
            gridString += row + "\n";
        }
        console.log(gridString);
        console.log("--------------------------");
    }

    function generateMap() {
        map = Array(gridSize * gridSize).fill(TILE.WALL);
        let x = Math.floor(gridSize / 2);
        let y = Math.floor(gridSize / 2);
        let steps = (gridSize * gridSize) / 2;

        for (let i = 0; i < steps; i++) {
            const index = y * gridSize + x;
            if (map[index] === TILE.WALL) {
                map[index] = TILE.FLOOR;
            }
            const direction = Math.floor(Math.random() * 4);
            switch (direction) {
                case 0: if (y > 1) y--; break;
                case 1: if (y < gridSize - 2) y++; break;
                case 2: if (x > 1) x--; break;
                case 3: if (x < gridSize - 2) x++; break;
            }
        }
        
        const occupiedTiles = [];
        
        const startTile = findRandomFloorTile(occupiedTiles);
        occupiedTiles.push(startTile);

        spawnItems(5, occupiedTiles);
        spawnEnemies(5, occupiedTiles);

        return startTile;
    }

    function findRandomFloorTile(exclude = []) {
        let floorTiles = [];
        for (let i = 0; i < map.length; i++) {
            if (map[i] === TILE.FLOOR) {
                const x = i % gridSize;
                const y = Math.floor(i / gridSize);
                if (!exclude.some(pos => pos.x === x && pos.y === y)) {
                    floorTiles.push({ x, y });
                }
            }
        }
        if (floorTiles.length > 0) {
            return floorTiles[Math.floor(Math.random() * floorTiles.length)];
        }
        return { x: 1, y: 1 };
    }
    
    function spawnItems(count, occupied) {
        for (let i = 0; i < count; i++) {
            const position = findRandomFloorTile(occupied);
            const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            items.push({ ...itemType, ...position });
            occupied.push(position);
        }
    }

    function spawnEnemies(count, occupied) {
        for (let i = 0; i < count; i++) {
            const position = findRandomFloorTile(occupied);
            const monster = monsters[Math.floor(Math.random() * monsters.length)];
            enemies.push({ ...monster, ...position });
            occupied.push(position);
        }
    }

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;
        cell.style.position = 'relative'; 
        gridContainer.appendChild(cell);
    }
    
    const playerPosition = generateMap();

    function isWall(x, y) {
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
            return true;
        }
        return map[y * gridSize + x] === TILE.WALL;
    }

    function traceLine(x0, y0, x1, y1) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            if (x0 >= 0 && x0 < gridSize && y0 >= 0 && y0 < gridSize) {
                visibleCells.add(`${x0},${y0}`);
                discoveredCells.add(`${x0},${y0}`);
            }

            // Strict diagonal wall checking
            if (x0 !== playerPosition.x || y0 !== playerPosition.y) { // Don't block player's own cell
                if (isWall(x0, y0)) {
                    break;
                }
                if (dx > 0 && dy > 0 && err * 2 === dx - dy) { // Moving diagonally in current step (or just finished previous)
                    // Check the two cardinal neighbors that were 'skipped' if this was a true diagonal
                    if (isWall(x0 - sx, y0) && isWall(x0, y0 - sy)) {
                        break; // Blocked by diagonal walls
                    }
                }
            }
            
            if ((x0 === x1) && (y0 === y1)) {
                break;
            }

            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    function calculateFov() {
        visibleCells.clear();
        visibleCells.add(`${playerPosition.x},${playerPosition.y}`);
        discoveredCells.add(`${playerPosition.x},${playerPosition.y}`);

        for (let x = 0; x < gridSize; x++) {
            traceLine(playerPosition.x, playerPosition.y, x, 0);
            traceLine(playerPosition.x, playerPosition.y, x, gridSize - 1);
        }
        for (let y = 0; y < gridSize; y++) {
            traceLine(playerPosition.x, playerPosition.y, 0, y);
            traceLine(playerPosition.x, playerPosition.y, gridSize - 1, y);
        }
    }

    function render() {
        calculateFov(); // Call calculateFov to populate visibleCells and discoveredCells
        const cells = document.querySelectorAll('.grid-cell');
        document.querySelectorAll('.name-label').forEach(label => label.remove());

        cells.forEach((cell, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            const cellKey = `${x},${y}`;
            
            cell.className = 'grid-cell'; // Reset classes
            cell.style.backgroundColor = '';
            cell.textContent = ''; // Clear any debug text content

            if (!discoveredCells.has(cellKey)) {
                cell.classList.add('undiscovered');
                return;
            }

            if (map[index] === TILE.WALL) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('floor');
            }
            
            if (visibleCells.has(cellKey)) {
                cell.classList.add('visible'); // Will combine with 'wall' or 'floor'
            } else {
                cell.classList.add('shadow'); // Will combine with 'wall' or 'floor'
            }
            
            const item = items.find(i => i.x === x && i.y === y);
            if (item) {
                cell.classList.add('item');
                cell.style.backgroundColor = item.color;
                const nameLabel = document.createElement('div');
                nameLabel.classList.add('name-label');
                nameLabel.textContent = item.name;
                cell.appendChild(nameLabel);
            }

            const enemy = enemies.find(e => e.x === x && e.y === y);
            if (enemy) {
                cell.classList.add('enemy');
                cell.style.backgroundColor = 'red';
                const nameLabel = document.createElement('div');
                nameLabel.classList.add('name-label');
                nameLabel.textContent = enemy.name;
                cell.appendChild(nameLabel);
            }
        });

        const playerIndex = playerPosition.y * gridSize + playerPosition.x;
        if (cells[playerIndex]) {
            cells[playerIndex].classList.add('player');
            cells[playerIndex].style.backgroundColor = 'blue'; 
        }
        printGridToConsole();
    }

    document.addEventListener('keydown', (e) => {
        let newX = playerPosition.x;
        let newY = playerPosition.y;

        switch (e.key) {
            case 'w': newY--; break;
            case 's': newY++; break;
            case 'a': newX--; break;
            case 'd': newX++; break;
        }

        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
            if (!isWall(newX, newY)) {
                playerPosition.x = newX;
                playerPosition.y = newY;
                console.log(`Player moved to (${playerPosition.x}, ${playerPosition.y})`);
            } else {
                console.log(`Movement blocked by wall at (${newX}, ${newY})`);
            }
        }
        else {
            console.log(`Movement blocked by grid boundary at (${newX}, ${newY})`);
        }
        render();
    });

    render();
});