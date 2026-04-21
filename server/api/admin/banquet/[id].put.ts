import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: '無効なIDです。' })
  }

  const body = await readBody(event)
  const { status } = body

  const inquiry = await prisma.banquetInquiry.update({
    where: { id },
    data: { status },
  })

  return inquiry
})
