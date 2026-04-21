import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const status = query.status as string | undefined

  const where = status ? { status } : {}

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return reservations
})
