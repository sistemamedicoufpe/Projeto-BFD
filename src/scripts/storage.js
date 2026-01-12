// storage.js - Sistema de Armazenamento Local

// ========================
// GERENCIADOR DE STORAGE
// ========================

const Storage = {
    // Chaves de armazenamento
    KEYS: {
        PATIENTS: 'neurodiag_patients',
        EXAMS: 'neurodiag_exams',
        EVALUATIONS: 'neurodiag_evaluations',
        REPORTS: 'neurodiag_reports',
        USER: 'neurodiag_user',
        SETTINGS: 'neurodiag_settings'
    },

    // Inicializar storage com dados de exemplo (apenas para novos usuários que optarem)
    init(loadSampleData = false) {
        if (!this.get(this.KEYS.PATIENTS)) {
            if (loadSampleData) {
                this.initializeDefaultData();
            } else {
                // Inicializar com arrays vazios para novos usuários
                this.initializeEmptyData();
            }
        }
    },

    // Inicializar com dados vazios
    initializeEmptyData() {
        this.set(this.KEYS.PATIENTS, []);
        this.set(this.KEYS.EXAMS, []);
        this.set(this.KEYS.EVALUATIONS, []);
        this.set(this.KEYS.REPORTS, []);
    },

    // Obter dados do localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao ler localStorage:', error);
            return null;
        }
    },

    // Salvar dados no localStorage
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    },

    // Remover dados do localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    },

    // Limpar todo o storage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
            return false;
        }
    },

    // Inicializar com dados padrão
    initializeDefaultData() {
        const defaultPatients = [
            {
                id: 'P-00482',
                nome: 'Maria Oliveira',
                idade: 72,
                dataNascimento: '15/08/1951',
                genero: 'Feminino',
                cpf: '123.456.789-00',
                contato: '(11) 98765-4321',
                responsavel: 'João Oliveira (filho)',
                historicoFamiliar: 'Mãe com DA',
                comorbidades: 'Hipertensão, Diabetes',
                medicacoes: 'Losartana, Metformina',
                cid: 'F03 - Demência não especificada',
                dataInicioSintomas: '01/2022',
                ultimaConsulta: '15/03/2023',
                status: 'Em Avaliação',
                dataCadastro: new Date().toISOString()
            },
            {
                id: 'P-00481',
                nome: 'João Silva',
                idade: 68,
                dataNascimento: '22/05/1955',
                genero: 'Masculino',
                cpf: '987.654.321-00',
                contato: '(11) 91234-5678',
                responsavel: 'Maria Silva (esposa)',
                historicoFamiliar: 'Sem histórico',
                comorbidades: 'Hipertensão',
                medicacoes: 'Losartana',
                cid: 'G30 - Doença de Alzheimer',
                dataInicioSintomas: '06/2021',
                ultimaConsulta: '12/03/2023',
                status: 'Concluído',
                dataCadastro: new Date().toISOString()
            },
            {
                id: 'P-00480',
                nome: 'Ana Santos',
                idade: 75,
                dataNascimento: '10/02/1948',
                genero: 'Feminino',
                cpf: '456.789.123-00',
                contato: '(11) 95678-1234',
                responsavel: 'Pedro Santos (filho)',
                historicoFamiliar: 'Pai com demência vascular',
                comorbidades: 'Diabetes, Hipertensão, AVC prévio',
                medicacoes: 'Metformina, Losartana, AAS',
                cid: 'F01 - Demência vascular',
                dataInicioSintomas: '03/2022',
                ultimaConsulta: '10/03/2023',
                status: 'Agendado',
                dataCadastro: new Date().toISOString()
            }
        ];

        const defaultExams = [
            {
                id: 1,
                pacienteId: 'P-00482',
                tipo: 'eeg',
                nome: 'EEG Basal',
                data: '2023-03-15',
                categoria: 'EEG',
                descricao: 'Eletroencefalograma em repouso',
                arquivo: 'eeg_2023_03_15.edf',
                observacoes: 'Presença de ondas lentas difusas',
                resultado: null
            },
            {
                id: 2,
                pacienteId: 'P-00482',
                tipo: 'cognitive',
                nome: 'MMSE',
                data: '2023-03-10',
                categoria: 'Cognição',
                descricao: 'Mini-Exame do Estado Mental',
                arquivo: null,
                observacoes: 'Déficit em memória recente e orientação temporal',
                resultado: '24/30'
            },
            {
                id: 3,
                pacienteId: 'P-00482',
                tipo: 'imaging',
                nome: 'RM de Crânio',
                data: '2023-02-20',
                categoria: 'Imagem',
                descricao: 'Ressonância magnética',
                arquivo: 'rm_2023_02_20.dcm',
                observacoes: 'Atrofia cortical leve bilateral',
                resultado: null
            }
        ];

        const defaultEvaluations = [
            {
                pacienteId: 'P-00482',
                type: 'cognitive',
                date: '2023-03-10',
                status: 'Concluída',
                aiAssisted: true,
                score: 24,
                testes: [
                    { nome: 'Mini-Mental (MMSE)', status: 'Concluído', pontuacao: '24/30', data: '2023-03-10' },
                    { nome: 'MoCA', status: 'Concluído', pontuacao: '18/30', data: '2023-03-08' },
                    { nome: 'CDR', status: 'Concluído', pontuacao: '1.0', data: '2023-03-05' },
                    { nome: 'Teste do Relógio', status: 'Pendente', pontuacao: '-', data: null }
                ],
                nivelRisco: 'Moderado',
                descricaoRisco: 'Paciente apresenta declínio cognitivo significativo com pontuações abaixo do esperado para idade e escolaridade.',
                recomendacoes: [
                    'Realizar exames de neuroimagem (RM ou TC de crânio)',
                    'Avaliação com geriatra para manejo de comorbidades',
                    'Iniciar acompanhamento com terapia ocupacional',
                    'Reavaliar em 6 meses com bateria completa de testes',
                    'Orientar família sobre segurança e adaptações no ambiente doméstico'
                ],
                iaPredicoes: {
                    alzheimer: 65,
                    dlb: 20,
                    ftd: 10,
                    dcl: 5
                },
                aiProbabilities: {
                    alzheimer: 65
                }
            },
            {
                pacienteId: 'P-00481',
                type: 'cognitive',
                date: '2023-03-12',
                status: 'Concluída',
                aiAssisted: true,
                score: 28,
                testes: [
                    { nome: 'Mini-Mental (MMSE)', status: 'Concluído', pontuacao: '28/30', data: '2023-03-12' }
                ],
                nivelRisco: 'Baixo',
                descricaoRisco: 'Paciente apresenta funções cognitivas preservadas.',
                recomendacoes: ['Reavaliar em 12 meses'],
                iaPredicoes: {
                    alzheimer: 15,
                    dlb: 5,
                    ftd: 5,
                    dcl: 75
                },
                aiProbabilities: {
                    alzheimer: 15
                }
            },
            {
                pacienteId: 'P-00480',
                type: 'neurological',
                date: '2023-03-08',
                status: 'Pendente',
                aiAssisted: false,
                score: 0,
                testes: [],
                nivelRisco: 'Não avaliado',
                descricaoRisco: '',
                recomendacoes: [],
                iaPredicoes: {
                    alzheimer: 0,
                    dlb: 0,
                    ftd: 0,
                    dcl: 0
                }
            }
        ];

        const defaultUser = {
            nome: 'Dr. Silva',
            email: 'dr.silva@neurodiagnostico.com.br',
            crm: '12345-SP',
            avatar: 'https://i.pravatar.cc/150?img=12',
            especialidade: 'Neurologia'
        };

        const defaultSettings = {
            tema: 'claro',
            notificacoes: true,
            idioma: 'pt-BR',
            unidadeMedida: 'metrica'
        };

        const defaultReports = [
            {
                id: 'R-001',
                patientId: 'P-00482',
                type: 'Avaliação Neurológica Completa',
                date: '15/03/2023',
                status: 'Concluído',
                createdBy: 'Dr. Silva',
                summary: 'Avaliação neurológica completa com suspeita de DA'
            },
            {
                id: 'R-002',
                patientId: 'P-00481',
                type: 'Relatório de Seguimento',
                date: '12/03/2023',
                status: 'Concluído',
                createdBy: 'Dr. Silva',
                summary: 'Paciente em evolução favorável'
            },
            {
                id: 'R-003',
                patientId: 'P-00480',
                type: 'Avaliação Inicial',
                date: '10/03/2023',
                status: 'Pendente',
                createdBy: 'Dr. Silva',
                summary: 'Primeira consulta - avaliação pendente'
            }
        ];

        this.set(this.KEYS.PATIENTS, defaultPatients);
        this.set(this.KEYS.EXAMS, defaultExams);
        this.set(this.KEYS.EVALUATIONS, defaultEvaluations);
        this.set(this.KEYS.REPORTS, defaultReports);
        this.set(this.KEYS.USER, defaultUser);
        this.set(this.KEYS.SETTINGS, defaultSettings);
    }
};

// ========================
// FUNÇÕES DE PACIENTES
// ========================

const PatientsManager = {
    // Obter todos os pacientes
    getAll() {
        return Storage.get(Storage.KEYS.PATIENTS) || [];
    },

    // Obter paciente por ID
    getById(id) {
        const patients = this.getAll();
        return patients.find(p => p.id === id);
    },

    // Adicionar novo paciente
    add(patient) {
        const patients = this.getAll();
        const newPatient = {
            ...patient,
            id: `P-${String(patients.length + 1).padStart(5, '0')}`,
            dataCadastro: new Date().toISOString()
        };
        patients.push(newPatient);
        return Storage.set(Storage.KEYS.PATIENTS, patients);
    },

    // Atualizar paciente
    update(id, updatedData) {
        const patients = this.getAll();
        const index = patients.findIndex(p => p.id === id);
        if (index !== -1) {
            patients[index] = { ...patients[index], ...updatedData };
            return Storage.set(Storage.KEYS.PATIENTS, patients);
        }
        return false;
    },

    // Remover paciente
    delete(id) {
        const patients = this.getAll();
        const filtered = patients.filter(p => p.id !== id);
        return Storage.set(Storage.KEYS.PATIENTS, filtered);
    },

    // Buscar pacientes
    search(query) {
        const patients = this.getAll();
        const lowerQuery = query.toLowerCase();
        return patients.filter(p =>
            p.nome.toLowerCase().includes(lowerQuery) ||
            p.id.toLowerCase().includes(lowerQuery) ||
            p.cpf.includes(query)
        );
    }
};

// ========================
// FUNÇÕES DE EXAMES
// ========================

const ExamsManager = {
    // Obter todos os exames
    getAll() {
        return Storage.get(Storage.KEYS.EXAMS) || [];
    },

    // Obter exames por paciente
    getByPatient(pacienteId) {
        const exams = this.getAll();
        return exams.filter(e => e.pacienteId === pacienteId);
    },

    // Adicionar novo exame
    add(exam) {
        const exams = this.getAll();
        const newExam = {
            ...exam,
            id: exams.length > 0 ? Math.max(...exams.map(e => e.id)) + 1 : 1
        };
        exams.push(newExam);
        return Storage.set(Storage.KEYS.EXAMS, exams);
    },

    // Atualizar exame
    update(id, updatedData) {
        const exams = this.getAll();
        const index = exams.findIndex(e => e.id === id);
        if (index !== -1) {
            exams[index] = { ...exams[index], ...updatedData };
            return Storage.set(Storage.KEYS.EXAMS, exams);
        }
        return false;
    },

    // Remover exame
    delete(id) {
        const exams = this.getAll();
        const filtered = exams.filter(e => e.id !== id);
        return Storage.set(Storage.KEYS.EXAMS, filtered);
    }
};

// ========================
// FUNÇÕES DE AVALIAÇÕES
// ========================

const EvaluationsManager = {
    // Obter todas as avaliações
    getAll() {
        return Storage.get(Storage.KEYS.EVALUATIONS) || [];
    },

    // Obter avaliação por paciente
    getByPatient(pacienteId) {
        const evaluations = this.getAll();
        return evaluations.find(e => e.pacienteId === pacienteId);
    },

    // Salvar avaliação
    save(evaluation) {
        const evaluations = this.getAll();
        const index = evaluations.findIndex(e => e.pacienteId === evaluation.pacienteId);

        if (index !== -1) {
            evaluations[index] = evaluation;
        } else {
            evaluations.push(evaluation);
        }

        return Storage.set(Storage.KEYS.EVALUATIONS, evaluations);
    }
};

// ========================
// FUNÇÕES DE RELATÓRIOS
// ========================

const ReportsManager = {
    // Obter todos os relatórios
    getAll() {
        return Storage.get(Storage.KEYS.REPORTS) || [];
    },

    // Salvar relatório
    save(report) {
        const reports = this.getAll();
        const newReport = {
            ...report,
            id: reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1,
            dataCriacao: new Date().toISOString()
        };
        reports.push(newReport);
        return Storage.set(Storage.KEYS.REPORTS, reports);
    }
};

// ========================
// FUNÇÕES DE USUÁRIO
// ========================

const UserManager = {
    // Obter usuário atual
    get() {
        return Storage.get(Storage.KEYS.USER);
    },

    // Atualizar usuário
    update(userData) {
        return Storage.set(Storage.KEYS.USER, userData);
    }
};

// ========================
// FUNÇÕES DE CONFIGURAÇÕES
// ========================

const SettingsManager = {
    // Obter configurações
    get() {
        return Storage.get(Storage.KEYS.SETTINGS);
    },

    // Atualizar configurações
    update(settings) {
        return Storage.set(Storage.KEYS.SETTINGS, settings);
    }
};

// Inicializar storage quando o script carregar (sem dados de exemplo por padrão)
Storage.init(false);

// Exportar para uso global
window.Storage = Storage;
window.PatientsManager = PatientsManager;
window.ExamsManager = ExamsManager;
window.EvaluationsManager = EvaluationsManager;
window.ReportsManager = ReportsManager;
window.UserManager = UserManager;
window.SettingsManager = SettingsManager;
