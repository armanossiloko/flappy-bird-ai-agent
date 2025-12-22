// AI Agent with Genetic Algorithm
class AIAgent {
    constructor(game, populationSize = 50, callbacks = {}) {
        this.game = game;
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestBird = null;
        
        // Callbacks for UI communication (separated from agent logic)
        this.callbacks = {
            onStatsUpdate: callbacks.onStatsUpdate || (() => {}), // (aliveCount, generation, bestScore, maxScore)
            onScoreUpdate: callbacks.onScoreUpdate || (() => {}), // (score)
            onBestScoreUpdate: callbacks.onBestScoreUpdate || (() => {}), // (bestScore)
            onSaveStatusUpdate: callbacks.onSaveStatusUpdate || (() => {}), // (status, loaded)
            onNotification: callbacks.onNotification || (() => {}) // (message, type)
        };
        
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
    
    // Play loop for single bird (WITH learning)
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
            
            // Notify UI layer of score update (separated from agent logic)
            this.callbacks.onScoreUpdate(this.game.score);
            
            // Check if dead
            if (this.game.gameOver) {
                this.playBird.alive = false;
                this.playBird.score = this.game.score;
                this.playBird.fitness = this.calculateFitness({ game: this.game, score: this.game.score });
                
                // Learn from this session - update bestBird if this was a better performance
                if (this.game.score > this.bestScore) {
                    this.bestScore = this.game.score;
                    this.bestBird = this.playBird.brain.copy();
                    console.log(`New best score in Watch AI: ${this.bestScore}`);
                    
                    // Notify UI layer (separated from agent logic)
                    this.callbacks.onBestScoreUpdate(this.bestScore);
                    this.callbacks.onSaveStatusUpdate(`New Best: ${this.bestScore}!`, false);
                }
                
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
                // Fast mode: run multiple updates per frame for speed
                // but keep same physics timing as play mode
                let fastIterations = 0;
                while (fastIterations < 5 && this.isRunning) {
                    let stillAlive = this.fastModeUpdate();
                    if (!stillAlive) break; // All dead, evolved already
                    fastIterations++;
                }
                requestAnimationFrame(() => this.updateLoop());
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    fastModeUpdate() {
        // Run update cycle without drawing for fast mode
        let allDead = true;
        
        for (let bird of this.population) {
            if (bird.alive) {
                allDead = false;
                
                // Get AI decision
                const inputs = bird.game.getAIInputs();
                const output = bird.brain.feedforward(inputs);
                
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
                    }
                } else {
                    bird.score = bird.game.score;
                    bird.fitness = this.calculateFitness(bird);
                }
            }
        }
        
        // If all dead in fast mode updates, evolve and restart
        if (allDead) {
            this.evolve();
            
            for (let bird of this.population) {
                bird.game = this.createGameInstance();
                bird.alive = true;
                bird.score = 0;
                bird.fitness = 0;
            }
            return false; // Signal that generation is complete
        }
        
        return true; // Still have alive birds
    }
    
    calculateFitness(bird) {
        // Fitness based on:
        // 1. Survival time (frameCount) - MOST IMPORTANT for early learning
        // 2. Score (pipes passed)
        // 3. How close to center of gap (small bonus)
        
        let fitness = 0;
        
        // Primary: Survival time - this is crucial for early generations
        // Birds that survive longer should have higher fitness even with score 0
        if (bird.game) {
            fitness += bird.game.frameCount;
        }
        
        // Secondary: Score multiplier - passing pipes is very valuable
        fitness += bird.score * 1000;
        
        // Tertiary: Gap centering bonus (only if approaching a pipe)
        if (bird.game && bird.game.nextPipe) {
            const pipe = bird.game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = bird.game.bird.y + bird.game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            const maxDistance = bird.game.pipeGap / 2;
            
            // Small bonus for being centered (max 50 points)
            if (distanceFromCenter < maxDistance) {
                fitness += (1 - distanceFromCenter / maxDistance) * 50;
            }
        }
        
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
            child.mutate(0.2); // 20% mutation rate for good exploration
            
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
        // Notify UI layer of stats update (separated from agent logic)
        this.callbacks.onStatsUpdate(aliveCount, this.generation, this.bestScore, maxScore);
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
            
            // Use callback for file download (separated from agent logic)
            // The callback handles browser-specific file download operations
            this.callbacks.onFileSave?.(jsonString, `flappy-bird-ai-gen${this.generation}-score${this.bestScore}.json`);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            this.callbacks.onNotification?.(`Error saving file: ${error.message}`, 'error');
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
    
    // Update UI to show save status (via callback, separated from agent logic)
    updateSaveStatus(saved, loaded = false) {
        let statusText = '';
        if (loaded) {
            statusText = `Loaded from Generation ${this.generation}`;
        } else if (saved) {
            statusText = 'Saved';
        } else {
            statusText = 'No saved data';
        }
        this.callbacks.onSaveStatusUpdate(statusText, loaded);
    }
}

