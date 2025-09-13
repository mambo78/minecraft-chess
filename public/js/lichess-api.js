// Alternative: Lichess API Integration for Chess Analysis
// NOTE: This is an alternative approach to using Stockfish directly

class LichessAPI {
    constructor() {
        this.baseUrl = 'https://lichess.org/api';
        this.isAvailable = true;
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
        
        this.difficulties = {
            easy: { depth: 8, multipv: 3 },
            medium: { depth: 12, multipv: 2 },
            hard: { depth: 16, multipv: 1 },
            expert: { depth: 20, multipv: 1 }
        };
        
        this.currentDifficulty = 'medium';
    }
    
    async checkAvailability() {
        try {
            const response = await fetch(`${this.baseUrl}/status`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            this.isAvailable = response.ok;
            return this.isAvailable;
        } catch (error) {
            console.warn('📡 Lichess API not available:', error);
            this.isAvailable = false;
            return false;
        }
    }
    
    async analyzePosition(fenPosition) {
        if (!this.isAvailable) {
            await this.checkAvailability();
            if (!this.isAvailable) return null;
        }
        
        // Rate limiting
        const now = Date.now();
        if (now - this.lastRequestTime < this.rateLimitDelay) {
            await this.sleep(this.rateLimitDelay - (now - this.lastRequestTime));
        }
        this.lastRequestTime = Date.now();
        
        try {
            const difficulty = this.difficulties[this.currentDifficulty];
            const params = new URLSearchParams({
                fen: fenPosition,
                depth: difficulty.depth,
                multipv: difficulty.multipv
            });
            
            console.log('📡 Requesting Lichess analysis for:', fenPosition);
            
            const response = await fetch(`${this.baseUrl}/cloud-eval?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Lichess API responded with ${response.status}`);
            }
            
            const analysis = await response.json();
            console.log('📡 Lichess analysis result:', analysis);
            
            return this.parseAnalysis(analysis);
            
        } catch (error) {
            console.error('📡 Lichess API error:', error);
            this.isAvailable = false;
            return null;
        }
    }
    
    parseAnalysis(analysis) {
        // Parse Lichess analysis response
        if (!analysis || !analysis.pvs || analysis.pvs.length === 0) {
            return null;
        }
        
        // Get the best move from the principal variation
        const bestLine = analysis.pvs[0];
        if (!bestLine || !bestLine.moves || bestLine.moves.length === 0) {
            return null;
        }
        
        const moveStr = bestLine.moves.split(' ')[0]; // First move in PV
        return this.parseMove(moveStr);
    }
    
    parseMove(moveStr) {
        // Convert UCI notation (e.g., "e2e4") to our format
        if (!moveStr || moveStr.length < 4) return null;
        
        const fromCol = moveStr.charCodeAt(0) - 97; // 'a' = 0
        const fromRow = 8 - parseInt(moveStr[1]);   // '8' = 0
        const toCol = moveStr.charCodeAt(2) - 97;
        const toRow = 8 - parseInt(moveStr[3]);
        
        const move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            promotion: null
        };
        
        // Handle promotion (e.g., "e7e8q")
        if (moveStr.length === 5) {
            const promotionMap = { 'q': 'queen', 'r': 'rook', 'b': 'bishop', 'n': 'knight' };
            move.promotion = promotionMap[moveStr[4].toLowerCase()];
        }
        
        return move;
    }
    
    setDifficulty(level) {
        if (this.difficulties[level]) {
            this.currentDifficulty = level;
        }
    }
    
    getDifficultyInfo() {
        const diffNames = {
            easy: { name: '😊 Easy', description: 'Moderate analysis depth' },
            medium: { name: '🤔 Medium', description: 'Good analysis depth' },
            hard: { name: '😤 Hard', description: 'Deep analysis' },
            expert: { name: '🧠 Expert', description: 'Maximum analysis depth' }
        };
        
        return diffNames[this.currentDifficulty] || diffNames.medium;
    }
    
    async makeMove(fenPosition) {
        console.log('📡 Lichess API analyzing position...');
        
        try {
            const move = await this.analyzePosition(fenPosition);
            
            if (move) {
                console.log('📡 Lichess suggests:', move);
                return move;
            } else {
                console.warn('📡 No move suggestion from Lichess');
                return null;
            }
            
        } catch (error) {
            console.error('📡 Lichess API move error:', error);
            return null;
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Convert chess board to FEN (same as Stockfish implementation)
    positionToFEN(chess) {
        let fen = '';
        
        for (let row = 0; row < 8; row++) {
            let emptyCount = 0;
            
            for (let col = 0; col < 8; col++) {
                const piece = chess.getPiece(row, col);
                
                if (piece) {
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }
                    
                    const pieceMap = {
                        'king': 'k', 'queen': 'q', 'rook': 'r',
                        'bishop': 'b', 'knight': 'n', 'pawn': 'p'
                    };
                    
                    let symbol = pieceMap[piece.type];
                    if (piece.color === 'white') {
                        symbol = symbol.toUpperCase();
                    }
                    fen += symbol;
                } else {
                    emptyCount++;
                }
            }
            
            if (emptyCount > 0) {
                fen += emptyCount;
            }
            
            if (row < 7) {
                fen += '/';
            }
        }
        
        const turn = chess.currentPlayer === 'white' ? 'w' : 'b';
        const castling = 'KQkq'; // Simplified
        const enPassant = '-';   // Simplified
        const halfmove = chess.halfMoveClock || 0;
        const fullmove = Math.floor(chess.gameHistory.length / 2) + 1;
        
        return `${fen} ${turn} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
    }
}

// Usage example:
/*
const lichessAPI = new LichessAPI();

// Check if available
await lichessAPI.checkAvailability();

// Get move suggestion
const fenPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const move = await lichessAPI.makeMove(fenPosition);
*/