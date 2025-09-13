# Chess Game v6 - Deployment Guide

This guide will help you deploy chess-game-v6 to your server and avoid the 502 Bad Gateway errors.

## 📋 Pre-deployment Checklist

- [ ] Node.js installed on server (version 14+ recommended)
- [ ] npm available on server
- [ ] Port 3000 available (or configure different port)
- [ ] Server has internet access for npm install

## 🚀 Step-by-Step Deployment

### 1. Upload Files to Server
Upload the entire `chess-game-v6` folder to your server:
```bash
# If using scp from your local machine:
scp -r chess-game-v6/ user@your-server:/path/to/deployment/
```

### 2. Install Dependencies
SSH into your server and navigate to the project directory:
```bash
ssh user@your-server
cd /path/to/deployment/chess-game-v6/
npm install
```

### 3. Test the Server Locally
Before configuring reverse proxy, test the server directly:
```bash
node server.js
```

You should see:
```
🚀 Chess server starting...
✅ Static files served from: /path/to/deployment/chess-game-v6/public
🌐 Server running on port 3000
📱 Socket.io ready for connections
```

### 4. Test Direct Access
From another terminal, test direct access:
```bash
curl http://localhost:3000
```
Should return the HTML content of the game.

### 5. Production Deployment Options

#### Option A: Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name chess-game-v6

# Set PM2 to start on boot
pm2 startup
pm2 save
```

#### Option B: Using systemd
Create a service file `/etc/systemd/system/chess-game-v6.service`:
```ini
[Unit]
Description=Chess Game v6
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/deployment/chess-game-v6
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Start and enable the service:
```bash
sudo systemctl enable chess-game-v6
sudo systemctl start chess-game-v6
sudo systemctl status chess-game-v6
```

### 6. Configure Reverse Proxy (nginx)

Create or edit your nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Important for Socket.io
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_redirect off;
    }
}
```

Test and reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 Troubleshooting Common Issues

### Issue: 502 Bad Gateway
**Causes & Solutions:**
1. **Node.js server not running**
   ```bash
   # Check if server is running
   ps aux | grep node
   # If not running, start it
   pm2 start server.js --name chess-game-v6
   ```

2. **Wrong port in nginx config**
   ```bash
   # Verify server is running on port 3000
   netstat -tlnp | grep 3000
   # Update nginx config if needed
   ```

3. **Firewall blocking port 3000**
   ```bash
   # Allow port 3000 (if accessing directly)
   sudo ufw allow 3000
   ```

### Issue: Dependencies Missing
```bash
# Reinstall dependencies
cd /path/to/deployment/chess-game-v6
rm -rf node_modules package-lock.json
npm install
```

### Issue: Permission Errors
```bash
# Fix file permissions
chown -R your-username:your-username /path/to/deployment/chess-game-v6
chmod -R 755 /path/to/deployment/chess-game-v6
```

## ✅ Verification Steps

1. **Check server process:**
   ```bash
   pm2 status  # or systemctl status chess-game-v6
   ```

2. **Check logs:**
   ```bash
   pm2 logs chess-game-v6  # or journalctl -u chess-game-v6
   ```

3. **Test direct server access:**
   ```bash
   curl http://localhost:3000
   ```

4. **Test through nginx:**
   ```bash
   curl http://your-domain.com
   ```

5. **Check browser console:**
   - Open developer tools
   - Look for JavaScript errors
   - Verify Socket.io connection

## 📊 Monitoring

### Using PM2
```bash
# View status
pm2 status

# View logs
pm2 logs chess-game-v6

# Restart if needed
pm2 restart chess-game-v6
```

### Using systemd
```bash
# View status
sudo systemctl status chess-game-v6

# View logs
journalctl -u chess-game-v6 -f
```

## 🔄 Updates

To update the chess game:
```bash
# Stop the service
pm2 stop chess-game-v6

# Upload new files
# ... upload process ...

# Install any new dependencies
npm install

# Restart the service
pm2 start chess-game-v6
```

---

**Note**: This deployment approach is specifically designed to avoid the 502 Bad Gateway errors by keeping the server architecture simple and ensuring proper process management.