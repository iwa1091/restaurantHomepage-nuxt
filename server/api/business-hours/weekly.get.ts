import prisma from '../../utils/prisma'

export default defineEventHandler(async () => {
  const schedules = await prisma.schedule.findMany()

  const result = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 90; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dow = d.getDay()

    // Specific date override takes priority over weekly schedule
    const specific = schedules.find(s => s.date && s.date.toISOString().split('T')[0] === dateStr)
    const weekly = schedules.find(s => s.dayOfWeek === dow && !s.date)
    const entry = specific ?? weekly

    result.push({
      date: dateStr,
      isOpen: entry ? entry.isOpen : false,
      openTime: entry?.openTime ?? null,
      closeTime: entry?.closeTime ?? null
    })
  }

  return result
})
