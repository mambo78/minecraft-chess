# 🎮 Mathias Chess - Clean Implementation

A completely rebuilt Minecraft-themed chess game with **guaranteed centering** and **distinct piece designs**.

## ✨ Key Improvements

### 🎯 Perfect Centering
- **Flexbox container** ensures the game is always perfectly centered
- Responsive design that works on all screen sizes
- No more layout issues!

### 🎨 Distinct Chess Pieces
- **White Queen**: Bright pink ♕ - impossible to confuse with pawns
- **Black Queen**: Dark red ♛ - clearly different from black pawns
- **All pieces** have unique colors and symbols
- Enhanced visibility with proper text shadows

### 🎮 Features

- **Full Chess Rules**: Complete implementation with en passant, castling, promotion
- **Real-time Multiplayer**: Socket.IO powered multiplayer rooms
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Minecraft Theme**: Pixelated fonts and block-inspired styling
- **Move History**: Track all moves made in the game
- **Captured Pieces**: See what pieces have been captured
- **Game Status**: Check, checkmate, and stalemate detection

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open Your Browser
Navigate to `http://localhost:3000`

## 🎯 How to Play

1. **Local Play**: Just start moving pieces - no setup required
2. **Multiplayer**: Click "Connect" then "Join Room" 
3. **Controls**:
   - Click a piece to select it
   - Click a highlighted square to move
   - Use buttons for New Game, Undo, and Hints

### 🎮 Keyboard Shortcuts
- `Escape` - Clear selection
- `Ctrl+Z` - Undo move (local games only)
- `Ctrl+N` - New game
- `H` - Show hint
- `Ctrl+D` - Debug mode

## 🎨 Piece Legend

### White Pieces
- ♔ King (Gold)
- ♕ Queen (Bright Pink) - **Easy to distinguish!**
- ♖ Rook (Turquoise)
- ♗ Bishop (Orange)
- ♘ Knight (Purple)
- ♙ Pawn (Beige)

### Black Pieces  
- ♚ King (Black)
- ♛ Queen (Dark Red) - **Easy to distinguish!**
- ♜ Rook (Dark Gray)
- ♝ Bishop (Brown)
- ♞ Knight (Dark Blue)
- ♟ Pawn (Gray)

## 🌐 Deployment

### Local Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production
```bash
npm start
```

## 📁 Project Structure

```
minecraft-chess-clean/
├── public/
│   ├── index.html          # Main HTML with centered layout
│   ├── css/
│   │   └── style.css       # Responsive CSS with distinct pieces
│   └── js/
│       ├── chess.js        # Game logic
│       ├── ui.js          # User interface
│       ├── multiplayer.js # Network code
│       └── main.js        # App initialization
├── server/
│   └── server.js          # Express + Socket.IO server
├── package.json
└── README.md
```

## 🎮 Why This Version is Better

### ❌ Problems with Old Version:
- Game wasn't centered properly
- Black queen looked identical to black pawns
- Layout issues on different screen sizes
- Complex nested HTML structure

### ✅ Solutions in Clean Version:
- **Flexbox centering**: Guaranteed to work on all browsers
- **Distinct piece colors**: Queens are impossible to confuse
- **Simplified HTML**: Cleaner, more maintainable structure  
- **Better responsive design**: Works perfectly on mobile

## 🛠️ Technical Details

- **Frontend**: Vanilla JavaScript, CSS Grid, Flexbox
- **Backend**: Node.js, Express, Socket.IO
- **Chess Logic**: Complete rule implementation
- **Multiplayer**: Real-time rooms with WebSocket
- **Styling**: Minecraft-inspired design with modern CSS

## 🎯 Perfect for

- Chess learning and practice
- Multiplayer games with friends
- Minecraft fans who love chess
- Anyone who wants a clean, centered chess game!

---

**Created with ❤️ for Mathias - Now with perfect centering and distinct pieces!** 🎮♟️