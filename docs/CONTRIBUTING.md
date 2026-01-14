# Guia de Contribuição

## Começando

1. Fork o repositório
2. Clone seu fork
3. Crie uma branch para sua feature

```bash
git checkout -b feature/minha-feature
```

## Padrões de Código

### Política Zero Warnings

O projeto não aceita warnings. Seu código deve passar em:

```bash
# Lint (zero warnings)
pnpm lint --max-warnings 0

# TypeScript check
pnpm typecheck

# Build
pnpm build:frontend
```

### TypeScript

- Modo `strict` habilitado
- Tipos explícitos obrigatórios
- Sem `any` (use `unknown` se necessário)

### ESLint

- Regras do projeto devem ser seguidas
- Não desabilite regras sem justificativa

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
refactor: refatora código
test: adiciona testes
chore: manutenção
```

### Exemplos

```bash
# Bom
feat: adiciona validação de CPF no cadastro de pacientes
fix: corrige cálculo de idade no formulário
docs: atualiza guia de instalação

# Ruim
update code
fix bug
WIP
```

## Pull Requests

### Antes de Abrir PR

1. Certifique-se que passa no lint
2. Certifique-se que passa no typecheck
3. Certifique-se que o build funciona
4. Adicione testes se aplicável

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Executei lint e typecheck
- [ ] Testei minhas mudanças
- [ ] Atualizei a documentação se necessário
```

## Estrutura do Projeto

```
Projeto-BFD/
├── apps/
│   ├── frontend/     # React + Vite
│   └── backend/      # NestJS (opcional)
├── packages/
│   ├── shared-types/ # Tipos compartilhados
│   └── shared-utils/ # Utilitários
├── docs/             # Documentação
└── .github/          # CI/CD
```

## Dúvidas

Abra uma issue com a tag `question`.
