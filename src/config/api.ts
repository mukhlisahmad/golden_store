declare global {
  interface Window {
    __APP_API_BASE_URL__?: string
    VITE_API_BASE_URL?: string
  }
}

const runtimeEnvApiBaseUrl =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined) ??
  (typeof process !== 'undefined' ? process.env.VITE_API_BASE_URL : undefined) ??
  ''

const envApiBaseUrl = process.env.NODE_ENV === 'development' ? '' : runtimeEnvApiBaseUrl

function normalizeBaseUrl(value: string | undefined): string {
  if (!value) {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  return trimmed.replace(/\/+$/, '')
}

const DEFAULT_API_BASE_URL = normalizeBaseUrl(envApiBaseUrl)

function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const fromWindow = window.__APP_API_BASE_URL__ || window.VITE_API_BASE_URL
    const normalizedWindow = normalizeBaseUrl(fromWindow)
    if (normalizedWindow) {
      return normalizedWindow
    }

    try {
      return window.location.origin
    } catch {
      return ''
    }
  }

  return DEFAULT_API_BASE_URL
}

export const API_BASE_URL = resolveApiBaseUrl()

export function buildApiUrl(path: string): string {
  const base = API_BASE_URL
  if (!base) {
    return path
  }

  try {
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    return new URL(path, normalizedBase).toString()
  } catch (error) {
    console.warn('Failed to construct API URL, falling back to string concat:', error)
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${normalizedBase}${normalizedPath}`
  }
}
