import { Layout } from '@/components/layout'
import { Card, CardHeader, CardContent } from '@/components/ui'

export function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-2">Gerencie as configurações do sistema</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Configurações Gerais" />
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">⚙️</p>
                <p>Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Segurança" />
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">🔒</p>
                <p>Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Privacidade" />
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">🛡️</p>
                <p>Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Inteligência Artificial" />
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">🤖</p>
                <p>Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
