class RoundRobin {

constructor() {
    this.currentIndex = 0;
}

select(backends) {

    // take only working backend
    const healthyBackends = backends.filter(backend => backend.healthy);

    // No backend available
    if (healthyBackends.length === 0) {
        return null;
    }

    // Select backend
    const backend =healthyBackends[this.currentIndex % healthyBackends.length];

    // Move to next backend
    this.currentIndex++;

    return backend;
}

}

module.exports = RoundRobin;
