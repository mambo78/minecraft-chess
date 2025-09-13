class Multiplayer {
    constructor(ui) {
        this.ui = ui;
        this.socket = null;
        this.isConnected = false;
        this.currentRoom = null;
        this.playerColor = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.connectBtn = document.getElementById('connect-btn');
        this.joinRoomBtn = document.getElementById('join-room-btn');
        this.roomInput = document.getElementById('room-input');
        this.connectionIndicator = document.getElementById('connection-indicator');
    }

    bindEvents() {
        this.connectBtn.addEventListener('click', () => {
            if (this.isConnected) {
                this.disconnect();
            } else {
                this.connect();
            }
        });

        this.joinRoomBtn.addEventListener('click', () => {
            const roomId = this.roomInput.value.trim();
            if (roomId) {
                this.joinRoom(roomId);
            } else {
                this.joinRoom(this.generateRoomId());
            }
        });

        // Generate random room ID on focus if empty
        this.roomInput.addEventListener('focus', () => {
            if (!this.roomInput.value) {
                this.roomInput.value = this.generateRoomId();
            }
        });
    }

    connect() {
        try {
            // Initialize Socket.IO connection
            this.socket = io();
            
            this.socket.on('connect', () => {
                this.isConnected = true;
                this.updateConnectionStatus();
                this.ui.showMessage('Connected to server!', 'success');
                this.connectBtn.textContent = 'Disconnect';
            });

            this.socket.on('disconnect', () => {
                this.isConnected = false;
                this.updateConnectionStatus();
                this.ui.showMessage('Disconnected from server', 'warning');
                this.connectBtn.textContent = 'Connect to Server';
                this.currentRoom = null;
                this.playerColor = null;
            });

            this.socket.on('connect_error', (error) => {
                this.ui.showMessage('Connection failed: ' + error.message, 'error');
                this.isConnected = false;
                this.updateConnectionStatus();
            });

            // Game-specific events
            this.socket.on('roomJoined', (data) => {
                this.currentRoom = data.room;
                this.playerColor = data.color;
                this.ui.showMessage(`Joined room ${data.room} as ${data.color}`, 'success');
                
                // Update player names if available
                if (data.players) {
                    this.updatePlayerNames(data.players);
                }
            });

            this.socket.on('opponentJoined', (data) => {
                this.ui.showMessage(`${data.color} player joined the game!`, 'info');
                this.updatePlayerNames(data.players);
            });

            this.socket.on('opponentLeft', () => {
                this.ui.showMessage('Opponent left the game', 'warning');
                this.resetPlayerNames();
            });

            this.socket.on('moveReceived', (data) => {
                this.ui.handleRemoteMove(data.from.row, data.from.col, data.to.row, data.to.col);
                this.ui.showMessage('Opponent made a move', 'info');
            });

            this.socket.on('newGameReceived', () => {
                this.ui.handleRemoteNewGame();
            });

            this.socket.on('roomFull', () => {
                this.ui.showMessage('Room is full! Try another room.', 'error');
            });

            this.socket.on('roomError', (error) => {
                this.ui.showMessage('Room error: ' + error, 'error');
            });

            this.socket.on('gameState', (gameState) => {
                // Synchronize game state with server
                if (gameState) {
                    this.ui.chess.board = gameState.board;
                    this.ui.chess.currentPlayer = gameState.currentPlayer;
                    this.ui.chess.gameStatus = gameState.gameStatus;
                    this.ui.chess.capturedPieces = gameState.capturedPieces;
                    this.ui.updateDisplay();
                }
            });

        } catch (error) {
            this.ui.showMessage('Failed to connect: ' + error.message, 'error');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.currentRoom = null;
        this.playerColor = null;
        this.updateConnectionStatus();
        this.resetPlayerNames();
        this.connectBtn.textContent = 'Connect to Server';
    }

    joinRoom(roomId) {
        if (!this.isConnected) {
            this.ui.showMessage('Please connect to server first!', 'warning');
            return;
        }

        this.socket.emit('joinRoom', { room: roomId });
        this.roomInput.value = roomId;
    }

    sendMove(fromRow, fromCol, toRow, toCol) {
        if (!this.isConnected || !this.currentRoom) {
            return;
        }

        const moveData = {
            room: this.currentRoom,
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            gameState: this.ui.chess.getGameState()
        };

        this.socket.emit('makeMove', moveData);
    }

    sendNewGame() {
        if (!this.isConnected || !this.currentRoom) {
            return;
        }

        this.socket.emit('newGame', { 
            room: this.currentRoom,
            gameState: this.ui.chess.getGameState()
        });
    }

    updateConnectionStatus() {
        if (this.isConnected) {
            this.connectionIndicator.className = 'status-indicator online';
            this.connectionIndicator.textContent = 'Online';
        } else {
            this.connectionIndicator.className = 'status-indicator offline';
            this.connectionIndicator.textContent = 'Offline';
        }
    }

    updatePlayerNames(players) {
        const whitePlayerName = document.querySelector('.white-player .player-name');
        const blackPlayerName = document.querySelector('.black-player .player-name');
        
        if (players.white) {
            whitePlayerName.textContent = players.white === 'You' ? 'You (White)' : players.white;
        }
        if (players.black) {
            blackPlayerName.textContent = players.black === 'You' ? 'You (Black)' : players.black;
        }
    }

    resetPlayerNames() {
        const whitePlayerName = document.querySelector('.white-player .player-name');
        const blackPlayerName = document.querySelector('.black-player .player-name');
        
        whitePlayerName.textContent = 'White Player';
        blackPlayerName.textContent = 'Black Player';
    }

    generateRoomId() {
        const adjectives = ['Swift', 'Brave', 'Mighty', 'Clever', 'Noble', 'Quick', 'Wise', 'Bold'];
        const nouns = ['Creeper', 'Enderman', 'Villager', 'Steve', 'Alex', 'Zombie', 'Skeleton', 'Dragon'];
        
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = Math.floor(Math.random() * 1000);
        
        return `${adjective}${noun}${number}`;
    }

    // Check if current player can make moves (for turn validation)
    canMakeMove() {
        if (!this.isConnected || !this.playerColor) {
            return true; // Allow local play if not connected
        }
        
        return this.ui.chess.currentPlayer === this.playerColor;
    }

    getCurrentPlayerInfo() {
        return {
            isConnected: this.isConnected,
            room: this.currentRoom,
            color: this.playerColor,
            canMove: this.canMakeMove()
        };
    }
}