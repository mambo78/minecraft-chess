// UI controller for game interactions
function initializeUI() {
    setupGameControls();
    console.log('🎨 UI initialized');
}

function setupGameControls() {
    // New game button
    const newGameBtn = document.getElementById('new-game-btn');
    newGameBtn.addEventListener('click', startNewGame);
    
    // Undo button
    const undoBtn = document.getElementById('undo-btn');
    undoBtn.addEventListener('click', undoLastMove);
    
    // Hint button
    const hintBtn = document.getElementById('hint-btn');
    hintBtn.addEventListener('click', showHint);
}

function startNewGame() {
    // Reset chess game
    chess.reset();
    selectedSquare = null;
    
    // Update display
    updateBoard();
    updateTurnDisplay();
    updateMoveHistory();
    updateCapturedPieces();
    clearHighlights();
    
    // Hide promotion dialog if open
    const promotionDialog = document.getElementById('promotion-dialog');
    promotionDialog.classList.add('hidden');
    
    showGameMessage('🔄 New game started! Good luck!', 3000);
}

function undoLastMove() {
    // Check if there are moves to undo
    const history = chess.history();
    if (history.length === 0) {
        showGameMessage('❌ No moves to undo!', 2000, 'warning');
        return;
    }
    
    // Undo the last move
    const lastMove = chess.undo();
    
    // If in AI mode and the last move was by AI, undo one more (player's move)
    if (gameMode === 'ai' && history.length > 1) {
        const secondLastMove = chess.undo();
    }
    
    // Clear selection and update display
    selectedSquare = null;
    updateBoard();
    updateTurnDisplay();
    updateMoveHistory();
    updateCapturedPieces();
    clearHighlights();
    
    showGameMessage('↶ Move undone!', 2000);
}

function showHint() {
    const moves = chess.moves({ verbose: true });
    
    if (moves.length === 0) {
        showGameMessage('❌ No legal moves available!', 2000, 'warning');
        return;
    }
    
    // Prioritize good moves
    let hintMoves = moves;
    
    // Look for captures first
    const captures = moves.filter(move => move.captured);
    if (captures.length > 0) {
        hintMoves = captures;
    } else {
        // Look for checks
        const checks = moves.filter(move => {
            chess.move(move);
            const inCheck = chess.inCheck();
            chess.undo();
            return inCheck;
        });
        
        if (checks.length > 0) {
            hintMoves = checks;
        }
    }
    
    // Select a random hint move
    const hintMove = hintMoves[Math.floor(Math.random() * hintMoves.length)];
    
    // Clear previous selection and highlights
    clearSelection();
    clearHighlights();
    
    // Highlight the hint move
    const fromSquare = document.querySelector(`[data-square="${hintMove.from}"]`);
    const toSquare = document.querySelector(`[data-square="${hintMove.to}"]`);
    
    if (fromSquare && toSquare) {
        // Add hint highlighting
        fromSquare.style.backgroundColor = '#9b59b6';
        fromSquare.style.animation = 'hint-glow 1.5s ease-in-out 3';
        
        toSquare.style.backgroundColor = '#8e44ad';
        toSquare.style.animation = 'hint-glow 1.5s ease-in-out 3';
        
        // Remove hint highlighting after animation
        setTimeout(() => {
            fromSquare.style.backgroundColor = '';
            fromSquare.style.animation = '';
            toSquare.style.backgroundColor = '';
            toSquare.style.animation = '';
        }, 4500);
        
        // Show hint message
        const moveDescription = hintMove.captured ? 
            `💡 Hint: Capture with ${hintMove.san}!` : 
            `💡 Hint: Try ${hintMove.san}!`;
        
        showGameMessage(moveDescription, 4000);
    }
}

// Add CSS animation for hints
function addHintAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes hint-glow {
            0%, 100% { 
                box-shadow: 0 0 10px rgba(155, 89, 182, 0.8);
                transform: scale(1);
            }
            50% { 
                box-shadow: 0 0 30px rgba(155, 89, 182, 1);
                transform: scale(1.05);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize hint animation
addHintAnimation();