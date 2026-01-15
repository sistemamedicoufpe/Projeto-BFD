import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Pages
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { PatientsPage } from './pages/PatientsPage'
import { PatientCreatePage } from './pages/PatientCreatePage'
import { PatientEditPage } from './pages/PatientEditPage'
import { PatientDetailPage } from './pages/PatientDetailPage'
import { EvaluationsPage } from './pages/EvaluationsPage'
import { EvaluationCreatePage } from './pages/EvaluationCreatePage'
import { EvaluationDetailPage } from './pages/EvaluationDetailPage'
import { ReportsPage } from './pages/ReportsPage'
import { ReportCreatePage } from './pages/ReportCreatePage'
import { SettingsPage } from './pages/SettingsPage'
import { HelpPage } from './pages/HelpPage'

// Basename para GitHub Pages - usa o base path do Vite
const basename = import.meta.env.BASE_URL || '/'

function App() {
  return (
    <BrowserRouter basename={basename}>
      <SettingsProvider>
        <AuthProvider>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pacientes"
            element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pacientes/novo"
            element={
              <ProtectedRoute>
                <PatientCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pacientes/:id/editar"
            element={
              <ProtectedRoute>
                <PatientEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pacientes/:id"
            element={
              <ProtectedRoute>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/avaliacoes"
            element={
              <ProtectedRoute>
                <EvaluationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/avaliacoes/nova"
            element={
              <ProtectedRoute>
                <EvaluationCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/avaliacoes/:id"
            element={
              <ProtectedRoute>
                <EvaluationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/avaliacoes/:id/editar"
            element={
              <ProtectedRoute>
                <EvaluationCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorios/novo"
            element={
              <ProtectedRoute>
                <ReportCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ajuda"
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}

export default App
