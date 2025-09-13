# Complete Chess Game Deployment Script
# This script pushes to GitHub AND deploys to your server in one command

param(
    [string]$CommitMessage = ""
)

Write-Host "🚀 Starting complete deployment process..." -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not initialized!" -ForegroundColor Red
    Write-Host "Please run: git init && git remote add origin https://github.com/mambo78/minecraft-chess.git" -ForegroundColor Yellow
    exit 1
}

# Add all changes
Write-Host "📁 Adding all changes..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "ℹ️ No local changes to deploy. Pulling server updates anyway..." -ForegroundColor Blue
} else {
    # Get commit message
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        $CommitMessage = Read-Host "Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $CommitMessage = "Deploy chess game - $timestamp"
        }
    }

    # Commit changes
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m $CommitMessage

    # Push to GitHub
    Write-Host "🌐 Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push to GitHub!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
}

# Deploy to server
Write-Host "🖥️ Deploying to server..." -ForegroundColor Yellow
$serverCommand = "cd /mnt/datos/web/chess/ && sudo git pull origin main && sudo chown -R www-data:www-data . && sudo chmod -R 755 . && sudo systemctl reload nginx && echo 'Deployment completed!'"

$sshResult = ssh mateo@192.168.1.34 $serverCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully deployed to server!" -ForegroundColor Green
    Write-Host "🌐 Your chess game is live at: http://chess.monsalve.com.co/" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to deploy to server!" -ForegroundColor Red
    Write-Host "You can manually run: ssh mateo@192.168.1.34 '$serverCommand'" -ForegroundColor Yellow
}

Write-Host "🎉 Deployment process completed!" -ForegroundColor Green