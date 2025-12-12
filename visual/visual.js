document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    console.log('Grid container:', gridContainer); // Log the grid container
    const gridSize = 25;
    const fovRadius = 10;
    
    const TILE = {
        FLOOR: 0,
        WALL: 1,
        STAIRS_UP: 2,
        STAIRS_DOWN: 3
    };

    let dungeonFloors = [];
    let currentFloorIndex = 0;

    let map = []; // Map of the current floor
    let visibleCells = new Set();
    let discoveredCells = new Set();
    
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

    let enemies = []; // Enemies on current floor
    let items = []; // Items on current floor

    let playerPosition = {x:0, y:0}; // Player position on current floor


    function printGridToConsole() {
        console.log("--- Current Grid State (Floor " + (currentFloorIndex + 1) + ") ---");
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
                } else if (map[y * gridSize + x] === TILE.STAIRS_UP) {
                    row += "U ";
                } else if (map[y * gridSize + x] === TILE.STAIRS_DOWN) {
                    row += "D ";
                } else {
                    row += ". ";
                }
            }
            gridString += row + "\n";
        }
        console.log(gridString);
        console.log("--------------------------");
    }

    // Helper to check if a rectangle overlaps with any existing rooms
    function overlaps(newRoom, rooms) {
        for (const room of rooms) {
            if (newRoom.x < room.x + room.width &&
                newRoom.x + newRoom.width > room.x &&
                newRoom.y < room.y + room.height &&
                newRoom.y + newRoom.height > room.y) {
                return true;
            }
        }
        return false;
    }

    // Helper to carve a room
    function carveRoom(room, targetMap) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (x > 0 && x < gridSize - 1 && y > 0 && y < gridSize - 1) {
                    targetMap[y * gridSize + x] = TILE.FLOOR;
                }
            }
        }
    }

    // Helper to carve a corridor between two points
    function carveCorridor(x1, y1, x2, y2, targetMap) {
        let currentX = x1;
        let currentY = y1;
        while (currentX !== x2 || currentY !== y2) {
            targetMap[currentY * gridSize + currentX] = TILE.FLOOR;

            if (currentX < x2) currentX++;
            else if (currentX > x2) currentX--;
            else if (currentY < y2) currentY++;
            else if (currentY > y2) currentY--;
        }
        targetMap[currentY * gridSize + currentX] = TILE.FLOOR;
    }

    function findRandomFloorTileInMap(targetMap, exclude = []) {
        let tiles = [];
        for(let i=0; i < targetMap.length; i++) {
            if (targetMap[i] === TILE.FLOOR) {
                const x = i % gridSize;
                const y = Math.floor(i / gridSize);
                if (!exclude.some(pos => pos.x === x && pos.y === y)) {
                    tiles.push({x, y});
                }
            }
        }
        if (tiles.length > 0) {
            return tiles[Math.floor(Math.random() * tiles.length)];
        }
        return {x:1, y:1};
    }

    function generateFloor(floorNum) {
        let floorMap = Array(gridSize * gridSize).fill(TILE.WALL);
        let floorRooms = [];
        const maxRooms = 8;
        const minRoomSize = 5;
        const maxRoomSize = 10;

        for (let i = 0; i < maxRooms; i++) {
            const width = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
            const height = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
            const x = Math.floor(Math.random() * (gridSize - width - 2)) + 1;
            const y = Math.floor(Math.random() * (gridSize - height - 2)) + 1;

            const newRoom = { x, y, width, height };

            if (!overlaps(newRoom, floorRooms)) {
                floorRooms.push(newRoom);
                carveRoom(newRoom, floorMap);
            }
        }

        floorRooms.sort((a, b) => a.x - b.x);

        for (let i = 0; i < floorRooms.length - 1; i++) {
            const room1 = floorRooms[i];
            const room2 = floorRooms[i + 1];

            const x1 = Math.floor(room1.x + room1.width / 2);
            const y1 = Math.floor(room1.y + room1.height / 2);
            const x2 = Math.floor(room2.x + room2.width / 2);
            const y2 = Math.floor(room2.y + room2.height / 2);

            let currentX = x1;
            let currentY = y1;
            while (currentX !== x2 || currentY !== y2) {
                floorMap[currentY * gridSize + currentX] = TILE.FLOOR;

                if (currentX < x2) currentX++;
                else if (currentX > x2) currentX--;
                else if (currentY < y2) currentY++;
                else if (currentY > y2) currentY--;
            }
            floorMap[currentY * gridSize + currentX] = TILE.FLOOR;
        }

        let floorOccupiedTiles = [];
        const floorStart = findRandomFloorTileInMap(floorMap, floorOccupiedTiles);
        floorOccupiedTiles.push(floorStart);

        let floorItems = [];
        let floorEnemies = [];

        // Place stairs
        let stairsUpPos = null;
        let stairsDownPos = null;

        if (floorNum > 0) { // Not the top floor (floor 0)
            stairsUpPos = findRandomFloorTileInMap(floorMap, floorOccupiedTiles);
            floorMap[stairsUpPos.y * gridSize + stairsUpPos.x] = TILE.STAIRS_UP;
            floorOccupiedTiles.push(stairsUpPos);
        }
        stairsDownPos = findRandomFloorTileInMap(floorMap, floorOccupiedTiles);
        floorMap[stairsDownPos.y * gridSize + stairsDownPos.x] = TILE.STAIRS_DOWN;
        floorOccupiedTiles.push(stairsDownPos);
        
        // Spawn items and enemies for this floor
        for (let i = 0; i < 5; i++) {
            const pos = findRandomFloorTileInMap(floorMap, floorOccupiedTiles);
            const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            floorItems.push({ ...itemType, ...pos });
            floorOccupiedTiles.push(pos);
        }
        for (let i = 0; i < 5; i++) {
            const pos = findRandomFloorTileInMap(floorMap, floorOccupiedTiles);
            const monster = monsters[Math.floor(Math.random() * monsters.length)];
            floorEnemies.push({ ...monster, ...pos });
            floorOccupiedTiles.push(pos);
        }

        return {
            map: floorMap,
            items: floorItems,
            enemies: floorEnemies,
            playerStart: floorStart,
            stairsUp: stairsUpPos,
            stairsDown: stairsDownPos,
            discoveredCells: new Set() // Initialize discovered cells for this floor
        };
    }

    function generateDungeon(numFloors) {
        dungeonFloors = [];
        for (let i = 0; i < numFloors; i++) {
            dungeonFloors.push(generateFloor(i));
        }

        for (let i = 0; i < numFloors - 1; i++) {
            const floorLower = dungeonFloors[i];
            const floorUpper = dungeonFloors[i + 1];

            if (floorLower.stairsDown && floorUpper.stairsUp) {
                // Already linked from generateFloor
            } else if (floorLower.stairsDown && !floorUpper.stairsUp) {
                floorUpper.stairsUp = {...floorLower.stairsDown}; 
                floorUpper.map[floorUpper.stairsUp.y * gridSize + floorUpper.stairsUp.x] = TILE.STAIRS_UP;
            } else if (floorUpper.stairsUp && !floorLower.stairsDown) {
                floorLower.stairsDown = {...floorUpper.stairsUp};
                floorLower.map[floorLower.stairsDown.y * gridSize + floorLower.stairsDown.x] = TILE.STAIRS_DOWN;
            }
        }
    }

    function switchFloor(direction) {
        // Save current floor state
        dungeonFloors[currentFloorIndex].map = [...map];
        dungeonFloors[currentFloorIndex].items = [...items];
        dungeonFloors[currentFloorIndex].enemies = [...enemies];
        dungeonFloors[currentFloorIndex].discoveredCells = new Set([...discoveredCells]); // Save discovered state per floor

        currentFloorIndex += direction;

        if (currentFloorIndex < 0) {
            currentFloorIndex = 0;
            console.log("Already on the top floor!");
            return;
        }
        if (currentFloorIndex >= dungeonFloors.length) {
            currentFloorIndex = dungeonFloors.length - 1;
            console.log("Already on the bottom floor!");
            return;
        }

        const newFloor = dungeonFloors[currentFloorIndex];
        map = [...newFloor.map];
        items = [...newFloor.items];
        enemies = [...newFloor.enemies];
        discoveredCells = new Set([...newFloor.discoveredCells]); // Load discovered state

        if (direction === 1) { // Moved down, player should appear on up-stairs of the new floor
            if (newFloor.stairsUp) {
                playerPosition.x = newFloor.stairsUp.x;
                playerPosition.y = newFloor.stairsUp.y;
            } else {
                playerPosition = {...newFloor.playerStart};
            }
        } else if (direction === -1) { // Moved up, player should appear on down-stairs of the new floor
            if (newFloor.stairsDown) {
                playerPosition.x = newFloor.stairsDown.x;
                playerPosition.y = newFloor.stairsDown.y;
            } else {
                playerPosition = {...newFloor.playerStart};
            }
        } else {
            playerPosition = {...newFloor.playerStart};
        }
        
        visibleCells.clear(); // Clear visibleCells, it will be recalculated by render
        render();
    }


    // --- Game Initialization ---
    generateDungeon(3); // Generate 3 floors
    currentFloorIndex = 0;
    map = dungeonFloors[currentFloorIndex].map;
    items = dungeonFloors[currentFloorIndex].items;
    enemies = dungeonFloors[currentFloorIndex].enemies;
    playerPosition = {...dungeonFloors[currentFloorIndex].playerStart};


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

            if (x0 !== playerPosition.x || y0 !== playerPosition.y) {
                if (isWall(x0, y0)) {
                    break;
                }
                if (dx > 0 && dy > 0 && err * 2 === dx - dy) {
                    if (isWall(x0 - sx, y0) && isWall(x0, y0 - sy)) {
                        break;
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
        calculateFov();
        const cells = document.querySelectorAll('.grid-cell');
        console.log('Number of cells found by querySelectorAll:', cells.length); // Log cells found
        if (cells.length === 0) {
            console.error('No grid cells found to render!');
            return;
        }

        document.querySelectorAll('.name-label').forEach(label => label.remove());

        cells.forEach((cell, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            const cellKey = `${x},${y}`;
            
            cell.className = 'grid-cell';
            cell.style.backgroundColor = '';
            cell.textContent = '';

            if (!discoveredCells.has(cellKey)) {
                cell.classList.add('undiscovered');
                cell.textContent = '';
                return;
            }

            let cellContent = '';
            
            if (map[index] === TILE.WALL) {
                cell.classList.add('wall');
                cellContent = 'W';
            } else if (map[index] === TILE.STAIRS_UP) {
                cell.classList.add('stairs-up');
                cellContent = 'U';
            } else if (map[index] === TILE.STAIRS_DOWN) {
                cell.classList.add('stairs-down');
                cellContent = 'D';
            }
            else {
                cell.classList.add('floor');
                cellContent = 'F';
            }
            
            const item = items.find(i => i.x === x && i.y === y);
            const enemy = enemies.find(e => e.x === x && e.y === y);

            if (item && visibleCells.has(cellKey)) {
                cell.classList.add('item');
                cell.style.backgroundColor = item.color;
                cellContent = 'I';
            }
            if (enemy && visibleCells.has(cellKey)) {
                cell.classList.add('enemy');
                cell.style.backgroundColor = 'red';
                cellContent = 'E';
            }
            if (playerPosition.x === x && playerPosition.y === y) {
                cellContent = 'P';
            }

            cell.textContent = cellContent;
            
            if (visibleCells.has(cellKey)) {
                cell.classList.add('visible');
                
                if (item) {
                    const nameLabel = document.createElement('div');
                    nameLabel.classList.add('name-label');
                    nameLabel.textContent = item.name;
                    cell.appendChild(nameLabel);
                }
                if (enemy) {
                    const nameLabel = document.createElement('div');
                    nameLabel.classList.add('name-label');
                    nameLabel.textContent = enemy.name;
                    cell.appendChild(nameLabel);
                }
            } else {
                cell.classList.add('shadow');
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
            case 'q':
                if (map[playerPosition.y * gridSize + playerPosition.x] === TILE.STAIRS_UP) {
                    switchFloor(-1);
                }
                break;
            case 'e':
                if (map[playerPosition.y * gridSize + playerPosition.x] === TILE.STAIRS_DOWN) {
                    switchFloor(1);
                }
                break;
        }

        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
            const currentTile = map[playerPosition.y * gridSize + playerPosition.x];
            const newTile = map[newY * gridSize + newX];
            
            // Allow movement onto stairs if they are not walls
            if (!isWall(newX, newY) || newTile === TILE.STAIRS_UP || newTile === TILE.STAIRS_DOWN) {
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

    // Initial render
    console.log('Before initial render, gridContainer:', gridContainer);
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;
        cell.style.position = 'relative'; 
        gridContainer.appendChild(cell);
    }
    console.log('Number of grid cells created and appended before initial render:', gridContainer.children.length);
    if (gridContainer.children.length > 0) console.log('First grid cell created:', gridContainer.children[0]);
    render();
});
