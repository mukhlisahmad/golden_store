import React, { type JSX } from 'react'
import {
  fetchStoreSettings,
  StoreSettings,
  NavigationItem,
} from '../services/api'
import { DEFAULT_STORE_CONFIG } from '../config/store'

const FALLBACK_NAVIGATION: NavigationItem[] = [
  { id: 'default-0', label: 'Home', url: '#home', order: 0, isExternal: false },
  { id: 'default-1', label: 'Produk', url: '#produk', order: 1, isExternal: false },
  {
    id: 'default-2',
    label: 'Shopee',
    url: DEFAULT_STORE_CONFIG.social.shopee ?? '#',
    order: 2,
    isExternal: true,
  },
]

const FALLBACK_SETTINGS: StoreSettings = {
  id: null,
  key: 'default',
  storeName: DEFAULT_STORE_CONFIG.name,
  logoUrl:
    'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/55a4522f-969b-4e9f-b5a4-8f67ffc837e4.jpg',
  heroHeadline: 'Koleksi Aksesoris dengan Desain Sticker yang menarik',
  heroTagline: 'untuk Gaya Sehari-hari',
  heroDescription:
    'Temukan aksesoris pilihan dari Golden Store. Desain menarik, kualitas terjamin, dan harga bersahabat, cocok untuk hadiah maupun koleksi pribadi.',
  heroImage: 'https://i.imghippo.com/files/Cwuh6142fk.jpeg',
  whatsappNumber: DEFAULT_STORE_CONFIG.whatsappNumber,
  instagram: DEFAULT_STORE_CONFIG.social.instagram,
  facebook: DEFAULT_STORE_CONFIG.social.facebook,
  tiktok: DEFAULT_STORE_CONFIG.social.tiktok,
  shopee: DEFAULT_STORE_CONFIG.social.shopee,
  createdAt: undefined,
  updatedAt: undefined,
  navigation: FALLBACK_NAVIGATION,
}

interface StoreSettingsContextValue {
  settings: StoreSettings
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const StoreSettingsContext = React.createContext<StoreSettingsContextValue>({
  settings: FALLBACK_SETTINGS,
  loading: true,
  error: null,
  refresh: async () => {},
})

function sortNavigation(items: NavigationItem[] = []): NavigationItem[] {
  return [...items].sort((a, b) => a.order - b.order)
}

export function StoreSettingsProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [settings, setSettings] = React.useState<StoreSettings>(FALLBACK_SETTINGS)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStoreSettings()
      setSettings({
        ...data,
        navigation: sortNavigation(data.navigation ?? []),
      })
    } catch (err) {
      console.error('Failed to load store settings:', err)
      setError('Gagal memuat pengaturan toko.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const value = React.useMemo(
    () => ({
      settings,
      loading,
      error,
      refresh,
    }),
    [settings, loading, error, refresh],
  )

  return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>
}

export function useStoreSettings(): StoreSettingsContextValue {
  return React.useContext(StoreSettingsContext)
}
