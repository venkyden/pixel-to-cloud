import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.1'],              // Error rate should be below 10%
  },
};

// Configuration - Update these with your actual endpoints
const BASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const ANON_KEY = 'YOUR_ANON_KEY';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
  };

  // Test 1: Properties endpoint
  const propertiesRes = http.get(`${BASE_URL}/rest/v1/properties?select=*`, {
    headers: headers,
  });

  check(propertiesRes, {
    'properties status is 200': (r) => r.status === 200,
    'properties response time OK': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: AI Property Search function
  const searchPayload = JSON.stringify({
    query: 'apartment in Paris',
    filters: { maxPrice: 1500 },
  });

  const searchRes = http.post(
    `${BASE_URL}/functions/v1/ai-property-search`,
    searchPayload,
    { headers: headers }
  );

  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search response time OK': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(2);
}
