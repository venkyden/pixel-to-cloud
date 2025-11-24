import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '3m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.15'],
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

  // Heavy mixed workload
  const endpoints = [
    `${BASE_URL}/rest/v1/properties?select=*&limit=20`,
    `${BASE_URL}/rest/v1/tenant_applications?select=*`,
    `${BASE_URL}/rest/v1/notifications?select=*&order=created_at.desc`,
  ];

  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  const res = http.get(randomEndpoint, { headers: headers });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time acceptable': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}
