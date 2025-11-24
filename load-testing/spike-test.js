import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Normal load
    { duration: '1m', target: 10 },    // Stay at normal
    { duration: '10s', target: 500 },  // Spike to 500 users
    { duration: '3m', target: 500 },   // Sustain spike
    { duration: '10s', target: 10 },   // Back to normal
    { duration: '1m', target: 10 },    // Recover
    { duration: '10s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const ANON_KEY = 'YOUR_ANON_KEY';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
  };

  // Simulate user browsing properties
  const propertiesRes = http.get(
    `${BASE_URL}/rest/v1/properties?select=*&limit=10`,
    { headers: headers }
  );

  check(propertiesRes, {
    'spike test - status is 200': (r) => r.status === 200,
    'spike test - within time limit': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(0.5); // Shorter sleep to simulate burst
}
