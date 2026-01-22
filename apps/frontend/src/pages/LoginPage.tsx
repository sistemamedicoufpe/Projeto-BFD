import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card, Logo } from '@/components/ui'
import { validateForm } from '@/utils/validation'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const validateFields = () => {
    const { isValid, errors } = validateForm({
      email: {
        value: email,
        rules: [
          { type: 'required', message: 'Email é obrigatório' },
          { type: 'email', message: 'Digite um email válido' },
        ],
      },
      password: {
        value: password,
        rules: [
          { type: 'required', message: 'Senha é obrigatória' },
          { type: 'minLength', length: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
        ],
      },
    })

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateFields()) {
      return
    }

    setLoading(true)

    try {
      await login({ email, password })
      navigate('/')
    } catch (err: any) {
      // Extrai mensagem de erro do backend
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Erro ao fazer login. Verifique suas credenciais.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(to bottom, #193B59, #3B7D8C, #5EBFBF)' }}
    >
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Logo className="mb-2" size="xl" />
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sistema de Avaliação Neurológica</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }))
            }}
            placeholder="seu@email.com"
            error={fieldErrors.email}
            required
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }))
            }}
            placeholder="••••••••"
            error={fieldErrors.password}
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
            variant='blue'
          >
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Link
              to="/registro"
              className="text-[#3B7D8C] dark:text-[#3B7D8C] hover:text-[#2f6a73] dark:hover:text-[#2f6a73] font-medium"
            >
              Registre-se aqui
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
