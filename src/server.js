const fs = require("fs");
const path = require("path");

const Backend =
require("./loadBalancer/backend");

const RoundRobin =
require("./loadBalancer/strategies/roundRobin");

const LoadBalancer =
require("./loadBalancer/loadBalancer");

const configPath =path.join(
                    __dirname,
                    "../config/backends.json"
);

const config =JSON.parse(
                fs.readFileSync(
                    configPath,
                    "utf-8"
                )
);

const backends =
    config.backends.map(backend =>new Backend(
                                    backend.id,
                                    backend.host,
                                    backend.port
                                    )
);

const strategy =
new RoundRobin();

const loadBalancer =new LoadBalancer(
                        config.port,
                        backends,
                        strategy
);

loadBalancer.start();
