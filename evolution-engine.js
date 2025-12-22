// Evolution Engine - Genetic Algorithm for evolving agents
class EvolutionEngine {
    constructor(populationSize = 50) {
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.bestAgent = null;
        this.bestScore = 0;
        
        // Initialize population with random agents
        this.initializePopulation();
    }
    
    /**
     * Initialize population with random agents
     */
    initializePopulation() {
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push(new Agent());
        }
    }
    
    /**
     * Evaluate fitness for all agents
     * @param {Array<{agent: Agent, game: Game}>} agentGames - Array of agent-game pairs
     */
    evaluateFitness(agentGames) {
        for (const { agent, game } of agentGames) {
            agent.score = game.score;
            agent.fitness = agent.calculateFitness(game);
            
            // Track best agent
            if (agent.score > this.bestScore) {
                this.bestScore = agent.score;
                this.bestAgent = agent.copy();
            }
        }
    }
    
    /**
     * Evolve population to next generation
     */
    evolve() {
        // Sort population by fitness (best first)
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Keep top 10% (elite)
        const eliteSize = Math.floor(this.populationSize * 0.1);
        const newPopulation = [];
        
        // Add elite agents to new population
        for (let i = 0; i < eliteSize; i++) {
            newPopulation.push(this.population[i].copy());
        }
        
        // Generate rest of population through crossover and mutation
        while (newPopulation.length < this.populationSize) {
            // Select two parents (tournament selection)
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            const childBrain = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            
            // Mutate child
            childBrain.mutate(0.2); // 20% mutation rate for good exploration
            
            newPopulation.push(new Agent(childBrain));
        }
        
        this.population = newPopulation;
        this.generation++;
        
        // Reset all agents for new generation
        this.population.forEach(agent => agent.reset());
    }
    
    /**
     * Tournament selection - pick random agents and return the best one
     * @returns {Agent} Selected parent agent
     */
    selectParent() {
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
    
    /**
     * Get all agents in current population
     * @returns {Array<Agent>} Array of agents
     */
    getPopulation() {
        return this.population;
    }
    
    /**
     * Get best agent from all generations
     * @returns {Agent|null} Best agent or null if none exists
     */
    getBestAgent() {
        return this.bestAgent;
    }
    
    /**
     * Load population from saved data
     * @param {Object} data - Saved evolution data
     */
    loadFromData(data) {
        this.generation = data.generation || 1;
        this.bestScore = data.bestScore || 0;
        
        // Restore best agent
        if (data.bestBird) {
            const bestBirdData = typeof data.bestBird === 'string' 
                ? JSON.parse(data.bestBird) 
                : data.bestBird;
            this.bestAgent = new Agent(NeuralNetwork.deserialize(bestBirdData));
        }
        
        // Restore population
        if (data.population && data.population.length > 0) {
            this.population = data.population.map(saved => {
                const brainData = typeof saved.brain === 'string'
                    ? JSON.parse(saved.brain)
                    : saved.brain;
                return new Agent(NeuralNetwork.deserialize(brainData));
            });
            
            // Adjust population size if needed
            if (this.bestAgent) {
                while (this.population.length < this.populationSize) {
                    const newBrain = this.bestAgent.brain.copy();
                    newBrain.mutate(0.3);
                    this.population.push(new Agent(newBrain));
                }
            }
            
            this.population = this.population.slice(0, this.populationSize);
        }
    }
    
    /**
     * Get data for saving
     * @returns {Object} Evolution data to save
     */
    getSaveData() {
        return {
            generation: this.generation,
            bestScore: this.bestScore,
            bestBird: this.bestAgent ? this.bestAgent.brain.serialize() : null,
            population: this.population.map(agent => ({
                brain: agent.brain.serialize(),
                score: agent.score,
                fitness: agent.fitness
            }))
        };
    }
    
    /**
     * Reset evolution engine
     */
    reset() {
        this.generation = 1;
        this.bestScore = 0;
        this.bestAgent = null;
        this.initializePopulation();
    }
}

