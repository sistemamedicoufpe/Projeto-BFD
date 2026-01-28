# 🧠 NeuroCare - Sistema de Avaliação Neurológica

Sistema completo de diagnóstico neurológico para avaliação de demências, com suporte a testes cognitivos padronizados (MMSE, MoCA, Clock Drawing), análise com IA local e geração de relatórios médicos em PDF.

---

## 📋 Índice

- [Manual de Uso](#-manual-de-uso)
  - [1. Acesso ao Sistema](#1-acesso-ao-sistema)
  - [2. Gestão de Pacientes](#2-gestão-de-pacientes)
  - [3. Avaliações Neurológicas](#3-avaliações-neurológicas)
  - [4. Testes Cognitivos](#4-testes-cognitivos)
  - [5. Análise com IA](#5-análise-com-ia)
  - [6. Geração de Relatórios](#6-geração-de-relatórios)
  - [7. Configurações](#7-configurações)
- [Documentação Técnica](#-documentação-técnica)
- [Instalação](#-instalação)

---

## 📖 Manual de Uso

### 1. Acesso ao Sistema

#### 1.1 Registro de Novo Usuário

1. Acesse a aplicação pelo navegador: https://github.com/sistemamedicoufpe/Projeto-BFD.git
2. Na tela de login, clique em **"Registre-se aqui"**
3. Preencha o formulário:
   - **Nome completo**: Seu nome profissional
   - **Email**: Email válido para acesso
   - **CRM** (opcional): Registro médico no formato `123456-SP`
   - **Especialidade** (opcional): Ex: Neurologia, Geriatria
   - **Senha**: Mínimo 6 caracteres
   - **Confirmar senha**: Repetir a senha
4. Clique em **"Criar conta"**

> **Dica**: O sistema mostra em tempo real a força da sua senha com sugestões de melhoria.

#### 1.2 Login

1. Na tela inicial, insira:
   - **Email**: Seu email cadastrado
   - **Senha**: Sua senha
2. Clique em **"Entrar"**

> **Nota**: O sistema mantém você conectado automaticamente. Para sair, clique no botão de logout no menu superior.

---

### 2. Gestão de Pacientes

#### 2.1 Cadastrar Novo Paciente

1. No menu lateral, clique em **"Pacientes"**
2. Clique no botão **"+ Novo Paciente"**
3. Preencha os dados obrigatórios:
   - **Nome completo**
   - **CPF**
   - **Data de nascimento**
   - **Gênero**: Masculino, Feminino ou Outro
4. Dados opcionais:
   - **RG**
   - **Email e telefones**
   - **Endereço completo**
   - **Histórico médico**
   - **Alergias** (adicione múltiplas com Enter)
   - **Medicamentos em uso** (adicione múltiplos com Enter)
   - **Responsável**: Nome e telefone
   - **Observações**
5. Clique em **"Salvar"**

#### 2.2 Buscar Pacientes

- Use a barra de busca no topo da lista
- Busque por **nome** ou **CPF**
- A filtragem é em tempo real

#### 2.3 Visualizar Detalhes do Paciente

1. Na lista de pacientes, clique em **"Ver"**
2. Você verá:
   - **Dados cadastrais** completos
   - **Lista de avaliações** realizadas
   - **Exames** cadastrados
   - **Análise de IA** (evolução longitudinal)

#### 2.4 Editar Paciente

1. Na lista ou na página de detalhes, clique em **"Editar"**
2. Modifique os dados necessários
3. Clique em **"Salvar"**

#### 2.5 Excluir Paciente

1. Na lista de pacientes, clique em **"Excluir"**
2. Confirme a exclusão no modal
3. **Atenção**: Esta ação não pode ser desfeita

---

### 3. Avaliações Neurológicas

#### 3.1 Criar Nova Avaliação

1. Acesse a página do paciente
2. Clique em **"Nova Avaliação"** ou vá em **Menu > Avaliações > Nova Avaliação**
3. Preencha os dados da consulta:
   - **Paciente**: Selecione da lista
   - **Data da avaliação**
   - **Médico responsável**
   - **Queixa principal**: Motivo da consulta
   - **História da doença atual**: Evolução dos sintomas
   - **Exame neurológico**: Achados do exame físico
   - **Hipótese diagnóstica**: Diagnósticos possíveis
   - **Conduta**: Tratamento proposto
   - **Retorno**: Data da próxima consulta
   - **Exames solicitados**: Lista de exames
   - **Observações**
4. Clique em **"Salvar"** ou **"Salvar e Aplicar Testes"**

> **Dica**: Ao escolher "Salvar e Aplicar Testes", você será direcionado para a aplicação dos testes cognitivos.

#### 3.2 Aplicar Testes Cognitivos na Avaliação

Após criar a avaliação, você pode aplicar 3 testes:
- **MMSE** (Mini-Mental State Examination)
- **MoCA** (Montreal Cognitive Assessment)
- **Clock Drawing Test** (Teste do Desenho do Relógio)

---

### 4. Testes Cognitivos

#### 4.1 MMSE (Mini-Mental State Examination)

**Pontuação**: 0-30 pontos | **Duração**: 5-10 minutos

**Domínios avaliados**:
1. **Orientação Temporal** (5 pontos): Dia, mês, ano, dia da semana, estação
2. **Orientação Espacial** (5 pontos): Local, andar, cidade, estado, país
3. **Registro** (3 pontos): Repetir 3 palavras
4. **Atenção e Cálculo** (5 pontos): Subtrair 7 de 100, 5 vezes consecutivas
5. **Evocação** (3 pontos): Lembrar as 3 palavras anteriores
6. **Linguagem** (8 pontos): Nomear objetos, repetir frase, comando triplo
7. **Capacidade Visual-Construtiva** (1 ponto): Copiar pentágonos

**Como aplicar**:
1. Na avaliação, vá para a aba **"Testes Cognitivos"**
2. Selecione **"MMSE"**
3. Aplique cada item seguindo as instruções na tela
4. Marque a pontuação de cada domínio
5. O sistema calcula automaticamente o **escore total**
6. Veja a **interpretação automática**:
   - 27-30: Normal
   - 24-26: Comprometimento leve
   - 19-23: Comprometimento moderado
   - <19: Comprometimento grave

#### 4.2 MoCA (Montreal Cognitive Assessment)

**Pontuação**: 0-30 pontos | **Duração**: 10-15 minutos

**Domínios avaliados**:
1. **Visuoespacial/Executivo** (5 pontos): Trilhas, cubo, relógio
2. **Nomeação** (3 pontos): Leão, rinoceronte, camelo
3. **Memória** (0 pontos no momento): Registrar 5 palavras
4. **Atenção** (6 pontos): Dígitos, detecção de letra A, subtração
5. **Linguagem** (3 pontos): Repetir frases, fluência verbal
6. **Abstração** (2 pontos): Semelhanças
7. **Evocação Tardia** (5 pontos): Lembrar as 5 palavras
8. **Orientação** (6 pontos): Data, mês, ano, dia, local, cidade

**Como aplicar**:
1. Selecione **"MoCA"** na aba de testes
2. Aplique cada subitem
3. O sistema adiciona automaticamente **+1 ponto** se escolaridade ≤ 12 anos
4. **Ponto de corte**: <26 indica comprometimento cognitivo

#### 4.3 Clock Drawing Test (Teste do Desenho do Relógio)

**Pontuação**: 0-10 pontos | **Duração**: 2-5 minutos

**Critérios de avaliação**:
1. **Círculo do relógio** (2 pontos): Forma circular adequada
2. **Números** (4 pontos): Todos os 12 números, posição correta
3. **Ponteiros** (4 pontos): Dois ponteiros, comprimento adequado, hora correta

**Como aplicar**:
1. Peça ao paciente: *"Desenhe um relógio mostrando 11 horas e 10 minutos"*
2. No sistema, selecione **"Clock Drawing"**
3. Avalie o desenho segundo os critérios
4. Marque a pontuação de cada domínio
5. O sistema calcula o total automaticamente

---

### 5. Análise com IA

#### 5.1 Ativação da IA Local

1. Vá em **Menu > Configurações**
2. Na seção **"Inteligência Artificial"**:
   - Ative **"Habilitar IA"**
   - Selecione **"Modelo Local"** para processamento offline
3. Clique em **"Salvar Configurações"**

> **Privacidade**: O modelo de IA roda 100% no navegador. Nenhum dado sai do seu dispositivo.

#### 5.2 Análise Diagnóstica Automática

Após aplicar os testes cognitivos:

1. Na página da avaliação, vá para a aba **"Análise de IA"**
2. Clique em **"🤖 Gerar Diagnóstico com IA"**
3. O sistema analisa:
   - Scores dos testes (MMSE, MoCA, Clock Drawing)
   - Idade do paciente
   - Escolaridade
   - Padrão de déficits cognitivos
4. Receba:
   - **Hipóteses diagnósticas** com probabilidades
   - **Códigos CID-10**
   - **Fundamentação clínica**
   - **Recomendações de conduta**

**Diagnósticos possíveis**:
- Doença de Alzheimer (DA)
- Demência com Corpos de Lewy (DCL)
- Demência Frontotemporal (DFT)
- Demência Vascular (DV)
- Comprometimento Cognitivo Leve (CCL)
- Cognição Normal

#### 5.3 Análise Longitudinal

Para pacientes com múltiplas avaliações:

1. Acesse a página do paciente
2. Vá para a aba **"Análise de IA"**
3. Clique em **"Analisar Evolução"**
4. Visualize:
   - **Gráfico de evolução** dos scores ao longo do tempo
   - **Detecção de deterioração** automática
   - **Alertas de progressão** (Normal → CCL → Demência)
   - **Estatísticas**: Confiança média, número de análises

#### 5.4 Correlação de Exames

Para exames complementares (MRI, CT, EEG, Labs):

1. Na página do exame, clique em **"🔍 Gerar Correlação Clínica"**
2. O sistema analisa:
   - Resultados do exame
   - Testes cognitivos do paciente
   - Evolução temporal
3. Receba:
   - **Correlação clínico-radiológica** (para exames de imagem)
   - **Correlação neurofisiológica** (para EEG)
   - **Exclusão de causas reversíveis** (para exames laboratoriais)

---

### 6. Geração de Relatórios

#### 6.1 Criar Relatório Médico

1. Vá em **Menu > Relatórios**
2. Clique em **"+ Novo Relatório"**
3. Selecione:
   - **Paciente**
   - **Avaliação** (ou múltiplas avaliações para relatório evolutivo)
   - **Tipo de relatório**:
     - **Completo**: Relatório detalhado com todas as informações
     - **Sumário**: Versão resumida
     - **Evolutivo**: Comparação entre múltiplas consultas

#### 6.2 Preenchimento Assistido por IA

Para cada campo do relatório, você pode:
1. Clicar em **"🤖 Gerar com IA"**
2. A IA sugere texto baseado nos dados do paciente:
   - **Diagnóstico Principal**: Com CID-10 e probabilidade
   - **Prognóstico**: Personalizado por gravidade
   - **Tratamento Medicamentoso**: Específico por tipo de demência
   - **Tratamento Não-Medicamentoso**: Reabilitação cognitiva, terapia ocupacional
   - **Acompanhamento**: Frequência de retornos e exames
   - **Conclusão**: Síntese completa com recomendações
3. Edite o texto gerado conforme necessário
4. Clique em **"Gerar Relatório"**

#### 6.3 Exportar para PDF

1. Na lista de relatórios, clique em **"Ver"** ou **"Baixar PDF"**
2. O relatório inclui:
   - Cabeçalho com logo e dados da instituição
   - Dados do paciente
   - Anamnese e exame neurológico
   - Resultados dos testes cognitivos com gráficos
   - Diagnóstico e conduta
   - Assinatura digital (se configurada)

---

### 7. Configurações

#### 7.1 Geral

- **Tema**: Light, Dark ou Auto (baseado no sistema)
- **Idioma**: Português (pt-BR) ou English (en-US)
- **Notificações**: Habilitar/desabilitar alertas

#### 7.2 Inteligência Artificial

- **Habilitar IA**: Ativar funcionalidades de análise
- **Modelo**:
  - **Local**: Processamento offline no navegador (privado)
  - **Cloud** (futuro): API externa (requer conexão)
- **Confiança mínima**: Threshold para exibir diagnósticos (50-90%)

#### 7.3 Segurança

- **Autenticação de Dois Fatores**: Ativar 2FA para maior segurança
- **Tempo de Sessão**: Logout automático (15-120 minutos)
- **Backup Automático**: Frequência de backups dos dados

#### 7.4 Relatórios

- **Assinatura Digital**: Upload de imagem da assinatura
- **Dados da Instituição**: Nome, CNPJ, endereço, telefone
- **Rodapé Personalizado**: Texto adicional nos relatórios

---

### 8. Funcionalidades Especiais

#### 8.1 PWA - Instalação no Dispositivo

**Desktop**:
1. Abra a aplicação no Chrome/Edge
2. Na barra de endereços, clique no ícone **"Instalar"** (➕)
3. Confirme a instalação
4. Acesse o NeuroCare como aplicativo nativo

**Mobile (Android/iOS)**:
1. Abra no Safari (iOS) ou Chrome (Android)
2. Toque no menu (⋮) e selecione **"Adicionar à Tela Inicial"**
3. Confirme e acesse o ícone na tela inicial

#### 8.2 Modo Offline

O sistema funciona completamente offline:
- **Consultas salvas** localmente no dispositivo
- **Sincronização automática** ao reconectar
- **Indicador de status** de conexão no canto superior
- **Fila de sincronização** para operações pendentes

#### 8.3 Atalhos de Teclado

- **Ctrl + K**: Busca rápida de pacientes
- **Ctrl + N**: Novo paciente
- **Ctrl + ,**: Abrir configurações
- **Esc**: Fechar modais

#### 8.4 Exportação de Dados

1. Vá em **Configurações > Dados**
2. Clique em **"Exportar Todos os Dados"**
3. Baixe arquivo JSON com:
   - Pacientes
   - Avaliações
   - Testes cognitivos
   - Relatórios
4. Use para backup ou migração

---

## 🛠 Documentação Técnica

Para desenvolvedores e administradores do sistema, veja a documentação completa:

- **[Setup](./docs/SETUP.md)** - Instalação e configuração do ambiente
- **[Firebase](./docs/FIREBASE.md)** - Configuração do Firebase/Firestore
- **[Arquitetura](./docs/ARCHITECTURE.md)** - Arquitetura e design patterns
- **[API](./docs/API.md)** - Endpoints e contratos da API
- **[Testes](./docs/TESTING.md)** - Guia de testes E2E com Playwright
- **[Deploy](./docs/DEPLOYMENT.md)** - Deploy para GitHub Pages
- **[Segurança](./docs/SECURITY.md)** - Práticas de segurança e LGPD

---

## 🚀 Instalação

### Pré-requisitos

- **Node.js** 20+
- **pnpm** 9+

### Instalação Local

```bash
# 1. Clonar repositório
git clone https://github.com/sistemamedicoufpe/Projeto-BFD.git
cd Projeto-BFD

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp apps/frontend/.env.example apps/frontend/.env
# Edite o arquivo .env com suas configurações

# 4. Iniciar em modo desenvolvimento
pnpm dev
```

Acesse: **http://localhost:5173**

### Build para Produção

```bash
# Build do frontend
pnpm build:frontend

# Visualizar build localmente
pnpm preview
```

---

## 📊 Stack Tecnológica

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utility-first
- **React Router 7** - Roteamento SPA
- **TensorFlow.js** - IA local no navegador
- **jsPDF** - Geração de PDFs

### Backend (Opcional)
- **NestJS 11** - Framework Node.js
- **Prisma 5** - ORM
- **PostgreSQL 15** - Banco de dados relacional

### Storage
- **Firebase Firestore** - Banco NoSQL cloud
- **IndexedDB** - Armazenamento local offline
- **LocalStorage** - Configurações e cache

### Infraestrutura
- **GitHub Pages** - Hospedagem estática
- **Service Worker** - Cache e offline
- **PWA** - Progressive Web App

---

## 📝 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de submissão de pull requests.

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/sistemamedicoufpe/Projeto-BFD/issues)
- **Email**: suporte@neurocare.app
- **Documentação**: [docs/](./docs/)

---

**Desenvolvido com ❤️ para profissionais de saúde**
