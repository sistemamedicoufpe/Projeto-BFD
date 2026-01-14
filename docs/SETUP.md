# Guia de Instalação e Configuração

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker e Docker Compose (opcional, para PostgreSQL)

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Projeto-BFD.git
cd Projeto-BFD

# Instale as dependências
pnpm install
```

## Configuração de Ambiente

### Frontend (apps/frontend/.env)

```env
# Provider de dados: firebase | postgresql | indexeddb
VITE_DATABASE_PROVIDER=firebase

# Firebase (quando VITE_DATABASE_PROVIDER=firebase)
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Chave de criptografia (mínimo 32 caracteres)
VITE_ENCRYPTION_KEY=sua-chave-de-criptografia-32chars

# API URL (quando VITE_DATABASE_PROVIDER=postgresql)
VITE_API_URL=http://localhost:3000
```

### Backend (apps/backend/.env)

```env
DATABASE_URL=postgresql://neurocare:neurocare123@localhost:5432/neurocare
JWT_SECRET=seu-jwt-secret
JWT_REFRESH_SECRET=seu-refresh-secret
ENCRYPTION_KEY=sua-chave-de-criptografia-32chars
```

## Executando o Projeto

### Modo Firebase (sem backend)

```bash
# Configure VITE_DATABASE_PROVIDER=firebase no .env
pnpm dev:frontend
```

### Modo PostgreSQL (com backend)

```bash
# Inicie os serviços Docker
docker-compose up -d

# Execute as migrações
cd apps/backend && pnpm prisma migrate dev

# Inicie frontend e backend
pnpm dev
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Inicia frontend e backend |
| `pnpm dev:frontend` | Inicia apenas o frontend |
| `pnpm dev:backend` | Inicia apenas o backend |
| `pnpm build` | Build de produção |
| `pnpm lint` | Verifica código com ESLint |
| `pnpm typecheck` | Verifica tipos TypeScript |
| `pnpm test` | Executa testes E2E |
