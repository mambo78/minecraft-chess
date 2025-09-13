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
                    king: { symbol: '🤴', color: '#FFD700' },
                    queen: { symbol: '👸', color: '#FF69B4' },
                    rook: { symbol: '🏰', color: '#8B7355' },
                    bishop: { symbol: '🧙', color: '#8A2BE2' },
                    knight: { symbol: '🐴', color: '#A0522D' },
                    pawn: { symbol: '🧱', color: '#CD853F' }
                },
                black: {
                    king: { symbol: '👾', color: '#2F4F2F' },
                    queen: { symbol: '🧟', color: '#8B0000' },
                    rook: { symbol: '🕳️', color: '#2F2F2F' },
                    bishop: { symbol: '🔮', color: '#4B0082' },
                    knight: { symbol: '🕷️', color: '#8B4513' },
                    pawn: { symbol: '💀', color: '#696969' }
                }
            },

            mario: {
                name: '🍄 Mario Bros Theme',
                white: {
                    king: { symbol: '👑', color: '#FFD700' },
                    queen: { symbol: '👗', color: '#FF69B4' },
                    rook: { symbol: '🏰', color: '#FF6B6B' },
                    bishop: { symbol: '🍄', color: '#FF0000' },
                    knight: { symbol: '🦆', color: '#FFD700' },
                    pawn: { symbol: '⭐', color: '#FFD700' }
                },
                black: {
                    king: { symbol: '👹', color: '#8B0000' },
                    queen: { symbol: '🖤', color: '#4B0082' },
                    rook: { symbol: '🏴', color: '#2F2F2F' },
                    bishop: { symbol: '🍄‍🟫', color: '#8B4513' },
                    knight: { symbol: '🐢', color: '#228B22' },
                    pawn: { symbol: '💣', color: '#2F2F2F' }
                }
            },

            sonic: {
                name: '💨 Sonic Theme',
                white: {
                    king: { symbol: '💎', color: '#00BFFF' },
                    queen: { symbol: '🦔', color: '#FF69B4' },
                    rook: { symbol: '🏃', color: '#0000FF' },
                    bishop: { symbol: '🌟', color: '#FFD700' },
                    knight: { symbol: '🦊', color: '#FF8C00' },
                    pawn: { symbol: '💍', color: '#FFD700' }
                },
                black: {
                    king: { symbol: '🖤', color: '#8B0000' },
                    queen: { symbol: '🤖', color: '#2F4F4F' },
                    rook: { symbol: '⚡', color: '#8B008B' },
                    bishop: { symbol: '🔧', color: '#708090' },
                    knight: { symbol: '🦇', color: '#4B0082' },
                    pawn: { symbol: '⚙️', color: '#696969' }
                }
            },

            pokemon: {
                name: '⚡ Pokémon Theme',
                white: {
                    king: { symbol: '👑', color: '#FFD700' },
                    queen: { symbol: '🌸', color: '#FF69B4' },
                    rook: { symbol: '🏔️', color: '#A0522D' },
                    bishop: { symbol: '🔮', color: '#8A2BE2' },
                    knight: { symbol: '🐎', color: '#8B4513' },
                    pawn: { symbol: '⚡', color: '#FFD700' }
                },
                black: {
                    king: { symbol: '👹', color: '#8B0000' },
                    queen: { symbol: '🐉', color: '#4B0082' },
                    rook: { symbol: '🌋', color: '#FF4500' },
                    bishop: { symbol: '👻', color: '#483D8B' },
                    knight: { symbol: '🦇', color: '#2F2F2F' },
                    pawn: { symbol: '🕳️', color: '#696969' }
                }
            },

            space: {
                name: '🚀 Space Theme',
                white: {
                    king: { symbol: '🌟', color: '#FFD700' },
                    queen: { symbol: '🌙', color: '#C0C0C0' },
                    rook: { symbol: '🚀', color: '#00BFFF' },
                    bishop: { symbol: '🛸', color: '#9370DB' },
                    knight: { symbol: '👨‍🚀', color: '#FF6B6B' },
                    pawn: { symbol: '🌍', color: '#00CED1' }
                },
                black: {
                    king: { symbol: '🕳️', color: '#000000' },
                    queen: { symbol: '💫', color: '#8B008B' },
                    rook: { symbol: '☄️', color: '#2F4F4F' },
                    bishop: { symbol: '👽', color: '#228B22' },
                    knight: { symbol: '🛰️', color: '#708090' },
                    pawn: { symbol: '🌑', color: '#696969' }
                }
            },

            medieval: {
                name: '⚔️ Medieval Theme',
                white: {
                    king: { symbol: '👑', color: '#FFD700' },
                    queen: { symbol: '👸', color: '#FF69B4' },
                    rook: { symbol: '🏰', color: '#8B7355' },
                    bishop: { symbol: '⛪', color: '#8A2BE2' },
                    knight: { symbol: '🐴', color: '#A0522D' },
                    pawn: { symbol: '⚔️', color: '#C0C0C0' }
                },
                black: {
                    king: { symbol: '🖤', color: '#2F2F2F' },
                    queen: { symbol: '🧙‍♀️', color: '#4B0082' },
                    rook: { symbol: '🏴', color: '#2F2F2F' },
                    bishop: { symbol: '🔮', color: '#8B0000' },
                    knight: { symbol: '🐺', color: '#696969' },
                    pawn: { symbol: '🗡️', color: '#696969' }
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
        console.log('🎨 Applying theme:', theme.name);
        
        // Remove existing theme styles
        let existingStyle = document.getElementById('dynamic-theme-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create new theme styles
        const style = document.createElement('style');
        style.id = 'dynamic-theme-styles';
        
        let css = '';
        
        // Generate CSS for each piece type
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

        // Update promotion symbols too
        Object.keys(theme.white).forEach(pieceType => {
            if (pieceType !== 'king' && pieceType !== 'pawn') { // Only pieces that can be promoted to
                css += `
.promotion-btn[data-piece="${pieceType}"] .piece-symbol { 
    color: ${theme.white[pieceType].color}; 
}
.promotion-btn[data-piece="${pieceType}"] .piece-symbol::before { 
    content: '${theme.white[pieceType].symbol}'; 
}
                `;
            }
        });

        style.textContent = css;
        document.head.appendChild(style);
        
        console.log('🎨 Theme applied successfully');
    }

    getRandomTheme() {
        const themes = Object.keys(this.themes);
        const randomIndex = Math.floor(Math.random() * themes.length);
        return themes[randomIndex];
    }

    getPieceInfo(color, type) {
        const theme = this.getCurrentTheme();
        return theme[color][type];
    }
}