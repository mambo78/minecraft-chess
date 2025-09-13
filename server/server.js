const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Game rooms storage
const gameRooms = new Map();

class GameRoom {
    constructor(roomId) {
        this.id = roomId;
        this.players = new Map(); // socketId -> {color, name}
        this.gameState = null;
        this.maxPlayers = 2;
        this.createdAt = new Date();
    }

    addPlayer(socketId, playerName = null) {
        if (this.players.size >= this.maxPlayers) {
            return { success: false, error: 'Room is full' };
        }

        // Assign color based on current players
        let color = 'white';
        if (this.players.size === 1) {
            // If there's already one player, assign opposite color
            const existingColor = Array.from(this.players.values())[0].color;
            color = existingColor === 'white' ? 'black' : 'white';
        }

        this.players.set(socketId, {
            color: color,
            name: playerName || `Player ${this.players.size + 1}`,
            joinedAt: new Date()
        });

        return { success: true, color: color };
    }

    removePlayer(socketId) {
        this.players.delete(socketId);
    }

    getPlayerBySocketId(socketId) {
        return this.players.get(socketId);
    }

    getPlayersInfo() {
        const playersInfo = { white: null, black: null };
        
        for (const [socketId, player] of this.players) {
            playersInfo[player.color] = player.name;
        }

        return playersInfo;
    }

    updateGameState(newGameState) {
        this.gameState = newGameState;
    }

    isEmpty() {
        return this.players.size === 0;
    }

    isFull() {
        return this.players.size >= this.maxPlayers;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/rooms', (req, res) => {
    const rooms = Array.from(gameRooms.values()).map(room => ({
        id: room.id,
        playerCount: room.players.size,
        maxPlayers: room.maxPlayers,
        isFull: room.isFull(),
        createdAt: room.createdAt
    }));
    
    res.json(rooms);
});

app.get('/api/stats', (req, res) => {
    const stats = {
        activeRooms: gameRooms.size,
        totalPlayers: Array.from(gameRooms.values()).reduce((sum, room) => sum + room.players.size, 0),
        serverUptime: process.uptime()
    };
    
    res.json(stats);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🎮 Player connected: ${socket.id}`);

    socket.on('joinRoom', (data) => {
        const { room: roomId } = data;
        
        try {
            // Leave any existing room first
            if (socket.currentRoom) {
                leaveRoom(socket, socket.currentRoom);
            }

            // Get or create room
            let room = gameRooms.get(roomId);
            if (!room) {
                room = new GameRoom(roomId);
                gameRooms.set(roomId, room);
                console.log(`📦 Created new room: ${roomId}`);
            }

            // Try to add player to room
            const result = room.addPlayer(socket.id);
            
            if (!result.success) {
                socket.emit('roomError', result.error);
                return;
            }

            // Join the socket room
            socket.join(roomId);
            socket.currentRoom = roomId;

            console.log(`👤 Player ${socket.id} joined room ${roomId} as ${result.color}`);

            // Send confirmation to the player
            socket.emit('roomJoined', {
                room: roomId,
                color: result.color,
                players: room.getPlayersInfo()
            });

            // Send current game state if available
            if (room.gameState) {
                socket.emit('gameState', room.gameState);
            }

            // Notify other players in the room
            socket.to(roomId).emit('opponentJoined', {
                color: result.color,
                players: room.getPlayersInfo()
            });

        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('roomError', 'Failed to join room');
        }
    });

    socket.on('makeMove', (data) => {
        const { room: roomId, from, to, gameState } = data;
        
        try {
            const room = gameRooms.get(roomId);
            if (!room) {
                socket.emit('roomError', 'Room not found');
                return;
            }

            const player = room.getPlayerBySocketId(socket.id);
            if (!player) {
                socket.emit('roomError', 'Player not in room');
                return;
            }

            // Update room game state
            room.updateGameState(gameState);

            // Broadcast move to other players in the room
            socket.to(roomId).emit('moveReceived', {
                from: from,
                to: to,
                player: player.color,
                gameState: gameState
            });

            console.log(`♟️  Move made in room ${roomId}: ${player.color} moved from ${JSON.stringify(from)} to ${JSON.stringify(to)}`);

        } catch (error) {
            console.error('Error handling move:', error);
            socket.emit('roomError', 'Failed to process move');
        }
    });

    socket.on('newGame', (data) => {
        const { room: roomId, gameState } = data;
        
        try {
            const room = gameRooms.get(roomId);
            if (!room) {
                socket.emit('roomError', 'Room not found');
                return;
            }

            const player = room.getPlayerBySocketId(socket.id);
            if (!player) {
                socket.emit('roomError', 'Player not in room');
                return;
            }

            // Update room game state
            room.updateGameState(gameState);

            // Broadcast new game to other players in the room
            socket.to(roomId).emit('newGameReceived', {
                player: player.color,
                gameState: gameState
            });

            console.log(`🆕 New game started in room ${roomId} by ${player.color}`);

        } catch (error) {
            console.error('Error handling new game:', error);
            socket.emit('roomError', 'Failed to start new game');
        }
    });

    socket.on('disconnect', () => {
        console.log(`👋 Player disconnected: ${socket.id}`);
        
        if (socket.currentRoom) {
            leaveRoom(socket, socket.currentRoom);
        }
    });

    // Handle custom disconnect from room
    socket.on('leaveRoom', () => {
        if (socket.currentRoom) {
            leaveRoom(socket, socket.currentRoom);
        }
    });

    function leaveRoom(socket, roomId) {
        const room = gameRooms.get(roomId);
        if (!room) return;

        const player = room.getPlayerBySocketId(socket.id);
        if (player) {
            console.log(`🚪 Player ${socket.id} (${player.color}) left room ${roomId}`);
        }

        // Remove player from room
        room.removePlayer(socket.id);
        socket.leave(roomId);

        // Notify other players
        if (player) {
            socket.to(roomId).emit('opponentLeft', {
                color: player.color,
                players: room.getPlayersInfo()
            });
        }

        // Clean up empty rooms
        if (room.isEmpty()) {
            gameRooms.delete(roomId);
            console.log(`🗑️  Deleted empty room: ${roomId}`);
        }

        socket.currentRoom = null;
    }
});

// Clean up old empty rooms periodically
setInterval(() => {
    const now = new Date();
    let cleanedRooms = 0;
    
    for (const [roomId, room] of gameRooms) {
        const roomAge = now - room.createdAt;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (room.isEmpty() || roomAge > maxAge) {
            gameRooms.delete(roomId);
            cleanedRooms++;
        }
    }
    
    if (cleanedRooms > 0) {
        console.log(`🧹 Cleaned up ${cleanedRooms} old rooms`);
    }
}, 60 * 60 * 1000); // Run every hour

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
server.listen(PORT, () => {
    console.log('🎮 Minecraft Chess Server Started!');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Visit http://localhost:${PORT} to play`);
    console.log('🚀 Ready for multiplayer chess battles!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Server shutting down gracefully...');
    server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Server interrupted, shutting down...');
    server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io };