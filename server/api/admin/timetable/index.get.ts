import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const schedules = await prisma.schedule.findMany({
    orderBy: { id: 'asc' },
  })

  return schedules
})
