import { NextRequest } from 'next/server'
import { prisma } from '../../_lib/prisma'
import {
  BadRequestError,
  isBuildPhase,
  asJsonResponse,
  ensureBootstrap,
  getStoreSettings,
  handleError,
  requireAuth,
  sanitizeStoreSettingsInput,
  serializeStoreSettings,
} from '../../_lib/server-utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    if (isBuildPhase()) {
      return asJsonResponse(serializeStoreSettings(null))
    }

    const settings = await getStoreSettings()
    return asJsonResponse(settings)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (isBuildPhase()) {
      return asJsonResponse({ message: 'Store settings update not available during build.' }, { status: 503 })
    }

    await ensureBootstrap()
    await requireAuth(req)
    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const parsed = sanitizeStoreSettingsInput(body)

    if (parsed.error || !parsed.value) {
      throw new BadRequestError(parsed.error)
    }

    const { value } = parsed

    const updated = await prisma.$transaction(async (tx) => {
      let store = await tx.storeSetting.findFirst()
      if (!store) {
        store = await tx.storeSetting.create({
          data: {
            key: 'default',
            ...value.storeData,
          },
        })
      } else {
        store = await tx.storeSetting.update({
          where: { id: store.id },
          data: value.storeData,
        })
      }

      if (value.navigation) {
        const keepIds: string[] = []
        for (const item of value.navigation) {
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
              // fall through to create if update fails
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

      return {
        ...store,
        navigation,
      }
    })

    return asJsonResponse(serializeStoreSettings(updated))
  } catch (error) {
    return handleError(error)
  }
}
