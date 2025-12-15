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
        this.frameCount = 0; // Track frames for fitness calculation and consistent physics
        
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
        
        // Increment frame counter for fitness calculation
        this.frameCount++;
        
        // Use reduced gravity for first 150 frames (~2.5 sec at 60fps) to help start
        const reducedGravityFrames = 150;
        const gravityMultiplier = this.frameCount < reducedGravityFrames 
            ? 0.3 + (this.frameCount / reducedGravityFrames) * 0.7
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
        this.frameCount = 0;
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

