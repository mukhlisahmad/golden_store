'use strict'

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const PORT = Number(process.env.PORT) || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h'
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || ''

const DEFAULT_STORE_SETTINGS = {
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

const DEFAULT_NAVIGATION = [
  { label: 'Home', url: '#home', order: 0, isExternal: false },
  { label: 'Produk', url: '#produk', order: 1, isExternal: false },
  { label: 'Shopee', url: DEFAULT_STORE_SETTINGS.shopee, order: 2, isExternal: true },
]

function buildApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body || {}
      if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi.' })
      }

      const user = await prisma.admin.findUnique({ where: { username } })
      if (!user) {
        return res.status(401).json({ message: 'Username atau password salah.' })
      }

      const match = await bcrypt.compare(password, user.passwordHash)
      if (!match) {
        return res.status(401).json({ message: 'Username atau password salah.' })
      }

      const token = createToken(user)
      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      })
    } catch (error) {
      console.error('Login error:', error)
      return res.status(500).json({ message: 'Terjadi kesalahan saat login.' })
    }
  })

  app.get('/api/admin/me', authMiddleware, async (req, res) => {
    try {
      const admin = await prisma.admin.findUnique({ where: { id: req.user.sub } })
      if (!admin) {
        return res.status(404).json({ message: 'Admin tidak ditemukan.' })
      }
      return res.json({
        id: admin.id,
        username: admin.username,
        role: admin.role,
      })
    } catch (error) {
      console.error('Get admin profile error:', error)
      return res.status(500).json({ message: 'Gagal mengambil data admin.' })
    }
  })

  app.put('/api/admin/me', authMiddleware, async (req, res) => {
    const { username, password } = req.body || {}
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ message: 'Username wajib diisi.' })
    }

    try {
      const data = { username: username.trim() }
      if (password) {
        if (typeof password !== 'string' || password.trim().length < 6) {
          return res.status(400).json({ message: 'Password minimal 6 karakter.' })
        }
        data.passwordHash = await bcrypt.hash(password.trim(), 10)
      }

      const updated = await prisma.admin.update({
        where: { id: req.user.sub },
        data,
      })

      const token = createToken(updated)
      return res.json({
        token,
        user: {
          id: updated.id,
          username: updated.username,
          role: updated.role,
        },
      })
    } catch (error) {
      console.error('Update admin profile error:', error)
      if (error?.code === 'P2002') {
        return res.status(409).json({ message: 'Username sudah digunakan.' })
      }
      return res.status(500).json({ message: 'Gagal memperbarui akun admin.' })
    }
  })

  app.get('/api/store/settings', async (_req, res) => {
    try {
      const settings = await getStoreSettings()
      return res.json(settings)
    } catch (error) {
      console.error('Get store settings error:', error)
      return res.status(500).json({ message: 'Gagal mengambil pengaturan toko.' })
    }
  })

  app.put('/api/store/settings', authMiddleware, async (req, res) => {
    const parsed = sanitizeStoreSettingsInput(req.body)
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error })
    }

    try {
      const updated = await prisma.$transaction(async (tx) => {
        let store = await tx.storeSetting.findFirst()
        if (!store) {
          store = await tx.storeSetting.create({
            data: {
              key: 'default',
              ...parsed.value.storeData,
            },
          })
        } else {
          store = await tx.storeSetting.update({
            where: { id: store.id },
            data: parsed.value.storeData,
          })
        }

        if (parsed.value.navigation) {
          const keepIds = []
          for (const item of parsed.value.navigation) {
            const navData = {
              label: item.label,
              url: item.url,
              order: item.order,
              isExternal: item.isExternal,
            }

            if (item.id) {
              try {
                const updatedNav = await tx.navigationItem.update({
                  where: { id: item.id },
                  data: navData,
                })
                keepIds.push(updatedNav.id)
                continue
              } catch {
                // fall through to create
              }
            }

            const createdNav = await tx.navigationItem.create({
              data: {
                ...navData,
                storeId: store.id,
              },
            })
            keepIds.push(createdNav.id)
          }

          await tx.navigationItem.deleteMany({
            where: {
              storeId: store.id,
              id: { notIn: keepIds },
            },
          })
        }

        const navigation = await tx.navigationItem.findMany({
          where: { storeId: store.id },
          orderBy: { order: 'asc' },
        })

        return serializeStoreSettings({ ...store, navigation })
      })

      return res.json(updated)
    } catch (error) {
      console.error('Update store settings error:', error)
      return res.status(500).json({ message: 'Gagal memperbarui pengaturan toko.' })
    }
  })

  app.get('/api/products', async (_req, res) => {
    try {
      const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
      return res.json(products)
    } catch (error) {
      console.error('List products error:', error)
      return res.status(500).json({ message: 'Gagal mengambil data produk.' })
    }
  })

  app.get('/api/products/:idOrSlug', async (req, res) => {
    const { idOrSlug } = req.params
    try {
      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
      })
      if (!product) {
        return res.status(404).json({ message: 'Produk tidak ditemukan.' })
      }
      return res.json(product)
    } catch (error) {
      console.error('Get product error:', error)
      return res.status(500).json({ message: 'Gagal mengambil data produk.' })
    }
  })

  app.post('/api/products', authMiddleware, async (req, res) => {
    try {
      const parsed = sanitizeProductInput(req.body)
      if (parsed.error) {
        return res.status(400).json({ message: parsed.error })
      }

      const slugBase = parsed.value.slug
        ? slugify(parsed.value.slug)
        : slugify(parsed.value.name)
      const slug = await ensureUniqueSlug(slugBase)

      const product = await prisma.product.create({
        data: {
          ...parsed.value,
          slug,
        },
      })
      return res.status(201).json(product)
    } catch (error) {
      console.error('Create product error:', error)
      return res.status(500).json({ message: 'Gagal membuat produk.' })
    }
  })

  app.put('/api/products/:id', authMiddleware, async (req, res) => {
    const { id } = req.params
    try {
      const parsed = sanitizeProductInput(req.body)
      if (parsed.error) {
        return res.status(400).json({ message: parsed.error })
      }

      const existing = await prisma.product.findUnique({ where: { id } })
      if (!existing) {
        return res.status(404).json({ message: 'Produk tidak ditemukan.' })
      }

      const slugBase = parsed.value.slug
        ? slugify(parsed.value.slug)
        : parsed.value.name !== existing.name
          ? slugify(parsed.value.name)
          : existing.slug
      const slug = await ensureUniqueSlug(slugBase, existing.id)

      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...parsed.value,
          slug,
        },
      })
      return res.json(updated)
    } catch (error) {
      console.error('Update product error:', error)
      return res.status(500).json({ message: 'Gagal memperbarui produk.' })
    }
  })

  app.delete('/api/products/:id', authMiddleware, async (req, res) => {
    const { id } = req.params
    try {
      const existing = await prisma.product.findUnique({ where: { id } })
      if (!existing) {
        return res.status(404).json({ message: 'Produk tidak ditemukan.' })
      }

      await prisma.product.delete({ where: { id } })
      return res.json({ message: 'Produk dihapus.' })
    } catch (error) {
      console.error('Delete product error:', error)
      return res.status(500).json({ message: 'Gagal menghapus produk.' })
    }
  })

  app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' })
  })

  return app
}

function createToken(user) {
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authorization header missing or malformed.' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    return next()
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' })
  }
}

async function getStoreSettings() {
  await ensureStoreSettings()
  const store = await prisma.storeSetting.findFirst({
    include: {
      navigation: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return serializeStoreSettings(store)
}

function sanitizeStoreSettingsInput(body = {}) {
  const requiredFields = ['storeName', 'heroHeadline', 'heroTagline', 'heroDescription', 'heroImage']
  for (const field of requiredFields) {
    if (!body[field] || typeof body[field] !== 'string' || body[field].trim().length === 0) {
      return { error: `Field ${field} wajib diisi.` }
    }
  }

  const storeData = {
    storeName: String(body.storeName).trim(),
    logoUrl: cleanNullableString(body.logoUrl),
    heroHeadline: String(body.heroHeadline).trim(),
    heroTagline: String(body.heroTagline).trim(),
    heroDescription: String(body.heroDescription).trim(),
    heroImage: String(body.heroImage).trim(),
    whatsappNumber: cleanNullableString(body.whatsappNumber),
    instagram: cleanNullableString(body.instagram),
    facebook: cleanNullableString(body.facebook),
    tiktok: cleanNullableString(body.tiktok),
    shopee: cleanNullableString(body.shopee),
  }

  let navigation
  if (body.navigation !== undefined) {
    if (!Array.isArray(body.navigation)) {
      return { error: 'Navigation harus berupa array.' }
    }

    try {
      navigation = body.navigation.map((item, index) => {
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
    } catch (error) {
      return { error: error.message || 'Data navigasi tidak valid.' }
    }
  }

  return { value: { storeData, navigation } }
}

function serializeStoreSettings(record) {
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
    .map((item) => ({
      id: item.id,
      label: item.label,
      url: item.url,
      order: item.order,
      isExternal: item.isExternal,
    }))
    .sort((a, b) => a.order - b.order)

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

function cleanNullableString(value) {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function sanitizeProductInput(body = {}) {
  const {
    name,
    price,
    image,
    description,
    shopeeUrl,
    whatsappNumber,
    tags,
    slug,
  } = body

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

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 64) || `produk-${Date.now()}`
}

async function ensureUniqueSlug(baseSlug, ignoreId) {
  let candidate = baseSlug
  let suffix = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === ignoreId) {
      return candidate
    }
    candidate = `${baseSlug}-${suffix}`.slice(0, 64)
    suffix += 1
  }
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

async function start() {
  try {
    await ensureDefaultAdmin()
    await ensureStoreSettings()
    const app = buildApp()
    const server = app.listen(PORT, () => {
      console.log(`Golden Store API berjalan di http://localhost:${PORT}`)
    })

    function shutdown(signal) {
      console.log(`\n${signal} received, shutting down...`)
      server.close(async () => {
        await prisma.$disconnect()
        process.exit(0)
      })
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
  } catch (error) {
    console.error('Gagal menjalankan server:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()
