import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card } from '@/components/ui'
import { validateForm, getPasswordStrength, formatCRM } from '@/utils/validation'

export function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [crm, setCrm] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const passwordStrength = getPasswordStrength(password)

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateFields = () => {
    const { isValid, errors } = validateForm({
      nome: {
        value: nome,
        rules: [
          { type: 'required', message: 'Nome é obrigatório' },
          { type: 'minLength', length: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
        ],
      },
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
      confirmPassword: {
        value: confirmPassword,
        rules: [
          { type: 'required', message: 'Confirme sua senha' },
          { type: 'custom', validate: (v) => v === password, message: 'As senhas não coincidem' },
        ],
      },
      crm: {
        value: crm,
        rules: crm ? [{ type: 'crm', message: 'CRM inválido (ex: 123456-SP)' }] : [],
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
      await register({ nome, email, password, crm, especialidade })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500'
    if (score === 2) return 'bg-yellow-500'
    if (score === 3) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (score: number) => {
    if (score <= 1) return 'Fraca'
    if (score === 2) return 'Regular'
    if (score === 3) return 'Boa'
    return 'Forte'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600 mt-2">Registre-se no NeuroDiagnóstico</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Nome completo"
            type="text"
            value={nome}
            onChange={(e) => { setNome(e.target.value); clearFieldError('nome') }}
            placeholder="Dr. João Silva"
            error={fieldErrors.nome}
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
            placeholder="seu@email.com"
            error={fieldErrors.email}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CRM"
              type="text"
              value={crm}
              onChange={(e) => { setCrm(formatCRM(e.target.value)); clearFieldError('crm') }}
              placeholder="123456-SP"
              error={fieldErrors.crm}
              maxLength={9}
            />

            <Input
              label="Especialidade"
              type="text"
              value={especialidade}
              onChange={(e) => setEspecialidade(e.target.value)}
              placeholder="Neurologia"
            />
          </div>

          <div>
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
              placeholder="••••••••"
              error={fieldErrors.password}
              required
            />
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{getStrengthText(passwordStrength.score)}</span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {passwordStrength.feedback[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          <Input
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword') }}
            placeholder="••••••••"
            error={fieldErrors.confirmPassword}
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Criar conta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Faça login aqui
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
