# Improve AI model performance in game
_Exported on 11/3/2025 at 22:55:52 GMT+1 from Cursor (2.0.52)_

---

**User**

Please analyze @neural-network.js and @ai.js and tell me what I can improve here. Currently when I train a model, no matter how many generations, when I click "AI play", the bird often dies within the first few pipes while in training, it reaches scores of 700 for example.

---

**Cursor**

I'll analyze both files to identify why the trained AI performs poorly in play mode compared to training.

Now I can see the full picture. After analyzing the code, I've identified **several critical issues** that explain why your trained AI performs poorly in play mode:

## 🔴 Critical Issues Found

### 1. **Best Bird Selection Problem (Lines 410-472 in `ai.js`)**
The `saveToFile()` function tries to find the "current best bird" from the population, but this logic is flawed:
- It looks at birds that may have just been created and never played
- The `performance` metric combines score and fitness, but new birds have both at 0
- This means you might be saving untrained birds instead of your actual best performer

### 2. **Training vs Play Mode Physics Mismatch**
During training, each bird runs in its own independent game instance, but in play mode:
- The AI uses the visual game's state
- There's complex syncing logic that may introduce inconsistencies
- The `syncGameToVisual()` function has workarounds for "stuck at top" issues (lines 136-147)

### 3. **Pipe Generation Randomness**
Each game instance generates pipes with **different random heights**. This means:
- During training, the best bird gets lucky with easier pipe configurations
- In play mode, it faces a completely different set of pipes it has never seen
- The AI never learns general pipe-passing strategies, only specific sequences

### 4. **State Initialization Timing Issues**
In `startPlayMode()` (lines 73-110):
- Multiple resets and timing workarounds suggest initialization problems
- The 10ms delay and frame counting logic indicate race conditions
- The "stuck at top" detection suggests the game state isn't properly initialized

## ✅ Recommended Improvements

```javascript
// 1. FIX: Save the actual best bird that achieved the best score
saveToFile() {
    try {
        // Always use the bestBird that actually achieved the bestScore
        if (!this.bestBird) {
            console.error('No trained bird available to save');
            return false;
        }
        
        const saveData = {
            generation: this.generation,
            bestScore: this.bestScore,
            bestBird: this.bestBird.serialize(), // Use the proven best bird
            population: this.population.map(bird => ({
                brain: bird.brain.serialize(),
                score: bird.score,
                fitness: bird.fitness
            })),
            savedAt: new Date().toISOString(),
            version: '2.0'
        };
        
        // ... rest of save logic
    } catch (error) {
        console.error('Error saving:', error);
        return false;
    }
}

// 2. FIX: Ensure bestBird is always set when a high score is achieved
updateLoop() {
    // ... existing code ...
    
    if (bird.game.gameOver) {
        bird.alive = false;
        bird.fitness = this.calculateFitness(bird);
        bird.score = bird.game.score;
        
        // CRITICAL: Always update bestBird when score improves
        if (bird.score > this.bestScore) {
            this.bestScore = bird.score;
            this.bestBird = bird.brain.copy(); // This is correct!
            console.log(`New best score: ${this.bestScore} in generation ${this.generation}`);
        }
    }
}

// 3. FIX: Simplify play mode - remove complex syncing
startPlayMode() {
    if (!this.bestBird) {
        alert('No trained AI found! Please train the AI first.');
        return false;
    }
    
    this.stop();
    this.isRunning = true;
    this.playMode = true;
    
    // Use the VISUAL game directly, don't create a separate instance
    this.game.reset();
    this.game.start();
    
    this.playBird = {
        brain: this.bestBird.copy(),
        alive: true
    };
    
    this.playLoopRunning = true;
    this.playLoop();
    return true;
}

// 4. FIX: Simplified play loop without syncing complexity
playLoop() {
    if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
        this.playLoopRunning = false;
        return;
    }
    
    if (this.playBird && this.playBird.alive && !this.game.gameOver) {
        // Get AI decision from the ACTUAL visual game
        const inputs = this.game.getAIInputs();
        const output = this.playBird.brain.feedforward(inputs);
        
        if (output[0] > 0.5) {
            this.game.flap();
        }
        
        // Update the visual game directly
        this.game.update();
        
        // Update score display
        document.getElementById('score').textContent = this.game.score;
        
        if (this.game.gameOver) {
            this.playBird.alive = false;
        }
    }
    
    // Draw game
    this.game.draw();
    
    // Continue loop
    if (this.isRunning && this.playMode && this.playLoopRunning) {
        this.playLoopId = requestAnimationFrame(() => this.playLoop());
    }
}
```

### 5. **Optional: Add Deterministic Pipe Generation for Testing**
```javascript
// In game.js - add option for deterministic pipes
addPipe(x, seed = null) {
    const minHeight = 50;
    const maxHeight = this.height - this.pipeGap - minHeight;
    
    let topHeight;
    if (seed !== null) {
        // Use seeded random for reproducible pipes
        topHeight = this.seededRandom(seed) * (maxHeight - minHeight) + minHeight;
    } else {
        topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    }
    
    this.pipes.push({
        x: x,
        topHeight: topHeight,
        bottomY: topHeight + this.pipeGap,
        passed: false
    });
}
```

### 6. **Add Validation Before Saving**
```javascript
// Verify the bird actually played before saving
if (this.bestBird && this.bestScore > 0) {
    // Safe to save
} else {
    console.warn('No bird has scored yet - cannot save');
}
```

## 🎯 Key Insights

1. **The core issue**: You're likely saving a random untested bird instead of your champion
2. **Secondary issue**: The dual-game-instance architecture introduces inconsistencies
3. **Tertiary issue**: Random pipe generation means no two games are comparable

## 📝 Immediate Actions

1. **Add logging** to see what bird is being saved:
   ```javascript
   console.log('Saving bird with bestScore:', this.bestScore);
   console.log('BestBird exists:', !!this.bestBird);
   ```

2. **Verify your saved files** - open them and check if `bestScore` matches expectations

3. **Test with a simple case** - train for just 5 generations, manually verify the best bird is saved

Would you like me to implement these fixes for you?

```javascript
// 1. FIX: Save the actual best bird that achieved the best score
saveToFile() {
    try {
        // Always use the bestBird that actually achieved the bestScore
        if (!this.bestBird) {
            console.error('No trained bird available to save');
            return false;
        }
        
        const saveData = {
            generation: this.generation,
            bestScore: this.bestScore,
            bestBird: this.bestBird.serialize(), // Use the proven best bird
            population: this.population.map(bird => ({
                brain: bird.brain.serialize(),
                score: bird.score,
                fitness: bird.fitness
            })),
            savedAt: new Date().toISOString(),
            version: '2.0'
        };
        
        // ... rest of save logic
    } catch (error) {
        console.error('Error saving:', error);
        return false;
    }
}

// 2. FIX: Ensure bestBird is always set when a high score is achieved
updateLoop() {
    // ... existing code ...
    
    if (bird.game.gameOver) {
        bird.alive = false;
        bird.fitness = this.calculateFitness(bird);
        bird.score = bird.game.score;
        
        // CRITICAL: Always update bestBird when score improves
        if (bird.score > this.bestScore) {
            this.bestScore = bird.score;
            this.bestBird = bird.brain.copy(); // This is correct!
            console.log(`New best score: ${this.bestScore} in generation ${this.generation}`);
        }
    }
}

// 3. FIX: Simplify play mode - remove complex syncing
startPlayMode() {
    if (!this.bestBird) {
        alert('No trained AI found! Please train the AI first.');
        return false;
    }
    
    this.stop();
    this.isRunning = true;
    this.playMode = true;
    
    // Use the VISUAL game directly, don't create a separate instance
    this.game.reset();
    this.game.start();
    
    this.playBird = {
        brain: this.bestBird.copy(),
        alive: true
    };
    
    this.playLoopRunning = true;
    this.playLoop();
    return true;
}

// 4. FIX: Simplified play loop without syncing complexity
playLoop() {
    if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
        this.playLoopRunning = false;
        return;
    }
    
    if (this.playBird && this.playBird.alive && !this.game.gameOver) {
        // Get AI decision from the ACTUAL visual game
        const inputs = this.game.getAIInputs();
        const output = this.playBird.brain.feedforward(inputs);
        
        if (output[0] > 0.5) {
            this.game.flap();
        }
        
        // Update the visual game directly
        this.game.update();
        
        // Update score display
        document.getElementById('score').textContent = this.game.score;
        
        if (this.game.gameOver) {
            this.playBird.alive = false;
        }
    }
    
    // Draw game
    this.game.draw();
    
    // Continue loop
    if (this.isRunning && this.playMode && this.playLoopRunning) {
        this.playLoopId = requestAnimationFrame(() => this.playLoop());
    }
}
```

```javascript
// In game.js - add option for deterministic pipes
addPipe(x, seed = null) {
    const minHeight = 50;
    const maxHeight = this.height - this.pipeGap - minHeight;
    
    let topHeight;
    if (seed !== null) {
        // Use seeded random for reproducible pipes
        topHeight = this.seededRandom(seed) * (maxHeight - minHeight) + minHeight;
    } else {
        topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    }
    
    this.pipes.push({
        x: x,
        topHeight: topHeight,
        bottomY: topHeight + this.pipeGap,
        passed: false
    });
}
```

```javascript
// Verify the bird actually played before saving
if (this.bestBird && this.bestScore > 0) {
    // Safe to save
} else {
    console.warn('No bird has scored yet - cannot save');
}
```

```javascript
   console.log('Saving bird with bestScore:', this.bestScore);
   console.log('BestBird exists:', !!this.bestBird);
```

---

**User**

Please implement these fixes. Do not write any summaries or any text after performing the changes to not waste tokens.

---

**Cursor**

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
            // Always use the bestBird that actually achieved the bestScore
            if (!this.bestBird) {
                console.error('No trained bird available to save');
                alert('No trained AI found! Train the AI first before saving.');
                return false;
            }
            
            if (this.bestScore === 0) {
                console.warn('Best score is 0 - AI has not scored yet');
                if (!confirm('The AI has not scored any points yet. Save anyway?')) {
                    return false;
                }
            }
            
            console.log(`Saving AI with bestScore: ${this.bestScore}, generation: ${this.generation}`);
            
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird.serialize(), // Use the proven best bird
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize(),
                    score: bird.score,
                    fitness: bird.fitness
                })),
                savedAt: new Date().toISOString(),
                version: '2.0'
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
                        console.log(`New best score: ${this.bestScore} in generation ${this.generation}`);
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
            // Always use the bestBird that actually achieved the bestScore
            if (!this.bestBird) {
                console.error('No trained bird available to save');
                alert('No trained AI found! Train the AI first before saving.');
                return false;
            }
            
            if (this.bestScore === 0) {
                console.warn('Best score is 0 - AI has not scored yet');
                if (!confirm('The AI has not scored any points yet. Save anyway?')) {
                    return false;
                }
            }
            
            console.log(`Saving AI with bestScore: ${this.bestScore}, generation: ${this.generation}`);
            
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird.serialize(), // Use the proven best bird
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize(),
                    score: bird.score,
                    fitness: bird.fitness
                })),
                savedAt: new Date().toISOString(),
                version: '2.0'
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
        if (!this.bestBird) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        this.isRunning = true;
        this.playMode = true;
        
        // Use the VISUAL game directly, don't create a separate instance
        this.game.reset();
        this.game.start();
        
        this.playBird = {
            brain: this.bestBird.copy(),
            alive: true
        };
        
        this.playLoopRunning = true;
        this.playFrameCount = 0;
        this.playLoop();
        
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
                        console.log(`New best score: ${this.bestScore} in generation ${this.generation}`);
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
            // Always use the bestBird that actually achieved the bestScore
            if (!this.bestBird) {
                console.error('No trained bird available to save');
                alert('No trained AI found! Train the AI first before saving.');
                return false;
            }
            
            if (this.bestScore === 0) {
                console.warn('Best score is 0 - AI has not scored yet');
                if (!confirm('The AI has not scored any points yet. Save anyway?')) {
                    return false;
                }
            }
            
            console.log(`Saving AI with bestScore: ${this.bestScore}, generation: ${this.generation}`);
            
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird.serialize(), // Use the proven best bird
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize(),
                    score: bird.score,
                    fitness: bird.fitness
                })),
                savedAt: new Date().toISOString(),
                version: '2.0'
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
        if (!this.bestBird) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        this.isRunning = true;
        this.playMode = true;
        
        // Use the VISUAL game directly, don't create a separate instance
        this.game.reset();
        this.game.start();
        
        this.playBird = {
            brain: this.bestBird.copy(),
            alive: true
        };
        
        this.playLoopRunning = true;
        this.playFrameCount = 0;
        this.playLoop();
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playBird && this.playBird.alive && !this.game.gameOver) {
            // Get AI decision from the ACTUAL visual game
            const inputs = this.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.game.flap();
            }
            
            // Update the visual game directly
            this.game.update();
            
            // Update score display
            document.getElementById('score').textContent = this.game.score;
            
            // Check if dead
            if (this.game.gameOver) {
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
                        console.log(`New best score: ${this.bestScore} in generation ${this.generation}`);
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
            // Always use the bestBird that actually achieved the bestScore
            if (!this.bestBird) {
                console.error('No trained bird available to save');
                alert('No trained AI found! Train the AI first before saving.');
                return false;
            }
            
            if (this.bestScore === 0) {
                console.warn('Best score is 0 - AI has not scored yet');
                if (!confirm('The AI has not scored any points yet. Save anyway?')) {
                    return false;
                }
            }
            
            console.log(`Saving AI with bestScore: ${this.bestScore}, generation: ${this.generation}`);
            
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird.serialize(), // Use the proven best bird
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize(),
                    score: bird.score,
                    fitness: bird.fitness
                })),
                savedAt: new Date().toISOString(),
                version: '2.0'
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
        if (!this.bestBird) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        this.isRunning = true;
        this.playMode = true;
        
        // Use the VISUAL game directly, don't create a separate instance
        this.game.reset();
        this.game.start();
        
        this.playBird = {
            brain: this.bestBird.copy(),
            alive: true
        };
        
        this.playLoopRunning = true;
        this.playFrameCount = 0;
        this.playLoop();
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playBird && this.playBird.alive && !this.game.gameOver) {
            // Get AI decision from the ACTUAL visual game
            const inputs = this.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.game.flap();
            }
            
            // Update the visual game directly
            this.game.update();
            
            // Update score display
            document.getElementById('score').textContent = this.game.score;
            
            // Check if dead
            if (this.game.gameOver) {
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
        
        this.game.reset();
        this.game.start();
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
                        console.log(`New best score: ${this.bestScore} in generation ${this.generation}`);
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
            // Always use the bestBird that actually achieved the bestScore
            if (!this.bestBird) {
                console.error('No trained bird available to save');
                alert('No trained AI found! Train the AI first before saving.');
                return false;
            }
            
            if (this.bestScore === 0) {
                console.warn('Best score is 0 - AI has not scored yet');
                if (!confirm('The AI has not scored any points yet. Save anyway?')) {
                    return false;
                }
            }
            
            console.log(`Saving AI with bestScore: ${this.bestScore}, generation: ${this.generation}`);
            
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird.serialize(), // Use the proven best bird
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize(),
                    score: bird.score,
                    fitness: bird.fitness
                })),
                savedAt: new Date().toISOString(),
                version: '2.0'
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
        if (!this.bestBird) {
            alert('No trained AI found! Please train the AI first using "Start AI Learning".');
            return false;
        }
        
        // Stop any existing loops first
        this.stop();
        
        this.isRunning = true;
        this.playMode = true;
        
        // Use the VISUAL game directly, don't create a separate instance
        this.game.reset();
        this.game.start();
        
        this.playBird = {
            brain: this.bestBird.copy(),
            alive: true
        };
        
        this.playLoopRunning = true;
        this.playFrameCount = 0;
        this.playLoop();
        
        return true;
    }
    
    // Play loop for single bird (no learning)
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playBird && this.playBird.alive && !this.game.gameOver) {
            // Get AI decision from the ACTUAL visual game
            const inputs = this.game.getAIInputs();
            const output = this.playBird.brain.feedforward(inputs);
            
            // If output > 0.5, flap
            if (output[0] > 0.5) {
                this.game.flap();
            }
            
            // Update the visual game directly
            this.game.update();
            
            // Update score display
            document.getElementById('score').textContent = this.game.score;
            
            // Check if dead
            if (this.game.gameOver) {
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
        
        this.game.reset();
        this.game.start();
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
                        console.log(`New best score: ${this.bestScore} in generation ${this.generation}`);
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
            // Always use the bestBird that actually achieved the bestScore
            if (!this.bestBird) {
                console.error('No trained bird available to save');
                alert('No trained AI found! Train the AI first before saving.');
                return false;
            }
            
            if (this.bestScore === 0) {
                console.warn('Best score is 0 - AI has not scored yet');
                if (!confirm('The AI has not scored any points yet. Save anyway?')) {
                    return false;
                }
            }
            
            console.log(`Saving AI with bestScore: ${this.bestScore}, generation: ${this.generation}`);
            
            const saveData = {
                generation: this.generation,
                bestScore: this.bestScore,
                bestBird: this.bestBird.serialize(), // Use the proven best bird
                population: this.population.map(bird => ({
                    brain: bird.brain.serialize(),
                    score: bird.score,
                    fitness: bird.fitness
                })),
                savedAt: new Date().toISOString(),
                version: '2.0'
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
            
            // Restore best bird first (most important)
            if (data.bestBird) {
                const bestBirdData = typeof data.bestBird === 'string' 
                    ? JSON.parse(data.bestBird) 
                    : data.bestBird;
                this.bestBird = NeuralNetwork.deserialize(bestBirdData);
                console.log(`Loaded best bird with score: ${this.bestScore}`);
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
                        fitness: saved.fitness || 0,
                        score: saved.score || 0,
                        alive: true,
                        game: null
                    };
                });
                
                // If population size changed, adjust it
                if (this.bestBird) {
                    while (this.population.length < this.populationSize) {
                        // Add mutated copies of best bird
                        const newBrain = this.bestBird.copy();
                        newBrain.mutate(0.3);
                        this.population.push({
                            brain: newBrain,
                            fitness: 0,
                            score: 0,
                            alive: true,
                            game: null
                        });
                    }
                }
                
                // Trim if population is too large
                this.population = this.population.slice(0, this.populationSize);
                
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

