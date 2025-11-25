const GameStates = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
    HIGH_SCORES: 'highScores'
};

class Game {
    constructor() {
        console.log('Game constructor started');
        this.canvas = document.getElementById('gameCanvas');
        console.log('Canvas element:', this.canvas);
        
        this.state = GameStates.MENU;
        this.score = 0;
        this.consecutiveHits = 0;
        this.strikes = 0;
        
        // Initialize systems
        this.highScoreManager = new HighScoreManager();
        this.renderer = new Renderer(this.canvas);
        this.particles = new Particles();
        this.pitch = null;
        this.inputManager = null;
        
        // Animation
        this.swingAnimation = 0;
        this.nextPitchDelay = 0;
        
        console.log('About to setup UI');
        this.setupUI();
        this.updateHighScoreDisplay();
        
        // Ensure the initial screen is shown
        this.updateUI();
        console.log('Game constructor completed');
    }

    setupUI() {
        // Check if elements exist before adding listeners
        const startBtn = document.getElementById('startBtn');
        const scoresBtn = document.getElementById('scoresBtn');
        const playAgain = document.getElementById('playAgain');
        const mainMenu = document.getElementById('mainMenu');
        const submitScore = document.getElementById('submitScore');
        const nameInput = document.getElementById('nameInput');
        const backBtn = document.getElementById('backBtn');

        if (!startBtn) {
            console.error('startBtn element not found!');
            return;
        }

        // Menu buttons
        startBtn.addEventListener('click', () => {
            console.log('Start button clicked!');
            this.startGame();
        });

        if (scoresBtn) {
            scoresBtn.addEventListener('click', () => {
                console.log('Scores button clicked!');
                this.showHighScores();
            });
        }

        // Game over buttons
        if (playAgain) {
            playAgain.addEventListener('click', () => {
                this.startGame();
            });
        }

        if (mainMenu) {
            mainMenu.addEventListener('click', () => {
                this.setState(GameStates.MENU);
            });
        }

        if (submitScore) {
            submitScore.addEventListener('click', () => {
                this.submitHighScore();
            });
        }

        // Allow Enter key to submit score
        if (nameInput) {
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitHighScore();
                }
            });
        }

        // High scores back button
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.setState(GameStates.MENU);
            });
        }
    }

    setState(newState) {
        console.log('setState called:', this.state, '->', newState);
        this.state = newState;
        this.updateUI();
    }

    updateUI() {
        console.log('updateUI called with state:', this.state);
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        
        // Show current screen (only for non-playing states)
        if (this.state !== GameStates.PLAYING) {
            const screenMap = {
                [GameStates.MENU]: 'menu',
                [GameStates.GAME_OVER]: 'gameOver',
                [GameStates.HIGH_SCORES]: 'highScores'
            };
            
            const screenId = screenMap[this.state];
            console.log('Showing screen:', screenId);
            
            if (screenId) {
                const screenElement = document.getElementById(screenId);
                if (screenElement) {
                    screenElement.classList.remove('hidden');
                    console.log('Screen element found and shown:', screenId);
                } else {
                    console.error('Screen element not found:', screenId);
                }
            }
        } else {
            console.log('Game is playing - no overlay screen shown');
        }
    }

    startGame() {
        console.log('startGame called');
        this.score = 0;
        this.consecutiveHits = 0;
        this.strikes = 0;
        this.setState(GameStates.PLAYING);
        this.particles.clear();
        
        // Set delay for first pitch (2 seconds)
        this.nextPitchDelay = 120; // 2 seconds at 60fps
        
        // Update score display
        this.updateScore();
        
        // Start game loop immediately but don't create pitch yet
        setTimeout(() => {
            // Setup input if not already done
            if (!this.inputManager) {
                this.inputManager = new InputManager(this.canvas, () => this.swing());
            }
            
            // Start game loop - first pitch will be created by nextPitchDelay countdown
            this.gameLoop();
        }, 100); // Small delay to let menu fade out
    }

    swing() {
        if (this.state !== GameStates.PLAYING || !this.pitch || !this.pitch.active) {
            return;
        }

        const result = this.pitch.swing();
        this.swingAnimation = 10; // Frames to show swing
        
        if (result.hit) {
            // HOME RUN!
            this.score++;
            this.consecutiveHits++;
            this.updateScore();
            
            // Particles!
            const ballX = this.pitch.x;
            const ballY = this.pitch.y;
            const color = result.result === 'perfect' ? '#FFD700' : '#FFA500';
            this.particles.add(ballX, ballY, color, 30);
            
            // Feedback text
            const feedbackText = result.result === 'perfect' ? 'PERFECT!' : 'HOME RUN!';
            this.showFeedback(feedbackText);
            
            // Queue next pitch
            this.nextPitchDelay = 150; // ~2.5 seconds at 60fps
            
        } else {
            // MISS - Strike!
            this.strikes++;
            this.updateScore();
            
            if (this.strikes >= 3) {
                this.showFeedback('STRIKE 3 - OUT!');
                setTimeout(() => {
                    this.endGame();
                }, 1000);
            } else {
                this.showFeedback(`STRIKE ${this.strikes}!`);
                // Queue next pitch after a miss
                this.nextPitchDelay = 90; // Shorter delay after a miss
            }
        }
    }

    showFeedback(text) {
        const feedback = document.getElementById('swingFeedback');
        feedback.textContent = text;
        feedback.classList.remove('hidden');
        
        setTimeout(() => {
            feedback.classList.add('hidden');
        }, 800);
    }

    updateScore() {
        document.getElementById('score').textContent = `Home Runs: ${this.score} | Strikes: ${this.strikes}/3`;
    }

    updateHighScoreDisplay() {
        const highScore = this.highScoreManager.getHighScore();
        document.getElementById('highScore').textContent = `High Score: ${highScore}`;
    }

    async endGame() {
        this.setState(GameStates.GAME_OVER);
        document.getElementById('finalScore').textContent = `Home Runs: ${this.score}`;
        
        // Check if it's a high score (async now)
        const isHigh = await this.highScoreManager.isHighScore(this.score);
        if (isHigh) {
            document.getElementById('newHighScore').classList.remove('hidden');
            document.getElementById('nameInput').value = '';
            document.getElementById('nameInput').focus();
        } else {
            document.getElementById('newHighScore').classList.add('hidden');
        }
    }

    async submitHighScore() {
        const name = document.getElementById('nameInput').value;
        await this.highScoreManager.addScore(name, this.score);
        this.updateHighScoreDisplay();
        document.getElementById('newHighScore').classList.add('hidden');
    }

    async showHighScores() {
        console.log('showHighScores called');
        this.setState(GameStates.HIGH_SCORES);
        await this.highScoreManager.displayScores('scoresList');
    }

    gameLoop() {
        if (this.state !== GameStates.PLAYING) return;

        // Clear and draw background
        this.renderer.clear();
        this.renderer.drawField();
        
        // Draw batter
        this.renderer.drawBatter();
        
        // Draw swing animation
        if (this.swingAnimation > 0) {
            this.renderer.drawSwingAnimation();
            this.swingAnimation--;
        }
        
        // Update and draw pitch
        if (this.pitch && this.pitch.active) {
            this.pitch.update();
            this.renderer.drawPitch(this.pitch);
            
            // Check if pitch went past without being hit
            if (!this.pitch.active && !this.pitch.wasSwungAt) {
                // Didn't swing at a pitch - Strike!
                this.strikes++;
                this.updateScore();
                
                if (this.strikes >= 3) {
                    this.showFeedback('STRIKE 3 - OUT!');
                    setTimeout(() => {
                        this.endGame();
                    }, 1000);
                    return;
                } else {
                    this.showFeedback(`STRIKE ${this.strikes}!`);
                    // Queue next pitch after missing
                    this.nextPitchDelay = 180; // 3 seconds at 60fps
                }
            }
        }
        
        // Handle next pitch
        if (this.nextPitchDelay > 0) {
            this.nextPitchDelay--;
            if (this.nextPitchDelay === 0) {
                this.pitch = new Pitch(this.canvas);
            }
        }
        
        // Update and draw particles
        this.particles.update();
        this.particles.draw(this.renderer.ctx);
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global reference to game instance
let gameInstance = null;

// Global functions for inline onclick testing
window.testStartGame = function() {
    console.log('testStartGame called');
    if (gameInstance) {
        gameInstance.startGame();
    } else {
        console.error('Game instance not available');
    }
};

window.testShowHighScores = function() {
    console.log('testShowHighScores called');
    if (gameInstance) {
        gameInstance.showHighScores();
    } else {
        console.error('Game instance not available');
    }
};

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, creating game...');
    gameInstance = new Game();
});

// Backup: also listen for window load
window.addEventListener('load', () => {
    console.log('Window load event fired');
});
