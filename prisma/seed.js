/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      passwordHash,
    },
  })

  const products = [
    {
      slug: 'ring-aurora',
      name: 'Cincin Aurora',
      price: 1250000,
      image:
        'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/9fda7656-751a-44f7-925d-2983608efbf8.jpg',
      description:
        'Cincin statement dengan kilau kristal yang memantulkan warna aurora. Nyaman dipakai harian maupun acara formal.',
      shopeeUrl: 'https://shopee.co.id/product/999994567/1234500010',
      whatsappNumber: '6281234567890',
      tags: ['Statement Ring', 'Elegant', 'Best Seller'],
    },
    {
      slug: 'necklace-luna',
      name: 'Kalung Luna',
      price: 2150000,
      image:
        'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/81d784c1-2e19-4129-a069-8279a9f905c1.jpg',
      description:
        'Kalung minimalis dengan liontin bulan yang manis, cocok jadi hadiah maupun koleksi pribadi.',
      shopeeUrl: 'https://shopee.co.id/product/999994567/1234500011',
      whatsappNumber: '6281234567890',
      tags: ['Kalung', 'Minimalist'],
    },
    {
      slug: 'bracelet-royale',
      name: 'Gelang Royale',
      price: 1890000,
      image:
        'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/122ce33f-63d0-4e9a-b566-29b761fbd66c.jpg',
      description:
        'Gelang kombinasi metal dan aksen matte-glossy untuk tampilan modern dan berkelas.',
      shopeeUrl: 'https://shopee.co.id/product/999994567/1234500012',
      whatsappNumber: '6281234567890',
      tags: ['Gelang', 'Modern'],
    },
    {
      slug: 'earring-eden',
      name: 'Anting Eden',
      price: 990000,
      image:
        'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/2347c9aa-119b-4363-8fd5-6ef36c28e237.jpg',
      description:
        'Anting mungil yang ringan dengan kilau lembut, nyaman dipakai seharian.',
      shopeeUrl: 'https://shopee.co.id/product/999994567/1234500013',
      whatsappNumber: '6281234567890',
      tags: ['Anting', 'Daily'],
    },
    {
      slug: 'watch-nova',
      name: 'Jam Nova',
      price: 3750000,
      image:
        'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/5bfd3a13-263a-45d5-aad4-c718dfccae52.jpg',
      description:
        'Jam tangan aksesoris dengan strap metal berkilau, menunjang gaya sekaligus fungsional.',
      shopeeUrl: 'https://shopee.co.id/product/999994567/1234500014',
      whatsappNumber: '6281234567890',
      tags: ['Jam Tangan', 'Limited'],
    },
    {
      slug: 'pendant-sol',
      name: 'Liontin Sol',
      price: 1450000,
      image:
        'https://pub-cdn.sider.ai/u/U0W8H7R4X2W/web-coder/68d4014e6cd86d3975e3c196/resource/14bf167b-74c5-4435-84f5-d31defc7b554.jpg',
      description:
        'Liontin berbentuk matahari dengan detail kristal, simbol energi dan kebahagiaan.',
      shopeeUrl: 'https://shopee.co.id/product/999994567/1234500015',
      whatsappNumber: '6281234567890',
      tags: ['Liontin', 'Symbolic'],
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    })
  }

  const storeDefaults = {
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

  const store = await prisma.storeSetting.upsert({
    where: { key: 'default' },
    update: storeDefaults,
    create: {
      key: 'default',
      ...storeDefaults,
    },
  })

  const navigationItems = [
    {
      label: 'Home',
      url: '#home',
      order: 0,
      isExternal: false,
    },
    {
      label: 'Produk',
      url: '#produk',
      order: 1,
      isExternal: false,
    },
    {
      label: 'Shopee',
      url: storeDefaults.shopee,
      order: 2,
      isExternal: true,
    },
  ]

  await prisma.navigationItem.deleteMany({ where: { storeId: store.id } })
  if (navigationItems.length > 0) {
    await prisma.navigationItem.createMany({
      data: navigationItems.map((item) => ({ ...item, storeId: store.id })),
    })
  }

  console.log('✅ Database seeded. Default admin: admin /', adminPassword)
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
