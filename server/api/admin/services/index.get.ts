import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const services = await prisma.service.findMany({
    orderBy: { id: 'asc' },
    include: {
      category: true,
    },
  })

  return services
})
