// Ultra-minimal test server for debugging 502 errors
const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - Request: ${req.method} ${req.url}`);
    
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
    });
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Server - Chess Game v6</title>
    </head>
    <body>
        <h1>✅ Test Server Working!</h1>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Port:</strong> ${port}</p>
        <p><strong>Node Version:</strong> ${process.version}</p>
        <p><strong>Platform:</strong> ${process.platform}</p>
        <p><strong>Working Directory:</strong> ${process.cwd()}</p>
        <p><strong>Memory Usage:</strong> ${JSON.stringify(process.memoryUsage(), null, 2)}</p>
        
        <hr>
        <p>If you can see this message, basic Node.js HTTP server is working.</p>
        <p>The 502 error is likely in Express, Socket.io, or server configuration.</p>
    </body>
    </html>
    `;
    
    res.end(html);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`💥 Port ${port} is already in use!`);
        console.error('💡 Try: kill -9 $(lsof -ti:3000) or use a different port');
    }
    process.exit(1);
});

server.listen(port, () => {
    console.log('🚀 Ultra-minimal test server started');
    console.log(`📡 Listening on port ${port}`);
    console.log(`🌐 Test URL: http://localhost:${port}`);
    console.log(`📋 Node.js version: ${process.version}`);
    console.log(`💻 Platform: ${process.platform}`);
    console.log('');
    console.log('✅ If this works, the issue is with Express/Socket.io');
    console.log('❌ If this fails, the issue is with Node.js/server setup');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});