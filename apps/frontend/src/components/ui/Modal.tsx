import { useEffect, useRef } from 'react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Focus trap: Tab navigation dentro do modal
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    if (isOpen) {
      // Salva elemento focado anteriormente
      previousActiveElement.current = document.activeElement as HTMLElement

      // Foca no modal ao abrir
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }, 0)

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTab)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
      document.body.style.overflow = 'unset'

      // Restaura foco ao fechar
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`w-full ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-lg shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            aria-label={`Fechar ${title}`}
            type="button"
          >
            <span className="text-xl" aria-hidden="true">
              ×
            </span>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
  }

  const variantIcons = {
    danger: '⚠️',
    warning: '⚡',
    info: 'ℹ️',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{variantIcons[variant]}</span>
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${variantStyles[variant]}`}
          >
            {loading ? 'Aguarde...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  variant?: 'success' | 'error' | 'warning' | 'info'
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
}: AlertModalProps) {
  const variantIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{variantIcons[variant]}</span>
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>OK</Button>
        </div>
      </div>
    </Modal>
  )
}
