import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    // Specify the base URL for your tests
    baseURL: 'http://localhost:3000',
  },
  // Tell Playwright to treat.ts files as test files
  testDir: './src/tests',
  testMatch: '**/*.spec.ts',
};

export default config;