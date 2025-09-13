// Stockfish Chess Engine Integration
class StockfishEngine {
    constructor() {
        this.engine = null;
        this.isReady = false;
        this.isThinking = false;
        this.onMoveCallback = null;
        this.currentPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Starting position
        
        this.difficulties = {
            easy: { depth: 1, skill: 0, time: 100 },
            medium: { depth: 5, skill: 10, time: 1000 },
            hard: { depth: 10, skill: 15, time: 2000 },
            expert: { depth: 15, skill: 20, time: 3000 }
        };
        
        this.currentDifficulty = 'medium';
        this.initializeEngine();
    }
    
    async initializeEngine() {
        try {
            console.log('🤖 Initializing Stockfish engine...');
            
            // Load Stockfish from CDN
            if (!window.Stockfish) {
                await this.loadStockfish();
            }
            
            this.engine = new Worker('https://unpkg.com/stockfish@16.0.0/src/stockfish.js');
            
            this.engine.onmessage = (event) => {
                this.handleEngineMessage(event.data);
            };
            
            // Initialize engine
            this.sendCommand('uci');
            
            setTimeout(() => {
                if (!this.isReady) {
                    console.warn('🤖 Stockfish taking longer than expected to initialize');
                    this.fallbackToLocalEngine();
                }
            }, 5000);
            
        } catch (error) {
            console.error('🤖 Failed to initialize Stockfish:', error);
            this.fallbackToLocalEngine();
        }
    }
    
    async loadStockfish() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/stockfish@16.0.0/src/stockfish.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Stockfish'));
            document.head.appendChild(script);
        });
    }
    
    fallbackToLocalEngine() {
        console.log('🤖 Falling back to bundled Stockfish or custom AI');
        // Try to use a local copy or fall back to our custom AI
        try {
            // Attempt to load local stockfish if available
            this.engine = new Worker('/js/stockfish.js');
            this.engine.onmessage = (event) => {
                this.handleEngineMessage(event.data);
            };
            this.sendCommand('uci');
        } catch (error) {
            console.warn('🤖 No local Stockfish found, using custom AI as fallback');
            this.isReady = true; // Mark as ready to use custom AI
            this.updateEngineStatus('🤖 Using Custom AI', 'fallback');
        }
    }
    
    handleEngineMessage(message) {
        console.log('🤖 Stockfish:', message);
        
        if (message === 'uciok') {
            this.sendCommand('isready');
        } else if (message === 'readyok') {
            this.isReady = true;
            this.applyDifficulty();
            console.log('🤖 Stockfish engine ready!');
            this.updateEngineStatus('🤖 Stockfish Ready', 'ready');
        } else if (message.startsWith('bestmove')) {
            this.handleBestMove(message);
        }
    }
    
    sendCommand(command) {
        if (this.engine) {
            console.log('🤖 Sending to Stockfish:', command);
            this.engine.postMessage(command);
        }
    }
    
    applyDifficulty() {
        const diff = this.difficulties[this.currentDifficulty];
        
        // Set Stockfish skill level (0-20, where 20 is strongest)
        this.sendCommand(`setoption name Skill Level value ${diff.skill}`);
        
        // Optionally limit thinking time
        if (diff.time < 3000) {
            this.sendCommand(`setoption name Move Overhead value ${diff.time}`);
        }
    }
    
    setDifficulty(level) {
        if (this.difficulties[level]) {
            this.currentDifficulty = level;
            if (this.isReady) {
                this.applyDifficulty();
            }
        }
    }
    
    getDifficultyInfo() {
        const diffNames = {
            easy: { name: '😊 Easy', description: 'Good for beginners' },
            medium: { name: '🤔 Medium', description: 'Moderate challenge' },
            hard: { name: '😤 Hard', description: 'Strong opponent' },
            expert: { name: '🧠 Expert', description: 'Maximum strength' }
        };
        
        return diffNames[this.currentDifficulty] || diffNames.medium;
    }
    
    async makeMove(fenPosition) {
        if (!this.isReady) {
            console.warn('🤖 Stockfish not ready, trying custom AI');
            return await this.makeCustomAIMove();
        }
        
        return new Promise((resolve) => {
            this.isThinking = true;
            this.onMoveCallback = resolve;
            this.updateEngineStatus('🤖 Stockfish Thinking...', 'thinking');
            
            // Set the current position
            this.sendCommand(`position fen ${fenPosition}`);
            
            // Calculate best move with current difficulty settings
            const diff = this.difficulties[this.currentDifficulty];
            this.sendCommand(`go depth ${diff.depth} movetime ${diff.time}`);
            
            // Timeout fallback
            setTimeout(() => {
                if (this.isThinking) {
                    console.warn('🤖 Stockfish timeout, using fallback');
                    this.isThinking = false;
                    resolve(this.makeCustomAIMove());
                }
            }, diff.time + 2000);
        });
    }
    
    handleBestMove(message) {
        this.isThinking = false;
        this.updateEngineStatus('🤖 Stockfish Ready', 'ready');
        
        // Parse bestmove message: "bestmove e2e4" or "bestmove e2e4 ponder e7e5"
        const parts = message.split(' ');
        const moveStr = parts[1];
        
        if (moveStr && moveStr !== '(none)') {
            const move = this.parseMove(moveStr);
            console.log('🤖 Stockfish suggests:', move);
            
            if (this.onMoveCallback) {
                this.onMoveCallback(move);
                this.onMoveCallback = null;
            }
        } else {
            console.warn('🤖 No valid move from Stockfish');
            if (this.onMoveCallback) {
                this.onMoveCallback(null);
                this.onMoveCallback = null;
            }
        }
    }
    
    parseMove(moveStr) {
        // Convert algebraic notation (e.g., "e2e4") to our format
        if (moveStr.length < 4) return null;
        
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
    
    async makeCustomAIMove() {
        // Fallback to our existing custom AI if Stockfish fails
        if (window.mathiasChess && window.mathiasChess.ai) {
            try {
                return await window.mathiasChess.ai.makeMove();
            } catch (error) {
                console.error('🤖 Custom AI also failed:', error);
                return null;
            }
        }
        return null;
    }
    
    positionToFEN(chess) {
        // Convert our chess board state to FEN notation for Stockfish
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
        
        // Add turn, castling, en passant, halfmove, fullmove
        const turn = chess.currentPlayer === 'white' ? 'w' : 'b';
        const castling = this.getCastlingRights(chess);
        const enPassant = this.getEnPassantSquare(chess);
        const halfmove = chess.halfMoveClock || 0;
        const fullmove = Math.floor(chess.gameHistory.length / 2) + 1;
        
        return `${fen} ${turn} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
    }
    
    getCastlingRights(chess) {
        // This is a simplified version - you'd need to track castling rights properly
        return 'KQkq'; // Assume all castling rights available for now
    }
    
    getEnPassantSquare(chess) {
        // This would need to be tracked based on the last pawn move
        return '-'; // No en passant for now
    }
    
    updateEngineStatus(message, status) {
        const statusElement = document.getElementById('engine-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `engine-status ${status}`;
        }
    }
    
    cleanup() {
        if (this.engine) {
            this.engine.terminate();
        }
    }
}
