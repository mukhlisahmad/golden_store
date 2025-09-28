/**
 * src/components/products/types.ts
 * Tipe data untuk produk di Golden Store.
 */

export interface Product {
  id: string
  slug?: string
  name: string
  price: number
  image: string
  description: string
  shopeeUrl: string
  whatsappNumber?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}
