import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.CIRCUITMIND_BASE_URL ?? 'http://localhost:3000';
const baseURLPort = new URL(baseURL).port || '3000';
const devServerPort = process.env.CIRCUITMIND_PORT ?? baseURLPort;
const skipWebServer = process.env.CIRCUITMIND_SKIP_WEB_SERVER === '1';

export default defineConfig({
  testDir: './scripts',
  testMatch: '**/capture-*.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  
  // 30 minute timeout for comprehensive screenshot capture
  timeout: 1800000,
  
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    viewport: { width: 1366, height: 768 },
    
    // Consistent rendering
    launchOptions: {
      args: ['--font-render-hinting=none'],
    },
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  webServer: skipWebServer
    ? undefined
    : {
        command: `npm run dev -- --port ${devServerPort}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 60000,
      },
});
