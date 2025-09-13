# Chess Game v6

A modern, clean, and fully-functional chess game built with Node.js, Express, Socket.io, and Chess.js. This version is designed to avoid the 502 Bad Gateway errors encountered in previous versions by using a simplified server architecture similar to the working v2, enhanced with chess.js features.

## 🚀 Features

- **Complete Chess Implementation**: Full chess rules using Chess.js library
- **Real-time Multiplayer**: Socket.io for live gameplay
- **AI Opponent**: Random move AI for single-player mode
- **Move Validation**: All moves validated by Chess.js
- **Game Features**:
  - Pawn promotion with piece selection dialog
  - Move highlighting (legal moves, last move, check)
  - Captured pieces display
  - Move history with algebraic notation
  - Undo functionality
  - Hint system
  - Game status (check, checkmate, stalemate)
- **Visual Themes**: Multiple board color themes
- **Responsive Design**: Works on desktop and mobile devices

## 📁 Project Structure

```
chess-game-v6/
├── package.json          # Dependencies and scripts
├── server.js            # Express server with Socket.io
├── public/
│   ├── index.html       # Main game interface
│   ├── css/
│   │   └── styles.css   # Complete styling
│   └── js/
│       ├── themes.js    # Theme management
│       ├── chess-logic.js # Core game logic with Chess.js
│       └── ui.js        # UI controls and interactions
└── README.md           # This file
```

## 🛠 Installation & Setup

1. **Install Dependencies**
   ```bash
   cd chess-game-v6
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   # or
   node server.js
   ```

3. **Access the Game**
   - Open your browser to `http://localhost:3000`
   - For remote deployment, use your server's IP/domain

## 🎮 How to Play

### Game Modes
- **Two Player**: Take turns on the same device
- **vs AI**: Play against a random move AI opponent

### Controls
- **Click** a piece to select it
- **Click** a destination square to move
- **New Game**: Reset the board
- **Undo**: Take back the last move(s)
- **Hint**: Get a suggested move (captures or checks preferred)
- **Theme**: Change board colors

### Game Features
- **Pawn Promotion**: Choose Queen, Rook, Bishop, or Knight
- **Check Indication**: King square highlighted in red when in check
- **Move History**: View all moves in algebraic notation
- **Captured Pieces**: See what pieces have been taken

## 🔧 Technical Details

### Dependencies
- **express**: Web server framework
- **socket.io**: Real-time communication
- **cors**: Cross-origin resource sharing
- **chess.js**: Chess game logic and validation

### Architecture
- **Frontend**: Pure HTML/CSS/JavaScript with Chess.js
- **Backend**: Minimal Express server with Socket.io
- **Communication**: WebSocket for real-time updates
- **Game Logic**: Client-side Chess.js for immediate response

### Key Components

#### Server (server.js)
- Express server on port 3000
- Socket.io for real-time communication
- Minimal routing, static file serving
- Designed to avoid 502 gateway errors

#### Chess Logic (chess-logic.js)
- Chess.js integration
- Move validation and execution
- Game state management
- AI opponent logic
- Promotion handling

#### UI Controller (ui.js)
- Game controls (new game, undo, hint)
- User interaction handling
- Visual feedback and animations

#### Themes (themes.js)
- Multiple color schemes
- Dynamic theme switching
- Theme persistence

## 🎨 Themes Available

1. **Classic**: Traditional brown/beige
2. **Modern**: Blue/gray theme
3. **Green**: Forest green colors
4. **Purple**: Royal purple theme
5. **Ocean**: Blue ocean colors
6. **Sunset**: Orange/red gradient

## 🐛 Troubleshooting

### Common Issues

1. **502 Bad Gateway Error**
   - Ensure Node.js is installed on your server
   - Check that port 3000 is available
   - Verify all dependencies are installed (`npm install`)
   - Check server logs for specific errors

2. **Game Not Loading**
   - Ensure JavaScript is enabled in your browser
   - Check browser console for errors
   - Verify all JS files are loading correctly

3. **Pieces Not Moving**
   - Check that chess.js is loaded properly
   - Ensure game initialization completed
   - Look for JavaScript errors in console

### Server Deployment
- Use PM2 or similar for process management
- Configure reverse proxy (nginx) to forward to port 3000
- Ensure firewall allows traffic to your chosen port

## 📝 Development

### Adding New Features
1. **Game Features**: Modify `chess-logic.js`
2. **UI Elements**: Update `ui.js` and `index.html`
3. **Styling**: Edit `styles.css`
4. **Server Logic**: Modify `server.js` (keep minimal)

### Testing Locally
```bash
# Install dependencies
npm install

# Start development server
npm start

# Test in browser
# Open http://localhost:3000
```

## 🔄 Version History

- **v6**: Clean rewrite with simplified architecture
- **v5**: Complex server logic (had 502 errors)
- **v2**: Simple working version (reference)

## 📄 License

This project is open source and available under the MIT License.

---

**Note**: This version is specifically designed to avoid the 502 Bad Gateway errors by using a minimal server approach similar to the working v2, while incorporating the enhanced chess features from chess.js library.