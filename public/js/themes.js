// Chess Themes System
class ChessThemes {
    constructor() {
        this.currentTheme = 'classic';
        this.themes = {
            classic: {
                name: 'Classic Chess',
                white: {
                    king: { symbol: '♔', color: '#FFD700' },
                    queen: { symbol: '♕', color: '#FF1493' },
                    rook: { symbol: '♖', color: '#00CED1' },
                    bishop: { symbol: '♗', color: '#FF4500' },
                    knight: { symbol: '♘', color: '#9370DB' },
                    pawn: { symbol: '♙', color: '#F5F5DC' }
                },
                black: {
                    king: { symbol: '♚', color: '#000000' },
                    queen: { symbol: '♛', color: '#8B0000' },
                    rook: { symbol: '♜', color: '#2F4F4F' },
                    bishop: { symbol: '♝', color: '#8B4513' },
                    knight: { symbol: '♞', color: '#483D8B' },
                    pawn: { symbol: '♟', color: '#696969' }
                }
            },

            minecraft: {
                name: '🎮 Minecraft Theme',
                white: {
                    king: { symbol: '🤴', color: '#FFD700' },      // Steve as King
                    queen: { symbol: '👸', color: '#FF69B4' },     // Alex as Queen
                    rook: { symbol: '🏰', color: '#8B7355' },      // Castle/Tower
                    bishop: { symbol: '🧙', color: '#8A2BE2' },    // Wizard/Enchanter
                    knight: { symbol: '🐴', color: '#A0522D' },    // Horse
                    pawn: { symbol: '🧱', color: '#CD853F' }       // Block
                },
                black: {
                    king: { symbol: '👾', color: '#2F4F2F' },      // Enderman
                    queen: { symbol: '🧟', color: '#8B0000' },     // Zombie
                    rook: { symbol: '🕳️', color: '#2F2F2F' },      // Cave/Void
                    bishop: { symbol: '🔮', color: '#4B0082' },    // Enchanted Orb
                    knight: { symbol: '🕷️', color: '#8B4513' },    // Spider
                    pawn: { symbol: '💀', color: '#696969' }       // Skeleton Head
                }
            },

            mario: {
                name: '🍄 Mario Bros Theme',
                white: {
                    king: { symbol: '👑', color: '#FFD700' },      // Crown (Mario)
                    queen: { symbol: '👗', color: '#FF69B4' },     // Princess Peach
                    rook: { symbol: '🏰', color: '#FF6B6B' },      // Castle
                    bishop: { symbol: '🍄', color: '#FF0000' },    // Super Mushroom
                    knight: { symbol: '🦆', color: '#FFD700' },    // Yoshi
                    pawn: { symbol: '⭐', color: '#FFD700' }       // Star
                },
                black: {
                    king: { symbol: '👹', color: '#8B0000' },      // Bowser
                    queen: { symbol: '🖤', color: '#4B0082' },     // Dark Magic
                    rook: { symbol: '🏴', color: '#2F2F2F' },      // Dark Castle
                    bishop: { symbol: '🍄‍🟫', color: '#8B4513' },   // Poison Mushroom
                    knight: { symbol: '🐢', color: '#228B22' },    // Koopa
                    pawn: { symbol: '💣', color: '#2F2F2F' }       // Bob-omb
                }
            },

            sonic: {
                name: '💨 Sonic Theme',
                white: {
                    king: { symbol: '💎', color: '#00BFFF' },      // Chaos Emerald
                    queen: { symbol: '🦔', color: '#FF69B4' },     // Amy Rose
                    rook: { symbol: '🏃', color: '#0000FF' },      // Sonic Running
                    bishop: { symbol: '🌟', color: '#FFD700' },    // Power Star
                    knight: { symbol: '🦊', color: '#FF8C00' },    // Tails
                    pawn: { symbol: '💍', color: '#FFD700' }       // Ring
                },
                black: {
                    king: { symbol: '🖤', color: '#8B0000' },      // Dr. Robotnik
                    queen: { symbol: '🤖', color: '#2F4F4F' },     // Robot
                    rook: { symbol: '⚡', color: '#8B008B' },      // Electric
                    bishop: { symbol: '🔧', color: '#708090' },    // Mechanical
                    knight: { symbol: '🦇', color: '#4B0082' },    // Shadow/Rouge
                    pawn: { symbol: '⚙️', color: '#696969' }       // Gear/Robot Part
                }
            },

            pokemon: {
                name: '⚡ Pokémon Theme',
                white: {
                    king: { symbol: '👑', color: '#FFD700' },      // Champion Crown
                    queen: { symbol: '🌸', color: '#FF69B4' },     // Fairy Type
                    rook: { symbol: '🏔️', color: '#A0522D' },      // Rock Type
                    bishop: { symbol: '🔮', color: '#8A2BE2' },    // Psychic Type
                    knight: { symbol: '🐎', color: '#8B4513' },    // Normal Type
                    pawn: { symbol: '⚡', color: '#FFD700' }       // Electric (Pikachu)
                },
                black: {
                    king: { symbol: '👹', color: '#8B0000' },      // Dark Type
                    queen: { symbol: '🐉', color: '#4B0082' },     // Dragon Type
                    rook: { symbol: '🌋', color: '#FF4500' },      // Fire Type
                    bishop: { symbol: '👻', color: '#483D8B' },    // Ghost Type
                    knight: { symbol: '🦇', color: '#2F2F2F' },    // Flying Dark
                    pawn: { symbol: '🕳️', color: '#696969' }       // Dark Void
                }
            },

            space: {
                name: '🚀 Space Theme',
                white: {
                    king: { symbol: '🌟', color: '#FFD700' },      // Star
                    queen: { symbol: '🌙', color: '#C0C0C0' },     // Moon
                    rook: { symbol: '🚀', color: '#00BFFF' },      // Rocket
                    bishop: { symbol: '🛸', color: '#9370DB' },    // UFO
                    knight: { symbol: '👨‍🚀', color: '#FF6B6B' },   // Astronaut
                    pawn: { symbol: '🌍', color: '#00CED1' }       // Planet
                },
                black: {
                    king: { symbol: '🕳️', color: '#000000' },      // Black Hole
                    queen: { symbol: '💫', color: '#8B008B' },     // Nebula
                    rook: { symbol: '☄️', color: '#2F4F4F' },      // Comet/Meteor
                    bishop: { symbol: '👽', color: '#228B22' },    // Alien
                    knight: { symbol: '🛰️', color: '#708090' },    // Satellite
                    pawn: { symbol: '🌑', color: '#696969' }       // Dark Moon
                }
            },

            medieval: {
                name: '⚔️ Medieval Theme',
                white: {
                    king: { symbol: '👑', color: '#FFD700' },      // Crown
                    queen: { symbol: '👸', color: '#FF69B4' },     // Queen
                    rook: { symbol: '🏰', color: '#8B7355' },      // Castle
                    bishop: { symbol: '⛪', color: '#8A2BE2' },    // Church
                    knight: { symbol: '🐴', color: '#A0522D' },    // Horse
                    pawn: { symbol: '⚔️', color: '#C0C0C0' }       // Sword
                },
                black: {
                    king: { symbol: '🖤', color: '#2F2F2F' },      // Dark Crown
                    queen: { symbol: '🧙‍♀️', color: '#4B0082' },   // Dark Sorceress
                    rook: { symbol: '🏴', color: '#2F2F2F' },      // Dark Tower
                    bishop: { symbol: '🔮', color: '#8B0000' },    // Dark Magic
                    knight: { symbol: '🐺', color: '#696969' },    // Wolf
                    pawn: { symbol: '🗡️', color: '#696969' }       // Dark Sword
                }
            }
        };
    }

    getCurrentTheme() {
        return this.themes[this.currentTheme];
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.applyTheme();
            return true;
        }
        return false;
    }

    getAvailableThemes() {
        return Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name
        }));
    }

    applyTheme() {
        const theme = this.getCurrentTheme();
        
        // Update CSS variables for piece colors
        const root = document.documentElement;
        
        // Apply colors for each piece type
        Object.keys(theme.white).forEach(pieceType => {
            root.style.setProperty(`--white-${pieceType}-color`, theme.white[pieceType].color);
            root.style.setProperty(`--black-${pieceType}-color`, theme.black[pieceType].color);
        });

        // Update CSS rules dynamically
        this.updatePieceStyles(theme);
        
        // Trigger UI update if chess UI exists
        if (window.mathiasChess && window.mathiasChess.ui) {
            window.mathiasChess.ui.updateDisplay();
        }
    }

    updatePieceStyles(theme) {
        // Remove existing theme styles
        let existingStyle = document.getElementById('theme-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create new theme styles
        const style = document.createElement('style');
        style.id = 'theme-styles';
        
        let css = '';
        
        // Generate CSS for each piece
        Object.keys(theme.white).forEach(pieceType => {
            css += `
.piece.white.${pieceType}::before { 
    content: '${theme.white[pieceType].symbol}'; 
    color: ${theme.white[pieceType].color}; 
}
.piece.black.${pieceType}::before { 
    content: '${theme.black[pieceType].symbol}'; 
    color: ${theme.black[pieceType].color}; 
}
            `;
        });

        style.textContent = css;
        document.head.appendChild(style);
    }

    getPieceInfo(color, type) {
        const theme = this.getCurrentTheme();
        return theme[color][type];
    }
}