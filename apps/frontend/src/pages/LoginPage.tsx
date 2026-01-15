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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Logo className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">NeuroDiagnóstico</h1>
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
          >
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Link to="/registro" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
              Registre-se aqui
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
