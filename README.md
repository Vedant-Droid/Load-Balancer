# Node.js Load Balancer

A lightweight HTTP load balancer built from scratch using Node.js.

The project distributes incoming HTTP requests across multiple backend servers using configurable load-balancing strategies. It also includes backend health checking, active connection tracking, request metrics, and a load-testing script for evaluating the load balancer under high request rates.

## Features

- HTTP load balancing
- Round Robin strategy
- Least Connections strategy
- Backend health monitoring
- Active connection tracking
- Request distribution tracking
- Request success/failure tracking
- Request latency measurement
- Requests-per-second measurement
- Per-backend metrics
- Built-in `/metrics` endpoint
- High-frequency load-testing script
- Automatic removal of unhealthy backends from routing

---

## Project Structure

```text
Load-Balancer/
│
├── src/
│   ├── server.js
│   │
│   ├── loadBalancer/
│   │   ├── loadBalancer.js
│   │   ├── backend.js
│   │   └── strategies/
│   │       ├── roundRobin.js
│   │       └── leastConnections.js
│   │
│   └── monitoring/
│       ├── healthChecker.js
│       └── metrics.js
│
├── backends/
│   └── server.js
│
├── config/
│   └── backends.json
│
├── scripts/
│   └── load-test.sh
│
├── package.json
└── README.md
```

---

# Requirements

- Node.js 18+
- npm
- Bash
- `curl`

Check your Node.js installation:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/Vedant-Droid/Load-Balancer.git
```

Navigate into the project:

```bash
cd Load-Balancer
```

Install dependencies:

```bash
npm install
```

---

# Configuration

Backend servers are configured in:

```text
config/backends.json
```

Example:

```json
{
    "port": 9000,
    "backends": [
        {
            "id": "backend-1",
            "host": "localhost",
            "port": 3001
        },
        {
            "id": "backend-2",
            "host": "localhost",
            "port": 3002
        },
        {
            "id": "backend-3",
            "host": "localhost",
            "port": 3003
        }
    ]
}
```

The default setup uses:

```text
Backend 1 → localhost:3001
Backend 2 → localhost:3002
Backend 3 → localhost:3003

Load Balancer → localhost:9000
```

---

# Running the Project

The backend servers and load balancer need to run simultaneously.

Open multiple terminal windows.

## Terminal 1 — Backend 1

```bash
node backends/server.js 3001 backend-1
```

## Terminal 2 — Backend 2

```bash
node backends/server.js 3002 backend-2
```

## Terminal 3 — Backend 3

```bash
node backends/server.js 3003 backend-3
```

## Terminal 4 — Load Balancer

```bash
node src/server.js
```

You should see:

```text
Health checker started (5000ms interval)
Load Balancer running on port 9000
```

After the health checker runs, the backends should be reported as healthy:

```text
backend-1 is back UP
backend-2 is back UP
backend-3 is back UP
```

The health checker runs every 5 seconds.

---

# Testing the Backend Servers

Before testing the load balancer, the individual backend servers can be checked directly.

```bash
curl http://localhost:3001
```

```bash
curl http://localhost:3002
```

```bash
curl http://localhost:3003
```

Each backend also exposes a health endpoint:

```bash
curl http://localhost:3001/health
```

```bash
curl http://localhost:3002/health
```

```bash
curl http://localhost:3003/health
```

A healthy backend should return:

```text
HTTP/1.1 200 OK
```

---

# Sending Requests Through the Load Balancer

Do not send normal application requests directly to the backend servers.

Instead, send them to:

```text
http://localhost:9000
```

For example:

```bash
curl http://localhost:9000
```

The load balancer selects a healthy backend and forwards the request.

The load balancer terminal will display routing information similar to:

```text
GET / -> backend-1
GET / -> backend-2
GET / -> backend-3
```

---

# Load Balancing Strategies

The project supports multiple backend selection strategies.

## Round Robin

Round Robin distributes requests sequentially across the available healthy backends.

For three backends:

```text
Request 1 → backend-1
Request 2 → backend-2
Request 3 → backend-3
Request 4 → backend-1
Request 5 → backend-2
Request 6 → backend-3
```

This provides approximately even request distribution when the backends have similar processing times.

---

## Least Connections

Least Connections selects the backend currently handling the smallest number of active connections.

Example:

```text
backend-1 → 5 active connections
backend-2 → 2 active connections
backend-3 → 4 active connections
```

The next request is sent to:

```text
backend-2
```

This strategy is useful when requests have different processing times or workloads.

---

# Backend Health Checking

The load balancer periodically checks the health of every backend.

The health checker sends:

```text
GET /health
```

to every configured backend.

The default health-check interval is:

```text
5000 ms
```

A backend returning:

```text
HTTP 200
```

is considered healthy.

If a backend becomes unavailable, it is marked unhealthy and should no longer be selected for new requests.

When it becomes available again, it can be marked healthy and returned to the backend pool.

---

# Metrics

The load balancer includes an in-memory metrics system.

Metrics are exposed through:

```text
GET /metrics
```

Run:

```bash
curl http://localhost:9000/metrics
```

Example:

```json
{
    "uptime": 69.503,
    "totalRequests": 27135,
    "completedRequests": 27120,
    "successfulRequests": 27110,
    "failedRequests": 10,
    "requestsPerSecond": 390.41,
    "averageLatency": 12.43,
    "backends": {
        "backend-1": {
            "healthy": true,
            "activeConnections": 4,
            "requests": 9040,
            "successfulRequests": 9035,
            "failedRequests": 5,
            "averageLatency": 12.1
        },
        "backend-2": {
            "healthy": true,
            "activeConnections": 3,
            "requests": 9040,
            "successfulRequests": 9038,
            "failedRequests": 2,
            "averageLatency": 12.6
        },
        "backend-3": {
            "healthy": true,
            "activeConnections": 5,
            "requests": 9040,
            "successfulRequests": 9037,
            "failedRequests": 3,
            "averageLatency": 12.5
        }
    }
}
```

## Available Metrics

### Global Metrics

| Metric | Description |
|---|---|
| `uptime` | Time the load balancer has been running |
| `totalRequests` | Total requests received |
| `completedRequests` | Requests that have finished |
| `successfulRequests` | Requests completed successfully |
| `failedRequests` | Requests that failed |
| `requestsPerSecond` | Average requests received per second |
| `averageLatency` | Average request latency |

### Backend Metrics

Each backend reports:

| Metric | Description |
|---|---|
| `healthy` | Current backend health status |
| `activeConnections` | Currently active connections |
| `requests` | Requests handled by the backend |
| `successfulRequests` | Successful requests handled |
| `failedRequests` | Failed requests |
| `averageLatency` | Average latency for the backend |

---

# Monitoring Metrics in Real Time

You can continuously monitor the metrics endpoint using:

```bash
watch -n 1 'curl -s http://localhost:9000/metrics'
```

This refreshes the metrics every second.

Example:

```text
totalRequests       ↑
completedRequests   ↑
successfulRequests  ↑
requestsPerSecond   ↑

backend-1.requests  ↑
backend-2.requests  ↑
backend-3.requests  ↑
```

---

# Load Testing

The project includes a load-testing script:

```text
scripts/load-test.sh
```

Make it executable:

```bash
chmod +x scripts/load-test.sh
```

Run it:

```bash
./scripts/load-test.sh
```

The script sends a large number of concurrent HTTP requests to:

```text
http://localhost:9000
```

The default request rate is controlled by:

```text
REQUESTS_PER_SECOND=1000
```

---

# Recommended Load Testing Procedure

When testing the project for the first time, start with a lower request rate.

For example:

```text
REQUESTS_PER_SECOND=100
```

Then gradually increase the load:

```text
100 requests/sec
        ↓
250 requests/sec
        ↓
500 requests/sec
        ↓
1000 requests/sec
```

This makes it easier to identify bottlenecks and prevents the load generator itself from overwhelming the system.

---

# Monitoring During a Load Test

Use the following setup:

```text
Terminal 1 → Backend 1 :3001
Terminal 2 → Backend 2 :3002
Terminal 3 → Backend 3 :3003
Terminal 4 → Load Balancer :9000
Terminal 5 → Load Test
Terminal 6 → Metrics
```

In Terminal 6:

```bash
watch -n 1 'curl -s http://localhost:9000/metrics'
```

In Terminal 5:

```bash
./scripts/load-test.sh
```

This allows request generation and metric monitoring to happen simultaneously.

---

# Verifying Round Robin

With Round Robin enabled, run a sufficiently large load test and inspect:

```text
backends.backend-1.requests
backends.backend-2.requests
backends.backend-3.requests
```

For example:

```text
backend-1 → 3334
backend-2 → 3333
backend-3 → 3333
```

The request counts should be approximately equal when all backends remain healthy and have similar response behavior.

---

# Verifying Least Connections

Switch the configured strategy to Least Connections.

Then run the load test again:

```bash
./scripts/load-test.sh
```

Monitor:

```bash
curl http://localhost:9000/metrics
```

The `activeConnections` values should influence which backend receives new requests.

---

# Testing Backend Failure

The health checker can also be tested by stopping one backend.

For example, stop:

```text
backend-2 :3002
```

using:

```text
Ctrl + C
```

The health checker should eventually detect the failure.

After the health-check interval, the load balancer should mark the backend as unhealthy.

The remaining healthy backends should continue receiving requests.

Restart the backend:

```bash
node backends/server.js 3002 backend-2
```

The health checker should detect that it has recovered.

---

# Troubleshooting

## Port 9000 Already in Use

If you see:

```text
Error: listen EADDRINUSE: address already in use :::9000
```

find the process using the port:

```bash
sudo lsof -i :9000
```

Then terminate the process using its PID:

```bash
kill <PID>
```

If necessary:

```bash
kill -9 <PID>
```

---

## Backend Shows as DOWN

Check that the backend is running:

```bash
node backends/server.js 3001 backend-1
```

Then test:

```bash
curl -i http://localhost:3001/health
```

The response should contain:

```text
HTTP/1.1 200 OK
```

Also make sure the ports in `config/backends.json` match the ports used to start the backend servers.

---

## Metrics Show Zero Requests

Check that requests are being sent through:

```text
http://localhost:9000
```

and not directly to:

```text
http://localhost:3001
http://localhost:3002
http://localhost:3003
```

Then check:

```bash
curl http://localhost:9000/metrics
```

---

## Check Which Ports Are Running

Use:

```bash
ss -tlnp | grep -E '3001|3002|3003|9000'
```

Expected ports:

```text
3001 → backend-1
3002 → backend-2
3003 → backend-3
9000 → load balancer
```

---

# Stopping the Project

Stop each running process using:

```text
Ctrl + C
```

The load test can also be stopped using:

```text
Ctrl + C
```

---

# Example Complete Startup

From a clean start:

### Terminal 1

```bash
node backends/server.js 3001 backend-1
```

### Terminal 2

```bash
node backends/server.js 3002 backend-2
```

### Terminal 3

```bash
node backends/server.js 3003 backend-3
```

### Terminal 4

```bash
node src/server.js
```

### Terminal 5

```bash
./scripts/load-test.sh
```

### Terminal 6

```bash
watch -n 1 'curl -s http://localhost:9000/metrics'
```

The complete request flow is:

```text
                         ┌─────────────────┐
                         │     Client      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Load Balancer  │
                         │     :9000       │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │ Backend 1│  │ Backend 2│  │ Backend 3│
              │   :3001  │  │   :3002  │  │   :3003  │
              └──────────┘  └──────────┘  └──────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     Metrics     │
                         │  /metrics :9000 │
                         └─────────────────┘
```

---

# Future Improvements

Possible future improvements include:

- Reverse-proxy enhancements
- Connection limits
- Request timeouts
- Retry mechanisms
- Circuit breaker
- Prometheus-compatible metrics
- Grafana monitoring dashboard
- Dockerized backend servers
- Distributed load testing
- More load-balancing algorithms
- Weighted Round Robin
- Automatic backend discovery



./scripts/load-test.sh
watch -n 1 'curl -s http://localhost:9000/metrics'
node backends/server.js 3003 backend-3
node src/server.js
