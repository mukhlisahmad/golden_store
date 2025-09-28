import React, { type JSX } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuthStore } from '../../store/authStore'
import { ApiError, fetchAdminProfile, updateAdminProfile } from '../../services/api'

function AdminProfile(): JSX.Element {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const hydrate = useAuthStore((state) => state.hydrate)
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)

  const [username, setUsername] = React.useState(user?.username ?? '')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [initialLoading, setInitialLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isHydrated) {
      hydrate()
    }
  }, [hydrate, isHydrated])

  React.useEffect(() => {
    if (isHydrated && !token) {
      navigate('/admin/login', { replace: true })
    }
  }, [isHydrated, token, navigate])

  React.useEffect(() => {
    const loadProfile = async () => {
      if (!token) return
      setInitialLoading(true)
      try {
        const profile = await fetchAdminProfile()
        setUsername(profile.username)
      } catch (err) {
        console.error('Gagal memuat profil admin:', err)
        if (err instanceof ApiError && err.status === 401) {
          logout()
          navigate('/admin/login', { replace: true })
        }
      } finally {
        setInitialLoading(false)
      }
    }

    if (isHydrated && token) {
      void loadProfile()
    }
  }, [isHydrated, token, logout, navigate])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmedUsername = username.trim()
    if (!trimmedUsername) {
      setError('Username wajib diisi.')
      return
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sesuai.')
      return
    }

    if (password && password.trim().length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    try {
      const response = await updateAdminProfile({
        username: trimmedUsername,
        password: password.trim() ? password.trim() : undefined,
      })

      login(response)
      setUsername(response.user.username)
      setPassword('')
      setConfirmPassword('')
      setSuccess('Data akun berhasil diperbarui.')
    } catch (err) {
      console.error('Gagal memperbarui profil admin:', err)
      if (err instanceof ApiError && err.status === 401) {
        logout()
        navigate('/admin/login', { replace: true })
        return
      }
      const message = err instanceof ApiError && err.message
        ? err.message
        : 'Gagal memperbarui data akun. Silakan coba lagi.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout
      title="Profil Admin"
      description="Perbarui username dan password akun admin untuk keamanan."
    >
      <Card className="max-w-2xl border-amber-200/60 dark:border-amber-300/20">
        <CardHeader>
          <CardTitle>Informasi Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                disabled={initialLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Kosongkan jika tidak ingin mengganti"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || initialLoading} className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

export default AdminProfile
