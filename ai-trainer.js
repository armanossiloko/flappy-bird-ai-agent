// AI Trainer - Coordinates training process using EvolutionEngine and Agent classes
class AITrainer {
    constructor(visualGame, populationSize = 50, callbacks = {}) {
        this.visualGame = visualGame; // The visual game instance for display
        this.populationSize = populationSize;
        
        // Evolution engine handles genetic algorithm
        this.evolutionEngine = new EvolutionEngine(populationSize);
        
        // Game instances for each agent (for parallel training)
        this.agentGames = []; // Array of {agent: Agent, game: Game}
        
        // Callbacks for UI communication (separated from training logic)
        this.callbacks = {
            onStatsUpdate: callbacks.onStatsUpdate || (() => {}),
            onScoreUpdate: callbacks.onScoreUpdate || (() => {}),
            onBestScoreUpdate: callbacks.onBestScoreUpdate || (() => {}),
            onSaveStatusUpdate: callbacks.onSaveStatusUpdate || (() => {}),
            onNotification: callbacks.onNotification || (() => {}),
            onFileSave: callbacks.onFileSave || (() => {})
        };
        
        // Training state
        this.isRunning = false;
        this.fastMode = false;
        this.playMode = false; // True when AI is just playing (not learning)
        this.playAgent = null; // Single agent for play mode
        this.playLoopId = null;
        this.playLoopRunning = false;
    }
    
    /**
     * Create a game instance for training
     * @returns {Game} New game instance
     */
    createGameInstance() {
        const canvas = document.createElement('canvas');
        canvas.width = this.visualGame.width;
        canvas.height = this.visualGame.height;
        const gameInstance = new Game(canvas);
        gameInstance.start();
        return gameInstance;
    }
    
    /**
     * Start training process
     */
    start() {
        this.isRunning = true;
        this.playMode = false;
        
        // Initialize game instances for each agent
        const population = this.evolutionEngine.getPopulation();
        this.agentGames = population.map(agent => ({
            agent: agent,
            game: this.createGameInstance()
        }));
        
        this.updateLoop();
    }
    
    /**
     * Stop training process
     */
    stop() {
        this.isRunning = false;
        this.playMode = false;
        this.playAgent = null;
        this.playLoopRunning = false;
        
        if (this.playLoopId !== null) {
            cancelAnimationFrame(this.playLoopId);
            this.playLoopId = null;
        }
    }
    
    /**
     * Start play mode - AI just plays without learning
     */
    startPlayMode() {
        const bestAgent = this.evolutionEngine.getBestAgent();
        if (!bestAgent) {
            this.callbacks.onNotification('No trained AI found! Please train the AI first using "Start AI Learning".', 'error');
            return false;
        }
        
        this.stop();
        this.isRunning = true;
        this.playMode = true;
        
        // Use the visual game directly
        this.visualGame.reset();
        this.visualGame.start();
        
        // Create play agent from best agent
        this.playAgent = bestAgent.copy();
        this.playAgent.reset();
        
        this.playLoopRunning = true;
        this.playLoop();
        
        return true;
    }
    
    /**
     * Play loop for single agent (watch AI play)
     */
    playLoop() {
        if (!this.isRunning || !this.playMode || !this.playLoopRunning) {
            this.playLoopRunning = false;
            return;
        }
        
        if (this.playAgent && this.playAgent.alive && !this.visualGame.gameOver) {
            // Agent observes, decides, and acts
            this.playAgent.step(this.visualGame);
            
            // Update the visual game
            this.visualGame.update();
            
            // Notify UI layer of score update
            this.callbacks.onScoreUpdate(this.visualGame.score);
            
            // Check if dead
            if (this.visualGame.gameOver) {
                this.playAgent.alive = false;
                this.playAgent.score = this.visualGame.score;
                this.playAgent.fitness = this.playAgent.calculateFitness(this.visualGame);
                
                // Update best agent if this was a better performance
                const bestScore = this.evolutionEngine.bestScore;
                if (this.visualGame.score > bestScore) {
                    this.evolutionEngine.bestScore = this.visualGame.score;
                    this.evolutionEngine.bestAgent = this.playAgent.copy();
                    console.log(`New best score in Watch AI: ${this.visualGame.score}`);
                    
                    // Notify UI layer
                    this.callbacks.onBestScoreUpdate(this.visualGame.score);
                    this.callbacks.onSaveStatusUpdate(`New Best: ${this.visualGame.score}!`, false);
                }
            }
        }
        
        // Draw game
        this.visualGame.draw();
        
        // Continue loop
        if (this.isRunning && this.playMode && this.playLoopRunning) {
            this.playLoopId = requestAnimationFrame(() => this.playLoop());
        } else {
            this.playLoopRunning = false;
            this.playLoopId = null;
        }
    }
    
    /**
     * Main training loop
     */
    updateLoop() {
        if (!this.isRunning) return;
        
        let allDead = true;
        let aliveCount = 0;
        let maxScore = 0;
        let bestAliveAgent = null;
        let bestAliveFitness = -1;
        
        // Update all agents
        for (const { agent, game } of this.agentGames) {
            if (agent.alive) {
                allDead = false;
                aliveCount++;
                
                // Agent observes, decides, and acts
                agent.step(game);
                
                // Update game
                game.update();
                
                if (game.gameOver) {
                    agent.alive = false;
                    agent.score = game.score;
                    agent.fitness = agent.calculateFitness(game);
                    
                    if (agent.score > maxScore) {
                        maxScore = agent.score;
                    }
                } else {
                    agent.score = game.score;
                    agent.fitness = agent.calculateFitness(game);
                    
                    if (agent.score > maxScore) {
                        maxScore = agent.score;
                    }
                    
                    // Track best alive agent for visualization
                    if (agent.fitness > bestAliveFitness) {
                        bestAliveFitness = agent.fitness;
                        bestAliveAgent = agent;
                    }
                }
            }
        }
        
        // Update visual game to show best performing alive agent
        if (bestAliveAgent && bestAliveAgent.alive) {
            const bestGame = this.agentGames.find(ag => ag.agent === bestAliveAgent)?.game;
            if (bestGame) {
                this.syncGameToVisual(bestGame);
            }
        }
        
        // Evaluate fitness and update stats
        this.evolutionEngine.evaluateFitness(this.agentGames);
        this.updateStats(aliveCount, maxScore);
        
        // If all dead, evolve to next generation
        if (allDead) {
            this.evolutionEngine.evolve();
            
            // Initialize next generation
            const newPopulation = this.evolutionEngine.getPopulation();
            this.agentGames = newPopulation.map(agent => ({
                agent: agent,
                game: this.createGameInstance()
            }));
        }
        
        // Draw game
        this.visualGame.draw();
        
        // Schedule next frame
        if (this.isRunning) {
            if (this.fastMode) {
                // Fast mode: run multiple updates per frame
                let fastIterations = 0;
                while (fastIterations < 5 && this.isRunning) {
                    let stillAlive = this.fastModeUpdate();
                    if (!stillAlive) break;
                    fastIterations++;
                }
                requestAnimationFrame(() => this.updateLoop());
            } else {
                requestAnimationFrame(() => this.updateLoop());
            }
        }
    }
    
    /**
     * Fast mode update (without drawing)
     */
    fastModeUpdate() {
        let allDead = true;
        
        for (const { agent, game } of this.agentGames) {
            if (agent.alive) {
                allDead = false;
                
                // Agent observes, decides, and acts
                agent.step(game);
                
                // Update game
                game.update();
                
                if (game.gameOver) {
                    agent.alive = false;
                    agent.score = game.score;
                    agent.fitness = agent.calculateFitness(game);
                } else {
                    agent.score = game.score;
                    agent.fitness = agent.calculateFitness(game);
                }
            }
        }
        
        // If all dead, evolve and restart
        if (allDead) {
            this.evolutionEngine.evaluateFitness(this.agentGames);
            this.evolutionEngine.evolve();
            
            const newPopulation = this.evolutionEngine.getPopulation();
            this.agentGames = newPopulation.map(agent => ({
                agent: agent,
                game: this.createGameInstance()
            }));
            return false;
        }
        
        return true;
    }
    
    /**
     * Sync game state to visual game for display
     */
    syncGameToVisual(sourceGame) {
        this.visualGame.bird.x = sourceGame.bird.x;
        this.visualGame.bird.y = Math.max(0, sourceGame.bird.y);
        this.visualGame.bird.velocity = sourceGame.bird.velocity;
        this.visualGame.score = sourceGame.score;
        this.visualGame.gameOver = sourceGame.gameOver;
        this.visualGame.gameStarted = sourceGame.gameStarted;
        
        // Copy pipes
        this.visualGame.pipes = [];
        let nextPipeFound = false;
        for (const pipe of sourceGame.pipes) {
            const copiedPipe = {
                x: pipe.x,
                topHeight: pipe.topHeight,
                bottomY: pipe.bottomY,
                passed: pipe.passed
            };
            this.visualGame.pipes.push(copiedPipe);
            
            if (sourceGame.nextPipe === pipe && !nextPipeFound) {
                this.visualGame.nextPipe = copiedPipe;
                nextPipeFound = true;
            }
        }
        
        if (!nextPipeFound) {
            this.visualGame.nextPipe = null;
        }
    }
    
    /**
     * Update UI stats
     */
    updateStats(aliveCount, maxScore) {
        const generation = this.evolutionEngine.generation;
        const bestScore = this.evolutionEngine.bestScore;
        this.callbacks.onStatsUpdate(aliveCount, generation, bestScore, maxScore);
    }
    
    /**
     * Set fast mode
     */
    setFastMode(enabled) {
        this.fastMode = enabled;
    }
    
    /**
     * Save AI knowledge to file
     */
    saveToFile() {
        try {
            const bestAgent = this.evolutionEngine.getBestAgent();
            if (!bestAgent) {
                this.callbacks.onNotification('No trained AI found! Train the AI first before saving.', 'error');
                return false;
            }
            
            if (this.evolutionEngine.bestScore === 0) {
                if (!confirm('The AI has not scored any points yet. Save anyway?')) {
                    return false;
                }
            }
            
            const saveData = {
                ...this.evolutionEngine.getSaveData(),
                savedAt: new Date().toISOString(),
                version: '3.0'
            };
            
            const jsonString = JSON.stringify(saveData, null, 2);
            const filename = `flappy-bird-ai-gen${this.evolutionEngine.generation}-score${this.evolutionEngine.bestScore}.json`;
            
            // Use callback for file download
            this.callbacks.onFileSave(jsonString, filename);
            
            console.log('AI knowledge saved to file successfully');
            this.updateSaveStatus(true);
            return true;
        } catch (error) {
            console.error('Error saving AI knowledge to file:', error);
            this.updateSaveStatus(false);
            this.callbacks.onNotification(`Error saving file: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * Load AI knowledge from file
     */
    loadFromFile(fileContent) {
        try {
            let data;
            
            if (typeof fileContent === 'string') {
                data = JSON.parse(fileContent);
            } else {
                data = fileContent;
            }
            
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid file format');
            }
            
            // Load into evolution engine
            this.evolutionEngine.loadFromData(data);
            
            console.log(`Loaded AI knowledge from generation ${this.evolutionEngine.generation} (Best score: ${this.evolutionEngine.bestScore})`);
            this.updateSaveStatus(true, true);
            return true;
        } catch (error) {
            console.error('Error loading AI knowledge from file:', error);
            this.updateSaveStatus(false);
            this.callbacks.onNotification(`Error loading file: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * Clear saved AI knowledge
     */
    clearSavedData() {
        this.evolutionEngine.reset();
        this.updateSaveStatus(false);
        console.log('AI knowledge cleared - reset to initial state');
    }
    
    /**
     * Update save status (via callback)
     */
    updateSaveStatus(saved, loaded = false) {
        let statusText = '';
        if (loaded) {
            statusText = `Loaded from Generation ${this.evolutionEngine.generation}`;
        } else if (saved) {
            statusText = 'Saved';
        } else {
            statusText = 'No saved data';
        }
        this.callbacks.onSaveStatusUpdate(statusText, loaded);
    }
    
    // Legacy compatibility properties
    get generation() {
        return this.evolutionEngine.generation;
    }
    
    get bestScore() {
        return this.evolutionEngine.bestScore;
    }
    
    get bestBird() {
        return this.evolutionEngine.getBestAgent()?.brain || null;
    }
}

