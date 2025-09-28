import './globals.css'
import type { Metadata } from 'next'
import type { ReactElement, ReactNode } from 'react'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Golden Store',
  description: 'Golden Store — katalog produk dan dashboard admin.',
}

function ApiBaseBootScript(): ReactElement | null {
  if (process.env.NODE_ENV === 'development') {
    return null
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? '').trim()
  if (!apiBase) {
    return null
  }

  const scriptContent = `
    window.__APP_API_BASE_URL__ = ${JSON.stringify(apiBase)};
    window.VITE_API_BASE_URL = ${JSON.stringify(apiBase)};
  `

  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: scriptContent }} />
}

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ApiBaseBootScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
