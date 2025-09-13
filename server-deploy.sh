#!/bin/bash
# Server-side deployment script for chess game
# Save this file on your server as /home/mateo/deploy-chess.sh

echo "🚀 Starting chess game deployment..."

# Navigate to the chess directory
cd /mnt/datos/web/chess/

# Check if it's a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please clone your repository first:"
    echo "sudo git clone https://github.com/mambo78/minecraft-chess.git /mnt/datos/web/chess/"
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
sudo git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pulled changes!"
    
    # Set proper permissions
    echo "🔒 Setting proper permissions..."
    sudo chown -R www-data:www-data /mnt/datos/web/chess/
    sudo chmod -R 755 /mnt/datos/web/chess/
    
    # Check if Node.js dependencies need to be installed
    if [ -f "package.json" ]; then
        echo "📦 Installing/updating Node.js dependencies..."
        sudo npm install --production
    fi
    
    # Reload nginx to ensure changes take effect
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Deployment completed successfully!"
    echo "🌐 Your chess game is now live at: http://chess.monsalve.com.co/"
    
else
    echo "❌ Failed to pull changes from GitHub!"
    exit 1
fi