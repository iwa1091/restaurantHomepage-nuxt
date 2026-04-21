import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { date, startTime, endTime, reason, partySize } = body

  if (!date) {
    throw createError({ statusCode: 400, message: '日付は必須です。' })
  }
  if (!startTime) {
    throw createError({ statusCode: 400, message: '開始時刻は必須です。' })
  }
  if (!endTime) {
    throw createError({ statusCode: 400, message: '終了時刻は必須です。' })
  }

  const block = await prisma.adminBlock.create({
    data: {
      date: new Date(date),
      startTime,
      endTime,
      reason: reason ?? null,
      partySize: partySize !== undefined ? Number(partySize) : null,
    },
  })

  return block
})
