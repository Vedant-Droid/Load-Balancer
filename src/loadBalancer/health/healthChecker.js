const http = require("http");

class HealthChecker {
    constructor(backends, interval = 5000) {
        this.backends = backends;
        this.interval = interval;
        this.timer = null;
    }
    start() {
        console.log(
            `Health checker started (${this.interval}ms interval)`
        );
        // Check immediately
        this.checkAll();
        // Then check periodically
        this.timer = setInterval(() => {
            this.checkAll();
        }, this.interval);
    }
    checkAll() {
        this.backends.forEach(backend => {
            this.checkBackend(backend);
        });
    }
    checkBackend(backend) {
        const options = {
            hostname: backend.host,
            port: backend.port,
            path: "/health",
            method: "GET",
            timeout: 2000
        };
        const request = http.request(
            options,
            response => {
                if (response.statusCode === 200) {
                    if (!backend.healthy) {
                        console.log(
                            `${backend.id} is back UP`
                        );
                    }
                    backend.healthy = true;
                } else {
                    backend.healthy = false;
                    console.log(
                        `${backend.id} is DOWN`
                    );
                }
                response.resume();
            }
        );
        request.on("error", () => {
            if (backend.healthy) {
                console.log(
                    `${backend.id} is DOWN`
                );
            }
            backend.healthy = false;
        });
        request.on("timeout", () => {
            request.destroy();
            if (backend.healthy) {
                console.log(
                    `${backend.id} timed out`
                );
            }
            backend.healthy = false;
        });
        request.end();
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        console.log("Health checker stopped");
    }
}

module.exports = HealthChecker;