import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface ShortcutHandler {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  handler: () => void
  description: string
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const shortcuts: ShortcutHandler[] = [
      // Ctrl + N: Novo paciente (somente na página de pacientes)
      {
        key: 'n',
        ctrl: true,
        description: 'Novo paciente',
        handler: () => {
          if (location.pathname === '/pacientes') {
            // Dispara evento para abrir modal de novo paciente
            window.dispatchEvent(new CustomEvent('keyboard-shortcut:new-patient'))
          } else if (location.pathname === '/avaliacoes') {
            // Dispara evento para abrir modal de nova avaliação
            window.dispatchEvent(new CustomEvent('keyboard-shortcut:new-evaluation'))
          }
        },
      },
      // Ctrl + S: Salvar formulário (previne o comportamento padrão de salvar página)
      {
        key: 's',
        ctrl: true,
        description: 'Salvar formulário',
        handler: () => {
          // Dispara evento para salvar o formulário ativo
          window.dispatchEvent(new CustomEvent('keyboard-shortcut:save'))
        },
      },
      // Ctrl + P: Gerar PDF/Imprimir
      {
        key: 'p',
        ctrl: true,
        description: 'Gerar PDF',
        handler: () => {
          // Dispara evento para gerar PDF
          window.dispatchEvent(new CustomEvent('keyboard-shortcut:print'))
        },
      },
      // /: Buscar (foca no campo de busca)
      {
        key: '/',
        description: 'Buscar',
        handler: () => {
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="Buscar"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        },
      },
      // Esc: Fechar modal/cancelar
      {
        key: 'Escape',
        description: 'Fechar modal',
        handler: () => {
          // Dispara evento para fechar modais
          window.dispatchEvent(new CustomEvent('keyboard-shortcut:escape'))
        },
      },
      // Ctrl + 1-7: Navegação rápida
      {
        key: '1',
        ctrl: true,
        description: 'Ir para Dashboard',
        handler: () => navigate('/'),
      },
      {
        key: '2',
        ctrl: true,
        description: 'Ir para Pacientes',
        handler: () => navigate('/pacientes'),
      },
      {
        key: '3',
        ctrl: true,
        description: 'Ir para Avaliações',
        handler: () => navigate('/avaliacoes'),
      },
      {
        key: '4',
        ctrl: true,
        description: 'Ir para Exames',
        handler: () => navigate('/exames'),
      },
      {
        key: '5',
        ctrl: true,
        description: 'Ir para Relatórios',
        handler: () => navigate('/relatorios'),
      },
      {
        key: '6',
        ctrl: true,
        description: 'Ir para Configurações',
        handler: () => navigate('/configuracoes'),
      },
      {
        key: '7',
        ctrl: true,
        description: 'Ir para Ajuda',
        handler: () => navigate('/ajuda'),
      },
    ]

    const handleKeyDown = (event: KeyboardEvent) => {
      // Não executar atalhos se estiver em um campo de texto (exceto /)
      const target = event.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (isInputField && event.key !== '/') {
        return
      }

      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = !shortcut.ctrl || (event.ctrlKey || event.metaKey)
        const altMatches = !shortcut.alt || event.altKey
        const shiftMatches = !shortcut.shift || event.shiftKey

        return keyMatches && ctrlMatches && altMatches && shiftMatches
      })

      if (matchingShortcut) {
        event.preventDefault()
        matchingShortcut.handler()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigate, location])
}
