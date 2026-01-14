import { test, expect } from '@playwright/test';
import { testPatient } from './fixtures/test-data';
import { login, fillPatientForm, expectSuccessToast, waitForAPI } from './fixtures/helpers';

test.describe('Gestão de Pacientes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('deve exibir lista de pacientes vazia', async ({ page }) => {
    await page.goto('/pacientes');

    // Verifica título
    await expect(page.locator('h1')).toContainText('Pacientes');

    // Verifica botão de novo paciente
    await expect(page.locator('button:has-text("Novo Paciente")')).toBeVisible();

    // Verifica mensagem de lista vazia
    await expect(page.locator('text=Nenhum paciente encontrado')).toBeVisible();
  });

  test('deve navegar para formulário de novo paciente', async ({ page }) => {
    await page.goto('/pacientes');

    // Clicar em novo paciente
    await page.click('button:has-text("Novo Paciente")');

    // Verifica URL
    await page.waitForURL('/pacientes/novo');
    await expect(page).toHaveURL('/pacientes/novo');

    // Verifica título do formulário
    await expect(page.locator('h1')).toContainText('Novo Paciente');
  });

  test('deve validar campos obrigatórios no cadastro de paciente', async ({ page }) => {
    await page.goto('/pacientes/novo');

    // Tentar submeter sem preencher
    await page.click('button[type="submit"]:has-text("Salvar")');

    // Verifica mensagens de validação
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible();
    await expect(page.locator('text=CPF é obrigatório')).toBeVisible();
    await expect(page.locator('text=Data de nascimento é obrigatória')).toBeVisible();
    await expect(page.locator('text=Gênero é obrigatório')).toBeVisible();
  });

  test('deve validar formato de CPF', async ({ page }) => {
    await page.goto('/pacientes/novo');

    // Preencher CPF inválido
    await page.fill('input[name="cpf"]', '111.111.111-11');
    await page.blur('input[name="cpf"]');

    // Verifica mensagem de validação
    await expect(page.locator('text=CPF inválido')).toBeVisible();
  });

  test('deve criar novo paciente com sucesso', async ({ page }) => {
    await page.goto('/pacientes/novo');

    // Preencher formulário
    await fillPatientForm(page, testPatient);

    // Aguardar resposta da API
    const responsePromise = waitForAPI(page, '/patients');

    // Submeter formulário
    await page.click('button[type="submit"]:has-text("Salvar")');

    await responsePromise;

    // Verifica mensagem de sucesso
    await expectSuccessToast(page, 'Paciente cadastrado com sucesso');

    // Verifica redirecionamento para lista
    await page.waitForURL('/pacientes');
    await expect(page).toHaveURL('/pacientes');

    // Verifica que paciente aparece na lista
    await expect(page.locator(`text=${testPatient.nome}`)).toBeVisible();
  });

  test('deve buscar paciente por nome', async ({ page }) => {
    // Criar paciente primeiro
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Buscar paciente
    await page.fill('input[placeholder*="Buscar"]', testPatient.nome);

    // Aguardar busca
    await page.waitForTimeout(500);

    // Verifica resultado
    await expect(page.locator(`text=${testPatient.nome}`)).toBeVisible();
  });

  test('deve buscar paciente por CPF', async ({ page }) => {
    // Criar paciente primeiro
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Buscar paciente por CPF
    await page.fill('input[placeholder*="Buscar"]', testPatient.cpf);

    // Aguardar busca
    await page.waitForTimeout(500);

    // Verifica resultado
    await expect(page.locator(`text=${testPatient.nome}`)).toBeVisible();
  });

  test('deve visualizar detalhes do paciente', async ({ page }) => {
    // Criar paciente primeiro
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Clicar para visualizar detalhes
    await page.click(`text=${testPatient.nome}`);

    // Verifica que está na página de detalhes
    await expect(page.locator('h1')).toContainText(testPatient.nome);

    // Verifica informações principais
    await expect(page.locator(`text=${testPatient.cpf}`)).toBeVisible();
    await expect(page.locator(`text=${testPatient.telefone}`)).toBeVisible();
    await expect(page.locator(`text=${testPatient.email}`)).toBeVisible();

    // Verifica abas de informações
    await expect(page.locator('button:has-text("Dados Pessoais")')).toBeVisible();
    await expect(page.locator('button:has-text("Histórico Médico")')).toBeVisible();
    await expect(page.locator('button:has-text("Avaliações")')).toBeVisible();
    await expect(page.locator('button:has-text("Exames")')).toBeVisible();
  });

  test('deve editar paciente', async ({ page }) => {
    // Criar paciente primeiro
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Clicar para visualizar detalhes
    await page.click(`text=${testPatient.nome}`);

    // Clicar em editar
    await page.click('button:has-text("Editar")');

    // Verifica que está no modo de edição
    await expect(page.locator('h1')).toContainText('Editar Paciente');

    // Modificar dados
    const novoTelefone = '(11) 99999-9999';
    await page.fill('input[name="telefone"]', novoTelefone);

    // Aguardar resposta da API
    const responsePromise = waitForAPI(page, '/patients');

    // Salvar alterações
    await page.click('button[type="submit"]:has-text("Salvar")');

    await responsePromise;

    // Verifica mensagem de sucesso
    await expectSuccessToast(page, 'Paciente atualizado com sucesso');

    // Verifica que mudança foi aplicada
    await expect(page.locator(`text=${novoTelefone}`)).toBeVisible();
  });

  test('deve excluir paciente', async ({ page }) => {
    // Criar paciente primeiro
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Clicar para visualizar detalhes
    await page.click(`text=${testPatient.nome}`);

    // Clicar em excluir
    await page.click('button:has-text("Excluir")');

    // Confirmar exclusão no modal
    await expect(page.locator('text=Confirmar exclusão')).toBeVisible();
    await page.click('button:has-text("Confirmar")');

    // Aguardar resposta da API
    await waitForAPI(page, '/patients');

    // Verifica mensagem de sucesso
    await expectSuccessToast(page, 'Paciente excluído com sucesso');

    // Verifica redirecionamento para lista
    await page.waitForURL('/pacientes');

    // Verifica que paciente não aparece mais na lista
    await expect(page.locator(`text=${testPatient.nome}`)).not.toBeVisible();
  });

  test('deve cancelar exclusão de paciente', async ({ page }) => {
    // Criar paciente primeiro
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Clicar para visualizar detalhes
    await page.click(`text=${testPatient.nome}`);

    // Clicar em excluir
    await page.click('button:has-text("Excluir")');

    // Cancelar exclusão no modal
    await expect(page.locator('text=Confirmar exclusão')).toBeVisible();
    await page.click('button:has-text("Cancelar")');

    // Verifica que modal fechou
    await expect(page.locator('text=Confirmar exclusão')).not.toBeVisible();

    // Verifica que ainda está na página do paciente
    await expect(page.locator('h1')).toContainText(testPatient.nome);
  });

  test('deve filtrar pacientes por gênero', async ({ page }) => {
    // Criar dois pacientes com gêneros diferentes
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, { ...testPatient, genero: 'FEMININO' });
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    await page.goto('/pacientes/novo');
    await fillPatientForm(page, {
      ...testPatient,
      nome: 'João da Silva',
      cpf: '987.654.321-00',
      genero: 'MASCULINO',
    });
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Filtrar por gênero feminino
    await page.selectOption('select[name="genero"]', 'FEMININO');

    // Aguardar filtro
    await page.waitForTimeout(500);

    // Verifica que apenas paciente feminino aparece
    await expect(page.locator('text=Maria da Silva Santos')).toBeVisible();
    await expect(page.locator('text=João da Silva')).not.toBeVisible();

    // Filtrar por gênero masculino
    await page.selectOption('select[name="genero"]', 'MASCULINO');

    // Aguardar filtro
    await page.waitForTimeout(500);

    // Verifica que apenas paciente masculino aparece
    await expect(page.locator('text=João da Silva')).toBeVisible();
    await expect(page.locator('text=Maria da Silva Santos')).not.toBeVisible();
  });

  test('deve ordenar pacientes por nome', async ({ page }) => {
    // Criar três pacientes
    const patients = [
      { ...testPatient, nome: 'Carlos Silva', cpf: '111.111.111-11' },
      { ...testPatient, nome: 'Ana Costa', cpf: '222.222.222-22' },
      { ...testPatient, nome: 'Bruno Santos', cpf: '333.333.333-33' },
    ];

    for (const patient of patients) {
      await page.goto('/pacientes/novo');
      await fillPatientForm(page, patient);
      await page.click('button[type="submit"]:has-text("Salvar")');
      await page.waitForURL('/pacientes');
    }

    // Aguardar carregamento
    await page.waitForTimeout(1000);

    // Verificar ordem alfabética
    const patientNames = await page.locator('[data-testid="patient-name"]').allTextContents();

    expect(patientNames).toEqual(['Ana Costa', 'Bruno Santos', 'Carlos Silva']);
  });

  test('deve exibir paginação para muitos pacientes', async ({ page }) => {
    // Criar 15 pacientes (mais que o limite por página)
    for (let i = 1; i <= 15; i++) {
      await page.goto('/pacientes/novo');
      await fillPatientForm(page, {
        ...testPatient,
        nome: `Paciente ${i}`,
        cpf: `${i.toString().padStart(3, '0')}.000.000-00`,
      });
      await page.click('button[type="submit"]:has-text("Salvar")');
      await page.waitForURL('/pacientes');
    }

    // Aguardar carregamento
    await page.waitForTimeout(1000);

    // Verifica que paginação aparece
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();

    // Verifica botão de próxima página
    await expect(page.locator('button:has-text("Próxima")')).toBeVisible();

    // Ir para próxima página
    await page.click('button:has-text("Próxima")');

    // Verifica que mudou de página
    await expect(page.locator('text=Página 2')).toBeVisible();
  });

  test('deve exportar lista de pacientes para CSV', async ({ page }) => {
    // Criar alguns pacientes primeiro
    await page.goto('/pacientes/novo');
    await fillPatientForm(page, testPatient);
    await page.click('button[type="submit"]:has-text("Salvar")');
    await page.waitForURL('/pacientes');

    // Clicar em exportar
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar CSV")'),
    ]);

    const filename = download.suggestedFilename();
    expect(filename).toMatch(/pacientes.*\.csv$/);
  });
});
