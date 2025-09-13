class UI {
    constructor(chess) {
        this.chess = chess;
        this.selectedSquare = null;
        this.highlightedMoves = [];
        this.boardElement = document.getElementById('chess-board');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.capturedWhite = document.getElementById('captured-white');
        this.capturedBlack = document.getElementById('captured-black');
        this.moveList = document.getElementById('move-list');
        
        this.pieceSymbols = {
            white: {
                king: '🤴',
                queen: '👑',
                rook: '🏰',
                bishop: '⚡',
                knight: '🐴',
                pawn: '⚔️'
            },
            black: {
                king: '👹',
                queen: '🖤',
                rook: '🗿',
                bishop: '🔥',
                knight: '🐷',
                pawn: '🛡️'
            }
        };

        this.initializeBoard();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeBoard() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add coordinate labels
                if (col === 0) {
                    const rankLabel = document.createElement('div');
                    rankLabel.className = 'coordinate rank';
                    rankLabel.textContent = 8 - row;
                    square.appendChild(rankLabel);
                }
                if (row === 7) {
                    const fileLabel = document.createElement('div');
                    fileLabel.className = 'coordinate file';
                    fileLabel.textContent = String.fromCharCode(97 + col); // 'a' + col
                    square.appendChild(fileLabel);
                }
                
                this.boardElement.appendChild(square);
            }
        }
    }

    bindEvents() {
        // Board click events
        this.boardElement.addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (!square) return;

            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            this.handleSquareClick(row, col);
        });

        // Game control events
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSelection();
            }
            if (e.key === 'z' && e.ctrlKey) {
                this.undoMove();
            }
        });
    }

    handleSquareClick(row, col) {
        const clickedPiece = this.chess.getPiece(row, col);

        // If no square is selected
        if (!this.selectedSquare) {
            if (clickedPiece && clickedPiece.color === this.chess.currentPlayer) {
                this.selectSquare(row, col);
            }
        } 
        // If a square is already selected
        else {
            const selectedRow = this.selectedSquare.row;
            const selectedCol = this.selectedSquare.col;

            // If clicking the same square, deselect
            if (row === selectedRow && col === selectedCol) {
                this.clearSelection();
            }
            // If clicking another piece of the same color, select it instead
            else if (clickedPiece && clickedPiece.color === this.chess.currentPlayer) {
                this.selectSquare(row, col);
            }
            // Try to make a move
            else {
                this.attemptMove(selectedRow, selectedCol, row, col);
            }
        }
    }

    selectSquare(row, col) {
        this.clearSelection();
        this.selectedSquare = { row, col };
        
        // Highlight selected square
        const square = this.getSquareElement(row, col);
        square.classList.add('selected');

        // Show legal moves
        const legalMoves = this.chess.getLegalMoves(row, col);
        legalMoves.forEach(move => {
            const moveSquare = this.getSquareElement(move.row, move.col);
            moveSquare.classList.add('legal-move');
            this.highlightedMoves.push({ row: move.row, col: move.col });
        });
    }

    clearSelection() {
        if (this.selectedSquare) {
            const square = this.getSquareElement(this.selectedSquare.row, this.selectedSquare.col);
            square.classList.remove('selected');
            this.selectedSquare = null;
        }

        // Clear highlighted moves
        this.highlightedMoves.forEach(move => {
            const square = this.getSquareElement(move.row, move.col);
            square.classList.remove('legal-move');
        });
        this.highlightedMoves = [];
    }

    attemptMove(fromRow, fromCol, toRow, toCol) {
        const success = this.chess.makeMove(fromRow, fromCol, toRow, toCol);
        
        if (success) {
            this.clearSelection();
            this.updateDisplay();
            this.addMoveToHistory(fromRow, fromCol, toRow, toCol);
            
            // Emit move event for multiplayer
            if (window.gameMultiplayer) {
                window.gameMultiplayer.sendMove(fromRow, fromCol, toRow, toCol);
            }
        } else {
            // Show invalid move feedback
            const square = this.getSquareElement(toRow, toCol);
            square.classList.add('invalid-move');
            setTimeout(() => square.classList.remove('invalid-move'), 500);
        }
    }

    updateDisplay() {
        this.updateBoard();
        this.updateTurnIndicator();
        this.updateCapturedPieces();
        this.updateGameStatus();
    }

    updateBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = this.getSquareElement(row, col);
                const piece = this.chess.getPiece(row, col);
                
                // Clear existing piece content (but keep coordinates)
                const existingPiece = square.querySelector('.piece');
                if (existingPiece) {
                    existingPiece.remove();
                }

                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.color} ${piece.type}`;
                    pieceElement.textContent = this.pieceSymbols[piece.color][piece.type];
                    pieceElement.title = `${piece.color} ${piece.type}`;
                    square.appendChild(pieceElement);
                }
            }
        }
    }

    updateTurnIndicator() {
        const currentPlayer = this.chess.currentPlayer;
        this.turnIndicator.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
        this.turnIndicator.className = `turn-indicator ${currentPlayer}`;
    }

    updateCapturedPieces() {
        const captured = this.chess.capturedPieces;
        
        // Update white captured pieces
        this.capturedWhite.innerHTML = '';
        captured.white.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = `captured-piece ${piece.color} ${piece.type}`;
            pieceElement.textContent = this.pieceSymbols[piece.color][piece.type];
            pieceElement.title = `${piece.color} ${piece.type}`;
            this.capturedWhite.appendChild(pieceElement);
        });

        // Update black captured pieces
        this.capturedBlack.innerHTML = '';
        captured.black.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = `captured-piece ${piece.color} ${piece.type}`;
            pieceElement.textContent = this.pieceSymbols[piece.color][piece.type];
            pieceElement.title = `${piece.color} ${piece.type}`;
            this.capturedBlack.appendChild(pieceElement);
        });
    }

    updateGameStatus() {
        const status = this.chess.gameStatus;
        const statusElement = document.querySelector('.game-status');
        
        if (status === 'check') {
            this.showMessage('Check!', 'warning');
        } else if (status === 'checkmate') {
            const winner = this.chess.currentPlayer === 'white' ? 'Black' : 'White';
            this.showMessage(`Checkmate! ${winner} wins!`, 'success');
        } else if (status === 'stalemate') {
            this.showMessage('Stalemate! Draw!', 'info');
        }
    }

    addMoveToHistory(fromRow, fromCol, toRow, toCol) {
        const piece = this.chess.board[toRow][toCol];
        const fromSquare = this.coordinateToString(fromRow, fromCol);
        const toSquare = this.coordinateToString(toRow, toCol);
        
        const moveElement = document.createElement('div');
        moveElement.className = 'move-item';
        moveElement.innerHTML = `
            <span class="move-piece">${this.pieceSymbols[piece.color][piece.type]}</span>
            <span class="move-notation">${fromSquare} → ${toSquare}</span>
        `;
        
        this.moveList.appendChild(moveElement);
        this.moveList.scrollTop = this.moveList.scrollHeight;
    }

    coordinateToString(row, col) {
        const file = String.fromCharCode(97 + col); // 'a' + col
        const rank = 8 - row;
        return file + rank;
    }

    getSquareElement(row, col) {
        return this.boardElement.children[row * 8 + col];
    }

    showMessage(text, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.game-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = `game-message ${type}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }

    showHint() {
        if (this.selectedSquare) {
            // Already showing legal moves for selected piece
            return;
        }

        // Find a random legal move and highlight it briefly
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.chess.getPiece(row, col);
                if (piece && piece.color === this.chess.currentPlayer) {
                    const legalMoves = this.chess.getLegalMoves(row, col);
                    if (legalMoves.length > 0) {
                        pieces.push({ row, col, moves: legalMoves });
                    }
                }
            }
        }

        if (pieces.length > 0) {
            const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
            const randomMove = randomPiece.moves[Math.floor(Math.random() * randomPiece.moves.length)];
            
            const fromSquare = this.getSquareElement(randomPiece.row, randomPiece.col);
            const toSquare = this.getSquareElement(randomMove.row, randomMove.col);
            
            fromSquare.classList.add('hint-from');
            toSquare.classList.add('hint-to');
            
            setTimeout(() => {
                fromSquare.classList.remove('hint-from');
                toSquare.classList.remove('hint-to');
            }, 2000);
            
            this.showMessage('Hint: Consider this move!', 'info');
        } else {
            this.showMessage('No legal moves available!', 'warning');
        }
    }

    newGame() {
        if (confirm('Start a new game? This will reset the current game.')) {
            this.chess.resetGame();
            this.clearSelection();
            this.updateDisplay();
            this.moveList.innerHTML = '';
            this.showMessage('New game started!', 'success');
            
            // Emit new game event for multiplayer
            if (window.gameMultiplayer) {
                window.gameMultiplayer.sendNewGame();
            }
        }
    }

    undoMove() {
        const success = this.chess.undoLastMove();
        if (success) {
            this.clearSelection();
            this.updateDisplay();
            
            // Remove last move from history display
            const lastMove = this.moveList.lastElementChild;
            if (lastMove) {
                lastMove.remove();
            }
            
            this.showMessage('Move undone!', 'info');
        } else {
            this.showMessage('No moves to undo!', 'warning');
        }
    }

    // Method to handle moves from multiplayer
    handleRemoteMove(fromRow, fromCol, toRow, toCol) {
        this.clearSelection();
        const success = this.chess.makeMove(fromRow, fromCol, toRow, toCol);
        
        if (success) {
            this.updateDisplay();
            this.addMoveToHistory(fromRow, fromCol, toRow, toCol);
        }
    }

    // Method to handle remote new game
    handleRemoteNewGame() {
        this.chess.resetGame();
        this.clearSelection();
        this.updateDisplay();
        this.moveList.innerHTML = '';
        this.showMessage('Opponent started a new game!', 'info');
    }
}