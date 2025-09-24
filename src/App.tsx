import { HashRouter, Route, Routes } from 'react-router'
import HomePage from './pages/Home'
import { ThemeProvider } from 'next-themes'
import React, { type JSX } from 'react'

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
        <HashRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </HashRouter>
      </div>
    </ThemeProvider>
  )
}
