class Chess {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameStatus = 'active'; // active, check, checkmate, stalemate
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.lastMove = null;
    }

    initializeBoard() {
        // Initialize 8x8 board with starting positions
        const board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Place pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
            board[6][i] = { type: 'pawn', color: 'white' };
        }

        // Place other pieces
        const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let i = 0; i < 8; i++) {
            board[0][i] = { type: backRank[i], color: 'black' };
            board[7][i] = { type: backRank[i], color: 'white' };
        }

        return board;
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
        if (!piece || piece.color !== this.currentPlayer) return false;

        const targetPiece = this.getPiece(toRow, toCol);
        if (targetPiece && targetPiece.color === piece.color) return false;

        // Check piece-specific movement rules
        if (!this.isPieceMovementValid(piece, fromRow, fromCol, toRow, toCol)) return false;

        // Check if move would put own king in check
        if (this.wouldBeInCheckAfterMove(fromRow, fromCol, toRow, toCol)) return false;

        return true;
    }

    isPieceMovementValid(piece, fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        const rowDir = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
        const colDir = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

        switch (piece.type) {
            case 'pawn':
                return this.isPawnMoveValid(piece, fromRow, fromCol, toRow, toCol);
            case 'rook':
                return (rowDiff === 0 || colDiff === 0) && this.isPathClear(fromRow, fromCol, toRow, toCol);
            case 'bishop':
                return rowDiff === colDiff && this.isPathClear(fromRow, fromCol, toRow, toCol);
            case 'queen':
                return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) && this.isPathClear(fromRow, fromCol, toRow, toCol);
            case 'king':
                return this.isKingMoveValid(piece, fromRow, fromCol, toRow, toCol);
            case 'knight':
                return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
            default:
                return false;
        }
    }

    isPawnMoveValid(piece, fromRow, fromCol, toRow, toCol) {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        const targetPiece = this.getPiece(toRow, toCol);

        // Forward move
        if (fromCol === toCol) {
            if (toRow === fromRow + direction && !targetPiece) return true;
            if (fromRow === startRow && toRow === fromRow + 2 * direction && !targetPiece) return true;
        }
        // Diagonal capture
        else if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction) {
            if (targetPiece && targetPiece.color !== piece.color) return true;
            // En passant
            if (this.enPassantTarget && toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
                return true;
            }
        }

        return false;
    }
    
    isKingMoveValid(piece, fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // Normal king move (1 square in any direction)
        if (rowDiff <= 1 && colDiff <= 1) {
            return true;
        }
        
        // Castling move (king moves 2 squares horizontally)
        if (rowDiff === 0 && colDiff === 2) {
            return this.isCastlingValid(piece, fromRow, fromCol, toRow, toCol);
        }
        
        return false;
    }
    
    isCastlingValid(piece, fromRow, fromCol, toRow, toCol) {
        // Must be on the back rank
        const backRank = piece.color === 'white' ? 7 : 0;
        if (fromRow !== backRank || toRow !== backRank) return false;
        
        // King must be in starting position
        if (fromCol !== 4) return false;
        
        // King must not be in check
        if (this.isKingInCheck(piece.color)) return false;
        
        // Determine if kingside or queenside castling
        const isKingside = toCol === 6;
        const isQueenside = toCol === 2;
        
        if (!isKingside && !isQueenside) return false;
        
        // Check castling rights
        const rights = this.castlingRights[piece.color];
        if (isKingside && !rights.kingside) return false;
        if (isQueenside && !rights.queenside) return false;
        
        // Check that the rook is in the correct position
        const rookCol = isKingside ? 7 : 0;
        const rook = this.getPiece(backRank, rookCol);
        if (!rook || rook.type !== 'rook' || rook.color !== piece.color) return false;
        
        // Check that the path is clear
        const startCol = Math.min(fromCol, rookCol);
        const endCol = Math.max(fromCol, rookCol);
        
        for (let col = startCol + 1; col < endCol; col++) {
            if (this.getPiece(backRank, col)) return false;
        }
        
        // Check that the king doesn't pass through check
        const direction = isKingside ? 1 : -1;
        for (let i = 1; i <= 2; i++) {
            const testCol = fromCol + (i * direction);
            
            // Temporarily move king to test square
            this.setPiece(backRank, testCol, piece);
            this.setPiece(fromRow, fromCol, null);
            
            const inCheck = this.isKingInCheck(piece.color);
            
            // Restore position
            this.setPiece(fromRow, fromCol, piece);
            this.setPiece(backRank, testCol, null);
            
            if (inCheck) return false;
        }
        
        return true;
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowDir = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
        const colDir = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

        let currentRow = fromRow + rowDir;
        let currentCol = fromCol + colDir;

        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.getPiece(currentRow, currentCol)) return false;
            currentRow += rowDir;
            currentCol += colDir;
        }

        return true;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) return false;

        const piece = this.getPiece(fromRow, fromCol);
        const capturedPiece = this.getPiece(toRow, toCol);

        // Save move to history
        const move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            capturedPiece: capturedPiece ? { ...capturedPiece } : null,
            enPassantTarget: this.enPassantTarget
        };

        // Handle en passant capture
        if (piece.type === 'pawn' && this.enPassantTarget && 
            toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
            const captureRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            const enPassantCaptured = this.getPiece(captureRow, toCol);
            if (enPassantCaptured) {
                this.capturedPieces[enPassantCaptured.color].push(enPassantCaptured);
                this.setPiece(captureRow, toCol, null);
                move.enPassantCapture = { ...enPassantCaptured };
            }
        }

        // Handle regular capture
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece);
        }

        // Handle castling
        if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
            const isKingside = toCol === 6;
            const rookFromCol = isKingside ? 7 : 0;
            const rookToCol = isKingside ? 5 : 3;
            const rook = this.getPiece(fromRow, rookFromCol);
            
            // Move rook
            this.setPiece(toRow, rookToCol, rook);
            this.setPiece(fromRow, rookFromCol, null);
            
            move.castling = { 
                type: isKingside ? 'kingside' : 'queenside',
                rookFrom: { row: fromRow, col: rookFromCol },
                rookTo: { row: toRow, col: rookToCol }
            };
        }
        
        // Move the piece
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);

        // Handle pawn promotion - mark for promotion but don't auto-promote
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            move.needsPromotion = true;
            move.promotionSquare = { row: toRow, col: toCol };
            // Don't auto-promote, wait for user choice
        }

        // Update en passant target
        this.enPassantTarget = null;
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = { row: fromRow + (toRow - fromRow) / 2, col: toCol };
        }

        // Update castling rights
        if (piece.type === 'king') {
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        }
        if (piece.type === 'rook') {
            if (fromCol === 0) this.castlingRights[piece.color].queenside = false;
            if (fromCol === 7) this.castlingRights[piece.color].kingside = false;
        }

        this.gameHistory.push(move);
        this.lastMove = move; // Track last move for highlighting
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Check game status
        this.updateGameStatus();

        return true;
    }

    wouldBeInCheckAfterMove(fromRow, fromCol, toRow, toCol) {
        // Make a temporary move
        const piece = this.getPiece(fromRow, fromCol);
        const capturedPiece = this.getPiece(toRow, toCol);
        
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);

        const inCheck = this.isKingInCheck(piece.color);

        // Restore the board
        this.setPiece(fromRow, fromCol, piece);
        this.setPiece(toRow, toCol, capturedPiece);

        return inCheck;
    }

    isKingInCheck(color) {
        const king = this.findKing(color);
        if (!king) return false;

        return this.isSquareAttacked(king.row, king.col, color);
    }

    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    isSquareAttacked(row, col, defendingColor) {
        const attackingColor = defendingColor === 'white' ? 'black' : 'white';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.getPiece(r, c);
                if (piece && piece.color === attackingColor) {
                    if (this.isPieceMovementValid(piece, r, c, row, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    updateGameStatus() {
        if (this.isKingInCheck(this.currentPlayer)) {
            if (this.hasLegalMoves(this.currentPlayer)) {
                this.gameStatus = 'check';
            } else {
                this.gameStatus = 'checkmate';
            }
        } else {
            if (this.hasLegalMoves(this.currentPlayer)) {
                this.gameStatus = 'active';
            } else {
                this.gameStatus = 'stalemate';
            }
        }
    }

    hasLegalMoves(color) {
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

    undoLastMove() {
        if (this.gameHistory.length === 0) return false;

        const lastMove = this.gameHistory.pop();
        
        // Restore the piece to its original position
        this.setPiece(lastMove.from.row, lastMove.from.col, lastMove.piece);
        
        // Handle captured piece
        if (lastMove.capturedPiece) {
            this.setPiece(lastMove.to.row, lastMove.to.col, lastMove.capturedPiece);
            // Remove from captured pieces
            const capturedList = this.capturedPieces[lastMove.capturedPiece.color];
            const index = capturedList.findIndex(p => p.type === lastMove.capturedPiece.type);
            if (index !== -1) capturedList.splice(index, 1);
        } else {
            this.setPiece(lastMove.to.row, lastMove.to.col, null);
        }

        // Handle castling undo
        if (lastMove.castling) {
            const rookPiece = this.getPiece(lastMove.castling.rookTo.row, lastMove.castling.rookTo.col);
            this.setPiece(lastMove.castling.rookFrom.row, lastMove.castling.rookFrom.col, rookPiece);
            this.setPiece(lastMove.castling.rookTo.row, lastMove.castling.rookTo.col, null);
        }
        
        // Handle en passant
        if (lastMove.enPassantCapture) {
            const captureRow = lastMove.piece.color === 'white' ? lastMove.to.row + 1 : lastMove.to.row - 1;
            this.setPiece(captureRow, lastMove.to.col, lastMove.enPassantCapture);
        }

        // Restore en passant target
        this.enPassantTarget = lastMove.enPassantTarget;

        // Update last move (now it's the previous move)
        this.lastMove = this.gameHistory.length > 0 ? this.gameHistory[this.gameHistory.length - 1] : null;
        
        // Switch back the current player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Update game status
        this.updateGameStatus();

        return true;
    }

    getGameState() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameStatus: this.gameStatus,
            capturedPieces: this.capturedPieces,
            gameHistory: this.gameHistory,
            enPassantTarget: this.enPassantTarget
        };
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameStatus = 'active';
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.lastMove = null;
    }
    
    promotePawn(pieceType) {
        if (!this.lastMove || !this.lastMove.needsPromotion) return false;
        
        const square = this.lastMove.promotionSquare;
        const pawn = this.getPiece(square.row, square.col);
        
        if (pawn && pawn.type === 'pawn') {
            this.setPiece(square.row, square.col, { type: pieceType, color: pawn.color });
            this.lastMove.promotion = pieceType;
            this.lastMove.needsPromotion = false;
            return true;
        }
        
        return false;
    }
}
