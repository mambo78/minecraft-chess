#!/bin/bash

echo "🔧 Setting up nginx configuration for chess.monsalve.com.co..."

# Navigate to the chess directory
cd /mnt/datos/web/chess || {
    echo "❌ Could not access chess directory"
    exit 1
}

echo "📋 Copying nginx configuration..."
sudo cp nginx-chess.conf /etc/nginx/sites-available/chess.monsalve.com.co

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy nginx config"
    exit 1
fi

echo "🔗 Creating symbolic link to enable site..."
sudo ln -sf /etc/nginx/sites-available/chess.monsalve.com.co /etc/nginx/sites-enabled/

echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    echo "Please check the configuration and try again."
    exit 1
fi

echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration successfully applied!"
    echo ""
    echo "🌐 Your chess game should now be accessible at:"
    echo "   • HTTP (temporary): http://chess.monsalve.com.co:8080"
    echo "   • HTTPS: https://chess.monsalve.com.co (needs SSL certificate)"
    echo ""
    echo "📊 Checking if the service is running..."
    sudo systemctl status nginx --no-pager -l
else
    echo "❌ Failed to reload nginx"
    exit 1
fi

echo ""
echo "🔍 Checking if ports are listening..."
echo "Port 8080 (HTTP):"
ss -tlnp | grep :8080 || echo "  Not listening on 8080"
echo "Port 443 (HTTPS):"
ss -tlnp | grep :443 || echo "  Not listening on 443"
echo "Port 3000 (Node.js):"
ss -tlnp | grep :3000 || echo "  Not listening on 3000"