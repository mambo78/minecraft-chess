@echo off
echo 🚀 Chess Game Deployment
echo.

REM Check if commit message was provided
set "commitMsg=%~1"
if "%commitMsg%"=="" (
    set /p "commitMsg=Enter commit message (or press Enter for default): "
)
if "%commitMsg%"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a:%%b
    set "commitMsg=Deploy chess game - !mydate! !mytime!"
)

echo.
echo 📁 Adding changes...
"C:\Program Files\Git\bin\git.exe" add .

echo 💾 Committing changes...
"C:\Program Files\Git\bin\git.exe" commit -m "%commitMsg%"

echo 🌐 Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push origin master

if errorlevel 1 (
    echo ❌ Failed to push to GitHub!
    pause
    exit /b 1
)

echo ✅ Successfully pushed to GitHub!
echo.
echo 🖥️ Deploying to server...
ssh mateo@192.168.1.34 "cd /mnt/datos/web/chess/ && git pull origin master"

if errorlevel 1 (
    echo ❌ Failed to deploy to server!
    echo You can manually run: ssh mateo@192.168.1.34 "cd /mnt/datos/web/chess/ && git pull origin master"
) else (
    echo ✅ Successfully deployed to server!
    echo 🌐 Your chess game is live at: http://chess.monsalve.com.co/
)

echo.
echo 🎉 Deployment completed!
pause