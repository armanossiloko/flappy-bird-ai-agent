# 🐦 Flappy Bird AI Agent

> **Note:** This project was created using [Cursor](https://cursor.sh) and **Claude Opus 4.5** for testing and play purposes. All code was generated through AI-assisted development.

A Flappy Bird clone with an AI agent that learns to play using **Neural Networks** and **Genetic Algorithms**. This project was created for **testing and play purposes** using [Cursor](https://cursor.sh) AI assistant with Claude Opus 4.5.

![Flappy Bird AI](https://img.shields.io/badge/AI-Learning-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 📋 About

This project is a complete implementation of the popular Flappy Bird game with an integrated AI agent that learns to play through evolution. The AI uses a custom neural network (implemented from scratch) and a genetic algorithm to evolve its gameplay strategy over multiple generations.

**Note:** This project was developed using [Cursor](https://cursor.sh) with **Claude Opus 4.5** for testing and experimentation purposes. It demonstrates how AI can learn to play games without using external AI models or libraries.

## ✨ Features

- 🎮 **Manual Play Mode** - Play Flappy Bird yourself using SPACE or mouse clicks
- 🤖 **AI Training Mode** - Watch 50 AI agents learn simultaneously through genetic evolution
- 🎯 **AI Play Mode** - Let the trained AI demonstrate its learned skills
- 💾 **Save/Load System** - Automatically loads the latest trained AI on startup
- ⚡ **Fast Training Mode** - Accelerate the training process for faster results
- 📊 **Real-time Statistics** - Track generation, best score, and alive agents
- 🎨 **Modern UI** - Clean, responsive design with smooth animations

## 🧠 How It Works

The AI uses two main techniques:

1. **Neural Network** (5 inputs, 8 hidden nodes, 1 output) - Makes decisions based on game state
2. **Genetic Algorithm** with:
   - Population-based evolution (50 agents per generation)
   - Tournament selection for parent breeding
   - Crossover between successful agents
   - Mutation for genetic diversity (20% rate)
   - Elite preservation (top 10% survive)

### Neural Network Inputs

The AI receives 5 normalized inputs about the game state:
- Bird Y position
- Bird velocity
- Distance to next pipe
- Next pipe top height
- Next pipe bottom gap

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### 🎮 How to Use

#### Manual Play
1. Click **"Play"** button or press **SPACE**
2. Press **SPACE** or **CLICK** to make the bird flap
3. Try to avoid the pipes and beat your high score!

#### AI Training
1. Click **"Train AI"** button to start training
2. Watch multiple AI agents learn simultaneously
3. Each generation evolves from the best performers
4. Enable **"Fast Mode"** checkbox for faster training
5. Click **"Save"** to download your trained model

#### AI Play Mode
1. Train the AI first or load a saved model
2. Click **"Watch AI"** to watch the best AI play
3. The AI will use its learned knowledge to navigate pipes

#### Saving & Loading
- **Auto-Load**: The latest AI model from the `data/` folder is automatically loaded on startup
- **Manual Save**: Click **"Save"** to download the current model as a JSON file
- **Manual Load**: Click **"Load"** to upload a previously saved model
- **Reset**: Click **"Reset"** to start training from scratch

## 📁 Project Structure

```
flappy-bird-ai-agent/
├── server.js              # Express server with API endpoints
├── index.html             # Main HTML file
├── main.js                # Application controller with auto-load
├── game.js                # Flappy Bird game engine
├── ai.js                  # AI agent with genetic algorithm
├── neural-network.js      # Neural network implementation
├── styles.css             # Styling
├── data/                  # Saved AI models (auto-loaded)
├── docs/                  # Documentation (Bosnian)
│   ├── dokumentacija.md   # Complete project documentation (Markdown)
│   ├── dokumentacija.pdf  # Complete project documentation (PDF)
│   └── dokumentacija.docx # Complete project documentation (Word)
├── chat/                  # Chat history with Cursor AI
├── node_modules/          # Node.js dependencies (auto-generated)
├── package.json           # Node.js dependencies configuration
└── README.md              # This file
```

## 🔧 API Endpoints

### GET `/api/latest-ai-data`

Returns the most recently saved AI model from the `data/` directory.

**Response:**
```json
{
  "success": true,
  "data": {
    "generation": 42,
    "bestScore": 127,
    "bestBird": {...},
    "population": [...],
    "savedAt": "2024-01-15T10:30:00.000Z"
  },
  "filename": "flappy-bird-ai-gen42-score127.json",
  "savedAt": "2024-01-15T10:30:00.000Z"
}
```

## 📊 Training Tips

1. **Start Small**: Let the AI train for at least 10-20 generations
2. **Be Patient**: Significant improvement usually happens around generation 30-50
3. **Fast Mode**: Enable fast mode to speed up training (runs much faster)
4. **Save Often**: Save your best models periodically
5. **High Scores**: Well-trained AIs can achieve scores of 100+ consistently

## 🎯 Performance

- **Population Size**: 50 agents per generation
- **Mutation Rate**: 20% (configurable in code)
- **Elite Preservation**: Top 10% survive to next generation
- **Training Speed**: ~1-2 generations per minute (normal mode)
- **Typical Learning**: AI becomes competent around generation 30-50

## 🛠️ Technologies Used

- **JavaScript (ES6+)** - Main programming language
- **HTML5 Canvas** - Game rendering
- **Node.js + Express** - Backend server
- **Neural Network** - Custom implementation from scratch
- **Genetic Algorithm** - Custom implementation for AI evolution

## 📚 Documentation

For detailed documentation in Bosnian, see:
- **[docs/dokumentacija.md](docs/dokumentacija.md)** - Complete project documentation (Markdown)
- **[docs/dokumentacija.pdf](docs/dokumentacija.pdf)** - Complete project documentation (PDF)
- **[docs/dokumentacija.docx](docs/dokumentacija.docx)** - Complete project documentation (Word)

## 🎓 Learning Outcomes

This project demonstrates:
- How neural networks can make decisions based on game state
- How genetic algorithms can evolve solutions through generations
- The combination of these techniques for game AI
- Implementation of AI without external libraries or models

## ⚠️ Disclaimer

This project was created **for testing and play purposes** using Cursor AI assistant. It serves as:
- A learning exercise in AI/ML concepts
- A demonstration of genetic algorithms and neural networks
- An experimental playground for AI game agents

## 📝 Development History

This project was developed entirely through interaction with [Cursor](https://cursor.sh) using **Claude Opus 4.5**. The development process included:

1. Initial project creation (Flappy Bird clone + AI agent)
2. AI performance improvements (fixing save/load and play mode)
3. Node.js conversion (adding server and auto-load functionality)
4. UI/UX improvements (modernizing the interface)
5. Keyboard controls (SPACE key to start/play)

All code was generated through AI prompts, making this a comprehensive example of AI-assisted development.

## 🤝 Contributing

This is a personal project for testing and experimentation. Feel free to fork and experiment!

## 📄 License

This project is for educational and testing purposes. Feel free to use and modify as needed.

## 🙏 Acknowledgments

- Built with [Cursor](https://cursor.sh) and **Claude Opus 4.5**
- Inspired by the original Flappy Bird game
- Based on concepts from neural networks and genetic algorithms

---

**Enjoy watching the AI learn! 🚀**

