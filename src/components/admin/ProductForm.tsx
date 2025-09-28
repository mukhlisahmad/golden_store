import React from 'react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Button } from '../ui/button'

export interface ProductFormValues {
  name: string
  price: number
  image: string
  description: string
  shopeeUrl: string
  whatsappNumber?: string
  tags: string[]
  slug?: string
}

export interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>
  loading?: boolean
  onSubmit: (values: ProductFormValues) => Promise<void> | void
}

interface FormState {
  name: string
  price: string
  image: string
  description: string
  shopeeUrl: string
  whatsappNumber: string
  tagsText: string
  slug: string
}

function valuesFromInitial(initial?: Partial<ProductFormValues>): FormState {
  return {
    name: initial?.name ?? '',
    price: initial?.price != null ? String(initial.price) : '',
    image: initial?.image ?? '',
    description: initial?.description ?? '',
    shopeeUrl: initial?.shopeeUrl ?? '',
    whatsappNumber: initial?.whatsappNumber ?? '',
    tagsText: initial?.tags?.join(', ') ?? '',
    slug: initial?.slug ?? '',
  }
}

export function ProductForm({ initialValues, loading = false, onSubmit }: ProductFormProps): JSX.Element {
  const [formState, setFormState] = React.useState<FormState>(() => valuesFromInitial(initialValues))
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setFormState(valuesFromInitial(initialValues))
  }, [initialValues])

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const priceValue = Number(formState.price)
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setError('Harga harus berupa angka positif.')
      return
    }

    const tags = formState.tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    try {
      await onSubmit({
        name: formState.name.trim(),
        price: Math.round(priceValue),
        image: formState.image.trim(),
        description: formState.description.trim(),
        shopeeUrl: formState.shopeeUrl.trim(),
        whatsappNumber: formState.whatsappNumber.trim() || undefined,
        tags,
        slug: formState.slug.trim() || undefined,
      })
    } catch (err) {
      console.error('Submit product error:', err)
      if (err instanceof Error && err.message) {
        setError(err.message)
      } else {
        setError('Gagal menyimpan produk. Silakan coba lagi.')
      }
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input
            id="name"
            value={formState.name}
            onChange={handleChange('name')}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Harga (Rp)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="1"
            value={formState.price}
            onChange={handleChange('price')}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="image">URL Gambar</Label>
          <Input
            id="image"
            type="url"
            value={formState.image}
            onChange={handleChange('image')}
            placeholder="https://..."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shopeeUrl">URL Shopee</Label>
          <Input
            id="shopeeUrl"
            type="url"
            value={formState.shopeeUrl}
            onChange={handleChange('shopeeUrl')}
            placeholder="https://shopee.co.id/..."
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="whatsappNumber">Nomor WhatsApp (opsional)</Label>
          <Input
            id="whatsappNumber"
            value={formState.whatsappNumber}
            onChange={handleChange('whatsappNumber')}
            placeholder="628xxxxxxxxx"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (opsional)</Label>
          <Input
            id="slug"
            value={formState.slug}
            onChange={handleChange('slug')}
            placeholder="cincin-aurora"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
        <Input
          id="tags"
          value={formState.tagsText}
          onChange={handleChange('tagsText')}
          placeholder="Best Seller, Cincin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={formState.description}
          onChange={handleChange('description')}
          rows={4}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm
