const http = require("http");

class LoadBalancer {

constructor(port, backends, strategy) {

    this.port = port;
    this.backends = backends;
    this.strategy = strategy;
    this.server = http.createServer(
        this.handleRequest.bind(this)
    );
}

start() {
    this.server.listen(this.port, () => {

        console.log(
            `Load Balancer running on port ${this.port}`
        );

    });
}

handleRequest(clientReq, clientRes) {

    // Ask the strategy to select a backend
    const backend =
        this.strategy.select(this.backends);

    // No healthy backend
    if (!backend) {

        clientRes.writeHead(503, {
            "Content-Type": "text/plain"
        });

        clientRes.end(
            "No healthy backend available"
        );

        return;
    }

    console.log(
        `${clientReq.method} ${clientReq.url} -> ${backend.id}`
    );

    backend.incrementConnections();
    backend.recordRequest();

    // Request options for backend
    const options = {
        hostname: backend.host,
        port: backend.port,
        path: clientReq.url,
        method: clientReq.method,
        headers: clientReq.headers
    };

    // Send request to backend
    const backendReq = http.request(
        options,
        (backendRes) => {

            // Send backend status + headers
            // back to client
            clientRes.writeHead(
                backendRes.statusCode,
                backendRes.headers
            );

            // Forward backend response
            // to client
            backendRes.pipe(clientRes);

            backendRes.on("end", () => {
                backend.decrementConnections();
            });
        }
    );

    // Backend connection failed
    backendReq.on("error", (error) => {

        console.error(
            `Backend ${backend.id} failed:`,
            error.message
        );

        backend.decrementConnections();

        if (!clientRes.headersSent) {

            clientRes.writeHead(502, {
                "Content-Type": "text/plain"
            });

            clientRes.end(
                "Bad Gateway"
            );
        }
    });

    // Forward client request
    // to backend
    clientReq.pipe(backendReq);
}

}

module.exports = LoadBalancer;
