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

        // Select a backend using our strategy
        const backend =
            this.strategy.select(this.backends);

        // No healthy backend available
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

        // Information about the request
        const options = {
            hostname: backend.host,
            port: backend.port,
            path: clientReq.url,
            method: clientReq.method,
            headers: clientReq.headers
        };

        // Create request to backend
        const backendReq = http.request(
            options,
            (backendRes) => {

                // Send backend response headers
                // back to the client
                clientRes.writeHead(
                    backendRes.statusCode,
                    backendRes.headers
                );

                // Forward response body
                backendRes.pipe(clientRes);

                backendRes.on("end", () => {
                    backend.decrementConnections();
                });
            }
        );

        // Backend connection error
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

        // Forward the client's request
        // to the selected backend
        clientReq.pipe(backendReq);
    }
}

module.exports = LoadBalancer;