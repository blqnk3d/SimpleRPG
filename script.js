document.addEventListener('DOMContentLoaded', () => {
    // --- Game Version ---
    const GAME_VERSION = "1.0.11"; // Increment this for new versions

    // --- DOM Elements ---
    const elements = {
        level: document.getElementById('player-level'),
        xp: document.getElementById('player-xp'),
        xpToNextLevel: document.getElementById('xp-to-next-level'),
        hp: document.getElementById('player-hp'),
        maxHp: document.getElementById('player-max-hp'),
        hpBar: document.getElementById('hp-bar'),
        strength: document.getElementById('player-strength'),
        defense: document.getElementById('player-defense'),
        attackSpeed: document.getElementById('player-attack-speed'),
        maxHpStat: document.getElementById('player-max-hp-stat'),
        statPoints: document.getElementById('stat-points'),
        log: document.getElementById('log'),
        respecButton: document.getElementById('respec-button'),
        exploreButton: document.getElementById('explore-button'),
        attackButton: document.getElementById('attack-button'),
        infoButton: document.getElementById('info-button'),
        fleeButton: document.getElementById('flee-button'),
        statButtons: document.querySelectorAll('.stat-button'),
        enemyStatsContainer: document.getElementById('enemy-stats-container'),
        enemyName: document.getElementById('enemy-name'),
        enemyHp: document.getElementById('enemy-hp'),
        enemyMaxHp: document.getElementById('enemy-max-hp'),
        enemyHpBar: document.getElementById('enemy-hp-bar'),
        enemyLevelDisplay: document.getElementById('enemy-level-display'),
        enemyStrengthDisplay: document.getElementById('enemy-strength-display'),
        enemyDefenseDisplay: document.getElementById('enemy-defense-display'),
        enemyXpRewardDisplay: document.getElementById('enemy-xp-reward-display'),
        tabs: document.querySelectorAll('.tab-button'),
        tabContents: document.querySelectorAll('.tab-content'),
        inventoryGrid: document.getElementById('inventory-grid'),
        equippedWeapon: document.getElementById('equipped-weapon'),
        equippedArmor: document.getElementById('equipped-armor'),
        gameOverOverlay: document.getElementById('game-over-overlay'),
        retryButton: document.getElementById('retry-button'),
        gameContainer: document.getElementById('game-container'),
        gameVersion: document.getElementById('game-version'),
        fastHealButton: document.getElementById('fast-heal-button'),
        shopItemsGrid: document.getElementById('shop-items-grid'),
        goldDisplay: document.getElementById('gold-display'),
        customDialogOverlay: document.getElementById('custom-dialog-overlay'),
        customDialogMessage: document.getElementById('custom-dialog-message'),
        customDialogConfirm: document.getElementById('custom-dialog-confirm'),
        customDialogCancel: document.getElementById('custom-dialog-cancel'),
        statsTab: document.getElementById('stats-tab'),
        // New elements for adventure tab player status
        playerLevelAdventure: document.getElementById('player-level-adventure'),
        playerXpAdventure: document.getElementById('player-xp-adventure'),
        xpToNextLevelAdventure: document.getElementById('xp-to-next-level-adventure'),
        playerHpAdventure: document.getElementById('player-hp-adventure'),
        playerMaxHpAdventure: document.getElementById('player-max-hp-adventure'),
        hpBarAdventure: document.getElementById('hp-bar-adventure'),
        // Login elements
        loginOverlay: document.getElementById('login-overlay'),
        playerNameInput: document.getElementById('player-name-input'),
        startGameButton: document.getElementById('start-game-button'),
        playerNameDisplay: document.getElementById('player-name-display'),
        // Context Menu
        contextMenu: document.getElementById('custom-context-menu'),
        contextSell: document.getElementById('context-sell'),
        contextDestroy: document.getElementById('context-destroy')
    };

    // --- Game State ---
    let player;
    let currentEnemy = null;
    let activeContextItem = null; // To store the item key for the context menu

    const monsters = [
        // Level 1-3
        { name: 'Schleim', level: 1, hp: 8, strength: 2, defense: 1, xp: 3, loot: [{ item: 'healing-potion', chance: 0.1 }] },
        { name: 'Ratte', level: 1, hp: 6, strength: 3, defense: 1, xp: 3, loot: [{ item: 'dagger-swiftness', chance: 0.05 }] },
        { name: 'Wildschwein', level: 2, hp: 10, strength: 4, defense: 2, xp: 4, loot: [] },
        { name: 'Goblin', level: 2, hp: 12, strength: 4, defense: 1, xp: 5, loot: [{ item: 'goblin-ear', chance: 0.8 }, { item: 'rusty-sword', chance: 0.1 }] },
        { name: 'Riesenspinne', level: 2, hp: 10, strength: 5, defense: 2, xp: 4, loot: [{ item: 'antidote', chance: 0.5 }] },
        { name: 'Kobold Speerträger', level: 3, hp: 14, strength: 5, defense: 3, xp: 6, loot: [{ item: 'leather-armor', chance: 0.1 }] },
        { name: 'Wolf', level: 3, hp: 15, strength: 6, defense: 3, xp: 8, loot: [{ item: 'wolf-pelt', chance: 0.5 }, { item: 'iron-sword', chance: 0.05 }] },
        // Level 4-7
        { name: 'Bandit', level: 4, hp: 20, strength: 7, defense: 4, xp: 10, loot: [{ item: 'iron-sword', chance: 0.15 }, { item: 'studded-leather', chance: 0.1 }] },
        { name: 'Hobgoblin', level: 4, hp: 22, strength: 8, defense: 5, xp: 12, loot: [{ item: 'goblin-ear', chance: 0.2 }, { item: 'iron-sword', chance: 0.12 }] },
        { name: 'Ork', level: 5, hp: 25, strength: 8, defense: 5, xp: 12, loot: [{ item: 'iron-sword', chance: 0.2 }, { item: 'iron-armor', chance: 0.1 }] },
        { name: 'Goblin Schamane', level: 5, hp: 20, strength: 4, defense: 3, xp: 15, loot: [{ item: 'staff-fire', chance: 0.05 }, { item: 'healing-potion', chance: 0.2 }] },
        { name: 'Echsenmensch', level: 6, hp: 28, strength: 9, defense: 6, xp: 14, loot: [{ item: 'splint-mail', chance: 0.05 }] },
        { name: 'Skelett', level: 6, hp: 20, strength: 7, defense: 4, xp: 10, loot: [{ item: 'rusty-sword', chance: 0.25 }] },
        { name: 'Untoter Krieger', level: 6, hp: 25, strength: 8, defense: 6, xp: 12, loot: [{ item: 'chainmail-armor', chance: 0.15 }] },
        { name: 'Gargoyle', level: 7, hp: 30, strength: 10, defense: 10, xp: 18, loot: [] },
        { name: 'Geist', level: 7, hp: 22, strength: 9, defense: 6, xp: 15, loot: [{ item: 'scroll-escape', chance: 0.02 }] },
        { name: 'Harpyie', level: 7, hp: 25, strength: 8, defense: 5, xp: 16, loot: [] },
        // Level 8-12
        { name: 'Ghul', level: 8, hp: 30, strength: 10, defense: 7, xp: 20, loot: [{ item: 'healing-potion', chance: 0.3 }] },
        { name: 'Oger', level: 8, hp: 40, strength: 12, defense: 8, xp: 20, loot: [{ item: 'ogre-tooth', chance: 0.7 }, { item: 'morningstar', chance: 0.1 }] },
        { name: 'Ork-Berserker', level: 8, hp: 35, strength: 14, defense: 6, xp: 22, loot: [{ item: 'great-axe', chance: 0.05 }, { item: 'iron-armor', chance: 0.15 }] },
        { name: 'Troll', level: 9, hp: 50, strength: 11, defense: 8, xp: 25, loot: [{ item: 'ogre-tooth', chance: 0.2 }] },
        { name: 'Golem', level: 9, hp: 40, strength: 12, defense: 10, xp: 25, loot: [{ item: 'iron-armor', chance: 0.3 }] },
        { name: 'Minotaurus', level: 10, hp: 55, strength: 15, defense: 9, xp: 30, loot: [{ item: 'great-axe', chance: 0.1 }] },
        { name: 'Vampirbrut', level: 11, hp: 50, strength: 13, defense: 8, xp: 35, loot: [{ item: 'silver-sword', chance: 0.2 }] },
        { name: 'Wyvern', level: 12, hp: 65, strength: 16, defense: 10, xp: 45, loot: [] },
        { name: 'Drache', level: 12, hp: 60, strength: 15, defense: 12, xp: 50, loot: [{ item: 'steel-sword', chance: 0.5 }, { item: 'steel-armor', chance: 0.5 }] },
        // Level 13+
        { name: 'Feuerriese', level: 13, hp: 80, strength: 18, defense: 12, xp: 60, loot: [{ item: 'full-plate', chance: 0.1 }] },
        { name: 'Frostriese', level: 14, hp: 85, strength: 17, defense: 14, xp: 65, loot: [{ item: 'full-plate', chance: 0.15 }] },
        { name: 'Dämonenlord', level: 15, hp: 100, strength: 20, defense: 15, xp: 100, loot: [{ item: 'strong-healing-potion', chance: 0.75 }, { item: 'great-axe', chance: 0.5 }] },
        { name: 'Hydra', level: 16, hp: 120, strength: 22, defense: 16, xp: 150, loot: [{ item: 'elixir-strength', chance: 0.1 }] },
    ];

    const items = {
        // Existing Weapons
        'rusty-sword': { name: 'Rostiges Schwert', type: 'weapon', strength: 2, defense: 0, sellPrice: 5 },
        'iron-sword': { name: 'Eisenschwert', type: 'weapon', strength: 5, defense: 0, sellPrice: 20, requirements: { strength: 5 } },
        'silver-sword': { name: 'Silberschwert', type: 'weapon', strength: 7, defense: 0, sellPrice: 35, requirements: { strength: 8 } },
        'steel-sword': { name: 'Stahlschwert', type: 'weapon', strength: 10, attackSpeed: 1, sellPrice: 40, requirements: { strength: 12 } },
        // New Weapons
        'dagger-swiftness': { name: 'Dolch der Schnelligkeit', type: 'weapon', strength: 2, attackSpeed: 2, sellPrice: 30 },
        'morningstar': { name: 'Morgenstern', type: 'weapon', strength: 8, defense: 0, sellPrice: 60, requirements: { strength: 10 } },
        'staff-fire': { name: 'Feuerstab', type: 'weapon', strength: 12, defense: 0, sellPrice: 150, requirements: { strength: 15 } },
        'great-axe': { name: 'Großaxt', type: 'weapon', strength: 15, defense: 0, sellPrice: 250, requirements: { strength: 18 } },

        // Existing Armor
        'leather-armor': { name: 'Lederrüstung', type: 'armor', strength: 0, defense: 3, sellPrice: 10 },
        'iron-armor': { name: 'Eisenrüstung', type: 'armor', strength: 0, defense: 6, sellPrice: 30, requirements: { defense: 5 } },
        'chainmail-armor': { name: 'Kettenrüstung', type: 'armor', strength: 0, defense: 8, sellPrice: 50, requirements: { defense: 8 } },
        'steel-armor': { name: 'Stahlrüstung', type: 'armor', strength: 0, defense: 10, sellPrice: 60, requirements: { defense: 12 } },
        // New Armor
        'studded-leather': { name: 'Beschlagene Lederrüstung', type: 'armor', strength: 0, defense: 5, sellPrice: 40, requirements: { defense: 3 } },
        'splint-mail': { name: 'Schienenpanzer', type: 'armor', strength: 0, defense: 9, sellPrice: 120, requirements: { defense: 10 } },
        'full-plate': { name: 'Vollplattenrüstung', type: 'armor', strength: 0, defense: 15, sellPrice: 300, requirements: { defense: 18 } },

        // Existing Consumables
        'healing-potion': { name: 'Heiltrank', type: 'consumable', heals: 20, sellPrice: 4 },
        'strong-healing-potion': { name: 'Starker Heiltrank', type: 'consumable', heals: 50, sellPrice: 15 },
        'antidote': { name: 'Gegengift', type: 'consumable', heals: 5, sellPrice: 10 },
        // New Consumables
        'scroll-escape': { name: 'Schriftrolle der Flucht', type: 'consumable', effect: 'escape', sellPrice: 75 },
        'elixir-strength': { name: 'Stärkeelixier', type: 'consumable', effect: 'boost_str', sellPrice: 100 },

        // Misc & Junk
        'gold-coin': { name: 'Goldmünze', type: 'currency', sellPrice: 1 },
        'goblin-ear': { name: 'Goblin-Ohr', type: 'junk', sellPrice: 2 },
        'wolf-pelt': { name: 'Wolfspelz', type: 'junk', sellPrice: 8 },
        'ogre-tooth': { name: 'Ogerzahn', type: 'junk', sellPrice: 15 },
    };

    const shopItems = {
        // Level 1-2
        'rusty-sword': { levelRequired: 1, price: 15, stock: 3, initialStock: 3, restockInterval: 3600000, lastRestock: Date.now() },
        'leather-armor': { levelRequired: 1, price: 25, stock: 3, initialStock: 3, restockInterval: 3600000, lastRestock: Date.now() },
        'healing-potion': { levelRequired: 1, price: 10, stock: 10, initialStock: 10, restockInterval: 1800000, lastRestock: Date.now() },
        'dagger-swiftness': { levelRequired: 2, price: 40, stock: 2, initialStock: 2, restockInterval: 3600000, lastRestock: Date.now() },
        'antidote': { levelRequired: 2, price: 20, stock: 10, initialStock: 10, restockInterval: 1800000, lastRestock: Date.now() },
        // Level 3-5
        'iron-sword': { levelRequired: 3, price: 50, stock: 1, initialStock: 1, restockInterval: 7200000, lastRestock: Date.now() }, 
        'studded-leather': { levelRequired: 4, price: 60, stock: 1, initialStock: 1, restockInterval: 5400000, lastRestock: Date.now() },
        'strong-healing-potion': { levelRequired: 5, price: 30, stock: 5, initialStock: 5, restockInterval: 3600000, lastRestock: Date.now() }, 
        'silver-sword': { levelRequired: 5, price: 70, stock: 1, initialStock: 1, restockInterval: 7200000, lastRestock: Date.now() }, 
        'iron-armor': { levelRequired: 5, price: 75, stock: 1, initialStock: 1, restockInterval: 10800000, lastRestock: Date.now() },
        // Level 6-10
        'morningstar': { levelRequired: 7, price: 90, stock: 1, initialStock: 1, restockInterval: 9000000, lastRestock: Date.now() },
        'steel-sword': { levelRequired: 8, price: 100, stock: 1, initialStock: 1, restockInterval: 14400000, lastRestock: Date.now() },
        'scroll-escape': { levelRequired: 8, price: 250, stock: 3, initialStock: 3, restockInterval: 10800000, lastRestock: Date.now() },
        'splint-mail': { levelRequired: 9, price: 150, stock: 1, initialStock: 1, restockInterval: 12600000, lastRestock: Date.now() },
        'steel-armor': { levelRequired: 10, price: 150, stock: 1, initialStock: 1, restockInterval: 18000000, lastRestock: Date.now() },
        'elixir-strength': { levelRequired: 10, price: 500, stock: 1, initialStock: 1, restockInterval: 18000000, lastRestock: Date.now() },
    };

    const initialPlayerState = {
        level: 1,
        xp: 0,
        hp: 10,
        maxHp: 10,
        strength: 1,
        baseStrength: 1,
        defense: 1,
        baseDefense: 1,
        attackSpeed: 1,
        baseAttackSpeed: 1,
        statPoints: 0,
        xpToNextLevel: 10,
        inventory: [],
        equipped: {
            weapon: null,
            armor: null,
        },
        coins: 0, // Initialize coins to 0
        playerName: "", // New property for player name
        shopRotation: [],
        lastShopRotationTime: 0,
    };

    // --- Game Logic ---

    function gameOver() {
        addLogMessage('Du wurdest besiegt! Das Spiel ist vorbei.', 'red');
        elements.gameContainer.style.display = 'none';
        elements.gameOverOverlay.style.display = 'flex';
        localStorage.removeItem('rpgGameState'); // Clear game state on game over
    }

    function restartGame() {
        player = { ...initialPlayerState }; // Reset player to initial state
        currentEnemy = null; // Clear current enemy
        localStorage.removeItem('rpgGameState'); // Clear saved state
        elements.gameOverOverlay.style.display = 'none'; // Hide game over overlay
        elements.gameContainer.style.display = 'grid'; // Show game container
        
        // Re-enable all game control buttons
        elements.exploreButton.disabled = false;
        elements.attackButton.disabled = false;
        elements.infoButton.disabled = false;
        elements.fleeButton.disabled = false;

        // Clear log
        elements.log.innerHTML = '<p>Willkommen beim Simple RPG! Klicke auf \'Erkunden\', um zu beginnen.</p>';

        init(); // Reinitialize UI and game state
    }

    function respecStats() {
        const spentStatPoints = (player.strength - player.baseStrength) + 
                                (player.defense - player.baseDefense) + 
                                (player.attackSpeed - player.baseAttackSpeed) + 
                                ((player.maxHp - initialPlayerState.maxHp) / 5);

        if (spentStatPoints === 0) {
            addLogMessage('Du hast noch keine Stat-Punkte ausgegeben, es gibt nichts zurückzusetzen.', 'yellow');
            return;
        }

        showChoiceDialog(
            'Möchtest du deine Stat-Punkte zurücksetzen? Du erhältst alle verbrauchten Punkte zurück und deine Kernwerte werden zurückgesetzt.',
            () => { // onConfirm
                player.statPoints += spentStatPoints;
                player.strength = player.baseStrength;
                player.defense = player.baseDefense;
                player.attackSpeed = player.baseAttackSpeed;
                player.maxHp = initialPlayerState.maxHp;
                player.hp = player.maxHp; // Heal to full HP after respec

                addLogMessage('Deine Stat-Punkte wurden zurückgesetzt!', 'yellow');
                updateUI();
            },
            () => { // onCancel
                addLogMessage('Stat-Punkte wurden nicht zurückgesetzt.', 'yellow');
            }
        );
    }

    function sellItem(itemKey) {
        const item = items[itemKey];
        const itemIndex = player.inventory.indexOf(itemKey);
    
        if (item && itemIndex > -1) {
            const sellPrice = item.sellPrice || 0;
            if (sellPrice > 0) {
                player.coins += sellPrice;
                player.inventory.splice(itemIndex, 1);
                addLogMessage(`Du hast ${item.name} für ${sellPrice} Gold verkauft.`, 'gold');
                updateUI();
            } else {
                addLogMessage(`${item.name} kann nicht verkauft werden.`, 'yellow');
            }
        }
    }
    
    function destroyItem(itemKey) {
        const item = items[itemKey];
        const itemIndex = player.inventory.indexOf(itemKey);
    
        if (item && itemIndex > -1) {
            showChoiceDialog(
                `Möchtest du ${item.name} wirklich zerstören? Diese Aktion kann nicht rückgängig gemacht werden.`,
                () => { // onConfirm
                    player.inventory.splice(itemIndex, 1);
                    addLogMessage(`Du hast ${item.name} zerstört.`, 'red');
                    updateUI();
                },
                () => { // onCancel
                    addLogMessage('Aktion abgebrochen.', 'yellow');
                }
            );
        }
    }

    function restockShop() {
        const now = Date.now();
        if (!player.shopItemsState) return;
        for (const itemKey in player.shopItemsState) {
            const item = player.shopItemsState[itemKey];
            if (item && now - item.lastRestock > item.restockInterval) {
                const masterItem = shopItems[itemKey];
                if (masterItem) {
                    item.stock = masterItem.initialStock;
                    item.lastRestock = now;
                }
            }
        }
    }

    function rotateShop() {
        const now = Date.now();
        const SIX_HOURS = 6 * 60 * 60 * 1000;
    
        if (now - player.lastShopRotationTime > SIX_HOURS) {
            const availableItems = Object.keys(shopItems).filter(key => player.level >= shopItems[key].levelRequired);
            
            // Shuffle the array
            for (let i = availableItems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableItems[i], availableItems[j]] = [availableItems[j], availableItems[i]];
            }
    
            player.shopRotation = availableItems.slice(0, 7); // Show up to 7 items
            player.lastShopRotationTime = now;
            addLogMessage('Die Waren des Shops wurden erneuert!', 'cyan');
        }
    }

    function updateInventoryUI() {
        elements.inventoryGrid.innerHTML = '';
        player.inventory.forEach(itemKey => {
            const item = items[itemKey];
            if (item) {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('inventory-item');
                
                let itemDetails = `<strong>${item.name}</strong>`;
                if (item.strength) itemDetails += `<br>Stärke: +${item.strength}`;
                if (item.defense) itemDetails += `<br>Verteidigung: +${item.defense}`;
                if (item.attackSpeed) itemDetails += `<br>Angriffsgeschw.: +${item.attackSpeed}`;
                if (item.heals) itemDetails += `<br>Heilt: ${item.heals} LP`;

                if (item.requirements) {
                    let reqText = '';
                    for (const req in item.requirements) {
                        const statName = { strength: 'Stärke', defense: 'Verteidigung' }[req] || req;
                        reqText += `${statName} ${item.requirements[req]}, `;
                    }
                    if (reqText) {
                        itemDetails += `<br><span style="color: #ff6b6b;">Benötigt: ${reqText.slice(0, -2)}</span>`;
                    }
                }

                itemDiv.innerHTML = itemDetails;
                
                itemDiv.dataset.itemKey = itemKey;
                itemDiv.addEventListener('click', () => equipItem(itemKey));
                
                itemDiv.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    activeContextItem = itemKey;
                    elements.contextMenu.style.top = `${e.pageY}px`;
                    elements.contextMenu.style.left = `${e.pageX}px`;
                    elements.contextMenu.style.display = 'block';
                    elements.contextSell.style.display = item.sellPrice > 0 ? 'block' : 'none';
                });
                elements.inventoryGrid.appendChild(itemDiv);
            }
        });

        if (player.equipped.weapon) {
            elements.equippedWeapon.textContent = `Waffe: ${items[player.equipped.weapon].name}`;
        } else {
            elements.equippedWeapon.textContent = 'Waffe: Keine';
        }

        if (player.equipped.armor) {
            elements.equippedArmor.textContent = `Rüstung: ${items[player.equipped.armor].name}`;
        } else {
            elements.equippedArmor.textContent = 'Rüstung: Keine';
        }
    }

    function updateShopUI() {
        elements.shopItemsGrid.innerHTML = '';
        if (!player.shopRotation || player.shopRotation.length === 0) {
            rotateShop();
        }

        player.shopRotation.forEach(itemKey => {
            const shopItem = player.shopItemsState[itemKey];
            const item = items[itemKey];
            
            if (!shopItem || !item) return;

            const canAfford = player.coins >= shopItem.price;
            const canMeetLevel = player.level >= shopItem.levelRequired;
            const isAvailable = shopItem.stock > 0;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('inventory-item');

            let itemStatus = `Verfügbar: ${shopItem.stock}`;
            if (shopItem.stock === 0) {
                itemStatus = 'Ausverkauft!';
                itemDiv.classList.add('unavailable-item');
            } else if (!canAfford || !canMeetLevel) {
                itemDiv.classList.add('unavailable-item');
            }

            itemDiv.innerHTML = `
                <strong>${item.name}</strong><br>
                Preis: ${shopItem.price} Gold<br>
                Verkaufspreis: ${item.sellPrice} Gold<br>
                Level: ${shopItem.levelRequired}<br>
                ${itemStatus}
            `;
            itemDiv.dataset.itemKey = itemKey;
            
            if (isAvailable && canAfford && canMeetLevel) {
                itemDiv.addEventListener('click', () => buyItem(itemKey));
            } else {
                itemDiv.style.cursor = 'not-allowed';
            }
            elements.shopItemsGrid.appendChild(itemDiv);
        });
    }

    function buyItem(itemKey) {
        const shopItem = player.shopItemsState[itemKey]; // Use player's state
        if (!shopItem) return;

        const canAfford = player.coins >= shopItem.price;
        const canMeetLevel = player.level >= shopItem.levelRequired;
        const isAvailable = shopItem.stock > 0;

        if (!isAvailable) {
            addLogMessage(`${items[itemKey].name} ist ausverkauft!`, 'red');
            return;
        }
        if (!canMeetLevel) {
            addLogMessage(`Du benötigst Level ${shopItem.levelRequired}, um ${items[itemKey].name} zu kaufen.`, 'red');
            return;
        }
        if (!canAfford) {
            addLogMessage('Nicht genügend Gold!', 'red');
            return;
        }

        player.coins -= shopItem.price;
        player.inventory.push(itemKey);
        shopItem.stock--; // This now correctly modifies the player's state
        addLogMessage(`Du hast ${items[itemKey].name} für ${shopItem.price} Gold gekauft!`, 'gold');
        updateUI();
    }

    function calculatePlayerStats() {
        const stats = {
            strength: player.strength,
            defense: player.defense,
            maxHp: player.maxHp,
            attackSpeed: player.attackSpeed,
        };

        if (player.equipped.weapon) {
            const weapon = items[player.equipped.weapon];
            stats.strength += weapon.strength || 0;
            stats.attackSpeed += weapon.attackSpeed || 0;
        }
        if (player.equipped.armor) {
            const armor = items[player.equipped.armor];
            stats.defense += armor.defense || 0;
            stats.attackSpeed += armor.attackSpeed || 0;
        }
        return stats;
    }
    
    function equipItem(itemKey) {
        const item = items[itemKey];
        if (!item || player.inventory.indexOf(itemKey) === -1) return;

        // Check for requirements
        if (item.requirements) {
            let canEquip = true;
            let missingReqs = '';
            for (const req in item.requirements) {
                if (player[req] < item.requirements[req]) {
                    canEquip = false;
                    const statName = { strength: 'Stärke', defense: 'Verteidigung' }[req] || req;
                    missingReqs += `${statName} ${item.requirements[req]}, `;
                }
            }
            if (!canEquip) {
                addLogMessage(`Voraussetzungen für ${item.name} nicht erfüllt. Benötigt: ${missingReqs.slice(0, -2)}.`, 'red');
                return;
            }
        }

        if (item.type === 'consumable') {
            if (item.heals) {
                player.hp = Math.min(calculatePlayerStats().maxHp, player.hp + item.heals);
                addLogMessage(`Du hast ${item.name} benutzt und ${item.heals} LP geheilt.`, 'green');
            }
            player.inventory.splice(player.inventory.indexOf(itemKey), 1);
            updateUI();
            return;
        }

        const currentEquipped = player.equipped[item.type];
        if (currentEquipped) {
            player.inventory.push(currentEquipped);
        }

        player.equipped[item.type] = itemKey;
        player.inventory = player.inventory.filter(i => i !== itemKey);

        updateInventoryUI();
        updateUI();
    }

    function createEnemy() {
        const discoverableMonsters = monsters.filter(m => m.level <= player.level + 1);
        const randomMonster = discoverableMonsters[Math.floor(Math.random() * discoverableMonsters.length)];
        
        // Make a copy to avoid modifying the original monster object
        const enemy = { ...randomMonster };
        // Slightly randomize stats to make them less predictable
        enemy.hp = Math.floor(enemy.hp * (1 + (Math.random() - 0.5) * 0.2));
        enemy.strength = Math.floor(enemy.strength * (1 + (Math.random() - 0.5) * 0.2));
        enemy.defense = Math.floor(enemy.defense * (1 + (Math.random() - 0.5) * 0.2));
        enemy.maxHp = enemy.hp; // Set maxHp for the fight

        return enemy;
    }

    function triggerRandomEvent() {
        const events = [
            {
                description: 'Ein mysteriöser Schrein bietet dir einen Tausch an: -5 Max LP für 3 Stat-Punkte. Annehmen?',
                type: 'choice',
                action: () => {
                    if (player.maxHp <= 5) {
                        addLogMessage('Der Schrein erfordert mindestens 5 maximale LP, die du nicht hast.', 'red');
                        return;
                    }
                    showChoiceDialog(
                        'Ein mysteriöser Schrein bietet dir einen Tausch an: -5 Max LP für 3 Stat-Punkte. Annehmen?',
                        () => { // onConfirm
                            player.maxHp -= 5;
                            if (player.hp > player.maxHp) player.hp = player.maxHp;
                            player.statPoints += 3;
                            addLogMessage('Du hast 5 maximale LP gegen 3 Stat-Punkte eingetauscht.', 'purple');
                            updateUI();
                        },
                        () => { // onCancel
                            addLogMessage('Du lehnst das Angebot des Schreins ab.', 'yellow');
                        }
                    );
                }
            },
            {
                description: 'Du findest eine Schatztruhe! Du erhältst 10 EP.',
                type: 'positive',
                action: () => {
                    addLogMessage('Du hast eine Schatztruhe gefunden und 10 EP erhalten!', 'gold');
                    gainXP(10);
                }
            },
            {
                description: 'Du bist in eine Falle getappt! Möchtest du versuchen, sie zu entschärfen oder umgehen?',
                type: 'choice',
                action: () => {
                    showChoiceDialog(
                        'Du bist in eine Falle getappt! Möchtest du versuchen, sie zu entschärfen (50% Chance auf +5 EP, 50% Chance auf -10 LP Schaden) oder sie umgehen (-5 EP)?',
                        () => { // onConfirm (disarm)
                            addLogMessage('Du versuchst, die Falle zu entschärfen...', 'orange');
                            if (Math.random() < 0.5) { // 50% chance to succeed
                                addLogMessage('Du hast die Falle erfolgreich entschärft und 5 EP erhalten!', 'green');
                                gainXP(5);
                            } else {
                                addLogMessage('Du scheiterst bei der Entschärfung und erleidest 10 LP Schaden!', 'red');
                                player.hp = Math.max(0, player.hp - 10);
                                updateUI();
                                if (player.hp === 0) {
                                    gameOver();
                                }
                            }
                        },
                        () => { // onCancel (avoid)
                            addLogMessage('Du umgehst die Falle und verlierst 5 EP.', 'yellow');
                            player.xp = Math.max(0, player.xp - 5);
                            updateUI();
                        }
                    );
                }
            },
            {
                description: 'Ein freundlicher Händler bietet dir ein rostiges Schwert für 15 EP an.',
                type: 'choice',
                action: () => {
                    if (player.xp < 15) {
                        addLogMessage('Ein freundlicher Händler bietet dir ein rostiges Schwert für 15 EP an, aber du hast nicht genug EP.', 'red');
                        return;
                    }
                    showChoiceDialog(
                        'Ein freundlicher Händler bietet dir ein rostiges Schwert für 15 EP an. Kaufen?',
                        () => { // onConfirm
                            player.xp -= 15;
                            player.inventory.push('rusty-sword');
                            addLogMessage('Du hast ein rostiges Schwert gekauft.', 'cyan');
                            updateUI();
                        },
                        () => { // onCancel
                            addLogMessage('Du lehnst das Angebot des Händlers ab.', 'yellow');
                        }
                    );
                }
            },
            {
                description: 'Du ruhst dich in einer Taverne aus und heilst 10 LP.',
                type: 'positive',
                action: () => {
                    addLogMessage('Du ruhst dich in einer Taverne aus und heilst 10 LP.', 'green');
                    player.hp = Math.min(calculatePlayerStats().maxHp, player.hp + 10);
                    updateUI();
                }
            },
            {
                description: 'Du findest einen Beutel mit Gold! Du erhältst 25 EP.',
                type: 'positive',
                action: () => {
                    addLogMessage('Du hast einen Beutel mit Gold gefunden und 25 EP erhalten!', 'gold');
                    gainXP(25);
                }
            },
            {
                description: 'Ein Dieb stiehlt dir 10 EP!',
                type: 'negative',
                action: () => {
                    addLogMessage('Ein Dieb stiehlt dir 10 EP!', 'red');
                    player.xp = Math.max(0, player.xp - 10);
                    updateUI();
                }
            },
            {
                description: 'Du findest einen Heiltrank! Möchtest du ihn nehmen?',
                type: 'choice',
                action: () => {
                    showChoiceDialog(
                        'Du findest einen Heiltrank! Möchtest du ihn nehmen?',
                        () => { // onConfirm
                            addLogMessage('Du hast einen Heiltrank gefunden und genommen!', 'green');
                            player.inventory.push('healing-potion');
                            updateUI();
                        },
                        () => { // onCancel
                            addLogMessage('Du lässt den Heiltrank liegen.', 'yellow');
                        }
                    );
                }
            },
            {
                description: 'Du triffst einen alten Weisen, der dir einen Stat-Punkt schenkt.',
                type: 'positive',
                action: () => {
                    addLogMessage('Du triffst einen alten Weisen, der dir einen Stat-Punkt schenkt.', 'purple');
                    player.statPoints++;
                    updateUI();
                }
            },
            {
                description: 'Du fällst in ein Loch und verstauchst dir den Knöchel. Du verlierst 1 Stärke für den nächsten Kampf.',
                type: 'negative',
                action: () => {
                    addLogMessage('Du fällst in ein Loch und verstauchst dir den Knöchel. Du verlierst 1 Stärke für den nächsten Kampf.', 'red');
                    // This is a temporary effect, so we don't save it to the player object
                    // Instead, we could modify the next enemy to be weaker, or add a temporary debuff to the player
                    // For simplicity, we will just log the message for now
                }
            }
        ];
        
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        randomEvent.action();
    }

    function showMonsterInfo() {
        if (!currentEnemy) return;
        // If the container is currently hidden, show it and populate, else hide it.
        if (elements.enemyStatsContainer.style.display === 'none' || elements.enemyStatsContainer.style.display === '') {
            updateEnemyUI(); // Populate with current enemy stats
            elements.enemyStatsContainer.style.display = 'block';
        } else {
            elements.enemyStatsContainer.style.display = 'none';
        }
    }

    function addLogMessage(message, color = '#f0f0f0') {
        const p = document.createElement('p');
        p.textContent = message;
        p.style.color = color;
        elements.log.insertBefore(p, elements.log.firstChild);
    }

    function damageFlash(element) {
        element.classList.add('damage-taken');
        setTimeout(() => {
            element.classList.remove('damage-taken');
        }, 300); // Duration of the animation
    }

    function showChoiceDialog(message, onConfirm, onCancel) {
        elements.customDialogMessage.textContent = message;
        elements.customDialogOverlay.style.display = 'flex';

        const confirmHandler = () => {
            elements.customDialogConfirm.removeEventListener('click', confirmHandler);
            elements.customDialogCancel.removeEventListener('click', cancelHandler);
            elements.customDialogOverlay.style.display = 'none';
            if (onConfirm) onConfirm();
        };

        const cancelHandler = () => {
            elements.customDialogConfirm.removeEventListener('click', confirmHandler);
            elements.customDialogCancel.removeEventListener('click', cancelHandler);
            elements.customDialogOverlay.style.display = 'none';
            if (onCancel) onCancel();
        };

        elements.customDialogConfirm.addEventListener('click', confirmHandler);
        elements.customDialogCancel.addEventListener('click', cancelHandler);
    }

    function updateEnemyUI() {
        if (currentEnemy) {
            elements.enemyStatsContainer.style.display = 'block';
            elements.enemyName.textContent = currentEnemy.name;
            elements.enemyHp.textContent = currentEnemy.hp;
            elements.enemyMaxHp.textContent = currentEnemy.maxHp;
            elements.enemyLevelDisplay.textContent = currentEnemy.level;
            elements.enemyStrengthDisplay.textContent = currentEnemy.strength;
            elements.enemyDefenseDisplay.textContent = currentEnemy.defense;
            elements.enemyXpRewardDisplay.textContent = currentEnemy.xp;
            const enemyHpPercentage = (currentEnemy.hp / currentEnemy.maxHp) * 100;
            elements.enemyHpBar.style.width = `${enemyHpPercentage}%`;
        } else {
            elements.enemyStatsContainer.style.display = 'none';
        }
    }

    function updateUI() {
        const playerStats = calculatePlayerStats();

        elements.level.textContent = player.level;
        elements.xp.textContent = player.xp;
        elements.xpToNextLevel.textContent = player.xpToNextLevel;
        elements.hp.textContent = player.hp;
        elements.maxHp.textContent = playerStats.maxHp;
        
        const hpPercentage = (player.hp / playerStats.maxHp) * 100;
        elements.hpBar.style.width = `${hpPercentage}%`;

        // Update HP bar color based on percentage
        elements.hpBar.classList.remove('low-hp', 'critical-hp');
        if (hpPercentage <= 25) {
            elements.hpBar.classList.add('critical-hp');
        } else if (hpPercentage <= 50) {
            elements.hpBar.classList.add('low-hp');
        }

        // Update Adventure Tab Player Status
        elements.playerLevelAdventure.textContent = player.level;
        elements.playerHpAdventure.textContent = player.hp;
        elements.playerMaxHpAdventure.textContent = playerStats.maxHp;
        elements.hpBarAdventure.style.width = `${hpPercentage}%`;
        elements.playerXpAdventure.textContent = player.xp;
        elements.xpToNextLevelAdventure.textContent = player.xpToNextLevel;

        // Update HP bar color for Adventure Tab
        elements.hpBarAdventure.classList.remove('low-hp', 'critical-hp');
        if (hpPercentage <= 25) {
            elements.hpBarAdventure.classList.add('critical-hp');
        } else if (hpPercentage <= 50) {
            elements.hpBarAdventure.classList.add('low-hp');
        }

        elements.strength.textContent = playerStats.strength;
        elements.defense.textContent = playerStats.defense;
        elements.attackSpeed.textContent = playerStats.attackSpeed;
        elements.maxHpStat.textContent = player.maxHp;
        elements.statPoints.textContent = player.statPoints;

        elements.statButtons.forEach(btn => {
            btn.disabled = player.statPoints === 0;
        });

        elements.goldDisplay.textContent = player.coins; // Update gold display

        // Manage button visibility based on game state
        if (currentEnemy) {
            elements.exploreButton.style.display = 'none';
            elements.attackButton.style.display = 'inline-block';
            elements.infoButton.style.display = 'inline-block';
            elements.fleeButton.style.display = 'inline-block';
            elements.fastHealButton.style.display = 'none'; // Hide fast heal button during combat
        } else {
            elements.exploreButton.style.display = 'inline-block';
            elements.attackButton.style.display = 'none';
            elements.infoButton.style.display = 'none';
            elements.fleeButton.style.display = 'none';

            // Show fast heal button if player has potions and is not at full HP
            const hasHealingPotion = player.inventory.includes('healing-potion');
            const playerStats = calculatePlayerStats();
            if (hasHealingPotion && player.hp < playerStats.maxHp) {
                elements.fastHealButton.style.display = 'inline-block';
            } else {
                elements.fastHealButton.style.display = 'none';
            }
        }
        
        // Update shop UI if shop tab is active
        if (document.getElementById('shop-tab').classList.contains('active')) {
            restockShop(); // Restock when shop is opened
            updateShopUI();
        }

        updateInventoryUI();
        saveGame();
    }

    function levelUp() {
        player.level++;
        player.xp = 0;
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
        player.statPoints += 3; // Grant 3 stat points per level
        player.hp = player.maxHp; // Heal on level up
        addLogMessage(`Level Up! Du bist jetzt Level ${player.level}. Du hast 3 Stat-Punkte erhalten!`, 'yellow');
        updateUI();
    }

    function gainXP(amount) {
        player.xp += amount;
        addLogMessage(`Du hast ${amount} EP erhalten.`, '#00ff99');
        if (player.xp >= player.xpToNextLevel) {
            levelUp();
        }
        updateUI();
    }

    function explore() {
        if (Math.random() < 0.4) { // 40% chance to trigger an event instead of a monster
            triggerRandomEvent();
            return;
        }

        currentEnemy = createEnemy();
        addLogMessage(`Du triffst auf einen ${currentEnemy.name}!`, 'orange');
        elements.exploreButton.style.display = 'none';
        elements.attackButton.style.display = 'inline-block';
        elements.infoButton.style.display = 'inline-block';
        elements.fleeButton.style.display = 'inline-block';
        updateEnemyUI();
    }

    function flee() {
        if (!currentEnemy) return;

        const fleeChance = Math.max(0.1, (player.level - currentEnemy.level) * 0.1 + 0.5); // Base 50% chance, +/- 10% per level difference
        if (Math.random() < fleeChance) {
            addLogMessage('Du bist erfolgreich geflohen!', 'green');
            currentEnemy = null;
            elements.exploreButton.style.display = 'inline-block';
            elements.attackButton.style.display = 'none';
            elements.infoButton.style.display = 'none';
            elements.fleeButton.style.display = 'none';
            updateEnemyUI();
        } else {
            addLogMessage('Du konntest nicht fliehen!', 'red');
            // Enemy gets a free attack if flee fails
            const playerStats = calculatePlayerStats();
            const enemyDamage = Math.max(1, currentEnemy.strength - playerStats.defense + Math.floor(Math.random() * 2));
            player.hp = Math.max(0, player.hp - enemyDamage);
            damageFlash(elements.gameContainer); // Flash on damage
            addLogMessage(`${currentEnemy.name} greift an und verursacht ${enemyDamage} Schaden, während du fliehen wolltest! Du hast ${player.hp} LP übrig.`, 'red');
            updateUI();
            if (player.hp === 0) {
                gameOver();
            }
        }
    }

    function attack() {
        if (!currentEnemy) return;

        const playerStats = calculatePlayerStats();

        // Player attacks enemy
        const playerDamage = Math.max(1, playerStats.strength - currentEnemy.defense + Math.floor(Math.random() * 3));
        currentEnemy.hp = Math.max(0, currentEnemy.hp - playerDamage);
        addLogMessage(`Du greifst an und verursachst ${playerDamage} Schaden. ${currentEnemy.name} hat ${currentEnemy.hp} LP übrig.`, '#00ff99');
        updateEnemyUI();

        if (currentEnemy.hp === 0) {
            addLogMessage(`Du hast den ${currentEnemy.name} besiegt!`, 'green');
            gainXP(currentEnemy.xp);

            // Coin drop
            const coinsDropped = Math.floor(Math.random() * 3); // 0, 1, or 2 coins
            if (coinsDropped > 0) {
                player.coins += coinsDropped;
                addLogMessage(`Der ${currentEnemy.name} hat ${coinsDropped} Gold fallen gelassen!`, 'gold');
            }

            // Loot drop
            if (currentEnemy.loot) {
                currentEnemy.loot.forEach(lootItem => {
                    if (Math.random() < lootItem.chance) {
                        player.inventory.push(lootItem.item);
                        addLogMessage(`Der ${currentEnemy.name} hat ${items[lootItem.item].name} fallen gelassen!`, 'gold');
                    }
                });
            }

            currentEnemy = null;
            elements.exploreButton.style.display = 'inline-block';
            elements.attackButton.style.display = 'none';
            elements.infoButton.style.display = 'none';
            elements.fleeButton.style.display = 'none';
            updateEnemyUI();
            return;
        }

        // Enemy attacks player
        const enemyDamage = Math.max(1, currentEnemy.strength - playerStats.defense + Math.floor(Math.random() * 2));
        player.hp = Math.max(0, player.hp - enemyDamage);
        damageFlash(elements.gameContainer); // Flash on damage
        addLogMessage(`${currentEnemy.name} greift an und verursacht ${enemyDamage} Schaden. Du hast ${player.hp} LP übrig.`, 'red');

        updateUI();

        if (player.hp === 0) {
            gameOver();
        }
    }
    
    function useStatPoint(stat) {
        if (player.statPoints > 0) {
            player.statPoints--;
            switch(stat) {
                case 'strength':
                    player.strength++;
                    break;
                case 'defense':
                    player.defense++;
                    break;
                case 'attackSpeed':
                    player.attackSpeed++;
                    break;
                case 'maxHp':
                    player.maxHp += 5;
                    player.hp += 5;
                    break;
            }
            updateUI();
        }
    }

    function fastHeal() {
        const healingPotionIndex = player.inventory.findIndex(item => item === 'healing-potion');

        if (healingPotionIndex !== -1) {
            const potion = items['healing-potion'];
            const playerStats = calculatePlayerStats(); // Get current max HP

            if (player.hp < playerStats.maxHp) {
                player.inventory.splice(healingPotionIndex, 1); // Remove one potion
                player.hp = Math.min(playerStats.maxHp, player.hp + potion.heals);
                addLogMessage(`Du hast einen Heiltrank benutzt und ${potion.heals} LP geheilt.`, 'green');
                updateUI();
            } else {
                addLogMessage('Deine LP sind bereits voll.', 'yellow');
            }
        } else {
            addLogMessage('Du hast keine Heiltränke.', 'red');
        }
    }


    // --- Event Listeners ---
    elements.exploreButton.addEventListener('click', explore);
    elements.attackButton.addEventListener('click', attack);
    elements.infoButton.addEventListener('click', showMonsterInfo);
            elements.fleeButton.addEventListener('click', flee);
        elements.clearSaveButton = document.getElementById('clear-save-button');
        elements.clearSaveButton.addEventListener('click', clearGameData);
    elements.devGiveItemsButton = document.getElementById('dev-give-items-button');
    elements.devGiveItemsButton.addEventListener('click', devGiveItems);    elements.statButtons.forEach(btn => {
        btn.addEventListener('click', () => useStatPoint(btn.dataset.stat));
    });
    elements.respecButton.addEventListener('click', respecStats);
    elements.fastHealButton.addEventListener('click', fastHeal);
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            elements.tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
            if (tab.dataset.tab === 'shop') {
                rotateShop();
                restockShop(); // Restock when shop is opened
                updateShopUI();
            } else if (tab.dataset.tab === 'stats') {
                updateUI(); // Ensure stats are updated when stats tab is opened
            }
        });
    });

    elements.retryButton.addEventListener('click', restartGame);

    // --- Context Menu Listeners ---
    document.addEventListener('click', (e) => {
        // Hide context menu if clicked outside
        if (!elements.contextMenu.contains(e.target)) {
            elements.contextMenu.style.display = 'none';
            activeContextItem = null;
        }
    });

    elements.contextSell.addEventListener('click', () => {
        if (activeContextItem) {
            sellItem(activeContextItem);
            elements.contextMenu.style.display = 'none';
            activeContextItem = null;
        }
    });
    
    elements.contextDestroy.addEventListener('click', () => {
        if (activeContextItem) {
            destroyItem(activeContextItem);
            elements.contextMenu.style.display = 'none';
            activeContextItem = null;
        }
    });

    function clearGameData() {
        showChoiceDialog(
            'Möchtest du wirklich alle Speicherdaten löschen? Dies kann nicht rückgängig gemacht werden.',
            () => { // onConfirm
                localStorage.removeItem('rpgGameState');
                addLogMessage('Speicherdaten gelöscht. Das Spiel wird neu gestartet.', 'red');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            },
            () => { // onCancel
                addLogMessage('Speicherdaten wurden nicht gelöscht.', 'yellow');
            }
        );
    }

    function devGiveItems() {
        player.inventory.push('iron-sword');
        player.inventory.push('iron-armor');
        player.inventory.push('healing-potion');
        player.inventory.push('healing-potion');
        addLogMessage('Entwickler: Gegenstände zum Inventar hinzugefügt!', 'blue');
        updateUI();
    }

    // --- Save/Load ---
    function saveGame() {
        localStorage.setItem('rpgGameState', JSON.stringify(player));
    }

    function loadGame() {
        const savedState = localStorage.getItem('rpgGameState');
        if (savedState) {
            player = JSON.parse(savedState);
            // Ensure new properties exist for old saves
            if (!player.inventory) player.inventory = [];
            if (!player.equipped) player.equipped = { weapon: null, armor: null };
            if (player.coins === undefined) player.coins = 0;
            if (!player.playerName) player.playerName = "";
            if (!player.shopRotation) player.shopRotation = [];
            if (!player.lastShopRotationTime) player.lastShopRotationTime = 0;

        } else {
            // If no save state, create a new player
            player = { ...initialPlayerState };
        }

        // --- Shop State Synchronization ---
        const loadedShopState = player.shopItemsState || {};
        const finalShopState = {};

        // Iterate over the master list of shop items from the `shopItems` constant
        for (const itemKey in shopItems) {
            const masterShopItem = shopItems[itemKey];
            const loadedShopItem = loadedShopState[itemKey];

            if (loadedShopItem) {
                // If player has this item in their save, use their saved state but
                // ensure the master properties (like price, level) are up-to-date.
                finalShopState[itemKey] = { ...masterShopItem, ...loadedShopItem };
            } else {
                // If player does not have this item (it's new to the game), add it from the master list.
                finalShopState[itemKey] = { ...masterShopItem, lastRestock: Date.now() };
            }
        }
        // Set the player's shop state to the newly synchronized state.
        player.shopItemsState = finalShopState;
    }

    // --- Initialization ---
    function init() {
        loadGame();
        if (!player.playerName) {
            elements.loginOverlay.style.display = 'flex';
            elements.gameContainer.style.display = 'none';
        } else {
            elements.loginOverlay.style.display = 'none';
            elements.gameContainer.style.display = 'grid';
            updateUI();
        }
        elements.gameVersion.textContent = `Version: ${GAME_VERSION}`;
    }

    function startGame() {
        const name = elements.playerNameInput.value.trim();
        if (name) {
            player.playerName = name;
            elements.loginOverlay.style.display = 'none';
            elements.gameContainer.style.display = 'grid';
            updateUI();
            saveGame();
        } else {
            alert('Bitte gib einen Namen ein!');
        }
    }

    init();
    elements.startGameButton.addEventListener('click', startGame);
});
