const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const FAILURE_RATE = Number(process.env.FAILURE_RATE || 0.02);
const MIN_DELAY_MS = Number(process.env.MIN_DELAY_MS || 200);
const MAX_DELAY_MS = Number(process.env.MAX_DELAY_MS || 600);

function randomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
}

function shouldFail() {
  return Math.random() < FAILURE_RATE;
}

app.post('/api/payments', async (_req, res) => {
  const delay = randomDelay();

  await new Promise((resolve) => setTimeout(resolve, delay));

  if (shouldFail()) {
    return res.status(500).json({
      success: false,
      message: 'Mock payment failed',
      transactionId: null,
      processingTimeMs: delay,
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Mock payment approved',
    transactionId: `txn-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    processingTimeMs: delay,
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Mock payment server running on http://localhost:${PORT}`);
});