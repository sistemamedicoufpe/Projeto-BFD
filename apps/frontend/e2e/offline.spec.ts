import { test, expect } from '@playwright/test';
import { testPatient, testEvaluation } from './fixtures/test-data';
import {
  login,
  fillPatientForm,
  goOffline,
  goOnline,
  waitForSync,
  expectSuccessToast,
  countIndexedDBItems,
} from './fixtures/helpers';

test.describe('Funcionalidade Offline', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('deve exibir indicador quando ficar offline', async ({ page }) => {
    await page.goto('/');

    // Ficar offline
    await goOffline(page);

    // Aguardar indicador
    await page.waitForTimeout(500);

    // Verificar indicador de offline
    await expect(page.locator('[data-testid="online-status"]')).toBeVisible();
    await expect(page.locator('text=Você está offline')).toBeVisible();
  });

  test('deve exibir indicador quando voltar online', async ({ page }) => {
    await page.goto('/');

    // Ficar offline
    await goOffline(page);
    await page.waitForTimeout(500);

    // Voltar online
    await goOnline(page);
    await page.waitForTimeout(500);

    // Verificar indicador de volta online
    await expect(page.locator('text=Conexão restaurada')).toBeVisible();
  });

  test('deve criar paciente offline e salvar no IndexedDB', async ({ page }) => {
    await page.goto('/pacientes/novo');

    // Ficar offline
    await goOffline(page);

    // Criar paciente
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');

    // Verificar que salvou localmente
    await expectSuccessToast(page, 'Paciente salvo localmente');

    // Verificar que está na fila de sincronização
    const syncQueueCount = await countIndexedDBItems(page, 'syncQueue');
    expect(syncQueueCount).toBeGreaterThan(0);

    // Verificar indicador de itens pendentes
    await expect(page.locator('text=/\\d+ itens? pendentes/')).toBeVisible();
  });

  test('deve sincronizar paciente criado offline quando voltar online', async ({ page }) => {
    await page.goto('/pacientes/novo');

    // Ficar offline
    await goOffline(page);

    // Criar paciente
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Verificar que está na fila
    let syncQueueCount = await countIndexedDBItems(page, 'syncQueue');
    expect(syncQueueCount).toBe(1);

    // Voltar online
    await goOnline(page);

    // Aguardar sincronização automática
    await waitForSync(page);

    // Verificar que sincronizou
    syncQueueCount = await countIndexedDBItems(page, 'syncQueue');
    expect(syncQueueCount).toBe(0);

    // Verificar mensagem de sincronização
    await expect(page.locator('text=Todos os dados estão sincronizados')).toBeVisible();
  });

  test('deve editar paciente offline', async ({ page }) => {
    // Criar paciente online primeiro
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Abrir detalhes do paciente
    await page.click(`text=${testPatient.nome}`);

    // Ficar offline
    await goOffline(page);

    // Editar
    await page.click('button:has-text("Editar")');
    const novoTelefone = '(11) 88888-8888';
    await page.fill('input[name="telefone"]', novoTelefone);
    await page.click('button[type="submit"]:has-text("Salvar")');

    // Verificar que salvou localmente
    await expectSuccessToast(page, 'Alterações salvas localmente');

    // Verificar que está na fila de sincronização
    const syncQueueCount = await countIndexedDBItems(page, 'syncQueue');
    expect(syncQueueCount).toBeGreaterThan(0);
  });

  test('deve criar avaliação offline', async ({ page }) => {
    // Criar paciente online primeiro
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Ficar offline
    await goOffline(page);

    // Criar avaliação
    await page.goto('/avaliacoes/nova');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.click('button:has-text("Próximo")');
    await page.click('button:has-text("Próximo")');
    await page.fill('textarea[name="hipoteseDiagnostica"]', testEvaluation.hipoteseDiagnostica);
    await page.click('button:has-text("Finalizar Avaliação")');

    // Verificar que salvou localmente
    await expectSuccessToast(page, 'Avaliação salva localmente');

    // Verificar que está na fila
    const syncQueueCount = await countIndexedDBItems(page, 'syncQueue');
    expect(syncQueueCount).toBeGreaterThan(0);
  });

  test('deve visualizar dados salvos localmente enquanto offline', async ({ page }) => {
    // Criar paciente online
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Ficar offline
    await goOffline(page);

    // Navegar pela aplicação
    await page.goto('/pacientes');

    // Verificar que paciente aparece na lista
    await expect(page.locator(`text=${testPatient.nome}`)).toBeVisible();

    // Abrir detalhes
    await page.click(`text=${testPatient.nome}`);

    // Verificar que consegue visualizar detalhes
    await expect(page.locator(`text=${testPatient.cpf}`)).toBeVisible();
    await expect(page.locator(`text=${testPatient.telefone}`)).toBeVisible();
  });

  test('deve realizar busca offline', async ({ page }) => {
    // Criar alguns pacientes online
    const patients = [
      { ...testPatient, nome: 'Ana Silva', cpf: '111.111.111-11' },
      { ...testPatient, nome: 'Bruno Costa', cpf: '222.222.222-22' },
      { ...testPatient, nome: 'Carlos Santos', cpf: '333.333.333-33' },
    ];

    for (const patient of patients) {
      await page.goto('/pacientes/novo');
      await fillPatientForm(page, patient);
      await page.click('button[type="submit"]:has-text("Salvar")');
      await page.waitForURL('/pacientes');
    }

    // Ficar offline
    await goOffline(page);

    // Buscar paciente
    await page.goto('/pacientes');
    await page.fill('input[placeholder*="Buscar"]', 'Bruno');
    await page.waitForTimeout(500);

    // Verificar resultado
    await expect(page.locator('text=Bruno Costa')).toBeVisible();
    await expect(page.locator('text=Ana Silva')).not.toBeVisible();
  });

  test('deve aplicar filtros offline', async ({ page }) => {
    // Criar pacientes de diferentes gêneros online
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, { ...testPatient, genero: 'FEMININO' });
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    await page.goto('/pacientes/novo');
    await fillPatientForm(page, {
      ...testPatient,
      nome: 'João Silva',
      cpf: '999.999.999-99',
      genero: 'MASCULINO',
    });
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Ficar offline
    await goOffline(page);

    // Aplicar filtro
    await page.goto('/pacientes');
    await page.selectOption('select[name="genero"]', 'FEMININO');
    await page.waitForTimeout(500);

    // Verificar filtro
    await expect(page.locator(`text=${testPatient.nome}`)).toBeVisible();
    await expect(page.locator('text=João Silva')).not.toBeVisible();
  });

  test('deve exibir contador de itens pendentes de sincronização', async ({ page }) => {
    await page.goto('/');

    // Ficar offline
    await goOffline(page);

    // Criar 3 pacientes offline
    for (let i = 1; i <= 3; i++) {
      await page.goto('/pacientes/novo');
      await fillPatientForm(page, {
        ...testPatient,
        nome: `Paciente ${i}`,
        cpf: `${i.toString().padStart(3, '0')}.000.000-00`,
      });
      await page.click('button[type="submit"]:has-text("Salvar")');
      await page.waitForURL('/pacientes');
    }

    // Verificar contador
    await expect(page.locator('text=3 itens pendentes')).toBeVisible();
  });

  test('deve sincronizar múltiplos itens em lote', async ({ page }) => {
    await page.goto('/');

    // Ficar offline
    await goOffline(page);

    // Criar 5 pacientes offline
    for (let i = 1; i <= 5; i++) {
      await page.goto('/pacientes/novo');
      await fillPatientForm(page, {
        ...testPatient,
        nome: `Paciente ${i}`,
        cpf: `${i.toString().padStart(3, '0')}.000.000-00`,
      });
      await page.click('button[type="submit"]:has-text("Salvar")');
      await page.waitForURL('/pacientes');
    }

    // Verificar fila
    let syncQueueCount = await countIndexedDBItems(page, 'syncQueue');
    expect(syncQueueCount).toBe(5);

    // Voltar online
    await goOnline(page);

    // Aguardar sincronização de todos os itens
    await waitForSync(page);

    // Verificar que todos foram sincronizados
    syncQueueCount = await countIndexedDBItems(page, 'syncQueue');
    expect(syncQueueCount).toBe(0);

    // Verificar mensagem
    await expect(page.locator('text=Todos os dados estão sincronizados')).toBeVisible();
  });

  test('deve retentar sincronização em caso de falha', async ({ page }) => {
    await page.goto('/');

    // Criar paciente offline
    await goOffline(page);
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Simular erro de rede ao voltar online
    await page.route('**/api/v1/patients', route => {
      route.abort('failed');
    });

    await goOnline(page);
    await page.waitForTimeout(2000);

    // Verificar que item ainda está na fila
    let syncQueueCount = await countIndexedDBItems(page, 'syncQueue');
    expect(syncQueueCount).toBe(1);

    // Remover simulação de erro
    await page.unroute('**/api/v1/patients');

    // Aguardar retry automático
    await page.waitForTimeout(5000);

    // Verificar que sincronizou
    syncQueueCount = await countIndexedDBItems(page, 'syncQueue');
    expect(syncQueueCount).toBe(0);
  });

  test('deve sincronizar automaticamente a cada 5 minutos', async ({ page }) => {
    await page.goto('/');

    // Criar paciente offline
    await goOffline(page);
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Voltar online
    await goOnline(page);

    // Aguardar primeira sincronização automática
    await waitForSync(page);

    // Verificar que sincronizou
    const syncQueueCount = await countIndexedDBItems(page, 'syncQueue');
    expect(syncQueueCount).toBe(0);
  });

  test('deve funcionar PWA quando instalado', async ({ page, context }) => {
    // Navegar para o app
    await page.goto('/');

    // Verificar que manifest está presente
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    // Verificar service worker
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });

    expect(swRegistered).toBe(true);
  });

  test('deve carregar recursos do cache quando offline', async ({ page }) => {
    // Navegar online primeiro para cachear recursos
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Aguardar service worker instalar
    await page.waitForTimeout(2000);

    // Ficar offline
    await goOffline(page);

    // Tentar navegar
    await page.goto('/pacientes');

    // Verificar que página carregou do cache
    await expect(page.locator('h1')).toContainText('Pacientes');
  });

  test('deve exibir página offline quando não houver cache', async ({ page }) => {
    // Limpar cache
    await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    });

    // Ficar offline
    await goOffline(page);

    // Tentar navegar para página não cacheada
    await page.goto('/nova-pagina-inexistente');

    // Verificar página offline
    await expect(page.locator('text=Você está offline')).toBeVisible();
  });

  test('deve resolver conflito com Last-Write-Wins', async ({ page, context }) => {
    // Criar paciente
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Abrir mesma sessão em nova aba (simulando dois dispositivos)
    const page2 = await context.newPage();
    await page2.goto('http://localhost:5173');

    // Login na segunda aba
    await page2.fill('input[name="email"]', 'teste@neurocare.com.br');
    await page2.fill('input[name="password"]', 'Teste@123456');
    await page2.click('button[type="submit"]');
    await page2.waitForURL('/');

    // Editar paciente na primeira aba (offline)
    await goOffline(page);
    await page.goto('/pacientes');
    await page.click(`text=${testPatient.nome}`);
    await page.click('button:has-text("Editar")');
    await page.fill('input[name="telefone"]', '(11) 11111-1111');
    await page.click('button[type="submit"]:has-text("Salvar")');

    // Editar mesmo paciente na segunda aba (online)
    await page2.goto('/pacientes');
    await page2.click(`text=${testPatient.nome}`);
    await page2.click('button:has-text("Editar")');
    await page2.fill('input[name="telefone"]', '(11) 22222-2222');
    await page2.click('button[type="submit"]:has-text("Salvar")');

    // Voltar online na primeira aba
    await goOnline(page);
    await waitForSync(page);

    // Recarregar e verificar que última escrita venceu
    await page.reload();
    await page.goto('/pacientes');
    await page.click(`text=${testPatient.nome}`);

    // O telefone deve ser o da última modificação
    await expect(page.locator('text=(11) 22222-2222')).toBeVisible();

    await page2.close();
  });

  test('deve mostrar progresso de sincronização', async ({ page }) => {
    await page.goto('/');

    // Criar vários itens offline
    await goOffline(page);

    for (let i = 1; i <= 10; i++) {
      await page.goto('/pacientes/novo');
      await fillPatientForm(page, {
        ...testPatient,
        nome: `Paciente ${i}`,
        cpf: `${i.toString().padStart(3, '0')}.000.000-00`,
      });
      await page.click('button[type="submit"]:has-text("Salvar")');
      await page.waitForURL('/pacientes');
    }

    // Voltar online
    await goOnline(page);

    // Verificar indicador de progresso
    await expect(page.locator('[data-testid="sync-progress"]')).toBeVisible();
    await expect(page.locator('text=Sincronizando')).toBeVisible();

    // Aguardar conclusão
    await waitForSync(page);

    // Verificar que progresso desapareceu
    await expect(page.locator('[data-testid="sync-progress"]')).not.toBeVisible();
  });
});
