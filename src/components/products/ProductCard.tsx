import React from 'react'
import { Product } from './types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { buildWaLink, formatIDR, STORE_CONFIG } from '../../config/store'
import { MessageCircle, Info } from 'lucide-react'

/**
 * ProductCard.tsx
 * Kartu produk dengan dialog detail dan tombol WhatsApp.
 */

export interface ProductCardProps {
  product: Product
}

/**
 * ProductImage
 * Gambar produk dengan aspek rasio dan hover effect.
 */
function ProductImage({ src, alt }: { src: string; alt: string }): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-amber-200/50 dark:border-amber-300/20">
      <img
        src={src}
        alt={alt}
        className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
  )
}

export function ProductCard({ product }: ProductCardProps): JSX.Element {
  const { name, price, description, image, tags } = product

  /**
   * handleWa
   * Mengarahkan ke WhatsApp dengan pesan prefilled.
   */
  const waHref = buildWaLink({
    productName: name,
    price,
  })

  return (
    <Card className="group relative overflow-hidden border-amber-200/60 shadow-sm transition hover:shadow-md dark:border-amber-300/20">
      <CardHeader className="space-y-2">
        <ProductImage src={image} alt={name} />
        <CardTitle className="line-clamp-1 bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-xl font-semibold text-transparent dark:from-amber-300 dark:to-yellow-200">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-lg font-medium text-amber-700 dark:text-amber-300">
          {formatIDR(price)}
        </p>
        <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
          {description}
        </p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="border border-amber-300/40 bg-amber-50 text-amber-800 dark:border-amber-300/20 dark:bg-amber-900/20 dark:text-amber-200"
              >
                {t}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-300/40 dark:text-amber-200 dark:hover:bg-amber-900/20">
              <Info className="mr-2 h-4 w-4" />
              Detail
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent dark:from-amber-300 dark:to-yellow-200">
                {name}
              </DialogTitle>
              <DialogDescription>
                {STORE_CONFIG.name} — produk pilihan dengan kualitas terbaik.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-amber-200/50 dark:border-amber-300/20">
                <img src={image} alt={name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Harga</p>
                  <p className="text-xl font-semibold text-amber-700 dark:text-amber-300">
                    {formatIDR(price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Deskripsi</p>
                  <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                    {description}
                  </p>
                </div>
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="border border-amber-300/40 bg-amber-50 text-amber-800 dark:border-amber-300/20 dark:bg-amber-900/20 dark:text-amber-200"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="pt-1">
                  <a href={waHref} target="_blank" rel="noreferrer">
                    <Button className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 text-white hover:from-amber-700 hover:to-yellow-600 dark:from-amber-500 dark:to-yellow-400">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Beli via WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <a href={waHref} target="_blank" rel="noreferrer">
          <Button className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600">
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
        </a>
      </CardFooter>
    </Card>
  )
}

export default ProductCard
