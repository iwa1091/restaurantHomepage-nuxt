import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const dateStr = query.date as string | undefined

  if (!dateStr) {
    throw createError({ statusCode: 400, message: '日付を指定してください。' })
  }

  const date = new Date(dateStr)
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)

  const blocks = await prisma.adminBlock.findMany({
    where: {
      date: {
        gte: date,
        lt: nextDay,
      },
    },
    orderBy: { startTime: 'asc' },
  })

  return blocks
})
