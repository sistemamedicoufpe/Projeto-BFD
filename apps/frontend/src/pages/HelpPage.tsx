import { Layout } from '@/components/layout'
import { Card, CardHeader, CardContent } from '@/components/ui'

export function HelpPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ajuda e Suporte</h1>
          <p className="text-gray-600 mt-2">Central de ajuda e documentação</p>
        </div>

        <Card>
          <CardHeader title="Como podemos ajudar?" />
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📚 Documentação
                </h3>
                <p className="text-gray-600">
                  Acesse a documentação completa do sistema para aprender sobre todas as funcionalidades.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  💬 Suporte Técnico
                </h3>
                <p className="text-gray-600">
                  Entre em contato com nossa equipe de suporte técnico para resolver problemas ou tirar dúvidas.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🎓 Tutoriais em Vídeo
                </h3>
                <p className="text-gray-600">
                  Assista a tutoriais em vídeo para aprender a usar o sistema de forma eficiente.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📧 Contato
                </h3>
                <p className="text-gray-600">
                  Email: suporte@neurodiagnostico.com.br
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
