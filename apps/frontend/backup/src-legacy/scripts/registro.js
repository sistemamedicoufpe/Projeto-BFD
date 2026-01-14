// registro.js - Script para página de registro

// Verificar se já está autenticado
const isAuthenticated = localStorage.getItem('neurodiag_authenticated');
if (isAuthenticated === 'true') {
    window.location.href = '../../index.html';
}

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    try {
        // Validar campos
        const nome = this.querySelector('input[placeholder="Nome"]').value.trim();
        const sobrenome = this.querySelector('input[placeholder="Sobrenome"]').value.trim();
        const email = this.querySelector('input[type="email"]').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const crm = this.querySelector('input[placeholder="CRM"]').value.trim();
        const especialidade = this.querySelector('select').value;
        const instituicao = this.querySelector('input[placeholder="Instituição"]').value.trim();
        const terms = document.getElementById('terms').checked;

        // Validações
        if (!nome || !sobrenome) {
            alert('Nome e sobrenome são obrigatórios');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Email inválido');
            return;
        }

        if (password.length < 6) {
            alert('Senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        if (!crm || crm.length < 4) {
            alert('CRM inválido');
            return;
        }

        if (!especialidade || especialidade === '') {
            alert('Selecione uma especialidade');
            return;
        }

        if (!instituicao) {
            alert('Instituição é obrigatória');
            return;
        }

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
                nome: nome + ' ' + sobrenome,
                email: email,
                crm: crm,
                especialidade: especialidade,
                instituicao: instituicao,
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
    } catch (error) {
        console.error('Erro no registro:', error);
        alert('Erro ao processar registro: ' + error.message);
    }
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
