import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: '無効なIDです。' })
  }

  await prisma.product.delete({ where: { id } })

  return { success: true }
})
