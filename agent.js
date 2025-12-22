// Individual AI Agent - observes, decides, and acts
class Agent {
    constructor(brain = null) {
        // Neural network brain (if null, will be created)
        this.brain = brain || new NeuralNetwork(5, 8, 1);
        
        // Agent state
        this.alive = true;
        this.score = 0;
        this.fitness = 0;
    }
    
    /**
     * Observe the game state and convert it to neural network inputs
     * @param {Game} game - The game instance to observe
     * @returns {Array<number>} Normalized input array for neural network
     */
    observe(game) {
        // Extract game state
        const playableHeight = game.height - game.groundHeight;
        const bird = game.bird;
        const nextPipe = game.nextPipe;
        
        // If no pipe, return default normalized values
        if (!nextPipe) {
            return [
                bird.y / playableHeight,        // Bird Y position (0-1)
                bird.velocity / 20,             // Bird velocity (normalized)
                1,                              // Distance to pipe (far)
                0.5,                            // Pipe top (default)
                0.5                             // Pipe bottom (default)
            ];
        }
        
        // Normalize pipe information
        const distanceToPipe = (nextPipe.x - bird.x) / game.width;
        const normalizedTop = nextPipe.topHeight / playableHeight;
        const normalizedBottom = nextPipe.bottomY / playableHeight;
        
        return [
            bird.y / playableHeight,            // Bird Y position (0-1)
            bird.velocity / 20,                 // Bird velocity (normalized)
            distanceToPipe,                     // Distance to pipe (0-1)
            normalizedTop,                      // Pipe top height (0-1)
            normalizedBottom                     // Pipe bottom Y (0-1)
        ];
    }
    
    /**
     * Decide on an action based on observed state
     * @param {Array<number>} inputs - Normalized game state inputs
     * @returns {boolean} True if agent decides to flap, false otherwise
     */
    decide(inputs) {
        const output = this.brain.feedforward(inputs);
        // If output > 0.5, decide to flap
        return output[0] > 0.5;
    }
    
    /**
     * Act on the game based on decision
     * @param {Game} game - The game instance to act upon
     * @param {boolean} shouldFlap - Whether to flap or not
     */
    act(game, shouldFlap) {
        if (shouldFlap) {
            game.flap();
        }
    }
    
    /**
     * Complete observe-decide-act cycle
     * @param {Game} game - The game instance
     * @returns {boolean} True if agent decided to flap
     */
    step(game) {
        const inputs = this.observe(game);
        const decision = this.decide(inputs);
        this.act(game, decision);
        return decision;
    }
    
    /**
     * Calculate fitness based on game performance
     * @param {Game} game - The game instance
     * @returns {number} Fitness score
     */
    calculateFitness(game) {
        let fitness = 0;
        
        // Primary: Survival time - crucial for early learning
        fitness += game.frameCount;
        
        // Secondary: Score multiplier - passing pipes is very valuable
        fitness += this.score * 1000;
        
        // Tertiary: Gap centering bonus (only if approaching a pipe)
        if (game.nextPipe) {
            const pipe = game.nextPipe;
            const gapCenter = (pipe.topHeight + pipe.bottomY) / 2;
            const birdCenter = game.bird.y + game.bird.height / 2;
            const distanceFromCenter = Math.abs(birdCenter - gapCenter);
            const maxDistance = game.pipeGap / 2;
            
            // Small bonus for being centered (max 50 points)
            if (distanceFromCenter < maxDistance) {
                fitness += (1 - distanceFromCenter / maxDistance) * 50;
            }
        }
        
        return Math.max(0, fitness);
    }
    
    /**
     * Reset agent state for new game
     */
    reset() {
        this.alive = true;
        this.score = 0;
        this.fitness = 0;
    }
    
    /**
     * Create a copy of this agent
     * @returns {Agent} New agent with copied brain
     */
    copy() {
        return new Agent(this.brain.copy());
    }
}

