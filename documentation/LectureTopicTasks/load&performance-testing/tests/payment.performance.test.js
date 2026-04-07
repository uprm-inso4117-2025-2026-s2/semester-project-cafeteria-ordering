const http = require('http');
const fs = require('fs');
const path = require('path');

const TOTAL_RUNS = 10;
const timings = [];
let failures = 0;

function sendRequest() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      cardNumber: '4111111111111111',
      expiry: '12/30',
      cvc: '123',
      cardholderName: 'Performance Test User',
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
      submittedAt: new Date().toISOString(),
    });

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/payments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const start = Date.now();

    const req = http.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        const end = Date.now();
        const elapsed = end - start;

        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(elapsed);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

function percentile(sortedArray, p) {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

async function runTest() {
  console.log('Running single-user performance test...\n');

  const suiteStart = Date.now();

  for (let i = 0; i < TOTAL_RUNS; i++) {
    try {
      const time = await sendRequest();
      timings.push(time);
      console.log(`Run ${i + 1}: ${time} ms`);
    } catch (err) {
      failures++;
      console.log(`Run ${i + 1}: FAILED (${err.message})`);
    }
  }

  const suiteEnd = Date.now();
  const totalDurationSeconds = (suiteEnd - suiteStart) / 1000;

  const successfulRuns = timings.length;
  const average =
    successfulRuns > 0
      ? timings.reduce((sum, t) => sum + t, 0) / successfulRuns
      : 0;

  const sorted = [...timings].sort((a, b) => a - b);
  const p95 = percentile(sorted, 95);
  const min = successfulRuns > 0 ? sorted[0] : 0;
  const max = successfulRuns > 0 ? sorted[sorted.length - 1] : 0;
  const failureRate = TOTAL_RUNS > 0 ? failures / TOTAL_RUNS : 0;
  const successRate = TOTAL_RUNS > 0 ? successfulRuns / TOTAL_RUNS : 0;
  const throughput =
    totalDurationSeconds > 0 ? successfulRuns / totalDurationSeconds : 0;

  const summary = {
    metrics: {
      http_req_duration: {
        values: {
          avg: Number(average.toFixed(2)),
          min,
          max,
          'p(95)': p95,
        },
      },
      frontend_to_backend_latency: {
        values: {
          avg: Number(average.toFixed(2)),
          'p(95)': p95,
        },
      },
      http_req_failed: {
        values: {
          rate: Number(failureRate.toFixed(4)),
        },
      },
      payment_success_rate: {
        values: {
          rate: Number(successRate.toFixed(4)),
        },
      },
      payments_processed: {
        count: successfulRuns,
      },
      http_reqs: {
        values: {
          rate: Number(throughput.toFixed(2)),
        },
      },
    },
  };

  const outputPath = path.join(__dirname, '..', 'results', 'performance-test-summary.json');
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));

  console.log('\n--- Performance Test Results ---');
  console.log(`Total runs: ${TOTAL_RUNS}`);
  console.log(`Successful runs: ${successfulRuns}`);
  console.log(`Failures: ${failures}`);
  console.log(`Average response time: ${average.toFixed(2)} ms`);
  console.log(`P95 response time: ${p95} ms`);
  console.log(`Min response time: ${min} ms`);
  console.log(`Max response time: ${max} ms`);
  console.log(`Throughput: ${throughput.toFixed(2)} requests/second`);
  console.log(`Failure rate: ${(failureRate * 100).toFixed(2)}%`);
  console.log(`\nSaved: ${outputPath}`);
}

runTest();