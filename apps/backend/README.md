# NeuroCare Diagnostic - Backend API

Backend Node.js com NestJS para o sistema de avaliação neurológica e diagnóstico de demências.

## 🚀 Status da Implementação

✅ **Fase 1 - Monorepo** (100%)
✅ **Fase 2 - Backend** (100%)

**Módulos Implementados:**
- ✅ Prisma Service + Schema completo
- ✅ Encryption Service (AES-256)
- ✅ Auth Module (JWT + 2FA)
- ✅ Patients Module (CRUD completo)
- ✅ Evaluations Module (CRUD completo)
- ✅ Exams Module (CRUD completo)
- ✅ Reports Module (CRUD completo)
- ✅ Main.ts configurado (CORS, Swagger, validação)

## 🏗️ Tecnologias

- **Framework**: NestJS 11
- **ORM**: Prisma 5.22
- **Database**: PostgreSQL 15
- **Autenticação**: JWT (RS256) + 2FA (TOTP com speakeasy)
- **Criptografia**: AES-256 (CryptoJS)
- **Storage**: AWS SDK (MinIO/S3)
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI
- **Rate Limiting**: @nestjs/throttler
- **Segurança**: Helmet + CORS

## 📋 Pré-requisitos

- Node.js 18+ (recomendado 22+)
- pnpm 8+
- Docker Desktop (para PostgreSQL e MinIO)

## 🚀 Quick Start

### 1. Instalar dependências

```bash
# Na raiz do monorepo
cd neurocare-system
pnpm install
```

### 2. Iniciar Docker Compose

```bash
# Inicia PostgreSQL, MinIO e Redis
docker-compose up -d

# Verificar status
docker-compose ps
```

### 3. Configurar banco de dados

```bash
cd apps/backend

# Aplicar migrations
npx prisma migrate dev

# Gerar Prisma Client (já foi feito)
npx prisma generate

# Seed inicial (opcional)
npx prisma db seed
```

### 4. Iniciar servidor

```bash
# Modo desenvolvimento com hot-reload
pnpm start:dev
```

**URLs disponíveis:**
- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/v1/health

## 📡 API Endpoints Implementados

### Auth (`/api/v1/auth`)
- `POST /register` - Registrar usuário
- `POST /login` - Login (retorna JWT)
- `POST /refresh` - Renovar token
- `GET /profile` - Perfil do usuário
- `PATCH /profile` - Atualizar perfil
- `POST /2fa/enable` - Ativar 2FA (QR code)
- `POST /2fa/verify` - Verificar código 2FA
- `POST /2fa/disable` - Desativar 2FA

### Patients (`/api/v1/patients`)
- `GET /` - Listar pacientes
- `GET /search?q=` - Buscar pacientes
- `GET /:id` - Obter paciente
- `POST /` - Criar paciente
- `PATCH /:id` - Atualizar paciente
- `DELETE /:id` - Excluir paciente

### Evaluations (`/api/v1/evaluations`)
- `GET /` - Listar avaliações
- `GET /stats` - Estatísticas
- `GET /status/:status` - Filtrar por status
- `GET /:id` - Obter avaliação
- `POST /` - Criar avaliação
- `PATCH /:id` - Atualizar avaliação
- `DELETE /:id` - Excluir avaliação

### Exams (`/api/v1/exams`)
- `GET /` - Listar exames
- `GET /stats` - Estatísticas
- `GET /type/:type` - Filtrar por tipo
- `GET /:id` - Obter exame
- `POST /` - Criar exame
- `PATCH /:id` - Atualizar exame
- `DELETE /:id` - Excluir exame

### Reports (`/api/v1/reports`)
- `GET /` - Listar relatórios
- `GET /stats` - Estatísticas
- `GET /status/:status` - Filtrar por status
- `GET /:id` - Obter relatório
- `POST /` - Criar relatório
- `PATCH /:id` - Atualizar relatório
- `PATCH /:id/status/:status` - Mudar status
- `DELETE /:id` - Excluir relatório

**Autenticação:** Todos os endpoints (exceto `/health`) exigem Bearer Token JWT.

## 🔐 Segurança Implementada

### JWT com RS256
- Access Token: 15 minutos
- Refresh Token: 7 dias
- Algoritmo RS256 (recomendado para produção)

### 2FA (Two-Factor Authentication)
- Algoritmo TOTP (Time-based One-Time Password)
- Compatível com Google Authenticator, Authy, etc.
- QR Code gerado automaticamente

### Criptografia AES-256
Dados criptografados automaticamente:
- Histórico médico de pacientes
- Resultados MMSE/MoCA/Clock Test
- Conteúdo de relatórios
- Metadados de exames DICOM

### Rate Limiting
- 100 requisições/minuto por IP
- Configurável via env vars

### Validação de Dados
- DTOs com class-validator
- Whitelist de propriedades
- Transformação automática de tipos

## 🗄️ Database Schema

### Modelos Principais

```
User          → Usuários (médicos, admins)
Patient       → Pacientes (dados criptografados)
Evaluation    → Avaliações neurológicas
Exam          → Exames médicos (RM, TC, EEG)
Report        → Relatórios e laudos
AuditLog      → Log de auditoria
SyncQueue     → Fila de sincronização offline
RefreshToken  → Tokens JWT refresh
EncryptionKey → Chaves de criptografia
```

Relacionamentos:
- Patient → Evaluations (1:N)
- Evaluation → Exams (1:N)
- Evaluation → Reports (1:N)
- User → Evaluations (1:N)

## 🔧 Scripts Úteis

```bash
# Desenvolvimento
pnpm start:dev         # Hot-reload

# Build
pnpm build

# Produção
pnpm start:prod

# Prisma
npx prisma migrate dev       # Criar migration
npx prisma generate          # Gerar client
npx prisma studio            # Interface visual
npx prisma db seed           # Seed database

# Testes
pnpm test                    # Unit tests
pnpm test:e2e                # E2E tests
pnpm test:cov                # Coverage

# Code Quality
pnpm lint
pnpm format
```

## 📊 Prisma Studio

Visualizar dados do banco:

```bash
npx prisma studio
```

Abre em http://localhost:5555

## 🐳 Docker Compose

Serviços incluídos:
- **PostgreSQL 15** (porta 5432)
- **MinIO** (porta 9000, console 9001)
- **Redis** (porta 6379)

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Logs
docker-compose logs -f postgres

# Reiniciar
docker-compose restart postgres
```

## 📝 Swagger Documentation

Acesse http://localhost:3000/api/docs

Funcionalidades:
- Teste todos os endpoints
- Visualize schemas
- Autenticação JWT integrada (botão "Authorize")
- Exemplos de request/response

## ⚙️ Variáveis de Ambiente

Arquivo: `.env.development`

```env
# Database
DATABASE_URL=postgresql://neurocare:neurocare_dev_2024@localhost:5432/neurocare_db

# JWT
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret

# Encryption
ENCRYPTION_KEY=your-32-char-aes-key-here

# MinIO
AWS_S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
```

## 📋 Próximos Passos

- [ ] Implementar Files Service (upload MinIO)
- [ ] Implementar Sync Module (offline-first)
- [ ] Implementar Audit Module
- [ ] Testes E2E completos
- [ ] Conectar frontend ao backend (Fase 3)
- [ ] Deploy em produção

## 🤝 Licença

Privado e proprietário © 2024 NeuroCare
