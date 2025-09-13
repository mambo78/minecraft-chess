// Main Chess Game Controller
class ChessGame {
    constructor() {
        console.log('🚀 Initializing Chess Game...');
        
        this.chess = new Chess();
        this.ui = new ChessUI(this.chess);
        this.themes = new ChessThemes();
        this.stockfish = new StockfishEngine();
        
        this.gameMode = 'human'; // 'human' or 'ai'
        this.isAiGame = false;
        
        this.initializeGame();
        this.bindEvents();
        
        // Make game globally accessible for UI callbacks
        window.chessGame = this;
        
        console.log('✅ Chess Game initialized successfully!');
    }
    
    initializeGame() {
        // Apply initial theme
        setTimeout(() => {
            this.themes.applyTheme();
        }, 100);
        
        this.ui.showMessage('🎮 Welcome to Mathias Chess!', 'success');
    }
    
    bindEvents() {
        // Game mode buttons
        const humanModeBtn = document.getElementById('human-mode-btn');
        const aiModeBtn = document.getElementById('ai-mode-btn');
        
        if (humanModeBtn) {
            humanModeBtn.addEventListener('click', () => {
                this.setGameMode('human');
            });
        }
        
        if (aiModeBtn) {
            aiModeBtn.addEventListener('click', () => {
                this.setGameMode('ai');
            });
        }
        
        // AI difficulty selector
        const aiDifficultySelector = document.getElementById('ai-difficulty');
        if (aiDifficultySelector) {
            aiDifficultySelector.addEventListener('change', (e) => {
                this.stockfish.setDifficulty(e.target.value);
                const diffInfo = this.stockfish.getDifficultyInfo();
                this.ui.showMessage(`AI difficulty: ${diffInfo.name}`, 'info');
            });
        }
        
        // Theme selector
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                const success = this.themes.setTheme(e.target.value);
                if (success) {
                    const themeName = this.themes.getCurrentTheme().name;
                    this.ui.showMessage(`Theme changed to ${themeName}! 🎨`, 'success');
                } else {
                    this.ui.showMessage('Failed to change theme', 'error');
                }
            });
        }
        
        // Random theme button
        const randomThemeBtn = document.getElementById('random-theme-btn');
        if (randomThemeBtn) {
            randomThemeBtn.addEventListener('click', () => {
                const randomTheme = this.themes.getRandomTheme();
                this.themes.setTheme(randomTheme);
                
                // Update selector to match
                if (themeSelector) {
                    themeSelector.value = randomTheme;
                }
                
                const themeName = this.themes.getCurrentTheme().name;
                this.ui.showMessage(`Random theme: ${themeName}! 🎲`, 'success');
            });
        }
        
        // Control buttons
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.newGame();
            });
        }
        
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undoMove();
            });
        }
        
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                this.ui.showHint();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.ui.clearSelection();
            } else if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undoMove();
            } else if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.newGame();
            } else if (e.key === 'h' || e.key === 'H') {
                this.ui.showHint();
            }
        });
    }
    
    setGameMode(mode) {
        console.log(`🎮 Setting game mode to: ${mode}`);
        
        this.gameMode = mode;
        this.isAiGame = (mode === 'ai');
        
        const humanModeBtn = document.getElementById('human-mode-btn');
        const aiModeBtn = document.getElementById('ai-mode-btn');
        const aiControls = document.getElementById('ai-controls');
        
        // Update button states
        if (humanModeBtn && aiModeBtn) {
            humanModeBtn.classList.toggle('active', mode === 'human');
            aiModeBtn.classList.toggle('active', mode === 'ai');
        }
        
        // Show/hide AI controls
        if (aiControls) {
            aiControls.classList.toggle('hidden', mode !== 'ai');
        }
        
        // Start new game in the new mode
        this.newGame();
        
        const modeText = mode === 'ai' ? 'vs Stockfish AI' : 'vs Human';
        this.ui.showMessage(`Game mode: ${modeText}`, 'info');
    }
    
    newGame() {
        console.log('🔄 Starting new game');
        
        this.chess.resetGame();
        this.ui.clearSelection();
        this.ui.updateDisplay();
        this.ui.showMessage('New game started! ♟️', 'success');
        
        // If AI mode and it's black's turn, trigger AI move
        if (this.isAiGame && this.chess.currentPlayer === 'black') {
            setTimeout(() => this.makeAiMove(), 500);
        }
    }
    
    undoMove() {
        if (this.chess.gameHistory.length === 0) {
            this.ui.showMessage('No moves to undo', 'warning');
            return;
        }
        
        // In AI mode, undo two moves (player + AI)
        if (this.isAiGame && this.chess.gameHistory.length >= 2) {
            this.chess.undoLastMove(); // Undo AI move
            this.chess.undoLastMove(); // Undo player move
        } else {
            this.chess.undoLastMove();
        }
        
        this.ui.clearSelection();
        this.ui.updateDisplay();
        this.ui.showMessage('Move undone', 'info');
    }
    
    onPlayerMove() {
        console.log('🎯 Player move completed');
        
        // If it's AI mode and now it's black's turn, trigger AI move
        if (this.isAiGame && this.chess.currentPlayer === 'black' && this.chess.gameStatus === 'active') {
            console.log('🤖 Triggering AI move...');
            setTimeout(() => this.makeAiMove(), 300);
        }
    }
    
    async makeAiMove() {
        if (!this.isAiGame || this.chess.currentPlayer !== 'black') {
            return;
        }
        
        if (this.chess.gameStatus !== 'active') {
            console.log('🤖 Game not active, skipping AI move');
            return;
        }
        
        console.log('🤖 AI is thinking...');
        this.ui.showMessage('🤖 AI is thinking...', 'info');
        
        try {
            // Get FEN position for Stockfish
            const fenPosition = this.chess.toFEN();
            console.log('🤖 Current position:', fenPosition);
            
            // Get move from Stockfish (or fallback AI)
            let aiMove = await this.stockfish.makeMove(fenPosition);
            
            // If Stockfish didn't return a move, try simple random move
            if (!aiMove) {
                aiMove = this.getRandomValidMove();
            }
            
            if (aiMove) {
                console.log('🤖 AI chose move:', aiMove);
                
                const success = this.chess.makeMove(
                    aiMove.from.row,
                    aiMove.from.col,
                    aiMove.to.row,
                    aiMove.to.col
                );
                
                if (success) {
                    // Handle AI pawn promotion (auto-promote to queen)
                    if (this.chess.pendingPromotion) {
                        const promotionPiece = aiMove.promotion || 'queen';
                        this.chess.promotePawn(promotionPiece);
                        console.log(`🤖 AI promoted pawn to ${promotionPiece}`);
                    }
                    
                    this.ui.updateDisplay();
                    this.ui.checkGameStatus();
                    
                    console.log('✅ AI move completed successfully');
                } else {
                    console.error('❌ AI move failed');
                    this.ui.showMessage('AI move failed', 'error');
                }
            } else {
                console.warn('🤖 AI could not find a move');
                this.ui.showMessage('AI could not find a move', 'warning');
            }
        } catch (error) {
            console.error('🤖 AI move error:', error);
            this.ui.showMessage('AI error occurred', 'error');
        }
    }
    
    getRandomValidMove() {
        const moves = this.chess.getAllValidMoves('black');
        if (moves.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * moves.length);
        return moves[randomIndex];
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all elements are ready
    setTimeout(() => {
        try {
            new ChessGame();
        } catch (error) {
            console.error('❌ Failed to initialize chess game:', error);
            
            // Show error message to user
            const messageElement = document.getElementById('game-message');
            if (messageElement) {
                messageElement.textContent = 'Failed to load game. Please refresh the page.';
                messageElement.className = 'game-message error show';
            }
        }
    }, 100);
});