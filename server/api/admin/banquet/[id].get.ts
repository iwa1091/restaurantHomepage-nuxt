import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: '無効なIDです。' })
  }

  const inquiry = await prisma.banquetInquiry.findUnique({
    where: { id },
  })

  if (!inquiry) {
    throw createError({ statusCode: 404, message: '問い合わせが見つかりません。' })
  }

  return inquiry
})
