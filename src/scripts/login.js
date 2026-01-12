// login.js - Script para página de login

// Verificar se já está autenticado
const isAuthenticated = localStorage.getItem('neurodiag_authenticated');
if (isAuthenticated === 'true') {
    window.location.href = '../../index.html';
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Simulação de login
    const btn = this.querySelector('.login-btn');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    btn.disabled = true;

    setTimeout(() => {
        // Marcar como autenticado
        localStorage.setItem('neurodiag_authenticated', 'true');
        localStorage.setItem('neurodiag_login_time', new Date().toISOString());

        // Redirecionar para o dashboard
        window.location.href = '../../index.html';
    }, 1500);
});
