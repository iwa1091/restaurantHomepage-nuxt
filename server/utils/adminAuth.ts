import type { H3Event } from 'h3'

export async function requireAdmin(event: H3Event) {
  const session = await getUserSession(event)
  const user = session.user as { id: number; role: string } | undefined
  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 403, message: '管理者権限が必要です。' })
  }
  return user
}
