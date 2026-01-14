# Práticas de Segurança

## Criptografia de Dados

### Campos Criptografados

Os seguintes campos contêm dados sensíveis e são criptografados com AES-256:

| Entidade | Campo | Descrição |
|----------|-------|-----------|
| Patient | `historicoMedicoEnc` | Histórico médico completo |
| Evaluation | `mmseResultEnc` | Resultado do teste MMSE |
| Evaluation | `mocaResultEnc` | Resultado do teste MoCA |
| Evaluation | `clockTestEnc` | Resultado do teste do relógio |

### Chave de Criptografia

- Mínimo 32 caracteres
- Armazenada em variável de ambiente (`VITE_ENCRYPTION_KEY`)
- Nunca commitada no repositório
- Mesma chave deve ser usada em frontend e backend

```bash
# Gerar chave segura
openssl rand -base64 32
```

## Autenticação

### Firebase Authentication

- Autenticação via email/senha
- Tokens JWT gerenciados pelo Firebase
- Sessões com expiração automática

### Boas Práticas

1. **Senhas fortes**: Mínimo 8 caracteres, números e símbolos
2. **2FA**: Habilitar autenticação de dois fatores quando disponível
3. **Logout automático**: Sessão expira após inatividade

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas usuários autenticados podem acessar
    function isAuthenticated() {
      return request.auth != null;
    }

    // Usuários só podem acessar seus próprios dados
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Regras por coleção
    match /patients/{doc} {
      allow read, write: if isAuthenticated();
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

## Armazenamento de Secrets

### GitHub Secrets

Secrets são armazenados criptografados no GitHub:

1. `FIREBASE_API_KEY`
2. `FIREBASE_AUTH_DOMAIN`
3. `FIREBASE_PROJECT_ID`
4. `FIREBASE_STORAGE_BUCKET`
5. `FIREBASE_MESSAGING_SENDER_ID`
6. `FIREBASE_APP_ID`
7. `ENCRYPTION_KEY`

### Variáveis Locais

```bash
# Nunca commitar arquivos .env
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

## LGPD Compliance

### Direitos do Titular

1. **Acesso**: Usuários podem visualizar seus dados
2. **Correção**: Dados podem ser editados
3. **Exclusão**: Soft delete implementado
4. **Portabilidade**: Exportação em PDF

### Logs de Auditoria

- Todas as operações são registradas
- Logs incluem: usuário, ação, timestamp, IP
- Retenção de 90 dias

## Checklist de Segurança

- [ ] Chave de criptografia com 32+ caracteres
- [ ] Firebase Security Rules configuradas
- [ ] GitHub Secrets configurados
- [ ] .env adicionado ao .gitignore
- [ ] HTTPS habilitado (GitHub Pages usa por padrão)
- [ ] Headers de segurança configurados
