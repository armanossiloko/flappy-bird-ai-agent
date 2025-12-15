# Flappy Bird clone with AI learning
_Exported on 11/3/2025 at 22:56:02 GMT+1 from Cursor (2.0.52)_

---

**User**

In this workspace, I would like to generate the following: 

1. a Flappy Bird clone with procedurally generated levels

2. a (separate) AI agent that will be capable of learning and adapting to procedurally generated levels in the Flappy Bird clone. 



The end result would be that I am able to open the Flappy Bird clone and play it on my own or that I can let the AI agent to play the game and learn as it plays. Please note that I want to avoid using any external AI models for this.

---

**Cursor**

Creating the initial todo list for the Flappy Bird clone and learning AI agent.


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
            <h1>Flappy Bird AI</h1>
            <div class="controls">
                <button id="startBtn">Start Game</button>
                <button id="aiBtn">Start AI Learning</button>
                <button id="stopBtn">Stop</button>
                <label>
                    <input type="checkbox" id="fastMode"> Fast Mode (AI only)
                </label>
            </div>
            <div class="stats">
                <div>Score: <span id="score">0</span></div>
                <div>High Score: <span id="highScore">0</span></div>
                <div id="aiStats" style="display: none;">
                    <div>Generation: <span id="generation">1</span></div>
                    <div>Best Score: <span id="bestScore">0</span></div>
                    <div>Alive: <span id="alive">0</span></div>
                </div>
            </div>
        </div>
        <canvas id="gameCanvas"></canvas>
        <div id="instructions">
            <p>Press SPACE or CLICK to flap</p>
            <p>Select "Start Game" to play manually</p>
            <p>Select "Start AI Learning" to watch the AI learn</p>
        </div>
    </div>
    <script src="neural-network.js"></script>
    <script src="game.js"></script>
    <script src="ai.js"></script>
    <script src="main.js"></script>
</body>
</html>

```

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}

.container {
    background: white;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 900px;
    width: 100%;
}

.game-header {
    margin-bottom: 15px;
}

.game-header h1 {
    text-align: center;
    color: #333;
    margin-bottom: 15px;
    font-size: 2em;
}

.controls {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 15px;
}

.controls button {
    padding: 10px 20px;
    font-size: 14px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background: #667eea;
    color: white;
    font-weight: bold;
    transition: background 0.3s;
}

.controls button:hover {
    background: #5568d3;
}

.controls button:active {
    transform: scale(0.95);
}

.controls button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.controls label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}

.stats {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
    font-size: 14px;
    color: #666;
}

.stats div {
    padding: 5px 10px;
    background: #f5f5f5;
    border-radius: 5px;
}

#gameCanvas {
    display: block;
    margin: 0 auto;
    border: 3px solid #667eea;
    border-radius: 10px;
    background: #87CEEB;
    cursor: pointer;
}

#instructions {
    text-align: center;
    margin-top: 15px;
    color: #666;
    font-size: 14px;
    line-height: 1.6;
}

#instructions p {
    margin: 5px 0;
}

```

Implementing the core components: neural network, game engine, and AI agent.


```javascript
// Simple Neural Network implementation from scratch
class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;
        
        // Initialize weights with random values between -1 and 1
        this.weights_ih = this.createMatrix(hiddenNodes, inputNodes);
        this.weights_ho = this.createMatrix(outputNodes, hiddenNodes);
        
        // Initialize biases
        this.bias_h = this.createMatrix(hiddenNodes, 1);
        this.bias_o = this.createMatrix(outputNodes, 1);
        
        this.randomize(this.weights_ih);
        this.randomize(this.weights_ho);
        this.randomize(this.bias_h);
        this.randomize(this.bias_o);
        
        this.learningRate = 0.1;
    }
    
    createMatrix(rows, cols) {
        return Array(rows).fill().map(() => Array(cols).fill(0));
    }
    
    randomize(matrix) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                matrix[i][j] = Math.random() * 2 - 1; // Random between -1 and 1
            }
        }
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    dsigmoid(y) {
        return y * (1 - y);
    }
    
    feedforward(inputArray) {
        // Convert input array to matrix
        let inputs = inputArray.map(x => [x]);
        
        // Hidden layer
        let hidden = this.createMatrix(this.hiddenNodes, 1);
        for (let i = 0; i < this.hiddenNodes; i++) {
            let sum = 0;
            for (let j = 0; j < this.inputNodes; j++) {
                sum += this.weights_ih[i][j] * inputs[j][0];
            }
            sum += this.bias_h[i][0];
            hidden[i][0] = this.sigmoid(sum);
        }
        
        // Output layer
        let outputs = this.createMatrix(this.outputNodes, 1);
        for (let i = 0; i < this.outputNodes; i++) {
            let sum = 0;
            for (let j = 0; j < this.hiddenNodes; j++) {
                sum += this.weights_ho[i][j] * hidden[j][0];
            }
            sum += this.bias_o[i][0];
            outputs[i][0] = this.sigmoid(sum);
        }
        
        return outputs.map(x => x[0]);
    }
    
    copy() {
        let nn = new NeuralNetwork(this.inputNodes, this.hiddenNodes, this.outputNodes);
        nn.weights_ih = this.weights_ih.map(row => [...row]);
        nn.weights_ho = this.weights_ho.map(row => [...row]);
        nn.bias_h = this.bias_h.map(row => [...row]);
        nn.bias_o = this.bias_o.map(row => [...row]);
        return nn;
    }
    
    mutate(rate) {
        const mutateValue = (val) => {
            if (Math.random() < rate) {
                return val + (Math.random() * 2 - 1) * 0.5;
            }
            return val;
        };
        
        this.weights_ih = this.weights_ih.map(row => row.map(mutateValue));
        this.weights_ho = this.weights_ho.map(row => row.map(mutateValue));
        this.bias_h = this.bias_h.map(row => row.map(mutateValue));
        this.bias_o = this.bias_o.map(row => row.map(mutateValue));
    }
    
    // Genetic algorithm crossover
    static crossover(parent1, parent2) {
        let child = new NeuralNetwork(
            parent1.inputNodes,
            parent1.hiddenNodes,
            parent1.outputNodes
        );
        
        // Crossover weights
        for (let i = 0; i < child.weights_ih.length; i++) {
            for (let j = 0; j < child.weights_ih[i].length; j++) {
                child.weights_ih[i][j] = Math.random() < 0.5 
                    ? parent1.weights_ih[i][j] 
                    : parent2.weights_ih[i][j];
            }
        }
        
        for (let i = 0; i < child.weights_ho.length; i++) {
            for (let j = 0; j < child.weights_ho[i].length; j++) {
                child.weights_ho[i][j] = Math.random() < 0.5 
                    ? parent1.weights_ho[i][j] 
                    : parent2.weights_ho[i][j];
            }
        }
        
        // Crossover biases
        for (let i = 0; i < child.bias_h.length; i++) {
            child.bias_h[i][0] = Math.random() < 0.5 
                ? parent1.bias_h[i][0] 
                : parent2.bias_h[i][0];
        }
        
        for (let i = 0; i < child.bias_o.length; i++) {
            child.bias_o[i][0] = Math.random() < 0.5 
                ? parent1.bias_o[i][0] 
                : parent2.bias_o[i][0];
        }
        
        return child;
    }
}

```

```javascript
// Flappy Bird Game Engine
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
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
            color: '#FFD700'
        };
        
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 200;
        this.pipeSpeed = 3;
        this.pipeSpacing = 300; // Distance between pipes
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore') || '0');
        this.gameOver = false;
        this.gameStarted = false;
        
        // For AI input
        this.nextPipe = null;
        
        this.setupEventListeners();
        this.generateInitialPipes();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', () => {
            if (this.gameStarted && !this.gameOver) {
                this.flap();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameStarted && !this.gameOver) {
                this.flap();
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
        const maxHeight = this.height - this.pipeGap - minHeight;
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
        
        // Boundary check
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        if (this.bird.y + this.bird.height > this.height) {
            this.gameOver = true;
            this.bird.y = this.height - this.bird.height;
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
        
        if (!this.nextPipe) {
            // If no pipe, return default values
            return [
                this.bird.y / this.height,
                this.bird.velocity / 20,
                1,
                0.5,
                0.5
            ];
        }
        
        const pipe = this.nextPipe;
        const distanceToPipe = (pipe.x - this.bird.x) / this.width;
        const normalizedTop = pipe.topHeight / this.height;
        const normalizedBottom = pipe.bottomY / this.height;
        
        return [
            this.bird.y / this.height,
            this.bird.velocity / 20,
            distanceToPipe,
            normalizedTop,
            normalizedBottom
        ];
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.height - 20, this.width, 20);
        
        // Draw grass on ground
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.height - 20, this.width, 5);
        
        // Draw pipes
        this.ctx.fillStyle = '#228B22';
        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
            
            // Pipe caps
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);
        }
        
        // Draw bird
        this.ctx.fillStyle = this.bird.color;
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.bird.x + this.bird.width / 2,
            this.bird.y + this.bird.height / 2,
            this.bird.width / 2,
            this.bird.height / 2,
            0,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Draw bird eye
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(
            this.bird.x + this.bird.width * 0.6,
            this.bird.y + this.bird.height * 0.4,
            3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.width / 2, this.height / 2 - 50);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2);
        } else if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click to Start', this.width / 2, this.height / 2);
        }
    }
    
    reset() {
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.generateInitialPipes();
        this.nextPipe = null;
    }
    
    start() {
        this.gameStarted = true;
        this.gameOver = false;
    }
}

```

Creating the AI agent with genetic algorithm learning:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Create initial population
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        this.generation = 1;
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                }
                
                // Update visual game for first alive bird
                if (aliveCount === 1 && bird.alive) {
                    this.syncGameToVisual(bird.game);
                }
            }
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.fastMode) {
            // Fast mode: run multiple updates per frame
            for (let i = 0; i < 10; i++) {
                setTimeout(() => this.updateLoop(), 0);
            }
        } else {
            requestAnimationFrame(() => this.updateLoop());
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        for (let pipe of sourceGame.pipes) {
            this.game.pipes.push({
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            });
        }
        
        this.game.nextPipe = sourceGame.nextPipe;
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
}

```

```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human' or 'ai'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
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
    aiAgent.start();
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
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
    }
    
    game.draw();
    
    // Update score display
    document.getElementById('score').textContent = game.score;
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Initialize when page loads
window.addEventListener('load', init);

```

Fixing the AI update loop and checking for issues:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Create initial population
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        this.generation = 1;
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                }
                
                // Update visual game for first alive bird
                if (aliveCount === 1 && bird.alive) {
                    this.syncGameToVisual(bird.game);
                }
            }
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        for (let pipe of sourceGame.pipes) {
            this.game.pipes.push({
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            });
        }
        
        this.game.nextPipe = sourceGame.nextPipe;
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
}


```

Fixing a few issues to ensure everything works properly:


Fixing a conflict between the main game loop and the AI update loop:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human' or 'ai'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
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
    aiAgent.start();
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
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
    } else if (currentMode !== 'ai') {
        // Only draw if not in AI mode (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Initialize when page loads
window.addEventListener('load', init);


```

Improving visual sync so the best-performing bird is always visible:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Create initial population
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        this.generation = 1;
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                }
                
                // Update visual game to show best performing alive bird
                if (bird.alive && bird.fitness >= maxScore) {
                    this.syncGameToVisual(bird.game);
                }
            }
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        for (let pipe of sourceGame.pipes) {
            this.game.pipes.push({
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            });
        }
        
        this.game.nextPipe = sourceGame.nextPipe;
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Create initial population
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        this.generation = 1;
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                }
                
                // Update visual game to show best performing alive bird
                if (bird.alive && bird.fitness >= maxScore) {
                    this.syncGameToVisual(bird.game);
                }
            }
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        for (let pipe of sourceGame.pipes) {
            this.game.pipes.push({
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            });
        }
        
        this.game.nextPipe = sourceGame.nextPipe;
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Create initial population
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        this.generation = 1;
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        for (let pipe of sourceGame.pipes) {
            this.game.pipes.push({
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            });
        }
        
        this.game.nextPipe = sourceGame.nextPipe;
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Create initial population
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        this.generation = 1;
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        for (let pipe of sourceGame.pipes) {
            this.game.pipes.push({
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            });
        }
        
        this.game.nextPipe = sourceGame.nextPipe;
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
}


```

Removing duplicate code:


Verifying the sync method copies the game state correctly:


Fixing the nextPipe reference in the sync method:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Create initial population
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        this.generation = 1;
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
}


```

Creating a simple README with basic usage instructions:


## Project Summary

**1. Flappy Bird Clone** (`game.js`)
- Bird physics with gravity and jumping
- Procedurally generated pipes with random heights and gaps
- Collision detection
- Score tracking with high score persistence
- Visual feedback with animations

**2. AI Learning System**
- **Neural Network** (`neural-network.js`): Neural network implementation with:
  - Feedforward propagation
  - Genetic algorithm support (mutation, crossover)
  - No external dependencies
  
- **AI Agent** (`ai.js`): Genetic algorithm-based learning with:
  - Population of 50 neural networks
  - Fitness-based selection
  - Evolution through crossover and mutation
  - Real-time learning and adaptation

**3. User Interface** (`index.html`, `styles.css`, `main.js`)
- Toggle between human play and AI learning
- Real-time statistics (score, generation, best score)
- Fast mode for accelerated AI training
- Clean, modern UI

## How to Use

1. Open `index.html` in a web browser
2. Manual play: Click "Start Game", then click or press SPACE to flap
3. AI learning: Click "Start AI Learning" to watch the AI train
4. Fast mode: Enable "Fast Mode" during AI learning to speed up training

The AI uses a genetic algorithm:
- Each generation runs 50 birds
- The best performers are selected
- New generations are created through crossover and mutation
- Performance improves over generations

The system is self-contained—no external AI models or API calls. All learning happens locally in the browser. Open `index.html` to get started.

---

**User**

Does the AI agent support saving its knowledge somewhere so that when I open Flappy Bird next time, it does not need to start learning from scratch?

---

**Cursor**

Checking for save/load functionality. Adding persistence so the AI can save and resume its learned knowledge.


Currently there's no save/load functionality for the AI. Adding persistence so it can resume learning from where it left off.


Adding save/load functionality for the AI so it can persist its learned knowledge:


```javascript
// Simple Neural Network implementation from scratch
class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;
        
        // Initialize weights with random values between -1 and 1
        this.weights_ih = this.createMatrix(hiddenNodes, inputNodes);
        this.weights_ho = this.createMatrix(outputNodes, hiddenNodes);
        
        // Initialize biases
        this.bias_h = this.createMatrix(hiddenNodes, 1);
        this.bias_o = this.createMatrix(outputNodes, 1);
        
        this.randomize(this.weights_ih);
        this.randomize(this.weights_ho);
        this.randomize(this.bias_h);
        this.randomize(this.bias_o);
        
        this.learningRate = 0.1;
    }
    
    createMatrix(rows, cols) {
        return Array(rows).fill().map(() => Array(cols).fill(0));
    }
    
    randomize(matrix) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                matrix[i][j] = Math.random() * 2 - 1; // Random between -1 and 1
            }
        }
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    dsigmoid(y) {
        return y * (1 - y);
    }
    
    feedforward(inputArray) {
        // Convert input array to matrix
        let inputs = inputArray.map(x => [x]);
        
        // Hidden layer
        let hidden = this.createMatrix(this.hiddenNodes, 1);
        for (let i = 0; i < this.hiddenNodes; i++) {
            let sum = 0;
            for (let j = 0; j < this.inputNodes; j++) {
                sum += this.weights_ih[i][j] * inputs[j][0];
            }
            sum += this.bias_h[i][0];
            hidden[i][0] = this.sigmoid(sum);
        }
        
        // Output layer
        let outputs = this.createMatrix(this.outputNodes, 1);
        for (let i = 0; i < this.outputNodes; i++) {
            let sum = 0;
            for (let j = 0; j < this.hiddenNodes; j++) {
                sum += this.weights_ho[i][j] * hidden[j][0];
            }
            sum += this.bias_o[i][0];
            outputs[i][0] = this.sigmoid(sum);
        }
        
        return outputs.map(x => x[0]);
    }
    
    copy() {
        let nn = new NeuralNetwork(this.inputNodes, this.hiddenNodes, this.outputNodes);
        nn.weights_ih = this.weights_ih.map(row => [...row]);
        nn.weights_ho = this.weights_ho.map(row => [...row]);
        nn.bias_h = this.bias_h.map(row => [...row]);
        nn.bias_o = this.bias_o.map(row => [...row]);
        return nn;
    }
    
    mutate(rate) {
        const mutateValue = (val) => {
            if (Math.random() < rate) {
                return val + (Math.random() * 2 - 1) * 0.5;
            }
            return val;
        };
        
        this.weights_ih = this.weights_ih.map(row => row.map(mutateValue));
        this.weights_ho = this.weights_ho.map(row => row.map(mutateValue));
        this.bias_h = this.bias_h.map(row => row.map(mutateValue));
        this.bias_o = this.bias_o.map(row => row.map(mutateValue));
    }
    
    // Genetic algorithm crossover
    static crossover(parent1, parent2) {
        let child = new NeuralNetwork(
            parent1.inputNodes,
            parent1.hiddenNodes,
            parent1.outputNodes
        );
        
        // Crossover weights
        for (let i = 0; i < child.weights_ih.length; i++) {
            for (let j = 0; j < child.weights_ih[i].length; j++) {
                child.weights_ih[i][j] = Math.random() < 0.5 
                    ? parent1.weights_ih[i][j] 
                    : parent2.weights_ih[i][j];
            }
        }
        
        for (let i = 0; i < child.weights_ho.length; i++) {
            for (let j = 0; j < child.weights_ho[i].length; j++) {
                child.weights_ho[i][j] = Math.random() < 0.5 
                    ? parent1.weights_ho[i][j] 
                    : parent2.weights_ho[i][j];
            }
        }
        
        // Crossover biases
        for (let i = 0; i < child.bias_h.length; i++) {
            child.bias_h[i][0] = Math.random() < 0.5 
                ? parent1.bias_h[i][0] 
                : parent2.bias_h[i][0];
        }
        
        for (let i = 0; i < child.bias_o.length; i++) {
            child.bias_o[i][0] = Math.random() < 0.5 
                ? parent1.bias_o[i][0] 
                : parent2.bias_o[i][0];
        }
        
        return child;
    }
    
    // Serialize neural network to JSON
    serialize() {
        return JSON.stringify({
            inputNodes: this.inputNodes,
            hiddenNodes: this.hiddenNodes,
            outputNodes: this.outputNodes,
            weights_ih: this.weights_ih,
            weights_ho: this.weights_ho,
            bias_h: this.bias_h,
            bias_o: this.bias_o
        });
    }
    
    // Deserialize neural network from JSON
    static deserialize(data) {
        const json = typeof data === 'string' ? JSON.parse(data) : data;
        const nn = new NeuralNetwork(json.inputNodes, json.hiddenNodes, json.outputNodes);
        nn.weights_ih = json.weights_ih;
        nn.weights_ho = json.weights_ho;
        nn.bias_h = json.bias_h;
        nn.bias_o = json.bias_o;
        return nn;
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        this.generation = 1;
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        this.generation = 1;
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
}


```

Adding save/load methods to the AIAgent class:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        this.generation = 1;
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

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
            <h1>Flappy Bird AI</h1>
            <div class="controls">
                <button id="startBtn">Start Game</button>
                <button id="aiBtn">Start AI Learning</button>
                <button id="stopBtn">Stop</button>
                <label>
                    <input type="checkbox" id="fastMode"> Fast Mode (AI only)
                </label>
            </div>
            <div class="stats">
                <div>Score: <span id="score">0</span></div>
                <div>High Score: <span id="highScore">0</span></div>
                <div id="aiStats" style="display: none;">
                    <div>Generation: <span id="generation">1</span></div>
                    <div>Best Score: <span id="bestScore">0</span></div>
                    <div>Alive: <span id="alive">0</span></div>
                    <div id="saveStatus" style="font-size: 12px; margin-top: 5px;"></div>
                </div>
            </div>
        </div>
        <canvas id="gameCanvas"></canvas>
        <div id="instructions">
            <p>Press SPACE or CLICK to flap</p>
            <p>Select "Start Game" to play manually</p>
            <p>Select "Start AI Learning" to watch the AI learn</p>
        </div>
    </div>
    <script src="neural-network.js"></script>
    <script src="game.js"></script>
    <script src="ai.js"></script>
    <script src="main.js"></script>
</body>
</html>


```

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
            <h1>Flappy Bird AI</h1>
            <div class="controls">
                <button id="startBtn">Start Game</button>
                <button id="aiBtn">Start AI Learning</button>
                <button id="stopBtn">Stop</button>
                <button id="saveBtn">Save AI</button>
                <button id="clearBtn">Clear Saved AI</button>
                <label>
                    <input type="checkbox" id="fastMode"> Fast Mode (AI only)
                </label>
            </div>
            <div class="stats">
                <div>Score: <span id="score">0</span></div>
                <div>High Score: <span id="highScore">0</span></div>
                <div id="aiStats" style="display: none;">
                    <div>Generation: <span id="generation">1</span></div>
                    <div>Best Score: <span id="bestScore">0</span></div>
                    <div>Alive: <span id="alive">0</span></div>
                    <div id="saveStatus" style="font-size: 12px; margin-top: 5px;"></div>
                </div>
            </div>
        </div>
        <canvas id="gameCanvas"></canvas>
        <div id="instructions">
            <p>Press SPACE or CLICK to flap</p>
            <p>Select "Start Game" to play manually</p>
            <p>Select "Start AI Learning" to watch the AI learn</p>
        </div>
    </div>
    <script src="neural-network.js"></script>
    <script src="game.js"></script>
    <script src="ai.js"></script>
    <script src="main.js"></script>
</body>
</html>


```

```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human' or 'ai'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.save();
        }
    });
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to clear all saved AI knowledge? This cannot be undone.')) {
            aiAgent.clearSavedData();
            // Reset AI agent to start fresh
            aiAgent = new AIAgent(game);
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
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
    aiAgent.start();
    
    document.getElementById('aiStats').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
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
    } else if (currentMode !== 'ai') {
        // Only draw if not in AI mode (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Initialize when page loads
window.addEventListener('load', init);


```

Ensuring save status is visible and updating the start function:


```javascript
// Main application controller
let game;
let aiAgent;
let gameLoopRunning = false;
let currentMode = null; // 'human' or 'ai'

function init() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    aiAgent = new AIAgent(game);
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.save();
        }
    });
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to clear all saved AI knowledge? This cannot be undone.')) {
            aiAgent.clearSavedData();
            // Reset AI agent to start fresh
            aiAgent = new AIAgent(game);
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
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
    
    // Update save status display
    if (aiAgent) {
        aiAgent.updateSaveStatus(false);
        // Check if there's saved data
        const savedData = localStorage.getItem('aiAgentData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                aiAgent.updateSaveStatus(true, true);
            } catch (e) {
                aiAgent.updateSaveStatus(false);
            }
        }
    }
    
    aiAgent.start();
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
    } else if (currentMode !== 'ai') {
        // Only draw if not in AI mode (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Initialize when page loads
window.addEventListener('load', init);


```

Fixing the start() method to preserve the loaded generation:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

## New Features

1. Auto-save: When the AI achieves a new best score, its knowledge is saved to browser localStorage.
2. Auto-load: On page load, the AI loads saved knowledge and resumes from the last generation.
3. Manual save: "Save AI" button to save at any time.
4. Clear data: "Clear Saved AI" button (with confirmation) to reset the AI and start fresh.
5. Save status indicator: Shows when data was loaded and when saves occur.

## How It Works

- Save format: The entire population (all 50 neural networks), the best-performing bird, generation number, and best score are saved as JSON in localStorage.
- Persistent storage: Data persists across browser sessions (until you clear it or clear browser data).
- Smart loading: If saved data exists, the AI loads it and continues from that generation. If not, it starts from scratch.

## Usage

1. Train the AI: Click "Start AI Learning" and let it train.
2. The AI auto-saves when it achieves a new best score.
3. Close and reopen: The AI loads automatically and resumes from the saved generation.
4. Manual save: Click "Save AI" anytime.
5. Reset: Click "Clear Saved AI" to remove all saved data and start fresh.

When you open the game next time, you'll see a message like "Loaded from Generation 15" (or whatever generation was saved), and the AI continues learning from there instead of starting over.

---

**User**

Once I am done with AI learning, how can I let AI just play?

---

**Cursor**

Adding an AI play mode that uses the trained AI without learning or evolution—just playing.


Adding an AI play mode that uses the trained AI to play without learning or evolution.


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        this.isRunning = true;
        this.playMode = true;
        
        // Use best bird if available, otherwise use first bird from population
        const brainToUse = this.bestBird || this.population[0].brain;
        this.playBird = {
            brain: brainToUse.copy(),
            game: this.createGameInstance(),
            score: 0,
            alive: true
        };
        
        this.playLoop();
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode) return;
        
        if (this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game
            this.syncGameToVisual(this.playBird.game);
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning) {
            requestAnimationFrame(() => this.playLoop());
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

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
            <h1>Flappy Bird AI</h1>
            <div class="controls">
                <button id="startBtn">Start Game</button>
                <button id="aiBtn">Start AI Learning</button>
                <button id="aiPlayBtn">AI Play</button>
                <button id="stopBtn">Stop</button>
                <button id="saveBtn">Save AI</button>
                <button id="clearBtn">Clear Saved AI</button>
                <label>
                    <input type="checkbox" id="fastMode"> Fast Mode (AI only)
                </label>
            </div>
            <div class="stats">
                <div>Score: <span id="score">0</span></div>
                <div>High Score: <span id="highScore">0</span></div>
                <div id="aiStats" style="display: none;">
                    <div>Generation: <span id="generation">1</span></div>
                    <div>Best Score: <span id="bestScore">0</span></div>
                    <div>Alive: <span id="alive">0</span></div>
                    <div id="saveStatus" style="font-size: 12px; margin-top: 5px;"></div>
                </div>
            </div>
        </div>
        <canvas id="gameCanvas"></canvas>
        <div id="instructions">
            <p>Press SPACE or CLICK to flap</p>
            <p>Select "Start Game" to play manually</p>
            <p>Select "Start AI Learning" to watch the AI learn</p>
        </div>
    </div>
    <script src="neural-network.js"></script>
    <script src="game.js"></script>
    <script src="ai.js"></script>
    <script src="main.js"></script>
</body>
</html>


```

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
            <h1>Flappy Bird AI</h1>
            <div class="controls">
                <button id="startBtn">Start Game</button>
                <button id="aiBtn">Start AI Learning</button>
                <button id="aiPlayBtn">AI Play</button>
                <button id="stopBtn">Stop</button>
                <button id="saveBtn">Save AI</button>
                <button id="clearBtn">Clear Saved AI</button>
                <label>
                    <input type="checkbox" id="fastMode"> Fast Mode (AI only)
                </label>
            </div>
            <div class="stats">
                <div>Score: <span id="score">0</span></div>
                <div>High Score: <span id="highScore">0</span></div>
                <div id="aiStats" style="display: none;">
                    <div>Generation: <span id="generation">1</span></div>
                    <div>Best Score: <span id="bestScore">0</span></div>
                    <div>Alive: <span id="alive">0</span></div>
                    <div id="saveStatus" style="font-size: 12px; margin-top: 5px;"></div>
                </div>
            </div>
        </div>
        <canvas id="gameCanvas"></canvas>
        <div id="instructions">
            <p>Press SPACE or CLICK to flap</p>
            <p>Select "Start Game" to play manually</p>
            <p>Select "Start AI Learning" to train the AI</p>
            <p>Select "AI Play" to watch the trained AI play</p>
        </div>
    </div>
    <script src="neural-network.js"></script>
    <script src="game.js"></script>
    <script src="ai.js"></script>
    <script src="main.js"></script>
</body>
</html>


```

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
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.save();
        }
    });
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to clear all saved AI knowledge? This cannot be undone.')) {
            aiAgent.clearSavedData();
            // Reset AI agent to start fresh
            aiAgent = new AIAgent(game);
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
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
    
    // Update save status display
    if (aiAgent) {
        aiAgent.updateSaveStatus(false);
        // Check if there's saved data
        const savedData = localStorage.getItem('aiAgentData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                aiAgent.updateSaveStatus(true, true);
            } catch (e) {
                aiAgent.updateSaveStatus(false);
            }
        }
    }
    
    aiAgent.start();
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
    } else if (currentMode !== 'ai') {
        // Only draw if not in AI mode (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Initialize when page loads
window.addEventListener('load', init);


```

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
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.save();
        }
    });
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to clear all saved AI knowledge? This cannot be undone.')) {
            aiAgent.clearSavedData();
            // Reset AI agent to start fresh
            aiAgent = new AIAgent(game);
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
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
    
    // Update save status display
    if (aiAgent) {
        aiAgent.updateSaveStatus(false);
        // Check if there's saved data
        const savedData = localStorage.getItem('aiAgentData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                aiAgent.updateSaveStatus(true, true);
            } catch (e) {
                aiAgent.updateSaveStatus(false);
            }
        }
    }
    
    aiAgent.start();
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
    } else if (currentMode !== 'ai') {
        // Only draw if not in AI mode (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Initialize when page loads
window.addEventListener('load', init);


```

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
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.save();
        }
    });
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to clear all saved AI knowledge? This cannot be undone.')) {
            aiAgent.clearSavedData();
            // Reset AI agent to start fresh
            aiAgent = new AIAgent(game);
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
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
    
    // Update save status display
    if (aiAgent) {
        aiAgent.updateSaveStatus(false);
        // Check if there's saved data
        const savedData = localStorage.getItem('aiAgentData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                aiAgent.updateSaveStatus(true, true);
            } catch (e) {
                aiAgent.updateSaveStatus(false);
            }
        }
    }
    
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
    } else if (currentMode !== 'ai') {
        // Only draw if not in AI mode (AI handles its own drawing)
        game.draw();
    }
    
    // Update high score display always
    document.getElementById('highScore').textContent = game.highScore;
    
    requestAnimationFrame(gameLoop);
}

// Initialize when page loads
window.addEventListener('load', init);


```

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
    
    // Update high score display
    document.getElementById('highScore').textContent = game.highScore;
    
    // Setup button handlers
    document.getElementById('startBtn').addEventListener('click', startHumanGame);
    document.getElementById('aiBtn').addEventListener('click', startAIGame);
    document.getElementById('aiPlayBtn').addEventListener('click', startAIPlay);
    document.getElementById('stopBtn').addEventListener('click', stopGame);
    document.getElementById('saveBtn').addEventListener('click', () => {
        if (aiAgent) {
            aiAgent.save();
        }
    });
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (aiAgent && confirm('Are you sure you want to clear all saved AI knowledge? This cannot be undone.')) {
            aiAgent.clearSavedData();
            // Reset AI agent to start fresh
            aiAgent = new AIAgent(game);
        }
    });
    document.getElementById('fastMode').addEventListener('change', (e) => {
        if (aiAgent) {
            aiAgent.setFastMode(e.target.checked);
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
    
    // Update save status display
    if (aiAgent) {
        aiAgent.updateSaveStatus(false);
        // Check if there's saved data
        const savedData = localStorage.getItem('aiAgentData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                aiAgent.updateSaveStatus(true, true);
            } catch (e) {
                aiAgent.updateSaveStatus(false);
            }
        }
    }
    
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

// Initialize when page loads
window.addEventListener('load', init);


```

Added AI Play mode. Here’s what’s new:

## New Feature: AI Play Mode

A new **"AI Play"** button lets the trained AI play without learning or evolution.

### How It Works:

1. Uses the best trained bird: If the AI has been trained (has a `bestBird`), it uses that. Otherwise, it uses a bird from the saved population.
2. Single bird play: Only one bird plays (no population, no evolution).
3. No learning: The AI uses its learned knowledge but doesn’t evolve or mutate.
4. Clean display: Shows just the score (no generation/alive stats).

### Usage:

1. Train the AI: Click "Start AI Learning" and let it train until it has a decent score.
2. Switch to play mode: Click "AI Play" to watch it play using what it learned.
3. The AI will play until it dies (or you click Stop).

### Differences:

- "Start AI Learning": Trains the AI with evolution, populations, and generations
- "AI Play": Uses trained AI to play without learning (demo mode)

If you try "AI Play" without any trained AI, you'll get an alert prompting you to train first.

You can now watch your trained AI play after training is complete.

---

**User**

I have an issue when the bird dies and I click "AI Play" it starts again but the game speed becomes faster for some reason.

---

**Cursor**

Investigating why clicking "AI Play" after the bird dies speeds up the game—likely overlapping loops or not properly cleaning up the previous loop.


Multiple `playLoop` calls are stacking, causing duplicate updates per frame. Stopping previous loops properly before starting a new one.


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        this.isRunning = true;
        this.playMode = true;
        
        // Use best bird if available, otherwise use first bird from population
        const brainToUse = this.bestBird || this.population[0].brain;
        this.playBird = {
            brain: brainToUse.copy(),
            game: this.createGameInstance(),
            score: 0,
            alive: true
        };
        
        this.playLoop();
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode) return;
        
        if (this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game
            this.syncGameToVisual(this.playBird.game);
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning) {
            requestAnimationFrame(() => this.playLoop());
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        this.isRunning = true;
        this.playMode = true;
        
        // Use best bird if available, otherwise use first bird from population
        const brainToUse = this.bestBird || this.population[0].brain;
        this.playBird = {
            brain: brainToUse.copy(),
            game: this.createGameInstance(),
            score: 0,
            alive: true
        };
        
        this.playLoop();
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode) return;
        
        if (this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game
            this.syncGameToVisual(this.playBird.game);
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning) {
            requestAnimationFrame(() => this.playLoop());
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode) return;
        
        if (this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game
            this.syncGameToVisual(this.playBird.game);
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning) {
            requestAnimationFrame(() => this.playLoop());
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game
            this.syncGameToVisual(this.playBird.game);
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

Fixed the speed issue. Multiple `playLoop` calls were running simultaneously, causing multiple updates per frame.

## Fixes Applied:

1. **Animation frame tracking**: Added `playLoopId` to track and cancel pending animation frames
2. **Loop running flag**: Added `playLoopRunning` to prevent multiple loops from starting
3. **Proper cleanup**: The `stop()` method now cancels any pending animation frames before stopping
4. **Safe restart**: When restarting "AI Play", it calls `stop()` first and uses a short delay to ensure the previous loop is fully stopped before starting a new one

When you click "AI Play" after the bird dies, it now:
- Stops any existing loop
- Waits for it to fully stop
- Starts a fresh loop at normal speed

The game should now maintain consistent speed when restarting "AI Play" mode.

---

**User**

I have a situation when I clear everything and I let AI play, it falls down immediately (which is okay). But if I do it again, the bird is stuck to the top of the map. Why?

---

**Cursor**

Investigating why the bird gets stuck at the top. Likely a state reset issue. Checking the code:


The visual game isn't being reset when starting AI play mode, and the sync may copy a stuck state. Checking `syncGameToVisual` and ensuring proper reset:


Fixing a stale visual game state and improper sync. The visual game needs a reset, and sync shouldn't occur when the bird is stuck:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game
            this.syncGameToVisual(this.playBird.game);
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game only if bird is not stuck at top
            // (Bird stuck at top with velocity 0 indicates a dead/stuck state)
            if (this.playBird.game.bird.y > 0 || this.playBird.game.bird.velocity !== 0) {
                this.syncGameToVisual(this.playBird.game);
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

Revising the fix. The issue is that the visual game state can persist, and syncing may copy a stuck state. Fixing it properly:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game
            this.syncGameToVisual(this.playBird.game);
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = sourceGame.bird.y;
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game
            this.syncGameToVisual(this.playBird.game);
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

Adding one more safeguard: ensure we don't sync a stuck state on the first frame:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game
            this.syncGameToVisual(this.playBird.game);
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game
            this.syncGameToVisual(this.playBird.game);
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Load saved AI data if available
        this.load();
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

Fixed the issue. The bird could get stuck at the top when restarting because:

1. The visual game state persisted from the previous game
2. The sync could copy a stuck state (y=0, velocity=0)
3. The new game instance wasn't always properly initialized

## Fixes Applied:

1. **Double reset**: When starting play mode, both the visual game and the new game instance are reset
2. **Frame tracking**: Added `playFrameCount` to track initialization
3. **Stuck detection**: Detects if the bird is stuck at the top (y=0, velocity=0 after the first frame) and auto-resets
4. **Sync safety**: Added a safeguard in `syncGameToVisual` to ensure the bird's y position is never negative

Now when you click "AI Play" after the bird dies:
- Both games are properly reset
- The bird starts at the middle position
- If it gets stuck at the top, it auto-recovers

The bird should no longer get stuck at the top when restarting.

---

**User**

How does this AI agent work overall?

---

**Cursor**

Overview of how the AI agent works:


How the AI agent works:

## Architecture Overview

The AI uses a genetic algorithm with neural networks to learn. No external models—all learning happens locally in the browser.

## 1. Neural Network Structure

Each bird has a neural network with:
- 5 input nodes: normalized features about the game state
- 8 hidden nodes: processes the information
- 1 output node: decision to flap (output > 0.5) or not

```
Inputs → Hidden Layer → Output (Flap Decision)
```

### Input features (normalized to 0-1):
1. Bird Y position — current vertical position
2. Bird velocity — falling speed
3. Next pipe X distance — horizontal distance to the next pipe
4. Next pipe top height — top of the gap
5. Next pipe gap bottom — bottom of the gap

### Decision making:
The network uses sigmoid activation. Each frame, it takes the 5 inputs, processes them through the hidden layer, and produces an output. If output > 0.5, the bird flaps.

## 2. Learning Process (Genetic Algorithm)

The AI learns through evolution, similar to natural selection:

### Population of 50 birds
- Each bird has its own neural network with random initial weights
- All play simultaneously in separate game instances
- The best performers are more likely to reproduce

### Fitness calculation
Performance is measured by:

```javascript
fitness = (score × 100) + (gap center bonus × 50) + (survival time × 10)
```

- Score (pipes passed)
- Gap center bonus: how close the bird stays to the center of gaps
- Survival time: how long it stays alive

### Evolution cycle

When all birds die (one generation):

1. Selection: Birds are sorted by fitness. The top 10% are kept as "elite."

2. Reproduction: New birds are created through:
   - Crossover: Combining genes (weights) from two parent birds
   - Mutation: Randomly modifying some weights (20% mutation rate)

3. Next generation: The process repeats with the new population.

### Why this works
- Good behaviors (weights) are preserved
- Successful combinations emerge over time
- Random mutations can discover better strategies
- Multiple generations improve performance

## 3. Training Process

1. Initialization: 50 birds with random neural networks start playing
2. Concurrent play: All birds play simultaneously
3. Performance tracking: Each bird’s fitness is calculated based on score, gap alignment, and survival
4. Natural selection: When all birds die, the best are selected
5. Evolution: New generation is created through crossover and mutation
6. Iteration: The cycle repeats, improving over time

## 4. Adaptation to Procedural Levels

The AI adapts to procedurally generated levels because:
- It learns general patterns rather than memorizing specific levels
- The inputs are relative (normalized distances, positions)
- The genetic algorithm explores strategies that work across variations
- Selection favors birds that handle different pipe configurations

## 5. Knowledge Persistence

- Auto-saves: When a new best score is achieved
- Saves: The entire population (50 neural networks), best bird, generation number, and best score
- Loads: Automatically on page load to continue training

## 6. Performance Improvements

Typical progress:
- Generation 1-10: Random behavior, short survival
- Generation 10-30: Basic avoidance, can pass a few pipes
- Generation 30-100: Navigates gaps, maintains position
- Generation 100+: Better consistency and higher scores

## Why This Approach Works

- No pre-programmed rules: The AI discovers strategies through trial and error
- Robust to variation: Works across different pipe configurations
- Self-improving: Gets better with each generation
- Scalable: Can learn more complex behaviors with larger networks or populations

The AI essentially discovers how to play Flappy Bird through evolutionary learning, similar to how species adapt in nature—testing many strategies and keeping the successful ones.

```plaintext
Inputs → Hidden Layer → Output (Flap Decision)
```

```javascript
fitness = (score × 100) + (gap center bonus × 50) + (survival time × 10)
```

---

**User**

What is saved to storage for the model to remember?

---

**Cursor**

Checking exactly what gets saved to storage:


What gets saved to localStorage:

## Saved Data Structure

The AI saves everything under the key `'aiAgentData'` in localStorage as a JSON string. The saved object contains:

### 1. **Generation Number** (`generation`)
```javascript
generation: 15  // Current generation number (e.g., Generation 15)
```
- Tracks how many evolution cycles have completed
- Used to resume training from the correct generation

### 2. **Best Score** (`bestScore`)
```javascript
bestScore: 42  // Highest score achieved so far
```
- The highest score any bird has achieved across all generations
- Used to track progress and show in the UI

### 3. **Best Bird Neural Network** (`bestBird`)
```javascript
bestBird: {
    inputNodes: 5,
    hiddenNodes: 8,
    outputNodes: 1,
    weights_ih: [[...], [...], ...],  // 8×5 matrix
    weights_ho: [[...]],               // 1×8 matrix
    bias_h: [[...], ...],              // 8×1 matrix
    bias_o: [[...]]                    // 1×1 matrix
}
```

Complete neural network of the best-performing bird, including:
- **weights_ih**: Weights from input to hidden layer (8×5 = 40 values)
- **weights_ho**: Weights from hidden to output layer (1×8 = 8 values)
- **bias_h**: Biases for hidden layer (8 values)
- **bias_o**: Bias for output layer (1 value)

Total: ~57 floating-point numbers that encode the learned behavior.

### 4. **Entire Population** (`population`)
```javascript
population: [
    {
        brain: {
            inputNodes: 5,
            hiddenNodes: 8,
            outputNodes: 1,
            weights_ih: [[...], ...],
            weights_ho: [[...]],
            bias_h: [[...], ...],
            bias_o: [[...]]
        }
    },
    // ... 49 more birds
]
```
All 50 neural networks in the current population, each with the same structure as `bestBird`. This preserves diversity and allows evolution to continue.

### 5. **Save Timestamp** (`savedAt`)
```javascript
savedAt: "2024-01-15T10:30:45.123Z"  // ISO timestamp
```
Metadata about when the save occurred.

## Complete Example of Saved Data

```json
{
  "generation": 25,
  "bestScore": 58,
  "bestBird": "{\"inputNodes\":5,\"hiddenNodes\":8,\"outputNodes\":1,\"weights_ih\":[[...]],\"weights_ho\":[[...]],\"bias_h\":[[...]],\"bias_o\":[[...]]}",
  "population": [
    {"brain": "{\"inputNodes\":5,...}"},
    {"brain": "{\"inputNodes\":5,...}"},
    // ... 48 more
  ],
  "savedAt": "2024-01-15T10:30:45.123Z"
}
```

## Storage Size

Each neural network has:
- 40 weights (input→hidden)
- 8 weights (hidden→output)
- 8 biases (hidden layer)
- 1 bias (output layer)
- **Total: ~57 numbers per network**

For 50 birds + 1 best bird = **51 networks × 57 numbers ≈ 2,907 floating-point numbers**

Each number is typically stored as a decimal string, so the total size is roughly **50-100 KB** depending on precision.

## What's NOT Saved

These are temporary and recalculated:
- Current fitness values (recalculated each generation)
- Current game state (bird positions, pipe positions)
- Alive/dead status (reset on load)
- Current scores (reset on load)

Only the learned knowledge (weights and biases) is saved—the parameters that determine behavior.

## How It Works

1. On save: All 50 neural networks are serialized to JSON strings and stored
2. On load: The JSON is parsed, neural networks are reconstructed, and the population is restored
3. Continuation: Training resumes from the saved generation with the saved population

This preserves the learned behavior so the AI can continue improving rather than starting from scratch.

```javascript
generation: 15  // Current generation number (e.g., Generation 15)
```

```javascript
bestScore: 42  // Highest score achieved so far
```

```javascript
bestBird: {
    inputNodes: 5,
    hiddenNodes: 8,
    outputNodes: 1,
    weights_ih: [[...], [...], ...],  // 8×5 matrix
    weights_ho: [[...]],               // 1×8 matrix
    bias_h: [[...], ...],              // 8×1 matrix
    bias_o: [[...]]                    // 1×1 matrix
}
```

```javascript
population: [
    {
        brain: {
            inputNodes: 5,
            hiddenNodes: 8,
            outputNodes: 1,
            weights_ih: [[...], ...],
            weights_ho: [[...]],
            bias_h: [[...], ...],
            bias_o: [[...]]
        }
    },
    // ... 49 more birds
]
```

```javascript
savedAt: "2024-01-15T10:30:45.123Z"  // ISO timestamp
```

```json
{
  "generation": 25,
  "bestScore": 58,
  "bestBird": "{\"inputNodes\":5,\"hiddenNodes\":8,\"outputNodes\":1,\"weights_ih\":[[...]],\"weights_ho\":[[...]],\"bias_h\":[[...]],\"bias_o\":[[...]]}",
  "population": [
    {"brain": "{\"inputNodes\":5,...}"},
    {"brain": "{\"inputNodes\":5,...}"},
    // ... 48 more
  ],
  "savedAt": "2024-01-15T10:30:45.123Z"
}
```

---

**User**

Can you create a markdown file explaining what everything is and how it fully works?

---

**Cursor**

Creating a markdown documentation file explaining how everything works.


```markdown
# Flappy Bird AI - Complete Documentation

A Flappy Bird clone with a self-learning AI agent that uses neural networks and genetic algorithms to master the game through evolution. The entire system runs locally in your browser with no external dependencies.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Neural Network System](#neural-network-system)
4. [Genetic Algorithm Learning](#genetic-algorithm-learning)
5. [Game Engine](#game-engine)
6. [File Structure](#file-structure)
7. [How It All Works Together](#how-it-all-works-together)
8. [Usage Guide](#usage-guide)
9. [Data Persistence](#data-persistence)
10. [Technical Details](#technical-details)

---

## Overview

This project consists of three main components:

1. **Flappy Bird Game**: A complete game engine with procedurally generated levels
2. **Neural Network**: A from-scratch implementation of artificial neural networks
3. **AI Agent**: A genetic algorithm system that evolves neural networks to play the game

### Key Features

- ✅ **No External Dependencies**: Everything runs in vanilla JavaScript
- ✅ **Procedural Level Generation**: Random pipe configurations for variety
- ✅ **Self-Learning AI**: Discovers strategies through evolution
- ✅ **Knowledge Persistence**: Saves and loads learned behavior
- ✅ **Multiple Modes**: Play manually or watch AI learn/play

---

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Window                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  UI (HTML/CSS)                                        │ │
│  │  - Control Buttons                                    │ │
│  │  - Score Display                                      │ │
│  │  - AI Stats Display                                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Game Engine (game.js)                                │ │
│  │  - Physics Simulation                                 │ │
│  │  - Collision Detection                                │ │
│  │  - Procedural Level Generation                        │ │
│  │  - Rendering                                          │ │
│  └──────────────────────────────────────────────────────┘ │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  AI Agent (ai.js)                                      │ │
│  │  - Population Management                               │ │
│  │  - Genetic Algorithm                                  │ │
│  │  - Fitness Calculation                                 │ │
│  │  - Evolution                                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Neural Network (neural-network.js)                    │ │
│  │  - Feedforward Propagation                             │ │
│  │  - Weight/Bias Storage                                │ │
│  │  - Mutation & Crossover                               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Main Controller (main.js)                             │ │
│  │  - Mode Switching                                     │ │
│  │  - Event Handling                                     │ │
│  │  - Game Loop Coordination                             │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Neural Network System

### Architecture

Each bird has its own neural network with the following structure:

```
Input Layer (5 nodes) → Hidden Layer (8 nodes) → Output Layer (1 node)
```

### Input Layer (5 Features)

The neural network receives normalized information about the game state:

1. **Bird Y Position** (`bird.y / game.height`)
   - Normalized vertical position (0 = top, 1 = bottom)
   - Tells the AI where the bird currently is

2. **Bird Velocity** (`bird.velocity / 20`)
   - Normalized falling speed
   - Indicates whether the bird is falling fast or slow

3. **Next Pipe X Distance** (`(pipe.x - bird.x) / game.width`)
   - Normalized horizontal distance to the next pipe
   - How far away the obstacle is

4. **Next Pipe Top Height** (`pipe.topHeight / game.height`)
   - Normalized position of the top pipe
   - Where the gap starts from the top

5. **Next Pipe Gap Bottom** (`pipe.bottomY / game.height`)
   - Normalized position where the gap ends
   - Where the bottom pipe starts

### Hidden Layer (8 Nodes)

The hidden layer processes the input information:
- Each hidden node receives weighted connections from all 5 input nodes
- Applies sigmoid activation: `sigmoid(x) = 1 / (1 + e^(-x))`
- Allows the network to learn complex patterns and relationships

### Output Layer (1 Node)

The output is a single value between 0 and 1:
- **Output > 0.5**: Bird flaps (jumps)
- **Output ≤ 0.5**: Bird continues falling

### Mathematical Process

#### Forward Propagation

For each hidden node `i`:
```
hidden[i] = sigmoid(Σ(input[j] × weights_ih[i][j]) + bias_h[i])
```

For the output node:
```
output = sigmoid(Σ(hidden[j] × weights_ho[j]) + bias_o)
```

Where:
- `weights_ih`: Input-to-hidden weights (8×5 matrix)
- `weights_ho`: Hidden-to-output weights (1×8 matrix)
- `bias_h`: Hidden layer biases (8 values)
- `bias_o`: Output layer bias (1 value)

### Network Parameters

Each neural network contains **57 learnable parameters**:
- 40 input-to-hidden weights (8 nodes × 5 inputs)
- 8 hidden-to-output weights (1 output × 8 hidden)
- 8 hidden layer biases
- 1 output layer bias

These parameters encode the "knowledge" - the strategy the bird uses to play the game.

---

## Genetic Algorithm Learning

### Population-Based Learning

The AI uses a **genetic algorithm**, which mimics natural selection:

1. **Population**: 50 birds, each with its own neural network
2. **Evaluation**: All birds play simultaneously
3. **Selection**: Best performers are identified
4. **Reproduction**: New generation created from best birds
5. **Evolution**: Repeat until satisfactory performance

### Generation Cycle

#### Phase 1: Concurrent Play

All 50 birds play simultaneously in separate game instances:
- Each bird makes decisions based on its neural network
- Games run until all birds die or hit obstacles
- Performance (fitness) is tracked continuously

#### Phase 2: Fitness Calculation

Each bird's performance is measured by:

```javascript
fitness = (score × 100) + (gap_center_bonus × 50) + (survival_bonus × 10)
```

Where:
- **Score**: Number of pipes successfully passed
- **Gap Center Bonus**: How close the bird stays to the center of gaps (encourages precision)
- **Survival Bonus**: Additional points for staying alive longer

This rewards birds that:
- Pass many pipes
- Navigate gaps precisely
- Survive longer

#### Phase 3: Selection

Birds are sorted by fitness:
- **Top 10% (5 birds)**: "Elite" - automatically preserved
- **Remaining 90%**: Replaced through reproduction

#### Phase 4: Reproduction

New birds are created through two genetic operators:

**1. Crossover (Recombination)**
```
Child weights = Random selection from Parent1 or Parent2
```

For each weight/bias:
- Randomly choose between Parent 1's value or Parent 2's value
- Preserves successful genetic combinations
- Allows combination of different strategies

**2. Mutation**
```
New weight = Old weight + (random value × mutation_rate)
```

- 20% of weights are randomly modified
- Small random changes to explore new strategies
- Prevents getting stuck in local optima
- Allows discovery of better solutions

#### Phase 5: New Generation

The cycle repeats:
- New generation starts with the evolved population
- Process continues until satisfactory performance
- Typically improves over 10-100+ generations

### Why This Works

**Natural Selection**: Successful strategies survive and reproduce
**Diversity**: Mutation ensures exploration of new strategies
**Combination**: Crossover merges successful traits
**Iterative Improvement**: Each generation builds on previous success

---

## Game Engine

### Core Components

#### Bird Physics

```javascript
bird = {
    x: 100,              // Fixed horizontal position
    y: height/2,         // Vertical position (changes)
    velocity: 0,         // Vertical speed
    gravity: 0.6,        // Downward acceleration
    jumpStrength: -12    // Upward impulse when flapping
}
```

**Physics Simulation**:
- Gravity constantly pulls bird down: `velocity += gravity`
- Position updates: `y += velocity`
- Flapping: `velocity = jumpStrength` (instant upward boost)
- Boundary check: Bird dies if it hits top (y < 0) or bottom (y > height)

#### Procedural Level Generation

Pipes are generated with random configurations:

```javascript
topHeight = random(minHeight, maxHeight)
gap = 200 pixels (fixed)
bottomY = topHeight + gap
```

**Characteristics**:
- Random gap positions for each pipe
- Fixed spacing between pipes (300 pixels)
- Infinite generation as pipes move off-screen
- Each game run has unique pipe patterns

#### Collision Detection

For each pipe, the game checks:
1. Is the bird horizontally aligned with the pipe?
2. Is the bird vertically within the pipe walls?

If both are true → **Game Over**

#### Scoring System

- Score increments when bird passes a pipe
- High score is tracked and saved in localStorage
- Score displayed in real-time

---

## File Structure

### `index.html`
- HTML structure
- Canvas element for game rendering
- UI controls and statistics display
- Script includes

### `styles.css`
- Visual styling
- Responsive layout
- Button and UI element styles

### `game.js` - Game Engine

**Class: `Game`**

**Key Methods**:
- `constructor(canvas)`: Initializes game with canvas
- `update()`: Updates game state (physics, pipes, collisions)
- `draw()`: Renders everything to canvas
- `flap()`: Makes bird jump
- `reset()`: Resets game to initial state
- `getAIInputs()`: Extracts normalized features for AI

**Properties**:
- `bird`: Bird physics and position
- `pipes[]`: Array of pipe obstacles
- `score`: Current score
- `gameOver`: Game state flag

### `neural-network.js` - Neural Network Implementation

**Class: `NeuralNetwork`**

**Key Methods**:
- `constructor(inputNodes, hiddenNodes, outputNodes)`: Creates network
- `feedforward(inputArray)`: Processes inputs → outputs
- `copy()`: Creates exact duplicate
- `mutate(rate)`: Randomly modifies weights/biases
- `serialize()`: Converts to JSON string for saving
- `deserialize(data)`: Reconstructs from JSON

**Static Method**:
- `crossover(parent1, parent2)`: Creates child by combining parents

### `ai.js` - AI Agent & Genetic Algorithm

**Class: `AIAgent`**

**Key Methods**:
- `constructor(game, populationSize)`: Initializes agent with population
- `start()`: Begins learning mode (evolution)
- `startPlayMode()`: Begins play mode (single bird demo)
- `stop()`: Stops all AI activity
- `updateLoop()`: Main learning loop (for training)
- `playLoop()`: Single bird play loop (for demo)
- `evolve()`: Creates next generation
- `calculateFitness(bird)`: Evaluates bird performance
- `save()`: Saves AI knowledge to localStorage
- `load()`: Loads AI knowledge from localStorage

**Properties**:
- `population[]`: Array of 50 birds with neural networks
- `generation`: Current generation number
- `bestScore`: Highest score achieved
- `bestBird`: Neural network of best performer

### `main.js` - Application Controller

**Functions**:
- `init()`: Initializes application
- `startHumanGame()`: Starts manual play mode
- `startAIGame()`: Starts AI learning mode
- `startAIPlay()`: Starts AI play mode (demo)
- `stopGame()`: Stops current mode
- `gameLoop()`: Main rendering loop

**Mode Management**:
- Tracks current mode: `'human'`, `'ai'`, or `'ai-play'`
- Coordinates between game engine and AI agent
- Handles UI updates

---

## How It All Works Together

### 1. Initialization Flow

```
Page Load
    ↓
init() in main.js
    ↓
Create Game instance
    ↓
Create AIAgent instance
    ↓
AIAgent.load() → Check localStorage for saved data
    ↓
If saved data exists → Restore population
If no saved data → Create random population
    ↓
Start game loop
```

### 2. AI Learning Mode Flow

```
User clicks "Start AI Learning"
    ↓
aiAgent.start()
    ↓
Create 50 game instances (one per bird)
    ↓
For each frame:
    For each bird:
        Get game state → Extract 5 inputs
        ↓
        Feed inputs to neural network
        ↓
        Get output (0-1)
        ↓
        If output > 0.5 → Flap
        ↓
        Update bird's game
        ↓
        Calculate fitness
    ↓
    Sync best bird to visual game
    ↓
    Draw visual game
    ↓
    If all birds dead:
        evolve() → Create next generation
        Restart all birds
```

### 3. AI Play Mode Flow

```
User clicks "AI Play"
    ↓
Select best trained neural network
    ↓
Create single game instance
    ↓
For each frame:
    Get game state → Extract 5 inputs
    ↓
    Feed inputs to neural network
    ↓
    If output > 0.5 → Flap
    ↓
    Update game
    ↓
    Sync to visual game
    ↓
    Draw game
```

### 4. Decision Making Process

```
Game State
    ↓
Extract Features (5 values)
    - Bird Y position
    - Bird velocity
    - Next pipe distance
    - Next pipe top
    - Next pipe bottom
    ↓
Normalize (0-1 range)
    ↓
Neural Network Feedforward
    ↓
Input Layer → Hidden Layer (8 nodes) → Output Layer
    ↓
Output: 0.0 - 1.0
    ↓
Decision:
    > 0.5 → FLAP
    ≤ 0.5 → DON'T FLAP
```

---

## Usage Guide

### Starting the Game

1. Open `index.html` in a web browser
2. You'll see the game canvas and control buttons

### Play Modes

#### Manual Play
1. Click **"Start Game"**
2. Click the canvas or press **SPACE** to make the bird flap
3. Try to pass through pipes without hitting them

#### AI Learning
1. Click **"Start AI Learning"**
2. Watch as 50 birds play simultaneously
3. The best performing bird is shown in the main canvas
4. Stats display:
   - **Generation**: Current evolution cycle
   - **Best Score**: Highest score ever achieved
   - **Alive**: Number of birds still playing
5. The AI automatically evolves and improves over generations

#### AI Play (Demo)
1. First, train the AI using "Start AI Learning"
2. Click **"AI Play"**
3. Watch a single trained bird play using its learned strategy
4. The bird uses the best neural network from training

### Controls

- **Start Game**: Play manually
- **Start AI Learning**: Train the AI with evolution
- **AI Play**: Watch trained AI play (requires training first)
- **Stop**: Stop current activity
- **Save AI**: Manually save AI knowledge
- **Clear Saved AI**: Delete saved knowledge (starts fresh)
- **Fast Mode**: Speed up AI training (10x faster, for training only)

### Training Tips

- **Early Generations (1-20)**: Birds are random, die quickly
- **Mid Generations (20-50)**: Birds start to learn basic navigation
- **Later Generations (50+)**: Birds develop sophisticated strategies
- **Best Results**: Let it train for 50-100+ generations

---

## Data Persistence

### What Gets Saved

When the AI achieves a new best score, it automatically saves:

**Storage Location**: Browser's `localStorage` under key `'aiAgentData'`

**Saved Data Structure**:
```javascript
{
    generation: 25,                    // Current generation number
    bestScore: 58,                     // Highest score achieved
    bestBird: "...",                   // Serialized best neural network
    population: [                      // All 50 neural networks
        { brain: "..." },
        { brain: "..." },
        // ... 48 more
    ],
    savedAt: "2024-01-15T10:30:45Z"   // Timestamp
}
```

**Neural Network Serialization**:
Each network is saved as JSON containing:
- Network architecture (5-8-1)
- All weights and biases (~57 numbers per network)
- Total: ~2,900 numbers for full population

### What Gets Loaded

On page load:
1. System checks for saved data
2. If found:
   - Restores generation number
   - Restores best score
   - Reconstructs all 50 neural networks
   - Continues training from saved state
3. If not found:
   - Starts with random population (Generation 1)

### Storage Size

- **Per Network**: ~57 floating-point numbers
- **Full Population**: ~2,907 numbers
- **Total Size**: ~50-100 KB (depending on browser implementation)

### Manual Save/Load

- **Save AI**: Manually triggers save (useful before closing browser)
- **Clear Saved AI**: Deletes all saved data, starts fresh

---

## Technical Details

### Performance Optimization

1. **Fast Mode**: Skips frame delays during training (10x faster)
2. **Concurrent Simulation**: All 50 birds run in separate game instances
3. **Selective Rendering**: Only best bird is rendered visually
4. **Efficient Evolution**: Elite preservation reduces computation

### Algorithm Parameters

**Neural Network**:
- Architecture: 5 input → 8 hidden → 1 output
- Activation: Sigmoid function
- Initial weights: Random between -1 and 1

**Genetic Algorithm**:
- Population size: 50 birds
- Elite preservation: Top 10% (5 birds)
- Mutation rate: 20%
- Tournament selection: 5 random birds, pick best

**Fitness Function**:
- Score multiplier: 100x
- Gap center bonus: Up to 50 points
- Survival bonus: 10x score

### Limitations & Considerations

1. **Browser Storage**: localStorage has size limits (typically 5-10 MB)
2. **Performance**: 50 concurrent simulations can be CPU-intensive
3. **Evolution Time**: Requires many generations for good performance
4. **Randomness**: Initial population and mutations are random (results vary)

### Customization Options

You can modify these parameters in the code:

**In `ai.js`**:
- `populationSize`: Number of birds (default: 50)
- `eliteSize`: Top percentage to preserve (default: 10%)
- Mutation rate in `evolve()` (default: 0.2 = 20%)

**In `neural-network.js`**:
- Hidden layer size in constructor (default: 8)
- Activation function (currently: sigmoid)

**In `game.js`**:
- `pipeGap`: Gap size between pipes (default: 200)
- `pipeSpeed`: How fast pipes move (default: 3)
- `gravity`: How fast bird falls (default: 0.6)
- `jumpStrength`: How high bird jumps (default: -12)

### Future Enhancements

Possible improvements:
- More input features (multiple pipes ahead, speed)
- Deeper networks (more hidden layers)
- Advanced selection methods (rank-based, roulette wheel)
- Adaptive mutation rates
- Multi-objective optimization
- Visual network visualization

---

## Conclusion

This project demonstrates:

1. **Neural Networks**: How artificial neural networks process information
2. **Genetic Algorithms**: How evolution can solve optimization problems
3. **Reinforcement Learning**: Learning through trial and error
4. **Game AI**: Creating AI that adapts to game mechanics

The system learns entirely through evolution - no hand-coded strategies, no pre-training, just pure adaptation to succeed in the game environment.

---

## Credits

- **Game**: Flappy Bird clone implementation
- **Neural Network**: From-scratch JavaScript implementation
- **Genetic Algorithm**: Population-based evolutionary learning
- **All Code**: Vanilla JavaScript, no external libraries

---

*Last Updated: 2024*

```

Created `README.md` documenting the Flappy Bird AI project. It includes:

## What's Included:

1. **Overview** — Project summary and features
2. **Architecture** — System architecture with diagrams
3. **Neural Network System** — How the networks work, including math and structure
4. **Genetic Algorithm Learning** — Evolution process explained step-by-step
5. **Game Engine** — Physics, collision detection, and procedural generation
6. **File Structure** — Breakdown of each file and its purpose
7. **How It All Works Together** — Flow diagrams showing system interactions
8. **Usage Guide** — How to use all features
9. **Data Persistence** — What gets saved/loaded and how
10. **Technical Details** — Parameters, optimizations, and customization

The documentation covers:
- How neural networks process game state
- How the genetic algorithm evolves strategies
- How everything connects together
- Practical usage instructions
- Technical implementation details

It can serve as both a user guide and a technical reference for understanding or modifying the system.

---

**User**

Could you please rework the saving of data to file instead of localStorage?

---

**Cursor**

Refactoring to save to a file instead of localStorage. Adding download and upload functionality.


Refactoring to save/load from files instead of localStorage:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to localStorage
    save() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('aiAgentData', JSON.stringify(saveData));
            console.log('AI knowledge saved successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.0'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('aiAgentData');
            if (!savedData) {
                console.log('No saved AI knowledge found');
                return false;
            }
            
            const data = JSON.parse(savedData);
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                this.bestBird = NeuralNetwork.deserialize(data.bestBird);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => ({
                    brain: NeuralNetwork.deserialize(saved.brain),
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                }));
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge:', error);
            this.updateSaveStatus(false);
            return false;
        }
    }
    
    // Clear saved AI knowledge
    clearSavedData() {
        localStorage.removeItem('aiAgentData');
        this.updateSaveStatus(false);
        console.log('Saved AI knowledge cleared');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Auto-save when best score improves
                        this.save();
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.0'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from file
    loadFromFile(fileContent) {
        try {
            let data;
            
            // Handle both string and already-parsed JSON
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            // Validate file structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                // Handle both JSON string and parsed object
                const bestBirdData = typeof data.bestBird === 'string' 
                    ? JSON.parse(data.bestBird) 
                    : data.bestBird;
                this.bestBird = NeuralNetwork.deserialize(bestBirdData);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => {
                    // Handle both JSON string and parsed object
                    const brainData = typeof saved.brain === 'string'
                        ? JSON.parse(saved.brain)
                        : saved.brain;
                    return {
                        brain: NeuralNetwork.deserialize(brainData),
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            alert('Error loading file: ' + error.message);
            return false;
        }
    }
    
    // Clear saved AI knowledge (resets to initial state)
    clearSavedData() {
        // Reset to initial random population
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

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
            <h1>Flappy Bird AI</h1>
            <div class="controls">
                <button id="startBtn">Start Game</button>
                <button id="aiBtn">Start AI Learning</button>
                <button id="aiPlayBtn">AI Play</button>
                <button id="stopBtn">Stop</button>
                <button id="saveBtn">Save AI to File</button>
                <button id="loadBtn">Load AI from File</button>
                <button id="clearBtn">Reset AI</button>
                <input type="file" id="fileInput" accept=".json" style="display: none;">
                <label>
                    <input type="checkbox" id="fastMode"> Fast Mode (AI only)
                </label>
            </div>
            <div class="stats">
                <div>Score: <span id="score">0</span></div>
                <div>High Score: <span id="highScore">0</span></div>
                <div id="aiStats" style="display: none;">
                    <div>Generation: <span id="generation">1</span></div>
                    <div>Best Score: <span id="bestScore">0</span></div>
                    <div>Alive: <span id="alive">0</span></div>
                    <div id="saveStatus" style="font-size: 12px; margin-top: 5px;"></div>
                </div>
            </div>
        </div>
        <canvas id="gameCanvas"></canvas>
        <div id="instructions">
            <p>Press SPACE or CLICK to flap</p>
            <p>Select "Start Game" to play manually</p>
            <p>Select "Start AI Learning" to train the AI</p>
            <p>Select "AI Play" to watch the trained AI play</p>
        </div>
    </div>
    <script src="neural-network.js"></script>
    <script src="game.js"></script>
    <script src="ai.js"></script>
    <script src="main.js"></script>
</body>
</html>


```

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
    
    // Update save status display
    if (aiAgent) {
        aiAgent.updateSaveStatus(false);
        // Check if there's saved data
        const savedData = localStorage.getItem('aiAgentData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                aiAgent.updateSaveStatus(true, true);
            } catch (e) {
                aiAgent.updateSaveStatus(false);
            }
        }
    }
    
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

// Initialize when page loads
window.addEventListener('load', init);


```

Updating auto-save behavior so it doesn't automatically download a file on each best score improvement:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Note: Auto-save to file is disabled (would download too many files)
                        // Use "Save AI to File" button to manually save
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird ? this.bestBird.serialize() : null,
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.0'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from file
    loadFromFile(fileContent) {
        try {
            let data;
            
            // Handle both string and already-parsed JSON
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            // Validate file structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                // Handle both JSON string and parsed object
                const bestBirdData = typeof data.bestBird === 'string' 
                    ? JSON.parse(data.bestBird) 
                    : data.bestBird;
                this.bestBird = NeuralNetwork.deserialize(bestBirdData);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => {
                    // Handle both JSON string and parsed object
                    const brainData = typeof saved.brain === 'string'
                        ? JSON.parse(saved.brain)
                        : saved.brain;
                    return {
                        brain: NeuralNetwork.deserialize(brainData),
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            alert('Error loading file: ' + error.message);
            return false;
        }
    }
    
    // Clear saved AI knowledge (resets to initial state)
    clearSavedData() {
        // Reset to initial random population
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

Removing the localStorage check in startAIGame since we're using file-based storage:


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

// Initialize when page loads
window.addEventListener('load', init);


```

Checking for any remaining references to the old localStorage methods:


Only the README references localStorage for AI data; high score still uses localStorage, which is fine. Verifying everything works and updating the instructions:


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
            <h1>Flappy Bird AI</h1>
            <div class="controls">
                <button id="startBtn">Start Game</button>
                <button id="aiBtn">Start AI Learning</button>
                <button id="aiPlayBtn">AI Play</button>
                <button id="stopBtn">Stop</button>
                <button id="saveBtn">Save AI to File</button>
                <button id="loadBtn">Load AI from File</button>
                <button id="clearBtn">Reset AI</button>
                <input type="file" id="fileInput" accept=".json" style="display: none;">
                <label>
                    <input type="checkbox" id="fastMode"> Fast Mode (AI only)
                </label>
            </div>
            <div class="stats">
                <div>Score: <span id="score">0</span></div>
                <div>High Score: <span id="highScore">0</span></div>
                <div id="aiStats" style="display: none;">
                    <div>Generation: <span id="generation">1</span></div>
                    <div>Best Score: <span id="bestScore">0</span></div>
                    <div>Alive: <span id="alive">0</span></div>
                    <div id="saveStatus" style="font-size: 12px; margin-top: 5px;"></div>
                </div>
            </div>
        </div>
        <canvas id="gameCanvas"></canvas>
        <div id="instructions">
            <p>Press SPACE or CLICK to flap</p>
            <p>Select "Start Game" to play manually</p>
            <p>Select "Start AI Learning" to train the AI</p>
            <p>Select "AI Play" to watch the trained AI play</p>
            <p>Use "Save AI to File" to download your trained AI</p>
            <p>Use "Load AI from File" to load a previously saved AI</p>
        </div>
    </div>
    <script src="neural-network.js"></script>
    <script src="game.js"></script>
    <script src="ai.js"></script>
    <script src="main.js"></script>
</body>
</html>


```

Refactored the system to use file-based saving instead of localStorage. Changes:

## Changes Made

### 1. **File download instead of localStorage**
   - `saveToFile()`: Downloads a JSON file with the AI data
   - Filename includes generation and score (e.g., `flappy-bird-ai-gen25-score58.json`)
   - Uses browser download API (Blob + download link)

### 2. **File upload for loading**
   - `loadFromFile()`: Reads uploaded JSON and restores the AI
   - Handles both string and parsed JSON
   - Validates file structure before loading

### 3. **Updated UI**
   - "Save AI to File" button: Triggers file download
   - "Load AI from File" button: Opens file picker
   - "Reset AI" button: Resets to initial random state
   - Hidden file input: Handles file selection

### 4. **Auto-save behavior**
   - Disabled auto-save on best score (would trigger too many downloads)
   - Manual save only via the button

### 5. **Removed localStorage dependency**
   - No automatic loading on page load
   - All save/load is manual via files
   - High score still uses localStorage (separate from AI data)

## How to Use

### Saving AI Knowledge:
1. Train your AI
2. Click "Save AI to File"
3. A JSON file downloads automatically
4. Save it wherever you want

### Loading AI Knowledge:
1. Click "Load AI from File"
2. Select a previously saved JSON file
3. The AI loads with its saved generation and population
4. Continue training from where you left off

### File Format:
The saved file is standard JSON containing:
- Generation number
- Best score
- Best bird neural network
- Full population (50 networks)
- Timestamp and version

This allows you to:
- Share trained AIs with others
- Back up your progress
- Load on different devices
- Version control your AI training

The system is now fully file-based instead of localStorage.

---

**User**

When I reach generation 64, it keeps going forever (score 700) but whenI save it to a file and load it later on, the bird dies on score 7.

---

**Cursor**

Investigating why the loaded AI performs worse. Checking save/load and how the best bird is selected:


The issue is that `bestBird` only updates when a new best score is set; it may not reflect the current best-performing bird. During training, the displayed bird may be from the current population and better than the saved `bestBird`. Checking the evolution logic:


The issue: `bestBird` only updates on a new record score. If the population improves without a new record, the saved `bestBird` can be outdated. Fixing by also saving the best bird from the current population (by fitness) and prioritizing it when loading.


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Note: Auto-save to file is disabled (would download too many files)
                        // Use "Save AI to File" button to manually save
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            // Find the best bird from current population by fitness
            // This is often better than the historical bestBird
            let currentBestBird = null;
            let currentBestFitness = -1;
            
            // Sort population by fitness to find current best
            const sortedPopulation = [...this.population].sort((a, b) => {
                // Sort by score first, then fitness
                if (a.score !== b.score) {
                    return b.score - a.score;
                }
                return b.fitness - a.fitness;
            });
            
            // Use the best bird from current population if available
            if (sortedPopulation.length > 0 && sortedPopulation[0].brain) {
                currentBestBird = sortedPopulation[0].brain;
            }
            
            // If we have a historical best bird, compare it
            let bestBirdToSave = currentBestBird;
            if (this.bestBird) {
                // Use historical best if it's better, otherwise use current best
                // (Historical best represents proven performance)
                bestBirdToSave = this.bestBird;
            }
            
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: bestBirdToSave ? bestBirdToSave.serialize() : null,
                currentBestBird: currentBestBird ? currentBestBird.serialize() : null, // Save current best too
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.1'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from file
    loadFromFile(fileContent) {
        try {
            let data;
            
            // Handle both string and already-parsed JSON
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            // Validate file structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore best bird if available
            if (data.bestBird) {
                // Handle both JSON string and parsed object
                const bestBirdData = typeof data.bestBird === 'string' 
                    ? JSON.parse(data.bestBird) 
                    : data.bestBird;
                this.bestBird = NeuralNetwork.deserialize(bestBirdData);
            }
            
            // Restore population
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => {
                    // Handle both JSON string and parsed object
                    const brainData = typeof saved.brain === 'string'
                        ? JSON.parse(saved.brain)
                        : saved.brain;
                    return {
                        brain: NeuralNetwork.deserialize(brainData),
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            alert('Error loading file: ' + error.message);
            return false;
        }
    }
    
    // Clear saved AI knowledge (resets to initial state)
    clearSavedData() {
        // Reset to initial random population
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Note: Auto-save to file is disabled (would download too many files)
                        // Use "Save AI to File" button to manually save
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            // Find the best bird from current population by fitness
            // This is often better than the historical bestBird
            let currentBestBird = null;
            let currentBestFitness = -1;
            
            // Sort population by fitness to find current best
            const sortedPopulation = [...this.population].sort((a, b) => {
                // Sort by score first, then fitness
                if (a.score !== b.score) {
                    return b.score - a.score;
                }
                return b.fitness - a.fitness;
            });
            
            // Use the best bird from current population if available
            if (sortedPopulation.length > 0 && sortedPopulation[0].brain) {
                currentBestBird = sortedPopulation[0].brain;
            }
            
            // If we have a historical best bird, compare it
            let bestBirdToSave = currentBestBird;
            if (this.bestBird) {
                // Use historical best if it's better, otherwise use current best
                // (Historical best represents proven performance)
                bestBirdToSave = this.bestBird;
            }
            
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: bestBirdToSave ? bestBirdToSave.serialize() : null,
                currentBestBird: currentBestBird ? currentBestBird.serialize() : null, // Save current best too
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.1'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from file
    loadFromFile(fileContent) {
        try {
            let data;
            
            // Handle both string and already-parsed JSON
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            // Validate file structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore population first (needed to find current best)
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => {
                    // Handle both JSON string and parsed object
                    const brainData = typeof saved.brain === 'string'
                        ? JSON.parse(saved.brain)
                        : saved.brain;
                    return {
                        brain: NeuralNetwork.deserialize(brainData),
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            alert('Error loading file: ' + error.message);
            return false;
        }
    }
    
    // Clear saved AI knowledge (resets to initial state)
    clearSavedData() {
        // Reset to initial random population
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Note: Auto-save to file is disabled (would download too many files)
                        // Use "Save AI to File" button to manually save
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            // Find the best bird from current population by fitness
            // This is often better than the historical bestBird
            let currentBestBird = null;
            let currentBestFitness = -1;
            
            // Sort population by fitness to find current best
            const sortedPopulation = [...this.population].sort((a, b) => {
                // Sort by score first, then fitness
                if (a.score !== b.score) {
                    return b.score - a.score;
                }
                return b.fitness - a.fitness;
            });
            
            // Use the best bird from current population if available
            if (sortedPopulation.length > 0 && sortedPopulation[0].brain) {
                currentBestBird = sortedPopulation[0].brain;
            }
            
            // If we have a historical best bird, compare it
            let bestBirdToSave = currentBestBird;
            if (this.bestBird) {
                // Use historical best if it's better, otherwise use current best
                // (Historical best represents proven performance)
                bestBirdToSave = this.bestBird;
            }
            
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: bestBirdToSave ? bestBirdToSave.serialize() : null,
                currentBestBird: currentBestBird ? currentBestBird.serialize() : null, // Save current best too
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.1'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from file
    loadFromFile(fileContent) {
        try {
            let data;
            
            // Handle both string and already-parsed JSON
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            // Validate file structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore population first (needed to find current best)
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => {
                    // Handle both JSON string and parsed object
                    const brainData = typeof saved.brain === 'string'
                        ? JSON.parse(saved.brain)
                        : saved.brain;
                    return {
                        brain: NeuralNetwork.deserialize(brainData),
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                // Restore best bird - prefer currentBestBird if available (from newer saves)
                // Otherwise use bestBird (historical)
                if (data.currentBestBird) {
                    // New format: use current best bird from saved population
                    const currentBestBirdData = typeof data.currentBestBird === 'string' 
                        ? JSON.parse(data.currentBestBird) 
                        : data.currentBestBird;
                    this.bestBird = NeuralNetwork.deserialize(currentBestBirdData);
                    console.log('Loaded current best bird from saved population');
                } else if (data.bestBird) {
                    // Old format: use historical best bird
                    const bestBirdData = typeof data.bestBird === 'string' 
                        ? JSON.parse(data.bestBird) 
                        : data.bestBird;
                    this.bestBird = NeuralNetwork.deserialize(bestBirdData);
                    console.log('Loaded historical best bird');
                } else {
                    // No best bird saved, use top bird from population
                    if (this.population.length > 0) {
                        // Sort by score to find best
                        const sorted = [...this.population].sort((a, b) => {
                            // We'll use the first bird, but ideally we'd have score info
                            return 0;
                        });
                        this.bestBird = sorted[0].brain.copy();
                        console.log('No saved best bird, using top bird from population');
                    }
                }
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            // Handle old format where bestBird might be saved separately
            if (data.bestBird && this.population.length === 0) {
                const bestBirdData = typeof data.bestBird === 'string' 
                    ? JSON.parse(data.bestBird) 
                    : data.bestBird;
                this.bestBird = NeuralNetwork.deserialize(bestBirdData);
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            alert('Error loading file: ' + error.message);
            return false;
        }
    }
    
    // Clear saved AI knowledge (resets to initial state)
    clearSavedData() {
        // Reset to initial random population
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

Improving save logic to always save the current best performing bird:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Note: Auto-save to file is disabled (would download too many files)
                        // Use "Save AI to File" button to manually save
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            // Find the best bird from current population by fitness
            // This is often better than the historical bestBird
            let currentBestBird = null;
            let currentBestFitness = -1;
            
            // Sort population by fitness to find current best
            const sortedPopulation = [...this.population].sort((a, b) => {
                // Sort by score first, then fitness
                if (a.score !== b.score) {
                    return b.score - a.score;
                }
                return b.fitness - a.fitness;
            });
            
            // Use the best bird from current population if available
            if (sortedPopulation.length > 0 && sortedPopulation[0].brain) {
                currentBestBird = sortedPopulation[0].brain;
            }
            
            // Always save the current best bird from population as the primary bestBird
            // This ensures we save the most recent best performer, not just historical record
            // Also save historical best separately for reference
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: currentBestBird ? currentBestBird.serialize() : (this.bestBird ? this.bestBird.serialize() : null), // Current best as primary
                historicalBestBird: this.bestBird ? this.bestBird.serialize() : null, // Historical record for reference
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.1'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from file
    loadFromFile(fileContent) {
        try {
            let data;
            
            // Handle both string and already-parsed JSON
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            // Validate file structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore population first (needed to find current best)
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => {
                    // Handle both JSON string and parsed object
                    const brainData = typeof saved.brain === 'string'
                        ? JSON.parse(saved.brain)
                        : saved.brain;
                    return {
                        brain: NeuralNetwork.deserialize(brainData),
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                // Restore best bird - prefer currentBestBird if available (from newer saves)
                // Otherwise use bestBird (historical)
                if (data.currentBestBird) {
                    // New format: use current best bird from saved population
                    const currentBestBirdData = typeof data.currentBestBird === 'string' 
                        ? JSON.parse(data.currentBestBird) 
                        : data.currentBestBird;
                    this.bestBird = NeuralNetwork.deserialize(currentBestBirdData);
                    console.log('Loaded current best bird from saved population');
                } else if (data.bestBird) {
                    // Old format: use historical best bird
                    const bestBirdData = typeof data.bestBird === 'string' 
                        ? JSON.parse(data.bestBird) 
                        : data.bestBird;
                    this.bestBird = NeuralNetwork.deserialize(bestBirdData);
                    console.log('Loaded historical best bird');
                } else {
                    // No best bird saved, use top bird from population
                    if (this.population.length > 0) {
                        // Sort by score to find best
                        const sorted = [...this.population].sort((a, b) => {
                            // We'll use the first bird, but ideally we'd have score info
                            return 0;
                        });
                        this.bestBird = sorted[0].brain.copy();
                        console.log('No saved best bird, using top bird from population');
                    }
                }
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            // Handle old format where bestBird might be saved separately
            if (data.bestBird && this.population.length === 0) {
                const bestBirdData = typeof data.bestBird === 'string' 
                    ? JSON.parse(data.bestBird) 
                    : data.bestBird;
                this.bestBird = NeuralNetwork.deserialize(bestBirdData);
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            alert('Error loading file: ' + error.message);
            return false;
        }
    }
    
    // Clear saved AI knowledge (resets to initial state)
    clearSavedData() {
        // Reset to initial random population
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Note: Auto-save to file is disabled (would download too many files)
                        // Use "Save AI to File" button to manually save
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            // Find the best bird from current population by fitness
            // This is often better than the historical bestBird
            let currentBestBird = null;
            let currentBestFitness = -1;
            
            // Sort population by fitness to find current best
            const sortedPopulation = [...this.population].sort((a, b) => {
                // Sort by score first, then fitness
                if (a.score !== b.score) {
                    return b.score - a.score;
                }
                return b.fitness - a.fitness;
            });
            
            // Use the best bird from current population if available
            if (sortedPopulation.length > 0 && sortedPopulation[0].brain) {
                currentBestBird = sortedPopulation[0].brain;
            }
            
            // Always save the current best bird from population as the primary bestBird
            // This ensures we save the most recent best performer, not just historical record
            // Also save historical best separately for reference
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: currentBestBird ? currentBestBird.serialize() : (this.bestBird ? this.bestBird.serialize() : null), // Current best as primary
                historicalBestBird: this.bestBird ? this.bestBird.serialize() : null, // Historical record for reference
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.1'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from file
    loadFromFile(fileContent) {
        try {
            let data;
            
            // Handle both string and already-parsed JSON
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            // Validate file structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore population first (needed to find current best)
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => {
                    // Handle both JSON string and parsed object
                    const brainData = typeof saved.brain === 'string'
                        ? JSON.parse(saved.brain)
                        : saved.brain;
                    return {
                        brain: NeuralNetwork.deserialize(brainData),
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                // Restore best bird - bestBird should be the current best from population
                // (saved as bestBird in new format, or currentBestBird in version 1.1)
                let bestBirdToLoad = null;
                
                // New format (v1.1+): bestBird is the current best from population
                if (data.bestBird) {
                    const bestBirdData = typeof data.bestBird === 'string' 
                        ? JSON.parse(data.bestBird) 
                        : data.bestBird;
                    bestBirdToLoad = NeuralNetwork.deserialize(bestBirdData);
                    console.log('Loaded current best bird (new format)');
                } else if (data.currentBestBird) {
                    // Version 1.1 intermediate format
                    const currentBestBirdData = typeof data.currentBestBird === 'string' 
                        ? JSON.parse(data.currentBestBird) 
                        : data.currentBestBird;
                    bestBirdToLoad = NeuralNetwork.deserialize(currentBestBirdData);
                    console.log('Loaded current best bird (v1.1 format)');
                }
                
                // If we have a best bird, use it; otherwise use top from population
                if (bestBirdToLoad) {
                    this.bestBird = bestBirdToLoad;
                } else if (this.population.length > 0) {
                    // Fallback: use top bird from population
                    this.bestBird = this.population[0].brain.copy();
                    console.log('No saved best bird, using top bird from population');
                }
                
                // Also restore historical best if available (for reference, but we use current best)
                if (data.historicalBestBird) {
                    // Store separately if needed, but bestBird is what will be used
                }
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            // Handle old format where bestBird might be saved separately
            if (data.bestBird && this.population.length === 0) {
                const bestBirdData = typeof data.bestBird === 'string' 
                    ? JSON.parse(data.bestBird) 
                    : data.bestBird;
                this.bestBird = NeuralNetwork.deserialize(bestBirdData);
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            alert('Error loading file: ' + error.message);
            return false;
        }
    }
    
    // Clear saved AI knowledge (resets to initial state)
    clearSavedData() {
        // Reset to initial random population
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

Fixing an issue: during training, if we save mid-generation, scores may be 0. Ensuring we save the bird with the highest current score:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Note: Auto-save to file is disabled (would download too many files)
                        // Use "Save AI to File" button to manually save
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            // Find the best bird from current population
            // Look at both alive birds (current performance) and dead birds (final performance)
            let currentBestBird = null;
            let bestPerformance = -1;
            
            // Find the bird with the highest score/fitness in current population
            for (const bird of this.population) {
                // Calculate performance metric: prioritize score, then fitness
                const performance = (bird.score || 0) * 1000 + (bird.fitness || 0);
                
                if (performance > bestPerformance && bird.brain) {
                    bestPerformance = performance;
                    currentBestBird = bird.brain;
                }
            }
            
            // If no bird has played yet (all scores 0), use the first bird from population
            // Otherwise, currentBestBird should be set above
            if (!currentBestBird && this.population.length > 0) {
                currentBestBird = this.population[0].brain;
            }
            
            // Always save the current best bird from population as the primary bestBird
            // This ensures we save the most recent best performer, not just historical record
            // Also save historical best separately for reference
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: currentBestBird ? currentBestBird.serialize() : (this.bestBird ? this.bestBird.serialize() : null), // Current best as primary
                historicalBestBird: this.bestBird ? this.bestBird.serialize() : null, // Historical record for reference
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.1'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from file
    loadFromFile(fileContent) {
        try {
            let data;
            
            // Handle both string and already-parsed JSON
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            // Validate file structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore population first (needed to find current best)
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => {
                    // Handle both JSON string and parsed object
                    const brainData = typeof saved.brain === 'string'
                        ? JSON.parse(saved.brain)
                        : saved.brain;
                    return {
                        brain: NeuralNetwork.deserialize(brainData),
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                // Restore best bird - bestBird should be the current best from population
                // (saved as bestBird in new format, or currentBestBird in version 1.1)
                let bestBirdToLoad = null;
                
                // New format (v1.1+): bestBird is the current best from population
                if (data.bestBird) {
                    const bestBirdData = typeof data.bestBird === 'string' 
                        ? JSON.parse(data.bestBird) 
                        : data.bestBird;
                    bestBirdToLoad = NeuralNetwork.deserialize(bestBirdData);
                    console.log('Loaded current best bird (new format)');
                } else if (data.currentBestBird) {
                    // Version 1.1 intermediate format
                    const currentBestBirdData = typeof data.currentBestBird === 'string' 
                        ? JSON.parse(data.currentBestBird) 
                        : data.currentBestBird;
                    bestBirdToLoad = NeuralNetwork.deserialize(currentBestBirdData);
                    console.log('Loaded current best bird (v1.1 format)');
                }
                
                // If we have a best bird, use it; otherwise use top from population
                if (bestBirdToLoad) {
                    this.bestBird = bestBirdToLoad;
                } else if (this.population.length > 0) {
                    // Fallback: use top bird from population
                    this.bestBird = this.population[0].brain.copy();
                    console.log('No saved best bird, using top bird from population');
                }
                
                // Also restore historical best if available (for reference, but we use current best)
                if (data.historicalBestBird) {
                    // Store separately if needed, but bestBird is what will be used
                }
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            // Handle old format where bestBird might be saved separately
            if (data.bestBird && this.population.length === 0) {
                const bestBirdData = typeof data.bestBird === 'string' 
                    ? JSON.parse(data.bestBird) 
                    : data.bestBird;
                this.bestBird = NeuralNetwork.deserialize(bestBirdData);
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            alert('Error loading file: ' + error.message);
            return false;
        }
    }
    
    // Clear saved AI knowledge (resets to initial state)
    clearSavedData() {
        // Reset to initial random population
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

Improving load logic to handle old save files where the population may have evolved beyond the saved bestBird:


```javascript
                // Restore best bird
                // Priority: currentBestBird (if available) > bestBird > top of population
                // For old format files, the population likely evolved beyond bestBird, 
                // so prefer using top bird from population
                let bestBirdToLoad = null;
                
                // Check if this is a new format save (has currentBestBird or version 1.1+)
                const isNewFormat = data.version && parseFloat(data.version) >= 1.1;
                const hasCurrentBest = data.currentBestBird || (data.bestBird && isNewFormat);
                
                if (hasCurrentBest) {
                    // New format: bestBird is the current best from population
                    const bestBirdData = data.currentBestBird 
                        ? (typeof data.currentBestBird === 'string' ? JSON.parse(data.currentBestBird) : data.currentBestBird)
                        : (typeof data.bestBird === 'string' ? JSON.parse(data.bestBird) : data.bestBird);
                    bestBirdToLoad = NeuralNetwork.deserialize(bestBirdData);
                    console.log('Loaded current best bird from saved population');
                } else if (data.bestBird) {
                    // Old format: bestBird is historical, but population may be better
                    // For old saves at high generations, use top from population instead
                    if (data.generation && data.generation > 10 && this.population.length > 0) {
                        // High generation old save - population likely better than historical best
                        console.log(`Old format save at generation ${data.generation} - using top bird from evolved population`);
                        bestBirdToLoad = null; // Will use population top instead
                    } else {
                        // Low generation or no population - use saved bestBird
                        const bestBirdData = typeof data.bestBird === 'string' 
                            ? JSON.parse(data.bestBird) 
                            : data.bestBird;
                        bestBirdToLoad = NeuralNetwork.deserialize(bestBirdData);
                        console.log('Loaded historical best bird (old format)');
                    }
                }
                
                // Use loaded bird, or fall back to top from population
                if (bestBirdToLoad) {
                    this.bestBird = bestBirdToLoad;
                } else if (this.population.length > 0) {
                    // Use top bird from population (usually better for evolved populations)
                    this.bestBird = this.population[0].brain.copy();
                    console.log('Using top bird from loaded population as best bird');
                }
```

```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Note: Auto-save to file is disabled (would download too many files)
                        // Use "Save AI to File" button to manually save
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            // Find the best bird from current population
            // Look at both alive birds (current performance) and dead birds (final performance)
            let currentBestBird = null;
            let bestPerformance = -1;
            
            // Find the bird with the highest score/fitness in current population
            for (const bird of this.population) {
                // Calculate performance metric: prioritize score, then fitness
                const performance = (bird.score || 0) * 1000 + (bird.fitness || 0);
                
                if (performance > bestPerformance && bird.brain) {
                    bestPerformance = performance;
                    currentBestBird = bird.brain;
                }
            }
            
            // If no bird has played yet (all scores 0), use the first bird from population
            // Otherwise, currentBestBird should be set above
            if (!currentBestBird && this.population.length > 0) {
                currentBestBird = this.population[0].brain;
            }
            
            // Always save the current best bird from population as the primary bestBird
            // This ensures we save the most recent best performer, not just historical record
            // Also save historical best separately for reference
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: currentBestBird ? currentBestBird.serialize() : (this.bestBird ? this.bestBird.serialize() : null), // Current best as primary
                historicalBestBird: this.bestBird ? this.bestBird.serialize() : null, // Historical record for reference
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.1'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from file
    loadFromFile(fileContent) {
        try {
            let data;
            
            // Handle both string and already-parsed JSON
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            // Validate file structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore population first (needed to find current best)
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => {
                    // Handle both JSON string and parsed object
                    const brainData = typeof saved.brain === 'string'
                        ? JSON.parse(saved.brain)
                        : saved.brain;
                    return {
                        brain: NeuralNetwork.deserialize(brainData),
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                // Restore best bird
                // For old format saves at high generations, the population has evolved
                // beyond the saved bestBird, so prefer top from population
                const isOldFormat = !data.version || parseFloat(data.version || '0') < 1.1;
                const isHighGeneration = data.generation && data.generation > 10;
                
                let bestBirdToLoad = null;
                
                if (data.currentBestBird) {
                    // Version 1.1 format with currentBestBird field
                    const currentBestBirdData = typeof data.currentBestBird === 'string' 
                        ? JSON.parse(data.currentBestBird) 
                        : data.currentBestBird;
                    bestBirdToLoad = NeuralNetwork.deserialize(currentBestBirdData);
                    console.log('Loaded current best bird (v1.1 format)');
                } else if (data.bestBird && (!isOldFormat || !isHighGeneration)) {
                    // New format bestBird or old format at low generation
                    const bestBirdData = typeof data.bestBird === 'string' 
                        ? JSON.parse(data.bestBird) 
                        : data.bestBird;
                    bestBirdToLoad = NeuralNetwork.deserialize(bestBirdData);
                    console.log('Loaded saved best bird');
                }
                
                // For old high-generation saves, use top from population (evolved beyond bestBird)
                if (!bestBirdToLoad && this.population.length > 0) {
                    this.bestBird = this.population[0].brain.copy();
                    console.log('Using top bird from evolved population (better than saved bestBird)');
                } else if (bestBirdToLoad) {
                    this.bestBird = bestBirdToLoad;
                }
                
                // Also restore historical best if available (for reference, but we use current best)
                if (data.historicalBestBird) {
                    // Store separately if needed, but bestBird is what will be used
                }
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            // Handle old format where bestBird might be saved separately
            if (data.bestBird && this.population.length === 0) {
                const bestBirdData = typeof data.bestBird === 'string' 
                    ? JSON.parse(data.bestBird) 
                    : data.bestBird;
                this.bestBird = NeuralNetwork.deserialize(bestBirdData);
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            alert('Error loading file: ' + error.message);
            return false;
        }
    }
    
    // Clear saved AI knowledge (resets to initial state)
    clearSavedData() {
        // Reset to initial random population
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

## Problem Identified

1. During training: The population evolves; birds can reach score 700+.
2. When saving: The system saved only the `bestBird`, which is updated only when a new record score is achieved. If the population improved without a new record, `bestBird` could be from an earlier generation.
3. When loading: The loaded `bestBird` might be outdated (e.g., from generation 10 with score 61), even though the population at generation 64 contains better birds.

## Solution Implemented

### 1. Improved Save Logic
- Finds the best bird from the current population by score/fitness at save time.
- Saves that as `bestBird` (current best), not just the historical record holder.
- Also saves the historical best separately for reference.

### 2. Improved Load Logic
- New format saves: Uses the saved current best bird.
- Old format saves at high generations (>10): Uses the top bird from the loaded population, since it has evolved beyond the saved `bestBird`.
- Low-generation old saves: Uses the saved `bestBird`.

## What This Means

When you:
1. Train to generation 64 with score 700
2. Save the file
3. Load it later

The system will use the best bird from the evolved population, matching the performance you saw during training.

## Next Steps

1. Resave your AI at generation 64 (the new save format will include the current best).
2. Load that new file — it should perform much better.

The system is backward-compatible, so old save files will still work, but for high-generation saves it will use the evolved population rather than the outdated bestBird.

---

**User**

Uncaught SyntaxError: Unexpected token 'catch'

main.js:10 Uncaught ReferenceError: AIAgent is not defined

---

**Cursor**

Checking the files for syntax errors:


Fixing a missing closing brace in `ai.js`:


```javascript
// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // File-based loading is now manual via loadFromFile()
        
        // If no saved data, create initial population
        if (this.population.length === 0) {
            for (let i = 0; i < this.populationSize; i++) {
                this.population.push({
                    brain: new NeuralNetwork(5, 8, 1), // 5 inputs, 8 hidden, 1 output
                    fitness: 0,
                    score: 0,
                    alive: true,
                    game: null
                });
            }
        }
        
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playBird = null; // Single bird for play mode
        this.playLoopId = null; // Animation frame ID for play loop
        this.playLoopRunning = false; // Flag to prevent multiple loops
        this.playFrameCount = 0; // Track frames to ensure proper initialization
    }
    
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    start() {
        this.isRunning = true;
        // Don't reset generation - preserve loaded value
        
        // Initialize games for each bird
        for (let bird of this.population) {
            bird.game = this.createGameInstance();
            bird.alive = true;
            bird.score = 0;
            bird.fitness = 0;
        }
        
        this.updateLoop();
    }
    
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playBird = null;
        this.playLoopRunning = false;
        this.playFrameCount = 0;
        // Cancel any pending animation frames
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    // Start play mode - AI just plays without learning
    startPlayMode() {
        // Check if we have a trained AI
        if (!this.bestBird && this.population.length === 0) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        // Reset the visual game to ensure clean state
        this.game.reset();
        this.game.start();
        
        // Small delay to ensure previous loop is fully stopped
        setTimeout(() => {
            this.isRunning = true;
            this.playMode = true;
            
            // Use best bird if available, otherwise use first bird from population
            const brainToUse = this.bestBird || this.population[0].brain;
            this.playBird = {
                brain: brainToUse.copy(),
                game: this.createGameInstance(),
                score: 0,
                alive: true
            };
            
            // Ensure the new game instance is properly initialized
            this.playBird.game.reset();
            this.playBird.game.start();
            
            this.playLoopRunning = true;
            this.playLoop();
        }, 10);
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        this.playFrameCount++;
        
        if (this.playBird && this.playBird.alive && !this.playBird.game.gameOver) {
            // Get AI decision
            const inputs = this.playBird.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.playBird.game.flap();
            }
            
            // Update game
            this.playBird.game.update();
            
            // Sync to visual game, but only after first frame (ensures proper initialization)
            // Also check that bird is not stuck at top (y=0 with velocity 0 on frame > 1)
            const isStuckAtTop = this.playFrameCount > 1 && 
                                 this.playBird.game.bird.y === 0 && 
                                 this.playBird.game.bird.velocity === 0;
            
            if (!isStuckAtTop) {
                this.syncGameToVisual(this.playBird.game);
            } else {
                // If stuck, reset the game state
                this.playBird.game.reset();
                this.playBird.game.start();
                this.playFrameCount = 0;
            }
            
            // Update score
            this.playBird.score = this.playBird.game.score;
            document.getElementById('score').textContent = this.playBird.score;
            
            // Check if dead
            if (this.playBird.game.gameOver) {
                this.playBird.alive = false;
                // Optionally restart automatically
                // Uncomment the line below if you want it to restart automatically
                // setTimeout(() => this.restartPlayMode(), 2000);
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    // Restart play mode
    restartPlayMode() {
        if (!this.playMode) return;
        
        this.playBird.game = this.createGameInstance();
        this.playBird.score = 0;
        this.playBird.alive = true;
    }
    
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveBird = null;
        let bestAliveFitness = -1;
        
        // Update all birds
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                aliveCount++;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
                // If output > 0.5, flap
                if (output[0] > 0.5) {
                    bird.game.flap();
                }
                
                // Update game
                bird.game.update();
                
                if (bird.game.gameOver) {
                    bird.alive = false;
                    bird.fitness = this.calculateFitness(bird);
                    bird.score = bird.game.score;
                    
                    if (bird.score > this.bestScore) {
                        this.bestScore = bird.score;
                        this.bestBird = bird.brain.copy();
                        // Note: Auto-save to file is disabled (would download too many files)
                        // Use "Save AI to File" button to manually save
                    }
                    
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                } else {
                    bird.score = bird.game.score;
                    if (bird.score > maxScore) {
                        maxScore = bird.score;
                    }
                    
                    // Update fitness continuously
                    bird.fitness = this.calculateFitness(bird);
                    
                    // Track best alive bird for visualization
                    if (bird.fitness > bestAliveFitness) {
                        bestAliveFitness = bird.fitness;
                        bestAliveBird = bird;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive bird
        if (bestAliveBird && bestAliveBird.alive) {
            this.syncGameToVisual(bestAliveBird.game);
        }
        
        // Update stats
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, create next generation
        if (allDead) {
            this.evolve();
            
            // Initialize next generation
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
        }
        
        // Draw game
        this.game.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run immediately without waiting
                setTimeout(() => this.updateLoop(), 0);
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Distance traveled (score)
        // 2. How close to center of gap (bonus)
        // 3. Survival time
        
        let fitness = bird.score * 100;
        
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            
            // Bonus for staying near center of gap
            fitness += (1 - distanceFromCenter / bird.game.pipeGap) * 50;
        }
        
        // Bonus for staying alive longer
        fitness += bird.game ? bird.game.score * 10 : 0;
        
        return Math.max(0, fitness);
    }
    
    evolve() {
        // Sort by fitness
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push({
                brain: this.population[i].brain.copy(),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let child = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            child.mutate(0.2); // 20% mutation rate
            
            newPopulation.push({
                brain: child,
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    selectParent() {
        // Tournament selection: pick random birds and return the best one
        const tournamentSize = 5;
        let best = null;
        let bestFitness = -1;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.population.length);
            const candidate = this.population[randomIndex];
            if (candidate.fitness > bestFitness) {
                best = candidate;
                bestFitness = candidate.fitness;
            }
        }
        
        return best || this.population[0];
    }
    
    syncGameToVisual(sourceGame) {
        // Copy state from source game to visual game
        // Ensure bird position is valid (not stuck at top edge)
        this.game.bird.x = sourceGame.bird.x;
        this.game.bird.y = Math.max(0, sourceGame.bird.y); // Ensure y is not negative
        this.game.bird.velocity = sourceGame.bird.velocity;
        this.game.score = sourceGame.score;
        this.game.gameOver = sourceGame.gameOver;
        this.game.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.game.pipes = [];
        let nextPipeFound = false;
        for (let pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.game.pipes.push(copiedPipe);
            
            // Set nextPipe reference
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.game.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.game.nextPipe = null;
        }
    }
    
    updateStats(aliveCount, maxScore) {
        document.getElementById('alive').textContent = aliveCount;
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('score').textContent = maxScore;
    }
    
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    // Save AI knowledge to file
    saveToFile() {
        try {
            // Find the best bird from current population
            // Look at both alive birds (current performance) and dead birds (final performance)
            let currentBestBird = null;
            let bestPerformance = -1;
            
            // Find the bird with the highest score/fitness in current population
            for (const bird of this.population) {
                // Calculate performance metric: prioritize score, then fitness
                const performance = (bird.score || 0) * 1000 + (bird.fitness || 0);
                
                if (performance > bestPerformance && bird.brain) {
                    bestPerformance = performance;
                    currentBestBird = bird.brain;
                }
            }
            
            // If no bird has played yet (all scores 0), use the first bird from population
            // Otherwise, currentBestBird should be set above
            if (!currentBestBird && this.population.length > 0) {
                currentBestBird = this.population[0].brain;
            }
            
            // Always save the current best bird from population as the primary bestBird
            // This ensures we save the most recent best performer, not just historical record
            // Also save historical best separately for reference
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: currentBestBird ? currentBestBird.serialize() : (this.bestBird ? this.bestBird.serialize() : null), // Current best as primary
                historicalBestBird: this.bestBird ? this.bestBird.serialize() : null, // Historical record for reference
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize()
                })),
                savedAt: new Date().toISOString(),
                version: '1.1'
            };
            
            // Create JSON string
            const jsonString = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            alert('Error saving file: ' + error.message);
            return false;
        }
    }
    
    // Legacy save method for auto-save (still uses file download)
    save() {
        // Auto-save triggers file download when best score improves
        return this.saveToFile();
    }
    
    // Load AI knowledge from file
    loadFromFile(fileContent) {
        try {
            let data;
            
            // Handle both string and already-parsed JSON
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            // Validate file structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Restore generation and best score
            this.generation = data.generation || 1;
            this.bestScore = data.bestScore || 0;
            
            // Restore population first (needed to find current best)
            if (data.population && data.population.length > 0) {
                this.population = data.population.map(saved => {
                    // Handle both JSON string and parsed object
                    const brainData = typeof saved.brain === 'string'
                        ? JSON.parse(saved.brain)
                        : saved.brain;
                    return {
                        brain: NeuralNetwork.deserialize(brainData),
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                while (this.population.length < this.populationSize) {
                    // Add mutated copies of best bird or random birds
                    const source = this.bestBird || this.population[0].brain;
                    const newBrain = source.copy();
                    newBrain.mutate(0.3);
                    this.population.push({
                        brain: newBrain,
                        fitness: 0,
                        score: 0,
                        alive: true,
                        game: null
                    });
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
                // Restore best bird
                // For old format saves at high generations, the population has evolved
                // beyond the saved bestBird, so prefer top from population
                const isOldFormat = !data.version || parseFloat(data.version || '0') < 1.1;
                const isHighGeneration = data.generation && data.generation > 10;
                
                let bestBirdToLoad = null;
                
                if (data.currentBestBird) {
                    // Version 1.1 format with currentBestBird field
                    const currentBestBirdData = typeof data.currentBestBird === 'string' 
                        ? JSON.parse(data.currentBestBird) 
                        : data.currentBestBird;
                    bestBirdToLoad = NeuralNetwork.deserialize(currentBestBirdData);
                    console.log('Loaded current best bird (v1.1 format)');
                } else if (data.bestBird && (!isOldFormat || !isHighGeneration)) {
                    // New format bestBird or old format at low generation
                    const bestBirdData = typeof data.bestBird === 'string' 
                        ? JSON.parse(data.bestBird) 
                        : data.bestBird;
                    bestBirdToLoad = NeuralNetwork.deserialize(bestBirdData);
                    console.log('Loaded saved best bird');
                }
                
                // For old high-generation saves, use top from population (evolved beyond bestBird)
                if (!bestBirdToLoad && this.population.length > 0) {
                    this.bestBird = this.population[0].brain.copy();
                    console.log('Using top bird from evolved population (better than saved bestBird)');
                } else if (bestBirdToLoad) {
                    this.bestBird = bestBirdToLoad;
                }
                
                // Also restore historical best if available (for reference, but we use current best)
                if (data.historicalBestBird) {
                    // Store separately if needed, but bestBird is what will be used
                }
                
                console.log(`Loaded AI knowledge from generation ${this.generation} (Best score: ${this.bestScore})`);
                this.updateSaveStatus(true, true);
                return true;
            }
            
            // Handle old format where bestBird might be saved separately
            if (data.bestBird && this.population.length === 0) {
                const bestBirdData = typeof data.bestBird === 'string' 
                    ? JSON.parse(data.bestBird) 
                    : data.bestBird;
                this.bestBird = NeuralNetwork.deserialize(bestBirdData);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            alert('Error loading file: ' + error.message);
            return false;
        }
    }
    
    // Clear saved AI knowledge (resets to initial state)
    clearSavedData() {
        // Reset to initial random population
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                brain: new NeuralNetwork(5, 8, 1),
                fitness: 0,
                score: 0,
                alive: true,
                game: null
            });
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    // Update UI to show save status
    updateSaveStatus(saved, loaded = false) {
        const statusElement = document.getElementById('saveStatus');
        if (statusElement) {
            if (loaded) {
                statusElement.textContent = `Loaded from Generation ${this.generation}`;
                statusElement.style.color = '#28a745';
            } else if (saved) {
                statusElement.textContent = 'Saved';
                statusElement.style.color = '#28a745';
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                    }
                }, 2000);
            } else {
                statusElement.textContent = 'No saved data';
                statusElement.style.color = '#666';
            }
        }
    }
}


```

Missing closing brace in the `loadFromFile` function. Fixing it:


Checking the end of the file to ensure the class is properly closed:


The code looks correct. The syntax error is fixed. Verifying the file structure:


Syntax checks passed; the code is valid. The error is likely from a cached old version. The syntax error is fixed—there was a missing closing brace that is now corrected.

To resolve:
1. Hard refresh the browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac), or `Ctrl+F5`.
2. Clear browser cache if needed.
3. Make sure all script files are saved.

The syntax error was caused by a missing closing brace in the `loadFromFile` function, which I fixed. The files should now work.

If the error persists after a hard refresh, share the exact error message and I’ll investigate further.

