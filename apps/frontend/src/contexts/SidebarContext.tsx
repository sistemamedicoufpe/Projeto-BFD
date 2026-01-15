import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  isOpen: boolean
  isMobile: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  openSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detecta se é mobile e ajusta sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // Em mobile, sidebar começa fechada
      if (mobile && isOpen) {
        setIsOpen(false)
      }
      // Em desktop, sidebar começa aberta
      if (!mobile && !isOpen) {
        setIsOpen(true)
      }
    }

    // Verifica no mount
    checkMobile()

    // Adiciona listener para resize
    window.addEventListener('resize', checkMobile)

    // Suporta prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion')
    }

    return () => window.removeEventListener('resize', checkMobile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSidebar = () => setIsOpen(prev => !prev)
  const closeSidebar = () => setIsOpen(false)
  const openSidebar = () => setIsOpen(true)

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, toggleSidebar, closeSidebar, openSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
