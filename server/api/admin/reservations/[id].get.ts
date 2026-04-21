import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: '無効なIDです。' })
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  if (!reservation) {
    throw createError({ statusCode: 404, message: '予約が見つかりません。' })
  }

  return reservation
})
