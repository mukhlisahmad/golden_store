/**
 * src/components/products/types.ts
 * Tipe data untuk produk di Golden Store.
 */

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  tags?: string[]
}
