# Configuração do Firebase

## Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: neurocare-system)
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

## Configurar Firestore

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione "Iniciar no modo de produção"
4. Escolha a localização mais próxima (ex: southamerica-east1)
5. Clique em "Ativar"

## Configurar Authentication

1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Na aba "Sign-in method", ative "E-mail/senha"
4. Clique em "Salvar"

## Obter Credenciais

1. No menu lateral, clique na engrenagem > "Configurações do projeto"
2. Role até "Seus apps" e clique no ícone da Web `</>`
3. Dê um nome ao app (ex: neurocare-web)
4. Copie as credenciais:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Configurar Security Rules

1. No Firestore, clique na aba "Regras"
2. Cole as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    match /patients/{patientId} {
      allow read, write: if isAuthenticated();
    }
    match /evaluations/{evaluationId} {
      allow read, write: if isAuthenticated();
    }
    match /exams/{examId} {
      allow read, write: if isAuthenticated();
    }
    match /reports/{reportId} {
      allow read, write: if isAuthenticated();
    }
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

3. Clique em "Publicar"

## Estrutura de Coleções

```
firestore/
├── users/                    # Usuários do sistema
│   └── {userId}/
│       ├── email
│       ├── nome
│       ├── crm
│       └── ...
│
├── patients/                 # Pacientes
│   └── {patientId}/
│       ├── nome
│       ├── cpf
│       ├── historicoMedicoEnc  # Criptografado
│       └── ...
│
├── evaluations/              # Avaliações neurológicas
│   └── {evaluationId}/
│       ├── patientId
│       ├── mmseResultEnc       # Criptografado
│       ├── mocaResultEnc       # Criptografado
│       └── ...
│
├── exams/                    # Exames complementares
│   └── {examId}/
│
└── reports/                  # Relatórios
    └── {reportId}/
```

## GitHub Secrets

Configure os seguintes secrets no GitHub:

| Secret | Descrição |
|--------|-----------|
| `FIREBASE_API_KEY` | API Key do Firebase |
| `FIREBASE_AUTH_DOMAIN` | Auth Domain |
| `FIREBASE_PROJECT_ID` | Project ID |
| `FIREBASE_STORAGE_BUCKET` | Storage Bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID |
| `FIREBASE_APP_ID` | App ID |
| `FIREBASE_SERVICE_ACCOUNT` | Service Account JSON (para deploy) |
| `ENCRYPTION_KEY` | Chave de criptografia (32+ chars) |

## Configurar Service Account para Deploy

Para o deploy automático via CI/CD, você precisa criar uma Service Account:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto Firebase
3. Vá para **IAM & Admin** > **Service Accounts**
4. Clique em **Create Service Account**
5. Nome: `github-actions-deploy`
6. Clique em **Create and Continue**
7. Adicione os roles:
   - `Firebase Hosting Admin`
   - `Cloud Run Viewer`
   - `Service Account User`
8. Clique em **Done**
9. Na lista de service accounts, clique nos 3 pontos > **Manage keys**
10. **Add Key** > **Create new key** > **JSON**
11. Salve o arquivo JSON
12. Copie o conteúdo completo do JSON e adicione como secret `FIREBASE_SERVICE_ACCOUNT` no GitHub

## Ambientes de Deploy

O projeto tem dois ambientes de deploy:

### 1. GitHub Pages (IndexedDB)
- **URL**: `https://sistemamedicoufpe.github.io/Projeto-BFD/`
- **Provider**: IndexedDB (offline-only)
- **Uso**: Demo, testes, desenvolvimento
- **Dados**: Armazenados localmente no navegador

### 2. Firebase Hosting (Firebase)
- **URL**: `https://<project-id>.web.app/`
- **Provider**: Firebase (Firestore + Auth)
- **Uso**: Produção
- **Dados**: Sincronizados na nuvem

```
┌─────────────────────────────────────────────────────────────┐
│                      CI/CD Pipeline                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────────────────────────────┐ │
│  │   Lint      │───>│  Build GitHub Pages (IndexedDB)     │ │
│  └─────────────┘    └──────────────┬──────────────────────┘ │
│         │                          │                         │
│         │           ┌──────────────▼──────────────────────┐ │
│         │           │  Deploy to GitHub Pages              │ │
│         │           │  https://...github.io/Projeto-BFD/   │ │
│         │           └─────────────────────────────────────┘ │
│         │                                                    │
│         │           ┌─────────────────────────────────────┐ │
│         └──────────>│  Build Firebase (Firebase Provider) │ │
│                     └──────────────┬──────────────────────┘ │
│                                    │                         │
│                     ┌──────────────▼──────────────────────┐ │
│                     │  Deploy to Firebase Hosting          │ │
│                     │  https://<project>.web.app/          │ │
│                     └─────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Diagramas de Sequência

### Autenticação Firebase

```mermaid
sequenceDiagram
    participant U as Usuário
    participant App as NeuroCare App
    participant FAP as Firebase Auth Provider
    participant FA as Firebase Auth
    participant FS as Firestore

    Note over U,FS: Registro de Novo Usuário

    U->>App: Preenche formulário de registro
    App->>FAP: register(data)
    FAP->>FA: createUserWithEmailAndPassword(email, password)
    FA-->>FAP: Firebase User (uid)

    FAP->>FS: setDoc(users/{uid}, userData)
    FS-->>FAP: OK

    FAP-->>App: { user }
    App->>U: Redireciona para Dashboard

    Note over U,FS: Login

    U->>App: Preenche email e senha
    App->>FAP: login(credentials)
    FAP->>FA: signInWithEmailAndPassword(email, password)
    FA-->>FAP: Firebase User (uid)

    FAP->>FS: getDoc(users/{uid})
    FS-->>FAP: User data

    FAP-->>App: { user }
    App->>U: Redireciona para Dashboard

    Note over U,FS: Verificação de Estado de Auth

    App->>FAP: onAuthStateChange(callback)
    FAP->>FA: onAuthStateChanged(auth, handler)

    Note over FA: Usuário faz login em outra aba
    FA-->>FAP: authStateChanged(user)
    FAP->>FS: getDoc(users/{uid})
    FS-->>FAP: User data
    FAP-->>App: callback(user)
    App->>App: Atualiza estado global
```

### CRUD de Pacientes no Firestore

```mermaid
sequenceDiagram
    participant App as NeuroCare App
    participant FPP as Firebase Patients Provider
    participant ES as Encryption Service
    participant FS as Firestore

    Note over App,FS: Criar Paciente

    App->>ES: encrypt(historicoMedico)
    ES-->>App: encryptedData

    App->>FPP: create(patientData)
    FPP->>FS: addDoc(patients, { ...data, historicoMedicoEnc })
    FS-->>FPP: DocumentReference (id)
    FPP-->>App: { id, ...patientData }

    Note over App,FS: Buscar Pacientes

    App->>FPP: search("João")
    FPP->>FS: query(patients, where nome contains "João")
    FS-->>FPP: QuerySnapshot

    loop Para cada documento
        FPP->>ES: decrypt(doc.historicoMedicoEnc)
        ES-->>FPP: historicoMedico
    end

    FPP-->>App: Patient[]

    Note over App,FS: Atualizar Paciente

    App->>ES: encrypt(historicoMedico)
    ES-->>App: encryptedData

    App->>FPP: update(id, updates)
    FPP->>FS: updateDoc(patients/{id}, { ...updates, updatedAt })
    FS-->>FPP: OK
    FPP-->>App: Updated patient

    Note over App,FS: Excluir Paciente

    App->>FPP: delete(id)
    FPP->>FS: deleteDoc(patients/{id})
    FS-->>FPP: OK
    FPP-->>App: void
```

### Persistência Offline do Firestore

```mermaid
sequenceDiagram
    participant U as Usuário
    participant App as NeuroCare App
    participant FS as Firestore SDK
    participant IDB as IndexedDB (Firestore Cache)
    participant Net as Firebase Servers

    Note over U,Net: Inicialização com Persistência

    App->>FS: initializeFirestore()
    App->>FS: enableIndexedDbPersistence(db)
    FS->>IDB: Cria cache local
    IDB-->>FS: OK
    FS-->>App: Persistência habilitada

    Note over U,Net: Operação Online

    U->>App: Cria paciente
    App->>FS: addDoc(patients, data)
    FS->>Net: Envia para servidor
    Net-->>FS: Confirmação
    FS->>IDB: Atualiza cache local
    FS-->>App: DocumentReference

    Note over U,Net: Operação Offline

    Note over Net: Conexão perdida
    U->>App: Cria outro paciente
    App->>FS: addDoc(patients, data)
    FS->>IDB: Salva no cache local
    FS-->>App: DocumentReference (pendente)

    Note over FS: Operação enfileirada

    Note over Net: Conexão restaurada
    FS->>Net: Sincroniza operações pendentes
    Net-->>FS: Confirmação
    FS->>IDB: Atualiza status

    Note over U,Net: Leitura Offline

    Note over Net: Sem conexão
    U->>App: Lista pacientes
    App->>FS: getDocs(patients)
    FS->>IDB: Busca no cache
    IDB-->>FS: Documentos cacheados
    FS-->>App: QuerySnapshot (do cache)
    App->>U: Exibe lista
```

### Fluxo de Segurança (Security Rules)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant App as NeuroCare App
    participant FS as Firestore SDK
    participant SR as Security Rules
    participant DB as Firestore Database

    Note over U,DB: Acesso Autorizado

    U->>App: Login
    App->>App: Obtém Firebase Auth Token

    U->>App: Solicita lista de pacientes
    App->>FS: getDocs(patients)
    FS->>SR: Verifica: isAuthenticated()
    SR->>SR: request.auth != null?
    Note over SR: ✅ Usuário autenticado
    SR-->>FS: Permitido
    FS->>DB: Executa query
    DB-->>FS: Documentos
    FS-->>App: QuerySnapshot
    App->>U: Exibe dados

    Note over U,DB: Acesso a Dados de Outro Usuário

    U->>App: Tenta acessar /users/{outroUserId}
    App->>FS: getDoc(users/{outroUserId})
    FS->>SR: Verifica regra de users
    SR->>SR: request.auth.uid == userId?
    Note over SR: ❌ UIDs diferentes
    SR-->>FS: Negado
    FS-->>App: Permission Denied Error
    App->>U: "Acesso não autorizado"

    Note over U,DB: Acesso Não Autenticado

    Note over App: Usuário não logado
    App->>FS: getDocs(patients)
    FS->>SR: Verifica: isAuthenticated()
    SR->>SR: request.auth != null?
    Note over SR: ❌ request.auth é null
    SR-->>FS: Negado
    FS-->>App: Permission Denied Error
    App->>U: Redireciona para /login
```
