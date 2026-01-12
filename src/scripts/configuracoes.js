// configuracoes.js - Script para gerenciar as configurações do aplicativo

// ========================
// GERENCIADOR DE PERFIL
// ========================

const ProfileManager = {
    // Carregar dados do perfil do usuário
    load() {
        return localStorage.getItem('neurodiag_user_data') 
            ? JSON.parse(localStorage.getItem('neurodiag_user_data'))
            : this.getDefault();
    },

    // Obter perfil padrão
    getDefault() {
        return {
            nome: 'Dr. Silva',
            email: 'dr.silva@exemplo.com',
            crm: '12345-SP',
            telefone: '(11) 98765-4321',
            especialidade: 'Neurologia',
            instituicao: 'Hospital das Clínicas'
        };
    },

    // Salvar perfil do usuário
    save(profileData) {
        localStorage.setItem('neurodiag_user_data', JSON.stringify(profileData));
        return true;
    },

    // Atualizar campo específico
    update(field, value) {
        const profile = this.load();
        profile[field] = value;
        return this.save(profile);
    }
};

// ========================
// GERENCIADOR DE SEGURANÇA
// ========================

const SecurityManager = {
    // Verificar senha atual
    verifyCurrentPassword(password) {
        const storedPassword = localStorage.getItem('neurodiag_password');
        if (!storedPassword) return false;
        
        // Simulação - em produção usar hash
        return password === storedPassword;
    },

    // Mudar senha
    changePassword(currentPassword, newPassword, confirmPassword) {
        if (!this.verifyCurrentPassword(currentPassword)) {
            return { success: false, error: 'Senha atual incorreta' };
        }

        if (newPassword !== confirmPassword) {
            return { success: false, error: 'As senhas não coincidem' };
        }

        if (newPassword.length < 8) {
            return { success: false, error: 'A senha deve ter pelo menos 8 caracteres' };
        }

        localStorage.setItem('neurodiag_password', newPassword);
        return { success: true };
    },

    // Ativar/desativar 2FA
    toggle2FA(enabled) {
        localStorage.setItem('neurodiag_2fa_enabled', enabled ? 'true' : 'false');
        return { success: true };
    },

    // Verificar se 2FA está ativo
    is2FAEnabled() {
        return localStorage.getItem('neurodiag_2fa_enabled') === 'true';
    }
};

// ========================
// GERENCIADOR DE NOTIFICAÇÕES
// ========================

const NotificationManager = {
    // Configurações padrão
    defaultSettings: {
        emailNotifications: true,
        pushNotifications: true,
        newPatients: true,
        completedEvaluations: true,
        aiResults: true
    },

    // Carregar configurações
    load() {
        const saved = localStorage.getItem('neurodiag_notifications');
        return saved ? JSON.parse(saved) : this.defaultSettings;
    },

    // Salvar configurações
    save(settings) {
        localStorage.setItem('neurodiag_notifications', JSON.stringify(settings));
        return true;
    },

    // Atualizar configuração específica
    update(setting, value) {
        const settings = this.load();
        settings[setting] = value;
        return this.save(settings);
    },

    // Solicitar permissão de notificação do navegador
    requestPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                return Promise.resolve(true);
            }
            if (Notification.permission !== 'denied') {
                return Notification.requestPermission().then(permission => permission === 'granted');
            }
        }
        return Promise.resolve(false);
    },

    // Enviar notificação
    send(title, options = {}) {
        if (this.load().pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                icon: '../img/logo.png',
                ...options
            });
        }
    }
};

// ========================
// GERENCIADOR DE APARÊNCIA
// ========================

const AppearanceManager = {
    // Configurações padrão
    defaultSettings: {
        theme: 'light',
        fontSize: 'medium',
        highContrast: false,
        reduceAnimations: false
    },

    // Carregar configurações
    load() {
        const saved = localStorage.getItem('neurodiag_appearance');
        return saved ? JSON.parse(saved) : this.defaultSettings;
    },

    // Salvar configurações
    save(settings) {
        localStorage.setItem('neurodiag_appearance', JSON.stringify(settings));
        this.apply(settings);
        return true;
    },

    // Aplicar tema
    applyTheme(theme) {
        const root = document.documentElement;
        
        switch(theme) {
            case 'dark':
                root.style.setProperty('--bg-primary', '#1a1a1a');
                root.style.setProperty('--text-primary', '#ffffff');
                break;
            case 'auto':
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.applyTheme(prefersDark ? 'dark' : 'light');
                break;
            default: // light
                root.style.setProperty('--bg-primary', '#ffffff');
                root.style.setProperty('--text-primary', '#333333');
        }
    },

    // Aplicar tamanho de fonte
    applyFontSize(size) {
        const root = document.documentElement;
        
        switch(size) {
            case 'small':
                root.style.fontSize = '14px';
                break;
            case 'large':
                root.style.fontSize = '18px';
                break;
            default: // medium
                root.style.fontSize = '16px';
        }
    },

    // Aplicar alto contraste
    applyHighContrast(enabled) {
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    },

    // Aplicar redução de animações
    applyReduceAnimations(enabled) {
        if (enabled) {
            document.body.classList.add('reduce-animations');
        } else {
            document.body.classList.remove('reduce-animations');
        }
    },

    // Aplicar todas as configurações
    apply(settings) {
        this.applyTheme(settings.theme);
        this.applyFontSize(settings.fontSize);
        this.applyHighContrast(settings.highContrast);
        this.applyReduceAnimations(settings.reduceAnimations);
    }
};

// ========================
// GERENCIADOR DE IA
// ========================

const AISettingsManager = {
    // Configurações padrão
    defaultSettings: {
        active: true,
        autoInterpretation: true,
        diagnosisSuggestions: true,
        confidence: 70,
        model: 'ensemble',
        weights: {
            cognitive: 40,
            imaging: 35,
            eeg: 25
        }
    },

    // Carregar configurações
    load() {
        const saved = localStorage.getItem('neurodiag_ai_settings');
        return saved ? JSON.parse(saved) : this.defaultSettings;
    },

    // Salvar configurações
    save(settings) {
        localStorage.setItem('neurodiag_ai_settings', JSON.stringify(settings));
        return true;
    },

    // Validar pesos (devem somar 100%)
    validateWeights(weights) {
        const total = weights.cognitive + weights.imaging + weights.eeg;
        return total === 100;
    },

    // Normalizar pesos para somar 100%
    normalizeWeights(weights) {
        const total = weights.cognitive + weights.imaging + weights.eeg;
        if (total === 0) return weights;
        
        return {
            cognitive: Math.round((weights.cognitive / total) * 100),
            imaging: Math.round((weights.imaging / total) * 100),
            eeg: Math.round((weights.eeg / total) * 100)
        };
    },

    // Atualizar pesos
    updateWeights(weights) {
        const normalized = this.normalizeWeights(weights);
        const settings = this.load();
        settings.weights = normalized;
        return this.save(settings);
    }
};

// ========================
// GERENCIADOR DE PRIVACIDADE
// ========================

const PrivacyManager = {
    // Configurações padrão
    defaultSettings: {
        shareForResearch: false,
        autoAnonymize: true
    },

    // Carregar configurações
    load() {
        const saved = localStorage.getItem('neurodiag_privacy');
        return saved ? JSON.parse(saved) : this.defaultSettings;
    },

    // Salvar configurações
    save(settings) {
        localStorage.setItem('neurodiag_privacy', JSON.stringify(settings));
        return true;
    },

    // Anonimizar dados de paciente
    anonymizePatient(patient) {
        return {
            ...patient,
            nome: 'Paciente Anonimizado',
            cpf: 'XXX.XXX.XXX-XX',
            contato: '(XX) XXXXX-XXXX'
        };
    },

    // Exportar dados anonimizados
    exportAnonymized() {
        const patients = PatientsManager.getAll().map(p => this.anonymizePatient(p));
        const evaluations = EvaluationsManager.getAll();
        const reports = ReportsManager.getAll();

        return {
            patients,
            evaluations,
            reports,
            exportDate: new Date().toISOString()
        };
    }
};

// ========================
// INICIALIZAÇÃO
// ========================

// Aplicar configurações de aparência ao carregar
document.addEventListener('DOMContentLoaded', function() {
    const appearance = AppearanceManager.load();
    AppearanceManager.apply(appearance);
});

// Exportar managers globalmente
window.ProfileManager = ProfileManager;
window.SecurityManager = SecurityManager;
window.NotificationManager = NotificationManager;
window.AppearanceManager = AppearanceManager;
window.AISettingsManager = AISettingsManager;
window.PrivacyManager = PrivacyManager;
