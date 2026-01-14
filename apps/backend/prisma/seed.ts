import { PrismaClient, UserRole, Gender, EvaluationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.report.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.evaluation.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create demo users
  console.log('👥 Creating demo users...');

  const hashedPassword = await bcrypt.hash('Demo@123456', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@neurocare.com.br',
      passwordHash: hashedPassword,
      name: 'Administrador Sistema',
      role: UserRole.ADMIN,
      crm: '000000',
      twoFactorEnabled: false,
    },
  });

  const doctorUser = await prisma.user.create({
    data: {
      email: 'dr.silva@neurocare.com.br',
      passwordHash: hashedPassword,
      name: 'Dr. João Silva',
      role: UserRole.DOCTOR,
      crm: '123456',
      twoFactorEnabled: false,
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'teste@neurocare.com.br',
      passwordHash: await bcrypt.hash('Teste@123456', 10),
      name: 'Dr. Teste Demo',
      role: UserRole.DOCTOR,
      crm: '999999',
      twoFactorEnabled: false,
    },
  });

  console.log('✅ Users created:', {
    admin: adminUser.email,
    doctor: doctorUser.email,
    test: testUser.email,
  });

  // Create demo patients
  console.log('🏥 Creating demo patients...');

  const patient1 = await prisma.patient.create({
    data: {
      nome: 'Maria da Silva Santos',
      cpf: '12345678900',
      dataNascimento: new Date('1950-05-15'),
      idade: 74,
      genero: Gender.FEMALE,
      estadoCivil: 'CASADO',
      escolaridade: 8,
      profissao: 'Professora aposentada',
      telefone: '11987654321',
      email: 'maria.silva@email.com',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234567',
      contatoEmergenciaNome: 'João Santos',
      contatoEmergenciaTelefone: '11912345678',
      contatoEmergenciaRelacao: 'Filho',
      historicoMedicoEnc: 'Hipertensão arterial controlada. Sem histórico de AVC.',
      alergias: ['Penicilina'],
      medicamentosEmUso: ['Losartana 50mg', 'Hidroclorotiazida 25mg'],
      queixaPrincipal: 'Esquecimento frequente, dificuldade para lembrar nomes.',
      version: 1,
      isDeleted: false,
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      nome: 'José Carlos Oliveira',
      cpf: '98765432100',
      dataNascimento: new Date('1945-08-22'),
      idade: 79,
      genero: Gender.MALE,
      estadoCivil: 'VIUVO',
      escolaridade: 12,
      profissao: 'Engenheiro aposentado',
      telefone: '11976543210',
      email: 'jose.oliveira@email.com',
      endereco: 'Avenida Paulista, 456',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310100',
      contatoEmergenciaNome: 'Ana Paula Oliveira',
      contatoEmergenciaTelefone: '11998765432',
      contatoEmergenciaRelacao: 'Filha',
      historicoMedicoEnc: 'Diabetes tipo 2, colesterol alto.',
      alergias: [],
      medicamentosEmUso: ['Metformina 850mg', 'Sinvastatina 20mg'],
      queixaPrincipal: 'Desorientação temporal, confusão ao realizar tarefas.',
      version: 1,
      isDeleted: false,
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      nome: 'Ana Maria Costa',
      cpf: '45678912300',
      dataNascimento: new Date('1955-03-10'),
      idade: 69,
      genero: Gender.FEMALE,
      estadoCivil: 'CASADO',
      escolaridade: 16,
      profissao: 'Médica aposentada',
      telefone: '11965432109',
      email: 'ana.costa@email.com',
      endereco: 'Rua Augusta, 789',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01305000',
      contatoEmergenciaNome: 'Pedro Costa',
      contatoEmergenciaTelefone: '11987654320',
      contatoEmergenciaRelacao: 'Esposo',
      historicoMedicoEnc: 'Saudável, sem comorbidades significativas.',
      alergias: ['Dipirona'],
      medicamentosEmUso: [],
      queixaPrincipal: 'Preocupação com memória recente.',
      version: 1,
      isDeleted: false,
    },
  });

  console.log('✅ Patients created:', patient1.nome, patient2.nome, patient3.nome);

  // Create demo evaluations
  console.log('📋 Creating demo evaluations...');

  const evaluation1 = await prisma.evaluation.create({
    data: {
      patientId: patient1.id,
      userId: doctorUser.id,
      dataAvaliacao: new Date('2026-01-10'),
      status: EvaluationStatus.COMPLETED,
      queixaPrincipal: 'Esquecimento frequente de eventos recentes',
      historiaDoenca: 'Iniciou há 2 anos com esquecimentos leves que vem progredindo',
      exameNeurologico: 'Paciente alerta, orientada, sem déficits motores aparentes',
      exameClinico: 'PA: 130/80 mmHg, FC: 72 bpm',
      mmseResultEnc: JSON.stringify({
        totalScore: 22,
        maxScore: 30,
        percentage: 73.33,
        interpretation: 'Comprometimento Cognitivo Leve',
        domainScores: {
          'Orientação Temporal': { score: 4, maxScore: 5 },
          'Orientação Espacial': { score: 4, maxScore: 5 },
          'Memória Imediata': { score: 3, maxScore: 3 },
          'Atenção e Cálculo': { score: 3, maxScore: 5 },
          'Memória de Evocação': { score: 1, maxScore: 3 },
          'Linguagem': { score: 6, maxScore: 8 },
          'Habilidade Visuoconstrutiva': { score: 1, maxScore: 1 },
        },
        completedAt: new Date(),
      }),
      hipoteseDiagnostica: 'Comprometimento Cognitivo Leve - possível evolução para DA',
      cid10: 'G30.9',
      conduta: 'Solicitar neuroimagem e exames laboratoriais. Retorno em 30 dias.',
      version: 1,
      isDeleted: false,
    },
  });

  const evaluation2 = await prisma.evaluation.create({
    data: {
      patientId: patient2.id,
      userId: doctorUser.id,
      dataAvaliacao: new Date('2026-01-12'),
      status: EvaluationStatus.COMPLETED,
      queixaPrincipal: 'Desorientação e confusão mental',
      historiaDoenca: 'Quadro progressivo nos últimos 3 anos',
      exameNeurologico: 'Paciente confuso, desorientado no tempo',
      exameClinico: 'PA: 140/90 mmHg, FC: 78 bpm',
      mmseResultEnc: JSON.stringify({
        totalScore: 16,
        maxScore: 30,
        percentage: 53.33,
        interpretation: 'Demência Moderada',
        domainScores: {
          'Orientação Temporal': { score: 2, maxScore: 5 },
          'Orientação Espacial': { score: 3, maxScore: 5 },
          'Memória Imediata': { score: 2, maxScore: 3 },
          'Atenção e Cálculo': { score: 2, maxScore: 5 },
          'Memória de Evocação': { score: 0, maxScore: 3 },
          'Linguagem': { score: 6, maxScore: 8 },
          'Habilidade Visuoconstrutiva': { score: 1, maxScore: 1 },
        },
        completedAt: new Date(),
      }),
      mocaResultEnc: JSON.stringify({
        totalScore: 18,
        adjustedScore: 18,
        maxScore: 30,
        percentage: 60,
        interpretation: 'Déficit Cognitivo Moderado',
        educationAdjusted: false,
        completedAt: new Date(),
      }),
      hipoteseDiagnostica: 'Provável Doença de Alzheimer em estágio moderado',
      cid10: 'G30.1',
      conduta: 'Iniciar tratamento com inibidor de colinesterase. Acompanhamento mensal.',
      version: 1,
      isDeleted: false,
    },
  });

  console.log('✅ Evaluations created for patients');

  // Create demo reports
  console.log('📄 Creating demo reports...');

  await prisma.report.create({
    data: {
      patientId: patient1.id,
      evaluationId: evaluation1.id,
      userId: doctorUser.id,
      tipo: 'AVALIACAO_COMPLETA',
      titulo: 'Relatório de Avaliação Neuropsicológica - Maria da Silva Santos',
      resumo: 'Avaliação neuropsicológica completa com aplicação de testes cognitivos.',
      conclusao:
        'Paciente apresenta comprometimento cognitivo leve com déficit predominante em memória de evocação. Sugere-se investigação adicional com neuroimagem.',
      recomendacoes:
        'Acompanhamento trimestral, exames de neuroimagem (RM de crânio), avaliação laboratorial completa.',
      status: 'APPROVED',
      version: 1,
      isDeleted: false,
    },
  });

  await prisma.report.create({
    data: {
      patientId: patient2.id,
      evaluationId: evaluation2.id,
      userId: doctorUser.id,
      tipo: 'AVALIACAO_COMPLETA',
      titulo: 'Relatório de Avaliação Neurológica - José Carlos Oliveira',
      resumo: 'Avaliação neurológica com testes cognitivos MMSE e MoCA.',
      conclusao:
        'Paciente apresenta demência moderada compatível com Doença de Alzheimer. Déficits significativos em orientação temporal e memória.',
      recomendacoes:
        'Iniciar tratamento farmacológico com donepezila. Acompanhamento mensal. Orientação familiar sobre cuidados e segurança.',
      status: 'PUBLISHED',
      version: 1,
      isDeleted: false,
    },
  });

  console.log('✅ Reports created');

  // Create audit logs
  console.log('📊 Creating audit logs...');

  await prisma.auditLog.create({
    data: {
      userId: doctorUser.id,
      action: 'CREATE',
      resource: 'Patient',
      resourceId: patient1.id,
      ipAddress: '127.0.0.1',
      metadata: JSON.stringify({ event: 'Patient created during seed' }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: doctorUser.id,
      action: 'CREATE',
      resource: 'Evaluation',
      resourceId: evaluation1.id,
      ipAddress: '127.0.0.1',
      metadata: JSON.stringify({ event: 'Evaluation created during seed' }),
    },
  });

  console.log('✅ Audit logs created');

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📝 Demo Credentials:');
  console.log('   Admin: admin@neurocare.com.br / Demo@123456');
  console.log('   Doctor: dr.silva@neurocare.com.br / Demo@123456');
  console.log('   Test: teste@neurocare.com.br / Teste@123456\n');
  console.log('👥 Demo Patients: 3 patients created');
  console.log('📋 Demo Evaluations: 2 evaluations with MMSE/MoCA results');
  console.log('📄 Demo Reports: 2 reports ready for PDF generation\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
