"use client"

import React, { type JSX } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Product } from '../../components/products/types'
import { deleteProduct, fetchProducts, ApiError } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminProducts(): JSX.Element {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const hydrate = useAuthStore((state) => state.hydrate)
  const logout = useAuthStore((state) => state.logout)
  const LOGIN_ROUTE = '/admin/login' satisfies Route
  const NEW_PRODUCT_ROUTE = '/admin/products/new' satisfies Route

  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isHydrated) {
      hydrate()
    }
  }, [hydrate, isHydrated])

  const loadProducts = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      console.error('Gagal mengambil produk:', err)
      if (err instanceof ApiError && err.status === 401) {
        logout()
        router.replace(LOGIN_ROUTE)
        return
      }
      const message = err instanceof ApiError && err.message
        ? err.message
        : 'Tidak dapat memuat data produk. Pastikan Anda sudah login dan server berjalan.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [logout, router])

  React.useEffect(() => {
    if (!isHydrated) return
    if (!token) {
      router.replace(LOGIN_ROUTE)
      return
    }
    void loadProducts()
  }, [isHydrated, token, loadProducts, router])

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Hapus produk ini?')
    if (!confirmDelete) return

    setDeleting(id)
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((product) => product.id !== id))
    } catch (err) {
      console.error('Gagal menghapus produk:', err)
      if (err instanceof ApiError && err.status === 401) {
        logout()
        router.replace(LOGIN_ROUTE)
        return
      }
      const message = err instanceof ApiError && err.message ? err.message : 'Gagal menghapus produk. Silakan coba lagi.'
      alert(message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout
      title="Dashboard Produk"
      description="Kelola katalog Golden Store: tambah, ubah, dan hapus produk."
      actions={
        <Button
          onClick={() => router.push(NEW_PRODUCT_ROUTE)}
          className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
        >
          + Produk Baru
        </Button>
      }
    >
      <Card className="border-amber-200/60 dark:border-amber-300/20">
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Memuat produk...</p>
            ) : error ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <Button size="sm" variant="outline" onClick={() => loadProducts()}>
                  Coba lagi
                </Button>
              </div>
            ) : products.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Belum ada produk.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Shopee</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <a
                          href={product.shopeeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-600 underline hover:text-amber-700 dark:text-amber-300"
                        >
                          Link
                        </a>
                      </TableCell>
                      <TableCell>{product.tags?.join(', ') ?? '-'}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link
                            href={{
                              pathname: '/admin/products/[id]/edit',
                              query: { id: product.id },
                            }}
                          >
                            Ubah
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                        >
                          {deleting === product.id ? 'Menghapus...' : 'Hapus'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </AdminLayout>
  )
}
