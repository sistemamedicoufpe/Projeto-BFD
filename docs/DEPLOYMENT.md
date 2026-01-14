# Guia de Deploy

## Deploy no GitHub Pages

O projeto usa GitHub Actions para deploy automático no GitHub Pages.

### Pré-requisitos

1. Repositório público ou GitHub Pro
2. Firebase configurado (ver [FIREBASE.md](./FIREBASE.md))
3. GitHub Secrets configurados

### Configurar GitHub Secrets

1. No repositório, vá em Settings > Secrets and variables > Actions
2. Adicione os seguintes secrets:

| Secret | Valor |
|--------|-------|
| `FIREBASE_API_KEY` | Sua API Key |
| `FIREBASE_AUTH_DOMAIN` | seu-projeto.firebaseapp.com |
| `FIREBASE_PROJECT_ID` | seu-projeto |
| `FIREBASE_STORAGE_BUCKET` | seu-projeto.appspot.com |
| `FIREBASE_MESSAGING_SENDER_ID` | 123456789 |
| `FIREBASE_APP_ID` | 1:123456789:web:abc123 |
| `ENCRYPTION_KEY` | sua-chave-32-caracteres |

### Habilitar GitHub Pages

1. Vá em Settings > Pages
2. Em "Source", selecione "GitHub Actions"

### Deploy Automático

O deploy acontece automaticamente quando:
- Push para branch `main`
- Workflow manual via "Actions" > "CI/CD Pipeline" > "Run workflow"

### Pipeline CI/CD

```
Install → Lint → TypeCheck → Test → Build → Deploy
```

| Etapa | Descrição |
|-------|-----------|
| Install | Instala dependências (pnpm) |
| Lint | Verifica código (ESLint, zero warnings) |
| TypeCheck | Verifica tipos (TypeScript strict) |
| Test | Testes E2E (Playwright) |
| Build | Build de produção (Vite) |
| Deploy | Publica no GitHub Pages |

### Deploy Manual

```bash
# Build local
VITE_DATABASE_PROVIDER=firebase pnpm build:frontend

# O output fica em apps/frontend/dist/
```

## Deploy em Outras Plataformas

### Vercel

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
cd apps/frontend
vercel
```

### Netlify

1. Conecte o repositório no Netlify
2. Configure:
   - Build command: `pnpm build:frontend`
   - Publish directory: `apps/frontend/dist`
3. Adicione variáveis de ambiente

### Docker

```bash
# Build da imagem
docker build -t neurocare-frontend -f apps/frontend/Dockerfile .

# Executar
docker run -p 80:80 neurocare-frontend
```
