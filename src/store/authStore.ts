import { create } from 'zustand'

export interface AuthUser {
  id: string
  username: string
  role: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isHydrated: boolean
  login: (payload: { token: string; user: AuthUser }) => void
  logout: () => void
  hydrate: () => void
}

const STORAGE_KEY = 'golden-store-auth'

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,
  login: ({ token, user }) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
    } catch (error) {
      console.warn('Failed to persist auth token:', error)
    }
    set({ token, user })
  },
  logout: () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear auth token:', error)
    }
    set({ token: null, user: null })
  },
  hydrate: () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { token?: string; user?: AuthUser }
        if (parsed?.token && parsed?.user) {
          set({ token: parsed.token, user: parsed.user, isHydrated: true })
          return
        }
      }
    } catch (error) {
      console.warn('Failed to load auth token:', error)
    }
    set({ token: null, user: null, isHydrated: true })
  },
}))

export function getAuthToken(): string | null {
  return useAuthStore.getState().token
}

export function isAuthenticated(): boolean {
  return Boolean(useAuthStore.getState().token)
}
