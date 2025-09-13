class ChessUI {
    constructor(chess) {
        this.chess = chess;
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.boardElement = document.getElementById('chess-board');
        this.turnDisplay = document.getElementById('turn-display');
        this.capturedWhite = document.getElementById('captured-white');
        this.capturedBlack = document.getElementById('captured-black');
        this.moveList = document.getElementById('move-list');
        this.promotionDialog = document.getElementById('promotion-dialog');
        
        this.initializeBoard();
        this.bindEvents();
        this.bindPromotionEvents();
        this.updateDisplay();
    }

    initializeBoard() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;
                
                this.boardElement.appendChild(square);
            }
        }
    }

    bindEvents() {
        this.boardElement.addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (!square) return;
            
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            this.handleSquareClick(row, col);
        });
    }

    handleSquareClick(row, col) {
        const piece = this.chess.getPiece(row, col);
        
        // If a square is selected and this is a valid move
        if (this.selectedSquare) {
            const possibleMove = this.possibleMoves.find(move => 
                move.row === row && move.col === col);
            
            if (possibleMove) {
                // Make the move
                const success = this.chess.makeMove(
                    this.selectedSquare.row, 
                    this.selectedSquare.col, 
                    row, 
                    col
                );
                
                if (success) {
                    const move = this.chess.gameHistory[this.chess.gameHistory.length - 1];
                    
                    // Check if this move needs promotion
                    if (move && move.needsPromotion) {
                        // Simple fallback - auto-promote to queen for now
                        this.chess.promotePawn('queen');
                        this.showMessage('Pawn promoted to queen!', 'success');
                    }
                    
                    // Check if this was a completed pawn promotion
                    if (move && move.promotion) {
                        this.showMessage(`Pawn promoted to ${move.promotion}!`, 'success');
                    } else {
                        this.showMessage('Move made!', 'success');
                    }
                    
                    this.updateDisplay();
                    
                    // Check game status
                    const status = this.chess.gameStatus;
                    if (status === 'check') {
                        this.showMessage(`${this.chess.currentPlayer} is in check!`, 'warning');
                    } else if (status === 'checkmate') {
                        const winner = this.chess.currentPlayer === 'white' ? 'Black' : 'White';
                        this.showMessage(`Checkmate! ${winner} wins!`, 'success');
                    } else if (status === 'stalemate') {
                        this.showMessage('Stalemate! Game is a draw.', 'info');
                    }
                    
                    // Trigger AI move if in AI mode
                    if (window.mathiasChess && window.mathiasChess.isAiGame && this.chess.currentPlayer === 'black' && status === 'active') {
                        setTimeout(() => window.mathiasChess.makeAiMove(), 100);
                    }
                }
            }
            
            // Clear selection
            this.clearSelection();
        }
        // Select a piece if it belongs to current player
        else if (piece && piece.color === this.chess.currentPlayer) {
            this.selectSquare(row, col);
        }
    }

    selectSquare(row, col) {
        this.selectedSquare = { row, col };
        this.possibleMoves = this.chess.getLegalMoves(row, col);
        this.updateDisplay();
    }

    clearSelection() {
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.updateDisplay();
    }

    updateDisplay() {
        this.updateBoard();
        this.updateTurnDisplay();
        this.updateCapturedPieces();
        this.updateMoveHistory();
    }

    updateBoard() {
        const squares = this.boardElement.querySelectorAll('.square');
        
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.chess.getPiece(row, col);
            
            // Clear previous content and classes
            square.innerHTML = '';
            square.classList.remove('selected', 'possible-move', 'attack-move', 'last-move');
            
            // Add piece if present
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', piece.color, piece.type);
                square.appendChild(pieceElement);
            }
            
            // Highlight selected square
            if (this.selectedSquare && 
                this.selectedSquare.row === row && 
                this.selectedSquare.col === col) {
                square.classList.add('selected');
            }
            
            // Highlight last move
            if (this.chess.lastMove) {
                const lastMove = this.chess.lastMove;
                if ((row === lastMove.from.row && col === lastMove.from.col) || 
                    (row === lastMove.to.row && col === lastMove.to.col)) {
                    square.classList.add('last-move');
                }
            }
            
            // Highlight possible moves
            const possibleMove = this.possibleMoves.find(move => 
                move.row === row && move.col === col);
            if (possibleMove) {
                if (piece && piece.color !== this.chess.currentPlayer) {
                    square.classList.add('attack-move');
                } else {
                    square.classList.add('possible-move');
                }
            }
        });
    }

    updateTurnDisplay() {
        if (this.turnDisplay) {
            const currentPlayer = this.chess.currentPlayer;
            this.turnDisplay.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
            this.turnDisplay.classList.remove('white', 'black');
            this.turnDisplay.classList.add(currentPlayer);
        }
    }

    updateCapturedPieces() {
        this.updateCapturedPiecesForColor('white');
        this.updateCapturedPiecesForColor('black');
    }

    updateCapturedPiecesForColor(color) {
        const container = color === 'white' ? this.capturedWhite : this.capturedBlack;
        if (!container) return;
        
        // Clear existing content (except the ::before pseudo-element label)
        container.innerHTML = '';
        
        const capturedPieces = this.chess.capturedPieces[color];
        capturedPieces.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.classList.add('piece', piece.color, piece.type);
            pieceElement.style.fontSize = '1.5rem';
            pieceElement.style.margin = '2px';
            container.appendChild(pieceElement);
        });
    }

    updateMoveHistory() {
        if (!this.moveList) return;
        
        const history = this.chess.gameHistory;
        this.moveList.innerHTML = '';
        
        history.forEach((move, index) => {
            const moveElement = document.createElement('div');
            moveElement.style.padding = '5px';
            moveElement.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            
            const fromSquare = this.getSquareNotation(move.from.row, move.from.col);
            const toSquare = this.getSquareNotation(move.to.row, move.to.col);
            const pieceSymbol = this.getPieceSymbol(move.piece);
            
            let moveText = `${index + 1}. ${pieceSymbol}${fromSquare}-${toSquare}`;
            
            if (move.capturedPiece) {
                moveText += ` x${this.getPieceSymbol(move.capturedPiece)}`;
            }
            
            if (move.promotion) {
                moveText += '=Q';
            }
            
            moveElement.textContent = moveText;
            this.moveList.appendChild(moveElement);
        });
        
        // Scroll to bottom
        this.moveList.scrollTop = this.moveList.scrollHeight;
    }

    getSquareNotation(row, col) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        return files[col] + ranks[row];
    }

    getPieceSymbol(piece) {
        const symbols = {
            king: '♔',
            queen: '♕',
            rook: '♖',
            bishop: '♗',
            knight: '♘',
            pawn: '♙'
        };
        return symbols[piece.type] || piece.type.charAt(0).toUpperCase();
    }

    showMessage(text, type = 'info') {
        const messageElement = document.getElementById('game-message');
        if (!messageElement) return;
        
        messageElement.textContent = text;
        messageElement.className = `game-message ${type} show`;
        
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }

    showHint() {
        if (!this.selectedSquare) {
            this.showMessage('Select a piece first to see possible moves', 'info');
            return;
        }
        
        const moves = this.chess.getLegalMoves(this.selectedSquare.row, this.selectedSquare.col);
        if (moves.length === 0) {
            this.showMessage('No legal moves for this piece', 'warning');
        } else {
            this.showMessage(`This piece has ${moves.length} possible move${moves.length > 1 ? 's' : ''}`, 'info');
        }
    }

    newGame() {
        this.chess.resetGame();
        this.clearSelection();
        this.updateDisplay();
        this.showMessage('New game started!', 'success');
    }

    undoMove() {
        if (this.chess.undoLastMove()) {
            this.clearSelection();
            this.updateDisplay();
            this.showMessage('Move undone', 'info');
        } else {
            this.showMessage('No moves to undo', 'warning');
        }
    }
    
    bindPromotionEvents() {
        try {
            const promotionBtns = document.querySelectorAll('.promotion-btn');
            promotionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const pieceType = e.currentTarget.dataset.piece;
                    this.handlePromotion(pieceType);
                });
            });
        } catch (error) {
            console.warn('Promotion events binding failed:', error);
            // This is non-critical, game can continue
        }
    }
    
    showPromotionDialog(square) {
        if (this.promotionDialog) {
            this.promotionDialog.classList.remove('hidden');
        }
    }
    
    hidePromotionDialog() {
        if (this.promotionDialog) {
            this.promotionDialog.classList.add('hidden');
        }
    }
    
    handlePromotion(pieceType) {
        if (this.chess.promotePawn(pieceType)) {
            this.hidePromotionDialog();
            this.updateDisplay();
            this.showMessage(`Pawn promoted to ${pieceType}!`, 'success');
            
            // Continue with the game flow (check game status, AI move, etc.)
            this.continueAfterPromotion();
        }
    }
    
    continueAfterPromotion() {
        // Check game status after promotion
        const status = this.chess.gameStatus;
        if (status === 'check') {
            this.showMessage(`${this.chess.currentPlayer} is in check!`, 'warning');
        } else if (status === 'checkmate') {
            const winner = this.chess.currentPlayer === 'white' ? 'Black' : 'White';
            this.showMessage(`Checkmate! ${winner} wins!`, 'success');
        } else if (status === 'stalemate') {
            this.showMessage('Stalemate! Game is a draw.', 'info');
        }
        
        // Trigger AI move if needed (this will be called from main.js)
        if (window.mathiasChess && window.mathiasChess.isAiGame && this.chess.currentPlayer === 'black') {
            setTimeout(() => window.mathiasChess.makeAiMove(), 100);
        }
    }
}
