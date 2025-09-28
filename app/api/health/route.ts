import { ensureBootstrap, asJsonResponse } from '../_lib/server-utils'

export async function GET() {
  await ensureBootstrap()
  return asJsonResponse({ status: 'ok' })
}
