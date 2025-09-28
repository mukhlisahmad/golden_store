import { NextRequest } from 'next/server'
import { prisma } from '../../_lib/prisma'
import {
  BadRequestError,
  NotFoundError,
  asJsonResponse,
  ensureBootstrap,
  ensureUniqueSlug,
  handleError,
  requireAuth,
  sanitizeProductInput,
  slugify,
} from '../../_lib/server-utils'

interface RouteContext {
  params: {
    idOrSlug: string
  }
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    await ensureBootstrap()
    const { idOrSlug } = context.params

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    })

    if (!product) {
      throw new NotFoundError('Produk tidak ditemukan.')
    }

    return asJsonResponse(product)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await ensureBootstrap()
    await requireAuth(req)
    const { idOrSlug } = context.params
    const existing = await prisma.product.findUnique({ where: { id: idOrSlug } })
    if (!existing) {
      throw new NotFoundError('Produk tidak ditemukan.')
    }

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const parsed = sanitizeProductInput(body)
    if (parsed.error) {
      throw new BadRequestError(parsed.error)
    }

    const slugBase = parsed.value.slug
      ? slugify(parsed.value.slug)
      : parsed.value.name !== existing.name
        ? slugify(parsed.value.name)
        : existing.slug

    const slug = await ensureUniqueSlug(slugBase, existing.id)

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...parsed.value,
        slug,
      },
    })

    return asJsonResponse(updated)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await ensureBootstrap()
    await requireAuth(req)
    const { idOrSlug } = context.params

    const existing = await prisma.product.findUnique({ where: { id: idOrSlug } })
    if (!existing) {
      throw new NotFoundError('Produk tidak ditemukan.')
    }

    await prisma.product.delete({ where: { id: existing.id } })

    return asJsonResponse({ message: 'Produk dihapus.' })
  } catch (error) {
    return handleError(error)
  }
}
