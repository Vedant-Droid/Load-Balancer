class Metrics {

    constructor() {
        this.totalRequests = 0;
        this.successfulRequests = 0;
        this.failedRequests = 0;
        this.totalLatency = 0;
        this.completedRequests = 0;
        this.startTime = Date.now();
        this.backendStats = {};
    }

    registerBackend(backend) {
        this.backendStats[backend.id] = {
            requests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalLatency: 0
        };
    }

    requestStarted() {
        this.totalRequests++;
    }

    requestFinished(backend, latency, success) {
        
        this.completedRequests++;

        this.totalLatency += latency;

        if (success) {
            this.successfulRequests++;
        } else {
            this.failedRequests++;
        }

        const stats = this.backendStats[backend.id];

        if (stats) {

            stats.requests++;
            stats.totalLatency += latency;

            if (success) {
                stats.successfulRequests++;
            } else {
                stats.failedRequests++;
            }
        }
    }

    getMetrics(backends) {

        const uptime =
            (Date.now() - this.startTime) / 1000;

        const averageLatency =
            this.completedRequests > 0
                ? this.totalLatency / this.totalRequests
                : 0;

        const requestsPerSecond =
            uptime > 0
                ? this.totalRequests / uptime
                : 0;

        const backendMetrics = {};

        backends.forEach(backend => {

            const stats =
                this.backendStats[backend.id];

            backendMetrics[backend.id] = {

                healthy: backend.healthy,

                activeConnections:
                    backend.activeConnections,

                requests:
                    stats.requests,

                successfulRequests:
                    stats.successfulRequests,

                failedRequests:
                    stats.failedRequests,

                averageLatency:
                    stats.requests > 0
                        ? stats.totalLatency / stats.requests
                        : 0
            };
        });

        return {
            uptime: uptime,
            totalRequests:this.totalRequests,
            completedRequests:this.completedRequests,
            successfulRequests:this.successfulRequests,
            failedRequests:this.failedRequests,
            requestsPerSecond:requestsPerSecond,
            averageLatency:averageLatency,
            backends:backendMetrics
        };
    }
}

module.exports = Metrics;