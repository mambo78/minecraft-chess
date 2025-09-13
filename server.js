const express = require('express');
const path = require('path');
const cors = require('cors');
const { Chess } = require('chess.js');

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

// API Routes
app.get('/api/game/new', (req, res) => {
    const gameId = generateGameId();
    const chess = new Chess();
    
    games.set(gameId, {
        chess: chess,
        fen: chess.fen(),
        history: [],
        status: 'active'
    });
    
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
});

app.get('/api/game/:gameId', (req, res) => {
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
});

app.post('/api/game/:gameId/move', (req, res) => {
    const game = games.get(req.params.gameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    const { from, to, promotion } = req.body;
    
    try {
        const move = game.chess.move({ from, to, promotion });
        if (move) {
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
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/game/:gameId/moves/:square', (req, res) => {
    const game = games.get(req.params.gameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    const moves = game.chess.moves({ square: req.params.square, verbose: true });
    res.json({ moves: moves });
});

app.post('/api/game/:gameId/undo', (req, res) => {
    const game = games.get(req.params.gameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    const move = game.chess.undo();
    if (move) {
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
});

app.post('/api/game/:gameId/ai-move', async (req, res) => {
    const game = games.get(req.params.gameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    const { difficulty = 10 } = req.body;
    
    try {
        const aiMove = await getAIMove(game.chess, difficulty);
        if (aiMove) {
            const move = game.chess.move(aiMove);
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
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/game/:gameId/hint', (req, res) => {
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
});

// AI Move Logic
async function getAIMove(chess, difficulty) {
    if (stockfish) {
        return new Promise((resolve) => {
            stockfish.postMessage(`position fen ${chess.fen()}`);
            stockfish.postMessage(`go depth ${Math.min(difficulty, 15)} movetime 2000`);
            
            const timeout = setTimeout(() => {
                resolve(getSmartRandomMove(chess));
            }, 3000);
            
            stockfish.onmessage = (event) => {
                if (event.data.startsWith('bestmove')) {
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
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mathias Chess Server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} to play`);
    console.log('♟️  Features: Chess.js validation, Stockfish AI, Beautiful UI');
});

module.exports = app;