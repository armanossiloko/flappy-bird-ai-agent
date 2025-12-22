// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human', 'ai', or 'ai-play'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    
    // Create AI trainer with callbacks for UI updates (separated from agent logic)
    aiAgent = new AITrainer(game, 50, {
        onStatsUpdate: (aliveCount, generation, bestScore, maxScore) => {
            // Update UI stats (UI layer handles DOM manipulation)
            document.getElementById('alive').textContent = aliveCount;
            document.getElementById('generation').textContent = generation;
            document.getElementById('bestScore').textContent = bestScore;
            document.getElementById('score').textContent = maxScore;
        },
        onScoreUpdate: (score) => {
            // Update score display (UI layer handles DOM manipulation)
            document.getElementById('score').textContent = score;
        },
        onBestScoreUpdate: (bestScore) => {
            // Update best score display (UI layer handles DOM manipulation)
            document.getElementById('bestScore').textContent = bestScore;
        },
        onSaveStatusUpdate: (statusText, loaded) => {
            // Update save status (UI layer handles DOM manipulation)
            const statusElement = document.getElementById('saveStatus');
            if (statusElement) {
                statusElement.textContent = statusText;
                if (loaded || statusText.includes('Saved') || statusText.includes('New Best')) {
                    statusElement.style.color = '#28a745';
                } else if (statusText === 'No saved data') {
                    statusElement.style.color = '#666';
                } else {
                    statusElement.style.color = '#28a745';
                }
                
                // Auto-clear status after delay (only for certain messages)
                if (statusText === 'Saved' || statusText.includes('New Best')) {
                    setTimeout(() => {
                        if (statusElement) {
                            statusElement.textContent = '';
                        }
                    }, statusText.includes('New Best') ? 3000 : 2000);
                }
            }
        },
        onNotification: (message, type) => {
            // Show notification (UI layer handles DOM manipulation)
            showNotification(message, type);
        },
        onFileSave: (jsonString, filename) => {
            // Handle file download (UI layer handles browser-specific operations)
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    });
    
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

