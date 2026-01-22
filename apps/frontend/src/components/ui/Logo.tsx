interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  src?: string
}

export function Logo({ className = '', size = 'md', src }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-42 h-40',
  }
  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {/* Use caminho resiliente para respeitar base path (Vite/Build). Se `src` for passado, usa-o. */}
      <img
        src={(function resolve() {
          // fallback para arquivo em `public/`
          const target = (src ?? 'logo-neurocare.png')
          // URL absoluta (http/https) -> usar direto
          if (/^https?:\/\//.test(target)) return target
          // Usa BASE_URL para resolver assets públicos corretamente (Vite/Build)
          const base = typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL
          const cleaned = target.replace(/^\/+/, '')
          if (base) {
            // garante barra entre base e arquivo
            return `${base.replace(/\/$/, '')}/${cleaned}`
          }
          // fallback para resolver relativo ao módulo
          return new URL(cleaned, import.meta.url).href
        })()}
        alt="Neurocare"
        loading="lazy"
        className="w-full h-full object-contain"
      />
    </div>
  )

}
