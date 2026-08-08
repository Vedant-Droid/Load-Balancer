const http = require("http");

// Usage:
// node backends/server.js <port> <server-name>
// Example:
// node backends/server.js 8001 backend-1

const port = process.argv[2];
const serverName = process.argv[3];

// Check command-line arguments
if (!port || !serverName) {
    console.error(
    "Usage: node backends/server.js <port> <server-name>"
    );
    process.exit(1);
}

// Create HTTP server
const server = http.createServer((req, res) => {


console.log(
    `[${serverName}] ${req.method} ${req.url}`
);

// Health check endpoint
if (req.url === "/health") {

    res.writeHead(200, {
        "Content-Type": "application/json"
    });

    res.end(
        JSON.stringify({
            server: serverName,
            status: "healthy"
        })
    );

    return;
}

// Normal response
const response = {
    server: serverName,
    message: "Hello from backend",
    method: req.method,
    path: req.url
};

res.writeHead(200, {
    "Content-Type": "application/json"
});

res.end(JSON.stringify(response));


});

// Start server
server.listen(port, () => {


console.log(
    `${serverName} running on port ${port}`
);


});
