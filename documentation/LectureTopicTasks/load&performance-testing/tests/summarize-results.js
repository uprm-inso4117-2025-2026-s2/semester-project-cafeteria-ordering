const fs = require('fs');
const path = require('path');

function getMetric(metrics, name) {
  return metrics?.[name] ?? null;
}

function getValue(metric, ...candidates) {
  if (!metric) return undefined;

  for (const candidate of candidates) {
    const parts = candidate.split('.');
    let current = metric;

    for (const part of parts) {
      if (current && Object.prototype.hasOwnProperty.call(current, part)) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }

    if (current !== undefined && current !== null) {
      return current;
    }
  }

  return undefined;
}

function roundIfNumber(value, digits = 4) {
  return typeof value === 'number' ? Number(value.toFixed(digits)) : value;
}

function extractStats(filePath, label) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const metrics = raw.metrics || {};

  const httpReqDuration = getMetric(metrics, 'http_req_duration');
  const frontendLatency = getMetric(metrics, 'frontend_to_backend_latency');
  const httpReqFailed = getMetric(metrics, 'http_req_failed');
  const paymentSuccessRate = getMetric(metrics, 'payment_success_rate');
  const paymentsProcessed = getMetric(metrics, 'payments_processed');
  const httpReqs = getMetric(metrics, 'http_reqs');
  const iterations = getMetric(metrics, 'iterations');

  const avgResponseTime = getValue(
    httpReqDuration,
    'values.avg',
    'avg',
    'value.avg'
  );

  const p95ResponseTime = getValue(
    httpReqDuration,
    'values.p(95)',
    'values.p95',
    'p(95)',
    'p95'
  );

  const avgLatency = getValue(
    frontendLatency,
    'values.avg',
    'avg',
    'value.avg'
  );

  const p95Latency = getValue(
    frontendLatency,
    'values.p(95)',
    'values.p95',
    'p(95)',
    'p95'
  );

  const throughput = getValue(
    httpReqs,
    'values.rate',
    'rate',
    'value.rate'
  );

  const processed = getValue(
    paymentsProcessed,
    'values.count',
    'count',
    'value.count'
  );

  const explicitFailureRate = getValue(
    httpReqFailed,
    'values.rate',
    'rate',
    'value.rate'
  );

  const explicitSuccessRate = getValue(
    paymentSuccessRate,
    'values.rate',
    'rate',
    'value.rate'
  );

  const totalIterations = getValue(
    iterations,
    'values.count',
    'count',
    'value.count'
  );

  let derivedSuccessRate;
  let derivedFailureRate;

  if (
    typeof processed === 'number' &&
    typeof totalIterations === 'number' &&
    totalIterations > 0
  ) {
    derivedSuccessRate = processed / totalIterations;
    derivedFailureRate = 1 - derivedSuccessRate;
  }

  const successRate =
    explicitSuccessRate !== undefined
      ? explicitSuccessRate
      : derivedSuccessRate !== undefined
      ? derivedSuccessRate
      : 'N/A';

  const failureRate =
    explicitFailureRate !== undefined
      ? explicitFailureRate
      : derivedFailureRate !== undefined
      ? derivedFailureRate
      : 'N/A';

  return {
    scenario: label,
    avg_response_time_ms:
      avgResponseTime !== undefined ? roundIfNumber(avgResponseTime, 2) : 'N/A',
    p95_response_time_ms:
      p95ResponseTime !== undefined ? roundIfNumber(p95ResponseTime, 2) : 'N/A',
    avg_latency_ms:
      avgLatency !== undefined ? roundIfNumber(avgLatency, 2) : 'N/A',
    p95_latency_ms:
      p95Latency !== undefined ? roundIfNumber(p95Latency, 2) : 'N/A',
    throughput_req_per_sec:
      throughput !== undefined ? roundIfNumber(throughput, 2) : 'N/A',
    failure_rate:
      failureRate !== 'N/A' ? roundIfNumber(failureRate, 4) : 'N/A',
    success_rate:
      successRate !== 'N/A' ? roundIfNumber(successRate, 4) : 'N/A',
    payments_processed: processed !== undefined ? processed : 'N/A',
  };
}

const baseDir = path.join(__dirname, '..');
const resultsDir = path.join(baseDir, 'results');

const files = [
  {
    path: path.join(resultsDir, 'performance-test-summary.json'),
    label: 'Performance Test',
  },
  {
    path: path.join(resultsDir, 'load-test-summary.json'),
    label: 'Load Test',
  },
  {
    path: path.join(resultsDir, 'stress-test-summary.json'),
    label: 'Stress Test',
  },
];

const combinedResults = [];

for (const file of files) {
  if (fs.existsSync(file.path)) {
    const result = extractStats(file.path, file.label);
    combinedResults.push(result);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Missing file: ${file.path}`);
  }
}

const combinedOutputPath = path.join(baseDir, 'combined-test-results.json');
fs.writeFileSync(
  combinedOutputPath,
  JSON.stringify(combinedResults, null, 2)
);

console.log(`\nSaved: ${combinedOutputPath}`);