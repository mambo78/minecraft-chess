// Clean Chess Game Logic
class Chess {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameStatus = 'active';
        this.selectedSquare = null;
        
        // Castling rights tracking
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        
        this.initializeBoard();
    }
    
    initializeBoard() {
        // Create empty 8x8 board
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place pieces in starting positions
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        // White pieces (bottom of board)
        for (let col = 0; col < 8; col++) {
            this.board[7][col] = { type: pieceOrder[col], color: 'white' };
            this.board[6][col] = { type: 'pawn', color: 'white' };
        }
        
        // Black pieces (top of board)
        for (let col = 0; col < 8; col++) {
            this.board[0][col] = { type: pieceOrder[col], color: 'black' };
            this.board[1][col] = { type: 'pawn', color: 'black' };
        }
    }
    
    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }
    
    setPiece(row, col, piece) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return false;
        this.board[row][col] = piece;
        return true;
    }
    
    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        const targetPiece = this.getPiece(toRow, toCol);
        
        // Basic validation
        if (!piece) return false;
        if (piece.color !== this.currentPlayer) return false;
        if (targetPiece && targetPiece.color === piece.color) return false;
        if (fromRow === toRow && fromCol === toCol) return false;
        
        // Check piece-specific movement rules
        if (!this.isPieceMovementValid(piece, fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        // Check if path is clear (for pieces that can't jump)
        if (!this.isPathClear(piece.type, fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        // Test move - check if it would put own king in check
        if (this.wouldExposeKing(fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        return true;
    }
    
    isPieceMovementValid(piece, fromRow, fromCol, toRow, toCol) {
        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);
        
        switch (piece.type) {
            case 'pawn':
                return this.isPawnMoveValid(piece, fromRow, fromCol, toRow, toCol);
            
            case 'rook':
                return (rowDiff === 0 && colDiff !== 0) || (colDiff === 0 && rowDiff !== 0);
            
            case 'bishop':
                return absRowDiff === absColDiff && absRowDiff > 0;
            
            case 'queen':
                return (absRowDiff === absColDiff && absRowDiff > 0) || 
                       (rowDiff === 0 && colDiff !== 0) || 
                       (colDiff === 0 && rowDiff !== 0);
            
            case 'king':
                // Normal king move
                if (absRowDiff <= 1 && absColDiff <= 1 && (absRowDiff + absColDiff > 0)) {
                    return true;
                }
                // Castling move (king moves 2 squares horizontally)
                if (absRowDiff === 0 && absColDiff === 2) {
                    return this.canCastle(piece, fromRow, fromCol, toRow, toCol);
                }
                return false;
            
            case 'knight':
                return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
            
            default:
                return false;
        }
    }
    
    isPawnMoveValid(pawn, fromRow, fromCol, toRow, toCol) {
        const direction = pawn.color === 'white' ? -1 : 1;
        const startRow = pawn.color === 'white' ? 6 : 1;
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);
        const targetPiece = this.getPiece(toRow, toCol);
        
        // Moving forward
        if (colDiff === 0) {
            if (!targetPiece) {
                // One square forward
                if (rowDiff === direction) return true;
                // Two squares forward from starting position
                if (fromRow === startRow && rowDiff === 2 * direction) return true;
            }
        }
        // Diagonal capture
        else if (colDiff === 1 && rowDiff === direction) {
            return targetPiece && targetPiece.color !== pawn.color;
        }
        
        return false;
    }
    
    isPathClear(pieceType, fromRow, fromCol, toRow, toCol) {
        // Knights can jump over pieces
        if (pieceType === 'knight') return true;
        
        // Kings move only one square (castling handled separately)
        if (pieceType === 'king' && Math.abs(toCol - fromCol) <= 1) return true;
        
        const rowStep = Math.sign(toRow - fromRow);
        const colStep = Math.sign(toCol - fromCol);
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        // Check each square in the path (excluding destination)
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.getPiece(currentRow, currentCol)) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }
    
    canCastle(king, fromRow, fromCol, toRow, toCol) {
        const color = king.color;
        const isKingside = toCol > fromCol;
        
        // Check if castling rights exist
        if (isKingside && !this.castlingRights[color].kingside) return false;
        if (!isKingside && !this.castlingRights[color].queenside) return false;
        
        // King must not be in check
        if (this.isKingInCheck(color)) return false;
        
        // Check if rook is in correct position
        const rookCol = isKingside ? 7 : 0;
        const rook = this.getPiece(fromRow, rookCol);
        if (!rook || rook.type !== 'rook' || rook.color !== color) return false;
        
        // Path must be clear between king and rook
        const startCol = Math.min(fromCol, rookCol) + 1;
        const endCol = Math.max(fromCol, rookCol) - 1;
        for (let col = startCol; col <= endCol; col++) {
            if (this.getPiece(fromRow, col)) return false;
        }
        
        // King must not pass through check
        const step = isKingside ? 1 : -1;
        for (let col = fromCol; col !== toCol + step; col += step) {
            if (col !== fromCol) { // Don't check starting position again
                // Temporarily move king to test for check
                this.setPiece(fromRow, col, king);
                this.setPiece(fromRow, fromCol, null);
                
                const inCheck = this.isKingInCheck(color);
                
                // Restore position
                this.setPiece(fromRow, fromCol, king);
                this.setPiece(fromRow, col, null);
                
                if (inCheck) return false;
            }
        }
        
        return true;
    }
    
    wouldExposeKing(fromRow, fromCol, toRow, toCol) {
        // Temporarily make the move
        const movingPiece = this.getPiece(fromRow, fromCol);
        const capturedPiece = this.getPiece(toRow, toCol);
        
        this.setPiece(toRow, toCol, movingPiece);
        this.setPiece(fromRow, fromCol, null);
        
        const kingInCheck = this.isKingInCheck(movingPiece.color);
        
        // Restore the board
        this.setPiece(fromRow, fromCol, movingPiece);
        this.setPiece(toRow, toCol, capturedPiece);
        
        return kingInCheck;
    }
    
    isKingInCheck(color) {
        // Find the king
        let kingRow = -1, kingCol = -1;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
        }
        
        if (kingRow === -1) return false; // King not found (shouldn't happen)
        
        // Check if any opponent piece can attack the king
        const opponentColor = color === 'white' ? 'black' : 'white';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.color === opponentColor) {
                    if (this.canAttackSquare(row, col, kingRow, kingCol)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    canAttackSquare(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return false;
        
        // Check piece-specific movement (similar to isValidMove but ignore king exposure)
        if (!this.isPieceMovementValid(piece, fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        // Check if path is clear
        return this.isPathClear(piece.type, fromRow, fromCol, toRow, toCol);
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        const movingPiece = this.getPiece(fromRow, fromCol);
        const capturedPiece = this.getPiece(toRow, toCol);
        
        // Record the move
        const move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: movingPiece,
            capturedPiece: capturedPiece,
            timestamp: new Date()
        };
        
        // Capture piece if present
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece);
        }
        
        // Handle castling
        const isCastling = movingPiece.type === 'king' && Math.abs(toCol - fromCol) === 2;
        if (isCastling) {
            const isKingside = toCol > fromCol;
            const rookFromCol = isKingside ? 7 : 0;
            const rookToCol = isKingside ? toCol - 1 : toCol + 1;
            const rook = this.getPiece(fromRow, rookFromCol);
            
            // Move the rook
            this.setPiece(fromRow, rookToCol, rook);
            this.setPiece(fromRow, rookFromCol, null);
            
            move.isCastling = true;
            move.rookMove = { from: { row: fromRow, col: rookFromCol }, to: { row: fromRow, col: rookToCol } };
        }
        
        // Make the move
        this.setPiece(toRow, toCol, movingPiece);
        this.setPiece(fromRow, fromCol, null);
        
        // Update castling rights
        if (movingPiece.type === 'king') {
            this.castlingRights[movingPiece.color].kingside = false;
            this.castlingRights[movingPiece.color].queenside = false;
        }
        if (movingPiece.type === 'rook') {
            if (fromCol === 0) this.castlingRights[movingPiece.color].queenside = false;
            if (fromCol === 7) this.castlingRights[movingPiece.color].kingside = false;
        }
        // If a rook is captured, update castling rights
        if (capturedPiece && capturedPiece.type === 'rook') {
            if (toCol === 0) this.castlingRights[capturedPiece.color].queenside = false;
            if (toCol === 7) this.castlingRights[capturedPiece.color].kingside = false;
        }
        
        // Check for pawn promotion
        if (movingPiece.type === 'pawn') {
            const promotionRow = movingPiece.color === 'white' ? 0 : 7;
            if (toRow === promotionRow) {
                move.needsPromotion = true;
                this.pendingPromotion = { row: toRow, col: toCol };
            }
        }
        
        this.gameHistory.push(move);
        
        // Switch turns
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Update game status
        this.updateGameStatus();
        
        return true;
    }
    
    promotePawn(pieceType) {
        if (!this.pendingPromotion) return false;
        
        const { row, col } = this.pendingPromotion;
        const currentPiece = this.getPiece(row, col);
        
        if (!currentPiece || currentPiece.type !== 'pawn') return false;
        
        // Replace pawn with chosen piece
        this.setPiece(row, col, { type: pieceType, color: currentPiece.color });
        
        // Update the last move record
        if (this.gameHistory.length > 0) {
            const lastMove = this.gameHistory[this.gameHistory.length - 1];
            lastMove.promotion = pieceType;
            lastMove.needsPromotion = false;
        }
        
        this.pendingPromotion = null;
        this.updateGameStatus();
        
        return true;
    }
    
    updateGameStatus() {
        const opponent = this.currentPlayer;
        const isInCheck = this.isKingInCheck(opponent);
        const hasValidMoves = this.hasValidMoves(opponent);
        
        if (isInCheck && !hasValidMoves) {
            this.gameStatus = 'checkmate';
        } else if (!isInCheck && !hasValidMoves) {
            this.gameStatus = 'stalemate';
        } else if (isInCheck) {
            this.gameStatus = 'check';
        } else {
            this.gameStatus = 'active';
        }
    }
    
    hasValidMoves(color) {
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.getPiece(fromRow, fromCol);
                if (piece && piece.color === color) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    
    getLegalMoves(row, col) {
        const moves = [];
        const piece = this.getPiece(row, col);
        
        if (!piece || piece.color !== this.currentPlayer) return moves;
        
        for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
                if (this.isValidMove(row, col, toRow, toCol)) {
                    moves.push({ row: toRow, col: toCol });
                }
            }
        }
        
        return moves;
    }
    
    getAllValidMoves(color) {
        const moves = [];
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.getPiece(fromRow, fromCol);
                if (piece && piece.color === color) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                                moves.push({
                                    from: { row: fromRow, col: fromCol },
                                    to: { row: toRow, col: toCol },
                                    piece: piece
                                });
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }
    
    undoLastMove() {
        if (this.gameHistory.length === 0) return false;
        
        const lastMove = this.gameHistory.pop();
        
        // Restore the piece to its original position
        this.setPiece(lastMove.from.row, lastMove.from.col, lastMove.piece);
        
        // Restore captured piece if any
        if (lastMove.capturedPiece) {
            this.setPiece(lastMove.to.row, lastMove.to.col, lastMove.capturedPiece);
            // Remove from captured pieces
            const capturedArray = this.capturedPieces[lastMove.capturedPiece.color];
            const index = capturedArray.length - 1;
            if (index >= 0) capturedArray.splice(index, 1);
        } else {
            this.setPiece(lastMove.to.row, lastMove.to.col, null);
        }
        
        // Switch turns back
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Clear any pending promotion
        this.pendingPromotion = null;
        
        // Update game status
        this.updateGameStatus();
        
        return true;
    }
    
    resetGame() {
        this.board = [];
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameStatus = 'active';
        this.selectedSquare = null;
        this.pendingPromotion = null;
        
        this.initializeBoard();
    }
    
    // Convert current position to FEN notation for Stockfish
    toFEN() {
        let fen = '';
        
        // Board state
        for (let row = 0; row < 8; row++) {
            let emptyCount = 0;
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece) {
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }
                    const pieceChar = this.pieceToFEN(piece);
                    fen += pieceChar;
                } else {
                    emptyCount++;
                }
            }
            if (emptyCount > 0) {
                fen += emptyCount;
            }
            if (row < 7) fen += '/';
        }
        
        // Active color
        fen += ' ' + (this.currentPlayer === 'white' ? 'w' : 'b');
        
        // Castling availability (simplified - assume all available)
        fen += ' KQkq';
        
        // En passant target square (simplified)
        fen += ' -';
        
        // Halfmove clock (simplified)
        fen += ' 0';
        
        // Fullmove number
        fen += ' ' + Math.floor(this.gameHistory.length / 2 + 1);
        
        return fen;
    }
    
    pieceToFEN(piece) {
        const chars = {
            'king': 'k', 'queen': 'q', 'rook': 'r',
            'bishop': 'b', 'knight': 'n', 'pawn': 'p'
        };
        const char = chars[piece.type];
        return piece.color === 'white' ? char.toUpperCase() : char;
    }
}