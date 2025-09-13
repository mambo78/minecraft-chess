const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting test server...');
console.log('📁 Current directory:', __dirname);
console.log('🔍 Node.js version:', process.version);

// Basic health check
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Test server is working!',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        port: PORT
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
    });
});

// Test if we can access files
app.get('/test-files', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
        const publicExists = fs.existsSync(path.join(__dirname, 'public'));
        const indexExists = fs.existsSync(path.join(__dirname, 'public', 'index.html'));
        
        res.json({
            status: 'file-check-ok',
            packageJson: packageJson.name,
            publicExists: publicExists,
            indexExists: indexExists,
            currentDir: __dirname,
            files: fs.readdirSync(__dirname)
        });
    } catch (error) {
        res.status(500).json({
            status: 'file-check-error',
            error: error.message
        });
    }
});

// Test if chess.js is available
app.get('/test-chess', (req, res) => {
    try {
        const { Chess } = require('chess.js');
        const chess = new Chess();
        
        res.json({
            status: 'chess-js-ok',
            fen: chess.fen(),
            moves: chess.moves().length
        });
    } catch (error) {
        res.status(500).json({
            status: 'chess-js-error',
            error: error.message
        });
    }
});

const server = app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
    console.log(`🌐 Test URLs:`);
    console.log(`   http://localhost:${PORT}/`);
    console.log(`   http://localhost:${PORT}/health`);
    console.log(`   http://localhost:${PORT}/test-files`);
    console.log(`   http://localhost:${PORT}/test-chess`);
    console.log(`📊 Process ID: ${process.pid}`);
});

server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    if (error.code === 'EADDRINUSE') {
        console.log('🔧 Port is already in use. Try a different port:');
        console.log('   PORT=3001 node test-server.js');
    }
});

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});