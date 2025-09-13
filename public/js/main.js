// Main game initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize game components
    const chess = new Chess();
    const ui = new UI(chess);
    const multiplayer = new Multiplayer(ui);

    // Make multiplayer globally available for UI callbacks
    window.gameMultiplayer = multiplayer;

    // Add multiplayer validation to UI move attempts
    const originalAttemptMove = ui.attemptMove;
    ui.attemptMove = function(fromRow, fromCol, toRow, toCol) {
        // Check if player can make moves in multiplayer
        if (!multiplayer.canMakeMove()) {
            ui.showMessage('Wait for your turn!', 'warning');
            return;
        }
        
        // Call original method
        originalAttemptMove.call(this, fromRow, fromCol, toRow, toCol);
    };

    // Display welcome message
    setTimeout(() => {
        ui.showMessage('Welcome to Minecraft Chess! 🎮', 'info');
    }, 1000);

    // Add some helpful tips
    setTimeout(() => {
        ui.showMessage('Click pieces to select them, then click where you want to move!', 'info');
    }, 4000);

    // Game statistics tracking
    let gameStats = {
        gamesPlayed: 0,
        movesPlayed: 0,
        hintsUsed: 0
    };

    // Load stats from localStorage if available
    const savedStats = localStorage.getItem('minecraftChessStats');
    if (savedStats) {
        gameStats = { ...gameStats, ...JSON.parse(savedStats) };
    }

    // Override methods to track statistics
    const originalMakeMove = chess.makeMove;
    chess.makeMove = function(fromRow, fromCol, toRow, toCol) {
        const result = originalMakeMove.call(this, fromRow, fromCol, toRow, toCol);
        if (result) {
            gameStats.movesPlayed++;
            saveStats();
        }
        return result;
    };

    const originalResetGame = chess.resetGame;
    chess.resetGame = function() {
        originalResetGame.call(this);
        gameStats.gamesPlayed++;
        saveStats();
    };

    const originalShowHint = ui.showHint;
    ui.showHint = function() {
        originalShowHint.call(this);
        gameStats.hintsUsed++;
        saveStats();
    };

    function saveStats() {
        localStorage.setItem('minecraftChessStats', JSON.stringify(gameStats));
    }

    // Add stats display (can be expanded later)
    function showStats() {
        const message = `Games: ${gameStats.gamesPlayed} | Moves: ${gameStats.movesPlayed} | Hints: ${gameStats.hintsUsed}`;
        ui.showMessage(message, 'info');
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+S to show stats
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            showStats();
        }
        
        // Ctrl+N for new game
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            ui.newGame();
        }
        
        // Ctrl+H for hint
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            ui.showHint();
        }

        // F1 for help
        if (e.key === 'F1') {
            e.preventDefault();
            showHelp();
        }
    });

    function showHelp() {
        const helpText = `
🎮 Minecraft Chess Help 🎮

Controls:
• Click pieces to select them
• Click empty squares or opponent pieces to move
• ESC - Clear selection
• Ctrl+Z - Undo move
• Ctrl+N - New game
• Ctrl+H - Show hint
• Ctrl+S - Show statistics
• F1 - Show this help

Multiplayer:
• Click "Connect to Server" to go online
• Join a room to play with others
• Share room ID with friends to play together

Pieces (Minecraft themed):
• King: 🤴/👹 • Queen: 👸/🧟‍♀️ • Rook: 🏰/🗿
• Bishop: 🧙/🧙‍♂️ • Knight: 🐴/🐷 • Pawn: 👤/🧟

Have fun learning chess! 🏆
        `;
        
        alert(helpText);
    }

    // Performance optimization: throttle UI updates
    let updateThrottle = false;
    const originalUpdateDisplay = ui.updateDisplay;
    ui.updateDisplay = function() {
        if (!updateThrottle) {
            updateThrottle = true;
            setTimeout(() => {
                originalUpdateDisplay.call(this);
                updateThrottle = false;
            }, 16); // ~60fps
        }
    };

    // Add visibility change handler to pause/resume animations
    document.addEventListener('visibilitychange', () => {
        const pieces = document.querySelectorAll('.piece');
        if (document.hidden) {
            pieces.forEach(piece => piece.style.animationPlayState = 'paused');
        } else {
            pieces.forEach(piece => piece.style.animationPlayState = 'running');
        }
    });

    // Add touch support for mobile devices
    let touchStartPos = null;
    
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
        }
    });

    document.addEventListener('touchend', (e) => {
        if (touchStartPos && e.changedTouches.length === 1) {
            const touch = e.changedTouches[0];
            const deltaX = Math.abs(touch.clientX - touchStartPos.x);
            const deltaY = Math.abs(touch.clientY - touchStartPos.y);
            
            // If touch didn't move much, treat as a click
            if (deltaX < 10 && deltaY < 10) {
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element) {
                    element.click();
                }
            }
        }
        touchStartPos = null;
    });

    // Prevent zooming on double tap for mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Add sound effects (placeholder - would need actual sound files)
    function playSound(soundName) {
        // This would play actual Minecraft sounds if audio files were available
        // For now, just log the sound that would be played
        if (console && console.log) {
            console.log(`🔊 Playing sound: ${soundName}`);
        }
    }

    // Hook into game events for sound effects
    const originalHandleSquareClick = ui.handleSquareClick;
    ui.handleSquareClick = function(row, col) {
        const clickedPiece = this.chess.getPiece(row, col);
        
        if (!this.selectedSquare && clickedPiece && clickedPiece.color === this.chess.currentPlayer) {
            playSound('minecraft:block.wood.place');
        } else if (this.selectedSquare) {
            const selectedPiece = this.chess.getPiece(this.selectedSquare.row, this.selectedSquare.col);
            if (selectedPiece && this.chess.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                if (clickedPiece) {
                    playSound('minecraft:entity.generic.explode'); // Capture
                } else {
                    playSound('minecraft:block.grass.step'); // Regular move
                }
            }
        }
        
        originalHandleSquareClick.call(this, row, col);
    };

    // Log successful initialization
    console.log('🎮 Minecraft Chess initialized successfully!');
    console.log('📊 Game statistics tracking enabled');
    console.log('🌐 Multiplayer support ready');
    console.log('🎵 Sound system initialized (placeholder)');
    console.log('📱 Touch controls enabled');
    console.log('⌨️ Keyboard shortcuts enabled');
    
    // Show initial game state
    ui.updateDisplay();
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Game Error:', e.error);
    
    // Try to show user-friendly error message
    if (window.gameUI) {
        window.gameUI.showMessage('Something went wrong! Please refresh the page.', 'error');
    }
});

// Prevent context menu on right-click for better game experience
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});