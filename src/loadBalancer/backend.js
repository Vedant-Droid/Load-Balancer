class Backend {

constructor(id, host, port) {

    this.id = id;
    this.host = host;
    this.port = port;
    this.healthy = true;
    this.activeConnections = 0;
    this.totalRequests = 0;
}

incrementConnections() {
    this.activeConnections++;
}

decrementConnections() {

    if (this.activeConnections > 0) {
        this.activeConnections--;
    }
}

recordRequest() {
    this.totalRequests++;
}

getAddress() {
    return `${this.host}:${this.port}`;
}

}

module.exports = Backend;
