import './globals.css'
import type { Metadata } from 'next'
import React, { type ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Golden Store',
  description: 'Golden Store — katalog produk dan dashboard admin.',
}

function ApiBaseBootScript(): React.ReactElement | null {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? ''
  if (!apiBase) {
    return null
  }

  const scriptContent = `
    window.__APP_API_BASE_URL__ = ${JSON.stringify(apiBase)};
    window.VITE_API_BASE_URL = ${JSON.stringify(apiBase)};
  `

  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: scriptContent }} />
}

export default function RootLayout({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ApiBaseBootScript />
        {children}
      </body>
    </html>
  )
}
