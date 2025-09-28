import { NextRequest } from 'next/server'
import { prisma } from '../_lib/prisma'
import {
  BadRequestError,
  IS_BUILD_PHASE,
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
    if (IS_BUILD_PHASE) {
      return asJsonResponse([])
    }

    await ensureBootstrap()
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    return asJsonResponse(products)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    if (IS_BUILD_PHASE) {
      return asJsonResponse({ message: 'Product modifications are disabled during build.' }, { status: 503 })
    }

    await ensureBootstrap()
    await requireAuth(req)
    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const parsed = sanitizeProductInput(body)
    if (parsed.error || !parsed.value) {
      throw new BadRequestError(parsed.error)
    }

    const { value } = parsed

    const slugBase = value.slug ? slugify(value.slug) : slugify(value.name)
    const slug = await ensureUniqueSlug(slugBase)

    const product = await prisma.product.create({
      data: {
        ...value,
        slug,
      },
    })

    return asJsonResponse(product, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
