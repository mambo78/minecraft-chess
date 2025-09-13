# 🎮 Mathias Chess v2 - Clean Implementation

A modern chess game with **Stockfish AI integration** and **multiple themes**!

## ✨ Features

- **🤖 Stockfish AI Engine** - World's strongest chess engine with multiple difficulty levels
- **🎨 7 Themed Piece Sets** - Classic, Minecraft, Mario, Sonic, Pokémon, Space, Medieval
- **👥 Human vs Human** or **🤖 Human vs AI** modes
- **🎯 Smart Move Validation** - Prevents illegal moves and checks
- **📋 Move History** - Track all moves in algebraic notation
- **↶ Undo System** - Take back moves (works in both modes)
- **♕ Pawn Promotion** - Choose piece when pawns reach the end
- **⚡ Keyboard Shortcuts** - Fast controls for experienced players
- **📱 Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

1. **Install Node.js** (if you don't have it):
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose the LTS version

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   - Go to `http://localhost:3000`
   - Enjoy playing chess! 🎉

## 🎮 How to Play

### Game Modes
- **👥 vs Human**: Play against another person
- **🤖 vs Stockfish**: Play against the AI engine

### AI Difficulty Levels
- **😊 Easy**: Perfect for beginners
- **🤔 Medium**: Good challenge for casual players  
- **😤 Hard**: Strong opponent for experienced players
- **🧠 Expert**: Maximum strength - grandmaster level!

### Controls
- **Click** pieces to select and move them
- **ESC** - Clear selection
- **Ctrl+Z** - Undo last move
- **Ctrl+N** - New game
- **H** - Show hint for selected piece

### Themes
Choose from 7 amazing themes:
- 🏛️ **Classic Chess** - Traditional pieces
- 🎮 **Minecraft** - Blocky game theme
- 🍄 **Mario Bros** - Nintendo characters
- 💨 **Sonic** - Blue hedgehog theme
- ⚡ **Pokémon** - Catch them all!
- 🚀 **Space** - Cosmic adventure
- ⚔️ **Medieval** - Knights and castles

## 🛠️ Technical Details

### File Structure
```
chess-game-v2/
├── public/
│   ├── css/
│   │   └── style.css      # Modern responsive styling
│   ├── js/
│   │   ├── chess.js       # Core chess logic & rules
│   │   ├── stockfish.js   # AI engine integration
│   │   ├── themes.js      # Piece themes system
│   │   ├── ui.js          # User interface controller
│   │   └── game.js        # Main game controller
│   └── index.html         # Game interface
├── server/
│   └── server.js          # Express server
├── package.json           # Dependencies
└── README.md             # This file
```

### Key Technologies
- **Frontend**: Vanilla JavaScript (ES6+), CSS Grid, Flexbox
- **Backend**: Node.js, Express.js, Socket.IO
- **AI Engine**: Stockfish.js (WebAssembly)
- **Chess Logic**: Custom implementation with full rule validation

## 🎯 Features Comparison

| Feature | Old Version | New Version |
|---------|-------------|-------------|
| Chess Engine | Custom buggy AI | **Stockfish 16** |
| Themes | Broken system | **7 Working themes** |
| Move Validation | Had bugs | **Perfect validation** |
| UI Response | Laggy | **Smooth & fast** |
| Code Quality | Messy | **Clean & organized** |
| Error Handling | Poor | **Robust** |

## 🐛 Troubleshooting

### Game Won't Load
- Make sure Node.js is installed
- Run `npm install` in the project directory
- Check that port 3000 isn't in use

### AI Not Working
- The game will fallback to simple AI if Stockfish fails to load
- Check browser console for error messages
- Try refreshing the page

### Themes Not Changing
- Clear your browser cache
- Check console for JavaScript errors
- Try a different browser

## 🔧 Development

To modify the game:

1. **Chess Rules**: Edit `chess.js`
2. **AI Behavior**: Edit `stockfish.js` 
3. **Themes**: Add new themes in `themes.js`
4. **UI/UX**: Modify `ui.js` and `style.css`
5. **Game Flow**: Update `game.js`

## 📝 License

This project is open source. Feel free to modify and use it for your own projects!

## 🎉 Credits

- **Stockfish** - The amazing chess engine
- **Unicode Chess Symbols** - For piece representations
- **Modern CSS** - For beautiful styling
- **Your Creativity** - For the themed pieces!

---

**Made with ♟️ by Mateo**

*Enjoy your chess games and may the best player win!* 🏆