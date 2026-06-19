import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/common/AppShell.jsx'
import ErrorState from './components/common/ErrorState.jsx'
import LoadingState from './components/common/LoadingState.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import { useAuth } from './hooks/useAuth.js'
import DashboardPage from './pages/DashboardPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

function App() {
  const { bootError, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingState title="Checking session" message="Loading your SkillSwap auth state." />
  }

  if (bootError) {
    return (
      <ErrorState
        title="Unable to load authentication"
        message={bootError.message}
      />
    )
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="dashboard"
          element={(
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}

export default App
