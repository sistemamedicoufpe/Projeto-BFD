// script.js - Sistema NeuroDiagnóstico

// ========================
// CARREGAR DADOS DO LOCALSTORAGE
// ========================

// Verificar se há um paciente específico na URL
function getCurrentPatientId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('patient') || 'P-00482'; // ID padrão
}

// Carregar dados do paciente atual
let currentPatientId = getCurrentPatientId();
let currentPatient = PatientsManager.getById(currentPatientId);
let currentEvaluation = EvaluationsManager.getByPatient(currentPatientId);
let examData = ExamsManager.getByPatient(currentPatientId);

// Se o paciente não existir, usar o primeiro disponível
if (!currentPatient) {
    const allPatients = PatientsManager.getAll();
    if (allPatients.length > 0) {
        currentPatient = allPatients[0];
        currentPatientId = currentPatient.id;
        currentEvaluation = EvaluationsManager.getByPatient(currentPatientId);
        examData = ExamsManager.getByPatient(currentPatientId);
    }
}

// Mapear dados para o formato antigo (compatibilidade)
const patientData = currentPatient ? {
    name: currentPatient.nome,
    age: currentPatient.idade,
    id: currentPatient.id,
    lastVisit: currentPatient.ultimaConsulta,
    birthDate: currentPatient.dataNascimento,
    gender: currentPatient.genero,
    cpf: currentPatient.cpf,
    contact: currentPatient.contato,
    responsible: currentPatient.responsavel,
    familyHistory: currentPatient.historicoFamiliar,
    comorbidities: currentPatient.comorbidades,
    medications: currentPatient.medicacoes,
    cid: currentPatient.cid,
    symptomDate: currentPatient.dataInicioSintomas,
    tests: currentEvaluation?.testes || [],
    riskLevel: currentEvaluation?.nivelRisco || 'Não avaliado',
    riskDescription: currentEvaluation?.descricaoRisco || '',
    recommendations: currentEvaluation?.recomendacoes || [],
    aiPredictions: currentEvaluation?.iaPredicoes || {
        alzheimer: 0,
        dlb: 0,
        ftd: 0,
        mci: 0
    }
} : null;

// Dados do gráfico de progressão
const chartData = {
    labels: ['Jan/22', 'Mar/22', 'Jun/22', 'Set/22', 'Dez/22', 'Mar/23'],
    datasets: [{
        label: 'Pontuação MMSE',
        data: [28, 27, 26, 25, 24, 24],
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: true,
        tension: 0.4
    }]
};

// ========================
// INICIALIZAÇÃO
// ========================

document.addEventListener('DOMContentLoaded', function() {
    // A autenticação e navegação ativa são gerenciadas automaticamente pelo common.js
    loadSummaryCards();
    loadPatientData();
    loadExamTimeline();
    initChart();
    setupMenu();
    setupModals();
    setupFilters();
    setupEventListeners();
    setupQuickActions();
    // setupMobileMenu(); // Também gerenciado pelo common.js
});

// ========================
// AUTENTICAÇÃO
// ========================
// As funções de autenticação (checkAuthentication, logout) estão definidas em common.js
// Este arquivo apenas as utiliza durante a inicialização

// ========================
// CARREGAR DADOS DOS CARDS
// ========================

function loadSummaryCards() {
    // Verificar se estamos na página index
    if (!document.getElementById('totalPatientsCard')) {
        return;
    }

    const patients = PatientsManager.getAll();
    const evaluations = EvaluationsManager.getAll();
    const reports = ReportsManager.getAll();

    document.getElementById('totalPatientsCard').textContent = patients.length;
    document.getElementById('totalEvaluationsCard').textContent = evaluations.length;
    document.getElementById('totalReportsCard').textContent = reports.length;
}

// ========================
// NAVEGAÇÃO ATIVA
// ========================
// A função setActiveNavigation() está definida em common.js e é chamada automaticamente

// ========================
// CARREGAR DADOS DO PACIENTE
// ========================

function loadPatientData() {
    // Informações básicas
    document.querySelector('.patient-details h3').textContent = `${patientData.name}, ${patientData.age} anos`;
    document.querySelector('.patient-details p').innerHTML = `ID: ${patientData.id} | Última consulta: ${patientData.lastVisit}`;

    // Grid de informações
    setElementText('infoBirthDate', patientData.birthDate);
    setElementText('infoGender', patientData.gender);
    setElementText('infoCPF', patientData.cpf);
    setElementText('infoContact', patientData.contact);
    setElementText('infoResponsible', patientData.responsible);
    setElementText('infoFamilyHistory', patientData.familyHistory);
    setElementText('infoComorbidities', patientData.comorbidities);
    setElementText('infoMedications', patientData.medications);
    setElementText('infoCID', patientData.cid);
    setElementText('infoSymptomDate', patientData.symptomDate);

    // Testes cognitivos
    loadCognitiveTests();

    // Avaliação de risco
    loadRiskAssessment();

    // Interpretação de IA
    loadAIPredictions();
}

function setElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

function loadCognitiveTests() {
    const testsGrid = document.querySelector('.tests-grid');
    if (!testsGrid) return;

    testsGrid.innerHTML = '';
    patientData.tests.forEach(test => {
        const testCard = document.createElement('div');
        testCard.className = 'test-card';
        testCard.innerHTML = `
            <div class="test-name">${test.name}</div>
            <div class="test-status status-${test.status === 'Concluído' ? 'completed' : 'pending'}">${test.status}</div>
            <div class="test-score">${test.score}</div>
        `;
        testsGrid.appendChild(testCard);
    });
}

function loadRiskAssessment() {
    const riskIndicator = document.querySelector('.risk-indicator');
    if (riskIndicator) {
        riskIndicator.textContent = patientData.riskLevel;
        riskIndicator.className = `risk-indicator risk-${patientData.riskLevel.toLowerCase()}`;
    }

    const riskDetailsTitle = document.querySelector('.risk-details h4');
    if (riskDetailsTitle) {
        riskDetailsTitle.textContent = `Risco de Demência: ${patientData.riskLevel}`;
    }

    const riskDetailsDescription = document.querySelector('.risk-details p');
    if (riskDetailsDescription) {
        riskDetailsDescription.textContent = patientData.riskDescription;
    }

    const recommendationsList = document.querySelector('.recommendations ul');
    if (recommendationsList) {
        recommendationsList.innerHTML = '';
        patientData.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });
    }
}

function loadAIPredictions() {
    // As barras já estão no HTML com valores inline
    // Aqui poderíamos animar ou atualizar dinamicamente
    animateProbabilityBars();
}

function animateProbabilityBars() {
    const bars = document.querySelectorAll('.probability-fill');
    bars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// ========================
// TIMELINE DE EXAMES
// ========================

function loadExamTimeline(filter = 'all') {
    const timeline = document.getElementById('examTimeline');
    if (!timeline) return;

    timeline.innerHTML = '';

    // Filtrar exames
    const filteredExams = filter === 'all'
        ? examData
        : examData.filter(exam => exam.type === filter);

    // Ordenar por data (mais recente primeiro)
    const sortedExams = [...filteredExams].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedExams.forEach(exam => {
        const timelineItem = createTimelineItem(exam);
        timeline.appendChild(timelineItem);
    });

    // Atualizar selects de comparação
    updateCompareSelects(sortedExams);
}

function createTimelineItem(exam) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.dataset.examId = exam.id;

    const formattedDate = formatDate(exam.date);

    item.innerHTML = `
        <div class="timeline-marker ${exam.type}"></div>
        <div class="timeline-content ${exam.type}">
            <div class="timeline-date">${formattedDate}</div>
            <div class="timeline-title">${exam.name}</div>
            <div class="timeline-description">${exam.description}</div>
            ${exam.score ? `<div class="timeline-score"><strong>Resultado:</strong> ${exam.score}</div>` : ''}
            ${exam.notes ? `<div class="timeline-notes"><strong>Observações:</strong> ${exam.notes}</div>` : ''}
            <div class="timeline-actions">
                <button class="btn btn-primary btn-sm" onclick="viewExam(${exam.id})">
                    <i class="fas fa-eye"></i> Visualizar
                </button>
                <button class="btn btn-outline btn-sm" onclick="downloadExam(${exam.id})">
                    <i class="fas fa-download"></i> Baixar
                </button>
            </div>
        </div>
    `;

    return item;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ========================
// FILTROS
// ========================

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos
            filterButtons.forEach(b => b.classList.remove('active'));
            // Adicionar active ao clicado
            this.classList.add('active');

            // Filtrar timeline
            const category = this.dataset.category;
            loadExamTimeline(category);
        });
    });
}

// ========================
// NAVEGAÇÃO
// ========================

function setupMenu() {
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ========================
// GRÁFICO DE PROGRESSÃO
// ========================

function initChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 30,
                    title: {
                        display: true,
                        text: 'Pontuação'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Período'
                    }
                }
            }
        }
    });
}

// ========================
// MODAIS
// ========================

function setupModals() {
    // Upload de Exame
    setupUploadModal();

    // Comparar Exames
    setupCompareModal();

    // Gerar Laudo
    setupReportModal();

    // Exportar Dados
    setupExportModal();

    // Fechar modais
    setupModalCloseHandlers();
}

function setupModalCloseHandlers() {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Fechar ao clicar fora
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

function setupUploadModal() {
    const uploadBtn = document.getElementById('uploadExamBtn');
    const modal = document.getElementById('uploadExamModal');
    const form = document.getElementById('uploadExamForm');

    if (uploadBtn && modal) {
        uploadBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleExamUpload(this);
        });
    }
}

function handleExamUpload(form) {
    const formData = new FormData(form);
    const examType = document.getElementById('examType').value;
    const examName = document.getElementById('examName').value;
    const examDate = document.getElementById('examDate').value;
    const examFile = document.getElementById('examFile').files[0];
    const examNotes = document.getElementById('examNotes').value;

    // Simular upload
    const newExam = {
        id: examData.length + 1,
        type: examType,
        name: examName,
        date: examDate,
        category: getCategoryName(examType),
        description: examName,
        file: examFile ? examFile.name : null,
        notes: examNotes
    };

    examData.unshift(newExam);
    loadExamTimeline();

    // Fechar modal e resetar form
    document.getElementById('uploadExamModal').classList.remove('active');
    form.reset();

    showNotification('Exame enviado com sucesso!', 'success');
}

function getCategoryName(type) {
    const categories = {
        'eeg': 'EEG',
        'cognitive': 'Cognição',
        'imaging': 'Imagem',
        'lab': 'Laboratório'
    };
    return categories[type] || 'Outro';
}

function setupCompareModal() {
    const compareBtn = document.getElementById('compareExamsBtn');
    const modal = document.getElementById('compareExamsModal');

    if (compareBtn && modal) {
        compareBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    // Listeners para selects de comparação
    const select1 = document.getElementById('compareExam1');
    const select2 = document.getElementById('compareExam2');

    if (select1 && select2) {
        select1.addEventListener('change', updateCompareView);
        select2.addEventListener('change', updateCompareView);
    }
}

function updateCompareSelects(exams) {
    const select1 = document.getElementById('compareExam1');
    const select2 = document.getElementById('compareExam2');

    if (!select1 || !select2) return;

    const options = exams.map(exam =>
        `<option value="${exam.id}">${exam.name} - ${formatDate(exam.date)}</option>`
    ).join('');

    select1.innerHTML = '<option value="">Selecione um exame...</option>' + options;
    select2.innerHTML = '<option value="">Selecione um exame...</option>' + options;
}

function updateCompareView() {
    const exam1Id = document.getElementById('compareExam1').value;
    const exam2Id = document.getElementById('compareExam2').value;
    const compareView = document.getElementById('compareView');

    if (!compareView) return;

    if (!exam1Id || !exam2Id) {
        compareView.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #7f8c8d;">Selecione dois exames para comparar</p>';
        return;
    }

    const exam1 = examData.find(e => e.id == exam1Id);
    const exam2 = examData.find(e => e.id == exam2Id);

    compareView.innerHTML = `
        <div class="exam-compare-card">
            <h4>${exam1.name}</h4>
            <p><strong>Data:</strong> ${formatDate(exam1.date)}</p>
            <p><strong>Categoria:</strong> ${exam1.category}</p>
            ${exam1.score ? `<p><strong>Resultado:</strong> ${exam1.score}</p>` : ''}
            <p><strong>Observações:</strong> ${exam1.notes || 'Nenhuma'}</p>
        </div>
        <div class="exam-compare-card">
            <h4>${exam2.name}</h4>
            <p><strong>Data:</strong> ${formatDate(exam2.date)}</p>
            <p><strong>Categoria:</strong> ${exam2.category}</p>
            ${exam2.score ? `<p><strong>Resultado:</strong> ${exam2.score}</p>` : ''}
            <p><strong>Observações:</strong> ${exam2.notes || 'Nenhuma'}</p>
        </div>
    `;
}

function setupReportModal() {
    const reportBtn = document.getElementById('generateReportBtn');
    const modal = document.getElementById('generateReportModal');
    const downloadBtn = document.getElementById('downloadReportBtn');
    const saveDraftBtn = document.getElementById('saveReportDraftBtn');

    if (reportBtn && modal) {
        reportBtn.addEventListener('click', () => {
            generateReportDraft();
            modal.classList.add('active');
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadReportPDF);
    }

    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveReportDraft);
    }
}

function generateReportDraft() {
    const preview = document.getElementById('reportPreview');
    if (!preview) return;

    const reportContent = `
        <h2 style="text-align: center; color: #2c3e50;">LAUDO NEUROLÓGICO</h2>
        <hr>

        <h3>Dados do Paciente</h3>
        <p><strong>Nome:</strong> ${patientData.name}</p>
        <p><strong>Idade:</strong> ${patientData.age} anos</p>
        <p><strong>Data de Nascimento:</strong> ${patientData.birthDate}</p>
        <p><strong>CPF:</strong> ${patientData.cpf}</p>
        <p><strong>Data da Avaliação:</strong> ${patientData.lastVisit}</p>

        <h3>Histórico Clínico</h3>
        <p><strong>Histórico Familiar:</strong> ${patientData.familyHistory}</p>
        <p><strong>Comorbidades:</strong> ${patientData.comorbidities}</p>
        <p><strong>Medicações em Uso:</strong> ${patientData.medications}</p>
        <p><strong>Data de Início dos Sintomas:</strong> ${patientData.symptomDate}</p>
        <p><strong>CID-10:</strong> ${patientData.cid}</p>

        <h3>Avaliações Cognitivas</h3>
        <ul>
            ${patientData.tests.map(test => `
                <li><strong>${test.name}:</strong> ${test.score} - ${test.status}</li>
            `).join('')}
        </ul>

        <h3>Resultados de EEG</h3>
        <p>Análise do eletroencefalograma realizado em ${formatDate(examData.find(e => e.type === 'eeg')?.date || '2023-03-15')}
        demonstrou presença de ondas lentas difusas, compatível com disfunção cortical.</p>

        <h3>Interpretação Assistida por IA</h3>
        <p>O modelo de inteligência artificial sugere as seguintes probabilidades diagnósticas:</p>
        <ul>
            <li>Doença de Alzheimer (DA): ${patientData.aiPredictions.alzheimer}%</li>
            <li>Demência com Corpos de Lewy (DLB): ${patientData.aiPredictions.dlb}%</li>
            <li>Demência Frontotemporal (FTD): ${patientData.aiPredictions.ftd}%</li>
            <li>Declínio Cognitivo Leve (DCL): ${patientData.aiPredictions.mci}%</li>
        </ul>

        <h3>Impressão Diagnóstica</h3>
        <p>${patientData.riskDescription}</p>

        <h3>Recomendações</h3>
        <ul>
            ${patientData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>

        <br><br>
        <p style="text-align: right;">
            _______________________________________<br>
            <strong>Assinatura do Responsável</strong><br>
            Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}
        </p>

        <p style="text-align: center; font-size: 0.8em; color: #7f8c8d; margin-top: 30px;">
            Laudo gerado com auxílio do Sistema NeuroDiagnóstico
        </p>
    `;

    preview.innerHTML = reportContent;
}

function downloadReportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const content = document.getElementById('reportPreview').innerText;

    // Configurações do PDF
    doc.setFontSize(12);

    // Dividir o conteúdo em linhas
    const lines = doc.splitTextToSize(content, 180);

    // Adicionar o texto ao PDF
    let y = 20;
    lines.forEach(line => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        doc.text(line, 15, y);
        y += 7;
    });

    // Salvar o PDF
    doc.save(`Laudo_${patientData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

    showNotification('Laudo PDF gerado com sucesso!', 'success');
}

function saveReportDraft() {
    const content = document.getElementById('reportPreview').innerHTML;
    localStorage.setItem('reportDraft_' + patientData.id, content);
    showNotification('Rascunho salvo com sucesso!', 'success');
}

function setupExportModal() {
    const exportBtn = document.getElementById('exportDataBtn');
    const modal = document.getElementById('exportDataModal');
    const confirmBtn = document.getElementById('confirmExportBtn');

    if (exportBtn && modal) {
        exportBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleExportData);
    }
}

function handleExportData() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    const includePersonal = document.querySelector('input[name="includePersonal"]').checked;
    const includeMedical = document.querySelector('input[name="includeMedical"]').checked;
    const includeExams = document.querySelector('input[name="includeExams"]').checked;
    const includeAI = document.querySelector('input[name="includeAI"]').checked;
    const anonymize = document.getElementById('anonymizeData').checked;

    // Montar objeto de exportação
    const exportData = {};

    if (includePersonal) {
        exportData.personal = {
            name: anonymize ? 'ANONIMIZADO' : patientData.name,
            age: patientData.age,
            id: anonymize ? 'XXXX' : patientData.id,
            birthDate: anonymize ? 'XX/XX/XXXX' : patientData.birthDate,
            gender: patientData.gender,
            cpf: anonymize ? 'XXX.XXX.XXX-XX' : patientData.cpf
        };
    }

    if (includeMedical) {
        exportData.medical = {
            familyHistory: patientData.familyHistory,
            comorbidities: patientData.comorbidities,
            medications: patientData.medications,
            cid: patientData.cid,
            symptomDate: patientData.symptomDate
        };
    }

    if (includeExams) {
        exportData.exams = examData;
        exportData.cognitiveTests = patientData.tests;
    }

    if (includeAI) {
        exportData.aiPredictions = patientData.aiPredictions;
        exportData.riskLevel = patientData.riskLevel;
        exportData.riskDescription = patientData.riskDescription;
    }

    // Exportar no formato escolhido
    if (format === 'json') {
        downloadJSON(exportData);
    } else if (format === 'csv') {
        downloadCSV(exportData);
    }

    // Fechar modal
    document.getElementById('exportDataModal').classList.remove('active');
}

function downloadJSON(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dados_Paciente_${patientData.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Dados exportados em JSON!', 'success');
}

function downloadCSV(data) {
    let csv = '';

    // Dados pessoais
    if (data.personal) {
        csv += 'DADOS PESSOAIS\n';
        csv += Object.keys(data.personal).join(',') + '\n';
        csv += Object.values(data.personal).join(',') + '\n\n';
    }

    // Dados médicos
    if (data.medical) {
        csv += 'DADOS MÉDICOS\n';
        csv += Object.keys(data.medical).join(',') + '\n';
        csv += Object.values(data.medical).join(',') + '\n\n';
    }

    // Exames
    if (data.exams) {
        csv += 'EXAMES\n';
        csv += 'ID,Tipo,Nome,Data,Categoria,Observações\n';
        data.exams.forEach(exam => {
            csv += `${exam.id},${exam.type},${exam.name},${exam.date},${exam.category},"${exam.notes || ''}"\n`;
        });
        csv += '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dados_Paciente_${patientData.id}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Dados exportados em CSV!', 'success');
}

// ========================
// EVENT LISTENERS
// ========================

function setupEventListeners() {
    // Botão de editar paciente (se houver)
    const editButton = document.querySelector('.open-modal');
    if (editButton) {
        // Implementar funcionalidade de edição
    }
}

// ========================
// AÇÕES RÁPIDAS
// ========================

function setupQuickActions() {
    // Verificar se estamos na página que tem ações rápidas
    const quickUploadBtn = document.getElementById('quickUploadBtn');
    const quickReportBtn = document.getElementById('quickReportBtn');

    if (quickUploadBtn) {
        quickUploadBtn.addEventListener('click', function() {
            const uploadBtn = document.getElementById('uploadExamBtn');
            if (uploadBtn) {
                uploadBtn.click();
            }
        });
    }

    if (quickReportBtn) {
        quickReportBtn.addEventListener('click', function() {
            const reportBtn = document.getElementById('generateReportBtn');
            if (reportBtn) {
                reportBtn.click();
            }
        });
    }
}

// ========================
// MENU MOBILE
// ========================
// A função setupMobileMenu() está definida em common.js e é chamada automaticamente

// ========================
// FUNÇÕES DE VISUALIZAÇÃO
// ========================

function viewExam(examId) {
    const exam = examData.find(e => e.id === examId);
    if (!exam) return;

    // Aqui seria implementado um visualizador específico
    // Para EEG, mostrar gráficos; para imagens, visualizador DICOM, etc.
    alert(`Visualizando: ${exam.name}\n\nEm uma implementação completa, aqui seria exibido:\n- EEG: gráficos temporais e espectrais\n- Imagens: visualizador DICOM\n- Laudos: PDF viewer\n- Resultados: tabelas e gráficos`);
}

function downloadExam(examId) {
    const exam = examData.find(e => e.id === examId);
    if (!exam || !exam.file) {
        showNotification('Arquivo não disponível', 'error');
        return;
    }

    // Simular download
    showNotification(`Download iniciado: ${exam.file}`, 'success');
}

// ========================
// NOTIFICAÇÕES
// ========================

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .exam-compare-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #ddd;
    }

    .exam-compare-card h4 {
        margin-bottom: 15px;
        color: var(--primary);
    }

    .exam-compare-card p {
        margin-bottom: 10px;
    }

    .timeline-score,
    .timeline-notes {
        margin-top: 8px;
        font-size: 0.9rem;
    }

    .btn-sm {
        padding: 5px 12px;
        font-size: 0.85rem;
    }
`;
document.head.appendChild(style);
