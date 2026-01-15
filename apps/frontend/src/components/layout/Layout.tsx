import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { useSidebar } from '@/contexts/SidebarContext'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isOpen, isMobile, closeSidebar } = useSidebar()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />

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
        }`}
      >
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
