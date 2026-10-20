import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../store/auth'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/app" replace />

  async function submit(values) {
    setBusy(true)
    setError('')
    try {
      await login(values.email, values.password)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(event) {
    event.preventDefault()
    submit({ email, password })
  }

  function useDemo() {
    setEmail('demo@pulse.app')
    setPassword('demo1234')
    submit({ email: 'demo@pulse.app', password: 'demo1234' })
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--bg)] px-5 py-16">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-[13.5px] text-slate-500 transition hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <div className="rounded-[20px] border border-[var(--line)] bg-[var(--panel)] p-8 shadow-xl shadow-slate-900/5">
          <Logo size={44} />
          <h1 className="mt-6 text-[24px] font-semibold tracking-[-0.02em]">Welcome back</h1>
          <p className="mt-2 text-[14.5px] text-slate-500">Log in to pick up where your channels left off.</p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-[12.5px] font-medium text-slate-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="app-input mt-1.5 w-full px-4 py-3 text-[14.5px] text-slate-800 placeholder:text-[var(--faint)]"
                placeholder="you@company.com"
              />
            </label>
            <label className="block">
              <span className="text-[12.5px] font-medium text-slate-600">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="app-input mt-1.5 w-full px-4 py-3 text-[14.5px] text-slate-800 placeholder:text-[var(--faint)]"
                placeholder="At least 8 characters"
              />
            </label>

            {error ? (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12.5px] text-rose-600">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="app-btn app-btn-primary w-full px-4 py-3.5 text-[14.5px] disabled:opacity-60"
            >
              {busy ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <button
            type="button"
            onClick={useDemo}
            disabled={busy}
            className="mt-2.5 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3.5 text-[14.5px] font-medium text-slate-600 transition hover:border-[var(--line-strong)] hover:text-slate-900 disabled:opacity-60"
          >
            Use the demo account
          </button>

          <p className="mt-6 text-center text-[12.5px] text-slate-500">
            New here?{' '}
            <Link to="/signup" className="font-medium text-teal-700 hover:text-teal-800">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
