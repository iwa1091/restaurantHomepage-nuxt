import prisma from '../../utils/prisma'
import { sendReservationConfirmed, sendAdminReservationNotice } from '../../utils/mail'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'IZU-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { date, startTime, endTime, partySize, seatType, name, email, phone, notes } = body

  if (!date || !startTime || !endTime || !partySize || !name || !email) {
    throw createError({ statusCode: 422, message: '必須項目が不足しています。' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 422, message: 'メールアドレスの形式が正しくありません。' })
  }

  if (partySize < 1 || partySize > 9) {
    throw createError({ statusCode: 422, message: '人数は1〜9名の範囲で指定してください。' })
  }

  const session = await getUserSession(event)
  const sessionUser = session.user as { id: number } | undefined
  const userId = sessionUser?.id ?? null

  const reservationDate = new Date(date + 'T00:00:00')
  const reservationCode = generateCode()

  const reservation = await prisma.reservation.create({
    data: {
      userId,
      name,
      email,
      phone: phone ?? null,
      date: reservationDate,
      startTime,
      endTime,
      partySize: Number(partySize),
      seatType: seatType ?? null,
      notes: notes ?? null,
      reservationCode,
      status: 'pending'
    }
  })

  const mailData = {
    name,
    email,
    date,
    startTime,
    endTime,
    partySize: Number(partySize),
    seatType: seatType ?? null,
    notes: notes ?? null,
    reservationCode
  }
  await Promise.all([
    sendReservationConfirmed(mailData),
    sendAdminReservationNotice(mailData)
  ])

  return { reservationCode: reservation.reservationCode, id: reservation.id }
})
