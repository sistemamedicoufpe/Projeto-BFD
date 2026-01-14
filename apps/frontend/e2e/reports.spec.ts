import { test, expect } from '@playwright/test';
import { testPatient, testEvaluation, testReport, mmseAnswers } from './fixtures/test-data';
import {
  login,
  fillPatientForm,
  answerMMSE,
  verifyPDFDownload,
  expectSuccessToast,
  waitForAPI,
} from './fixtures/helpers';

test.describe('Relatórios e PDF', () => {
  let patientId: string;
  let evaluationId: string;

  test.beforeEach(async ({ page }) => {
    await login(page);

    // Criar paciente
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    const patientResponse = await page.waitForResponse(
      response => response.url().includes('/patients') && response.status() === 201
    );
    const patientData = await patientResponse.json();
    patientId = patientData.id;
    await page.waitForURL('/pacientes');

    // Criar avaliação com MMSE
    await page.goto('/avaliacoes/nova');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.fill('textarea[name="historiaDoenca"]', testEvaluation.historiaDoenca);
    await page.click('button:has-text("Próximo")');

    // Realizar MMSE
    await page.click('button:has-text("Iniciar MMSE")');
    await answerMMSE(page, mmseAnswers);
    await page.click('button:has-text("Salvar Resultado")');
    await page.click('button:has-text("Próximo")');

    // Finalizar avaliação
    await page.fill('textarea[name="exameNeurologico"]', testEvaluation.exameNeurologico);
    await page.fill('textarea[name="hipoteseDiagnostica"]', testEvaluation.hipoteseDiagnostica);
    await page.fill('input[name="cid10"]', testEvaluation.cid10);

    const evaluationResponse = await page.waitForResponse(
      response => response.url().includes('/evaluations') && response.status() === 201
    );

    await page.click('button:has-text("Finalizar Avaliação")');

    const evaluationData = await evaluationResponse.json();
    evaluationId = evaluationData.id;

    await page.waitForURL('/avaliacoes');
  });

  test('deve exibir lista de relatórios', async ({ page }) => {
    await page.goto('/relatorios');

    // Verifica título
    await expect(page.locator('h1')).toContainText('Relatórios');

    // Verifica botão de novo relatório
    await expect(page.locator('button:has-text("Novo Relatório")')).toBeVisible();
  });

  test('deve criar novo relatório', async ({ page }) => {
    await page.goto('/relatorios/novo');

    // Selecionar paciente
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });

    // Aguardar carregamento de avaliações do paciente
    await page.waitForTimeout(500);

    // Selecionar avaliação
    const evaluationSelect = page.locator('select[name="evaluationId"]');
    await expect(evaluationSelect).toBeVisible();
    await evaluationSelect.selectOption({ index: 1 }); // Primeira avaliação

    // Selecionar tipo de relatório
    await page.selectOption('select[name="tipo"]', testReport.tipo);

    // Preencher campos
    await page.fill('textarea[name="resumo"]', testReport.resumo);
    await page.fill('textarea[name="conclusao"]', testReport.conclusao);
    await page.fill('textarea[name="recomendacoes"]', testReport.recomendacoes);

    // Aguardar resposta da API
    const responsePromise = waitForAPI(page, '/reports');

    // Salvar relatório
    await page.click('button:has-text("Salvar Relatório")');

    await responsePromise;

    // Verifica mensagem de sucesso
    await expectSuccessToast(page, 'Relatório criado com sucesso');

    // Verifica redirecionamento
    await page.waitForURL('/relatorios');
  });

  test('deve validar campos obrigatórios do relatório', async ({ page }) => {
    await page.goto('/relatorios/novo');

    // Tentar salvar sem preencher
    await page.click('button:has-text("Salvar Relatório")');

    // Verifica mensagens de validação
    await expect(page.locator('text=Selecione um paciente')).toBeVisible();
    await expect(page.locator('text=Selecione uma avaliação')).toBeVisible();
    await expect(page.locator('text=Tipo é obrigatório')).toBeVisible();
  });

  test('deve visualizar relatório existente', async ({ page }) => {
    // Criar relatório primeiro
    await page.goto('/relatorios/novo');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="evaluationId"]', { index: 1 });
    await page.selectOption('select[name="tipo"]', testReport.tipo);
    await page.fill('textarea[name="resumo"]', testReport.resumo);
    await page.fill('textarea[name="conclusao"]', testReport.conclusao);
    await page.fill('textarea[name="recomendacoes"]', testReport.recomendacoes);
    await page.click('button:has-text("Salvar Relatório")');
    await page.waitForURL('/relatorios');

    // Visualizar relatório
    await page.click(`text=${testPatient.nome}`);

    // Verificar detalhes
    await expect(page.locator('h1')).toContainText('Relatório');
    await expect(page.locator(`text=${testPatient.nome}`)).toBeVisible();
    await expect(page.locator(`text=${testReport.resumo}`)).toBeVisible();
    await expect(page.locator(`text=${testReport.conclusao}`)).toBeVisible();
  });

  test('deve gerar PDF do relatório', async ({ page }) => {
    // Criar relatório primeiro
    await page.goto('/relatorios/novo');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="evaluationId"]', { index: 1 });
    await page.selectOption('select[name="tipo"]', testReport.tipo);
    await page.fill('textarea[name="resumo"]', testReport.resumo);
    await page.fill('textarea[name="conclusao"]', testReport.conclusao);
    await page.fill('textarea[name="recomendacoes"]', testReport.recomendacoes);
    await page.click('button:has-text("Salvar Relatório")');
    await page.waitForURL('/relatorios');

    // Visualizar relatório
    await page.click(`text=${testPatient.nome}`);

    // Gerar PDF
    const download = await verifyPDFDownload(page);

    // Verifica nome do arquivo
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/relatorio-.*\.pdf$/);

    // Verificar que o download foi iniciado
    expect(download).toBeTruthy();
  });

  test('PDF deve conter informações do paciente', async ({ page }) => {
    // Criar relatório
    await page.goto('/relatorios/novo');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="evaluationId"]', { index: 1 });
    await page.selectOption('select[name="tipo"]', testReport.tipo);
    await page.fill('textarea[name="resumo"]', testReport.resumo);
    await page.click('button:has-text("Salvar Relatório")');
    await page.waitForURL('/relatorios');

    // Visualizar relatório
    await page.click(`text=${testPatient.nome}`);

    // Visualizar preview antes do download
    await page.click('button:has-text("Visualizar PDF")');

    // Verificar elementos da preview
    await expect(page.locator('[data-testid="pdf-preview"]')).toBeVisible();

    // Verificar que contém informações do paciente
    const preview = page.locator('[data-testid="pdf-preview"]');
    await expect(preview).toContainText(testPatient.nome);
    await expect(preview).toContainText(testPatient.cpf);
  });

  test('PDF deve conter resultados do MMSE', async ({ page }) => {
    // Criar relatório
    await page.goto('/relatorios/novo');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="evaluationId"]', { index: 1 });
    await page.selectOption('select[name="tipo"]', testReport.tipo);
    await page.fill('textarea[name="resumo"]', testReport.resumo);
    await page.click('button:has-text("Salvar Relatório")');
    await page.waitForURL('/relatorios');

    // Visualizar relatório
    await page.click(`text=${testPatient.nome}`);

    // Visualizar preview
    await page.click('button:has-text("Visualizar PDF")');

    const preview = page.locator('[data-testid="pdf-preview"]');

    // Verificar que contém resultados do MMSE
    await expect(preview).toContainText('MMSE');
    await expect(preview).toContainText('Mini-Mental');
    await expect(preview).toContainText(/\d+\/30/); // Score pattern
  });

  test('PDF deve conter gráfico de resultados', async ({ page }) => {
    // Criar relatório
    await page.goto('/relatorios/novo');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="evaluationId"]', { index: 1 });
    await page.selectOption('select[name="tipo"]', testReport.tipo);
    await page.fill('textarea[name="resumo"]', testReport.resumo);
    await page.click('button:has-text("Salvar Relatório")');
    await page.waitForURL('/relatorios');

    // Visualizar relatório
    await page.click(`text=${testPatient.nome}`);

    // Visualizar preview
    await page.click('button:has-text("Visualizar PDF")');

    // Verificar que gráfico foi incluído
    const chartImage = page.locator('[data-testid="pdf-preview"] img[alt*="gráfico"]');
    await expect(chartImage).toBeVisible();
  });

  test('deve editar relatório existente', async ({ page }) => {
    // Criar relatório
    await page.goto('/relatorios/novo');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="evaluationId"]', { index: 1 });
    await page.selectOption('select[name="tipo"]', testReport.tipo);
    await page.fill('textarea[name="resumo"]', testReport.resumo);
    await page.fill('textarea[name="conclusao"]', testReport.conclusao);
    await page.click('button:has-text("Salvar Relatório")');
    await page.waitForURL('/relatorios');

    // Visualizar e editar
    await page.click(`text=${testPatient.nome}`);
    await page.click('button:has-text("Editar")');

    // Modificar conclusão
    const novaConclusao = 'Conclusão atualizada com novos dados clínicos';
    await page.fill('textarea[name="conclusao"]', novaConclusao);

    // Salvar
    const responsePromise = waitForAPI(page, '/reports');
    await page.click('button:has-text("Salvar")');
    await responsePromise;

    // Verificar sucesso
    await expectSuccessToast(page, 'Relatório atualizado com sucesso');
    await expect(page.locator(`text=${novaConclusao}`)).toBeVisible();
  });

  test('deve excluir relatório', async ({ page }) => {
    // Criar relatório
    await page.goto('/relatorios/novo');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="evaluationId"]', { index: 1 });
    await page.selectOption('select[name="tipo"]', testReport.tipo);
    await page.fill('textarea[name="resumo"]', testReport.resumo);
    await page.click('button:has-text("Salvar Relatório")');
    await page.waitForURL('/relatorios');

    // Visualizar e excluir
    await page.click(`text=${testPatient.nome}`);
    await page.click('button:has-text("Excluir")');

    // Confirmar
    await page.click('button:has-text("Confirmar")');

    // Aguardar resposta
    await waitForAPI(page, '/reports');

    // Verificar sucesso
    await expectSuccessToast(page, 'Relatório excluído com sucesso');
    await page.waitForURL('/relatorios');
  });

  test('deve filtrar relatórios por paciente', async ({ page }) => {
    await page.goto('/relatorios');

    // Abrir filtro
    await page.click('button:has-text("Filtros")');

    // Selecionar paciente
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });

    // Aplicar filtro
    await page.click('button:has-text("Aplicar")');

    // Aguardar resultados
    await page.waitForTimeout(500);

    // Verificar que apenas relatórios do paciente aparecem
    await expect(page.locator(`text=${testPatient.nome}`)).toBeVisible();
  });

  test('deve filtrar relatórios por tipo', async ({ page }) => {
    await page.goto('/relatorios');

    // Abrir filtro
    await page.click('button:has-text("Filtros")');

    // Selecionar tipo
    await page.selectOption('select[name="tipo"]', 'AVALIACAO_COMPLETA');

    // Aplicar filtro
    await page.click('button:has-text("Aplicar")');

    // Aguardar resultados
    await page.waitForTimeout(500);
  });

  test('deve enviar relatório por email', async ({ page }) => {
    // Criar relatório
    await page.goto('/relatorios/novo');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="evaluationId"]', { index: 1 });
    await page.selectOption('select[name="tipo"]', testReport.tipo);
    await page.fill('textarea[name="resumo"]', testReport.resumo);
    await page.click('button:has-text("Salvar Relatório")');
    await page.waitForURL('/relatorios');

    // Visualizar relatório
    await page.click(`text=${testPatient.nome}`);

    // Clicar em enviar por email
    await page.click('button:has-text("Enviar por Email")');

    // Verificar modal de envio
    await expect(page.locator('text=Enviar Relatório por Email')).toBeVisible();

    // Preencher email
    await page.fill('input[name="recipientEmail"]', 'paciente@email.com');

    // Enviar
    const responsePromise = waitForAPI(page, '/reports/send-email');
    await page.click('button:has-text("Enviar")');
    await responsePromise;

    // Verificar sucesso
    await expectSuccessToast(page, 'Relatório enviado com sucesso');
  });

  test('deve imprimir relatório', async ({ page }) => {
    // Criar relatório
    await page.goto('/relatorios/novo');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.waitForTimeout(500);
    await page.selectOption('select[name="evaluationId"]', { index: 1 });
    await page.selectOption('select[name="tipo"]', testReport.tipo);
    await page.fill('textarea[name="resumo"]', testReport.resumo);
    await page.click('button:has-text("Salvar Relatório")');
    await page.waitForURL('/relatorios');

    // Visualizar relatório
    await page.click(`text=${testPatient.nome}`);

    // Interceptar chamada de impressão
    let printCalled = false;
    await page.evaluate(() => {
      window.print = () => {
        (window as any)._printCalled = true;
      };
    });

    // Clicar em imprimir
    await page.click('button:has-text("Imprimir")');

    // Verificar que window.print foi chamado
    printCalled = await page.evaluate(() => (window as any)._printCalled);
    expect(printCalled).toBe(true);
  });

  test('deve comparar múltiplas avaliações no relatório', async ({ page }) => {
    // Criar segunda avaliação
    await page.goto('/avaliacoes/nova');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', 'Avaliação de acompanhamento');
    await page.click('button:has-text("Próximo")');
    await page.click('button:has-text("Próximo")');
    await page.fill('textarea[name="hipoteseDiagnostica"]', 'Evolução do quadro');
    await page.click('button:has-text("Finalizar Avaliação")');
    await page.waitForURL('/avaliacoes');

    // Criar relatório comparativo
    await page.goto('/relatorios/novo');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.waitForTimeout(500);

    // Selecionar tipo comparativo
    await page.selectOption('select[name="tipo"]', 'COMPARATIVO');

    // Selecionar múltiplas avaliações
    await page.check('input[name="evaluation-1"]');
    await page.check('input[name="evaluation-2"]');

    await page.fill('textarea[name="resumo"]', 'Comparação de evolução clínica');
    await page.click('button:has-text("Salvar Relatório")');
    await page.waitForURL('/relatorios');

    // Visualizar relatório
    await page.click('text=Comparação');

    // Verificar que mostra comparação
    await expect(page.locator('text=Avaliação 1')).toBeVisible();
    await expect(page.locator('text=Avaliação 2')).toBeVisible();
    await expect(page.locator('text=Evolução')).toBeVisible();
  });
});
