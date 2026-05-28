import { defineConfig, devices } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

export default defineConfig({
  testMatch: ['**/auth.setup.ts', '**/home.spec.ts'],
  timeout: 120000,
  expect: {
    timeout: 120000,
  },
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: authFile },
      dependencies: ['setup'],
      testMatch: '**/home.spec.ts',
    },
  ],
  webServer: {
    command: 'npm run web',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
