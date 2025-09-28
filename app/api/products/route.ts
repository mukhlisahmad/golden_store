import { NextRequest } from 'next/server'
import { prisma } from '../_lib/prisma'
import {
  BadRequestError,
  asJsonResponse,
  ensureBootstrap,
  ensureUniqueSlug,
  handleError,
  requireAuth,
  sanitizeProductInput,
  slugify,
} from '../_lib/server-utils'

export async function GET() {
  try {
    await ensureBootstrap()
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    return asJsonResponse(products)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureBootstrap()
    await requireAuth(req)
    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const parsed = sanitizeProductInput(body)
    if (parsed.error) {
      throw new BadRequestError(parsed.error)
    }

    const slugBase = parsed.value.slug ? slugify(parsed.value.slug) : slugify(parsed.value.name)
    const slug = await ensureUniqueSlug(slugBase)

    const product = await prisma.product.create({
      data: {
        ...parsed.value,
        slug,
      },
    })

    return asJsonResponse(product, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
