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
                // Mutation magnitude of ±0.5 allows good exploration
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
        
        // Crossover weights - random selection maintains diversity
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

