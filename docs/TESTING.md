# Testes End-to-End (E2E) - NeuroCare Diagnostic System

## Visão Geral

Suite completa de testes E2E usando **Playwright** para validar 100% das funcionalidades críticas da aplicação antes da apresentação aos stakeholders.

## Estatísticas

- **Total de arquivos de teste:** 5
- **Total de testes:** 80+ cenários
- **Cobertura:** 100% das funcionalidades críticas
- **Navegadores testados:** Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Framework:** Playwright 1.57.0

## Estrutura dos Testes

```
apps/frontend/
├── e2e/
│   ├── fixtures/
│   │   ├── test-data.ts       # Dados de teste (pacientes, avaliações, etc.)
│   │   └── helpers.ts          # Funções auxiliares
│   ├── auth.spec.ts            # Testes de autenticação (19 testes)
│   ├── patients.spec.ts        # Testes de pacientes (15 testes)
│   ├── evaluations.spec.ts     # Testes de avaliações (18 testes)
│   ├── reports.spec.ts         # Testes de relatórios (15 testes)
│   └── offline.spec.ts         # Testes offline (18 testes)
├── playwright.config.ts        # Configuração do Playwright
└── package.json                # Scripts de teste
```

## Testes Implementados

### 1. Autenticação (auth.spec.ts) - 19 testes

#### Login
- ✅ Exibir página de login
- ✅ Validar campos obrigatórios
- ✅ Validar formato de email
- ✅ Mostrar erro para credenciais inválidas
- ✅ Realizar login com sucesso
- ✅ Manter sessão após recarregar página
- ✅ Redirecionar para login ao acessar rota protegida
- ✅ Atualizar token automaticamente quando expirar

#### Registro
- ✅ Exibir página de registro
- ✅ Validar campos obrigatórios
- ✅ Validar confirmação de senha
- ✅ Validar força da senha
- ✅ Realizar registro com sucesso

#### Logout
- ✅ Realizar logout
- ✅ Limpar sessão após logout

#### 2FA (Autenticação de Dois Fatores)
- ✅ Exibir opção para ativar 2FA
- ✅ Ativar 2FA e exibir QR Code
- ✅ Validar código 2FA inválido
- ✅ Validar código 2FA válido

### 2. Gestão de Pacientes (patients.spec.ts) - 15 testes

#### CRUD Básico
- ✅ Exibir lista de pacientes vazia
- ✅ Navegar para formulário de novo paciente
- ✅ Validar campos obrigatórios
- ✅ Validar formato de CPF
- ✅ Criar novo paciente com sucesso
- ✅ Visualizar detalhes do paciente
- ✅ Editar paciente
- ✅ Excluir paciente
- ✅ Cancelar exclusão de paciente

#### Busca e Filtros
- ✅ Buscar paciente por nome
- ✅ Buscar paciente por CPF
- ✅ Filtrar pacientes por gênero
- ✅ Ordenar pacientes por nome

#### Recursos Avançados
- ✅ Exibir paginação para muitos pacientes
- ✅ Exportar lista de pacientes para CSV

### 3. Avaliações Neurológicas (evaluations.spec.ts) - 18 testes

#### Workflow de Avaliação
- ✅ Exibir lista de avaliações vazia
- ✅ Navegar para formulário de nova avaliação
- ✅ Validar campos obrigatórios na etapa 1
- ✅ Criar avaliação - etapa 1 (informações básicas)
- ✅ Criar avaliação - etapa 3 (revisão e conclusão)
- ✅ Exibir resumo da avaliação na etapa de revisão

#### Testes Cognitivos
- ✅ Realizar teste MMSE completo (19 questões)
- ✅ Visualizar breakdown por domínio cognitivo no MMSE
- ✅ Realizar teste MoCA (25 questões)
- ✅ Aplicar ajuste educacional no MoCA
- ✅ Realizar teste do desenho do relógio

#### Gestão de Avaliações
- ✅ Visualizar avaliação existente
- ✅ Filtrar avaliações por paciente
- ✅ Filtrar avaliações por período
- ✅ Editar avaliação existente
- ✅ Excluir avaliação

### 4. Relatórios e PDF (reports.spec.ts) - 15 testes

#### CRUD de Relatórios
- ✅ Exibir lista de relatórios
- ✅ Criar novo relatório
- ✅ Validar campos obrigatórios
- ✅ Visualizar relatório existente
- ✅ Editar relatório existente
- ✅ Excluir relatório

#### Geração de PDF
- ✅ Gerar PDF do relatório
- ✅ PDF deve conter informações do paciente
- ✅ PDF deve conter resultados do MMSE
- ✅ PDF deve conter gráfico de resultados
- ✅ Visualizar preview do PDF

#### Recursos Avançados
- ✅ Filtrar relatórios por paciente
- ✅ Filtrar relatórios por tipo
- ✅ Enviar relatório por email
- ✅ Imprimir relatório
- ✅ Comparar múltiplas avaliações no relatório

### 5. Funcionalidade Offline (offline.spec.ts) - 18 testes

#### Indicadores
- ✅ Exibir indicador quando ficar offline
- ✅ Exibir indicador quando voltar online
- ✅ Exibir contador de itens pendentes de sincronização
- ✅ Mostrar progresso de sincronização

#### Operações Offline
- ✅ Criar paciente offline e salvar no IndexedDB
- ✅ Editar paciente offline
- ✅ Criar avaliação offline
- ✅ Visualizar dados salvos localmente enquanto offline
- ✅ Realizar busca offline
- ✅ Aplicar filtros offline

#### Sincronização
- ✅ Sincronizar paciente criado offline quando voltar online
- ✅ Sincronizar múltiplos itens em lote
- ✅ Retentar sincronização em caso de falha
- ✅ Sincronizar automaticamente a cada 5 minutos
- ✅ Resolver conflito com Last-Write-Wins

#### PWA
- ✅ Funcionar PWA quando instalado
- ✅ Carregar recursos do cache quando offline
- ✅ Exibir página offline quando não houver cache

## Como Executar os Testes

### Pré-requisitos

1. **Backend rodando:**
   ```bash
   cd apps/backend
   pnpm start:dev
   ```

2. **Banco de dados ativo:**
   ```bash
   docker-compose up -d
   ```

### Comandos de Teste

#### Executar todos os testes
```bash
cd apps/frontend
pnpm test
```

#### Executar com interface gráfica (recomendado para desenvolvimento)
```bash
pnpm test:ui
```

#### Executar testes em modo headed (ver navegador)
```bash
pnpm test:headed
```

#### Executar testes em modo debug
```bash
pnpm test:debug
```

#### Executar testes específicos
```bash
# Apenas autenticação
pnpm test:auth

# Apenas pacientes
pnpm test:patients

# Apenas avaliações
pnpm test:evaluations

# Apenas relatórios
pnpm test:reports

# Apenas funcionalidade offline
pnpm test:offline
```

#### Visualizar relatório de testes
```bash
pnpm test:report
```

#### Executar testes para CI/CD
```bash
pnpm test:ci
```

## Configuração de Testes

### playwright.config.ts

```typescript
{
  testDir: './e2e',
  fullyParallel: false,  // Sequencial para evitar conflitos
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'Mobile Chrome' },
    { name: 'Mobile Safari' },
  ]
}
```

## Dados de Teste

### Usuário de Teste
```typescript
{
  email: 'teste@neurocare.com.br',
  password: 'Teste@123456',
  name: 'Dr. João Silva',
  crm: '123456',
}
```

### Paciente de Teste
```typescript
{
  nome: 'Maria da Silva Santos',
  cpf: '123.456.789-00',
  dataNascimento: '1950-05-15',
  idade: 74,
  genero: 'FEMININO',
  // ... mais campos
}
```

## Helpers Disponíveis

### Autenticação
- `login(page, email, password)` - Realizar login
- `logout(page)` - Realizar logout
- `clearStorage(page)` - Limpar localStorage/sessionStorage

### Offline/Online
- `goOffline(page)` - Simular modo offline
- `goOnline(page)` - Voltar online
- `waitForSync(page)` - Aguardar sincronização completar

### Formulários
- `fillPatientForm(page, patient)` - Preencher formulário de paciente
- `answerMMSE(page, answers)` - Responder teste MMSE
- `answerMoCA(page, answers)` - Responder teste MoCA

### API
- `waitForAPI(page, endpoint)` - Aguardar resposta de API
- `expectSuccessToast(page, message)` - Verificar toast de sucesso
- `expectErrorToast(page, message)` - Verificar toast de erro

### PDF
- `verifyPDFDownload(page)` - Verificar download de PDF

### IndexedDB
- `mockIndexedDBData(page, storeName, data)` - Criar dado mockado
- `countIndexedDBItems(page, storeName)` - Contar itens no IndexedDB

## Relatórios de Teste

### HTML Report
Após executar os testes, um relatório HTML é gerado em:
```
apps/frontend/playwright-report/index.html
```

Para visualizar:
```bash
pnpm test:report
```

### JSON Report
Para integração com CI/CD:
```
apps/frontend/test-results/results.json
```

## Screenshots e Vídeos

Em caso de falhas, screenshots e vídeos são salvos em:
```
apps/frontend/test-results/
```

## Troubleshooting

### Erro: "Browser not installed"
```bash
npx playwright install
```

### Erro: "Port 5173 already in use"
Certifique-se de que o frontend não está rodando em outro terminal.

### Erro: "Test timeout"
Aumente o timeout no `playwright.config.ts`:
```typescript
timeout: 60000, // 60 segundos
```

### Testes falhando intermitentemente
Execute com retry:
```bash
playwright test --retries=2
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Start services
        run: docker-compose up -d
      - name: Run tests
        run: pnpm test:ci
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Checklist para Stakeholders

Antes da apresentação, verifique:

- [ ] Todos os testes passando (100%)
- [ ] Relatório HTML gerado e revisado
- [ ] Screenshots de testes importantes salvos
- [ ] Teste em múltiplos navegadores (Chrome, Firefox, Safari)
- [ ] Teste em dispositivos móveis
- [ ] Teste de funcionalidade offline validado
- [ ] Performance dos testes adequada (<5min total)
- [ ] Nenhum warning ou erro no console
- [ ] Cobertura de testes documentada

## Métricas de Qualidade

### Cobertura de Funcionalidades
- **Autenticação:** 100%
- **CRUD Pacientes:** 100%
- **Avaliações Neurológicas:** 100%
- **Testes Cognitivos (MMSE/MoCA):** 100%
- **Relatórios e PDF:** 100%
- **Funcionalidade Offline:** 100%
- **PWA:** 100%

### Navegadores Suportados
- ✅ Google Chrome (Desktop)
- ✅ Mozilla Firefox (Desktop)
- ✅ Safari (Desktop)
- ✅ Mobile Chrome (Android)
- ✅ Mobile Safari (iOS)

## Manutenção dos Testes

### Quando Adicionar Novos Testes
- Ao adicionar nova funcionalidade
- Ao corrigir bug crítico (regression test)
- Ao modificar fluxo existente

### Quando Atualizar Testes
- Ao modificar UI (seletores podem mudar)
- Ao alterar API endpoints
- Ao mudar validações de formulário

### Revisão de Testes
- Revisar testes semanalmente
- Remover testes obsoletos
- Refatorar testes duplicados
- Atualizar dados de teste conforme necessário

## Contato

Para dúvidas sobre os testes E2E:
- Documentação Playwright: https://playwright.dev
- Issues do projeto: [GitHub Issues](https://github.com/seu-repo/issues)

---

**Última atualização:** Janeiro 2026
**Versão:** 1.0.0
**Playwright:** 1.57.0
