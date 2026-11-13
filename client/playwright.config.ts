import { defineConfig, devices } from '@playwright/test'

// End-to-end tests drive the real client against the real API and database.
//
// Locally: start the app with `npm run dev` in the repo root, then `npm run test:e2e`.
// In CI (E2E_START_SERVERS=1) Playwright starts the built API and client itself.
const startServers = !!process.env.E2E_START_SERVERS
const baseURL =
  process.env.E2E_BASE_URL || (startServers ? 'http://localhost:4173' : 'http://localhost:5173')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: startServers
    ? [
        {
          command: 'npm run start -w server',
          cwd: '..',
          url: 'http://localhost:3000/api/health',
          reuseExistingServer: false,
        },
        {
          command: 'npm run preview -w client -- --port 4173 --strictPort',
          cwd: '..',
          url: 'http://localhost:4173',
          reuseExistingServer: false,
        },
      ]
    : undefined,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
