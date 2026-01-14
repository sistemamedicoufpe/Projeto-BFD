// common.js - Funções compartilhadas entre todas as páginas

// ========================
// UTILITÁRIOS DE NAVEGAÇÃO
// ========================

// Determinar se estamos em uma página dentro de src/pages ou na raiz
function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/src/pages/')) {
        return '../..';  // De src/pages para a raiz
    }
    return '';  // Já estamos na raiz
}

function getLoginPath() {
    const basePath = getBasePath();
    return basePath ? `${basePath}/src/pages/login.html` : 'src/pages/login.html';
}

// ========================
// AUTENTICAÇÃO
// ========================

function checkAuthentication() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Não verificar autenticação nas páginas públicas
    if (currentPage === 'login.html' || currentPage === 'registro.html') {
        return;
    }

    // Verificar se o usuário está autenticado
    const isAuthenticated = localStorage.getItem('neurodiag_authenticated');

    if (!isAuthenticated || isAuthenticated !== 'true') {
        // Redirecionar para login
        window.location.href = getLoginPath();
    }
}

// Função para fazer logout
function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        localStorage.removeItem('neurodiag_authenticated');
        localStorage.removeItem('neurodiag_login_time');
        window.location.href = getLoginPath();
    }
}

// ========================
// NAVEGAÇÃO ATIVA
// ========================

function setActiveNavigation() {
    // Obter o nome do arquivo atual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Mapear nomes de arquivo para links
    const pageMap = {
        'index.html': 'index.html',
        'pacientes.html': 'pacientes.html',
        'avaliacoes.html': 'avaliacoes.html',
        'relatorios.html': 'relatorios.html',
        'configuracoes.html': 'configuracoes.html',
        'ajuda.html': 'ajuda.html'
    };

    // Remover classe active de todos os itens
    document.querySelectorAll('.nav-links li').forEach(item => {
        item.classList.remove('active');
    });

    // Adicionar classe active ao item correspondente
    const activePage = pageMap[currentPage] || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === activePage) {
            link.parentElement.classList.add('active');
        }
    });
}

// ========================
// MENU MOBILE
// ========================

function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (!menuToggle || !sidebar) return;

    // Toggle menu
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-hidden');

        // Mudar ícone
        const icon = this.querySelector('i');
        if (sidebar.classList.contains('mobile-hidden')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });

    // Fechar menu ao clicar fora (mobile)
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const isClickInside = sidebar.contains(event.target) || menuToggle.contains(event.target);

            if (!isClickInside && !sidebar.classList.contains('mobile-hidden')) {
                sidebar.classList.add('mobile-hidden');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });

    // Fechar menu ao clicar em um link (mobile)
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                sidebar.classList.add('mobile-hidden');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

// ========================
// INICIALIZAÇÃO GLOBAL
// ========================

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    checkAuthentication();

    // Configurar navegação ativa
    setActiveNavigation();

    // Configurar menu mobile
    setupMobileMenu();
});
