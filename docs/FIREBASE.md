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
| `ENCRYPTION_KEY` | Chave de criptografia (32+ chars) |
