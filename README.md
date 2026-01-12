# 🧠 Sistema NeuroDiagnóstico

> Sistema completo de avaliação neurológica e auxílio ao diagnóstico de demências, com integração de inteligência artificial.

![Versão](https://img.shields.io/badge/versão-2.1.0-blue.svg)
![Licença](https://img.shields.io/badge/licença-MIT-green.svg)
![Status](https://img.shields.io/badge/status-ativo-success.svg)

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Como Usar](#-como-usar)
- [Responsividade](#-responsividade)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Guia de Uso](#-guia-de-uso)
- [Configuração](#-configuração)
- [Acessibilidade](#-acessibilidade)
- [Privacidade e Segurança](#-privacidade-e-segurança)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

O **Sistema NeuroDiagnóstico** foi desenvolvido para facilitar o fluxo de atendimento e acompanhamento longitudinal de pacientes com suspeita de demência. Ele unifica dados clínicos, cognitivos e de EEG em uma interface intuitiva, oferecendo suporte diagnóstico através de inteligência artificial interpretável.

### 🎨 Principais Diferenciais

- ✅ **Interface intuitiva** para profissionais de saúde
- ✅ **Baixo custo operacional** - roda em hardware modesto
- ✅ **100% responsivo** - funciona em celular, tablet e desktop
- ✅ **IA interpretável** - probabilidades claras, não caixas-pretas
- ✅ **Controle clínico total** - profissional sempre no comando
- ✅ **LGPD compliant** - privacidade e segurança de dados
- ✅ **Offline-first** - funciona sem internet (após carregamento)

## ✨ Funcionalidades

### 👤 Gestão Completa de Pacientes

#### Dados Cadastrais
- Nome completo, data de nascimento, idade, sexo
- CPF (opcional, conforme contexto institucional)
- Contato e responsável
- CID-10 e data de início dos sintomas

#### Histórico Médico
- Histórico familiar de demências
- Comorbidades (AVC, diabetes, hipertensão, etc.)
- Lista completa de medicações em uso
- Resultados de escalas cognitivas

### 🔬 Sistema de Exames

#### Categorias Organizadas
- **🌊 EEG**: Eletroencefalogramas (arquivos EDF)
- **🧠 Cognição**: MMSE, MoCA, fluência verbal, teste do relógio
- **🔍 Imagem**: Ressonância magnética e tomografia (DICOM)
- **⚗️ Laboratório**: TSH, vitamina B12, glicemia, etc.

#### Recursos
- Upload simplificado com reconhecimento de tipo
- Timeline cronológica interativa
- Filtros por categoria
- Visualização de resultados
- Comparação lado a lado
- Download de arquivos

### 🤖 Inteligência Artificial

#### Interpretação Assistida
Probabilidades visuais para:
- **Doença de Alzheimer (DA)**: Probabilidade percentual
- **Demência com Corpos de Lewy (DLB)**: Probabilidade percentual
- **Demência Frontotemporal (FTD)**: Probabilidade percentual
- **Declínio Cognitivo Leve (DCL)**: Probabilidade percentual

> ⚠️ **Importante**: Os resultados da IA são sugestões interpretáveis que **devem ser validadas** por profissionais especializados. O sistema não substitui o julgamento clínico.

### 📄 Geração de Laudos

#### Laudo Completo em PDF
- Geração automática de rascunho
- Editor de texto integrado (WYSIWYG)
- Ajustes manuais permitidos
- Estrutura profissional padronizada

#### Conteúdo do Laudo
✓ Dados do paciente
✓ Histórico clínico completo
✓ Avaliações cognitivas
✓ Resultados de EEG
✓ Interpretação assistida por IA
✓ Impressão diagnóstica
✓ Recomendações
✓ Assinatura e data

### 📊 Acompanhamento Longitudinal

- **Gráficos de evolução** temporal de escores cognitivos
- **Timeline interativa** com histórico completo
- **Comparação de exames** de diferentes períodos
- **Identificação de progressão** ou estabilização

### 💾 Exportação de Dados

#### Formatos Disponíveis
- **JSON**: Para integração com outros sistemas
- **CSV**: Para análise em planilhas (Excel, Google Sheets)

#### Opções de Exportação
- ☑️ Dados pessoais
- ☑️ Histórico médico
- ☑️ Exames e avaliações
- ☑️ Resultados de IA
- ☑️ Anonimização (remove dados identificáveis)

## 🛠️ Tecnologias

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com variáveis CSS
- **JavaScript (ES6+)** - Lógica e interatividade

### Bibliotecas
- **Chart.js** - Gráficos interativos
- **jsPDF** - Geração de PDFs
- **Font Awesome 6** - Ícones vetoriais

### Características Técnicas
- Sem framework pesado (vanilla JS)
- CDN para bibliotecas (sem instalação)
- LocalStorage para persistência local
- Modular e extensível

## 🚀 Como Usar

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/sistemamedicoufpe/Projeto-BFD.git
cd Projeto-BFD
```

2. **Abra o arquivo**
```bash
# Basta abrir index.html no navegador
# Duplo clique no arquivo OU
# Botão direito > Abrir com > Navegador
```

3. **Pronto!** 🎉
```
Não precisa instalar nada!
Todas as bibliotecas são carregadas via CDN.
Dados são armazenados localmente no seu navegador.
```

### Requisitos Mínimos

- **Navegador moderno** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **JavaScript habilitado**
- **Conexão com internet** (apenas para carregar bibliotecas CDN na primeira vez)
- **LocalStorage ativado** (para armazenar dados localmente)

## 📱 Responsividade

O sistema foi desenvolvido com **mobile-first** e funciona perfeitamente em todos os dispositivos:

### 📱 Smartphones (320px - 480px)
- Menu hambúrguer lateral
- Cards em coluna única
- Botões de toque otimizados (44px mínimo)
- Timeline simplificada
- Modais adaptados para tela pequena

### 📱 Tablets (481px - 768px)
- Layout em grid otimizado
- Sidebar retrátil
- Cards em 1-2 colunas
- Gráficos redimensionados

### 💻 Tablets Grandes (769px - 1024px)
- Sidebar de 200px
- Cards em 2-3 colunas
- Interface completa visível

### 🖥️ Desktop (1025px+)
- Layout completo
- Sidebar fixa de 250px
- Cards em grid dinâmico
- Máxima área útil

### 🔄 Orientação
- **Portrait**: Layout vertical otimizado
- **Landscape**: Aproveitamento horizontal máximo

## 📁 Estrutura do Projeto

```
Projeto-BFD/
│
├── 📄 index.html              # Dashboard principal (raiz)
├── 📖 README.md               # Documentação (este arquivo)
│
├── 📁 src/                    # Código-fonte organizado
│   │
│   ├── 📁 pages/              # Páginas HTML do sistema
│   │   ├── login.html         # Página de autenticação
│   │   ├── registro.html      # Cadastro de novos usuários
│   │   ├── pacientes.html     # Lista e gestão de pacientes
│   │   ├── avaliacoes.html    # Lista de avaliações neurológicas
│   │   ├── relatorios.html    # Relatórios e análises
│   │   ├── configuracoes.html # Configurações do sistema
│   │   └── ajuda.html         # Central de ajuda e FAQ
│   │
│   ├── 📁 scripts/            # JavaScript do sistema
│   │   ├── storage.js         # Gerenciamento de localStorage
│   │   ├── script.js          # Lógica principal da aplicação
│   │   ├── common.js          # Funções compartilhadas (auth, navegação)
│   │   ├── login.js           # Lógica da página de login
│   │   ├── registro.js        # Lógica da página de registro
│   │   └── pacientes.js       # Lógica da página de pacientes
│   │
│   └── 📁 styles/             # Estilos CSS
│       └── style.css          # Estilos e responsividade
│
└── 📁 .git/                   # Controle de versão
```

### Arquivos Principais

#### Páginas HTML (src/pages/)

**`login.html`**
- Página de autenticação com design moderno
- Login por email/senha e social (Google, Microsoft)
- Layout responsivo split-screen
- Redireciona para dashboard após login

**`registro.html`**
- Cadastro de novos usuários profissionais
- Validação de dados em tempo real
- Aceite de termos de uso
- Integração com sistema de autenticação

**`index.html`** *(raiz do projeto)*
- Dashboard principal do paciente
- Visualização de dados completos
- Timeline de exames
- Interpretação por IA
- Modais para upload, comparação e relatórios

**`pacientes.html`**
- Lista completa de pacientes
- Busca em tempo real (nome, CPF, ID)
- Tabela responsiva com status
- Ações: visualizar, editar, histórico

**`avaliacoes.html`**
- Grid de avaliações neurológicas
- Filtros por tipo (cognitiva, neurológica, imagem)
- Estatísticas de avaliações
- Paginação automática

**`relatorios.html`**
- Análises e estatísticas do sistema
- Gráficos interativos (Chart.js)
- Tabela de relatórios gerados
- Exportação de dados

**`configuracoes.html`**
- Perfil do usuário
- Segurança (senha, 2FA, sessões)
- Notificações personalizadas
- Tema e aparência
- Configurações de IA
- Privacidade e dados (LGPD)

**`ajuda.html`**
- Central de ajuda completa
- FAQ com accordion
- Busca de tópicos
- Links rápidos para tarefas comuns
- Informações do sistema

#### Estilos (src/styles/)

**`style.css`**
- Variáveis CSS para temas
- Grid e Flexbox modernos
- Media queries detalhadas (mobile, tablet, desktop)
- Animações e transições suaves
- Acessibilidade (contraste, tamanhos, focus)
- Componentes reutilizáveis (cards, modais, forms)

#### Scripts (src/scripts/)

**`storage.js`**
- Gerenciamento completo de localStorage
- Managers: PatientsManager, ExamsManager, EvaluationsManager, ReportsManager
- Inicialização com dados de exemplo
- CRUD para todas as entidades
- Funções de busca e filtragem

**`script.js`**
- Gestão de estado da aplicação principal
- Manipulação do DOM
- Event listeners do dashboard
- Funções de export/import
- Geração de PDFs
- Controle de modais

**`common.js`**
- Funções compartilhadas entre todas as páginas
- Sistema de autenticação (checkAuthentication, logout)
- Navegação ativa automática
- Menu mobile responsivo
- Utilitários de path resolution

**`login.js`**
- Lógica específica da página de login
- Validação de credenciais
- Redirecionamento pós-autenticação

**`registro.js`**
- Lógica específica da página de registro
- Validação de formulário
- Confirmação de senha em tempo real
- Criação de conta

**`pacientes.js`**
- Lógica específica da página de pacientes
- Renderização da lista de pacientes
- Sistema de busca e filtros
- Ações de visualizar/editar/histórico

## 📖 Guia de Uso

### 0️⃣ Login

1. Acesse [login.html](src/pages/login.html)
2. Insira suas credenciais (email e senha)
3. Ou use login social (Google/Microsoft)
4. Será redirecionado para o dashboard

**Não tem conta?** Clique em "Registre-se" para criar uma nova conta.

### 1️⃣ Dashboard Inicial

Ao entrar no sistema, você verá:
- **Cards de resumo**: testes concluídos, risco do paciente, próxima avaliação
- **Informações do paciente**: dados cadastrais completos com medicações e CID
- **Timeline de exames**: histórico cronológico com filtros por categoria
- **Interpretação por IA**: probabilidades diagnósticas com barras visuais
- **Menu lateral**: navegação entre todas as seções

### 2️⃣ Upload de Exames

**Desktop**: Clique em "Upload de Exame"
**Mobile**: Menu ☰ > Upload de Exame

1. Selecione o tipo (EEG, Cognição, Imagem, Laboratório)
2. Preencha nome e data do exame
3. Faça upload do arquivo
4. Adicione observações (opcional)
5. Clique em "Fazer Upload"

**Formatos aceitos**: PDF, EDF, JPG, PNG, DICOM

### 3️⃣ Visualizar Exames

**Timeline Cronológica**:
- Exames organizados por data (mais recente primeiro)
- Filtros por categoria (Todos, EEG, Cognição, Imagem, Lab)
- Cards coloridos por tipo
- Ações: Visualizar, Baixar

**Comparar Exames**:
1. Clique em "Comparar Exames"
2. Selecione dois exames da lista
3. Visualize lado a lado

### 4️⃣ Gerar Laudo Médico

1. Clique em "Gerar Laudo PDF"
2. Revise o rascunho gerado automaticamente
3. Edite o texto conforme necessário
4. Use a barra de ferramentas (negrito, itálico, listas)
5. Clique em "Baixar PDF" ou "Salvar Rascunho"

**O laudo inclui**:
- Dados do paciente
- Histórico médico
- Avaliações cognitivas
- Resultados de EEG
- Interpretação de IA
- Recomendações clínicas

### 5️⃣ Exportar Dados

1. Clique em "Exportar Dados"
2. Escolha o formato (JSON ou CSV)
3. Selecione quais dados incluir:
   - ☑️ Dados pessoais
   - ☑️ Histórico médico
   - ☑️ Exames
   - ☑️ Resultados de IA
4. Marque "Anonimizar" se necessário
5. Clique em "Exportar"

**Uso dos arquivos**:
- **JSON**: Importar em outros sistemas, backup estruturado
- **CSV**: Abrir no Excel, análise estatística, pesquisas

### 6️⃣ Gerenciar Pacientes

1. Acesse **Pacientes** no menu lateral
2. Veja a lista completa de pacientes cadastrados
3. Use a busca para encontrar por nome, CPF ou ID
4. Ações disponíveis:
   - 👁️ **Ver Detalhes**: Abre o dashboard do paciente
   - ✏️ **Editar**: Modifica informações cadastrais
   - 📜 **Histórico**: Visualiza timeline completa
5. Clique em **Novo Paciente** para cadastrar

### 7️⃣ Visualizar Avaliações

1. Acesse **Avaliações** no menu lateral
2. Veja cards com todas as avaliações realizadas
3. Filtre por tipo: Todos, Cognitiva, Neurológica, Imagem
4. Use a busca para encontrar avaliações específicas
5. Visualize estatísticas no topo (total, pendentes, concluídas, com IA)
6. Clique em qualquer avaliação para ver detalhes

### 8️⃣ Acessar Relatórios e Análises

1. Acesse **Relatórios** no menu lateral
2. Visualize estatísticas gerais do sistema
3. Analise gráficos interativos:
   - Avaliações por mês
   - Distribuição por diagnóstico
   - Tipos de exame realizados
   - Precisão da IA
4. Veja a lista de relatórios gerados
5. Exporte relatórios completos em PDF/Excel

### 9️⃣ Configurar o Sistema

1. Acesse **Configurações** no menu lateral
2. Abas disponíveis:
   - 👤 **Perfil**: Dados pessoais, CRM, especialidade
   - 🔒 **Segurança**: Senha, 2FA, sessões ativas
   - 🔔 **Notificações**: Preferências de alertas
   - 🎨 **Aparência**: Tema (claro/escuro), tamanho de fonte
   - 🤖 **IA**: Configurações do assistente inteligente
   - 🛡️ **Privacidade**: LGPD, anonimização, exportação
3. Salve as alterações

### 🔟 Buscar Ajuda

1. Acesse **Ajuda** no menu lateral
2. Use a busca para encontrar tópicos
3. Navegue por categorias:
   - Primeiros Passos
   - Gerenciamento de Pacientes
   - Avaliações
   - Assistente de IA
   - Relatórios
   - Exportação de Dados
4. Entre em contato via email ou telefone se necessário

### 1️⃣1️⃣ Menu Mobile

**Abrir menu**: Toque no ícone ☰ (canto superior esquerdo)
**Fechar menu**: Toque no ícone ✕ ou fora do menu
**Navegar**: Toque nas opções do menu
**Estado ativo**: A página atual fica destacada automaticamente

## ⚙️ Configuração

### Personalizar Cores

Edite as variáveis CSS em `style.css`:

```css
:root {
    --primary: #2c3e50;      /* Azul escuro */
    --secondary: #3498db;    /* Azul claro */
    --accent: #9b59b6;       /* Roxo */
    --success: #27ae60;      /* Verde */
    --warning: #f39c12;      /* Laranja */
    --danger: #e74c3c;       /* Vermelho */
}
```

### Adicionar Novo Tipo de Exame

**1. HTML** (`index.html`):
```html
<option value="novo-tipo">Novo Tipo de Exame</option>
```

**2. JavaScript** (`script.js`):
```javascript
function getCategoryName(type) {
    const categories = {
        'novo-tipo': 'Novo Tipo',
        // ... outros tipos
    };
    return categories[type] || 'Outro';
}
```

**3. CSS** (`style.css`):
```css
.timeline-marker.novo-tipo {
    border-color: #sua-cor;
}

.timeline-content.novo-tipo {
    border-left-color: #sua-cor;
}
```

### Modificar Probabilidades de IA

Edite em `script.js`:

```javascript
aiPredictions: {
    alzheimer: 65,    // Doença de Alzheimer
    dlb: 20,          // Demência com Corpos de Lewy
    ftd: 10,          // Demência Frontotemporal
    mci: 5            // Declínio Cognitivo Leve
}
```

## ♿ Acessibilidade

O sistema segue as diretrizes **WCAG 2.1 Nível AA**:

### Recursos Implementados

✅ **Contraste de cores adequado** (mínimo 4.5:1)
✅ **Tamanhos de toque mínimos** (44x44px)
✅ **Navegação por teclado** completa
✅ **ARIA labels** descritivos
✅ **Foco visível** em elementos interativos
✅ **Textos alternativos** para ícones
✅ **Modo alto contraste** (prefers-contrast)
✅ **Redução de movimento** (prefers-reduced-motion)
✅ **Semântica HTML5** adequada
✅ **Ordem de tabulação** lógica

### Tecnologias Assistivas

- ✓ Leitores de tela (NVDA, JAWS, VoiceOver)
- ✓ Ampliadores de tela
- ✓ Navegação por voz
- ✓ Teclado exclusivo

## 🔒 Privacidade e Segurança

### Conformidade com LGPD

O sistema foi desenvolvido com foco em privacidade:

- ✅ **Dados locais**: Armazenamento em localStorage (navegador)
- ✅ **Sem servidor**: Não envia dados para servidores externos
- ✅ **Anonimização**: Opção de remover dados identificáveis
- ✅ **Consentimento**: Exportação requer ação explícita do usuário
- ✅ **Transparência**: Código aberto e auditável

### Boas Práticas

- CPF marcado como **opcional**
- Dados sensíveis **não são transmitidos**
- Laudos salvos **localmente** (rascunhos)
- Exportação com **controle granular**

### Recomendações de Segurança

1. Use **HTTPS** se hospedar em servidor
2. Implemente **autenticação** para múltiplos usuários
3. Considere **criptografia** para dados em repouso
4. Faça **backups regulares** dos dados
5. Mantenha o **navegador atualizado**

## 🗺️ Roadmap

### ⏳ Curto Prazo (1-3 meses)

- [ ] Visualizador EEG com plotagem de sinais reais (EDF)
- [ ] Visualizador DICOM para imagens médicas
- [ ] Sistema de autenticação de usuários
- [ ] Backend para persistência de dados
- [ ] Modo escuro (dark mode)

### 🔮 Médio Prazo (3-6 meses)

- [ ] Integração com modelos de IA em produção
- [ ] API REST para prontuários eletrônicos
- [ ] Módulo de relatórios gerenciais
- [ ] Agendamento de retornos
- [ ] Notificações e alertas
- [ ] Suporte multi-idioma (i18n)

### 🚀 Longo Prazo (6-12 meses)

- [ ] Progressive Web App (PWA) completo
- [ ] Modo offline total com sincronização
- [ ] Suporte a novos biomarcadores (voz, marcha)
- [ ] Integração com wearables
- [ ] Certificação digital (ICP-Brasil)
- [ ] Aplicativo mobile nativo (React Native)
- [ ] Dashboard administrativo
- [ ] Sistema de permissões e papéis

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Aqui está como você pode ajudar:

### 🐛 Reportar Bugs

1. Verifique se o bug já não foi reportado
2. Abra uma issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Navegador e versão

### 💡 Sugerir Funcionalidades

1. Abra uma issue com tag `enhancement`
2. Descreva a funcionalidade detalhadamente
3. Explique o caso de uso
4. Inclua mockups se possível

### 🔧 Enviar Pull Requests

1. Fork o projeto
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/MinhaNovaFuncionalidade
   ```
3. Commit suas mudanças:
   ```bash
   git commit -m 'Adiciona funcionalidade X'
   ```
4. Push para a branch:
   ```bash
   git push origin feature/MinhaNovaFuncionalidade
   ```
5. Abra um Pull Request

### 📝 Diretrizes de Código

- Use **nomes descritivos** para variáveis e funções
- Adicione **comentários** em código complexo
- Mantenha a **consistência** com o código existente
- Teste em **múltiplos navegadores**
- Verifique a **responsividade**
- Valide **acessibilidade**

## 📞 Suporte e Contato

### 💬 Canais de Suporte

- **Issues do GitHub**: Para bugs e sugestões
- **Discussions**: Para perguntas e discussões gerais
- **Email**: [contato@neurodiagnostico.com.br]

### 📚 Recursos Adicionais

- [Documentação Técnica](docs/TECHNICAL.md)
- [Guia de Contribuição](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [FAQ](docs/FAQ.md)

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2025 Sistema NeuroDiagnóstico

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[...]
```

## 🙏 Agradecimentos

Este projeto foi desenvolvido com base nas necessidades reais de **profissionais da saúde** especializados em diagnóstico de demências.

### Agradecimentos Especiais

- **Neurologistas e Geriatras**: Por fornecerem requisitos detalhados
- **Pacientes e Familiares**: Por inspirarem a criação desta ferramenta
- **Comunidade Open Source**: Pelas bibliotecas e ferramentas utilizadas
- **Equipe de Desenvolvimento**: Pela dedicação e excelência técnica

### Inspiração e Filosofia

O sistema prioriza:
- 🎯 **Interface intuitiva** para profissionais ocupados
- 💰 **Baixo custo** para democratizar o acesso
- 🔒 **Privacidade** como direito fundamental
- 🤝 **Apoio à decisão**, não substituição do médico
- 🌍 **Impacto social** positivo na saúde pública

---

## 📊 Estatísticas do Projeto

![GitHub stars](https://img.shields.io/github/stars/sistemamedicoufpe/Projeto-BFD?style=social)
![GitHub forks](https://img.shields.io/github/forks/sistemamedicoufpe/Projeto-BFD?style=social)
![GitHub issues](https://img.shields.io/github/issues/sistemamedicoufpe/Projeto-BFD)
![GitHub pull requests](https://img.shields.io/github/issues-pr/sistemamedicoufpe/Projeto-BFD)

---

<div align="center">

**Desenvolvido com ❤️ para profissionais de saúde e seus pacientes**

[⬆ Voltar ao topo](#-sistema-neurodiagnóstico)

</div>

---

**Versão**: 2.1.0
**Última atualização**: Janeiro 2026
**Desenvolvido para**: Profissionais de saúde especializados em avaliação neurológica e diagnóstico de demências
**Status**: ✅ Produção
