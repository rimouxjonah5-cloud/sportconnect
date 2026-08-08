import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { Shell } from './components/Shell'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { Plan } from './pages/Plan'
import { Messages } from './pages/Messages'
import { Calendrier } from './pages/Calendrier'
import { Avis } from './pages/Avis'
import { Profil } from './pages/Profil'
import { Boutique } from './pages/Boutique'
import { PageNotFound } from './pages/PageNotFound'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/bienvenue"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Shell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/calendrier" element={<Calendrier />} />
        <Route path="/avis" element={<Avis />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/boutique" element={<Boutique />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default App
