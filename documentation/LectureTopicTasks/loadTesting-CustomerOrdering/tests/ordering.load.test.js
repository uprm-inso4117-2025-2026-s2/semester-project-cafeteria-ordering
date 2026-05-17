/*
TC-ORD-04: Load testing for customer ordering
Author: @Lorenzo-PT

Description
Tests how customer ordering workflow behaves under different customer levels.
Load tests of various tests such as there being multiple customers, menu browsing, cart updates, among others.


Preconditions
* System is accessible and usable.
* Load testing tool is accessible.
*/

//Test Data

import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

const orderSuccessRate = new Rate('order_success_rate');
const orderFailureRate = new Rate('order_failure_rate');
const paymentSuccessRate = new Rate('payment_success_rate');
const paymentFailureRate = new Rate('payment_failure_rate');
//host is 8081
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';
const PAYMENT_PATH = __ENV.PAYMENT_PATH || '/api/payments';
const THINK_TIME = Number(__ENV.THINK_TIME || '1');
//latency metric
const menuLatency = new Trend('menu_latency_ms',true);
const cartLatency = new Trend('cart_latency_ms', true);
const checkoutLatency = new Trend('checkout_latency_ms', true);

const workflowDuration = new Trend('workflow_duration_ms', true);


export const options = {
  scenarios: {
    customer_ordering_load: {
      executor: 'ramping-vus',
      stages: [
        { duration:'30s', target: 5 }, // Stage 1: warm-up
        { duration: '1m', target: 15 }, // Stage 2: build-up
        { duration:'1m', target: 25 }, // Stage 3: peak load
        { duration: '30s', target: 0 }, // Stage 4: wind-down
      ],
    },
  },
  thresholds: {
    http_req_failed:['rate<0.10'],  // Failure rate must stay below 10%
    http_req_duration:['p(95)<2500'], // 95th-percentile response under 2.5s
    payment_success_rate: ['rate>0.90'],  // Payment success rate above 90%
  },
  // Report these stats for every Trend metric in the summary
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)'],
};

function buildCartPayload() {
  return JSON.stringify({
    customerId: 'customer-uuid-001',
    items: [
      { id: '1', name: 'Lunch Combo', unitPrice: 12.50, quantity: 1 },
      { id: '3', name: 'Coffee',  unitPrice: 2.00,  quantity: 2 },
    ],
  });
}
 
function buildCheckoutPayload() {
  return JSON.stringify({
    customerId: 'customer-uuid-001',
    pickupTime: '12:30',
  });
}
 
function buildPaymentPayload() {
  return JSON.stringify({
    cardNumber: '4111111111111111',
    expiry: '12/30',
    cvc:  '123',
    cardholderName:'Load Test User',
    country: 'Puerto Rico',
    address1: '123 Test St',
    city:'Mayaguez',
    zip:'00680',
    savePaymentInfo: false,
    orderItems: [
      { id: '1', name: 'Lunch Combo', unitPrice: 12.50, quantity: 1 },
      { id: '3', name: 'Coffee', unitPrice: 2.00,  quantity: 2 },
    ],
    subtotal:    16.50,
    tax:         null,
    total:       16.50,
    submittedAt: new Date(Date.now()).toISOString(),
  });
}
 

export default function () {
  const headers       = { 'Content-Type': 'application/json' };
  const workflowStart = Date.now();
  // menu browsing
  let start=Date.now();
  const menuRes =http.get(`${BASE_URL}/menu`, {
    headers,
    tags:{ step: 'menu' },
    timeout: '30s',
  });
  menuLatency.add(Date.now() -start);
 
  const menuOk = check(menuRes, {
    'menu: status 200':         (r) => r.status === 200,
    'menu: response not empty': (r) => r.body !== null && r.body.length > 0,
  });
  sleep(THINK_TIME); // Simulate customer reading the menu
 
  //Update cart
  start = Date.now();
  const cartRes=http.post(`${BASE_URL}/cart`, buildCartPayload(), {
    headers,
    tags: { step: 'cart' },
    timeout:'30s',
  });
  cartLatency.add(Date.now() - start);
 
  const cartOk = check(cartRes, {
    'cart: status 200 or 201': (r) => r.status === 200 || r.status === 201,
    'cart: response under 3s': (r) => r.timings.duration < 3000,
  });
 
  sleep(THINK_TIME * 0.5);
 
  // checkout
  start=Date.now();
  const checkoutRes = http.post(`${BASE_URL}/checkout`, buildCheckoutPayload(), {
    headers,
    tags: { step: 'checkout' },
    timeout: '30s',
  });
  checkoutLatency.add(Date.now() - start);
 
  const checkoutOk = check(checkoutRes, {
    'checkout: status 200 or 201': (r) => r.status === 200 || r.status === 201,
    'checkout: response under 3s': (r) => r.timings.duration < 3000,
  });
 
  sleep(THINK_TIME * 0.5);
 
  // PaYment
  // start = Date.now();
  // const payRes = http.post(`${BASE_URL}/payment`, buildPaymentPayload(), {
  //   headers,
  //   tags: { step: 'payment' },
  //   timeout: '30s',
  // });
  // paymentLatency.add(Date.now() - start);

 
  // metrics
  const fullWorkflowOk = menuOk && cartOk && checkoutOk;

  orderSuccessRate.add(fullWorkflowOk);
  orderFailureRate.add(!fullWorkflowOk);
 
  // if (paymentOk) {
  //   paymentsProcessed.add(1);
  // }

  workflowDuration.add(Date.now() - workflowStart);
  sleep(THINK_TIME);
}

export function handleSummary(data) {
  const m = data.metrics;
 
  const summary = {
    scenario: 'customer_ordering_load',
    avg_response_time_ms: m.http_req_duration?.values?.avg ?? null,
    p95_response_time_ms:  m.http_req_duration?.values?.['p(95)']  ?? null,
    avg_menu_latency_ms: m.menu_latency_ms?.values?.avg ?? null,
    avg_cart_latency_ms: m.cart_latency_ms?.values?.avg  ?? null,
    avg_checkout_latency_ms: m.checkout_latency_ms?.values?.avg ?? null,
    avg_payment_latency_ms: m.payment_latency_ms?.values?.avg ?? null,
    p95_payment_latency_ms: m.payment_latency_ms?.values?.['p(95)'] ?? null,
    avg_workflow_duration_ms: m.workflow_duration_ms?.values?.avg ?? null,
    p95_workflow_duration_ms: m.workflow_duration_ms?.values?.['p(95)'] ?? null,
    throughput_req_per_sec: m.http_reqs?.values?.rate  ?? null,
    failure_rate: m.http_req_failed?.values?.rate ?? null,
    order_success_rate: m.order_success_rate?.values?.rate ?? null,
  };
 
  return {
    'load-test-summary.json': JSON.stringify(summary, null, 2),
    'load-test-full-results.json': JSON.stringify(data, null, 2),
  };
}