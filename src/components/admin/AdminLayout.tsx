import React, { type JSX } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { Button } from '../ui/button'
import { useAuthStore } from '../../store/authStore'

interface AdminLayoutProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

const NAV_ITEMS = [
  { to: '/admin/products', label: 'Produk' },
  { to: '/admin/store-settings', label: 'Pengaturan Toko' },
  { to: '/admin/profile', label: 'Profil Admin' },
]

export function AdminLayout({ title, description, actions, children }: AdminLayoutProps): JSX.Element {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = React.useCallback(() => {
    logout()
    navigate('/admin/login', { replace: true })
  }, [logout, navigate])

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-lg border border-amber-200/60 bg-white px-6 py-5 shadow-sm dark:border-amber-300/20 dark:bg-neutral-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-amber-700 dark:text-amber-300">{title}</h1>
              {description && <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <Button variant="outline" onClick={handleLogout}>
                Keluar
              </Button>
            </div>
          </div>
          <nav className="mt-4 flex flex-wrap gap-3 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-md px-3 py-1 transition',
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm dark:bg-amber-500 dark:text-neutral-900'
                      : 'hover:text-amber-700 dark:hover:text-amber-200',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </div>
  )
}

export default AdminLayout
