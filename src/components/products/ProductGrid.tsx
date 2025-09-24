import React, { type JSX } from 'react'
import { Product } from './types'
import ProductCard from './ProductCard'

/**
 * ProductGrid.tsx
 * Grid responsif untuk menampilkan daftar produk dalam kartu.
 */

export interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps): JSX.Element {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

export default ProductGrid
