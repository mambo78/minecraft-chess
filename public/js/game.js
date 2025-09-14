// Main game initialization
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 Initializing Chess Game v6...');
        
        // Check if Chess.js is loaded
        if (typeof Chess === 'undefined') {
            throw new Error('Chess.js library not loaded');
        }
        
        // Initialize chess logic
        initializeChessLogic();
        
        // Initialize UI
        initializeUI();
        
        console.log('✅ Chess game initialized successfully!');
        
        // Hide any error messages
        const errorMessage = document.getElementById('game-message');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        
    } catch (error) {
        console.error('❌ Failed to initialize chess game:', error);
        showGameMessage('Failed to load game. Please refresh the page.', 0, 'error');
    }
});

// Add error handling for script loading
window.addEventListener('error', function(e) {
    console.error('Script error:', e);
    if (e.filename && e.filename.includes('chess')) {
        showGameMessage('Failed to load chess engine. Please check your internet connection and refresh.', 0, 'error');
    }
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // DOM hasn't finished loading yet
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // DOM has already loaded
    initGame();
}

function initGame() {
    // This is a backup initialization function
    if (typeof chess === 'undefined' || chess === null) {
        try {
            initializeChessLogic();
            initializeUI();
        } catch (error) {
            console.error('Backup initialization failed:', error);
        }
    }
}