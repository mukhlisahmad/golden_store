'use client'

import { ThemeProvider } from 'next-themes'
import type { ReactElement, ReactNode } from 'react'
import { StoreSettingsProvider } from '@/contexts/StoreSettingsContext'

export function Providers({ children }: { children: ReactNode }): ReactElement {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="golden-store-theme"
    >
      <StoreSettingsProvider>{children}</StoreSettingsProvider>
    </ThemeProvider>
  )
}
