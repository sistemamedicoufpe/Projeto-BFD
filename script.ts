// script.ts

interface Patient {
    name: string;
    age: number;
    id: string;
    lastVisit: string;
    birthDate: string;
    gender: string;
    contact: string;
    responsible: string;
    familyHistory: string;
    comorbidities: string;
    tests: Test[];
    riskLevel: string;
    riskDescription: string;
    recommendations: string[];
}

interface Test {
    name: string;
    status: string;
    score: string;
}

// Dados simulados do paciente
const patientData: Patient = {
    name: "Maria Oliveira",
    age: 72,
    id: "#P-00482",
    lastVisit: "15/03/2023",
    birthDate: "15/08/1951",
    gender: "Feminino",
    contact: "(11) 98765-4321",
    responsible: "João Oliveira (filho)",
    familyHistory: "Mãe com DA",
    comorbidities: "Hipertensão, Diabetes",
    tests: [
        { name: "Mini-Mental (MMSE)", status: "Concluído", score: "24/30" },
        { name: "MoCA", status: "Concluído", score: "18/30" },
        { name: "CDR", status: "Concluído", score: "1.0" },
        { name: "Teste do Relógio", status: "Pendente", score: "-" }
    ],
    riskLevel: "Moderado",
    riskDescription: "Paciente apresenta declínio cognitivo significativo com pontuações abaixo do esperado para idade e escolaridade.",
    recommendations: [
        "Realizar exames de neuroimagem (RM ou TC de crânio)",
        "Avaliação com geriatra para manejo de comorbidades",
        "Iniciar acompanhamento com terapia ocupacional",
        "Reavaliar em 6 meses com bateria completa de testes",
        "Orientar família sobre segurança e adaptações no ambiente doméstico"
    ]
};

// Dados para o gráfico
const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
        label: 'Pontuação MMSE',
        data: [28, 26, 24, 22, 21, 20],
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: true,
        tension: 0.4
    }]
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    loadPatientData();
    initChart();
    setupMenu();
    setupModal();
});

function loadPatientData(): void {
    // Preencher informações básicas
    const patientNameElement = document.querySelector('.patient-details h3') as HTMLElement;
    const patientDetailsElement = document.querySelector('.patient-details p') as HTMLElement;

    if (patientNameElement) {
        patientNameElement.textContent = `${patientData.name}, ${patientData.age} anos`;
    }
    if (patientDetailsElement) {
        patientDetailsElement.innerHTML = `ID: ${patientData.id} | Última consulta: ${patientData.lastVisit}`;
    }

    // Preencher a grid de informações (assumindo que temos elementos com esses IDs)
    setElementText('infoBirthDate', patientData.birthDate);
    setElementText('infoGender', patientData.gender);
    setElementText('infoContact', patientData.contact);
    setElementText('infoResponsible', patientData.responsible);
    setElementText('infoFamilyHistory', patientData.familyHistory);
    setElementText('infoComorbidities', patientData.comorbidities);

    // Preencher testes cognitivos
    const testsGrid = document.querySelector('.tests-grid');
    if (testsGrid) {
        testsGrid.innerHTML = ''; // Limpar o conteúdo existente

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

    // Preencher avaliação de risco
    const riskIndicator = document.querySelector('.risk-indicator') as HTMLElement;
    if (riskIndicator) {
        riskIndicator.textContent = patientData.riskLevel;
        riskIndicator.className = `risk-indicator risk-${patientData.riskLevel.toLowerCase()}`;
    }

    const riskDetailsTitle = document.querySelector('.risk-details h4') as HTMLElement;
    if (riskDetailsTitle) {
        riskDetailsTitle.textContent = `Risco de Demência: ${patientData.riskLevel}`;
    }

    const riskDetailsDescription = document.querySelector('.risk-details p') as HTMLElement;
    if (riskDetailsDescription) {
        riskDetailsDescription.textContent = patientData.riskDescription;
    }

    // Preencher recomendações
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

function setElementText(elementId: string, text: string): void {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

function initChart(): void {
    const ctx = (document.getElementById('progressChart') as HTMLCanvasElement)?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 30
                    }
                }
            }
        });
    }
}

function setupMenu(): void {
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
        link.addEventListener('click', function(this: HTMLLIElement) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function setupModal(): void {
    const modal = document.getElementById('editPatientModal');
    if (!modal) return;

    // Adicionar botão de editar no header do paciente
    const patientHeader = document.querySelector('.patient-header');
    if (patientHeader) {
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-outline open-modal';
        editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
        patientHeader.appendChild(editButton);
    }

    // Abrir modal
    document.querySelectorAll('.open-modal').forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.add('active');
        });
    });

    // Fechar modal
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Submissão do formulário
    const form = document.getElementById('editPatientForm') as HTMLFormElement;
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Lógica para salvar os dados
            alert('Dados salvos com sucesso!');
            modal.classList.remove('active');
        });
    }
}
N