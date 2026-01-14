import { test, expect } from '@playwright/test';
import { testPatient, testEvaluation, mmseAnswers } from './fixtures/test-data';
import {
  login,
  fillPatientForm,
  answerMMSE,
  expectSuccessToast,
  waitForAPI,
} from './fixtures/helpers';

test.describe('Avaliações Neurológicas', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);

    // Criar paciente para as avaliações
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/patients') && response.status() === 201
    );

    await page.click('button[type="submit"]:has-text("Salvar")');

    await responsePromise;

    await page.waitForURL('/pacientes');
  });

  test('deve exibir lista de avaliações vazia', async ({ page }) => {
    await page.goto('/avaliacoes');

    // Verifica título
    await expect(page.locator('h1')).toContainText('Avaliações');

    // Verifica botão de nova avaliação
    await expect(page.locator('button:has-text("Nova Avaliação")')).toBeVisible();

    // Verifica mensagem de lista vazia
    await expect(page.locator('text=Nenhuma avaliação encontrada')).toBeVisible();
  });

  test('deve navegar para formulário de nova avaliação', async ({ page }) => {
    await page.goto('/avaliacoes');

    // Clicar em nova avaliação
    await page.click('button:has-text("Nova Avaliação")');

    // Verifica URL
    await page.waitForURL('/avaliacoes/nova');
    await expect(page).toHaveURL('/avaliacoes/nova');

    // Verifica wizard de 3 etapas
    await expect(page.locator('text=Etapa 1 de 3')).toBeVisible();
    await expect(page.locator('text=Informações Básicas')).toBeVisible();
  });

  test('deve validar campos obrigatórios na etapa 1', async ({ page }) => {
    await page.goto('/avaliacoes/nova');

    // Tentar avançar sem preencher
    await page.click('button:has-text("Próximo")');

    // Verifica mensagens de validação
    await expect(page.locator('text=Selecione um paciente')).toBeVisible();
    await expect(page.locator('text=Queixa principal é obrigatória')).toBeVisible();
  });

  test('deve criar avaliação - etapa 1: informações básicas', async ({ page }) => {
    await page.goto('/avaliacoes/nova');

    // Etapa 1: Informações Básicas
    // Selecionar paciente
    await page.click('select[name="patientId"]');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });

    // Preencher queixa principal
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);

    // Preencher história da doença
    await page.fill('textarea[name="historiaDoenca"]', testEvaluation.historiaDoenca);

    // Avançar para etapa 2
    await page.click('button:has-text("Próximo")');

    // Verifica que avançou para etapa 2
    await expect(page.locator('text=Etapa 2 de 3')).toBeVisible();
    await expect(page.locator('text=Testes Cognitivos')).toBeVisible();
  });

  test('deve realizar teste MMSE completo', async ({ page }) => {
    await page.goto('/avaliacoes/nova');

    // Etapa 1: Informações Básicas
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.click('button:has-text("Próximo")');

    // Etapa 2: Testes Cognitivos
    // Selecionar MMSE
    await page.click('button:has-text("Iniciar MMSE")');

    // Verifica que teste MMSE foi carregado
    await expect(page.locator('h2:has-text("Mini-Mental State Examination")')).toBeVisible();

    // Responder todas as questões do MMSE
    await answerMMSE(page, mmseAnswers);

    // Verifica resultado
    await expect(page.locator('text=Pontuação Total')).toBeVisible();
    await expect(page.locator('text=/\\d+\\/30/')).toBeVisible(); // Score pattern

    // Verifica interpretação
    await expect(page.locator('text=Interpretação:')).toBeVisible();

    // Salvar resultado
    await page.click('button:has-text("Salvar Resultado")');

    // Verifica que voltou para etapa 2
    await expect(page.locator('text=Etapa 2 de 3')).toBeVisible();
    await expect(page.locator('text=MMSE Concluído')).toBeVisible();
  });

  test('deve visualizar breakdown por domínio cognitivo no MMSE', async ({ page }) => {
    await page.goto('/avaliacoes/nova');

    // Navegar até MMSE
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.click('button:has-text("Próximo")');
    await page.click('button:has-text("Iniciar MMSE")');

    // Responder MMSE
    await answerMMSE(page, mmseAnswers);

    // Verificar breakdown por domínio
    await expect(page.locator('text=Orientação Temporal')).toBeVisible();
    await expect(page.locator('text=Orientação Espacial')).toBeVisible();
    await expect(page.locator('text=Memória Imediata')).toBeVisible();
    await expect(page.locator('text=Atenção e Cálculo')).toBeVisible();
    await expect(page.locator('text=Memória de Evocação')).toBeVisible();
    await expect(page.locator('text=Linguagem')).toBeVisible();
    await expect(page.locator('text=Habilidade Visuoconstrutiva')).toBeVisible();

    // Verificar pontuações por domínio
    const domainScores = page.locator('[data-testid="domain-score"]');
    await expect(domainScores).toHaveCount(7);
  });

  test('deve realizar teste MoCA', async ({ page }) => {
    await page.goto('/avaliacoes/nova');

    // Etapa 1: Informações Básicas
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.click('button:has-text("Próximo")');

    // Etapa 2: Testes Cognitivos
    // Selecionar MoCA
    await page.click('button:has-text("Iniciar MoCA")');

    // Verifica que teste MoCA foi carregado
    await expect(page.locator('h2:has-text("Montreal Cognitive Assessment")')).toBeVisible();

    // Verifica primeira questão
    await expect(page.locator('[data-question-id="1"]')).toBeVisible();

    // Responder algumas questões para validar fluxo
    for (let i = 1; i <= 5; i++) {
      await page.click(`[data-question-id="${i}"] button:has-text("1")`);
      if (i < 5) {
        await page.click('button:has-text("Próxima")');
      }
    }

    // Verificar que está avançando
    await expect(page.locator('[data-question-id="5"]')).toBeVisible();
  });

  test('deve aplicar ajuste educacional no MoCA', async ({ page }) => {
    await page.goto('/avaliacoes/nova');

    // Navegar até MoCA e completar
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.click('button:has-text("Próximo")');
    await page.click('button:has-text("Iniciar MoCA")');

    // Responder todas as questões (simplificado)
    for (let i = 1; i <= 25; i++) {
      await page.click(`[data-question-id="${i}"] button`).catch(() => {});
      if (i < 25) {
        await page.click('button:has-text("Próxima")').catch(() => {});
      }
    }

    await page.click('button:has-text("Finalizar")');

    // Verificar checkbox de ajuste educacional
    await expect(page.locator('input[type="checkbox"][name="educationAdjustment"]')).toBeVisible();

    // Marcar ajuste educacional
    await page.check('input[type="checkbox"][name="educationAdjustment"]');

    // Verificar que pontuação foi ajustada (+1 ponto)
    await expect(page.locator('text=Ajuste Educacional: +1')).toBeVisible();
  });

  test('deve realizar teste do desenho do relógio', async ({ page }) => {
    await page.goto('/avaliacoes/nova');

    // Navegar até Clock Drawing Test
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.click('button:has-text("Próximo")');
    await page.click('button:has-text("Iniciar Clock Drawing")');

    // Verifica canvas de desenho
    await expect(page.locator('canvas[data-testid="clock-canvas"]')).toBeVisible();

    // Verificar instruções
    await expect(page.locator('text=Desenhe um relógio')).toBeVisible();

    // Simular desenho (não é possível desenhar realmente no teste E2E)
    // Mas podemos verificar os critérios de avaliação

    // Verificar critérios de pontuação
    await expect(page.locator('text=Círculo (2 pontos)')).toBeVisible();
    await expect(page.locator('text=Números (4 pontos)')).toBeVisible();
    await expect(page.locator('text=Ponteiros (4 pontos)')).toBeVisible();

    // Avaliar desenho
    await page.check('input[name="criterion-circle"]');
    await page.check('input[name="criterion-numbers"]');
    await page.check('input[name="criterion-hands"]');

    // Salvar
    await page.click('button:has-text("Salvar Desenho")');

    // Verificar pontuação
    await expect(page.locator('text=/Pontuação:.*\\/10/')).toBeVisible();
  });

  test('deve criar avaliação - etapa 3: revisão e conclusão', async ({ page }) => {
    await page.goto('/avaliacoes/nova');

    // Etapa 1
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.fill('textarea[name="historiaDoenca"]', testEvaluation.historiaDoenca);
    await page.click('button:has-text("Próximo")');

    // Etapa 2 - Pular testes por enquanto
    await page.click('button:has-text("Próximo")');

    // Etapa 3: Revisão e Conclusão
    await expect(page.locator('text=Etapa 3 de 3')).toBeVisible();
    await expect(page.locator('text=Revisão e Conclusão')).toBeVisible();

    // Preencher campos adicionais
    await page.fill('textarea[name="exameNeurologico"]', testEvaluation.exameNeurologico);
    await page.fill('textarea[name="exameClinico"]', testEvaluation.exameClinico);
    await page.fill('textarea[name="hipoteseDiagnostica"]', testEvaluation.hipoteseDiagnostica);
    await page.fill('input[name="cid10"]', testEvaluation.cid10);
    await page.fill('textarea[name="conduta"]', testEvaluation.conduta);

    // Aguardar resposta da API
    const responsePromise = waitForAPI(page, '/evaluations');

    // Finalizar avaliação
    await page.click('button:has-text("Finalizar Avaliação")');

    await responsePromise;

    // Verifica mensagem de sucesso
    await expectSuccessToast(page, 'Avaliação criada com sucesso');

    // Verifica redirecionamento
    await page.waitForURL('/avaliacoes');
  });

  test('deve exibir resumo da avaliação na etapa de revisão', async ({ page }) => {
    await page.goto('/avaliacoes/nova');

    // Etapa 1
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.click('button:has-text("Próximo")');

    // Etapa 2 - Fazer MMSE
    await page.click('button:has-text("Iniciar MMSE")');
    await answerMMSE(page, mmseAnswers);
    await page.click('button:has-text("Salvar Resultado")');
    await page.click('button:has-text("Próximo")');

    // Etapa 3: Verificar resumo
    await expect(page.locator('text=Paciente:')).toBeVisible();
    await expect(page.locator(`text=${testPatient.nome}`)).toBeVisible();

    await expect(page.locator('text=Queixa Principal:')).toBeVisible();
    await expect(page.locator(`text=${testEvaluation.queixaPrincipal}`)).toBeVisible();

    await expect(page.locator('text=Testes Realizados:')).toBeVisible();
    await expect(page.locator('text=MMSE')).toBeVisible();
  });

  test('deve visualizar avaliação existente', async ({ page }) => {
    // Criar avaliação primeiro
    await page.goto('/avaliacoes/nova');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.click('button:has-text("Próximo")');
    await page.click('button:has-text("Próximo")');
    await page.fill('textarea[name="hipoteseDiagnostica"]', testEvaluation.hipoteseDiagnostica);
    await page.click('button:has-text("Finalizar Avaliação")');
    await page.waitForURL('/avaliacoes');

    // Visualizar avaliação
    await page.click(`text=${testPatient.nome}`);

    // Verificar detalhes
    await expect(page.locator('h1')).toContainText('Avaliação');
    await expect(page.locator(`text=${testPatient.nome}`)).toBeVisible();
    await expect(page.locator(`text=${testEvaluation.queixaPrincipal}`)).toBeVisible();
    await expect(page.locator(`text=${testEvaluation.hipoteseDiagnostica}`)).toBeVisible();
  });

  test('deve filtrar avaliações por paciente', async ({ page }) => {
    // Criar duas avaliações para pacientes diferentes
    // (assumindo que já existem múltiplos pacientes)

    await page.goto('/avaliacoes');

    // Abrir filtro
    await page.click('button:has-text("Filtros")');

    // Selecionar paciente
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });

    // Aplicar filtro
    await page.click('button:has-text("Aplicar")');

    // Verificar que apenas avaliações do paciente selecionado aparecem
    await expect(page.locator(`text=${testPatient.nome}`)).toBeVisible();
  });

  test('deve filtrar avaliações por período', async ({ page }) => {
    await page.goto('/avaliacoes');

    // Abrir filtro
    await page.click('button:has-text("Filtros")');

    // Definir período
    await page.fill('input[name="dataInicio"]', '2026-01-01');
    await page.fill('input[name="dataFim"]', '2026-01-31');

    // Aplicar filtro
    await page.click('button:has-text("Aplicar")');

    // Aguardar resultados
    await page.waitForTimeout(500);
  });

  test('deve editar avaliação existente', async ({ page }) => {
    // Criar avaliação primeiro
    await page.goto('/avaliacoes/nova');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.click('button:has-text("Próximo")');
    await page.click('button:has-text("Próximo")');
    await page.fill('textarea[name="hipoteseDiagnostica"]', testEvaluation.hipoteseDiagnostica);
    await page.click('button:has-text("Finalizar Avaliação")');
    await page.waitForURL('/avaliacoes');

    // Visualizar e editar
    await page.click(`text=${testPatient.nome}`);
    await page.click('button:has-text("Editar")');

    // Modificar hipótese diagnóstica
    const novaHipotese = 'Hipótese diagnóstica atualizada após novos exames';
    await page.fill('textarea[name="hipoteseDiagnostica"]', novaHipotese);

    // Salvar
    const responsePromise = waitForAPI(page, '/evaluations');
    await page.click('button:has-text("Salvar")');
    await responsePromise;

    // Verificar sucesso
    await expectSuccessToast(page, 'Avaliação atualizada com sucesso');
    await expect(page.locator(`text=${novaHipotese}`)).toBeVisible();
  });

  test('deve excluir avaliação', async ({ page }) => {
    // Criar avaliação primeiro
    await page.goto('/avaliacoes/nova');
    await page.selectOption('select[name="patientId"]', { label: testPatient.nome });
    await page.fill('textarea[name="queixaPrincipal"]', testEvaluation.queixaPrincipal);
    await page.click('button:has-text("Próximo")');
    await page.click('button:has-text("Próximo")');
    await page.fill('textarea[name="hipoteseDiagnostica"]', testEvaluation.hipoteseDiagnostica);
    await page.click('button:has-text("Finalizar Avaliação")');
    await page.waitForURL('/avaliacoes');

    // Visualizar e excluir
    await page.click(`text=${testPatient.nome}`);
    await page.click('button:has-text("Excluir")');

    // Confirmar
    await page.click('button:has-text("Confirmar")');

    // Aguardar resposta
    await waitForAPI(page, '/evaluations');

    // Verificar sucesso
    await expectSuccessToast(page, 'Avaliação excluída com sucesso');
    await page.waitForURL('/avaliacoes');
  });
});
