// Debug script to identify issues
console.log('🔍 Debug script loaded');

// Check if all required functions are available
function checkDependencies() {
    const checks = {
        'Chess constructor': typeof Chess !== 'undefined',
        'DOM loaded': document.readyState === 'complete' || document.readyState === 'interactive',
        'chess-board element': !!document.getElementById('chess-board'),
        'turn-display element': !!document.getElementById('turn-display'),
        'showGameMessage function': typeof showGameMessage === 'function',
        'initializeChessLogic function': typeof initializeChessLogic === 'function',
        'initializeUI function': typeof initializeUI === 'function'
    };
    
    console.log('📋 Dependency check results:');
    Object.entries(checks).forEach(([name, result]) => {
        console.log(`${result ? '✅' : '❌'} ${name}: ${result}`);
    });
    
    return checks;
}

// Simple chess initialization without dependencies
function simpleChessInit() {
    console.log('🎯 Attempting simple chess initialization...');
    
    try {
        // Clear any existing error messages
        const gameMessage = document.getElementById('game-message');
        if (gameMessage) {
            gameMessage.style.display = 'none';
        }
        
        // Check if Chess is available
        if (typeof Chess === 'undefined') {
            throw new Error('Chess.js not loaded');
        }
        
        // Initialize chess
        window.chess = new Chess();
        console.log('✅ Chess.js initialized successfully');
        
        // Create basic board
        createBasicBoard();
        
        // Show success message
        if (typeof showGameMessage === 'function') {
            showGameMessage('✅ Chess game loaded successfully!', 3000);
        } else {
            console.log('✅ Chess game loaded successfully!');
        }
        
    } catch (error) {
        console.error('❌ Simple chess init failed:', error);
        
        // Show error in a basic way
        const gameMessage = document.getElementById('game-message');
        if (gameMessage) {
            gameMessage.innerHTML = `❌ Debug Error: ${error.message}`;
            gameMessage.className = 'game-message error';
            gameMessage.style.display = 'block';
            gameMessage.style.background = 'rgba(231, 76, 60, 0.9)';
            gameMessage.style.color = 'white';
            gameMessage.style.padding = '10px';
            gameMessage.style.borderRadius = '5px';
            gameMessage.style.position = 'fixed';
            gameMessage.style.top = '20px';
            gameMessage.style.left = '50%';
            gameMessage.style.transform = 'translateX(-50%)';
            gameMessage.style.zIndex = '1000';
        }
    }
}

function createBasicBoard() {
    const board = document.getElementById('chess-board');
    if (!board) {
        throw new Error('Chess board element not found');
    }
    
    board.innerHTML = '';
    
    // Create a simple 8x8 grid with starting position
    const startingPosition = {
        'a8': '♜', 'b8': '♞', 'c8': '♝', 'd8': '♛', 'e8': '♚', 'f8': '♝', 'g8': '♞', 'h8': '♜',
        'a7': '♟', 'b7': '♟', 'c7': '♟', 'd7': '♟', 'e7': '♟', 'f7': '♟', 'g7': '♟', 'h7': '♟',
        'a2': '♙', 'b2': '♙', 'c2': '♙', 'd2': '♙', 'e2': '♙', 'f2': '♙', 'g2': '♙', 'h2': '♙',
        'a1': '♖', 'b1': '♘', 'c1': '♗', 'd1': '♕', 'e1': '♔', 'f1': '♗', 'g1': '♘', 'h1': '♖'
    };
    
    for (let rank = 8; rank >= 1; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = document.createElement('div');
            const squareName = String.fromCharCode(97 + file) + rank;
            const isLight = (rank + file) % 2 === 0;
            
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.dataset.square = squareName;
            square.textContent = startingPosition[squareName] || '';
            square.style.fontSize = '2rem';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            
            board.appendChild(square);
        }
    }
    
    console.log('✅ Basic board created');
}

// Run debug check when script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Debug script: DOM loaded');
    setTimeout(() => {
        checkDependencies();
        simpleChessInit();
    }, 100);
});

// Also run if DOM already loaded
if (document.readyState !== 'loading') {
    console.log('🚀 Debug script: DOM already loaded');
    setTimeout(() => {
        checkDependencies();
        simpleChessInit();
    }, 100);
}