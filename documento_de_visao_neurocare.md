# DOCUMENTO DE VISÃO – NEUROCARE

**Equipe:** Alyson Veríssimo, Anefatima Figueiredo, Dereck Breno Fernandes, Fabiana Pereira, Jefferson Santino, José Mário Farias, Klebson Castro, Paulo Henrique da Luz, Thiago Souto.

---

## 1. Resumo Executivo

### Problema
Reunir dados clínicos, cognitivos e de EEG em uma interface simples e fácil de entender, que auxilie nas decisões diagnósticas com o apoio de uma inteligência artificial transparente, mantendo o controle clínico com o profissional.

### Solução
O **Sistema NeuroCare Diagnóstico** foi desenvolvido para facilitar o fluxo de atendimento e acompanhamento longitudinal de pacientes com suspeita de demência. Ele unifica dados clínicos, cognitivos e de EEG em uma interface intuitiva, oferecendo suporte diagnóstico por meio de inteligência artificial interpretável.

### Diferenciais
- Interface intuitiva para profissionais de saúde
- Baixo custo operacional — roda em hardware modesto
- 100% responsivo — funciona em celular, tablet e desktop
- IA interpretável — apresentação de probabilidades claras
- Controle clínico total — o profissional permanece no comando

### Segurança, Conformidade e Operação
- Conformidade com a LGPD (privacidade e segurança de dados)
- Autenticação de usuários
- Criptografia de dados
- Auditoria de acessos
- Proteção contra ataques (XSS, CSRF, entre outros)
- Backup de dados
- Segurança em APIs

### Offline-first
O sistema utiliza **Service Workers** para cache de recursos e **IndexedDB** para armazenamento local dos dados de pacientes e exames. Em modo offline, todas as operações são realizadas localmente. Ao restabelecer a conexão, ocorre a sincronização automática com o servidor por meio de APIs REST, utilizando *timestamps* para resolução de conflitos.

### Conformidade com a ANVISA
A ANVISA regula dispositivos médicos no Brasil, incluindo softwares de apoio à decisão clínica. A conformidade assegura que o sistema atenda aos requisitos de segurança, eficácia, rastreabilidade e qualidade exigidos para uso em saúde, garantindo a confiabilidade dos resultados e a proteção dos pacientes.

---

## 2. Descrição do Produto

### 2.1 Stack Tecnológica – Front-end

#### Tecnologias Principais
- React.js 18+
- TypeScript
- Tailwind CSS
- Vite
- HTML5
- CSS3
- JavaScript (ES6+)

#### Bibliotecas Adicionais
- Chart.js — gráficos interativos de evolução cognitiva
- react-pdf / jsPDF — geração de laudos em PDF
- react-icons — ícones vetoriais otimizados
- axios — comunicação HTTP com APIs
- date-fns — manipulação de datas

#### Características Técnicas
- Arquitetura baseada em componentes
- Gerenciamento de estado com React Hooks
- Roteamento com React Router
- Persistência local de dados (offline-first)
- Design responsivo com abordagem mobile-first

### Compatibilidade
- Navegadores suportados: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Orientação:
  - Portrait: layout vertical otimizado
  - Landscape: aproveitamento máximo do espaço horizontal

### Principais Telas
1. Login
2. Home (Dashboard)
3. Pacientes
4. Avaliações
5. Registro
6. Relatórios
7. Configurações
8. Ajuda

### Acessibilidade
O sistema segue as diretrizes **WCAG 2.1 – Nível AA**, incluindo:
- Contraste mínimo de 4.5:1
- Áreas de toque mínimas de 44x44px
- Navegação completa por teclado
- ARIA labels descritivos
- Foco visível em elementos interativos
- Textos alternativos para ícones
- Suporte a alto contraste (*prefers-contrast*)
- Redução de movimento (*prefers-reduced-motion*)
- Semântica HTML5 adequada
- Ordem lógica de tabulação

#### Tecnologias Assistivas Suportadas
- Leitores de tela (NVDA, JAWS, VoiceOver)
- Ampliadores de tela
- Navegação por voz
- Uso exclusivo por teclado

---

## 3. Funcionalidades Principais

### Gestão de Pacientes
#### Dados Cadastrais
- Nome completo
- Data de nascimento, idade e sexo
- CPF (opcional, conforme contexto institucional)
- Contato e responsável
- CID-10 e data de início dos sintomas

#### Histórico Médico
- Histórico familiar de demências
- Comorbidades (AVC, diabetes, hipertensão, entre outras)
- Lista de medicações em uso
- Resultados de escalas cognitivas

### Sistema de Exames
#### Categorias
- EEG: eletroencefalogramas (.EDF)
- Cognição: MMSE, MoCA, fluência verbal, teste do relógio
- Imagem: ressonância magnética e tomografia (DICOM)
- Laboratório: TSH, vitamina B12, glicemia, entre outros

#### Recursos
- Upload simplificado com reconhecimento automático do tipo
- Timeline cronológica interativa
- Filtros por categoria
- Visualização detalhada dos resultados
- Comparação lado a lado
- Download de arquivos

### Inteligência Artificial – Interpretação Assistida
O sistema apresenta probabilidades visuais para:
- Doença de Alzheimer (DA)
- Demência com Corpos de Lewy (DLB)
- Demência Frontotemporal (FTD)
- Declínio Cognitivo Leve (DCL)

> **Observação:** Os resultados da IA são sugestões interpretáveis e devem ser validados por profissionais especializados. O sistema não substitui o julgamento clínico.

### Geração de Laudos
- Geração automática de rascunho em PDF
- Editor WYSIWYG integrado
- Possibilidade de ajustes manuais
- Estrutura profissional padronizada

#### Conteúdo do Laudo
- Dados do paciente
- Histórico clínico
- Avaliações cognitivas
- Resultados de EEG
- Interpretação assistida por IA
- Impressão diagnóstica
- Recomendações
- Assinatura e data

### Acompanhamento Longitudinal
- Gráficos de evolução temporal dos escores cognitivos
- Timeline interativa com histórico completo
- Comparação de exames em diferentes períodos
- Identificação de progressão ou estabilização

### Exportação de Dados
#### Formatos
- JSON — integração com outros sistemas
- CSV — análise em planilhas

#### Opções
- Dados pessoais
- Histórico médico
- Exames e avaliações
- Resultados da IA
- Anonimização de dados sensíveis

---

## 4. Estrutura Técnica e Organização do Código

```text
neurocare-system/
├── apps/
│   ├── frontend/
│   └── backend/
├── packages/
│   ├── shared-types/
│   └── shared-utils/
├── pnpm-workspace.yaml
├── turbo.json
└── docker-compose.yml
```

---

## 5. Fluxos Principais do Sistema

### Fluxo 1 – Cadastro e Avaliação Inicial
1. Login do profissional
2. Dashboard com resumo de pacientes
3. Cadastro de novo paciente
4. Registro de avaliações cognitivas
5. Upload de exames
6. Geração de probabilidades diagnósticas por IA
7. Geração e edição de laudo em PDF

### Fluxo 2 – Acompanhamento Longitudinal
1. Seleção de paciente existente
2. Visualização da timeline
3. Comparação de exames
4. Análise gráfica da evolução cognitiva
5. Exportação de dados

### Fluxo 3 – Análise de Laudos e Exames
1. Seleção do paciente
2. Upload de laudos e exames
3. Processamento por IA
4. Sugestão de hipóteses diagnósticas
5. Validação médica
6. Salvamento no histórico do paciente

### Fluxo 4 – Geração e Gestão de Laudos
1. Seleção de avaliação concluída
2. Geração automática do laudo
3. Edição pelo profissional
4. Versionamento do documento
5. Exportação em PDF
6. Compartilhamento opcional

---

## 6. Segurança e Privacidade

- Autenticação segura com JWT e refresh tokens
- Criptografia de dados em trânsito (TLS 1.3) e em repouso (AES-256)
- Auditoria completa de acessos
- Proteção contra XSS, CSRF e SQL Injection
- Backup diário incremental e semanal completo
- Rate limiting e configuração de CORS
- Conformidade total com a LGPD (consentimento, portabilidade e direito ao esquecimento)

---

## 7. Público-Alvo (Personas)

### Persona 1 – Dr. Carlos Silva
- Idade: 55 anos
- Profissão: Neurologista

**Necessidades:**
- Agilidade no diagnóstico
- Organização de pacientes
- Facilidade de uso

### Persona 2 – Dr. Ricardo Varela
- Idade: 52 anos
- Cargo: Neurocientista e Pesquisador Chefe

**Objetivos:**
- Diagnóstico precoce do Declínio Cognitivo Leve
- Maior precisão diagnóstica
- Otimização do tempo em consulta
- Integração de dados clínicos em um único dashboard

**Dores:**
- Sistemas fragmentados
- Subjetividade em testes manuais
- Falta de explicabilidade nos resultados da IA

---

## 8. Entregas e Roadmap

### MVP – Versão 1.0
**Objetivo:** Entregar um sistema funcional para cadastro de pacientes neurológicos e upload de exames EEG.

#### Planejamento por Sprints
- **Semana 1:** Estrutura base e autenticação
- **Semana 2:** Gestão de pacientes
- **Semana 3:** Perfil do paciente e upload de EEG
- **Semana 4:** Dashboard, revisão de fluxo e preparação para demo

### Pós-MVP
- Integração completa com IA
- Geração de laudos em PDF
- Timeline avançada e exportação de dados

---

## 9. Entregas Finais

- Código-fonte no GitHub com documentação completa
- Deploy da aplicação em ambiente de produção
- Documentação técnica detalhada da arquitetura
- Manual do usuário com tutoriais e guias
- Certificação de conformidade com LGPD e ANVISA

