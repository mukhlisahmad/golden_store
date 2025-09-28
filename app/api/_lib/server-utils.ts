import bcrypt from 'bcryptjs'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h'
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || ''

export const DEFAULT_STORE_SETTINGS = {
  storeName: 'Golden Store',
  logoUrl:
    'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/55a4522f-969b-4e9f-b5a4-8f67ffc837e4.jpg',
  heroHeadline: 'Koleksi Aksesoris dengan Desain Sticker yang menarik',
  heroTagline: 'untuk Gaya Sehari-hari',
  heroDescription:
    'Temukan aksesoris pilihan dari Golden Store. Desain menarik, kualitas terjamin, dan harga bersahabat, cocok untuk hadiah maupun koleksi pribadi.',
  heroImage: 'https://i.imghippo.com/files/Cwuh6142fk.jpeg',
  whatsappNumber: '6281234567890',
  instagram: 'https://instagram.com/yourstore',
  facebook: 'https://facebook.com/yourstore',
  tiktok: 'https://tiktok.com/@yourstore',
  shopee: 'https://shopee.co.id/yourstore',
}

export const DEFAULT_NAVIGATION = [
  { label: 'Home', url: '#home', order: 0, isExternal: false },
  { label: 'Produk', url: '#produk', order: 1, isExternal: false },
  { label: 'Shopee', url: DEFAULT_STORE_SETTINGS.shopee, order: 2, isExternal: true },
]

type AuthPayload = JwtPayload & {
  sub: string
  username: string
  role: string
}

let bootstrapPromise: Promise<void> | null = null

export function createToken(user: { id: string; username: string; role: string }): string {
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
}

export async function requireAuth(req: NextRequest): Promise<AuthPayload> {
  const header = req.headers.get('authorization') || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedError('Authorization header missing or malformed.')
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    return decoded
  } catch (error) {
    console.error('Auth error:', error)
    throw new UnauthorizedError('Token tidak valid atau sudah kedaluwarsa.')
  }
}

export async function ensureBootstrap(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await ensureDefaultAdmin()
      await ensureStoreSettings()
    })()
  }

  await bootstrapPromise
}

export async function getStoreSettings() {
  await ensureBootstrap()
  const store = await prisma.storeSetting.findFirst({
    include: {
      navigation: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return serializeStoreSettings(store)
}

export function sanitizeStoreSettingsInput(body: Record<string, unknown> | undefined) {
  const data = body ?? {}
  const requiredFields = ['storeName', 'heroHeadline', 'heroTagline', 'heroDescription', 'heroImage'] as const

  for (const field of requiredFields) {
    const value = data[field]
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return { error: `Field ${field} wajib diisi.` }
    }
  }

  const storeData = {
    storeName: String(data.storeName).trim(),
    logoUrl: cleanNullableString(data.logoUrl),
    heroHeadline: String(data.heroHeadline).trim(),
    heroTagline: String(data.heroTagline).trim(),
    heroDescription: String(data.heroDescription).trim(),
    heroImage: String(data.heroImage).trim(),
    whatsappNumber: cleanNullableString(data.whatsappNumber),
    instagram: cleanNullableString(data.instagram),
    facebook: cleanNullableString(data.facebook),
    tiktok: cleanNullableString(data.tiktok),
    shopee: cleanNullableString(data.shopee),
  }

  let navigation: Array<{
    id?: string
    label: string
    url: string
    order: number
    isExternal: boolean
  }> | undefined

  if (data.navigation !== undefined) {
    if (!Array.isArray(data.navigation)) {
      return { error: 'Navigation harus berupa array.' }
    }

    try {
      navigation = data.navigation.map((item, index) => {
        const label = typeof item?.label === 'string' ? item.label.trim() : ''
        const url = typeof item?.url === 'string' ? item.url.trim() : ''
        if (!label || !url) {
          throw new Error('Setiap item navigasi wajib memiliki label dan url.')
        }

        const id = typeof item?.id === 'string' && item.id.trim().length > 0 ? item.id.trim() : undefined
        const isExternal = Boolean(item?.isExternal)

        return {
          id,
          label,
          url,
          order: index,
          isExternal,
        }
      })
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'Data navigasi tidak valid.' }
    }
  }

  return { value: { storeData, navigation } }
}

export function sanitizeProductInput(body: Record<string, unknown> | undefined) {
  const data = body ?? {}
  const { name, price, image, description, shopeeUrl, whatsappNumber, tags, slug } = data as Record<string, unknown>

  if (!name || !description || !image || !shopeeUrl) {
    return { error: 'Field name, description, image, dan shopeeUrl wajib diisi.' }
  }

  const parsedPrice = Number(price)
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    return { error: 'Price harus berupa angka positif.' }
  }

  const value = {
    name: String(name).trim(),
    price: Math.round(parsedPrice),
    image: String(image).trim(),
    description: String(description).trim(),
    shopeeUrl: String(shopeeUrl).trim(),
    whatsappNumber: whatsappNumber ? String(whatsappNumber).trim() : null,
    tags: Array.isArray(tags) ? tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
    slug: slug ? String(slug).trim() : undefined,
  }

  return { value }
}

export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 64)
  return base || `produk-${Date.now()}`
}

export async function ensureUniqueSlug(baseSlug: string, ignoreId?: string) {
  let candidate = baseSlug
  let suffix = 1

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === ignoreId) {
      return candidate
    }
    candidate = `${baseSlug}-${suffix}`.slice(0, 64)
    suffix += 1
  }
}

export function serializeStoreSettings(record: any) {
  if (!record) {
    return {
      ...DEFAULT_STORE_SETTINGS,
      id: null,
      key: 'default',
      navigation: DEFAULT_NAVIGATION.map((item, index) => ({
        id: `default-${index}`,
        ...item,
      })),
    }
  }

  const navigation = (record.navigation || [])
    .map((item: any) => ({
      id: item.id,
      label: item.label,
      url: item.url,
      order: item.order,
      isExternal: item.isExternal,
    }))
    .sort((a: any, b: any) => a.order - b.order)

  return {
    id: record.id,
    key: record.key,
    storeName: record.storeName,
    logoUrl: record.logoUrl,
    heroHeadline: record.heroHeadline,
    heroTagline: record.heroTagline,
    heroDescription: record.heroDescription,
    heroImage: record.heroImage,
    whatsappNumber: record.whatsappNumber,
    instagram: record.instagram,
    facebook: record.facebook,
    tiktok: record.tiktok,
    shopee: record.shopee,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    navigation,
  }
}

export class UnauthorizedError extends Error {
  status = 401
}

export class BadRequestError extends Error {
  status = 400
}

export class NotFoundError extends Error {
  status = 404
}

function cleanNullableString(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

async function ensureDefaultAdmin() {
  if (!ADMIN_DEFAULT_PASSWORD) {
    return
  }

  const count = await prisma.admin.count()
  if (count === 0) {
    const passwordHash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10)
    await prisma.admin.create({
      data: {
        username: 'admin',
        passwordHash,
      },
    })
    console.log('✅ Default admin account created (username: admin)')
  }
}

async function ensureStoreSettings() {
  let store = await prisma.storeSetting.findFirst()
  if (!store) {
    store = await prisma.storeSetting.create({
      data: {
        key: 'default',
        ...DEFAULT_STORE_SETTINGS,
        navigation: {
          create: DEFAULT_NAVIGATION.map((item) => ({ ...item })),
        },
      },
    })
    console.log('✅ Default store settings created')
    return store
  }

  if (!store.key) {
    store = await prisma.storeSetting.update({
      where: { id: store.id },
      data: { key: 'default' },
    })
  }

  const navCount = await prisma.navigationItem.count({ where: { storeId: store.id } })
  if (navCount === 0 && DEFAULT_NAVIGATION.length > 0) {
    await prisma.navigationItem.createMany({
      data: DEFAULT_NAVIGATION.map((item) => ({ ...item, storeId: store.id })),
    })
  }

  return store
}

export function asJsonResponse<T>(data: T, init: ResponseInit = {}) {
  return Response.json(data, init)
}

export function handleError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return Response.json({ message: error.message }, { status: error.status })
  }
  if (error instanceof BadRequestError) {
    return Response.json({ message: error.message }, { status: error.status })
  }
  if (error instanceof NotFoundError) {
    return Response.json({ message: error.message }, { status: error.status })
  }

  console.error('Unhandled API error:', error)
  return Response.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 })
}
