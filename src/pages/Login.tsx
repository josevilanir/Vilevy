import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE } from '@/config'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Usa fetch direto (não apiFetch) para evitar loop de redirecionamento em 401
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Credenciais inválidas')
        return
      }
      const data = await res.json()
      login(data.username, data.token)
      navigate('/')
    } catch {
      setError('Erro de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-violet-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-purple-800 text-center mb-6">
          Vilevy's romance album
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-purple-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-purple-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white rounded-lg py-2 font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
