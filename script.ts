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
Note que no TypeScript, adicionamos tipagem para os dados e funções. Também usamos type assertions para os elementos DOM.

Para usar o TypeScript, você precisará compilar o arquivo .ts para .js. Você pode fazer isso com o comando:
tsc script.ts

Certifique-se de ter o TypeScript instalado globalmente (npm install -g typescript) ou configurado no seu projeto.

Além disso, note que no HTML, você deve referenciar o arquivo JavaScript compilado, não o .ts.

Vamos também adicionar os IDs para os elementos da grid de informações no HTML. Modifique a grid no HTML para:

html
<div class="info-grid">
    <div class="info-item">
        <div class="info-label">Data de Nascimento</div>
        <div class="info-value" id="infoBirthDate">15/08/1951</div>
    </div>
    <div class="info-item">
        <div class="info-label">Gênero</div>
        <div class="info-value" id="infoGender">Feminino</div>
    </div>
    <div class="info-item">
        <div class="info-label">Contato</div>
        <div class="info-value" id="infoContact">(11) 98765-4321</div>
    </div>
    <div class="info-item">
        <div class="info-label">Responsável</div>
        <div class="info-value" id="infoResponsible">João Oliveira (filho)</div>
    </div>
    <div class="info-item">
        <div class="info-label">Histórico Familiar</div>
        <div class="info-value" id="infoFamilyHistory">Mãe com DA</div>
    </div>
    <div class="info-item">
        <div class="info-label">Comorbidades</div>
        <div class="info-value" id="infoComorbidities">Hipertensão, Diabetes</div>
    </div>
</div>
E substitua a div do gráfico por:

html
<div class="chart-container">
    <canvas id="progressChart"></canvas>
</div>
E adicione o modal no final do body, dentro do container.

Com essas alterações, o sistema deve ter interatividade básica.

Vamos também adicionar um botão para fechar o modal no canto superior direito, que já está no HTML do modal.

Este é um exemplo básico. Em uma aplicação real, você teria uma API para buscar os dados do paciente e salvar as alterações.

Aqui está o código JavaScript e TypeScript para implementar a funcionalidade do sistema NeuroDiagnóstico:

JavaScript (app.js)
javascript
// Dados simulados do sistema
const mockData = {
    pacientes: [
        {
            id: 1,
            nome: "Maria Oliveira",
            idade: 72,
            codigo: "#P-00482",
            ultimaConsulta: "15/03/2023",
            dataNascimento: "15/08/1951",
            genero: "Feminino",
            contato: "(11) 98765-4321",
            responsavel: "João Oliveira (filho)",
            historicoFamiliar: "Mãe com DA",
            comorbidades: "Hipertensão, Diabetes",
            testes: [
                { nome: "Mini-Mental (MMSE)", status: "concluido", pontuacao: "24/30" },
                { nome: "MoCA", status: "concluido", pontuacao: "18/30" },
                { nome: "CDR", status: "concluido", pontuacao: "1.0" },
                { nome: "Teste do Relógio", status: "pendente", pontuacao: "-" }
            ],
            risco: "Moderado",
            descricaoRisco: "Paciente apresenta declínio cognitivo significativo com pontuações abaixo do esperado para idade e escolaridade.",
            recomendacoes: [
                "Realizar exames de neuroimagem (RM ou TC de crânio)",
                "Avaliação com geriatra para manejo de comorbidades",
                "Iniciar acompanhamento com terapia ocupacional",
                "Reavaliar em 6 meses com bateria completa de testes",
                "Orientar família sobre segurança e adaptações no ambiente doméstico"
            ]
        }
    ],
    estatisticas: {
        pacientesAtivos: 42,
        testesRealizados: 128,
        diagnosticos: 24
    }
};

// Estado da aplicação
let state = {
    pacienteSelecionado: mockData.pacientes[0],
    grafico: null
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

function inicializarApp() {
    configurarNavegacao();
    carregarDadosDashboard();
    configurarEventos();
    inicializarGrafico();
}

// Configuração da navegação
function configurarNavegacao() {
    const linksNavegacao = document.querySelectorAll('.nav-links li');
    
    linksNavegacao.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove a classe active de todos os links
            linksNavegacao.forEach(l => l.classList.remove('active'));
            
            // Adiciona a classe active ao link clicado
            this.classList.add('active');
            
            // Aqui você pode adicionar lógica para carregar diferentes páginas/seções
            const textoLink = this.querySelector('a').textContent.trim();
            console.log(`Navegando para: ${textoLink}`);
        });
    });
}

// Carregar dados do dashboard
function carregarDadosDashboard() {
    // Atualizar cards de estatísticas
    document.querySelector('.card:nth-child(1) .card-value').textContent = 
        mockData.estatisticas.pacientesAtivos;
    document.querySelector('.card:nth-child(2) .card-value').textContent = 
        mockData.estatisticas.testesRealizados;
    document.querySelector('.card:nth-child(3) .card-value').textContent = 
        mockData.estatisticas.diagnosticos;

    // Carregar dados do paciente
    carregarDadosPaciente(state.pacienteSelecionado);
}

function carregarDadosPaciente(paciente) {
    // Informações básicas
    document.querySelector('.patient-details h3').textContent = 
        `${paciente.nome}, ${paciente.idade} anos`;
    document.querySelector('.patient-details p').innerHTML = 
        `ID: ${paciente.codigo} | Última consulta: ${paciente.ultimaConsulta}`;

    // Grid de informações
    const infoItems = document.querySelectorAll('.info-item');
    const dados = [
        paciente.dataNascimento,
        paciente.genero,
        paciente.contato,
        paciente.responsavel,
        paciente.historicoFamiliar,
        paciente.comorbidades
    ];

    infoItems.forEach((item, index) => {
        item.querySelector('.info-value').textContent = dados[index];
    });

    // Testes cognitivos
    carregarTestesCognitivos(paciente.testes);

    // Avaliação de risco
    carregarAvaliacaoRisco(paciente);
}

function carregarTestesCognitivos(testes) {
    const gridTestes = document.querySelector('.tests-grid');
    gridTestes.innerHTML = '';

    testes.forEach(test => {
        const cardTeste = document.createElement('div');
        cardTeste.className = 'test-card';
        cardTeste.innerHTML = `
            <div class="test-name">${test.nome}</div>
            <div class="test-status status-${test.status}">${formatarStatus(test.status)}</div>
            <div class="test-score">${test.pontuacao}</div>
        `;
        
        // Adicionar evento de clique para ver detalhes do teste
        cardTeste.addEventListener('click', () => {
            abrirModalTeste(test);
        });
        
        gridTestes.appendChild(cardTeste);
    });
}

function carregarAvaliacaoRisco(paciente) {
    const indicadorRisco = document.querySelector('.risk-indicator');
    indicadorRisco.textContent = paciente.risco;
    indicadorRisco.className = `risk-indicator risk-${paciente.risco.toLowerCase()}`;

    document.querySelector('.risk-details h4').textContent = 
        `Risco de Demência: ${paciente.risco}`;
    document.querySelector('.risk-details p').textContent = 
        paciente.descricaoRisco;

    // Recomendações
    const listaRecomendacoes = document.querySelector('.recommendations ul');
    listaRecomendacoes.innerHTML = '';
    
    paciente.recomendacoes.forEach(recomendacao => {
        const item = document.createElement('li');
        item.textContent = recomendacao;
        listaRecomendacoes.appendChild(item);
    });
}

function formatarStatus(status) {
    const statusMap = {
        'concluido': 'Concluído',
        'pendente': 'Pendente'
    };
    return statusMap[status] || status;
}

// Configuração de eventos
function configurarEventos() {
    // Botões de ação
    document.querySelector('.btn-primary').addEventListener('click', gerarRelatorio);
    document.querySelector('.btn-outline').addEventListener('click', agendarRetorno);

    // Cards interativos
    document.querySelectorAll('.test-card').forEach(card => {
        card.style.cursor = 'pointer';
    });
}

// Funções de ação
function gerarRelatorio() {
    // Simular geração de relatório
    mostrarNotificacao('Relatório sendo gerado...', 'info');
    
    setTimeout(() => {
        mostrarNotificacao('Relatório gerado com sucesso!', 'success');
        // Aqui você pode implementar o download do relatório
    }, 2000);
}

function agendarRetorno() {
    mostrarNotificacao('Redirecionando para agendamento...', 'info');
    // Aqui você pode implementar a lógica de agendamento
}

// Gráfico
function inicializarGrafico() {
    const ctx = document.createElement('canvas');
    const containerGrafico = document.querySelector('.chart-container');
    containerGrafico.innerHTML = '';
    containerGrafico.appendChild(ctx);

    state.grafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan/2022', 'Mar/2022', 'Jun/2022', 'Set/2022', 'Dez/2022', 'Mar/2023'],
            datasets: [{
                label: 'Pontuação MMSE',
                data: [28, 26, 25, 24, 23, 24],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Pontuação MoCA',
                data: [22, 20, 19, 18, 17, 18],
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Progressão das Avaliações Cognitivas'
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
                }
            }
        }
    });
}

// Modal para detalhes do teste
function abrirModalTeste(test) {
    // Criar modal dinamicamente
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Detalhes do Teste - ${test.nome}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="test-info">
                    <p><strong>Status:</strong> ${formatarStatus(test.status)}</p>
                    <p><strong>Pontuação:</strong> ${test.pontuacao}</p>
                    <p><strong>Data da Última Aplicação:</strong> 15/03/2023</p>
                    <p><strong>Interpretação:</strong> ${obterInterpretacaoTeste(test.nome, test.pontuacao)}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline close-modal">Fechar</button>
                ${test.status === 'pendente' ? '<button class="btn btn-primary aplicar-teste">Aplicar Teste</button>' : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Eventos do modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Evento para aplicar teste
    const btnAplicar = modal.querySelector('.aplicar-teste');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', () => {
            mostrarNotificacao(`Iniciando aplicação do ${test.nome}...`, 'info');
            modal.remove();
        });
    }
}

function obterInterpretacaoTeste(nomeTeste, pontuacao) {
    const interpretacoes = {
        "Mini-Mental (MMSE)": "Comprometimento cognitivo leve",
        "MoCA": "Comprometimento cognitivo moderado",
        "CDR": "Demência leve",
        "Teste do Relógio": "Aguardando aplicação"
    };
    return interpretacoes[nomeTeste] || "Resultado não disponível";
}

// Sistema de notificações
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <i class="fas ${obterIconeNotificacao(tipo)}"></i>
            <span>${mensagem}</span>
        </div>
    `;
    
    // Estilos da notificação
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        border-left: 4px solid ${obterCorNotificacao(tipo)};
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

function obterIconeNotificacao(tipo) {
    const icones = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icones[tipo] || 'fa-info-circle';
}

function obterCorNotificacao(tipo) {
    const cores = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db'
    };
    return cores[tipo] || '#3498db';
}

// Adicionar estilos CSS para animações
const estilosAdicionais = document.createElement('style');
estilosAdicionais.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notificacao-success { border-left-color: #27ae60 !important; }
    .notificacao-error { border-left-color: #e74c3c !important; }
    .notificacao-warning { border-left-color: #f39c12 !important; }
    .notificacao-info { border-left-color: #3498db !important; }
    
    .notificacao-conteudo {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notificacao-conteudo i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(estilosAdicionais);