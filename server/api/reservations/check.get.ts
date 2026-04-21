import prisma from '../../utils/prisma'

function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number)
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function timeOverlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) &&
    timeToMinutes(aEnd) > timeToMinutes(bStart)
}

function generateSlots(openTime: string, closeTime: string) {
  const openMin = timeToMinutes(openTime)
  const closeMin = timeToMinutes(closeTime)
  const slots = []

  // Last booking starts at least 1 hour before close
  for (let start = openMin; start <= closeMin - 60; start += 30) {
    const end = Math.min(start + 120, closeMin)
    slots.push({ start: minutesToTime(start), end: minutesToTime(end) })
  }

  return slots
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const date = query.date as string

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, message: '日付の形式が正しくありません。' })
  }

  const schedules = await prisma.schedule.findMany()
  const d = new Date(date + 'T00:00:00')
  const dow = d.getDay()

  const specific = schedules.find(s => s.date && s.date.toISOString().split('T')[0] === date)
  const weekly = schedules.find(s => s.dayOfWeek === dow && !s.date)
  const schedule = specific ?? weekly

  if (!schedule || !schedule.isOpen || !schedule.openTime || !schedule.closeTime) {
    return { available_slots: [] }
  }

  const allSlots = generateSlots(schedule.openTime, schedule.closeTime)

  // Get admin blocks for this date
  const startOfDay = new Date(date + 'T00:00:00')
  const endOfDay = new Date(date + 'T23:59:59')
  const adminBlocks = await prisma.adminBlock.findMany({
    where: { date: { gte: startOfDay, lte: endOfDay } }
  })

  // Filter out admin-blocked slots
  const available = allSlots.filter(slot =>
    !adminBlocks.some(block => timeOverlaps(slot.start, slot.end, block.startTime, block.endTime))
  )

  return { available_slots: available }
})
