<<<<<<< HEAD
# minecraft-chess
a Minecraft themed chess for kids
=======
# 🎮 Minecraft Chess

A fun, educational chess game with a Minecraft theme designed to help teach chess to kids while providing an engaging online multiplayer experience!

![Minecraft Chess](https://img.shields.io/badge/Game-Minecraft%20Chess-brightgreen?style=for-the-badge&logo=minecraft)
![Status](https://img.shields.io/badge/Status-Ready%20to%20Play-success?style=for-the-badge)

## 🌟 Features

### 🎯 Educational Chess Game
- **Full chess implementation** with all standard rules
- **Minecraft-themed pieces** using fun emojis
- **Move validation** and **legal move highlighting**
- **Interactive tutorials** through hints system
- **Visual feedback** for valid and invalid moves

### 🌍 Multiplayer Experience  
- **Real-time online multiplayer** using WebSockets
- **Private rooms** with custom room IDs
- **Friend-to-friend gameplay** by sharing room codes
- **Automatic player matching** and turn management
- **Game state synchronization** across players

### 🎨 Minecraft Aesthetic
- **Blocky, pixelated design** reminiscent of Minecraft
- **Minecraft color scheme** with grass, wood, and stone textures
- **Fun piece representations**: 
  - White: 🤴👸🏰🧙🐴👤 (King, Queen, Rook, Bishop, Knight, Pawn)
  - Black: 👹🧟‍♀️🗿🧙‍♂️🐷🧟 (King, Queen, Rook, Bishop, Knight, Pawn)
- **Retro gaming font** (VT323) for authentic feel
- **Animated interactions** and hover effects

### 📱 Modern Web Features
- **Fully responsive design** for desktop, tablet, and mobile
- **Touch-friendly controls** for mobile devices
- **Keyboard shortcuts** for power users
- **Local storage** for game statistics
- **Progressive Web App** ready
- **Cross-browser compatibility**

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone or download this project**
   ```bash
   git clone <repository-url>
   cd minecraft-chess
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Visit `http://localhost:3000`
   - Start playing chess immediately!

### Alternative Development Mode
For development with auto-restart:
```bash
npm run dev
```

## 🎮 How to Play

### Basic Chess Rules
This game follows standard chess rules:
- **Objective**: Checkmate your opponent's king
- **Turn-based**: White moves first, then players alternate
- **Piece movements**: Each piece has specific movement patterns
- **Special moves**: Castling, en passant, pawn promotion

### Game Controls
- **🖱️ Mouse/Touch**: Click to select pieces and make moves
- **⌨️ Keyboard Shortcuts**:
  - `ESC` - Clear current selection
  - `Ctrl+Z` - Undo last move
  - `Ctrl+N` - Start new game
  - `Ctrl+H` - Show hint
  - `Ctrl+S` - Show game statistics
  - `F1` - Show help

### Multiplayer Mode
1. **Connect to Server**: Click "Connect to Server" button
2. **Join a Room**: 
   - Enter a custom room ID, or
   - Let the game generate one for you
3. **Share Room ID**: Give the room ID to your friend
4. **Play Together**: Take turns making moves in real-time!

## 📁 Project Structure

```
minecraft-chess/
├── 📁 public/                 # Client-side files
│   ├── 📁 css/
│   │   └── style.css         # Minecraft-themed styling
│   ├── 📁 js/
│   │   ├── chess.js          # Chess game engine
│   │   ├── ui.js             # User interface management
│   │   ├── multiplayer.js    # WebSocket client
│   │   └── main.js           # Game initialization
│   └── index.html            # Main game page
├── 📁 server/
│   └── server.js             # Express + Socket.IO server
├── 📁 assets/                # Game assets (expandable)
│   ├── 📁 images/           # Future: piece images
│   └── 📁 sounds/           # Future: sound effects
├── package.json              # Node.js dependencies
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🛠️ Technical Details

### Frontend Technologies
- **HTML5** with semantic markup
- **CSS3** with Grid, Flexbox, and animations  
- **Vanilla JavaScript** (ES6+) for game logic
- **WebSocket** client for real-time communication
- **Responsive design** principles

### Backend Technologies
- **Node.js** runtime environment
- **Express.js** web framework
- **Socket.IO** for WebSocket communication
- **In-memory game state** management
- **CORS** enabled for cross-origin requests

### Game Engine Features
- **Complete chess rule implementation**
- **Move validation** with check/checkmate detection
- **Game history** tracking with undo functionality
- **En passant**, **castling**, and **pawn promotion**
- **Stalemate** and **draw** detection

## 🎓 Educational Value

This game is designed to help teach chess, especially to children:

### Learning Features
- **Visual move hints** show legal moves
- **Immediate feedback** for invalid moves  
- **Turn indicators** make it clear whose turn it is
- **Captured pieces display** shows game progress
- **Move history** helps review games

### Teaching Benefits
- **Engaging theme** appeals to Minecraft fans
- **Intuitive interface** reduces learning barriers
- **Multiplayer support** enables teaching sessions
- **Mistake forgiveness** with undo functionality
- **Progress tracking** through statistics

## 🔧 Customization

### Adding New Features
The modular architecture makes it easy to add:
- **Sound effects** (placeholder system included)
- **Piece animations** and movement effects
- **AI opponents** for single-player mode
- **Tournament modes** and rankings
- **Custom piece sets** and themes

### Configuration
Key settings can be modified in:
- `server/server.js` - Server configuration
- `public/css/style.css` - Visual styling
- `public/js/main.js` - Game initialization settings

## 📊 API Endpoints

The server provides several REST endpoints:

- `GET /` - Main game page
- `GET /api/rooms` - List active game rooms
- `GET /api/stats` - Server statistics

## 🔌 WebSocket Events

### Client to Server
- `joinRoom` - Join a game room
- `makeMove` - Send a chess move
- `newGame` - Start a new game
- `leaveRoom` - Leave current room

### Server to Client
- `roomJoined` - Room join confirmation
- `moveReceived` - Opponent's move
- `newGameReceived` - New game started
- `opponentJoined/Left` - Player status updates

## 🐛 Troubleshooting

### Common Issues

**Server won't start**
- Check if Node.js is installed: `node --version`
- Ensure port 3000 is available
- Try running with `npm run dev` instead

**Can't connect to multiplayer**
- Verify server is running
- Check browser console for errors
- Ensure WebSocket connections aren't blocked

**Game doesn't load**
- Clear browser cache and cookies
- Try a different browser
- Check for JavaScript errors in console

**Moves not working**
- Ensure you're clicking valid squares
- Check if it's your turn in multiplayer
- Verify the selected piece can make that move

## 🚀 Deployment

### Local Network Play
To play across devices on your local network:
1. Find your computer's IP address
2. Start the server with `npm start`
3. Other devices can connect to `http://YOUR_IP:3000`

### Cloud Deployment
This app can be deployed to platforms like:
- **Heroku** - Easy deployment with Git
- **Railway** - Modern Node.js hosting
- **DigitalOcean** - VPS deployment
- **Netlify + Heroku** - Static frontend + backend

## 🤝 Contributing

This project welcomes contributions! Ideas for improvements:

### Gameplay Enhancements
- **AI opponent** with difficulty levels
- **Chess puzzles** and training modes
- **Game analysis** and move suggestions
- **Opening book** integration

### Technical Improvements
- **Database integration** for persistent games
- **User authentication** and profiles  
- **Spectator mode** for watching games
- **Mobile app** versions

### Educational Features
- **Interactive tutorials** for beginners
- **Chess notation** display and export
- **Performance analytics** and improvement tracking
- **Themed piece sets** (different games/movies)

## 📜 License

This project is open source and available under the MIT License.

## 🎉 Have Fun!

Minecraft Chess combines the strategic depth of chess with the playful aesthetics of Minecraft. Whether you're teaching a child the fundamentals of chess or just want to enjoy a casual game with friends, this project provides an engaging and accessible platform.

**Ready to play? Start your server and begin your chess adventure!** 🏰♟️

---

*Built with ❤️ for chess education and Minecraft fans everywhere*
f55487f (Primer commit - Minecraft Chess funcionando en servidor)
