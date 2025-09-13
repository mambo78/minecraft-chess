# 🚨 Troubleshooting 502 Bad Gateway Error

A 502 Bad Gateway error means your web server (nginx/apache) can't communicate with the Node.js application. Here's how to fix it:

## 🔍 Step 1: Check if Node.js App is Running

### On your server, run these commands:

```bash
# Check if Node.js process is running
ps aux | grep node
# or on some systems:
ps -ef | grep node

# Check if port 3000 is being used
netstat -tlnp | grep 3000
# or:
lsof -i :3000
```

If no Node.js process is running, the app crashed or never started.

## 🔍 Step 2: Check Server Logs

### Look at your application logs:

```bash
# If using PM2:
pm2 logs mathias-chess

# If running with npm start, check the terminal output
# Look for error messages like:
# - "ENOENT: no such file or directory"
# - "Cannot find module 'chess.js'"
# - "EADDRINUSE: address already in use"
# - "Permission denied"
```

## 🔍 Step 3: Common Issues & Solutions

### Issue 1: Dependencies Not Installed
```bash
cd /path/to/chess-game-v5
npm install
```

### Issue 2: Wrong Node.js Version
```bash
# Check Node.js version
node --version

# Should be >= 14.0.0
# If not, update Node.js
```

### Issue 3: Port Already in Use
```bash
# Kill process using port 3000
sudo kill -9 $(lsof -t -i:3000)

# Or change port
PORT=3001 npm start
```

### Issue 4: Permission Issues
```bash
# Make sure you have read permissions
chmod +r package.json server.js
chmod +r -R public/

# Make sure you can write to node_modules
chmod +w -R node_modules/
```

### Issue 5: Missing chess.js Module
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🔍 Step 4: Manual Server Start

Try starting the server manually to see error messages:

```bash
cd /path/to/chess-game-v5
node server.js
```

Look for error messages like:
- ❌ `Error: Cannot find module 'chess.js'`
- ❌ `EADDRINUSE: address already in use :::3000`
- ❌ `EACCES: permission denied`

## 🔍 Step 5: Test with Simple Server

If the main app fails, test with this simple server:

Create `test-server.js`:
```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Test server is working!');
});

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
```

```bash
node test-server.js
```

If this works but main app doesn't, the issue is in our chess application.

## 🔍 Step 6: Check Web Server Configuration

If using nginx, check your configuration:

```nginx
# /etc/nginx/sites-available/your-site
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Restart nginx:
```bash
sudo systemctl restart nginx
```

## 🔍 Step 7: Firewall Issues

Check if firewall is blocking the port:

```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 3000

# CentOS/RHEL
sudo firewall-cmd --list-all
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

## 📋 Quick Diagnostic Checklist

Run these commands on your server and share the output:

```bash
echo "=== Node.js Version ==="
node --version

echo "=== NPM Version ==="
npm --version

echo "=== Current Directory ==="
pwd
ls -la

echo "=== Package.json exists? ==="
cat package.json

echo "=== Dependencies installed? ==="
ls node_modules/ | head -10

echo "=== Try starting server ==="
timeout 10s node server.js
```

## 🆘 Emergency Fallback

If nothing works, here's a minimal working version:

### minimal-server.js
```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`✅ Minimal server running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
});
```

```bash
node minimal-server.js
```

This should at least serve the frontend, even without full chess functionality.