// pacientes.js - Script para página de pacientes

// Carregar pacientes do localStorage
function loadPatients() {
    const patients = PatientsManager.getAll();
    const tbody = document.getElementById('patientsTableBody');
    tbody.innerHTML = '';

    patients.forEach(patient => {
        const iniciais = patient.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        const statusBadge = {
            'Em Avaliação': 'badge-warning',
            'Concluído': 'badge-success',
            'Agendado': 'badge-info',
            'Pendente': 'badge-danger'
        }[patient.status] || 'badge-info';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>
                <div class="patient-cell">
                    <div class="patient-avatar-small">${iniciais}</div>
                    <div>
                        <strong>${patient.nome}</strong>
                        <small>CPF: ${patient.cpf}</small>
                    </div>
                </div>
            </td>
            <td>${patient.idade} anos</td>
            <td>${patient.ultimaConsulta}</td>
            <td><span class="badge ${statusBadge}">${patient.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" title="Ver Detalhes" onclick="viewPatient('${patient.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Editar" onclick="editPatient('${patient.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Histórico" onclick="viewHistory('${patient.id}')">
                        <i class="fas fa-history"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Busca de pacientes
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value;
    if (searchTerm.length >= 2) {
        const results = PatientsManager.search(searchTerm);
        renderSearchResults(results);
    } else {
        loadPatients();
    }
});

function renderSearchResults(patients) {
    const tbody = document.getElementById('patientsTableBody');
    tbody.innerHTML = '';

    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum paciente encontrado</td></tr>';
        return;
    }

    patients.forEach(patient => {
        const iniciais = patient.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const statusBadge = {
            'Em Avaliação': 'badge-warning',
            'Concluído': 'badge-success',
            'Agendado': 'badge-info',
            'Pendente': 'badge-danger'
        }[patient.status] || 'badge-info';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>
                <div class="patient-cell">
                    <div class="patient-avatar-small">${iniciais}</div>
                    <div>
                        <strong>${patient.nome}</strong>
                        <small>CPF: ${patient.cpf}</small>
                    </div>
                </div>
            </td>
            <td>${patient.idade} anos</td>
            <td>${patient.ultimaConsulta}</td>
            <td><span class="badge ${statusBadge}">${patient.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" title="Ver Detalhes" onclick="viewPatient('${patient.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Editar" onclick="editPatient('${patient.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Histórico" onclick="viewHistory('${patient.id}')">
                        <i class="fas fa-history"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Carregar informações do usuário
function loadUserInfo() {
    const userData = JSON.parse(localStorage.getItem('neurodiag_user_data') || '{}');
    const userName = document.getElementById('userName');

    if (userData.nome) {
        userName.textContent = userData.nome.split(' ')[0];
    }
}

// Funções de ação
function viewPatient(id) {
    const patient = PatientsManager.getById(id);
    if (patient) {
        alert(`Paciente: ${patient.nome}\nCPF: ${patient.cpf}\nIdade: ${patient.idade} anos\nStatus: ${patient.status}\n\nVisualização completa em desenvolvimento`);
    }
}

function editPatient(id) {
    const patient = PatientsManager.getById(id);
    if (patient) {
        // Preencher o modal com os dados do paciente
        document.getElementById('patientName').value = patient.nome;
        document.getElementById('patientCPF').value = patient.cpf;
        document.getElementById('patientAge').value = patient.idade;
        document.getElementById('patientStatus').value = patient.status;
        document.getElementById('patientNotes').value = patient.observacoes || '';

        // Marcar que estamos editando
        document.getElementById('addPatientForm').dataset.editingId = id;
        document.querySelector('#addPatientModal .modal-header h3').innerHTML = '<i class="fas fa-edit"></i> Editar Paciente';

        // Abrir modal
        document.getElementById('addPatientModal').style.display = 'flex';
    }
}

function viewHistory(id) {
    const patient = PatientsManager.getById(id);
    if (patient) {
        const evaluations = EvaluationsManager.getAll().filter(e => e.patientId === id);
        const exams = ExamsManager.getAll().filter(e => e.patientId === id);

        alert(`Histórico de ${patient.nome}:\n\n` +
              `Avaliações: ${evaluations.length}\n` +
              `Exames: ${exams.length}\n\n` +
              `Visualização detalhada em desenvolvimento`);
    }
}

// Modal de adicionar paciente
function openAddPatientModal() {
    // Limpar o formulário
    document.getElementById('addPatientForm').reset();
    delete document.getElementById('addPatientForm').dataset.editingId;
    document.querySelector('#addPatientModal .modal-header h3').innerHTML = '<i class="fas fa-user-plus"></i> Novo Paciente';

    // Abrir modal
    document.getElementById('addPatientModal').style.display = 'flex';
}

function closeAddPatientModal() {
    document.getElementById('addPatientModal').style.display = 'none';
}

function saveNewPatient() {
    const form = document.getElementById('addPatientForm');

    if (!form.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    const editingId = form.dataset.editingId;
    const patientData = {
        nome: document.getElementById('patientName').value,
        cpf: document.getElementById('patientCPF').value,
        idade: parseInt(document.getElementById('patientAge').value),
        dataNascimento: document.getElementById('patientBirth').value,
        status: document.getElementById('patientStatus').value,
        observacoes: document.getElementById('patientNotes').value,
        ultimaConsulta: new Date().toLocaleDateString('pt-BR')
    };

    if (editingId) {
        // Atualizar paciente existente
        PatientsManager.update(editingId, patientData);
        alert('Paciente atualizado com sucesso!');
    } else {
        // Adicionar novo paciente
        PatientsManager.add(patientData);
        alert('Paciente cadastrado com sucesso!');
    }

    closeAddPatientModal();
    loadPatients();
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('addPatientModal');
    if (event.target === modal) {
        closeAddPatientModal();
    }
}

// Adicionar evento ao botão
if (document.getElementById('addPatientBtn')) {
    document.getElementById('addPatientBtn').addEventListener('click', openAddPatientModal);
}

// Inicializar
loadUserInfo();
loadPatients();
