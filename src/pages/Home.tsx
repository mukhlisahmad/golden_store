import React, { type JSX } from 'react'
import ThemeToggle from '../components/theme/ThemeToggle'
import { SocialLinks } from '../components/shared/SocialLinks'
import ProductGrid from '../components/products/ProductGrid'
import { Product } from '../components/products/types'
import { DEFAULT_STORE_CONFIG } from '../config/store'
import { Button } from '../components/ui/button'
import { fetchProducts as fetchProductsApi } from '../services/api'
import { useStoreSettings } from '../contexts/StoreSettingsContext'

const DEFAULT_LOGO_URL =
  'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/55a4522f-969b-4e9f-b5a4-8f67ffc837e4.jpg'
const DEFAULT_HERO_IMAGE_URL = 'https://i.imghippo.com/files/Cwuh6142fk.jpeg'

/**
 * pages/Home.tsx
 * Halaman utama Golden Store: hero, sosial & Shopee, grid produk dengan detail dan WhatsApp.
 */

export default function Home(): JSX.Element {
  const { settings: storeSettings } = useStoreSettings()
  const storeName = storeSettings.storeName ?? DEFAULT_STORE_CONFIG.name
  const logoUrl = storeSettings.logoUrl ?? DEFAULT_LOGO_URL
  const heroHeadline = storeSettings.heroHeadline ?? 'Koleksi Aksesoris dengan Desain Sticker yang menarik'
  const heroTagline = storeSettings.heroTagline ?? 'untuk Gaya Sehari-hari'
  const heroDescription = storeSettings.heroDescription ??
    `Temukan aksesoris pilihan dari ${storeName}. Desain menarik, kualitas terjamin, dan harga bersahabat, cocok untuk hadiah maupun koleksi pribadi.`
  const heroImage = storeSettings.heroImage ?? DEFAULT_HERO_IMAGE_URL
  const navigationItems = storeSettings.navigation ?? []
  const socialLinks = {
    instagram: storeSettings.instagram ?? DEFAULT_STORE_CONFIG.social.instagram,
    facebook: storeSettings.facebook ?? DEFAULT_STORE_CONFIG.social.facebook,
    tiktok: storeSettings.tiktok ?? DEFAULT_STORE_CONFIG.social.tiktok,
    shopee: storeSettings.shopee ?? DEFAULT_STORE_CONFIG.social.shopee,
    whatsapp: storeSettings.whatsappNumber
      ? `https://wa.me/${storeSettings.whatsappNumber}`
      : DEFAULT_STORE_CONFIG.social.whatsapp,
  }

  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchProducts = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchProductsApi()
      const normalized = data.map((item) => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
      }))

      setProducts(normalized)
    } catch (err) {
      console.error('Gagal memuat produk:', err)
      setError('Gagal memuat data produk. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  const tagOptions = React.useMemo(() => {
    const uniqueTags = new Set<string>()
    products.forEach((product) => {
      product.tags?.forEach((tag) => uniqueTags.add(tag))
    })
    return Array.from(uniqueTags)
  }, [products])

  const [selectedTag, setSelectedTag] = React.useState<string | null>(null)

  const filteredProducts = React.useMemo(() => {
    if (!selectedTag) {
      return products
    }

    return products.filter((product) => product.tags?.includes(selectedTag))
  }, [products, selectedTag])

  const handleRetry = React.useCallback(() => {
    void fetchProducts()
  }, [fetchProducts])

  return (
    <div id="home" className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-amber-200/50 bg-white/75 backdrop-blur-md dark:border-amber-300/20 dark:bg-neutral-950/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-amber-400/70">
                <img
                  src={logoUrl}
                  alt={`${storeName} Logo`}
                  className="h-full w-full object-cover"
                />
                {/* ini adalah logo */}
              </div>
              <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-lg font-bold uppercase tracking-wide text-transparent dark:from-amber-300 dark:to-yellow-200">
                {storeName}
              </span>
            </div>
            {navigationItems.length > 0 && (
              <nav className="hidden items-center gap-4 text-sm font-medium text-neutral-700 dark:text-neutral-200 sm:flex">
                {navigationItems.map((item) => {
                  const key = `desktop-${item.id ?? item.label}`
                  return (
                    <a
                      key={key}
                      href={item.url}
                      target={item.isExternal ? '_blank' : undefined}
                      rel={item.isExternal ? 'noreferrer' : undefined}
                      className="rounded-md px-2 py-1 transition hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                    >
                      {item.label}
                    </a>
                  )
                })}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3">
            <SocialLinks
              instagram={socialLinks.instagram}
              facebook={socialLinks.facebook}
              tiktok={socialLinks.tiktok}
              shopee={socialLinks.shopee}
              whatsapp={socialLinks.whatsapp}
              className="hidden sm:flex"
            />
            <ThemeToggle />
          </div>
        </div>
        {navigationItems.length > 0 && (
          <div className="mx-auto block max-w-6xl px-4 pb-3 sm:hidden">
            <nav className="flex gap-4 overflow-x-auto text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {navigationItems.map((item) => {
                const key = `mobile-${item.id ?? item.label}`
                return (
                  <a
                    key={key}
                    href={item.url}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noreferrer' : undefined}
                    className="rounded-md px-2 py-1 transition hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                  >
                    {item.label}
                  </a>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="border-b border-amber-200/50 bg-gradient-to-b from-amber-50 via-white to-white py-10 dark:border-amber-300/20 dark:from-amber-950/30 dark:via-neutral-950 dark:to-neutral-950">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                <span className="bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-300 dark:to-yellow-200">
                  {heroHeadline}
                </span>{' '}
                {heroTagline}
              </h1>
              <p className="max-w-prose text-neutral-600 dark:text-neutral-300">
                {heroDescription}
              </p>
              <div className="flex items-center gap-3">
                <SocialLinks
                  instagram={socialLinks.instagram}
                  facebook={socialLinks.facebook}
                  tiktok={socialLinks.tiktok}
                  shopee={socialLinks.shopee}
                  whatsapp={socialLinks.whatsapp}
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-amber-300/30 to-yellow-200/20 blur-xl dark:from-amber-500/20 dark:to-yellow-300/10" />
              <div className="overflow-hidden rounded-3xl border border-amber-200/70 shadow-lg dark:border-amber-300/20">
                <img
                  src={heroImage}
                  alt={`${storeName} Showcase`}
                  className="h-64 w-full object-cover sm:h-80"
                />
                {/* ini adalah gambar utama */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produk */}
      <main id="produk" className="flex-1 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-300 dark:to-yellow-200">
                    Produk Pilihan
                  </span>
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Klik &quot;Detail&quot; untuk melihat deskripsi, atau langsung &quot;WhatsApp&quot; untuk tanya stok.
                </p>
              </div>
            </div>

            {tagOptions.length > 0 && (
              <nav className="-mx-1 overflow-x-auto">
                <div className="flex items-center gap-2 px-1">
                  <Button
                    variant={selectedTag === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag(null)}
                    className="whitespace-nowrap bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-neutral-900 dark:hover:bg-amber-400"
                  >
                    Semua
                  </Button>
                  {tagOptions.map((tag) => {
                    const isActive = selectedTag === tag
                    return (
                      <Button
                        key={tag}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTag(tag)}
                        className={
                          isActive
                            ? 'whitespace-nowrap bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-neutral-900 dark:hover:bg-amber-400'
                            : 'whitespace-nowrap border-amber-200 text-amber-700 hover:border-amber-300 hover:text-amber-800 dark:border-amber-300/40 dark:text-amber-200 dark:hover:border-amber-200'
                        }
                      >
                        {tag}
                      </Button>
                    )
                  })}
                </div>
              </nav>
            )}
          </div>
          {loading ? (
            <p className="rounded-lg border border-amber-200/60 bg-white/70 p-6 text-center text-sm text-neutral-600 dark:border-amber-300/30 dark:bg-neutral-900/40 dark:text-neutral-200">
              Memuat produk...
            </p>
          ) : error ? (
            <div className="space-y-4 rounded-lg border border-red-200/60 bg-red-50/60 p-6 text-center text-sm text-red-700 dark:border-red-400/30 dark:bg-red-900/10 dark:text-red-200">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-300/40 dark:text-amber-200 dark:hover:bg-amber-900/20"
              >
                Coba lagi
              </Button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <p className="rounded-lg border border-dashed border-amber-300/60 bg-amber-50/50 p-6 text-center text-sm text-amber-700 dark:border-amber-300/30 dark:bg-amber-900/10 dark:text-amber-200">
              Belum ada produk
              {selectedTag ? ` dengan tag "${selectedTag}"` : ''} untuk ditampilkan saat ini.
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/50 py-8 dark:border-amber-300/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <SocialLinks
            instagram={socialLinks.instagram}
            facebook={socialLinks.facebook}
            tiktok={socialLinks.tiktok}
            shopee={socialLinks.shopee}
            whatsapp={socialLinks.whatsapp}
          />
        </div>
      </footer>
    </div>
  )
}
