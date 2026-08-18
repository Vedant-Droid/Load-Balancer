const http = require("http");
const Metrics = require("../monitoring/metrics")
class LoadBalancer {

    constructor(port, backends, strategy) {
        this.port = port;
        this.backends = backends;
        this.strategy = strategy;
        this.metrics = new Metrics();
        this.backends.forEach(backend => {
            this.metrics.registerBackend(backend);
        });
        this.server = http.createServer(this.handleRequest.bind(this));
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(
                `Load Balancer running on port ${this.port}`
            );
        });
    }

    handleRequest(clientReq, clientRes) {
        
        if(clientReq.url === "/metrics") {
            const metrics = this.metrics.getMetrics(this.backends);
            clientRes.writeHead(200, {
                "Content-Type": "application/json"
            });
            clientRes.end(JSON.stringify(metrics,null,2));
            return;
        }
        
        this.metrics.requestStarted();
        const startTime = Date.now();


        // Select a backend using our strategy
        const backend = this.strategy.select(this.backends);
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

        console.log(`${clientReq.method} ${clientReq.url} -> ${backend.id}`);

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
                    const latency = Date.now() - startTime;
                    this.metrics.requestFinished(
                        backend,
                        latency,
                        backendRes.statusCode >= 200 &&
                        backendRes.statusCode < 400
                    );
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
            const latency = Date.now() - startTime;
            this.metrics.requestFinished(
                backend,
                latency,
                false
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