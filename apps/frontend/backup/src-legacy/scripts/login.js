// login.js - Script para página de login

// Verificar se já está autenticado
const isAuthenticated = localStorage.getItem('neurodiag_authenticated');
if (isAuthenticated === 'true') {
    window.location.href = '../../index.html';
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    try {
        // Validar campos
        const email = this.querySelector('input[type="email"]').value.trim();
        const password = this.querySelector('input[type="password"]').value;

        if (!email || !password) {
            alert('Por favor, preencha email e senha');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Email inválido');
            return;
        }

        if (password.length < 6) {
            alert('Senha deve ter pelo menos 6 caracteres');
            return;
        }

        // Simulação de login
        const btn = this.querySelector('.login-btn');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        btn.disabled = true;

        setTimeout(() => {
            // Marcar como autenticado
            localStorage.setItem('neurodiag_authenticated', 'true');
            localStorage.setItem('neurodiag_login_time', new Date().toISOString());
            localStorage.setItem('neurodiag_user_email', email);

            // Redirecionar para o dashboard
            window.location.href = '../../index.html';
        }, 1500);
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao processar login: ' + error.message);
    }
});
