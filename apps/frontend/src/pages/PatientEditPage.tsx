import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { PatientForm } from '@/components/patients';

export function PatientEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Paciente</h1>
          <p className="text-gray-600 mt-2">Atualize as informações do paciente</p>
        </div>

        <PatientForm patientId={id} />
      </div>
    </Layout>
  );
}
