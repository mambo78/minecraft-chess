# Mathias Chess - Professional Node.js Edition

A professional chess game built with Node.js, Express.js, chess.js library, and Stockfish engine integration.

## 🚀 Features

### ✅ Complete Chess Rules (Powered by chess.js)
- **Castling**: Full kingside and queenside castling support
- **En Passant**: Proper en passant capture implementation
- **Pawn Promotion**: Choose Queen, Rook, Bishop, or Knight
- **Check Detection**: Visual king highlighting when in check
- **Checkmate & Stalemate**: Complete game ending detection
- **Move Validation**: All chess rules properly enforced

### 🎨 Beautiful Interface
- **7 Stunning Themes**: Classic, Neon, Wood, Ocean, Sunset, Forest, Royal
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects, transitions, and visual feedback
- **Professional UI**: Clean, modern design with excellent UX

### 🤖 Advanced AI
- **Stockfish Engine**: Real chess engine integration (when available)
- **Smart Fallback AI**: Intelligent moves prioritizing captures and checks
- **5 Difficulty Levels**: Easy, Medium, Hard, Expert, Master
- **Real-time Status**: Shows AI thinking state and readiness

### 🎮 Game Features
- **Two Game Modes**: Human vs Human or Human vs Stockfish
- **Move History**: Complete game history tracking
- **Undo Functionality**: Take back moves (handles AI moves too)
- **Hint System**: Get suggestions for good moves
- **Captured Pieces**: Visual display of captured pieces

## 📋 Requirements

- Node.js >= 14.0.0
- NPM (comes with Node.js)

## 🛠 Installation & Setup

### 1. Copy files to your server
Copy the entire `chess-game-v5` folder to your Node.js server.

### 2. Install dependencies
```bash
cd chess-game-v5
npm install
```

### 3. Start the server
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

### 4. Access the game
Open your browser and go to:
- Local: `http://localhost:3000`
- Server: `http://your-server-ip:3000`

## 🔧 Configuration

### Port Configuration
By default, the server runs on port 3000. You can change this by setting the `PORT` environment variable:

```bash
# Linux/Mac
PORT=8080 npm start

# Windows
set PORT=8080 && npm start
```

### Production Deployment
For production deployment, consider using PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "mathias-chess"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🎯 API Endpoints

The server provides RESTful API endpoints for chess operations:

- `GET /api/game/new` - Start a new game
- `GET /api/game/:gameId` - Get game state
- `POST /api/game/:gameId/move` - Make a move
- `GET /api/game/:gameId/moves/:square` - Get valid moves for a square
- `POST /api/game/:gameId/undo` - Undo last move
- `POST /api/game/:gameId/ai-move` - Request AI move
- `GET /api/game/:gameId/hint` - Get move hint

## 🔍 Troubleshooting

### Stockfish Issues
If Stockfish doesn't load properly:
1. The game will automatically fall back to Smart AI
2. Check console logs for Stockfish loading errors
3. Ensure the stockfish npm package is installed correctly

### Port Already in Use
If port 3000 is already in use:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <PID_NUMBER> /F

# Or use a different port
PORT=3001 npm start
```

### Memory Issues
For production servers with limited memory:
- Consider reducing Stockfish depth levels
- Use PM2 for better process management
- Monitor memory usage with `top` or Task Manager

## 🏗 Architecture

### Backend (Node.js + Express)
- **server.js**: Main Express server with API endpoints
- **chess.js**: Professional chess library for move validation
- **stockfish**: Chess engine for AI moves
- **CORS enabled**: For potential frontend/backend separation

### Frontend (Vanilla JavaScript)
- **Responsive Design**: CSS Grid and Flexbox
- **API Integration**: Fetch API for server communication  
- **Real-time Updates**: Instant board updates and game state
- **Progressive Enhancement**: Works without JavaScript (basic functionality)

### Game State Management
- Games stored in memory (Map structure)
- Each game has unique ID
- Complete move history tracking
- FEN notation support

## 📝 Development

### File Structure
```
chess-game-v5/
├── package.json          # Dependencies and scripts
├── server.js             # Express server with API endpoints
├── README.md            # This file
└── public/
    └── index.html       # Complete frontend application
```

### Adding Features
1. **New API Endpoints**: Add to `server.js`
2. **Frontend Features**: Modify `public/index.html`
3. **Styling**: CSS is embedded in the HTML file
4. **Chess Logic**: Handled by chess.js library

## 🎮 How to Play

1. **Start Game**: Click "🔄 New Game" to begin
2. **Make Moves**: Click a piece, then click destination square
3. **Game Modes**: 
   - "👥 vs Human": Two players on same device
   - "🤖 vs Stockfish": Play against AI
4. **Special Moves**:
   - **Castling**: Move king 2 squares toward rook
   - **En Passant**: Automatic when conditions met
   - **Promotion**: Dialog appears for pawn promotion
5. **Controls**:
   - "↩️ Undo Move": Take back last move
   - "💡 Show Hint": Get move suggestion
   - "🎲 Random Theme": Change board appearance

## 🌟 Advanced Features

### Real Stockfish Integration
- Uses actual Stockfish chess engine
- Configurable difficulty from 1-20
- Handles timeouts gracefully
- Falls back to smart AI if unavailable

### Professional Chess Rules
- All FIDE rules implemented via chess.js
- Proper move validation
- Game state detection (check, checkmate, stalemate, draw)
- Complete move history with algebraic notation

### Performance Optimizations
- Efficient FEN parsing
- Minimal DOM updates
- Async move processing
- Loading states for better UX

## 📄 License

MIT License - Feel free to use and modify for your projects.

## 🤝 Support

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Verify Node.js version (>= 14.0.0)
3. Ensure all dependencies are installed (`npm install`)
4. Check server logs for API errors

---

**Enjoy playing Mathias Chess! ♟️👑**