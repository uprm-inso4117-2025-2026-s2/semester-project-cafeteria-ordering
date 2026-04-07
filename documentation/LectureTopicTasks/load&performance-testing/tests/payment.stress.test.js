import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const paymentSuccessRate = new Rate('payment_success_rate');
const paymentFailureRate = new Rate('payment_failure_rate');
const frontendToBackendLatency = new Trend('frontend_to_backend_latency', true);
const paymentsProcessed = new Counter('payments_processed');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const PAYMENT_PATH = __ENV.PAYMENT_PATH || '/api/payments';
const THINK_TIME = Number(__ENV.THINK_TIME || '0.5');

export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 10 },
        { duration: '30s', target: 30 },
        { duration: '30s', target: 60 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 140 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)'],
};

function buildPayload() {
  const now = Date.now();

  return JSON.stringify({
    cardNumber: '4111111111111111',
    expiry: '12/30',
    cvc: '123',
    cardholderName: 'Stress Test User',
    country: 'Puerto Rico',
    address1: '123 Test St',
    address2: 'Apt 1',
    city: 'Mayaguez',
    zip: '00680',
    savePaymentInfo: false,
    orderItems: [
      {
        id: '1',
        name: 'Lunch Combo',
        unitPrice: 12.5,
        quantity: 1,
      },
    ],
    additionalFees: null,
    tax: null,
    subtotal: 12.5,
    total: 12.5,
    submittedAt: new Date(now).toISOString(),
  });
}

export default function () {
  const payload = buildPayload();
  const start = Date.now();

  const res = http.post(`${BASE_URL}${PAYMENT_PATH}`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { scenario: 'stress_test' },
    timeout: '30s',
  });

  const elapsed = Date.now() - start;
  frontendToBackendLatency.add(elapsed);

  const ok = check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  paymentSuccessRate.add(ok);
  paymentFailureRate.add(!ok);

  if (ok) {
    paymentsProcessed.add(1);
  }

  sleep(THINK_TIME);
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(
      {
        scenario: 'stress_test',
        avg_response_time_ms: data.metrics.http_req_duration?.values?.avg ?? null,
        p95_response_time_ms: data.metrics.http_req_duration?.values?.['p(95)'] ?? null,
        avg_latency_ms: data.metrics.frontend_to_backend_latency?.values?.avg ?? null,
        p95_latency_ms: data.metrics.frontend_to_backend_latency?.values?.['p(95)'] ?? null,
        throughput_req_per_sec: data.metrics.http_reqs?.values?.rate ?? null,
        failure_rate: data.metrics.http_req_failed?.values?.rate ?? null,
        success_rate: data.metrics.payment_success_rate?.values?.rate ?? null,
        payments_processed: data.metrics.payments_processed?.count ?? 0,
      },
      null,
      2
    ),
    'stress-test-summary.json': JSON.stringify(data, null, 2),
  };
}