// registro.js - Script para página de registro

// Verificar se já está autenticado
const isAuthenticated = localStorage.getItem('neurodiag_authenticated');
if (isAuthenticated === 'true') {
    window.location.href = '../../index.html';
}

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Validar senhas
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }

    // Validar termos
    const terms = document.getElementById('terms').checked;
    if (!terms) {
        alert('Você precisa aceitar os termos de uso para continuar.');
        return;
    }

    // Simulação de registro
    const btn = this.querySelector('.register-btn');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
    btn.disabled = true;

    setTimeout(() => {
        // Salvar dados do usuário
        const userData = {
            nome: this.querySelector('input[placeholder="Nome"]').value + ' ' +
                  this.querySelector('input[placeholder="Sobrenome"]').value,
            email: this.querySelector('input[type="email"]').value,
            crm: this.querySelector('input[placeholder="CRM"]').value,
            especialidade: this.querySelector('select').value,
            instituicao: this.querySelector('input[placeholder="Instituição"]').value,
            dataCadastro: new Date().toISOString()
        };

        // Salvar no localStorage
        localStorage.setItem('neurodiag_user_data', JSON.stringify(userData));

        // Marcar como autenticado
        localStorage.setItem('neurodiag_authenticated', 'true');
        localStorage.setItem('neurodiag_login_time', new Date().toISOString());

        // Redirecionar para o dashboard
        alert('Conta criada com sucesso! Bem-vindo ao NeuroDiagnóstico.');
        window.location.href = '../../index.html';
    }, 2000);
});

// Validação em tempo real das senhas
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;

    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#e74c3c';
    } else {
        this.style.borderColor = '#e0e0e0';
    }
});
