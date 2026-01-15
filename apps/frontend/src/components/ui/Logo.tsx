interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  return (
    <div
      className={`inline-flex items-center justify-center bg-primary-600 dark:bg-primary-500 rounded-full ${sizeClasses[size]} ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/4 h-3/4"
      >
        {/* Cérebro estilizado */}
        <path
          d="M32 8C24 8 18 14 18 22C18 24 18.5 26 19.5 28C17 29 15 31.5 15 34.5C15 37 16.5 39 18.5 40C18 41.5 18 43 18 44.5C18 50 22 54 28 54H36C42 54 46 50 46 44.5C46 43 46 41.5 45.5 40C47.5 39 49 37 49 34.5C49 31.5 47 29 44.5 28C45.5 26 46 24 46 22C46 14 40 8 32 8Z"
          fill="white"
          fillOpacity="0.95"
        />
        {/* Detalhes do cérebro */}
        <path
          d="M28 18C26 20 25 23 25 26M36 18C38 20 39 23 39 26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary-600 dark:text-primary-500"
        />
        <path
          d="M24 32C24 34 25 36 26.5 37M40 32C40 34 39 36 37.5 37"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary-600 dark:text-primary-500"
        />
        {/* Linha central */}
        <path
          d="M32 22V46"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 3"
          className="text-primary-500 dark:text-primary-400"
        />
      </svg>
    </div>
  )
}
