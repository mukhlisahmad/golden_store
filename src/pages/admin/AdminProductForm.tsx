import React from 'react'
import { useNavigate, useParams } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import ProductForm, { ProductFormValues } from '../../components/admin/ProductForm'
import { useAuthStore } from '../../store/authStore'
import { createProduct, fetchProduct, updateProduct, ApiError } from '../../services/api'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminProductForm(): JSX.Element {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const token = useAuthStore((state) => state.token)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const hydrate = useAuthStore((state) => state.hydrate)
  const logout = useAuthStore((state) => state.logout)

  const [initialValues, setInitialValues] = React.useState<Partial<ProductFormValues> | undefined>(undefined)
  const [loading, setLoading] = React.useState(false)
  const [pageLoading, setPageLoading] = React.useState(isEdit)
  const [pageError, setPageError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isHydrated) {
      hydrate()
    }
  }, [hydrate, isHydrated])

  React.useEffect(() => {
    if (!isHydrated) return
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }

    if (isEdit && id) {
      const load = async () => {
        try {
          setPageError(null)
          setPageLoading(true)
          const product = await fetchProduct(id)
          setInitialValues({
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            shopeeUrl: product.shopeeUrl,
            whatsappNumber: product.whatsappNumber ?? undefined,
            tags: product.tags ?? [],
            slug: product.slug,
          })
        } catch (err) {
          console.error('Gagal memuat produk:', err)
          if (err instanceof ApiError && err.status === 401) {
            logout()
            navigate('/admin/login', { replace: true })
            return
          }
          setPageError('Produk tidak ditemukan atau gagal dimuat.')
        } finally {
          setPageLoading(false)
        }
      }
      void load()
    }
  }, [id, isEdit, isHydrated, token, navigate, logout])

  const handleSubmit = async (values: ProductFormValues) => {
    setLoading(true)
    setPageError(null)
    try {
      if (isEdit && id) {
        await updateProduct(id, values)
      } else {
        await createProduct(values)
      }
      navigate('/admin/products', { replace: true })
    } catch (err) {
      console.error('Simpan produk gagal:', err)
      if (err instanceof ApiError) {
        if (err.status === 401) {
          logout()
          navigate('/admin/login', { replace: true })
          return
        }
        if (err.message) {
          throw new Error(err.message)
        }
      }
      throw err as Error
    } finally {
      setLoading(false)
    }
  }

  if (isEdit && pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">Memuat data produk...</p>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-100 px-4 text-center dark:bg-neutral-950">
        <p className="text-sm text-red-600 dark:text-red-400">{pageError}</p>
        <button
          onClick={() => navigate('/admin/products')}
          className="rounded-md border border-amber-300 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 dark:border-amber-200/40 dark:text-amber-200 dark:hover:bg-amber-900/20"
        >
          Kembali ke daftar produk
        </button>
      </div>
    )
  }

  return (
    <AdminLayout
      title={isEdit ? 'Edit Produk' : 'Produk Baru'}
      description={
        isEdit
          ? 'Ubah informasi produk agar tetap up to date.'
          : 'Tambahkan produk baru ke dalam katalog Golden Store.'
      }
      actions={
        <Button variant="outline" onClick={() => navigate('/admin/products')}>
          Kembali
        </Button>
      }
    >
      <Card className="border-amber-200/60 dark:border-amber-300/20">
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Produk' : 'Produk Baru'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm initialValues={initialValues} loading={loading} onSubmit={handleSubmit} />
          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="text-sm text-neutral-600 underline hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              Batalkan
            </button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
