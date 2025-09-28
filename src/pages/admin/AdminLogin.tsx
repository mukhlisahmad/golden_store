import React from 'react'
import { useNavigate, Navigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { login as loginRequest, ApiError } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function AdminLogin(): JSX.Element {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const hydrate = useAuthStore((state) => state.hydrate)
  const setCredentials = useAuthStore((state) => state.login)

  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!isHydrated) {
      hydrate()
    }
  }, [hydrate, isHydrated])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await loginRequest({ username, password })
      setCredentials(response)
      navigate('/admin/products', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (isHydrated && token) {
    return <Navigate to="/admin/products" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-10 dark:bg-neutral-950">
      <Card className="w-full max-w-sm border-amber-200/60 shadow-lg dark:border-amber-300/20">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-amber-700 dark:text-amber-300">
            Admin Golden Store
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600 dark:from-amber-500 dark:to-yellow-400"
              disabled={loading}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

