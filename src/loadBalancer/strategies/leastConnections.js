class LeastConnections {

    select(backends) {

        // Only consider healthy backends
        const healthyBackends =
            backends.filter(
                backend => backend.healthy
            );

        // No healthy backend
        if (healthyBackends.length === 0) {
            return null;
        }

        // Start with the first backend
        let selectedBackend = healthyBackends[0];

        // Find backend with fewest active connections
        for (let i = 1; i < healthyBackends.length; i++) {

            const backend = healthyBackends[i];

            if (
                backend.activeConnections <
                selectedBackend.activeConnections
            ) {
                selectedBackend = backend;
            }
        }

        return selectedBackend;
    }
}

module.exports = LeastConnections;