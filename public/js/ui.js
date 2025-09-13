// Chess Game UI Controller
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
        this.updateDisplay();
    }
    
    initializeBoard() {
        if (!this.boardElement) {
            console.error('❌ Chess board element not found');
            return;
        }
        
        this.boardElement.innerHTML = '';
        
        // Create 8x8 grid of squares
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
        
        console.log('✅ Chess board initialized');
    }
    
    bindEvents() {
        if (!this.boardElement) return;
        
        this.boardElement.addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (!square) return;
            
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            this.handleSquareClick(row, col);
        });
        
        // Bind promotion dialog events
        this.bindPromotionEvents();
    }
    
    bindPromotionEvents() {
        if (!this.promotionDialog) return;
        
        const promotionBtns = this.promotionDialog.querySelectorAll('.promotion-btn');
        promotionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pieceType = e.currentTarget.dataset.piece;
                this.handlePromotion(pieceType);
            });
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
                    console.log('✅ Move made successfully');
                    
                    // Check if this move needs promotion
                    if (this.chess.pendingPromotion) {
                        this.showPromotionDialog();
                        return; // Don't update display yet
                    }
                    
                    this.updateDisplay();
                    this.checkGameStatus();
                    
                    // Notify game controller about the move
                    if (window.chessGame) {
                        window.chessGame.onPlayerMove();
                    }
                } else {
                    console.warn('❌ Move failed');
                    this.showMessage('Invalid move!', 'error');
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
        console.log(`📍 Selected ${this.chess.getPiece(row, col).type} at ${row},${col} - ${this.possibleMoves.length} possible moves`);
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
        if (!this.boardElement) return;
        
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
            const lastMove = this.chess.gameHistory[this.chess.gameHistory.length - 1];
            if (lastMove) {
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
        if (!this.turnDisplay) return;
        
        const currentPlayer = this.chess.currentPlayer;
        this.turnDisplay.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
        this.turnDisplay.classList.remove('white', 'black');
        this.turnDisplay.classList.add(currentPlayer);
    }
    
    updateCapturedPieces() {
        this.updateCapturedPiecesForColor('white');
        this.updateCapturedPiecesForColor('black');
    }
    
    updateCapturedPiecesForColor(color) {
        const container = color === 'white' ? this.capturedWhite : this.capturedBlack;
        if (!container) return;
        
        // Clear existing pieces (keep the label)
        const existingPieces = container.querySelectorAll('.captured-piece');
        existingPieces.forEach(piece => piece.remove());
        
        const capturedPieces = this.chess.capturedPieces[color];
        capturedPieces.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.classList.add('captured-piece', 'piece', piece.color, piece.type);
            container.appendChild(pieceElement);
        });
    }
    
    updateMoveHistory() {
        if (!this.moveList) return;
        
        this.moveList.innerHTML = '';
        
        this.chess.gameHistory.forEach((move, index) => {
            const moveItem = document.createElement('div');
            moveItem.classList.add('move-item');
            
            const moveNumber = Math.floor(index / 2) + 1;
            const isWhiteMove = index % 2 === 0;
            
            let moveText = '';
            if (isWhiteMove) {
                moveText = `${moveNumber}.`;
            }
            moveText += this.formatMove(move);
            
            moveItem.textContent = moveText;
            this.moveList.appendChild(moveItem);
        });
        
        // Scroll to bottom
        this.moveList.scrollTop = this.moveList.scrollHeight;
    }
    
    formatMove(move) {
        const from = String.fromCharCode(97 + move.from.col) + (8 - move.from.row);
        const to = String.fromCharCode(97 + move.to.col) + (8 - move.to.row);
        
        let moveStr = `${move.piece.type.charAt(0).toUpperCase()}${from}-${to}`;
        
        if (move.capturedPiece) {
            moveStr += 'x';
        }
        
        if (move.promotion) {
            moveStr += `=${move.promotion.charAt(0).toUpperCase()}`;
        }
        
        return moveStr;
    }
    
    checkGameStatus() {
        const status = this.chess.gameStatus;
        
        if (status === 'check') {
            this.showMessage(`${this.chess.currentPlayer} is in check!`, 'warning');
        } else if (status === 'checkmate') {
            const winner = this.chess.currentPlayer === 'white' ? 'Black' : 'White';
            this.showMessage(`Checkmate! ${winner} wins! 🎉`, 'success');
        } else if (status === 'stalemate') {
            this.showMessage('Stalemate! Game is a draw.', 'warning');
        }
    }
    
    showPromotionDialog() {
        if (this.promotionDialog) {
            this.promotionDialog.classList.remove('hidden');
            console.log('🎭 Showing promotion dialog');
        }
    }
    
    hidePromotionDialog() {
        if (this.promotionDialog) {
            this.promotionDialog.classList.add('hidden');
            console.log('🎭 Hiding promotion dialog');
        }
    }
    
    handlePromotion(pieceType) {
        console.log(`🎭 Promoting to ${pieceType}`);
        
        if (this.chess.promotePawn(pieceType)) {
            this.hidePromotionDialog();
            this.updateDisplay();
            this.checkGameStatus();
            this.showMessage(`Pawn promoted to ${pieceType}!`, 'success');
            
            // Notify game controller about the promotion
            if (window.chessGame) {
                window.chessGame.onPlayerMove();
            }
        } else {
            console.error('❌ Promotion failed');
            this.showMessage('Promotion failed!', 'error');
        }
    }
    
    showMessage(text, type = 'info') {
        const messageElement = document.getElementById('game-message');
        if (!messageElement) return;
        
        messageElement.textContent = text;
        messageElement.className = `game-message ${type} show`;
        
        console.log(`💬 Message: ${text} (${type})`);
        
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
}