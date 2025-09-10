import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'off',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_WEB_SERVER === '0' ? undefined : [
    {
      command: 'bash -lc "cd ../protek-cms && npm run build && npm run start -- -p 3000"',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 420_000,
    },
    {
      command: 'NEXT_PUBLIC_MAINTENANCE_MODE=false NEXT_PUBLIC_CMS_GRAPHQL_URL=http://localhost:3000/api/graphql NEXT_PUBLIC_CMS_BASE_URL=http://localhost:3000 npm run build && NEXT_PUBLIC_MAINTENANCE_MODE=false NEXT_PUBLIC_CMS_GRAPHQL_URL=http://localhost:3000/api/graphql NEXT_PUBLIC_CMS_BASE_URL=http://localhost:3000 npm run start -- -p 3001',
      url: 'http://localhost:3001',
      reuseExistingServer: true,
      timeout: 420_000,
    },
  ],
});
