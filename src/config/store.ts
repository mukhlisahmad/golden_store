/**
 * src/config/store.ts
 * Konfigurasi terpusat untuk Golden Store: nama toko, nomor WhatsApp, dan tautan sosial.
 * Sertakan helper untuk membangun tautan WhatsApp dengan pesan yang dipersonalisasi.
 */

export interface SocialLinks {
  instagram?: string
  facebook?: string
  tiktok?: string
  shopee?: string
  whatsapp?: string
}

export interface StoreConfig {
  name: string
  whatsappNumber: string
  social: SocialLinks
}

/**
 * STORE_CONFIG
 * Ganti whatsappNumber & tautan sosial sesuai milik Anda.
 * Nomor WA format internasional tanpa "+" (contoh: 6281234567890).
 */
export const DEFAULT_STORE_CONFIG: StoreConfig = {
  name: 'Golden Store',
  whatsappNumber: '6281234567890', // TODO: ganti ke nomor WhatsApp Anda
  social: {
    instagram: 'https://instagram.com/yourstore',
    facebook: 'https://facebook.com/yourstore',
    tiktok: 'https://tiktok.com/@yourstore',
    shopee: 'https://shopee.co.id/yourstore',
    whatsapp: 'https://wa.me/6281234567890',
  },
}

export const STORE_CONFIG = DEFAULT_STORE_CONFIG

/**
 * buildWaLink
 * Membangun tautan wa.me dengan pesan prefilled berisi detail produk.
 */
export function buildWaLink(params: {
  number?: string
  productName: string
  price?: number
  productUrl?: string
  storeName?: string
}): string {
  const number = (params.number ?? DEFAULT_STORE_CONFIG.whatsappNumber).trim()
  const { productName, price, productUrl, storeName } = params
  const greetingStoreName = storeName?.trim().length ? storeName.trim() : DEFAULT_STORE_CONFIG.name
  const lines = [
    `Halo admin ${greetingStoreName}, saya ingin menanyakan ketersediaan produk:`,
    `- Produk: ${productName}`,
    price ? `- Harga: ${formatIDR(price)}` : undefined,
    productUrl ? `- Link: ${productUrl}` : undefined,
    '',
    'Mohon info stok dan cara pemesanan. Terima kasih!',
  ].filter(Boolean)

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${number}?text=${text}`
}

/**
 * formatIDR
 * Memformat angka menjadi Rupiah (IDR).
 */
export function formatIDR(value: number): string {
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `Rp ${value.toLocaleString('id-ID')}`
  }
}
