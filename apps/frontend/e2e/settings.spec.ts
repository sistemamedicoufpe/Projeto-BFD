import { test, expect } from '@playwright/test';
import { login, clearStorage, goOffline, goOnline } from './fixtures/helpers';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await login(page);
    await page.goto('/configuracoes');
    await expect(page.locator('h1')).toContainText('Configurações');
  });

  test.describe('General Settings', () => {
    test('should display current theme setting', async ({ page }) => {
      const themeSelect = page.locator('select').filter({ hasText: 'Claro' }).or(
        page.locator('select').filter({ hasText: 'Escuro' })
      ).or(
        page.locator('select').filter({ hasText: 'Automático' })
      );
      await expect(themeSelect.first()).toBeVisible();
    });

    test('should change theme to dark mode', async ({ page }) => {
      // Find theme select by label
      const themeSection = page.locator('text=Tema').locator('..');
      const themeSelect = themeSection.locator('select');

      await themeSelect.selectOption('dark');

      // Wait for theme to apply
      await page.waitForTimeout(500);

      // Check if dark class is added to html element
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toContain('dark');
    });

    test('should change theme to light mode', async ({ page }) => {
      // First switch to dark
      const themeSection = page.locator('text=Tema').locator('..');
      const themeSelect = themeSection.locator('select');

      await themeSelect.selectOption('dark');
      await page.waitForTimeout(300);

      // Then switch back to light
      await themeSelect.selectOption('light');
      await page.waitForTimeout(300);

      // Check if dark class is removed
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).not.toContain('dark');
    });

    test('should persist theme setting after page reload', async ({ page }) => {
      // Set dark theme
      const themeSection = page.locator('text=Tema').locator('..');
      const themeSelect = themeSection.locator('select');

      await themeSelect.selectOption('dark');
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check if dark mode persisted
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toContain('dark');
    });

    test('should toggle notifications setting', async ({ page }) => {
      const notificationsToggle = page.locator('text=Notificações').locator('..').locator('button[role="switch"]');

      const initialState = await notificationsToggle.getAttribute('aria-checked');

      // Toggle
      await notificationsToggle.click();

      // Check state changed
      const newState = await notificationsToggle.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);
    });
  });

  test.describe('Security Settings', () => {
    test('should display session timeout slider', async ({ page }) => {
      const sessionSlider = page.locator('input[type="range"]').first();
      await expect(sessionSlider).toBeVisible();
    });

    test('should change session timeout value', async ({ page }) => {
      const sessionSlider = page.locator('input[type="range"]').first();

      // Change value
      await sessionSlider.fill('60');

      // Verify change
      const newValue = await sessionSlider.inputValue();
      expect(newValue).toBe('60');
    });

    test('should toggle 2FA setting', async ({ page }) => {
      const twoFAToggle = page.locator('text=Autenticação de dois fatores').locator('..').locator('button[role="switch"]');

      await expect(twoFAToggle).toBeVisible();

      const initialState = await twoFAToggle.getAttribute('aria-checked');
      await twoFAToggle.click();

      const newState = await twoFAToggle.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);
    });

    test('should toggle automatic backup setting', async ({ page }) => {
      const backupToggle = page.locator('text=Backup automático').locator('..').locator('button[role="switch"]');

      await expect(backupToggle).toBeVisible();
      await backupToggle.click();

      // If backup is enabled, frequency select should appear
      // If disabled, it should disappear
    });
  });

  test.describe('Privacy Settings', () => {
    test('should display LGPD information', async ({ page }) => {
      await expect(page.locator('text=LGPD')).toBeVisible();
    });

    test('should toggle data anonymization', async ({ page }) => {
      const anonymizeToggle = page.locator('text=Anonimizar dados').locator('..').locator('button[role="switch"]');

      await expect(anonymizeToggle).toBeVisible();

      const initialState = await anonymizeToggle.getAttribute('aria-checked');
      await anonymizeToggle.click();

      const newState = await anonymizeToggle.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);
    });

    test('should have export data button', async ({ page }) => {
      const exportButton = page.locator('button:has-text("Exportar meus dados")');
      await expect(exportButton).toBeVisible();
    });

    test('should export settings data', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');

      const exportButton = page.locator('button:has-text("Exportar meus dados")');
      await exportButton.click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('neurocare-backup');
      expect(download.suggestedFilename()).toContain('.json');
    });
  });

  test.describe('AI Settings', () => {
    test('should display AI assistant toggle', async ({ page }) => {
      const aiToggle = page.locator('text=Habilitar assistente de IA').locator('..').locator('button[role="switch"]');
      await expect(aiToggle).toBeVisible();
    });

    test('should toggle AI assistant', async ({ page }) => {
      const aiToggle = page.locator('text=Habilitar assistente de IA').locator('..').locator('button[role="switch"]');

      const initialState = await aiToggle.getAttribute('aria-checked');
      await aiToggle.click();

      const newState = await aiToggle.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);
    });

    test('should show AI model selection when AI is enabled', async ({ page }) => {
      // First ensure AI is enabled
      const aiToggle = page.locator('text=Habilitar assistente de IA').locator('..').locator('button[role="switch"]');
      const isEnabled = await aiToggle.getAttribute('aria-checked');

      if (isEnabled !== 'true') {
        await aiToggle.click();
        await page.waitForTimeout(300);
      }

      // Check for model selection
      const modelSelect = page.locator('text=Modelo de IA').locator('..').locator('select');
      await expect(modelSelect).toBeVisible();
    });

    test('should select local AI model', async ({ page }) => {
      // Ensure AI is enabled
      const aiToggle = page.locator('text=Habilitar assistente de IA').locator('..').locator('button[role="switch"]');
      const isEnabled = await aiToggle.getAttribute('aria-checked');

      if (isEnabled !== 'true') {
        await aiToggle.click();
        await page.waitForTimeout(300);
      }

      // Select local model
      const modelSelect = page.locator('text=Modelo de IA').locator('..').locator('select');
      await modelSelect.selectOption('local');

      // Verify local model info appears
      await expect(page.locator('text=TensorFlow.js')).toBeVisible();
    });

    test('should adjust confidence threshold slider', async ({ page }) => {
      // Ensure AI is enabled
      const aiToggle = page.locator('text=Habilitar assistente de IA').locator('..').locator('button[role="switch"]');
      const isEnabled = await aiToggle.getAttribute('aria-checked');

      if (isEnabled !== 'true') {
        await aiToggle.click();
        await page.waitForTimeout(300);
      }

      // Find confidence slider (second range input in the page)
      const confidenceSlider = page.locator('text=Confiança mínima').locator('..').locator('input[type="range"]');
      await expect(confidenceSlider).toBeVisible();

      // Change value
      await confidenceSlider.fill('80');

      // Verify change
      const newValue = await confidenceSlider.inputValue();
      expect(newValue).toBe('80');
    });
  });

  test.describe('Data and Storage', () => {
    test('should display sync status', async ({ page }) => {
      // Should show Online/Offline status
      const statusBadge = page.locator('text=Online').or(page.locator('text=Offline'));
      await expect(statusBadge.first()).toBeVisible();
    });

    test('should have sync button', async ({ page }) => {
      const syncButton = page.locator('button:has-text("Sincronizar agora")');
      await expect(syncButton).toBeVisible();
    });

    test('should disable sync button when offline', async ({ page }) => {
      await goOffline(page);
      await page.waitForTimeout(500);

      const syncButton = page.locator('button:has-text("Sincronizar agora")');
      await expect(syncButton).toBeDisabled();

      await goOnline(page);
    });

    test('should show offline indicator when network is disconnected', async ({ page }) => {
      await goOffline(page);
      await page.waitForTimeout(500);

      // Check for offline indicator
      await expect(page.locator('text=Offline')).toBeVisible();

      await goOnline(page);
    });

    test('should have clear cache button', async ({ page }) => {
      const clearCacheButton = page.locator('button:has-text("Limpar cache")');
      await expect(clearCacheButton).toBeVisible();
    });

    test('should have restore settings button', async ({ page }) => {
      const restoreButton = page.locator('button:has-text("Restaurar")');
      await expect(restoreButton).toBeVisible();
    });

    test('should restore default settings', async ({ page }) => {
      // First change some settings
      const themeSection = page.locator('text=Tema').locator('..');
      const themeSelect = themeSection.locator('select');
      await themeSelect.selectOption('dark');
      await page.waitForTimeout(300);

      // Click restore
      const restoreButton = page.locator('button:has-text("Restaurar")');

      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept());
      await restoreButton.click();

      // Verify alert appears
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('restauradas');
        dialog.dismiss();
      });
    });
  });

  test.describe('System Information', () => {
    test('should display system version', async ({ page }) => {
      await expect(page.locator('text=Versão')).toBeVisible();
      await expect(page.locator('text=2.0.0')).toBeVisible();
    });

    test('should display environment', async ({ page }) => {
      await expect(page.locator('text=Ambiente')).toBeVisible();
    });

    test('should display database provider', async ({ page }) => {
      await expect(page.locator('text=Banco de dados')).toBeVisible();
    });

    test('should display online status', async ({ page }) => {
      await expect(page.locator('text=Status')).toBeVisible();
    });
  });
});

test.describe('Settings Persistence', () => {
  test('should persist all settings across sessions', async ({ page }) => {
    await clearStorage(page);
    await login(page);
    await page.goto('/configuracoes');

    // Change multiple settings
    // Theme
    const themeSelect = page.locator('text=Tema').locator('..').locator('select');
    await themeSelect.selectOption('dark');

    // Session timeout
    const sessionSlider = page.locator('input[type="range"]').first();
    await sessionSlider.fill('45');

    // AI confidence
    const aiToggle = page.locator('text=Habilitar assistente de IA').locator('..').locator('button[role="switch"]');
    const isEnabled = await aiToggle.getAttribute('aria-checked');
    if (isEnabled !== 'true') {
      await aiToggle.click();
      await page.waitForTimeout(300);
    }

    const confidenceSlider = page.locator('text=Confiança mínima').locator('..').locator('input[type="range"]');
    await confidenceSlider.fill('85');

    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify settings persisted
    // Check dark mode
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');

    // Check session timeout (need to wait for page to fully load settings)
    await page.waitForTimeout(500);
    const sessionValue = await page.locator('input[type="range"]').first().inputValue();
    expect(sessionValue).toBe('45');
  });
});

test.describe('Offline Settings Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await login(page);
  });

  test('should work offline - change settings without network', async ({ page }) => {
    await page.goto('/configuracoes');

    // Go offline
    await goOffline(page);
    await page.waitForTimeout(500);

    // Verify offline status
    await expect(page.locator('text=Offline')).toBeVisible();

    // Change theme (should work offline since it uses localStorage)
    const themeSelect = page.locator('text=Tema').locator('..').locator('select');
    await themeSelect.selectOption('dark');

    // Verify theme applied
    await page.waitForTimeout(300);
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');

    // Go back online
    await goOnline(page);
  });

  test('should persist settings made while offline after reconnecting', async ({ page }) => {
    await page.goto('/configuracoes');

    // Go offline
    await goOffline(page);
    await page.waitForTimeout(500);

    // Change settings while offline
    const themeSelect = page.locator('text=Tema').locator('..').locator('select');
    await themeSelect.selectOption('dark');
    await page.waitForTimeout(300);

    // Go back online
    await goOnline(page);
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Settings should still be there
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
  });

  test('should show appropriate UI when offline', async ({ page }) => {
    await page.goto('/configuracoes');

    // Go offline
    await goOffline(page);
    await page.waitForTimeout(500);

    // Should show offline status
    await expect(page.locator('text=Offline')).toBeVisible();

    // Sync button should be disabled
    const syncButton = page.locator('button:has-text("Sincronizar agora")');
    await expect(syncButton).toBeDisabled();

    // Go back online
    await goOnline(page);
    await page.waitForTimeout(500);

    // Should show online status
    await expect(page.locator('text=Online')).toBeVisible();

    // Sync button should be enabled
    await expect(syncButton).toBeEnabled();
  });
});
