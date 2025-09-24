import React, { type JSX } from 'react'
import ThemeToggle from '../components/theme/ThemeToggle'
import { SocialLinks } from '../components/shared/SocialLinks'
import ProductGrid from '../components/products/ProductGrid'
import { Product } from '../components/products/types'
import { STORE_CONFIG } from '../config/store'
import { Button } from '../components/ui/button'

/**
 * pages/Home.tsx
 * Halaman utama Golden Store: hero, sosial & Shopee, grid produk dengan detail dan WhatsApp.
 */

export default function Home(): JSX.Element {
  // Sample produk — ganti sesuai kebutuhan. Gambar menggunakan smart placeholder.
  const products: Product[] = [
    {
      id: 'ring-aurora',
      name: 'Cincin Aurora',
      price: 1250000,
      image: 'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/9fda7656-751a-44f7-925d-2983608efbf8.jpg',
      description:
        'Cincin statement dengan kilau kristal yang memantulkan warna aurora. Nyaman dipakai harian maupun acara formal.',
      tags: ['Statement Ring', 'Elegant', 'Best Seller'],
    },
    {
      id: 'necklace-luna',
      name: 'Kalung Luna',
      price: 2150000,
      image: 'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/81d784c1-2e19-4129-a069-8279a9f905c1.jpg',
      description:
        'Kalung minimalis dengan liontin bulan yang manis, cocok jadi hadiah maupun koleksi pribadi.',
      tags: ['Kalung', 'Minimalist'],
    },
    {
      id: 'bracelet-royale',
      name: 'Gelang Royale',
      price: 1890000,
      image: 'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/122ce33f-63d0-4e9a-b566-29b761fbd66c.jpg',
      description:
        'Gelang kombinasi metal dan aksen matte-glossy untuk tampilan modern dan berkelas.',
      tags: ['Gelang', 'Modern'],
    },
    {
      id: 'earring-eden',
      name: 'Anting Eden',
      price: 990000,
      image: 'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/2347c9aa-119b-4363-8fd5-6ef36c28e237.jpg',
      description:
        'Anting mungil yang ringan dengan kilau lembut, nyaman dipakai seharian.',
      tags: ['Anting', 'Daily'],
    },
    {
      id: 'watch-nova',
      name: 'Jam Nova',
      price: 3750000,
      image: 'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/5bfd3a13-263a-45d5-aad4-c718dfccae52.jpg',
      description:
        'Jam tangan aksesoris dengan strap metal berkilau, menunjang gaya sekaligus fungsional.',
      tags: ['Jam Tangan', 'Limited'],
    },
    {
      id: 'pendant-sol',
      name: 'Liontin Sol',
      price: 1450000,
      image: 'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/14bf167b-74c5-4435-84f5-d31defc7b554.jpg',
      description:
        'Liontin berbentuk matahari dengan detail kristal, simbol energi dan kebahagiaan.',
      tags: ['Liontin', 'Symbolic'],
    },
  ]

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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-amber-200/50 bg-white/75 backdrop-blur-md dark:border-amber-300/20 dark:bg-neutral-950/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-amber-400/70">
              <img
                src="https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/55a4522f-969b-4e9f-b5a4-8f67ffc837e4.jpg"
                alt="Golden Store Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-lg font-bold uppercase tracking-wide text-transparent dark:from-amber-300 dark:to-yellow-200">
              {STORE_CONFIG.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SocialLinks
              instagram={STORE_CONFIG.social.instagram}
              facebook={STORE_CONFIG.social.facebook}
              tiktok={STORE_CONFIG.social.tiktok}
              shopee={STORE_CONFIG.social.shopee}
              whatsapp={STORE_CONFIG.social.whatsapp}
              className="hidden sm:flex"
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-amber-200/50 bg-gradient-to-b from-amber-50 via-white to-white py-10 dark:border-amber-300/20 dark:from-amber-950/30 dark:via-neutral-950 dark:to-neutral-950">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                <span className="bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-300 dark:to-yellow-200">
                  Koleksi Aksesoris dengan Desain Sticker yang menarik
                </span>{' '}
                untuk Gaya Sehari-hari
              </h1>
              <p className="max-w-prose text-neutral-600 dark:text-neutral-300">
                Temukan aksesoris pilihan dari {STORE_CONFIG.name}. Desain menarik, kualitas terjamin, dan
                harga bersahabat, cocok untuk hadiah maupun koleksi pribadi.
              </p>
              <div className="flex items-center gap-3">
                <SocialLinks
                  instagram={STORE_CONFIG.social.instagram}
                  facebook={STORE_CONFIG.social.facebook}
                  tiktok={STORE_CONFIG.social.tiktok}
                  shopee={STORE_CONFIG.social.shopee}
                  whatsapp={STORE_CONFIG.social.whatsapp}
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-amber-300/30 to-yellow-200/20 blur-xl dark:from-amber-500/20 dark:to-yellow-300/10" />
              <div className="overflow-hidden rounded-3xl border border-amber-200/70 shadow-lg dark:border-amber-300/20">
                <img
                  src="https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/45ef6d9f-1355-4e0f-a1fe-2ee9eeb7bf3c.jpg"
                  alt="Golden Store Showcase"
                  className="h-64 w-full object-cover sm:h-80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produk */}
      <main className="flex-1 py-10">
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
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <p className="rounded-lg border border-dashed border-amber-300/60 bg-amber-50/50 p-6 text-center text-sm text-amber-700 dark:border-amber-300/30 dark:bg-amber-900/10 dark:text-amber-200">
              Belum ada produk dengan tag &quot;{selectedTag}&quot; untuk saat ini.
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/50 py-8 dark:border-amber-300/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} {STORE_CONFIG.name}. All rights reserved.
          </p>
          <SocialLinks
            instagram={STORE_CONFIG.social.instagram}
            facebook={STORE_CONFIG.social.facebook}
            tiktok={STORE_CONFIG.social.tiktok}
            shopee={STORE_CONFIG.social.shopee}
            whatsapp={STORE_CONFIG.social.whatsapp}
          />
        </div>
      </footer>
    </div>
  )
}
