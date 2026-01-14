/**
 * Dados de teste para E2E
 */

export const testUser = {
  email: 'teste@neurocare.com.br',
  password: 'Teste@123456',
  name: 'Dr. João Silva',
  crm: '123456',
  role: 'DOCTOR' as const,
};

export const testPatient = {
  nome: 'Maria da Silva Santos',
  cpf: '123.456.789-00',
  dataNascimento: '1950-05-15',
  idade: 74,
  genero: 'FEMININO' as const,
  estadoCivil: 'CASADO' as const,
  escolaridade: 8,
  profissao: 'Professora aposentada',
  telefone: '(11) 98765-4321',
  email: 'maria.silva@email.com',
  endereco: 'Rua das Flores, 123',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01234-567',
  contatoEmergenciaNome: 'João Santos',
  contatoEmergenciaTelefone: '(11) 91234-5678',
  contatoEmergenciaRelacao: 'Filho',
  historicoMedico: 'Hipertensão arterial controlada com medicação. Sem histórico de AVC ou traumatismo craniano.',
  alergias: ['Penicilina', 'Dipirona'],
  medicamentosEmUso: ['Losartana 50mg', 'Hidroclorotiazida 25mg'],
  queixaPrincipal: 'Esquecimento frequente, dificuldade para lembrar nomes e datas recentes.',
};

export const testEvaluation = {
  queixaPrincipal: 'Queixa de perda de memória recente, dificuldade para lembrar compromissos',
  historiaDoenca: 'Iniciou há aproximadamente 2 anos com esquecimentos leves, que vem progredindo',
  exameNeurologico: 'Paciente alerta, orientada, sem déficits motores ou sensitivos aparentes',
  exameClinico: 'PA: 130/80 mmHg, FC: 72 bpm, regular',
  hipoteseDiagnostica: 'Comprometimento Cognitivo Leve - provável evolução para Demência de Alzheimer',
  cid10: 'G30.9',
  conduta: 'Solicitados exames complementares (neuroimagem e laboratoriais). Retorno em 30 dias.',
};

export const mmseAnswers = {
  // Orientação Temporal (5 pontos)
  1: 1, // Dia da semana
  2: 1, // Dia do mês
  3: 1, // Mês
  4: 1, // Ano
  5: 1, // Hora aproximada

  // Orientação Espacial (5 pontos)
  6: 1, // Local específico
  7: 1, // Instituição
  8: 1, // Bairro
  9: 1, // Cidade
  10: 1, // Estado

  // Memória Imediata (3 pontos)
  11: 1, // Repetição de 3 palavras

  // Atenção e Cálculo (5 pontos)
  12: 1, // 100-7
  13: 1, // 93-7
  14: 1, // 86-7
  15: 1, // 79-7
  16: 1, // 72-7

  // Memória de Evocação (3 pontos)
  17: 1, // Lembrar 3 palavras

  // Linguagem (8 pontos)
  18: 1, // Nomear objetos
  19: 1, // Repetir frase
};

export const mocaAnswers = {
  // Visuoespacial (5 pontos)
  1: 1, // Trilha
  2: 1, // Cubo
  3: 1, // Relógio (contorno)
  4: 1, // Relógio (números)
  5: 1, // Relógio (ponteiros)

  // Nomeação (3 pontos)
  6: 1, // Leão
  7: 1, // Rinoceronte
  8: 1, // Camelo

  // Memória (sem pontuação imediata)
  9: 0, // Registro de palavras

  // Atenção (6 pontos)
  10: 1, // Dígitos diretos
  11: 1, // Dígitos inversos
  12: 1, // Vigilância
  13: 1, // Subtração de 7
  14: 1, // Subtração de 7
  15: 1, // Subtração de 7

  // Linguagem (3 pontos)
  16: 1, // Repetição de frases
  17: 1, // Fluência verbal

  // Abstração (2 pontos)
  18: 1, // Semelhanças
  19: 1, // Semelhanças

  // Evocação Tardia (5 pontos)
  20: 1, // Lembrar palavras
  21: 1,
  22: 1,
  23: 1,
  24: 1,

  // Orientação (6 pontos)
  25: 1, // Data, mês, ano, dia, local, cidade
};

export const testReport = {
  tipo: 'AVALIACAO_COMPLETA' as const,
  resumo: 'Avaliação neuropsicológica completa com testes cognitivos',
  conclusao: 'Paciente apresenta comprometimento cognitivo leve, sugerindo investigação adicional',
  recomendacoes: 'Acompanhamento trimestral, exames de neuroimagem, avaliação laboratorial completa',
};
