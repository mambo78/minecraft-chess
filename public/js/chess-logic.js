// Chess game logic using chess.js
let chess = null;
let selectedSquare = null;
let gameMode = 'human';
let currentDifficulty = 'medium';

const pieceSymbols = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

function initializeChessLogic() {
    // Initialize chess.js
    chess = new Chess();
    console.log('♟️ Chess.js initialized');
    
    // Initialize board
    createBoard();
    updateBoard();
    
    // Set up game mode controls
    setupGameModeControls();
    
    // Set initial theme
    changeTheme('classic');
}

function createBoard() {
    const board = document.getElementById('chess-board');
    board.innerHTML = '';
    
    // Create squares from rank 8 to 1, file a to h
    for (let rank = 8; rank >= 1; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = document.createElement('div');
            const squareName = String.fromCharCode(97 + file) + rank; // a1, b1, etc.
            const isLight = (rank + file) % 2 === 0;
            
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.dataset.square = squareName;
            square.addEventListener('click', () => handleSquareClick(squareName));
            
            board.appendChild(square);
        }
    }
}

function handleSquareClick(squareName) {
    // Don't allow clicks during AI turn
    if (gameMode === 'ai' && chess.turn() === 'b') {
        return;
    }
    
    if (selectedSquare) {
        // If clicking the same square, deselect
        if (selectedSquare === squareName) {
            clearSelection();
            return;
        }
        
        // Try to make a move
        const piece = chess.get(selectedSquare);
        
        // Check for pawn promotion
        if (piece && piece.type === 'p') {
            const targetRank = squareName[1];
            if ((piece.color === 'w' && targetRank === '8') || 
                (piece.color === 'b' && targetRank === '1')) {
                showPromotionDialog(selectedSquare, squareName);
                return;
            }
        }
        
        // Try to make the move
        const move = chess.move({
            from: selectedSquare,
            to: squareName,
            promotion: 'q' // Default to queen, will be overridden in promotion dialog
        });
        
        if (move) {
            // Move was successful
            clearSelection();
            updateBoard();
            updateTurnDisplay();
            updateMoveHistory();
            updateCapturedPieces();
            
            // Check for game end
            if (checkGameEnd()) {
                return;
            }
            
            // If AI mode and now it's black's turn, make AI move
            if (gameMode === 'ai' && chess.turn() === 'b') {
                setTimeout(makeAIMove, 500);
            }
        } else {
            // Invalid move, try to select the clicked square instead
            const clickedPiece = chess.get(squareName);
            if (clickedPiece && clickedPiece.color === chess.turn()) {
                selectSquare(squareName);
            } else {
                clearSelection();
            }
        }
    } else {
        // No square selected, try to select this square
        const piece = chess.get(squareName);
        if (piece && piece.color === chess.turn()) {
            selectSquare(squareName);
        }
    }
}

function selectSquare(squareName) {
    selectedSquare = squareName;
    updateBoard();
    highlightValidMoves(squareName);
}

function clearSelection() {
    selectedSquare = null;
    updateBoard();
    clearHighlights();
}

function highlightValidMoves(squareName) {
    clearHighlights();
    const moves = chess.moves({ square: squareName, verbose: true });
    
    moves.forEach(move => {
        const square = document.querySelector(`[data-square="${move.to}"]`);
        if (square) {
            square.classList.add('valid-move');
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('valid-move');
    });
}

function updateBoard() {
    const board = chess.board();
    
    // Clear all squares and update with current position
    document.querySelectorAll('.square').forEach(square => {
        const squareName = square.dataset.square;
        const file = squareName.charCodeAt(0) - 97; // a=0, b=1, etc.
        const rank = parseInt(squareName[1]) - 1;   // 1=0, 2=1, etc.
        
        const piece = board[7-rank][file]; // board is indexed from rank 8 to 1
        
        // Update piece symbol
        if (piece) {
            const symbol = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
            square.textContent = pieceSymbols[symbol];
        } else {
            square.textContent = '';
        }
        
        // Update square styling
        square.classList.remove('selected', 'in-check');
        
        if (selectedSquare === squareName) {
            square.classList.add('selected');
        }
        
        // Highlight king in check
        if (piece && piece.type === 'k' && piece.color === chess.turn() && chess.inCheck()) {
            square.classList.add('in-check');
        }
    });
}

function makeAIMove() {
    if (chess.turn() !== 'b' || gameMode !== 'ai') return;
    
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return;
    
    // Simple AI: prefer captures, then checks, then random
    let selectedMoves = moves;
    
    // Look for captures first
    const captures = moves.filter(move => move.captured);
    if (captures.length > 0) {
        selectedMoves = captures;
    } else {
        // Look for checks
        const checks = moves.filter(move => {
            chess.move(move);
            const inCheck = chess.inCheck();
            chess.undo();
            return inCheck;
        });
        
        if (checks.length > 0) {
            selectedMoves = checks;
        }
    }
    
    // Pick a random move from selected moves
    const randomMove = selectedMoves[Math.floor(Math.random() * selectedMoves.length)];
    
    // Make the move
    chess.move(randomMove);
    
    // Update display
    updateBoard();
    updateTurnDisplay();
    updateMoveHistory();
    updateCapturedPieces();
    
    // Check for game end
    checkGameEnd();
}

function showPromotionDialog(from, to) {
    const dialog = document.getElementById('promotion-dialog');
    dialog.classList.remove('hidden');
    
    // Set up promotion buttons
    const buttons = document.querySelectorAll('.promotion-btn');
    const isWhite = chess.turn() === 'w';
    
    // Update button symbols
    buttons[0].querySelector('.piece-symbol').textContent = isWhite ? '♕' : '♛'; // Queen
    buttons[1].querySelector('.piece-symbol').textContent = isWhite ? '♖' : '♜'; // Rook
    buttons[2].querySelector('.piece-symbol').textContent = isWhite ? '♗' : '♝'; // Bishop
    buttons[3].querySelector('.piece-symbol').textContent = isWhite ? '♘' : '♞'; // Knight
    
    // Handle button clicks
    buttons.forEach((button, index) => {
        button.onclick = () => {
            const pieces = ['q', 'r', 'b', 'n'];
            const move = chess.move({
                from: from,
                to: to,
                promotion: pieces[index]
            });
            
            dialog.classList.add('hidden');
            
            if (move) {
                clearSelection();
                updateBoard();
                updateTurnDisplay();
                updateMoveHistory();
                updateCapturedPieces();
                
                // Check for game end
                if (checkGameEnd()) {
                    return;
                }
                
                // If AI mode and now it's black's turn, make AI move
                if (gameMode === 'ai' && chess.turn() === 'b') {
                    setTimeout(makeAIMove, 500);
                }
            }
        };
    });
}

function updateTurnDisplay() {
    const turnDisplay = document.getElementById('turn-display');
    const currentTurn = chess.turn() === 'w' ? 'White' : 'Black';
    
    if (chess.isCheckmate()) {
        const winner = chess.turn() === 'w' ? 'Black' : 'White';
        turnDisplay.textContent = `${winner} Wins!`;
        showGameMessage(`🏆 Checkmate! ${winner} wins!`, 5000);
    } else if (chess.isStalemate()) {
        turnDisplay.textContent = 'Stalemate!';
        showGameMessage('🤝 Stalemate! It\'s a draw!', 5000);
    } else if (chess.isDraw()) {
        turnDisplay.textContent = 'Draw!';
        showGameMessage('🤝 It\'s a draw!', 5000);
    } else if (chess.inCheck()) {
        turnDisplay.textContent = `${currentTurn} in Check!`;
        showGameMessage(`⚠️ ${currentTurn} is in check!`, 3000, 'warning');
    } else {
        turnDisplay.textContent = `${currentTurn}'s Turn`;
    }
}

function updateMoveHistory() {
    const moveList = document.getElementById('move-list');
    const history = chess.history({ verbose: true });
    
    let historyHTML = '';
    for (let i = 0; i < history.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = history[i] ? history[i].san : '';
        const blackMove = history[i + 1] ? history[i + 1].san : '';
        
        historyHTML += `<div>${moveNumber}. ${whiteMove} ${blackMove}</div>`;
    }
    
    moveList.innerHTML = historyHTML;
    moveList.scrollTop = moveList.scrollHeight;
}

function updateCapturedPieces() {
    const history = chess.history({ verbose: true });
    const whiteCaptured = document.getElementById('captured-white');
    const blackCaptured = document.getElementById('captured-black');
    
    let whitePieces = '';
    let blackPieces = '';
    
    history.forEach(move => {
        if (move.captured) {
            const capturedSymbol = move.color === 'w' ? 
                pieceSymbols[move.captured] : 
                pieceSymbols[move.captured.toUpperCase()];
            
            if (move.color === 'w') {
                whitePieces += capturedSymbol + ' ';
            } else {
                blackPieces += capturedSymbol + ' ';
            }
        }
    });
    
    whiteCaptured.innerHTML = whitePieces;
    blackCaptured.innerHTML = blackPieces;
}

function checkGameEnd() {
    if (chess.isCheckmate()) {
        const winner = chess.turn() === 'w' ? 'Black' : 'White';
        showGameMessage(`🏆 Checkmate! ${winner} wins!`, 8000);
        return true;
    } else if (chess.isStalemate()) {
        showGameMessage('🤝 Stalemate! It\'s a draw!', 8000);
        return true;
    } else if (chess.isDraw()) {
        showGameMessage('🤝 Draw by repetition or 50-move rule!', 8000);
        return true;
    }
    return false;
}

function setupGameModeControls() {
    const humanBtn = document.getElementById('human-mode-btn');
    const aiBtn = document.getElementById('ai-mode-btn');
    const aiControls = document.getElementById('ai-controls');
    const difficultySelect = document.getElementById('ai-difficulty');
    
    humanBtn.addEventListener('click', () => {
        gameMode = 'human';
        humanBtn.classList.add('active');
        aiBtn.classList.remove('active');
        aiControls.classList.add('hidden');
        showGameMessage('👥 Human vs Human mode activated!');
    });
    
    aiBtn.addEventListener('click', () => {
        gameMode = 'ai';
        aiBtn.classList.add('active');
        humanBtn.classList.remove('active');
        aiControls.classList.remove('hidden');
        showGameMessage('🤖 AI mode activated!');
    });
    
    difficultySelect.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        const difficultyNames = {
            easy: 'Easy 😊',
            medium: 'Medium 🤔',
            hard: 'Hard 😤',
            expert: 'Expert 🧠'
        };
        showGameMessage(`Difficulty set to ${difficultyNames[currentDifficulty]}!`);
    });
}