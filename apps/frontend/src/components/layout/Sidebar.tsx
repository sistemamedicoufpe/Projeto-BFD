import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/pacientes', label: 'Pacientes', icon: '👥' },
  { path: '/avaliacoes', label: 'Avaliações', icon: '📋' },
  { path: '/relatorios', label: 'Relatórios', icon: '📄' },
  { path: '/configuracoes', label: 'Configurações', icon: '⚙️' },
  { path: '/ajuda', label: 'Ajuda', icon: '❓' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-lg text-gray-900">NeuroDiag</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          <span className="text-xl">{collapsed ? '→' : '←'}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-3 px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <span className="text-2xl">{item.icon}</span>
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.nome}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sair"
            >
              <span className="text-xl">🚪</span>
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair"
          >
            <span className="text-2xl">🚪</span>
          </button>
        )}
      </div>
    </aside>
  )
}
