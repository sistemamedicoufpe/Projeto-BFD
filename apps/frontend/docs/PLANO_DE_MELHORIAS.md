# PLANO DE MELHORIAS - NEUROCARE DIAGNÓSTICO
**Sistema de Avaliação Neurológica e Diagnóstico de Demências**

Baseado no Documento de Visão - Análise de Correções Necessárias

---

## 📋 ÍNDICE

1. [Resumo Executivo](#1-resumo-executivo)
2. [Migração Tecnológica](#2-migração-tecnológica)
3. [Segurança e Conformidade](#3-segurança-e-conformidade)
4. [Funcionalidades Offline-First](#4-funcionalidades-offline-first)
5. [Estrutura e Arquitetura](#5-estrutura-e-arquitetura)
6. [Melhorias de Interface](#6-melhorias-de-interface)
7. [Conformidade Regulatória ANVISA](#7-conformidade-regulatória-anvisa)
8. [Roadmap de Implementação](#8-roadmap-de-implementação)
9. [Estimativas e Recursos](#9-estimativas-e-recursos)

---

## 1. RESUMO EXECUTIVO

### 🎯 Objetivo do Plano
Transformar o sistema NeuroCare de uma aplicação vanilla JavaScript para uma solução moderna, escalável e regulamentada, utilizando React.js 18+, TypeScript e conformidade total com ANVISA e LGPD.

### 📊 Estado Atual vs. Estado Desejado

| Aspecto | Estado Atual | Estado Desejado |
|---------|--------------|-----------------|
| **Frontend** | Vanilla JS + HTML/CSS | React 18+ + TypeScript + Tailwind |
| **Build Tool** | Nenhum (CDN) | Vite |
| **Persistência** | LocalStorage apenas | IndexedDB + Service Workers |
| **Sincronização** | Não implementada | Offline-first com sync automática |
| **Segurança** | Básica | JWT, Criptografia AES-256, Auditoria |
| **Conformidade** | Nenhuma | ANVISA + LGPD completas |
| **Testes** | Inexistentes | Jest + React Testing Library + E2E |
| **Arquitetura** | Monolítica | Component-based com separação clara |

### 🚨 Criticidade das Melhorias

**CRÍTICAS (Bloqueadores comerciais):**
- ❗ Conformidade ANVISA (sem isso, não pode ser comercializado)
- ❗ Segurança detalhada (dados médicos sensíveis)
- ❗ Sistema de autenticação robusto

**IMPORTANTES (Diferenciais competitivos):**
- ⚠️ Migração para React/TypeScript
- ⚠️ Offline-first com sincronização
- ⚠️ Estrutura modular escalável

**DESEJÁVEIS (Melhorias graduais):**
- 📌 Tailwind CSS
- 📌 Testes automatizados
- 📌 Documentação técnica detalhada

---

## 2. MIGRAÇÃO TECNOLÓGICA

### 2.1 Stack Tecnológica Moderna

#### **Frontend Framework**
**De:** Vanilla JavaScript (ES6+)
**Para:** React.js 18+ com TypeScript

**Justificativa:**
- Component-based architecture para reutilização
- Type safety com TypeScript reduz bugs em produção
- Ecossistema maduro com bibliotecas especializadas
- Melhor performance com Virtual DOM
- Facilita manutenção e onboarding de desenvolvedores

**Bibliotecas Core:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "react-router-dom": "^6.10.0"
}
```

#### **Build Tool**
**De:** CDN (sem build)
**Para:** Vite

**Justificativa:**
- Build ultra-rápido (10x mais rápido que Webpack)
- Hot Module Replacement (HMR) instantâneo
- Tree-shaking automático
- Suporte nativo a TypeScript e JSX
- Otimização de produção embutida

**Configuração Vite:**
```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['chart.js'],
          'pdf': ['jspdf', '@react-pdf/renderer']
        }
      }
    }
  }
})
```

#### **Estilização**
**De:** CSS3 vanilla com variáveis
**Para:** Tailwind CSS + CSS Modules

**Justificativa:**
- Utility-first elimina CSS customizado
- Purge automático remove CSS não utilizado
- Design system consistente out-of-the-box
- Responsividade simplificada
- CSS Modules para estilos específicos quando necessário

**Bibliotecas Adicionais:**
```json
{
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.14",
  "postcss": "^8.4.24"
}
```

#### **Bibliotecas Especializadas**

| Função | Atual | Nova | Justificativa |
|--------|-------|------|---------------|
| Gráficos | Chart.js | Chart.js + react-chartjs-2 | Integração React nativa |
| PDF | jsPDF | @react-pdf/renderer | Componentes React para PDF |
| Ícones | Font Awesome | react-icons | Bundle otimizado, tree-shakeable |
| Datas | Nenhuma | date-fns | Moderna, leve, tree-shakeable |
| HTTP | fetch | axios | Interceptors, timeout, cancelamento |
| Formulários | Manual | react-hook-form | Performance, validação integrada |
| Estado | Context API | Zustand/Context | Simples, performático, sem boilerplate |

### 2.2 Plano de Migração Gradual

#### **Fase 1: Setup do Projeto React**
**Duração:** 1 semana

**Ações:**
1. Criar projeto React com Vite
```bash
npm create vite@latest neurocare-frontend -- --template react-ts
cd neurocare-frontend
npm install
```

2. Configurar Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. Estruturar diretórios conforme seção 2.3
4. Configurar ESLint + Prettier
5. Setup Git hooks (Husky)

**Entregáveis:**
- ✅ Projeto React funcional
- ✅ Build pipeline configurado
- ✅ Linting e formatação automática

#### **Fase 2: Componentes Base**
**Duração:** 2 semanas

**Ações:**
1. Criar design system (botões, inputs, cards, modais)
2. Implementar layout base (Header, Sidebar, Main)
3. Setup de rotas (React Router)
4. Criar componentes de formulário
5. Implementar sistema de temas (claro/escuro)

**Entregáveis:**
- ✅ 20+ componentes reutilizáveis
- ✅ Storybook para documentação visual
- ✅ Sistema de rotas funcional

#### **Fase 3: Migração de Páginas**
**Duração:** 4 semanas

**Priorização:**
1. **Semana 1:** Login + Registro + Dashboard
2. **Semana 2:** Pacientes (listagem + cadastro + edição)
3. **Semana 3:** Avaliações + Exames
4. **Semana 4:** Relatórios + Configurações + Ajuda

**Estratégia:**
- Criar página React paralela à versão vanilla
- Migrar lógica de negócio para hooks customizados
- Adaptar manipulação de estado para React
- Testar funcionalidade antes de deprecar versão antiga

#### **Fase 4: Integração de Features Avançadas**
**Duração:** 2 semanas

**Ações:**
1. Implementar Service Workers para cache
2. Migrar LocalStorage para IndexedDB
3. Sistema de sincronização offline-first
4. Integração com APIs (quando backend estiver pronto)
5. Sistema de notificações

**Entregáveis:**
- ✅ PWA funcional
- ✅ Funcionalidade offline completa
- ✅ Sincronização automática

### 2.3 Estrutura de Diretórios Detalhada

```
neurocare-frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json              # PWA manifest
│   └── service-worker.js          # Service Worker para cache
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   └── brain-icon.svg
│   │   ├── fonts/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── common/                # Componentes genéricos reutilizáveis
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── Button.stories.tsx
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Toast/
│   │   │   ├── Loader/
│   │   │   ├── Badge/
│   │   │   ├── Table/
│   │   │   └── Tabs/
│   │   │
│   │   ├── layout/                # Componentes de layout
│   │   │   ├── Header/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── NavItem.tsx
│   │   │   ├── MainLayout/
│   │   │   └── AuthLayout/
│   │   │
│   │   ├── patients/              # Componentes específicos de pacientes
│   │   │   ├── PatientCard/
│   │   │   ├── PatientForm/
│   │   │   ├── PatientModal/
│   │   │   ├── PatientHistory/
│   │   │   └── PatientSearch/
│   │   │
│   │   ├── exams/                 # Componentes de exames
│   │   │   ├── ExamUpload/
│   │   │   ├── ExamTimeline/
│   │   │   ├── ExamViewer/
│   │   │   │   ├── EEGViewer.tsx
│   │   │   │   └── DICOMViewer.tsx
│   │   │   └── ExamComparison/
│   │   │
│   │   ├── evaluations/           # Componentes de avaliações
│   │   │   ├── EvaluationCard/
│   │   │   ├── EvaluationForm/
│   │   │   ├── CognitiveTests/
│   │   │   │   ├── MMSETest.tsx
│   │   │   │   ├── MoCATest.tsx
│   │   │   │   └── ClockTest.tsx
│   │   │   └── EvaluationSummary/
│   │   │
│   │   ├── reports/               # Componentes de relatórios
│   │   │   ├── ReportGenerator/
│   │   │   ├── ReportEditor/
│   │   │   ├── ReportPreview/
│   │   │   └── ReportCharts/
│   │   │
│   │   └── ai/                    # Componentes de IA
│   │       ├── AIInterpretation/
│   │       ├── DiagnosisProbabilities/
│   │       └── AISettings/
│   │
│   ├── pages/                     # Páginas/rotas da aplicação
│   │   ├── Auth/
│   │   │   ├── Login/
│   │   │   │   └── Login.tsx
│   │   │   └── Register/
│   │   │       └── Register.tsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── Patients/
│   │   │   ├── PatientsList.tsx
│   │   │   ├── PatientDetail.tsx
│   │   │   └── PatientNew.tsx
│   │   ├── Evaluations/
│   │   │   ├── EvaluationsList.tsx
│   │   │   ├── EvaluationDetail.tsx
│   │   │   └── EvaluationNew.tsx
│   │   ├── Reports/
│   │   │   └── Reports.tsx
│   │   ├── Settings/
│   │   │   └── Settings.tsx
│   │   └── Help/
│   │       └── Help.tsx
│   │
│   ├── services/                  # Comunicação com APIs
│   │   ├── api.ts                 # Configuração Axios
│   │   ├── auth.service.ts        # Autenticação
│   │   ├── patients.service.ts    # CRUD Pacientes
│   │   ├── exams.service.ts       # CRUD Exames
│   │   ├── evaluations.service.ts # CRUD Avaliações
│   │   ├── reports.service.ts     # CRUD Relatórios
│   │   └── sync.service.ts        # Sincronização offline
│   │
│   ├── hooks/                     # Custom Hooks
│   │   ├── useAuth.ts             # Hook de autenticação
│   │   ├── usePatients.ts         # Hook para pacientes
│   │   ├── useExams.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useIndexedDB.ts
│   │   ├── useOfflineSync.ts
│   │   └── useTheme.ts
│   │
│   ├── contexts/                  # React Contexts
│   │   ├── AuthContext.tsx        # Contexto de autenticação
│   │   ├── ThemeContext.tsx       # Tema claro/escuro
│   │   └── NotificationContext.tsx
│   │
│   ├── store/                     # Gerenciamento de estado (Zustand)
│   │   ├── authStore.ts
│   │   ├── patientsStore.ts
│   │   ├── examsStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── types/                     # Tipos TypeScript
│   │   ├── patient.types.ts
│   │   ├── exam.types.ts
│   │   ├── evaluation.types.ts
│   │   ├── report.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   ├── utils/                     # Funções utilitárias
│   │   ├── validation.ts          # Validações de formulário
│   │   ├── formatters.ts          # Formatação de dados
│   │   ├── constants.ts           # Constantes globais
│   │   ├── storage.ts             # Abstração LocalStorage/IndexedDB
│   │   ├── encryption.ts          # Funções de criptografia
│   │   └── pdf-generator.ts       # Geração de PDFs
│   │
│   ├── styles/                    # Estilos globais
│   │   ├── globals.css            # Estilos base
│   │   ├── tailwind.css           # Configuração Tailwind
│   │   └── variables.css          # Variáveis CSS customizadas
│   │
│   ├── config/                    # Configurações
│   │   ├── routes.ts              # Definição de rotas
│   │   ├── api.config.ts          # URLs de API
│   │   └── app.config.ts          # Configurações gerais
│   │
│   ├── tests/                     # Testes
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── App.tsx                    # Componente raiz
│   ├── main.tsx                   # Ponto de entrada
│   ├── Router.tsx                 # Configuração de rotas
│   └── vite-env.d.ts              # Tipos Vite
│
├── .env.example                   # Exemplo de variáveis de ambiente
├── .env.development
├── .env.production
├── .eslintrc.json
├── .prettierrc.json
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

### 2.4 Benefícios Mensuráveis da Migração

| Métrica | Antes (Vanilla JS) | Depois (React + TS) | Melhoria |
|---------|-------------------|---------------------|----------|
| **Bundle Size** | ~500KB (CDNs) | ~200KB (otimizado) | -60% |
| **Load Time** | 3.5s | 1.2s | -66% |
| **Bugs em Produção** | ~15/mês | ~3/mês (estimado) | -80% |
| **Tempo de Dev** | 100% | 60% (após curva) | -40% |
| **Manutenibilidade** | Baixa | Alta | ⬆️⬆️ |
| **Testabilidade** | Difícil | Fácil | ⬆️⬆️ |

---

## 3. SEGURANÇA E CONFORMIDADE

### 3.1 Análise de Gaps de Segurança

#### **Situação Atual (Crítica)**
O documento de visão menciona apenas "LGPD compliant" sem detalhar:
- ❌ Sistema de autenticação inexistente
- ❌ Dados armazenados sem criptografia
- ❌ Sem auditoria de acessos
- ❌ Vulnerável a XSS, CSRF, SQL Injection
- ❌ Sem backup automatizado
- ❌ APIs sem proteção

**RISCO:** Dados médicos ultra-sensíveis expostos. Violação da LGPD e ANVISA.

### 3.2 Sistema de Autenticação Robusto

#### **Implementação JWT (JSON Web Tokens)**

**Fluxo de Autenticação:**
```typescript
// services/auth.service.ts
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await api.post('/auth/login', credentials);

    // Armazenar tokens de forma segura
    this.storeTokens(response.data);

    return response.data;
  }

  private storeTokens(tokens: AuthTokens): void {
    // Access token em memória (não em localStorage por segurança)
    sessionStorage.setItem('accessToken', tokens.accessToken);

    // Refresh token em httpOnly cookie (definido pelo backend)
    // Não acessível via JavaScript, previne XSS
  }

  async refreshAccessToken(): Promise<string> {
    const response = await api.post('/auth/refresh');
    const newAccessToken = response.data.accessToken;
    sessionStorage.setItem('accessToken', newAccessToken);
    return newAccessToken;
  }
}
```

**Interceptor Axios para Refresh Automático:**
```typescript
// services/api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se token expirou (401) e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou, logout
        authService.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**Especificações de Segurança do Token:**
- **Access Token:** Expira em 15 minutos
- **Refresh Token:** Expira em 7 dias, httpOnly cookie
- **Algoritmo:** RS256 (assinatura assimétrica)
- **Claims:** userId, role, permissions, iat, exp

#### **Autenticação Multifator (2FA)**

**Implementação TOTP (Time-based One-Time Password):**
```typescript
// services/twoFactor.service.ts
export class TwoFactorService {
  async enable2FA(): Promise<{ qrCode: string; secret: string }> {
    const response = await api.post('/auth/2fa/enable');
    return response.data;
  }

  async verify2FA(token: string): Promise<boolean> {
    const response = await api.post('/auth/2fa/verify', { token });
    return response.data.valid;
  }

  async disable2FA(password: string): Promise<void> {
    await api.post('/auth/2fa/disable', { password });
  }
}
```

**Configuração Obrigatória:**
- Profissionais de saúde: 2FA obrigatório
- Administradores: 2FA + whitelist de IPs

### 3.3 Criptografia de Dados

#### **Dados em Trânsito (HTTPS/TLS 1.3)**

**Configuração Nginx (Produção):**
```nginx
server {
    listen 443 ssl http2;
    server_name neurocare.com.br;

    # Certificado SSL
    ssl_certificate /etc/letsencrypt/live/neurocare.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/neurocare.com.br/privkey.pem;

    # TLS 1.3 apenas
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers off;

    # HSTS (força HTTPS)
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Outros headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;
}
```

#### **Dados em Repouso (AES-256)**

**Criptografia no Frontend (dados sensíveis):**
```typescript
// utils/encryption.ts
import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static readonly ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY!;

  static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
  }

  static decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Para objetos
  static encryptObject<T>(obj: T): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  static decryptObject<T>(encryptedData: string): T {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted) as T;
  }
}
```

**Uso em IndexedDB:**
```typescript
// utils/storage.ts
export class SecureStorage {
  async savePatient(patient: Patient): Promise<void> {
    const encryptedData = EncryptionService.encryptObject(patient);
    await db.patients.put({ id: patient.id, data: encryptedData });
  }

  async getPatient(id: string): Promise<Patient> {
    const record = await db.patients.get(id);
    return EncryptionService.decryptObject<Patient>(record.data);
  }
}
```

**Criptografia no Backend (Database):**
- Campo-level encryption com AES-256-GCM
- Chaves gerenciadas por AWS KMS ou Azure Key Vault
- Rotação de chaves a cada 90 dias

### 3.4 Auditoria de Acessos

#### **Log Completo de Ações**

**Modelo de Audit Log:**
```typescript
// types/audit.types.ts
interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: Record<string, any>;
  result: 'success' | 'failure';
}

enum AuditAction {
  // Autenticação
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',

  // Pacientes
  PATIENT_VIEW = 'PATIENT_VIEW',
  PATIENT_CREATE = 'PATIENT_CREATE',
  PATIENT_UPDATE = 'PATIENT_UPDATE',
  PATIENT_DELETE = 'PATIENT_DELETE',
  PATIENT_EXPORT = 'PATIENT_EXPORT',

  // Exames
  EXAM_VIEW = 'EXAM_VIEW',
  EXAM_UPLOAD = 'EXAM_UPLOAD',
  EXAM_DOWNLOAD = 'EXAM_DOWNLOAD',
  EXAM_DELETE = 'EXAM_DELETE',

  // Relatórios
  REPORT_GENERATE = 'REPORT_GENERATE',
  REPORT_VIEW = 'REPORT_VIEW',
  REPORT_EDIT = 'REPORT_EDIT',

  // Configurações
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  USER_ROLE_CHANGE = 'USER_ROLE_CHANGE'
}
```

**Implementação de Auditoria:**
```typescript
// services/audit.service.ts
export class AuditService {
  async log(action: AuditAction, resource: string, details?: any): Promise<void> {
    const auditLog: AuditLog = {
      id: uuidv4(),
      userId: authStore.user?.id!,
      userName: authStore.user?.name!,
      action,
      resource,
      resourceId: details?.resourceId,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      details,
      result: 'success'
    };

    // Enviar para backend de forma assíncrona
    await api.post('/audit/log', auditLog);

    // Se offline, armazenar localmente para sync posterior
    if (!navigator.onLine) {
      await this.storeOfflineLog(auditLog);
    }
  }

  async viewAuditLogs(filters: AuditFilters): Promise<AuditLog[]> {
    // Apenas administradores podem visualizar logs
    if (!authStore.hasPermission('audit:view')) {
      throw new Error('Permissão negada');
    }

    const response = await api.get('/audit/logs', { params: filters });
    return response.data;
  }
}
```

**Interceptor para Auditoria Automática:**
```typescript
// services/api.ts
api.interceptors.response.use(
  async (response) => {
    // Auditar ações bem-sucedidas
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(response.config.method?.toUpperCase()!)) {
      await auditService.log(
        mapEndpointToAction(response.config.url!),
        response.config.url!,
        { method: response.config.method, data: response.config.data }
      );
    }
    return response;
  },
  async (error) => {
    // Auditar falhas
    await auditService.logFailure(
      error.config?.url,
      error.response?.status,
      error.message
    );
    return Promise.reject(error);
  }
);
```

#### **Dashboard de Auditoria**

**Funcionalidades:**
- ✅ Filtros por usuário, ação, data, recurso
- ✅ Timeline visual de eventos
- ✅ Alertas de atividades suspeitas
- ✅ Exportação de logs para análise externa
- ✅ Retenção de logs por 5 anos (conformidade LGPD)

### 3.5 Proteção Contra Ataques

#### **XSS (Cross-Site Scripting)**

**Medidas Implementadas:**
```typescript
// utils/sanitization.ts
import DOMPurify from 'dompurify';

export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

// Uso em componentes
const PatientNote: React.FC<{ note: string }> = ({ note }) => {
  const sanitized = sanitizeHTML(note);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

**Content Security Policy (CSP):**
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.neurocare.com.br;">
```

#### **CSRF (Cross-Site Request Forgery)**

**Tokens CSRF:**
```typescript
// services/api.ts
api.interceptors.request.use((config) => {
  // Adicionar token CSRF em requisições mutantes
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase()!)) {
    const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});
```

**SameSite Cookies:**
```typescript
// Backend: Configuração de cookies
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', // Previne CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
});
```

#### **SQL Injection**

**Prepared Statements (Backend):**
```typescript
// Backend: Nunca concatenar SQL diretamente
// ❌ ERRADO
const query = `SELECT * FROM patients WHERE id = ${patientId}`;

// ✅ CORRETO
const query = 'SELECT * FROM patients WHERE id = ?';
const result = await db.execute(query, [patientId]);
```

**Validação de Input:**
```typescript
// utils/validation.ts
import { z } from 'zod';

export const PatientSchema = z.object({
  nome: z.string().min(3).max(100),
  cpf: z.string().regex(/^\d{11}$/),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  email: z.string().email().optional(),
  telefone: z.string().regex(/^\d{10,11}$/).optional()
});

// Uso em formulários
const validatePatient = (data: unknown) => {
  try {
    return PatientSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Dados inválidos', error);
  }
};
```

#### **Rate Limiting**

**Implementação no Backend (Express):**
```typescript
import rateLimit from 'express-rate-limit';

// Limitar tentativas de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/auth/login', loginLimiter, authController.login);

// Limitar API calls gerais
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requests
  message: 'Limite de requisições excedido'
});

app.use('/api/', apiLimiter);
```

### 3.6 Backup Automático

#### **Estratégia de Backup**

**Tipos de Backup:**
- **Incremental Diário:** Apenas mudanças do dia
- **Completo Semanal:** Backup total aos domingos 3h AM
- **Snapshot Mensal:** Backup imutável para auditoria

**Implementação (Backend - PostgreSQL):**
```bash
#!/bin/bash
# backup-daily.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/incremental"
DB_NAME="neurocare_db"

# Backup incremental
pg_dump -U postgres -Fc $DB_NAME > "$BACKUP_DIR/neurocare_$DATE.dump"

# Criptografar backup
openssl enc -aes-256-cbc -salt -in "$BACKUP_DIR/neurocare_$DATE.dump" \
            -out "$BACKUP_DIR/neurocare_$DATE.dump.enc" \
            -pass file:/etc/backup-key.txt

# Enviar para S3
aws s3 cp "$BACKUP_DIR/neurocare_$DATE.dump.enc" \
          s3://neurocare-backups/incremental/ \
          --storage-class GLACIER_IR

# Remover arquivo local após 7 dias
find $BACKUP_DIR -type f -mtime +7 -delete
```

**Cron Job:**
```cron
# Backup diário às 3h AM
0 3 * * * /usr/local/bin/backup-daily.sh

# Backup semanal completo aos domingos 2h AM
0 2 * * 0 /usr/local/bin/backup-weekly.sh

# Backup mensal no dia 1 às 1h AM
0 1 1 * * /usr/local/bin/backup-monthly.sh
```

**Retenção de Backups:**
- Diários: 30 dias
- Semanais: 3 meses
- Mensais: 7 anos (conformidade ANVISA)

**Testes de Restore:**
- Mensalmente: Restore de backup em ambiente de staging
- Documentar tempo de restore (RTO: Recovery Time Objective)
- Validar integridade dos dados restaurados

### 3.7 Segurança em APIs

#### **CORS (Cross-Origin Resource Sharing)**

**Configuração Restritiva:**
```typescript
// Backend: server.ts
import cors from 'cors';

const corsOptions = {
  origin: [
    'https://neurocare.com.br',
    'https://app.neurocare.com.br',
    process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : ''
  ].filter(Boolean),
  credentials: true, // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));
```

#### **API Versioning**

**Estrutura de Versionamento:**
```typescript
// routes/v1/index.ts
import express from 'express';

const router = express.Router();

router.use('/patients', patientsRouter);
router.use('/exams', examsRouter);
router.use('/reports', reportsRouter);

export default router;

// server.ts
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router); // Futuro
```

**Header de Versão:**
```typescript
// Middleware para validar versão
app.use('/api', (req, res, next) => {
  const apiVersion = req.headers['api-version'] || 'v1';

  if (!['v1', 'v2'].includes(apiVersion)) {
    return res.status(400).json({ error: 'Versão de API inválida' });
  }

  next();
});
```

#### **Request Validation**

**Schema Validation com Zod:**
```typescript
// middleware/validation.middleware.ts
import { z, ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validação falhou',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

// Uso
app.post('/api/v1/patients',
  validateRequest(CreatePatientSchema),
  patientsController.create
);
```

### 3.8 Conformidade LGPD

#### **Princípios Implementados**

**1. Consentimento Explícito**
```typescript
// components/ConsentModal.tsx
const ConsentModal: React.FC = () => {
  const [consents, setConsents] = useState({
    dataCollection: false,
    dataProcessing: false,
    dataSharing: false
  });

  const handleSubmit = async () => {
    // Armazenar consentimentos com timestamp
    await api.post('/consent', {
      ...consents,
      timestamp: new Date().toISOString(),
      ip: await getClientIP(),
      userAgent: navigator.userAgent
    });
  };

  return (
    <Modal>
      <h2>Consentimento de Dados</h2>
      <Checkbox
        checked={consents.dataCollection}
        onChange={(e) => setConsents({ ...consents, dataCollection: e.target.checked })}
      >
        Concordo com a coleta dos meus dados pessoais e de saúde
      </Checkbox>
      {/* Outros consentimentos */}
      <Button onClick={handleSubmit} disabled={!allConsentsGiven}>
        Aceitar e Continuar
      </Button>
    </Modal>
  );
};
```

**2. Direito ao Esquecimento**
```typescript
// services/gdpr.service.ts
export class GDPRService {
  async requestDataDeletion(userId: string, reason: string): Promise<void> {
    // 1. Criar ticket de solicitação
    await api.post('/gdpr/deletion-request', { userId, reason });

    // 2. Anonimizar dados imediatamente (soft delete)
    await this.anonymizeUserData(userId);

    // 3. Agendar deleção física após período legal (30 dias)
    await this.schedulePhysicalDeletion(userId, 30);

    // 4. Notificar usuário
    await this.sendDeletionConfirmation(userId);
  }

  private async anonymizeUserData(userId: string): Promise<void> {
    // Substituir dados pessoais por hash irreversível
    const hash = sha256(userId + Date.now());

    await api.patch(`/users/${userId}/anonymize`, {
      nome: `Usuário ${hash.substring(0, 8)}`,
      email: `anonimo${hash.substring(0, 8)}@deleted.local`,
      cpf: null,
      telefone: null,
      endereco: null,
      dataNascimento: null
    });
  }
}
```

**3. Portabilidade de Dados**
```typescript
// services/gdpr.service.ts
export class GDPRService {
  async exportUserData(userId: string, format: 'json' | 'csv'): Promise<Blob> {
    // Coletar todos os dados do usuário
    const userData = await this.collectAllUserData(userId);

    // Gerar arquivo no formato solicitado
    if (format === 'json') {
      return new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
    } else {
      const csv = this.convertToCSV(userData);
      return new Blob([csv], { type: 'text/csv' });
    }
  }

  private async collectAllUserData(userId: string): Promise<UserExportData> {
    const [profile, patients, exams, evaluations, reports] = await Promise.all([
      api.get(`/users/${userId}`),
      api.get(`/users/${userId}/patients`),
      api.get(`/users/${userId}/exams`),
      api.get(`/users/${userId}/evaluations`),
      api.get(`/users/${userId}/reports`)
    ]);

    return {
      profile: profile.data,
      patients: patients.data,
      exams: exams.data,
      evaluations: evaluations.data,
      reports: reports.data,
      exportDate: new Date().toISOString()
    };
  }
}
```

**4. Privacidade by Design**
- Minimização de dados: coletar apenas o necessário
- Pseudonimização: separar dados identificáveis de dados clínicos
- Criptografia end-to-end para dados sensíveis
- Anonimização em relatórios agregados

**5. Transparência**
```typescript
// pages/Privacy/PrivacyPolicy.tsx
const PrivacyPolicy: React.FC = () => {
  return (
    <Container>
      <h1>Política de Privacidade</h1>

      <Section>
        <h2>Dados Coletados</h2>
        <ul>
          <li>Dados cadastrais: nome, CPF, email, telefone</li>
          <li>Dados clínicos: histórico médico, exames, avaliações</li>
          <li>Dados de uso: logs de acesso, ações no sistema</li>
        </ul>
      </Section>

      <Section>
        <h2>Finalidade do Tratamento</h2>
        <p>Os dados são utilizados exclusivamente para:</p>
        <ul>
          <li>Diagnóstico e acompanhamento de pacientes</li>
          <li>Geração de relatórios médicos</li>
          <li>Melhorias no sistema via análise agregada e anonimizada</li>
        </ul>
      </Section>

      <Section>
        <h2>Seus Direitos</h2>
        <ul>
          <li>Acessar seus dados a qualquer momento</li>
          <li>Solicitar correção de dados incorretos</li>
          <li>Solicitar exclusão de seus dados (direito ao esquecimento)</li>
          <li>Portabilidade de dados</li>
          <li>Revogar consentimento</li>
        </ul>
        <Button onClick={() => navigate('/privacy/my-data')}>
          Gerenciar Meus Dados
        </Button>
      </Section>
    </Container>
  );
};
```

---

## 4. FUNCIONALIDADES OFFLINE-FIRST

### 4.1 Por Que Offline-First é Crucial

**Contexto do Problema:**
- Clínicas em áreas remotas com internet instável
- Hospitais com WiFi sobrecarregado
- Atendimentos domiciliares sem conectividade
- Necessidade de trabalhar sem interrupções

**Solução:**
Sistema funciona 100% offline após carregamento inicial, sincronizando automaticamente quando conexão retorna.

### 4.2 Arquitetura Offline-First

#### **Camadas de Persistência**

```
┌─────────────────────────────────────┐
│         React Application           │
│  (UI Components + Business Logic)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Offline-First Adapter          │
│  (Detecta online/offline, roteia)   │
└──────────┬──────────┬────────────────┘
           │          │
   Online  │          │  Offline
           ▼          ▼
┌──────────────┐  ┌──────────────────┐
│   API REST   │  │   IndexedDB      │
│   (Backend)  │  │   (Local Cache)  │
└──────────────┘  └──────────────────┘
           │          │
           └────┬─────┘
                ▼
        ┌──────────────────┐
        │  Sync Service    │
        │  (Background)    │
        └──────────────────┘
```

### 4.3 Service Workers

#### **Instalação e Configuração**

```typescript
// public/service-worker.js
const CACHE_NAME = 'neurocare-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
  '/assets/logo.svg'
];

// Instalação: cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: limpar caches antigas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: estratégia Network-First com Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API calls: Network-First
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear resposta bem-sucedida
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache
          return caches.match(request);
        })
    );
  }
  // Assets estáticos: Cache-First
  else {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request);
      })
    );
  }
});
```

**Registro do Service Worker:**
```typescript
// main.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registrado:', registration.scope);
      })
      .catch((error) => {
        console.error('Erro ao registrar Service Worker:', error);
      });
  });
}
```

### 4.4 IndexedDB

#### **Schema de Banco de Dados Local**

```typescript
// db/schema.ts
import Dexie, { Table } from 'dexie';

export interface Patient {
  id: string;
  nome: string;
  cpf?: string;
  dataNascimento: string;
  // ... outros campos
  _synced: boolean;
  _updatedAt: Date;
}

export interface Exam {
  id: string;
  patientId: string;
  tipo: 'eeg' | 'cognition' | 'image' | 'lab';
  data: Date;
  arquivo?: Blob;
  _synced: boolean;
  _updatedAt: Date;
}

export class NeuroCareDB extends Dexie {
  patients!: Table<Patient, string>;
  exams!: Table<Exam, string>;
  evaluations!: Table<Evaluation, string>;
  reports!: Table<Report, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('NeuroCareDB');

    this.version(1).stores({
      patients: 'id, nome, cpf, *_synced',
      exams: 'id, patientId, tipo, data, *_synced',
      evaluations: 'id, patientId, data, *_synced',
      reports: 'id, patientId, data, *_synced',
      syncQueue: '++id, operation, entity, timestamp'
    });
  }
}

export const db = new NeuroCareDB();
```

#### **Operações CRUD com IndexedDB**

```typescript
// services/offline-storage.service.ts
export class OfflineStorageService {
  async savePatient(patient: Patient): Promise<void> {
    patient._synced = false;
    patient._updatedAt = new Date();

    await db.patients.put(patient);

    // Adicionar à fila de sincronização
    await db.syncQueue.add({
      operation: 'create',
      entity: 'patient',
      entityId: patient.id,
      data: patient,
      timestamp: new Date()
    });
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return await db.patients.get(id);
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db.patients.toArray();
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db.patients
      .filter((patient) =>
        patient.nome.toLowerCase().includes(query.toLowerCase()) ||
        patient.cpf?.includes(query)
      )
      .toArray();
  }

  async deletePatient(id: string): Promise<void> {
    await db.patients.delete(id);

    // Adicionar deleção à fila de sync
    await db.syncQueue.add({
      operation: 'delete',
      entity: 'patient',
      entityId: id,
      timestamp: new Date()
    });
  }
}
```

### 4.5 Sistema de Sincronização Automática

#### **Detecção de Conectividade**

```typescript
// hooks/useOnlineStatus.ts
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

#### **Serviço de Sincronização**

```typescript
// services/sync.service.ts
export class SyncService {
  private isSyncing = false;
  private syncInterval?: NodeJS.Timer;

  startAutoSync(): void {
    // Sync a cada 5 minutos
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.sync();
      }
    }, 5 * 60 * 1000);

    // Sync imediato ao reconectar
    window.addEventListener('online', () => this.sync());
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  async sync(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;

    try {
      // 1. Pull: Baixar atualizações do servidor
      await this.pullFromServer();

      // 2. Push: Enviar mudanças locais
      await this.pushToServer();

      console.log('Sincronização concluída');
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async pullFromServer(): Promise<void> {
    // Obter timestamp da última sincronização
    const lastSync = localStorage.getItem('lastSyncTimestamp');

    // Buscar mudanças desde última sync
    const response = await api.get('/sync/changes', {
      params: { since: lastSync }
    });

    const { patients, exams, evaluations, reports } = response.data;

    // Atualizar IndexedDB com dados do servidor
    await db.transaction('rw', [db.patients, db.exams, db.evaluations, db.reports], async () => {
      if (patients.length) await db.patients.bulkPut(patients);
      if (exams.length) await db.exams.bulkPut(exams);
      if (evaluations.length) await db.evaluations.bulkPut(evaluations);
      if (reports.length) await db.reports.bulkPut(reports);
    });
  }

  private async pushToServer(): Promise<void> {
    // Obter itens da fila de sincronização
    const queue = await db.syncQueue.toArray();

    if (queue.length === 0) return;

    // Processar cada item
    for (const item of queue) {
      try {
        await this.processSyncItem(item);

        // Remover da fila após sucesso
        await db.syncQueue.delete(item.id!);
      } catch (error) {
        console.error(`Erro ao sincronizar item ${item.id}:`, error);
        // Manter na fila para tentar novamente
      }
    }

    // Atualizar timestamp de última sincronização
    localStorage.setItem('lastSyncTimestamp', new Date().toISOString());
  }

  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    const { operation, entity, entityId, data } = item;

    switch (operation) {
      case 'create':
        await api.post(`/api/v1/${entity}s`, data);
        break;
      case 'update':
        await api.put(`/api/v1/${entity}s/${entityId}`, data);
        break;
      case 'delete':
        await api.delete(`/api/v1/${entity}s/${entityId}`);
        break;
    }
  }
}

export const syncService = new SyncService();
```

#### **Resolução de Conflitos**

```typescript
// services/conflict-resolution.service.ts
export class ConflictResolutionService {
  async resolveConflict(
    localData: Patient,
    serverData: Patient
  ): Promise<Patient> {
    // Estratégia: Last-Write-Wins (LWW)
    // Comparar timestamps de atualização
    const localTimestamp = new Date(localData._updatedAt).getTime();
    const serverTimestamp = new Date(serverData._updatedAt).getTime();

    if (serverTimestamp > localTimestamp) {
      // Servidor tem versão mais recente
      await db.patients.put({ ...serverData, _synced: true });
      return serverData;
    } else {
      // Local tem versão mais recente, re-enviar
      await api.put(`/api/v1/patients/${localData.id}`, localData);
      await db.patients.update(localData.id, { _synced: true });
      return localData;
    }
  }

  async resolveWithManualChoice(
    localData: Patient,
    serverData: Patient
  ): Promise<Patient> {
    // Mostrar modal para usuário escolher versão
    return new Promise((resolve) => {
      showConflictModal({
        localData,
        serverData,
        onResolve: (chosen: 'local' | 'server') => {
          resolve(chosen === 'local' ? localData : serverData);
        }
      });
    });
  }

  async mergeData(
    localData: Patient,
    serverData: Patient
  ): Promise<Patient> {
    // Estratégia de merge campo a campo
    // Manter campo mais recente de cada
    const merged: Patient = { ...serverData };

    for (const key in localData) {
      const localField = localData[key as keyof Patient];
      const serverField = serverData[key as keyof Patient];

      if (localField !== serverField) {
        // Comparar timestamps de atualização do campo (se disponível)
        // Ou usar última modificação do objeto
        if (new Date(localData._updatedAt) > new Date(serverData._updatedAt)) {
          merged[key as keyof Patient] = localField;
        }
      }
    }

    return merged;
  }
}
```

### 4.6 UI de Status de Sincronização

```typescript
// components/SyncStatus.tsx
export const SyncStatus: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [pendingSync, setPendingSync] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Contar itens pendentes
    const updatePending = async () => {
      const count = await db.syncQueue.count();
      setPendingSync(count);
    };

    updatePending();
    const interval = setInterval(updatePending, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncService.sync();
      showToast('Sincronização concluída', 'success');
    } catch (error) {
      showToast('Erro na sincronização', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded">
      {/* Status de conexão */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700">Online</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-sm text-gray-700">Offline</span>
          </>
        )}
      </div>

      {/* Itens pendentes */}
      {pendingSync > 0 && (
        <Badge variant="warning">
          {pendingSync} pendente{pendingSync > 1 ? 's' : ''}
        </Badge>
      )}

      {/* Botão de sync manual */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleManualSync}
        disabled={!isOnline || isSyncing}
      >
        {isSyncing ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshIcon className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};
```

### 4.7 Tratamento de Arquivos Grandes (EEG, DICOM)

```typescript
// services/file-storage.service.ts
export class FileStorageService {
  async saveExamFile(examId: string, file: File): Promise<void> {
    // Comprimir arquivo se for grande
    const compressed = await this.compressFile(file);

    // Salvar em IndexedDB como Blob
    await db.exams.update(examId, {
      arquivo: compressed,
      arquivoNome: file.name,
      arquivoTipo: file.type,
      arquivoTamanho: compressed.size
    });

    // Adicionar à fila para upload quando online
    await db.syncQueue.add({
      operation: 'upload-file',
      entity: 'exam',
      entityId: examId,
      timestamp: new Date()
    });
  }

  private async compressFile(file: File): Promise<Blob> {
    // Para imagens: comprimir com Canvas
    if (file.type.startsWith('image/')) {
      return await this.compressImage(file);
    }

    // Para outros arquivos: usar CompressionStream (se disponível)
    if ('CompressionStream' in window) {
      return await this.compressWithStream(file);
    }

    return file;
  }

  private async compressImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Redimensionar se necessário (max 1920x1080)
        let { width, height } = img;
        const maxWidth = 1920;
        const maxHeight = 1080;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob!),
          'image/jpeg',
          0.8 // Qualidade 80%
        );
      };
    });
  }

  async getExamFile(examId: string): Promise<File | null> {
    const exam = await db.exams.get(examId);

    if (!exam?.arquivo) return null;

    return new File([exam.arquivo], exam.arquivoNome!, {
      type: exam.arquivoTipo
    });
  }
}
```

---

## 5. ESTRUTURA E ARQUITETURA

### 5.1 Estrutura Completa do Projeto

*[Já detalhada na Seção 2.3]*

### 5.2 Padrões de Design

#### **Component Composition**
```typescript
// Exemplo: PatientCard composto de componentes menores
export const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => {
  return (
    <Card>
      <CardHeader>
        <Avatar src={patient.avatar} name={patient.nome} />
        <CardTitle>{patient.nome}</CardTitle>
        <Badge>{calculateAge(patient.dataNascimento)} anos</Badge>
      </CardHeader>
      <CardBody>
        <InfoRow label="CPF" value={patient.cpf} />
        <InfoRow label="Contato" value={patient.telefone} />
        <InfoRow label="Última Consulta" value={formatDate(patient.ultimaConsulta)} />
      </CardBody>
      <CardFooter>
        <Button variant="primary" onClick={() => navigate(`/patients/${patient.id}`)}>
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};
```

#### **Custom Hooks para Lógica Compartilhada**
```typescript
// hooks/usePatients.ts
export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);

      if (isOnline) {
        // Buscar do servidor
        const response = await api.get('/patients');
        setPatients(response.data);

        // Cachear em IndexedDB
        await db.patients.bulkPut(response.data);
      } else {
        // Buscar de IndexedDB
        const cached = await db.patients.toArray();
        setPatients(cached);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (data: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      id: uuidv4(),
      ...data,
      _synced: false,
      _updatedAt: new Date()
    };

    // Salvar localmente
    await offlineStorage.savePatient(newPatient);
    setPatients([...patients, newPatient]);

    // Sync se online
    if (isOnline) {
      await syncService.sync();
    }

    return newPatient;
  };

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    const updated = { ...patients.find(p => p.id === id)!, ...data };
    await offlineStorage.savePatient(updated);
    setPatients(patients.map(p => p.id === id ? updated : p));

    if (isOnline) {
      await syncService.sync();
    }
  };

  const deletePatient = async (id: string) => {
    await offlineStorage.deletePatient(id);
    setPatients(patients.filter(p => p.id !== id));

    if (isOnline) {
      await syncService.sync();
    }
  };

  return {
    patients,
    loading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
    refreshPatients: loadPatients
  };
};
```

#### **Context API para Estado Global**
```typescript
// contexts/AuthContext.tsx
interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar sessão ao carregar
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch {
        logout();
      }
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response.data;

    sessionStorage.setItem('accessToken', accessToken);
    setUser(user);
    setIsAuthenticated(true);

    // Log de auditoria
    await auditService.log('LOGIN', '/auth/login');
  };

  const logout = () => {
    sessionStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = { ...user!, ...data };
    await api.put(`/users/${user!.id}`, updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 5.3 Roteamento e Navegação

```typescript
// Router.tsx
export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<PatientsList />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="patients/new" element={<PatientNew />} />
            <Route path="evaluations" element={<EvaluationsList />} />
            <Route path="evaluations/:id" element={<EvaluationDetail />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// ProtectedRoute.tsx
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
```

---

## 6. MELHORIAS DE INTERFACE

### 6.1 Design System com Tailwind

#### **Configuração Tailwind**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          500: '#6366f1',
          600: '#4f46e5',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          500: '#6b7280',
          700: '#374151',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

#### **Componentes Base Estilizados**
```typescript
// components/common/Button/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
```

### 6.2 Tema Claro/Escuro

```typescript
// contexts/ThemeContext.tsx
type Theme = 'light' | 'dark';

export const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

**Configuração Tailwind para Dark Mode:**
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // ou 'media' para respeitar preferência do SO
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        dark: {
          bg: '#1a202c',
          surface: '#2d3748',
          border: '#4a5568',
          text: '#e2e8f0',
        }
      }
    }
  }
};
```

**Uso em Componentes:**
```typescript
<div className="bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text">
  Conteúdo que muda com o tema
</div>
```

### 6.3 Responsividade Mobile-First

**Breakpoints Tailwind:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Exemplo de Layout Responsivo:**
```typescript
export const PatientsList: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Pacientes</h1>
        <Button variant="primary" className="w-full sm:w-auto">
          Novo Paciente
        </Button>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map(patient => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
};
```

### 6.4 Indicadores de Acessibilidade

**ARIA Labels:**
```typescript
<button
  aria-label="Fechar modal"
  onClick={onClose}
>
  <XIcon className="w-5 h-5" />
</button>
```

**Focus Visible:**
```css
.focus-visible:focus {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2;
}
```

**Skip to Main Content:**
```typescript
export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded"
    >
      Pular para o conteúdo principal
    </a>
  );
};
```

---

## 7. CONFORMIDADE REGULATÓRIA ANVISA

### 7.1 O Que é Conformidade ANVISA

**ANVISA (Agência Nacional de Vigilância Sanitária)** regula dispositivos médicos no Brasil, incluindo softwares de apoio à decisão clínica.

**Por que é obrigatória:**
- Software médico é considerado "produto para saúde"
- Classificação: Classe II (risco médio) para software de apoio diagnóstico
- Sem registro ANVISA = proibido comercializar/usar clinicamente

### 7.2 Requisitos de Conformidade

#### **RDC 185/2001: Software como Produto Médico**

**Requisitos Principais:**
1. Gerenciamento de Riscos (ISO 14971)
2. Documentação Técnica Completa
3. Testes de Validação Clínica
4. Manual do Usuário
5. Rastreabilidade de Versões
6. Gestão de Bugs e Incidentes
7. Suporte Técnico

#### **RDC 36/2015: Boas Práticas de Fabricação**

**Requisitos de Qualidade:**
- Sistema de Gestão da Qualidade (SGQ)
- Controle de Versões e Mudanças
- Validação de Software (IEC 62304)
- Testes Sistemáticos
- Auditoria Interna

### 7.3 Documentação Necessária para Registro

#### **1. Dossiê Técnico**

**Conteúdo:**
- Identificação do fabricante
- Descrição do produto (NeuroCare Diagnóstico)
- Classificação de risco
- Especificações técnicas
- Requisitos funcionais e não-funcionais
- Arquitetura de software
- Análise de riscos (FMEA)
- Plano de testes
- Resultados de validação clínica
- Manual do usuário
- Rotulagem e embalagem

**Template de Identificação:**
```markdown
## Identificação do Produto

**Nome Comercial:** NeuroCare Diagnóstico
**Nome Técnico:** Sistema de Avaliação Neurológica e Apoio ao Diagnóstico de Demências
**Fabricante:** [Razão Social da Empresa]
**CNPJ:** [Número]
**Endereço:** [Endereço Completo]
**Responsável Técnico:** [Nome + CRM]
**Versão do Software:** 1.0.0
**Classificação de Risco:** Classe II (Regra 11 - Software de apoio diagnóstico)
```

#### **2. Análise de Riscos (ISO 14971)**

**Identificação de Riscos:**
| ID | Risco | Causa | Consequência | Severidade | Probabilidade | Risco | Mitigação |
|----|-------|-------|--------------|------------|---------------|-------|-----------|
| R1 | Diagnóstico incorreto | Bug no algoritmo de IA | Tratamento inadequado | Grave | Baixa | Médio | Testes extensivos, disclaimers, validação médica obrigatória |
| R2 | Perda de dados do paciente | Falha no backup | Perda de histórico clínico | Grave | Baixa | Médio | Backup automático, redundância |
| R3 | Acesso não autorizado | Falha de autenticação | Vazamento de dados | Grave | Média | Alto | 2FA obrigatório, criptografia, auditoria |
| R4 | Indisponibilidade do sistema | Falha de servidor | Interrupção do atendimento | Moderada | Baixa | Baixo | Alta disponibilidade (99.9%), modo offline |

**Matriz de Risco:**
```
Severidade:
- Catastrófico: Morte ou lesão grave permanente
- Grave: Lesão grave reversível, tratamento inadequado
- Moderado: Lesão leve, inconveniência ao paciente
- Baixo: Sem impacto clínico

Probabilidade:
- Frequente: >10% de ocorrência
- Provável: 1-10% de ocorrência
- Ocasional: 0.1-1% de ocorrência
- Raro: <0.1% de ocorrência

Nível de Risco:
- Alto: Ação imediata obrigatória
- Médio: Mitigação necessária antes do lançamento
- Baixo: Mitigação recomendada
```

#### **3. Validação de Software (IEC 62304)**

**Plano de Validação:**
```markdown
## Plano de Validação Clínica

### Objetivo
Validar a precisão do NeuroCare Diagnóstico no apoio ao diagnóstico de demências.

### Protocolo
1. **Amostra:** 200 pacientes com diagnóstico confirmado por equipe especializada
2. **Grupos:**
   - Alzheimer (n=80)
   - Demência com Corpos de Lewy (n=50)
   - Demência Frontotemporal (n=30)
   - Declínio Cognitivo Leve (n=40)
3. **Metodologia:**
   - Entrada de dados clínicos, cognitivos e EEG no sistema
   - Comparação do diagnóstico sugerido pela IA com diagnóstico gold-standard
   - Cálculo de sensibilidade, especificidade, VPP, VPN
4. **Critério de Sucesso:**
   - Sensibilidade ≥ 80% para cada condição
   - Especificidade ≥ 85% para cada condição

### Resultados Esperados
- Relatório completo de validação clínica
- Análise estatística (Curva ROC, Intervalo de Confiança)
- Documentação de casos discordantes

### Responsáveis
- Coordenador: Dr. [Nome] (CRM XXXX)
- Estatístico: [Nome]
- Período: 6 meses
```

#### **4. Manual do Usuário**

**Estrutura do Manual:**
```markdown
# Manual do Usuário - NeuroCare Diagnóstico v1.0

## 1. Introdução
### 1.1 Finalidade do Sistema
### 1.2 Público-Alvo
### 1.3 Requisitos Mínimos

## 2. Instalação e Configuração
### 2.1 Instalação
### 2.2 Primeiro Acesso
### 2.3 Configurações Iniciais

## 3. Funcionalidades
### 3.1 Cadastro de Pacientes
### 3.2 Upload de Exames
### 3.3 Avaliações Neurológicas
### 3.4 Interpretação por IA
### 3.5 Geração de Laudos

## 4. Segurança e Privacidade
### 4.1 Autenticação
### 4.2 Níveis de Acesso
### 4.3 LGPD

## 5. Manutenção e Suporte
### 5.1 Atualizações
### 5.2 Contato com Suporte
### 5.3 Resolução de Problemas

## 6. Avisos e Precauções
⚠️ **IMPORTANTE:**
- Este sistema é uma ferramenta de apoio à decisão clínica
- O diagnóstico final SEMPRE deve ser realizado por médico especialista
- Não substitui avaliação clínica completa e julgamento profissional
- Requer validação dos resultados por profissional habilitado

## 7. Referências
### 7.1 Bases Científicas
### 7.2 Bibliografiaografia
```

### 7.4 Processo de Registro na ANVISA

#### **Fluxo Completo**

```
1. Preparação de Documentação (3-6 meses)
   ├── Dossiê Técnico
   ├── Análise de Riscos
   ├── Validação Clínica
   └── Manual do Usuário

2. Protocolo na ANVISA (via Peticionamento Eletrônico)
   ├── Criação de conta no sistema
   ├── Pagamento de taxas (~R$ 8.000-15.000)
   └── Envio de documentação digitalizada

3. Análise pela ANVISA (6-12 meses)
   ├── Análise documental
   ├── Possíveis exigências técnicas
   └── Inspeção (se necessário)

4. Certificação (após aprovação)
   ├── Registro concedido (número ANVISA)
   ├── Publicação em Diário Oficial
   └── Autorização para comercialização

5. Manutenção (anual)
   ├── Revalidação periódica
   ├── Notificação de mudanças
   └── Relatórios de farmacovigilância
```

#### **Custos Estimados**

| Item | Custo (R$) |
|------|-----------|
| Taxa de Registro ANVISA | 8.000 - 15.000 |
| Consultoria Regulatória | 20.000 - 50.000 |
| Validação Clínica | 30.000 - 100.000 |
| Certificação ISO 13485 (opcional) | 15.000 - 30.000 |
| Documentação Técnica | 10.000 - 20.000 |
| **TOTAL** | **83.000 - 215.000** |

**Tempo Total:** 12-24 meses

### 7.5 Pós-Registro: Manutenção de Conformidade

#### **Farmacovigilância**

**Obrigações:**
- Notificar incidentes adversos à ANVISA (prazo: 72h para graves)
- Manter registro de reclamações de usuários
- Investigar falhas e bugs reportados
- Implementar ações corretivas

**Modelo de Notificação:**
```markdown
## Notificação de Incidente Adverso

**Data do Incidente:** [Data]
**Produto:** NeuroCare Diagnóstico v1.0
**Registro ANVISA:** [Número]
**Descrição:** [Descrição detalhada do incidente]
**Paciente Afetado:** Sim / Não
**Severidade:** Grave / Moderada / Baixa
**Causa Raiz:** [Análise preliminar]
**Ação Imediata:** [Ação tomada]
**Ação Preventiva:** [Plano de correção]
**Responsável:** [Nome + Cargo]
```

#### **Gestão de Versões**

**Requisitos:**
- Toda atualização deve ser documentada
- Mudanças críticas exigem nova validação
- Notificar ANVISA sobre atualizações significativas

**Changelog Regulatório:**
```markdown
# NeuroCare Diagnóstico - Changelog

## v1.1.0 (2026-06-01)
**Tipo:** Atualização de Manutenção
**Notificado à ANVISA:** Sim (Protocolo: XXXX)

### Adicionado
- Nova escala cognitiva (CDR)
- Exportação em formato DICOM

### Corrigido
- Bug no cálculo de probabilidade de Alzheimer (#123)
- Erro de arredondamento em escores MMSE (#145)

### Segurança
- Atualização de dependências com vulnerabilidades
- Reforço na validação de entrada de usuário

### Validação
- Testes de regressão: 100% aprovados
- Análise de impacto: Baixo risco
```

#### **Auditoria Interna**

**Frequência:** Semestral

**Checklist de Auditoria:**
- [ ] Todos os requisitos regulatórios estão sendo atendidos
- [ ] Sistema de gestão da qualidade está ativo
- [ ] Backups estão sendo realizados conforme especificado
- [ ] Logs de auditoria estão completos e acessíveis
- [ ] Incidentes reportados foram investigados e resolvidos
- [ ] Validações de software foram realizadas após atualizações
- [ ] Manual do usuário está atualizado
- [ ] Treinamento de usuários está documentado

---

## 8. ROADMAP DE IMPLEMENTAÇÃO

### 8.1 Visão Geral

**Duração Total:** 9-12 meses
**Equipe Estimada:** 4-6 desenvolvedores + 1 gerente de projeto + 1 especialista regulatório

### 8.2 Fases do Projeto

```
Mês 1-2: Setup e Migração Inicial
├── Sprint 1: Setup do projeto React
├── Sprint 2: Componentes base
└── Sprint 3: Migração de páginas essenciais

Mês 3-4: Features Core
├── Sprint 4: Sistema de autenticação
├── Sprint 5: CRUD completo de pacientes
└── Sprint 6: Sistema de exames e avaliações

Mês 5-6: Offline-First e Sincronização
├── Sprint 7: IndexedDB e Service Workers
├── Sprint 8: Sistema de sincronização
└── Sprint 9: Testes de conectividade

Mês 7-8: Segurança e Conformidade
├── Sprint 10: Implementação de segurança
├── Sprint 11: Auditoria e logs
└── Sprint 12: Criptografia e backup

Mês 9: Testes e Validação
├── Sprint 13: Testes unitários e integração
├── Sprint 14: Testes E2E e UAT
└── Sprint 15: Correções finais

Mês 10-12: Regulatório e Lançamento
├── Sprint 16: Documentação ANVISA
├── Sprint 17: Validação clínica
├── Sprint 18: Preparação para produção
└── Sprint 19: Deploy e monitoramento
```

### 8.3 Detalhamento por Sprint

#### **Sprint 1: Setup do Projeto React (Semana 1-2)**

**Objetivo:** Criar estrutura base do projeto React com TypeScript

**Tarefas:**
- [ ] Criar projeto com Vite + React + TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Setup ESLint + Prettier + Husky
- [ ] Configurar estrutura de diretórios
- [ ] Configurar ambiente de desenvolvimento (.env)
- [ ] Setup de Git (branches, commits convencionais)
- [ ] Documentação inicial (README.md)

**Entregáveis:**
- ✅ Projeto React funcional
- ✅ Build pipeline configurado
- ✅ Linting e formatação automática

**Equipe:** 2 desenvolvedores

#### **Sprint 2: Componentes Base (Semana 3-4)**

**Objetivo:** Criar design system com componentes reutilizáveis

**Tarefas:**
- [ ] Implementar Button (5 variantes)
- [ ] Implementar Input, Textarea, Select
- [ ] Implementar Card, Modal, Toast
- [ ] Implementar Table, Tabs, Badge
- [ ] Implementar Loader, Avatar
- [ ] Implementar Layout (Header, Sidebar, MainLayout)
- [ ] Configurar Storybook
- [ ] Documentar componentes

**Entregáveis:**
- ✅ 15+ componentes reutilizáveis
- ✅ Storybook funcional
- ✅ Documentação de uso

**Equipe:** 2 desenvolvedores frontend

#### **Sprint 3: Migração de Páginas Essenciais (Semana 5-6)**

**Objetivo:** Migrar Login, Registro e Dashboard para React

**Tarefas:**
- [ ] Página de Login (com validação)
- [ ] Página de Registro
- [ ] Dashboard (cards, gráficos)
- [ ] Sistema de rotas (React Router)
- [ ] Context de Autenticação básico
- [ ] Integração com API mockada
- [ ] Testes de páginas

**Entregáveis:**
- ✅ 3 páginas funcionais
- ✅ Roteamento configurado
- ✅ Autenticação básica

**Equipe:** 3 desenvolvedores

#### **Sprint 4: Sistema de Autenticação (Semana 7-8)**

**Objetivo:** Implementar autenticação completa com JWT e 2FA

**Tarefas:**
- [ ] Backend: API de autenticação (Node.js + Express)
- [ ] JWT tokens (access + refresh)
- [ ] Sistema de 2FA (TOTP)
- [ ] Protected Routes
- [ ] Interceptor Axios para refresh automático
- [ ] Tela de configuração de 2FA
- [ ] Testes de autenticação

**Entregáveis:**
- ✅ Sistema de auth completo
- ✅ 2FA funcional
- ✅ Token refresh automático

**Equipe:** 2 backend + 1 frontend

#### **Sprint 5: CRUD Completo de Pacientes (Semana 9-10)**

**Objetivo:** Implementar gestão completa de pacientes

**Tarefas:**
- [ ] API de pacientes (CRUD)
- [ ] Página de listagem com busca e filtros
- [ ] Formulário de cadastro com validação
- [ ] Página de detalhes do paciente
- [ ] Edição inline
- [ ] Modal de histórico
- [ ] Hook usePatients
- [ ] Testes unitários

**Entregáveis:**
- ✅ CRUD completo de pacientes
- ✅ Busca e filtros
- ✅ Validações

**Equipe:** 2 fullstack

#### **Sprint 6: Sistema de Exames e Avaliações (Semana 11-12)**

**Objetivo:** Implementar upload, visualização e gerenciamento de exames

**Tarefas:**
- [ ] API de exames (CRUD + upload)
- [ ] Upload de arquivos (EEG, DICOM, PDF)
- [ ] Timeline de exames
- [ ] Filtros por categoria
- [ ] Visualizadores básicos (EEG, DICOM)
- [ ] Comparação lado a lado
- [ ] API de avaliações (CRUD)
- [ ] Formulários de escalas cognitivas (MMSE, MoCA)

**Entregáveis:**
- ✅ Sistema de exames funcional
- ✅ Upload de arquivos
- ✅ Timeline interativa
- ✅ Avaliações cognitivas

**Equipe:** 3 fullstack

#### **Sprint 7: IndexedDB e Service Workers (Semana 13-14)**

**Objetivo:** Implementar persistência local

**Tarefas:**
- [ ] Configurar Dexie.js (IndexedDB)
- [ ] Schema de banco de dados local
- [ ] Service Worker para cache
- [ ] Estratégias de cache (Network-First, Cache-First)
- [ ] Migração de LocalStorage para IndexedDB
- [ ] Compressão de arquivos grandes
- [ ] Testes de storage

**Entregáveis:**
- ✅ IndexedDB funcional
- ✅ Service Workers registrados
- ✅ Cache offline

**Equipe:** 2 desenvolvedores frontend

#### **Sprint 8: Sistema de Sincronização (Semana 15-16)**

**Objetivo:** Implementar sincronização offline-first

**Tarefas:**
- [ ] Detecção de conectividade
- [ ] Fila de sincronização
- [ ] Sync automática (pull + push)
- [ ] Resolução de conflitos (LWW)
- [ ] Indicadores de status de sync
- [ ] Retry automático com backoff exponencial
- [ ] Testes de sincronização

**Entregáveis:**
- ✅ Sincronização automática
- ✅ Resolução de conflitos
- ✅ UI de status

**Equipe:** 2 fullstack

#### **Sprint 9: Testes de Conectividade (Semana 17-18)**

**Objetivo:** Validar funcionamento offline

**Tarefas:**
- [ ] Testes de cenários offline
- [ ] Testes de reconexão
- [ ] Testes de conflitos
- [ ] Testes de performance (storage limits)
- [ ] Testes de sincronização em massa
- [ ] Documentação de limitações

**Entregáveis:**
- ✅ Suite de testes offline
- ✅ Relatório de testes

**Equipe:** 2 QA

#### **Sprint 10: Implementação de Segurança (Semana 19-20)**

**Objetivo:** Implementar medidas de segurança

**Tarefas:**
- [ ] Criptografia AES-256 (dados em repouso)
- [ ] HTTPS/TLS 1.3 (dados em trânsito)
- [ ] Sanitização de inputs (DOMPurify)
- [ ] Content Security Policy
- [ ] Proteção CSRF
- [ ] Rate limiting
- [ ] Validação de schemas (Zod)
- [ ] Testes de segurança (OWASP Top 10)

**Entregáveis:**
- ✅ Criptografia implementada
- ✅ Proteções contra XSS, CSRF, SQLi
- ✅ Rate limiting

**Equipe:** 2 backend + 1 security specialist

#### **Sprint 11: Auditoria e Logs (Semana 21-22)**

**Objetivo:** Implementar sistema de auditoria

**Tarefas:**
- [ ] Modelo de audit log
- [ ] API de auditoria
- [ ] Interceptors para log automático
- [ ] Dashboard de auditoria
- [ ] Filtros e buscas
- [ ] Alertas de atividades suspeitas
- [ ] Exportação de logs
- [ ] Retenção de 5 anos (storage)

**Entregáveis:**
- ✅ Sistema de auditoria completo
- ✅ Dashboard de logs
- ✅ Alertas

**Equipe:** 2 fullstack

#### **Sprint 12: Criptografia e Backup (Semana 23-24)**

**Objetivo:** Implementar sistema de backup

**Tarefas:**
- [ ] Scripts de backup (incremental + completo)
- [ ] Criptografia de backups
- [ ] Envio para cloud (AWS S3 Glacier)
- [ ] Cron jobs configurados
- [ ] Testes de restore
- [ ] Documentação de restore
- [ ] Monitoramento de backups

**Entregáveis:**
- ✅ Backup automático
- ✅ Restore testado
- ✅ Criptografia de backups

**Equipe:** 1 backend + 1 DevOps

#### **Sprint 13: Testes Unitários e Integração (Semana 25-26)**

**Objetivo:** Alcançar 80%+ de cobertura de testes

**Tarefas:**
- [ ] Setup Jest + React Testing Library
- [ ] Testes de componentes (15+ componentes)
- [ ] Testes de hooks customizados
- [ ] Testes de services
- [ ] Testes de utils
- [ ] Testes de integração (API)
- [ ] Configurar CI/CD com testes
- [ ] Relatórios de cobertura

**Entregáveis:**
- ✅ 80%+ cobertura de testes
- ✅ CI/CD configurado

**Equipe:** 3 desenvolvedores + 1 QA

#### **Sprint 14: Testes E2E e UAT (Semana 27-28)**

**Objetivo:** Validar fluxos completos

**Tarefas:**
- [ ] Setup Playwright
- [ ] Testes E2E (login, pacientes, exames, relatórios)
- [ ] Testes de acessibilidade (axe-core)
- [ ] Testes de performance (Lighthouse)
- [ ] Testes de compatibilidade (browsers)
- [ ] UAT com usuários reais
- [ ] Coletar feedback
- [ ] Priorizar correções

**Entregáveis:**
- ✅ Suite E2E completa
- ✅ Relatório de UAT
- ✅ Lista de correções

**Equipe:** 2 QA + 3 stakeholders

#### **Sprint 15: Correções Finais (Semana 29-30)**

**Objetivo:** Corrigir bugs críticos do UAT

**Tarefas:**
- [ ] Corrigir bugs de prioridade alta
- [ ] Corrigir bugs de prioridade média
- [ ] Melhorias de UX sugeridas
- [ ] Otimizações de performance
- [ ] Refinamento de UI
- [ ] Revalidar com testes
- [ ] Preparar changelog

**Entregáveis:**
- ✅ Bugs críticos corrigidos
- ✅ Sistema estável

**Equipe:** 4 desenvolvedores

#### **Sprint 16: Documentação ANVISA (Semana 31-34)**

**Objetivo:** Preparar documentação completa para registro

**Tarefas:**
- [ ] Dossiê técnico completo
- [ ] Análise de riscos (FMEA)
- [ ] Especificações técnicas
- [ ] Requisitos funcionais e não-funcionais
- [ ] Diagramas de arquitetura
- [ ] Manual do usuário (50+ páginas)
- [ ] Rotulagem e embalagem
- [ ] Revisão por especialista regulatório

**Entregáveis:**
- ✅ Documentação ANVISA completa
- ✅ Dossiê técnico revisado

**Equipe:** 1 tech writer + 1 especialista regulatório + 1 desenvolvedor

#### **Sprint 17: Validação Clínica (Semana 35-50)**

**Objetivo:** Realizar estudo clínico de validação

**Tarefas:**
- [ ] Elaborar protocolo de pesquisa
- [ ] Submeter ao CEP (Comitê de Ética)
- [ ] Recrutar pacientes (n=200)
- [ ] Coletar dados clínicos
- [ ] Processar dados no sistema
- [ ] Comparar com gold-standard
- [ ] Análise estatística
- [ ] Relatório final

**Entregáveis:**
- ✅ Protocolo aprovado pelo CEP
- ✅ Relatório de validação clínica
- ✅ Análise estatística (sensibilidade, especificidade)

**Equipe:** 1 coordenador médico + 2 médicos avaliadores + 1 estatístico

**Duração:** 16 semanas (paralelo a outros sprints)

#### **Sprint 18: Preparação para Produção (Semana 36-38)**

**Objetivo:** Preparar ambiente de produção

**Tarefas:**
- [ ] Configurar infraestrutura (AWS/Azure)
- [ ] Setup de monitoramento (DataDog/New Relic)
- [ ] Configurar alertas
- [ ] Setup de CI/CD para produção
- [ ] Configurar domínio e SSL
- [ ] Configurar WAF (Web Application Firewall)
- [ ] Configurar backups em produção
- [ ] Testes de carga e stress
- [ ] Plano de rollback

**Entregáveis:**
- ✅ Infraestrutura de produção
- ✅ Monitoramento configurado
- ✅ Plano de deploy

**Equipe:** 2 DevOps + 1 SRE

#### **Sprint 19: Deploy e Monitoramento (Semana 39-40)**

**Objetivo:** Lançar em produção

**Tarefas:**
- [ ] Deploy em staging
- [ ] Testes finais em staging
- [ ] Deploy em produção (blue-green)
- [ ] Smoke tests em produção
- [ ] Monitorar métricas (uptime, latência, erros)
- [ ] Configurar suporte ao usuário
- [ ] Documentar runbooks
- [ ] Treinamento de equipe de suporte

**Entregáveis:**
- ✅ Sistema em produção
- ✅ Monitoramento ativo
- ✅ Equipe de suporte treinada

**Equipe:** 2 DevOps + 4 desenvolvedores + 2 suporte

### 8.4 Milestones Principais

| Marco | Data | Descrição |
|-------|------|-----------|
| **M1: MVP React** | Mês 2 | Projeto React com componentes base funcional |
| **M2: Features Core** | Mês 4 | Autenticação e CRUD de pacientes completos |
| **M3: Offline-First** | Mês 6 | Sistema offline-first funcional |
| **M4: Segurança** | Mês 8 | Segurança e conformidade LGPD implementadas |
| **M5: Testes** | Mês 9 | Suite completa de testes com 80%+ cobertura |
| **M6: Regulatório** | Mês 11 | Documentação ANVISA completa + validação clínica |
| **M7: Produção** | Mês 12 | Sistema em produção com monitoramento |

### 8.5 Gestão de Riscos do Projeto

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Atraso na validação clínica | Alta | Alto | Iniciar protocolo no Mês 3, paralelizar com desenvolvimento |
| Mudanças de requisitos ANVISA | Média | Alto | Contratar especialista regulatório desde o início |
| Problemas de performance offline | Média | Médio | Testes extensivos de storage limits e sincronização |
| Bugs em produção críticos | Baixa | Alto | Alta cobertura de testes (80%+), testes E2E, UAT rigoroso |
| Equipe insuficiente | Média | Alto | Contratar no início, ter desenvolvedores sênior na equipe |

---

## 9. ESTIMATIVAS E RECURSOS

### 9.1 Equipe Necessária

#### **Time Core (Full-time)**

| Função | Quantidade | Custo Mensal (R$) | Duração (meses) | Total (R$) |
|--------|------------|-------------------|-----------------|------------|
| **Tech Lead** | 1 | 18.000 | 12 | 216.000 |
| **Desenvolvedor Sênior (Fullstack)** | 2 | 15.000 | 12 | 360.000 |
| **Desenvolvedor Pleno (Frontend)** | 2 | 10.000 | 10 | 200.000 |
| **Desenvolvedor Pleno (Backend)** | 1 | 10.000 | 8 | 80.000 |
| **DevOps/SRE** | 1 | 13.000 | 8 | 104.000 |
| **QA Engineer** | 1 | 9.000 | 6 | 54.000 |
| **Gerente de Projeto** | 1 | 12.000 | 12 | 144.000 |
| **Tech Writer** | 1 | 7.000 | 4 | 28.000 |
| **SUBTOTAL** | 10 | - | - | **1.186.000** |

#### **Especialistas (Part-time/Consultoria)**

| Função | Custo Total (R$) |
|--------|------------------|
| **Especialista Regulatório ANVISA** | 50.000 |
| **Médico Coordenador (Validação Clínica)** | 40.000 |
| **Médicos Avaliadores (2x)** | 60.000 |
| **Estatístico** | 20.000 |
| **Security Specialist (Penetration Test)** | 15.000 |
| **SUBTOTAL** | **185.000** |

### 9.2 Infraestrutura e Ferramentas

| Item | Custo Mensal (R$) | Duração (meses) | Total (R$) |
|------|-------------------|-----------------|------------|
| **AWS/Azure (Dev + Staging)** | 2.000 | 12 | 24.000 |
| **AWS/Azure (Produção)** | 5.000 | 3 | 15.000 |
| **GitHub Enterprise** | 500 | 12 | 6.000 |
| **Monitoramento (DataDog)** | 800 | 12 | 9.600 |
| **CI/CD (GitHub Actions)** | 200 | 12 | 2.400 |
| **Ferramentas de Design (Figma)** | 300 | 12 | 3.600 |
| **Ferramentas de Gestão (Jira/Linear)** | 400 | 12 | 4.800 |
| **SUBTOTAL** | - | - | **65.400** |

### 9.3 Certificações e Registro

| Item | Custo (R$) |
|------|-----------|
| **Taxa de Registro ANVISA** | 12.000 |
| **Consultoria Regulatória (contínua)** | 50.000 |
| **Validação Clínica (pesquisa)** | 80.000 |
| **Certificação ISO 13485 (opcional)** | 25.000 |
| **Documentação Técnica** | 20.000 |
| **SUBTOTAL** | **187.000** |

### 9.4 Outros Custos

| Item | Custo (R$) |
|------|-----------|
| **Licenças de Software** | 15.000 |
| **Treinamento de Equipe** | 10.000 |
| **Marketing e Lançamento** | 30.000 |
| **Reserva para Contingências (15%)** | 227.100 |
| **SUBTOTAL** | **282.100** |

### 9.5 Resumo de Custos

| Categoria | Valor (R$) |
|-----------|-----------|
| **Equipe Core** | 1.186.000 |
| **Especialistas** | 185.000 |
| **Infraestrutura** | 65.400 |
| **Certificações e Registro** | 187.000 |
| **Outros** | 282.100 |
| **TOTAL GERAL** | **1.905.500** |

**Custo Total do Projeto:** R$ 1.905.500,00
**Duração:** 12 meses
**Custo Médio Mensal:** R$ 158.791,67

### 9.6 ROI e Justificativa de Investimento

#### **Receita Potencial (Pós-Lançamento)**

**Modelo de Negócio: SaaS (Software as a Service)**

| Plano | Usuários/mês | Preço (R$/mês) | Receita Mensal (R$) | Receita Anual (R$) |
|-------|--------------|----------------|---------------------|-------------------|
| **Básico** | 50 | 300 | 15.000 | 180.000 |
| **Pro** | 30 | 600 | 18.000 | 216.000 |
| **Enterprise** | 10 | 1.500 | 15.000 | 180.000 |
| **TOTAL** | 90 | - | **48.000** | **576.000** |

**Premissas:**
- Penetração de mercado: 90 clínicas/hospitais no primeiro ano
- Taxa de cancelamento (churn): 10% ao ano
- Crescimento anual: 30%

**Payback Period:**
Investimento: R$ 1.905.500
Receita Anual: R$ 576.000
**Payback: ~3,3 anos**

**ROI em 5 anos:**
- Receita Total (5 anos com crescimento): ~R$ 4.200.000
- Custo Total (inicial + manutenção): ~R$ 2.500.000
- **ROI: 68%**

### 9.7 Próximos Passos Recomendados

**Imediato (Semana 1-4):**
1. ✅ Aprovar orçamento e escopo
2. ✅ Contratar gerente de projeto e tech lead
3. ✅ Contratar especialista regulatório ANVISA
4. ✅ Setup de infraestrutura inicial (GitHub, Jira, ambientes)

**Curto Prazo (Mês 1-3):**
1. ✅ Montar equipe completa (8-10 pessoas)
2. ✅ Iniciar Sprint 1 (Setup do projeto React)
3. ✅ Iniciar elaboração de protocolo de validação clínica
4. ✅ Submeter protocolo ao CEP

**Médio Prazo (Mês 4-9):**
1. ✅ Desenvolver features core e offline-first
2. ✅ Implementar segurança e conformidade
3. ✅ Realizar validação clínica (paralelo)
4. ✅ Executar testes completos

**Longo Prazo (Mês 10-12):**
1. ✅ Preparar documentação ANVISA
2. ✅ Protocolar registro na ANVISA
3. ✅ Deploy em produção
4. ✅ Iniciar comercialização

---

## 10. CONCLUSÃO

Este plano de melhorias transforma o NeuroCare Diagnóstico de uma aplicação vanilla JavaScript em uma solução moderna, escalável, segura e regulamentada.

### Benefícios Principais

**Técnicos:**
- ✅ Migração para React/TypeScript aumenta manutenibilidade
- ✅ Offline-first garante usabilidade em qualquer contexto
- ✅ Arquitetura modular facilita escalabilidade
- ✅ Testes automatizados (80%+ cobertura) reduzem bugs

**Segurança:**
- ✅ Criptografia AES-256 e HTTPS/TLS 1.3
- ✅ Autenticação robusta com 2FA
- ✅ Auditoria completa de todas as ações
- ✅ Proteção contra OWASP Top 10

**Regulatório:**
- ✅ Conformidade ANVISA completa
- ✅ Conformidade LGPD
- ✅ Validação clínica com 200+ pacientes
- ✅ Documentação técnica completa

**Negócio:**
- ✅ Permite comercialização legal no Brasil
- ✅ Diferencial competitivo (offline-first, IA interpretável)
- ✅ ROI positivo em ~3,3 anos
- ✅ Escalabilidade para milhares de usuários

### Próxima Ação

**Decisão necessária:** Aprovar orçamento de R$ 1.905.500 e roadmap de 12 meses para iniciar Sprint 1.

---

**Documento elaborado por:** Claude Code AI
**Data:** 13 de Janeiro de 2026
**Versão:** 1.0
**Status:** Aguardando Aprovação
