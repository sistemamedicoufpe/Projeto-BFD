import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { useSidebar } from '@/contexts/SidebarContext'
import { Logo } from '../ui/Logo'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isOpen, isMobile, toggleSidebar, closeSidebar } = useSidebar()

  // Ativa atalhos de teclado
  useKeyboardShortcuts()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />

      {/* Header fixo com botão de menu para mobile */}
      <header
        className={`fixed top-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20 transition-all duration-300 flex items-center px-4 ${
          isOpen && !isMobile ? 'left-64' : 'left-0'
        } md:hidden`}
      >
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Abrir menu"
          aria-expanded={isOpen}
        >
          <svg
            className="w-6 h-6 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="flex items-center gap-2 ml-4">
          <Logo size="sm" />
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">NeuroDiag</span>
        </div>
      </header>

      {/* Overlay para mobile quando sidebar está aberto */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
          aria-label="Fechar menu"
        />
      )}

      {/* Main content com margem adaptativa */}
      <main
        className={`transition-all duration-300 ${
          isOpen && !isMobile ? 'ml-64' : 'ml-0'
        } ${isMobile ? 'pt-16' : ''}`}
      >
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
