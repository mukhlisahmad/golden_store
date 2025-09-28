declare global {
  interface Window {
    __APP_API_BASE_URL__?: string
    VITE_API_BASE_URL?: string
  }
}

function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const fromWindow = window.__APP_API_BASE_URL__ || window.VITE_API_BASE_URL
    if (fromWindow && fromWindow.length > 0) {
      return fromWindow
    }
  }

  return 'http://localhost:4000'
}

export const API_BASE_URL = resolveApiBaseUrl()
