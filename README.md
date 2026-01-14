# NeuroCare Diagnostic System

Sistema de diagnóstico neurológico para avaliação de demências.

## Quick Start

```bash
# Instalar dependências
pnpm install

# Iniciar em modo desenvolvimento
pnpm dev
```

## Documentação

Veja a pasta [docs/](./docs/) para documentação completa:

- [Setup](./docs/SETUP.md) - Instalação e configuração
- [Firebase](./docs/FIREBASE.md) - Configuração do Firebase
- [Arquitetura](./docs/ARCHITECTURE.md) - Arquitetura do sistema
- [Testes](./docs/TESTING.md) - Guia de testes E2E
- [Deploy](./docs/DEPLOYMENT.md) - Guia de deploy
- [Segurança](./docs/SECURITY.md) - Práticas de segurança

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Database**: Firebase Firestore / PostgreSQL
- **Auth**: Firebase Authentication / JWT

## Funcionalidades

- Gestão de pacientes e prontuários
- Testes cognitivos (MMSE, MoCA, Clock Drawing)
- Geração de relatórios em PDF
- Funcionamento offline-first
- PWA instalável

## License

MIT
