# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Minecraft Chess is a multiplayer web-based chess game with a Minecraft aesthetic, built for educational purposes. The application consists of a Node.js/Express backend with Socket.IO for real-time multiplayer functionality, and a vanilla JavaScript frontend with a custom chess engine.

## Common Development Commands

### Local Development
```powershell
# Install dependencies
npm install

# Start the server (production mode)
npm start

# Start in development mode with auto-restart
npm run dev
```

### Testing and Validation
```powershell
# Server will be available at http://localhost:3000
# Check if server is running
curl http://localhost:3000/api/stats

# View active game rooms
curl http://localhost:3000/api/rooms
```

### Debugging
```powershell
# Check server logs for multiplayer connection issues
# Server outputs detailed logs with emoji prefixes for easy identification:
# 🎮 - Player connections
# 📦 - Room creation
# ♟️ - Move events  
# 🧹 - Cleanup operations
```

## Architecture Overview

### Frontend Architecture
The client-side follows a modular class-based architecture with clear separation of concerns:

- **Chess Engine** (`chess.js`): Complete chess rule implementation with move validation, check/checkmate detection, en passant, castling, and pawn promotion
- **UI Controller** (`ui.js`): Handles DOM manipulation, piece rendering with Minecraft emojis, move highlighting, and user interactions
- **Multiplayer Client** (`multiplayer.js`): WebSocket client for real-time multiplayer using Socket.IO
- **Game Coordinator** (`main.js`): Initializes components, handles keyboard shortcuts, statistics tracking, and cross-component communication

### Backend Architecture
The server uses Express.js with Socket.IO for real-time features:

- **GameRoom Class**: Manages individual game sessions with player assignment (white/black), game state synchronization, and automatic cleanup
- **Socket Event Handlers**: Process `joinRoom`, `makeMove`, `newGame`, and connection management
- **REST API**: Provides `/api/rooms` and `/api/stats` endpoints for server monitoring
- **Automatic Cleanup**: Removes empty rooms and implements 24-hour room expiration

### Key Design Patterns

1. **Observer Pattern**: UI components listen for chess engine events and multiplayer updates
2. **State Synchronization**: Game state is maintained both client-side and server-side, with the server being authoritative
3. **Modular Event System**: Each component has clear responsibilities and communicates through well-defined interfaces

## Development Workflow

### Adding New Features
When extending the game:

1. **Chess Rules**: Modify the `Chess` class in `chess.js` for game logic changes
2. **UI Updates**: Update `UI` class methods and CSS for visual changes  
3. **Multiplayer Events**: Add new Socket.IO events in both `server.js` and `multiplayer.js`
4. **Persistence**: Game statistics are stored in localStorage, extend the `gameStats` object in `main.js`

### Common Modification Points

- **Piece Symbols**: Update `pieceSymbols` object in `ui.js` to change Minecraft-themed pieces
- **Game Logic**: The chess engine in `chess.js` is fully self-contained for easy rule modifications
- **Styling**: Minecraft aesthetic is controlled via CSS Grid layout in `style.css`
- **Server Configuration**: Port and CORS settings are in `server.js` with environment variable support

### Multiplayer Considerations

When working with multiplayer features:
- All game state changes must be synchronized through the server
- The `canMakeMove()` method in `multiplayer.js` enforces turn-based gameplay
- Room management is handled automatically, but consider memory usage for large-scale deployments
- WebSocket events use a predictable naming pattern: client sends `makeMove`, server broadcasts `moveReceived`

### Performance Notes

- The UI uses throttled updates (60fps) to prevent excessive DOM manipulation
- Touch event handling is implemented for mobile device support
- Animation states are paused when the tab is not visible to conserve resources
- Room cleanup runs hourly to prevent memory leaks

### Debugging Tips

- Server logs use emoji prefixes for easy filtering (`🎮`, `📦`, `♟️`, `🧹`)
- Chess engine has comprehensive move validation with detailed error states
- UI provides visual feedback for invalid moves and connection states
- Use browser's localStorage inspector to examine game statistics

This codebase is designed for educational purposes with clear, well-commented code that makes chess concepts accessible to learners while providing a robust multiplayer gaming experience.