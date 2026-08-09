const fs = require("fs");
const path = require("path");

const Backend = require("./loadBalancer/backend");

const RoundRobin = require("./loadBalancer/strategies/roundRobin");

const LeastConnections = require("./loadBalancer/strategies/leastConnections");

const LoadBalancer = require("./loadBalancer/loadBalancer");

const HealthChecker = require("./loadBalancer/health/healthChecker");

const configPath = path.join(__dirname, "../config/backends.json");

const config =JSON.parse(
                fs.readFileSync(
                    configPath,
                    "utf-8"
                )
);

const backends = config.backends.map(backend =>new Backend(
                                        backend.id,
                                        backend.host,
                                        backend.port
                                        )
);

const strategy = new RoundRobin();
// const strategy = new LeastConnections();

const healthChecker = new HealthChecker(backends, 5000); //checks every 5 seconds

healthChecker.start();

const loadBalancer = new LoadBalancer(
                        config.port,
                        backends,
                        strategy
);

loadBalancer.start();
