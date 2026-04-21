import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { dayOfWeek, isOpen, openTime, closeTime } = body

  if (dayOfWeek === undefined || dayOfWeek === null) {
    throw createError({ statusCode: 400, message: '曜日は必須です。' })
  }

  const existing = await prisma.schedule.findFirst({
    where: {
      dayOfWeek: Number(dayOfWeek),
      date: null,
    },
  })

  if (existing) {
    const updated = await prisma.schedule.update({
      where: { id: existing.id },
      data: {
        isOpen: Boolean(isOpen),
        openTime: openTime ?? null,
        closeTime: closeTime ?? null,
      },
    })
    return updated
  }

  const created = await prisma.schedule.create({
    data: {
      dayOfWeek: Number(dayOfWeek),
      date: null,
      isOpen: Boolean(isOpen),
      openTime: openTime ?? null,
      closeTime: closeTime ?? null,
    },
  })

  return created
})
