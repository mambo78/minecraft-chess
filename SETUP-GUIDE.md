# Chess Game Deployment Setup Guide

## Prerequisites

### 1. Install Git on Windows
Download and install Git from: https://git-scm.com/download/win
- Choose "Git from the command line and also from 3rd-party software"
- After installation, restart PowerShell

### 2. Configure Git (First time only)
```powershell
git config --global user.name "Mateo Monsalve"
git config --global user.email "mateo.monsalve@gmail.com"
```

## Initial Setup (One-time only)

### 1. Initialize Local Repository
```powershell
# Navigate to your project folder (you're already here)
cd C:\Users\Mateo\chess-game-v6

# Initialize git repository
git init

# Add your repository as remote origin
git remote add origin https://github.com/mambo78/minecraft-chess.git

# Add all files and make initial commit
git add .
git commit -m "Initial commit - Chess game v6"

# Push to GitHub (you'll need to enter your GitHub credentials)
git push -u origin main
```

### 2. Setup Server Repository (One-time only)
```bash
# Connect to your server
ssh mateo@192.168.1.34

# Clone your repository to the web directory
sudo git clone https://github.com/mambo78/minecraft-chess.git /mnt/datos/web/chess/

# Set proper permissions
sudo chown -R www-data:www-data /mnt/datos/web/chess/
sudo chmod -R 755 /mnt/datos/web/chess/

# Exit server
exit
```

## Daily Workflow - How to Deploy Changes

### Option 1: Full Automated Deployment (Recommended)
```powershell
# Deploy everything with one command
./deploy-full.ps1

# Or with custom commit message
./deploy-full.ps1 -CommitMessage "Fixed chess piece movement"
```

### Option 2: Manual Two-Step Process
```powershell
# Step 1: Push to GitHub
./deploy.ps1

# Step 2: Deploy to server
ssh mateo@192.168.1.34 "cd /mnt/datos/web/chess/ && sudo git pull origin main && sudo chown -R www-data:www-data . && sudo chmod -R 755 . && sudo systemctl reload nginx"
```

## Your Chess Game URL
After deployment: **http://chess.monsalve.com.co/**

## Troubleshooting

### If you get "git not found" error:
1. Install Git from https://git-scm.com/download/win
2. Restart PowerShell
3. Try again

### If GitHub asks for credentials:
- Use your GitHub username: mambo78
- Use a Personal Access Token as password (not your GitHub password)
- Generate token at: https://github.com/settings/tokens

### If server deployment fails:
```bash
# Manually check server status
ssh mateo@192.168.1.34 "cd /mnt/datos/web/chess/ && pwd && ls -la"
```

## Files in This Project
- `deploy.ps1` - Local deployment (GitHub push only)
- `deploy-full.ps1` - Complete deployment (GitHub + server)
- `server-deploy.sh` - Server-side script (reference)
- `SETUP-GUIDE.md` - This guide