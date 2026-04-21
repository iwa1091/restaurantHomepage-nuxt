import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const categories = await prisma.category.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: {
        select: { services: true },
      },
    },
  })

  return categories
})
