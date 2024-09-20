const WebSocket = require('ws');
const http = require('http'); // Required to bind the service to a port
require('dotenv').config(); // Load environment variables

// WebSocket URL from environment variable
const wsUrl = process.env.WS_URL;
const PORT = process.env.PORT || 8080; // Default to port 8080 if not set in environment

// Function to keep the WebSocket connection alive
function keepWebSocketAlive() {
    const socket = new WebSocket(wsUrl);

    // Handle connection opening
    socket.on('open', () => {
        console.log('WebSocket connection established');

        // Send a ping message every 30 seconds
        setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'ping' }));
                console.log('Ping sent to server');
            }
        }, 30000);  // 30 seconds
    });

    // Handle incoming messages from the server
    socket.on('message', (data) => {
        console.log('Message from server:', data);
    });

    // Handle connection closing
    socket.on('close', (code, reason) => {
        console.log(`Connection closed: ${code} - ${reason}`);
        // Automatically reconnect after 5 seconds if the connection is lost
        setTimeout(() => {
            console.log('Reconnecting to WebSocket server...');
            keepWebSocketAlive();
        }, 5000);  // 5 seconds delay before reconnecting
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        socket.close();
    });
}

// Create a dummy HTTP server to keep the service alive on Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket Keep-Alive Server Running\n');
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
    // Start the WebSocket keep-alive process after the server starts
    keepWebSocketAlive();
});
