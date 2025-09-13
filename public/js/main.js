class MathiasChess {
    constructor() {
        this.chess = new Chess();
        this.ui = new ChessUI(this.chess);
        this.multiplayer = new Multiplayer(this.ui);
        this.themes = new ChessThemes();
        
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
            // Check if player can make moves in multiplayer
            if (!this.multiplayer.canMakeMove()) {
                this.ui.showMessage("It's not your turn!", 'warning');
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

    getGameInfo() {
        const multiplayerInfo = this.multiplayer.getCurrentPlayerInfo();
        return {
            currentPlayer: this.chess.currentPlayer,
            gameStatus: this.chess.gameStatus,
            moveCount: this.chess.gameHistory.length,
            capturedPieces: this.chess.capturedPieces,
            multiplayer: multiplayerInfo
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