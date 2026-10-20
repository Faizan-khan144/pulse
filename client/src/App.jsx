import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './store/auth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Workspace from './pages/Workspace'

function Protected({ children }) {
  const { user, ready } = useAuth()
  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">Loading workspace...</div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/app/*"
        element={
          <Protected>
            <Workspace />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
