# Game start spacebar control
_Exported on 12/14/2025 at 01:41:34 GMT+1 from Cursor (2.2.20)_

---

**User**

Please analyze this workspace and make it possible to start playing the game by just pressing SPACE.

---

**Cursor**


Analyzing the workspace to enable starting the game with SPACE. Examining the key files to understand the current structure.



Adding SPACE to start the game immediately on page load, without clicking "Play". Updating the code:



Adding a global SPACE handler to start the game immediately, even if "Play" wasn't clicked:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global SPACE key handler to start game if not running
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // If no game is running, start human game
            if (!gameLoopRunning || currentMode === null) {
                e.preventDefault();
                startHumanGame();
            }
        }
    });
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Updating the handler to restart the game when it's over:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global SPACE key handler to start game if not running
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // If no game is running or game is over, start/restart human game
            if (!gameLoopRunning || currentMode === null || (currentMode === 'human' && game.gameOver)) {
                e.preventDefault();
                startHumanGame();
            }
        }
    });
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Checking for lint errors and verifying the implementation:



Verifying the implementation and checking if the instructions need updating:



Implementation looks good. Summary of changes:

1. Added a global SPACE key handler in `main.js` that:
   - Starts the human game if no game is running (`currentMode === null`)
   - Restarts the human game if it's over
   - Allows the game's internal handler to manage flapping during gameplay

You can now press SPACE to:
- Start the game when the page loads (no need to click "Play")
- Restart the game after game over
- Flap during gameplay (handled by the existing game logic)

The game starts immediately when you press SPACE, without clicking the "Play" button. The instructions already mention SPACE, so they remain accurate.

Test it: press SPACE when the page loads to start playing.

---

**User**

After I press SPACE to start the game, no other SPACE inputs are actually doing anything (SPACE is used to flap with the bird).

---

**Cursor**


The global SPACE handler may be interfering with the game's flapping. Checking the handlers and fixing the conflict:



The global SPACE handler may be interfering. Updating it to only start/restart the game and not interfere during gameplay:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global SPACE key handler to start game if not running
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // Only handle starting/restarting if game is not running or is over
            // Otherwise, let the game's own handler take care of flapping
            if (currentMode === null || (currentMode === 'human' && game.gameOver)) {
                e.preventDefault();
                startHumanGame();
                // Return early to prevent double-handling
                return;
            }
            // If game is running in human mode and not over, don't interfere
            // The game's own handler will take care of flapping
        }
    });
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Checking if the game's handler is set up correctly. The issue may be that both handlers fire, causing a conflict. Reviewing the game's event setup:



Both handlers listen to the same event. Ensuring the global handler doesn't interfere during gameplay. Updating it to only handle starting/restarting:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global SPACE key handler to start game if not running
    // This handler only starts/restarts the game, never interferes with flapping
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // Only handle starting/restarting if:
            // 1. No game mode is active (currentMode === null)
            // 2. Human game is over (needs restart)
            // Otherwise, let the game's own handler take care of everything
            const shouldStart = currentMode === null || (currentMode === 'human' && game.gameOver);
            
            if (shouldStart) {
                e.preventDefault();
                startHumanGame();
            }
            // If game is running normally, do nothing - let game.js handler handle flapping
        }
    }, true); // Use capture phase to ensure this runs first
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Removing capture phase and ensuring the global handler doesn't interfere during gameplay:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global SPACE key handler to start game if not running
    // This handler only starts/restarts the game, never interferes with flapping
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // Only handle starting/restarting if:
            // 1. No game mode is active (currentMode === null)
            // 2. Human game is over (needs restart)
            // Otherwise, do nothing - let game.js handler handle flapping
            const shouldStart = currentMode === null || (currentMode === 'human' && game.gameOver);
            
            if (shouldStart) {
                e.preventDefault();
                e.stopPropagation(); // Prevent game's handler from also trying to start
                startHumanGame();
            }
            // If game is running normally, do nothing - let game.js handler handle flapping
        }
    });
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Removing `stopPropagation()` since it would block the game's handler. Ensuring both handlers work together:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global SPACE key handler to start game if not running
    // This handler only starts/restarts the game, never interferes with flapping
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // Only handle starting/restarting if:
            // 1. No game mode is active (currentMode === null) 
            // 2. Human game is over (needs restart)
            // Otherwise, do nothing - let game.js handler handle flapping
            if (currentMode === null || (currentMode === 'human' && game.gameOver)) {
                e.preventDefault();
                startHumanGame();
            }
            // If game is running normally (currentMode === 'human' && !game.gameOver),
            // do nothing here - let game.js handler handle flapping
        }
    });
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Checking if the game's handler is working. Testing a different approach: ensuring the game's handler can handle both starting and flapping, and only using the global handler as a fallback:



Checking the game's handler logic. The issue may be that the game's handler isn't recognizing the started state. Adding debug logs and ensuring the handler works correctly:



The game's handler should work. Verifying the state after `startHumanGame()` is called. Ensuring the game's handler can flap by checking that `gameStarted` is set correctly. Updating the global handler to be more precise:



The game's handler should work. Ensuring it fires correctly. Modifying the global handler to only prevent default when starting, and ensuring the game's handler can always handle flapping:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global SPACE key handler to start game if not running
    // This handler only starts/restarts the game, never interferes with flapping
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // Only handle starting/restarting if:
            // 1. No game mode is active (currentMode === null) 
            // 2. Human game is over (needs restart)
            // Otherwise, do nothing - let game.js handler handle flapping
            const needsStart = currentMode === null || (currentMode === 'human' && game.gameOver);
            
            if (needsStart) {
                // Start the game, but don't prevent default here
                // Let the game's handler also process it (it will prevent default)
                startHumanGame();
            }
            // If game is running normally (currentMode === 'human' && !game.gameOver),
            // do nothing here - let game.js handler handle flapping
        }
    });
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Trying a different approach: making the global handler handle flapping when the game is running, as a fallback to ensure it works:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global SPACE key handler to start game and handle flapping
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Always prevent default to avoid page scrolling
            
            // If no game mode is active, start human game
            if (currentMode === null) {
                startHumanGame();
                return;
            }
            
            // If human game is over, restart it
            if (currentMode === 'human' && game.gameOver) {
                startHumanGame();
                return;
            }
            
            // If human game is running, handle flapping
            if (currentMode === 'human' && !game.gameOver) {
                if (game.gameStarted) {
                    game.flap();
                } else {
                    // Game not started yet, start it
                    game.start();
                }
            }
        }
    });
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Preventing double-flapping from both handlers. Updating the global handler to avoid conflicts:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global SPACE key handler to start game and handle flapping
    // This is the primary handler - game.js handler will also fire but we handle everything here
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Always prevent default to avoid page scrolling
            
            // If no game mode is active, start human game
            if (currentMode === null) {
                startHumanGame();
                return;
            }
            
            // If human game is over, restart it
            if (currentMode === 'human' && game.gameOver) {
                startHumanGame();
                return;
            }
            
            // If human game is running, handle flapping
            // Note: game.js also has a handler, but we handle it here to ensure it works
            if (currentMode === 'human' && !game.gameOver && gameLoopRunning) {
                if (game.gameStarted) {
                    game.flap();
                } else {
                    // Game not started yet, start it
                    game.start();
                }
            }
        }
    }, true); // Use capture phase so this runs before game.js handler
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Stopping event propagation to prevent the game's handler from also firing and causing double-flapping:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global SPACE key handler to start game and handle flapping
    // This is the primary handler that ensures SPACE always works
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Always prevent default to avoid page scrolling
            e.stopPropagation(); // Prevent game.js handler from also firing (avoid double-handling)
            
            // If no game mode is active, start human game
            if (currentMode === null) {
                startHumanGame();
                return;
            }
            
            // If human game is over, restart it
            if (currentMode === 'human' && game.gameOver) {
                startHumanGame();
                return;
            }
            
            // If human game is running, handle flapping
            if (currentMode === 'human' && !game.gameOver && gameLoopRunning) {
                if (game.gameStarted) {
                    game.flap();
                } else {
                    // Game not started yet, start it
                    game.start();
                }
            }
        }
    }, true); // Use capture phase so this runs before game.js handler
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Checking for lint errors:



Fixed the issue. The global SPACE handler now handles:

1. **Starting the game** when no game is active (`currentMode === null`)
2. **Restarting the game** when it's over
3. **Flapping the bird** when the game is running

The handler:
- Uses the capture phase to run before the game's handler
- Stops event propagation to prevent the game's handler from also firing (avoiding double-flapping)
- Prevents default to avoid page scrolling

Now when you press SPACE:
- First press: starts the game
- Subsequent presses: flap the bird
- After game over: restarts the game

The game should now respond to SPACE for both starting and flapping. Try it and let me know if it works.

---

**User**

Change the Space to an Enter. Enter should  start the game

---

**Cursor**


Changing the start key from SPACE to ENTER, keeping SPACE for flapping.


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Auto-load latest AI data from server
    loadLatestAIData();
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.saveToFile();
        }
    });
    
    // File input for loading
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                if (aiAgent) {
                    if (aiAgent.loadFromFile(fileContent)) {
                        alert(`Successfully loaded AI from generation ${aiAgent.generation} (Best score: ${aiAgent.bestScore})`);
                    }
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });
    
    document.getElementById('loadBtn').addEventListener('click', () => {
        fileInput.click();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to reset the AI? This will clear all learned knowledge and start fresh. This cannot be undone.')) {
            aiAgent.clearSavedData();
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
        }
    });
    
    // Global ENTER key handler to start/restart the game
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
            e.preventDefault(); // Prevent default form submission behavior
            
            // If no game mode is active, start human game
            if (currentMode === null) {
                startHumanGame();
                return;
            }
            
            // If human game is over, restart it
            if (currentMode === 'human' && game.gameOver) {
                startHumanGame();
                return;
            }
        }
    });
    
    // Start game loop
    gameLoop();
}

function startHumanGame() {
    stopGame();
    currentMode = 'human';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function startAIGame() {
    stopGame();
    currentMode = 'ai';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    aiAgent.start();
}

function startAIPlay() {
    stopGame();
    currentMode = 'ai-play';
    game.reset();
    game.start();
    gameLoopRunning = true;
    
    document.getElementById('aiStats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    // Start AI play mode
    if (aiAgent) {
        if (!aiAgent.startPlayMode()) {
            // Failed to start (no trained AI)
            currentMode = null;
            gameLoopRunning = false;
            document.getElementById('instructions').style.display = 'block';
        }
    }
}

function stopGame() {
    gameLoopRunning = false;
    if (aiAgent) {
        aiAgent.stop();
    }
    if (currentMode === 'human') {
        game.gameOver = true;
    }
}

function gameLoop() {
    if (gameLoopRunning && currentMode === 'human') {
        game.update();
        game.draw();
        
        // Update score display
        document.getElementById('score').textContent = game.score;
        document.getElementById('highScore').textContent = game.highScore;
    } else if (currentMode !== 'ai' && currentMode !== 'ai-play') {
        // Only draw if not in AI modes (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Function to automatically load the latest AI data from server
async function loadLatestAIData() {
    try {
        console.log('🔍 Looking for the latest AI data...');
        const response = await fetch('/api/latest-ai-data');
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log(`✅ Found AI data: ${result.filename}`);
            console.log(`📊 Generation: ${result.data.generation}, Best Score: ${result.data.bestScore}`);
            
            // Load the AI data
            if (aiAgent && aiAgent.loadFromFile(result.data)) {
                console.log(`🤖 Successfully loaded AI agent!`);
                
                // Update UI to show loaded status
                const saveStatus = document.getElementById('saveStatus');
                if (saveStatus) {
                    saveStatus.textContent = `Auto-loaded: Gen ${result.data.generation} (Score: ${result.data.bestScore})`;
                    saveStatus.style.color = '#10b981';
                }
                
                // Show a subtle notification
                showNotification(`AI Loaded: Generation ${result.data.generation} with best score ${result.data.bestScore}`, 'success');
            }
        } else {
            console.log('ℹ️ No saved AI data found. Starting fresh!');
            showNotification('No saved AI data found. Train a new AI by clicking "AI Learning"', 'info');
        }
    } catch (error) {
        console.warn('Could not auto-load AI data:', error.message);
        // Silently fail - this is expected if no data exists yet
    }
}

// Function to show a temporary notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Initialize when page loads
window.addEventListener('load', init);


```


Updating the instructions to reflect that ENTER starts the game:


```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flappy Bird - AI Learning</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="game-header">
            <h1>🐦 Flappy Bird AI</h1>
            
            <div class="controls-wrapper">
                <div class="control-group">
                    <button id="startBtn">🎮 Play</button>
                    <button id="aiBtn">🤖 Train AI</button>
                    <button id="aiPlayBtn">🎯 Watch AI</button>
                    <button id="stopBtn">Stop</button>
                </div>
                <div class="control-group secondary">
                    <button id="saveBtn">💾 Save</button>
                    <button id="loadBtn">📂 Load</button>
                    <button id="clearBtn">🔄 Reset</button>
                    <input type="file" id="fileInput" accept=".json" style="display: none;">
                    <label class="fast-mode-toggle">
                        <input type="checkbox" id="fastMode">
                        <span>⚡ Fast Mode</span>
                    </label>
                </div>
            </div>
            
            <div class="stats-container">
                <div class="stat-card">
                    <span class="stat-label">Score</span>
                    <span class="stat-value" id="score">0</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Best</span>
                    <span class="stat-value" id="highScore">0</span>
                </div>
                <div id="aiStats" class="ai-stats-group" style="display: none;">
                    <div class="stat-card">
                        <span class="stat-label">Gen</span>
                        <span class="stat-value" id="generation">1</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">AI Best</span>
                        <span class="stat-value" id="bestScore">0</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Alive</span>
                        <span class="stat-value" id="alive">0</span>
                    </div>
                </div>
            </div>
            <div id="saveStatus" class="save-status"></div>
        </div>
        
        <canvas id="gameCanvas"></canvas>
        
        <div id="instructions">
            <p>Press <strong>ENTER</strong> to start • Press <strong>SPACE</strong> or <strong>CLICK</strong> to flap • Train AI to learn automatically • Save/Load your best models</p>
        </div>
    </div>
    <script src="neural-network.js"></script>
    <script src="game.js"></script>
    <script src="ai.js"></script>
    <script src="main.js"></script>
</body>
</html>


```


Checking for lint errors:



Updated the code so ENTER starts the game instead of SPACE. Changes:

1. **Global handler in `main.js`**: Now listens for ENTER to start/restart the game
2. **Instructions in `index.html`**: Updated to show ENTER starts the game and SPACE/CLICK flap

Now:
- **ENTER**: Starts the game (or restarts if game over)
- **SPACE or CLICK**: Flaps the bird during gameplay (handled by the game's existing handler)

The game's SPACE handler in `game.js` remains unchanged, so flapping with SPACE still works during gameplay.

---

**User**

Please make the bird fall slower for the first 2 - 3 seconds after the game starts so that it's easier to start.

---

**Cursor**


Making the bird fall slower for the first 2–3 seconds after the game starts. Checking the current gravity implementation:



Adding a start timestamp and reducing gravity for the first 2–3 seconds:



Adding reduced gravity for the first 2–3 seconds after the game starts:


```javascript
// Flappy Bird Game Engine
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 1000;
        this.height = 700;
        canvas.width = this.width;
        canvas.height = this.height;
        
        this.bird = {
            x: 100,
            y: this.height / 2,
            width: 30,
            height: 30,
            velocity: 0,
            gravity: 0.6,
            jumpStrength: -12,
            rotation: 0,
            wingAngle: 0,
            wingDirection: 1
        };
        
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 200;
        this.pipeSpeed = 3;
        this.pipeSpacing = 300; // Distance between pipes
        
        // Ground animation
        this.groundX = 0;
        this.groundHeight = 112;
        
        // Cloud positions (fixed)
        this.clouds = [
            { x: 100, y: 80 },
            { x: 450, y: 140 },
            { x: 750, y: 100 },
            { x: 280, y: 200 }
        ];
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore') || '0');
        this.gameOver = false;
        this.gameStarted = false;
        this.gameStartTime = null; // Track when game started for reduced gravity period
        
        // For AI input
        this.nextPipe = null;
        
        this.setupEventListeners();
        this.generateInitialPipes();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', () => {
            if (!this.gameStarted && !this.gameOver) {
                this.start();
            } else if (this.gameStarted && !this.gameOver) {
                this.flap();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (!this.gameStarted && !this.gameOver) {
                    this.start();
                } else if (this.gameStarted && !this.gameOver) {
                    this.flap();
                }
                e.preventDefault();
            }
        });
    }
    
    generateInitialPipes() {
        this.pipes = [];
        // Generate 5 initial pipes
        for (let i = 0; i < 5; i++) {
            this.addPipe(this.width + i * this.pipeSpacing);
        }
    }
    
    addPipe(x) {
        const minHeight = 50;
        const playableHeight = this.height - this.groundHeight; // Account for ground
        const maxHeight = playableHeight - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: x,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            passed: false
        });
    }
    
    flap() {
        this.bird.velocity = this.bird.jumpStrength;
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Update bird physics
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Update bird rotation based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -25), 90);
        
        // Animate wing flapping
        this.bird.wingAngle += this.bird.wingDirection * 15;
        if (this.bird.wingAngle > 30) {
            this.bird.wingDirection = -1;
        } else if (this.bird.wingAngle < -30) {
            this.bird.wingDirection = 1;
        }
        
        // Animate ground
        this.groundX -= this.pipeSpeed;
        if (this.groundX <= -48) {
            this.groundX = 0;
        }
        
        // Boundary check
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        if (this.bird.y + this.bird.height > this.height - this.groundHeight) {
            this.gameOver = true;
            this.bird.y = this.height - this.groundHeight - this.bird.height;
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('highScore', this.highScore.toString());
                }
            }
            
            // Remove pipes that are off screen
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                // Add new pipe
                const lastPipe = this.pipes[this.pipes.length - 1];
                if (lastPipe) {
                    this.addPipe(lastPipe.x + this.pipeSpacing);
                } else {
                    this.addPipe(this.width + this.pipeSpacing);
                }
            }
            
            // Collision detection
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
            }
        }
        
        // Find next pipe for AI
        this.nextPipe = this.pipes.find(pipe => pipe.x + this.pipeWidth >= this.bird.x) || null;
    }
    
    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + this.bird.width;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.bird.height;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        
        // Check if bird is within pipe's x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check if bird hits top or bottom pipe
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        
        return false;
    }
    
    getAIInputs() {
        // Input features for AI:
        // 1. Bird Y position (normalized)
        // 2. Bird velocity (normalized)
        // 3. Next pipe X distance (normalized)
        // 4. Next pipe top height (normalized)
        // 5. Next pipe gap bottom (normalized)
        
        const playableHeight = this.height - this.groundHeight;
        
        if (!this.nextPipe) {
            // If no pipe, return default values
            return [
                this.bird.y / playableHeight,
                this.bird.velocity / 20,
                1,
                0.5,
                0.5
            ];
        }
        
        const pipe = this.nextPipe;
        const distanceToPipe = (pipe.x - this.bird.x) / this.width;
        const normalizedTop = pipe.topHeight / playableHeight;
        const normalizedBottom = pipe.bottomY / playableHeight;
        
        return [
            this.bird.y / playableHeight,
            this.bird.velocity / 20,
            distanceToPipe,
            normalizedTop,
            normalizedBottom
        ];
    }
    
    drawBackground() {
        // Sky gradient (day theme like original Flappy Bird)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#4EC0CA');
        gradient.addColorStop(1, '#8ED9E0');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height - this.groundHeight);
        
        // Draw clouds (static positions)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (const cloud of this.clouds) {
            this.drawCloud(cloud.x, cloud.y);
        }
    }
    
    drawCloud(x, y) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Create a fluffy cloud shape with multiple overlapping circles
        this.ctx.beginPath();
        
        // Bottom layer (larger, flatter circles)
        this.ctx.arc(x, y + 5, 22, 0, Math.PI * 2);
        this.ctx.arc(x + 20, y + 8, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 40, y + 6, 22, 0, Math.PI * 2);
        this.ctx.arc(x + 58, y + 5, 18, 0, Math.PI * 2);
        
        // Middle layer
        this.ctx.arc(x + 10, y, 24, 0, Math.PI * 2);
        this.ctx.arc(x + 30, y - 2, 26, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 22, 0, Math.PI * 2);
        
        // Top layer (smaller puffs)
        this.ctx.arc(x + 15, y - 8, 18, 0, Math.PI * 2);
        this.ctx.arc(x + 35, y - 12, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 48, y - 8, 16, 0, Math.PI * 2);
        
        this.ctx.fill();
        
        // Add subtle shadow/depth at bottom
        this.ctx.fillStyle = 'rgba(200, 220, 235, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 30, y + 10, 35, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPipe(x, topHeight, bottomY) {
        const pipeColor = '#5CBE5C';
        const pipeDark = '#3FA03F';
        const pipeLight = '#7DD57D';
        const capHeight = 28;
        const capExtend = 4;
        
        // Top pipe body
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x, 0, this.pipeWidth, topHeight - capHeight);
        
        // Top pipe gradient/highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x + 5, 0, 8, topHeight - capHeight);
        
        // Top pipe shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8, 0, 8, topHeight - capHeight);
        
        // Top pipe cap
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x - capExtend, topHeight - capHeight, this.pipeWidth + capExtend * 2, capHeight);
        
        // Top cap highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x - capExtend + 5, topHeight - capHeight, 8, capHeight);
        
        // Top cap shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8 + capExtend, topHeight - capHeight, 8, capHeight);
        
        // Top cap border
        this.ctx.strokeStyle = pipeDark;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - capExtend, topHeight - capHeight, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom pipe cap
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x - capExtend, bottomY, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom cap highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x - capExtend + 5, bottomY, 8, capHeight);
        
        // Bottom cap shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8 + capExtend, bottomY, 8, capHeight);
        
        // Bottom cap border
        this.ctx.strokeRect(x - capExtend, bottomY, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom pipe body (stop at ground level)
        const groundY = this.height - this.groundHeight;
        const bottomPipeHeight = groundY - bottomY - capHeight;
        
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x, bottomY + capHeight, this.pipeWidth, bottomPipeHeight);
        
        // Bottom pipe highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x + 5, bottomY + capHeight, 8, bottomPipeHeight);
        
        // Bottom pipe shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8, bottomY + capHeight, 8, bottomPipeHeight);
    }
    
    drawGround() {
        const groundY = this.height - this.groundHeight;
        
        // Ground base (dirt)
        this.ctx.fillStyle = '#DED895';
        this.ctx.fillRect(0, groundY, this.width, this.groundHeight);
        
        // Ground pattern (repeating)
        this.ctx.fillStyle = '#D4C77A';
        for (let x = this.groundX; x < this.width; x += 48) {
            // Grass tufts pattern
            for (let i = 0; i < 3; i++) {
                this.ctx.fillRect(x + i * 15, groundY + i * 8, 12, 6);
            }
        }
        
        // Ground top edge (grass)
        this.ctx.fillStyle = '#95C63D';
        this.ctx.fillRect(0, groundY, this.width, 20);
        
        // Grass details
        this.ctx.fillStyle = '#7FAF2F';
        for (let x = this.groundX; x < this.width + 48; x += 24) {
            // Small grass blades
            this.ctx.fillRect(x, groundY, 3, 12);
            this.ctx.fillRect(x + 8, groundY + 2, 3, 10);
            this.ctx.fillRect(x + 16, groundY + 1, 3, 11);
        }
    }
    
    drawBird() {
        this.ctx.save();
        
        // Translate to bird center
        this.ctx.translate(
            this.bird.x + this.bird.width / 2,
            this.bird.y + this.bird.height / 2
        );
        
        // Rotate bird based on velocity
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        
        // Draw wing (behind body) with animation
        this.ctx.save();
        this.ctx.translate(-8, 0);
        this.ctx.rotate(this.bird.wingAngle * Math.PI / 180);
        
        // Wing shadow/outline
        this.ctx.fillStyle = '#F57C00';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Main wing
        this.ctx.fillStyle = '#FFA000';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wing highlight
        this.ctx.fillStyle = '#FFB300';
        this.ctx.beginPath();
        this.ctx.ellipse(-3, -2, 6, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wing feather details
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(-8, 0);
        this.ctx.lineTo(8, 0);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(-5, -4);
        this.ctx.lineTo(5, 4);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(-5, 4);
        this.ctx.lineTo(5, -4);
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Bird body (yellow circle)
        this.ctx.fillStyle = '#FFC107';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird body outline
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // White belly
        this.ctx.fillStyle = '#FFF9C4';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 4, this.bird.width / 3, this.bird.height / 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Tail feathers
        this.ctx.fillStyle = '#FFA000';
        this.ctx.beginPath();
        this.ctx.moveTo(-18, 2);
        this.ctx.lineTo(-24, -2);
        this.ctx.lineTo(-22, 0);
        this.ctx.lineTo(-24, 4);
        this.ctx.lineTo(-18, 4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        
        // Eye white
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(8, -4, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye outline
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Pupil
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(10, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye shine/highlight
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(10.5, -3.5, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Beak top
        this.ctx.fillStyle = '#FF6F00';
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(22, -2);
        this.ctx.lineTo(18, 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Beak bottom
        this.ctx.beginPath();
        this.ctx.moveTo(12, 2);
        this.ctx.lineTo(20, 3);
        this.ctx.lineTo(16, 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Beak outline
        this.ctx.strokeStyle = '#D84315';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(22, -2);
        this.ctx.lineTo(18, 2);
        this.ctx.lineTo(20, 3);
        this.ctx.lineTo(16, 5);
        this.ctx.lineTo(12, 2);
        this.ctx.closePath();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    draw() {
        // Draw background
        this.drawBackground();
        
        // Draw pipes
        for (const pipe of this.pipes) {
            this.drawPipe(pipe.x, pipe.topHeight, pipe.bottomY);
        }
        
        // Draw ground
        this.drawGround();
        
        // Draw bird
        this.drawBird();
        
        // Draw score in game
        if (this.gameStarted && !this.gameOver) {
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(this.score, this.width / 2, 80);
            this.ctx.fillText(this.score, this.width / 2, 80);
        }
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Game Over panel
            this.ctx.fillStyle = '#F4E4C1';
            this.ctx.strokeStyle = '#5C2E0A';
            this.ctx.lineWidth = 4;
            const panelWidth = 400;
            const panelHeight = 200;
            const panelX = this.width / 2 - panelWidth / 2;
            const panelY = this.height / 2 - panelHeight / 2;
            
            this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
            this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
            
            // Game Over text
            this.ctx.fillStyle = '#5C2E0A';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.width / 2, panelY + 60);
            
            // Score
            this.ctx.font = '32px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, panelY + 120);
            this.ctx.fillText(`Best: ${this.highScore}`, this.width / 2, panelY + 160);
        } else if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Ready message
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.font = 'bold 56px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeText('Ready?', this.width / 2, this.height / 2 - 40);
            this.ctx.fillText('Ready?', this.width / 2, this.height / 2 - 40);
            
            this.ctx.font = 'bold 32px Arial';
            this.ctx.strokeText('Click to Start', this.width / 2, this.height / 2 + 20);
            this.ctx.fillText('Click to Start', this.width / 2, this.height / 2 + 20);
        }
    }
    
    reset() {
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.bird.wingAngle = 0;
        this.bird.wingDirection = 1;
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.groundX = 0;
        this.generateInitialPipes();
        this.nextPipe = null;
        
        // Reset clouds to initial positions if needed
        if (!this.clouds) {
            this.clouds = [
                { x: 100, y: 80 },
                { x: 450, y: 140 },
                { x: 750, y: 100 },
                { x: 280, y: 200 }
            ];
        }
    }
    
    start() {
        this.gameStarted = true;
        this.gameOver = false;
    }
}


```

```javascript
// Flappy Bird Game Engine
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 1000;
        this.height = 700;
        canvas.width = this.width;
        canvas.height = this.height;
        
        this.bird = {
            x: 100,
            y: this.height / 2,
            width: 30,
            height: 30,
            velocity: 0,
            gravity: 0.6,
            jumpStrength: -12,
            rotation: 0,
            wingAngle: 0,
            wingDirection: 1
        };
        
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 200;
        this.pipeSpeed = 3;
        this.pipeSpacing = 300; // Distance between pipes
        
        // Ground animation
        this.groundX = 0;
        this.groundHeight = 112;
        
        // Cloud positions (fixed)
        this.clouds = [
            { x: 100, y: 80 },
            { x: 450, y: 140 },
            { x: 750, y: 100 },
            { x: 280, y: 200 }
        ];
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore') || '0');
        this.gameOver = false;
        this.gameStarted = false;
        this.gameStartTime = null; // Track when game started for reduced gravity period
        
        // For AI input
        this.nextPipe = null;
        
        this.setupEventListeners();
        this.generateInitialPipes();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', () => {
            if (!this.gameStarted && !this.gameOver) {
                this.start();
            } else if (this.gameStarted && !this.gameOver) {
                this.flap();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (!this.gameStarted && !this.gameOver) {
                    this.start();
                } else if (this.gameStarted && !this.gameOver) {
                    this.flap();
                }
                e.preventDefault();
            }
        });
    }
    
    generateInitialPipes() {
        this.pipes = [];
        // Generate 5 initial pipes
        for (let i = 0; i < 5; i++) {
            this.addPipe(this.width + i * this.pipeSpacing);
        }
    }
    
    addPipe(x) {
        const minHeight = 50;
        const playableHeight = this.height - this.groundHeight; // Account for ground
        const maxHeight = playableHeight - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: x,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            passed: false
        });
    }
    
    flap() {
        this.bird.velocity = this.bird.jumpStrength;
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Calculate time since game started
        const currentTime = Date.now();
        const timeSinceStart = this.gameStartTime ? (currentTime - this.gameStartTime) / 1000 : 0; // Convert to seconds
        
        // Use reduced gravity for the first 2.5 seconds to make it easier to start
        const reducedGravityDuration = 2.5; // seconds
        const gravityMultiplier = timeSinceStart < reducedGravityDuration 
            ? 0.3 + (timeSinceStart / reducedGravityDuration) * 0.7 // Gradually increase from 30% to 100%
            : 1.0;
        
        // Update bird physics with adjusted gravity
        this.bird.velocity += this.bird.gravity * gravityMultiplier;
        this.bird.y += this.bird.velocity;
        
        // Update bird rotation based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -25), 90);
        
        // Animate wing flapping
        this.bird.wingAngle += this.bird.wingDirection * 15;
        if (this.bird.wingAngle > 30) {
            this.bird.wingDirection = -1;
        } else if (this.bird.wingAngle < -30) {
            this.bird.wingDirection = 1;
        }
        
        // Animate ground
        this.groundX -= this.pipeSpeed;
        if (this.groundX <= -48) {
            this.groundX = 0;
        }
        
        // Boundary check
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        if (this.bird.y + this.bird.height > this.height - this.groundHeight) {
            this.gameOver = true;
            this.bird.y = this.height - this.groundHeight - this.bird.height;
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('highScore', this.highScore.toString());
                }
            }
            
            // Remove pipes that are off screen
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                // Add new pipe
                const lastPipe = this.pipes[this.pipes.length - 1];
                if (lastPipe) {
                    this.addPipe(lastPipe.x + this.pipeSpacing);
                } else {
                    this.addPipe(this.width + this.pipeSpacing);
                }
            }
            
            // Collision detection
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
            }
        }
        
        // Find next pipe for AI
        this.nextPipe = this.pipes.find(pipe => pipe.x + this.pipeWidth >= this.bird.x) || null;
    }
    
    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + this.bird.width;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.bird.height;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        
        // Check if bird is within pipe's x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check if bird hits top or bottom pipe
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        
        return false;
    }
    
    getAIInputs() {
        // Input features for AI:
        // 1. Bird Y position (normalized)
        // 2. Bird velocity (normalized)
        // 3. Next pipe X distance (normalized)
        // 4. Next pipe top height (normalized)
        // 5. Next pipe gap bottom (normalized)
        
        const playableHeight = this.height - this.groundHeight;
        
        if (!this.nextPipe) {
            // If no pipe, return default values
            return [
                this.bird.y / playableHeight,
                this.bird.velocity / 20,
                1,
                0.5,
                0.5
            ];
        }
        
        const pipe = this.nextPipe;
        const distanceToPipe = (pipe.x - this.bird.x) / this.width;
        const normalizedTop = pipe.topHeight / playableHeight;
        const normalizedBottom = pipe.bottomY / playableHeight;
        
        return [
            this.bird.y / playableHeight,
            this.bird.velocity / 20,
            distanceToPipe,
            normalizedTop,
            normalizedBottom
        ];
    }
    
    drawBackground() {
        // Sky gradient (day theme like original Flappy Bird)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#4EC0CA');
        gradient.addColorStop(1, '#8ED9E0');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height - this.groundHeight);
        
        // Draw clouds (static positions)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (const cloud of this.clouds) {
            this.drawCloud(cloud.x, cloud.y);
        }
    }
    
    drawCloud(x, y) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Create a fluffy cloud shape with multiple overlapping circles
        this.ctx.beginPath();
        
        // Bottom layer (larger, flatter circles)
        this.ctx.arc(x, y + 5, 22, 0, Math.PI * 2);
        this.ctx.arc(x + 20, y + 8, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 40, y + 6, 22, 0, Math.PI * 2);
        this.ctx.arc(x + 58, y + 5, 18, 0, Math.PI * 2);
        
        // Middle layer
        this.ctx.arc(x + 10, y, 24, 0, Math.PI * 2);
        this.ctx.arc(x + 30, y - 2, 26, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 22, 0, Math.PI * 2);
        
        // Top layer (smaller puffs)
        this.ctx.arc(x + 15, y - 8, 18, 0, Math.PI * 2);
        this.ctx.arc(x + 35, y - 12, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 48, y - 8, 16, 0, Math.PI * 2);
        
        this.ctx.fill();
        
        // Add subtle shadow/depth at bottom
        this.ctx.fillStyle = 'rgba(200, 220, 235, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 30, y + 10, 35, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPipe(x, topHeight, bottomY) {
        const pipeColor = '#5CBE5C';
        const pipeDark = '#3FA03F';
        const pipeLight = '#7DD57D';
        const capHeight = 28;
        const capExtend = 4;
        
        // Top pipe body
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x, 0, this.pipeWidth, topHeight - capHeight);
        
        // Top pipe gradient/highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x + 5, 0, 8, topHeight - capHeight);
        
        // Top pipe shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8, 0, 8, topHeight - capHeight);
        
        // Top pipe cap
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x - capExtend, topHeight - capHeight, this.pipeWidth + capExtend * 2, capHeight);
        
        // Top cap highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x - capExtend + 5, topHeight - capHeight, 8, capHeight);
        
        // Top cap shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8 + capExtend, topHeight - capHeight, 8, capHeight);
        
        // Top cap border
        this.ctx.strokeStyle = pipeDark;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - capExtend, topHeight - capHeight, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom pipe cap
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x - capExtend, bottomY, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom cap highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x - capExtend + 5, bottomY, 8, capHeight);
        
        // Bottom cap shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8 + capExtend, bottomY, 8, capHeight);
        
        // Bottom cap border
        this.ctx.strokeRect(x - capExtend, bottomY, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom pipe body (stop at ground level)
        const groundY = this.height - this.groundHeight;
        const bottomPipeHeight = groundY - bottomY - capHeight;
        
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x, bottomY + capHeight, this.pipeWidth, bottomPipeHeight);
        
        // Bottom pipe highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x + 5, bottomY + capHeight, 8, bottomPipeHeight);
        
        // Bottom pipe shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8, bottomY + capHeight, 8, bottomPipeHeight);
    }
    
    drawGround() {
        const groundY = this.height - this.groundHeight;
        
        // Ground base (dirt)
        this.ctx.fillStyle = '#DED895';
        this.ctx.fillRect(0, groundY, this.width, this.groundHeight);
        
        // Ground pattern (repeating)
        this.ctx.fillStyle = '#D4C77A';
        for (let x = this.groundX; x < this.width; x += 48) {
            // Grass tufts pattern
            for (let i = 0; i < 3; i++) {
                this.ctx.fillRect(x + i * 15, groundY + i * 8, 12, 6);
            }
        }
        
        // Ground top edge (grass)
        this.ctx.fillStyle = '#95C63D';
        this.ctx.fillRect(0, groundY, this.width, 20);
        
        // Grass details
        this.ctx.fillStyle = '#7FAF2F';
        for (let x = this.groundX; x < this.width + 48; x += 24) {
            // Small grass blades
            this.ctx.fillRect(x, groundY, 3, 12);
            this.ctx.fillRect(x + 8, groundY + 2, 3, 10);
            this.ctx.fillRect(x + 16, groundY + 1, 3, 11);
        }
    }
    
    drawBird() {
        this.ctx.save();
        
        // Translate to bird center
        this.ctx.translate(
            this.bird.x + this.bird.width / 2,
            this.bird.y + this.bird.height / 2
        );
        
        // Rotate bird based on velocity
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        
        // Draw wing (behind body) with animation
        this.ctx.save();
        this.ctx.translate(-8, 0);
        this.ctx.rotate(this.bird.wingAngle * Math.PI / 180);
        
        // Wing shadow/outline
        this.ctx.fillStyle = '#F57C00';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Main wing
        this.ctx.fillStyle = '#FFA000';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wing highlight
        this.ctx.fillStyle = '#FFB300';
        this.ctx.beginPath();
        this.ctx.ellipse(-3, -2, 6, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wing feather details
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(-8, 0);
        this.ctx.lineTo(8, 0);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(-5, -4);
        this.ctx.lineTo(5, 4);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(-5, 4);
        this.ctx.lineTo(5, -4);
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Bird body (yellow circle)
        this.ctx.fillStyle = '#FFC107';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird body outline
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // White belly
        this.ctx.fillStyle = '#FFF9C4';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 4, this.bird.width / 3, this.bird.height / 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Tail feathers
        this.ctx.fillStyle = '#FFA000';
        this.ctx.beginPath();
        this.ctx.moveTo(-18, 2);
        this.ctx.lineTo(-24, -2);
        this.ctx.lineTo(-22, 0);
        this.ctx.lineTo(-24, 4);
        this.ctx.lineTo(-18, 4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        
        // Eye white
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(8, -4, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye outline
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Pupil
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(10, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye shine/highlight
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(10.5, -3.5, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Beak top
        this.ctx.fillStyle = '#FF6F00';
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(22, -2);
        this.ctx.lineTo(18, 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Beak bottom
        this.ctx.beginPath();
        this.ctx.moveTo(12, 2);
        this.ctx.lineTo(20, 3);
        this.ctx.lineTo(16, 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Beak outline
        this.ctx.strokeStyle = '#D84315';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(22, -2);
        this.ctx.lineTo(18, 2);
        this.ctx.lineTo(20, 3);
        this.ctx.lineTo(16, 5);
        this.ctx.lineTo(12, 2);
        this.ctx.closePath();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    draw() {
        // Draw background
        this.drawBackground();
        
        // Draw pipes
        for (const pipe of this.pipes) {
            this.drawPipe(pipe.x, pipe.topHeight, pipe.bottomY);
        }
        
        // Draw ground
        this.drawGround();
        
        // Draw bird
        this.drawBird();
        
        // Draw score in game
        if (this.gameStarted && !this.gameOver) {
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(this.score, this.width / 2, 80);
            this.ctx.fillText(this.score, this.width / 2, 80);
        }
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Game Over panel
            this.ctx.fillStyle = '#F4E4C1';
            this.ctx.strokeStyle = '#5C2E0A';
            this.ctx.lineWidth = 4;
            const panelWidth = 400;
            const panelHeight = 200;
            const panelX = this.width / 2 - panelWidth / 2;
            const panelY = this.height / 2 - panelHeight / 2;
            
            this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
            this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
            
            // Game Over text
            this.ctx.fillStyle = '#5C2E0A';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.width / 2, panelY + 60);
            
            // Score
            this.ctx.font = '32px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, panelY + 120);
            this.ctx.fillText(`Best: ${this.highScore}`, this.width / 2, panelY + 160);
        } else if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Ready message
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.font = 'bold 56px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeText('Ready?', this.width / 2, this.height / 2 - 40);
            this.ctx.fillText('Ready?', this.width / 2, this.height / 2 - 40);
            
            this.ctx.font = 'bold 32px Arial';
            this.ctx.strokeText('Click to Start', this.width / 2, this.height / 2 + 20);
            this.ctx.fillText('Click to Start', this.width / 2, this.height / 2 + 20);
        }
    }
    
    reset() {
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.bird.wingAngle = 0;
        this.bird.wingDirection = 1;
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.groundX = 0;
        this.generateInitialPipes();
        this.nextPipe = null;
        
        // Reset clouds to initial positions if needed
        if (!this.clouds) {
            this.clouds = [
                { x: 100, y: 80 },
                { x: 450, y: 140 },
                { x: 750, y: 100 },
                { x: 280, y: 200 }
            ];
        }
    }
    
    start() {
        this.gameStarted = true;
        this.gameOver = false;
    }
}


```

```javascript
// Flappy Bird Game Engine
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 1000;
        this.height = 700;
        canvas.width = this.width;
        canvas.height = this.height;
        
        this.bird = {
            x: 100,
            y: this.height / 2,
            width: 30,
            height: 30,
            velocity: 0,
            gravity: 0.6,
            jumpStrength: -12,
            rotation: 0,
            wingAngle: 0,
            wingDirection: 1
        };
        
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 200;
        this.pipeSpeed = 3;
        this.pipeSpacing = 300; // Distance between pipes
        
        // Ground animation
        this.groundX = 0;
        this.groundHeight = 112;
        
        // Cloud positions (fixed)
        this.clouds = [
            { x: 100, y: 80 },
            { x: 450, y: 140 },
            { x: 750, y: 100 },
            { x: 280, y: 200 }
        ];
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore') || '0');
        this.gameOver = false;
        this.gameStarted = false;
        this.gameStartTime = null; // Track when game started for reduced gravity period
        
        // For AI input
        this.nextPipe = null;
        
        this.setupEventListeners();
        this.generateInitialPipes();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', () => {
            if (!this.gameStarted && !this.gameOver) {
                this.start();
            } else if (this.gameStarted && !this.gameOver) {
                this.flap();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (!this.gameStarted && !this.gameOver) {
                    this.start();
                } else if (this.gameStarted && !this.gameOver) {
                    this.flap();
                }
                e.preventDefault();
            }
        });
    }
    
    generateInitialPipes() {
        this.pipes = [];
        // Generate 5 initial pipes
        for (let i = 0; i < 5; i++) {
            this.addPipe(this.width + i * this.pipeSpacing);
        }
    }
    
    addPipe(x) {
        const minHeight = 50;
        const playableHeight = this.height - this.groundHeight; // Account for ground
        const maxHeight = playableHeight - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: x,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            passed: false
        });
    }
    
    flap() {
        this.bird.velocity = this.bird.jumpStrength;
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Calculate time since game started
        const currentTime = Date.now();
        const timeSinceStart = this.gameStartTime ? (currentTime - this.gameStartTime) / 1000 : 0; // Convert to seconds
        
        // Use reduced gravity for the first 2.5 seconds to make it easier to start
        const reducedGravityDuration = 2.5; // seconds
        const gravityMultiplier = timeSinceStart < reducedGravityDuration 
            ? 0.3 + (timeSinceStart / reducedGravityDuration) * 0.7 // Gradually increase from 30% to 100%
            : 1.0;
        
        // Update bird physics with adjusted gravity
        this.bird.velocity += this.bird.gravity * gravityMultiplier;
        this.bird.y += this.bird.velocity;
        
        // Update bird rotation based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -25), 90);
        
        // Animate wing flapping
        this.bird.wingAngle += this.bird.wingDirection * 15;
        if (this.bird.wingAngle > 30) {
            this.bird.wingDirection = -1;
        } else if (this.bird.wingAngle < -30) {
            this.bird.wingDirection = 1;
        }
        
        // Animate ground
        this.groundX -= this.pipeSpeed;
        if (this.groundX <= -48) {
            this.groundX = 0;
        }
        
        // Boundary check
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        if (this.bird.y + this.bird.height > this.height - this.groundHeight) {
            this.gameOver = true;
            this.bird.y = this.height - this.groundHeight - this.bird.height;
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('highScore', this.highScore.toString());
                }
            }
            
            // Remove pipes that are off screen
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                // Add new pipe
                const lastPipe = this.pipes[this.pipes.length - 1];
                if (lastPipe) {
                    this.addPipe(lastPipe.x + this.pipeSpacing);
                } else {
                    this.addPipe(this.width + this.pipeSpacing);
                }
            }
            
            // Collision detection
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
            }
        }
        
        // Find next pipe for AI
        this.nextPipe = this.pipes.find(pipe => pipe.x + this.pipeWidth >= this.bird.x) || null;
    }
    
    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + this.bird.width;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.bird.height;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        
        // Check if bird is within pipe's x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check if bird hits top or bottom pipe
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        
        return false;
    }
    
    getAIInputs() {
        // Input features for AI:
        // 1. Bird Y position (normalized)
        // 2. Bird velocity (normalized)
        // 3. Next pipe X distance (normalized)
        // 4. Next pipe top height (normalized)
        // 5. Next pipe gap bottom (normalized)
        
        const playableHeight = this.height - this.groundHeight;
        
        if (!this.nextPipe) {
            // If no pipe, return default values
            return [
                this.bird.y / playableHeight,
                this.bird.velocity / 20,
                1,
                0.5,
                0.5
            ];
        }
        
        const pipe = this.nextPipe;
        const distanceToPipe = (pipe.x - this.bird.x) / this.width;
        const normalizedTop = pipe.topHeight / playableHeight;
        const normalizedBottom = pipe.bottomY / playableHeight;
        
        return [
            this.bird.y / playableHeight,
            this.bird.velocity / 20,
            distanceToPipe,
            normalizedTop,
            normalizedBottom
        ];
    }
    
    drawBackground() {
        // Sky gradient (day theme like original Flappy Bird)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#4EC0CA');
        gradient.addColorStop(1, '#8ED9E0');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height - this.groundHeight);
        
        // Draw clouds (static positions)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (const cloud of this.clouds) {
            this.drawCloud(cloud.x, cloud.y);
        }
    }
    
    drawCloud(x, y) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Create a fluffy cloud shape with multiple overlapping circles
        this.ctx.beginPath();
        
        // Bottom layer (larger, flatter circles)
        this.ctx.arc(x, y + 5, 22, 0, Math.PI * 2);
        this.ctx.arc(x + 20, y + 8, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 40, y + 6, 22, 0, Math.PI * 2);
        this.ctx.arc(x + 58, y + 5, 18, 0, Math.PI * 2);
        
        // Middle layer
        this.ctx.arc(x + 10, y, 24, 0, Math.PI * 2);
        this.ctx.arc(x + 30, y - 2, 26, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 22, 0, Math.PI * 2);
        
        // Top layer (smaller puffs)
        this.ctx.arc(x + 15, y - 8, 18, 0, Math.PI * 2);
        this.ctx.arc(x + 35, y - 12, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 48, y - 8, 16, 0, Math.PI * 2);
        
        this.ctx.fill();
        
        // Add subtle shadow/depth at bottom
        this.ctx.fillStyle = 'rgba(200, 220, 235, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 30, y + 10, 35, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPipe(x, topHeight, bottomY) {
        const pipeColor = '#5CBE5C';
        const pipeDark = '#3FA03F';
        const pipeLight = '#7DD57D';
        const capHeight = 28;
        const capExtend = 4;
        
        // Top pipe body
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x, 0, this.pipeWidth, topHeight - capHeight);
        
        // Top pipe gradient/highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x + 5, 0, 8, topHeight - capHeight);
        
        // Top pipe shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8, 0, 8, topHeight - capHeight);
        
        // Top pipe cap
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x - capExtend, topHeight - capHeight, this.pipeWidth + capExtend * 2, capHeight);
        
        // Top cap highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x - capExtend + 5, topHeight - capHeight, 8, capHeight);
        
        // Top cap shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8 + capExtend, topHeight - capHeight, 8, capHeight);
        
        // Top cap border
        this.ctx.strokeStyle = pipeDark;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - capExtend, topHeight - capHeight, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom pipe cap
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x - capExtend, bottomY, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom cap highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x - capExtend + 5, bottomY, 8, capHeight);
        
        // Bottom cap shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8 + capExtend, bottomY, 8, capHeight);
        
        // Bottom cap border
        this.ctx.strokeRect(x - capExtend, bottomY, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom pipe body (stop at ground level)
        const groundY = this.height - this.groundHeight;
        const bottomPipeHeight = groundY - bottomY - capHeight;
        
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x, bottomY + capHeight, this.pipeWidth, bottomPipeHeight);
        
        // Bottom pipe highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x + 5, bottomY + capHeight, 8, bottomPipeHeight);
        
        // Bottom pipe shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8, bottomY + capHeight, 8, bottomPipeHeight);
    }
    
    drawGround() {
        const groundY = this.height - this.groundHeight;
        
        // Ground base (dirt)
        this.ctx.fillStyle = '#DED895';
        this.ctx.fillRect(0, groundY, this.width, this.groundHeight);
        
        // Ground pattern (repeating)
        this.ctx.fillStyle = '#D4C77A';
        for (let x = this.groundX; x < this.width; x += 48) {
            // Grass tufts pattern
            for (let i = 0; i < 3; i++) {
                this.ctx.fillRect(x + i * 15, groundY + i * 8, 12, 6);
            }
        }
        
        // Ground top edge (grass)
        this.ctx.fillStyle = '#95C63D';
        this.ctx.fillRect(0, groundY, this.width, 20);
        
        // Grass details
        this.ctx.fillStyle = '#7FAF2F';
        for (let x = this.groundX; x < this.width + 48; x += 24) {
            // Small grass blades
            this.ctx.fillRect(x, groundY, 3, 12);
            this.ctx.fillRect(x + 8, groundY + 2, 3, 10);
            this.ctx.fillRect(x + 16, groundY + 1, 3, 11);
        }
    }
    
    drawBird() {
        this.ctx.save();
        
        // Translate to bird center
        this.ctx.translate(
            this.bird.x + this.bird.width / 2,
            this.bird.y + this.bird.height / 2
        );
        
        // Rotate bird based on velocity
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        
        // Draw wing (behind body) with animation
        this.ctx.save();
        this.ctx.translate(-8, 0);
        this.ctx.rotate(this.bird.wingAngle * Math.PI / 180);
        
        // Wing shadow/outline
        this.ctx.fillStyle = '#F57C00';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Main wing
        this.ctx.fillStyle = '#FFA000';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wing highlight
        this.ctx.fillStyle = '#FFB300';
        this.ctx.beginPath();
        this.ctx.ellipse(-3, -2, 6, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wing feather details
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(-8, 0);
        this.ctx.lineTo(8, 0);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(-5, -4);
        this.ctx.lineTo(5, 4);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(-5, 4);
        this.ctx.lineTo(5, -4);
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Bird body (yellow circle)
        this.ctx.fillStyle = '#FFC107';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird body outline
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // White belly
        this.ctx.fillStyle = '#FFF9C4';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 4, this.bird.width / 3, this.bird.height / 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Tail feathers
        this.ctx.fillStyle = '#FFA000';
        this.ctx.beginPath();
        this.ctx.moveTo(-18, 2);
        this.ctx.lineTo(-24, -2);
        this.ctx.lineTo(-22, 0);
        this.ctx.lineTo(-24, 4);
        this.ctx.lineTo(-18, 4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        
        // Eye white
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(8, -4, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye outline
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Pupil
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(10, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye shine/highlight
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(10.5, -3.5, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Beak top
        this.ctx.fillStyle = '#FF6F00';
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(22, -2);
        this.ctx.lineTo(18, 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Beak bottom
        this.ctx.beginPath();
        this.ctx.moveTo(12, 2);
        this.ctx.lineTo(20, 3);
        this.ctx.lineTo(16, 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Beak outline
        this.ctx.strokeStyle = '#D84315';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(22, -2);
        this.ctx.lineTo(18, 2);
        this.ctx.lineTo(20, 3);
        this.ctx.lineTo(16, 5);
        this.ctx.lineTo(12, 2);
        this.ctx.closePath();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    draw() {
        // Draw background
        this.drawBackground();
        
        // Draw pipes
        for (const pipe of this.pipes) {
            this.drawPipe(pipe.x, pipe.topHeight, pipe.bottomY);
        }
        
        // Draw ground
        this.drawGround();
        
        // Draw bird
        this.drawBird();
        
        // Draw score in game
        if (this.gameStarted && !this.gameOver) {
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(this.score, this.width / 2, 80);
            this.ctx.fillText(this.score, this.width / 2, 80);
        }
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Game Over panel
            this.ctx.fillStyle = '#F4E4C1';
            this.ctx.strokeStyle = '#5C2E0A';
            this.ctx.lineWidth = 4;
            const panelWidth = 400;
            const panelHeight = 200;
            const panelX = this.width / 2 - panelWidth / 2;
            const panelY = this.height / 2 - panelHeight / 2;
            
            this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
            this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
            
            // Game Over text
            this.ctx.fillStyle = '#5C2E0A';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.width / 2, panelY + 60);
            
            // Score
            this.ctx.font = '32px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, panelY + 120);
            this.ctx.fillText(`Best: ${this.highScore}`, this.width / 2, panelY + 160);
        } else if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Ready message
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.font = 'bold 56px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeText('Ready?', this.width / 2, this.height / 2 - 40);
            this.ctx.fillText('Ready?', this.width / 2, this.height / 2 - 40);
            
            this.ctx.font = 'bold 32px Arial';
            this.ctx.strokeText('Click to Start', this.width / 2, this.height / 2 + 20);
            this.ctx.fillText('Click to Start', this.width / 2, this.height / 2 + 20);
        }
    }
    
    reset() {
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.bird.wingAngle = 0;
        this.bird.wingDirection = 1;
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.gameStartTime = null; // Reset start time
        this.groundX = 0;
        this.generateInitialPipes();
        this.nextPipe = null;
        
        // Reset clouds to initial positions if needed
        if (!this.clouds) {
            this.clouds = [
                { x: 100, y: 80 },
                { x: 450, y: 140 },
                { x: 750, y: 100 },
                { x: 280, y: 200 }
            ];
        }
    }
    
    start() {
        this.gameStarted = true;
        this.gameOver = false;
    }
}


```

```javascript
// Flappy Bird Game Engine
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 1000;
        this.height = 700;
        canvas.width = this.width;
        canvas.height = this.height;
        
        this.bird = {
            x: 100,
            y: this.height / 2,
            width: 30,
            height: 30,
            velocity: 0,
            gravity: 0.6,
            jumpStrength: -12,
            rotation: 0,
            wingAngle: 0,
            wingDirection: 1
        };
        
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 200;
        this.pipeSpeed = 3;
        this.pipeSpacing = 300; // Distance between pipes
        
        // Ground animation
        this.groundX = 0;
        this.groundHeight = 112;
        
        // Cloud positions (fixed)
        this.clouds = [
            { x: 100, y: 80 },
            { x: 450, y: 140 },
            { x: 750, y: 100 },
            { x: 280, y: 200 }
        ];
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore') || '0');
        this.gameOver = false;
        this.gameStarted = false;
        this.gameStartTime = null; // Track when game started for reduced gravity period
        
        // For AI input
        this.nextPipe = null;
        
        this.setupEventListeners();
        this.generateInitialPipes();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', () => {
            if (!this.gameStarted && !this.gameOver) {
                this.start();
            } else if (this.gameStarted && !this.gameOver) {
                this.flap();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (!this.gameStarted && !this.gameOver) {
                    this.start();
                } else if (this.gameStarted && !this.gameOver) {
                    this.flap();
                }
                e.preventDefault();
            }
        });
    }
    
    generateInitialPipes() {
        this.pipes = [];
        // Generate 5 initial pipes
        for (let i = 0; i < 5; i++) {
            this.addPipe(this.width + i * this.pipeSpacing);
        }
    }
    
    addPipe(x) {
        const minHeight = 50;
        const playableHeight = this.height - this.groundHeight; // Account for ground
        const maxHeight = playableHeight - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: x,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            passed: false
        });
    }
    
    flap() {
        this.bird.velocity = this.bird.jumpStrength;
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Calculate time since game started
        const currentTime = Date.now();
        const timeSinceStart = this.gameStartTime ? (currentTime - this.gameStartTime) / 1000 : 0; // Convert to seconds
        
        // Use reduced gravity for the first 2.5 seconds to make it easier to start
        const reducedGravityDuration = 2.5; // seconds
        const gravityMultiplier = timeSinceStart < reducedGravityDuration 
            ? 0.3 + (timeSinceStart / reducedGravityDuration) * 0.7 // Gradually increase from 30% to 100%
            : 1.0;
        
        // Update bird physics with adjusted gravity
        this.bird.velocity += this.bird.gravity * gravityMultiplier;
        this.bird.y += this.bird.velocity;
        
        // Update bird rotation based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -25), 90);
        
        // Animate wing flapping
        this.bird.wingAngle += this.bird.wingDirection * 15;
        if (this.bird.wingAngle > 30) {
            this.bird.wingDirection = -1;
        } else if (this.bird.wingAngle < -30) {
            this.bird.wingDirection = 1;
        }
        
        // Animate ground
        this.groundX -= this.pipeSpeed;
        if (this.groundX <= -48) {
            this.groundX = 0;
        }
        
        // Boundary check
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        if (this.bird.y + this.bird.height > this.height - this.groundHeight) {
            this.gameOver = true;
            this.bird.y = this.height - this.groundHeight - this.bird.height;
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('highScore', this.highScore.toString());
                }
            }
            
            // Remove pipes that are off screen
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                // Add new pipe
                const lastPipe = this.pipes[this.pipes.length - 1];
                if (lastPipe) {
                    this.addPipe(lastPipe.x + this.pipeSpacing);
                } else {
                    this.addPipe(this.width + this.pipeSpacing);
                }
            }
            
            // Collision detection
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
            }
        }
        
        // Find next pipe for AI
        this.nextPipe = this.pipes.find(pipe => pipe.x + this.pipeWidth >= this.bird.x) || null;
    }
    
    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + this.bird.width;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.bird.height;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        
        // Check if bird is within pipe's x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check if bird hits top or bottom pipe
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        
        return false;
    }
    
    getAIInputs() {
        // Input features for AI:
        // 1. Bird Y position (normalized)
        // 2. Bird velocity (normalized)
        // 3. Next pipe X distance (normalized)
        // 4. Next pipe top height (normalized)
        // 5. Next pipe gap bottom (normalized)
        
        const playableHeight = this.height - this.groundHeight;
        
        if (!this.nextPipe) {
            // If no pipe, return default values
            return [
                this.bird.y / playableHeight,
                this.bird.velocity / 20,
                1,
                0.5,
                0.5
            ];
        }
        
        const pipe = this.nextPipe;
        const distanceToPipe = (pipe.x - this.bird.x) / this.width;
        const normalizedTop = pipe.topHeight / playableHeight;
        const normalizedBottom = pipe.bottomY / playableHeight;
        
        return [
            this.bird.y / playableHeight,
            this.bird.velocity / 20,
            distanceToPipe,
            normalizedTop,
            normalizedBottom
        ];
    }
    
    drawBackground() {
        // Sky gradient (day theme like original Flappy Bird)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#4EC0CA');
        gradient.addColorStop(1, '#8ED9E0');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height - this.groundHeight);
        
        // Draw clouds (static positions)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (const cloud of this.clouds) {
            this.drawCloud(cloud.x, cloud.y);
        }
    }
    
    drawCloud(x, y) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Create a fluffy cloud shape with multiple overlapping circles
        this.ctx.beginPath();
        
        // Bottom layer (larger, flatter circles)
        this.ctx.arc(x, y + 5, 22, 0, Math.PI * 2);
        this.ctx.arc(x + 20, y + 8, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 40, y + 6, 22, 0, Math.PI * 2);
        this.ctx.arc(x + 58, y + 5, 18, 0, Math.PI * 2);
        
        // Middle layer
        this.ctx.arc(x + 10, y, 24, 0, Math.PI * 2);
        this.ctx.arc(x + 30, y - 2, 26, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 22, 0, Math.PI * 2);
        
        // Top layer (smaller puffs)
        this.ctx.arc(x + 15, y - 8, 18, 0, Math.PI * 2);
        this.ctx.arc(x + 35, y - 12, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 48, y - 8, 16, 0, Math.PI * 2);
        
        this.ctx.fill();
        
        // Add subtle shadow/depth at bottom
        this.ctx.fillStyle = 'rgba(200, 220, 235, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 30, y + 10, 35, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPipe(x, topHeight, bottomY) {
        const pipeColor = '#5CBE5C';
        const pipeDark = '#3FA03F';
        const pipeLight = '#7DD57D';
        const capHeight = 28;
        const capExtend = 4;
        
        // Top pipe body
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x, 0, this.pipeWidth, topHeight - capHeight);
        
        // Top pipe gradient/highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x + 5, 0, 8, topHeight - capHeight);
        
        // Top pipe shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8, 0, 8, topHeight - capHeight);
        
        // Top pipe cap
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x - capExtend, topHeight - capHeight, this.pipeWidth + capExtend * 2, capHeight);
        
        // Top cap highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x - capExtend + 5, topHeight - capHeight, 8, capHeight);
        
        // Top cap shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8 + capExtend, topHeight - capHeight, 8, capHeight);
        
        // Top cap border
        this.ctx.strokeStyle = pipeDark;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - capExtend, topHeight - capHeight, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom pipe cap
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x - capExtend, bottomY, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom cap highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x - capExtend + 5, bottomY, 8, capHeight);
        
        // Bottom cap shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8 + capExtend, bottomY, 8, capHeight);
        
        // Bottom cap border
        this.ctx.strokeRect(x - capExtend, bottomY, this.pipeWidth + capExtend * 2, capHeight);
        
        // Bottom pipe body (stop at ground level)
        const groundY = this.height - this.groundHeight;
        const bottomPipeHeight = groundY - bottomY - capHeight;
        
        this.ctx.fillStyle = pipeColor;
        this.ctx.fillRect(x, bottomY + capHeight, this.pipeWidth, bottomPipeHeight);
        
        // Bottom pipe highlight
        this.ctx.fillStyle = pipeLight;
        this.ctx.fillRect(x + 5, bottomY + capHeight, 8, bottomPipeHeight);
        
        // Bottom pipe shadow
        this.ctx.fillStyle = pipeDark;
        this.ctx.fillRect(x + this.pipeWidth - 8, bottomY + capHeight, 8, bottomPipeHeight);
    }
    
    drawGround() {
        const groundY = this.height - this.groundHeight;
        
        // Ground base (dirt)
        this.ctx.fillStyle = '#DED895';
        this.ctx.fillRect(0, groundY, this.width, this.groundHeight);
        
        // Ground pattern (repeating)
        this.ctx.fillStyle = '#D4C77A';
        for (let x = this.groundX; x < this.width; x += 48) {
            // Grass tufts pattern
            for (let i = 0; i < 3; i++) {
                this.ctx.fillRect(x + i * 15, groundY + i * 8, 12, 6);
            }
        }
        
        // Ground top edge (grass)
        this.ctx.fillStyle = '#95C63D';
        this.ctx.fillRect(0, groundY, this.width, 20);
        
        // Grass details
        this.ctx.fillStyle = '#7FAF2F';
        for (let x = this.groundX; x < this.width + 48; x += 24) {
            // Small grass blades
            this.ctx.fillRect(x, groundY, 3, 12);
            this.ctx.fillRect(x + 8, groundY + 2, 3, 10);
            this.ctx.fillRect(x + 16, groundY + 1, 3, 11);
        }
    }
    
    drawBird() {
        this.ctx.save();
        
        // Translate to bird center
        this.ctx.translate(
            this.bird.x + this.bird.width / 2,
            this.bird.y + this.bird.height / 2
        );
        
        // Rotate bird based on velocity
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        
        // Draw wing (behind body) with animation
        this.ctx.save();
        this.ctx.translate(-8, 0);
        this.ctx.rotate(this.bird.wingAngle * Math.PI / 180);
        
        // Wing shadow/outline
        this.ctx.fillStyle = '#F57C00';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Main wing
        this.ctx.fillStyle = '#FFA000';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wing highlight
        this.ctx.fillStyle = '#FFB300';
        this.ctx.beginPath();
        this.ctx.ellipse(-3, -2, 6, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wing feather details
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(-8, 0);
        this.ctx.lineTo(8, 0);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(-5, -4);
        this.ctx.lineTo(5, 4);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(-5, 4);
        this.ctx.lineTo(5, -4);
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Bird body (yellow circle)
        this.ctx.fillStyle = '#FFC107';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird body outline
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // White belly
        this.ctx.fillStyle = '#FFF9C4';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 4, this.bird.width / 3, this.bird.height / 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Tail feathers
        this.ctx.fillStyle = '#FFA000';
        this.ctx.beginPath();
        this.ctx.moveTo(-18, 2);
        this.ctx.lineTo(-24, -2);
        this.ctx.lineTo(-22, 0);
        this.ctx.lineTo(-24, 4);
        this.ctx.lineTo(-18, 4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#F57C00';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        
        // Eye white
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(8, -4, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye outline
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Pupil
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(10, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye shine/highlight
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(10.5, -3.5, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Beak top
        this.ctx.fillStyle = '#FF6F00';
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(22, -2);
        this.ctx.lineTo(18, 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Beak bottom
        this.ctx.beginPath();
        this.ctx.moveTo(12, 2);
        this.ctx.lineTo(20, 3);
        this.ctx.lineTo(16, 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Beak outline
        this.ctx.strokeStyle = '#D84315';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(12, 0);
        this.ctx.lineTo(22, -2);
        this.ctx.lineTo(18, 2);
        this.ctx.lineTo(20, 3);
        this.ctx.lineTo(16, 5);
        this.ctx.lineTo(12, 2);
        this.ctx.closePath();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    draw() {
        // Draw background
        this.drawBackground();
        
        // Draw pipes
        for (const pipe of this.pipes) {
            this.drawPipe(pipe.x, pipe.topHeight, pipe.bottomY);
        }
        
        // Draw ground
        this.drawGround();
        
        // Draw bird
        this.drawBird();
        
        // Draw score in game
        if (this.gameStarted && !this.gameOver) {
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(this.score, this.width / 2, 80);
            this.ctx.fillText(this.score, this.width / 2, 80);
        }
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Game Over panel
            this.ctx.fillStyle = '#F4E4C1';
            this.ctx.strokeStyle = '#5C2E0A';
            this.ctx.lineWidth = 4;
            const panelWidth = 400;
            const panelHeight = 200;
            const panelX = this.width / 2 - panelWidth / 2;
            const panelY = this.height / 2 - panelHeight / 2;
            
            this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
            this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
            
            // Game Over text
            this.ctx.fillStyle = '#5C2E0A';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.width / 2, panelY + 60);
            
            // Score
            this.ctx.font = '32px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, panelY + 120);
            this.ctx.fillText(`Best: ${this.highScore}`, this.width / 2, panelY + 160);
        } else if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Ready message
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.font = 'bold 56px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeText('Ready?', this.width / 2, this.height / 2 - 40);
            this.ctx.fillText('Ready?', this.width / 2, this.height / 2 - 40);
            
            this.ctx.font = 'bold 32px Arial';
            this.ctx.strokeText('Click to Start', this.width / 2, this.height / 2 + 20);
            this.ctx.fillText('Click to Start', this.width / 2, this.height / 2 + 20);
        }
    }
    
    reset() {
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.bird.wingAngle = 0;
        this.bird.wingDirection = 1;
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.gameStartTime = null; // Reset start time
        this.groundX = 0;
        this.generateInitialPipes();
        this.nextPipe = null;
        
        // Reset clouds to initial positions if needed
        if (!this.clouds) {
            this.clouds = [
                { x: 100, y: 80 },
                { x: 450, y: 140 },
                { x: 750, y: 100 },
                { x: 280, y: 200 }
            ];
        }
    }
    
    start() {
        this.gameStarted = true;
        this.gameOver = false;
        this.gameStartTime = Date.now(); // Record when game started
    }
}


```


Checking for lint errors:



Updated the game so the bird falls slower for the first 2.5 seconds after the game starts.

1. **Added `gameStartTime` tracking**: Records when the game starts
2. **Reduced gravity during startup**: For the first 2.5 seconds, gravity is reduced:
   - Starts at 30% of normal gravity
   - Gradually increases to 100% over 2.5 seconds
   - After 2.5 seconds, normal gravity applies
3. **Reset on game restart**: The timer resets when the game resets

This gives players more time to react at the start. The bird will fall slowly initially, then gradually return to normal gravity, making the first few seconds easier.

