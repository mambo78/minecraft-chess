// Chess AI System
class ChessAI {
    constructor(chess) {
        this.chess = chess;
        this.difficulty = 'medium';
        this.isThinking = false;
        this.thinkingTime = 1000; // Base thinking time in ms
        
        // Piece values for evaluation
        this.pieceValues = {
            pawn: 100,
            knight: 320,
            bishop: 330,
            rook: 500,
            queen: 900,
            king: 20000
        };

        // Position bonuses (simplified)
        this.positionBonuses = {
            pawn: [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [50, 50, 50, 50, 50, 50, 50, 50],
                [10, 10, 20, 30, 30, 20, 10, 10],
                [5,  5, 10, 25, 25, 10,  5,  5],
                [0,  0,  0, 20, 20,  0,  0,  0],
                [5, -5,-10,  0,  0,-10, -5,  5],
                [5, 10, 10,-20,-20, 10, 10,  5],
                [0,  0,  0,  0,  0,  0,  0,  0]
            ],
            knight: [
                [-50,-40,-30,-30,-30,-30,-40,-50],
                [-40,-20,  0,  0,  0,  0,-20,-40],
                [-30,  0, 10, 15, 15, 10,  0,-30],
                [-30,  5, 15, 20, 20, 15,  5,-30],
                [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30,  5, 10, 15, 15, 10,  5,-30],
                [-40,-20,  0,  5,  5,  0,-20,-40],
                [-50,-40,-30,-30,-30,-30,-40,-50]
            ],
            bishop: [
                [-20,-10,-10,-10,-10,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5, 10, 10,  5,  0,-10],
                [-10,  5,  5, 10, 10,  5,  5,-10],
                [-10,  0, 10, 10, 10, 10,  0,-10],
                [-10, 10, 10, 10, 10, 10, 10,-10],
                [-10,  5,  0,  0,  0,  0,  5,-10],
                [-20,-10,-10,-10,-10,-10,-10,-20]
            ]
        };

        this.difficulties = {
            easy: {
                name: '😊 Easy',
                depth: 1,
                randomness: 0.3,
                thinkingTime: 500,
                description: 'Makes simple moves, good for beginners'
            },
            medium: {
                name: '🤔 Medium', 
                depth: 2,
                randomness: 0.15,
                thinkingTime: 1000,
                description: 'Thinks ahead, moderate challenge'
            },
            hard: {
                name: '😤 Hard',
                depth: 3,
                randomness: 0.05,
                thinkingTime: 1500,
                description: 'Strong tactical play, experienced level'
            },
            expert: {
                name: '🧠 Expert',
                depth: 4,
                randomness: 0.0,
                thinkingTime: 2000,
                description: 'Maximum difficulty, thinks deeply'
            }
        };
    }

    setDifficulty(difficulty) {
        if (this.difficulties[difficulty]) {
            this.difficulty = difficulty;
            this.thinkingTime = this.difficulties[difficulty].thinkingTime;
            return true;
        }
        return false;
    }

    getDifficultyInfo() {
        return this.difficulties[this.difficulty];
    }

    getAllDifficulties() {
        return Object.keys(this.difficulties).map(key => ({
            id: key,
            ...this.difficulties[key]
        }));
    }

    async makeMove() {
        if (this.isThinking) return null;
        
        this.isThinking = true;
        
        try {
            // Show thinking indicator
            this.showThinking(true);
            
            // Simulate thinking time
            await this.sleep(this.thinkingTime);
            
            // Get best move
            const bestMove = this.getBestMove();
            
            this.showThinking(false);
            this.isThinking = false;
            
            return bestMove;
            
        } catch (error) {
            console.error('AI Error:', error);
            this.showThinking(false);
            this.isThinking = false;
            return null;
        }
    }

    getBestMove() {
        const difficulty = this.difficulties[this.difficulty];
        const allMoves = this.getAllPossibleMoves('black');
        
        if (allMoves.length === 0) return null;

        // For easy mode, sometimes make random moves
        if (difficulty.randomness > 0 && Math.random() < difficulty.randomness) {
            return allMoves[Math.floor(Math.random() * allMoves.length)];
        }

        // Use minimax algorithm
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of allMoves) {
            // Make temporary move
            const originalPiece = this.chess.getPiece(move.to.row, move.to.col);
            this.chess.setPiece(move.to.row, move.to.col, move.piece);
            this.chess.setPiece(move.from.row, move.from.col, null);
            
            // Evaluate position
            const score = this.minimax(difficulty.depth - 1, -Infinity, Infinity, false);
            
            // Undo move
            this.chess.setPiece(move.from.row, move.from.col, move.piece);
            this.chess.setPiece(move.to.row, move.to.col, originalPiece);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluatePosition();
        }
        
        const color = isMaximizing ? 'black' : 'white';
        const moves = this.getAllPossibleMoves(color);
        
        if (moves.length === 0) {
            // Game over - return extreme values
            if (this.chess.isKingInCheck(color)) {
                return isMaximizing ? -Infinity : Infinity;
            }
            return 0; // Stalemate
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                // Make move
                const originalPiece = this.chess.getPiece(move.to.row, move.to.col);
                this.chess.setPiece(move.to.row, move.to.col, move.piece);
                this.chess.setPiece(move.from.row, move.from.col, null);
                
                const eval = this.minimax(depth - 1, alpha, beta, false);
                
                // Undo move
                this.chess.setPiece(move.from.row, move.from.col, move.piece);
                this.chess.setPiece(move.to.row, move.to.col, originalPiece);
                
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                // Make move
                const originalPiece = this.chess.getPiece(move.to.row, move.to.col);
                this.chess.setPiece(move.to.row, move.to.col, move.piece);
                this.chess.setPiece(move.from.row, move.from.col, null);
                
                const eval = this.minimax(depth - 1, alpha, beta, true);
                
                // Undo move
                this.chess.setPiece(move.from.row, move.from.col, move.piece);
                this.chess.setPiece(move.to.row, move.to.col, originalPiece);
                
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return minEval;
        }
    }

    evaluatePosition() {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.chess.getPiece(row, col);
                if (!piece) continue;
                
                let pieceScore = this.pieceValues[piece.type];
                
                // Add position bonus
                if (this.positionBonuses[piece.type]) {
                    const positionRow = piece.color === 'white' ? row : 7 - row;
                    pieceScore += this.positionBonuses[piece.type][positionRow][col];
                }
                
                if (piece.color === 'black') {
                    score += pieceScore;
                } else {
                    score -= pieceScore;
                }
            }
        }
        
        return score;
    }

    getAllPossibleMoves(color) {
        const moves = [];
        
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.chess.getPiece(fromRow, fromCol);
                if (!piece || piece.color !== color) continue;
                
                for (let toRow = 0; toRow < 8; toRow++) {
                    for (let toCol = 0; toCol < 8; toCol++) {
                        if (this.chess.isValidMove(fromRow, fromCol, toRow, toCol)) {
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
        
        return moves;
    }

    showThinking(isThinking) {
        // Update UI to show AI is thinking
        const turnDisplay = document.getElementById('turn-display');
        if (turnDisplay && isThinking) {
            turnDisplay.textContent = '🤖 AI Thinking...';
            turnDisplay.style.animation = 'pulse 1s infinite';
        } else if (turnDisplay && !isThinking) {
            turnDisplay.style.animation = '';
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getHint() {
        // Provide a hint for the current player
        const color = this.chess.currentPlayer;
        const moves = this.getAllPossibleMoves(color);
        
        if (moves.length === 0) return null;
        
        // Get a good move (not necessarily the best)
        const difficulty = this.difficulties['medium']; // Use medium for hints
        let bestMove = null;
        let bestScore = color === 'white' ? -Infinity : Infinity;
        
        for (const move of moves.slice(0, 10)) { // Check only first 10 moves for speed
            const originalPiece = this.chess.getPiece(move.to.row, move.to.col);
            this.chess.setPiece(move.to.row, move.to.col, move.piece);
            this.chess.setPiece(move.from.row, move.from.col, null);
            
            const score = this.evaluatePosition();
            
            this.chess.setPiece(move.from.row, move.from.col, move.piece);
            this.chess.setPiece(move.to.row, move.to.col, originalPiece);
            
            if ((color === 'white' && score > bestScore) || (color === 'black' && score < bestScore)) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
}