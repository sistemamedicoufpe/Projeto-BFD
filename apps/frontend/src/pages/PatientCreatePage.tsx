import { Layout } from '@/components/layout';
import { PatientForm } from '@/components/patients';

export function PatientCreatePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Paciente</h1>
          <p className="text-gray-600 mt-2">Cadastre um novo paciente no sistema</p>
        </div>

        <PatientForm />
      </div>
    </Layout>
  );
}
