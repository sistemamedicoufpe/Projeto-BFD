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

// Funções de ação
function viewPatient(id) {
    window.location.href = `index.html?patient=${id}`;
}

function editPatient(id) {
    alert(`Editar paciente ${id}\n\nFuncionalidade será implementada em breve`);
}

function viewHistory(id) {
    alert(`Visualizar histórico do paciente ${id}\n\nFuncionalidade será implementada em breve`);
}

// Adicionar paciente
document.getElementById('addPatientBtn').addEventListener('click', function() {
    alert('Funcionalidade de adicionar paciente será implementada em breve');
});

// Carregar pacientes ao iniciar
loadPatients();
