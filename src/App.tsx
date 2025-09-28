import { HashRouter, Route, Routes, Navigate } from 'react-router'
import HomePage from './pages/Home'
import AdminLogin from './pages/admin/AdminLogin'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminStoreSettings from './pages/admin/AdminStoreSettings'
import AdminProfile from './pages/admin/AdminProfile'
import { ThemeProvider } from 'next-themes'
import React, { type JSX } from 'react'
import { StoreSettingsProvider } from './contexts/StoreSettingsContext'

/**
 * App.tsx
 * Entry untuk routing utama aplikasi dan penyedia tema (dark/light).
 * Menggunakan next-themes agar Tailwind dapat mengenali class 'dark'.
 */

export default function App(): JSX.Element {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="golden-store-theme"
    >
      <div className="min-h-screen bg-white text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
        <StoreSettingsProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/new" element={<AdminProductForm />} />
              <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
              <Route path="/admin/store-settings" element={<AdminStoreSettings />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </StoreSettingsProvider>
      </div>
    </ThemeProvider>
  )
}
