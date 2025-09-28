import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from '../../_lib/prisma'
import {
  BadRequestError,
  IS_BUILD_PHASE,
  NotFoundError,
  asJsonResponse,
  createToken,
  ensureBootstrap,
  handleError,
  requireAuth,
} from '../../_lib/server-utils'

export async function GET(req: NextRequest) {
  try {
    if (IS_BUILD_PHASE) {
      return asJsonResponse({ message: 'Admin profile not available during build.' }, { status: 503 })
    }

    await ensureBootstrap()
    const user = await requireAuth(req)

    const admin = await prisma.admin.findUnique({ where: { id: user.sub } })
    if (!admin) {
      throw new NotFoundError('Admin tidak ditemukan.')
    }

    return asJsonResponse({
      id: admin.id,
      username: admin.username,
      role: admin.role,
    })
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (IS_BUILD_PHASE) {
      return asJsonResponse({ message: 'Admin profile update not available during build.' }, { status: 503 })
    }

    await ensureBootstrap()
    const user = await requireAuth(req)
    const body = await req.json().catch(() => ({})) as Record<string, unknown>

    const username = typeof body.username === 'string' ? body.username.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!username) {
      throw new BadRequestError('Username wajib diisi.')
    }

    const data: Record<string, unknown> = { username }
    if (password) {
      if (password.trim().length < 6) {
        throw new BadRequestError('Password minimal 6 karakter.')
      }
      data.passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    const updated = await prisma.admin.update({
      where: { id: user.sub },
      data,
    })

    const token = createToken(updated)

    return asJsonResponse({
      token,
      user: {
        id: updated.id,
        username: updated.username,
        role: updated.role,
      },
    })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return handleError(new BadRequestError('Username sudah digunakan.'))
    }
    return handleError(error)
  }
}
