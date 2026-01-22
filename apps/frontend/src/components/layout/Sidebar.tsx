import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { Logo } from '../ui/Logo'

const PROFILE_IMAGE_KEY = 'neurocare_profile_image'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/pacientes', label: 'Pacientes', icon: '👥' },
  { path: '/avaliacoes', label: 'Avaliações', icon: '📋' },
  { path: '/exames', label: 'Exames', icon: '🔬' },
  { path: '/relatorios', label: 'Relatórios', icon: '📄' },
  { path: '/configuracoes', label: 'Configurações', icon: '⚙️' },
  { path: '/ajuda', label: 'Ajuda', icon: '❓' },
]

export function Sidebar() {
  const { isOpen, isMobile, toggleSidebar, closeSidebar } = useSidebar()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    // Função para carregar foto de perfil do localStorage
    const loadProfileImage = () => {
      const savedImage = localStorage.getItem(PROFILE_IMAGE_KEY)
      setProfileImage(savedImage)
    }

    // Carregar inicialmente
    loadProfileImage()

    // Escutar mudanças no localStorage (para atualizar quando a foto for alterada em outra aba)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PROFILE_IMAGE_KEY) {
        setProfileImage(e.newValue)
      }
    }

    // Recarregar quando a janela receber foco (para atualizar após mudanças na mesma aba)
    const handleFocus = () => loadProfileImage()

    // Escutar evento customizado para atualização imediata na mesma aba
    const handleProfileUpdate = () => loadProfileImage()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('profileImageUpdated', handleProfileUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('profileImageUpdated', handleProfileUpdate)
    }
  }, [])

  // Fecha sidebar ao clicar em um link (somente em mobile)
  const handleNavClick = () => {
    if (isMobile) {
      closeSidebar()
    }
  }

  // Determina a largura do sidebar
  // Mobile: esconde completamente quando fechado
  // Desktop: alterna entre w-64 (aberto) e w-16 (colapsado)
  const sidebarClasses = isMobile
    ? `fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 w-64 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : `fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-16'
      }`

  return (
    <aside className={sidebarClasses}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-700">
        <div className={`flex items-center gap-2 ${!isOpen && !isMobile ? 'justify-center w-full' : ''}`}>
          <Logo size="sm" src="neurocare-logo.png" />
            {(isOpen || isMobile) && (
              <span className="font-bold text-lg text-[#3B7D8C] dark:text-[#3B7D8C] whitespace-nowrap">Neurocare</span>
            )}
        </div>
        {(isOpen || isMobile) && (
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0"
            aria-label={isOpen ? 'Recolher menu' : 'Expandir menu'}
            aria-expanded={isOpen}
            tabIndex={0}
          >
            <span className="text-xl" aria-hidden="true">
              {isMobile ? '✕' : '←'}
            </span>
          </button>
        )}
      </div>

      {/* Botão para expandir quando colapsado (desktop) */}
      {!isOpen && !isMobile && (
        <button
          onClick={toggleSidebar}
          className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 flex justify-center"
          aria-label="Expandir menu"
        >
          <span className="text-xl" aria-hidden="true">→</span>
        </button>
      )}

      {/* Navigation */}
      <nav className="py-4" role="navigation" aria-label="Menu principal">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={handleNavClick}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center ${isOpen || isMobile ? 'gap-3 px-4' : 'justify-center px-2'} py-3 min-h-[44px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-r-4 border-primary-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`
            }
            title={!isOpen && !isMobile ? item.label : undefined}
            aria-label={item.label}
          >
            <span className="text-2xl flex-shrink-0" role="img" aria-hidden="true">
              {item.icon}
            </span>
            {(isOpen || isMobile) && (
              <span className="font-medium whitespace-nowrap">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-700">
        {isOpen || isMobile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Foto de perfil"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  aria-label={`Inicial do usuário ${user?.nome}`}
                >
                  {user?.nome.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.nome}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 min-w-[44px] min-h-[44px] text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 flex-shrink-0"
              aria-label="Sair do sistema"
              tabIndex={0}
            >
              <span className="text-xl" role="img" aria-label="Porta">
                🚪
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Foto de perfil"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold"
                aria-label={`Inicial do usuário ${user?.nome}`}
              >
                {user?.nome.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Sair do sistema"
              title="Sair"
              tabIndex={0}
            >
              <span className="text-xl" role="img" aria-label="Porta">
                🚪
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
