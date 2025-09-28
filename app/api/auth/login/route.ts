import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from '../../_lib/prisma'
import {
  BadRequestError,
  isBuildPhase,
  UnauthorizedError,
  asJsonResponse,
  createToken,
  ensureBootstrap,
  handleError,
} from '../../_lib/server-utils'

export async function POST(req: NextRequest) {
  try {
    if (isBuildPhase()) {
      return asJsonResponse({ message: 'Login is disabled during build.' }, { status: 503 })
    }

    await ensureBootstrap()
    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const username = typeof body.username === 'string' ? body.username.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!username || !password) {
      throw new BadRequestError('Username dan password wajib diisi.')
    }

    const user = await prisma.admin.findUnique({ where: { username } })
    if (!user) {
      throw new UnauthorizedError('Username atau password salah.')
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      throw new UnauthorizedError('Username atau password salah.')
    }

    const token = createToken(user)

    return asJsonResponse({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
