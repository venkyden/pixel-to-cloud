# Load Testing Guide

This directory contains load testing scripts and configurations for Roomivo edge functions.

## Prerequisites

Install k6 load testing tool:
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

## Running Tests

### Basic Load Test
```bash
k6 run load-testing/basic-load.js
```

### Stress Test
```bash
k6 run load-testing/stress-test.js
```

### Spike Test
```bash
k6 run load-testing/spike-test.js
```

## Test Scenarios

### 1. Basic Load Test
- Tests normal traffic patterns
- 10 VUs ramping up over 30s
- 1 minute sustained load
- 30s ramp down

### 2. Stress Test
- Tests system limits
- Gradually increases load to find breaking point
- 5 stages ramping from 10 to 200 VUs

### 3. Spike Test
- Tests sudden traffic spikes
- Simulates rapid increase in users
- Tests auto-scaling capabilities

## Metrics to Monitor

- **Response Time**: p95 should be < 500ms
- **Error Rate**: Should be < 1%
- **Throughput**: Requests per second
- **Failed Requests**: Should be minimal

## Best Practices

1. Start with low load and gradually increase
2. Monitor your Lovable Cloud metrics during tests
3. Test one endpoint at a time initially
4. Run tests during off-peak hours
5. Document baseline metrics for comparison
