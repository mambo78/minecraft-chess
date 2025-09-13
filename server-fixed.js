const express = require('express');
const path = require('path');
const cors = require('cors');

console.log('🚀 Starting Mathias Chess Server...');
console.log('📁 Current directory:', __dirname);
console.log('🔍 Node.js version:', process.version);

// Try to load chess.js
let Chess;
try {
    const chessModule = require('chess.js');
    Chess = chessModule.Chess || chessModule.default || chessModule;
    console.log('✅ chess.js loaded successfully');
} catch (error) {
    console.error('❌ Failed to load chess.js:', error.message);
    console.log('🔧 Please run: npm install chess.js');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store game instances (in production, use Redis or database)
const games = new Map();

// Initialize Stockfish engine
let stockfish = null;
try {
    const Stockfish = require('stockfish');
    stockfish = Stockfish();
    console.log('✅ Stockfish engine loaded successfully');
} catch (error) {
    console.log('⚠️ Stockfish not available, using fallback AI:', error.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        chessJsAvailable: !!Chess,
        stockfishAvailable: !!stockfish,
        gamesCount: games.size
    });
});

// API Routes
app.get('/api/game/new', (req, res) => {
    try {
        const gameId = generateGameId();
        const chess = new Chess();
        
        games.set(gameId, {
            chess: chess,
            fen: chess.fen(),
            history: [],
            status: 'active'
        });
        
        console.log(`🎮 New game created: ${gameId}`);
        
        res.json({
            gameId: gameId,
            fen: chess.fen(),
            status: 'active',
            turn: chess.turn(),
            check: chess.inCheck(),
            checkmate: chess.isCheckmate(),
            stalemate: chess.isStalemate(),
            draw: chess.isDraw()
        });
    } catch (error) {
        console.error('❌ Error creating new game:', error);
        res.status(500).json({ error: 'Failed to create new game', details: error.message });
    }
});

app.get('/api/game/:gameId', (req, res) => {
    try {
        const game = games.get(req.params.gameId);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        res.json({
            gameId: req.params.gameId,
            fen: game.chess.fen(),
            history: game.chess.history({ verbose: true }),
            status: game.status,
            turn: game.chess.turn(),
            check: game.chess.inCheck(),
            checkmate: game.chess.isCheckmate(),
            stalemate: game.chess.isStalemate(),
            draw: game.chess.isDraw(),
            moves: game.chess.moves({ verbose: true })
        });
    } catch (error) {
        console.error('❌ Error getting game:', error);
        res.status(500).json({ error: 'Failed to get game', details: error.message });
    }
});

app.post('/api/game/:gameId/move', (req, res) => {
    try {
        const game = games.get(req.params.gameId);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        const { from, to, promotion } = req.body;
        
        const move = game.chess.move({ from, to, promotion });
        if (move) {
            console.log(`♟️ Move made in game ${req.params.gameId}: ${from} -> ${to}`);
            res.json({
                success: true,
                move: move,
                fen: game.chess.fen(),
                turn: game.chess.turn(),
                check: game.chess.inCheck(),
                checkmate: game.chess.isCheckmate(),
                stalemate: game.chess.isStalemate(),
                draw: game.chess.isDraw(),
                history: game.chess.history({ verbose: true })
            });
        } else {
            res.status(400).json({ error: 'Invalid move' });
        }
    } catch (error) {
        console.error('❌ Error making move:', error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/game/:gameId/moves/:square', (req, res) => {
    try {
        const game = games.get(req.params.gameId);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        const moves = game.chess.moves({ square: req.params.square, verbose: true });
        res.json({ moves: moves });
    } catch (error) {
        console.error('❌ Error getting moves:', error);
        res.status(500).json({ error: 'Failed to get moves', details: error.message });
    }
});

app.post('/api/game/:gameId/undo', (req, res) => {
    try {
        const game = games.get(req.params.gameId);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        const move = game.chess.undo();
        if (move) {
            console.log(`↩️ Move undone in game ${req.params.gameId}`);
            res.json({
                success: true,
                undoneMove: move,
                fen: game.chess.fen(),
                turn: game.chess.turn(),
                check: game.chess.inCheck(),
                checkmate: game.chess.isCheckmate(),
                stalemate: game.chess.isStalemate(),
                draw: game.chess.isDraw()
            });
        } else {
            res.status(400).json({ error: 'No move to undo' });
        }
    } catch (error) {
        console.error('❌ Error undoing move:', error);
        res.status(500).json({ error: 'Failed to undo move', details: error.message });
    }
});

app.post('/api/game/:gameId/ai-move', async (req, res) => {
    try {
        const game = games.get(req.params.gameId);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        const { difficulty = 10 } = req.body;
        
        const aiMove = await getAIMove(game.chess, difficulty);
        if (aiMove) {
            const move = game.chess.move(aiMove);
            console.log(`🤖 AI move in game ${req.params.gameId}: ${aiMove.from} -> ${aiMove.to}`);
            res.json({
                success: true,
                move: move,
                fen: game.chess.fen(),
                turn: game.chess.turn(),
                check: game.chess.inCheck(),
                checkmate: game.chess.isCheckmate(),
                stalemate: game.chess.isStalemate(),
                draw: game.chess.isDraw()
            });
        } else {
            res.status(400).json({ error: 'No valid AI move found' });
        }
    } catch (error) {
        console.error('❌ Error making AI move:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/game/:gameId/hint', (req, res) => {
    try {
        const game = games.get(req.params.gameId);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        const moves = game.chess.moves({ verbose: true });
        if (moves.length === 0) {
            return res.json({ hint: null });
        }
        
        // Prioritize captures and checks
        const captures = moves.filter(move => move.captured);
        const checks = moves.filter(move => {
            game.chess.move(move);
            const inCheck = game.chess.inCheck();
            game.chess.undo();
            return inCheck;
        });
        
        let hintMoves = moves;
        if (captures.length > 0) hintMoves = captures;
        else if (checks.length > 0) hintMoves = checks;
        
        const hint = hintMoves[Math.floor(Math.random() * hintMoves.length)];
        res.json({ hint: hint });
    } catch (error) {
        console.error('❌ Error getting hint:', error);
        res.status(500).json({ error: 'Failed to get hint', details: error.message });
    }
});

// AI Move Logic
async function getAIMove(chess, difficulty) {
    if (stockfish) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(getSmartRandomMove(chess));
            }, 3000);
            
            stockfish.onmessage = (event) => {
                if (event.data && event.data.startsWith && event.data.startsWith('bestmove')) {
                    clearTimeout(timeout);
                    const move = event.data.split(' ')[1];
                    if (move && move !== '(none)') {
                        const from = move.substring(0, 2);
                        const to = move.substring(2, 4);
                        const promotion = move[4] || undefined;
                        resolve({ from, to, promotion });
                    } else {
                        resolve(getSmartRandomMove(chess));
                    }
                }
            };
            
            try {
                stockfish.postMessage(`position fen ${chess.fen()}`);
                stockfish.postMessage(`go depth ${Math.min(difficulty, 15)} movetime 2000`);
            } catch (error) {
                console.log('Stockfish error, using fallback:', error.message);
                clearTimeout(timeout);
                resolve(getSmartRandomMove(chess));
            }
        });
    } else {
        return getSmartRandomMove(chess);
    }
}

function getSmartRandomMove(chess) {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;
    
    // Prioritize: captures > checks > center moves > random
    const captures = moves.filter(move => move.captured);
    const checks = moves.filter(move => {
        chess.move(move);
        const inCheck = chess.inCheck();
        chess.undo();
        return inCheck;
    });
    
    let selectedMoves = moves;
    if (captures.length > 0) {
        selectedMoves = captures;
    } else if (checks.length > 0) {
        selectedMoves = checks;
    }
    
    const randomMove = selectedMoves[Math.floor(Math.random() * selectedMoves.length)];
    return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion
    };
}

// Helper functions
function generateGameId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Serve the main page
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } catch (error) {
        console.error('❌ Error serving index.html:', error);
        res.status(500).send('Error loading the game');
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('💥 Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Mathias Chess Server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} to play`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log('♟️  Features: Chess.js validation, Stockfish AI, Beautiful UI');
    console.log(`📊 Process ID: ${process.pid}`);
});

server.on('error', (error) => {
    console.error('❌ Server startup error:', error.message);
    if (error.code === 'EADDRINUSE') {
        console.log('🔧 Port is already in use. Try a different port:');
        console.log(`   PORT=${PORT + 1} npm start`);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📡 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('📡 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;