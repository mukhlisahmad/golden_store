import { buildApiUrl } from '../config/api'
import { Product } from '../components/products/types'
import { AuthUser, getAuthToken } from '../store/authStore'

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface NavigationItem {
  id?: string
  label: string
  url: string
  order: number
  isExternal: boolean
}

export interface StoreSettings {
  id: string | null
  key?: string
  storeName: string
  logoUrl?: string | null
  heroHeadline: string
  heroTagline: string
  heroDescription: string
  heroImage: string
  whatsappNumber?: string | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  shopee?: string | null
  createdAt?: string
  updatedAt?: string
  navigation: NavigationItem[]
}

export interface UpdateStoreSettingsPayload {
  storeName: string
  logoUrl?: string
  heroHeadline: string
  heroTagline: string
  heroDescription: string
  heroImage: string
  whatsappNumber?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  shopee?: string
  navigation?: Array<{
    id?: string
    label: string
    url: string
    isExternal?: boolean
  }>
}

export interface UpdateAdminProfilePayload {
  username: string
  password?: string
}

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = buildApiUrl(path)
  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = response.statusText || 'Request failed'
    try {
      const data = await response.json()
      if (data?.message) {
        message = data.message
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return await request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchProducts(): Promise<Product[]> {
  return await request<Product[]>('/api/products', {
    method: 'GET',
  })
}

export async function fetchProduct(idOrSlug: string): Promise<Product> {
  return await request<Product>(`/api/products/${idOrSlug}`, {
    method: 'GET',
  })
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  return await request<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  return await request<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteProduct(id: string): Promise<void> {
  await request<void>(`/api/products/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  return await request<StoreSettings>('/api/store/settings', {
    method: 'GET',
  })
}

export async function updateStoreSettings(payload: UpdateStoreSettingsPayload): Promise<StoreSettings> {
  const navigation = payload.navigation
    ? payload.navigation.map((item, index) => ({
        id: item.id,
        label: item.label,
        url: item.url,
        isExternal: Boolean(item.isExternal),
        order: index,
      }))
    : undefined

  return await request<StoreSettings>('/api/store/settings', {
    method: 'PUT',
    body: JSON.stringify({
      ...payload,
      navigation,
    }),
  })
}

export async function fetchAdminProfile(): Promise<AuthUser> {
  return await request<AuthUser>('/api/admin/me', {
    method: 'GET',
  })
}

export async function updateAdminProfile(payload: UpdateAdminProfilePayload): Promise<LoginResponse> {
  return await request<LoginResponse>('/api/admin/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
