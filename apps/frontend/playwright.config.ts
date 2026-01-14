import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * Documentação: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Executa testes em paralelo */
  fullyParallel: false,

  /* Falha o build do CI se você acidentalmente deixar test.only na fonte */
  forbidOnly: !!process.env.CI,

  /* Retry em CI apenas */
  retries: process.env.CI ? 2 : 0,

  /* Reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  /* Configuração compartilhada para todos os projetos */
  use: {
    /* URL base */
    baseURL: 'http://localhost:5173',

    /* Captura de tela em falhas */
    screenshot: 'only-on-failure',

    /* Vídeo em falhas */
    video: 'retain-on-failure',

    /* Trace em falhas */
    trace: 'on-first-retry',
  },

  /* Configurar projeto para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Testes mobile */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Executar servidor de desenvolvimento antes dos testes */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
