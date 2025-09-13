# Chess Game Deployment Script
# This script automates pushing changes to GitHub

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

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
    Write-Host "✅ No changes to deploy!" -ForegroundColor Green
    exit 0
}

# Get commit message from user or use default
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMessage = "Deploy chess game - $timestamp"
}

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

# Push to GitHub
Write-Host "🌐 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully deployed to GitHub!" -ForegroundColor Green
    Write-Host "Now run the following command on your server:" -ForegroundColor Cyan
    Write-Host "ssh mateo@192.168.1.34 './deploy-chess.sh'" -ForegroundColor White
} else {
    Write-Host "❌ Failed to push to GitHub!" -ForegroundColor Red
    exit 1
}