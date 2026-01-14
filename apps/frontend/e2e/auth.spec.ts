import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-data';
import { clearStorage, expectSuccessToast, expectErrorToast } from './fixtures/helpers';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('deve exibir página de login', async ({ page }) => {
    await page.goto('/login');

    // Verifica título
    await expect(page).toHaveTitle(/NeuroCare/);

    // Verifica elementos da página
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/registro"]')).toBeVisible();
  });

  test('deve validar campos obrigatórios no login', async ({ page }) => {
    await page.goto('/login');

    // Tentar submeter sem preencher
    await page.click('button[type="submit"]');

    // Verifica mensagens de validação
    await expect(page.locator('text=Email é obrigatório')).toBeVisible();
    await expect(page.locator('text=Senha é obrigatória')).toBeVisible();
  });

  test('deve validar formato de email', async ({ page }) => {
    await page.goto('/login');

    // Preencher email inválido
    await page.fill('input[name="email"]', 'emailinvalido');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // Verifica mensagem de validação
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  test('deve mostrar erro para credenciais inválidas', async ({ page }) => {
    await page.goto('/login');

    // Preencher com credenciais inválidas
    await page.fill('input[name="email"]', 'usuario@invalido.com');
    await page.fill('input[name="password"]', 'senhaerrada');

    // Aguardar resposta de erro da API
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 401
    );

    await page.click('button[type="submit"]');

    await responsePromise;

    // Verifica mensagem de erro
    await expectErrorToast(page, 'Credenciais inválidas');
  });

  test('deve realizar login com sucesso', async ({ page }) => {
    await page.goto('/login');

    // Preencher credenciais válidas
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    // Aguardar resposta de sucesso da API
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 200
    );

    await page.click('button[type="submit"]');

    await responsePromise;

    // Verifica redirecionamento para dashboard
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');

    // Verifica se usuário está logado
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('deve exibir página de registro', async ({ page }) => {
    await page.goto('/registro');

    // Verifica elementos da página
    await expect(page.locator('h1')).toContainText('Cadastro');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('input[name="crm"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve validar campos obrigatórios no registro', async ({ page }) => {
    await page.goto('/registro');

    // Tentar submeter sem preencher
    await page.click('button[type="submit"]');

    // Verifica mensagens de validação
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible();
    await expect(page.locator('text=Email é obrigatório')).toBeVisible();
    await expect(page.locator('text=Senha é obrigatória')).toBeVisible();
    await expect(page.locator('text=CRM é obrigatório')).toBeVisible();
  });

  test('deve validar confirmação de senha', async ({ page }) => {
    await page.goto('/registro');

    // Preencher senhas diferentes
    await page.fill('input[name="password"]', 'Senha@123');
    await page.fill('input[name="confirmPassword"]', 'Senha@456');
    await page.click('button[type="submit"]');

    // Verifica mensagem de validação
    await expect(page.locator('text=As senhas não coincidem')).toBeVisible();
  });

  test('deve validar força da senha', async ({ page }) => {
    await page.goto('/registro');

    // Preencher senha fraca
    await page.fill('input[name="password"]', '123');
    await page.blur('input[name="password"]');

    // Verifica mensagem de validação
    await expect(
      page.locator('text=A senha deve ter no mínimo 8 caracteres')
    ).toBeVisible();
  });

  test('deve realizar registro com sucesso', async ({ page }) => {
    await page.goto('/registro');

    const newUser = {
      name: 'Dr. Pedro Almeida',
      email: `pedro.almeida.${Date.now()}@neurocare.com.br`,
      password: 'SenhaForte@123',
      crm: '654321',
    };

    // Preencher formulário
    await page.fill('input[name="name"]', newUser.name);
    await page.fill('input[name="email"]', newUser.email);
    await page.fill('input[name="password"]', newUser.password);
    await page.fill('input[name="confirmPassword"]', newUser.password);
    await page.fill('input[name="crm"]', newUser.crm);

    // Aguardar resposta de sucesso da API
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/auth/register') && response.status() === 201
    );

    await page.click('button[type="submit"]');

    await responsePromise;

    // Verifica mensagem de sucesso
    await expectSuccessToast(page, 'Cadastro realizado com sucesso');

    // Verifica redirecionamento para login
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });

  test('deve realizar logout', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Realizar logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sair');

    // Verifica redirecionamento para login
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');

    // Verifica que não está mais autenticado
    const isAuthenticated = await page.evaluate(() => {
      return localStorage.getItem('accessToken') !== null;
    });

    expect(isAuthenticated).toBe(false);
  });

  test('deve manter sessão após recarregar página', async ({ page }) => {
    // Fazer login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Recarregar página
    await page.reload();

    // Verifica que ainda está autenticado
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('deve redirecionar para login ao acessar rota protegida sem autenticação', async ({
    page,
  }) => {
    await page.goto('/pacientes');

    // Deve redirecionar para login
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });

  test('deve atualizar token automaticamente quando expirar', async ({ page }) => {
    // Fazer login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Simular token expirado
    await page.evaluate(() => {
      const expiredToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.expired.token';
      sessionStorage.setItem('accessToken', expiredToken);
    });

    // Fazer requisição que deve disparar refresh
    await page.goto('/pacientes');

    // Aguardar chamada de refresh token
    const refreshResponse = page.waitForResponse(
      response => response.url().includes('/auth/refresh') && response.status() === 200
    );

    await refreshResponse;

    // Verifica que conseguiu acessar a página
    await expect(page).toHaveURL('/pacientes');
  });
});

test.describe('Autenticação 2FA', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);

    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('deve exibir opção para ativar 2FA nas configurações', async ({ page }) => {
    await page.goto('/configuracoes');

    // Verifica seção de 2FA
    await expect(page.locator('text=Autenticação de Dois Fatores')).toBeVisible();
    await expect(page.locator('button:has-text("Ativar 2FA")')).toBeVisible();
  });

  test('deve ativar 2FA e exibir QR Code', async ({ page }) => {
    await page.goto('/configuracoes');

    // Clicar em ativar 2FA
    await page.click('button:has-text("Ativar 2FA")');

    // Aguardar resposta da API
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/auth/2fa/enable') && response.status() === 200
    );

    await responsePromise;

    // Verifica que QR Code foi exibido
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
    await expect(page.locator('text=Escaneie o QR Code')).toBeVisible();

    // Verifica campo para código de verificação
    await expect(page.locator('input[name="verificationCode"]')).toBeVisible();
    await expect(page.locator('button:has-text("Verificar Código")')).toBeVisible();
  });

  test('deve validar código 2FA inválido', async ({ page }) => {
    await page.goto('/configuracoes');

    // Ativar 2FA
    await page.click('button:has-text("Ativar 2FA")');

    // Aguardar QR Code
    await page.waitForSelector('[data-testid="qr-code"]');

    // Inserir código inválido
    await page.fill('input[name="verificationCode"]', '000000');

    // Tentar verificar
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/auth/2fa/verify') && response.status() === 400
    );

    await page.click('button:has-text("Verificar Código")');

    await responsePromise;

    // Verifica mensagem de erro
    await expectErrorToast(page, 'Código inválido');
  });
});
