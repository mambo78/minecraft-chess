class MathiasChess {
    constructor() {
        this.chess = new Chess();
        this.ui = new ChessUI(this.chess);
        this.multiplayer = new Multiplayer(this.ui);
        this.themes = new ChessThemes();
        this.ai = new ChessAI(this.chess);
        this.gameMode = 'human'; // 'human' or 'ai'
        this.isAiGame = false;
        
        this.initializeGame();
        this.bindEvents();
        
        // Apply initial theme
        this.themes.applyTheme();
        
        console.log('🎮 Mathias Chess initialized successfully!');
    }

    initializeGame() {
        // Add remote game handling methods to UI
        this.ui.handleRemoteMove = (fromRow, fromCol, toRow, toCol) => {
            const success = this.chess.makeMove(fromRow, fromCol, toRow, toCol);
            if (success) {
                this.ui.updateDisplay();
            }
        };

        this.ui.handleRemoteNewGame = () => {
            this.chess.resetGame();
            this.ui.clearSelection();
            this.ui.updateDisplay();
            this.ui.showMessage('Opponent started a new game', 'info');
        };

        // Override UI move handling to include multiplayer
        const originalHandleSquareClick = this.ui.handleSquareClick.bind(this.ui);
        this.ui.handleSquareClick = (row, col) => {
            // Check if player can make moves in multiplayer (but not in AI mode)
            if (!this.isAiGame && !this.multiplayer.canMakeMove()) {
                this.ui.showMessage("It's not your turn!", 'warning');
                return;
            }
            
            // In AI mode, only allow white (human) player to move
            if (this.isAiGame && this.chess.currentPlayer === 'black') {
                this.ui.showMessage("Wait for AI to move!", 'warning');
                return;
            }

            const piece = this.chess.getPiece(row, col);
            
            // If a square is selected and this is a valid move
            if (this.ui.selectedSquare) {
                const possibleMove = this.ui.possibleMoves.find(move => 
                    move.row === row && move.col === col);
                
                if (possibleMove) {
                    // Make the move
                    const success = this.chess.makeMove(
                        this.ui.selectedSquare.row, 
                        this.ui.selectedSquare.col, 
                        row, 
                        col
                    );
                    
                    if (success) {
                        // Send move to multiplayer if connected
                        this.multiplayer.sendMove(
                            this.ui.selectedSquare.row,
                            this.ui.selectedSquare.col,
                            row,
                            col
                        );

                        this.ui.showMessage('Move made!', 'success');
                        this.ui.updateDisplay();
                        
                        // Check game status
                        const status = this.chess.gameStatus;
                        if (status === 'check') {
                            this.ui.showMessage(`${this.chess.currentPlayer} is in check!`, 'warning');
                        } else if (status === 'checkmate') {
                            const winner = this.chess.currentPlayer === 'white' ? 'Black' : 'White';
                            this.ui.showMessage(`Checkmate! ${winner} wins!`, 'success');
                        } else if (status === 'stalemate') {
                            this.ui.showMessage('Stalemate! Game is a draw.', 'info');
                        }
                        
                        // Handle AI move if in AI mode
                        if (this.isAiGame && this.chess.currentPlayer === 'black' && status === 'active') {
                            console.log('🤖 Triggering AI move...');
                            setTimeout(() => {
                                console.log('🤖 Making AI move now...');
                                this.makeAiMove();
                            }, 100);
                        }
                    }
                }
                
                // Clear selection
                this.ui.clearSelection();
            }
            // Select a piece if it belongs to current player
            else if (piece && piece.color === this.chess.currentPlayer) {
                this.ui.selectSquare(row, col);
            }
        };
    }

    bindEvents() {
        // New Game button
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.newGame();
            });
        }

        // Undo Move button
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undoMove();
            });
        }

        // Hint button
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                this.ui.showHint();
            });
        }

        // Theme selector
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.themes.setTheme(e.target.value);
                this.ui.showMessage(`Theme changed to ${this.themes.getCurrentTheme().name}! 🎨`, 'success');
            });
        }

        // Random theme button
        const randomThemeBtn = document.getElementById('random-theme-btn');
        if (randomThemeBtn) {
            randomThemeBtn.addEventListener('click', () => {
                const themes = this.themes.getAvailableThemes();
                const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                this.themes.setTheme(randomTheme.id);
                themeSelector.value = randomTheme.id;
                this.ui.showMessage(`Random theme: ${randomTheme.name}! 🎲`, 'success');
            });
        }
        
        // Game mode buttons
        const vsHumanBtn = document.getElementById('vs-human-btn');
        const vsAiBtn = document.getElementById('vs-ai-btn');
        const aiControls = document.getElementById('ai-controls');
        const aiHintBtn = document.getElementById('ai-hint-btn');
        
        if (vsHumanBtn) {
            vsHumanBtn.addEventListener('click', () => {
                this.setGameMode('human');
            });
        }
        
        if (vsAiBtn) {
            vsAiBtn.addEventListener('click', () => {
                this.setGameMode('ai');
            });
        }
        
        // AI difficulty selector
        const aiDifficultySelector = document.getElementById('ai-difficulty');
        if (aiDifficultySelector) {
            aiDifficultySelector.addEventListener('change', (e) => {
                this.ai.setDifficulty(e.target.value);
                this.updateAiInfo();
                this.ui.showMessage(`AI difficulty: ${this.ai.getDifficultyInfo().name}`, 'info');
            });
        }
        
        // AI hint button
        if (aiHintBtn) {
            aiHintBtn.addEventListener('click', () => {
                this.showAiHint();
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

        // Window resize handler for responsive design
        window.addEventListener('resize', () => {
            // Force redraw to ensure centering
            this.ui.updateDisplay();
        });

        // Prevent right-click context menu on game board
        const boardElement = document.getElementById('chess-board');
        if (boardElement) {
            boardElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }

        // Welcome message
        setTimeout(() => {
            this.ui.showMessage('Welcome to Mathias Chess! 🎮', 'success');
        }, 1000);
    }

    newGame() {
        if (this.multiplayer.isConnected && this.multiplayer.currentRoom) {
            // In multiplayer, send new game request
            this.multiplayer.sendNewGame();
            this.ui.showMessage('New game request sent!', 'info');
        } else {
            // Local new game
            this.chess.resetGame();
            this.ui.clearSelection();
            this.ui.updateDisplay();
            this.ui.showMessage('New game started!', 'success');
        }
    }

    undoMove() {
        if (this.multiplayer.isConnected && this.multiplayer.currentRoom) {
            this.ui.showMessage('Undo not available in multiplayer', 'warning');
            return;
        }

        if (this.chess.undoLastMove()) {
            this.ui.clearSelection();
            this.ui.updateDisplay();
            this.ui.showMessage('Move undone', 'info');
        } else {
            this.ui.showMessage('No moves to undo', 'warning');
        }
    }

    setGameMode(mode) {
        console.log(`🎮 Setting game mode to: ${mode}`);
        this.gameMode = mode;
        this.isAiGame = (mode === 'ai');
        console.log(`🤖 AI game mode: ${this.isAiGame}`);
        
        const vsHumanBtn = document.getElementById('vs-human-btn');
        const vsAiBtn = document.getElementById('vs-ai-btn');
        const aiControls = document.getElementById('ai-controls');
        const aiHintBtn = document.getElementById('ai-hint-btn');
        const hintBtn = document.getElementById('hint-btn');
        
        // Update button states
        if (vsHumanBtn && vsAiBtn) {
            vsHumanBtn.classList.toggle('active', mode === 'human');
            vsAiBtn.classList.toggle('active', mode === 'ai');
        }
        
        // Show/hide AI controls
        if (aiControls) {
            aiControls.classList.toggle('hidden', mode !== 'ai');
        }
        
        // Show/hide AI hint button
        if (aiHintBtn && hintBtn) {
            aiHintBtn.classList.toggle('hidden', mode !== 'ai');
            hintBtn.classList.toggle('hidden', mode === 'ai');
        }
        
        this.updateAiInfo();
        
        // Start new game in the new mode
        this.newGame();
        
        // If AI mode and it's black's turn after reset, trigger AI move
        if (this.isAiGame && this.chess.currentPlayer === 'black') {
            setTimeout(() => this.makeAiMove(), 500);
        }
        
        const modeText = mode === 'ai' ? 'vs Computer' : 'vs Human';
        this.ui.showMessage(`Game mode: ${modeText}`, 'success');
    }
    
    async makeAiMove() {
        console.log(`🤖 makeAiMove called - isAiGame: ${this.isAiGame}, currentPlayer: ${this.chess.currentPlayer}`);
        
        if (!this.isAiGame || this.chess.currentPlayer !== 'black') {
            console.log('🤖 Skipping AI move - not AI game or not black turn');
            return;
        }
        
        try {
            console.log('🤖 AI is thinking...');
            const aiMove = await this.ai.makeMove();
            
            if (aiMove) {
                console.log(`🤖 AI chose move: ${JSON.stringify(aiMove)}`);
                const success = this.chess.makeMove(
                    aiMove.from.row,
                    aiMove.from.col,
                    aiMove.to.row,
                    aiMove.to.col
                );
                
                if (success) {
                    console.log('🤖 AI move successful, updating display');
                    this.ui.updateDisplay();
                    
                    // Check game status after AI move
                    const status = this.chess.gameStatus;
                    if (status === 'check') {
                        this.ui.showMessage('You are in check! 🤖', 'warning');
                    } else if (status === 'checkmate') {
                        this.ui.showMessage('Checkmate! Computer wins! 🤖🏆', 'error');
                    } else if (status === 'stalemate') {
                        this.ui.showMessage('Stalemate! Game is a draw.', 'info');
                    }
                } else {
                    console.log('🤖 AI move failed!');
                }
            } else {
                console.log('🤖 No AI move found');
            }
        } catch (error) {
            console.error('AI move error:', error);
            this.ui.showMessage('AI error occurred', 'error');
        }
    }
    
    updateAiInfo() {
        const aiInfo = document.getElementById('ai-info');
        if (aiInfo && this.ai) {
            const difficulty = this.ai.getDifficultyInfo();
            aiInfo.textContent = difficulty.description;
        }
    }
    
    showAiHint() {
        if (!this.isAiGame) return;
        
        const hint = this.ai.getHint();
        if (hint) {
            const fromSquare = this.getSquareNotation(hint.from.row, hint.from.col);
            const toSquare = this.getSquareNotation(hint.to.row, hint.to.col);
            this.ui.showMessage(`💡 AI suggests: ${hint.piece.type} ${fromSquare} → ${toSquare}`, 'info');
            
            // Highlight the suggested move briefly
            this.highlightHint(hint);
        } else {
            this.ui.showMessage('No hints available', 'warning');
        }
    }
    
    highlightHint(hint) {
        const boardElement = document.getElementById('chess-board');
        const squares = boardElement.querySelectorAll('.square');
        
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            if ((row === hint.from.row && col === hint.from.col) || 
                (row === hint.to.row && col === hint.to.col)) {
                square.style.boxShadow = '0 0 20px #00FF00';
                setTimeout(() => {
                    square.style.boxShadow = '';
                }, 2000);
            }
        });
    }
    
    getSquareNotation(row, col) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        return files[col] + ranks[row];
    }
    
    getGameInfo() {
        const multiplayerInfo = this.multiplayer.getCurrentPlayerInfo();
        return {
            currentPlayer: this.chess.currentPlayer,
            gameStatus: this.chess.gameStatus,
            moveCount: this.chess.gameHistory.length,
            capturedPieces: this.chess.capturedPieces,
            multiplayer: multiplayerInfo,
            gameMode: this.gameMode,
            isAiGame: this.isAiGame,
            aiDifficulty: this.ai.getDifficultyInfo()
        };
    }

    // Development helpers (remove in production)
    debugMode() {
        console.log('🐛 Debug Mode Activated');
        window.chess = this.chess;
        window.ui = this.ui;
        window.multiplayer = this.multiplayer;
        window.game = this;
        
        this.ui.showMessage('Debug mode activated! Check console.', 'info');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.mathiasChess = new MathiasChess();
        
        // Enable debug mode with Ctrl+D
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                window.mathiasChess.debugMode();
            }
        });
    } catch (error) {
        console.error('Failed to initialize Mathias Chess:', error);
        
        // Show error message to user
        const messageElement = document.getElementById('game-message');
        if (messageElement) {
            messageElement.textContent = 'Failed to load game. Please refresh the page.';
            messageElement.className = 'game-message error show';
        }
    }
});