import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:5173', channel: 'msedge', headless: true },
  webServer: [
    { command: 'node ../server/src/server.js', url: 'http://localhost:5000/api/health', reuseExistingServer: false, env: { PORT: '5000' } },
    { command: 'npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: false },
  ],
});
