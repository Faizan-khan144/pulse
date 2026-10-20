import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      setReady(true)
      return
    }
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (user) connectSocket()
    else disconnectSocket()
  }, [user])

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(email, password) {
        const data = await api('/auth/login', { method: 'POST', body: { email, password } })
        setToken(data.token)
        setUser(data.user)
        return data.user
      },
      async signup(name, email, password) {
        const data = await api('/auth/signup', { method: 'POST', body: { name, email, password } })
        setToken(data.token)
        setUser(data.user)
        return data.user
      },
      logout() {
        setToken(null)
        disconnectSocket()
        setUser(null)
      },
      setUser,
    }),
    [user, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
