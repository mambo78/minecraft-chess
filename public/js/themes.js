// Theme management
const themes = {
    classic: 'Classic Chess',
    minecraft: '🎮 Minecraft',
    mario: '🍄 Mario Bros',
    sonic: '💨 Sonic',
    pokemon: '⚡ Pokémon',
    space: '🚀 Space',
    medieval: '⚔️ Medieval'
};

let currentTheme = 'classic';

function initializeThemes() {
    const themeSelector = document.getElementById('theme-selector');
    const randomThemeBtn = document.getElementById('random-theme-btn');
    const board = document.getElementById('chess-board');
    
    // Theme selector change
    themeSelector.addEventListener('change', (e) => {
        changeTheme(e.target.value);
    });
    
    // Random theme button
    randomThemeBtn.addEventListener('click', () => {
        const themeKeys = Object.keys(themes);
        let randomTheme;
        do {
            randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
        } while (randomTheme === currentTheme);
        
        changeTheme(randomTheme);
        themeSelector.value = randomTheme;
    });
}

function changeTheme(themeName) {
    const board = document.getElementById('chess-board');
    
    // Remove old theme classes
    board.classList.remove(`theme-${currentTheme}`);
    
    // Add new theme class
    board.classList.add(`theme-${themeName}`);
    
    currentTheme = themeName;
    
    // Show theme change message
    showGameMessage(`Theme changed to ${themes[themeName]}! 🎨`);
}

function showGameMessage(message, duration = 3000, type = 'success') {
    const messageEl = document.getElementById('game-message');
    messageEl.textContent = message;
    
    // Set message type styling
    messageEl.className = 'game-message show';
    if (type === 'error') {
        messageEl.style.background = '#e74c3c';
    } else if (type === 'warning') {
        messageEl.style.background = '#f39c12';
    } else {
        messageEl.style.background = '#2ecc71';
    }
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, duration);
}