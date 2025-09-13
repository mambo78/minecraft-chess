// Stockfish Chess Engine Integration
class StockfishEngine {
    constructor() {
        this.engine = null;
        this.isReady = false;
        this.isThinking = false;
        this.onMoveCallback = null;
        
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
            this.updateStatus('loading', '🤖 Loading Stockfish...');
            
            // Try to load Stockfish from CDN
            try {
                this.engine = new Worker('https://unpkg.com/stockfish@16.0.0/src/stockfish.js');
            } catch (error) {
                console.warn('⚠️ CDN Stockfish failed, trying alternative...');
                // Fallback - create a simple AI instead
                this.createFallbackAI();
                return;
            }
            
            this.engine.onmessage = (event) => {
                this.handleEngineMessage(event.data);
            };
            
            this.engine.onerror = (error) => {
                console.error('🤖 Stockfish error:', error);
                this.createFallbackAI();
            };
            
            // Initialize engine
            this.sendCommand('uci');
            
            // Timeout fallback
            setTimeout(() => {
                if (!this.isReady) {
                    console.warn('🤖 Stockfish timeout, using simple AI');
                    this.createFallbackAI();
                }
            }, 10000);
            
        } catch (error) {
            console.error('🤖 Failed to initialize Stockfish:', error);
            this.createFallbackAI();
        }
    }
    
    createFallbackAI() {
        console.log('🤖 Using simple fallback AI');
        this.engine = null;
        this.isReady = true;
        this.updateStatus('ready', '🤖 Simple AI Ready');
    }
    
    handleEngineMessage(message) {
        if (typeof message !== 'string') return;
        
        console.log('🤖 Stockfish:', message);
        
        if (message === 'uciok') {
            this.sendCommand('isready');
        } else if (message === 'readyok') {
            this.isReady = true;
            this.applyDifficulty();
            console.log('🤖 Stockfish engine ready!');
            this.updateStatus('ready', '🤖 Stockfish Ready');
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
        if (!this.engine) return;
        
        const diff = this.difficulties[this.currentDifficulty];
        
        // Set Stockfish skill level (0-20, where 20 is strongest)
        this.sendCommand(`setoption name Skill Level value ${diff.skill}`);
        
        // Set other options for difficulty
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
            console.warn('🤖 Engine not ready');
            return null;
        }
        
        // If using fallback AI, use simple logic
        if (!this.engine) {
            return await this.makeFallbackMove(fenPosition);
        }
        
        return new Promise((resolve) => {
            this.isThinking = true;
            this.onMoveCallback = resolve;
            this.updateStatus('thinking', '🤖 Stockfish Thinking...');
            
            // Set the current position
            this.sendCommand(`position fen ${fenPosition}`);
            
            // Calculate best move with current difficulty settings
            const diff = this.difficulties[this.currentDifficulty];
            this.sendCommand(`go depth ${diff.depth} movetime ${diff.time}`);
            
            // Timeout fallback
            setTimeout(() => {
                if (this.isThinking) {
                    console.warn('🤖 Stockfish timeout');
                    this.isThinking = false;
                    this.updateStatus('ready', '🤖 Stockfish Ready');
                    resolve(this.makeFallbackMove(fenPosition));
                }
            }, diff.time + 5000);
        });
    }
    
    async makeFallbackMove(fenPosition) {
        // Simple AI: just pick a random valid move
        await this.sleep(500 + Math.random() * 1000); // Simulate thinking
        
        // This would need access to the chess game to get valid moves
        // For now, return null to indicate no move found
        console.log('🤖 Fallback AI would analyze:', fenPosition);
        return null;
    }
    
    handleBestMove(message) {
        this.isThinking = false;
        this.updateStatus('ready', '🤖 Stockfish Ready');
        
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
        // Convert UCI notation (e.g., "e2e4") to our format
        if (!moveStr || moveStr.length < 4) return null;
        
        const fromCol = moveStr.charCodeAt(0) - 97; // 'a' = 0
        const fromRow = 8 - parseInt(moveStr[1]);   // '8' = 0 (flip board)
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
    
    updateStatus(status, message) {
        const statusElement = document.getElementById('engine-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `engine-status ${status}`;
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    cleanup() {
        if (this.engine) {
            this.engine.terminate();
        }
    }
}