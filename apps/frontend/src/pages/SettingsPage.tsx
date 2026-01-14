import { useState, useEffect, useRef } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardContent, Button, Input, Toggle, Select } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'

const PROFILE_IMAGE_KEY = 'neurocare_profile_image'

export function SettingsPage() {
  const { user } = useAuth()
  const {
    settings,
    updateGeral,
    updateSeguranca,
    updatePrivacidade,
    updateIA,
    resetSettings,
    isOnline,
    isSyncing,
    triggerSync,
  } = useSettings()

  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    crm: '',
    especialidade: '',
    telefone: '',
  })

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Carregar imagem do perfil do localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem(PROFILE_IMAGE_KEY)
    if (savedImage) {
      setProfileImage(savedImage)
    }
  }, [])

  // Salvar imagem no localStorage
  const saveProfileImage = (imageData: string | null) => {
    if (imageData) {
      localStorage.setItem(PROFILE_IMAGE_KEY, imageData)
    } else {
      localStorage.removeItem(PROFILE_IMAGE_KEY)
    }
    setProfileImage(imageData)
    // Disparar evento customizado para atualizar o Sidebar imediatamente
    window.dispatchEvent(new Event('profileImageUpdated'))
  }

  // Handler para upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }

    setImageLoading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Redimensionar imagem para no máximo 300x300
        const canvas = document.createElement('canvas')
        const maxSize = 300
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        const resizedImage = canvas.toDataURL('image/jpeg', 0.8)
        saveProfileImage(resizedImage)
        setImageLoading(false)
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      alert('Erro ao ler a imagem.')
      setImageLoading(false)
    }
    reader.readAsDataURL(file)
  }

  // Remover imagem de perfil
  const handleRemoveImage = () => {
    if (confirm('Tem certeza que deseja remover a foto de perfil?')) {
      saveProfileImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Carregar dados do perfil do usuário
  useEffect(() => {
    if (user) {
      setProfileData({
        nome: user.nome || '',
        email: user.email || '',
        crm: user.crm || '',
        especialidade: user.especialidade || '',
        telefone: user.telefone || '',
      })
    }
  }, [user])

  // Exportar dados
  const handleExportData = async () => {
    try {
      const data = {
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `neurocare-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
    }
  }

  // Limpar cache
  const handleClearCache = async () => {
    if (!confirm('Tem certeza que deseja limpar o cache? Isso não afetará seus dados salvos.')) {
      return
    }

    try {
      // Limpar caches do service worker
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }

      alert('Cache limpo com sucesso!')
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
      alert('Erro ao limpar cache.')
    }
  }

  // Sincronizar dados
  const handleSync = async () => {
    await triggerSync()
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie as configurações do sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isOnline
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil do Usuário */}
          <Card>
            <CardHeader
              title="Perfil do Usuário"
              subtitle="Informações da sua conta"
            />
            <CardContent>
              <div className="space-y-4">
                {/* Foto de Perfil */}
                <div className="flex flex-col items-center pb-4 border-b dark:border-gray-700">
                  <div className="relative group">
                    <div className={`w-28 h-28 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 ${imageLoading ? 'animate-pulse' : ''}`}>
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Overlay para alterar foto */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      disabled={imageLoading}
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageLoading}
                    >
                      {imageLoading ? 'Carregando...' : profileImage ? 'Alterar foto' : 'Adicionar foto'}
                    </Button>
                    {profileImage && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={imageLoading}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    JPG, PNG ou GIF. Máximo 5MB.
                  </p>
                </div>

                <Input
                  label="Nome completo"
                  value={profileData.nome}
                  onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Seu nome completo"
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={profileData.email}
                  disabled
                  helperText="O e-mail não pode ser alterado"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="CRM"
                    value={profileData.crm}
                    onChange={(e) => setProfileData(prev => ({ ...prev, crm: e.target.value }))}
                    placeholder="000000-UF"
                  />
                  <Input
                    label="Telefone"
                    value={profileData.telefone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <Input
                  label="Especialidade"
                  value={profileData.especialidade}
                  onChange={(e) => setProfileData(prev => ({ ...prev, especialidade: e.target.value }))}
                  placeholder="Ex: Neurologia"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações Gerais */}
          <Card>
            <CardHeader
              title="Configurações Gerais"
              subtitle="Aparência e preferências do sistema"
            />
            <CardContent>
              <div className="space-y-5">
                <Select
                  label="Tema"
                  value={settings.geral.tema}
                  onChange={(value) => updateGeral('tema', value as 'light' | 'dark' | 'auto')}
                  options={[
                    { value: 'light', label: 'Claro' },
                    { value: 'dark', label: 'Escuro' },
                    { value: 'auto', label: 'Automático (sistema)' },
                  ]}
                />

                <Select
                  label="Idioma"
                  value={settings.geral.idioma}
                  onChange={(value) => updateGeral('idioma', value as 'pt-BR' | 'en-US')}
                  options={[
                    { value: 'pt-BR', label: 'Português (Brasil)' },
                    { value: 'en-US', label: 'English (US)' },
                  ]}
                />

                <div className="pt-2">
                  <Toggle
                    label="Notificações"
                    description="Receber notificações do sistema"
                    checked={settings.geral.notificacoes}
                    onChange={(checked) => updateGeral('notificacoes', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader
              title="Segurança"
              subtitle="Configurações de segurança da conta"
            />
            <CardContent>
              <div className="space-y-5">
                <Toggle
                  label="Autenticação de dois fatores"
                  description="Adiciona uma camada extra de segurança"
                  checked={settings.seguranca.autenticacaoDuploFator}
                  onChange={(checked) => updateSeguranca('autenticacaoDuploFator', checked)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tempo de sessão (minutos)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={settings.seguranca.tempoSessao}
                    onChange={(e) => updateSeguranca('tempoSessao', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>5 min</span>
                    <span className="font-medium text-primary-600">{settings.seguranca.tempoSessao} min</span>
                    <span>120 min</span>
                  </div>
                </div>

                <Toggle
                  label="Backup automático"
                  description="Realiza backup automático dos dados"
                  checked={settings.seguranca.backupAutomatico}
                  onChange={(checked) => updateSeguranca('backupAutomatico', checked)}
                />

                {settings.seguranca.backupAutomatico && (
                  <Select
                    label="Frequência do backup"
                    value={settings.seguranca.frequenciaBackup}
                    onChange={(value) => updateSeguranca('frequenciaBackup', value as 'diario' | 'semanal' | 'mensal')}
                    options={[
                      { value: 'diario', label: 'Diário' },
                      { value: 'semanal', label: 'Semanal' },
                      { value: 'mensal', label: 'Mensal' },
                    ]}
                  />
                )}

                <div className="pt-3 border-t dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert('Funcionalidade em desenvolvimento')}
                  >
                    Alterar senha
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacidade */}
          <Card>
            <CardHeader
              title="Privacidade"
              subtitle="Controle de dados e consentimento (LGPD)"
            />
            <CardContent>
              <div className="space-y-5">
                <Toggle
                  label="Anonimizar dados em relatórios"
                  description="Remove informações identificáveis em exportações"
                  checked={settings.privacidade.anonimizarDados}
                  onChange={(checked) => updatePrivacidade('anonimizarDados', checked)}
                />

                <Toggle
                  label="Consentimento para coleta de dados"
                  description="Permite coleta de dados para melhorias"
                  checked={settings.privacidade.consentimentoColeta}
                  onChange={(checked) => updatePrivacidade('consentimentoColeta', checked)}
                />

                <Toggle
                  label="Compartilhar dados anônimos"
                  description="Contribui para pesquisas científicas"
                  checked={settings.privacidade.compartilharAnonimos}
                  onChange={(checked) => updatePrivacidade('compartilharAnonimos', checked)}
                />

                <div className="pt-3 border-t dark:border-gray-700 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Conforme a LGPD, você tem direito de acessar, corrigir ou excluir seus dados.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportData}
                    >
                      Exportar meus dados
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (confirm('ATENÇÃO: Esta ação é irreversível. Deseja realmente solicitar a exclusão de todos os seus dados?')) {
                          alert('Solicitação enviada. Você receberá um e-mail de confirmação.')
                        }
                      }}
                    >
                      Solicitar exclusão
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inteligência Artificial */}
          <Card>
            <CardHeader
              title="Inteligência Artificial"
              subtitle="Configurações do assistente de diagnóstico"
            />
            <CardContent>
              <div className="space-y-5">
                <Toggle
                  label="Habilitar assistente de IA"
                  description="Usa IA para auxiliar no diagnóstico"
                  checked={settings.ia.habilitado}
                  onChange={(checked) => updateIA('habilitado', checked)}
                />

                {settings.ia.habilitado && (
                  <>
                    <Select
                      label="Modelo de IA"
                      value={settings.ia.modelo}
                      onChange={(value) => updateIA('modelo', value)}
                      options={[
                        { value: 'local', label: 'Modelo Local (TensorFlow.js - Offline)' },
                        { value: 'gpt-4', label: 'GPT-4 (Mais preciso - Requer internet)' },
                        { value: 'gpt-3.5', label: 'GPT-3.5 (Mais rápido - Requer internet)' },
                      ]}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confiança mínima para sugestões
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="95"
                        step="5"
                        value={settings.ia.confiancaMinima}
                        onChange={(e) => updateIA('confiancaMinima', Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>50%</span>
                        <span className="font-medium text-primary-600">{settings.ia.confiancaMinima}%</span>
                        <span>95%</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Sugestões abaixo deste valor não serão exibidas
                      </p>
                    </div>

                    {settings.ia.modelo === 'local' && (
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Modelo Local:</strong> Utiliza TensorFlow.js para análise offline.
                          O modelo é executado diretamente no navegador, garantindo privacidade total dos dados.
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Nota:</strong> O assistente de IA é uma ferramenta de apoio e não substitui
                    a avaliação clínica do profissional de saúde.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados e Armazenamento */}
          <Card>
            <CardHeader
              title="Dados e Armazenamento"
              subtitle="Gerenciamento de dados locais"
            />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Cache do aplicativo</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Limpar dados temporários</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCache}
                  >
                    Limpar cache
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sincronização</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isOnline ? 'Forçar sincronização com servidor' : 'Sem conexão com internet'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSync}
                    disabled={!isOnline || isSyncing}
                    loading={isSyncing}
                  >
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Restaurar configurações</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Volta para configurações padrão</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm('Restaurar todas as configurações para os valores padrão?')) {
                        resetSettings()
                        alert('Configurações restauradas!')
                      }
                    }}
                  >
                    Restaurar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader title="Sobre o Sistema" />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Versão</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">2.0.0</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Ambiente</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{import.meta.env.MODE}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Banco de dados</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{import.meta.env.VITE_DATABASE_PROVIDER || 'indexeddb'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <p className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
