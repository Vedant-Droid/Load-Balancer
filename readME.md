# Load Balancer

A Node.js load balancer that distributes incoming HTTP requests across multiple backend servers using different load-balancing strategies such as **Round Robin** and **Least Connections**.

## Running the Project

### 1. Clone the Repository

```bash
git clone https://github.com/Vedant-Droid/Load-Balancer.git
cd Load-Balancer


./scripts/load-test.sh
watch -n 1 'curl -s http://localhost:9000/metrics'
node backends/server.js 3003 backend-3
node src/server.js
