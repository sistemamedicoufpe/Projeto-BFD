import { Page, expect } from '@playwright/test';
import { testUser } from './test-data';

/**
 * Helper para realizar login
 */
export async function login(page: Page, email = testUser.email, password = testUser.password) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Aguarda redirecionamento para dashboard
  await page.waitForURL('/');
  await expect(page).toHaveTitle(/NeuroCare/);
}

/**
 * Helper para realizar logout
 */
export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Sair');
  await page.waitForURL('/login');
}

/**
 * Helper para limpar localStorage
 */
export async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Helper para simular offline
 */
export async function goOffline(page: Page) {
  await page.context().setOffline(true);
}

/**
 * Helper para simular online
 */
export async function goOnline(page: Page) {
  await page.context().setOffline(false);
}

/**
 * Helper para esperar por requisição de API
 */
export async function waitForAPI(page: Page, endpoint: string) {
  return page.waitForResponse(response =>
    response.url().includes(endpoint) && response.status() === 200
  );
}

/**
 * Helper para verificar toast de sucesso
 */
export async function expectSuccessToast(page: Page, message?: string) {
  const toast = page.locator('[role="alert"]');
  await expect(toast).toBeVisible();
  if (message) {
    await expect(toast).toContainText(message);
  }
}

/**
 * Helper para verificar toast de erro
 */
export async function expectErrorToast(page: Page, message?: string) {
  const toast = page.locator('[role="alert"]');
  await expect(toast).toBeVisible();
  if (message) {
    await expect(toast).toContainText(message);
  }
}

/**
 * Helper para preencher formulário de paciente
 */
export async function fillPatientForm(page: Page, patient: any) {
  await page.fill('input[name="nome"]', patient.nome);
  await page.fill('input[name="cpf"]', patient.cpf);
  await page.fill('input[name="dataNascimento"]', patient.dataNascimento);
  await page.selectOption('select[name="genero"]', patient.genero);
  await page.selectOption('select[name="estadoCivil"]', patient.estadoCivil);
  await page.fill('input[name="escolaridade"]', patient.escolaridade.toString());
  await page.fill('input[name="profissao"]', patient.profissao);
  await page.fill('input[name="telefone"]', patient.telefone);
  await page.fill('input[name="email"]', patient.email);
  await page.fill('input[name="endereco"]', patient.endereco);
  await page.fill('input[name="cidade"]', patient.cidade);
  await page.fill('input[name="estado"]', patient.estado);
  await page.fill('input[name="cep"]', patient.cep);
  await page.fill('input[name="contatoEmergenciaNome"]', patient.contatoEmergenciaNome);
  await page.fill('input[name="contatoEmergenciaTelefone"]', patient.contatoEmergenciaTelefone);
  await page.fill('input[name="contatoEmergenciaRelacao"]', patient.contatoEmergenciaRelacao);
  await page.fill('textarea[name="historicoMedico"]', patient.historicoMedico);

  // Alergias
  if (patient.alergias && patient.alergias.length > 0) {
    await page.fill('input[name="alergias"]', patient.alergias.join(', '));
  }

  // Medicamentos
  if (patient.medicamentosEmUso && patient.medicamentosEmUso.length > 0) {
    await page.fill('input[name="medicamentosEmUso"]', patient.medicamentosEmUso.join(', '));
  }

  await page.fill('textarea[name="queixaPrincipal"]', patient.queixaPrincipal);
}

/**
 * Helper para responder teste MMSE
 */
export async function answerMMSE(page: Page, answers: Record<number, number>) {
  for (const [questionId, score] of Object.entries(answers)) {
    const questionNumber = parseInt(questionId);

    // Localiza a questão
    const questionSelector = `[data-question-id="${questionNumber}"]`;
    await expect(page.locator(questionSelector)).toBeVisible();

    // Seleciona a pontuação
    if (score === 1) {
      await page.click(`${questionSelector} button:has-text("Correto")`);
    } else {
      await page.click(`${questionSelector} button:has-text("Incorreto")`);
    }

    // Avança para próxima questão (exceto na última)
    if (questionNumber < Object.keys(answers).length) {
      await page.click('button:has-text("Próxima")');
    }
  }

  // Finaliza o teste
  await page.click('button:has-text("Finalizar")');
}

/**
 * Helper para responder teste MoCA
 */
export async function answerMoCA(page: Page, answers: Record<number, number>) {
  for (const [questionId, score] of Object.entries(answers)) {
    const questionNumber = parseInt(questionId);

    // Localiza a questão
    const questionSelector = `[data-question-id="${questionNumber}"]`;
    await expect(page.locator(questionSelector)).toBeVisible();

    // Seleciona a pontuação baseada no tipo de questão
    const scoreButton = page.locator(`${questionSelector} button:has-text("${score}")`);
    await scoreButton.click();

    // Avança para próxima questão (exceto na última)
    if (questionNumber < Object.keys(answers).length) {
      await page.click('button:has-text("Próxima")');
    }
  }

  // Finaliza o teste
  await page.click('button:has-text("Finalizar")');
}

/**
 * Helper para verificar PDF gerado
 */
export async function verifyPDFDownload(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("Baixar PDF")'),
  ]);

  const filename = download.suggestedFilename();
  expect(filename).toMatch(/\.pdf$/);

  return download;
}

/**
 * Helper para esperar por sincronização
 */
export async function waitForSync(page: Page) {
  // Aguarda o indicador de sincronização desaparecer
  const syncIndicator = page.locator('[data-testid="sync-indicator"]');
  await expect(syncIndicator).toBeHidden({ timeout: 30000 });
}

/**
 * Helper para criar dado mockado no IndexedDB
 */
export async function mockIndexedDBData(page: Page, storeName: string, data: any) {
  await page.evaluate(
    ({ storeName, data }) => {
      const request = indexedDB.open('NeuroCareDB', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.add(data);
      };
    },
    { storeName, data }
  );
}

/**
 * Helper para contar itens no IndexedDB
 */
export async function countIndexedDBItems(page: Page, storeName: string): Promise<number> {
  return page.evaluate(
    (storeName) => {
      return new Promise<number>((resolve) => {
        const request = indexedDB.open('NeuroCareDB', 1);

        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const countRequest = store.count();

          countRequest.onsuccess = () => {
            resolve(countRequest.result);
          };
        };
      });
    },
    storeName
  );
}
