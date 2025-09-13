const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.IO for multiplayer (optional feature)
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);
    
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        
        if (!rooms.has(roomId)) {
            rooms.set(roomId, { players: [], gameState: null });
        }
        
        const room = rooms.get(roomId);
        room.players.push(socket.id);
        
        console.log(`👤 User ${socket.id} joined room ${roomId}`);
        socket.emit('room-joined', roomId);
        
        if (room.players.length === 2) {
            io.to(roomId).emit('game-ready', { players: room.players });
        }
    });
    
    socket.on('move', (data) => {
        socket.to(data.room).emit('opponent-move', data.move);
    });
    
    socket.on('new-game', (data) => {
        socket.to(data.room).emit('opponent-new-game');
    });
    
    socket.on('disconnect', () => {
        console.log('👤 User disconnected:', socket.id);
        
        // Remove player from all rooms
        for (let [roomId, room] of rooms) {
            const index = room.players.indexOf(socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                if (room.players.length === 0) {
                    rooms.delete(roomId);
                } else {
                    socket.to(roomId).emit('opponent-disconnected');
                }
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Chess game server running on http://localhost:${PORT}`);
    console.log(`🎮 Open your browser and navigate to the URL above`);
});