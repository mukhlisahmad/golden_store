import type { JSX } from 'react'
import AdminProductForm from '@/pages/admin/AdminProductForm'

type EditProductPageProps = {
  params: {
    id: string
  }
}

export default function EditProductPage({ params }: EditProductPageProps): JSX.Element {
  return <AdminProductForm productId={params.id} />
}
