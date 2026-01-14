import { Layout } from '@/components/layout'
import { ReportForm } from '@/components/reports'

export function ReportCreatePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Relatório</h1>
          <p className="text-gray-600 mt-2">Crie um novo relatório clínico</p>
        </div>

        <ReportForm />
      </div>
    </Layout>
  )
}
